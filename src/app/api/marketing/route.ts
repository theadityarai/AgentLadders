import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canMutateCRMRecords } from '@/lib/rbac';
import { sanitizeString } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const campaigns = (db.marketingCampaigns || []).filter(m => m.agencyId === user.agencyId);
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to launch marketing campaigns.' }, { status: 403 });
  }

  const data = await req.json();
  const newCampaign = {
    id: 'mkt_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    name: sanitizeString(data.name || 'New Marketing Campaign', 150),
    platform: sanitizeString(data.platform || 'Property Finder', 80),
    status: sanitizeString(data.status || 'Active', 50),
    budget: Math.max(0, Number(data.budget) || 1000),
    spend: Math.max(0, Number(data.spend) || 0),
    leadsGenerated: Math.max(0, Number(data.leadsGenerated) || 0),
    dealsClosed: Math.max(0, Number(data.dealsClosed) || 0),
    utmSource: sanitizeString(data.utmSource || 'campaign_' + Math.random().toString(36).substring(2, 6), 100),
    startDate: sanitizeString(data.startDate || new Date().toISOString().split('T')[0], 50),
    createdAt: new Date().toISOString()
  };

  db.marketingCampaigns = db.marketingCampaigns || [];
  db.marketingCampaigns.unshift(newCampaign as any);

  // Add audit log
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.unshift({
    id: 'aud_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    userId: user.id,
    userName: user.name || 'Agent',
    action: 'CREATE',
    entity: 'MarketingCampaign',
    entityId: newCampaign.id,
    details: `Created campaign "${newCampaign.name}" on ${newCampaign.platform}`,
    createdAt: new Date().toISOString()
  });

  await saveDb(db);
  return NextResponse.json({ success: true, campaign: newCampaign });
}

