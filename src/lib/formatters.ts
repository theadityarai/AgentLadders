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

export const VASTU_FACINGS = DEFAULT_VASTU_FACINGS;
export const POSSESSION_STAGES = DEFAULT_CONSTRUCTION_STAGES;

