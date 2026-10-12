import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.email === 'aditya@agentladders.com' || user.email === 'admin@agentladders.com';
  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: Super Admin privileges required' }, { status: 403 });
  }

  const db = getDb();
  const agencies = db.agencies || [];
  const users = db.users || [];
  const properties = db.properties || [];
  const deals = db.deals || [];
  const leads = db.leads || [];

  // Plan pricing constants for MRR
  const planPrices: Record<string, number> = {
    Enterprise: 599,
    Professional: 249,
    Starter: 99,
    Free: 0
  };

  let mrr = 0;
  const planCounts: Record<string, number> = {
    Enterprise: 0,
    Professional: 0,
    Starter: 0,
    Free: 0
  };

  agencies.forEach((ag: any) => {
    const plan = ag.plan || 'Professional';
    if (ag.status !== 'Suspended') {
      mrr += planPrices[plan] || 99;
    }
    planCounts[plan] = (planCounts[plan] || 0) + 1;
  });

  const closedDeals = deals.filter((d: any) => d.stage === 'Closed Won');
  const totalGmv = closedDeals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  const statsPayload = {
    totalAgencies: agencies.length,
    activeAgencies: agencies.filter((a: any) => a.status === 'Active' || !a.status).length,
    inactiveAgencies: agencies.filter((a: any) => a.status === 'Inactive').length,
    suspendedAgencies: agencies.filter((a: any) => a.status === 'Suspended').length,
    trialAgencies: agencies.filter((a: any) => a.status === 'Trial').length,
    totalUsers: users.length,
    totalProperties: properties.length,
    totalDeals: deals.length,
    totalLeads: leads.length,
    totalGmv,
    mrr,
    planCounts
  };

  return NextResponse.json({
    ...statsPayload,
    stats: statsPayload
  });
}
