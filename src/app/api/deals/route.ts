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

  if ((db.deals || []).filter(d => d.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyDeals = (db.deals || []).filter(d => d.agencyId === user.agencyId);
  return NextResponse.json({ deals: agencyDeals });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newDeal = {
    ...data,
    id: 'deal_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: data.title || 'New Deal',
    propertyId: data.propertyId || '',
    propertyName: data.propertyName || '',
    leadId: data.leadId || '',
    clientName: data.clientName || '',
    dealType: data.dealType || 'Sale Acquisition',
    amount: parseFloat(data.amount) || 0,
    stage: data.stage || 'Negotiation',
    probability: parseInt(data.probability) || 50,
    commissionRate: data.commissionRate || '2.5%',
    commissionAmount: data.commissionAmount || (parseFloat(data.amount) * 0.025 || 0),
    assignedBroker: data.assignedBroker || 'Marcus Vance',
    expectedCloseDate: data.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  if (!db.deals) db.deals = [];
  db.deals.push(newDeal);
  saveDb(db);

  return NextResponse.json({ success: true, deal: newDeal });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing deal id' }, { status: 400 });

  if (db.deals) {
    db.deals = db.deals.filter(d => !(d.id === id && d.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
