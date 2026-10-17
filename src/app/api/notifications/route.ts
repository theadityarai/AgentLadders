import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ notifications: [] });

  const db = await getDb();
  const userId = (session.user as any).id;
  const userAgencyId = (session.user as any).agencyId;
  db.notifications = db.notifications || [];

  let userNotifs = db.notifications.filter(n => n.userId === userId || (n.agencyId === userAgencyId && (!n.userId || n.userId === userId)));

  // If no notifications exist yet for user, seed initial helpful notifications
  if (userNotifs.length === 0) {
    const welcomeNotifs = [
      {
        id: 'notif_welcome_' + Date.now(),
        agencyId: (session.user as any).agencyId,
        userId: userId,
        title: 'Welcome to AgentLadders! 🚀',
        message: 'Your high-performance real estate brokerage cockpit is live. Start by exploring properties or logging site visits.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif_tip_' + (Date.now() + 1),
        agencyId: (session.user as any).agencyId,
        userId: userId,
        title: 'Agency Configuration Ready ⚙️',
        message: 'You can customize your BHK layouts, Property Types, and Lead Sources anytime from Settings > Configuration.',
        type: 'system',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    db.notifications.unshift(...welcomeNotifs);
    await saveDb(db);
    userNotifs = welcomeNotifs;
  }

  userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return NextResponse.json({ notifications: userNotifs });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, message, type } = await req.json();
  const db = await getDb();
  const user = session.user as any;

  db.notifications = db.notifications || [];
  const newNotif = {
    id: 'notif_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    userId: user.id,
    title: title || 'Test Notification 🔔',
    message: message || 'This is a real-time notification alert from AgentLadders.',
    type: type || 'info',
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(newNotif);
  await saveDb(db);

  return NextResponse.json({ success: true, notification: newNotif });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, markAllRead } = await req.json();
  const db = await getDb();
  const userId = (session.user as any).id;

  if (markAllRead) {
    (db.notifications || []).forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    await saveDb(db);
    return NextResponse.json({ success: true });
  }

  const notif = (db.notifications || []).find(n => n.id === id && n.userId === userId);
  if (notif) {
    notif.read = true;
    await saveDb(db);
  }
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = (session.user as any).id;
  const db = await getDb();

  if (id && db.notifications) {
    db.notifications = db.notifications.filter(n => !(n.id === id && n.userId === userId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
