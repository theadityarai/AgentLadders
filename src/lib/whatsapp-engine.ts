import { formatINR } from './formatters';

export function sanitizeIndianPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.substring(1)}`;
  return digits;
}

export function openWhatsAppDirect(phone: string, message: string) {
  const cleanPhone = sanitizeIndianPhone(phone);
  const encoded = encodeURIComponent(message);
  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  if (typeof window !== 'undefined') {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}

export function openWhatsApp(message: string, phone?: string) {
  openWhatsAppDirect(phone || '', message);
}

export function generatePropertyPitchWhatsApp(property: {
  title: string;
  bhk?: string;
  bedrooms?: number | string;
  locality?: string;
  city?: string;
  location?: string;
  carpetAreaSqFt?: number | string;
  builtUpAreaSqFt?: number | string;
  areaSqFt?: number | string;
  price: number;
  purpose?: string;
  listingType?: string;
  furnishing?: string;
  vastuFacing?: string;
  facing?: string;
  floor?: string;
  parking?: string | number;
  reraId?: string;
  possessionStatus?: string;
  media?: Array<{ id?: string; url?: string; tag?: string; isCover?: boolean }>;
  images?: string[];
  image?: string;
  videoTourUrl?: string;
  publicToken?: string;
  id: string;
  [key: string]: any;
}, agencyName = 'AgentLadders Realty', agentPhone = '+91 98200 12345'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agentladders.com';
  const publicUrl = `${origin}/p/${property.publicToken || property.id}`;
  
  // Resolve primary property image (cover photo, first media, or images array)
  let primaryImageUrl = '';
  if (property.image && typeof property.image === 'string' && property.image.trim()) {
    primaryImageUrl = property.image.trim();
  } else if (Array.isArray(property.images) && property.images.length > 0 && typeof property.images[0] === 'string' && property.images[0].trim()) {
    primaryImageUrl = property.images[0].trim();
  } else if (Array.isArray(property.media) && property.media.length > 0) {
    const cover = property.media.find(m => m.isCover && m.url) || property.media.find(m => m.url);
    if (cover?.url) {
      primaryImageUrl = cover.url.trim();
    }
  }

  // Fallback to high quality architectural exterior photo if none exists
  if (!primaryImageUrl) {
    primaryImageUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80';
  } else if (primaryImageUrl.startsWith('/')) {
    primaryImageUrl = `${origin}${primaryImageUrl}`;
  }

  const bhk = property.bhk || `${property.bedrooms || 3} BHK`;
  const location = property.locality 
    ? `${property.locality}, ${property.city || 'Mumbai'}` 
    : (property.location || 'Prime Location');
  const carpetArea = property.carpetAreaSqFt || (property.areaSqFt ? Math.round(Number(property.areaSqFt) * 0.8) : 1250);
  const priceFormatted = formatINR(property.price);
  const purpose = property.purpose || property.listingType || 'For Sale';
  const vastu = property.vastuFacing && property.vastuFacing !== 'Not Applicable' ? property.vastuFacing : property.facing;

  let msg = `🌟 *NEW EXCLUSIVE LISTING*\n` +
    `*${property.title}*\n` +
    `📍 ${location}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Quoting:* ${priceFormatted} (${purpose})\n` +
    `🛏️ *Configuration:* ${bhk} · ${property.furnishing || 'Semi-Furnished'}\n` +
    `📐 *Carpet Area:* ${carpetArea} sq.ft. (RERA Standard)\n` +
    (property.floor ? `🏢 *Floor:* ${property.floor}\n` : '') +
    (vastu && vastu !== 'Not Applicable' ? `🧭 *Facing:* ${vastu} (Vastu Compliant)\n` : '') +
    (property.parking ? `🚗 *Parking:* ${property.parking}\n` : '') +
    (property.possessionStatus ? `🔑 *Possession:* ${property.possessionStatus}\n` : '') +
    (property.reraId ? `🏛️ *RERA Reg:* ${property.reraId}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📸 *Full Photo Gallery & Verified Brochure:*\n` +
    `${publicUrl}\n\n` +
    `📲 *For Exclusive Site Visit & Details:*\n` +
    `*${agencyName}*\n` +
    `📞 Contact / WhatsApp: ${agentPhone}`;

  return msg;
}

export function generateSiteVisitWhatsApp(visit: {
  leadName: string;
  propertyTitle: string;
  propertyLocation: string;
  scheduledDate: string;
  slotTime?: string;
  scheduledTime?: string;
  assignedExecutive?: string;
  agentName?: string;
  agentPhone?: string;
  notes?: string;
}, agencyName = 'AgentLadders Realty'): string {
  const time = visit.slotTime || visit.scheduledTime || '11:00 AM';
  const host = visit.assignedExecutive || visit.agentName;
  return `📅 *SITE VISIT CONFIRMATION* 🚗\n\n` +
    `Dear ${visit.leadName},\n\n` +
    `Your private showing for *${visit.propertyTitle}* is confirmed!\n\n` +
    `🗓️ *Date*: ${visit.scheduledDate}\n` +
    `⏰ *Time Slot*: ${time}\n` +
    `📍 *Address / Location*: ${visit.propertyLocation}\n` +
    (host ? `👤 *Showing Host*: ${host}\n` : '') +
    (visit.agentPhone ? `📞 *Host Contact*: ${visit.agentPhone}\n` : '') +
    (visit.notes ? `📝 *Meeting Instructions*: ${visit.notes}\n` : '') +
    `\nOur executive will be waiting at the property reception. In case of any schedule changes, please inform us 1 hour prior.\n\n` +
    `_Warm regards,_\n` +
    `*${agencyName}*`;
}

export function generateOwnerUpdateWhatsApp(owner: {
  ownerName: string;
  propertyTitle: string;
  visitorName: string;
  feedback: string;
  offerAmount?: number;
}): string {
  return `📢 *OWNER PROPERTY UPDATE*\n\n` +
    `Dear ${owner.ownerName},\n\n` +
    `We conducted a site visit today for your property *${owner.propertyTitle}* with prospective buyer *${owner.visitorName}*.\n\n` +
    `📊 *Client Feedback*: ${owner.feedback}\n` +
    (owner.offerAmount ? `💰 *Buyer Indicative Offer*: ${formatINR(owner.offerAmount)}\n` : '') +
    `\nWe are following up closely to negotiate and move towards token stage. Will keep you updated on progress.\n\n` +
    `_Best regards,_\n` +
    `*Your Advisory Team*`;
}
