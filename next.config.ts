import type { NextConfig } from "next";

// Ensure NEXTAUTH_URL is never empty string or invalid during Vercel static build
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const resolvedAuthUrl = process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== ''
  ? process.env.NEXTAUTH_URL
  : (vercelUrl ? (vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`) : 'https://agent-ladders.vercel.app');

const FALLBACK_SECRET = 'agentladders-secret-production-key-998877665544332211';
const resolvedSecret = process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim() !== ''
  ? process.env.NEXTAUTH_SECRET
  : FALLBACK_SECRET;

process.env.NEXTAUTH_URL = resolvedAuthUrl;
process.env.NEXTAUTH_SECRET = resolvedSecret;

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatar.vercel.sh' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ]
  },
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  env: {
    NEXTAUTH_URL: resolvedAuthUrl,
    NEXTAUTH_SECRET: resolvedSecret,
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
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com https://avatar.vercel.sh https://api.qrserver.com https://via.placeholder.com",
              "connect-src 'self' https://api.qrserver.com",
              "frame-src 'self' blob: data: https://www.youtube.com https://my.matterport.com",
              "object-src 'self' blob: data:",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;

