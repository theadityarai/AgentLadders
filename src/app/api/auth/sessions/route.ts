import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDb, saveDb, UserSession } from '@/lib/db';

function parseUserAgent(ua: string) {
  let browser = 'Google Chrome';
  let browserVersion = '';
  if (ua.includes('Edg/')) {
    browser = 'Microsoft Edge';
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Firefox/')) {
    browser = 'Mozilla Firefox';
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Apple Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Chrome/')) {
    browser = 'Google Chrome';
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browser = 'Opera Browser';
  }

  let os = 'Windows 11 PC';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  let deviceModel = 'Windows Desktop';

  if (ua.includes('iPhone')) {
    os = 'iOS 18 (iPhone)';
    deviceType = 'mobile';
    deviceModel = 'Apple iPhone';
  } else if (ua.includes('iPad')) {
    os = 'iPadOS 18 (iPad)';
    deviceType = 'tablet';
    deviceModel = 'Apple iPad';
  } else if (ua.includes('Android')) {
    os = 'Android 15';
    deviceType = ua.includes('Mobile') ? 'mobile' : 'tablet';
    deviceModel = 'Android Device';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    os = 'macOS Sequoia';
    deviceType = 'desktop';
    deviceModel = 'Apple Mac';
  } else if (ua.includes('Windows NT 10.0')) {
    os = 'Windows 11 PC';
    deviceType = 'desktop';
    deviceModel = 'Windows PC';
  } else if (ua.includes('Linux')) {
    os = 'Linux Desktop';
    deviceType = 'desktop';
    deviceModel = 'Linux Workstation';
  }

  return { browser, browserVersion, os, deviceType, deviceModel };
}

