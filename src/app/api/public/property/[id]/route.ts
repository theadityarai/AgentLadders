import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  // Find property by ID or publicToken
  const prop = db.properties.find(p => p.id === id || p.publicToken === id);
  if (!prop) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // Check privacy mode
  if (prop.privacyMode === 'Private') {
    return NextResponse.json({ error: 'This property listing is currently private.' }, { status: 403 });
  }

  // Increment view counter
  prop.viewsCount = (prop.viewsCount || 0) + 1;
  saveDb(db);

  // Retrieve agency info for branding
  const agency = db.agencies.find(a => a.id === prop.agencyId);

  // Prepare public-safe representation (exclude owner details, private notes, tax IDs)
  const isRestricted = prop.privacyMode === 'Restricted';

  const publicData = {
    id: prop.id,
    title: prop.title,
    type: prop.type,
    location: prop.location,
    price: isRestricted ? null : prop.price,
    status: prop.status,
    bedrooms: prop.bedrooms || 4,
    bathrooms: prop.bathrooms || 3,
    areaSqFt: prop.areaSqFt || 3200,
    carpetAreaSqFt: prop.carpetAreaSqFt || (prop.areaSqFt ? Math.round(Number(prop.areaSqFt) * 0.8) : 2560),
    furnishing: prop.furnishing || 'Semi-Furnished',
    parking: prop.parking !== undefined ? prop.parking : 1,
    purpose: prop.purpose || prop.listingType || 'For Sale',
    listingType: prop.listingType || prop.purpose || 'For Sale',
    description: prop.description || 'Exclusive luxury residence presented with premium architectural design and exceptional finishes throughout.',
    images: (prop.images && prop.images.length > 0) ? prop.images : ['/images/property_hero.jpg', '/images/deal_closing.jpg', '/images/hero_dashboard.jpg'],
    media: prop.media || (prop.images ? prop.images.map((img: string, i: number) => ({
      id: 'm_' + i,
      url: img,
      tag: i === 0 ? 'Exterior / Facade' : (i === 1 ? 'Hall / Living Area' : 'Property Photo'),
      isCover: i === 0
    })) : []),
    videos: prop.videos || [],
    videoTourUrl: prop.videoTourUrl || '',
    virtualTourUrl: prop.virtualTourUrl || '',
    features: (prop.features && prop.features.length > 0) ? prop.features : ['Private Pool', 'Smart Home System', 'Panoramic Views', 'Concierge 24/7', 'Valet Parking'],
    publicToken: prop.publicToken || prop.id,
    privacyMode: prop.privacyMode || 'Public',
    viewsCount: prop.viewsCount,
    agencyName: agency?.name || 'AgentLadders Realty Network',
    agencyCountry: agency?.country || 'India',
    agentName: prop.agentName || 'Aditya Sharma',
    agentPhone: prop.agentPhone || agency?.phone || '+91 98200 98765',
    agentEmail: prop.agentEmail || 'aditya@agentladders.com',
    bhk: prop.bhk || (prop.bedrooms ? `${prop.bedrooms} BHK` : '3 BHK'),
    reraId: prop.reraId || prop.reraRegistrationNo || 'P51900015822 (RERA Registered)',
    facing: prop.facing || 'East Facing (Vastu Compliant)',
    possessionStatus: prop.possessionStatus || 'Ready to Move',
    city: prop.city || '',
    locality: prop.locality || ''
  };

  return NextResponse.json({ property: publicData });
}
