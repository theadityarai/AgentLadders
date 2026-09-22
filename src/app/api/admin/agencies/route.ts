import { NextResponse } from 'next/server';
import { getDb, saveDb, seedAgencyData } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

function isSuperAdminUser(session: any) {
  if (!session?.user) return false;
  const user = session.user as any;
  return user.role === 'SUPER_ADMIN' || user.email === 'aditya@agentladders.com' || user.email === 'admin@agentladders.com';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdminUser(session)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  const db = getDb();
  const agencies = db.agencies || [];
  const users = db.users || [];
  const properties = db.properties || [];
  const deals = db.deals || [];
  const leads = db.leads || [];

  const enrichedAgencies = agencies.map((ag: any) => {
    const agencyUsers = users.filter((u: any) => u.agencyId === ag.id);
    const owner = agencyUsers.find((u: any) => u.role === 'OWNER') || agencyUsers[0] || {
      name: ag.ownerName || 'Unassigned',
      email: ag.ownerEmail || 'admin@agency.com'
    };

    const agencyProperties = properties.filter((p: any) => p.agencyId === ag.id);
    const agencyDeals = deals.filter((d: any) => d.agencyId === ag.id);
    const agencyLeads = leads.filter((l: any) => l.agencyId === ag.id);
    const wonRevenue = agencyDeals
      .filter((d: any) => d.stage === 'Closed Won')
      .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

    return {
      id: ag.id,
      name: ag.name,
      country: ag.country || 'Global',
      currency: ag.currency || 'USD',
      plan: ag.plan || 'Professional',
      status: ag.status || 'Active',
      createdAt: ag.createdAt || new Date().toISOString(),
      owner: {
        name: owner.name,
        email: owner.email
      },
      userCount: agencyUsers.length,
      propertyCount: agencyProperties.length,
      dealCount: agencyDeals.length,
      leadCount: agencyLeads.length,
      wonRevenue
    };
  });

  return NextResponse.json({ agencies: enrichedAgencies });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdminUser(session)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { name, country, currency, plan, ownerName, ownerEmail, ownerPassword } = data;

    if (!name || !ownerEmail) {
      return NextResponse.json({ error: 'Missing agency name or owner email' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === ownerEmail.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const agencyId = 'ag_' + Math.random().toString(36).substring(2, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 10);
    const hashedPassword = await bcrypt.hash(ownerPassword || 'welcome123', 10);

    const newAgency = {
      id: agencyId,
      name,
      country: country || 'United States',
      currency: currency || 'USD',
      plan: plan || 'Professional',
      status: 'Active',
      propertyTypes: ['Apartment', 'House', 'Villa', 'Commercial'],
      leadSources: ['Website', 'Referral', 'Zillow', 'Walk-in'],
      notificationPrefs: {
        'New lead assigned': { inApp: true, email: true },
        'Task reminder': { inApp: true, email: false },
        'Site visit reminder': { inApp: true, email: true }
      },
      createdAt: new Date().toISOString(),
      ownerName: ownerName || 'Agency Owner',
      ownerEmail: ownerEmail.toLowerCase()
    };

    if (!db.agencies) db.agencies = [];
    db.agencies.push(newAgency);

    if (!db.users) db.users = [];
    db.users.push({
      id: userId,
      name: ownerName || 'Agency Owner',
      email: ownerEmail.toLowerCase(),
      password: hashedPassword,
      passwordHash: hashedPassword,
      role: 'OWNER',
      agencyId
    });

    saveDb(db);

    // Seed dummy properties and leads for new agency
    seedAgencyData(agencyId);

    return NextResponse.json({ success: true, agency: newAgency });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdminUser(session)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) {
    return NextResponse.json({ error: 'Agency ID required' }, { status: 400 });
  }

  const db = getDb();
  const index = (db.agencies || []).findIndex((a: any) => a.id === data.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
  }

  const current = db.agencies[index];
  db.agencies[index] = {
    ...current,
    name: data.name !== undefined ? data.name : current.name,
    plan: data.plan !== undefined ? data.plan : current.plan,
    status: data.status !== undefined ? data.status : current.status,
    country: data.country !== undefined ? data.country : current.country,
    currency: data.currency !== undefined ? data.currency : current.currency,
    updatedAt: new Date().toISOString()
  };

  saveDb(db);
  return NextResponse.json({ success: true, agency: db.agencies[index] });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdminUser(session)) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Agency ID required' }, { status: 400 });
  }

  const db = getDb();
  // Protect default agency
  if (id === 'ag_ql21vxnd') {
    return NextResponse.json({ error: 'Cannot delete primary root agency' }, { status: 400 });
  }

  db.agencies = (db.agencies || []).filter((a: any) => a.id !== id);
  db.users = (db.users || []).filter((u: any) => u.agencyId !== id);
  db.properties = (db.properties || []).filter((p: any) => p.agencyId !== id);
  db.deals = (db.deals || []).filter((d: any) => d.agencyId !== id);
  db.leads = (db.leads || []).filter((l: any) => l.agencyId !== id);
  db.clients = (db.clients || []).filter((c: any) => c.agencyId !== id);

  saveDb(db);
  return NextResponse.json({ success: true });
}
