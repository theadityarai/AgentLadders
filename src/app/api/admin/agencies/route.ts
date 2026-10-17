import { NextResponse } from 'next/server';
import { getDb, saveDb, seedAgencyData } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { DEFAULT_BHK_OPTIONS, DEFAULT_PROPERTY_TYPES, DEFAULT_LEAD_SOURCES } from '@/lib/formatters';
import { isValidEmail, isValidPassword, sanitizeString, normalizeEmail, generateRandom12Digits, generateSecureId, generateSecureToken } from '@/lib/sanitize';

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

  const db = await getDb();
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
    const { 
      mode = 'full_setup', // 'invite' | 'full_setup'
      name, 
      country = 'India', 
      currency = 'INR', 
      plan = 'Professional', 
      status: inputStatus, 
      ownerName, 
      ownerEmail, 
      ownerPassword, 
      ownerPhone = '',
      subdomain = '',
      seedDemoData = false 
    } = data;

    if (!name || !ownerEmail) {
      return NextResponse.json({ error: 'Missing agency name or owner email' }, { status: 400 });
    }

    const digitsOnly = (ownerPhone || '').replace(/\D/g, '');
    if (!ownerPhone || digitsOnly.length < 10) {
      return NextResponse.json({ error: 'Official Agency WhatsApp number is required (min 10 digits)' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(ownerEmail);
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Please provide a valid owner email address' }, { status: 400 });
    }

    if (ownerPassword) {
      const passCheck = isValidPassword(ownerPassword);
      if (!passCheck.valid) {
        return NextResponse.json({ error: passCheck.reason }, { status: 400 });
      }
    }

    const cleanAgencyName = sanitizeString(name, 120);
    const cleanOwnerName = sanitizeString(ownerName || 'Agency Principal', 100);

    const db = await getDb();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const agencyId = generateSecureId('ag_');
    const userId = generateSecureId('usr_');
    const isInvite = mode === 'invite';
    const finalStatus = inputStatus || (isInvite ? 'Pending Invite' : 'Active');
    const inviteToken = generateSecureId('inv_', 16);
    const rawPassword = ownerPassword || generateRandom12Digits();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newAgency = {
      id: agencyId,
      name: cleanAgencyName,
      subdomain: subdomain || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      country: country || 'India',
      currency: currency || 'INR',
      plan: plan || 'Professional',
      status: finalStatus,
      inviteToken: isInvite ? inviteToken : undefined,
      inviteSentAt: isInvite ? new Date().toISOString() : undefined,
      bhkOptions: DEFAULT_BHK_OPTIONS,
      propertyTypes: DEFAULT_PROPERTY_TYPES,
      leadSources: DEFAULT_LEAD_SOURCES,
      fontFamily: 'roboto',
      colorScheme: 'emerald',
      notificationPrefs: {
        'New lead assigned': { inApp: true, email: true },
        'Task reminder': { inApp: true, email: false },
        'Site visit reminder': { inApp: true, email: true }
      },
      createdAt: new Date().toISOString(),
      ownerName: cleanOwnerName,
      ownerEmail: cleanEmail,
      phone: sanitizeString(ownerPhone, 30),
      whatsapp: sanitizeString(ownerPhone, 30),
      ownerPhone: sanitizeString(ownerPhone, 30)
    };

    if (!db.agencies) db.agencies = [];
    db.agencies.push(newAgency);

    if (!db.users) db.users = [];
    db.users.push({
      id: userId,
      name: cleanOwnerName,
      email: cleanEmail,
      phone: sanitizeString(ownerPhone, 30),
      password: hashedPassword,
      passwordHash: hashedPassword,
      role: 'OWNER',
      agencyId,
      status: isInvite ? 'Pending Invite' : 'Active'
    });

    await saveDb(db);

    // Optionally seed starter inventory and pipeline
    if (seedDemoData && !isInvite) {
      await seedAgencyData(agencyId);
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const inviteLink = `${protocol}://${host}/login?invite=${inviteToken}&email=${encodeURIComponent(ownerEmail)}`;

    return NextResponse.json({ 
      success: true, 
      agency: newAgency,
      inviteToken,
      inviteLink 
    });
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

  const db = await getDb();
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
    ownerName: data.ownerName !== undefined ? data.ownerName : current.ownerName,
    ownerEmail: data.ownerEmail !== undefined ? data.ownerEmail : current.ownerEmail,
    ownerPhone: data.ownerPhone !== undefined ? data.ownerPhone : current.ownerPhone,
    updatedAt: new Date().toISOString()
  };

  // If agency status changed to Inactive or Suspended, reflect in owner user
  if (data.status) {
    (db.users || []).forEach((u: any) => {
      if (u.agencyId === data.id) {
        u.agencyStatus = data.status;
      }
    });
  }

  await saveDb(db);
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

  const db = await getDb();
  // Protect default agency if needed
  if (id === 'ag_ql21vxnd_protected') {
    return NextResponse.json({ error: 'Cannot delete primary root agency' }, { status: 400 });
  }

  db.agencies = (db.agencies || []).filter((a: any) => a.id !== id);
  db.users = (db.users || []).filter((u: any) => u.agencyId !== id);
  db.properties = (db.properties || []).filter((p: any) => p.agencyId !== id);
  db.deals = (db.deals || []).filter((d: any) => d.agencyId !== id);
  db.leads = (db.leads || []).filter((l: any) => l.agencyId !== id);
  db.clients = (db.clients || []).filter((c: any) => c.agencyId !== id);
  if (db.tasks) db.tasks = db.tasks.filter((t: any) => t.agencyId !== id);
  if (db.siteVisits) db.siteVisits = db.siteVisits.filter((s: any) => s.agencyId !== id);
  if (db.supportTickets) db.supportTickets = db.supportTickets.filter((tk: any) => tk.agencyId !== id);

  await saveDb(db);
  return NextResponse.json({ success: true, deletedId: id });
}
