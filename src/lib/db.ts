import fs from 'fs';
import path from 'path';
import { AgencyInvoiceSettings, DEFAULT_INVOICE_SETTINGS } from './formatters';

const STATIC_DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const LEGACY_MOCK_PATH = path.join(process.cwd(), 'mock-db.json');
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SERVERLESS_TMP_PATH = '/tmp/agentladders_db.json';

// In serverless environments (e.g. Vercel), /var/task is read-only.
// /tmp is the writable storage directory available.
const DB_PATH = IS_SERVERLESS ? SERVERLESS_TMP_PATH : STATIC_DB_PATH;

export interface User {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: string;
  avatar?: string;
  image?: string;
  phone?: string;
  status?: string;
  agencyStatus?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  createdAt?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  browser: string;
  browserVersion?: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceModel?: string;
  ipAddress: string;
  location: string;
  screen?: string;
  timezone?: string;
  userAgent?: string;
  createdAt: string;
  lastActive: string;
  current?: boolean;
}

export interface Agency {
  id: string;
  name: string;
  country: string;
  currency: string;
  timezone?: string;
  plan?: string;
  status?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  phone?: string;
  whatsapp?: string;
  logo?: string;
  logoUrl?: string;
  bhkOptions?: string[];
  propertyTypes?: string[];
  leadSources?: string[];
  propertySpecs?: string[];
  constructionStages?: string[];
  vastuOptions?: string[];
  dealStages?: string[];
  parkingOptions?: string[];
  propertyStatuses?: string[];
  leadStatuses?: string[];
  siteVisitStatuses?: string[];
  taskStatuses?: string[];
  clientStatuses?: string[];
  invoiceStatuses?: string[];
  paymentStatuses?: string[];
  statusColors?: Record<string, string>;
  notificationPrefs?: Record<string, { inApp: boolean; email: boolean }>;
  invoiceSettings?: AgencyInvoiceSettings;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export type { AgencyInvoiceSettings };
export { DEFAULT_INVOICE_SETTINGS };

export interface Notification {
  id: string;
  agencyId?: string;
  userId: string;
  title?: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

export interface PropertyMedia {
  id: string;
  url: string;
  tag: string; // e.g. "Hall", "Master Bedroom", "Washroom", "Kitchen", "Balcony", "Floor Plan", or freetext
  caption?: string;
  isCover?: boolean;
}

export interface PropertyVideo {
  id: string;
  url: string;
  title?: string;
  type?: 'video' | '360_tour';
}

export interface Property {
  id: string;
  agencyId: string;
  title: string;
  type: string;
  bhk?: string;
  purpose?: 'For Sale' | 'For Rent';
  city?: string;
  locality?: string;
  subLocality?: string;
  location: string;
  price: number;
  maintenanceMonthly?: number;
  status: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  areaSqFt?: number | string;
  carpetAreaSqFt?: number | string;
  floor?: string;
  vastuFacing?: string;
  reraId?: string;
  possessionStatus?: string;
  possessionDate?: string;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  parking?: number | string;
  amenities?: string[];
  sellerName?: string;
  sellerPhone?: string;
  keyLocationNotes?: string;
  listingType?: string;
  ownerName?: string;
  description?: string;
  images?: string[];
  media?: PropertyMedia[];
  videos?: PropertyVideo[];
  videoTourUrl?: string;
  virtualTourUrl?: string;
  features?: string[];
  publicToken?: string;
  privacyMode?: 'Public' | 'Restricted' | 'Private';
  isPublic?: boolean;
  sharesCount?: number;
  viewsCount?: number;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Lead {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  leadType?: string;
  leadPurpose?: 'Buy' | 'Rent';
  city?: string;
  preferredLocalities?: string[] | string;
  bhkNeeded?: string | string[];
  propertyTypeNeeded?: string;
  bedroomsNeeded?: string;
  budgetMin?: number | string;
  budgetMax?: number | string;
  carpetAreaMin?: number | string;
  financingStatus?: string;
  urgency?: string;
  vastuPreference?: string;
  furnishingPreference?: string;
  constructionStagePreference?: string;
  parkingPreference?: string;
  requirement?: string;
  budget?: string;
  locationPreference?: string;
  priority?: string;
  assignedTo?: string;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Deal {
  id: string;
  agencyId: string;
  title: string;
  propertyId?: string;
  propertyName?: string;
  leadId?: string;
  clientName?: string;
  dealType?: 'Outright Sale' | 'Rental Lease' | 'Builder CP Booking';
  amount: number;
  stage: string;
  buyerCommissionPercent?: number;
  sellerCommissionPercent?: number;
  totalCommission?: number;
  coBrokerSplit?: boolean;
  netReceivable?: number;
  probability?: number;
  commissionRate?: string;
  commissionAmount?: number;
  assignedBroker?: string;
  expectedCloseDate: string;
  closingDate?: string;
  notes?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface Client {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  requirement?: string;
  budget?: string;
  preferredLocation?: string;
  preferredChannel?: string;
  source?: string;
  assignedManager?: string;
  notes?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  agencyId: string;
  name: string;
  industry: string;
  website: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
}

export interface Owner {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  phone: string;
  propertiesCount: number;
  ownerType?: string;
  ownershipShare?: string;
  primaryProperty?: string;
  taxId?: string;
  notes?: string;
  createdAt: string;
}

export interface Broker {
  id: string;
  agencyId: string;
  name: string;
  agency: string;
  commissionSplit: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  territory?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  agencyId: string;
  number: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGstin?: string;
  amount: number;
  totalAmount?: number;
  taxType?: string;
  taxRate?: string | number;
  status: string;
  dueDate: string;
  dealRef?: string;
  issueDate?: string;
  notes?: string;
  items?: Array<{ id?: string; description: string; sacCode?: string; amount: number }>;
  paymentDetails?: {
    paidAt?: string;
    paymentMode?: string;
    transactionRef?: string;
  };
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Payment {
  id: string;
  agencyId: string;
  reference: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  status: string;
  paymentDate?: string;
  payerName?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  agencyId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  paymentMethod?: string;
  taxDeductible?: boolean;
  receiptRef?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  agencyId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  category?: string;
  priority?: string;
  relatedTo?: string;
  description?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  agencyId: string;
  title: string;
  date: string;
  time: string;
  type: string;
  location?: string;
  attendees?: string;
  notes?: string;
  createdAt: string;
}

export interface SiteVisit {
  id: string;
  agencyId: string;
  property: string;
  propertyId?: string;
  client: string;
  leadId?: string;
  date: string;
  timeSlot?: string;
  accompaniedBy?: string;
  status: string;
  feedback?: string;
  interestLevel?: string;
  notes?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface Listing {
  id: string;
  agencyId: string;
  title: string;
  platform: string;
  status: string;
  views: number;
  price?: number;
  externalUrl?: string;
  featured?: boolean;
  expiryDate?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  agencyId: string;
  name: string;
  type: string;
  category?: string;
  size: string;
  fileData?: string;
  uploadedBy: string;
  relatedTo?: string;
  description?: string;
  version?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  agencyId: string;
  name: string;
  type: string;
  frequency: string;
  dateRange?: string;
  format?: string;
  scope?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  agencyId: string;
  actor: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'Site Visit' | 'Deal Update' | 'Property Share' | 'Note' | 'Document';
  relatedEntity: string;
  relatedId?: string;
  summary: string;
  details?: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  agencyId: string;
  name: string;
  platform: 'Property Finder' | 'Bayut' | 'Meta Ads' | 'Google Ads' | 'WhatsApp Broadcast' | 'Direct Referral';
  status: 'Active' | 'Paused' | 'Completed';
  budget: number;
  spend: number;
  leadsGenerated: number;
  dealsClosed: number;
  utmSource?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  agencyId: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'SHARE' | 'LOGIN';
  entity: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface RecycleItem {
  id: string;
  agencyId: string;
  entityType: 'Lead' | 'Property' | 'Deal' | 'Client' | 'Document';
  originalId: string;
  name: string;
  data: unknown;
  deletedBy: string;
  deletedAt: string;
}

export interface SupportTicket {
  id: string;
  agencyId: string;
  ticketNumber: string;
  subject: string;
  category: 'Billing' | 'CRM Feature' | 'Integrations' | 'Bug Report' | 'General' | 'Contract Inquiry' | 'Legal Template';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Review' | 'Resolved';
  createdByName: string;
  createdByEmail?: string;
  agencyName?: string;
  contractType?: string;
  messages: Array<{
    id: string;
    sender: string;
    isStaff: boolean;
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export interface PropertyShareRecord {
  id: string;
  agencyId: string;
  propertyId: string;
  propertyTitle: string;
  channel: 'WhatsApp' | 'Telegram' | 'Email' | 'SMS' | 'LinkedIn' | 'X' | 'Copy Link' | 'QR Code';
  publicUrl: string;
  sharedBy: string;
  privacyMode: string;
  createdAt: string;
}

export interface DB {
  users: User[];
  agencies: Agency[];
  notifications: Notification[];
  properties: Property[];
  leads: Lead[];
  deals: Deal[];
  clients: Client[];
  companies: Company[];
  owners: Owner[];
  brokers: Broker[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  siteVisits: SiteVisit[];
  listings: Listing[];
  documents: DocumentItem[];
  reports: Report[];
  activities: ActivityItem[];
  marketingCampaigns: MarketingCampaign[];
  auditLogs: AuditLogItem[];
  recycleBin: RecycleItem[];
  supportTickets: SupportTicket[];
  sharedLinks: PropertyShareRecord[];
  activeSessions?: UserSession[];
}

// Ensure the data directory exists
if (!IS_SERVERLESS && !fs.existsSync(path.dirname(STATIC_DB_PATH))) {
  try {
    fs.mkdirSync(path.dirname(STATIC_DB_PATH), { recursive: true });
  } catch {}
}

// High-performance in-memory DB cache singleton
let _cachedDb: DB | null = null;
let _cachedMtime: number = 0;

export function getDb(): DB {
  // If in serverless (e.g. Vercel), copy seed DB to writable /tmp if it doesn't exist yet
  if (IS_SERVERLESS && !fs.existsSync(SERVERLESS_TMP_PATH)) {
    try {
      if (fs.existsSync(STATIC_DB_PATH)) {
        fs.copyFileSync(STATIC_DB_PATH, SERVERLESS_TMP_PATH);
      } else if (fs.existsSync(LEGACY_MOCK_PATH)) {
        fs.copyFileSync(LEGACY_MOCK_PATH, SERVERLESS_TMP_PATH);
      }
    } catch (e) {
      console.error('Error copying db to serverless /tmp:', e);
    }
  }

  // Fast path: if cache exists and file hasn't changed on disk, return cache immediately
  if (_cachedDb && fs.existsSync(DB_PATH)) {
    try {
      const currentMtime = fs.statSync(DB_PATH).mtimeMs;
      if (currentMtime === _cachedMtime) {
        return _cachedDb;
      }
    } catch {
      // Fall through if stat fails
    }
  }

  let db: Partial<DB> = {};

  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      try {
        _cachedMtime = fs.statSync(DB_PATH).mtimeMs;
      } catch {
        _cachedMtime = Date.now();
      }
    } catch {
      db = {};
    }
  } else if (fs.existsSync(STATIC_DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(STATIC_DB_PATH, 'utf8'));
    } catch {
      db = {};
    }
  }

  // If DB was empty or missing users, check if mock-db.json exists and import from it
  if (!db.users || db.users.length === 0) {
    if (fs.existsSync(LEGACY_MOCK_PATH)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(LEGACY_MOCK_PATH, 'utf8'));
        if (legacy.users && legacy.users.length > 0) {
          db.users = legacy.users;
          db.agencies = legacy.agencies || [];
          db.notifications = legacy.notifications || [];
          db.documents = legacy.documents || [];
        }
      } catch (e) {
        console.error('Error importing legacy mock DB:', e);
      }
    }
  }

  // Ensure all collections are guaranteed arrays
  db.users = db.users || [];
  db.agencies = db.agencies || [];
  db.notifications = db.notifications || [];
  db.properties = db.properties || [];
  db.leads = db.leads || [];
  db.deals = db.deals || [];
  db.clients = db.clients || [];
  db.companies = db.companies || [];
  db.owners = db.owners || [];
  db.brokers = db.brokers || [];
  db.invoices = db.invoices || [];
  db.payments = db.payments || [];
  db.expenses = db.expenses || [];
  db.tasks = db.tasks || [];
  db.calendarEvents = db.calendarEvents || [];
  db.siteVisits = db.siteVisits || [];
  db.listings = db.listings || [];
  db.documents = db.documents || [];
  db.reports = db.reports || [];
  db.activities = db.activities || [];
  db.marketingCampaigns = db.marketingCampaigns || [];
  db.auditLogs = db.auditLogs || [];
  db.recycleBin = db.recycleBin || [];
  db.supportTickets = db.supportTickets || [];
  db.activeSessions = db.activeSessions || [];
  if (db.supportTickets.length === 0) {
    const firstAgency = (db.agencies && db.agencies[0]) ? db.agencies[0] : { id: 'agency_1', name: 'Vance Luxury Realty' };
    db.supportTickets = [
      {
        id: 'tic_1',
        agencyId: firstAgency.id,
        agencyName: firstAgency.name,
        ticketNumber: 'TICK-4091',
        subject: 'Custom Domain SSL for Agency Public Properties',
        category: 'Integrations',
        priority: 'Medium',
        status: 'In Review',
        createdByName: 'Marcus Vance',
        createdByEmail: 'marcus@vancerealty.com',
        contractType: '',
        messages: [
          { id: 'msg_1', sender: 'Marcus Vance', isStaff: false, text: 'Hi Support Team, we would like to confirm DNS records to connect properties.vancerealty.com to our public showcase pages.', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: 'msg_2', sender: 'AgentLadders Support HQ', isStaff: true, text: 'Hello Marcus, thank you for reaching out! Your CNAME record should point to proxy.agentladders.com. Let us know once added and our automated system will provision the SSL certificate.', timestamp: new Date(Date.now() - 43200000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'tic_2',
        agencyId: firstAgency.id,
        agencyName: firstAgency.name,
        ticketNumber: 'TICK-4092',
        subject: 'Sole Selling Rights Agreement Review for DLF CyberCity Penthouse',
        category: 'Contract Inquiry',
        priority: 'High',
        status: 'Open',
        createdByName: 'Marcus Vance',
        createdByEmail: 'marcus@vancerealty.com',
        contractType: 'Sole Selling Rights (Exclusive Mandate Agreement)',
        messages: [
          { id: 'msg_3', sender: 'Marcus Vance', isStaff: false, text: 'Hi Legal Team, we have an exclusive mandate opportunity for a 5,400 sq.ft luxury duplex penthouse in Gurgaon. Please advise if we can increase the post-termination protection clause from 180 to 270 days for introduced NRI buyers.', timestamp: new Date(Date.now() - 21600000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 21600000).toISOString()
      }
    ];
  }
  db.sharedLinks = db.sharedLinks || [];

  _cachedDb = db as DB;
  return _cachedDb;
}

export function saveDb(db: DB) {
  _cachedDb = db;
  try {
    const serialized = JSON.stringify(db, null, 2);
    const tmpPath = `${DB_PATH}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
    fs.writeFileSync(tmpPath, serialized, 'utf8');
    try {
      fs.renameSync(tmpPath, DB_PATH);
    } catch {
      fs.writeFileSync(DB_PATH, serialized, 'utf8');
      if (fs.existsSync(tmpPath)) {
        try { fs.unlinkSync(tmpPath); } catch {}
      }
    }

    try {
      _cachedMtime = fs.statSync(DB_PATH).mtimeMs;
    } catch {
      _cachedMtime = Date.now();
    }
    // Also keep legacy file in sync if it exists to avoid desync
    if (fs.existsSync(LEGACY_MOCK_PATH)) {
      try {
        fs.writeFileSync(LEGACY_MOCK_PATH, serialized, 'utf8');
      } catch {}
    }
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

export function generateDummyDataForAgency(agencyId: string, db: DB) {
  const now = new Date().toISOString();

  // 1. Properties (Authentic Indian Luxury & Prime Inventory)
  if (!db.properties.some(p => p.agencyId === agencyId)) {
    db.properties.push(
      { 
        id: 'prop_1', 
        agencyId, 
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
        agentName: 'Marcus Vance',
        agentPhone: '+91 98201 23456',
        agentEmail: 'marcus@vancerealty.com',
        createdAt: now 
      },
      { 
        id: 'prop_2', 
        agencyId, 
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
        agentName: 'Marcus Vance',
        agentPhone: '+91 98201 23456',
        agentEmail: 'marcus@vancerealty.com',
        createdAt: now 
      },
      { 
        id: 'prop_3', 
        agencyId, 
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
        agentName: 'Marcus Vance',
        agentPhone: '+91 98201 23456',
        agentEmail: 'marcus@vancerealty.com',
        createdAt: now 
      },
      { 
        id: 'prop_4', 
        agencyId, 
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
        agentName: 'Marcus Vance',
        agentPhone: '+91 98201 23456',
        agentEmail: 'marcus@vancerealty.com',
        createdAt: now 
      },
      {
        id: 'prop_5',
        agencyId,
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
        agentName: 'Marcus Vance',
        agentPhone: '+91 98201 23456',
        agentEmail: 'marcus@vancerealty.com',
        createdAt: now
      }
    );
  }

  // 2. Leads (Active Indian Inquiries & Buyers)
  if (!db.leads.some(l => l.agencyId === agencyId)) {
    db.leads.push(
      { 
        id: 'lead_1', 
        agencyId, 
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
        assignedTo: 'Marcus Vance',
        nextFollowUp: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: 'Very high intent. MD at Private Equity firm. Wife visited last week.',
        createdAt: now 
      },
      { 
        id: 'lead_2', 
        agencyId, 
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
        assignedTo: 'Marcus Vance',
        nextFollowUp: new Date().toISOString().split('T')[0],
        notes: 'Show DLF The Camellias 28th floor today at 11:30 AM.',
        createdAt: now 
      },
      { 
        id: 'lead_3', 
        agencyId, 
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
        assignedTo: 'Marcus Vance',
        nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        notes: 'Offered ₹3.75 Cr on Prestige Kingfisher. Waiting for seller response.',
        createdAt: now 
      },
      { 
        id: 'lead_4', 
        agencyId, 
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
        assignedTo: 'Marcus Vance',
        nextFollowUp: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        notes: 'Senior Architect at Infosys. Interested in Godrej Sky Greens Kharadi.',
        createdAt: now 
      },
      { 
        id: 'lead_5', 
        agencyId, 
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
        assignedTo: 'Marcus Vance',
        nextFollowUp: new Date().toISOString().split('T')[0],
        notes: 'Follow-up today with Central Park Resorts photo brochure.',
        createdAt: now 
      }
    );
  }

  // 3. Clients
  if (!db.clients.some(c => c.agencyId === agencyId)) {
    db.clients.push(
      { id: 'cli_1', agencyId, name: 'Vikram Malhotra', email: 'vikram.malhotra@induscap.in', phone: '+91 98200 45678', type: 'Buyer', source: 'WhatsApp Inbound', requirement: '4 BHK Luxury Sea-Facing Flat, Worli', budget: '₹8.50 Cr', createdAt: now },
      { id: 'cli_2', agencyId, name: 'Rahul Sharma', email: 'rahul.sharma@techglobal.com', phone: '+91 98100 89012', type: 'Buyer', source: '99acres', requirement: '3 BHK Golf Course Road, DLF 5', budget: '₹14.50 Cr', createdAt: now },
      { id: 'cli_3', agencyId, name: 'Dr. Arvind Singhania', email: 'arvind.singhania@apollo.org', phone: '+91 98451 23456', type: 'Buyer', source: 'Referral / Word of Mouth', requirement: '3 BHK Indiranagar, Bengaluru', budget: '₹3.85 Cr', createdAt: now }
    );
  }

  // 4. Brokerage Partners
  if (!db.brokers.some(b => b.agencyId === agencyId)) {
    db.brokers.push(
      { id: 'brk_1', agencyId, name: 'Sanjay Chhabra', agency: 'Chhabra Associates Gurgaon', commissionSplit: '50/50 Channel Partner', createdAt: now },
      { id: 'brk_2', agencyId, name: 'Manish Parekh', agency: 'South Mumbai Luxury Homes', commissionSplit: '50/50 Co-Brokerage', createdAt: now },
      { id: 'brk_3', agencyId, name: 'Girish Rao', agency: 'Bangalore Prime Properties', commissionSplit: '60/40', createdAt: now }
    );
  }

  // 5. Companies (B2B)
  if (!db.companies.some(c => c.agencyId === agencyId)) {
    db.companies.push(
      { id: 'comp_1', agencyId, name: 'Indus Capital Advisors', industry: 'Private Equity', website: 'https://induscap.example.com', createdAt: now },
      { id: 'comp_2', agencyId, name: 'Barclays Global Service Centre', industry: 'Investment Banking', website: 'https://barclays.example.com', createdAt: now },
      { id: 'comp_3', agencyId, name: 'Mehra Exports Pvt Ltd', industry: 'Textile Exports', website: 'https://mehraexports.example.com', createdAt: now }
    );
  }

  // 6. Property Owners / Landlords
  if (!db.owners.some(o => o.agencyId === agencyId)) {
    db.owners.push(
      { id: 'own_1', agencyId, name: 'Sunil & Neeta Singhania', email: 'sunil.singhania@lodhapark.in', phone: '+91 98201 54321', propertiesCount: 2, createdAt: now },
      { id: 'own_2', agencyId, name: 'Rajeev Mehra', email: 'mehra@dlfcamellias.in', phone: '+91 98110 98765', propertiesCount: 1, createdAt: now },
      { id: 'own_3', agencyId, name: 'Karthik Venkataraman', email: 'karthik.v@gmail.com', phone: '+91 98450 11223', propertiesCount: 1, createdAt: now }
    );
  }

  // 7. Deals Pipeline (Indian Real Estate Brokerage Stages)
  if (!db.deals.some(d => d.agencyId === agencyId)) {
    db.deals.push(
      { 
        id: 'deal_1', 
        agencyId, 
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
        assignedBroker: 'Marcus Vance',
        expectedCloseDate: '2026-10-15', 
        notes: 'Token ₹10 Lakhs received. Drafting Agreement to Sale (ATS).',
        createdAt: now 
      },
      { 
        id: 'deal_2', 
        agencyId, 
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
        assignedBroker: 'Marcus Vance',
        expectedCloseDate: '2026-10-30', 
        notes: 'ATS signed. Buyer clearing HDFC loan disbursement.',
        createdAt: now 
      },
      { 
        id: 'deal_3', 
        agencyId, 
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
        assignedBroker: 'Marcus Vance',
        expectedCloseDate: '2026-10-05', 
        notes: 'Sub-registrar appointment booked for Tuesday 11 AM.',
        createdAt: now 
      }
    );
  }

  // 8. Tasks
  if (!db.tasks.some(t => t.agencyId === agencyId)) {
    db.tasks.push(
      { id: 'tsk_1', agencyId, title: 'Verify RERA Title Search & Encumbrance Certificate for Lodha Park', assignedTo: 'Marcus Vance', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], status: 'Pending', createdAt: now },
      { id: 'tsk_2', agencyId, title: 'Send Camellias floorplan & VRV specs to Rahul Sharma on WhatsApp', assignedTo: 'Marcus Vance', dueDate: new Date().toISOString().split('T')[0], status: 'In Progress', createdAt: now },
      { id: 'tsk_3', agencyId, title: 'Collect 1% TDS challan from Dr. Singhania for Prestige registration', assignedTo: 'Marcus Vance', dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], status: 'Pending', createdAt: now }
    );
  }

  // 9. Calendar Events
  if (!db.calendarEvents.some(c => c.agencyId === agencyId)) {
    db.calendarEvents.push(
      { id: 'cal_1', agencyId, title: 'Site Showing: Lodha Park Worli with Vikram Malhotra', date: new Date().toISOString().split('T')[0], time: '04:30 PM', type: 'Viewing', createdAt: now },
      { id: 'cal_2', agencyId, title: 'Site Showing: DLF The Camellias with Rahul Sharma', date: new Date().toISOString().split('T')[0], time: '11:30 AM', type: 'Viewing', createdAt: now },
      { id: 'cal_3', agencyId, title: 'Sub-Registrar Biometric Registration - Dr. Singhania', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], time: '11:00 AM', type: 'Registration', createdAt: now }
    );
  }

  // 10. Site Visits (With Time Slots and WhatsApp Confirmations)
  if (!db.siteVisits.some(s => s.agencyId === agencyId)) {
    db.siteVisits.push(
      { 
        id: 'vis_1', 
        agencyId, 
        property: '4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park', 
        propertyId: 'prop_1',
        client: 'Vikram Malhotra', 
        clientPhone: '+91 98200 45678',
        date: new Date().toISOString().split('T')[0], // TODAY!
        timeSlot: '04:30 PM - 05:30 PM',
        slotTime: '04:30 PM',
        locality: 'Worli, Mumbai',
        accompaniedBy: 'Marcus Vance',
        status: 'Scheduled', 
        interestLevel: 'Extremely Interested 🔥',
        actionRequired: 'Send location pin and gate pass code',
        notes: 'Buyer coming with wife and interior architect. Focus on sea view and car parking.',
        createdAt: now 
      },
      { 
        id: 'vis_2', 
        agencyId, 
        property: '3 BHK High-Rise Golf Course Apartment, DLF The Camellias', 
        propertyId: 'prop_2',
        client: 'Priya & Rahul Sharma', 
        clientPhone: '+91 98100 89012',
        date: new Date().toISOString().split('T')[0], // TODAY!
        timeSlot: '11:30 AM - 12:30 PM',
        slotTime: '11:30 AM',
        locality: 'Golf Course Road, Gurgaon',
        accompaniedBy: 'Marcus Vance',
        status: 'Scheduled', 
        interestLevel: 'Extremely Interested 🔥',
        actionRequired: 'Meet at Club Camellias reception',
        notes: 'Carried DLF gate pass. Client has pre-arranged driver.',
        createdAt: now 
      },
      { 
        id: 'vis_3', 
        agencyId, 
        property: '3 BHK Prime Garden Flat, Prestige Kingfisher', 
        propertyId: 'prop_3',
        client: 'Dr. Arvind Singhania', 
        clientPhone: '+91 98451 23456',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        timeSlot: '10:00 AM - 11:00 AM',
        slotTime: '10:00 AM',
        locality: 'Indiranagar, Bengaluru',
        accompaniedBy: 'Marcus Vance',
        status: 'Scheduled', 
        interestLevel: 'Considering / Needs 2nd Viewing',
        actionRequired: '2nd visit with father to verify Vastu North-East Brahmasthan',
        notes: 'Doctor requested quiet viewing before his hospital clinic hours.',
        createdAt: now 
      }
    );
  }

  // 11. Listings
  if (!db.listings.some(l => l.agencyId === agencyId)) {
    db.listings.push(
      { id: 'list_1', agencyId, title: 'Lodha Park Worli 4 BHK', platform: '99acres', status: 'Active', views: 2420, createdAt: now },
      { id: 'list_2', agencyId, title: 'DLF The Camellias 3 BHK', platform: 'MagicBricks', status: 'Active', views: 3890, createdAt: now },
      { id: 'list_3', agencyId, title: 'Prestige Kingfisher Indiranagar', platform: 'Housing.com', status: 'Active', views: 1810, createdAt: now },
      { id: 'list_4', agencyId, title: 'Godrej Sky Greens Kharadi', platform: 'Direct WhatsApp Network', status: 'Active', views: 850, createdAt: now }
    );
  }

  // 12. Invoices (Indian Brokerage Invoices with GST)
  if (!db.invoices.some(i => i.agencyId === agencyId)) {
    db.invoices.push(
      { id: 'inv_1', agencyId, number: 'INV-2026-001', clientName: 'Vikram Malhotra', amount: 850000, status: 'Pending', dueDate: '2026-10-20', notes: '1% Buyer Commission on Lodha Park Sale (₹8.50 L + 18% GST)', createdAt: now },
      { id: 'inv_2', agencyId, number: 'INV-2026-002', clientName: 'Sunil Singhania', amount: 850000, status: 'Pending', dueDate: '2026-10-20', notes: '1% Seller Commission on Lodha Park Sale (₹8.50 L + 18% GST)', createdAt: now },
      { id: 'inv_3', agencyId, number: 'INV-2026-003', clientName: 'Dr. Arvind Singhania', amount: 770000, status: 'Paid', dueDate: '2026-09-15', notes: '2% Brokerage on Prestige Indiranagar Sale', createdAt: now }
    );
  }

  // 13. Payments
  if (!db.payments.some(p => p.agencyId === agencyId)) {
    db.payments.push(
      { id: 'pay_1', agencyId, reference: 'NEFT-HDFC-984210', invoiceNumber: 'INV-2026-003', amount: 770000, method: 'NEFT / RTGS', status: 'Completed', createdAt: now }
    );
  }

  // 14. Expenses
  if (!db.expenses.some(e => e.agencyId === agencyId)) {
    db.expenses.push(
      { id: 'exp_1', agencyId, category: 'Marketing', description: '99acres & MagicBricks Featured Verified Boost', amount: 35000, date: '2026-09-05', createdAt: now },
      { id: 'exp_2', agencyId, category: 'Travel & Site Visits', description: 'Broker showing fuel & cab hospitality', amount: 8500, date: '2026-09-10', createdAt: now },
      { id: 'exp_3', agencyId, category: 'Legal & Title Search', description: 'Advocate search report & encumbrance certificate charges', amount: 15000, date: '2026-09-18', createdAt: now }
    );
  }

  // 15. Reports
  if (!db.reports.some(r => r.agencyId === agencyId)) {
    db.reports.push(
      { id: 'rep_1', agencyId, name: 'Q3 Agency Brokerage & Deal Commission Performance', type: 'Financial', frequency: 'Quarterly', createdAt: now },
      { id: 'rep_2', agencyId, name: 'Indian Portals ROI Audit (99acres vs MagicBricks)', type: 'Sales', frequency: 'Monthly', createdAt: now },
      { id: 'rep_3', agencyId, name: 'Luxury Micro-Market Absorption (Worli vs Golf Course Rd)', type: 'Performance', frequency: 'Weekly', createdAt: now }
    );
  }

  // 16. Documents
  if (!db.documents.some(d => d.agencyId === agencyId)) {
    db.documents.push(
      { id: 'doc_1', agencyId, name: 'Agreement_To_Sale_Lodha_Park_Draft.pdf', type: 'Agreement to Sale', category: 'Contracts', size: '2.4 MB', uploadedBy: 'Marcus Vance', createdAt: now },
      { id: 'doc_2', agencyId, name: 'RERA_Registration_Certificate_P51900001339.pdf', type: 'RERA Certificate', category: 'Compliance', size: '1.2 MB', uploadedBy: 'Marcus Vance', createdAt: now },
      { id: 'doc_3', agencyId, name: 'DLF_Camellias_Maintenance_No_Objection_NOC.pdf', type: 'Society NOC', category: 'Title Deeds', size: '850 KB', uploadedBy: 'Marcus Vance', createdAt: now },
      { id: 'doc_4', agencyId, name: 'Client_PAN_Aadhaar_KYC_Vikram_Malhotra.pdf', type: 'KYC / PAN / Aadhaar', category: 'KYC Documents', size: '1.1 MB', uploadedBy: 'Marcus Vance', createdAt: now }
    );
  }

  // 17. Communication Timeline & Activities
  if (!db.activities || !db.activities.some(a => a.agencyId === agencyId)) {
    db.activities = db.activities || [];
    db.activities.push(
      { id: 'act_1', agencyId, actor: 'Marcus Vance', type: 'WhatsApp', relatedEntity: 'Lead', relatedId: 'lead_1', summary: 'Shared Lodha Park Worli 4 BHK WhatsApp pitch brochure', details: 'Client responded in 4 mins: "Looks perfect. Booking visit today at 4:30 PM with my wife."', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'act_2', agencyId, actor: 'Marcus Vance', type: 'Call', relatedEntity: 'Client', relatedId: 'cli_1', summary: 'Token payment confirmation call with Vikram Malhotra', details: 'Confirmed ₹10 Lakhs earnest money RTGS transfer to seller escrow.', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'act_3', agencyId, actor: 'Marcus Vance', type: 'Site Visit', relatedEntity: 'Property', relatedId: 'prop_2', summary: 'Prepared gate pass & private showing at DLF Camellias', details: 'Gate security confirmed pre-cleared access for Rahul Sharma.', createdAt: new Date(Date.now() - 3600000 * 18).toISOString() }
    );
  }

  // 18. Marketing & Lead Sources
  if (!db.marketingCampaigns || !db.marketingCampaigns.some(m => m.agencyId === agencyId)) {
    db.marketingCampaigns = db.marketingCampaigns || [];
    db.marketingCampaigns.push(
      { id: 'mkt_1', agencyId, name: 'Ultra-Luxury Villa Showcase Q3', platform: 'Meta Ads', status: 'Active', budget: 3500, spend: 2150, leadsGenerated: 42, dealsClosed: 2, utmSource: 'instagram_reels_luxury', startDate: '2026-09-01', createdAt: now },
      { id: 'mkt_2', agencyId, name: 'Property Finder Verified Featured Boost', platform: 'Property Finder', status: 'Active', budget: 5000, spend: 3800, leadsGenerated: 68, dealsClosed: 4, utmSource: 'property_finder_featured', startDate: '2026-08-15', createdAt: now },
      { id: 'mkt_3', agencyId, name: 'Google Search High-Intent Buyers', platform: 'Google Ads', status: 'Active', budget: 2800, spend: 1940, leadsGenerated: 31, dealsClosed: 1, utmSource: 'google_search_penthouses', startDate: '2026-09-05', createdAt: now },
      { id: 'mkt_4', agencyId, name: 'Private Investor WhatsApp Broadcast VIP', platform: 'WhatsApp Broadcast', status: 'Completed', budget: 400, spend: 250, leadsGenerated: 19, dealsClosed: 2, utmSource: 'whatsapp_vip_network', startDate: '2026-09-10', endDate: '2026-09-15', createdAt: now }
    );
  }

  // 19. Audit Logs
  if (!db.auditLogs || !db.auditLogs.some(a => a.agencyId === agencyId)) {
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.push(
      { id: 'aud_1', agencyId, userId: 'usr_1', userName: 'Marcus Vance', action: 'LOGIN', entity: 'Session', entityId: 'ses_1', details: 'Successful authenticated login from web console', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'aud_2', agencyId, userId: 'usr_1', userName: 'Marcus Vance', action: 'UPDATE', entity: 'Property', entityId: 'prop_1', details: 'Updated listing price and uploaded 3 new hero photos', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'aud_3', agencyId, userId: 'usr_1', userName: 'Marcus Vance', action: 'SHARE', entity: 'Property', entityId: 'prop_1', details: 'Shared public property link via WhatsApp channel', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 10800000).toISOString() },
      { id: 'aud_4', agencyId, userId: 'usr_1', userName: 'Marcus Vance', action: 'CREATE', entity: 'Deal', entityId: 'deal_1', details: 'Created new Deal: Luxury Villa in Beverly Hills ($4.5M)', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 86400000).toISOString() }
    );
  }

  // 20. Support Tickets
  if (!db.supportTickets || !db.supportTickets.some(s => s.agencyId === agencyId)) {
    db.supportTickets = db.supportTickets || [];
    db.supportTickets.push(
      { 
        id: 'tic_1', 
        agencyId, 
        ticketNumber: 'TICK-4091', 
        subject: 'Custom Domain SSL for Agency Public Properties', 
        category: 'Integrations', 
        priority: 'Medium', 
        status: 'In Review', 
        createdByName: 'Marcus Vance', 
        messages: [
          { id: 'msg_1', sender: 'Marcus Vance', isStaff: false, text: 'Hi Support Team, we would like to confirm DNS records to connect properties.vancerealty.com to our public showcase pages.', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: 'msg_2', sender: 'AgentLadders Support', isStaff: true, text: 'Hello Marcus, thank you for reaching out! Your CNAME record should point to proxy.agentladders.com. Let us know once added and our automated system will provision the SSL certificate.', timestamp: new Date(Date.now() - 43200000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString() 
      },
      { 
        id: 'tic_2', 
        agencyId, 
        ticketNumber: 'TICK-4092', 
        subject: 'Automated WhatsApp Webhook Sync Verification', 
        category: 'CRM Feature', 
        priority: 'High', 
        status: 'Resolved', 
        createdByName: 'Marcus Vance', 
        messages: [
          { id: 'msg_3', sender: 'Marcus Vance', isStaff: false, text: 'All incoming WhatsApp click-to-chat inquiries are now capturing directly into the leads table. Verified perfectly.', timestamp: new Date(Date.now() - 172800000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString() 
      }
    );
  }

  saveDb(db);
}

export function seedAgencyData(agencyId: string) {
  const db = getDb();
  generateDummyDataForAgency(agencyId, db);
  saveDb(db);
}
