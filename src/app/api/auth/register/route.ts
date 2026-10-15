import { NextResponse } from 'next/server';
import { getDb, saveDb, seedAgencyData } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { DEFAULT_BHK_OPTIONS, DEFAULT_PROPERTY_TYPES, DEFAULT_LEAD_SOURCES } from '@/lib/formatters';
import { isValidEmail, isValidPassword, sanitizeString, normalizeEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`register_${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: `Too many registration attempts from this network. Please try again in ${limitCheck.resetSeconds}s.`
      }, { status: 429 });
    }

    const { agency, name, email, phone, password, country, currency } = await req.json();

    if (!email || !password || !agency) {
      return NextResponse.json({ error: 'Agency name, email, and password are required' }, { status: 400 });
    }

    const digitsOnly = (phone || '').replace(/\D/g, '');
    if (!phone || digitsOnly.length < 10) {
      return NextResponse.json({ error: 'Official Agency WhatsApp phone number is required (minimum 10 digits)' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    const passCheck = isValidPassword(password);
    if (!passCheck.valid) {
      return NextResponse.json({ error: passCheck.reason }, { status: 400 });
    }

    const cleanAgency = sanitizeString(agency, 120);
    const cleanName = sanitizeString(name || 'Agency Owner', 120);
    const cleanPhone = sanitizeString(phone || '', 25);

    const db = getDb();
    const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const agencyId = 'ag_' + Math.random().toString(36).substring(2, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 10);

    db.agencies.push({
      id: agencyId,
      name: cleanAgency,
      country: country || 'India',
      currency: currency || 'INR',
      phone: cleanPhone,
      whatsapp: cleanPhone,
      ownerName: cleanName,
      ownerEmail: cleanEmail,
      plan: 'Professional',
      bhkOptions: DEFAULT_BHK_OPTIONS,
      propertyTypes: DEFAULT_PROPERTY_TYPES,
      leadSources: DEFAULT_LEAD_SOURCES,
      fontFamily: 'roboto',
      colorScheme: 'emerald',
      notificationPrefs: {
        'New lead assigned': { inApp: true, email: true },
        'Task reminder': { inApp: true, email: false },
        'Site visit reminder': { inApp: true, email: true },
      },
      createdAt: new Date().toISOString(),
    });

    db.users.push({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      passwordHash: hashedPassword,
      role: 'OWNER',
      agencyId,
    });

    // Add a welcome notification
    db.notifications.push({
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      title: 'Welcome to AgentLadders',
      message: 'Your agency account has been created successfully.',
      type: 'info',
      read: false,
      userId,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    // Automatically seed full suite of real estate data for new agency
    seedAgencyData(agencyId);

    return NextResponse.json({ success: true, agencyId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
