import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const LEGACY_MOCK_PATH = path.join(process.cwd(), 'mock-db.json');

export interface User {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: string;
}

export interface Agency {
  id: string;
  name: string;
  country: string;
  currency: string;
  plan?: string;
  propertyTypes?: string[];
  leadSources?: string[];
  notificationPrefs?: Record<string, { inApp: boolean; email: boolean }>;
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title?: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  agencyId: string;
  title: string;
  type: string;
  location: string;
  price: number;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  listingType?: string;
  ownerName?: string;
  description?: string;
  createdAt: string;
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
  requirement?: string;
  budget?: string;
  locationPreference?: string;
  priority?: string;
  assignedTo?: string;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  agencyId: string;
  title: string;
  propertyId?: string;
  propertyName?: string;
  leadId?: string;
  clientName?: string;
  dealType?: string;
  amount: number;
  stage: string;
  probability?: number;
  commissionRate?: string;
  commissionAmount?: number;
  assignedBroker?: string;
  expectedCloseDate: string;
  createdAt: string;
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
  amount: number;
  status: string;
  dueDate: string;
  dealRef?: string;
  issueDate?: string;
  taxRate?: string;
  notes?: string;
  createdAt: string;
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
  client: string;
  date: string;
  timeSlot?: string;
  accompaniedBy?: string;
  status: string;
  feedback?: string;
  notes?: string;
  createdAt: string;
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
}

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

export function getDb(): DB {
  let db: Partial<DB> = {};

  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
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

  return db as DB;
}

