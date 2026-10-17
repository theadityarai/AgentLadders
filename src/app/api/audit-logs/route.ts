import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateSecureId } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const auditLogs = (db.auditLogs || []).filter(a => a.agencyId === user.agencyId);
  const recycleBin = (db.recycleBin || []).filter(r => r.agencyId === user.agencyId);

  return NextResponse.json({ auditLogs, recycleBin });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const { action, recycleId } = data;

  if (action === 'restore' && recycleId) {
    const itemIndex = (db.recycleBin || []).findIndex(r => r.id === recycleId && r.agencyId === user.agencyId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in recycle bin' }, { status: 404 });
    }

    const item = db.recycleBin[itemIndex];
    // Restore entity to its corresponding collection
    if (item.entityType === 'Lead' && db.leads) {
      db.leads.unshift(item.data as any);
    } else if (item.entityType === 'Property' && db.properties) {
      db.properties.unshift(item.data as any);
    } else if (item.entityType === 'Deal' && db.deals) {
      db.deals.unshift(item.data as any);
    } else if (item.entityType === 'Client' && db.clients) {
      db.clients.unshift(item.data as any);
    }

    // Remove from recycle bin
    db.recycleBin.splice(itemIndex, 1);

    // Audit the restore
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: generateSecureId('aud_'),
      agencyId: user.agencyId,
      userId: user.id,
      userName: user.name || 'Agent',
      action: 'RESTORE',
      entity: item.entityType,
      entityId: item.originalId,
      details: `Restored ${item.entityType} "${item.name}" from recycle bin`,
      createdAt: new Date().toISOString()
    });

    await saveDb(db);
    return NextResponse.json({ success: true, message: `Restored ${item.name} successfully.` });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
