export interface FontOption {
  id: string;
  name: string;
  category: string;
  tagline: string;
  fontFamily: string;
  previewHeading: string;
  previewBody: string;
}

export interface ColorSchemeOption {
  id: string;
  name: string;
  tagline: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryText: string;
  primaryRgb: string;
  accent: string;
  previewGradient: string;
  badgeBg: string;
  badgeText: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Modern Corporate',
    tagline: 'Ultra-crisp geometric sans used by top luxury real estate tech platforms',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    previewHeading: 'Lodha Park Signature Penthouse',
    previewBody: 'Experience breathtaking panoramic sea views from South Mumbai’s tallest residential tower.'
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Precision & Clarity',
    tagline: 'Clean Swiss-engineered typography with flawless legibility across screens',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    previewHeading: 'Vance Luxury Realty Catalog',
    previewBody: 'Streamlined data tables, rapid deal pipeline navigation, and instant client WhatsApp pitches.'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'Urban Metropolitan',
    tagline: 'Bold, architectural presence reminiscent of iconic city high-rise branding',
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    previewHeading: 'Bandra West Coastal Horizon',
    previewBody: 'Prime arterial connectivity, exclusive concierge desk, and 4 reserved basement parkings.'
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Contemporary Architecture',
    tagline: 'Spacious, geometric letterforms crafted specifically for modern designer developments',
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    previewHeading: 'The Lumina Glasshouse Residences',
    previewBody: 'Double-height cathedral ceilings, Italian marble flooring, and private heated plunge pools.'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'Warm Geometric',
    tagline: 'Friendly, rounded geometry that feels vibrant, energetic, and high-trust',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    previewHeading: 'Prestige Boulevard Smart Homes',
    previewBody: 'Designed for young high-net-worth families with integrated home automation and clubhouse.'
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Heritage Editorial Serif',
    tagline: 'Classic editorial serif expressing timeless prestige, heritage villas, and private estates',
    fontFamily: "'Playfair Display', Georgia, serif",
    previewHeading: 'The Royal Sovereign Mansions',
    previewBody: 'A legacy address crafted for discerning connoisseurs of architecture, privacy, and heirloom luxury.'
  }
];

export const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: 'emerald',
    name: 'Emerald Prosperity',
    tagline: 'Prosperity, wealth & Indian real estate market benchmark',
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#d1fae5',
    primaryText: '#065f46',
    primaryRgb: '5, 150, 105',
    accent: '#10b981',
    previewGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    badgeBg: '#d1fae5',
    badgeText: '#065f46'
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire',
    tagline: 'High-trust, institutional brokerage & coastal waterfront estates',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryText: '#1e40af',
    primaryRgb: '37, 99, 235',
    accent: '#3b82f6',
    previewGradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af'
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    tagline: 'Ultra-minimalist, sleek monochrome architectural luxury',
    primary: '#0f172a',
    primaryDark: '#020617',
    primaryLight: '#f1f5f9',
    primaryText: '#0f172a',
    primaryRgb: '15, 23, 42',
    accent: '#334155',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    badgeBg: '#e2e8f0',
    badgeText: '#0f172a'
  },
  {
    id: 'rose',
    name: 'Tuscan Rose Gold',
    tagline: 'Opulent boutique residences, wine estates & heritage villas',
    primary: '#be185d',
    primaryDark: '#9d174d',
    primaryLight: '#fce7f3',
    primaryText: '#831843',
    primaryRgb: '190, 24, 93',
    accent: '#db2777',
    previewGradient: 'linear-gradient(135deg, #9d174d 0%, #db2777 100%)',
    badgeBg: '#fce7f3',
    badgeText: '#831843'
  },
  {
    id: 'amber',
    name: 'Warm Amber Bronze',
    tagline: 'Sun-drenched penthouses, Mediterranean terraces & golf resorts',
    primary: '#d97706',
    primaryDark: '#b45309',
    primaryLight: '#fef3c7',
    primaryText: '#92400e',
    primaryRgb: '217, 119, 6',
    accent: '#f59e0b',
    previewGradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    badgeBg: '#fef3c7',
    badgeText: '#92400e'
  },
  {
    id: 'indigo',
    name: 'Cyber Violet Indigo',
    tagline: 'High-velocity commercial tech parks & next-gen developments',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#e0e7ff',
    primaryText: '#3730a3',
    primaryRgb: '99, 102, 241',
    accent: '#818cf8',
    previewGradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3'
  }
];

