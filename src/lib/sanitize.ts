import crypto from 'crypto';

/**
 * Security sanitization & validation utilities for AgentLadders.
 * Guards against XSS, script injection, payload bloat, and invalid inputs.
 */

/**
 * Strips script tags, HTML tags, and dangerous attributes/protocols.
 */
export function sanitizeString(val: unknown, maxLength: number = 2000): string {
  if (typeof val !== 'string') return '';
  
  // Truncate overly long strings to prevent memory exhaustion attacks
  let cleaned = val.slice(0, maxLength).trim();

  // Strip script, style, and iframe tags and their contents
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Strip dangerous javascript: and data: pseudo-protocols
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/vbscript:/gi, '');

  // Strip inline HTML event handlers (onerror, onload, onclick, etc.)
  cleaned = cleaned.replace(/\bon\w+\s*=/gi, '');

  // Strip HTML angle brackets from pure text fields
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  return cleaned.trim();
}

/**
 * Validates email structure.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim()) && email.length <= 254;
}

/**
 * Validates password complexity:
 * - At least 8 characters
 * - Contains at least one letter and one number
 */
export function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' };
  }
  // Allow 12+ numeric digits (e.g. randomly generated 12-digit PIN/passwords) or letter+number passwords
  if (/^\d{12,}$/.test(password)) {
    return { valid: true };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' };
  }
  return { valid: true };
}

/**
 * Generates a cryptographically secure random 12-digit numeric password.
 */
export function generateRandom12Digits(): string {
  let result = (crypto.randomInt(1, 10)).toString();
  for (let i = 1; i < 12; i++) {
    result += (crypto.randomInt(0, 10)).toString();
  }
  return result;
}

/**
 * Normalizes email address for consistent lookups.
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
]);

/**
 * Validates uploaded file MIME type to prevent arbitrary file upload or stored XSS attacks.
 */
export function isValidUploadedMime(fileDataOrMime: unknown): boolean {
  if (typeof fileDataOrMime !== 'string' || !fileDataOrMime.trim()) return false;
  
  // If it's a data URI (e.g. data:application/pdf;base64,...)
  const match = fileDataOrMime.match(/^data:([^;]+);base64,/i);
  if (match) {
    const mime = match[1].toLowerCase().trim();
    return ALLOWED_DOCUMENT_MIME_TYPES.has(mime);
  }

  // Pure MIME string
  return ALLOWED_DOCUMENT_MIME_TYPES.has(fileDataOrMime.toLowerCase().trim());
}

/**
 * Generates an array of cryptographically secure emergency 2FA backup codes.
 */
export function generateSecureBackupCodes(count: number = 5): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

/**
 * Generates a cryptographically secure random token (e.g. for public property links).
 */
export function generateSecureToken(byteLength: number = 16): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Generates a cryptographically secure unique ID with a specified prefix.
 */
export function generateSecureId(prefix: string = 'id_', byteLength: number = 6): string {
  return `${prefix}${crypto.randomBytes(byteLength).toString('hex')}`;
}

