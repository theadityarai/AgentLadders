import { formatINR } from './formatters';

export interface PropertyMatchResult {
  propertyId: string;
  propertyTitle: string;
  bhk: string;
  locality: string;
  city: string;
  price: number;
  priceFormatted: string;
  carpetAreaSqFt: number;
  matchScore: number;
  matchReasons: string[];
  coverUrl: string;
  publicToken: string;
}

export interface LeadMatchResult {
  leadId: string;
  leadName: string;
  leadPhone: string;
  bhkNeeded: string;
  budgetFormatted: string;
  urgency: string;
  fundingStatus: string;
  matchScore: number;
  matchReasons: string[];
}

export function findMatchingPropertiesForLead(
  lead: {
    id: string;
    leadPurpose?: string;
    purpose?: string;
    bhkNeeded?: string | string[];
    bedroomsNeeded?: string;
    city?: string;
    preferredLocalities?: string[] | string;
    locationPreference?: string;
    budgetMin?: number | string;
    budgetMax?: number | string;
    budget?: number | string;
  },
  properties: Array<{
    id: string;
    title: string;
    purpose?: string;
    type?: string;
    bhk?: string;
    bedrooms?: number | string;
    city?: string;
    locality?: string;
    location?: string;
    price: number;
    carpetAreaSqFt?: number | string;
    areaSqFt?: number | string;
    status: string;
    media?: Array<{ url: string; isCover?: boolean }>;
    images?: string[];
    publicToken?: string;
  }>
): PropertyMatchResult[] {
  // Only match with available inventory
  const availableProps = properties.filter(p => p.status === 'Available' || p.status === 'Under Offer');
  
  const leadPurpose = (lead.leadPurpose || lead.purpose || 'Buy').toLowerCase();
  const leadLocalities = Array.isArray(lead.preferredLocalities)
    ? lead.preferredLocalities.map(l => l.toLowerCase())
    : (lead.preferredLocalities || lead.locationPreference || '').toLowerCase().split(',').map(l => l.trim()).filter(Boolean);

  const budgetMin = lead.budgetMin ? Number(lead.budgetMin) : 0;
  const budgetMax = lead.budgetMax ? Number(lead.budgetMax) : (lead.budget ? Number(lead.budget) : 9999999999);

  const results: PropertyMatchResult[] = [];

  for (const prop of availableProps) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Transaction Purpose (Buy vs Rent)
    const propPurpose = (prop.purpose || 'For Sale').toLowerCase();
    const isPurposeMatch = (leadPurpose.includes('rent') && propPurpose.includes('rent')) ||
                          (leadPurpose.includes('buy') && (propPurpose.includes('sale') || propPurpose.includes('buy')));
    if (!isPurposeMatch) continue; // Hard filter
    score += 25;
    reasons.push(prop.purpose || 'For Sale');

    // 2. Configuration / BHK Match
    const propBhk = (prop.bhk || (prop.bedrooms ? `${prop.bedrooms} BHK` : '3 BHK')).toLowerCase();
    const requestedBhks = Array.isArray(lead.bhkNeeded)
      ? lead.bhkNeeded.map(b => b.toLowerCase())
      : (lead.bhkNeeded || lead.bedroomsNeeded || '3 BHK').toLowerCase().split(',').map(b => b.trim());

    const isBhkMatch = requestedBhks.some(b => propBhk.includes(b) || b.includes(propBhk));
    if (isBhkMatch) {
      score += 35;
      reasons.push(prop.bhk || `${prop.bedrooms || 3} BHK`);
    } else {
      // Partial BHK match (e.g. 2.5 BHK matches 3 BHK or 2 BHK)
      score += 15;
    }

    // 3. Location / Locality Match
    const propLoc = ((prop.locality || '') + ' ' + (prop.city || '') + ' ' + (prop.location || '')).toLowerCase();
    const isLocMatch = leadLocalities.length === 0 || leadLocalities.some(loc => propLoc.includes(loc));
    if (isLocMatch && leadLocalities.length > 0) {
      score += 25;
      reasons.push(prop.locality || prop.location || 'Preferred Area');
    } else if (leadLocalities.length === 0) {
      score += 20;
    }

    // 4. Budget Match (with 10% Indian broker negotiation flexibility)
    const flexibleMin = budgetMin * 0.9;
    const flexibleMax = budgetMax * 1.1;

    if (prop.price >= flexibleMin && prop.price <= flexibleMax) {
      score += 15;
      reasons.push(`Budget Fits (${formatINR(prop.price)})`);
    } else if (prop.price <= flexibleMax * 1.15) {
      // Slightly higher, negotiable
      score += 5;
      reasons.push(`Negotiable Price (${formatINR(prop.price)})`);
    }

    if (score >= 50) {
      const cover = prop.media?.find(m => m.isCover)?.url || prop.images?.[0] || '/images/property_hero.jpg';
      results.push({
        propertyId: prop.id,
        propertyTitle: prop.title,
        bhk: prop.bhk || `${prop.bedrooms || 3} BHK`,
        locality: prop.locality || prop.location || 'Prime Location',
        city: prop.city || 'Mumbai',
        price: prop.price,
        priceFormatted: formatINR(prop.price),
        carpetAreaSqFt: Number(prop.carpetAreaSqFt || prop.areaSqFt || 1200),
        matchScore: Math.min(score, 100),
        matchReasons: reasons,
        coverUrl: cover,
        publicToken: prop.publicToken || prop.id
      });
    }
  }

  // Sort by highest match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function findMatchingLeadsForProperty(
  property: {
    id: string;
    purpose?: string;
    bhk?: string;
    bedrooms?: number | string;
    city?: string;
    locality?: string;
    location?: string;
    price: number;
  },
  leads: Array<{
    id: string;
    name: string;
    phone: string;
    leadPurpose?: string;
    purpose?: string;
    bhkNeeded?: string | string[];
    bedroomsNeeded?: string;
    city?: string;
    preferredLocalities?: string[] | string;
    locationPreference?: string;
    budgetMin?: number | string;
    budgetMax?: number | string;
    budget?: number | string;
    urgency?: string;
    fundingStatus?: string;
    status: string;
  }>
): LeadMatchResult[] {
  // Only match with active buyers (not dropped or deal closed)
  const activeLeads = leads.filter(l => l.status !== 'Deal Closed' && l.status !== 'Dropped');
  const results: LeadMatchResult[] = [];

  for (const lead of activeLeads) {
    const matchedProps = findMatchingPropertiesForLead(lead, [property as any]);
    if (matchedProps.length > 0) {
      const match = matchedProps[0];
      const budgetText = (lead.budgetMin && lead.budgetMax)
        ? `${formatINR(lead.budgetMin)} - ${formatINR(lead.budgetMax)}`
        : (lead.budgetMax ? `Upto ${formatINR(lead.budgetMax)}` : 'Flexible');

      results.push({
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone,
        bhkNeeded: Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : (lead.bhkNeeded || lead.bedroomsNeeded || '3 BHK'),
        budgetFormatted: budgetText,
        urgency: lead.urgency || 'Immediate',
        fundingStatus: lead.fundingStatus || 'Pre-Approved Loan',
        matchScore: match.matchScore,
        matchReasons: match.matchReasons
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
