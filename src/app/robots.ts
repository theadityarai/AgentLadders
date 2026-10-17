import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agent-ladders.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup', '/forgot-password', '/p/', '/d/'],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/_next/',
          '/static/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/login', '/signup', '/forgot-password', '/p/', '/d/'],
        disallow: ['/dashboard/', '/admin/', '/api/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
