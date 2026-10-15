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

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to create deals.' }, { status: 403 });
  }

  const data = await req.json();

  if (!data.title || !data.title.trim()) {
    return NextResponse.json({ error: 'Deal title / mandate name is required.' }, { status: 400 });
  }
  if (!data.clientName || !data.clientName.trim()) {
    return NextResponse.json({ error: 'Client name is required for this deal.' }, { status: 400 });
  }
  const amt = parseFloat(data.amount);
  if (isNaN(amt) || amt <= 0) {
    return NextResponse.json({ error: 'Deal transaction value must be greater than ₹0.' }, { status: 400 });
  }
  if (!data.stage || !data.stage.trim()) {
    return NextResponse.json({ error: 'Deal pipeline stage is required.' }, { status: 400 });
  }

  const newDeal = {
    ...data,
    id: 'deal_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: sanitizeString(data.title.trim(), 200),
    propertyId: sanitizeString(data.propertyId || '', 100),
    propertyName: sanitizeString(data.propertyName || (Array.isArray(data.properties) && data.properties.length > 0 ? data.properties[0] : ''), 200),
    properties: Array.isArray(data.properties) ? data.properties.map((p: any) => sanitizeString(String(p), 200)) : (data.propertyName ? [sanitizeString(data.propertyName, 200)] : []),
    leadId: sanitizeString(data.leadId || '', 100),
    clientName: sanitizeString(data.clientName || '', 100),
    dealType: sanitizeString(data.dealType || 'Sale Acquisition', 100),
    amount: Math.max(0, parseFloat(data.amount) || 0),
    stage: sanitizeString(data.stage || 'Negotiation', 50),
    probability: Math.min(100, Math.max(0, parseInt(data.probability) || 50)),
    commissionRate: sanitizeString(data.commissionRate || '2.5%', 50),
    commissionAmount: Math.max(0, data.commissionAmount || (parseFloat(data.amount) * 0.025 || 0)),
    assignedBroker: sanitizeString(data.assignedBroker || 'Marcus Vance', 100),
    expectedCloseDate: sanitizeString(data.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 50),
    createdAt: new Date().toISOString()
  };

  if (!db.deals) db.deals = [];
  db.deals.push(newDeal);
  saveDb(db);

  return NextResponse.json({ success: true, deal: newDeal });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify deals.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing deal id' }, { status: 400 });

  if (!db.deals) db.deals = [];
  const index = db.deals.findIndex(d => d.id === data.id && d.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

  const updatedDeal = {
    ...db.deals[index],
    ...data,
    id: db.deals[index].id, // IMMUTABLE
    agencyId: db.deals[index].agencyId, // IMMUTABLE: cross-tenant isolation
    title: data.title !== undefined ? sanitizeString(data.title, 200) : db.deals[index].title,
    clientName: data.clientName !== undefined ? sanitizeString(data.clientName, 100) : db.deals[index].clientName,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 1000) : db.deals[index].notes,
    amount: data.amount !== undefined ? parseFloat(data.amount) || 0 : db.deals[index].amount,
    probability: data.probability !== undefined ? parseInt(data.probability) || 50 : db.deals[index].probability,
    propertyName: data.propertyName !== undefined 
      ? data.propertyName 
      : (Array.isArray(data.properties) && data.properties.length > 0 ? data.properties[0] : db.deals[index].propertyName),
    properties: Array.isArray(data.properties) ? data.properties : db.deals[index].properties,
    updatedAt: new Date().toISOString()
  };

  db.deals[index] = updatedDeal;
  saveDb(db);

  return NextResponse.json({ success: true, deal: updatedDeal });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete deals.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing deal id' }, { status: 400 });

  if (db.deals) {
    db.deals = db.deals.filter(d => !(d.id === id && d.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
