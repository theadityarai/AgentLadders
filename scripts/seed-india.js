const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const mockPath = path.join(__dirname, '..', 'mock-db.json');

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Agency to update
const targetAgencyId = 'ag_ql21vxnd';

// Ensure agency config is Indian
if (db.agencies) {
  const ag = db.agencies.find(a => a.id === targetAgencyId);
  if (ag) {
    ag.name = 'AgentLadders Realty India';
    ag.country = 'India';
    ag.currency = 'INR';
  }
}

const now = new Date().toISOString();

// 1. Properties
const indianProperties = [
  {
    id: 'prop_1',
    agencyId: targetAgencyId,
    title: '4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park',
    type: 'Apartment',
    bhk: '4 BHK',
    purpose: 'For Sale',
    city: 'Mumbai',
    locality: 'Worli',
    location: 'Worli Sea Face, Mumbai, Maharashtra',
    price: 85000000, // ₹8.50 Cr
    status: 'Available',
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 3100,
    carpetAreaSqFt: 2450,
    floor: '42nd of 55 Floors',
    vastuFacing: 'East',
    reraId: 'P51900001339',
    possessionStatus: 'Ready to Move',
    furnishing: 'Fully Furnished',
    parking: '3 Reserved Covered',
    maintenanceMonthly: 38000,
    listingType: 'For Sale',
    sellerName: 'Sunil & Neeta Singhania',
    sellerPhone: '+91 98201 54321',
    keyLocationNotes: 'Keys with caretaker Ramesh at Tower C gate. Society requires 2 hrs prior intimation.',
    ownerName: 'Sunil Singhania',
    description: 'Spectacular 4 BHK palatial residence with unobstructed Arabian Sea views at Lodha Park Worli. Features Italian marble flooring, 11 ft clear ceiling height, private elevator lobby, Poggenpohl designer modular kitchen, servant room with separate washroom, and 7-acre private society park with Olympic-size pool.',
    images: ['/images/property_hero.jpg', '/images/deal_closing.jpg', '/images/luxury_bedroom.jpg', '/images/luxury_kitchen.jpg', '/images/luxury_washroom.jpg', '/images/hero_dashboard.jpg'],
    media: [
      { id: 'm_1', url: '/images/property_hero.jpg', tag: 'Exterior / Facade', isCover: true, caption: 'Iconic Worli Skyline & Tower Facade' },
      { id: 'm_2', url: '/images/deal_closing.jpg', tag: 'Hall / Living Area', isCover: false, caption: 'Double-Height Living Room with Sea Panorama' },
      { id: 'm_3', url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Presidential Master Suite with Walk-in Closet' },
      { id: 'm_4', url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'German Poggenpohl Modular Kitchen' },
      { id: 'm_5', url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Spa Bathroom with Kohler European Fittings' },
      { id: 'm_6', url: '/images/hero_dashboard.jpg', tag: 'Balcony', isCover: false, caption: 'Expansive Sea-Facing Balcony Deck' }
    ],
    videoTourUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    virtualTourUrl: 'https://my.matterport.com/show/?m=sample360',
    videos: [
      { id: 'v_1', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', title: '4K Cinematic Walkthrough - Lodha Park Worli', type: 'video' }
    ],
    features: ['Arabian Sea View', 'RERA Approved', 'Vastu Compliant', 'Private Elevator Lobby', '3 Covered Car Parks', 'Olympic Size Pool & 50,000 sqft Clubhouse', '100% DG Power Backup'],
    publicToken: 'tok_lodha_worli_850cr',
    privacyMode: 'Public',
    isPublic: true,
    sharesCount: 34,
    viewsCount: 285,
    agentName: 'Aditya Rai',
    agentPhone: '+91 98200 12345',
    agentEmail: 'aditya@agentladders.com',
    createdAt: now
  },
  {
    id: 'prop_2',
    agencyId: targetAgencyId,
    title: '3 BHK High-Rise Golf Course Apartment, DLF The Camellias',
    type: 'Apartment',
    bhk: '3 BHK',
    purpose: 'For Sale',
    city: 'Gurgaon (Delhi NCR)',
    locality: 'Golf Course Road',
    location: 'DLF Phase 5, Golf Course Road, Gurgaon, Haryana',
    price: 145000000, // ₹14.50 Cr
    status: 'Available',
    bedrooms: 3,
    bathrooms: 4,
    areaSqFt: 4600,
    carpetAreaSqFt: 3850,
    floor: '28th of 35 Floors',
    vastuFacing: 'North-East',
    reraId: 'HRERA-PKL-GGM-1085-2019',
    possessionStatus: 'Ready to Move',
    furnishing: 'Semi-Furnished',
    parking: '3 Reserved Stilt',
    maintenanceMonthly: 52000,
    listingType: 'For Sale',
    sellerName: 'Rajeev Mehra (CMD, Mehra Exports)',
    sellerPhone: '+91 98110 98765',
    keyLocationNotes: 'Biometric lock. Call owner 3 hours before confirming site visit.',
    ownerName: 'Rajeev Mehra',
    description: 'Trophy 3 BHK residence at India’s most prestigious address: DLF The Camellias, overlooking the lush greens of the Arnold Palmer Golf Course. Features soaring 12 ft ceilings, sound-insulated double-glazed facade, automated VRV climate control, concierge 24/7, and access to the world-renowned Camellias Club.',
    images: ['/images/deal_closing.jpg', '/images/luxury_kitchen.jpg', '/images/luxury_bedroom.jpg', '/images/luxury_washroom.jpg'],
    media: [
      { id: 'm_21', url: '/images/deal_closing.jpg', tag: 'Hall / Living Area', isCover: true, caption: 'Magnificent Living Lounge Overlooking Golf Course' },
      { id: 'm_22', url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'Custom Italian Minimalist Kitchen with Miele Appliances' },
      { id: 'm_23', url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Primary Master Suite with Teakwood Flooring' },
      { id: 'm_24', url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Ensuite Italian Marble Bathroom' }
    ],
    videoTourUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    features: ['Golf Course Views', 'RERA Approved', 'Club Camellias Membership', 'Helipad Access', '3 Dedicated Parking Bays', 'Valet & Concierge 24/7'],
    publicToken: 'tok_dlf_camellias_145cr',
    privacyMode: 'Public',
    isPublic: true,
    sharesCount: 42,
    viewsCount: 410,
    agentName: 'Aditya Rai',
    agentPhone: '+91 98200 12345',
    agentEmail: 'aditya@agentladders.com',
    createdAt: now
  },
  {
    id: 'prop_3',
    agencyId: targetAgencyId,
    title: '3 BHK Prime Garden Flat, Prestige Kingfisher',
    type: 'Apartment',
    bhk: '3 BHK',
    purpose: 'For Sale',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    location: '100 Feet Road, Indiranagar, Bengaluru, Karnataka',
    price: 38500000, // ₹3.85 Cr
    status: 'Available',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2280,
    carpetAreaSqFt: 1850,
    floor: '8th of 16 Floors',
    vastuFacing: 'East',
    reraId: 'PRM/KA/RERA/1251/310/PR/170915/000234',
    possessionStatus: 'Ready to Move',
    furnishing: 'Semi-Furnished',
    parking: '2 Covered',
    maintenanceMonthly: 12500,
    listingType: 'For Sale',
    sellerName: 'Karthik Venkataraman',
    sellerPhone: '+91 98450 11223',
    keyLocationNotes: 'Security guard at reception tower 2 has keys.',
    ownerName: 'Karthik Venkataraman',
    description: 'Vastu compliant spacious 3 BHK apartment in the epicenter of Indiranagar. Premium woodwork done, large modular kitchen, 2 dedicated car parks, 100% DG backup, and clubhouse amenities. Walking distance to Metro station.',
    images: ['/images/hero_dashboard.jpg', '/images/property_hero.jpg', '/images/luxury_washroom.jpg'],
    media: [
      { id: 'm_31', url: '/images/hero_dashboard.jpg', tag: 'Balcony', isCover: true, caption: 'Balcony overlooking green canopy' },
      { id: 'm_32', url: '/images/property_hero.jpg', tag: 'Exterior / Facade', isCover: false, caption: 'Tower Facade' },
      { id: 'm_33', url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Primary Spa Bath' }
    ],
    features: ['East Facing Vastu', 'Walking Distance to Metro', '2 Car Parks', '100% Power Backup', 'Swimming Pool & Gym'],
    publicToken: 'tok_prestige_indiranagar_385cr',
    privacyMode: 'Public',
    isPublic: true,
    sharesCount: 19,
    viewsCount: 175,
    agentName: 'Aditya Rai',
    agentPhone: '+91 98200 12345',
    agentEmail: 'aditya@agentladders.com',
    createdAt: now
  },
  {
    id: 'prop_4',
    agencyId: targetAgencyId,
    title: '2 BHK Smart Corner Home, Godrej Sky Greens',
    type: 'Apartment',
    bhk: '2 BHK',
    purpose: 'For Sale',
    city: 'Pune',
    locality: 'Kharadi',
    location: 'Near EON Free Zone, Kharadi, Pune, Maharashtra',
    price: 9200000, // ₹92 Lakhs
    status: 'Available',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1080,
    carpetAreaSqFt: 840,
    floor: '14th of 22 Floors',
    vastuFacing: 'North',
    reraId: 'P52100021482',
    possessionStatus: 'Under Construction (Dec 2026)',
    furnishing: 'Unfurnished',
    parking: '1 Covered',
    maintenanceMonthly: 4500,
    listingType: 'For Sale',
    sellerName: 'Adarsh Shinde (Direct Builder Allottee)',
    sellerPhone: '+91 97654 33221',
    keyLocationNotes: 'Sample flat open for visits 10 AM to 6 PM daily.',
    ownerName: 'Adarsh Shinde',
    description: 'Brand new 2 BHK corner unit in prime IT corridor Kharadi. Zero wastage floor plan, clubhouse, amphitheater, walking distance to World Trade Center and EON IT Park.',
    images: ['/images/property_hero.jpg', '/images/luxury_bedroom.jpg'],
    media: [
      { id: 'm_41', url: '/images/property_hero.jpg', tag: 'Exterior / Facade', isCover: true, caption: 'Building Facade' },
      { id: 'm_42', url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Master Bedroom with large window' }
    ],
    features: ['IT Park Corridor', 'Zero Wastage Plan', 'High Rental Yield ~5.5%', 'Gated Community 24/7'],
    publicToken: 'tok_godrej_kharadi_92l',
    privacyMode: 'Public',
    isPublic: true,
    sharesCount: 15,
    viewsCount: 130,
    agentName: 'Aditya Rai',
    agentPhone: '+91 98200 12345',
    agentEmail: 'aditya@agentladders.com',
    createdAt: now
  },
  {
    id: 'prop_5',
    agencyId: targetAgencyId,
    title: '3 BHK Corporate Rental, Central Park Resorts',
    type: 'Apartment',
    bhk: '3 BHK',
    purpose: 'For Rent',
    city: 'Gurgaon (Delhi NCR)',
    locality: 'Sector 48',
    location: 'Sohna Road, Sector 48, Gurgaon, Haryana',
    price: 120000, // ₹1.20 Lakh / month
    status: 'Available',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2650,
    carpetAreaSqFt: 2150,
    floor: '18th Floor',
    vastuFacing: 'East',
    reraId: 'HRERA-145-2018',
    possessionStatus: 'Ready to Move',
    furnishing: 'Fully Furnished',
    parking: '2 Covered',
    maintenanceMonthly: 12000,
    listingType: 'For Rent',
    sellerName: 'Col. Sanjiv Dewan',
    sellerPhone: '+91 98101 22334',
    keyLocationNotes: 'Available for immediate MNC / expat family lease.',
    ownerName: 'Col. Sanjiv Dewan',
    description: 'Resort-style living in Central Park 2. Fully furnished with 55-inch smart TVs, imported leather recliners, golf carts within campus, heated swimming pool, 24/7 room service.',
    images: ['/images/deal_closing.jpg', '/images/luxury_kitchen.jpg'],
    media: [
      { id: 'm_51', url: '/images/deal_closing.jpg', tag: 'Hall / Living Area', isCover: true, caption: 'Designer Furnished Living Room' },
      { id: 'm_52', url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'Fully Equipped Kitchen' }
    ],
    features: ['5-Star Resort Living', 'Club Capri Access', 'Internal Golf Carts', 'Fully Furnished Ready to Move'],
    publicToken: 'tok_central_park_120k',
    privacyMode: 'Public',
    isPublic: true,
    sharesCount: 11,
    viewsCount: 94,
    agentName: 'Aditya Rai',
    agentPhone: '+91 98200 12345',
    agentEmail: 'aditya@agentladders.com',
    createdAt: now
  }
];

// Replace properties for target agency
db.properties = (db.properties || []).filter(p => p.agencyId !== targetAgencyId).concat(indianProperties);

// 2. Leads (Active Indian Inquiries & Buyers)
const indianLeads = [
  {
    id: 'lead_1',
    agencyId: targetAgencyId,
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@induscap.in',
    phone: '+91 98200 45678',
    status: 'Hot Buyer 🔥',
    source: 'WhatsApp Referral',
    leadPurpose: 'Buy',
    city: 'Mumbai',
    preferredLocalities: ['Worli', 'Lower Parel', 'Bandra West'],
    bhkNeeded: '4 BHK',
    budgetMin: 70000000, // ₹7.0 Cr
    budgetMax: 95000000, // ₹9.5 Cr
    budget: '₹7.0 Cr - ₹9.5 Cr',
    financingStatus: 'Pre-Approved HDFC Loan ₹5 Cr + Self-Funded',
    urgency: 'Immediate (Within 30 Days)',
    vastuPreference: 'East Facing Mandatory',
    requirement: 'Looking for ready sea-facing 4 BHK in Worli/Lower Parel. Minimum 2200 sqft carpet, 3 car parks for luxury cars.',
    priority: 'Hot 🔥',
    assignedTo: 'Aditya Rai',
    nextFollowUp: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Very high intent. MD at Private Equity firm. Wife visited last week.',
    createdAt: now
  },
  {
    id: 'lead_2',
    agencyId: targetAgencyId,
    name: 'Priya & Rahul Sharma',
    email: 'rahul.sharma@techglobal.com',
    phone: '+91 98100 89012',
    status: 'Site Visit Scheduled',
    source: '99acres',
    leadPurpose: 'Buy',
    city: 'Gurgaon (Delhi NCR)',
    preferredLocalities: ['Golf Course Road', 'DLF Phase 5', 'Golf Course Ext'],
    bhkNeeded: '3 BHK',
    budgetMin: 120000000, // ₹12.0 Cr
    budgetMax: 160000000, // ₹16.0 Cr
    budget: '₹12.0 Cr - ₹16.0 Cr',
    financingStatus: '100% Self-Funded (ESOP Liquidation)',
    urgency: 'Within 45 Days',
    vastuPreference: 'North or North-East',
    requirement: 'Golf course facing 3 or 4 BHK at DLF 5 / Golf Course Rd. High floor preferred.',
    priority: 'Hot 🔥',
    assignedTo: 'Aditya Rai',
    nextFollowUp: new Date().toISOString().split('T')[0],
    notes: 'Show DLF The Camellias 28th floor today at 11:30 AM.',
    createdAt: now
  },
  {
    id: 'lead_3',
    agencyId: targetAgencyId,
    name: 'Dr. Arvind Singhania',
    email: 'arvind.singhania@apollo.org',
    phone: '+91 98451 23456',
    status: 'Offer Made',
    source: 'Direct Referral',
    leadPurpose: 'Buy',
    city: 'Bengaluru',
    preferredLocalities: ['Indiranagar', 'Koramangala'],
    bhkNeeded: '3 BHK',
    budgetMin: 35000000, // ₹3.5 Cr
    budgetMax: 42000000, // ₹4.2 Cr
    budget: '₹3.5 Cr - ₹4.2 Cr',
    financingStatus: 'SBI Home Loan in Process',
    urgency: 'Immediate',
    vastuPreference: 'East Facing',
    requirement: 'Indiranagar 3 BHK with 2 covered car parks. Ready to move only.',
    priority: 'High',
    assignedTo: 'Aditya Rai',
    nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: 'Offered ₹3.75 Cr on Prestige Kingfisher. Waiting for seller response.',
    createdAt: now
  },
  {
    id: 'lead_4',
    agencyId: targetAgencyId,
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@infosys.com',
    phone: '+91 97650 99887',
    status: 'Hot Buyer 🔥',
    source: 'MagicBricks',
    leadPurpose: 'Buy',
    city: 'Pune',
    preferredLocalities: ['Kharadi', 'Viman Nagar', 'Kalyani Nagar'],
    bhkNeeded: '2 BHK',
    budgetMin: 8000000, // ₹80 Lakhs
    budgetMax: 10000000, // ₹1.00 Cr
    budget: '₹80 L - ₹1.00 Cr',
    financingStatus: 'Pre-Sanctioned ICICI Bank',
    urgency: 'Within 2 Months',
    vastuPreference: 'Any',
    requirement: '2 BHK near EON IT park Kharadi. Builder reputation matters.',
    priority: 'Hot 🔥',
    assignedTo: 'Aditya Rai',
    nextFollowUp: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: 'Senior Architect at Infosys. Interested in Godrej Sky Greens Kharadi.',
    createdAt: now
  },
  {
    id: 'lead_5',
    agencyId: targetAgencyId,
    name: 'Amitabh Verma (Director, Barclays)',
    email: 'amitabh.verma@barclays.com',
    phone: '+91 98115 67890',
    status: 'Contacted',
    source: 'WhatsApp Referral',
    leadPurpose: 'Rent',
    city: 'Gurgaon (Delhi NCR)',
    preferredLocalities: ['Sector 48', 'Golf Course Ext'],
    bhkNeeded: '3 BHK',
    budgetMin: 100000, // ₹1.00 L
    budgetMax: 130000, // ₹1.30 L
    budget: '₹1.00 L - ₹1.30 L / mo',
    financingStatus: 'Company Lease',
    urgency: '1st of Next Month',
    requirement: 'Fully furnished 3 BHK in Central Park Resorts for corporate family lease.',
    priority: 'Medium',
    assignedTo: 'Aditya Rai',
    nextFollowUp: new Date().toISOString().split('T')[0],
    notes: 'Follow-up today with Central Park Resorts photo brochure.',
    createdAt: now
  }
];

db.leads = (db.leads || []).filter(l => l.agencyId !== targetAgencyId).concat(indianLeads);

// 3. Site Visits (With Time Slots and WhatsApp Confirmations)
const indianVisits = [
  {
    id: 'vis_1',
    agencyId: targetAgencyId,
    property: '4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park',
    propertyId: 'prop_1',
    client: 'Vikram Malhotra',
    clientPhone: '+91 98200 45678',
    date: new Date().toISOString().split('T')[0], // TODAY!
    timeSlot: '04:30 PM - 05:30 PM',
    slotTime: '04:30 PM',
    locality: 'Worli, Mumbai',
    accompaniedBy: 'Aditya Rai',
    status: 'Scheduled',
    interestLevel: 'Extremely Interested 🔥',
    actionRequired: 'Send location pin and gate pass code',
    notes: 'Buyer coming with wife and interior architect. Focus on sea view and car parking.',
    createdAt: now
  },
  {
    id: 'vis_2',
    agencyId: targetAgencyId,
    property: '3 BHK High-Rise Golf Course Apartment, DLF The Camellias',
    propertyId: 'prop_2',
    client: 'Priya & Rahul Sharma',
    clientPhone: '+91 98100 89012',
    date: new Date().toISOString().split('T')[0], // TODAY!
    timeSlot: '11:30 AM - 12:30 PM',
    slotTime: '11:30 AM',
    locality: 'Golf Course Road, Gurgaon',
    accompaniedBy: 'Aditya Rai',
    status: 'Scheduled',
    interestLevel: 'Extremely Interested 🔥',
    actionRequired: 'Meet at Club Camellias reception',
    notes: 'Carried DLF gate pass. Client has pre-arranged driver.',
    createdAt: now
  },
  {
    id: 'vis_3',
    agencyId: targetAgencyId,
    property: '3 BHK Prime Garden Flat, Prestige Kingfisher',
    propertyId: 'prop_3',
    client: 'Dr. Arvind Singhania',
    clientPhone: '+91 98451 23456',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlot: '10:00 AM - 11:00 AM',
    slotTime: '10:00 AM',
    locality: 'Indiranagar, Bengaluru',
    accompaniedBy: 'Aditya Rai',
    status: 'Scheduled',
    interestLevel: 'Considering / Needs 2nd Viewing',
    actionRequired: '2nd visit with father to verify Vastu North-East Brahmasthan',
    notes: 'Doctor requested quiet viewing before his hospital clinic hours.',
    createdAt: now
  }
];

db.siteVisits = (db.siteVisits || []).filter(s => s.agencyId !== targetAgencyId).concat(indianVisits);

// 4. Deals (Indian Real Estate Brokerage Pipeline)
const indianDeals = [
  {
    id: 'deal_1',
    agencyId: targetAgencyId,
    title: 'Lodha Park Worli 4 BHK Outright Sale',
    propertyId: 'prop_1',
    propertyName: '4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park',
    leadId: 'lead_1',
    clientName: 'Vikram Malhotra',
    dealType: 'Outright Sale',
    amount: 85000000, // ₹8.50 Cr
    stage: 'Token / Bayana Received',
    buyerCommissionPercent: 1.0,
    sellerCommissionPercent: 1.0,
    totalCommission: 1700000, // ₹17.0 Lakhs
    commissionRate: '2.0%',
    commissionAmount: 1700000,
    assignedBroker: 'Aditya Rai',
    expectedCloseDate: '2026-10-15',
    notes: 'Token ₹10 Lakhs received. Drafting Agreement to Sale (ATS).',
    createdAt: now
  },
  {
    id: 'deal_2',
    agencyId: targetAgencyId,
    title: 'DLF The Camellias 3 BHK Resale',
    propertyId: 'prop_2',
    propertyName: '3 BHK High-Rise Golf Course Apartment, DLF The Camellias',
    leadId: 'lead_2',
    clientName: 'Priya & Rahul Sharma',
    dealType: 'Outright Sale',
    amount: 145000000, // ₹14.50 Cr
    stage: 'Agreement to Sale (ATS)',
    buyerCommissionPercent: 1.0,
    sellerCommissionPercent: 1.0,
    totalCommission: 2900000, // ₹29.0 Lakhs
    commissionRate: '2.0%',
    commissionAmount: 2900000,
    assignedBroker: 'Aditya Rai',
    expectedCloseDate: '2026-10-30',
    notes: 'ATS signed. Buyer clearing HDFC loan disbursement.',
    createdAt: now
  },
  {
    id: 'deal_3',
    agencyId: targetAgencyId,
    title: 'Prestige Kingfisher Indiranagar 3 BHK',
    propertyId: 'prop_3',
    propertyName: '3 BHK Prime Garden Flat, Prestige Kingfisher',
    leadId: 'lead_3',
    clientName: 'Dr. Arvind Singhania',
    dealType: 'Outright Sale',
    amount: 38500000, // ₹3.85 Cr
    stage: 'Stamp Duty & Registration',
    buyerCommissionPercent: 2.0,
    sellerCommissionPercent: 1.0,
    totalCommission: 1155000, // ₹11.55 Lakhs
    commissionRate: '3.0%',
    commissionAmount: 1155000,
    assignedBroker: 'Aditya Rai',
    expectedCloseDate: '2026-10-05',
    notes: 'Sub-registrar appointment booked for Tuesday 11 AM.',
    createdAt: now
  }
];

db.deals = (db.deals || []).filter(d => d.agencyId !== targetAgencyId).concat(indianDeals);

// Save to both db.json and mock-db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
if (fs.existsSync(mockPath)) {
  fs.writeFileSync(mockPath, JSON.stringify(db, null, 2));
}

console.log('Successfully seeded Indian Real Estate dataset into data/db.json and mock-db.json!');
