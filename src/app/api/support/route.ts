import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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

  const newTicket = {
    id: 'tic_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    ticketNumber: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
    subject: data.subject || 'Support Inquiry',
    category: data.category || 'General',
    priority: data.priority || 'Medium',
    status: 'Open',
    createdByName: user.name || 'Agency Admin',
    messages: [
      {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        sender: user.name || 'Agency Admin',
        isStaff: false,
        text: data.message || data.subject,
        timestamp: now
      }
    ],
    createdAt: now
  };

  db.supportTickets = db.supportTickets || [];
  db.supportTickets.unshift(newTicket as any);

  // Add notification
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: 'notif_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    userId: user.id,
    title: 'Support Ticket Submitted',
    message: `Ticket ${newTicket.ticketNumber} "${newTicket.subject}" created. Our engineer will respond within 4 hours.`,
    type: 'system',
    read: false,
    createdAt: now
  });

  saveDb(db);
  return NextResponse.json({ success: true, ticket: newTicket });
}
