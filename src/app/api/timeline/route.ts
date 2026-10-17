import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canMutateCRMRecords } from '@/lib/rbac';
import { sanitizeString, generateSecureId } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const activities = (db.activities || []).filter(a => a.agencyId === user.agencyId);
  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to log activities.' }, { status: 403 });
  }

  const data = await req.json();
  const newActivity = {
    id: generateSecureId('act_'),
    agencyId: user.agencyId,
    actor: sanitizeString(user.name || 'Agent', 100),
    type: sanitizeString(data.type || 'Call', 50),
    relatedEntity: sanitizeString(data.relatedEntity || 'Lead', 50),
    relatedId: sanitizeString(data.relatedId || '', 100),
    summary: sanitizeString(data.summary || 'Interaction logged', 200),
    details: sanitizeString(data.details || '', 1000),
    createdAt: new Date().toISOString()
  };

  db.activities = db.activities || [];
  db.activities.unshift(newActivity as any);

  await saveDb(db);
  return NextResponse.json({ success: true, activity: newActivity });
}

