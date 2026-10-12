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
    vastuPreference?: string;
    constructionStagePreference?: string;
    furnishingPreference?: string;
    parkingPreference?: string;
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
    furnishing?: string;
    possessionStatus?: string;
    vastuFacing?: string;
    parking?: string | number;
    media?: Array<{ url: string; isCover?: boolean }>;
    images?: string[];
    publicToken?: string;
  }>
): PropertyMatchResult[] {
  const leadPurpose = (lead.leadPurpose || lead.purpose || 'Buy').toLowerCase();
  const isLeadRent = leadPurpose.includes('rent');
  const isLeadBuy = leadPurpose.includes('buy');

  const leadLocalities = Array.isArray(lead.preferredLocalities)
    ? lead.preferredLocalities.map(l => l.toLowerCase().trim()).filter(Boolean)
    : (lead.preferredLocalities || lead.locationPreference || '').toLowerCase().split(',').map(l => l.trim()).filter(Boolean);

  const requestedBhks = Array.isArray(lead.bhkNeeded)
    ? lead.bhkNeeded.map(b => b.toLowerCase().trim()).filter(Boolean)
    : (lead.bhkNeeded || lead.bedroomsNeeded || '3 BHK').toLowerCase().split(',').map(b => b.trim()).filter(Boolean);

  const budgetMin = lead.budgetMin ? Number(lead.budgetMin) : 0;
  const budgetMax = lead.budgetMax ? Number(lead.budgetMax) : (lead.budget ? Number(lead.budget) : 9999999999);
  const flexibleMin = budgetMin * 0.9;
  const flexibleMax = budgetMax * 1.1;

  const results: PropertyMatchResult[] = [];

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    if (prop.status !== 'Available' && prop.status !== 'Under Offer') continue;

    // 1. Transaction Purpose (Buy vs Rent)
    const propPurpose = (prop.purpose || 'For Sale').toLowerCase();
    const isPropRent = propPurpose.includes('rent');
    const isPropBuy = propPurpose.includes('sale') || propPurpose.includes('buy');

    const isPurposeMatch = (isLeadRent && isPropRent) || (isLeadBuy && isPropBuy);
    if (!isPurposeMatch) continue; // Hard filter

    let score = 25;
    const reasons: string[] = [prop.purpose || 'For Sale'];

    // 2. Configuration / BHK Match
    const propBhk = (prop.bhk || (prop.bedrooms ? `${prop.bedrooms} BHK` : '3 BHK')).toLowerCase();
    const isBhkMatch = requestedBhks.some(b => propBhk.includes(b) || b.includes(propBhk));
    if (isBhkMatch) {
      score += 25;
      reasons.push(prop.bhk || `${prop.bedrooms || 3} BHK`);
    } else {
      score += 10;
    }

    // 3. Location / Locality Match
    const propLoc = ((prop.locality || '') + ' ' + (prop.city || '') + ' ' + (prop.location || '')).toLowerCase();
    if (leadLocalities.length > 0) {
      const isLocMatch = leadLocalities.some(loc => propLoc.includes(loc));
      if (isLocMatch) {
        score += 20;
        reasons.push(prop.locality || prop.location || 'Preferred Area');
      }
    } else {
      score += 15;
    }

    // 4. Budget Match (with 10% Indian broker negotiation flexibility)
    if (prop.price >= flexibleMin && prop.price <= flexibleMax) {
      score += 15;
      reasons.push(`Budget Fits (${formatINR(prop.price)})`);
    } else if (prop.price <= flexibleMax * 1.15) {
      score += 5;
      reasons.push(`Negotiable Price (${formatINR(prop.price)})`);
    }

    // 5. Vastu Alignment Match
    if (lead.vastuPreference && lead.vastuPreference !== 'Any' && prop.vastuFacing) {
      const leadVastu = lead.vastuPreference.toLowerCase();
      const propVastu = prop.vastuFacing.toLowerCase();
      if (leadVastu.includes('east') && propVastu.includes('east') ||
          leadVastu.includes('north') && propVastu.includes('north') ||
          propVastu.includes(leadVastu) || leadVastu.includes(propVastu)) {
        score += 15;
        reasons.push(`🧭 Vastu Matched (${prop.vastuFacing.split(' ')[0]})`);
      }
    }

    // 6. Construction / Possession Stage Match
    if (lead.constructionStagePreference && lead.constructionStagePreference !== 'Any' && prop.possessionStatus) {
      const leadStage = lead.constructionStagePreference.toLowerCase();
      const propStage = prop.possessionStatus.toLowerCase();
      if ((leadStage.includes('ready') && propStage.includes('ready')) ||
          (leadStage.includes('under') && propStage.includes('under'))) {
        score += 10;
        reasons.push(`🏗️ ${prop.possessionStatus.includes('Ready') ? 'Ready to Move' : 'Possession Fits'}`);
      }
    }

    // 7. Furnishing Match
    if (lead.furnishingPreference && lead.furnishingPreference !== 'Any' && prop.furnishing) {
      if (lead.furnishingPreference.toLowerCase() === prop.furnishing.toLowerCase()) {
        score += 8;
        reasons.push(`🛋️ ${prop.furnishing}`);
      }
    }

    // 8. Parking Match
    if (lead.parkingPreference && lead.parkingPreference !== 'Any' && prop.parking) {
      score += 7;
      reasons.push(`🚗 Parking Included`);
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

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function findMatchingLeadsForProperty(
  property: {
    id: string;
    title?: string;
    purpose?: string;
    bhk?: string;
    bedrooms?: number | string;
    city?: string;
    locality?: string;
    location?: string;
    price: number;
    status?: string;
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
  // Pre-normalize property wrapper
  const propList = [{
    ...property,
    title: property.title || 'Property',
    status: property.status || 'Available'
  }];

  const results: LeadMatchResult[] = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    if (lead.status === 'Deal Closed' || lead.status === 'Dropped') continue;

    const matchedProps = findMatchingPropertiesForLead(lead, propList);
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
