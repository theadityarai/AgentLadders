import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '@/lib/db';
import { normalizeEmail, isValidPassword } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`reset_pw_${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: `Too many password reset attempts. Please wait ${limitCheck.resetSeconds}s before trying again.`
      }, { status: 429 });
    }

    const { token, email, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Token, email, and new password are required.' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    const passCheck = isValidPassword(password);
    if (!passCheck.valid) {
      return NextResponse.json({ error: passCheck.reason }, { status: 400 });
    }

    const db = await getDb();
    const user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset link.' }, { status: 400 });
    }

    const savedToken = (user as any).resetPasswordToken;
    const expiresAt = (user as any).resetPasswordExpires;

    if (!savedToken || savedToken !== token) {
      return NextResponse.json({ error: 'Invalid or forged password reset token. Please request a new link.' }, { status: 400 });
    }

    if (!expiresAt || Number(expiresAt) < Date.now()) {
      return NextResponse.json({ error: 'This password reset link has expired (valid for 60 minutes). Please request a new one.' }, { status: 400 });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordHash = hashedPassword;

    delete (user as any).resetPasswordToken;
    delete (user as any).resetPasswordExpires;

    await saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new credentials.'
    });
  } catch (err: any) {
    console.error('Error in reset-password API:', err);
    return NextResponse.json({ error: 'Internal server error resetting password.' }, { status: 500 });
  }
}
