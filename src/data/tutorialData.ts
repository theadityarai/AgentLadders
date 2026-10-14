import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  FileTextIcon,
  ReceiptIcon,
  CheckSquareIcon,
  BarChartIcon,
  MessageCircleIcon,
  SettingsIcon
} from '@/components/icons/NavIcons';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Hotspot {
  id: number;
  x: number;
  y: number;
  title: string;
  description: string;
  actionHint: string;
}

export interface StepItem {
  number: number;
  title: string;
  action: string;
  result: string;
  exactFieldOrButton: string;
  sampleInput: string;
  proTip: string;
  hotspotIndex: number;
}

export interface ModuleTutorial {
  id: string;
  name: string;
  shortName: string;
  category: 'core' | 'operations' | 'admin';
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  url: string;
  screenshotUrl: string;
  badge: string;
  badgeColor: string;
  reraComplianceTag: string;
  primaryGoal: string;
  frequency: string;
  targetRole: string;
  closingImpact: string;
  tagline: string;
  overview: string;
  whenToUse: string[];
  steps: StepItem[];
  keyControls: {
    name: string;
    type: 'button' | 'filter' | 'toggle' | 'export';
    description: string;
    bestPractice: string;
  }[];
  whatsAppVault: {
    title: string;
    useCase: string;
    hinglishScript: string;
    englishScript: string;
  }[];
  closingTactics: {
    proTip: string;
    legalTrapToAvoid: string;
    statOrMetric: string;
  };
  mockPreview: {
    windowTitle: string;
    subtitle: string;
    stats: { label: string; value: string; color: string }[];
    hotspots: Hotspot[];
  };
}

// ─── Module Data with Real Screenshots and Deep Step-by-Step SOP ─────────────

