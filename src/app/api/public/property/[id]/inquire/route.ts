import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const limitCheck = checkRateLimit(`property_inquire_${ip}`, { limit: 12, windowMs: 10 * 60 * 1000 });
  if (!limitCheck.allowed) {
    return NextResponse.json({
      error: `Too many inquiries from this network. Please try again in ${limitCheck.resetSeconds}s.`
    }, { status: 429 });
  }

  const { id } = await params;
  const data = await req.json();
  const db = await getDb();

  // Find property
  const prop = db.properties.find(p => p.id === id || p.publicToken === id);
  if (!prop) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  data.name = sanitizeString(data.name || '', 100);
  data.email = sanitizeString(data.email || '', 100);
  data.phone = sanitizeString(data.phone || '', 30);
  data.note = sanitizeString(data.note || '', 1000);
  data.timeSlot = sanitizeString(data.timeSlot || '', 50);
  data.date = sanitizeString(data.date || '', 50);

  const isVisitBooking = !!(data.date && data.timeSlot);
  const now = new Date().toISOString();
  let newVisitId: string | undefined = undefined;

  // 1. Create a Site Visit if appointment date was requested
  if (isVisitBooking) {
    const newVisit = {
      id: 'vis_' + Math.random().toString(36).substring(2, 10),
      agencyId: prop.agencyId,
      property: prop.title,
      client: data.name || 'Anonymous Client',
      clientPhone: data.phone || '',
      clientEmail: data.email || '',
      date: data.date || now.split('T')[0],
      timeSlot: data.timeSlot || 'Morning (10 AM - 1 PM)',
      accompaniedBy: prop.agentName || 'Agency Agent',
      status: 'Scheduled',
      source: 'Self-Created (Public Listing)',
      isSelfCreated: true,
      selfCreatedTag: 'Created by User (Self-Interest)',
      priority: 'Urgent / Hot',
      notes: data.note ? `Self-booked site visit via public listing. Note: ${data.note}` : 'Self-booked site visit via public listing page.',
      createdAt: now
    };

    if (!db.siteVisits) db.siteVisits = [];
    db.siteVisits.unshift(newVisit);
    newVisitId = newVisit.id;
  }

  // 2. Create / Update Lead with explicit Self-Created tag
  if (!db.leads) db.leads = [];
  const cleanPhone = (data.phone || '').replace(/\D/g, '');
  const existingLead = cleanPhone ? db.leads.find(l => l.agencyId === prop.agencyId && l.phone && l.phone.replace(/\D/g, '') === cleanPhone) : null;

  if (!existingLead && data.name) {
    const newLead = {
      id: 'lead_' + Math.random().toString(36).substring(2, 10),
      agencyId: prop.agencyId,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      status: isVisitBooking ? 'Site Visit Scheduled' : 'New Inbound',
      source: 'Self-Created (Public Listing)',
      isSelfCreated: true,
      selfCreatedTag: 'Created by User (Self-Interest)',
      urgency: 'Immediate (Hot Buyer)',
      leadPurpose: (prop.purpose === 'For Rent' ? 'Rent' : 'Buy') as 'Buy' | 'Rent',
      propertyTypeNeeded: prop.type || 'Apartment',
      bhkNeeded: prop.bhk ? [prop.bhk] : ['2 BHK'],
      budgetMax: prop.price || undefined,
      city: prop.city || 'Mumbai',
      preferredLocalities: prop.locality || '',
      requirement: `Direct Interest in ${prop.title} (${prop.bhk || ''} ${prop.type || ''})`,
      notes: data.note 
        ? `Self-interested buyer from public listing. Note: ${data.note}` 
        : `Self-interested buyer from public listing for "${prop.title}".`,
      createdAt: now
    };
    db.leads.unshift(newLead);
  } else if (existingLead) {
    existingLead.isSelfCreated = true;
    existingLead.selfCreatedTag = 'Created by User (Self-Interest)';
    if (isVisitBooking) existingLead.status = 'Site Visit Scheduled';
    existingLead.notes = `${existingLead.notes ? existingLead.notes + ' | ' : ''}Expressed direct interest in ${prop.title}${data.note ? `: ${data.note}` : ''}`;
  }

  // 3. Create / Update Client in db.clients
  if (!db.clients) db.clients = [];
  const existingClient = cleanPhone ? db.clients.find(c => c.agencyId === prop.agencyId && c.phone && c.phone.replace(/\D/g, '') === cleanPhone) : null;
  if (!existingClient && data.name) {
    const newClient = {
      id: 'cli_' + Math.random().toString(36).substring(2, 10),
      agencyId: prop.agencyId,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      type: 'Direct Buyer (Self-Created)',
      source: 'Self-Created (Public Listing)',
      isSelfCreated: true,
      selfCreatedTag: 'Created by User (Self-Interest)',
      requirement: `Interested in ${prop.title} (${prop.bhk || ''} ${prop.type || ''})`,
      budget: prop.price ? `₹${prop.price.toLocaleString('en-IN')}` : undefined,
      preferredLocation: prop.locality || prop.city,
      notes: data.note ? `Marked direct interest via public listing: ${data.note}` : 'Marked direct interest via public listing showcase page.',
      createdAt: now
    };
    db.clients.unshift(newClient as any);
  }

  // 4. Send In-App Notification to Agency
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: 'notif_' + Math.random().toString(36).substring(2, 10),
    agencyId: prop.agencyId,
    userId: '',
    title: isVisitBooking ? 'New Self-Booked Site Visit! 📅' : 'New Direct Inquiry (Self-Interested) 🎯',
    message: `${data.name || 'A buyer'} marked direct interest in "${prop.title}". Tag: [Created by user itself]. Phone: ${data.phone || 'N/A'}`,
    type: 'info',
    read: false,
    createdAt: now
  });

  await saveDb(db);

  return NextResponse.json({ 
    success: true, 
    visitId: newVisitId,
    message: isVisitBooking ? 'Site visit request registered!' : 'Property marked as interested!' 
  });
}
