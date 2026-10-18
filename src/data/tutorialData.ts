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

// ─── Complete 12-Module Tutorial Dataset (Easy Words Edition) ────────────────

export const MODULE_TUTORIALS: ModuleTutorial[] = [
  // ── 1. TODAY DASHBOARD ──────────────────────────────────────────────────────
  {
    id: 'today',
    name: 'Today Dashboard (Your Daily Home Screen)',
    shortName: 'Today Dashboard',
    category: 'core',
    icon: HomeIcon,
    url: '/dashboard',
    screenshotUrl: '/images/tutorials/today.png',
    badge: 'START HERE EVERY MORNING',
    badgeColor: '#059669',
    reraComplianceTag: 'Daily Habit: Check by 9:30 AM',
    primaryGoal: 'See your day at a glance: who to call first, which site visits are planned, and total deal pipeline.',
    frequency: 'Open once at 9:00 AM and once before logging off at 6:00 PM',
    targetRole: 'Brokers, Team Members & Agency Owners',
    closingImpact: 'Calling new buyers within 15 minutes makes them 8x more likely to book a visit with you.',
    tagline: 'Your morning home screen with urgent calls, scheduled visits, and total deal value.',
    overview: 'Think of the Today Dashboard as your morning checklist. Instead of hunting through messy WhatsApp chats or notebooks, everything you need is on one clean screen: fresh buyer inquiries from the last 24 hours, your property visit schedule with exact times (like 10:00 AM - 11:00 AM), and total deal value in Crores (₹).',
    whenToUse: [
      'First thing in the morning (9:00 AM) to see who to call and plan your route.',
      'Before heading out for site visits to check property keys and send WhatsApp location pins to clients.',
      'At the end of the day (6:00 PM) to update how visits went and note down offers.'
    ],
    steps: [
      {
        number: 1,
        title: 'Use Quick Action Buttons at the Top',
        action: 'Look at the top-right corner. You will see two handy buttons: "Book Site Visit" and "+ Add New Buyer". Click either to open a simple popup without leaving this page.',
        exactFieldOrButton: 'Top-Right Buttons ("🏎️ Book Site Visit" & "➕ Add New Buyer")',
        sampleInput: 'Click "+ Add New Buyer" • Type: Rahul Sharma, Budget: ₹7 Cr, 4 BHK Worli',
        result: 'Opens a fast popup where you can type details and save them in 30 seconds.',
        proTip: 'Whenever a client calls you, immediately hit "+ Add New Buyer" so you never lose a phone number.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Check Your 4 Morning Numbers',
        action: 'Look at the 4 big cards across the top: Site Visits Today, Active Buyers, Listed Properties, and Total Pipeline Value in Crores (₹24.0 Cr).',
        exactFieldOrButton: 'Top 4 Summary Cards (Visits, Buyers, Inventory, Pipeline)',
        sampleInput: 'Visits: 1 Scheduled | Active Buyers: 10 (3 Hot) | Pipeline: ₹24.0 Cr',
        result: 'Gives you instant clarity on how many deals you can close this month.',
        proTip: 'Always make sure you have at least 3 buyers tagged as "Hot" every single week.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Call or WhatsApp Hot Inquiries First',
        action: 'Check the left side under "Client Enquiries". Click the green WhatsApp button or Call button next to any buyer to reach out directly.',
        exactFieldOrButton: 'Client Cards in Left Column & Green WhatsApp / Call Icons',
        sampleInput: 'Buyer: Vikram Malhotra • Budget: ₹7.0 - ₹9.5 Cr • Looking for: 4 BHK Worli',
        result: 'Opens WhatsApp with a pre-written message ready to send with one click.',
        proTip: 'Calling between 9:30 AM and 11:30 AM gets the highest pick-up rate from busy clients.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Check Today\'s Site Visits Timeline',
        action: 'Look at the right column under "Today\'s Schedule". See who is visiting which property and at what time (e.g., 10:00 AM - 11:00 AM).',
        exactFieldOrButton: 'Right Column ("Today\'s Schedule" & Time Slot Cards)',
        sampleInput: '10:00 AM - 11:00 AM • 3 BHK Luxury Flat at Prestige • Client: Dr. Singhania',
        result: 'Shows you the property address, gate number, and client phone number.',
        proTip: 'Always send the Google Maps pin to the buyer 2 hours before the visit so they arrive on time.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Quick Action Buttons',
        type: 'button',
        description: 'Two top-right buttons that let you add a buyer or book a visit in seconds.',
        bestPractice: 'Use them as soon as you hang up the phone with a client.'
      },
      {
        name: 'Urgent Inquiries List',
        type: 'button',
        description: 'Shows fresh buyer inquiries sorted with "Hot" buyers at the top.',
        bestPractice: 'Call hot buyers before lunch to stay ahead of other brokers.'
      },
      {
        name: 'Time Slot Badges',
        type: 'button',
        description: 'Clean time badges (10:00 AM - 11:00 AM) that tell you when each visit happens.',
        bestPractice: 'Keep at least 30-45 minutes between visits to avoid traffic delays.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Book Site Visit Popup',
        triggerButton: '🏎️ Book Site Visit (Top Right)',
        purpose: 'Set up a property showing with the client name, property name, date, and time.',
        keyFields: [
          { fieldName: 'Client Name', inputType: 'Dropdown Picker', guidance: 'Choose buyer from your list' },
          { fieldName: 'Property', inputType: 'Dropdown Picker', guidance: 'Select the apartment or villa to visit' },
          { fieldName: 'Visit Type', inputType: 'Pill Toggle', guidance: 'Pick "Buy" or "Rent"' },
          { fieldName: 'Date & Time', inputType: 'Date/Time Picker', guidance: 'Pick a clear 1-hour slot (e.g. 10:00 AM)' }
        ],
        operatorTip: 'Turn on the "Send WhatsApp Confirmation" toggle so both buyer and caretaker get the address pin immediately.'
      },
      {
        modalTitle: 'Add New Buyer Popup',
        triggerButton: '➕ Add New Buyer (Top Right)',
        purpose: 'Save a new client\'s name, phone, budget in Crores, and preferred area.',
        keyFields: [
          { fieldName: 'Full Name & Mobile', inputType: 'Text & Number', guidance: 'Client name and 10-digit phone number' },
          { fieldName: 'Budget (Min & Max)', inputType: 'Rupee Currency Input', guidance: 'Enter budget in Crores (e.g., ₹5.0 Cr to ₹8.0 Cr)' },
          { fieldName: 'Preferred Area & BHK', inputType: 'Multi-select', guidance: 'Choose areas like Worli, Bandra, Gurgaon' }
        ],
        operatorTip: 'Tag the buyer as "Hot" if they already have approved bank funds and want to buy this month.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Morning Visit Reminder with Google Maps Pin',
        useCase: 'Send to client 2 hours before the scheduled showing',
        hinglishScript: 'Namaste {BuyerName} ji! Aaj {TimeSlot} par hamara {PropertyName} ka site visit scheduled hai. Location pin: {MapsLink}. Main 10 minute pehle gate par milunga!',
        englishScript: 'Good morning {BuyerName}! Confirming our site visit for {PropertyName} today at {TimeSlot}. Here is the Google Maps location: {MapsLink}. I will wait for you at the main gate.'
      },
      {
        title: 'Quick Call Follow-up Message',
        useCase: 'Send when a client misses your morning phone call',
        hinglishScript: 'Namaste {BuyerName} ji! Maine aapko call kiya tha regarding your search for {BHK} in {Locality}. Mere paas 2 verified ready options hain. Kya main WhatsApp par details share karoon?',
        englishScript: 'Hello {BuyerName}, I just tried calling regarding your inquiry for a {BHK} in {Locality}. I have 2 verified ready options. Can I share the photos and pricing with you here on WhatsApp?'
      }
    ],
    closingTactics: {
      proTip: 'Spend the first hour of your workday (9:00 AM - 10:00 AM) calling buyers before checking social media or emails.',
      legalTrapToAvoid: 'Never bring a buyer to a site without confirming that the owner or caretaker is available and has the keys.',
      statOrMetric: 'Brokers who clear their morning queue close 3x more property deals every quarter.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Today Home Screen (/dashboard)',
      subtitle: 'Daily Briefing: 1 Visit Scheduled • 10 Active Buyers • ₹24.0 Cr Pipeline',
      stats: [
        { label: 'Site Visits Today', value: '1 Scheduled', color: '#059669' },
        { label: 'Active Buyers', value: '10 (3 Hot)', color: '#2563eb' },
        { label: 'Listed Properties', value: '12 Units', color: '#7c3aed' },
        { label: 'Total Pipeline', value: '₹24.0 Cr', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 80, y: 15, title: 'Quick Action Buttons', description: 'Click to book a visit or add a new buyer in seconds without leaving this page.', actionHint: 'Click to open quick popup' },
        { id: 2, x: 50, y: 30, title: '4 Key Numbers', description: 'See today\'s visits, hot buyers, listed inventory, and total ₹24.0 Cr pipeline value.', actionHint: 'Check your daily targets' },
        { id: 3, x: 35, y: 58, title: 'Client Inquiries List', description: 'List of buyers who need attention with 1-click WhatsApp and Call buttons.', actionHint: 'Click WhatsApp to send brochure' },
        { id: 4, x: 86, y: 58, title: 'Today\'s Visit Timeline', description: 'Your schedule for today showing time slots, client names, and property addresses.', actionHint: 'Check property address & time' }
      ]
    }
  },

  // ── 2. INQUIRIES & BUYER LEADS ──────────────────────────────────────────────
  {
    id: 'leads',
    name: 'Inquiries & Buyer Leads (Your Client Directory)',
    shortName: 'Inquiries (Leads)',
    category: 'core',
    icon: UsersIcon,
    url: '/dashboard/leads',
    screenshotUrl: '/images/tutorials/leads.png',
    badge: 'LEADS & BUYERS',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Best Practice: Reply Within 15 Mins',
    primaryGoal: 'Store buyer requirements, sort by budget in Crores, and follow up fast to book visits.',
    frequency: 'Check every time a new inquiry comes in from WhatsApp, MagicBricks, or Ads',
    targetRole: 'Sales Executives & Primary Consultants',
    closingImpact: 'Responding to a new buyer inquiry within 15 minutes makes them 4x more likely to visit.',
    tagline: 'Track every buyer inquiry, their budget, preferred area, and follow-up status.',
    overview: 'This is your complete buyer address book. Every person who calls or messages you about buying or renting property is stored here. You can filter them by budget (e.g. ₹5 Cr - ₹10 Cr), area (Worli, Bandra, Gurgaon), or lead temperature (Hot, Warm, Cold) so you always know who to call first.',
    whenToUse: [
      'When a new inquiry arrives from an Instagram ad, website form, or referral.',
      'Before pitching a new luxury listing to see which buyers have matching budgets.',
      'During weekly reviews to make sure no prospective client has been forgotten.'
    ],
    steps: [
      {
        number: 1,
        title: 'Click "+ Add Lead" to Register a Buyer',
        action: 'Click the blue "+ Add Lead" button in the top-right corner to open the lead creation popup.',
        exactFieldOrButton: 'Top-Right Button ("+ Add Lead")',
        sampleInput: 'Name: Priya Sharma • Phone: +91 98201 12345 • Budget: ₹6.5 Cr • 3 BHK Bandra',
        result: 'Saves the buyer and instantly ranks them against your property listings.',
        proTip: 'Always write down the client\'s family size or reason for moving in the notes box.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Search by Client Name or Phone Number',
        action: 'Use the search box in the top bar. Type a client name, mobile number, or locality to find them in 1 second.',
        exactFieldOrButton: 'Search Input Box ("Search leads by name, phone...")',
        sampleInput: 'Type "Sharma" or "98201" or "Worli"',
        result: 'Filters your client list in real-time as you type.',
        proTip: 'You can also search by building name to see all buyers who want that specific tower.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Filter by Source and Temperature (Hot / Warm)',
        action: 'Click the filter pills like "All Leads", "Hot Leads", "Instagram Ads", or "Referral" to group your buyers.',
        exactFieldOrButton: 'Filter Pills Row (All, Hot, Warm, Inbound Source)',
        sampleInput: 'Click "Hot Leads" pill to see buyers ready to purchase within 30 days',
        result: 'Displays only high-priority buyers ready to make immediate offers.',
        proTip: 'Call your Hot Leads at least twice a week with freshly available inventory.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Send Property Brochures on WhatsApp with 1 Click',
        action: 'On any buyer card, click the green WhatsApp icon. It opens WhatsApp with a personalized message and PDF brochure link ready.',
        exactFieldOrButton: 'Green WhatsApp Action Icon on Buyer Card',
        sampleInput: 'Click WhatsApp icon next to Vikram Malhotra',
        result: 'Opens WhatsApp chat with pre-filled message mentioning their exact budget and criteria.',
        proTip: 'Send no more than 2-3 handpicked options so the client does not get confused.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Add Lead Button',
        type: 'button',
        description: 'Opens the popup to record a new buyer in under 30 seconds.',
        bestPractice: 'Always ask if they have a loan pre-approved while entering their details.'
      },
      {
        name: 'Lead Temperature Tag',
        type: 'filter',
        description: 'Marks clients as Hot (buying in 30 days), Warm (60 days), or Cold (just browsing).',
        bestPractice: 'Review and update temperature tags after every phone call or site visit.'
      },
      {
        name: 'Source Dropdown',
        type: 'filter',
        description: 'Shows where the lead came from: Instagram, MagicBricks, Housing, or Personal Referral.',
        bestPractice: 'Track which sources bring you the most qualified luxury buyers.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Add New Lead Popup',
        triggerButton: '+ Add Lead (Top Right)',
        purpose: 'Create a new buyer record with contact info, budget in Crores, and BHK requirement.',
        keyFields: [
          { fieldName: 'Full Name', inputType: 'Text', guidance: 'Client full name' },
          { fieldName: 'Mobile Number', inputType: 'Tel (+91)', guidance: '10-digit WhatsApp phone number' },
          { fieldName: 'Budget Range', inputType: 'Number / Currency', guidance: 'Min and max budget (e.g. ₹5 Cr - ₹8 Cr)' },
          { fieldName: 'Lead Temperature', inputType: 'Dropdown Picker', guidance: 'Select Hot, Warm, or Cold' }
        ],
        operatorTip: 'Check the "Loan Approved" box if the client has cash in hand or bank sanction ready.'
      },
      {
        modalTitle: 'Edit Buyer Preferences',
        triggerButton: 'Edit Icon on Buyer Card',
        purpose: 'Update buyer budget or preferred localities after they give you feedback on a visit.',
        keyFields: [
          { fieldName: 'Status', inputType: 'Dropdown Picker', guidance: 'Move from "Inquiry" to "Showing Scheduled" or "Negotiation"' },
          { fieldName: 'Notes / Remarks', inputType: 'Textarea', guidance: 'Write down client comments like "needs sea view" or "higher floor only"' }
        ],
        operatorTip: 'Add notes immediately after a visit so you remember exactly what the buyer loved or disliked.'
      }
    ],
    whatsAppVault: [
      {
        title: 'New Lead First Contact Message',
        useCase: 'Send immediately after a buyer submits a form online',
        hinglishScript: 'Namaste {BuyerName} ji! AgentLadders se baat kar raha hoon. Aapne {Locality} mein {BHK} ke liye enquiry submit ki thi. Mere paas 3 verified inventory options hain within your budget. Kya hum 5 minute baat kar sakte hain?',
        englishScript: 'Hello {BuyerName}! Thank you for your inquiry regarding {BHK} luxury apartments in {Locality}. I have 3 verified ready options within your budget. Are you free for a quick 5-minute call today?'
      },
      {
        title: 'Sharing Property Brochure Link',
        useCase: 'Send curated property PDF after phone qualification',
        hinglishScript: 'Hi {BuyerName} ji, jaisa humne phone par discuss kiya, yeh lijiye {PropertyName} ka digital brochure aur video tour: {BrochureLink}. Floor plan aur carpet area verified hai. Batayiye kab visit karein?',
        englishScript: 'Hi {BuyerName}, as discussed on our call, here is the verified brochure and walkthrough tour for {PropertyName}: {BrochureLink}. Please let me know what day works best for your private walkthrough.'
      }
    ],
    closingTactics: {
      proTip: 'Ask buyers early: "If you love the apartment during the visit, how soon are you looking to sign the token?" This separates real buyers from window shoppers.',
      legalTrapToAvoid: 'Never share personal client phone numbers with builders or other brokers without the client\'s explicit permission.',
      statOrMetric: 'Brokers who contact inquiries within 15 minutes convert 4x more visits than those who wait until the next day.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Buyer Inquiries (/dashboard/leads)',
      subtitle: '10 Active Buyers • 3 Hot Leads • Search, Filter & 1-Click WhatsApp',
      stats: [
        { label: 'Total Inquiries', value: '10 Active', color: '#2563eb' },
        { label: 'Hot Buyers', value: '3 Ready', color: '#dc2626' },
        { label: 'Average Budget', value: '₹7.8 Cr', color: '#059669' },
        { label: 'Conversion Rate', value: '38%', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 86, y: 14, title: '+ Add Lead Button', description: 'Click to open the popup and save a new buyer inquiry in 30 seconds.', actionHint: 'Click to add a buyer' },
        { id: 2, x: 26, y: 14, title: 'Instant Search Box', description: 'Type client name, phone number, or area to instantly find their record.', actionHint: 'Type to find client' },
        { id: 3, x: 50, y: 22, title: 'Filter Pills Row', description: 'Filter by Hot, Warm, Cold, or source (Instagram, MagicBricks, Referral).', actionHint: 'Click pill to filter list' },
        { id: 4, x: 88, y: 45, title: 'WhatsApp & Call Actions', description: 'One-click icons to message or dial the client directly from your computer or phone.', actionHint: 'Click to start WhatsApp chat' }
      ]
    }
  },

  // ── 3. PROPERTIES & INVENTORY ───────────────────────────────────────────────
  {
    id: 'properties',
    name: 'Properties & Inventory (Your Luxury Listings)',
    shortName: 'Properties',
    category: 'core',
    icon: BuildingIcon,
    url: '/dashboard/properties',
    screenshotUrl: '/images/tutorials/properties.png',
    badge: 'EXCLUSIVE LISTINGS',
    badgeColor: '#7c3aed',
    reraComplianceTag: 'RERA Carpet Area & Verified Pricing',
    primaryGoal: 'Manage your property inventory, check verified prices in Crores, and share brochures with clients.',
    frequency: 'Update whenever you get a new listing or price changes',
    targetRole: 'Listing Specialists & Mandate Managers',
    closingImpact: 'Sharing verified floor plans and clean photos builds instant trust and stops price bargaining.',
    tagline: 'Your complete inventory catalog with verified carpet area, pricing in Crores, and photo galleries.',
    overview: 'This is your digital property showroom. Every flat, penthouse, plot, or villa you have available is listed here. You can see high-quality photos, exact RERA carpet area in sq.ft., prices in Crores (₹), key location highlights, and caretaker contact numbers.',
    whenToUse: [
      'When an owner gives you a new apartment or villa to sell or rent.',
      'When on the phone with a buyer who asks: "What do you have available in Bandra or Worli?"',
      'Before a showing to double-check caretaker phone numbers and key availability.'
    ],
    steps: [
      {
        number: 1,
        title: 'Click "+ Add Property" to List a Home',
        action: 'Click the purple "+ Add Property" button at the top-right to enter a new apartment or commercial unit.',
        exactFieldOrButton: 'Top-Right Button ("+ Add Property")',
        sampleInput: 'Project: Lodha Park • 3 BHK • Carpet Area: 1,450 sq.ft. • Price: ₹6.8 Cr • Worli',
        result: 'Creates a verified listing card ready to share with prospective buyers.',
        proTip: 'Always input the RERA Carpet Area rather than super built-up area so buyers trust your numbers.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Filter by Locality and Listing Status',
        action: 'Use the filter pills along the top: "All", "Available", "Under Offer", or "Sold" to quickly find active homes.',
        exactFieldOrButton: 'Status Filter Pills (All, Available, Under Offer, Sold)',
        sampleInput: 'Click "Available" to see only properties you can show today',
        result: 'Hides properties that already have tokens so you don\'t show an unavailable unit.',
        proTip: 'Mark properties as "Under Offer" immediately when a token check is handed over.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Price in Crores and Area Details',
        action: 'Look at each property card. Check the price in Crores (e.g. ₹7.5 Cr), configuration (3 BHK / 4 BHK), and carpet area in sq.ft.',
        exactFieldOrButton: 'Property Cards Grid (Pricing Badge & Unit Specs)',
        sampleInput: 'Lodha Park • 4 BHK Luxury Sky Villa • 2,800 sq.ft. • ₹12.5 Cr',
        result: 'Gives you all key numbers to quote accurately on the phone.',
        proTip: 'Calculate the per-sq.ft. rate in your head before calling the buyer so you can answer pricing questions instantly.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Share WhatsApp Brochure with 1 Click',
        action: 'Click the "Share" or WhatsApp icon on any property card to generate a clean, branded link to send to clients.',
        exactFieldOrButton: 'Share / WhatsApp Button on Property Card',
        sampleInput: 'Click "Share" on DLF The Camellias card',
        result: 'Copies a beautiful link with photos, video walkthrough, and key specs to your clipboard or WhatsApp.',
        proTip: 'Never share the exact flat number or owner contact publicly; share the building name and floor level only.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Add Property Button',
        type: 'button',
        description: 'Launches the form to upload photos, specs, pricing, and owner details.',
        bestPractice: 'Upload at least 4 clear photos: living room, master bedroom, kitchen, and balcony view.'
      },
      {
        name: 'Price & Locality Search',
        type: 'filter',
        description: 'Quickly search properties by builder, tower name, or micro-market.',
        bestPractice: 'Type the building name to quickly check if you already have inventory there.'
      },
      {
        name: 'Share Brochure Button',
        type: 'button',
        description: 'Generates a customer-facing link that hides owner details and shows only verified property info.',
        bestPractice: 'Send this to the buyer right after booking a site visit.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Add New Property Popup',
        triggerButton: '+ Add Property (Top Right)',
        purpose: 'Upload a new listing with photos, carpet area, price in Crores, and RERA number.',
        keyFields: [
          { fieldName: 'Project & Tower Name', inputType: 'Text', guidance: 'Building name (e.g. Oberoi 360)' },
          { fieldName: 'Configuration & Floor', inputType: 'Dropdown Picker', guidance: 'Select 2 BHK, 3 BHK, 4 BHK or Penthouse' },
          { fieldName: 'RERA Carpet Area', inputType: 'Number', guidance: 'Exact carpet area in square feet' },
          { fieldName: 'Asking Price', inputType: 'Rupee Currency Input', guidance: 'Total price in Crores (e.g. ₹8.5 Cr)' },
          { fieldName: 'Owner / Caretaker Contact', inputType: 'Tel', guidance: 'Phone number for keys and access' }
        ],
        operatorTip: 'Add key handover instructions in the private notes box (e.g., "Keys with security guard at tower B lobby").'
      },
      {
        modalTitle: 'Edit Listing & Price Update',
        triggerButton: 'Edit Button on Property Card',
        purpose: 'Adjust the price or change status when the seller agrees to negotiate.',
        keyFields: [
          { fieldName: 'Updated Asking Price', inputType: 'Rupee Currency Input', guidance: 'Enter revised asking price' },
          { fieldName: 'Listing Status', inputType: 'Dropdown Picker', guidance: 'Switch to Available, Under Offer, or Sold' }
        ],
        operatorTip: 'When an owner lowers the price, immediately notify all buyers who viewed the property in the last 30 days.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Sharing Property Pitch with Buyer',
        useCase: 'Send to a qualified buyer matching the budget',
        hinglishScript: 'Namaste {BuyerName} ji! Aapke criteria ke according ek exclusive {BHK} unit available hua hai in {PropertyName}, {Locality}. Carpet area: {CarpetArea} sq.ft., Asking price: ₹{Price} Cr. Pictures aur floor plan yahan dekhiye: {ListingLink}. Kab visit arrange karein?',
        englishScript: 'Hello {BuyerName}! A prime {BHK} apartment has just become available in {PropertyName}, {Locality}. Carpet area: {CarpetArea} sq.ft., Asking: ₹{Price} Cr. View verified pictures & layout here: {ListingLink}. Would tomorrow morning work for a quick tour?'
      },
      {
        title: 'Price Drop Alert to Interested Buyers',
        useCase: 'Send to past visitors when seller reduces price',
        hinglishScript: 'Hi {BuyerName} ji, good news! {PropertyName} ke owner ne asking price revise karke ₹{NewPrice} Cr kar diya hai for immediate closing. Yeh market se kaafi attractive deal hai. Kya hum final offer discuss karein?',
        englishScript: 'Hi {BuyerName}, great news! The owner of {PropertyName} has just revised the asking price to ₹{NewPrice} Cr for an immediate deal. This is now the best-priced unit in the building. Would you like to put in an offer?'
      }
    ],
    closingTactics: {
      proTip: 'Always walk the property in person before showing it to a high-net-worth client. Check for any paint dampness, elevator repairs, or parking space issues.',
      legalTrapToAvoid: 'Never advertise a property without checking that the project has a valid RERA registration number and no stay orders.',
      statOrMetric: 'Listings with verified carpet area and clean photos receive 3.5x more showing requests than unverified listings.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Property Inventory (/dashboard/properties)',
      subtitle: '12 Luxury Listings • Worli, Bandra, Gurgaon • Verified Prices in Crores',
      stats: [
        { label: 'Available Units', value: '12 Active', color: '#7c3aed' },
        { label: 'Under Negotiation', value: '4 Units', color: '#f59e0b' },
        { label: 'Avg Ticket Size', value: '₹8.5 Cr', color: '#059669' },
        { label: 'Exclusive Mandates', value: '8 Signed', color: '#2563eb' }
      ],
      hotspots: [
        { id: 1, x: 86, y: 14, title: '+ Add Property Button', description: 'Click to upload a new flat, penthouse, or villa with specs and photos.', actionHint: 'Click to list a property' },
        { id: 2, x: 45, y: 22, title: 'Status Filter Pills', description: 'Filter between Available, Under Offer, and Sold properties in 1 click.', actionHint: 'Filter by availability' },
        { id: 3, x: 30, y: 55, title: 'Property Card & Price Badge', description: 'Shows asking price in Crores, RERA carpet area, BHK, and photo gallery.', actionHint: 'Click to inspect specs' },
        { id: 4, x: 88, y: 55, title: '1-Click Share Button', description: 'Generates a clean WhatsApp link with photos and layout to send to buyers.', actionHint: 'Click to copy brochure link' }
      ]
    }
  },

  // ── 4. SITE VISITS & SHOWINGS ───────────────────────────────────────────────
  {
    id: 'site-visits',
    name: 'Site Visits & Showings (Client Appointments)',
    shortName: 'Site Visits',
    category: 'core',
    icon: MapPinIcon,
    url: '/dashboard/site-visits',
    screenshotUrl: '/images/tutorials/site-visits.png',
    badge: 'UNIFIED SCHEDULE BAR',
    badgeColor: '#059669',
    reraComplianceTag: 'Showing SOP & Google Maps Pins',
    primaryGoal: 'Book client visits, manage your daily tour route, and follow up immediately after every showing.',
    frequency: 'Manage every morning and update after every walkthrough',
    targetRole: 'Field Consultants & Showing Specialists',
    closingImpact: 'Clients who receive a Google Maps pin 2 hours before the visit show up on time 94% of the time.',
    tagline: 'All your property showings organized in one clean line with schedule filters, search, and sorting.',
    overview: 'This is where you schedule and run property showings. Everything is organized on a single clean row: click Schedule pills (Upcoming, Past, Cancelled, All Dates), search by client or property name, and sort by earliest time first. Every visit card shows the client\'s name, property address, fixed 1-hour time window (10:00 AM - 11:00 AM), and a 1-click WhatsApp button.',
    whenToUse: [
      'When an interested buyer agrees over the phone to see an apartment in person.',
      'Every morning to check your inspection route and make sure keys are ready.',
      'Right after a visit finishes to mark it "Completed" and write down buyer feedback.'
    ],
    steps: [
      {
        number: 1,
        title: 'Filter Visits by Date on the Unified Bar',
        action: 'Look at Row 2. Click the schedule pills: "Upcoming", "Past", "Cancelled", or "All Dates" to group your appointments.',
        exactFieldOrButton: 'Unified Filter Row 2 (Schedule Pills: Upcoming, Past, Cancelled)',
        sampleInput: 'Click "Upcoming" to see only future visits scheduled for this week',
        result: 'Instantly filters the list so you only focus on upcoming tours.',
        proTip: 'Check "Upcoming" every morning at 9:00 AM to plan your driving route.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Search by Client Name or Property in the Same Line',
        action: 'Use the search box in the middle of Row 2. Type the buyer\'s name or apartment name to find their visit in 1 second.',
        exactFieldOrButton: 'Search Bar in Row 2 ("Search visits by client, property...")',
        sampleInput: 'Type "Sharma" or "Lodha" or "Worli"',
        result: 'Instantly highlights the matching visit card.',
        proTip: 'You can search by phone number if a client calls you while you are on the road.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Sort by Date: Earliest First or Latest First',
        action: 'Click the Sort dropdown on the right side of Row 2. Pick "Date: Earliest First" to see your morning visits at the top.',
        exactFieldOrButton: 'Sort Dropdown in Row 2 ("Date: Earliest First" / "Date: Latest First")',
        sampleInput: 'Select "Date: Earliest First"',
        result: 'Orders your visit cards chronologically from morning to evening.',
        proTip: 'Sorting earliest first prevents you from accidentally missing morning appointments.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Click "+ Book Visit" to Schedule a Tour',
        action: 'Click the green "+ Book Visit" button in the top-right corner to open the quick booking popup.',
        exactFieldOrButton: 'Top-Right Button ("+ Book Visit")',
        sampleInput: 'Buyer: Rahul Sharma • Flat: 3 BHK Lodha Park • Date: Tomorrow • Time: 11:00 AM',
        result: 'Saves the visit and sends a WhatsApp calendar invite to the buyer and owner.',
        proTip: 'Always choose an unhurried 45-60 minute slot so the buyer has time to inspect the amenities and view.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Row 2 Single-Line Filter Bar',
        type: 'filter',
        description: 'Combines schedule pills, search box, and sorting dropdown all in one neat line.',
        bestPractice: 'Use "Upcoming" + "Earliest First" for your standard daily operating view.'
      },
      {
        name: '+ Book Visit Button',
        type: 'button',
        description: 'Opens the visit scheduler with dropdowns for client, property, date, and time.',
        bestPractice: 'Book showings at least 24 hours in advance so caretakers have time to clean the flat.'
      },
      {
        name: 'WhatsApp Showing Invitation',
        type: 'button',
        description: 'Sends the exact Google Maps location pin, gate instructions, and your phone number in 1 click.',
        bestPractice: 'Send this the evening before and again 2 hours before the visit.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Book Site Visit Popup',
        triggerButton: '+ Book Visit (Top Right)',
        purpose: 'Create a property visit appointment linking a registered buyer and property.',
        keyFields: [
          { fieldName: 'Select Buyer', inputType: 'Dropdown Picker', guidance: 'Choose buyer from your active leads list' },
          { fieldName: 'Select Property', inputType: 'Dropdown Picker', guidance: 'Pick the verified apartment or villa' },
          { fieldName: 'Showing Date & Time Slot', inputType: 'Date/Time Picker', guidance: 'Set date and fixed 1-hour interval (e.g. 10:00 AM - 11:00 AM)' },
          { fieldName: 'Meeting Point / Gate', inputType: 'Text', guidance: 'Specify entrance (e.g. Gate 1, Visitor Lobby)' }
        ],
        operatorTip: 'Add special notes like "Client is bringing interior designer" to prepare the caretaker in advance.'
      },
      {
        modalTitle: 'Log Visit Feedback & Outcome',
        triggerButton: 'Feedback Icon on Visit Card',
        purpose: 'Record whether the buyer liked the flat, wants to make an offer, or needs other options.',
        keyFields: [
          { fieldName: 'Visit Outcome', inputType: 'Dropdown Picker', guidance: 'Pick: "Liked & Making Offer", "Needs Other Options", or "Price Too High"' },
          { fieldName: 'Client Counter-Offer', inputType: 'Rupee Currency Input', guidance: 'Enter offered amount if buyer made an on-the-spot offer' }
        ],
        operatorTip: 'Log feedback within 30 minutes of the visit while the conversation is fresh in your memory.'
      }
    ],
    whatsAppVault: [
      {
        title: 'WhatsApp Showing Invitation with Gate Directions',
        useCase: 'Send right after booking a visit appointment',
        hinglishScript: 'Namaste {BuyerName} ji! Aapka site visit confirm ho gaya hai:\n📍 Property: {PropertyName}, {Locality}\n⏰ Time: {Date} ko {TimeSlot}\n🗺️ Google Maps Location: {MapsLink}\nGate 1 par visitor entry par mera reference de sakte hain. Looking forward to meeting you!',
        englishScript: 'Hello {BuyerName}, your private property tour is confirmed:\n📍 Property: {PropertyName}, {Locality}\n⏰ Time: {Date} at {TimeSlot}\n🗺️ Google Maps Pin: {MapsLink}\nPlease mention my name at Gate 1 visitor security. Looking forward to showing you the home!'
      },
      {
        title: 'Post-Visit Feedback Follow-up',
        useCase: 'Send 2-3 hours after the physical walkthrough',
        hinglishScript: 'Namaste {BuyerName} ji, thank you for your time today at {PropertyName}! Flat ka layout aur view kaisa laga? Agar aapko unit pasand aayi hai toh hum owner ke saath baithkar best pricing negotiate kar sakte hain.',
        englishScript: 'Hi {BuyerName}, thank you for your time visiting {PropertyName} today! How did you and your family like the layout and views? If you\'re interested, I can arrange a meeting with the owner to discuss closing terms.'
      }
    ],
    closingTactics: {
      proTip: 'Arrive 15 minutes before the buyer. Turn on the lights, open the curtains, make sure the balcony view is clear, and ensure the apartment smells fresh.',
      legalTrapToAvoid: 'Never allow a buyer to visit an occupied apartment without the owner or tenant\'s prior written consent.',
      statOrMetric: 'Advisors who send a Google Maps pin 2 hours before the visit reduce client no-shows by 88%.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Site Visits Schedule (/dashboard/site-visits)',
      subtitle: 'Schedule Pills • Search • Date Sorting • Fixed 1-Hour Time Slots',
      stats: [
        { label: 'Total Scheduled', value: '6 Visits', color: '#059669' },
        { label: 'Today\'s Tours', value: '2 Visits', color: '#2563eb' },
        { label: 'Completed This Week', value: '14 Tours', color: '#7c3aed' },
        { label: 'Offer Conversion', value: '32%', color: '#f59e0b' }
      ],
      hotspots: [
        { id: 1, x: 20, y: 22, title: 'Schedule Filter Pills (Row 2)', description: 'Click Upcoming, Past, Cancelled, or All Dates to filter your appointments.', actionHint: 'Click to filter visits' },
        { id: 2, x: 50, y: 22, title: 'In-Line Search Bar', description: 'Search visits by buyer name, flat address, or phone number in real-time.', actionHint: 'Type to search appointments' },
        { id: 3, x: 75, y: 22, title: 'Date Sorting Dropdown', description: 'Sort by Earliest First to keep morning visits at the top of your list.', actionHint: 'Pick sorting order' },
        { id: 4, x: 86, y: 14, title: '+ Book Visit Button', description: 'Click to open the popup and schedule a new property tour in 30 seconds.', actionHint: 'Click to schedule a visit' }
      ]
    }
  },

  // ── 5. DEALS PIPELINE ───────────────────────────────────────────────────────
  {
    id: 'deals',
    name: 'Deals Pipeline (Your Closing Board)',
    shortName: 'Deals Pipeline',
    category: 'core',
    icon: BriefcaseIcon,
    url: '/dashboard/deals',
    screenshotUrl: '/images/tutorials/deals.png',
    badge: 'KANBAN CLOSING BOARD',
    badgeColor: '#059669',
    reraComplianceTag: 'Token Advances & Brokerage Invoicing',
    primaryGoal: 'Move deals step-by-step from Token Received to Registration and collect your brokerage commission.',
    frequency: 'Update whenever a token is paid, agreement is signed, or registration is scheduled',
    targetRole: 'Managing Brokers, Partners & Deal Closers',
    closingImpact: 'Tracking milestones on a visual board speeds up deal closing by 14 days and prevents token dropouts.',
    tagline: 'Track every active transaction across 5 clear stages and watch your brokerage commission grow.',
    overview: 'This is your deal closing board. When a buyer says "Yes" and pays an advance token, you track the deal here. The board has 5 clear columns: 1. Token Received, 2. Document Verification, 3. Agreement Signed, 4. Registration & Handover, and 5. Commission Disbursed. Drag or move cards forward as milestones are completed.',
    whenToUse: [
      'As soon as a buyer transfers token advance money (earnest deposit) to book an apartment.',
      'When your legal team is verifying property title deeds and tax receipts.',
      'On registration day at the Sub-Registrar\'s office to complete handover and generate your commission bill.'
    ],
    steps: [
      {
        number: 1,
        title: 'Click "+ Create Deal" to Record a Transaction',
        action: 'Click the green "+ Create Deal" button in the top-right corner when an offer is accepted and token is paid.',
        exactFieldOrButton: 'Top-Right Button ("+ Create Deal")',
        sampleInput: 'Deal: Oberoi 360 4 BHK • Buyer: Dr. Arvind • Total: ₹8.5 Cr • Brokerage: 2% (₹17 Lakhs)',
        result: 'Creates a deal card placed directly in the "Token Received" column.',
        proTip: 'Always enter the bank RTGS / UTR reference number so there is clear proof of token payment.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Check Total Deal Value and Commission Across the Top',
        action: 'Look at the top metric bar: Total Volume in Crores (₹48.05 Cr), Active Transactions, Closed Deals, and Expected Commission.',
        exactFieldOrButton: 'Top Summary Bar (Deal Volume in Crores & Expected Brokerage)',
        sampleInput: 'Total Volume: ₹48.05 Cr • Active: 8 Deals • Expected Commission: ₹96.1 Lakhs',
        result: 'Shows your exact expected earnings for the month.',
        proTip: 'Keep at least 4 deals in stages 2 and 3 so you always have closings lined up every month.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Move Deals Through the 5 Columns',
        action: 'As tasks finish, click on a deal card and move it to the next column: Token → Document Check → Agreement → Registration → Closed.',
        exactFieldOrButton: 'Kanban Columns (5 Stages from Token to Handover)',
        sampleInput: 'Move "Prestige Kingfisher 3 BHK" from Agreement Signed to Registration',
        result: 'Updates the transaction stage and triggers necessary handover reminders.',
        proTip: 'Never move a deal to "Agreement Signed" until the stamp duty challan is verified.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Click "Issue Token Receipt" for Instant Proof',
        action: 'Inside any deal card in Stage 1, click "Issue Token Receipt" to generate a formal PDF receipt with bank RTGS reference.',
        exactFieldOrButton: 'Token Advance Receipt Button inside Deal Card',
        sampleInput: 'Token Amount: ₹10 Lakhs • Bank: HDFC Bank RTGS • Dated: Today',
        result: 'Generates a branded token receipt you can send to both buyer and seller over WhatsApp.',
        proTip: 'Sending a formal receipt within 2 hours of payment reassures the buyer and prevents buyer\'s remorse.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Create Deal Button',
        type: 'button',
        description: 'Opens the transaction creation form with buyer, property, price in Crores, and brokerage percentage.',
        bestPractice: 'Log deals immediately when the token advance is transferred.'
      },
      {
        name: '5 Kanban Columns',
        type: 'filter',
        description: 'Visual stages showing where each deal is stuck and what needs to happen next.',
        bestPractice: 'Review every deal in column 2 (Document Check) daily to avoid registration delays.'
      },
      {
        name: 'Commission Calculator',
        type: 'export',
        description: 'Automatically calculates your 1% or 2% advisory fee from the total deal value in Crores.',
        bestPractice: 'Specify whether commission is payable 50% at Agreement and 50% at Registration.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Create Deal Popup',
        triggerButton: '+ Create Deal (Top Right)',
        purpose: 'Record a new property transaction with buyer, seller, agreed price, and commission terms.',
        keyFields: [
          { fieldName: 'Deal Title', inputType: 'Text', guidance: 'e.g. Oberoi 360 4 BHK Sale' },
          { fieldName: 'Agreed Price', inputType: 'Rupee Currency Input', guidance: 'Total deal consideration in Crores (e.g. ₹7.5 Cr)' },
          { fieldName: 'Token Advance Paid', inputType: 'Rupee Currency Input', guidance: 'Token amount paid (e.g. ₹10 Lakhs)' },
          { fieldName: 'Brokerage Rate', inputType: 'Percentage Input', guidance: 'Your commission rate (e.g. 2% = ₹15 Lakhs)' },
          { fieldName: 'Target Registration Date', inputType: 'Date Picker', guidance: 'Agreed date for government registration' }
        ],
        operatorTip: 'Attach the bank RTGS confirmation screenshot so there is never any confusion about the token payment date.'
      },
      {
        modalTitle: 'Issue Token Advance Receipt',
        triggerButton: 'Issue Token Receipt Button inside Deal',
        purpose: 'Generate an official receipt confirming token money received towards the property.',
        keyFields: [
          { fieldName: 'Payment Mode', inputType: 'Dropdown Picker', guidance: 'Select RTGS, NEFT, Cheque, or Bank Transfer' },
          { fieldName: 'Transaction / UTR Reference', inputType: 'Text', guidance: 'Bank reference number from the payment receipt' }
        ],
        operatorTip: 'Send this receipt to both buyer and seller in a joint WhatsApp group to lock in the commitment.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Token Advance Acknowledgment to Buyer',
        useCase: 'Send immediately after buyer sends token money',
        hinglishScript: 'Namaste {BuyerName} ji! Aapka ₹{TokenAmount} Lakhs ka token advance for {PropertyName} successfully acknowledge ho gaya hai (Ref: {UTRNumber}). Hamari legal team title documents verify kar rahi hai. Draft agreement 48 hours mein share karenge.',
        englishScript: 'Dear {BuyerName}, we gratefully acknowledge receipt of your token advance of ₹{TokenAmount} Lakhs for {PropertyName} (Ref: {UTRNumber}). Our legal team is verifying the title deeds. The draft agreement will be shared within 48 hours.'
      },
      {
        title: 'Registration Day Checklist to Buyer & Seller',
        useCase: 'Send 24 hours before going to the Sub-Registrar office',
        hinglishScript: 'Namaste {BuyerName} ji! Kal hamara registration scheduled hai at Sub-Registrar Office, {RegistrarLocation} at {Time}. Kripya original Aadhaar, PAN card, aur 2 passport photos saath laayein. Main 15 minute pehle pahunchkar tokens collect karunga.',
        englishScript: 'Hello {BuyerName}, confirming our registration tomorrow at the Sub-Registrar Office, {RegistrarLocation} at {Time}. Please carry your original PAN, Aadhaar card, and 2 passport photos. I will be there 15 minutes early to manage the queue.'
      }
    ],
    closingTactics: {
      proTip: 'Always draft an MOU (Memorandum of Understanding) or Token Letter immediately upon receiving advance payment so the seller cannot entertain higher counter-offers.',
      legalTrapToAvoid: 'Never proceed to agreement signing without verifying that the seller has a clear Encumbrance Certificate (EC) and zero pending society dues.',
      statOrMetric: 'Transactions tracked with formal milestone checklists close 30% faster with zero legal disputes.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Deals Pipeline (/dashboard/deals)',
      subtitle: '5-Stage Kanban Board • ₹48.05 Cr Volume • Token to Registration Handover',
      stats: [
        { label: 'Pipeline Volume', value: '₹48.05 Cr', color: '#059669' },
        { label: 'Active Deals', value: '8 Deals', color: '#2563eb' },
        { label: 'Under Registration', value: '2 Deals', color: '#7c3aed' },
        { label: 'Est. Commission', value: '₹96.1 L', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 86, y: 14, title: '+ Create Deal Button', description: 'Click to start tracking a new property sale once the token is paid.', actionHint: 'Click to create a deal' },
        { id: 2, x: 50, y: 14, title: 'Top Summary Metrics', description: 'See total transaction value (₹48.05 Cr) and your expected brokerage commission.', actionHint: 'Check monthly revenue' },
        { id: 3, x: 20, y: 45, title: '5 Kanban Stage Columns', description: 'Move cards from Token Received → Verification → Agreement → Registration → Closed.', actionHint: 'Drag or click deal to advance' },
        { id: 4, x: 40, y: 55, title: 'Deal Card Details', description: 'Shows buyer name, building, total Crores, and button to issue token receipts.', actionHint: 'Click to inspect deal details' }
      ]
    }
  },

  // ── 6. PERFORMANCE & REVENUE INTELLIGENCE ───────────────────────────────────
  {
    id: 'insights',
    name: 'Performance & Revenue Intelligence (Your Business Stats)',
    shortName: 'Analytics',
    category: 'operations',
    icon: TrendingUpIcon,
    url: '/dashboard/analytics',
    screenshotUrl: '/images/tutorials/insights.png',
    badge: 'REVENUE INTELLIGENCE',
    badgeColor: '#059669',
    reraComplianceTag: 'Brokerage ROI & Locality Analytics',
    primaryGoal: 'See how much money your agency earned, which areas generate the most brokerage, and where leads drop off.',
    frequency: 'Review every Monday morning and at monthly closeout',
    targetRole: 'Agency Owners, Team Leaders & Managing Brokers',
    closingImpact: 'Knowing your best-selling micro-markets helps you spend marketing money only where you make the highest profit.',
    tagline: 'Track your total brokerage earnings, stage conversion rates, and top-selling luxury localities.',
    overview: 'This is your business scoreboard. You can see how much commission you actually collected (e.g. ₹26.55 Lakhs), your active deal pipeline in Crores, and which areas bring in the most money (like Golf Course Road, Bandra West, and Worli). It also shows your conversion funnel: how many inquiries become site visits, and how many visits turn into closed deals.',
    whenToUse: [
      'Every Monday morning to see which team members closed deals and which listings are moving.',
      'When deciding which luxury towers to invest marketing money in for Instagram or portal ads.',
      'At the end of every quarter to calculate broker commissions and tax reserves.'
    ],
    steps: [
      {
        number: 1,
        title: 'Check Your Total Commission Earned (₹26.55 L)',
        action: 'Look at the top-left revenue card: Total Commission Earned (₹26.55 Lakhs), average deal cycle time (28 days), and win rate.',
        exactFieldOrButton: 'Top Metric Cards (Commission Earned, Avg Ticket Size, Win Rate)',
        sampleInput: 'Commission Earned: ₹26.55 Lakhs • Pipeline: ₹48.05 Cr • Win Rate: 42%',
        result: 'Shows your financial health and cash flow at a glance.',
        proTip: 'Compare your monthly earnings against your operating costs to ensure at least 60% gross profit margin.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Inspect the Deal Conversion Funnel',
        action: 'Check the conversion chart in the middle: Inquiries (120) → Qualified (65) → Site Visits (32) → Negotiation (12) → Closed Won (5).',
        exactFieldOrButton: 'Conversion Funnel Chart (Inquiries to Closed Deals)',
        sampleInput: '32 Site Visits converted into 12 Negotiations (37.5% Visit-to-Offer rate)',
        result: 'Reveals whether you need more leads or better closing skills during showings.',
        proTip: 'If your visit-to-offer rate drops below 25%, train your team on better property staging and pitch preparation.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Review Top-Selling Luxury Localities',
        action: 'Look at the Locality Breakdown table: Golf Course Road (₹14.2 Cr), Bandra West (₹18.5 Cr), and Worli (₹15.3 Cr).',
        exactFieldOrButton: 'Top Localities Table & Revenue Contribution Bars',
        sampleInput: 'Bandra West: 3 Deals Closed • ₹18.5 Cr Volume • Average Commission: ₹37 Lakhs',
        result: 'Tells you which areas generate the largest commission checks.',
        proTip: 'Focus 80% of your outbound calls on inventory in your top 2 revenue-generating localities.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Pick a Date Range (This Month, Quarter, Year)',
        action: 'Use the date filter in the top right to switch between "This Month", "Last 90 Days", and "Year to Date".',
        exactFieldOrButton: 'Date Range Selector (Month / Quarter / Year)',
        sampleInput: 'Select "Last 90 Days"',
        result: 'Instantly recalculates all charts and revenue metrics.',
        proTip: 'Quarterly views give a much smoother picture of your agency\'s true trajectory than day-to-day numbers.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Date Range Filter',
        type: 'filter',
        description: 'Switches analytics between This Month, Last Quarter, or Full Financial Year.',
        bestPractice: 'Use quarterly reviews to set commission targets for your team.'
      },
      {
        name: 'Funnel Stage Tracker',
        type: 'export',
        description: 'Shows where potential buyers drop off between first inquiry and final registration.',
        bestPractice: 'Identify your biggest leak—whether it is slow first response or poor visit follow-up.'
      },
      {
        name: 'Locality Yield Ranking',
        type: 'filter',
        description: 'Ranks neighborhoods by total brokerage generated rather than just number of units.',
        bestPractice: 'Spend marketing budget where the average ticket size is highest.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Revenue Target Planner',
        triggerButton: 'Set Targets Button (Top Right)',
        purpose: 'Set monthly or quarterly brokerage goals for yourself or your agency team.',
        keyFields: [
          { fieldName: 'Quarterly Brokerage Target', inputType: 'Rupee Currency Input', guidance: 'Target commission in Lakhs (e.g. ₹50 Lakhs)' },
          { fieldName: 'Target Deal Volume', inputType: 'Number / Currency', guidance: 'Total sales volume in Crores (e.g. ₹25 Cr)' }
        ],
        operatorTip: 'Divide your quarterly target by 3 to set clear weekly site visit goals for your team.'
      },
      {
        modalTitle: 'Export Analytics Summary',
        triggerButton: 'Export Report Button',
        purpose: 'Download a clean 1-page summary chart to share with partners or investors.',
        keyFields: [
          { fieldName: 'Export Format', inputType: 'Dropdown Picker', guidance: 'Pick PDF Summary or Excel CSV' },
          { fieldName: 'Include Commission Breakdown', inputType: 'Toggle', guidance: 'Check to include exact agent payouts' }
        ],
        operatorTip: 'Export this at the end of every month for your tax accountant.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Monthly Agency Team Motivation Update',
        useCase: 'Share in your team group after hitting a monthly milestone',
        hinglishScript: 'Team, congratulations! Is month humne ₹{Volume} Cr ka volume close kiya hai with ₹{Commission} Lakhs in brokerage! Top performing micro-market raha {TopLocality}. Agle month ka target ₹{NextTarget} Cr hai. Let\'s keep closing!',
        englishScript: 'Team, outstanding work! We officially crossed ₹{Volume} Cr in closed volume this month, earning ₹{Commission} Lakhs in commission! Top performing area was {TopLocality}. Let\'s maintain this momentum next month!'
      },
      {
        title: 'Quarterly Review Pitch to High-Net-Worth Investor',
        useCase: 'Demonstrate your market dominance to luxury property owners',
        hinglishScript: 'Namaste {OwnerName} ji! In the last 90 days, hamari agency ne {Locality} mein ₹{Volume} Cr worth of luxury inventory successfully transact kiya hai at an average of 28 days to token. Hum aapki property ko bhi fastest closing deliver kar sakte hain.',
        englishScript: 'Hello {OwnerName}, over the last quarter our firm has successfully transacted ₹{Volume} Cr in luxury inventory across {Locality} with an average closing time of just 28 days. We would love to deliver the same results for your property.'
      }
    ],
    closingTactics: {
      proTip: 'Track your "Time to Close": if a deal takes more than 45 days between token and registration, the probability of cancellation increases by 50%. Keep momentum high.',
      legalTrapToAvoid: 'Never mix gross brokerage receipts with net agency profit; always reserve 18% GST and 5% TDS before planning personal spending.',
      statOrMetric: 'Advisors who review their pipeline numbers every Monday close 40% more deals per year.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Performance Intelligence (/dashboard/analytics)',
      subtitle: '₹26.55 Lakhs Brokerage Earned • ₹48.05 Cr Active Pipeline • Conversion Funnel',
      stats: [
        { label: 'Brokerage Earned', value: '₹26.55 L', color: '#059669' },
        { label: 'Active Pipeline', value: '₹48.05 Cr', color: '#2563eb' },
        { label: 'Win Rate', value: '42%', color: '#7c3aed' },
        { label: 'Avg Closing Cycle', value: '28 Days', color: '#f59e0b' }
      ],
      hotspots: [
        { id: 1, x: 25, y: 22, title: 'Total Brokerage Earned', description: 'Shows total collected commission (₹26.55 Lakhs) and win rate percentage.', actionHint: 'Inspect revenue numbers' },
        { id: 2, x: 50, y: 45, title: 'Conversion Funnel Chart', description: 'Tracks buyer drop-off from Inquiries → Site Visits → Offers → Closed Won.', actionHint: 'Analyze team conversion rates' },
        { id: 3, x: 75, y: 55, title: 'Top Localities Breakdown', description: 'Shows which areas (Worli, Bandra, Golf Course Road) earn you the most money.', actionHint: 'Check top micro-markets' },
        { id: 4, x: 86, y: 14, title: 'Date Range Selector', description: 'Toggle between This Month, Last 90 Days, and Full Year to compare growth.', actionHint: 'Change date range' }
      ]
    }
  },

  // ── 7. DOCUMENT VAULT ───────────────────────────────────────────────────────
  {
    id: 'documents',
    name: 'Document Vault (Your Safe Files Storage)',
    shortName: 'Document Vault',
    category: 'operations',
    icon: FileTextIcon,
    url: '/dashboard/documents',
    screenshotUrl: '/images/tutorials/documents.png',
    badge: 'SAFE & ENCRYPTED',
    badgeColor: '#2563eb',
    reraComplianceTag: 'Secure Storage & Identity Protection',
    primaryGoal: 'Store client PAN/Aadhaar cards, title deeds, and sale agreements safely without losing any files.',
    frequency: 'Upload documents whenever taking a listing or closing a deal',
    targetRole: 'Legal Coordinators, Transaction Managers & Advisors',
    closingImpact: 'Having all verified title papers ready in a 1-click folder closes luxury buyers 2x faster.',
    tagline: 'Your secure digital locker for PAN cards, Aadhaar, title deeds, and sale agreements.',
    overview: 'This is your secure digital file cabinet. Instead of digging through WhatsApp chats or computer downloads to find a buyer\'s PAN card or property tax receipt, every file is neatly organized by client or property. Files are encrypted, masked for privacy, and can be viewed or downloaded in 1 second.',
    whenToUse: [
      'When an owner gives you title deeds, 7/12 extract, or occupancy certificate (OC).',
      'When collecting buyer KYC (PAN card, Aadhaar, passport) for agreement drafting.',
      'To preview agreements or send a safe download link to the legal team.'
    ],
    steps: [
      {
        number: 1,
        title: 'Click "+ Upload Document" to Add a File',
        action: 'Click the blue "+ Upload Document" button in the top-right corner to open the file uploader.',
        exactFieldOrButton: 'Top-Right Button ("+ Upload Document")',
        sampleInput: 'Select File: "Title_Deed_Worli_SkyVilla.pdf" • Category: Title Deeds',
        result: 'Securely uploads and encrypts the document in your cloud vault.',
        proTip: 'Always name files clearly (e.g., "Buyer_RahulSharma_PAN.pdf") so you can find them in 1 second.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Filter by Document Category',
        action: 'Click category pills along the top: "All Files", "Agreements", "KYC & Identity", "Title Deeds", or "Tax Receipts".',
        exactFieldOrButton: 'Category Filter Pills (Agreements, KYC, Title Deeds, Tax)',
        sampleInput: 'Click "KYC & Identity" to see only buyer PAN and Aadhaar cards',
        result: 'Instantly filters the document list so you find what you need without scrolling.',
        proTip: 'Keep KYC documents in their own category so you can forward them to the lawyer in one click.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Search by Client Name or Property',
        action: 'Type the buyer or building name in the search box to find all related contracts and identity cards.',
        exactFieldOrButton: 'Search Box ("Search documents by name, client, property...")',
        sampleInput: 'Type "Oberoi" or "Arvind"',
        result: 'Shows only files linked to that specific client or transaction.',
        proTip: 'Type "PAN" to quickly find all identity cards across all active buyers.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Click "View" to Open Fullscreen Preview Modal',
        action: 'Click the eye icon or "View" button on any document row to preview the PDF inside the high-resolution viewer modal.',
        exactFieldOrButton: 'Preview / Eye Icon on Document Row',
        sampleInput: 'Click "View" on Draft Sale Agreement',
        result: 'Opens the clean document viewer modal with zoom, download, and share options.',
        proTip: 'Review the stamp duty payment challan in the viewer before going to the registrar office.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Upload Document Button',
        type: 'button',
        description: 'Drag and drop PDFs, scanned images, or agreements with client tags.',
        bestPractice: 'Upload files directly from your phone camera right after collecting photocopies.'
      },
      {
        name: 'Fullscreen Viewer Modal',
        type: 'button',
        description: 'Previews documents in high definition without forcing you to download them to your computer.',
        bestPractice: 'Use this on your tablet or laptop during client meetings to verify clauses.'
      },
      {
        name: 'Privacy Masking Badge',
        type: 'filter',
        description: 'Automatically masks the first 8 digits of Aadhaar numbers for privacy protection.',
        bestPractice: 'Ensure client Aadhaar numbers are always stored in masked format.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Upload Document Popup',
        triggerButton: '+ Upload Document (Top Right)',
        purpose: 'Upload a document, choose its category, and link it to an active client or property.',
        keyFields: [
          { fieldName: 'Choose File', inputType: 'File Upload (Drag & Drop)', guidance: 'PDF, JPG, or PNG up to 25MB' },
          { fieldName: 'Document Name', inputType: 'Text', guidance: 'Clear title (e.g. Registered Sale Agreement)' },
          { fieldName: 'Category', inputType: 'Dropdown Picker', guidance: 'Pick: Agreement, KYC, Title Deed, or Tax Receipt' },
          { fieldName: 'Link to Deal / Client', inputType: 'Dropdown Picker', guidance: 'Select the associated client or property' }
        ],
        operatorTip: 'Tagging the document to an active deal means it automatically appears on your deal timeline.'
      },
      {
        modalTitle: 'Fullscreen Document Viewer Modal',
        triggerButton: 'View Button on any Document',
        purpose: 'Inspect multi-page contracts, check signatures, and download verified copies.',
        keyFields: [
          { fieldName: 'Page Navigation', inputType: 'Control Bar', guidance: 'Next / previous page controls and zoom (+/-)' },
          { fieldName: 'Download Copy', inputType: 'Button', guidance: 'Download watermarked or verified PDF' }
        ],
        operatorTip: 'Use the zoom tool to verify registration numbers and official stamps on the last page.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Requesting KYC Documents from Buyer',
        useCase: 'Send when preparing the draft sale agreement',
        hinglishScript: 'Namaste {BuyerName} ji! Agreement drafting ke liye kripya aapke PAN card aur Aadhaar card ki clear copy WhatsApp ya email par share kar dijiye. Hamara portal 100% encrypted aur secure hai.',
        englishScript: 'Hello {BuyerName}, for drafting the sale agreement, please share clear copies of your PAN and Aadhaar cards. Our system is fully encrypted and secure to ensure your complete privacy.'
      },
      {
        title: 'Sharing Verified Title Deed Link with Buyer Lawyer',
        useCase: 'Send to buyer\'s legal counsel for title clearance',
        hinglishScript: 'Namaste! Yeh lijiye {PropertyName} ke verified title documents ka secure access link: {DocLink}. Isme Occupancy Certificate, 7/12 extract, aur approved building plans included hain.',
        englishScript: 'Dear Sir, please find the secure access link to verified property papers for {PropertyName}: {DocLink}. It includes the Occupancy Certificate (OC), title search report, and sanctioned floor layout.'
      }
    ],
    closingTactics: {
      proTip: 'Create a "Ready-to-Close" folder for every listing with 4 key files: Occupancy Certificate (OC), RERA registration, Encumbrance Certificate, and Society NOC. This cuts closing time in half.',
      legalTrapToAvoid: 'Never share property ownership papers with random inquiries; only share title documents with buyers who have visited the site and submitted an offer.',
      statOrMetric: 'Advisors who provide instant digital documentation close luxury deals 14 days faster than traditional brokers.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Document Vault (/dashboard/documents)',
      subtitle: 'Encrypted Storage • PAN/Aadhaar Masking • Category Filters & PDF Viewer',
      stats: [
        { label: 'Total Files', value: '38 Documents', color: '#2563eb' },
        { label: 'KYC Verified', value: '100% Safe', color: '#059669' },
        { label: 'Agreements', value: '14 Signed', color: '#7c3aed' },
        { label: 'Storage Used', value: '142 MB', color: '#6b7280' }
      ],
      hotspots: [
        { id: 1, x: 86, y: 14, title: '+ Upload Document Button', description: 'Click to upload contracts, title deeds, or identity cards with drag-and-drop.', actionHint: 'Click to upload files' },
        { id: 2, x: 30, y: 22, title: 'Category Filter Pills', description: 'Filter between Agreements, KYC Identity, Title Deeds, and Tax Receipts.', actionHint: 'Filter by document type' },
        { id: 3, x: 50, y: 14, title: 'Fast Search Input', description: 'Search documents by client name, building, or document type in seconds.', actionHint: 'Type to find contract' },
        { id: 4, x: 88, y: 48, title: 'Fullscreen Preview Modal', description: 'Click to view agreements in high resolution with zoom and download buttons.', actionHint: 'Click to preview document' }
      ]
    }
  },

  // ── 8. BROKERAGE INVOICES ───────────────────────────────────────────────────
  {
    id: 'invoices',
    name: 'Brokerage Invoices (Get Paid Your Commission)',
    shortName: 'Brokerage Invoices',
    category: 'operations',
    icon: ReceiptIcon,
    url: '/dashboard/invoices',
    screenshotUrl: '/images/tutorials/invoices.png',
    badge: '18% GST & TDS READY',
    badgeColor: '#059669',
    reraComplianceTag: 'Tax Invoice SAC 997222 & TDS Tracking',
    primaryGoal: 'Create professional tax invoices with 18% GST, track 5% TDS deductions, and collect your commission on time.',
    frequency: 'Generate whenever a deal reaches agreement signing or registration',
    targetRole: 'Finance Managers, Managing Brokers & Agency Owners',
    closingImpact: 'Sending professional GST invoices with bank RTGS details ensures builders pay your brokerage within 7 days.',
    tagline: 'Create professional tax invoices with 18% GST and bank details, and send via WhatsApp with 1 click.',
    overview: 'This is where you bill for your hard work and track your commission payments. You can generate professional real estate advisory tax invoices with standard 18% GST, calculate 5% TDS deductions, and track whether the builder or buyer has paid you. You can download invoices as PDFs or send them directly via WhatsApp.',
    whenToUse: [
      'As soon as an agreement is registered and your commission becomes payable.',
      'When billing a luxury real estate developer for a booked apartment.',
      'To follow up on pending payments and send polite WhatsApp payment reminders.'
    ],
    steps: [
      {
        number: 1,
        title: 'Click "+ Create Invoice" to Bill Commission',
        action: 'Click the green "+ Create Invoice" button in the top-right corner to open the invoice generator.',
        exactFieldOrButton: 'Top-Right Button ("+ Create Invoice")',
        sampleInput: 'Bill To: Lodha Developers • Deal: Worli Penthouse • Base Fee: ₹15,00,000 + 18% GST',
        result: 'Creates an official numbered tax invoice with automatic GST calculation.',
        proTip: 'Always include the builder\'s registered GSTIN number so they can claim tax credit smoothly.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Check Summary Numbers (Paid vs. Pending)',
        action: 'Look at the top metric cards: Total Invoiced, Collected Revenue, Pending Brokerage, and Overdue Payments.',
        exactFieldOrButton: 'Top 4 Summary Cards (Total Invoiced, Paid, Pending, Overdue)',
        sampleInput: 'Total Invoiced: ₹32.5 Lakhs • Collected: ₹24.0 Lakhs • Pending: ₹8.5 Lakhs',
        result: 'Gives you exact visibility into outstanding payments so no money is lost.',
        proTip: 'Review your Pending Brokerage every Friday morning and send follow-ups before the weekend.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Filter by Payment Status (Paid / Pending)',
        action: 'Click the filter tabs: "All Invoices", "Paid", "Pending", or "Draft" to see which accounts need attention.',
        exactFieldOrButton: 'Status Filter Tabs (All, Paid, Pending, Overdue)',
        sampleInput: 'Click "Pending" to see only unpaid commission bills',
        result: 'Filters your invoice list to focus on incoming collections.',
        proTip: 'Sort pending invoices by due date to follow up on the oldest bills first.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Send Invoice on WhatsApp with 1 Click',
        action: 'Click the green WhatsApp icon on any invoice row to send a polite payment note with the PDF download link.',
        exactFieldOrButton: 'WhatsApp Action Button on Invoice Row',
        sampleInput: 'Click WhatsApp next to "INV-2026-0042"',
        result: 'Opens WhatsApp with a pre-formatted message including invoice number, amount, and bank details.',
        proTip: 'Always attach your agency\'s bank NEFT/RTGS details in the message for easy payment.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Create Invoice Button',
        type: 'button',
        description: 'Opens the invoice builder with automatic 18% GST and 5% TDS calculations.',
        bestPractice: 'Select the deal from your pipeline to automatically pull client and pricing details.'
      },
      {
        name: 'Auto GST & TDS Calculator',
        type: 'export',
        description: 'Calculates 18% GST and subtracts 5% TDS under tax rules automatically.',
        bestPractice: 'Always ask the developer for their Form 16A quarterly TDS certificate.'
      },
      {
        name: 'Download PDF Button',
        type: 'button',
        description: 'Generates a clean, watermarked tax invoice formatted for accounting departments.',
        bestPractice: 'Email the PDF to the builder\'s finance department with a CC to your sales contact.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Generate Tax Invoice Popup',
        triggerButton: '+ Create Invoice (Top Right)',
        purpose: 'Create a formal real estate brokerage invoice with GST and bank account details.',
        keyFields: [
          { fieldName: 'Client / Developer Name', inputType: 'Dropdown / Text', guidance: 'Name of the party paying your commission' },
          { fieldName: 'Deal Consideration', inputType: 'Rupee Currency Input', guidance: 'Agreed deal value (e.g. ₹7.5 Cr)' },
          { fieldName: 'Brokerage Rate / Amount', inputType: 'Percentage / Amount', guidance: 'e.g. 2% = ₹15,00,000' },
          { fieldName: 'GST (18%) & TDS (5%)', inputType: 'Automatic Calculation', guidance: 'System automatically computes tax amounts' },
          { fieldName: 'Bank RTGS Details', inputType: 'Saved Profile', guidance: 'Your bank account number and IFSC code' }
        ],
        operatorTip: 'Check the "Split Commission" box if co-brokering the deal with an external partner.'
      },
      {
        modalTitle: 'Record Payment Received',
        triggerButton: 'Mark as Paid Button on Invoice',
        purpose: 'Log when money hits your bank account and mark the invoice as settled.',
        keyFields: [
          { fieldName: 'Amount Received', inputType: 'Rupee Currency Input', guidance: 'Net amount received after TDS deduction' },
          { fieldName: 'Payment Reference / UTR', inputType: 'Text', guidance: 'Bank transaction ID' },
          { fieldName: 'Payment Date', inputType: 'Date Picker', guidance: 'Date funds cleared in your account' }
        ],
        operatorTip: 'Always verify the net amount against your bank statement before marking as fully paid.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Friendly Brokerage Invoice Dispatch',
        useCase: 'Send immediately after agreement registration',
        hinglishScript: 'Namaste {ClientName} ji! Deal registration successfully complete hone par bohot bohot badhai! Aapka brokerage tax invoice {InvoiceNo} for ₹{TotalAmount} ready hai. Invoice copy: {InvoiceLink}. Hamare bank RTGS details invoice par mentioned hain. Thank you for your trust!',
        englishScript: 'Dear {ClientName}, hearty congratulations on the successful registration of {PropertyName}! Please find attached our brokerage tax invoice {InvoiceNo} for ₹{TotalAmount}: {InvoiceLink}. Our bank RTGS details are specified on the invoice. Thank you for your partnership!'
      },
      {
        title: 'Gentle Payment Reminder for Pending Brokerage',
        useCase: 'Send 7 days after sending the initial invoice',
        hinglishScript: 'Namaste {ClientName} ji! Hope you are doing well. Ek gentle reminder regarding invoice {InvoiceNo} (₹{PendingAmount}) jo {DueDate} ko due tha. Kripya accounts team se payment release karwane mein help karein. Thank you!',
        englishScript: 'Hello {ClientName}, hope you are doing well. Just a gentle follow-up regarding invoice {InvoiceNo} for ₹{PendingAmount} which was due on {DueDate}. Could you please check with your accounts team for processing? Thank you!'
      }
    ],
    closingTactics: {
      proTip: 'Send your brokerage invoice on the exact day of registration while the client and developer are celebrating the closing. Invoices sent on day 1 get paid 3x faster.',
      legalTrapToAvoid: 'Never accept cash brokerage payments; always take payments via RTGS/cheque with proper GST invoicing to stay 100% compliant.',
      statOrMetric: 'Agencies using digital GST invoices get paid within 8 days compared to the 35-day industry average.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Brokerage Invoices (/dashboard/invoices)',
      subtitle: '18% GST Invoicing • TDS Tracking • Paid/Pending Tabs • 1-Click WhatsApp',
      stats: [
        { label: 'Total Invoiced', value: '₹32.5 Lakhs', color: '#059669' },
        { label: 'Collected', value: '₹24.0 Lakhs', color: '#2563eb' },
        { label: 'Pending', value: '₹8.5 Lakhs', color: '#f59e0b' },
        { label: 'GST Collected', value: '₹4.95 Lakhs', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 86, y: 14, title: '+ Create Invoice Button', description: 'Click to generate a new tax invoice with 18% GST and bank details.', actionHint: 'Click to create invoice' },
        { id: 2, x: 50, y: 14, title: 'Invoicing Summary Cards', description: 'See total invoiced, collected revenue, pending brokerage, and GST collected.', actionHint: 'Check pending commission' },
        { id: 3, x: 30, y: 22, title: 'Paid / Pending Tabs', description: 'Filter between all invoices, paid receipts, and pending accounts in 1 click.', actionHint: 'Filter by payment status' },
        { id: 4, x: 88, y: 48, title: 'WhatsApp PDF Dispatch', description: 'Send a professional invoice link and bank details to the client in 1 click.', actionHint: 'Click to send on WhatsApp' }
      ]
    }
  },

  // ── 9. TASKS & MILESTONES ───────────────────────────────────────────────────
  {
    id: 'tasks',
    name: 'Tasks & Milestones (Your To-Do List)',
    shortName: 'Tasks & To-Do',
    category: 'operations',
    icon: CheckSquareIcon,
    url: '/dashboard/tasks',
    screenshotUrl: '/images/tutorials/tasks.png',
    badge: 'PRIORITY CHECKLIST',
    badgeColor: '#f59e0b',
    reraComplianceTag: 'Operational SLA & Deadline Tracking',
    primaryGoal: 'Stay on top of paperwork deadlines, key handovers, and buyer follow-ups without missing anything.',
    frequency: 'Check every morning and check off tasks as you finish them',
    targetRole: 'All Property Advisors & Operations Team',
    closingImpact: 'Completing follow-up tasks on the same day prevents 90% of deal delays and client frustration.',
    tagline: 'Your team to-do list with due dates, priority tags, and property links.',
    overview: 'Think of this page as your personal assistant. Whenever you need to collect a document, schedule key verification, or follow up on a bank loan sanction, create a task here. You can set due dates, mark items as High Priority, assign them to team members, and check them off when completed.',
    whenToUse: [
      'When an owner asks you to pick up the keys or inspect the flat before a showing.',
      'To track bank loan documents, stamp duty challans, or draft agreement reviews.',
      'Every morning to see what needs to be completed before 1:00 PM.'
    ],
    steps: [
      {
        number: 1,
        title: 'Click "+ Add Task" to Create a To-Do Item',
        action: 'Click the yellow "+ Add Task" button in the top-right corner to open the quick task form.',
        exactFieldOrButton: 'Top-Right Button ("+ Add Task")',
        sampleInput: 'Task: "Pick up flat keys from Caretaker at Worli" • Priority: High • Due: Today 2:00 PM',
        result: 'Adds the task to your daily checklist with a priority badge.',
        proTip: 'Be specific in task names: write "Collect PAN from Dr. Singhania" instead of just "Call buyer".',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Filter by Priority (High / Medium / Low)',
        action: 'Click the filter pills: "All Tasks", "High Priority", "Due Today", or "Completed" to group your work.',
        exactFieldOrButton: 'Priority Filter Pills (All, High, Due Today, Completed)',
        sampleInput: 'Click "Due Today" to see what must be finished before leaving the office',
        result: 'Hides future tasks so you focus only on today\'s urgent deadlines.',
        proTip: 'Always finish all High Priority tasks before 12:00 noon.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Search by Task Name or Client',
        action: 'Use the search box to find tasks linked to a specific client, deal, or property address.',
        exactFieldOrButton: 'Search Box ("Search tasks by title, assignee, deal...")',
        sampleInput: 'Type "Agreement" or "Keys" or "Sharma"',
        result: 'Instantly filters your checklist as you type.',
        proTip: 'Search a building name to see all pending operational tasks for that property.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Check Off Completed Tasks with 1 Click',
        action: 'When you finish a task, click the circular checkbox on the left side of the task row to mark it Done.',
        exactFieldOrButton: 'Circular Checkbox on Task Row',
        sampleInput: 'Click checkbox next to "Send Google Maps pin to Rahul Sharma"',
        result: 'Marks the task completed with a green checkmark and updates your daily progress.',
        proTip: 'Checking off tasks gives you a clear sense of momentum throughout your workday.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '+ Add Task Button',
        type: 'button',
        description: 'Creates a new to-do item with priority level, due date, and linked deal.',
        bestPractice: 'Create tasks with realistic time estimates so you never feel overwhelmed.'
      },
      {
        name: 'Priority Badges',
        type: 'filter',
        description: 'Color-coded tags: Red (High Priority), Yellow (Medium), and Grey (Low).',
        bestPractice: 'Never have more than 3 Red tasks in a single day.'
      },
      {
        name: 'Due Date Countdown',
        type: 'export',
        description: 'Displays clear reminders like "Due Today" or "Overdue by 1 Day" to keep you on schedule.',
        bestPractice: 'Reschedule or delegate tasks immediately if you are delayed on site.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Add New Task Popup',
        triggerButton: '+ Add Task (Top Right)',
        purpose: 'Create a to-do item with deadline, priority level, and assigned team member.',
        keyFields: [
          { fieldName: 'Task Title', inputType: 'Text', guidance: 'Short, clear action (e.g. Collect Society NOC)' },
          { fieldName: 'Priority Level', inputType: 'Dropdown Picker', guidance: 'Select High, Medium, or Low' },
          { fieldName: 'Due Date & Time', inputType: 'Date/Time Picker', guidance: 'Deadline for completion' },
          { fieldName: 'Link to Deal / Property', inputType: 'Dropdown Picker', guidance: 'Associate with active transaction' }
        ],
        operatorTip: 'Assign operational tasks like key pickups to junior associates so you can focus on client calls.'
      },
      {
        modalTitle: 'Edit Task & Add Notes',
        triggerButton: 'Task Row Click',
        purpose: 'Add updates or change deadlines when a client asks for extra time.',
        keyFields: [
          { fieldName: 'Status', inputType: 'Dropdown Picker', guidance: 'Switch between To Do, In Progress, and Completed' },
          { fieldName: 'Progress Notes', inputType: 'Textarea', guidance: 'Write what happened (e.g. Caretaker delayed by 30 mins)' }
        ],
        operatorTip: 'Always leave a quick note if you reschedule a task so your team knows why.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Task Delegation to Field Assistant',
        useCase: 'Send to your assistant to handle property keys or documents',
        hinglishScript: 'Hi {AssociateName}, please check your AgentLadders tasks. Aaj 2:00 PM tak {PropertyName} ke caretaker se flat keys collect karke Gate 1 par ready rakhna hai. Buyer visit 3:00 PM ko hai. Let me know once collected!',
        englishScript: 'Hi {AssociateName}, please check your tasks on AgentLadders. You need to collect the keys from the caretaker at {PropertyName} by 2:00 PM today. The client visit is at 3:00 PM. Please confirm once done!'
      },
      {
        title: 'Task Update to Client on Document Collection',
        useCase: 'Update buyer after collecting their papers from home/office',
        hinglishScript: 'Namaste {ClientName} ji! Aapke office se original documents safely collect ho gaye hain aur hamare legal vault mein register kar diye gaye hain. Thank you for your cooperation!',
        englishScript: 'Dear {ClientName}, your documents have been collected safely from your office and entered into our secure legal vault. Thank you for your support!'
      }
    ],
    closingTactics: {
      proTip: 'End every site visit by writing down 1 follow-up task before starting your car. This ensures you never forget buyer requests.',
      legalTrapToAvoid: 'Never leave stamp duty or registration deadlines to the last day; always complete paperwork at least 48 hours before registration.',
      statOrMetric: 'Advisors who use daily task checklists miss 95% fewer client follow-ups than those relying on memory.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Operational Tasks (/dashboard/tasks)',
      subtitle: 'Priority Checklist • Due Dates • High/Medium Tags • 1-Click Completion',
      stats: [
        { label: 'Total Tasks', value: '18 Tasks', color: '#f59e0b' },
        { label: 'Due Today', value: '4 Urgent', color: '#dc2626' },
        { label: 'Completed', value: '12 Done', color: '#059669' },
        { label: 'High Priority', value: '3 Critical', color: '#dc2626' }
      ],
      hotspots: [
        { id: 1, x: 86, y: 14, title: '+ Add Task Button', description: 'Click to create a new to-do item with due date and priority level.', actionHint: 'Click to create a task' },
        { id: 2, x: 35, y: 22, title: 'Priority Filter Pills', description: 'Filter between All Tasks, High Priority, Due Today, and Completed items.', actionHint: 'Filter by urgency' },
        { id: 3, x: 50, y: 14, title: 'Task Search Input', description: 'Search tasks by keyword, client name, or building address in real-time.', actionHint: 'Type to find a task' },
        { id: 4, x: 18, y: 45, title: '1-Click Checkbox', description: 'Click the circle to instantly mark the task complete with a green checkmark.', actionHint: 'Click to check off task' }
      ]
    }
  },

  // ── 10. EXECUTIVE REPORTS ───────────────────────────────────────────────────
  {
    id: 'reports',
    name: 'Executive Reports (Your Business Summary)',
    shortName: 'Reports & Exports',
    category: 'operations',
    icon: BarChartIcon,
    url: '/dashboard/reports',
    screenshotUrl: '/images/tutorials/reports.png',
    badge: 'BOARD-READY EXPORTS',
    badgeColor: '#7c3aed',
    reraComplianceTag: 'Agency Performance & Audit Reports',
    primaryGoal: 'Generate clean monthly summaries and Excel/PDF reports to review your agency\'s growth.',
    frequency: 'Run at the end of every month and quarterly planning',
    targetRole: 'Agency Owners, Managing Partners & Accountants',
    closingImpact: 'Sharing clean quarterly reports with property developers proves your closing ability and wins exclusive mandates.',
    tagline: 'Create board-ready business reports, lead conversion summaries, and Excel downloads in 1 click.',
    overview: 'This is where you get big-picture summaries of your business. Whether you need an Excel file of all deals closed this year, a breakdown of where your leads came from, or a PDF report to show property developers how fast you sell homes, you can generate and download it here in seconds.',
    whenToUse: [
      'At the end of every month to see total commission earned and agent performance.',
      'When pitching a luxury builder to win exclusive sole-selling rights for a new tower.',
      'To export sales data to Excel for your chartered accountant (CA) and tax filing.'
    ],
    steps: [
      {
        number: 1,
        title: 'Choose Report Type (Sales, Leads, or Deals)',
        action: 'Select the report you want from the left selector: Sales Summary, Lead Source Performance, or Closed Transactions.',
        exactFieldOrButton: 'Report Type Selector (Sales, Leads, Inventory, Transactions)',
        sampleInput: 'Select "Quarterly Sales & Commission Summary"',
        result: 'Loads the relevant summary charts and data tables on your screen.',
        proTip: 'Use "Lead Source ROI" to see which advertising channel brings you the most profitable buyers.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Select Your Date Range (Month, Quarter, Year)',
        action: 'Click the date range dropdown to choose: "This Month", "Last 90 Days", or "Current Financial Year".',
        exactFieldOrButton: 'Date Range Selector Dropdown (Month / Quarter / Year)',
        sampleInput: 'Pick "Current Financial Year (2025-26)"',
        result: 'Filters all transaction numbers and metrics for that exact time frame.',
        proTip: 'Review quarterly performance rather than single months for a true picture of luxury sales.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Inspect Summary Charts and Key Numbers',
        action: 'Review the visual graphs: monthly deal volume, top-performing agents, and average commission percentage.',
        exactFieldOrButton: 'Executive Summary Cards & Revenue Charts',
        sampleInput: 'Total Volume: ₹48.05 Cr • Brokerage: ₹96.1 Lakhs • Average Ticket: ₹8.0 Cr',
        result: 'Gives you clear facts and figures for partner meetings or builder pitches.',
        proTip: 'Save screenshots of these charts to include in your agency\'s credentials deck.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Click "Export to Excel" or "Download PDF"',
        action: 'Click the download buttons in the top-right corner to export clean spreadsheets or formatted PDF reports.',
        exactFieldOrButton: 'Top-Right Buttons ("📥 Export CSV / Excel" & "📄 Download PDF")',
        sampleInput: 'Click "Export CSV" to get all client and deal rows in Excel',
        result: 'Downloads a clean file ready to email to your accountant or leadership team.',
        proTip: 'Keep a monthly folder on your computer with these exported reports for smooth annual auditing.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Report Type Selector',
        type: 'filter',
        description: 'Switches between Sales Performance, Lead Source ROI, and Inventory Velocity.',
        bestPractice: 'Run the Lead Source report before deciding where to spend your next marketing budget.'
      },
      {
        name: 'Date Range Dropdown',
        type: 'filter',
        description: 'Filters numbers by Custom Dates, Last Quarter, or Financial Year.',
        bestPractice: 'Select April to March for Indian financial year tax planning.'
      },
      {
        name: 'One-Click Excel / CSV Export',
        type: 'export',
        description: 'Downloads clean spreadsheets with every deal, date, client name, and commission amount.',
        bestPractice: 'Share this directly with your CA for quarterly GST and tax filings.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Custom Report Builder',
        triggerButton: 'Custom Report Button (Top Right)',
        purpose: 'Create a tailored report selecting specific metrics, dates, and agent filters.',
        keyFields: [
          { fieldName: 'Metrics to Include', inputType: 'Checkboxes', guidance: 'Check Volume, Commission, Site Visits, or Lead Sources' },
          { fieldName: 'Date Range', inputType: 'Date Pickers', guidance: 'Pick custom start and end dates' },
          { fieldName: 'Filter by Micro-Market', inputType: 'Dropdown Picker', guidance: 'Select specific areas (e.g. Worli & Bandra only)' }
        ],
        operatorTip: 'Filter by a specific developer when presenting sales progress to their board.'
      },
      {
        modalTitle: 'Schedule Automated Email Reports',
        triggerButton: 'Automate Report Button',
        purpose: 'Have monthly summary reports sent automatically to your email every month.',
        keyFields: [
          { fieldName: 'Recipient Emails', inputType: 'Email Input', guidance: 'Add partner and accountant email addresses' },
          { fieldName: 'Frequency', inputType: 'Dropdown Picker', guidance: 'Select Weekly or Monthly on 1st' }
        ],
        operatorTip: 'Send this automatically to agency partners so everyone stays aligned on revenue numbers.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Sharing Sales Performance with Luxury Developer',
        useCase: 'Send to developer showing how fast your firm sells units',
        hinglishScript: 'Namaste {DeveloperName} ji! Please find our agency\'s Q3 Sales & Velocity Report attached: {ReportLink}. In the last 90 days, we successfully transacted ₹{Volume} Cr in {Locality} with an average closing time of 28 days. Would love to present our mandate strategy for your upcoming tower.',
        englishScript: 'Dear {DeveloperName}, please find our firm\'s Q3 Performance & Velocity Report attached: {ReportLink}. Over the past 90 days, we completed ₹{Volume} Cr in luxury transactions in {Locality}. We would be thrilled to present our sole-selling strategy for your new development.'
      },
      {
        title: 'Monthly Performance Summary to Agency Partners',
        useCase: 'Share in leadership group on the 1st of every month',
        hinglishScript: 'Partners, hamara {Month} summary ready hai: Total Closed Volume ₹{Volume} Cr, Net Commission ₹{Commission} Lakhs across {DealsCount} deals. Detailed Excel report download link: {ReportLink}. Great closing month!',
        englishScript: 'Partners, our {Month} summary is ready: Total Closed Volume ₹{Volume} Cr, Net Brokerage ₹{Commission} Lakhs across {DealsCount} transactions. Detailed report link: {ReportLink}. Exceptional effort all around!'
      }
    ],
    closingTactics: {
      proTip: 'When competing for sole-selling rights on a luxury building, bring a bound copy of your past reports. Real numbers win exclusive mandates over empty promises every single time.',
      legalTrapToAvoid: 'Never share client-identifying confidential data in public presentations; always anonymize buyer names when showcasing past closings.',
      statOrMetric: 'Agencies that present data-backed reports win 65% more exclusive builder mandates than those presenting basic pitch decks.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Executive Reports (/dashboard/reports)',
      subtitle: 'Board-Ready Reports • Deal Volume • Lead Source ROI • CSV/PDF Exports',
      stats: [
        { label: 'YTD Volume', value: '₹48.05 Cr', color: '#7c3aed' },
        { label: 'Closed Deals', value: '8 Deals', color: '#059669' },
        { label: 'Avg Deal Size', value: '₹8.0 Cr', color: '#2563eb' },
        { label: 'Total Brokerage', value: '₹96.1 Lakhs', color: '#059669' }
      ],
      hotspots: [
        { id: 1, x: 25, y: 14, title: 'Report Type Selector', description: 'Switch between Sales Summary, Lead Source ROI, and Transaction Lists.', actionHint: 'Choose report type' },
        { id: 2, x: 55, y: 14, title: 'Date Range Selector', description: 'Pick This Month, Last 90 Days, or Financial Year to filter your numbers.', actionHint: 'Select time period' },
        { id: 3, x: 45, y: 40, title: 'Visual Revenue Charts', description: 'Review volume trends, top localities, and commission velocity graphs.', actionHint: 'Inspect performance graphs' },
        { id: 4, x: 86, y: 14, title: 'Excel / PDF Export Buttons', description: 'Download clean spreadsheets or formatted PDF summaries in 1 click.', actionHint: 'Click to export report' }
      ]
    }
  },

  // ── 11. HELP & SUPPORT ──────────────────────────────────────────────────────
  {
    id: 'support',
    name: 'Help & Support (Answers, Hotline & Privacy Terms)',
    shortName: 'Help & Support',
    category: 'admin',
    icon: MessageCircleIcon,
    url: '/dashboard/support',
    screenshotUrl: '/images/tutorials/support.png',
    badge: '4-TAB SUPPORT DESK',
    badgeColor: '#2563eb',
    reraComplianceTag: 'VIP Concierge & Privacy Terms (🛡️)',
    primaryGoal: 'Get fast answers to questions, submit support tickets, reach our WhatsApp concierge, or check legal terms.',
    frequency: 'Use whenever you have a technical question or need compliance guidance',
    targetRole: 'All Platform Users, Brokers & Admins',
    closingImpact: 'Fast support resolution ensures your CRM never slows you down during high-stakes property negotiations.',
    tagline: 'Your complete help center with 4 clear tabs: Support Tickets, WhatsApp Hotline, FAQs, and Privacy Terms.',
    overview: 'This is where you go whenever you have a question or need assistance. The page is organized into 4 clear tabs: 1. Help Desk & Support Tickets (submit and track tickets), 2. WhatsApp Support (chat live with our concierge team), 3. Knowledge Base FAQs (search instant answers to common broker questions), and 4. Terms & Privacy Policy (🛡️) (check your data rights, RERA compliance, and privacy terms).',
    whenToUse: [
      'When you need help with a feature or want to report an issue.',
      'To reach our priority WhatsApp support hotline for instant assistance.',
      'To review our privacy terms, RERA compliance guidelines, or data protection standards.'
    ],
    steps: [
      {
        number: 1,
        title: 'Explore the 4 Support Tabs Along the Top',
        action: 'Look at the top tab bar: 1. Help Desk, 2. WhatsApp Support, 3. Knowledge Base FAQs, and 4. Terms & Privacy Policy (🛡️). Click any tab to switch views.',
        exactFieldOrButton: 'Top Tab Bar (4 Tabs: Help Desk, WhatsApp, FAQs, Terms & Privacy)',
        sampleInput: 'Click "🛡️ Terms & Privacy Policy" tab to review compliance standards',
        result: 'Instantly switches the view to show the selected help section.',
        proTip: 'Check the FAQs tab first; 90% of questions are answered there immediately.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Click "+ Raise Support Ticket" to Submit an Issue',
        action: 'In the Help Desk tab, click the blue "+ Raise Support Ticket" button to send an issue directly to our tech team.',
        exactFieldOrButton: 'Blue Button ("+ Raise Support Ticket")',
        sampleInput: 'Subject: "Need help adding custom locality" • Priority: Medium',
        result: 'Creates a tracked support ticket with an assigned resolution time.',
        proTip: 'Include a screenshot of what you see on screen for faster resolution.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Chat Directly on the WhatsApp Concierge Hotline',
        action: 'Click the "WhatsApp Support" tab or tap the green "Chat on WhatsApp" button to message our VIP broker support team.',
        exactFieldOrButton: 'Green WhatsApp Concierge Button ("Chat on WhatsApp")',
        sampleInput: 'Click button to open WhatsApp chat with AgentLadders Concierge',
        result: 'Connects you directly to a live support specialist within 5 minutes.',
        proTip: 'Use WhatsApp support when you are in the field and need a quick answer on your phone.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Review the "Terms & Privacy Policy" (🛡️) Tab',
        action: 'Click the 4th tab ("🛡️ Terms & Privacy Policy") to review data privacy rules, RERA mandates, and broker protections.',
        exactFieldOrButton: '4th Tab ("🛡️ Terms & Privacy Policy")',
        sampleInput: 'Click tab to inspect data protection and RERA compliance standards',
        result: 'Displays clear, simple explanations of how your client data is protected and kept private.',
        proTip: 'Assure your high-net-worth clients that your CRM follows strict Indian privacy and security laws.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: '4-Tab Support Bar',
        type: 'filter',
        description: 'Organizes tickets, live WhatsApp chat, FAQs, and privacy terms in one easy place.',
        bestPractice: 'Bookmark this page on your phone for instant access to the support team.'
      },
      {
        name: '+ Raise Support Ticket Button',
        type: 'button',
        description: 'Opens the ticket submission form with priority selector and file attachment.',
        bestPractice: 'Select "High Priority" if a deal-critical feature needs immediate help.'
      },
      {
        name: 'Instant WhatsApp Concierge',
        type: 'button',
        description: '1-click button to chat with our dedicated customer support team on WhatsApp.',
        bestPractice: 'Available 7 days a week from 8:00 AM to 9:00 PM.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Submit Support Ticket Popup',
        triggerButton: '+ Raise Support Ticket (Help Desk Tab)',
        purpose: 'Submit a question, feature request, or technical issue to the engineering team.',
        keyFields: [
          { fieldName: 'Ticket Subject', inputType: 'Text', guidance: 'Short summary of what you need' },
          { fieldName: 'Category', inputType: 'Dropdown Picker', guidance: 'Pick: Billing, Feature Request, Technical, or Legal' },
          { fieldName: 'Priority Level', inputType: 'Dropdown Picker', guidance: 'Select Low, Medium, or Urgent' },
          { fieldName: 'Description & Screenshot', inputType: 'Textarea & File', guidance: 'Explain what happened and attach a screenshot' }
        ],
        operatorTip: 'Tickets marked Urgent are routed directly to our on-call tech team.'
      },
      {
        modalTitle: 'Search Knowledge Base FAQs',
        triggerButton: 'Search Box in FAQs Tab',
        purpose: 'Find instant answers to questions about WhatsApp setup, RERA rules, or invoice taxes.',
        keyFields: [
          { fieldName: 'Search Question', inputType: 'Text', guidance: 'Type keyword like "GST", "2FA", or "WhatsApp"' }
        ],
        operatorTip: 'Type "RERA" to see instant answers on carpet area mandates and commission norms.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Live Chat with AgentLadders Concierge',
        useCase: 'Send when you need instant help during a busy workday',
        hinglishScript: 'Namaste AgentLadders Support! Main {BrokerName} from {AgencyName}. Mujhe {ModuleName} mein ek help chahiye regarding {FeatureName}. Kripya guide karein.',
        englishScript: 'Hello AgentLadders Support team! This is {BrokerName} from {AgencyName}. I need a quick hand with {FeatureName} in the {ModuleName} screen. Please assist.'
      },
      {
        title: 'Assuring a Buyer About Data Privacy & Confidentiality',
        useCase: 'Send to a high-profile client concerned about their contact privacy',
        hinglishScript: 'Namaste {BuyerName} ji! Aapki complete privacy hamari first priority hai. Hamara CRM system 100% encrypted hai aur Indian Data Protection laws comply karta hai. Aapka contact number aur financial details kisi bhi third party ya builder ke saath share nahi ki jaati.',
        englishScript: 'Dear {BuyerName}, your privacy is our highest priority. Our operating system utilizes 256-bit bank-grade encryption and complies strictly with the Digital Personal Data Protection Act. Your personal details and search criteria are never shared with any third party.'
      }
    ],
    closingTactics: {
      proTip: 'When meeting ultra-high-net-worth clients, highlight that your agency uses an enterprise-grade, encrypted CRM to protect their family\'s financial privacy. This wins trust immediately.',
      legalTrapToAvoid: 'Never share client phone numbers in open broadcast WhatsApp groups; always message clients individually to maintain full privacy.',
      statOrMetric: 'Over 92% of support questions submitted via WhatsApp are resolved in under 15 minutes.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Help & Support Desk (/dashboard/support)',
      subtitle: '4 Tabs: Help Desk • WhatsApp Hotline • FAQs • Terms & Privacy (🛡️)',
      stats: [
        { label: 'Avg Reply Time', value: '5 Mins', color: '#059669' },
        { label: 'Hotline Status', value: 'Live 7 Days', color: '#2563eb' },
        { label: 'Open Tickets', value: '0 Pending', color: '#059669' },
        { label: 'Data Security', value: '256-Bit SSL', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 30, y: 14, title: '4 Support Navigation Tabs', description: 'Switch between Help Desk, WhatsApp Support, FAQs, and Privacy Terms.', actionHint: 'Click to switch tab' },
        { id: 2, x: 86, y: 14, title: '+ Raise Support Ticket Button', description: 'Click to open the popup and submit a tracked question or request.', actionHint: 'Click to create a ticket' },
        { id: 3, x: 50, y: 35, title: 'WhatsApp Concierge Hotline', description: 'Tap to chat directly with our priority customer support team on WhatsApp.', actionHint: 'Click to chat on WhatsApp' },
        { id: 4, x: 75, y: 14, title: 'Terms & Privacy Tab (🛡️)', description: 'Inspect our data protection rules, RERA standards, and broker privacy guarantees.', actionHint: 'Click to inspect privacy terms' }
      ]
    }
  },

  // ── 12. AGENCY SETTINGS & SECURITY ──────────────────────────────────────────
  {
    id: 'settings',
    name: 'Agency Settings & Security (Branding & Account Safe)',
    shortName: 'Settings & Security',
    category: 'admin',
    icon: SettingsIcon,
    url: '/dashboard/settings',
    screenshotUrl: '/images/tutorials/settings.png',
    badge: '2FA & SECURITY SAFE',
    badgeColor: '#059669',
    reraComplianceTag: 'Agency RERA ID & Account Protection',
    primaryGoal: 'Set up your agency branding, enter your RERA registration number, and turn on Two-Factor Authentication (2FA) to keep your account safe.',
    frequency: 'Configure once during setup and check monthly for security',
    targetRole: 'Agency Owners, Managing Partners & System Admins',
    closingImpact: 'Displaying an official state RERA number on your brochures and invoices establishes instant credibility with luxury buyers.',
    tagline: 'Manage your agency logo, RERA number, GSTIN, team permissions, and Two-Factor Authentication.',
    overview: 'This is the master control room for your agency. You can customize your company logo, enter your state RERA license number and GSTIN, manage team members, and keep your business safe with Two-Factor Authentication (2FA) and device login tracking.',
    whenToUse: [
      'During your first week to upload your agency logo and official contact info.',
      'To turn on Two-Factor Authentication (2FA) using Google Authenticator for maximum security.',
      'To review active logged-in computers and log out unfamiliar devices with 1 click.'
    ],
    steps: [
      {
        number: 1,
        title: 'Upload Your Agency Logo and Business Info',
        action: 'In the Profile tab, upload your high-resolution company logo, enter your agency name, official email, phone, and office address.',
        exactFieldOrButton: 'Agency Profile Form (Logo Upload, Name, Email, Office Address)',
        sampleInput: 'Agency: "Vance Realty Luxury Advisors" • Email: contact@vancerealty.com • Worli, Mumbai',
        result: 'Your logo and address will automatically appear on all brochures and invoices.',
        proTip: 'Upload a logo with a transparent background for the cleanest look on PDF brochures.',
        hotspotIndex: 1
      },
      {
        number: 2,
        title: 'Enter RERA License & GSTIN Numbers',
        action: 'Fill in your state RERA Registration Number (e.g., A51900001234) and 15-digit GSTIN number.',
        exactFieldOrButton: 'Statutory Compliance Fields (RERA Registration #, GSTIN Number)',
        sampleInput: 'RERA ID: "MAHARERA / A51900024890" • GSTIN: "27AAAAA0000A1Z5"',
        result: 'Embeds your verified license number on all client proposals and tax invoices.',
        proTip: 'Double-check your RERA expiry date so your license never lapses unnoticed.',
        hotspotIndex: 2
      },
      {
        number: 3,
        title: 'Turn on Two-Factor Authentication (2FA)',
        action: 'In the Security tab, toggle on Two-Factor Authentication. Scan the QR code with Google Authenticator or Microsoft Authenticator.',
        exactFieldOrButton: 'Security Settings (Two-Factor Authentication Toggle & QR Scanner)',
        sampleInput: 'Toggle 2FA to ON • Enter 6-digit verification code from Google Authenticator',
        result: 'Protects your client database so nobody can log in without your phone approval.',
        proTip: 'Always save your 16-character backup recovery key in a safe notebook.',
        hotspotIndex: 3
      },
      {
        number: 4,
        title: 'Inspect Active Login Sessions and Devices',
        action: 'Scroll down to "Active Sessions". See which computers and phones are logged into your account with browser name and IP location.',
        exactFieldOrButton: 'Active Sessions Table & "Revoke Other Sessions" Button',
        sampleInput: 'Review: "Google Chrome on Windows 11 (Mumbai, India)" • Click "Revoke"',
        result: 'Instantly logs out any old, stolen, or unfamiliar computers.',
        proTip: 'Click "Revoke Other Sessions" if you ever leave an office computer or cyber café logged in.',
        hotspotIndex: 4
      }
    ],
    keyControls: [
      {
        name: 'Agency Branding Profile',
        type: 'button',
        description: 'Customizes your agency name, logo, phone number, and office address across the app.',
        bestPractice: 'Keep your agency details up to date so outgoing invoices look 100% professional.'
      },
      {
        name: 'Two-Factor Authentication (2FA)',
        type: 'toggle',
        description: 'Requires a 6-digit phone code whenever signing into your account from a new computer.',
        bestPractice: 'Mandate 2FA for all team members to protect your confidential buyer lists.'
      },
      {
        name: 'Active Sessions Security Monitor',
        type: 'filter',
        description: 'Shows live device logins with city location, IP address, and 1-click logout buttons.',
        bestPractice: 'Check this table once a month to ensure only your authorized devices are active.'
      }
    ],
    modalShowcase: [
      {
        modalTitle: 'Setup Two-Factor Authentication Popup',
        triggerButton: 'Turn On 2FA Toggle (Security Tab)',
        purpose: 'Connect Google Authenticator or SMS to lock down your broker account.',
        keyFields: [
          { fieldName: 'QR Code Scanner', inputType: 'QR Code Display', guidance: 'Scan using Google Authenticator on your phone' },
          { fieldName: '6-Digit Verification Code', inputType: 'Number (6 digits)', guidance: 'Type the 6-digit code shown on your phone screen' },
          { fieldName: 'Backup Recovery Key', inputType: 'Read-only String', guidance: 'Write this key down in case you change phones' }
        ],
        operatorTip: 'Take a screenshot of your backup key and save it securely.'
      },
      {
        modalTitle: 'Add Team Member Popup',
        triggerButton: '+ Add Team Member (Team Tab)',
        purpose: 'Invite an associate broker or assistant with customized view/edit permissions.',
        keyFields: [
          { fieldName: 'Full Name & Email', inputType: 'Text & Email', guidance: 'Associate name and company email address' },
          { fieldName: 'Role & Permissions', inputType: 'Dropdown Picker', guidance: 'Select: Admin, Senior Advisor, or Showing Assistant' }
        ],
        operatorTip: 'Assign junior associates the "Showing Assistant" role so they can view visits without editing sensitive commission data.'
      }
    ],
    whatsAppVault: [
      {
        title: 'Sharing Verified Agency Credentials with Luxury Developer',
        useCase: 'Send to property developer during initial partnership introduction',
        hinglishScript: 'Namaste {DeveloperName} ji! Introducing {AgencyName}. Hum {Locality} ke premier luxury real estate advisors hain. Hamari agency MAHARERA registered hai ({ReraID}) with active GSTIN: {GSTIN}. Looking forward to an exclusive partnership on your prestigious development.',
        englishScript: 'Dear {DeveloperName}, introducing {AgencyName}. We are a premier luxury real estate advisory firm operating across {Locality}. Our firm is fully registered under RERA ({ReraID}) and GST compliant ({GSTIN}). We look forward to exploring an exclusive partnership on your new tower.'
      },
      {
        title: 'New Team Member Welcome & Security Onboarding',
        useCase: 'Send to a newly hired property advisor on their first day',
        hinglishScript: 'Welcome to the team, {AssociateName}! Aapka AgentLadders account ready hai: {LoginLink}. Kripya login karke sabse pehle Settings mein jaakar Two-Factor Authentication (2FA) activate kar lijiye for data security. Wish you high closings!',
        englishScript: 'Welcome to the team, {AssociateName}! Your AgentLadders workstation is set up: {LoginLink}. Please log in and immediately enable Two-Factor Authentication (2FA) in Settings to secure your account. Wishing you massive success and closings!'
      }
    ],
    closingTactics: {
      proTip: 'Always print your state RERA license number and agency logo in the footer of every digital brochure and proposal you send. High-net-worth clients always verify broker credentials.',
      legalTrapToAvoid: 'Never operate without a valid state RERA real estate agent registration certificate; doing so can lead to heavy penalties and forfeiture of commissions.',
      statOrMetric: 'Agencies with full 2FA security and verified RERA credentials win 80% more high-value sole-selling mandates.'
    },
    mockPreview: {
      windowTitle: 'AgentLadders • Agency Settings & Security (/dashboard/settings)',
      subtitle: 'Agency Branding • RERA/GSTIN Profile • Two-Factor Authentication • Session Tracking',
      stats: [
        { label: 'Security Level', value: 'High (2FA On)', color: '#059669' },
        { label: 'Active Sessions', value: '2 Devices', color: '#2563eb' },
        { label: 'RERA Status', value: 'Verified Active', color: '#059669' },
        { label: 'Team Members', value: '4 Active', color: '#7c3aed' }
      ],
      hotspots: [
        { id: 1, x: 25, y: 22, title: 'Agency Profile & Branding', description: 'Upload company logo, agency name, contact phone, and official office address.', actionHint: 'Edit agency branding' },
        { id: 2, x: 60, y: 22, title: 'RERA & GSTIN Numbers', description: 'Enter state real estate license number and GSTIN for automatic invoice branding.', actionHint: 'Update license numbers' },
        { id: 3, x: 25, y: 55, title: 'Two-Factor Authentication (2FA)', description: 'Toggle on 2FA and scan QR code with your phone to secure your account.', actionHint: 'Enable 2FA security' },
        { id: 4, x: 65, y: 65, title: 'Active Sessions Table', description: 'View all logged-in computers and phones with 1-click logout buttons.', actionHint: 'Review logged-in devices' }
      ]
    }
  }
];
