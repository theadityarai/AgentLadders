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

/** 
 * Formats number as exact actual Indian currency without abbreviations (no Lakh/Cr).
 * e.g. 999999 -> ₹9,99,999, 29999.97 -> ₹29,999.97, 10000000 -> ₹1,00,00,000
 */
export function formatActualINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  const hasDecimals = num % 1 !== 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

/** Formats number as full standard Indian currency with 2 decimals, e.g. ₹11,80,000.00 */
export function formatINRFull(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Converts number to words in Indian Rupees (e.g. INR Eleven Lakh Eighty Thousand Only) */
export function numberToIndianWords(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return 'Zero Rupees Only';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tenDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return teenDigits[n - 10];
    const ten = Math.floor(n / 10);
    const rem = n % 10;
    return `${tenDigits[ten]}${rem ? ' ' + singleDigits[rem] : ''}`.trim();
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (hundred > 0) {
      res += `${singleDigits[hundred]} Hundred`;
      if (rem > 0) res += ' ';
    }
    if (rem > 0) {
      res += convertTwoDigits(rem);
    }
    return res.trim();
  }

  let integerPart = Math.floor(num);
  let words = '';

  const crore = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;

  const lakh = Math.floor(integerPart / 100000);
  integerPart %= 100000;

  const thousand = Math.floor(integerPart / 1000);
  integerPart %= 1000;

  const remaining = integerPart;

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `;
  }
  if (remaining > 0) {
    words += `${convertThreeDigits(remaining)} `;
  }

  const paise = Math.round((num - Math.floor(num)) * 100);
  let paiseWords = '';
  if (paise > 0) {
    paiseWords = ` and ${convertTwoDigits(paise)} Paise`;
  }

  const mainWords = words.trim() || 'Zero';
  return `INR ${mainWords}${paiseWords} Only`;
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

export const DEFAULT_BHK_OPTIONS = [
  '1 RK',
  '1 BHK',
  '1.5 BHK',
  '2 BHK',
  '2.5 BHK',
  '3 BHK',
  '3.5 BHK',
  '4 BHK',
  '5+ BHK',
  'Duplex',
  'Penthouse',
  'Plot / Land',
  'Commercial Bare Shell',
  'Furnished Office'
];

export const DEFAULT_PROPERTY_TYPES = [
  'Apartment',
  'Villa / Bungalow',
  'Independent Floor',
  'Penthouse',
  'Studio Apartment',
  'Row House / Duplex',
  'Plot / Land',
  'Commercial Office',
  'Retail Shop / Showroom',
  'Farmhouse / Estate'
];

export const DEFAULT_LEAD_SOURCES = [
  'Direct',
  'Website',
  'Referral',
  'Listing Websites'
];

export const DEFAULT_PROPERTY_SPECS = [
  'Unfurnished',
  'Semi-Furnished',
  'Fully Furnished',
  'Bare Shell (Commercial / Penthouse)',
  'Warm Shell (With Flooring & AC)',
  'Luxury Designer Furnished'
];

export const DEFAULT_CONSTRUCTION_STAGES = [
  'Ready to Move (OC Received)',
  'Under Construction (Possession in 3-6 Months)',
  'Under Construction (Possession in 1-2 Years)',
  'Newly Launched / Booking Open',
  'Pre-Launch / Expression of Interest'
];

export const DEFAULT_VASTU_FACINGS = [
  'East Facing (Vastu Compliant)',
  'North Facing (Vastu Compliant)',
  'North-East / Ishanya (Highly Auspicious)',
  'North-West Facing',
  'West Facing',
  'South-East Facing',
  'South Facing',
  'Not Applicable'
];

export const DEFAULT_DEAL_STAGES = [
  'Negotiation',
  'Token Received',
  'Agreement Drafted',
  'Registration Pending',
  'Closed Won',
  'Lost'
];

export const DEFAULT_PARKING_OPTIONS = [
  '1 Covered Car Park',
  '2 Covered Car Parks',
  '3+ Covered Car Parks',
  '1 Open Car Park',
  '2 Open Car Parks',
  'Stilt Parking',
  'No Dedicated Parking',
  'Multi-Level Covered'
];

export const DEFAULT_PROPERTY_STATUSES = [
  'Available',
  'Under Offer',
  'Under Negotiation',
  'Sold',
  'Rented',
  'Off Market'
];

export const DEFAULT_LEAD_STATUSES = [
  'New Inbound',
  'Contacted',
  'Qualified',
  'Site Visit Scheduled',
  'Negotiation',
  'Won',
  'Lost',
  'Dead'
];

export const DEFAULT_SITE_VISIT_STATUSES = [
  'Scheduled',
  'Confirmed',
  'Completed',
  'Rescheduled',
  'Cancelled',
  'No Show'
];

export const DEFAULT_TASK_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Overdue',
  'Cancelled'
];

export const DEFAULT_CLIENT_STATUSES = [
  'Active Search',
  'In Contract',
  'Closed Client',
  'Past Client',
  'Inactive'
];

export const DEFAULT_INVOICE_STATUSES = [
  'Draft',
  'Pending',
  'Partially Paid',
  'Paid',
  'Overdue',
  'Cancelled'
];

export const DEFAULT_PAYMENT_STATUSES = [
  'Completed',
  'Pending Clearance',
  'Processing',
  'Failed',
  'Refunded'
];

export const VASTU_FACINGS = DEFAULT_VASTU_FACINGS;
export const POSSESSION_STAGES = DEFAULT_CONSTRUCTION_STAGES;

export interface AgencyInvoiceSettings {
  agencyName: string;
  tagline?: string;
  gstin?: string;
  reraReg?: string;
  address?: string;
  phone?: string;
  email?: string;
  pan?: string;
  accountName: string;
  bankName: string;
  accountType?: 'Current' | 'Savings' | string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  placeOfSupply?: string;
  sacCode?: string;
  defaultNotes?: string;
  enableGstTaxation?: boolean;
}

export const DEFAULT_INVOICE_SETTINGS: AgencyInvoiceSettings = {
  agencyName: 'Vance Luxury Realty',
  tagline: 'Licensed Real Estate Advisory & Brokerage Firm',
  gstin: '27AABCA1234F1Z5',
  reraReg: 'A51800029384',
  address: 'Level 14, Tower 2, One World Center, Lower Parel, Mumbai, Maharashtra 400013',
  phone: '+91 98201 23456',
  email: 'accounts@vancerealty.com',
  pan: 'AABCA1234F',
  accountName: 'Vance Luxury Realty Escrow Advisory',
  bankName: 'HDFC Bank Ltd',
  accountType: 'Current',
  accountNumber: '50200088921102',
  ifscCode: 'HDFC0000128',
  upiId: 'agency.realty@hdfcbank',
  placeOfSupply: 'Maharashtra (27)',
  sacCode: '997221',
  defaultNotes: '',
  enableGstTaxation: false
};