export const MODULE_TUTORIALS: ModuleTutorial[] = [
  {
    id: 'today',
    name: 'Today Dashboard (Workstation)',
    shortName: 'Today Dashboard',
    category: 'core',
    icon: HomeIcon,
    url: '/dashboard',
    screenshotUrl: '/images/tutorials/today.png',
    badge: 'DAILY COMMAND CENTER',
    badgeColor: '#059669',
    reraComplianceTag: 'Broker Standard Operating Procedure (SOP)',
    primaryGoal: 'Execute morning high-priority buyer calls, inspect scheduled site visits, and monitor active revenue pipeline.',
    frequency: 'Morning Briefing (9:00 AM) & Evening Closeout (6:30 PM)',
    targetRole: 'All Property Consultants, Team Leaders & Managing Brokers',
    closingImpact: 'Calling fresh leads within 15 minutes yields 800% higher qualification and protects buyers from competing brokers.',
    tagline: 'Your morning cockpit for urgent callbacks, today\'s showing routes, and monthly commission progress.',
    overview: 'The Today Workstation cuts through administrative clutter. Rather than scrolling through unorganized WhatsApp chats or messy spreadsheets, this screen aggregates your highest-urgency tasks: buyers awaiting property brochures, inspections scheduled for today with direct Google Maps pins, and real-time commission earnings.',
    whenToUse: [
      'First thing at 9:00 AM to organize your day\'s calling list and site inspection schedule.',
      'Before departing for field visits to confirm key access and dispatch WhatsApp pins to clients.',
      'At 6:00 PM to log completed showings, update client feedback, and advance deal milestones.'
    ],
    steps: [
      {
        number: 1,
        title: 'Audit Morning KPI Pulse & Commission Target',
        action: 'Scan the 4 top metric cards: Active Showings Today, Urgent Inquiries Pending Callback, Active Deals Pipeline, and Realized Commission won this month.',
        exactFieldOrButton: 'Top KPI Pulse Cards',
        sampleInput: 'Target: ₹5.00 Lakhs Commission | Showings Today: 3 Units | Urgent Callbacks: 5 Leads',
        result: 'Gives instant operational clarity on today\'s appointments and monthly revenue targets.',
        proTip: 'Never leave the office without reviewing the 3 scheduled showings and verifying caretaker availability.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Launch One-Click Quick Actions',
        action: 'Use the header buttons \'+ New Lead\', \'+ Add Property\', or \'+ Schedule Visit\' to record client calls without leaving your dashboard.',
        exactFieldOrButton: '+ Quick Action Buttons (Top Right)',
        sampleInput: 'Lead: Priya Sharma | Phone: +91 98450 11223 | Locality: Indiranagar 4BHK',
        result: 'Instantly opens the creation drawer and saves new inquiries into your database.',
        proTip: 'Log fresh inquiries immediately during phone conversations while buyer criteria are crisp.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Clear Urgent Call Queue Before 11:30 AM',
        action: 'Click the Call 📞 or WhatsApp 💬 icon next to hot buyers who registered in the last 24 hours.',
        exactFieldOrButton: 'Call 📞 & WhatsApp 💬 Action Pills',
        sampleInput: 'Buyer: Arun Nair (+91 98860...) • Inquiring about 3 BHK in Whitefield',
        result: 'Launches your mobile phone dialer or WhatsApp Web with buyer name and requested configuration pre-filled.',
        proTip: 'Calling prospective buyers within 15 minutes of registration yields an 8x higher conversion rate.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Dispatch Google Maps Pins for Today\'s Showings',
        action: 'Review scheduled showings in the Today timeline. Click the Google Maps pin icon to check driving time and send society gate navigation to the client.',
        exactFieldOrButton: 'Google Maps Pin Dispatcher 📍',
        sampleInput: 'Property: Prestige Falcon City #1402 • Gate 2 Visitor Parking Code',
        result: 'Sends exact GPS location and meeting point instructions directly to the buyer\'s phone.',
        proTip: 'Dispatch the Google Maps pin 2 hours prior to the inspection to eliminate client delays and no-shows.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Urgent Call Queue',
        type: 'button',
        description: 'Auto-sorts prospective buyers who requested a callback or price confirmation in the last 24 hours.',
        bestPractice: 'Call before noon; morning real estate calls have a 64% higher answer rate.'
      },
      {
        name: 'Showings Schedule Tracker',
        type: 'button',
        description: 'Chronological timeline of today\'s property tours with buyer name, budget, and GPS location.',
        bestPractice: 'Send meeting confirmations 2 hours prior to avoid buyer no-shows.'
      },
      {
        name: 'Commission Won Meter',
        type: 'export',
        description: 'Real-time calculation of realized vs projected brokerage earnings for the current month.',
        bestPractice: 'Keep at least 3 deals in the "Legal Verification" stage to ensure consistent monthly payouts.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Morning Site Visit Confirmation Script',
        useCase: 'Send to buyer 2 hours before scheduled physical inspection',
        hinglishScript: 'Namaste {BuyerName} ji! Aaj 11:30 AM par hamara {PropertyName} ka site visit scheduled hai. Location pin aur gate navigation link attached hai: {MapsLink}. Main 10 minute pehle gate par milunga!',
        englishScript: 'Good morning {BuyerName}! Confirming our site visit for {PropertyName} today at 11:30 AM. Here is the Google Maps location pin: {MapsLink}. I will be waiting at Gate 1 to receive you.'
      },
      {
        title: 'Instant Morning Inquiry Callback Follow-up',
        useCase: 'Send if buyer phone was busy during morning call attempt',
        hinglishScript: 'Namaste {BuyerName} ji! Maine aapko call kiya tha regarding your inquiry for {BHK} in {Locality}. Mere paas 2 verified ready options hain with developer discount. Kya main WhatsApp par video tour share karoon?',
        englishScript: 'Hello {BuyerName}, I just tried calling regarding your inquiry for a {BHK} in {Locality}. I have 2 verified ready-to-move options matching your budget. May I share the walkthrough brochures here on WhatsApp?'
      }
    ],
    closingTactics: {
      proTip: 'Top 1% brokers spend the first 60 minutes of every business day (9:00 - 10:00 AM) exclusively on outbound calls to warm buyers before opening emails or social media.',
      legalTrapToAvoid: 'Never show a property without confirming with the owner or builder representative whether keys are accessible and the unit is currently vacant or tenanted.',
      statOrMetric: 'Brokers executing their Today queue daily close 3.2x more deals per quarter than reactive brokers.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Today Workstation (/dashboard)',
      subtitle: 'Daily Command Center: 3 Showings Today • ₹4.20 Lakhs Projected Commission',
      stats: [
        { label: 'Today Visits', value: '3 Scheduled', color: '#059669' },
        { label: 'Hot Callbacks', value: '5 Pending', color: '#2563eb' },
        { label: 'Active Pipeline', value: '₹3.85 Cr', color: '#7c3aed' },
        { label: 'Commission Won', value: '₹2.40 L', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 34, y: 19, title: 'Morning KPI Pulse Bar', description: 'Displays scheduled showings, urgent lead callbacks, and monthly commission progress.', actionHint: 'Inspect today\'s appointments' },
        { id: 2, x: 88, y: 19, title: 'Quick Action Launchers', description: 'One-click modal to log a fresh inquiry, add a property, or schedule a visit.', actionHint: 'Click + to log new lead' },
        { id: 3, x: 38, y: 52, title: 'Urgent Callbacks & Leads', description: 'Shows inquiries registered in last 24h with 1-click Call and WhatsApp triggers.', actionHint: 'Tap WhatsApp icon to pitch' },
        { id: 4, x: 86, y: 52, title: 'Site Visit Google Maps Pin', description: 'Instantly shares the Google Maps location pin and society gate details with the buyer.', actionHint: 'Tap pin to dispatch Maps' }
      ]
    }
  },
  {
    id: 'leads',
    name: 'Inquiries & Buyer Leads',
    shortName: 'Inquiries (Leads)',
    category: 'core',
    icon: UsersIcon,
    url: '/dashboard/leads',
    screenshotUrl: '/images/tutorials/leads.png',
    badge: 'AI MAGIC MATCH & QUALIFICATION',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Client Privacy & Requirement Archival',
    primaryGoal: 'Capture buyer criteria (budget, BHK, locality) and instantly generate matching inventory pitches.',
    frequency: 'Continuously as leads arrive from portals, Meta Ads, and WhatsApp referrals',
    targetRole: 'Inside Sales, Lead Qualifiers & Sourcing Brokers',
    closingImpact: 'Fast lead qualification with instant WhatsApp brochures reduces buyer drop-off by 72%.',
    tagline: 'Never let prospective buyers slip through with AI Magic Match and 1-click WhatsApp brochures.',
    overview: 'The Inquiries module is your buyer relationship engine. It stores exact buyer preferences (Budget range in Lakhs/Crores, preferred micro-market, target possession date, home loan approval status). AgentLadders\' Magic Match Engine cross-references requirements against your entire property inventory in milliseconds.',
    whenToUse: [
      'Whenever a lead pings your phone from 99acres, MagicBricks, Housing, or WhatsApp.',
      'To run Magic Match to pair buyers with verified available inventory.',
      'To dispatch professional property brochures with clean pricing breakdowns.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter & Search Buyer Roster',
        action: 'Use the smart search bar and locality dropdowns to segment leads by micro-market (Whitefield, Indiranagar, HSR), budget range, or assigned agent.',
        exactFieldOrButton: 'Smart Search & Locality Filter',
        sampleInput: 'Filter: "Whitefield" | Budget: "₹1.5 Cr+" | Status: "Hot Buyer"',
        result: 'Instantly isolates high-intent buyers ready for weekend site visits.',
        proTip: 'Filter by \'Loan Approved\' buyers on Friday afternoon to fill your weekend showing schedule.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Capture Detailed Buyer Requirements',
        action: 'Click \'+ Add New Inquiry\'. Enter Buyer Name, WhatsApp Number, Budget Range (e.g. ₹1.4 - 1.8 Cr), Preferred Localities, and Loan Pre-Approval status.',
        exactFieldOrButton: '+ Add New Inquiry Button',
        sampleInput: 'Name: Arun Nair | Phone: +91 98860 54321 | Budget: ₹1.40 - ₹1.80 Cr | Locality: HSR Layout | Loan Approved: Yes',
        result: 'Creates an indexed buyer profile with temperature tag (\'Hot Buyer\', \'Investor\', \'First-Time Buyer\').',
        proTip: 'Always capture pre-approved loan status; buyers with sanctioned loans close 3x faster.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Run Algorithmic Magic Match',
        action: 'Click \'Magic Match 🪄\' on the inquiry card. The system scans all active property listings and ranks matches by budget overlap, BHK, and locality.',
        exactFieldOrButton: 'Magic Match 🪄 Button',
        sampleInput: 'Scans 42 Active Listings -> Returns Godrej Woodsman 3BHK (₹1.72 Cr, 96% Match)',
        result: 'Displays top-matched properties with price, carpet area, and availability status.',
        proTip: 'Search with maximum budget 10% higher than stated; buyers almost always stretch for the ideal flat.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Dispatch Personalized WhatsApp Pitch',
        action: 'Click \'WhatsApp Pitch 💬\'. Select Hinglish or English pitch template. Preview generated carpet area, price in Crores, and photo links.',
        exactFieldOrButton: 'WhatsApp Pitch 💬 Button',
        sampleInput: 'Template: Curated 2-Property Match • Auto-populates photos & layout links',
        result: 'Launches WhatsApp Web/App with personalized message ready to send with 1 click.',
        proTip: 'Always end your WhatsApp pitch with an alternative choice question (\'Saturday 11 AM ya Sunday 4 PM?\') instead of open-ended queries.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Magic Match 🪄 Algorithm',
        type: 'button',
        description: 'Computes budget overlap, BHK compatibility, and location radius to find matching inventory instantly.',
        bestPractice: 'Always set max budget 10% higher than buyer states—buyers almost always stretch for the ideal flat.'
      },
      {
        name: '1-Click WhatsApp Pitch Generator',
        type: 'button',
        description: 'Auto-composes a persuasive, formatted property pitch with bullet points, amenities, and price in Crores/Lakhs.',
        bestPractice: 'Never send raw uncompressed PDFs; formatted text with preview links converts 3x higher.'
      },
      {
        name: 'Lead Temperature Tags',
        type: 'filter',
        description: 'Tag clients as "Hot Buyer", "Loan Approved", "Investor", or "First-Time Buyer" for smart filtering.',
        bestPractice: 'Focus your afternoons on "Loan Approved" buyers who can close within 15 days.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Instant 2-Property Curated Match Pitch',
        useCase: 'Send immediately after qualifying a new buyer inquiry',
        hinglishScript: 'Namaste {BuyerName} ji! Aapke {Budget} budget aur {Locality} preference ke mutabiq yeh 2 best verified options hain:\n\n1️⃣ {Prop1Name} - {Prop1BHK} ({Prop1Area} sq.ft.) @ ₹{Prop1Price} All-inclusive\n2️⃣ {Prop2Name} - {Prop2BHK} ({Prop2Area} sq.ft.) @ ₹{Prop2Price}\n\n📸 Photos & layout plans: {BrochureLink}\n\nKal evening 4:00 PM ya parso morning 11:00 AM kab visit schedule karein?',
        englishScript: 'Hello {BuyerName}, based on your budget of {Budget} and preferred locality ({Locality}), here are the top 2 curated properties with clear titles:\n\n1️⃣ {Prop1Name} • {Prop1BHK} ({Prop1Area} sq.ft.) @ ₹{Prop1Price} All-inclusive\n2️⃣ {Prop2Name} • {Prop2BHK} ({Prop2Area} sq.ft.) @ ₹{Prop2Price}\n\n📸 Photos & walkthroughs: {BrochureLink}\n\nWould tomorrow at 4:00 PM or this Sunday at 11:00 AM work for a physical walkthrough?'
      }
    ],
    closingTactics: {
      proTip: 'End every WhatsApp pitch with an alternative-choice question ("Kal 4 PM ya Sunday 11 AM?") instead of an open-ended "What do you think?". Alternative-choice questions double site visit bookings.',
      legalTrapToAvoid: 'Never broadcast a seller\'s personal phone number or private floor number in a public WhatsApp group. Always share co-branded brochures with your agency contact details.',
      statOrMetric: 'Responding to incoming portal leads within 5 minutes results in an 800% higher qualification rate compared to calling after 2 hours.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Buyer Inquiries & Magic Match (/dashboard/leads)',
      subtitle: 'Buyer Demand: 48 Active Inquiries • ₹62.4 Cr Aggregated Purchasing Power',
      stats: [
        { label: 'Total Inquiries', value: '48 Active', color: '#2563eb' },
        { label: 'Hot Leads', value: '14 Ready', color: '#dc2626' },
        { label: 'Matches Found', value: '38 Inventory', color: '#059669' },
        { label: 'Visits Scheduled', value: '9 This Week', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Smart Search & Locality Filter', description: 'Filter inquiries by locality (Whitefield, Indiranagar, HSR), budget slider, or agent.', actionHint: 'Filter by area' },
        { id: 2, x: 88, y: 19, title: '+ Add New Inquiry Button', description: 'Opens lead modal to capture buyer budget, configuration, and loan status.', actionHint: 'Click to capture lead' },
        { id: 3, x: 38, y: 50, title: 'Lead Profile Cards', description: 'Displays buyer budget, BHK preferences, contact details, and priority tags.', actionHint: 'Review buyer card' },
        { id: 4, x: 86, y: 50, title: 'Magic Match & WhatsApp Pitch', description: 'Runs AI match against active inventory and dispatches formatted pitch.', actionHint: 'Dispatch WhatsApp pitch' }
      ]
    }
  },
  {
    id: 'properties',
    name: 'Properties & Inventory Management',
    shortName: 'Properties',
    category: 'core',
    icon: BuildingIcon,
    url: '/dashboard/properties',
    screenshotUrl: '/images/tutorials/properties.png',
    badge: 'DIGITAL BROCHURES & INVENTORY',
    badgeColor: '#059669',
    reraComplianceTag: 'Mandatory RERA Project ID & Carpet Area Display',
    primaryGoal: 'Catalog verified builder listings and resale inventory with carpet areas, floor plans, and digital flyers.',
    frequency: 'Daily updates as fresh inventory arrives from developers and owners',
    targetRole: 'Listing Specialists, Mandate Managers & Property Consultants',
    closingImpact: 'Accurate pricing and instant digital brochures build client trust and eliminate haggling over carpet area.',
    tagline: 'Your digital inventory showcase with high-res galleries, RERA details, and client flyers.',
    overview: 'The Properties module houses your agency\'s inventory assets. From luxury high-rise apartments in Whitefield to exclusive resale penthouses in Indiranagar, manage carpet area, floor level, parking slots, maintenance fees, and seller contact details securely.',
    whenToUse: [
      'When onboarding a new exclusive resale mandate or builder inventory.',
      'To check available configurations and floor levels during a buyer phone call.',
      'To generate clean, co-branded WhatsApp flyers without revealing owner numbers to clients.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Inventory by BHK & Budget',
        action: 'Use the configuration pills (2 BHK, 3 BHK, 4 BHK, Villa) and asking price slider to pinpoint units matching active buyers.',
        exactFieldOrButton: 'Configuration & Budget Filter Bar',
        sampleInput: 'Filter: 3 BHK • Ready to Move • ₹1.5 - ₹2.2 Cr',
        result: 'Isolates verified properties matching buyer parameters.',
        proTip: 'Always check if units are Ready to Move or Under Construction before proposing to loan-dependent buyers.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Onboard New Listing with RERA ID',
        action: 'Click \'+ Add Property\'. Enter Project Name, Unit Configuration, Asking Price, Carpet Area, and mandatory State RERA Project ID.',
        exactFieldOrButton: '+ Add Property Button',
        sampleInput: 'Project: Godrej Woodsman | Unit: #1402 (14th Floor) | 3 BHK | Locality: Hebbal | RERA: PRM/KA/RERA/1251/309/PR/171015',
        result: 'Listing is saved and automatically indexed for AI Magic Match searches.',
        proTip: 'Under RERA guidelines, always state the Carpet Area prominently, not just the Super Built-Up Area.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Upload Gallery & Specify Commercials',
        action: 'Upload high-resolution photos of the living room, master suite, kitchen, and society amenities. Enter maintenance charges and covered car park numbers.',
        exactFieldOrButton: 'Media Gallery & Commercials Form',
        sampleInput: 'Photos: Living room, lake view balcony, master bed | Maintenance: ₹4.5/sq.ft. | 2 Covered Parks',
        result: 'Assembles a high-definition digital brochure ready for client presentation.',
        proTip: 'Listings with 5+ professional photos receive 4x more site visit requests than text-only listings.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Generate Co-Branded WhatsApp Flyer',
        action: 'Click \'Share Flyer 💬\'. The system composes a formatted WhatsApp message with your agency branding, price in Crores, and photo links.',
        exactFieldOrButton: 'Share Flyer / WhatsApp Brochure',
        sampleInput: 'Flyer: Luxury Resale Alert • East Facing • Asking ₹2.10 Cr All-Inclusive',
        result: 'Produces a polished, client-facing pitch with seller personal numbers kept 100% private.',
        proTip: 'Never reveal the owner phone number until earnest money terms are locked in.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Builder vs Resale Distinction',
        type: 'toggle',
        description: 'Track developer inventory with payment plans vs resale properties with registry-ready clear titles.',
        bestPractice: 'Always verify whether resale property has a clear A-Khata and 15-year Encumbrance Certificate.'
      },
      {
        name: 'Auto Price/sq.ft. Calculator',
        type: 'button',
        description: 'Automatically calculates Super Built-up and Carpet Area rates in real-time as you type the price.',
        bestPractice: 'Always quote All-Inclusive Price to clients so they aren\'t startled by parking or clubhouse charges later.'
      },
      {
        name: 'Owner Privacy Protection',
        type: 'toggle',
        description: 'Keeps owner phone numbers and expected bottom price strictly private on client-facing brochures.',
        bestPractice: 'Never share the owner phone number until earnest money terms are locked in.'
      }
    ],
    whatsAppVault: [
      {
        title: 'New Luxury Resale Listing Announcement',
        useCase: 'Broadcast to warm buyer lists when onboarding an exclusive unit',
        hinglishScript: '🌟 Exclusive Mandate Alert in {Locality}!\n\n🏢 {ProjectName} • {BHK} Luxury Apartment\n📐 Carpet Area: {CarpetArea} sq.ft. (East Facing, 100% Vastu)\n🚗 2 Covered Car Parks • 14th Floor • Lake View\n💰 Asking Price: ₹{Price} (All-Inclusive)\n\n📸 High-res gallery & floor plan: {PhotoLink}\n\nKeys with us! Physical inspections open this Saturday. Reply to book your private tour slot.',
        englishScript: '🌟 Exclusive Mandate Alert in {Locality}!\n\n🏢 {ProjectName} • {BHK} Luxury Apartment\n📐 Carpet Area: {CarpetArea} sq.ft. (East Facing, 100% Vastu)\n🚗 2 Covered Car Parks • 14th Floor • Lake View\n💰 Asking Price: ₹{Price} (All-Inclusive)\n\n📸 High-res gallery & layout: {PhotoLink}\n\nKeys available with us! Physical showings open this Saturday. Reply to reserve your private viewing.'
      }
    ],
    closingTactics: {
      proTip: 'Highlight the top 3 unchangeable property attributes in your description: Floor level, sunlight/direction orientation, and corner unit privacy. High-budget buyers value natural light more than modular wardrobes.',
      legalTrapToAvoid: 'Under RERA guidelines, always state the Carpet Area prominently, not just the Super Built-Up Area. Misleading clients on carpet area violates regulatory norms.',
      statOrMetric: 'Listings with 5+ professional photos receive 4x more site visit requests than text-only listings.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Property Inventory Showcase (/dashboard/properties)',
      subtitle: 'Inventory Management: 42 Active Listings • ₹84.5 Cr Total Asset Value',
      stats: [
        { label: 'Active Listings', value: '42 Units', color: '#059669' },
        { label: 'Ready to Move', value: '29 Units', color: '#2563eb' },
        { label: 'Under Construction', value: '13 Units', color: '#7c3aed' },
        { label: 'Exclusive Mandates', value: '8 High Value', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'BHK & Price Filter Bar', description: 'Filter inventory by 2/3/4 BHK, budget range slider, and possession readiness.', actionHint: 'Filter by budget' },
        { id: 2, x: 88, y: 19, title: '+ Add Property Button', description: 'Onboard fresh listings with price, carpet area, photos, and RERA registration ID.', actionHint: 'Click to add listing' },
        { id: 3, x: 38, y: 52, title: 'Property Cards & Pricing', description: 'Visual showcase with carpet area, floor level, parking, and asking price in Crores.', actionHint: 'Inspect property card' },
        { id: 4, x: 86, y: 64, title: 'Share WhatsApp Flyer', description: 'Creates a clean, co-branded WhatsApp brochure without revealing owner numbers.', actionHint: 'Click to share flyer' }
      ]
    }
  },
  {
    id: 'site-visits',
    name: 'Site Visits & Property Inspections',
    shortName: 'Site Visits',
    category: 'core',
    icon: MapPinIcon,
    url: '/dashboard/site-visits',
    screenshotUrl: '/images/tutorials/site-visits.png',
    badge: 'FIELD SHOWINGS & CONVERSION',
    badgeColor: '#ea580c',
    reraComplianceTag: 'Physical Inspection Logging & Verification',
    primaryGoal: 'Schedule showing appointments, dispatch Google Maps pins, and log buyer reactions to close deals.',
    frequency: 'Daily: Morning route planning and immediate post-visit feedback logging',
    targetRole: 'Field Brokers, Relationship Managers & Area Specialists',
    closingImpact: '80% of real estate deals close within 48 hours of a successful second physical site inspection.',
    tagline: 'Convert property viewings into signed contracts with punctual scheduling and instant feedback.',
    overview: 'The Site Visit is where real estate deals are won or lost. This module lets you schedule buyer showings, send automated Google Maps location pins and time reminders over WhatsApp, coordinate key access with owners, and immediately capture buyer objections and counter-offers.',
    whenToUse: [
      'As soon as a qualified buyer expresses interest in inspecting a property.',
      'On the morning of the visit to send time and Google Maps location pins to the buyer.',
      'Immediately after the visit to record client feedback (e.g. "Loved layout, wanted higher floor").'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Visits by Date & Time',
        action: 'Use the date toggles (Today, Tomorrow, This Weekend, Completed) to plan your inspection schedule and travel routes.',
        exactFieldOrButton: 'Date Range & Status Selector',
        sampleInput: 'Filter: "This Weekend" • Shows 6 confirmed showings',
        result: 'Displays chronological showing sequence to optimize travel time between localities.',
        proTip: 'Group showings by micro-market (e.g. all Whitefield visits between 11 AM - 2 PM) to minimize travel delays.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Schedule a Showing Appointment',
        action: 'Click \'+ Schedule Visit\'. Select Buyer from dropdown, Property to inspect, Date, and Time slot (e.g. Sunday 11:30 AM).',
        exactFieldOrButton: '+ Schedule Visit Button',
        sampleInput: 'Buyer: Arun Nair | Property: Prestige Falcon City #1402 | Date: Sunday Oct 18 | Time: 11:30 AM',
        result: 'Visit is locked into your calendar and synced with the Today Workstation.',
        proTip: 'Never schedule more than 2 high-value visits in the same time slot to allow unhurried walkthroughs.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Dispatch Google Maps Location Pin',
        action: 'Click \'Send Location Pin 📍\' on the visit row. The system composes a polite WhatsApp message with exact GPS link and gate security instructions.',
        exactFieldOrButton: 'Send Location Pin 📍 Trigger',
        sampleInput: 'Pin: maps.google.com/?q=Prestige+Falcon+City | Meeting Point: Gate 2 Visitor Bay',
        result: 'Buyer receives meeting directions directly on WhatsApp.',
        proTip: 'Sending location pins 2 hours prior reduces client no-shows by 85%.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Record Feedback & Convert to Deal',
        action: 'Immediately after the visit, update status to \'Completed\'. Enter client reactions and counter-offers. If buyer agrees to negotiate, click \'Convert to Deal\'.',
        exactFieldOrButton: 'Convert to Deal 💼 Button',
        sampleInput: 'Feedback: Loved layout, counter-offered ₹1.62 Cr • Ready for token advance',
        result: 'Transfers buyer and property data directly into the Deals Pipeline Kanban board.',
        proTip: 'Log feedback within 15 minutes of departure while client comments and price expectations are fresh.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Automated Maps Pin Dispatcher',
        type: 'button',
        description: 'Sends exact GPS coordinates and gate entrance instructions to the buyer\'s phone in 1 click.',
        bestPractice: 'Always dispatch 2 hours before the appointment to prevent client delays.'
      },
      {
        name: 'Showing Outcome Logger',
        type: 'button',
        description: 'Categorizes visit reaction: "Interested - Making Offer", "Needs 2nd Visit with Family", or "Budget Mismatch".',
        bestPractice: 'Schedule a 2nd visit within 48 hours for warm buyers to maintain momentum.'
      },
      {
        name: '1-Click Deal Conversion',
        type: 'export',
        description: 'Moves showing directly into the Deals Pipeline with property and client data linked.',
        bestPractice: 'Convert immediately upon receiving verbal offer to lock in closing steps.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Site Visit Google Maps Pin Dispatch',
        useCase: 'Send to buyer 2 hours before scheduled physical inspection',
        hinglishScript: 'Namaste {BuyerName} ji! Aaj 11:30 AM par hamara {PropertyName} ka site visit scheduled hai. Location pin aur gate navigation link attached hai: {MapsLink}. Main 10 minute pehle gate par milunga!',
        englishScript: 'Good morning {BuyerName}! Confirming our site visit for {PropertyName} today at 11:30 AM. Here is the Google Maps location pin: {MapsLink}. I will be waiting at Gate 1 to receive you.'
      }
    ],
    closingTactics: {
      proTip: 'During physical walkthroughs, let buyers linger in the master bedroom and balcony in silence for 2-3 minutes so they can mentally picture living there.',
      legalTrapToAvoid: 'Never allow a buyer to inspect a tenanted property without providing 24 hours advance notice to the residing tenant and confirming key access.',
      statOrMetric: '80% of real estate deals close within 48 hours of a successful second physical site inspection.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Site Visits & Showings (/dashboard/site-visits)',
      subtitle: 'Inspection Schedule: 6 Scheduled Visits This Weekend • 82% Show Rate',
      stats: [
        { label: 'Scheduled Visits', value: '6 This Weekend', color: '#ea580c' },
        { label: 'Completed Today', value: '3 Showings', color: '#059669' },
        { label: 'High Interest', value: '4 Offers', color: '#2563eb' },
        { label: 'Converted to Deal', value: '2 Deals', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Date Range & Filter Bar', description: 'Filter visits by Today, Tomorrow, Weekend, or Past Completed showings.', actionHint: 'Filter by date' },
        { id: 2, x: 88, y: 19, title: '+ Schedule Visit Button', description: 'Book appointment with buyer, property, date, time slot, and assigned agent.', actionHint: 'Click to schedule showing' },
        { id: 3, x: 40, y: 50, title: 'Visit Details & Client Profile', description: 'Displays buyer budget, property address, and scheduled showing time.', actionHint: 'Review visit card' },
        { id: 4, x: 86, y: 50, title: 'Maps Pin & Convert to Deal', description: 'Directly dispatch Google Maps navigation link or convert to active deal.', actionHint: 'Send GPS pin or convert' }
      ]
    }
  },
  {
    id: 'deals',
    name: 'Deals Pipeline & Closing Kanban',
    shortName: 'Deals Pipeline',
    category: 'core',
    icon: BriefcaseIcon,
    url: '/dashboard/deals',
    screenshotUrl: '/images/tutorials/deals.png',
    badge: 'CLOSING ENGINE & TOKEN RECEIPTS',
    badgeColor: '#b45309',
    reraComplianceTag: 'Legally Binding Earnest Money & Broker Standing',
    primaryGoal: 'Move active negotiations through Token Advance, Legal Due Diligence, Agreement to Sale, and Final Registry.',
    frequency: 'Daily monitoring of closing milestones and commission disbursements',
    targetRole: 'Closing Brokers, Principal Partners & Managing Directors',
    closingImpact: 'Direct revenue generation; formalizes token deposits and locks in 1-2% brokerage fees.',
    tagline: 'Visual 6-stage deal pipeline to track tokens, agreements, and multi-lakh commission payouts.',
    overview: 'The Deals Pipeline is where negotiations become bank deposits. Organize high-value property transactions in an interactive 6-stage Kanban board. Track earnest money token receipts, lawyer title verification, bank home loan sanctions, Sale Agreement drafting, and commission payouts.',
    whenToUse: [
      'When a buyer and seller agree on commercial terms and pay an earnest money token.',
      'To generate an official Token Advance Receipt for both parties.',
      'To track legal document verification and bank loan sanction milestones.',
      'To record deal closure and trigger GST brokerage invoicing.'
    ],
    steps: [
      {
        number: 1,
        title: 'Review 6-Stage Kanban Board',
        action: 'Scan deal cards across the 6 stages: Offer Accepted -> Token Paid -> Legal Verification -> Sale Agreement -> Bank Loan -> Closed Won.',
        exactFieldOrButton: 'Kanban Column Header & Stage Totals',
        sampleInput: 'Stage Totals: Offer Accepted (2) | Token Paid (₹14L) | Closed Won (₹6.4L Comm.)',
        result: 'Gives visual clarity on which transactions require legal or banking follow-up.',
        proTip: 'Keep at least 3 transactions in the Legal Scrutiny stage to guarantee consistent monthly cashflow.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Initialize New Negotiated Deal',
        action: 'Click \'+ New Deal\'. Select Buyer, Property, Final Agreed Price (e.g. ₹1.65 Cr), Agreed Brokerage % (1% or 2%), and Target Registration Date.',
        exactFieldOrButton: '+ New Deal Button',
        sampleInput: 'Buyer: Kishore Reddy | Agreed Price: ₹1,65,00,000 | Brokerage: 2% (₹3,30,000)',
        result: 'Creates deal card with commission calculation and places it in Offer Accepted.',
        proTip: 'Always confirm in writing whether brokerage is 1% or 2% and whether GST is extra before accepting token.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Issue Official Token Advance Receipt',
        action: 'Click \'Issue Token Receipt\' on the deal card. Enter Earnest Money Token amount (e.g. ₹2,00,000) and Bank RTGS/UPI transaction reference.',
        exactFieldOrButton: 'Issue Token Receipt Action',
        sampleInput: 'Token Amount: ₹2,00,000 | Mode: RTGS (Ref: UTR98273641) | Target: Agreement in 15 Days',
        result: 'Generates a formal, stamped Token Advance Receipt PDF securing your broker standing.',
        proTip: 'Issuing a formal Token Receipt prevents either buyer or seller from backing out without penalty.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Advance to Closed Won & Invoice',
        action: 'Once the Sale Deed is stamped at the Sub-Registrar office, drag deal to \'Closed Won\'. Click \'Generate Brokerage Invoice\'.',
        exactFieldOrButton: 'Generate GST Invoice Trigger',
        sampleInput: 'Status: Registered Deed Executed | Commission Due: ₹3,30,000 + 18% GST = ₹3,89,400',
        result: 'Automatically transfers deal data into the Invoices module with 18% GST calculated.',
        proTip: 'Hand over the stamped copy of the Token Receipt and Agreement to the Sub-Registrar clerk for fee verification.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Visual 6-Stage Kanban Board',
        type: 'toggle',
        description: 'See every transaction in your agency categorized by milestone stage with column totals.',
        bestPractice: 'Drag cards as milestones complete to keep your pipeline cashflow forecast accurate.'
      },
      {
        name: 'Official Token Advance Receipt',
        type: 'button',
        description: 'Formal legal document template protecting your brokerage claim the moment earnest money is paid.',
        bestPractice: 'Always issue within 30 minutes of token payment to prevent either party backing out without penalty.'
      },
      {
        name: 'Commission Split Calculator',
        type: 'export',
        description: 'Calculates buyer-side (1%), seller-side (1%), agency cut, and agent incentive split automatically.',
        bestPractice: 'Clearly document the 1% or 2% rate before signing the Token Agreement.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Token Advance Receipt Confirmation',
        useCase: 'Send to buyer and seller immediately upon earnest money transfer',
        hinglishScript: 'Namaste {BuyerName} ji & {SellerName} ji! Congratulations on finalizing the transaction for {PropertyName} at agreed price ₹{AgreedPrice}.\n\nOfficial Token Advance Receipt of ₹{TokenAmount} (Trans ID: {TxnID}) generate kar diya gaya hai. Document PDF attached hai: {ReceiptLink}.\n\nNext Step: Advocate title verification process kal start hoga. Thank you!',
        englishScript: 'Dear {BuyerName} and {SellerName}, congratulations on agreeing to the terms for {PropertyName} at the agreed consideration of ₹{AgreedPrice}.\n\nAn official Token Advance Receipt for ₹{TokenAmount} (Ref: {TxnID}) has been issued and attached: {ReceiptLink}.\n\nNext Step: Title deed scrutiny by advocate begins tomorrow. Thank you for placing your trust in our agency.'
      }
    ],
    closingTactics: {
      proTip: 'Never allow token earnest money to change hands without an official Token Advance Receipt stating transaction terms, survey numbers, and the 1% or 2% brokerage payable on registry day.',
      legalTrapToAvoid: 'Never proceed to Sale Agreement without lawyer verification of the 30-year Encumbrance Certificate and parent deed chain. Deal cancellations at agreement stage damage client trust.',
      statOrMetric: 'Transactions with an official Token Receipt have a 96% completion rate compared to 62% for verbal handshake deals.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Deals Pipeline Kanban (/dashboard/deals)',
      subtitle: 'Active Closing Pipeline: 11 Active Deals • ₹18.4 Cr Gross Value • ₹36.8 Lakhs Commission',
      stats: [
        { label: 'Active Deals', value: '11 In Progress', color: '#b45309' },
        { label: 'Token Paid', value: '₹14.0 Lakhs', color: '#059669' },
        { label: 'Pipeline Comm.', value: '₹36.80 Lakhs', color: '#2563eb' },
        { label: 'Closed This Month', value: '₹6.40 Lakhs', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Kanban Header & Filters', description: 'Filter deals by agent, property, or time period; view total deal volume.', actionHint: 'Filter pipeline' },
        { id: 2, x: 88, y: 19, title: '+ New Deal Button', description: 'Log a new negotiated deal with agreed price, token advance, and commission percentage.', actionHint: 'Click to create deal' },
        { id: 3, x: 36, y: 48, title: 'Token Paid Stage & Receipt', description: 'Shows earnest money paid; click to generate official stamped Token Advance Receipt.', actionHint: 'Issue token receipt' },
        { id: 4, x: 85, y: 48, title: 'Closed Won & GST Invoice', description: 'Sub-Registrar registry completed; 1-click generates GST tax invoice for commission.', actionHint: 'Generate GST invoice' }
      ]
    }
  },
  {
    id: 'documents',
    name: 'Legal Documents Vault',
    shortName: 'Documents',
    category: 'operations',
    icon: FileTextIcon,
    url: '/dashboard/documents',
    screenshotUrl: '/images/tutorials/documents.png',
    badge: 'LEGAL VAULT & DUE DILIGENCE',
    badgeColor: '#059669',
    reraComplianceTag: 'RERA Compliance & Title Deed Scrutiny',
    primaryGoal: 'Store, categorize, and securely share Sale Agreements, Title Deeds, Encumbrance Certificates, and KYC proofs.',
    frequency: 'As transactions enter token and legal due-diligence stages',
    targetRole: 'Documentation Specialists, Legal Coordinators & Brokers',
    closingImpact: 'Zero lost paperwork; accelerates bank loan approvals and Sub-Registrar clearances.',
    tagline: 'Secure document management for RERA compliance, title deeds, and buyer agreements.',
    overview: 'Real estate transactions require meticulous paperwork: Parent Title Deeds, Khata Extracts, Encumbrance Certificates, Sanctioned Plans, and Buyer/Seller PAN & Aadhaar cards. The Documents Vault provides secure cloud storage organized by Deal and Property with quick WhatsApp sharing links.',
    whenToUse: [
      'To upload buyer and seller KYC proofs when a deal reaches token advance stage.',
      'To provide property title papers to the buyer\'s advocate or bank home loan manager.',
      'To archive the stamped Sale Deed and possession handover letter after registry.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter by Document Category',
        action: 'Filter records by Title Deeds, Encumbrance Certificates, Sale Agreements, Tax Receipts, or Client KYC.',
        exactFieldOrButton: 'Document Category Tabs',
        sampleInput: 'Filter: "Title Deeds" • Displays 12 parent deeds',
        result: 'Instantly surfaces required property documents during bank valuation audits.',
        proTip: 'Always verify that Encumbrance Certificates cover at least 15 to 30 continuous years up to the present week.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Upload Property Document Package',
        action: 'Click \'+ Upload Document\'. Select file (PDF, JPG, PNG) and associate it with a Property or Deal.',
        exactFieldOrButton: '+ Upload Document Button',
        sampleInput: 'File: Mother_Deed_Chain_1994.pdf | Link to: Prestige Falcon #1402',
        result: 'Document is tagged, indexed, and stored in secure encrypted cloud storage.',
        proTip: 'Always upload scans at 300 DPI resolution so seal stamps and surveyor signatures are razor-sharp.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Track Advocate Verification Scrutiny',
        action: 'Check that Encumbrance Certificate spans at least 15 to 30 continuous years without gaps. Mark as \'Verified\' once cleared by advocate.',
        exactFieldOrButton: 'Advocate Verification Status Tag',
        sampleInput: 'Opinion: Title Clean & Marketable by Adv. Sundaram & Partners',
        result: 'Gives buyers complete confidence to proceed with agreement signing.',
        proTip: 'Pre-verifying title papers before scheduling site visits reduces deal cancellation rate from 38% down to under 4%.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Generate Secure Advocate WhatsApp Bundle',
        action: 'Click \'Share Bundle Link 🔗\'. Generate an expiring, secure WhatsApp link for the advocate or bank loan manager.',
        exactFieldOrButton: 'Share Bundle Link Trigger',
        sampleInput: 'Recipient: HDFC Loan Manager (+91 98450...) | Bundle: Title Deeds + A-Khata',
        result: 'Parties can view and download without messy email attachments.',
        proTip: 'Watermark documents with "For Legal Verification Only" for client safety.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Deal-Linked Storage Folders',
        type: 'button',
        description: 'Auto-groups documents under their respective Deal Card so nothing gets misplaced.',
        bestPractice: 'Maintain all papers for a deal inside its dedicated folder for instant retrieval.'
      },
      {
        name: 'Advocate Verification Checklist',
        type: 'toggle',
        description: 'Built-in checklist: Encumbrance Certificate (30 yrs), Mother Deed, BBMP A-Khata, Conversion Order.',
        bestPractice: 'Verify that the survey numbers on the Khata match the parent deed.'
      },
      {
        name: 'Advocate WhatsApp Bundle Generator',
        type: 'export',
        description: 'Bundles title deeds, ECs, and tax receipts into a single downloadable link for bank loan managers.',
        bestPractice: 'Watermark documents with "For Legal Verification Only" for client safety.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Advocate Legal Bundle Sharing',
        useCase: 'Send to buyer\'s advocate or bank loan manager for title clearance',
        hinglishScript: 'Namaste Advocate {AdvocateName} ji! {BuyerName} ke deal ke liye complete property legal bundle generate kar diya hai:\n\n1. Mother Deed & Title Chain (30 yrs)\n2. Encumbrance Certificate (2000 - 2024)\n3. Latest BBMP A-Khata Certificate & Tax Paid Receipt\n4. Sanctioned Building Plan\n\n📄 Download Link: {SecureBundleLink}\n\nKripya title verification report share kijiye at the earliest. Thank you!',
        englishScript: 'Dear Advocate {AdvocateName}, regarding the purchase for {BuyerName}, here is the verified document package:\n\n1. Parent Title Deeds (30-year chain)\n2. Encumbrance Certificate (2000 - 2024)\n3. Latest Khata Certificate & Property Tax Receipt\n4. Approved Layout & Sanction Plan\n\n📄 Secure Download: {SecureBundleLink}\n\nPlease share your title scrutiny report at your earliest convenience.'
      }
    ],
    closingTactics: {
      proTip: 'Always obtain an Encumbrance Certificate (EC) for minimum 15 to 30 continuous years, right up to the current week. Banks immediately reject loan applications if the EC has even a 1-year gap in the sequence.',
      legalTrapToAvoid: 'Never upload original physical papers; always scan high-resolution PDFs. Store originals in fireproof bank lockers until registry day.',
      statOrMetric: 'Pre-verifying title papers before scheduling site visits reduces deal cancellation rate from 38% down to under 4%.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Legal Documents Vault (/dashboard/documents)',
      subtitle: 'Transaction Records: 86 Stored Documents • 12 Active Deal Folders',
      stats: [
        { label: 'Total Files', value: '86 Verified', color: '#059669' },
        { label: 'Active Folders', value: '12 Deals', color: '#2563eb' },
        { label: 'Pending Checks', value: '3 Advoc Checks', color: '#b45309' },
        { label: 'Storage Used', value: '2.4 GB / 25 GB', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Category Filter Tabs', description: 'Filter documents by Title Deeds, Encumbrance, Tax Receipts, or KYC proofs.', actionHint: 'Filter by type' },
        { id: 2, x: 88, y: 19, title: '+ Upload Document Button', description: 'Upload deed PDFs, agreements, and client KYC papers linked to deals.', actionHint: 'Upload file' },
        { id: 3, x: 42, y: 50, title: 'Document List & Verification Tag', description: 'Displays file size, upload timestamp, and advocate scrutiny status.', actionHint: 'Inspect verification tag' },
        { id: 4, x: 86, y: 50, title: 'Share Bundle Link Action', description: 'Generates secure WhatsApp download bundle for bank loan managers.', actionHint: 'Share bundle link' }
      ]
    }
  },
  {
    id: 'invoices',
    name: 'Brokerage Invoices & GST Billing',
    shortName: 'Invoices',
    category: 'operations',
    icon: ReceiptIcon,
    url: '/dashboard/invoices',
    screenshotUrl: '/images/tutorials/invoices.png',
    badge: 'GST BILLING & COMMISSION CASHFLOW',
    badgeColor: '#059669',
    reraComplianceTag: 'Indian GST Act • HSN/SAC 997222 Real Estate Broking',
    primaryGoal: 'Generate professional, GST-compliant brokerage tax invoices and track client fee disbursements.',
    frequency: 'Immediately after deal closure and Sub-Registrar execution',
    targetRole: 'Finance Coordinators, Managing Brokers & Agency Founders',
    closingImpact: 'Ensures punctual fee collection with official invoices, GST 18%, and PAN/RERA details.',
    tagline: 'Professional 1-click GST brokerage invoices that get paid on time without haggling.',
    overview: 'Never argue over commission receipts again. The Invoices module generates clean, GST-compliant tax invoices detailing property address, buyer/seller name, agreed commission percentage (1-2%), 18% GST (CGST+SGST), agency RERA number, and your bank account NEFT/RTGS details.',
    whenToUse: [
      'The day property registration is scheduled or completed.',
      'To bill developer sales offices for builder mandate commission payouts.',
      'To record client payments and issue formal stamped payment receipts.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Invoices by Payment Status',
        action: 'Filter bills by All, Paid & Cleared, Pending Payment, or Overdue.',
        exactFieldOrButton: 'Payment Status Filter',
        sampleInput: 'Filter: "Pending Payment" • Shows ₹2.60 Lakhs due',
        result: 'Isolates unpaid invoices for immediate follow-up.',
        proTip: 'Send polite WhatsApp reminders on Day 3 and Day 7 with the stamped registry deed copy.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Create Brokerage Invoice from Deal',
        action: 'Click \'+ New Invoice\' or select \'Generate Invoice\' directly from a Closed Won deal card.',
        exactFieldOrButton: '+ New Invoice Button',
        sampleInput: 'Client: Kishore Reddy | Agreed Price: ₹1,65,00,000 | Brokerage: 1% (₹1,65,000)',
        result: 'Pre-fills Client Name, Property Survey Details, Agreed Price, and Commission Amount.',
        proTip: 'Always issue on the day of registration while parties are at the Sub-Registrar office.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Compute 18% GST (SAC 997222)',
        action: 'Choose 1% or 2% brokerage. System auto-calculates 18% GST (CGST 9% + SGST 9%) with HSN/SAC code 997222.',
        exactFieldOrButton: 'GST 18% Auto Calculator',
        sampleInput: 'Base: ₹1,65,000 | CGST 9%: ₹14,850 | SGST 9%: ₹14,850 | Total: ₹1,94,700',
        result: 'Tax calculations are fully compliant with Indian GST laws.',
        proTip: 'Real estate brokerage services are classified under SAC 997222 with mandatory 18% GST.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Dispatch via WhatsApp & Record Payment',
        action: 'Click \'Send Invoice via WhatsApp 💬\'. When client transfers payment, click \'Record Payment\' to log UTR reference and TDS deduction.',
        exactFieldOrButton: 'Send WhatsApp & Record Payment Action',
        sampleInput: 'UTR: UTR9823746123 | Net Received: ₹1,86,450 | TDS (5% Sec 194H): ₹8,250',
        result: 'Client receives official PDF invoice; status updates to \'Paid & Cleared\'.',
        proTip: 'Remind corporate clients that 5% TDS deducted is deposited against your agency PAN.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Automated 18% GST Engine',
        type: 'button',
        description: 'Separates Base Brokerage from CGST (9%) and SGST (9%) with HSN/SAC code 997222.',
        bestPractice: 'Always quote whether commission is inclusive or exclusive of GST before issuing the token receipt.'
      },
      {
        name: 'Bank RTGS/NEFT Detail Blocks',
        type: 'export',
        description: 'Prints your Bank Name, Account Number, IFSC Code, and UPI ID clearly for instant transfers.',
        bestPractice: 'Use a registered Current Account in your agency entity name to build banking credibility.'
      },
      {
        name: 'Overdue Payment Alerts',
        type: 'filter',
        description: 'Auto-alerts you when an invoice has remained unpaid past the agreed 7-day milestone.',
        bestPractice: 'Follow up politely on Day 3 and Day 7 with the stamped registry deed copy.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Official Brokerage Invoice Dispatch',
        useCase: 'Send on the day of property registration at Sub-Registrar office',
        hinglishScript: 'Namaste {ClientName} ji! Registry complete hone par hardik badhai. Transaction details ke mutabiq aapka official GST Brokerage Invoice #{InvoiceNo} generate kar diya gaya hai:\n\nConsideration: ₹{AgreedPrice}\nBrokerage (1%): ₹{BaseAmount}\nGST (18%): ₹{GSTAmount}\nTotal Payable: ₹{TotalPayable}\n\n📄 Download Invoice PDF: {InvoicePDFLink}\n🏦 Bank Details: {BankName} | A/C: {AccountNo} | IFSC: {IFSC}\n\nKripya RTGS/NEFT confirm kijiye. Thank you for your partnership!',
        englishScript: 'Dear {ClientName}, congratulations on the successful registration of {PropertyName}. Please find attached your official GST Brokerage Invoice #{InvoiceNo}:\n\nDeal Value: ₹{AgreedPrice}\nBrokerage Fee: ₹{BaseAmount}\n18% GST (SAC 997222): ₹{GSTAmount}\nTotal Amount Due: ₹{TotalPayable}\n\n📄 View Invoice: {InvoicePDFLink}\n🏦 Remit to: {BankName} • A/C: {AccountNo} • IFSC: {IFSC}\n\nPlease share the transaction UTR reference upon completion. Thank you!'
      }
    ],
    closingTactics: {
      proTip: 'Real estate brokerage is subject to 5% TDS under Section 194H if paying party is a corporate entity or audited individual. Educate clients that TDS is deposited against your PAN and can be claimed back in your annual ITR.',
      legalTrapToAvoid: 'Never send informal WhatsApp requests like "Sir brokerage bhej dijiye" without an invoice number and GST breakdown. High-net-worth clients delay payments on un-invoiced claims.',
      statOrMetric: 'Brokers issuing formal GST tax invoices collect commission fees 3.8x faster than brokers sending handwritten receipts.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Brokerage Invoices & GST (/dashboard/invoices)',
      subtitle: 'Billing & Collections: ₹12.4 Lakhs Invoiced This Month • 100% On-Time Collection',
      stats: [
        { label: 'Billed This Month', value: '₹12.40 Lakhs', color: '#059669' },
        { label: 'Paid & Cleared', value: '₹9.80 Lakhs', color: '#2563eb' },
        { label: 'Pending Payment', value: '₹2.60 Lakhs', color: '#b45309' },
        { label: 'GST Collected', value: '₹2.23 Lakhs', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Payment Status Filter', description: 'Filter by Paid, Pending, Overdue, or Cancelled invoices.', actionHint: 'Filter by status' },
        { id: 2, x: 88, y: 19, title: '+ New Invoice Button', description: 'Generate a GST tax invoice with commission %, SAC code, and client details.', actionHint: 'Create invoice' },
        { id: 3, x: 42, y: 50, title: 'Invoice Rows & GST Details', description: 'Displays client name, deal value, brokerage fee, and GST 18% amounts.', actionHint: 'Inspect invoice row' },
        { id: 4, x: 86, y: 50, title: 'Download PDF / WhatsApp', description: 'Download branded invoice PDF or dispatch directly over WhatsApp.', actionHint: 'Download PDF or send' }
      ]
    }
  },
  {
    id: 'tasks',
    name: 'Tasks & Action Reminders',
    shortName: 'Tasks',
    category: 'operations',
    icon: CheckSquareIcon,
    url: '/dashboard/tasks',
    screenshotUrl: '/images/tutorials/tasks.png',
    badge: 'OPERATIONAL CHECKLISTS',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Standard Due Diligence Checkpoints',
    primaryGoal: 'Keep track of critical deal checklists, key collections, lawyer follow-ups, and bank valuation appointments.',
    frequency: 'Checked throughout the day as tasks are executed and completed',
    targetRole: 'All Agents, Coordinators & Operations Staff',
    closingImpact: 'Eliminates missed deadlines that derail property closures and irritate clients.',
    tagline: 'Your real estate to-do engine with automated reminders and deal milestone checklists.',
    overview: 'Closing real estate deals involves dozens of tiny, non-negotiable tasks: collecting keys from security, picking up original electricity bills from the owner, checking advocate drafts, and confirming bank valuer timings. The Tasks module keeps your entire agency organized and on schedule.',
    whenToUse: [
      'To schedule post-showing callbacks with prospective buyers.',
      'To assign administrative tasks to team coordinators (e.g. "Collect Khata Extract from BBMP").',
      'To set automated reminders for property possession dates.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Tasks by Urgency Priority',
        action: 'Toggle between All Tasks, High Priority, Due Today, and Completed items.',
        exactFieldOrButton: 'Priority Filter Bar',
        sampleInput: 'Filter: "Urgent Today" • 6 tasks requiring immediate action',
        result: 'Isolates high-urgency milestones that could delay registry if skipped.',
        proTip: 'Tackle "Urgent Today" tasks before taking fresh calls.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Create Priority Deal Task',
        action: 'Click \'+ Add Task\'. Enter Title, Due Date/Time, and Priority (High / Medium / Low).',
        exactFieldOrButton: '+ Add Task Button',
        sampleInput: 'Task: "Collect Society Maintenance NOC & BESCOM Bill" | Due: Friday 4:00 PM | Priority: High',
        result: 'Task appears on your personal queue and Today Workstation screen.',
        proTip: 'Set deadlines for collecting utility receipts at least 5 days prior to registry.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Tick Off Completed Items',
        action: 'Tick the checkbox once completed. System logs timestamp and advances completion rate.',
        exactFieldOrButton: 'Task Completion Checkbox',
        sampleInput: 'Mark Complete: "Society NOC Received and Stored in Documents Vault"',
        result: 'Keeps your operational pipeline tidy and accountable.',
        proTip: 'Checklist-driven deal management prevents 98% of registry day delays.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Link Task Directly to Deal Card',
        action: 'Select Associated Lead or Deal so contextual documents are accessible in 1 click.',
        exactFieldOrButton: 'Linked Deal Card Button',
        sampleInput: 'Linked Deal: Kishore Reddy Deal (Prestige Falcon #1402)',
        result: 'Clicking the task opens the corresponding client card directly.',
        proTip: 'Always link tasks to an active deal so teammates know exactly which transaction is affected.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Priority Urgency Flags',
        type: 'filter',
        description: 'Categorize tasks by urgency: Urgent Today, High Priority, and Upcoming.',
        bestPractice: 'Tackle "Urgent Today" tasks before taking fresh calls.'
      },
      {
        name: 'Deal Milestone Templates',
        type: 'button',
        description: 'One-click apply standard deal checklists: "Token to Agreement" or "Registry Day Checklist".',
        bestPractice: 'Apply the Registry Day Checklist 48 hours prior to Sub-Registrar appointments.'
      },
      {
        name: 'Entity Deep-Linking',
        type: 'button',
        description: 'Click any task to jump straight to the associated Deal or Buyer Profile.',
        bestPractice: 'Always link tasks to a Deal so context is never lost.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Owner Utility Bill & NOC Collection',
        useCase: 'Send to seller 5 days before property registration',
        hinglishScript: 'Namaste {SellerName} ji! Registration date {RegistryDate} finalized hai. Kripya latest Electricity Bill (BESCOM/MSEDCL), Water Tax receipt, aur Society Maintenance NOC ready rakhiye so that registration formalities smoothly complete ho sakein.',
        englishScript: 'Dear {SellerName}, with the registration scheduled for {RegistryDate}, please have the latest Electricity Bill receipt, Water Bill, and Society Maintenance NOC ready for Sub-Registrar submission.'
      }
    ],
    closingTactics: {
      proTip: 'Use a standardized "Registry Day Checklist" 48 hours before visiting the Sub-Registrar: (1) Original PAN & Aadhaar of both parties, (2) DDs for Stamp Duty & Registration, (3) 2 Witnesses with valid photo IDs, (4) Stamped Sale Agreement.',
      legalTrapToAvoid: 'Never assume the owner has cleared the electricity or maintenance bills. Unpaid utility dues can halt possession handovers on registry day.',
      statOrMetric: 'Checklist-driven deal management prevents 98% of registry day delays and document rejections.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Operational Tasks & Checklists (/dashboard/tasks)',
      subtitle: 'Daily Task Queue: 14 Active Tasks • 6 High Priority • 8 Completed Today',
      stats: [
        { label: 'Active Tasks', value: '14 Pending', color: '#2563eb' },
        { label: 'Urgent Today', value: '6 Tasks', color: '#dc2626' },
        { label: 'Completed Today', value: '8 Done', color: '#059669' },
        { label: 'Completion Rate', value: '94%', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Priority Filter Bar', description: 'Filter tasks by All, High Priority, Due Today, or Completed.', actionHint: 'Filter priority' },
        { id: 2, x: 88, y: 19, title: '+ Add Task Button', description: 'Create to-do item with due date, priority flag, and associated deal.', actionHint: 'Add task' },
        { id: 3, x: 38, y: 50, title: 'Checkmark Toggle', description: 'Click to mark task completed and log timestamp.', actionHint: 'Complete task' },
        { id: 4, x: 86, y: 50, title: 'Linked Deal Action', description: 'Jump directly to the associated deal or buyer profile in 1 tap.', actionHint: 'Open deal' }
      ]
    }
  },
  {
    id: 'reports',
    name: 'Reports & Data Exports',
    shortName: 'Reports',
    category: 'operations',
    icon: BarChartIcon,
    url: '/dashboard/reports',
    screenshotUrl: '/images/tutorials/reports.png',
    badge: 'EXECUTIVE AUDIT & CSV EXPORT',
    badgeColor: '#059669',
    reraComplianceTag: 'Annual RERA & Income Tax Documentation',
    primaryGoal: 'Generate structured CSV/Excel downloads and audit logs for accounting, tax filings, and stakeholder reviews.',
    frequency: 'Monthly for book-keeping & Quarterly for agency tax filings',
    targetRole: 'Agency Founders, Financial Auditors & Senior Management',
    closingImpact: 'Clean, exportable financial records for seamless GST filing and RERA annual compliance.',
    tagline: 'Export transaction summaries, commission sheets, and inquiry rosters in 1 click.',
    overview: 'The Reports module gives you total data portability. Generate custom CSV spreadsheets of all inquiries, property listings, completed site visits, and paid brokerage invoices for any date range. Ideal for sharing with your chartered accountant or preparing quarterly investor decks.',
    whenToUse: [
      'At month-end to download the GST Invoicing sheet for your accountant.',
      'To export active buyer lists for targeted WhatsApp or SMS marketing campaigns.',
      'To review historical agent commission payout statements.'
    ],
    steps: [
      {
        number: 1,
        title: 'Select Report Template',
        action: 'Choose from "Commission Revenue", "Buyer Inquiries Roster", "Property Inventory", or "Site Visit Log".',
        exactFieldOrButton: 'Report Type Selector',
        sampleInput: 'Template: "Monthly GST Commission Ledger (SAC 997222)"',
        result: 'Loads report parameters and customizable columns.',
        proTip: 'Hand the GST Commission Ledger to your CA before the 10th of every month for seamless GSTR-1 filing.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Configure Date Range & Export to CSV',
        action: 'Select Current Month, Last Quarter, Financial Year (e.g. FY 2024-25), or Custom Date span. Click \'Export to CSV\'.',
        exactFieldOrButton: 'Date Range Picker & Export Button',
        sampleInput: 'Period: FY 2024-25 • File: AgentLadders_GST_Ledger_October_2026.csv',
        result: 'Downloads clean spreadsheet ready for Microsoft Excel, Google Sheets, or Tally ERP.',
        proTip: 'Export and back up your buyer inquiries on the 1st of every month.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Verify Financial Totals on Screen',
        action: 'Inspect summary totals (Gross Deal Value, Total Invoiced, GST Collected, Net Commission).',
        exactFieldOrButton: 'Summary Totals Banner',
        sampleInput: 'Totals: Gross Volume ₹18.4 Cr | Total Invoiced ₹12.4 L | GST ₹2.23 L',
        result: 'Ensures data accuracy before downloading.',
        proTip: 'Cross-reference Total GST with your bank statement credits to ensure 100% tax reconciliation.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Check RERA Compliance Standing',
        action: 'Confirm that all required tax numbers, SAC codes, and invoice references are present.',
        exactFieldOrButton: 'Compliance Verified Badge',
        sampleInput: 'Compliance: 100% Reconciled • All SAC 9972 codes present',
        result: 'Guarantees compliance with state real estate regulatory authority accounting norms.',
        proTip: 'RERA mandates that licensed real estate agencies preserve transaction logs and brokerage vouchers for a minimum of 5 years.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'GST Commission Ledger',
        type: 'export',
        description: 'Formatted with Invoice No, Client GSTIN, SAC Code, Taxable Value, CGST, and SGST.',
        bestPractice: 'Hand this CSV to your CA before the 10th of every month for seamless GSTR-1 filing.'
      },
      {
        name: 'Buyer Demand Roster Export',
        type: 'export',
        description: 'Download contact rosters with buyer budgets, BHK preferences, and phone numbers.',
        bestPractice: 'Export quarterly to prune unresponsive numbers and refresh marketing lists.'
      },
      {
        name: 'Audit Trail Logs',
        type: 'button',
        description: 'Timestamped record of which agent created, edited, or closed every deal.',
        bestPractice: 'Protects against commission split disputes between team members.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Accountant Tax Filing Handover',
        useCase: 'Send to Chartered Accountant with monthly CSV export',
        hinglishScript: 'Namaste {CAName} sir! Is mahine ka AgentLadders GST Commission Ledger export attached hai. Total Taxable Brokerage: ₹{TaxableAmount}, Total 18% GST: ₹{GSTAmount}. Kripya GSTR-1 aur 3B reconcile kar lijiye.',
        englishScript: 'Dear {CAName}, attached is our monthly Brokerage Commission & GST Ledger from AgentLadders for GSTR-1 filing. Taxable Amount: ₹{TaxableAmount}, 18% GST: ₹{GSTAmount}. Please let us know if any supporting vouchers are needed.'
      }
    ],
    closingTactics: {
      proTip: 'Export and back up your buyer inquiries on the 1st of every month. Your client database is your agency\'s single most valuable enterprise asset.',
      legalTrapToAvoid: 'Never delete historical transactions. RERA mandates that licensed real estate agencies preserve transaction logs and brokerage vouchers for a minimum of 5 years.',
      statOrMetric: 'Automated 1-click CSV exports save broker agencies an average of 14 administrative hours every month during tax filing season.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Reports & Financial Data Export (/dashboard/reports)',
      subtitle: 'Data Export Center: Ready-to-Download CSV Statements for GST & Audit',
      stats: [
        { label: 'Available Reports', value: '8 Templates', color: '#059669' },
        { label: 'Q2 Export Value', value: '₹14.80 Lakhs', color: '#2563eb' },
        { label: 'GST File Ready', value: '100% Reconciled', color: '#7c3aed' },
        { label: 'Last Exported', value: 'Yesterday 5:20 PM', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 19, title: 'Report Template Selector', description: 'Choose from GST Commission, Buyer Roster, or Inventory reports.', actionHint: 'Select template' },
        { id: 2, x: 88, y: 19, title: 'Export to CSV Button', description: 'One-click download of filtered dataset formatted for Microsoft Excel.', actionHint: 'Download CSV' },
        { id: 3, x: 42, y: 50, title: 'Summary KPI Banner', description: 'Displays gross consideration, invoiced commission, and tax amounts.', actionHint: 'Verify totals' },
        { id: 4, x: 86, y: 50, title: 'Compliance Status Badge', description: 'Confirms that all required tax numbers and invoice references are present.', actionHint: 'Verify compliance' }
      ]
    }
  },
  {
    id: 'support',
    name: 'Help & Support Desk',
    shortName: 'Help & Support',
    category: 'admin',
    icon: MessageCircleIcon,
    url: '/dashboard/support',
    screenshotUrl: '/images/tutorials/support.png',
    badge: 'PRIORITY ASSISTANCE & HOTLINE',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Dedicated Real Estate Technology Helpdesk',
    primaryGoal: 'Access dedicated WhatsApp priority support, open technical tickets, and review FAQs.',
    frequency: 'As needed whenever assistance or account customization is required',
    targetRole: 'All Platform Users & Agency Administrators',
    closingImpact: 'Zero downtime; ensures you never get blocked during a critical high-stakes deal negotiation.',
    tagline: 'Direct WhatsApp support and rapid technical assistance for Indian real estate brokers.',
    overview: 'Real estate moves fast, especially on weekend site visits. If you ever encounter an issue generating a WhatsApp brochure, need assistance configuring custom commission splits, or have questions about RERA formatting, our priority broker support team is just one message away.',
    whenToUse: [
      'When you need fast assistance with document templates or WhatsApp formatting.',
      'To report a bug or request a custom feature for your agency.',
      'To connect directly with the AgentLadders engineering and onboarding team.'
    ],
    steps: [
      {
        number: 1,
        title: 'Review Knowledge Base FAQs',
        action: 'Scan curated FAQs on GST billing, WhatsApp flyer formatting, and RERA registration.',
        exactFieldOrButton: 'Frequently Asked Questions Grid',
        sampleInput: 'Search: "How to configure 18% GST on brokerage invoice?"',
        result: 'Provides instant answers and step-by-step guidance without waiting for support.',
        proTip: 'Check the FAQ section first; 80% of common workflow questions have instant visual guides.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Launch Direct WhatsApp Support Chat',
        action: 'Click \'WhatsApp Direct Chat 💬\'. Connects you directly to our dedicated support engineer on WhatsApp.',
        exactFieldOrButton: 'Direct WhatsApp Support Button',
        sampleInput: 'Hotline: +91 91122 33445 | Status: Online Now (Avg Response: 11 Mins)',
        result: 'Opens WhatsApp chat with pre-populated broker account information.',
        proTip: 'Save the AgentLadders WhatsApp hotline directly in your mobile phone favorites for instant access during site visits.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Submit Technical Ticket with Screenshots',
        action: 'Fill in Subject, Description, and attach relevant screenshots or Invoice numbers. Click \'Submit Ticket\'.',
        exactFieldOrButton: 'Submit Ticket Form',
        sampleInput: 'Subject: Custom Commission Split Setup | Details: Need 60/40 split configuration',
        result: 'Issues a tracking ticket with an SLA response guarantee of under 30 minutes.',
        proTip: 'Include the Deal ID or Invoice Number for the fastest technical resolution.',
        hotspotIndex: 3
      }
    ],
    keyControls: [
      {
        name: 'Direct WhatsApp Helpline',
        type: 'button',
        description: 'Talk to real human real-estate tech specialists on WhatsApp, 7 days a week.',
        bestPractice: 'Use for urgent weekend site visit issues or immediate invoice fixes.'
      },
      {
        name: 'Ticketing & SLA Tracking',
        type: 'button',
        description: 'Track open tickets with guaranteed response time of under 30 minutes during business hours.',
        bestPractice: 'Include screenshots or error messages for fastest technical resolution.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Quick Technical Escalation Message',
        useCase: 'Send to AgentLadders VIP support line during urgent deal closing',
        hinglishScript: 'Hello AgentLadders Support! Main abhi Sub-Registrar office mein hoon. Deal #{DealID} ka GST Invoice generate karne mein bank detail update chahiye. Kripya priority assist kijiye!',
        englishScript: 'Hello AgentLadders Support, I am currently at the registry office. Need urgent assistance with updating bank details on Invoice #{InvoiceNo} for deal closing. Please assist on priority.'
      }
    ],
    closingTactics: {
      proTip: 'Save the AgentLadders WhatsApp hotline directly in your mobile phone favorites so you can reach tech support in seconds from any site showing.',
      legalTrapToAvoid: 'Never post unverified questions in open public broker groups; consult verified support to ensure compliance with state RERA standards.',
      statOrMetric: 'Average support ticket resolution time on AgentLadders is under 11 minutes across 7 days a week.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Help & Support Desk (/dashboard/support)',
      subtitle: 'Broker Support: Direct WhatsApp Hotline • Under 15m Response Time',
      stats: [
        { label: 'Hotline Status', value: 'Online Now', color: '#059669' },
        { label: 'Avg Response', value: '11 Minutes', color: '#2563eb' },
        { label: 'SLA Guarantee', value: '99.8% Uptime', color: '#7c3aed' },
        { label: 'Support Days', value: '7 Days / Week', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 38, y: 50, title: 'FAQ & Help Center', description: 'Curated knowledge base answering common broker workflow questions.', actionHint: 'Browse FAQs' },
        { id: 2, x: 88, y: 19, title: 'Direct WhatsApp Hotline', description: 'Launches WhatsApp chat with dedicated support engineer.', actionHint: 'Launch WhatsApp' },
        { id: 3, x: 84, y: 50, title: 'Submit Ticket Action', description: 'Create formal ticket for account customization or invoice fixes.', actionHint: 'Create ticket' }
      ]
    }
  },
  {
    id: 'settings',
    name: 'Agency Settings & Custom Branding',
    shortName: 'Settings',
    category: 'admin',
    icon: SettingsIcon,
    url: '/dashboard/settings',
    screenshotUrl: '/images/tutorials/settings.png',
    badge: 'AGENCY BRANDING & RERA CONFIG',
    badgeColor: '#7c3aed',
    reraComplianceTag: 'Mandatory State RERA Broker Registration',
    primaryGoal: 'Configure agency brand logo, RERA license numbers, bank payout details, and commission splits.',
    frequency: 'Initial onboarding & periodically when team or bank credentials update',
    targetRole: 'Agency Owners & Administrative Managers',
    closingImpact: 'Establishes high-trust professional credibility on every client flyer, invoice, and agreement.',
    tagline: 'Brand your workstation with your logo, RERA credentials, and automated commission structures.',
    overview: 'Your Agency Settings configure how AgentLadders looks to your clients. Upload your high-resolution company logo, record your state RERA broker registration number, enter GSTIN tax details, define default commission splits (e.g. 50/50 agent-agency), and configure bank RTGS/NEFT accounts for instant invoice embedding.',
    whenToUse: [
      'During your first day setup of AgentLadders.',
      'To update company logo, business address, or RERA certificate renewals.',
      'To change bank account details where brokerage commissions are disbursed.'
    ],
    steps: [
      {
        number: 1,
        title: 'Upload Official Agency Logo',
        action: 'Click \'Upload Logo\'. Choose a high-resolution PNG or JPG file with a clean or transparent background.',
        exactFieldOrButton: 'Agency Logo Uploader',
        sampleInput: 'File: Prestige_Realty_Logo_HighRes.png (Transparent PNG, 800x200 px)',
        result: 'Logo appears across your left sidebar, WhatsApp property flyers, and PDF invoices.',
        proTip: 'Use a transparent PNG logo with a horizontal aspect ratio for the crispest display on client flyers.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Save Changes & Apply Globally',
        action: 'Click \'Save Changes\'. All team members\' workstations and client documents are updated instantly.',
        exactFieldOrButton: 'Save Changes Button',
        sampleInput: 'Status: Configuration Saved & Broadcasted to All Agent Terminals',
        result: 'Your workspace is 100% white-labeled and compliance ready.',
        proTip: 'Review bank coordinates whenever you open a new branch or update IFSC codes.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Configure RERA Broker Registration & GSTIN',
        action: 'Enter your official State RERA Registration Number (e.g. PRM/KA/RERA/1251/...) and 15-digit GSTIN tax number.',
        exactFieldOrButton: 'RERA & GSTIN Tax Credentials Form',
        sampleInput: 'RERA No: PRM/KA/RERA/1251/309/AG/180512/000987 | GSTIN: 29AAAAA0000A1Z5',
        result: 'Auto-appends verified compliance credentials to every client flyer and GST tax invoice.',
        proTip: 'Displaying verified RERA credentials on WhatsApp brochures reduces client price haggling by 58%.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Enter Bank Payout Coordinates',
        action: 'Fill in Bank Name, Beneficiary Name, Account Number, IFSC Code, and UPI ID.',
        exactFieldOrButton: 'Bank Account Coordinates Form',
        sampleInput: 'Bank: HDFC Bank | A/C Name: AgentLadders Realty LLP | A/C No: 50200088991122 | IFSC: HDFC0001234',
        result: 'Automatically printed on client brokerage invoices for instant NEFT/RTGS wire transfers.',
        proTip: 'Use a dedicated Current Account in your agency entity name to build institutional banking credibility.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Agency White-Labeling',
        type: 'button',
        description: 'Brand every client touchpoint with your official agency name and colors.',
        bestPractice: 'Upload a clean transparent PNG logo for the sharpest rendering on client flyers.'
      },
      {
        name: 'RERA Compliance Badging',
        type: 'button',
        description: 'Ensures marketing brochures adhere to state real estate regulatory authority standards.',
        bestPractice: 'Keep your active RERA registration number valid and updated.'
      },
      {
        name: 'Bank Payout Coordinates',
        type: 'export',
        description: 'Prints accurate NEFT/RTGS/IMPS coordinates directly on invoice footers.',
        bestPractice: 'Double-check IFSC code to avoid rejected wire transfers from corporate developers.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Agency RERA Credential Sharing',
        useCase: 'Share when an institutional or NRI client asks for verification',
        hinglishScript: 'Namaste {ClientName} ji! Hamari agency {AgencyName} state RERA registered real estate consultancy hai. Hamara official RERA Broker Registration Number: {RERANo}. Aap government RERA portal par hamara license verify kar sakte hain.',
        englishScript: 'Dear {ClientName}, {AgencyName} is a fully licensed real estate consultancy registered under RERA. Our Official Broker Registration Number is: {RERANo}. You can verify our credentials directly on the state RERA portal.'
      }
    ],
    closingTactics: {
      proTip: 'High-net-worth buyers and NRIs verify broker credentials on the state RERA portal before transferring earnest money tokens. Displaying your RERA number prominently builds immediate trust.',
      legalTrapToAvoid: 'Operating a real estate brokerage without an active state RERA registration can attract severe regulatory penalties. Always renew your license 90 days before expiry.',
      statOrMetric: 'Brokers displaying verified RERA credentials on WhatsApp brochures experience 58% fewer price haggle objections.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Agency Settings & Branding (/dashboard/settings)',
      subtitle: 'Agency Profile: RERA Verified • Custom Logo Configured • GSTIN Active',
      stats: [
        { label: 'Profile Status', value: '100% Complete', color: '#059669' },
        { label: 'RERA Verified', value: 'Active Valid', color: '#2563eb' },
        { label: 'GSTIN Linked', value: 'Active SAC 9972', color: '#7c3aed' },
        { label: 'Team Members', value: '6 Agents Active', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 32, y: 32, title: 'Logo Upload Area', description: 'Upload company logo displayed on sidebar, flyers, and invoice headers.', actionHint: 'Upload logo' },
        { id: 2, x: 88, y: 19, title: 'Save Changes Button', description: 'Saves agency branding and broadcasts update to all team workstations.', actionHint: 'Save settings' },
        { id: 3, x: 68, y: 32, title: 'RERA & GSTIN Credentials', description: 'Ensures compliance with state regulatory authority marketing rules.', actionHint: 'Enter RERA ID' },
        { id: 4, x: 32, y: 68, title: 'Bank Account Block', description: 'Configures NEFT/RTGS/UPI coordinates printed on client tax invoices.', actionHint: 'Update bank details' }
      ]
    }
  }
];


