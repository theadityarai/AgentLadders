import { NextResponse } from 'next/server';
import { getDb, saveDb, seedAgencyData } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { agency, name, email, phone, password, country, currency } = await req.json();

    if (!email || !password || !agency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const agencyId = 'ag_' + Math.random().toString(36).substring(2, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 10);

    db.agencies.push({
      id: agencyId,
      name: agency,
      country,
      currency,
      plan: 'Professional',
      propertyTypes: ['Apartment', 'House', 'Villa', 'Commercial'],
      leadSources: ['Website', 'Referral', 'Zillow', 'Walk-in'],
      notificationPrefs: {
        'New lead assigned': { inApp: true, email: true },
        'Task reminder': { inApp: true, email: false },
        'Site visit reminder': { inApp: true, email: true },
      },
      createdAt: new Date().toISOString(),
    });

    db.users.push({
      id: userId,
      name,
      email: email.toLowerCase(),
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