export function saveDb(db: DB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    // Also keep legacy file in sync if it exists to avoid desync
    if (fs.existsSync(LEGACY_MOCK_PATH)) {
      fs.writeFileSync(LEGACY_MOCK_PATH, JSON.stringify(db, null, 2));
    }
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

export function generateDummyDataForAgency(agencyId: string, db: DB) {
  const now = new Date().toISOString();

  // 1. Properties
  if (!db.properties.some(p => p.agencyId === agencyId)) {
    db.properties.push(
      { id: 'prop_1', agencyId, title: 'Luxury Villa in Beverly Hills', type: 'Villa', location: 'Los Angeles, CA', price: 4500000, status: 'Available', createdAt: now },
      { id: 'prop_2', agencyId, title: 'Downtown Sky Penthouse', type: 'Apartment', location: 'Manhattan, NY', price: 2850000, status: 'Under Offer', createdAt: now },
      { id: 'prop_3', agencyId, title: 'Modern Waterfront Residence', type: 'House', location: 'Miami Beach, FL', price: 1650000, status: 'Available', createdAt: now },
      { id: 'prop_4', agencyId, title: 'Silicon Valley Executive Condo', type: 'Apartment', location: 'Palo Alto, CA', price: 1250000, status: 'Sold', createdAt: now }
    );
  }

  // 2. Leads
  if (!db.leads.some(l => l.agencyId === agencyId)) {
    db.leads.push(
      { id: 'lead_1', agencyId, name: 'Brooklyn Lean', email: 'brooklyn@example.com', phone: '+1 (555) 234-5678', status: 'Qualified', source: 'Website', createdAt: now },
      { id: 'lead_2', agencyId, name: 'James Wilson', email: 'james.w@example.com', phone: '+1 (555) 345-6789', status: 'New', source: 'Referral', createdAt: now },
      { id: 'lead_3', agencyId, name: 'Sarah Connor', email: 'sarah.c@example.com', phone: '+1 (555) 456-7890', status: 'Contacted', source: 'Zillow', createdAt: now },
      { id: 'lead_4', agencyId, name: 'Alexander Wright', email: 'alex.wright@horizon.com', phone: '+1 (555) 789-0123', status: 'Qualified', source: 'Property Finder', createdAt: now }
    );
  }

  // 3. Clients
  if (!db.clients.some(c => c.agencyId === agencyId)) {
    db.clients.push(
      { id: 'cli_1', agencyId, name: 'Jonathan Reynolds', email: 'jreynolds@invest.org', phone: '+1 (555) 890-1234', type: 'Buyer', createdAt: now },
      { id: 'cli_2', agencyId, name: 'Sophia Martinez', email: 'smartinez@designlab.co', phone: '+1 (555) 901-2345', type: 'Renter', createdAt: now },
      { id: 'cli_3', agencyId, name: 'Oliver Zhang', email: 'oliver.zhang@capital.hk', phone: '+1 (555) 012-3456', type: 'Investor', createdAt: now }
    );
  }

  // 4. Brokerage Partners
  if (!db.brokers.some(b => b.agencyId === agencyId)) {
    db.brokers.push(
      { id: 'brk_1', agencyId, name: 'Marcus Vance', agency: 'Vance & Partners Luxury Real Estate', commissionSplit: '70/30', createdAt: now },
      { id: 'brk_2', agencyId, name: 'Elena Rostova', agency: 'Metropolitan Commercial Realty', commissionSplit: '50/50', createdAt: now },
      { id: 'brk_3', agencyId, name: 'David Sterling', agency: 'Prime Coastal Estates', commissionSplit: '60/40', createdAt: now }
    );
  }

  // 5. Companies (B2B)
  if (!db.companies.some(c => c.agencyId === agencyId)) {
    db.companies.push(
      { id: 'comp_1', agencyId, name: 'Apex Horizon Capital', industry: 'Private Equity / Real Estate', website: 'https://apexhorizon.example.com', createdAt: now },
      { id: 'comp_2', agencyId, name: 'Sterling Development Group', industry: 'Commercial Property Development', website: 'https://sterlingdev.example.com', createdAt: now },
      { id: 'comp_3', agencyId, name: 'OmniGlobal Hospitality', industry: 'Hotels & Serviced Residences', website: 'https://omniglobal.example.com', createdAt: now }
    );
  }

  // 6. Property Owners / Landlords
  if (!db.owners.some(o => o.agencyId === agencyId)) {
    db.owners.push(
      { id: 'own_1', agencyId, name: 'Richard Davenport', email: 'richard@davenport.co', phone: '+1 (555) 111-2233', propertiesCount: 4, createdAt: now },
      { id: 'own_2', agencyId, name: 'Eleanor Vance', email: 'evance@estateholdings.com', phone: '+1 (555) 222-3344', propertiesCount: 2, createdAt: now },
      { id: 'own_3', agencyId, name: 'Robert Chen', email: 'rchen@pacificridge.io', phone: '+1 (555) 333-4455', propertiesCount: 6, createdAt: now }
    );
  }

  // 7. Deals Pipeline
  if (!db.deals.some(d => d.agencyId === agencyId)) {
    db.deals.push(
      { id: 'deal_1', agencyId, title: 'Beverly Hills Luxury Villa Purchase', amount: 4500000, stage: 'Closed Won', expectedCloseDate: '2026-08-15', createdAt: now },
      { id: 'deal_2', agencyId, title: 'Downtown Penthouse Corporate Lease', amount: 180000, stage: 'Negotiation', expectedCloseDate: '2026-10-01', createdAt: now },
      { id: 'deal_3', agencyId, title: 'Miami Waterfront Acquisition', amount: 1650000, stage: 'Proposal', expectedCloseDate: '2026-11-15', createdAt: now },
      { id: 'deal_4', agencyId, title: 'Silicon Valley Condo Sale', amount: 1250000, stage: 'Closed Won', expectedCloseDate: '2026-07-20', createdAt: now }
    );
  }

  // 8. Tasks
  if (!db.tasks.some(t => t.agencyId === agencyId)) {
    db.tasks.push(
      { id: 'tsk_1', agencyId, title: 'Prepare Escrow & Title Documents for Beverly Hills Villa', assignedTo: 'Adi', dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], status: 'Pending', createdAt: now },
      { id: 'tsk_2', agencyId, title: 'Finalize Lease Agreement with Sophia Martinez', assignedTo: 'Adi', dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], status: 'In Progress', createdAt: now },
      { id: 'tsk_3', agencyId, title: 'Inspect Miami Waterfront property before buyer handover', assignedTo: 'Marcus Vance', dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], status: 'Completed', createdAt: now }
    );
  }

  // 9. Calendar Events
  if (!db.calendarEvents.some(c => c.agencyId === agencyId)) {
    db.calendarEvents.push(
      { id: 'cal_1', agencyId, title: 'Exclusive Viewing: Downtown Sky Penthouse', date: new Date().toISOString().split('T')[0], time: '11:00 AM', type: 'Viewing', createdAt: now },
      { id: 'cal_2', agencyId, title: 'Contract Signing: Brooklyn Lean & Escrow Agent', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '02:30 PM', type: 'Meeting', createdAt: now },
      { id: 'cal_3', agencyId, title: 'Follow-up Call with Marcus Vance (Split Review)', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], time: '10:00 AM', type: 'Call', createdAt: now }
    );
  }

  // 10. Site Visits
  if (!db.siteVisits.some(s => s.agencyId === agencyId)) {
    db.siteVisits.push(
      { id: 'vis_1', agencyId, property: 'Luxury Villa in Beverly Hills', client: 'Jonathan Reynolds', date: new Date().toISOString().split('T')[0], status: 'Scheduled', createdAt: now },
      { id: 'vis_2', agencyId, property: 'Downtown Sky Penthouse', client: 'Sophia Martinez', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'Completed', createdAt: now },
      { id: 'vis_3', agencyId, property: 'Modern Waterfront Residence', client: 'Oliver Zhang', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], status: 'Scheduled', createdAt: now }
    );
  }

  // 11. Listings
  if (!db.listings.some(l => l.agencyId === agencyId)) {
    db.listings.push(
      { id: 'list_1', agencyId, title: 'Luxury Villa in Beverly Hills', platform: 'Property Finder', status: 'Active', views: 1420, createdAt: now },
      { id: 'list_2', agencyId, title: 'Downtown Sky Penthouse', platform: 'Bayut', status: 'Active', views: 890, createdAt: now },
      { id: 'list_3', agencyId, title: 'Modern Waterfront Residence', platform: 'Zillow', status: 'Active', views: 2310, createdAt: now },
      { id: 'list_4', agencyId, title: 'Silicon Valley Executive Condo', platform: 'Company Website', status: 'Draft', views: 150, createdAt: now }
    );
  }

  // 12. Invoices
  if (!db.invoices.some(i => i.agencyId === agencyId)) {
    db.invoices.push(
      { id: 'inv_1', agencyId, number: 'INV-2026-001', clientName: 'Jonathan Reynolds', amount: 90000, status: 'Paid', dueDate: '2026-08-30', createdAt: now },
      { id: 'inv_2', agencyId, number: 'INV-2026-002', clientName: 'Sophia Martinez', amount: 18000, status: 'Pending', dueDate: '2026-10-15', createdAt: now },
      { id: 'inv_3', agencyId, number: 'INV-2026-003', clientName: 'Apex Horizon Capital', amount: 45000, status: 'Overdue', dueDate: '2026-09-10', createdAt: now }
    );
  }

  // 13. Payments
  if (!db.payments.some(p => p.agencyId === agencyId)) {
    db.payments.push(
      { id: 'pay_1', agencyId, reference: 'TXN-984210', invoiceNumber: 'INV-2026-001', amount: 90000, method: 'Bank Transfer', status: 'Completed', createdAt: now },
      { id: 'pay_2', agencyId, reference: 'TXN-984211', invoiceNumber: 'INV-2026-002', amount: 5000, method: 'Credit Card', status: 'Processing', createdAt: now }
    );
  }

  // 14. Expenses
  if (!db.expenses.some(e => e.agencyId === agencyId)) {
    db.expenses.push(
      { id: 'exp_1', agencyId, category: 'Marketing', description: 'Zillow & Bayut Premium Featured Placement', amount: 2400, date: '2026-09-05', createdAt: now },
      { id: 'exp_2', agencyId, category: 'Software', description: 'Matterport 3D Virtual Tour Hosting', amount: 350, date: '2026-09-10', createdAt: now },
      { id: 'exp_3', agencyId, category: 'Office', description: 'Agency Client Hospitality & Escrow Closing Dinner', amount: 720, date: '2026-09-18', createdAt: now }
    );
  }

  // 15. Reports
  if (!db.reports.some(r => r.agencyId === agencyId)) {
    db.reports.push(
      { id: 'rep_1', agencyId, name: 'Q3 Agency Commission & Deal Performance', type: 'Financial', frequency: 'Quarterly', createdAt: now },
      { id: 'rep_2', agencyId, name: 'Lead Acquisition & Portal ROI Audit', type: 'Sales', frequency: 'Monthly', createdAt: now },
      { id: 'rep_3', agencyId, name: 'Active Inventory Valuation & Absorption Rate', type: 'Performance', frequency: 'Weekly', createdAt: now }
    );
  }

  // 16. Documents
  if (!db.documents.some(d => d.agencyId === agencyId)) {
    db.documents.push(
      { id: 'doc_1', agencyId, name: 'Sales_Purchase_Agreement_Villa_4B.pdf', type: 'Sales Contract', category: 'Contracts', size: '2.4 MB', uploadedBy: 'Adi', createdAt: now },
      { id: 'doc_2', agencyId, name: 'Title_Deed_Certificate_Downtown_Sky.pdf', type: 'Title Deed', category: 'Title Deeds', size: '1.8 MB', uploadedBy: 'Adi', createdAt: now },
      { id: 'doc_3', agencyId, name: 'Client_KYC_Passport_Jonathan_Reynolds.pdf', type: 'KYC / Passport', category: 'KYC Documents', size: '850 KB', uploadedBy: 'Adi', createdAt: now }
    );
  }

  saveDb(db);
}
