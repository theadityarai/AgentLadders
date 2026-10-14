import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendSupportEmail } from '@/lib/mail';
import { sanitizeString } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const tickets = (db.supportTickets || []).filter(t => t.agencyId === user.agencyId);
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const now = new Date().toISOString();
  const agency = db.agencies.find(a => a.id === user.agencyId);

  const cleanSubject = sanitizeString(data.subject || 'Support Inquiry', 200);
  const cleanMessage = sanitizeString(data.message || data.subject || '', 2000);
  const cleanContract = sanitizeString(data.contractType || '', 100);

  const newTicket = {
    id: 'tic_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    agencyName: agency?.name || 'AgentLadders Agency',
    ticketNumber: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
    subject: cleanSubject,
    category: data.category || 'General',
    priority: data.priority || 'Medium',
    status: 'Open',
    contractType: cleanContract,
    createdByName: user.name || 'Agency Admin',
    createdByEmail: user.email,
    messages: [
      {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        sender: user.name || 'Agency Admin',
        isStaff: false,
        text: cleanMessage,
        timestamp: now
      }
    ],
    createdAt: now
  };

  db.supportTickets = db.supportTickets || [];
  db.supportTickets.unshift(newTicket as any);

  // Add in-app notification
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: 'notif_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    userId: user.id,
    title: 'Support Ticket Submitted',
    message: `Ticket ${newTicket.ticketNumber} "${newTicket.subject}" created. Confirmation email sent to ${user.email}.`,
    type: 'system',
    read: false,
    createdAt: now
  });

  // Dispatch Email Confirmation to Broker
  if (user.email) {
    await sendSupportEmail({
      to: user.email,
      subject: `[${newTicket.ticketNumber}] Ticket Received: ${newTicket.subject}`,
      template: 'ticket_created',
      ticket: newTicket as any,
      messageText: cleanMessage,
      recipientRole: 'broker'
    });
  }

  // Dispatch Email Notification to HQ Admin
  await sendSupportEmail({
    to: 'support@agentladders.com',
    subject: `[NEW TICKET] ${newTicket.ticketNumber} from ${newTicket.agencyName}: ${newTicket.subject}`,
    template: 'ticket_created',
    ticket: newTicket as any,
    messageText: cleanMessage,
    recipientRole: 'admin'
  });

  saveDb(db);
  return NextResponse.json({ success: true, ticket: newTicket, emailDispatched: true });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const { ticketId, message } = data;

  if (!ticketId || !message) {
    return NextResponse.json({ error: 'Missing ticketId or message' }, { status: 400 });
  }

  const ticketIndex = (db.supportTickets || []).findIndex(t => t.id === ticketId && t.agencyId === user.agencyId);
  if (ticketIndex === -1) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const ticket = db.supportTickets[ticketIndex];
  const cleanMessage = sanitizeString(message, 2000);

  ticket.messages.push({
    id: 'msg_' + Math.random().toString(36).substring(2, 9),
    sender: user.name || 'Agency User',
    isStaff: false,
    text: cleanMessage,
    timestamp: now
  });

  // Re-open if it was resolved
  if (ticket.status === 'Resolved') {
    ticket.status = 'In Review';
  }

  // Alert HQ Admin via Email
  await sendSupportEmail({
    to: 'support@agentladders.com',
    subject: `[BROKER REPLY] ${ticket.ticketNumber} from ${ticket.agencyName || user.name}: ${ticket.subject}`,
    template: 'ticket_reply_user',
    ticket: ticket as any,
    messageText: cleanMessage,
    recipientRole: 'admin'
  });

  saveDb(db);
  return NextResponse.json({ success: true, ticket });
}

