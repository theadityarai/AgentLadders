import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateSecureId } from '@/lib/sanitize';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.email === 'aditya@agentladders.com' || user.email === 'admin@agentladders.com';
  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: Super Admin privileges required' }, { status: 403 });
  }

  const { targetAgencyId } = await req.json();
  const db = await getDb();

  const targetAgency = db.agencies.find((a: any) => a.id === targetAgencyId);
  if (!targetAgency && targetAgencyId !== 'ag_ql21vxnd') {
    return NextResponse.json({ error: 'Target agency not found' }, { status: 404 });
  }

  // Update current super admin user's active agencyId
  const dbUser = db.users.find((u: any) => u.id === user.id);
  if (dbUser) {
    dbUser.agencyId = targetAgencyId;

    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: generateSecureId('aud_'),
      agencyId: targetAgencyId,
      userId: user.id,
      userName: user.name || 'Super Admin',
      action: 'UPDATE',
      entity: 'SuperAdminImpersonation',
      entityId: targetAgencyId,
      details: `Super Admin switched active tenant scope to ${targetAgency ? targetAgency.name : targetAgencyId}`,
      createdAt: new Date().toISOString()
    });

    await saveDb(db);
  }

  return NextResponse.json({
    success: true,
    agencyId: targetAgencyId,
    agencyName: targetAgency ? targetAgency.name : 'Primary Agency'
  });
}
