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

  const data = await req.json();
  const newLead = {
    ...data,
    id: 'lead_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: data.name || 'New Lead',
    email: data.email || '',
    phone: data.phone || '',
    status: data.status || 'New',
    source: data.source || 'Direct',
    leadType: data.leadType || 'Buyer',
    requirement: data.requirement || '',
    budget: data.budget || '',
    locationPreference: data.locationPreference || '',
    priority: data.priority || 'Medium',
    assignedTo: data.assignedTo || 'Unassigned',
    nextFollowUp: data.nextFollowUp || '',
    notes: data.notes || '',
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

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

  if (!db.leads) db.leads = [];
  const index = db.leads.findIndex(l => l.id === data.id && l.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updatedLead = {
    ...db.leads[index],
    ...data,
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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });

  if (db.leads) {
    db.leads = db.leads.filter(l => !(l.id === id && l.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
