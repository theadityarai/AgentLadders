import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeString, generateSecureId } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`public_enquiry_${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: `Too many inquiries submitted. Please try again in ${limitCheck.resetSeconds}s.`
      }, { status: 429 });
    }

    const data = await req.json();
    const { propertyId, name, email, phone, preferredDate, message } = data;

    const cleanName = sanitizeString(name, 100);
    const cleanEmail = sanitizeString(email, 100);
    const cleanPhone = sanitizeString(phone, 30);
    const cleanMessage = sanitizeString(message, 1000);
    const cleanPreferredDate = sanitizeString(preferredDate, 50);

    if (!cleanName || (!cleanEmail && !cleanPhone)) {
      return NextResponse.json({ error: 'Name and either email or phone number are required.' }, { status: 400 });
    }

    const db = await getDb();
    // Find property to identify target agency
    const prop = db.properties.find(p => p.id === propertyId || p.publicToken === propertyId);
    const agencyId = prop ? prop.agencyId : (db.agencies[0]?.id || 'ag_default');
    const now = new Date().toISOString();

    // 1. Create a new qualified Lead in the CRM
    const newLeadId = generateSecureId('lead_');
    const newLead = {
      id: newLeadId,
      agencyId,
      name: cleanName,
      email: cleanEmail || 'inquiry@lead.com',
      phone: cleanPhone || 'Unspecified',
      status: 'New',
      source: 'Public Property Page',
      leadType: 'Buyer',
      requirement: prop ? `${prop.title} (${prop.location})` : 'General Property Inquiry',
      budget: prop ? `$${prop.price.toLocaleString()}` : '$1,000,000+',
      priority: 'High',
      assignedTo: prop?.agentName || 'Aditya Rai',
      notes: cleanMessage ? `Client Message: "${cleanMessage}"` : 'Inquiry submitted via public property webpage.',
      createdAt: now
    };

    db.leads = db.leads || [];
    db.leads.unshift(newLead);

    // 2. If client specified a tour date, schedule a Site Visit
    if (cleanPreferredDate) {
      db.siteVisits = db.siteVisits || [];
      db.siteVisits.unshift({
        id: generateSecureId('vis_'),
        agencyId,
        property: prop ? prop.title : 'Property Showcase',
        client: cleanName,
        date: cleanPreferredDate,
        timeSlot: '11:00 AM',
        accompaniedBy: prop?.agentName || 'Aditya Rai',
        status: 'Scheduled',
        notes: `Online tour booking from public webpage. Phone: ${cleanPhone || 'N/A'}. Notes: ${cleanMessage || 'None'}.`,
        createdAt: now
      });
    }

    // 3. Log activity in communication timeline
    db.activities = db.activities || [];
    db.activities.unshift({
      id: generateSecureId('act_'),
      agencyId,
      actor: 'Public Client',
      type: cleanPreferredDate ? 'Site Visit' : 'WhatsApp',
      relatedEntity: 'Lead',
      relatedId: newLeadId,
      summary: `Inquiry received from ${cleanName} for ${prop ? prop.title : 'Property'}`,
      details: `Client email: ${cleanEmail || 'N/A'}, phone: ${cleanPhone || 'N/A'}.${cleanPreferredDate ? ` Requested tour on ${cleanPreferredDate}.` : ''} Message: ${cleanMessage || 'No additional note.'}`,
      createdAt: now
    });

    // 4. Create in-app agency notification
    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: generateSecureId('notif_'),
      agencyId,
      userId: 'all',
      title: '🚨 New Property Inquiry & Lead Captured',
      message: `${cleanName} just submitted an inquiry for "${prop ? prop.title : 'Luxury Property'}". Lead automatically added to CRM pipeline.`,
      type: 'lead',
      read: false,
      createdAt: now
    });

    await saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your private showing request has been received. Our dedicated property advisor will contact you shortly.'
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process inquiry: ' + errorMsg }, { status: 500 });
  }
}
