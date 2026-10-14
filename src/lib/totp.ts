import crypto from 'crypto';

/**
 * Standard RFC 6238 Time-based One-Time Password (TOTP) engine.
 * Zero-dependency, cryptographically secure verification compatible with:
 * - Google Authenticator
 * - Microsoft Authenticator
 * - Apple Passwords / iOS Keychain
 * - Authy & 1Password
 */

/**
 * Decodes a Base32 string (RFC 4648) into a Buffer.
 * If the secret has hyphens or arbitrary characters (e.g. AGLD-7734-K821-X992),
 * it normalizes cleanly or falls back to a SHA-256 derived key.
 */
function secretToKeyBuffer(secret: string): Buffer {
  const cleaned = (secret || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  if (bytes.length >= 8) {
    return Buffer.from(bytes);
  }

  // Fallback for non-standard or arbitrary secret strings
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Computes the 6-digit TOTP code for a secret at a given counter step offset.
 *
 * @param secret - The base32 or plain text secret key
 * @param stepOffset - Relative time step offset (-1, 0, +1 for clock drift tolerance)
 * @param timeStepSec - Time step duration in seconds (default 30 per RFC 6238)
 */
export function generateTOTPCode(secret: string, stepOffset: number = 0, timeStepSec: number = 30): string {
  const key = secretToKeyBuffer(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStepSec) + stepOffset;

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  );

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifies a 6-digit TOTP token against a user's secret key.
 * Employs constant-time string comparison to prevent timing attack side-channels.
 *
 * @param token - The 6-digit code submitted by the user
 * @param secret - The user's stored 2FA secret
 * @param windowSteps - Number of steps before/after current step to allow (default 1 = +/- 30s)
 */
export function verifyTOTP(token: string, secret: string, windowSteps: number = 1): boolean {
  if (!token || typeof token !== 'string') return false;
  const cleanToken = token.trim().replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const tokenBuf = Buffer.from(cleanToken, 'utf8');

  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const expected = generateTOTPCode(secret, offset);
    const expectedBuf = Buffer.from(expected, 'utf8');
    if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      return true;
    }
  }

  return false;
}
