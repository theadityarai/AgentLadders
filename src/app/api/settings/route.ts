import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { isValidPassword, isValidEmail, sanitizeString } from '@/lib/sanitize';
import { 
  DEFAULT_BHK_OPTIONS, 
  DEFAULT_PROPERTY_TYPES, 
  DEFAULT_LEAD_SOURCES,
  DEFAULT_PROPERTY_SPECS,
  DEFAULT_CONSTRUCTION_STAGES,
  DEFAULT_VASTU_FACINGS,
  DEFAULT_DEAL_STAGES,
  DEFAULT_PARKING_OPTIONS,
  DEFAULT_PROPERTY_STATUSES,
  DEFAULT_LEAD_STATUSES,
  DEFAULT_SITE_VISIT_STATUSES,
  DEFAULT_TASK_STATUSES,
  DEFAULT_CLIENT_STATUSES
} from '@/lib/formatters';

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
    id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar || u.image || ''
  }));

  // Ensure default agency configs exist
  if (agency) {
    let modified = false;
    if (!agency.plan) { agency.plan = 'Professional'; modified = true; }
    if (!agency.bhkOptions || agency.bhkOptions.length === 0) {
      agency.bhkOptions = DEFAULT_BHK_OPTIONS;
      modified = true;
    }
    if (!agency.propertyTypes || agency.propertyTypes.length === 0) {
      agency.propertyTypes = DEFAULT_PROPERTY_TYPES;
      modified = true;
    }
    if (!agency.leadSources || agency.leadSources.length === 0) {
      agency.leadSources = DEFAULT_LEAD_SOURCES;
      modified = true;
    }
    if (!agency.propertySpecs || agency.propertySpecs.length === 0) {
      agency.propertySpecs = DEFAULT_PROPERTY_SPECS;
      modified = true;
    }
    if (!agency.constructionStages || agency.constructionStages.length === 0) {
      agency.constructionStages = DEFAULT_CONSTRUCTION_STAGES;
      modified = true;
    }
    if (!agency.vastuOptions || agency.vastuOptions.length === 0) {
      agency.vastuOptions = DEFAULT_VASTU_FACINGS;
      modified = true;
    }
    if (!agency.dealStages || agency.dealStages.length === 0) {
      agency.dealStages = DEFAULT_DEAL_STAGES;
      modified = true;
    }
    if (!agency.parkingOptions || agency.parkingOptions.length === 0) {
      agency.parkingOptions = DEFAULT_PARKING_OPTIONS;
      modified = true;
    }
    if (!agency.propertyStatuses || agency.propertyStatuses.length === 0) {
      agency.propertyStatuses = DEFAULT_PROPERTY_STATUSES;
      modified = true;
    }
    if (!agency.leadStatuses || agency.leadStatuses.length === 0) {
      agency.leadStatuses = DEFAULT_LEAD_STATUSES;
      modified = true;
    }
    if (!agency.siteVisitStatuses || agency.siteVisitStatuses.length === 0) {
      agency.siteVisitStatuses = DEFAULT_SITE_VISIT_STATUSES;
      modified = true;
    }
    if (!agency.taskStatuses || agency.taskStatuses.length === 0) {
      agency.taskStatuses = DEFAULT_TASK_STATUSES;
      modified = true;
    }
    if (!agency.clientStatuses || agency.clientStatuses.length === 0) {
      agency.clientStatuses = DEFAULT_CLIENT_STATUSES;
      modified = true;
    }
    if (!agency.timezone) {
      agency.timezone = 'Asia/Kolkata';
      modified = true;
    }
    if (!agency.notificationPrefs) {
      agency.notificationPrefs = {
        'Support ticket updates': { inApp: true, email: true },
        'New lead assigned': { inApp: true, email: true },
        'Task reminder': { inApp: true, email: false },
        'Site visit reminder': { inApp: true, email: true },
      };
      modified = true;
    } else if (!agency.notificationPrefs['Support ticket updates']) {
      agency.notificationPrefs['Support ticket updates'] = { inApp: true, email: true };
      modified = true;
    }
    if (modified) saveDb(db);
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || user.image || '',
    image: user.avatar || user.image || '',
    phone: user.phone || '',
    agencyId: user.agencyId,
    twoFactorEnabled: !!user.twoFactorEnabled,
    twoFactorSecret: user.twoFactorSecret || 'AGLD-7734-K821-X992',
    twoFactorBackupCodes: user.twoFactorBackupCodes || ['4829-1029', '7361-9921', '8302-4410', '1928-3392', '5512-8801']
  };

  return NextResponse.json({ user: safeUser, agency, users: agencyUsers });
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
  const userRole = (user.role || '').toUpperCase();
  const canManageUsers = ['OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole) || user.email === 'aditya@agentladders.com' || user.email === 'admin@agentladders.com';

  if (action === 'updateAgency') {
    if (data.agencyName) db.agencies[agencyIndex].name = data.agencyName;
    if (data.country) db.agencies[agencyIndex].country = data.country;
    if (data.currency) db.agencies[agencyIndex].currency = data.currency;
    if (data.timezone) db.agencies[agencyIndex].timezone = data.timezone;
    if (data.logo !== undefined) {
      db.agencies[agencyIndex].logo = data.logo;
      db.agencies[agencyIndex].logoUrl = data.logo;
    }
  } 
  else if (action === 'updateAgencyLogo') {
    db.agencies[agencyIndex].logo = data.logo || '';
    db.agencies[agencyIndex].logoUrl = data.logo || '';
  }
  else if (action === 'updateProfilePhoto') {
    user.avatar = data.avatar || '';
    user.image = data.avatar || '';
  }
  else if (action === 'updatePlan') {
    db.agencies[agencyIndex].plan = data.plan;
  }
  else if (action === 'updateBranding') {
    if (data.fontFamily) db.agencies[agencyIndex].fontFamily = data.fontFamily;
    if (data.colorScheme) db.agencies[agencyIndex].colorScheme = data.colorScheme;
    if (data.logo !== undefined) {
      db.agencies[agencyIndex].logo = data.logo;
      db.agencies[agencyIndex].logoUrl = data.logo;
    }
  }
  else if (action === 'updateConfig') {
    if (data.bhkOptions) db.agencies[agencyIndex].bhkOptions = data.bhkOptions;
    if (data.propertyTypes) db.agencies[agencyIndex].propertyTypes = data.propertyTypes;
    if (data.leadSources) db.agencies[agencyIndex].leadSources = data.leadSources;
    if (data.propertySpecs) db.agencies[agencyIndex].propertySpecs = data.propertySpecs;
    if (data.constructionStages) db.agencies[agencyIndex].constructionStages = data.constructionStages;
    if (data.vastuOptions) db.agencies[agencyIndex].vastuOptions = data.vastuOptions;
    if (data.dealStages) db.agencies[agencyIndex].dealStages = data.dealStages;
    if (data.parkingOptions) db.agencies[agencyIndex].parkingOptions = data.parkingOptions;
    if (data.propertyStatuses) db.agencies[agencyIndex].propertyStatuses = data.propertyStatuses;
    if (data.leadStatuses) db.agencies[agencyIndex].leadStatuses = data.leadStatuses;
    if (data.siteVisitStatuses) db.agencies[agencyIndex].siteVisitStatuses = data.siteVisitStatuses;
    if (data.taskStatuses) db.agencies[agencyIndex].taskStatuses = data.taskStatuses;
    if (data.clientStatuses) db.agencies[agencyIndex].clientStatuses = data.clientStatuses;
  }
  else if (action === 'updateNotifications') {
    db.agencies[agencyIndex].notificationPrefs = data.notificationPrefs;
  }
  else if (action === 'inviteUser') {
    if (!canManageUsers) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to invite team members' }, { status: 403 });
    }
    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    const cleanName = sanitizeString(data.name || 'Team Member');
    const existing = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    
    // Default password for invited users: welcome123
    const defaultPassword = await bcrypt.hash('welcome123', 10);
    const newUserId = 'usr_' + Math.random().toString(36).substring(2, 10);
    const newUser = {
      id: newUserId,
      agencyId: user.agencyId,
      name: cleanName,
      email: data.email.toLowerCase().trim(),
      role: data.role || 'MANAGER',
      password: defaultPassword,
      passwordHash: defaultPassword,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    // Add welcome notification for the agency
    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      agencyId: user.agencyId,
      userId: user.id,
      title: 'New Team Member Invited 👥',
      message: `${cleanName} (${data.email}) was invited as ${data.role || 'MANAGER'}. Temporary password is welcome123.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
  else if (action === 'removeUser') {
    if (!canManageUsers) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }
    if (data.userId === user.id) {
      return NextResponse.json({ error: 'You cannot remove your own account' }, { status: 400 });
    }
    const targetIdx = db.users.findIndex(u => u.id === data.userId && u.agencyId === user.agencyId);
    if (targetIdx === -1) {
      return NextResponse.json({ error: 'User not found in your agency' }, { status: 404 });
    }
    const removedUserName = db.users[targetIdx].name;
    db.users.splice(targetIdx, 1);

    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      agencyId: user.agencyId,
      userId: user.id,
      title: 'Team Member Removed 🗑️',
      message: `${removedUserName} was removed from the agency roster.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
  else if (action === 'updateUserRole') {
    if (!canManageUsers) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const target = db.users.find(u => u.id === data.userId && u.agencyId === user.agencyId);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    target.role = data.role;
  }
  else if (action === 'enable2FA') {
    user.twoFactorEnabled = true;
    user.twoFactorSecret = data.secret || user.twoFactorSecret || `AGLD-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    user.twoFactorBackupCodes = data.backupCodes && Array.isArray(data.backupCodes) && data.backupCodes.length > 0
      ? data.backupCodes
      : Array.from({ length: 5 }, () => `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);

    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      agencyId: user.agencyId,
      userId: user.id,
      title: 'Two-Factor Authentication Activated 🛡️',
      message: 'Two-Factor Authentication (TOTP Authenticator) was successfully configured on your account.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
  else if (action === 'disable2FA') {
    user.twoFactorEnabled = false;

    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      agencyId: user.agencyId,
      userId: user.id,
      title: 'Two-Factor Authentication Disabled ⚠️',
      message: 'Two-Factor Authentication has been turned off for your account.',
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });
  }
  else if (action === 'changePassword') {
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }
    
    // Check new password strength
    const passwordCheck = isValidPassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.reason }, { status: 400 });
    }

    const passHash = user.passwordHash || user.password;
    let isValid = false;
    if (passHash) {
      isValid = await bcrypt.compare(currentPassword, passHash);
    }
    if (!isValid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    
    const newHash = await bcrypt.hash(newPassword, 10);
    user.password = newHash;
    user.passwordHash = newHash;

    db.notifications = db.notifications || [];
    db.notifications.unshift({
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      agencyId: user.agencyId,
      userId: user.id,
      title: 'Password Changed 🔒',
      message: 'Your account password was updated securely.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDb(db);
  const updatedAgencyUsers = db.users.filter(u => u.agencyId === user.agencyId).map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role
  }));
  return NextResponse.json({
    success: true,
    agency: db.agencies[agencyIndex],
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: !!user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      twoFactorBackupCodes: user.twoFactorBackupCodes
    },
    users: updatedAgencyUsers
  });
}
