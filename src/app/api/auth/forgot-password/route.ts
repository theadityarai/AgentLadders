import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, saveDb } from '@/lib/db';
import { normalizeEmail, isValidEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`forgot_pw_${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: `Too many password reset requests from this network. Please wait ${limitCheck.resetSeconds}s before trying again.`
      }, { status: 429 });
    }

    const body = await req.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'Please enter your registered email address.' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(rawEmail);
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address (e.g. name@agency.com).' }, { status: 400 });
    }

    const db = await getDb();
    const user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json({
        error: 'This email is not registered in our system. Please check your spelling or sign up for a new account.'
      }, { status: 404 });
    }

    // Generate secure reset token with 1 hour expiration
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    (user as any).resetPasswordToken = resetToken;
    (user as any).resetPasswordExpires = resetTokenExpiry;

    await saveDb(db);

    const resetLink = `/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    return NextResponse.json({
      success: true,
      message: `A password reset link has been generated and dispatched to ${user.email}.`,
      email: user.email,
      resetLink,
      token: resetToken
    });
  } catch (err: any) {
    console.error('Error in forgot-password API:', err);
    return NextResponse.json({ error: 'Internal server error processing reset request.' }, { status: 500 });
  }
}
