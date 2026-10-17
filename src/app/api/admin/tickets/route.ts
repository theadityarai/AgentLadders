import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendSupportEmail } from '@/lib/mail';

function checkSuperAdmin(user: any) {
  if (!user) return false;
  const role = (user.role || '').toUpperCase();
  return role === 'SUPER_ADMIN' || user.email === 'aditya@agentladders.com' || user.email === 'admin@agentladders.com';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user || !checkSuperAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  const agenciesMap = new Map((db.agencies || []).map(a => [a.id, a.name]));

  const tickets = (db.supportTickets || []).map(t => ({
    ...t,
    agencyName: t.agencyName || agenciesMap.get(t.agencyId) || 'Unknown Agency'
  }));

  return NextResponse.json({ tickets });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user || !checkSuperAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  const data = await req.json();
  const { ticketId, status, replyMessage } = data;

  if (!ticketId) {
    return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
  }

  const ticketIndex = (db.supportTickets || []).findIndex(t => t.id === ticketId);
  if (ticketIndex === -1) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const ticket = db.supportTickets[ticketIndex];
  const oldStatus = ticket.status;
  const now = new Date().toISOString();

  if (status && ['Open', 'In Review', 'Resolved'].includes(status)) {
    ticket.status = status;
  }

  const agency = (db.agencies || []).find(a => a.id === ticket.agencyId);
  const notifPref = agency?.notificationPrefs?.['Support ticket updates'] ?? { inApp: true, email: true };
  const agencyUsers = (db.users || []).filter(u => u.agencyId === ticket.agencyId);
  const creatorUser = agencyUsers.find(u => ticket.createdByEmail && u.email?.toLowerCase() === ticket.createdByEmail?.toLowerCase());
  const targetUserIds = creatorUser ? [creatorUser.id] : (agencyUsers.length > 0 ? agencyUsers.map(u => u.id) : ['']);

  if (replyMessage && replyMessage.trim()) {
    ticket.messages.push({
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: user.name || 'AgentLadders Support HQ',
      isStaff: true,
      text: replyMessage.trim(),
      timestamp: now
    });

    if (!status) {
      ticket.status = 'In Review';
    }

    // In-App Notification if enabled in Notification Settings
    if (notifPref.inApp !== false) {
      db.notifications = db.notifications || [];
      targetUserIds.forEach(tUserId => {
        db.notifications.unshift({
          id: 'notif_' + Math.random().toString(36).substring(2, 9),
          agencyId: ticket.agencyId,
          userId: tUserId,
          title: `Support Reply: ${ticket.ticketNumber} 💬`,
          message: `AgentLadders HQ replied: "${replyMessage.trim().substring(0, 85)}${replyMessage.trim().length > 85 ? '...' : ''}" on ticket "${ticket.subject}".`,
          type: 'info',
          read: false,
          createdAt: now
        });
      });
    }
  } else if (status && status !== oldStatus) {
    // Ticket status changed by HQ
    if (notifPref.inApp !== false) {
      db.notifications = db.notifications || [];
      targetUserIds.forEach(tUserId => {
        db.notifications.unshift({
          id: 'notif_' + Math.random().toString(36).substring(2, 9),
          agencyId: ticket.agencyId,
          userId: tUserId,
          title: `Ticket ${ticket.ticketNumber} ${status} 🎫`,
          message: `Your ticket "${ticket.subject}" status was updated to ${status} by AgentLadders HQ.`,
          type: status === 'Resolved' ? 'success' : 'info',
          read: false,
          createdAt: now
        });
      });
    }
  }

  // Dispatch Email Notification to the Broker if enabled
  if (notifPref.email !== false && ticket.createdByEmail) {
    await sendSupportEmail({
      to: ticket.createdByEmail,
      subject: `[HQ Update] Ticket ${ticket.ticketNumber} status is now ${ticket.status}: ${ticket.subject}`,
      template: ticket.status === 'Resolved' ? 'ticket_resolved' : 'ticket_reply_staff',
      ticket: ticket as any,
      messageText: replyMessage ? replyMessage.trim() : `Ticket status has been updated to ${ticket.status} by AgentLadders HQ.`,
      recipientRole: 'broker'
    });
  }

  await saveDb(db);
  return NextResponse.json({ success: true, ticket, emailDispatched: notifPref.email !== false && !!ticket.createdByEmail });
}
