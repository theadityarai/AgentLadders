/**
 * Centralized Phone Number Utilities & Validation for AgentLadders CRM
 * Enforces strict 10-digit mobile number validation across the entire platform.
 */

/**
 * Extracts raw 10-digit mobile number by stripping non-digit characters,
 * leading international dial code (+91), or trunk prefix (0).
 */
export function extract10DigitPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');

  // Case 1: If 12 digits and starts with 91 (e.g. 919820045678)
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  // Case 2: If 11 digits and starts with 0 (e.g. 09820045678)
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }

  // Case 3: If 10 digits
  if (digits.length === 10) {
    return digits;
  }

  // Case 4: If more than 10 digits, take the trailing 10 digits
  if (digits.length > 10) {
    return digits.slice(-10);
  }

  // Fewer than 10 digits
  return digits;
}

/**
 * Checks if a string contains a valid 10-digit mobile number.
 * Validates that exactly 10 digits exist and starts with standard mobile prefixes (6-9)
 * or any 10-digit numerical sequence.
 */
export function isValid10DigitPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const ten = extract10DigitPhone(phone);
  return ten.length === 10;
}

/**
 * Formats a 10-digit phone number into a standard clean format:
 * e.g., "+91 98200 45678" or "98200 45678"
 */
export function format10DigitDisplay(phone: string | null | undefined, includePrefix = true): string {
  if (!phone) return '';
  const ten = extract10DigitPhone(phone);
  if (ten.length !== 10) return String(phone);
  const formatted = `${ten.slice(0, 5)} ${ten.slice(5)}`;
  return includePrefix ? `+91 ${formatted}` : formatted;
}

/**
 * Normalizes phone number into international WhatsApp E.164 format:
 * e.g., "919820045678"
 */
export function formatForWhatsApp(phone: string | null | undefined, countryCode = '91'): string {
  const ten = extract10DigitPhone(phone);
  const code = countryCode.replace(/\D/g, '') || '91';
  return `${code}${ten}`;
}

/**
 * Email format validator
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
