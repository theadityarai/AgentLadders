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
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' };
  }
  return { valid: true };
}

/**
 * Normalizes email address for consistent lookups.
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}
