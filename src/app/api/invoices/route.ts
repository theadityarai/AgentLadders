import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { canManageFinancials } from '@/lib/rbac';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.invoices || []).filter(i => i.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyInvoices = (db.invoices || []).filter(i => i.agencyId === user.agencyId);
  return NextResponse.json({ invoices: agencyInvoices });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageFinancials(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Only Owner, Managers, and Admins have permission to create invoices.' }, { status: 403 });
  }

  const data = await req.json();
  const newInvoice = {
    ...data,
    id: 'inv_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    number: data.number || `INV-${Date.now().toString().slice(-4)}`,
    clientName: data.clientName || 'Valued Client',
    amount: parseFloat(data.amount) || 0,
    status: data.status || 'Pending',
    dueDate: data.dueDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    dealRef: data.dealRef || '',
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    taxRate: data.taxRate || '5%',
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };

  if (!db.invoices) db.invoices = [];
  db.invoices.push(newInvoice);
  saveDb(db);

  return NextResponse.json({ success: true, invoice: newInvoice });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageFinancials(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Only Owner, Managers, and Admins have permission to edit invoices.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 });

  if (!db.invoices) db.invoices = [];
  const index = db.invoices.findIndex(i => i.id === data.id && i.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const updatedInvoice = {
    ...db.invoices[index],
    ...data,
    amount: data.amount !== undefined ? parseFloat(data.amount) || 0 : db.invoices[index].amount,
    updatedAt: new Date().toISOString()
  };

  db.invoices[index] = updatedInvoice;
  saveDb(db);

  return NextResponse.json({ success: true, invoice: updatedInvoice });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageFinancials(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Only Owner, Managers, and Admins have permission to delete invoices.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 });

  if (db.invoices) {
    db.invoices = db.invoices.filter(i => !(i.id === id && i.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
