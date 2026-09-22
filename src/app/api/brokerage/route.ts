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

  if ((db.brokers || []).filter(b => b.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyBrokers = (db.brokers || []).filter(b => b.agencyId === user.agencyId);
  return NextResponse.json({ brokers: agencyBrokers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newBroker = {
    ...data,
    id: 'broker_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: data.name || 'New Broker',
    agency: data.agency || 'External Agency',
    commissionSplit: data.commissionSplit || '70/30',
    phone: data.phone || '',
    email: data.email || '',
    licenseNumber: data.licenseNumber || '',
    territory: data.territory || 'Metropolitan Luxury',
    createdAt: new Date().toISOString()
  };

  if (!db.brokers) db.brokers = [];
  db.brokers.push(newBroker);
  saveDb(db);

  return NextResponse.json({ success: true, broker: newBroker });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing broker id' }, { status: 400 });

  if (db.brokers) {
    db.brokers = db.brokers.filter(b => !(b.id === id && b.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
