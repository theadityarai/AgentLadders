import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const campaigns = (db.marketingCampaigns || []).filter(m => m.agencyId === user.agencyId);
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newCampaign = {
    id: 'mkt_' + Math.random().toString(36).substring(2, 9),
    agencyId: user.agencyId,
    name: data.name || 'New Marketing Campaign',
    platform: data.platform || 'Property Finder',
    status: data.status || 'Active',
    budget: Number(data.budget) || 1000,
    spend: Number(data.spend) || 0,
    leadsGenerated: Number(data.leadsGenerated) || 0,
    dealsClosed: Number(data.dealsClosed) || 0,
    utmSource: data.utmSource || 'campaign_' + Math.random().toString(36).substring(2, 6),
    startDate: data.startDate || new Date().toISOString().split('T')[0],
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

  saveDb(db);
  return NextResponse.json({ success: true, campaign: newCampaign });
}
