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

  if ((db.expenses || []).filter(e => e.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyExpenses = (db.expenses || []).filter(e => e.agencyId === user.agencyId);
  return NextResponse.json({ expenses: agencyExpenses });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newExpense = {
    ...data,
    id: 'exp_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    category: data.category || 'Operations',
    description: data.description || 'Agency Operating Expense',
    amount: parseFloat(data.amount) || 0,
    date: data.date || new Date().toISOString().split('T')[0],
    vendor: data.vendor || '',
    paymentMethod: data.paymentMethod || 'Company Card',
    taxDeductible: Boolean(data.taxDeductible),
    receiptRef: data.receiptRef || '',
    createdAt: new Date().toISOString()
  };

  if (!db.expenses) db.expenses = [];
  db.expenses.push(newExpense);
  saveDb(db);

  return NextResponse.json({ success: true, expense: newExpense });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });

  if (!db.expenses) db.expenses = [];
  const index = db.expenses.findIndex(e => e.id === data.id && e.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

  const updatedExpense = {
    ...db.expenses[index],
    ...data,
    amount: data.amount !== undefined ? parseFloat(data.amount) || 0 : db.expenses[index].amount,
    updatedAt: new Date().toISOString()
  };

  db.expenses[index] = updatedExpense;
  saveDb(db);

  return NextResponse.json({ success: true, expense: updatedExpense });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });

  if (db.expenses) {
    db.expenses = db.expenses.filter(e => !(e.id === id && e.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
