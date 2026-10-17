import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
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

  if ((db.owners || []).filter(o => o.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyOwners = (db.owners || []).filter(o => o.agencyId === user.agencyId);
  return NextResponse.json({ owners: agencyOwners });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to add property owners.' }, { status: 403 });
  }

  const data = await req.json();

  if (!data.name || !data.name.trim()) {
    return NextResponse.json({ error: 'Owner / landlord name is required.' }, { status: 400 });
  }
  const cleanPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return NextResponse.json({ error: 'A valid 10-digit mobile number is required.' }, { status: 400 });
  }

  const newOwner = {
    ...data,
    id: 'owner_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: sanitizeString(data.name.trim(), 100),
    email: sanitizeString(data.email || '', 100),
    phone: sanitizeString(data.phone || '', 30),
    propertiesCount: parseInt(data.propertiesCount) || 1,
    ownerType: sanitizeString(data.ownerType || 'Individual Owner', 50),
    ownershipShare: sanitizeString(data.ownershipShare || '100%', 20),
    primaryProperty: sanitizeString(data.primaryProperty || '', 200),
    taxId: sanitizeString(data.taxId || '', 50),
    notes: sanitizeString(data.notes || '', 1000),
    createdAt: new Date().toISOString()
  };

  if (!db.owners) db.owners = [];
  db.owners.push(newOwner);
  await saveDb(db);

  return NextResponse.json({ success: true, owner: newOwner });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify property owners.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing owner id' }, { status: 400 });

  if (!db.owners) db.owners = [];
  const index = db.owners.findIndex(o => o.id === data.id && o.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });

  const updatedOwner = {
    ...db.owners[index],
    ...data,
    id: db.owners[index].id, // IMMUTABLE
    agencyId: db.owners[index].agencyId, // IMMUTABLE: tenant isolation
    name: data.name !== undefined ? sanitizeString(data.name, 100) : db.owners[index].name,
    email: data.email !== undefined ? sanitizeString(data.email, 100) : db.owners[index].email,
    phone: data.phone !== undefined ? sanitizeString(data.phone, 30) : db.owners[index].phone,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 1000) : db.owners[index].notes,
    propertiesCount: data.propertiesCount !== undefined ? parseInt(data.propertiesCount) || 1 : db.owners[index].propertiesCount,
    updatedAt: new Date().toISOString()
  };

  db.owners[index] = updatedOwner;
  await saveDb(db);

  return NextResponse.json({ success: true, owner: updatedOwner });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete property owners.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing owner id' }, { status: 400 });

  if (db.owners) {
    db.owners = db.owners.filter(o => !(o.id === id && o.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
