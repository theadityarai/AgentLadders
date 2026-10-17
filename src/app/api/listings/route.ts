import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canMutateCRMRecords } from '@/lib/rbac';
import { sanitizeString, generateSecureId } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.listings || []).filter(l => l.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyListings = (db.listings || []).filter(l => l.agencyId === user.agencyId);
  return NextResponse.json({ listings: agencyListings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to create listings.' }, { status: 403 });
  }

  const data = await req.json();
  const newListing = {
    ...data,
    id: generateSecureId('list_'),
    agencyId: user.agencyId,
    title: sanitizeString(data.title || 'New Listing', 150),
    platform: sanitizeString(data.platform || 'Property Finder', 80),
    status: sanitizeString(data.status || 'Active', 50),
    views: parseInt(data.views) || 0,
    price: parseFloat(data.price) || 0,
    externalUrl: sanitizeString(data.externalUrl || '', 300),
    featured: Boolean(data.featured),
    expiryDate: sanitizeString(data.expiryDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 50),
    createdAt: new Date().toISOString()
  };

  if (!db.listings) db.listings = [];
  db.listings.push(newListing);
  await saveDb(db);

  return NextResponse.json({ success: true, listing: newListing });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify listings.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });

  if (!db.listings) db.listings = [];
  const index = db.listings.findIndex(l => l.id === data.id && l.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  const updatedListing = {
    ...db.listings[index],
    ...data,
    id: db.listings[index].id, // IMMUTABLE
    agencyId: db.listings[index].agencyId, // IMMUTABLE: tenant isolation
    title: data.title !== undefined ? sanitizeString(data.title, 150) : db.listings[index].title,
    platform: data.platform !== undefined ? sanitizeString(data.platform, 80) : db.listings[index].platform,
    status: data.status !== undefined ? sanitizeString(data.status, 50) : db.listings[index].status,
    externalUrl: data.externalUrl !== undefined ? sanitizeString(data.externalUrl, 300) : db.listings[index].externalUrl,
    price: data.price !== undefined ? parseFloat(data.price) || 0 : db.listings[index].price,
    views: data.views !== undefined ? parseInt(data.views) || 0 : db.listings[index].views,
    updatedAt: new Date().toISOString()
  };

  db.listings[index] = updatedListing;
  await saveDb(db);

  return NextResponse.json({ success: true, listing: updatedListing });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete listings.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });

  if (db.listings) {
    db.listings = db.listings.filter(l => !(l.id === id && l.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}

