import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ twoFactorEnabled: false });

  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return NextResponse.json({
    twoFactorEnabled: !!user?.twoFactorEnabled
  });
}
