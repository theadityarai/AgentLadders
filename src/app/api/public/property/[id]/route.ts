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
    listingType: prop.listingType || 'For Sale',
    description: prop.description || 'Exclusive luxury residence presented with premium architectural design and exceptional finishes throughout.',
    images: (prop.images && prop.images.length > 0) ? prop.images : ['/images/property_hero.jpg', '/images/deal_closing.jpg', '/images/hero_dashboard.jpg'],
    features: (prop.features && prop.features.length > 0) ? prop.features : ['Private Pool', 'Smart Home System', 'Panoramic Views', 'Concierge 24/7', 'Valet Parking'],
    publicToken: prop.publicToken || prop.id,
    privacyMode: prop.privacyMode || 'Public',
    viewsCount: prop.viewsCount,
    agencyName: agency?.name || 'AgentLadders Premier Realty',
    agencyCountry: agency?.country || 'United States',
    agentName: prop.agentName || 'Aditya Rai',
    agentPhone: prop.agentPhone || '+1 (310) 849-2041',
    agentEmail: prop.agentEmail || 'aditya@agentladders.com'
  };

  return NextResponse.json({ property: publicData });
}
