/**
 * Indian Real Estate Formatting & Currency Utilities
 * Formats numbers into Lakhs (L) and Crores (Cr) according to Indian numbering standards.
 */

export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  if (num >= 10000000) {
    // 1 Crore = 10,000,000
    const cr = num / 10000000;
    // e.g. 1.5 Cr or 1.25 Cr
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr`;
  } else if (num >= 100000) {
    // 1 Lakh = 100,000
    const lakh = num / 100000;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Lakh`;
  } else {
    // Under 1 Lakh (e.g. monthly rent)
    return `₹${num.toLocaleString('en-IN')}`;
  }
}

export function formatINRAmountOnly(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  if (num >= 10000000) {
    const cr = num / 10000000;
    return `${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  } else if (num >= 100000) {
    const lakh = num / 100000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, '')} L`;
  } else {
    return num.toLocaleString('en-IN');
  }
}

export function parseINRToNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;

  const cleaned = val.trim().toLowerCase().replace(/,/g, '').replace(/₹/g, '');
  if (cleaned.includes('cr') || cleaned.includes('crore')) {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  } else if (cleaned.includes('l') || cleaned.includes('lakh')) {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : Math.round(num * 100000);
  } else {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : Math.round(num);
  }
}

export const TOP_INDIAN_CITIES = [
  'Mumbai',
  'Gurgaon (Delhi NCR)',
  'Noida (Delhi NCR)',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'South Delhi',
  'Ahmedabad',
  'Kolkata',
  'Chennai'
];

export const CITY_LOCALITIES: Record<string, string[]> = {
  'Mumbai': ['Bandra West', 'Worli', 'Juhu', 'Andheri West', 'Powai', 'Lower Parel', 'Khar West', 'Santacruz', 'Thane West', 'Navi Mumbai'],
  'Gurgaon (Delhi NCR)': ['Golf Course Road', 'Golf Course Ext Road', 'DLF Phase 5', 'Cyber City', 'Sohna Road', 'Sector 54', 'Sector 48', 'Sector 65'],
  'Noida (Delhi NCR)': ['Sector 150', 'Sector 128', 'Sector 62', 'Sector 137', 'Noida Expressway', 'Greater Noida West'],
  'Bengaluru': ['Indiranagar', 'Koramangala', 'Whitefield', 'Sarjapur Road', 'HSR Layout', 'Hebbal', 'Lavelle Road', 'Bellandur'],
  'Pune': ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Aundh', 'Wakad', 'Kharadi'],
  'Hyderabad': ['Hitec City', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Kondapur', 'Kokapet', 'Financial District'],
  'South Delhi': ['Greater Kailash', 'Vasant Vihar', 'Def Col', 'Hauz Khas', 'Panchsheel Park', 'New Friends Colony']
};

export const INDIAN_BHK_OPTIONS = [
  '1 RK',
  '1 BHK',
  '2 BHK',
  '2.5 BHK',
  '3 BHK',
  '3.5 BHK',
  '4 BHK',
  '4.5+ BHK / Penthouse',
  'Builder Floor',
  'Independent Villa / Bungalow',
  'Residential Plot',
  'Commercial Bare Shell',
  'Commercial Furnished Office',
  'Retail Shop / Showroom'
];

export const VASTU_FACINGS = [
  'East Facing (Vastu Compliant)',
  'North Facing (Vastu Compliant)',
  'North-East / Ishanya (Highly Auspicious)',
  'West Facing',
  'South Facing',
  'South-East Facing',
  'Not Applicable'
];

export const POSSESSION_STAGES = [
  'Ready to Move (OC Received)',
  'Under Construction (Possession in 3-6 Months)',
  'Under Construction (Possession in 1-2 Years)',
  'Newly Launched / Booking Open',
  'Pre-Launch'
];
