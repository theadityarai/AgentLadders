import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { canMutateCRMRecords } from '@/lib/rbac';
import { sanitizeString } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.companies || []).filter(c => c.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyCompanies = (db.companies || []).filter(c => c.agencyId === user.agencyId);
  return NextResponse.json({ companies: agencyCompanies });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to create companies.' }, { status: 403 });
  }

  const data = await req.json();
  const newCompany = {
    ...data,
    id: 'comp_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: sanitizeString(data.name || 'New Company', 120),
    industry: sanitizeString(data.industry || 'Real Estate', 100),
    website: sanitizeString(data.website || '', 200),
    contactPerson: sanitizeString(data.contactPerson || '', 100),
    phone: sanitizeString(data.phone || '', 30),
    email: sanitizeString(data.email || '', 100),
    address: sanitizeString(data.address || '', 300),
    taxId: sanitizeString(data.taxId || '', 50),
    createdAt: new Date().toISOString()
  };

  if (!db.companies) db.companies = [];
  db.companies.push(newCompany);
  await saveDb(db);

  return NextResponse.json({ success: true, company: newCompany });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify companies.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing company id' }, { status: 400 });

  if (!db.companies) db.companies = [];
  const index = db.companies.findIndex(c => c.id === data.id && c.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const updatedCompany = {
    ...db.companies[index],
    ...data,
    id: db.companies[index].id, // IMMUTABLE
    agencyId: db.companies[index].agencyId, // IMMUTABLE: tenant isolation
    name: data.name !== undefined ? sanitizeString(data.name, 120) : db.companies[index].name,
    industry: data.industry !== undefined ? sanitizeString(data.industry, 100) : db.companies[index].industry,
    website: data.website !== undefined ? sanitizeString(data.website, 200) : db.companies[index].website,
    contactPerson: data.contactPerson !== undefined ? sanitizeString(data.contactPerson, 100) : db.companies[index].contactPerson,
    phone: data.phone !== undefined ? sanitizeString(data.phone, 30) : db.companies[index].phone,
    email: data.email !== undefined ? sanitizeString(data.email, 100) : db.companies[index].email,
    address: data.address !== undefined ? sanitizeString(data.address, 300) : db.companies[index].address,
    taxId: data.taxId !== undefined ? sanitizeString(data.taxId, 50) : db.companies[index].taxId,
    updatedAt: new Date().toISOString()
  };

  db.companies[index] = updatedCompany;
  await saveDb(db);

  return NextResponse.json({ success: true, company: updatedCompany });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete companies.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing company id' }, { status: 400 });

  if (db.companies) {
    db.companies = db.companies.filter(c => !(c.id === id && c.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
