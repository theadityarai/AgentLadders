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
export function extractCountryCodeAndPhone(
  input: string | null | undefined, 
  defaultCode = '+91'
): { countryCode: string; digits: string } {
  if (!input) return { countryCode: defaultCode, digits: '' };
  const str = input.trim();

  // 1. Check if starts with a recognized '+' code (sort longest first e.g. +971 before +91)
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (str.startsWith(c.code)) {
      const rest = str.slice(c.code.length).trim();
      const cleaned = rest.replace(/\D/g, '').slice(0, 10);
      return { countryCode: c.code, digits: cleaned };
    }
  }

  // 2. If it starts with '+' followed by another custom country code (e.g. "+44 7911...")
  if (str.startsWith('+')) {
    const spaceIdx = str.indexOf(' ');
    if (spaceIdx > 1) {
      const customCode = str.slice(0, spaceIdx).trim();
      const rest = str.slice(spaceIdx).replace(/\D/g, '').slice(0, 10);
      return { countryCode: customCode, digits: rest };
    }
  }

  // 3. Check for standard 12-digit Indian number without '+' (e.g. 919820012345)
  const digitsOnly = str.replace(/\D/g, '');
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return { countryCode: '+91', digits: digitsOnly.slice(2) };
  }

  // 4. Check for 11-digit number with leading trunk 0 (e.g. 09820012345)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return { countryCode: defaultCode, digits: digitsOnly.slice(1) };
  }

  // 5. Default: treat whatever digits exist (up to 10) as the user's phone digits
  return { countryCode: defaultCode, digits: digitsOnly.slice(0, 10) };
}

/**
 * Extracts raw 10-digit mobile number by stripping non-digit characters,
 * leading international dial code (+91), or trunk prefix (0).
 */
export function extract10DigitPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const parsed = extractCountryCodeAndPhone(phone);
  return parsed.digits;
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
  const parsed = extractCountryCodeAndPhone(phone);
  if (parsed.digits.length !== 10) return String(phone);
  const formatted = `${parsed.digits.slice(0, 5)} ${parsed.digits.slice(5)}`;
  return includePrefix ? `${parsed.countryCode} ${formatted}` : formatted;
}

/**
 * Normalizes phone number into international WhatsApp E.164 format:
 * e.g., "919820045678"
 */
export function formatForWhatsApp(phone: string | null | undefined, countryCode = '91'): string {
  if (!phone) return '';
  const parsed = extractCountryCodeAndPhone(phone);
  const code = (parsed.countryCode ? parsed.countryCode.replace(/\D/g, '') : countryCode.replace(/\D/g, '')) || '91';
  return `${code}${parsed.digits}`;
}

/**
 * Email format validator
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
