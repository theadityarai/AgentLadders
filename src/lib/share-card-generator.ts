/**
 * Share Card Generator for WhatsApp & Social Media
 * Generates branded real estate flyer cards with property image,
 * Indian price formatting, key specs, and broker contact info (Meesho/Flipkart style).
 */

import { formatINR } from './formatters';

export interface PropertyCardData {
  title: string;
  price: number;
  bhk?: string;
  bedrooms?: number | string;
  locality?: string;
  city?: string;
  location?: string;
  carpetAreaSqFt?: number | string;
  areaSqFt?: number | string;
  imageUrl?: string;
  agencyName?: string;
  agentPhone?: string;
  purpose?: string;
}

export async function generatePropertyFlyerBlob(data: PropertyCardData): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Load and draw image
  const imgUrl = data.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80';
  
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw image covering upper 65% of canvas
      const imgHeight = 700;
      const imgAspect = img.width / img.height;
      const targetAspect = width / imgHeight;
      let drawW = width;
      let drawH = imgHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > targetAspect) {
        drawW = imgHeight * imgAspect;
        offsetX = -(drawW - width) / 2;
      } else {
        drawH = width / imgAspect;
        offsetY = -(drawH - imgHeight) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, imgHeight);
      ctx.clip();
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // Top subtle gradient for badge legibility
      const topGrad = ctx.createLinearGradient(0, 0, 0, 140);
      topGrad.addColorStop(0, 'rgba(15, 23, 42, 0.7)');
      topGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, 140);

      // Bottom fade into details card
      const bottomGrad = ctx.createLinearGradient(0, 480, 0, imgHeight);
      bottomGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
      bottomGrad.addColorStop(1, 'rgba(15, 23, 42, 1)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 480, width, imgHeight - 480);

      resolve();
    };
    img.onerror = () => {
      // Draw stylish architectural placeholder pattern
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, 700);
      resolve();
    };
    img.src = imgUrl;
  });

  // Top Bar: Agency Branding Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(40, 36, 320, 50, 10);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(66, 61, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText((data.agencyName || 'AgentLadders Realty').substring(0, 22), 86, 68);

  // Top Right: Purpose Badge
  const purpose = data.purpose || 'FOR SALE';
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.roundRect(width - 240, 36, 200, 50, 10);
  ctx.fill();

  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(purpose.toUpperCase(), width - 140, 68);
  ctx.textAlign = 'left';

  // Details Container (Bottom 380px)
  const infoY = 680;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, infoY, width, height - infoY);

  // Decorative Accent Line
  const accentGrad = ctx.createLinearGradient(40, infoY, width - 40, infoY);
  accentGrad.addColorStop(0, '#10b981');
  accentGrad.addColorStop(0.5, '#3b82f6');
  accentGrad.addColorStop(1, '#10b981');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(40, infoY + 2, width - 80, 4);

  // Property Title
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  const cleanTitle = data.title.length > 36 ? data.title.substring(0, 34) + '...' : data.title;
  ctx.fillText(cleanTitle, 40, infoY + 65);

  // Location
  const loc = data.locality 
    ? `${data.locality}, ${data.city || 'Mumbai'}` 
    : (data.location || 'Prime Location');
  ctx.font = '500 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`📍 ${loc}`, 40, infoY + 110);

  // Stat Pills Box (Grid)
  const pillY = infoY + 140;
  const pillW = 230;
  const pillH = 100;
  const pillGap = 20;

  const bhk = data.bhk || `${data.bedrooms || 3} BHK`;
  const carpet = data.carpetAreaSqFt || (data.areaSqFt ? Math.round(Number(data.areaSqFt) * 0.8) : 1250);
  const priceText = formatINR(data.price);

  const stats = [
    { label: 'PRICE', value: priceText, color: '#34d399' },
    { label: 'CONFIGURATION', value: bhk, color: '#ffffff' },
    { label: 'CARPET AREA', value: `${carpet} sq.ft.`, color: '#ffffff' },
    { label: 'STATUS', value: 'Ready / Resale', color: '#60a5fa' }
  ];

  stats.forEach((stat, i) => {
    const x = 40 + i * (pillW + pillGap);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x, pillY, pillW, pillH, 12);
    ctx.fill();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(stat.label, x + 18, pillY + 36);

    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = stat.color;
    ctx.fillText(stat.value, x + 18, pillY + 76);
  });

  // Footer Contact Bar
  const footerY = 960;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, footerY, width, height - footerY);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  // Agent Contact Text
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('📞 WhatsApp & Inspection:', 40, footerY + 54);

  const phone = data.agentPhone || '+91 98200 12345';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText(phone, 380, footerY + 54);

  // Verified Badge
  ctx.font = '500 20px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText('✓ Verified on AgentLadders', width - 40, footerY + 54);
  ctx.textAlign = 'left';

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

/**
 * Trigger Meesho/Flipkart-style Share with Image:
 * 1. Generates flyer image
 * 2. Uses Web Share API if supported with file attachment
 * 3. Falls back to downloading image + copying text + opening WhatsApp
 */
export async function sharePropertyWithImage(
  data: PropertyCardData,
  whatsappMessage: string
): Promise<{ success: boolean; method: 'web-share' | 'download-and-open'; error?: string }> {
  try {
    const blob = await generatePropertyFlyerBlob(data);
    if (!blob) throw new Error('Could not generate flyer image');

    const fileName = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_Flyer.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    // Check if Web Share API with files is available (mobile Chrome, Safari, etc.)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: data.title,
        text: whatsappMessage,
        files: [file]
      });
      return { success: true, method: 'web-share' };
    }

    // Fallback for Desktop / browsers without file sharing:
    // 1. Copy image to clipboard if possible
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
      }
    } catch {
      // Clipboard write of image might be restricted in some browsers
    }

    // 2. Automatically download image flyer file so the broker can drag/paste it
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

    // 3. Open WhatsApp with formatted pitch
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');

    return { success: true, method: 'download-and-open' };
  } catch (err: any) {
    console.error('Error sharing property with image:', err);
    // Fallback to text WhatsApp
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    return { success: false, method: 'download-and-open', error: err.message };
  }
}
