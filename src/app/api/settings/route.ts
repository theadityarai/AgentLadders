import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const agency = db.agencies.find(a => a.id === user.agencyId);
  const agencyUsers = db.users.filter(u => u.agencyId === user.agencyId).map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role
  }));

  // Migrate older agencies that might not have the new fields
  if (agency && !agency.plan) {
    agency.plan = 'Professional';
    agency.propertyTypes = ['Apartment', 'House', 'Villa', 'Commercial'];
    agency.leadSources = ['Website', 'Referral', 'Zillow', 'Walk-in'];
    agency.notificationPrefs = {
      'New lead assigned': { inApp: true, email: true },
      'Task reminder': { inApp: true, email: false },
      'Site visit reminder': { inApp: true, email: true },
    };
    saveDb(db);
  }

  return NextResponse.json({ user, agency, users: agencyUsers });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const agencyIndex = db.agencies.findIndex(a => a.id === user.agencyId);
  if (agencyIndex === -1) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

  const { action } = data;

  if (action === 'updateAgency') {
    if (data.agencyName) db.agencies[agencyIndex].name = data.agencyName;
    if (data.country) db.agencies[agencyIndex].country = data.country;
    if (data.currency) db.agencies[agencyIndex].currency = data.currency;
  } 
  else if (action === 'updatePlan') {
    db.agencies[agencyIndex].plan = data.plan;
  }
  else if (action === 'updateConfig') {
    if (data.propertyTypes) db.agencies[agencyIndex].propertyTypes = data.propertyTypes;
    if (data.leadSources) db.agencies[agencyIndex].leadSources = data.leadSources;
  }
  else if (action === 'updateNotifications') {
    db.agencies[agencyIndex].notificationPrefs = data.notificationPrefs;
  }
  else if (action === 'inviteUser') {
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const existing = db.users.find(u => u.email === data.email);
    if (existing) return NextResponse.json({ error: 'User email already exists' }, { status: 400 });
    
    // Default password for invited users
    const defaultPassword = await bcrypt.hash('welcome123', 10);
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      agencyId: user.agencyId,
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash: defaultPassword,
    };
    db.users.push(newUser);
  }
  else if (action === 'changePassword') {
    const { currentPassword, newPassword } = data;
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isValid) return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  saveDb(db);
  return NextResponse.json({ success: true, agency: db.agencies[agencyIndex] });
}
