import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { formatINR } from '@/lib/formatters';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = await getDb();
  const prop = db.properties.find(p => p.id === id || p.publicToken === id);

  if (!prop || prop.privacyMode === 'Private') {
    return {
      title: 'Property Listing | AgentLadders',
      description: 'Exclusive real estate listing on AgentLadders.',
    };
  }

  const bhk = prop.bhk || (prop.bedrooms ? `${prop.bedrooms} BHK` : 'Luxury Property');
  const location = prop.locality ? `${prop.locality}, ${prop.city || 'Mumbai'}` : (prop.location || 'Prime Location');
  const priceText = prop.price ? formatINR(prop.price) : 'Price on Request';
  const purpose = prop.purpose || prop.listingType || 'For Sale';
  const title = `${prop.title} - ${bhk} in ${location} | ${priceText}`;
  const description = `${bhk} ${prop.type || 'Residence'} (${purpose}) in ${location}. Quoting ${priceText}. View high-resolution gallery, floor plans & specifications on AgentLadders.`;

  // Determine primary image
  let imageUrl = '';
  if (prop.image && typeof prop.image === 'string' && prop.image.trim()) {
    imageUrl = prop.image.trim();
  } else if (Array.isArray(prop.images) && prop.images.length > 0 && typeof prop.images[0] === 'string' && prop.images[0].trim()) {
    imageUrl = prop.images[0].trim();
  } else if (Array.isArray(prop.media) && prop.media.length > 0) {
    const cover = prop.media.find(m => m.isCover && m.url) || prop.media.find(m => m.url);
    if (cover?.url) imageUrl = cover.url.trim();
  }

  if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80';
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://agentladders.com';
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  const canonicalUrl = `${baseUrl}/p/${prop.publicToken || prop.id}`;

  return {
    title,
    description,
    openGraph: {
      title: `${prop.title} | ${priceText}`,
      description,
      url: canonicalUrl,
      siteName: 'AgentLadders Real Estate Platform',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: prop.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${prop.title} | ${priceText}`,
      description,
      images: [absoluteImageUrl],
    },
  };
}

export default function PublicPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
