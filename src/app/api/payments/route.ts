import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.payments || []).filter(p => p.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyPayments = (db.payments || []).filter(p => p.agencyId === user.agencyId);
  return NextResponse.json({ payments: agencyPayments });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newPayment = {
    ...data,
    id: 'pay_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    reference: data.reference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    invoiceNumber: data.invoiceNumber || 'INV-GENERAL',
    amount: parseFloat(data.amount) || 0,
    method: data.method || 'Bank Transfer',
    paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
    payerName: data.payerName || '',
    notes: data.notes || '',
    status: data.status || 'Completed',
    createdAt: new Date().toISOString()
  };

  if (!db.payments) db.payments = [];
  db.payments.push(newPayment);
  saveDb(db);

  return NextResponse.json({ success: true, payment: newPayment });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing payment id' }, { status: 400 });

  if (!db.payments) db.payments = [];
  const index = db.payments.findIndex(p => p.id === data.id && p.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  const updatedPayment = {
    ...db.payments[index],
    ...data,
    amount: data.amount !== undefined ? parseFloat(data.amount) || 0 : db.payments[index].amount,
    updatedAt: new Date().toISOString()
  };

  db.payments[index] = updatedPayment;
  saveDb(db);

  return NextResponse.json({ success: true, payment: updatedPayment });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing payment id' }, { status: 400 });

  if (db.payments) {
    db.payments = db.payments.filter(p => !(p.id === id && p.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
