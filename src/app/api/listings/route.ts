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

  if ((db.listings || []).filter(l => l.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyListings = (db.listings || []).filter(l => l.agencyId === user.agencyId);
  return NextResponse.json({ listings: agencyListings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newListing = {
    ...data,
    id: 'list_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: data.title || 'New Listing',
    platform: data.platform || 'Property Finder',
    status: data.status || 'Active',
    views: parseInt(data.views) || 0,
    price: parseFloat(data.price) || 0,
    externalUrl: data.externalUrl || '',
    featured: Boolean(data.featured),
    expiryDate: data.expiryDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  if (!db.listings) db.listings = [];
  db.listings.push(newListing);
  saveDb(db);

  return NextResponse.json({ success: true, listing: newListing });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });

  if (!db.listings) db.listings = [];
  const index = db.listings.findIndex(l => l.id === data.id && l.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  const updatedListing = {
    ...db.listings[index],
    ...data,
    price: data.price !== undefined ? parseFloat(data.price) || 0 : db.listings[index].price,
    views: data.views !== undefined ? parseInt(data.views) || 0 : db.listings[index].views,
    updatedAt: new Date().toISOString()
  };

  db.listings[index] = updatedListing;
  saveDb(db);

  return NextResponse.json({ success: true, listing: updatedListing });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });

  if (db.listings) {
    db.listings = db.listings.filter(l => !(l.id === id && l.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
