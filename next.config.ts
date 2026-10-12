import type { NextConfig } from "next";

// Ensure NEXTAUTH_URL is never empty string or invalid during Vercel static build
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const resolvedAuthUrl = process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== ''
  ? process.env.NEXTAUTH_URL
  : (vercelUrl ? `https://${vercelUrl}` : 'https://agentladders.com');

process.env.NEXTAUTH_URL = resolvedAuthUrl;
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'super-secret-nextauth-key-12345';
}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  env: {
    NEXTAUTH_URL: resolvedAuthUrl,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'super-secret-nextauth-key-12345'
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
