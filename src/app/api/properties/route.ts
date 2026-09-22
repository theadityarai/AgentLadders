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

  if ((db.properties || []).filter(p => p.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyProperties = (db.properties || []).filter(p => p.agencyId === user.agencyId);
  return NextResponse.json({ properties: agencyProperties });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newProperty = {
    ...data,
    id: 'prop_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: data.title || 'New Property',
    type: data.type || 'Apartment',
    location: data.location || 'City Center',
    price: parseFloat(data.price) || 0,
    status: data.status || 'Available',
    bedrooms: parseInt(data.bedrooms) || 3,
    bathrooms: parseInt(data.bathrooms) || 2,
    areaSqFt: parseInt(data.areaSqFt) || 1800,
    listingType: data.listingType || 'For Sale',
    ownerName: data.ownerName || '',
    description: data.description || '',
    createdAt: new Date().toISOString()
  };

  if (!db.properties) db.properties = [];
  db.properties.push(newProperty);
  saveDb(db);

  return NextResponse.json({ success: true, property: newProperty });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing property id' }, { status: 400 });

  if (!db.properties) db.properties = [];
  const index = db.properties.findIndex(p => p.id === data.id && p.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  const updatedProperty = {
    ...db.properties[index],
    ...data,
    price: data.price !== undefined ? parseFloat(data.price) || 0 : db.properties[index].price,
    bedrooms: data.bedrooms !== undefined ? parseInt(data.bedrooms) || 0 : db.properties[index].bedrooms,
    bathrooms: data.bathrooms !== undefined ? parseInt(data.bathrooms) || 0 : db.properties[index].bathrooms,
    areaSqFt: data.areaSqFt !== undefined ? parseInt(data.areaSqFt) || 0 : db.properties[index].areaSqFt,
    updatedAt: new Date().toISOString()
  };

  db.properties[index] = updatedProperty;
  saveDb(db);

  return NextResponse.json({ success: true, property: updatedProperty });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing property id' }, { status: 400 });

  if (db.properties) {
    db.properties = db.properties.filter(p => !(p.id === id && p.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
