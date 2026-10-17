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

  if ((db.brokers || []).filter(b => b.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyBrokers = (db.brokers || []).filter(b => b.agencyId === user.agencyId);
  return NextResponse.json({ brokers: agencyBrokers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to add brokers.' }, { status: 403 });
  }

  const data = await req.json();
  const newBroker = {
    ...data,
    id: generateSecureId('broker_'),
    agencyId: user.agencyId,
    name: sanitizeString(data.name || 'New Broker', 100),
    agency: sanitizeString(data.agency || 'External Agency', 100),
    commissionSplit: sanitizeString(data.commissionSplit || '70/30', 50),
    phone: sanitizeString(data.phone || '', 30),
    email: sanitizeString(data.email || '', 100),
    licenseNumber: sanitizeString(data.licenseNumber || '', 50),
    territory: sanitizeString(data.territory || 'Metropolitan Luxury', 100),
    createdAt: new Date().toISOString()
  };

  if (!db.brokers) db.brokers = [];
  db.brokers.push(newBroker);
  await saveDb(db);

  return NextResponse.json({ success: true, broker: newBroker });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify brokers.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing broker id' }, { status: 400 });

  if (!db.brokers) db.brokers = [];
  const index = db.brokers.findIndex(b => b.id === data.id && b.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Broker not found' }, { status: 404 });

  const updatedBroker = {
    ...db.brokers[index],
    ...data,
    id: db.brokers[index].id, // IMMUTABLE
    agencyId: db.brokers[index].agencyId, // IMMUTABLE: tenant isolation
    name: data.name !== undefined ? sanitizeString(data.name, 100) : db.brokers[index].name,
    agency: data.agency !== undefined ? sanitizeString(data.agency, 100) : db.brokers[index].agency,
    commissionSplit: data.commissionSplit !== undefined ? sanitizeString(data.commissionSplit, 50) : db.brokers[index].commissionSplit,
    phone: data.phone !== undefined ? sanitizeString(data.phone, 30) : db.brokers[index].phone,
    email: data.email !== undefined ? sanitizeString(data.email, 100) : db.brokers[index].email,
    licenseNumber: data.licenseNumber !== undefined ? sanitizeString(data.licenseNumber, 50) : db.brokers[index].licenseNumber,
    territory: data.territory !== undefined ? sanitizeString(data.territory, 100) : db.brokers[index].territory,
    updatedAt: new Date().toISOString()
  };

  db.brokers[index] = updatedBroker;
  await saveDb(db);

  return NextResponse.json({ success: true, broker: updatedBroker });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete brokers.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing broker id' }, { status: 400 });

  if (db.brokers) {
    db.brokers = db.brokers.filter(b => !(b.id === id && b.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
