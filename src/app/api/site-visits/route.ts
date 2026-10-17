import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
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

  if ((db.siteVisits || []).filter(s => s.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyVisits = (db.siteVisits || []).filter(s => s.agencyId === user.agencyId);
  return NextResponse.json({ siteVisits: agencyVisits, visits: agencyVisits });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to schedule site visits.' }, { status: 403 });
  }

  const data = await req.json();
  let clientPhone = data.clientPhone || '';
  if (!clientPhone && data.client && db.leads) {
    const matchedLead = db.leads.find(l => l.name?.trim().toLowerCase() === data.client.trim().toLowerCase() && l.agencyId === user.agencyId);
    if (matchedLead?.phone) clientPhone = matchedLead.phone;
  }

  const newVisit = {
    ...data,
    id: generateSecureId('vis_'),
    agencyId: user.agencyId,
    property: sanitizeString(data.property || 'Property Tour', 150),
    client: sanitizeString(data.client || 'Client', 100),
    clientPhone: sanitizeString(clientPhone, 30),
    date: sanitizeString(data.date || new Date().toISOString().split('T')[0], 50),
    timeSlot: sanitizeString(data.timeSlot || '11:30 AM - 12:30 PM', 50),
    accompaniedBy: sanitizeString(data.accompaniedBy || user.name || 'Aditya Rai', 100),
    status: sanitizeString(data.status || 'Scheduled', 50),
    feedback: sanitizeString(data.feedback || '', 1000),
    notes: sanitizeString(data.notes || '', 1000),
    createdAt: new Date().toISOString()
  };

  if (!db.siteVisits) db.siteVisits = [];
  db.siteVisits.unshift(newVisit);
  await saveDb(db);

  return NextResponse.json({ success: true, visit: newVisit });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify site visits.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing visit id' }, { status: 400 });

  if (!db.siteVisits) db.siteVisits = [];
  const index = db.siteVisits.findIndex(v => v.id === data.id && v.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Visit not found' }, { status: 404 });

  const updatedVisit = {
    ...db.siteVisits[index],
    ...data,
    id: db.siteVisits[index].id, // IMMUTABLE
    agencyId: db.siteVisits[index].agencyId, // IMMUTABLE: tenant isolation
    feedback: data.feedback !== undefined ? sanitizeString(data.feedback, 1000) : db.siteVisits[index].feedback,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 1000) : db.siteVisits[index].notes,
    status: data.status !== undefined ? sanitizeString(data.status, 50) : db.siteVisits[index].status,
    updatedAt: new Date().toISOString()
  };

  db.siteVisits[index] = updatedVisit;
  await saveDb(db);

  return NextResponse.json({ success: true, visit: updatedVisit });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete site visits.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing visit id' }, { status: 400 });

  if (db.siteVisits) {
    db.siteVisits = db.siteVisits.filter(s => !(s.id === id && s.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
