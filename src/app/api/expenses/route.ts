import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { canManageFinancials } from '@/lib/rbac';
import { sanitizeString, generateSecureId } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
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

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageFinancials(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Only Owner, Managers, and Admins have permission to log expenses.' }, { status: 403 });
  }

  const data = await req.json();
  const newExpense = {
    ...data,
    id: generateSecureId('exp_'),
    agencyId: user.agencyId,
    category: sanitizeString(data.category || 'Operations', 50),
    description: sanitizeString(data.description || 'Agency Operating Expense', 500),
    amount: Math.max(0, parseFloat(data.amount) || 0),
    date: sanitizeString(data.date || new Date().toISOString().split('T')[0], 50),
    vendor: sanitizeString(data.vendor || '', 100),
    paymentMethod: sanitizeString(data.paymentMethod || 'Company Card', 50),
    taxDeductible: Boolean(data.taxDeductible),
    receiptRef: sanitizeString(data.receiptRef || '', 100),
    createdAt: new Date().toISOString()
  };

  if (!db.expenses) db.expenses = [];
  db.expenses.push(newExpense);
  await saveDb(db);

  return NextResponse.json({ success: true, expense: newExpense });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageFinancials(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Only Owner, Managers, and Admins have permission to modify expenses.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });

  if (!db.expenses) db.expenses = [];
  const index = db.expenses.findIndex(e => e.id === data.id && e.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

  const updatedExpense = {
    ...db.expenses[index],
    ...data,
    id: db.expenses[index].id, // IMMUTABLE
    agencyId: db.expenses[index].agencyId, // IMMUTABLE: tenant isolation
    description: data.description !== undefined ? sanitizeString(data.description, 500) : db.expenses[index].description,
    vendor: data.vendor !== undefined ? sanitizeString(data.vendor, 100) : db.expenses[index].vendor,
    category: data.category !== undefined ? sanitizeString(data.category, 50) : db.expenses[index].category,
    amount: data.amount !== undefined ? parseFloat(data.amount) || 0 : db.expenses[index].amount,
    updatedAt: new Date().toISOString()
  };

  db.expenses[index] = updatedExpense;
  await saveDb(db);

  return NextResponse.json({ success: true, expense: updatedExpense });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageFinancials(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Only Owner, Managers, and Admins have permission to delete expenses.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing expense id' }, { status: 400 });

  if (db.expenses) {
    db.expenses = db.expenses.filter(e => !(e.id === id && e.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
