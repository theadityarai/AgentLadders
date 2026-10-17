import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';
import { canMutateCRMRecords } from '@/lib/rbac';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.properties || []).filter(p => p.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyProperties = (db.properties || []).filter(p => p.agencyId === user.agencyId);
  let dbUpdated = false;
  agencyProperties.forEach(p => {
    if (!p.publicToken) {
      p.publicToken = 'tok_' + p.id.replace(/[^a-zA-Z0-9]/g, '');
      dbUpdated = true;
    }
  });
  if (dbUpdated) {
    await saveDb(db);
  }

  return NextResponse.json({ properties: agencyProperties });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only agents do not have permission to add properties.' }, { status: 403 });
  }

  const data = await req.json();

  if (!data.title || !data.title.trim()) {
    return NextResponse.json({ error: 'Property title / project name is required.' }, { status: 400 });
  }
  const parsedPrice = parseFloat(data.price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return NextResponse.json({ error: 'Valid property price greater than ₹0 is required.' }, { status: 400 });
  }
  if (!data.status || !data.status.trim()) {
    return NextResponse.json({ error: 'Property listing status is required.' }, { status: 400 });
  }

  const propId = 'prop_' + Math.random().toString(36).substring(2, 10);
  const newProperty = {
    ...data,
    id: propId,
    publicToken: data.publicToken || ('tok_' + Math.random().toString(36).substring(2, 10)),
    agencyId: user.agencyId,
    title: sanitizeString(data.title || 'New Property', 200),
    type: sanitizeString(data.type || 'Apartment', 100),
    purpose: sanitizeString(data.purpose || data.listingType || 'For Sale', 50),
    location: sanitizeString(data.location || 'City Center', 200),
    price: Math.max(0, parseFloat(data.price) || 0),
    status: sanitizeString(data.status || 'Available', 50),
    bedrooms: Math.max(0, parseInt(data.bedrooms) || 3),
    bathrooms: Math.max(0, parseInt(data.bathrooms) || 2),
    areaSqFt: Math.max(0, parseInt(data.areaSqFt) || 1800),
    carpetAreaSqFt: Math.max(0, parseInt(data.carpetAreaSqFt) || (data.areaSqFt ? Math.round(parseInt(data.areaSqFt) * 0.8) : 1440)),
    furnishing: sanitizeString(data.furnishing || 'Semi-Furnished', 100),
    parking: sanitizeString(String(data.parking !== undefined ? data.parking : '1 Covered Car Park'), 100),
    vastuFacing: sanitizeString(data.vastuFacing || 'East Facing (Vastu Compliant)', 100),
    possessionStatus: sanitizeString(data.possessionStatus || 'Ready to Move (OC Received)', 100),
    amenities: Array.isArray(data.amenities) ? data.amenities.map((a: any) => sanitizeString(String(a), 100)) : ['24/7 Security', 'Balcony', 'Elevator'],
    listingType: sanitizeString(data.listingType || data.purpose || 'For Sale', 50),
    sellerName: sanitizeString(data.sellerName || data.ownerName || '', 100),
    sellerPhone: sanitizeString(data.sellerPhone || '', 30),
    keyLocationNotes: sanitizeString(data.keyLocationNotes || '', 500),
    ownerName: sanitizeString(data.ownerName || data.sellerName || '', 100),
    description: sanitizeString(data.description || '', 2000),
    media: data.media || (data.images ? data.images.map((img: string, i: number) => ({
      id: 'm_' + Math.random().toString(36).substring(2, 8),
      url: img,
      tag: i === 0 ? 'Exterior / Facade' : (i === 1 ? 'Hall / Living Area' : 'Property Photo'),
      isCover: i === 0
    })) : []),
    images: (data.media && data.media.length > 0) 
      ? data.media.map((m: any) => m.url) 
      : (data.images && data.images.length > 0 ? data.images : ['/images/property_hero.jpg']),
    videos: data.videos || [],
    videoTourUrl: data.videoTourUrl || '',
    virtualTourUrl: data.virtualTourUrl || '',
    createdAt: new Date().toISOString()
  };

  if (!db.properties) db.properties = [];
  db.properties.push(newProperty);
  await saveDb(db);

  return NextResponse.json({ success: true, property: newProperty });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only agents do not have permission to edit properties.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing property id' }, { status: 400 });

  if (!db.properties) db.properties = [];
  const index = db.properties.findIndex(p => p.id === data.id && p.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  const updatedProperty = {
    ...db.properties[index],
    ...data,
    id: db.properties[index].id, // IMMUTABLE
    agencyId: db.properties[index].agencyId, // IMMUTABLE: cross-tenant isolation
    title: data.title !== undefined ? sanitizeString(data.title, 200) : db.properties[index].title,
    location: data.location !== undefined ? sanitizeString(data.location, 200) : db.properties[index].location,
    description: data.description !== undefined ? sanitizeString(data.description, 2000) : db.properties[index].description,
    price: data.price !== undefined ? parseFloat(data.price) || 0 : db.properties[index].price,
    bedrooms: data.bedrooms !== undefined ? parseInt(data.bedrooms) || 0 : db.properties[index].bedrooms,
    bathrooms: data.bathrooms !== undefined ? parseInt(data.bathrooms) || 0 : db.properties[index].bathrooms,
    areaSqFt: data.areaSqFt !== undefined ? parseInt(data.areaSqFt) || 0 : db.properties[index].areaSqFt,
    media: data.media !== undefined ? data.media : db.properties[index].media,
    images: data.images !== undefined 
      ? data.images 
      : (data.media ? data.media.map((m: any) => m.url) : db.properties[index].images),
    videos: data.videos !== undefined ? data.videos : db.properties[index].videos,
    videoTourUrl: data.videoTourUrl !== undefined ? data.videoTourUrl : db.properties[index].videoTourUrl,
    virtualTourUrl: data.virtualTourUrl !== undefined ? data.virtualTourUrl : db.properties[index].virtualTourUrl,
    updatedAt: new Date().toISOString()
  };

  db.properties[index] = updatedProperty;
  await saveDb(db);

  return NextResponse.json({ success: true, property: updatedProperty });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only agents do not have permission to delete properties.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing property id' }, { status: 400 });

  if (db.properties) {
    db.properties = db.properties.filter(p => !(p.id === id && p.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}
