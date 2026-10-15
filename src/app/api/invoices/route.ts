import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canManageFinancials } from '@/lib/rbac';
import { sanitizeString } from '@/lib/sanitize';

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

  // Strict Validation
  const clientName = data.clientName ? sanitizeString(data.clientName, 100).trim() : '';
  if (!clientName || clientName.length < 2) {
    return NextResponse.json({ error: 'Client / Bill To Name is required (minimum 2 characters).' }, { status: 400 });
  }

  const clientPhone = data.clientPhone ? sanitizeString(data.clientPhone, 30).trim() : '';
  const digitsOnly = clientPhone.replace(/\D/g, '').slice(-10);
  if (!clientPhone || digitsOnly.length !== 10) {
    return NextResponse.json({ error: 'A valid 10-digit mobile number for the client is required.' }, { status: 400 });
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const validItems = items.filter((it: any) => it.description && it.description.trim() && (parseFloat(it.amount) || 0) > 0);
  if (validItems.length === 0) {
    return NextResponse.json({ error: 'At least one line item with a description and taxable amount greater than ₹0 is required.' }, { status: 400 });
  }

  const baseAmount = parseFloat(data.amount) || 0;
  const totalAmount = data.totalAmount !== undefined ? parseFloat(data.totalAmount) : (baseAmount * 1.18);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    return NextResponse.json({ error: 'Total invoice payable amount must be greater than ₹0.' }, { status: 400 });
  }

  const newInvoice = {
    ...data,
    id: 'inv_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    number: data.number || `INV-${Date.now().toString().slice(-4)}`,
    clientName,
    clientPhone,
    clientEmail: data.clientEmail ? sanitizeString(data.clientEmail, 80) : '',
    clientAddress: data.clientAddress ? sanitizeString(data.clientAddress, 250) : '',
    clientGstin: data.clientGstin ? sanitizeString(data.clientGstin, 30).toUpperCase() : '',
    amount: baseAmount,
    totalAmount,
    taxType: data.taxType !== undefined ? data.taxType : 'none',
    status: data.status || 'Pending',
    dueDate: data.dueDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    dealRef: data.dealRef ? sanitizeString(data.dealRef, 200) : '',
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    taxRate: (data.taxRate !== undefined && data.taxRate !== 'none' && data.taxRate !== '') ? Number(data.taxRate) : 0,
    items: validItems,
    notes: data.notes ? sanitizeString(data.notes, 1000) : '',
    paymentDetails: data.paymentDetails || undefined,
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

  if (data.clientName !== undefined) {
    const trimmed = data.clientName.trim();
    if (!trimmed || trimmed.length < 2) {
      return NextResponse.json({ error: 'Client / Bill To Name is required (minimum 2 characters).' }, { status: 400 });
    }
  }

  if (data.clientPhone !== undefined) {
    const digitsOnly = data.clientPhone.replace(/\D/g, '').slice(-10);
    if (!data.clientPhone.trim() || digitsOnly.length !== 10) {
      return NextResponse.json({ error: 'A valid 10-digit mobile number for the client is required.' }, { status: 400 });
    }
  }

  const baseAmount = data.amount !== undefined ? parseFloat(data.amount) || 0 : db.invoices[index].amount;
  const totalAmount = data.totalAmount !== undefined 
    ? parseFloat(data.totalAmount) 
    : (db.invoices[index].totalAmount || baseAmount * 1.18);

  if (isNaN(totalAmount) || totalAmount <= 0) {
    return NextResponse.json({ error: 'Total invoice payable amount must be greater than ₹0.' }, { status: 400 });
  }

  const updatedInvoice = {
    ...db.invoices[index],
    ...data,
    id: db.invoices[index].id, // IMMUTABLE
    agencyId: db.invoices[index].agencyId, // IMMUTABLE: tenant isolation
    clientName: data.clientName !== undefined ? sanitizeString(data.clientName, 100) : db.invoices[index].clientName,
    clientPhone: data.clientPhone !== undefined ? sanitizeString(data.clientPhone, 30) : db.invoices[index].clientPhone,
    clientEmail: data.clientEmail !== undefined ? sanitizeString(data.clientEmail, 80) : db.invoices[index].clientEmail,
    clientAddress: data.clientAddress !== undefined ? sanitizeString(data.clientAddress, 250) : db.invoices[index].clientAddress,
    clientGstin: data.clientGstin !== undefined ? sanitizeString(data.clientGstin, 30).toUpperCase() : db.invoices[index].clientGstin,
    dealRef: data.dealRef !== undefined ? sanitizeString(data.dealRef, 200) : db.invoices[index].dealRef,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 1000) : db.invoices[index].notes,
    amount: baseAmount,
    totalAmount: isNaN(totalAmount) ? baseAmount : totalAmount,
    taxType: data.taxType !== undefined ? data.taxType : (db.invoices[index].taxType || 'none'),
    taxRate: data.taxRate !== undefined ? ((data.taxRate !== 'none' && data.taxRate !== '') ? Number(data.taxRate) : 0) : (db.invoices[index].taxRate ?? 0),
    items: data.items !== undefined ? (Array.isArray(data.items) ? data.items : db.invoices[index].items) : db.invoices[index].items,
    paymentDetails: data.paymentDetails !== undefined ? data.paymentDetails : db.invoices[index].paymentDetails,
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
