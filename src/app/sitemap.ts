import type { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agent-ladders.vercel.app';
  const now = new Date();

  // Core public marketing and authentication routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamic public property listings
  try {
    const db = await getDb();
    const publicProperties: MetadataRoute.Sitemap = (db.properties || [])
      .filter(p => p.privacyMode !== 'Private' && (p.isPublic !== false))
      .map(p => ({
        url: `${baseUrl}/p/${p.publicToken || p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.9,
      }));

    return [...staticRoutes, ...publicProperties];
  } catch {
    return staticRoutes;
  }
}
