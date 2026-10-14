import type { NextConfig } from "next";
import crypto from "crypto";

// Ensure NEXTAUTH_URL is never empty string or invalid during Vercel static build
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const resolvedAuthUrl = process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== ''
  ? process.env.NEXTAUTH_URL
  : (vercelUrl ? `https://${vercelUrl}` : 'https://agentladders.com');

process.env.NEXTAUTH_URL = resolvedAuthUrl;
if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ WARNING: NEXTAUTH_SECRET not set in environment. Generating dynamic fallback secret.');
    process.env.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('hex');
  } else {
    process.env.NEXTAUTH_SECRET = 'super-secret-nextauth-key-12345';
  }
}

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
              "frame-src 'self' https://www.youtube.com https://my.matterport.com",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;

