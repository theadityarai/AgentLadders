import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  TrendingUpIcon,
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

export interface ModalShowcaseItem {
  modalTitle: string;
  triggerButton: string;
  purpose: string;
  keyFields: { fieldName: string; inputType: string; guidance: string }[];
  operatorTip: string;
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
  modalShowcase: ModalShowcaseItem[];
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

// ─── Complete 12-Module Tutorial Dataset ──────────────────────────────────────

export const MODULE_TUTORIALS: ModuleTutorial[] = [
  // ── 1. TODAY DASHBOARD ──────────────────────────────────────────────────────
  {
    id: 'today',
    name: 'Today Dashboard (Broker Cockpit)',
    shortName: 'Today Dashboard',
    category: 'core',
    icon: HomeIcon,
    url: '/dashboard',
    screenshotUrl: '/images/tutorials/today.png',
    badge: 'DAILY COMMAND CENTER',
    badgeColor: '#059669',
    reraComplianceTag: 'Broker Standard Operating Procedure (SOP)',
    primaryGoal: 'Clear morning urgent buyer callback queue, dispatch Google Maps pins for today\'s showings, and track monthly pipeline value.',
    frequency: 'Morning Briefing (9:00 AM) & Evening Closeout (6:30 PM)',
    targetRole: 'All Property Consultants, Team Leaders & Managing Brokers',
    closingImpact: 'Calling fresh buyer leads within 15 minutes yields an 8x higher qualification rate and locks out competing brokerages.',
    tagline: 'Your morning operational cockpit for urgent callbacks, showing schedules, and pipeline revenue velocity.',
    overview: 'The Today Workstation cuts through administrative clutter. Rather than scrolling through unorganized WhatsApp chats or messy spreadsheets, this screen aggregates your highest-urgency tasks: hot inquiries registered in the last 24 hours, scheduled site inspections with clean non-overlapping time badges (e.g. 10:00 AM - 11:00 AM), direct Google Maps society gate pins, and total pipeline value in Indian Crores (₹24.0 Cr).',
    whenToUse: [
      'First thing at 9:00 AM to organize your day\'s calling list and inspect scheduled showing routes.',
      'Before departing for field visits to confirm caretaker keys and dispatch WhatsApp pins to clients.',
      'At 6:00 PM to log completed showings, capture client counter-offers, and advance deal milestones.'
    ],
    steps: [
      {
        number: 1,
        title: 'Launch One-Click Quick Actions',
        action: 'Use the top-right header action buttons "🏎️ Book Site Visit" or "➕ Add New Buyer" to log client appointments or inquiries without leaving your dashboard.',
        exactFieldOrButton: 'Header Quick Actions ("🏎️ Book Site Visit" & "➕ Add New Buyer")',
        sampleInput: 'Action: "+ Add New Buyer" • Name: Vikram Malhotra • Budget: ₹7.0 - ₹9.5 Cr • 4 BHK Worli',
        result: 'Instantly opens the modal drawer and registers the client into your CRM database.',
        proTip: 'Always register fresh inquiries immediately while buyer criteria and urgency are crisp.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Audit Morning KPI Pulse & Pipeline Value',
        action: 'Scan the 4 top metric cards: Site Visits Today (with completion progress), Active Buyers (highlighting Hot Leads), Listed Inventory count, and Pipeline Value in Indian Crores (₹24.0 Cr).',
        exactFieldOrButton: 'Top KPI Pulse Cards (Site Visits Today, Active Buyers, Listed Inventory, Pipeline Value)',
        sampleInput: 'Pipeline: ₹24.0 Cr across 8 active negotiations | Active Buyers: 10 (3 Hot Leads) | Visits: 1 Scheduled',
        result: 'Gives instant operational clarity on today\'s revenue pipeline and immediate closing targets.',
        proTip: 'Never start field visits without verifying that your Active Buyers count has at least 3 tagged as "Hot Buyer".',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Clear Urgent Enquiries & Follow-Ups Before 11:30 AM',
        action: 'Review client inquiry cards in the left column. Filter by Hot (3), New Inbound (2), or Negotiation (1). Tap the WhatsApp or Call triggers to pitch curated options.',
        exactFieldOrButton: 'Client Enquiries Roster & WhatsApp Pitch Triggers',
        sampleInput: 'Buyer: Vikram Malhotra (Hot Buyer) • Looking for 4 BHK in Worli/Lower Parel • Budget: ₹7.0 - ₹9.5 Cr',
        result: 'Opens WhatsApp Web or mobile dialer with client details and suggested inventory pre-formatted.',
        proTip: 'Morning real estate calls (9:30 AM - 11:30 AM) have a 64% higher answer rate than afternoon calls.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Inspect Today\'s Site Visits Timeline',
        action: 'Review scheduled property showings in the right timeline. Check time-slot badges (e.g. 10:00 AM - 11:00 AM [Scheduled]), property name, and click to view full showing details.',
        exactFieldOrButton: 'Today\'s Site Visits Timeline (Right Panel)',
        sampleInput: 'Showing: 10:00 AM - 11:00 AM • 3 BHK Prime Garden Flat, Prestige Kingfisher • Dr. Arvind Singhania',
        result: 'Ensures punctual arrivals and confirms gate security passes before clients arrive at the site.',
        proTip: 'Send the Google Maps pin exactly 2 hours before the appointment to prevent client delays and no-shows.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Urgent Callback Queue',
        type: 'button',
        description: 'Auto-sorts prospective buyers who requested pricing or brochures in the last 24 hours.',
        bestPractice: 'Call before noon; morning calls achieve an 8x higher qualification conversion rate.'
      },
      {
        name: 'Fixed Time-Slot Showing Badges',
        type: 'button',
        description: 'Displays clean intervals (e.g. 10:00 AM - 11:00 AM) with distinct status pills (Scheduled, Confirmed, Completed).',
        bestPractice: 'Allow at least 45 minutes between showings in different micro-markets to account for traffic.'
      },
      {
        name: 'Pipeline Value Indicator',
        type: 'export',
        description: 'Real-time calculation of active consideration values in Indian Crores across all negotiation stages.',
        bestPractice: 'Maintain at least ₹20+ Cr in active negotiations to ensure consistent ₹4+ Lakh monthly commission receipts.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Book Site Visit Modal',
        triggerButton: '🏎️ Book Site Visit (Header)',
        purpose: 'Schedule buyer property walkthroughs with exact time intervals and instant WhatsApp notifications.',
        keyFields: [
          { fieldName: 'Client Selector', inputType: 'CustomSelect', guidance: 'Select qualified buyer from active roster' },
          { fieldName: 'Property Listing', inputType: 'CustomSelect', guidance: 'Choose matching verified property from inventory' },
          { fieldName: 'Showing Type', inputType: 'Pill Toggle', guidance: 'Select "Buy Showing" or "Rent Showing"' },
          { fieldName: 'Date & Time Slot', inputType: 'Date + Time Picker', guidance: 'Set unhurried 45-60 minute inspection window' }
        ],
        operatorTip: 'Check the "Send WhatsApp Invitation" toggle to instantly dispatch the Google Maps link to both buyer and caretaker.'
      },
      {
        modalTitle: 'Add New Buyer Inquiry Modal',
        triggerButton: '➕ Add New Buyer (Header)',
        purpose: 'Capture incoming client criteria, budget range in Crores, and immediate micro-market preferences.',
        keyFields: [
          { fieldName: 'Full Name & WhatsApp Phone', inputType: 'Text & Tel', guidance: 'Include country code (+91)' },
          { fieldName: 'Budget Range (Min/Max)', inputType: 'Number / Currency', guidance: 'Format in Indian Crores / Lakhs' },
          { fieldName: 'BHK & Locality Preferences', inputType: 'Multi-select CustomSelect', guidance: 'Pinpoint primary and secondary choices' }
        ],
        operatorTip: 'Always mark lead temperature as "Hot Buyer" if they possess pre-sanctioned bank loan approval.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Morning Site Visit Confirmation Script',
        useCase: 'Send to buyer 2 hours before scheduled physical inspection',
        hinglishScript: 'Namaste {BuyerName} ji! Aaj {TimeSlot} par hamara {PropertyName} ka site visit scheduled hai. Location pin aur society gate navigation link: {MapsLink}. Main 10 minute pehle gate par milunga!',
        englishScript: 'Good morning {BuyerName}! Confirming our site visit for {PropertyName} today at {TimeSlot}. Here is the Google Maps location pin: {MapsLink}. I will be waiting at Gate 1 to receive you.'
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
      subtitle: 'Daily Command Center: 1 Showing Scheduled • 10 Active Buyers • ₹24.0 Cr Pipeline',
      stats: [
        { label: 'Site Visits Today', value: '1 Scheduled', color: '#059669' },
        { label: 'Active Buyers', value: '10 (3 Hot)', color: '#2563eb' },
        { label: 'Listed Inventory', value: '12 Units', color: '#7c3aed' },
        { label: 'Pipeline Value', value: '₹24.0 Cr', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 80, y: 15, title: 'Quick Action Header Buttons', description: 'One-click modals to book a site visit or register a new buyer without page navigation.', actionHint: 'Click to launch booking modal' },
        { id: 2, x: 50, y: 30, title: 'KPI Pulse Cards', description: 'Real-time overview of active showings, hot leads, listed properties, and ₹24.0 Cr pipeline value.', actionHint: 'Inspect daily operational metrics' },
        { id: 3, x: 35, y: 58, title: 'Client Enquiries & Follow-Ups', description: 'Priority buyer roster with budget in Crores, BHK criteria, and 1-click WhatsApp/Call triggers.', actionHint: 'Review buyer card & pitch' },
        { id: 4, x: 86, y: 58, title: 'Today\'s Site Visits Timeline', description: 'Clean time-interval showing schedule with property name, client contact, and status pills.', actionHint: 'Inspect scheduled visit card' }
      ]
    }
  },

  // ── 2. INQUIRIES & BUYER LEADS ──────────────────────────────────────────────
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
    primaryGoal: 'Capture buyer criteria (budget in Crores, BHK, locality) and instantly generate matching inventory pitches.',
    frequency: 'Continuously as leads arrive from portals, Meta Ads, and WhatsApp referrals',
    targetRole: 'Inside Sales, Lead Qualifiers & Sourcing Brokers',
    closingImpact: 'Fast lead qualification with instant WhatsApp brochures reduces buyer drop-off by 72%.',
    tagline: 'Never let prospective buyers slip through with AI Magic Match and 1-click WhatsApp brochures.',
    overview: 'The Inquiries module is your buyer relationship engine. It organizes active leads across transaction types (Buy/Purchase, Rent/Tenant) and pipeline statuses (New Inbound, Contacted, Qualified, Site Visit Scheduled, Negotiation, Won). Filter by inbound channel (WhatsApp Referral, 99acres, Direct Referral) and review exact budget ranges in Crores (e.g. Up to ₹9.5 Cr, Up to ₹16 Cr).',
    whenToUse: [
      'Whenever a lead pings your phone from 99acres, MagicBricks, Housing, or WhatsApp referrals.',
      'To segment buyers by budget range (e.g. ₹7.0 - ₹9.5 Cr luxury buyers vs ₹1.5 Cr first-timers).',
      'To dispatch professional property brochures with clean pricing breakdowns over WhatsApp.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter & Segment Buyer Roster',
        action: 'Use the inquiry type pills (All Inquiries 10, Buy / Purchase 8, Rent / Tenant 2) and status filters to isolate active pipeline leads.',
        exactFieldOrButton: 'Inquiry Type & Status Filter Pills',
        sampleInput: 'Filter: "Buy / Purchase (8)" • Status: "Active Pipeline (8)"',
        result: 'Surfaces high-intent buyers ready for immediate property tours.',
        proTip: 'Filter by "Site Visit Scheduled" on Friday afternoon to finalize weekend client routes.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Capture Detailed Buyer Requirements',
        action: 'Click "+ Add Inquiry". Enter Client Name, WhatsApp Phone, Inbound Source (via CustomSelect), Budget Range (e.g. Up to ₹9.5 Cr), BHK, and Vastu requirements.',
        exactFieldOrButton: '+ Add Inquiry Button (Top Right)',
        sampleInput: 'Name: Vikram Malhotra | Phone: +91 98200 45678 | Source: WhatsApp Referral | Requirement: 4 BHK Mumbai (East Facing)',
        result: 'Creates an indexed buyer profile with budget and configuration preferences locked in.',
        proTip: 'Always capture specific Vastu preferences (East Facing, North-East) early to eliminate mismatched proposals.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Review Client Profile & Channel Attribution',
        action: 'Inspect buyer cards showing inbound channel badge (WhatsApp Referral, 99acres, Direct Referral), locality, and maximum purchasing power.',
        exactFieldOrButton: 'Client Details & Inbound Source Columns',
        sampleInput: 'Client: Priya & Rahul Sharma • Inbound: 99acres • Req: 3 BHK Gurgaon • Budget: Up to ₹16 Cr',
        result: 'Provides instant context on lead provenance and negotiation readiness.',
        proTip: 'Direct referrals close at a 4x higher rate than cold portal inquiries; prioritize them for immediate callbacks.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Trigger Direct Actions (WhatsApp, Call, Edit)',
        action: 'Click the green WhatsApp icon or phone icon next to the lead to dispatch curated property brochures or start a phone conversation.',
        exactFieldOrButton: 'Actions Column (WhatsApp 💬, Phone 📞, Edit ✏️)',
        sampleInput: 'Action: Tap WhatsApp icon -> Auto-generates personalized pitch for 4 BHK Lodha Park',
        result: 'Launches WhatsApp Web/Mobile with pre-filled message formatted with property highlights.',
        proTip: 'Always end your WhatsApp pitch with an alternative-choice question ("Saturday 11 AM ya Sunday 4 PM?") to double showing conversion.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Inbound Channel Attribution',
        type: 'filter',
        description: 'Categorizes leads by origin: WhatsApp Referral, 99acres, Direct Referral, Walk-in, or Meta Ads.',
        bestPractice: 'Track channel conversion to allocate marketing budget toward your highest-ROI lead sources.'
      },
      {
        name: 'Status Progression Dropdown',
        type: 'button',
        description: 'Move leads through New Inbound -> Contacted -> Qualified -> Site Visit Scheduled -> Negotiation.',
        bestPractice: 'Never leave a lead in "New Inbound" for more than 2 hours without logging an initial touchpoint.'
      },
      {
        name: '1-Click WhatsApp Trigger',
        type: 'button',
        description: 'Instantly opens chat with buyer details and pre-composed property flyer preview.',
        bestPractice: 'Send formatted text with bullet points rather than raw PDF attachments for 3x higher click-throughs.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Add New Inquiry Modal',
        triggerButton: '+ Add Inquiry Button',
        purpose: 'Capture comprehensive buyer preferences, budget thresholds in Indian Crores, and channel attribution.',
        keyFields: [
          { fieldName: 'Client Full Name', inputType: 'Text', guidance: 'Primary decision maker name' },
          { fieldName: 'WhatsApp Phone', inputType: 'Tel', guidance: 'Include country code (+91)' },
          { fieldName: 'Inbound Source', inputType: 'CustomSelect', guidance: '99acres, MagicBricks, WhatsApp Referral, Direct' },
          { fieldName: 'Transaction Type', inputType: 'Pill Toggle', guidance: 'Buy / Purchase or Rent / Lease' },
          { fieldName: 'Max Budget (₹ Cr)', inputType: 'Number / Currency', guidance: 'Enter realistic upper limit (e.g. ₹9.5 Cr)' },
          { fieldName: 'BHK & Locality Preferences', inputType: 'CustomSelect', guidance: 'Preferred micro-market & orientation' }
        ],
        operatorTip: 'Add specific family notes (e.g. "Doctor couple needing quiet study room") in the notes field to personalize future pitches.'
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
      windowTitle: 'AgentLadders • Buyer Inquiries & Leads (/dashboard/leads)',
      subtitle: 'Buyer Demand: 10 Active Leads • High-Intent Luxury Buyers in Mumbai & NCR',
      stats: [
        { label: 'Total Inquiries', value: '10 Active', color: '#2563eb' },
        { label: 'Buy / Purchase', value: '8 Leads', color: '#059669' },
        { label: 'Rent / Tenant', value: '2 Leads', color: '#7c3aed' },
        { label: 'Top Budget', value: '₹16.0 Cr', color: '#dc2626' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 22, title: 'Inquiry Type & Status Filter Bar', description: 'Filter leads by Buy/Rent transaction type, pipeline stage, and inbound marketing source.', actionHint: 'Filter by inquiry stage' },
        { id: 2, x: 92, y: 13, title: '+ Add Inquiry Button', description: 'Opens new lead modal to capture buyer budget in Crores, BHK configuration, and contact details.', actionHint: 'Click to add inquiry' },
        { id: 3, x: 35, y: 52, title: 'Client Details & Requirements', description: 'Displays buyer name, verified phone, inbound source badge, and budget in Indian Crores.', actionHint: 'Review client profile' },
        { id: 4, x: 91, y: 52, title: 'Action Triggers (WhatsApp & Phone)', description: 'One-click launch to WhatsApp chat with pre-filled brochure pitch or direct mobile call.', actionHint: 'Tap WhatsApp icon to pitch' }
      ]
    }
  },

  // ── 3. PROPERTIES & INVENTORY ───────────────────────────────────────────────
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
    primaryGoal: 'Catalog verified builder listings and resale inventory with carpet areas, floor levels, parking slots, and digital flyers.',
    frequency: 'Daily updates as fresh inventory arrives from developers and owners',
    targetRole: 'Listing Specialists, Mandate Managers & Property Consultants',
    closingImpact: 'Accurate pricing and instant digital brochures build client trust and eliminate haggling over carpet area.',
    tagline: 'Your digital inventory showcase with high-res galleries, RERA details, and client flyers.',
    overview: 'The Properties module houses your agency\'s inventory assets. From luxury sea-facing residences in Worli (₹8.5 Cr) to golf course apartments on Golf Course Road (₹14.5 Cr) and prime garden homes in Indiranagar (₹3.85 Cr), track listing status (Available 7, Under Offer 2, Sold 2), carpet area in square feet, OC possession readiness, Vastu orientation, and covered parking slots.',
    whenToUse: [
      'When onboarding a new exclusive resale mandate or direct builder developer inventory.',
      'To check available configurations and floor levels during a buyer phone consultation.',
      'To generate clean, co-branded WhatsApp flyers without revealing owner personal numbers.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Inventory by Listing Type & Status',
        action: 'Use the listing type pills (All Inventory 12, For Sale 9, For Rent 3) and property status pills (Available 7, Under Offer 2, Sold 2) to identify ready options.',
        exactFieldOrButton: 'Listing Type & Property Status Filter Pills',
        sampleInput: 'Filter: "For Sale (9)" • Status: "Available (7)"',
        result: 'Isolates active properties ready for immediate buyer showings.',
        proTip: 'Always verify if units have "OC Received" before proposing to buyers looking for immediate move-in.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Onboard New Listing with RERA Project ID',
        action: 'Click "+ Add Property". Enter Project Name, Property Type (via CustomSelect), Asking Price in Crores, RERA Carpet Area, and mandatory State RERA ID.',
        exactFieldOrButton: '+ Add Property Button (Top Right)',
        sampleInput: 'Project: Lodha Park | Unit: 4 BHK Sea-Facing | Price: ₹8.5 Cr | Area: 2450 sq.ft. Carpet | RERA: P51900001339',
        result: 'Listing is saved and automatically indexed for AI Magic Match searches.',
        proTip: 'Under RERA guidelines, always state certified Carpet Area prominently, not just the Super Built-Up Area.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect High-Resolution Property Showcase Cards',
        action: 'Review property cards displaying asking price in Crores (₹8.5 Cr, ₹14.5 Cr, ₹3.85 Cr), micro-market locality, carpet area badge, and OC status.',
        exactFieldOrButton: 'Property Showcase Card & Specification Badges',
        sampleInput: 'Card: ₹14.5 Cr • 3 BHK High-Rise Golf Course Apartment • Golf Course Road • 3850 sq.ft. • OC Received',
        result: 'Provides comprehensive technical details for quick buyer inquiries.',
        proTip: 'Listings highlighting "Ready to Move (OC Received)" convert 2.8x faster than under-construction units.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Review Amenities & Orientation Tags',
        action: 'Check orientation tags (East Facing Vastu Compliant, North-East / Ishanya), furnishing status (Fully Furnished, Semi-Furnished), and covered car parking.',
        exactFieldOrButton: 'Vastu & Amenities Pills (East Facing, 3+ Covered Car Parks)',
        sampleInput: 'Tags: East Facing (Vastu Compliant) • Fully Furnished • 3+ Covered Car Parks',
        result: 'Assures clients of premium specifications matching luxury standards.',
        proTip: 'High-net-worth buyers in India prioritize North-East or East orientation; always highlight this in WhatsApp flyers.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Carpet Area vs Super Built-up Area Display',
        type: 'button',
        description: 'RERA-mandated carpet area specification alongside built-up area for statutory transparency.',
        bestPractice: 'Always quote carpet area first to maintain RERA compliance and prevent legal disputes.'
      },
      {
        name: 'Photo Carousel Navigator',
        type: 'button',
        description: 'Browse interior, facade, and amenity photos directly on the card (e.g. 1/6, 1/4).',
        bestPractice: 'Upload minimum 5 high-res photos: living room, master suite, kitchen, balcony view, and society clubhouse.'
      },
      {
        name: 'Owner Contact Isolation',
        type: 'toggle',
        description: 'Keeps owner phone numbers and confidential floor numbers 100% hidden on client-facing brochures.',
        bestPractice: 'Never reveal seller contact details until earnest money token terms are formally signed.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Add Property Listing Modal',
        triggerButton: '+ Add Property Button',
        purpose: 'Catalog fresh developer or resale inventory with complete RERA credentials and specifications.',
        keyFields: [
          { fieldName: 'Project & Property Title', inputType: 'Text', guidance: 'e.g. 4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park' },
          { fieldName: 'Property Type', inputType: 'CustomSelect', guidance: 'Apartment, Villa, Penthouse, Duplex, Plot' },
          { fieldName: 'Listing Type', inputType: 'CustomSelect', guidance: 'For Sale (Outright) or For Rent / Lease' },
          { fieldName: 'Asking Price (₹ Cr)', inputType: 'Number / Currency', guidance: 'Enter all-inclusive price in Indian Crores' },
          { fieldName: 'Carpet Area (sq.ft.)', inputType: 'Number', guidance: 'Official RERA Carpet Area measurement' },
          { fieldName: 'State RERA Registration No', inputType: 'Text', guidance: 'MahaRERA / Karnataka RERA / HRERA project ID' }
        ],
        operatorTip: 'Upload transparent floor plans and high-resolution JPEG photos to enable automated digital flyer generation.'
      }
    ],
    whatsAppVault: [
      {
        title: 'New Luxury Resale Listing Announcement',
        useCase: 'Broadcast to warm buyer lists when onboarding an exclusive unit',
        hinglishScript: '🌟 Exclusive Mandate Alert in {Locality}!\n\n🏢 {ProjectName} • {BHK} Luxury Apartment\n📐 Carpet Area: {CarpetArea} sq.ft. (East Facing, 100% Vastu)\n🚗 3 Covered Car Parks • High Floor • Sea/Golf View\n💰 Asking Price: ₹{Price} (All-Inclusive)\n\n📸 High-res gallery & floor plan: {PhotoLink}\n\nKeys with us! Physical inspections open this Saturday. Reply to book your private tour slot.',
        englishScript: '🌟 Exclusive Mandate Alert in {Locality}!\n\n🏢 {ProjectName} • {BHK} Luxury Apartment\n📐 Carpet Area: {CarpetArea} sq.ft. (East Facing, 100% Vastu)\n🚗 3 Covered Car Parks • High Floor • Sea/Golf View\n💰 Asking Price: ₹{Price} (All-Inclusive)\n\n📸 High-res gallery & layout: {PhotoLink}\n\nKeys available with us! Physical viewings open this Saturday. Reply to reserve your private slot.'
      }
    ],
    closingTactics: {
      proTip: 'Highlight the top 3 unchangeable property attributes in your description: Floor level, sunlight/direction orientation, and corner unit privacy. High-budget buyers value natural light more than modular wardrobes.',
      legalTrapToAvoid: 'Under RERA guidelines, always state the Carpet Area prominently, not just the Super Built-Up Area. Misleading clients on carpet area violates regulatory norms.',
      statOrMetric: 'Listings with 5+ professional photos receive 4x more site visit requests than text-only listings.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Property Inventory Showcase (/dashboard/properties)',
      subtitle: 'Inventory Management: 12 Active Units • High-Rise Apartments & Luxury Penthouses',
      stats: [
        { label: 'Active Listings', value: '12 Units', color: '#059669' },
        { label: 'For Sale', value: '9 Properties', color: '#2563eb' },
        { label: 'Available Now', value: '7 Units', color: '#059669' },
        { label: 'Top Valuation', value: '₹14.5 Cr', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 22, title: 'Listing Type & Status Filters', description: 'Filter inventory by For Sale, For Rent, Available, Under Offer, or Sold status.', actionHint: 'Filter by listing status' },
        { id: 2, x: 92, y: 13, title: '+ Add Property Button', description: 'Onboard fresh properties with asking price in Crores, carpet area, photos, and RERA ID.', actionHint: 'Click to add listing' },
        { id: 3, x: 30, y: 62, title: 'Property Cards & Pricing', description: 'Visual cards showing asking price in Crores, micro-market, and OC possession readiness.', actionHint: 'Inspect property details' },
        { id: 4, x: 60, y: 62, title: 'Specification Badges & Vastu', description: 'Badges for East Facing Vastu orientation, furnishing status, and covered car parks.', actionHint: 'Review amenities & parking' }
      ]
    }
  },

  // ── 4. SITE VISITS & FIELD SHOWINGS ─────────────────────────────────────────
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
    primaryGoal: 'Schedule showing appointments, coordinate client routes with unified single-line filters, and dispatch Google Maps pins.',
    frequency: 'Daily: Morning route planning and immediate post-visit feedback logging',
    targetRole: 'Field Brokers, Relationship Managers & Area Specialists',
    closingImpact: '80% of real estate deals close within 48 hours of a successful second physical site inspection.',
    tagline: 'Convert property viewings into signed contracts with punctual scheduling and instant feedback.',
    overview: 'The Site Visit is where real estate deals are won or lost. This module features a streamlined 3-tier filtering engine: Row 1 classifies Showing Type (All Showings 9, Buy Visits 6, Rent Visits 3); Row 2 unifies Schedule pills (Upcoming 0, Past 9, Cancelled 1, All Dates 9), Search Bar, and Sorting (Date: Earliest First) in ONE single line; Row 3 provides Status filters (Scheduled, Confirmed, Completed, Rescheduled, Cancelled, No Show).',
    whenToUse: [
      'As soon as a qualified buyer expresses interest in inspecting a shortlisted property.',
      'To schedule showing appointments using the "+ Book Visit" modal with CustomSelect dropdowns.',
      'On the morning of the visit to dispatch time reminders and Google Maps pins over WhatsApp.',
      'Immediately after the walkthrough to log client reactions and advance to active negotiation.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Visits Using Unified Single-Line Bar',
        action: 'In Row 2, click Schedule pills (All Dates 9, Upcoming, Past). Use the search bar to find by client or property, and sort by "Date: Earliest First" all in one line.',
        exactFieldOrButton: 'Unified Filter Row (Schedule Pills + Search Bar + Sorting Dropdown)',
        sampleInput: 'Schedule: "All Dates (9)" • Search: "Prestige" • Sort: "Date: Earliest First"',
        result: 'Displays chronological showing sequence with clean time badges and client contacts.',
        proTip: 'Keep "All Dates" selected to review past client visit feedback when planning second walkthroughs.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Book a Showing Appointment via Modal',
        action: 'Click "+ Book Visit" (Top Right). Select Buyer, Property, Showing Type (Buy Showing / Rent Showing), Date, Time interval (e.g. 10:00 AM - 11:00 AM), and Priority.',
        exactFieldOrButton: '+ Book Visit Button (Top Right)',
        sampleInput: 'Client: Dr. Arvind Singhania | Property: 3 BHK Prime Garden Flat, Prestige Kingfisher | Time: 10:00 AM - 11:00 AM | Type: Buy Showing',
        result: 'Locks the visit into your showing roster and syncs with the Today Workstation timeline.',
        proTip: 'Never schedule more than 2 high-value visits in the same time slot to allow unhurried walkthroughs.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Showing Details & Special Instructions',
        action: 'Review the showing card detailing time interval (e.g. 10:00 AM - 11:00 AM), Priority pill (High Priority), Property title, Client name, phone, and specific visit notes.',
        exactFieldOrButton: 'Showing Card & Client Notes Section',
        sampleInput: 'Notes: "Doctor requested morning tour before hospital clinic duties. Wife attending."' ,
        result: 'Prepares the broker with exact client context before stepping onto the property.',
        proTip: 'Arrive 15 minutes before the client to ensure air conditioning and lights are turned on.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Dispatch WhatsApp Reminder & Update Status',
        action: 'Click the green "Share / WhatsApp" button to send society GPS coordinates. Update status dropdown to "Completed" or "Confirmed".',
        exactFieldOrButton: 'Share / WhatsApp Button & Status Dropdown',
        sampleInput: 'Action: Tap "Share / WhatsApp" -> Sends Google Maps pin and gate security pass code',
        result: 'Client receives exact meeting directions; status updates across your team dashboard.',
        proTip: 'Sending location pins 2 hours prior reduces client no-shows by 85%.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Single-Line Schedule, Search & Sort Bar',
        type: 'filter',
        description: 'Combines Schedule toggles (Upcoming, Past, Cancelled, All Dates), full search, and sort order in one responsive row.',
        bestPractice: 'Use "Date: Earliest First" to plan driving routes chronologically from morning to evening.'
      },
      {
        name: '1-Click WhatsApp Showing Dispatcher',
        type: 'button',
        description: 'Sends exact GPS coordinates, gate security entrance instructions, and time reminders over WhatsApp in 1 click.',
        bestPractice: 'Always dispatch 2 hours before the appointment to prevent client delays.'
      },
      {
        name: 'Showing Status Dropdown',
        type: 'button',
        description: 'Update showing outcome directly on the card: Scheduled, Confirmed, Completed, Rescheduled, Cancelled, or No Show.',
        bestPractice: 'Mark as "Completed" immediately after walkthrough and record client price reactions.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Book Site Visit Modal',
        triggerButton: '+ Book Visit Button',
        purpose: 'Create a confirmed property inspection with automated reminder triggers and agent assignment.',
        keyFields: [
          { fieldName: 'Client / Buyer', inputType: 'CustomSelect', guidance: 'Select prospective buyer from active roster' },
          { fieldName: 'Property Listing', inputType: 'CustomSelect', guidance: 'Select shortlisted property from inventory' },
          { fieldName: 'Showing Type', inputType: 'Pill Toggle', guidance: 'Buy Showing or Rent Showing' },
          { fieldName: 'Inspection Date', inputType: 'Date Picker', guidance: 'Select confirmed inspection date' },
          { fieldName: 'Time Interval', inputType: 'Time Select', guidance: 'Start and end time (e.g. 10:00 AM - 11:00 AM)' },
          { fieldName: 'Priority Level', inputType: 'CustomSelect', guidance: 'High Priority, Medium Priority, Low Priority' },
          { fieldName: 'Caretaker & Gate Notes', inputType: 'Textarea', guidance: 'Key location, parking bay, security instructions' }
        ],
        operatorTip: 'Add gate pass instructions in the notes so visiting clients face zero friction at society security gates.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Site Visit Google Maps Pin Dispatch',
        useCase: 'Send to buyer 2 hours before scheduled physical inspection',
        hinglishScript: 'Namaste {BuyerName} ji! Aaj {TimeSlot} par hamara {PropertyName} ka site visit scheduled hai. Location pin aur gate navigation link attached hai: {MapsLink}. Main 10 minute pehle gate par milunga!',
        englishScript: 'Good morning {BuyerName}! Confirming our site visit for {PropertyName} today at {TimeSlot}. Here is the Google Maps location pin: {MapsLink}. I will be waiting at Gate 1 to receive you.'
      }
    ],
    closingTactics: {
      proTip: 'During physical walkthroughs, let buyers linger in the master bedroom and balcony in silence for 2-3 minutes so they can mentally picture living there.',
      legalTrapToAvoid: 'Never allow a buyer to inspect a tenanted property without providing 24 hours advance notice to the residing tenant and confirming key access.',
      statOrMetric: '80% of real estate deals close within 48 hours of a successful second physical site inspection.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Site Visits & Showings (/dashboard/site-visits)',
      subtitle: 'Inspection Schedule: 9 Total Visits • Unified Schedule, Search & Sorting Filter',
      stats: [
        { label: 'Total Visits', value: '9 Showings', color: '#ea580c' },
        { label: 'Buy Visits', value: '6 Showings', color: '#059669' },
        { label: 'Rent Visits', value: '3 Showings', color: '#7c3aed' },
        { label: 'Sort Mode', value: 'Earliest First', color: '#2563eb' }
      ],
      hotspots: [
        { id: 1, x: 45, y: 24, title: 'Unified Schedule, Search & Sort Bar', description: 'Schedule pills (Upcoming, Past, Cancelled, All Dates) alongside Search Bar and Sorting dropdown in one line.', actionHint: 'Filter by date & sort' },
        { id: 2, x: 93, y: 11, title: '+ Book Visit Button', description: 'Opens booking modal with CustomSelect dropdowns for buyer, property, and showing time.', actionHint: 'Click to schedule showing' },
        { id: 3, x: 42, y: 48, title: 'Showing Details & Client Notes', description: 'Displays time interval badges, property address, client name, phone, and showing notes.', actionHint: 'Inspect visit details' },
        { id: 4, x: 91, y: 48, title: 'Share / WhatsApp & Actions', description: 'Directly dispatch Google Maps link over WhatsApp or update status to Completed/Confirmed.', actionHint: 'Send GPS pin or edit' }
      ]
    }
  },

  // ── 5. DEALS PIPELINE & CLOSING KANBAN ──────────────────────────────────────
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
    primaryGoal: 'Move active negotiations through Negotiation, Token Received, Agreement Drafted, Registration Pending, and Closed Won.',
    frequency: 'Daily monitoring of closing milestones and commission disbursements',
    targetRole: 'Closing Brokers, Principal Partners & Managing Directors',
    closingImpact: 'Direct revenue generation; formalizes token deposits and locks in 1-2% brokerage fees.',
    tagline: 'Visual deal pipeline to track tokens, agreements, and multi-lakh commission payouts.',
    overview: 'The Deals Pipeline is where negotiations become bank deposits. Organize high-value property transactions in an interactive Kanban board managing ₹48.05 Cr in total pipeline volume. Track earnest money token deposits (₹8.5 Cr), title scrutiny milestones, Sale Agreement drafting (₹14.5 Cr), Sub-Registrar registration dates, and commission payouts.',
    whenToUse: [
      'When a buyer and seller agree on commercial terms and pay an earnest money token.',
      'To generate an official Token Advance Receipt for both parties.',
      'To track legal document verification and bank loan sanction milestones.',
      'To record deal closure and trigger GST brokerage invoicing.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Deals by Transaction Type & Stage',
        action: 'Filter by Buy/Sale (7) or Rent/Lease (1). Use stage pills (All Stages 8, Active Pipeline 5, Negotiation 2, Token Received 1, Agreement Drafted 1, Registration Pending 1, Closed Won 2) to track closing velocity.',
        exactFieldOrButton: 'Deal Type & Stage Filter Pills',
        sampleInput: 'Filter: "Buy / Sale (7)" • Stage: "Active Pipeline (5)" • Pipeline Value: ₹48.05 Cr',
        result: 'Gives visual clarity on which transactions require legal or banking follow-up.',
        proTip: 'Keep at least 2 deals in the "Token Received" stage to guarantee consistent monthly cashflow.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Initialize New Deal via Modal',
        action: 'Click "+ Create Deal" (Top Right). Select Client, Property, Consideration Value in Crores (e.g. ₹8.5 Cr), Agreed Brokerage % (1% or 2%), and Target Registration Date.',
        exactFieldOrButton: '+ Create Deal Button (Top Right)',
        sampleInput: 'Deal: Lodha Park Worli 4 BHK Outright Sale | Client: Vikram Malhotra | Consideration: ₹8.5 Cr | Stage: Token Received',
        result: 'Creates deal card with commission calculation and places it in the appropriate Kanban column.',
        proTip: 'Always confirm in writing whether brokerage is 1% or 2% and whether GST is extra before accepting token.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Monitor Kanban Columns & Stage Volumes',
        action: 'Scan deal cards across Kanban columns: Negotiation (₹21.2 Cr), Token Received (₹8.5 Cr), Agreement Drafted (₹14.5 Cr), and Registration Pending (₹3.85 Cr).',
        exactFieldOrButton: 'Kanban Column Headers & Aggregate Values',
        sampleInput: 'Negotiation Column: Multi-Unit Portfolio Deal (₹15 Cr) + Oberoi Sky City 4 BHK (₹6.2 Cr)',
        result: 'Shows immediate financial exposure and pending transaction milestones.',
        proTip: 'Prioritize deals with Expected Close dates within the next 14 days to meet monthly commission targets.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Manage Deal Card Milestones & Actions',
        action: 'Inspect deal cards showing Client name, linked property titles, consideration value in Crores, Expected Close date, Stage dropdown, and Edit/Delete buttons.',
        exactFieldOrButton: 'Deal Card Details & Stage Selector Dropdown',
        sampleInput: 'Deal: DLF The Camellias 3 BHK Resale (₹14.5 Cr) • Client: Priya & Rahul Sharma • Expected: 28 Oct',
        result: 'Enables quick stage advancement as agreements are executed and registrations completed.',
        proTip: 'Issuing a formal Token Receipt prevents either buyer or seller from backing out without penalty.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Visual Kanban Stage Columns',
        type: 'toggle',
        description: 'See every transaction in your agency categorized by milestone stage with column totals in Crores.',
        bestPractice: 'Advance cards as milestones complete to keep your pipeline cashflow forecast accurate.'
      },
      {
        name: 'Token Advance Receipt Generator',
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
    modalShowcase: [
      {
        modalTitle: 'Create Deal Modal',
        triggerButton: '+ Create Deal Button',
        purpose: 'Register an active commercial negotiation with agreed consideration and brokerage parameters.',
        keyFields: [
          { fieldName: 'Client / Buyer', inputType: 'CustomSelect', guidance: 'Select buyer from active inquiries' },
          { fieldName: 'Property / Unit', inputType: 'CustomSelect', guidance: 'Select property from inventory' },
          { fieldName: 'Transaction Type', inputType: 'Pill Toggle', guidance: 'Outright Sale or Lease / Rental' },
          { fieldName: 'Agreed Consideration (₹ Cr)', inputType: 'Number / Currency', guidance: 'Total deal consideration (e.g. ₹8.5 Cr)' },
          { fieldName: 'Brokerage Rate (%)', inputType: 'CustomSelect', guidance: '1%, 1.5%, 2% (GST Extra)' },
          { fieldName: 'Initial Stage', inputType: 'CustomSelect', guidance: 'Negotiation, Token Received, Agreement Drafted' },
          { fieldName: 'Expected Closing Date', inputType: 'Date Picker', guidance: 'Target Sub-Registrar registry date' }
        ],
        operatorTip: 'Link all properties involved in multi-unit portfolio deals so inventory statuses update simultaneously.'
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
      subtitle: 'Active Closing Pipeline: 8 Deals • ₹48.05 Cr Total Pipeline Value',
      stats: [
        { label: 'Total Deals', value: '8 Deals', color: '#b45309' },
        { label: 'Pipeline Value', value: '₹48.05 Cr', color: '#059669' },
        { label: 'Negotiation', value: '₹21.2 Cr', color: '#2563eb' },
        { label: 'Agreement Stage', value: '₹14.5 Cr', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 40, y: 22, title: 'Stage Filter Pills & Search', description: 'Filter pipeline by Buy/Sale, active stages (Negotiation, Token Received, etc.), or search deals.', actionHint: 'Filter deals by stage' },
        { id: 2, x: 93, y: 12, title: '+ Create Deal Button', description: 'Log a new negotiated deal with agreed price in Crores, token advance, and commission percentage.', actionHint: 'Click to create deal' },
        { id: 3, x: 35, y: 42, title: 'Kanban Stage Columns', description: 'Visual columns tracking Negotiation (₹21.2 Cr), Token Received (₹8.5 Cr), and Agreement Drafted.', actionHint: 'Inspect stage columns' },
        { id: 4, x: 30, y: 62, title: 'Deal Cards & Actions', description: 'Displays consideration in Crores, expected close date, stage dropdown, and edit triggers.', actionHint: 'Review deal card' }
      ]
    }
  },

  // ── 6. PERFORMANCE INSIGHTS & ANALYTICS ─────────────────────────────────────
  {
    id: 'insights',
    name: 'Performance Insights & Analytics',
    shortName: 'Insights',
    category: 'core',
    icon: TrendingUpIcon,
    url: '/dashboard/analytics',
    screenshotUrl: '/images/tutorials/insights.png',
    badge: 'REVENUE INTELLIGENCE & CONVERSION',
    badgeColor: '#059669',
    reraComplianceTag: 'Brokerage Revenue Reconciliation & Analytics',
    primaryGoal: 'Analyze agency revenue, monitor inquiry conversion funnels, track commission earnings, and identify top-performing micro-markets.',
    frequency: 'Weekly review & Monthly partner strategy meetings',
    targetRole: 'Managing Partners, Agency Founders & Sales Directors',
    closingImpact: 'Identifying conversion bottlenecks accelerates sales cycles and doubles per-agent commission output.',
    tagline: 'Executive revenue intelligence, conversion funnels, and micro-market absorption analytics.',
    overview: 'The Performance Insights dashboard gives agency leadership real-time visibility into revenue velocity and sales efficiency. Monitor realized Brokerage Earned in Indian Lakhs (₹26.55 Lakh with +12% growth), active pipeline value (₹48.05 Cr across 8 deals), overall inquiry conversion rate (20%), and conversion pipeline stages (Total Inquiries 12 -> Site Visits 9 -> Negotiation 3 -> Closed Won 2). Track top micro-markets (Golf Course Road, Bandra West, Worli) to focus agent bandwidth on high-absorbing luxury clusters.',
    whenToUse: [
      'During Monday morning leadership reviews to inspect the inquiry-to-visit conversion ratio.',
      'At month-end to evaluate realized brokerage commissions against quarterly agency targets.',
      'To export comprehensive performance PDF reports for partners, investors, or chartered accountants.'
    ],
    steps: [
      {
        number: 1,
        title: 'Configure Timeframe & Export Executive PDF',
        action: 'Use the period dropdown (This Month, Last Quarter, FY 2026-27) to define the reporting span. Click "Export PDF" for presentation-ready agency reports.',
        exactFieldOrButton: 'Timeframe Selector ("This Month") & "Export PDF" Button',
        sampleInput: 'Period: "This Month" • Output: AgentLadders_Executive_Performance_October_2026.pdf',
        result: 'Generates branded executive performance summary for partner reviews.',
        proTip: 'Export monthly performance PDFs on the 1st of every month to archive historical growth metrics.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Review Executive KPI Revenue Cards',
        action: 'Inspect the 4 core metrics: Brokerage Earned (₹26.55 Lakh, +12%), Active Pipeline (₹48.05 Cr across 8 Deals), Conversion Rate (20%), and New Inquiries (10).',
        exactFieldOrButton: 'Top Metric Cards (Brokerage Earned, Active Pipeline, Conversion Rate, New Inquiries)',
        sampleInput: 'Brokerage: ₹26.55 Lakh (+12% MoM) | Pipeline: ₹48.05 Cr | Conversion: 20% (Top Quartile)',
        result: 'Gives instant operational health status of your agency\'s financial pipeline.',
        proTip: 'A conversion rate above 18% indicates high-quality lead sourcing; if conversion drops below 12%, re-qualify portal lead channels.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Inquiry-to-Close Conversion Pipeline',
        action: 'Analyze the stage-by-stage conversion funnel: Total Inquiries (12) -> Site Visits (9) -> Negotiation (3) -> Closed Won (2).',
        exactFieldOrButton: 'Conversion Pipeline Funnel Visualizer',
        sampleInput: 'Funnel: 12 Inquiries -> 9 Visits (75% Visit Rate) -> 3 Negotiations (33% Offer Rate) -> 2 Won (67% Close)',
        result: 'Pinpoints exact operational stages where client momentum accelerates or stalls.',
        proTip: 'A 75% Inquiry-to-Visit ratio demonstrates effective WhatsApp brochure pitching and phone qualification.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Analyze Top Performing Localities',
        action: 'Inspect the Top Localities leaderboard: Golf Course Road (3 leads), Bandra West (2 leads), Worli / Lower Parel (1 lead), Golf Course Ext Road (1 lead).',
        exactFieldOrButton: 'Top Localities Leaderboard (Right Panel)',
        sampleInput: 'Rank 1: Golf Course Road (3 leads) | Rank 2: Bandra West (2 leads) | Rank 3: Worli (1 lead)',
        result: 'Guides inventory acquisition toward micro-markets with the highest verified buyer demand.',
        proTip: 'Focus your listing acquisition efforts on micro-markets with 3+ active buyer inquiries to close deals faster.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Brokerage Velocity Tracker',
        type: 'button',
        description: 'Calculates realized commission earnings in Lakhs with month-over-month growth percentage badges.',
        bestPractice: 'Track weekly progress against the agency baseline to ensure quarterly profitability.'
      },
      {
        name: 'Conversion Funnel Analyzer',
        type: 'button',
        description: 'Visualizes drop-off rates from Inquiry -> Site Visit -> Negotiation -> Closed Won.',
        bestPractice: 'If visit-to-negotiation drops below 25%, audit property pricing and owner negotiation flexibility.'
      },
      {
        name: 'Locality Demand Mapping',
        type: 'filter',
        description: 'Ranks luxury micro-markets by active buyer lead volume and purchasing power.',
        bestPractice: 'Acquire exclusive seller mandates in your top 2 ranked localities to capitalize on existing buyer demand.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Export Performance PDF Modal',
        triggerButton: 'Export PDF Button (Top Right)',
        purpose: 'Generate an executive PDF summary of agency revenue, deal volumes, and agent rankings.',
        keyFields: [
          { fieldName: 'Reporting Period', inputType: 'CustomSelect', guidance: 'Current Month, Last Quarter, Year-to-Date' },
          { fieldName: 'Include Revenue Figures', inputType: 'Checkbox', guidance: 'Show gross consideration and net commission' },
          { fieldName: 'Include Agent Leaderboard', inputType: 'Checkbox', guidance: 'Break down volume by individual consultant' }
        ],
        operatorTip: 'Use executive PDF exports during quarterly banking reviews to demonstrate solid institutional revenue growth.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Monthly Agency Milestone Announcement',
        useCase: 'Share internally with team or broadcast to key investor partners',
        hinglishScript: 'Team {AgencyName}! 🎉 Is mahine hamari agency ne ₹{BrokerageEarned} Lakhs ki brokerage close ki hai with ₹{PipelineValue} Cr active pipeline! Top performing micro-market raha {TopLocality}. Keep up the great momentum!',
        englishScript: 'Team {AgencyName}! 🎉 Thrilled to announce we closed ₹{BrokerageEarned} Lakhs in brokerage this month with an active pipeline of ₹{PipelineValue} Cr! Top performing micro-market was {TopLocality}. Congratulations to everyone on stellar execution!'
      }
    ],
    closingTactics: {
      proTip: 'Review the Inquiry-to-Visit ratio every Monday morning. Increasing visit conversion from 50% to 75% doubles agency revenue without spending an additional rupee on lead generation advertising.',
      legalTrapToAvoid: 'Never mix gross property consideration with realized brokerage commission in financial reports. RERA and GST authorities require strict separation of client consideration and agency service revenue.',
      statOrMetric: 'Agencies actively monitoring their conversion funnel close deals in 18 days on average compared to 42 days for unmeasured brokerages.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Performance Insights & Analytics (/dashboard/analytics)',
      subtitle: 'Executive Intelligence: ₹26.55 Lakh Brokerage • ₹48.05 Cr Pipeline • 20% Conversion',
      stats: [
        { label: 'Brokerage Earned', value: '₹26.55 Lakh (+12%)', color: '#059669' },
        { label: 'Active Pipeline', value: '₹48.05 Cr (8 Deals)', color: '#2563eb' },
        { label: 'Conversion Rate', value: '20% Overall', color: '#7c3aed' },
        { label: 'New Inquiries', value: '10 Inbound', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 88, y: 13, title: 'Timeframe & PDF Export', description: 'Select reporting period (This Month, Last Quarter) and generate audit-ready executive PDF report.', actionHint: 'Configure timeframe & export' },
        { id: 2, x: 50, y: 22, title: 'Executive Revenue Cards', description: 'Displays Brokerage Earned in Lakhs (+12%), Active Pipeline in Crores, Conversion Rate, and Inquiries.', actionHint: 'Inspect revenue KPIs' },
        { id: 3, x: 35, y: 54, title: 'Conversion Pipeline Funnel', description: 'Visual funnel tracking progress from Inquiries (12) -> Visits (9) -> Negotiation (3) -> Closed Won (2).', actionHint: 'Analyze conversion funnel' },
        { id: 4, x: 84, y: 54, title: 'Top Localities Leaderboard', description: 'Ranks top micro-markets by lead volume (Golf Course Road 3, Bandra West 2, Worli 1).', actionHint: 'Review top micro-markets' }
      ]
    }
  },

  // ── 7. LEGAL DOCUMENTS VAULT ────────────────────────────────────────────────
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
    primaryGoal: 'Store, categorize, and securely share Sale Agreements, Title Deeds, Encumbrance Certificates, and KYC proofs with 256-bit AES encryption.',
    frequency: 'As transactions enter token and legal due-diligence stages',
    targetRole: 'Documentation Specialists, Legal Coordinators & Brokers',
    closingImpact: 'Zero lost paperwork; accelerates bank loan approvals and Sub-Registrar clearances.',
    tagline: 'Secure document management for RERA compliance, title deeds, and buyer agreements.',
    overview: 'Real estate transactions require meticulous paperwork: Agreement to Sale drafts, MahaRERA Registration Certificates, Society Maintenance NOCs, 30-Year Legal Opinion Reports, and Buyer/Seller PAN & Aadhaar KYC packages. The Documents Vault provides 256-bit encrypted cloud storage organized by Deal and Property with quick WhatsApp sharing links.',
    whenToUse: [
      'To upload buyer and seller KYC proofs when a deal reaches token advance stage.',
      'To store parent title deeds, 30-year Encumbrance Certificates, and society maintenance NOCs.',
      'To provide verified document packages to the buyer\'s advocate or bank home loan manager.'
    ],
    steps: [
      {
        number: 1,
        title: 'Search & Filter Stored Documents',
        action: 'Use the document search bar to locate specific property papers by name, category, or deal reference (e.g. Agreement to Sale, MahaRERA Certificate, Society NOC).',
        exactFieldOrButton: 'Document Search Bar ("Search documents by name or type...")',
        sampleInput: 'Search: "MahaRERA" or "Lodha Park" • Instantly filters matching files',
        result: 'Surfaces verified documents within seconds during critical loan appraisals.',
        proTip: 'Name files systematically (e.g. "Property_DocumentType_Year.pdf") for instant search retrieval.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Upload Property Document Package via Modal',
        action: 'Click "+ Upload File" (Top Right). Select file (PDF, JPG, PNG up to 25MB), assign document category, and link to an active property or deal card.',
        exactFieldOrButton: '+ Upload File Button (Top Right)',
        sampleInput: 'File: Agreement_To_Sale_Lodha_Park.pdf | Category: Agreement to Sale | Size: 2.4 MB',
        result: 'File is encrypted with 256-bit AES encryption and stored securely in the cloud.',
        proTip: 'Always upload scans at 300 DPI resolution so seal stamps and surveyor signatures remain razor-sharp.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Document Cards & Category Badges',
        action: 'Review document cards displaying title, category badge (Agreement to Sale, RERA Certificate, Society NOC, KYC / PAN / Aadhaar), file size, and upload date.',
        exactFieldOrButton: 'Document Cards & Category Badges',
        sampleInput: 'Card: MahaRERA_Registration_Certificate.pdf • Category: RERA Certificate • Size: 1.2 MB',
        result: 'Confirms that all required statutory approvals are filed and verified.',
        proTip: 'Ensure that client KYC documents (PAN & Aadhaar) have masked first digits in compliance with DPDP Act 2023 regulations.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Manage File Actions & Legal Scrutiny',
        action: 'Click the document card to launch the high-resolution lightbox preview. Use the delete icon or share trigger to dispatch files to advocates.',
        exactFieldOrButton: 'Document Preview Lightbox & Trash/Action Triggers',
        sampleInput: 'Action: Click card -> Opens high-res document viewer with zoom & download options',
        result: 'Allows instant visual inspection of surveyor seals and advocate opinion stamps.',
        proTip: 'Watermark shared documents with "For Legal Verification Only" to protect client data privacy.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '256-Bit Encrypted Storage',
        type: 'button',
        description: 'Bank-grade cloud encryption ensuring high-value title papers and KYC documents remain confidential.',
        bestPractice: 'Always store mother deeds and agreement drafts in cloud storage rather than local mobile storage.'
      },
      {
        name: 'Document Category Tagging',
        type: 'filter',
        description: 'Auto-categorizes papers into Agreement to Sale, RERA Certificate, Society NOC, Legal Opinion, and KYC.',
        bestPractice: 'Tag every file immediately upon upload to keep transaction audit trails pristine.'
      },
      {
        name: 'Full-Screen Document Viewer Lightbox',
        type: 'button',
        description: 'High-resolution in-app previewer with zoom controls and responsive close triggers.',
        bestPractice: 'Inspect surveyor signatures and municipal seal dates directly on screen before printing.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Upload Document Modal',
        triggerButton: '+ Upload File Button',
        purpose: 'Upload and tag deed PDFs, legal opinions, and client KYC papers linked to properties or deals.',
        keyFields: [
          { fieldName: 'Document Title', inputType: 'Text', guidance: 'e.g. DLF_Camellias_Maintenance_Society_NOC.pdf' },
          { fieldName: 'Document Category', inputType: 'CustomSelect', guidance: 'Title Deed, EC, Agreement, NOC, KYC' },
          { fieldName: 'Associated Deal or Property', inputType: 'CustomSelect', guidance: 'Link directly to property asset' },
          { fieldName: 'File Attachment', inputType: 'File Upload (Drag & Drop)', guidance: 'PDF, JPG, PNG up to 25MB' }
        ],
        operatorTip: 'Ensure all Aadhaar copies have the first 8 digits masked before uploading to comply with DPDP Act 2023.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Advocate Legal Bundle Sharing',
        useCase: 'Send to buyer\'s advocate or bank loan manager for title clearance',
        hinglishScript: 'Namaste Advocate {AdvocateName} ji! {BuyerName} ke deal ke liye complete property legal bundle generate kar diya hai:\n\n1. Mother Deed & Title Chain (30 yrs)\n2. Encumbrance Certificate (2000 - 2024)\n3. Latest Khata Certificate & Tax Paid Receipt\n4. Sanctioned Building Plan\n\n📄 Download Link: {SecureBundleLink}\n\nKripya title verification report share kijiye at the earliest. Thank you!',
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
      subtitle: 'Transaction Records: Verified Deeds • MahaRERA Certificates • Society NOCs',
      stats: [
        { label: 'Agreement to Sale', value: '2.4 MB', color: '#059669' },
        { label: 'RERA Certificate', value: '1.2 MB', color: '#2563eb' },
        { label: 'Society NOC', value: '850 KB', color: '#7c3aed' },
        { label: 'Legal Opinion', value: '3.8 MB', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 28, y: 20, title: 'Document Search Bar', description: 'Search stored legal files by document name, property address, or category.', actionHint: 'Search documents' },
        { id: 2, x: 93, y: 13, title: '+ Upload File Button', description: 'Upload deed PDFs, agreements, and client KYC papers with category tagging.', actionHint: 'Click to upload document' },
        { id: 3, x: 45, y: 42, title: 'Document Showcase Cards', description: 'Displays file title, category pill (RERA Certificate, Society NOC, KYC), and file size.', actionHint: 'Inspect document details' },
        { id: 4, x: 65, y: 42, title: 'File Management & Lightbox Preview', description: 'Click any document card to open the high-resolution lightbox preview or delete.', actionHint: 'Launch document preview' }
      ]
    }
  },

  // ── 8. BROKERAGE INVOICES & GST BILLING ─────────────────────────────────────
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
    primaryGoal: 'Generate professional, GST-compliant brokerage tax invoices with 18% GST and track client fee disbursements.',
    frequency: 'Immediately after deal closure and Sub-Registrar execution',
    targetRole: 'Finance Coordinators, Managing Brokers & Agency Founders',
    closingImpact: 'Ensures punctual fee collection with official invoices, GST 18%, and PAN/RERA details.',
    tagline: 'Professional 1-click GST brokerage invoices that get paid on time without haggling.',
    overview: 'Never argue over commission receipts again. The Invoices module generates clean, GST-compliant tax invoices detailing property address, buyer/seller name, agreed commission percentage (1-2%), 18% GST (CGST 9% + SGST 9% or IGST 18%), agency RERA number, Section 194H 5% TDS deduction tracking, and your bank account NEFT/RTGS details.',
    whenToUse: [
      'The day property registration is scheduled or completed at the Sub-Registrar office.',
      'To bill developer sales offices for builder mandate commission payouts.',
      'To record client payments and issue formal stamped payment receipts.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Invoices by Billing Status',
        action: 'Use the Billing Status dropdown (All Statuses, Paid, Pending, Draft) and search bar to monitor accounts receivable.',
        exactFieldOrButton: 'Billing Status Dropdown & Search Bar',
        sampleInput: 'Status: "All Statuses (5 records)" • Displays ₹68.65 Lakhs total invoiced volume',
        result: 'Isolates unpaid invoices for immediate follow-up.',
        proTip: 'Send polite WhatsApp reminders on Day 3 and Day 7 with the stamped registry deed copy.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Create Brokerage Tax Invoice via Modal',
        action: 'Click "+ Create Invoice" (Top Right). Select Client/Debtor, Deal Reference, Invoice Amount in Lakhs (e.g. ₹25.6 Lakh, ₹11.55 Lakh, ₹8.5 Lakh), and Due Date.',
        exactFieldOrButton: '+ Create Invoice Button (Top Right)',
        sampleInput: 'Client: Tarun Kapoor | Deal: DLF Magnolias 3.5 BHK Golf View Resale | Amount: ₹25.6 Lakh | Status: Paid',
        result: 'Generates official sequential tax invoice number (e.g. INV-2026-001) compliant with GST rules.',
        proTip: 'Always issue the invoice on the day of registration while parties are at the Sub-Registrar office.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Review Client Debtor & Amount Columns',
        action: 'Inspect table rows showing Invoice # (INV-2026-001 to INV-2026-005), Client/Debtor with linked property details, Invoice Amount in Lakhs, Due Date, and Status badge.',
        exactFieldOrButton: 'Invoice Table Rows & Billing Status Badges (Paid, Pending, Draft)',
        sampleInput: 'Row: INV-2026-002 • Dr. Arvind Singhania • Prestige Kingfisher Indiranagar 3 BHK • ₹11.55 Lakh • Paid',
        result: 'Provides complete ledger visibility for your agency\'s monthly revenue reconciliation.',
        proTip: 'Real estate brokerage services are classified under SAC 997222 with mandatory 18% GST.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Execute Actions: PDF Download, Mark Paid, Reopen',
        action: 'Click the PDF button to download a branded invoice PDF, or click "✓ Mark Paid" when the client completes their RTGS/NEFT bank transfer.',
        exactFieldOrButton: 'Actions Column (PDF Download 📥, Mark Paid ✓, Reopen 🔄)',
        sampleInput: 'Action: Tap "PDF" -> Downloads stamped invoice with agency bank RTGS coordinates',
        result: 'Client receives official GST tax document; status updates to "Paid".',
        proTip: 'Remind corporate clients that 5% TDS deducted under Section 194H must be deposited against your agency PAN.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Automated 18% GST Engine (SAC 997222)',
        type: 'button',
        description: 'Separates Base Brokerage from CGST (9%) and SGST (9%) or IGST (18%) with statutory SAC code.',
        bestPractice: 'Always quote whether commission is inclusive or exclusive of GST before issuing the token receipt.'
      },
      {
        name: 'Section 194H 5% TDS Tracking',
        type: 'button',
        description: 'Calculates 5% TDS deduction for corporate or audited clients and records Form 26QB challan details.',
        bestPractice: 'Collect TDS certificates quarterly to claim credit during annual income tax filings.'
      },
      {
        name: 'Bank RTGS/NEFT Coordinates Block',
        type: 'export',
        description: 'Prints Bank Name, Account Number, IFSC Code, and UPI ID clearly on invoice footers for instant transfers.',
        bestPractice: 'Use a registered Current Account in your agency entity name to build institutional banking credibility.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Create Invoice Modal',
        triggerButton: '+ Create Invoice Button',
        purpose: 'Draft a GST-compliant tax invoice with automatic SAC 997222 tax calculation and banking coordinates.',
        keyFields: [
          { fieldName: 'Client / Debtor', inputType: 'CustomSelect', guidance: 'Select paying buyer, seller, or developer' },
          { fieldName: 'Linked Deal Reference', inputType: 'CustomSelect', guidance: 'Select corresponding closed deal' },
          { fieldName: 'Base Brokerage Fee (₹ Lakhs)', inputType: 'Number / Currency', guidance: 'Taxable consideration value' },
          { fieldName: 'GST Structure', inputType: 'CustomSelect', guidance: '18% Intra-State (CGST+SGST) or Inter-State (IGST)' },
          { fieldName: 'TDS Deduction (Sec 194H)', inputType: 'Checkbox / Number', guidance: '5% TDS deduction toggle' },
          { fieldName: 'Payment Due Date', inputType: 'Date Picker', guidance: 'Agreed settlement deadline (e.g. 7 days)' }
        ],
        operatorTip: 'Attach the stamped token advance receipt number to the invoice notes for instant corporate billing approval.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Official Brokerage Invoice Dispatch',
        useCase: 'Send on the day of property registration at Sub-Registrar office',
        hinglishScript: 'Namaste {ClientName} ji! Registry complete hone par hardik badhai. Transaction details ke mutabiq aapka official GST Brokerage Invoice #{InvoiceNo} generate kar diya gaya hai:\n\nConsideration: ₹{AgreedPrice}\nBrokerage: ₹{BaseAmount}\nGST (18% SAC 997222): ₹{GSTAmount}\nTotal Payable: ₹{TotalPayable}\n\n📄 Download Invoice PDF: {InvoicePDFLink}\n🏦 Bank Details: {BankName} | A/C: {AccountNo} | IFSC: {IFSC}\n\nKripya RTGS/NEFT confirm kijiye. Thank you for your partnership!',
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
      subtitle: 'Billing & Collections: 5 Invoices • ₹68.65 Lakhs Invoiced Volume • GST SAC 997222 Compliant',
      stats: [
        { label: 'Total Invoiced', value: '₹68.65 Lakhs', color: '#059669' },
        { label: 'Paid & Cleared', value: '₹37.15 Lakhs', color: '#2563eb' },
        { label: 'Pending Payment', value: '₹17.00 Lakhs', color: '#b45309' },
        { label: 'Draft Invoices', value: '₹14.50 Lakhs', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 40, y: 22, title: 'Billing Status & Search Filter', description: 'Filter invoices by All Statuses, Paid, Pending, or Draft; search by invoice # or client.', actionHint: 'Filter by invoice status' },
        { id: 2, x: 91, y: 13, title: '+ Create Invoice Button', description: 'Opens invoice creation modal with 18% GST auto-calculation and deal linking.', actionHint: 'Click to create invoice' },
        { id: 3, x: 38, y: 52, title: 'Invoice Rows & Amounts in Lakhs', description: 'Displays invoice numbers (INV-2026-001), client names, property titles, and amounts in Lakhs.', actionHint: 'Inspect invoice row' },
        { id: 4, x: 85, y: 52, title: 'Actions: PDF, Mark Paid, Reopen', description: 'Download branded invoice PDF or mark payment received with bank transaction reference.', actionHint: 'Download PDF or mark paid' }
      ]
    }
  },

  // ── 9. TASKS & ACTION REMINDERS ─────────────────────────────────────────────
  {
    id: 'tasks',
    name: 'Tasks & Operational Follow-ups',
    shortName: 'Tasks',
    category: 'operations',
    icon: CheckSquareIcon,
    url: '/dashboard/tasks',
    screenshotUrl: '/images/tutorials/tasks.png',
    badge: 'OPERATIONAL CHECKLISTS',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Standard Due Diligence Checkpoints',
    primaryGoal: 'Keep track of critical deal checklists, key collections, lawyer follow-ups, and Sub-Registrar biometric appointments.',
    frequency: 'Checked throughout the day as tasks are executed and completed',
    targetRole: 'All Agents, Coordinators & Operations Staff',
    closingImpact: 'Eliminates missed deadlines that derail property closures and irritate clients.',
    tagline: 'Your real estate to-do engine with automated reminders and deal milestone checklists.',
    overview: 'Closing real estate deals involves dozens of tiny, non-negotiable tasks: verifying 30-Year Encumbrance Certificates, sending Camellias floor plans over WhatsApp, coordinating Sub-Registrar biometric registration slots, collecting 1% TDS challans (Form 26QB), and scheduling professional drone walkthrough shoots. The Tasks module keeps your entire agency organized and on schedule.',
    whenToUse: [
      'To schedule post-showing callbacks with prospective buyers.',
      'To assign administrative tasks to team coordinators (e.g. "Collect Form 26QB Challan").',
      'To set automated reminders for property possession dates and biometric slots.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Tasks by Execution Status',
        action: 'Use the status dropdown (All Tasks, Pending, In Progress, Completed) and search bar to filter daily operational checklists.',
        exactFieldOrButton: 'Status Dropdown & Search Bar ("Search tasks by title or assigned agent...")',
        sampleInput: 'Filter: "All Tasks" • Showing 6 records (4 Pending/In Progress, 2 Completed)',
        result: 'Surfaces urgent deal milestones requiring immediate execution.',
        proTip: 'Tackle "Pending" title verification tasks before taking fresh inbound buyer calls.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Create Priority Deal Task via Modal',
        action: 'Click "+ Add Task" (Top Right). Enter Task Description, Assigned Agent, Due Date, and Status (Pending / In Progress).',
        exactFieldOrButton: '+ Add Task Button (Top Right)',
        sampleInput: 'Task: "Coordinate Sub-Registrar biometric registration slot for Dr. Arvind Singhania" | Due: 2026-10-16 | Agent: Marcus Vance',
        result: 'Task appears on your personal queue and Today Workstation screen.',
        proTip: 'Book Sub-Registrar biometric slots at least 72 hours in advance during peak festival months.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Task Checklists & Statutory Milestones',
        action: 'Review checklist items: RERA Title Search (Lodha Park), Camellias Floorplan dispatch, Biometric slot booking, and Form 26QB TDS collection.',
        exactFieldOrButton: 'Task Description & Due Date Columns',
        sampleInput: 'Task: "Collect 1% TDS challan (Form 26QB) from Vikram Malhotra for Lodha Park ATS" • Due: 2026-10-18',
        result: 'Guarantees that all legal and tax prerequisites are cleared before registry day.',
        proTip: 'Under Section 194-IA, 1% TDS is mandatory on property transactions exceeding ₹50 Lakhs.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Complete, Edit, or Reopen Tasks',
        action: 'Tick the checkbox or click "✓ Complete" once the action is fulfilled. Use "Edit" to modify deadlines or "Mark Pending" if follow-ups are needed.',
        exactFieldOrButton: 'Actions Column (Checkbox, Edit, Complete, Delete)',
        sampleInput: 'Action: Tap "✓ Complete" on "Send Camellias floorplan" -> Status advances to Completed',
        result: 'Keeps team accountability transparent and updates the operational completion rate.',
        proTip: 'Checklist-driven deal management prevents 98% of registry day delays and document rejections.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Statutory Deal Checkpoints',
        type: 'button',
        description: 'Standardized templates for RERA title search, Form 26QB TDS challans, and Sub-Registrar slots.',
        bestPractice: 'Apply the Form 26QB checklist immediately after the Agreement to Sale is drafted.'
      },
      {
        name: 'Assigned Agent Accountability',
        type: 'filter',
        description: 'Filter tasks by individual agent to track operational bandwidth across the team.',
        bestPractice: 'Review open tasks in your Friday afternoon team meeting to clear roadblocks.'
      },
      {
        name: 'Direct Checkbox Completion',
        type: 'button',
        description: 'One-click mark complete with strike-through styling and timestamp logging.',
        bestPractice: 'Complete routine tasks immediately to keep your dashboard clean.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Add Task Modal',
        triggerButton: '+ Add Task Button',
        purpose: 'Create an operational action item with assigned agent, due date, and deal linking.',
        keyFields: [
          { fieldName: 'Task Description', inputType: 'Text', guidance: 'Clear, actionable instruction (e.g. Verify 30-Yr EC)' },
          { fieldName: 'Assigned Agent', inputType: 'CustomSelect', guidance: 'Select responsible team member' },
          { fieldName: 'Due Date', inputType: 'Date Picker', guidance: 'Target completion deadline' },
          { fieldName: 'Initial Status', inputType: 'CustomSelect', guidance: 'Pending, In Progress, Completed' }
        ],
        operatorTip: 'Include the deal reference or client name in the task title for instantaneous team alignment.'
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
      subtitle: 'Daily Task Queue: 6 Records • RERA Due Diligence • Biometric Registrations',
      stats: [
        { label: 'Total Tasks', value: '6 Tasks', color: '#2563eb' },
        { label: 'Pending', value: '3 Urgent', color: '#dc2626' },
        { label: 'In Progress', value: '1 Task', color: '#b45309' },
        { label: 'Completed', value: '2 Done', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 38, y: 22, title: 'Task Search & Status Dropdown', description: 'Filter tasks by All Tasks, Pending, In Progress, or Completed; search by title or agent.', actionHint: 'Filter by task status' },
        { id: 2, x: 92, y: 13, title: '+ Add Task Button', description: 'Opens task creation modal to assign action items, due dates, and initial status.', actionHint: 'Click to add task' },
        { id: 3, x: 38, y: 52, title: 'Task Descriptions & Milestones', description: 'Displays checklist items for RERA title search, biometric slots, and Form 26QB TDS challans.', actionHint: 'Inspect task item' },
        { id: 4, x: 88, y: 52, title: 'Action Buttons & Checkbox Toggle', description: 'Mark tasks complete, edit due dates, or delete finished items with one tap.', actionHint: 'Complete or edit task' }
      ]
    }
  },

  // ── 10. INTELLIGENCE REPORTS & EXPORTS ──────────────────────────────────────
  {
    id: 'reports',
    name: 'Intelligence Reports & Statements',
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
    overview: 'The Reports module gives you total data portability. Generate custom CSV spreadsheets and statements: Q3 Vance Luxury Realty Deal & Commission Performance Report (Agency Wide, Quarterly), Indian Real Estate Portals ROI & Inquiry Conversion Matrix (99acres vs MagicBricks vs WhatsApp, Monthly), and Luxury Micro-Market Absorption (Worli vs Golf Course Road, Weekly). Ideal for sharing with your chartered accountant or preparing investor updates.',
    whenToUse: [
      'At month-end to download the GST Invoicing sheet for your accountant before the 10th.',
      'To analyze marketing portal ROI (99acres vs MagicBricks vs WhatsApp) and optimize ad spend.',
      'To review weekly luxury micro-market absorption rates in Worli and Golf Course Road.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Intelligence Statements by Type & Cadence',
        action: 'Use the Report Type dropdown (All Types, Financial, Sales, Performance) and Cadence filter (All Frequencies, Quarterly, Monthly, Weekly) to find statements.',
        exactFieldOrButton: 'Report Type & Cadence Filters',
        sampleInput: 'Type: "All Types" • Cadence: "All Frequencies" • Showing 3 records',
        result: 'Surfaces curated intelligence statements matching audit requirements.',
        proTip: 'Hand the Financial Quarterly Report to your CA before the 10th of every quarter for GSTR-1 reconciliation.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Generate New Intelligence Report via Modal',
        action: 'Click "+ Generate Report" (Top Right). Select Report Category, Scope (Agency Wide or Specific Agent), Time Range, and Delivery Cadence.',
        exactFieldOrButton: '+ Generate Report Button (Top Right)',
        sampleInput: 'Category: Financial Performance | Scope: Agency Wide | Cadence: Quarterly | Range: Q3 2026',
        result: 'Compiles real estate dataset and generates ready-to-export statement card.',
        proTip: 'Generate portal ROI reports monthly to reallocate ad spend away from low-converting portal packages.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Statement Records & Cadence Badges',
        action: 'Review report cards: Q3 Deal & Commission Performance (Financial, Q3 2026), Portals ROI Matrix (Sales, September 2026), and Micro-Market Absorption (Performance, Weekly).',
        exactFieldOrButton: 'Report Records & Category Badges (Financial, Sales, Performance)',
        sampleInput: 'Record: Q3 Vance Luxury Realty Deal & Commission Report • Type: Financial • Cadence: Quarterly',
        result: 'Confirms that report metrics reflect up-to-date closed transactions.',
        proTip: 'Cross-reference Total Brokerage with bank statement credits to ensure 100% tax reconciliation.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Export to CSV / Excel or Delete',
        action: 'Click the blue "Export" button to download a formatted CSV spreadsheet ready for Microsoft Excel, Google Sheets, or Tally ERP.',
        exactFieldOrButton: 'Export Button (with download icon) & Delete Action',
        sampleInput: 'Action: Tap "Export" -> Downloads Vance_Luxury_Realty_Q3_2026_Commission_Report.csv',
        result: 'Downloads clean spreadsheet with full deal IDs, client GSTINs, and SAC 997222 breakdowns.',
        proTip: 'RERA mandates that licensed real estate agencies preserve transaction logs and brokerage vouchers for a minimum of 5 years.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Financial Ledger Export (SAC 997222)',
        type: 'export',
        description: 'Formatted with Invoice No, Client GSTIN, SAC Code, Taxable Value, CGST, and SGST.',
        bestPractice: 'Hand this CSV to your CA before the 10th of every month for seamless GSTR-1 filing.'
      },
      {
        name: 'Portal ROI Matrix',
        type: 'export',
        description: 'Compares inquiry acquisition costs against closed commission revenue across 99acres, MagicBricks, and WhatsApp.',
        bestPractice: 'Export monthly to prune non-performing portal packages.'
      },
      {
        name: 'Audit Trail Retention',
        type: 'button',
        description: 'Timestamped record of transactions meeting RERA Section 34 record-keeping standards.',
        bestPractice: 'Maintain digital backups for minimum 5 years in compliance with state RERA rules.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Generate Intelligence Report Modal',
        triggerButton: '+ Generate Report Button',
        purpose: 'Create customized financial ledgers, portal ROI matrices, or micro-market absorption reports.',
        keyFields: [
          { fieldName: 'Report Title', inputType: 'Text', guidance: 'Descriptive title (e.g. Q3 Deal & Commission Report)' },
          { fieldName: 'Report Category', inputType: 'CustomSelect', guidance: 'Financial, Sales ROI, Agent Performance' },
          { fieldName: 'Time Range & Cadence', inputType: 'CustomSelect', guidance: 'Weekly, Monthly, Quarterly, Annual' },
          { fieldName: 'Scope', inputType: 'CustomSelect', guidance: 'Agency Wide or Specific Agent' }
        ],
        operatorTip: 'Include commission split breakdowns if preparing statements for internal agent incentive payouts.'
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
      windowTitle: 'AgentLadders • Intelligence Reports & Statements (/dashboard/reports)',
      subtitle: 'Data Export Center: Ready-to-Download Statements • Financial & Sales Intelligence',
      stats: [
        { label: 'Available Statements', value: '3 Reports', color: '#059669' },
        { label: 'Financial Report', value: 'Q3 2026 Ready', color: '#2563eb' },
        { label: 'Portal ROI Matrix', value: 'September 2026', color: '#7c3aed' },
        { label: 'Absorption Log', value: 'Current Week', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 48, y: 22, title: 'Report Type & Cadence Filters', description: 'Filter statements by Financial, Sales, or Performance types, and Quarterly/Monthly frequencies.', actionHint: 'Filter statements' },
        { id: 2, x: 90, y: 13, title: '+ Generate Report Button', description: 'Opens report generator modal to configure category, scope, and time range.', actionHint: 'Click to generate report' },
        { id: 3, x: 40, y: 52, title: 'Statement Records & Metadata', description: 'Displays report title, scope (Agency Wide), cadence badge, and generation timestamp.', actionHint: 'Inspect statement record' },
        { id: 4, x: 89, y: 52, title: 'Export to CSV / Excel Button', description: 'One-click download of filtered dataset formatted for Microsoft Excel and Tally ERP.', actionHint: 'Download CSV statement' }
      ]
    }
  },

  // ── 11. HELP, SUPPORT & LEGAL CENTER ───────────────────────────────────────
  {
    id: 'support',
    name: 'Help, Support & Legal Center',
    shortName: 'Help & Support',
    category: 'admin',
    icon: MessageCircleIcon,
    url: '/dashboard/support',
    screenshotUrl: '/images/tutorials/support.png',
    badge: 'PRIORITY ASSISTANCE & LEGAL HUB',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Dedicated Real Estate Technology Helpdesk & DPDP Act Compliance',
    primaryGoal: 'Access dedicated WhatsApp priority support, review RERA & DPDP Act compliance guides, inspect model legal contracts, and read in-app Terms & Privacy Policy.',
    frequency: 'As needed whenever assistance, contract drafting, or compliance verification is required',
    targetRole: 'All Platform Users & Agency Administrators',
    closingImpact: 'Zero downtime; ensures you never get blocked during a critical high-stakes deal negotiation.',
    tagline: 'Direct WhatsApp support, model RERA contracts, and in-app Terms & Privacy Policy reader.',
    overview: 'The Help, Support & Legal Center is your agency\'s operational lifeline. It features 4 comprehensive tabs: "💡 Broker FAQs & Guides" covering 24+ curated real estate workflow answers; "⚖️ Legal Contracts & Mandates" with downloadable RERA-compliant agreement templates; "🛡️ Terms & Privacy Policy" featuring an in-app reader compliant with the Digital Personal Data Protection Act 2023 (DPDP Act) and RERA Section 4(2) Carpet Area mandates; and "💬 My Inquiries & Tickets" with direct SLA tracking.',
    whenToUse: [
      'To review statutory guidelines on DPDP Act 2023 compliance, data ownership, and RERA carpet area rules.',
      'To download model Leave & License agreements, Exclusive Mandate contracts, or commission vouchers.',
      'To submit a technical ticket or request custom brokerage workflows from the engineering team.',
      'To inspect our published Terms of Service and Privacy Policy directly within the dashboard.'
    ],
    steps: [
      {
        number: 1,
        title: 'Navigate Between the 4 Primary Tabs',
        action: 'Switch between "💡 Broker FAQs & Guides", "⚖️ Legal Contracts & Mandates", "🛡️ Terms & Privacy Policy", and "💬 My Inquiries & Tickets".',
        exactFieldOrButton: 'Top Navigation Tabs (FAQs, Legal Contracts, Terms & Privacy, My Inquiries)',
        sampleInput: 'Select: "🛡️ Terms & Privacy Policy" • Opens interactive legal document viewer',
        result: 'Displays dedicated resources for FAQs, contract templates, or legal policies.',
        proTip: 'Inspect the Terms & Privacy tab before onboarding new NRI or corporate enterprise clients.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Submit New Inquiry Ticket via Modal',
        action: 'Click "+ Submit New Inquiry" (Top Right). Select Category (Technical, Legal, Billing, Feature Request), Subject, Priority, and attach details.',
        exactFieldOrButton: '+ Submit New Inquiry Button (Top Right)',
        sampleInput: 'Category: Legal & Contract Support | Subject: Need Custom Tripartite ATS Draft | Priority: High',
        result: 'Issues a tracking ticket with an SLA response guarantee of under 4 hours on business days.',
        proTip: 'Include your Deal ID or Invoice Number for the fastest technical resolution.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Review Priority SLA & RERA Framework Cards',
        action: 'Inspect the 3 top advisory banners: Priority SLA Guarantee (under 4 hours response), RERA Compliant Framework (MahaRERA, Karnataka RERA, UP RERA, HRERA), and Direct Admin Headquarters.',
        exactFieldOrButton: 'Advisory Banners (SLA Guarantee, RERA Compliant Framework, Direct Admin HQ)',
        sampleInput: 'SLA: All tickets reviewed by real estate engineers • Compliant with MahaRERA, K-RERA, HRERA',
        result: 'Confirms that support and contract standards adhere to state real estate regulations.',
        proTip: 'Our engineers are trained in Indian property law and real estate CRM data structures.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Search FAQs & Inspect DPDP Act Guidance',
        action: 'Use the FAQ search bar or category pills to explore topics. Click on "Legal, DPDP Act & Statutory Compliance" to read answers on DPDP Act 2023, data ownership, and RERA disclosures.',
        exactFieldOrButton: 'FAQ Search Bar & Category Pills (including Legal, DPDP Act Compliance)',
        sampleInput: 'FAQ: "How does AgentLadders comply with the Digital Personal Data Protection Act, 2023 (DPDP Act, India)?"',
        result: 'Expands accordion providing detailed statutory explanation and broker compliance checklist.',
        proTip: 'Our DPDP Act guidelines explain how to mask client Aadhaar numbers and maintain data fiduciary compliance.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'In-App Terms & Privacy Policy Reader',
        type: 'button',
        description: 'Interactive legal document viewer with live search, copy section, print, and DPDP Act 2023 compliance.',
        bestPractice: 'Share the public /terms and /privacy links with corporate developers during agency empanelment.'
      },
      {
        name: 'Model RERA Legal Contracts Vault',
        type: 'button',
        description: 'Downloadable agreement templates: Exclusive Broker Mandate, Token Receipt, Leave & License, Commission Voucher.',
        bestPractice: 'Always use the standard Exclusive Mandate template when onboarding luxury resale penthouses.'
      },
      {
        name: 'Direct Support Ticket Tracking',
        type: 'button',
        description: 'Submit inquiries and track real-time SLA status directly on the central Super Admin Command Center.',
        bestPractice: 'Attach error screenshots or deal references to expedite resolution.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Submit New Inquiry Ticket Modal',
        triggerButton: '+ Submit New Inquiry Button',
        purpose: 'Open a tracked technical or legal support inquiry with priority SLA routing.',
        keyFields: [
          { fieldName: 'Inquiry Category', inputType: 'CustomSelect', guidance: 'Technical, Legal Contract, Billing & GST, Feature Request' },
          { fieldName: 'Subject', inputType: 'Text', guidance: 'Concise summary of assistance needed' },
          { fieldName: 'Priority Urgency', inputType: 'CustomSelect', guidance: 'Urgent (Site Visit), High (Closing Today), Medium' },
          { fieldName: 'Description & Attachments', inputType: 'Textarea / File', guidance: 'Include Deal ID, Invoice #, or screenshot' }
        ],
        operatorTip: 'Select "Urgent" only for live site visit or Sub-Registrar closing issues to trigger immediate escalation.'
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
      windowTitle: 'AgentLadders • Help, Support & Legal Center (/dashboard/support)',
      subtitle: 'Broker Support: 4 Tabs • Terms & Privacy Reader • DPDP Act 2023 & RERA Compliant',
      stats: [
        { label: 'SLA Guarantee', value: 'Under 4 Hours', color: '#059669' },
        { label: 'RERA Compliance', value: 'MahaRERA & K-RERA', color: '#2563eb' },
        { label: 'Legal Tabs', value: '4 Modules', color: '#7c3aed' },
        { label: 'DPDP Act', value: '2023 Ready', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 42, y: 16, title: 'Navigation Tabs (FAQs, Contracts, Terms & Privacy)', description: 'Switch between Broker FAQs, Legal Contracts, in-app Terms & Privacy Policy, and My Inquiries.', actionHint: 'Switch to Terms & Privacy' },
        { id: 2, x: 90, y: 11, title: '+ Submit New Inquiry Button', description: 'Opens support modal to submit technical, legal contract, or billing assistance tickets.', actionHint: 'Click to submit inquiry' },
        { id: 3, x: 50, y: 24, title: 'Priority SLA & Framework Banners', description: 'Advisory cards explaining our 4-hour SLA guarantee, state RERA compliance, and admin HQ.', actionHint: 'Inspect SLA framework' },
        { id: 4, x: 45, y: 40, title: 'FAQ Search & DPDP Act Compliance', description: 'Curated knowledge base answering questions on DPDP Act 2023, data ownership, and RERA rules.', actionHint: 'Browse compliance FAQs' }
      ]
    }
  },

  // ── 12. AGENCY SETTINGS & BRANDING ─────────────────────────────────────────
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
    overview: 'Your Agency Settings configure how AgentLadders looks to your clients. The left rail navigates between Agency Profile, Theme & Typography, Users & Roles, Subscription & Billing, Notifications, Profile & Security, and System Configuration. Upload your official agency logo, record your state RERA broker registration number, configure Primary Currency (INR) and Timezone (Asia/Kolkata IST), enter GSTIN tax details, and specify bank account coordinates.',
    whenToUse: [
      'During your first day setup of AgentLadders to white-label your workspace.',
      'To update company logo, business address, or state RERA certificate renewals.',
      'To change bank account details where brokerage commissions are disbursed.'
    ],
    steps: [
      {
        number: 1,
        title: 'Navigate Settings Sections',
        action: 'Use the left navigation rail to select "Agency Profile", "Theme & Typography", "Users & Roles", or "Subscription & Billing".',
        exactFieldOrButton: 'Settings Navigation Rail (Left Panel)',
        sampleInput: 'Select: "Agency Profile" • Opens brand identity and compliance form',
        result: 'Displays configuration controls for agency branding and legal credentials.',
        proTip: 'Review "Users & Roles" whenever you hire new property consultants or field agents.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Upload Official Agency Brand Logo',
        action: 'Click "Upload Logo" in the Agency Brand Logo card. Select a high-resolution square or horizontal PNG/SVG with a transparent background (Max 2.5MB).',
        exactFieldOrButton: 'Agency Brand Logo Uploader ("Upload Logo" Button)',
        sampleInput: 'File: Vance_Luxury_Realty_Logo.png (Transparent PNG, 800x200 px)',
        result: 'Logo appears across your left sidebar, client WhatsApp flyers, and PDF invoices.',
        proTip: 'A crisp horizontal logo gives client flyers and tax invoices an institutional corporate appearance.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Configure Agency Identity & Legal Entity',
        action: 'Enter your Agency Name (e.g. Vance Luxury Realty), Country (India), and Official Broker WhatsApp Number with country code (+91).',
        exactFieldOrButton: 'Agency Name & Legal Entity Input Fields',
        sampleInput: 'Name: Vance Luxury Realty | Country: India | WhatsApp: +91 98200 11223',
        result: 'Embeds your verified entity credentials on all outgoing digital brochures.',
        proTip: 'Ensure the agency name matches your official bank account name to prevent invoice wire rejections.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Set Primary Currency (INR) & Timezone (IST)',
        action: 'Verify that Primary Currency is set to "INR" (Indian Rupee ₹) and Timezone is set to "Asia/Kolkata (IST +5:30)".',
        exactFieldOrButton: 'Primary Currency & Timezone Dropdowns',
        sampleInput: 'Currency: INR (₹) • Timezone: Asia/Kolkata (IST +5:30)',
        result: 'Standardizes all numbers across dashboard into Indian notation (Lakhs & Crores).',
        proTip: 'Indian Rupee formatting ensures all pipeline figures, invoices, and flyers display ₹ Lakhs and ₹ Crores.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Agency White-Labeling Engine',
        type: 'button',
        description: 'Brand every client touchpoint with your official agency name, colors, and transparent PNG logo.',
        bestPractice: 'Upload a clean transparent PNG logo for the sharpest rendering on client flyers.'
      },
      {
        name: 'RERA Compliance Badging',
        type: 'button',
        description: 'Ensures marketing brochures adhere to state real estate regulatory authority standards.',
        bestPractice: 'Keep your active RERA registration number valid and updated.'
      },
      {
        name: 'Currency & Timezone Standardization',
        type: 'export',
        description: 'Locks currency to INR (₹) and timezone to Asia/Kolkata (IST +5:30) across all calculators and reports.',
        bestPractice: 'Double-check that all figures format in Lakhs and Crores rather than Western millions.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Agency Profile & RERA Setup Modal',
        triggerButton: 'Save Changes Button',
        purpose: 'Broadcast updated branding, RERA license, and bank payout details to all agent terminals.',
        keyFields: [
          { fieldName: 'Agency Brand Logo', inputType: 'File Upload', guidance: 'Transparent PNG/SVG under 2.5MB' },
          { fieldName: 'Official Agency Name', inputType: 'Text', guidance: 'Registered corporate or LLP entity name' },
          { fieldName: 'State RERA Broker ID', inputType: 'Text', guidance: 'MahaRERA / K-RERA / HRERA license ID' },
          { fieldName: 'GSTIN Tax Number', inputType: 'Text', guidance: '15-digit Goods & Services Tax ID' },
          { fieldName: 'Bank Current Account', inputType: 'Text', guidance: 'Bank Name, Account #, IFSC code for invoices' }
        ],
        operatorTip: 'Broadcast changes globally so all team members immediately issue flyers with the latest RERA renewal ID.'
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
      subtitle: 'Agency Profile: Vance Luxury Realty • INR Currency • Asia/Kolkata IST Timezone',
      stats: [
        { label: 'Profile Status', value: '100% Configured', color: '#059669' },
        { label: 'Primary Currency', value: 'INR (₹)', color: '#2563eb' },
        { label: 'Timezone', value: 'Asia/Kolkata IST', color: '#7c3aed' },
        { label: 'Brand Logo', value: 'Active SVG/PNG', color: '#b45309' }
      ],
      hotspots: [
        { id: 1, x: 26, y: 35, title: 'Settings Navigation Rail', description: 'Navigate between Agency Profile, Theme & Typography, Users & Roles, and Billing.', actionHint: 'Select settings category' },
        { id: 2, x: 52, y: 42, title: 'Agency Brand Logo Uploader', description: 'Upload company logo displayed on navigation bar, client flyers, and invoice headers.', actionHint: 'Upload brand logo' },
        { id: 3, x: 45, y: 56, title: 'Agency Identity & Country', description: 'Configure agency legal entity name and verified country (India).', actionHint: 'Enter agency name' },
        { id: 4, x: 45, y: 68, title: 'Primary Currency (INR) & Timezone', description: 'Set currency to Indian Rupee (₹) and timezone to Asia/Kolkata (IST +5:30).', actionHint: 'Set INR & IST timezone' }
      ]
    }
  }
];