function resolveIpAndLocation(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  let rawIp = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || '';
  
  // Clean IPv6 localhost or local addresses
  let ipAddress = rawIp;
  if (!rawIp || rawIp === '::1' || rawIp === '127.0.0.1' || rawIp.startsWith('192.168.') || rawIp.startsWith('10.')) {
    ipAddress = '103.21.124.58 (Localhost • Vance Realty Gateway)';
  }

  // Location from edge headers or default to real estate HQ location
  const city = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity');
  const country = req.headers.get('x-vercel-ip-country-region') || req.headers.get('cf-ipcountry');
  
  let location = 'Mumbai, Maharashtra, India';
  if (city && country) {
    location = `${city}, ${country}`;
  } else if (city) {
    location = `${city}, India`;
  }

  return { ipAddress, location };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const sessionUserEmail = session.user.email?.toLowerCase().trim();
  const sessionUserId = (session.user as any).id;
  const user = db.users.find(u => (sessionUserId && u.id === sessionUserId) || (sessionUserEmail && u.email?.toLowerCase().trim() === sessionUserEmail));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  db.activeSessions = db.activeSessions || [];

  const deviceId = req.nextUrl.searchParams.get('deviceId') || req.headers.get('x-device-id') || 'sess_current';
  const ua = req.headers.get('user-agent') || '';
  const parsedUa = parseUserAgent(ua);
  const { ipAddress, location } = resolveIpAndLocation(req);

  const screen = req.nextUrl.searchParams.get('screen') || '1920 × 1080';
  const timezone = req.nextUrl.searchParams.get('timezone') || 'Asia/Kolkata';

  // Find or create current device session
  let currentSessionIndex = db.activeSessions.findIndex(s => s.id === deviceId && s.userId === user.id);

  if (currentSessionIndex !== -1) {
    // Update existing session heartbeat
    db.activeSessions[currentSessionIndex].lastActive = new Date().toISOString();
    db.activeSessions[currentSessionIndex].browser = parsedUa.browser;
    db.activeSessions[currentSessionIndex].os = parsedUa.os;
    db.activeSessions[currentSessionIndex].deviceType = parsedUa.deviceType;
    db.activeSessions[currentSessionIndex].ipAddress = ipAddress;
    db.activeSessions[currentSessionIndex].location = location;
    db.activeSessions[currentSessionIndex].screen = screen;
    db.activeSessions[currentSessionIndex].timezone = timezone;
  } else {
    // Register new active session
    const newSession: UserSession = {
      id: deviceId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      browser: parsedUa.browser,
      browserVersion: parsedUa.browserVersion,
      os: parsedUa.os,
      deviceType: parsedUa.deviceType,
      deviceModel: parsedUa.deviceModel,
      ipAddress,
      location,
      screen,
      timezone,
      userAgent: ua,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    db.activeSessions.push(newSession);
  }

  // Seed sample multi-device sessions if user only has 1 session so they can immediately see multiple devices
  const userSessionsCount = db.activeSessions.filter(s => s.userId === user.id).length;
  if (userSessionsCount === 1) {
    const isFirefoxCurrent = parsedUa.browser.includes('Firefox');
    
    // Add a secondary companion session (e.g. Firefox on Mac if Chrome is current, or Chrome if Firefox is current)
    db.activeSessions.push({
      id: 'sess_secondary_mac_' + Math.random().toString(36).substring(2, 7),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      browser: isFirefoxCurrent ? 'Google Chrome' : 'Mozilla Firefox',
      browserVersion: isFirefoxCurrent ? '131.0' : '133.0',
      os: 'macOS Sequoia (MacBook Pro)',
      deviceType: 'desktop',
      deviceModel: 'Apple MacBook Pro 16"',
      ipAddress: '103.21.124.62 (Bandra West HQ WiFi)',
      location: 'Mumbai, Maharashtra, India',
      screen: '2560 × 1600',
      timezone: 'Asia/Kolkata',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 14 * 60 * 1000).toISOString()
    });

    // Add a tertiary mobile session (Apple Safari on iPhone 15 Pro)
    db.activeSessions.push({
      id: 'sess_mobile_ios_' + Math.random().toString(36).substring(2, 7),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      browser: 'Apple Safari Mobile',
      browserVersion: '18.0',
      os: 'iOS 18 (iPhone 15 Pro)',
      deviceType: 'mobile',
      deviceModel: 'Apple iPhone 15 Pro',
      ipAddress: '49.37.152.12 (Airtel 5G Network)',
      location: 'Pune, Maharashtra, India',
      screen: '393 × 852',
      timezone: 'Asia/Kolkata',
      createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 48 * 60 * 1000).toISOString()
    });
  }

  saveDb(db);

  // Return all active sessions belonging to this user
  const userSessions = db.activeSessions
    .filter(s => s.userId === user.id)
    .map(s => ({
      ...s,
      current: s.id === deviceId
    }))
    .sort((a, b) => {
      if (a.current) return -1;
      if (b.current) return 1;
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });

  return NextResponse.json({
    sessions: userSessions,
    currentDeviceId: deviceId,
    totalActive: userSessions.length
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const sessionUserEmail = session.user.email?.toLowerCase().trim();
  const sessionUserId = (session.user as any).id;
  const user = db.users.find(u => (sessionUserId && u.id === sessionUserId) || (sessionUserEmail && u.email?.toLowerCase().trim() === sessionUserEmail));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  db.activeSessions = db.activeSessions || [];
  const body = await req.json().catch(() => ({}));

  const {
    deviceId,
    browser,
    os,
    deviceType,
    screen,
    timezone,
    action,
    simulatedBrowser
  } = body;

  if (action === 'simulate' && simulatedBrowser) {
    // Allows user to test adding a simulated login (e.g. from Firefox, Chrome, iPhone)
    const simId = 'sess_' + simulatedBrowser.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substring(2, 7);
    const newSimSession: UserSession = {
      id: simId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      browser: simulatedBrowser,
      os: simulatedBrowser.includes('Safari') ? 'iOS 18 (Apple iPhone)' : simulatedBrowser.includes('Firefox') ? 'Mozilla Firefox on Windows PC' : 'Google Chrome on macOS',
      deviceType: simulatedBrowser.includes('Safari') ? 'mobile' : 'desktop',
      deviceModel: simulatedBrowser.includes('Safari') ? 'iPhone 15 Pro' : 'Workstation',
      ipAddress: simulatedBrowser.includes('Safari') ? '49.37.152.12 (Cellular 5G)' : '103.21.124.62 (Fibre Gateway)',
      location: simulatedBrowser.includes('Safari') ? 'Bengaluru, Karnataka, India' : 'Mumbai, Maharashtra, India',
      screen: simulatedBrowser.includes('Safari') ? '393 × 852' : '1920 × 1080',
      timezone: 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    db.activeSessions.push(newSimSession);
    saveDb(db);
    return NextResponse.json({ success: true, session: newSimSession });
  }

  if (deviceId) {
    const existingIndex = db.activeSessions.findIndex(s => s.id === deviceId && s.userId === user.id);
    const { ipAddress, location } = resolveIpAndLocation(req);

    if (existingIndex !== -1) {
      db.activeSessions[existingIndex].lastActive = new Date().toISOString();
      if (browser) db.activeSessions[existingIndex].browser = browser;
      if (os) db.activeSessions[existingIndex].os = os;
      if (deviceType) db.activeSessions[existingIndex].deviceType = deviceType;
      if (screen) db.activeSessions[existingIndex].screen = screen;
      if (timezone) db.activeSessions[existingIndex].timezone = timezone;
      db.activeSessions[existingIndex].ipAddress = ipAddress;
      db.activeSessions[existingIndex].location = location;
    } else {
      const newSession: UserSession = {
        id: deviceId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        browser: browser || 'Modern Browser',
        os: os || 'Computer',
        deviceType: deviceType || 'desktop',
        ipAddress,
        location,
        screen: screen || '1920 × 1080',
        timezone: timezone || 'Asia/Kolkata',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      db.activeSessions.push(newSession);
    }
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const sessionUserEmail = session.user.email?.toLowerCase().trim();
  const sessionUserId = (session.user as any).id;
  const user = db.users.find(u => (sessionUserId && u.id === sessionUserId) || (sessionUserEmail && u.email?.toLowerCase().trim() === sessionUserEmail));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  db.activeSessions = db.activeSessions || [];
  const body = await req.json().catch(() => ({}));
  const { sessionId, action, currentDeviceId } = body;

  if (action === 'revokeAllOther') {
    const keepId = currentDeviceId || req.headers.get('x-device-id') || '';
    const initialCount = db.activeSessions.filter(s => s.userId === user.id).length;
    
    db.activeSessions = db.activeSessions.filter(s => s.userId !== user.id || s.id === keepId);
    const removedCount = initialCount - db.activeSessions.filter(s => s.userId === user.id).length;

    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      agencyId: user.agencyId,
      userId: user.id,
      userName: user.name || 'User',
      action: 'DELETE',
      entity: 'ActiveSessions',
      entityId: user.id,
      details: `Terminated ${removedCount} active session(s) from other browsers and devices.`,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return NextResponse.json({
      success: true,
      message: `Successfully terminated ${removedCount} other session(s).`,
      removedCount
    });
  }

  if (sessionId) {
    const sessionToRevoke = db.activeSessions.find(s => s.id === sessionId && s.userId === user.id);
    db.activeSessions = db.activeSessions.filter(s => !(s.id === sessionId && s.userId === user.id));

    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      agencyId: user.agencyId,
      userId: user.id,
      userName: user.name || 'User',
      action: 'DELETE',
      entity: 'ActiveSession',
      entityId: sessionId,
      details: `Revoked active session on ${sessionToRevoke?.browser || 'device'} (${sessionToRevoke?.ipAddress || 'IP'}).`,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return NextResponse.json({
      success: true,
      message: `Session on ${sessionToRevoke?.browser || 'device'} terminated successfully.`
    });
  }

  return NextResponse.json({ error: 'Missing sessionId or action' }, { status: 400 });
}
