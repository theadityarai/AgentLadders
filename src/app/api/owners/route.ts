import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
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

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newOwner = {
    ...data,
    id: 'owner_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: data.name || 'New Owner',
    email: data.email || '',
    phone: data.phone || '',
    propertiesCount: parseInt(data.propertiesCount) || 1,
    ownerType: data.ownerType || 'Individual Owner',
    ownershipShare: data.ownershipShare || '100%',
    primaryProperty: data.primaryProperty || '',
    taxId: data.taxId || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };

  if (!db.owners) db.owners = [];
  db.owners.push(newOwner);
  saveDb(db);

  return NextResponse.json({ success: true, owner: newOwner });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing owner id' }, { status: 400 });

  if (!db.owners) db.owners = [];
  const index = db.owners.findIndex(o => o.id === data.id && o.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });

  const updatedOwner = {
    ...db.owners[index],
    ...data,
    propertiesCount: data.propertiesCount !== undefined ? parseInt(data.propertiesCount) || 1 : db.owners[index].propertiesCount,
    updatedAt: new Date().toISOString()
  };

  db.owners[index] = updatedOwner;
  saveDb(db);

  return NextResponse.json({ success: true, owner: updatedOwner });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing owner id' }, { status: 400 });

  if (db.owners) {
    db.owners = db.owners.filter(o => !(o.id === id && o.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
