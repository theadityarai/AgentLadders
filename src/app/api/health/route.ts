import { NextResponse } from 'next/server';
import { isCloudDbActive, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'ok';
  let totalProperties = 0;
  let totalLeads = 0;

  try {
    const db = await getDb();
    totalProperties = db.properties?.length || 0;
    totalLeads = db.leads?.length || 0;
  } catch (err) {
    dbStatus = 'degraded';
    console.error('[Health Check] DB Read error:', err);
  }

  const latencyMs = Date.now() - startTime;
  const cloudDb = isCloudDbActive();

  return NextResponse.json(
    {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs,
      environment: process.env.NODE_ENV || 'production',
      cloudDatabase: cloudDb ? 'connected (upstash/redis)' : 'ephemeral (/tmp/json)',
      stats: {
        properties: totalProperties,
        inquiries: totalLeads
      }
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Health-Status': 'healthy'
      }
    }
  );
}
