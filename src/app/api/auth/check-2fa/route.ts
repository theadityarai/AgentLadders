import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/sanitize';

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rateLimitResult = checkRateLimit(`check_2fa_${ip}`, {
    limit: 60,
    windowMs: 15 * 60 * 1000 // 60 checks per 15 minutes per IP
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.resetSeconds.toString()
        }
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawEmail = searchParams.get('email');
  if (!rawEmail) return NextResponse.json({ twoFactorEnabled: false });

  const email = normalizeEmail(rawEmail);
  const db = await getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email);
  return NextResponse.json({
    twoFactorEnabled: !!user?.twoFactorEnabled
  });
}
