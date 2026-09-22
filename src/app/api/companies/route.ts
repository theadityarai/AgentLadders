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

  if ((db.companies || []).filter(c => c.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyCompanies = (db.companies || []).filter(c => c.agencyId === user.agencyId);
  return NextResponse.json({ companies: agencyCompanies });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newCompany = {
    ...data,
    id: 'comp_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: data.name || 'New Company',
    industry: data.industry || 'Real Estate',
    website: data.website || '',
    contactPerson: data.contactPerson || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    taxId: data.taxId || '',
    createdAt: new Date().toISOString()
  };

  if (!db.companies) db.companies = [];
  db.companies.push(newCompany);
  saveDb(db);

  return NextResponse.json({ success: true, company: newCompany });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing company id' }, { status: 400 });

  if (!db.companies) db.companies = [];
  const index = db.companies.findIndex(c => c.id === data.id && c.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const updatedCompany = {
    ...db.companies[index],
    ...data,
    updatedAt: new Date().toISOString()
  };

  db.companies[index] = updatedCompany;
  saveDb(db);

  return NextResponse.json({ success: true, company: updatedCompany });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing company id' }, { status: 400 });

  if (db.companies) {
    db.companies = db.companies.filter(c => !(c.id === id && c.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
