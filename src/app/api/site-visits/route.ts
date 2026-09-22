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

  if ((db.siteVisits || []).filter(s => s.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyVisits = (db.siteVisits || []).filter(s => s.agencyId === user.agencyId);
  return NextResponse.json({ visits: agencyVisits });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newVisit = {
    ...data,
    id: 'vis_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    property: data.property || 'Property Tour',
    client: data.client || 'Client',
    date: data.date || new Date().toISOString().split('T')[0],
    timeSlot: data.timeSlot || '11:00 AM',
    accompaniedBy: data.accompaniedBy || 'Marcus Vance',
    status: data.status || 'Scheduled',
    feedback: data.feedback || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };

  if (!db.siteVisits) db.siteVisits = [];
  db.siteVisits.push(newVisit);
  saveDb(db);

  return NextResponse.json({ success: true, visit: newVisit });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing visit id' }, { status: 400 });

  if (!db.siteVisits) db.siteVisits = [];
  const index = db.siteVisits.findIndex(v => v.id === data.id && v.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Visit not found' }, { status: 404 });

  const updatedVisit = {
    ...db.siteVisits[index],
    ...data,
    updatedAt: new Date().toISOString()
  };

  db.siteVisits[index] = updatedVisit;
  saveDb(db);

  return NextResponse.json({ success: true, visit: updatedVisit });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing visit id' }, { status: 400 });

  if (db.siteVisits) {
    db.siteVisits = db.siteVisits.filter(s => !(s.id === id && s.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
