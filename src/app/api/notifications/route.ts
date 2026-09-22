import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ notifications: [] });

  const db = getDb();
  const userId = (session.user as any).id;
  const userNotifs = (db.notifications || [])
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return NextResponse.json({ notifications: userNotifs });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, markAllRead } = await req.json();
  const db = getDb();
  const userId = (session.user as any).id;

  if (markAllRead) {
    (db.notifications || []).forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    saveDb(db);
    return NextResponse.json({ success: true });
  }

  const notif = (db.notifications || []).find(n => n.id === id && n.userId === userId);
  if (notif) {
    notif.read = true;
    saveDb(db);
  }
  
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = (session.user as any).id;
  const db = getDb();

  if (id && db.notifications) {
    db.notifications = db.notifications.filter(n => !(n.id === id && n.userId === userId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
