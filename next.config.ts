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
  env: {
    NEXTAUTH_URL: resolvedAuthUrl,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'super-secret-nextauth-key-12345'
  }
};

export default nextConfig;
