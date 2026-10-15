export interface CountryCodeOption {
  code: string;
  country: string;
  label: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', country: 'IN', label: '+91 (India)', flag: '🇮🇳' },
  { code: '+1', country: 'US', label: '+1 (USA/Canada)', flag: '🇺🇸' },
  { code: '+971', country: 'AE', label: '+971 (UAE)', flag: '🇦🇪' },
  { code: '+44', country: 'GB', label: '+44 (UK)', flag: '🇬🇧' },
  { code: '+65', country: 'SG', label: '+65 (Singapore)', flag: '🇸🇬' },
  { code: '+61', country: 'AU', label: '+61 (Australia)', flag: '🇦🇺' },
  { code: '+966', country: 'SA', label: '+966 (Saudi Arabia)', flag: '🇸🇦' },
  { code: '+974', country: 'QA', label: '+974 (Qatar)', flag: '🇶🇦' },
  { code: '+49', country: 'DE', label: '+49 (Germany)', flag: '🇩🇪' },
  { code: '+33', country: 'FR', label: '+33 (France)', flag: '🇫🇷' },
  { code: '+81', country: 'JP', label: '+81 (Japan)', flag: '🇯🇵' },
  { code: '+86', country: 'CN', label: '+86 (China)', flag: '🇨🇳' },
  { code: '+27', country: 'ZA', label: '+27 (South Africa)', flag: '🇿🇦' },
  { code: '+234', country: 'NG', label: '+234 (Nigeria)', flag: '🇳🇬' }
];

/**
 * Extracts country code (default +91) and the 10-digit number from any raw phone string.
 */
export function extractCountryCodeAndPhone(input: string | null | undefined, defaultCode = '+91'): { countryCode: string; digits: string } {
  if (!input) return { countryCode: defaultCode, digits: '' };
  const str = input.trim();
  for (const c of COUNTRY_CODES) {
    if (str.startsWith(c.code)) {
      const rest = str.slice(c.code.length).trim();
      return { countryCode: c.code, digits: extract10DigitPhone(rest) };
    }
  }
  return { countryCode: defaultCode, digits: extract10DigitPhone(str) };
}

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
