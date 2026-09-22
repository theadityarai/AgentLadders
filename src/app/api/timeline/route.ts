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

  const activities = (db.activities || []).filter(a => a.agencyId === user.agencyId);
  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newActivity = {
    id: 'act_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    actor: user.name || 'Agent',
    type: data.type || 'Call',
    relatedEntity: data.relatedEntity || 'Lead',
    relatedId: data.relatedId || '',
    summary: data.summary || 'Interaction logged',
    details: data.details || '',
    createdAt: new Date().toISOString()
  };

  db.activities = db.activities || [];
  db.activities.unshift(newActivity as any);

  saveDb(db);
  return NextResponse.json({ success: true, activity: newActivity });
}
