import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';
import { canMutateCRMRecords } from '@/lib/rbac';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.leads || []).filter(l => l.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyLeads = (db.leads || []).filter(l => l.agencyId === user.agencyId);
  return NextResponse.json({ leads: agencyLeads });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only agents do not have permission to create inquiries.' }, { status: 403 });
  }

  const data = await req.json();

  if (!data.name || !data.name.trim() || data.name.trim().length < 2) {
    return NextResponse.json({ error: 'Client / lead name is required (minimum 2 characters).' }, { status: 400 });
  }
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return NextResponse.json({ error: 'A valid 10-digit mobile number is required.' }, { status: 400 });
  }
  if (!data.status || !data.status.trim()) {
    return NextResponse.json({ error: 'Inquiry pipeline status is required.' }, { status: 400 });
  }

  const newLead = {
    ...data,
    id: 'lead_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: sanitizeString(data.name.trim(), 100),
    email: sanitizeString(data.email || '', 100),
    phone: sanitizeString(data.phone || '', 30),
    status: sanitizeString(data.status || 'New', 50),
    source: sanitizeString(data.source || 'Direct', 50),
    leadType: sanitizeString(data.leadType || 'Buyer', 50),
    requirement: sanitizeString(data.requirement || '', 500),
    budget: sanitizeString(data.budget || '', 100),
    locationPreference: sanitizeString(data.locationPreference || '', 200),
    priority: sanitizeString(data.priority || 'Medium', 50),
    assignedTo: sanitizeString(data.assignedTo || 'Unassigned', 100),
    nextFollowUp: sanitizeString(data.nextFollowUp || '', 50),
    notes: sanitizeString(data.notes || '', 1000),
    createdAt: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.push(newLead);
  saveDb(db);

  return NextResponse.json({ success: true, lead: newLead });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only agents do not have permission to edit inquiries.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

  if (!db.leads) db.leads = [];
  const index = db.leads.findIndex(l => l.id === data.id && l.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updatedLead = {
    ...db.leads[index],
    ...data,
    id: db.leads[index].id, // IMMUTABLE
    agencyId: db.leads[index].agencyId, // IMMUTABLE: cannot be stolen across tenants
    name: data.name !== undefined ? sanitizeString(data.name, 100) : db.leads[index].name,
    email: data.email !== undefined ? sanitizeString(data.email, 100) : db.leads[index].email,
    phone: data.phone !== undefined ? sanitizeString(data.phone, 30) : db.leads[index].phone,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 1000) : db.leads[index].notes,
    updatedAt: new Date().toISOString()
  };

  db.leads[index] = updatedLead;
  saveDb(db);

  return NextResponse.json({ success: true, lead: updatedLead });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only agents do not have permission to delete inquiries.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

  if (db.leads) {
    db.leads = db.leads.filter(l => !(l.id === id && l.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