export function applyTheme(fontId: string, colorId: string) {
  if (typeof window === 'undefined') return;

  const font = FONT_OPTIONS.find(f => f.id === fontId) || FONT_OPTIONS[0];
  const color = COLOR_SCHEMES.find(c => c.id === colorId) || COLOR_SCHEMES[0];

  const root = document.documentElement;

  // Apply Font Family
  root.style.setProperty('--font-family', font.fontFamily);
  root.style.setProperty('--font-heading', font.fontFamily);
  document.body.style.fontFamily = font.fontFamily;

  // Apply Color Palette Variables
  root.style.setProperty('--primary', color.primary);
  root.style.setProperty('--primary-dark', color.primaryDark);
  root.style.setProperty('--primary-light', color.primaryLight);
  root.style.setProperty('--primary-text', color.primaryText);
  root.style.setProperty('--primary-color', color.primary);
  root.style.setProperty('--primary-hover', color.primaryDark);
  root.style.setProperty('--primary-rgb', color.primaryRgb);
  root.style.setProperty('--primary-gradient', color.previewGradient);
  root.style.setProperty('--sidebar-active', color.primary);
  root.style.setProperty('--accent', color.accent);
  root.style.setProperty('--badge-bg', color.badgeBg);
  root.style.setProperty('--badge-text', color.badgeText);

  // Store in LocalStorage
  try {
    localStorage.setItem('agentladders_font', font.id);
    localStorage.setItem('agentladders_color', color.id);
  } catch {
    // Ignore localStorage errors in private mode
  }

  // Inject or update global high-priority style tag to guarantee 100% propagation
  let styleEl = document.getElementById('agentladders-dynamic-theme') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'agentladders-dynamic-theme';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    html, body, button, input, select, textarea, optgroup, table, th, td, h1, h2, h3, h4, h5, h6, p, span, a, label, li, div {
      font-family: ${font.fontFamily} !important;
    }
    :root {
      --font-family: ${font.fontFamily} !important;
      --font-heading: ${font.fontFamily} !important;
      --primary: ${color.primary} !important;
      --primary-color: ${color.primary} !important;
      --primary-dark: ${color.primaryDark} !important;
      --primary-hover: ${color.primaryDark} !important;
      --primary-light: ${color.primaryLight} !important;
      --primary-text: ${color.primaryText} !important;
      --primary-rgb: ${color.primaryRgb} !important;
      --primary-gradient: ${color.previewGradient} !important;
      --sidebar-active: ${color.primary} !important;
      --accent: ${color.accent} !important;
      --badge-bg: ${color.badgeBg} !important;
      --badge-text: ${color.badgeText} !important;
    input:focus, select:focus, textarea:focus {
      border-color: ${color.primary} !important;
      box-shadow: 0 0 0 3px rgba(${color.primaryRgb}, 0.18) !important;
    }
    input[type="checkbox"], input[type="radio"], input[type="range"] {
      accent-color: ${color.primary} !important;
    }
  `;
}

export function getStoredTheme(): { fontId: string; colorId: string } {
  if (typeof window === 'undefined') {
    return { fontId: 'montserrat', colorId: 'emerald' };
  }

  try {
    const fontId = localStorage.getItem('agentladders_font') || 'montserrat';
    const colorId = localStorage.getItem('agentladders_color') || 'emerald';
    return { fontId, colorId };
  } catch {
    return { fontId: 'montserrat', colorId: 'emerald' };
  }
}
