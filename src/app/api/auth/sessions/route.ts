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

  const db = await getDb();
  const sessionUserEmail = session.user.email?.toLowerCase().trim();
  const sessionUserId = (session.user as any).id;
  const user = db.users.find(u => (sessionUserId && u.id === sessionUserId) || (sessionUserEmail && u.email?.toLowerCase().trim() === sessionUserEmail));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  db.activeSessions = db.activeSessions || [];
  db.revokedSessions = db.revokedSessions || [];

  // Prune stale revoked session entries older than 2 hours
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  db.revokedSessions = db.revokedSessions.filter(r => {
    const t = new Date(r.revokedAt).getTime();
    return !isNaN(t) && t > twoHoursAgo;
  });

  const deviceId = req.nextUrl.searchParams.get('deviceId') || req.headers.get('x-device-id') || 'sess_current';
  const isCheck = req.nextUrl.searchParams.get('check') === 'true';

  // Check if this device has been explicitly revoked/terminated
  const isRevoked = db.revokedSessions.some(r => r.id === deviceId && r.userId === user.id);
  if (isRevoked) {
    return NextResponse.json({
      valid: false,
      revoked: true,
      error: 'Session has been terminated remotely from another device.'
    }, { status: 401 });
  }

  // If lightweight polling check, verify existence or auto-register if missing
  if (isCheck) {
    let activeSession = db.activeSessions.find(s => s.id === deviceId && s.userId === user.id);
    if (!activeSession) {
      // Auto-register session for this authenticated user rather than falsely kicking them out
      const ua = req.headers.get('user-agent') || '';
      const parsedUa = parseUserAgent(ua);
      const { ipAddress, location } = resolveIpAndLocation(req);
      activeSession = {
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
        screen: '1920 × 1080',
        timezone: 'Asia/Kolkata',
        userAgent: ua,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      db.activeSessions.push(activeSession);
      await saveDb(db);
    } else {
      activeSession.lastActive = new Date().toISOString();
      await saveDb(db);
    }
    return NextResponse.json({ valid: true, revoked: false });
  }

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

  // Purge any previously seeded fake/test sessions
  db.activeSessions = db.activeSessions.filter(s => 
    !s.id.startsWith('sess_secondary_') && 
    !s.id.startsWith('sess_mobile_') && 
    !s.id.startsWith('sess_sim_') && 
    !s.id.startsWith('sess_firefox') && 
    !s.id.startsWith('sess_apple_safari') &&
    s.browser !== 'Apple Safari Mobile'
  );

  await saveDb(db);

  // Return all real active sessions belonging to this user
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

  const db = await getDb();
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
    timezone
  } = body;

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
    await saveDb(db);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const sessionUserEmail = session.user.email?.toLowerCase().trim();
  const sessionUserId = (session.user as any).id;
  const user = db.users.find(u => (sessionUserId && u.id === sessionUserId) || (sessionUserEmail && u.email?.toLowerCase().trim() === sessionUserEmail));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  db.activeSessions = db.activeSessions || [];
  db.revokedSessions = db.revokedSessions || [];
  const body = await req.json().catch(() => ({}));
  const { sessionId, action, currentDeviceId, selfLogout } = body;

  if (action === 'revokeAllOther') {
    const keepId = currentDeviceId || req.headers.get('x-device-id') || '';
    const initialCount = db.activeSessions.filter(s => s.userId === user.id).length;
    
    // Find all sessions to terminate
    const sessionsToRevoke = db.activeSessions.filter(s => s.userId === user.id && s.id !== keepId);
    sessionsToRevoke.forEach(s => {
      if (!db.revokedSessions!.some(r => r.id === s.id && r.userId === user.id)) {
        db.revokedSessions!.push({
          id: s.id,
          userId: user.id,
          revokedAt: new Date().toISOString()
        });
      }
    });

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

    await saveDb(db);
    return NextResponse.json({
      success: true,
      message: `Successfully terminated ${removedCount} other session(s).`,
      removedCount
    });
  }

  if (sessionId) {
    // Record as revoked so the remote device is forced to logout immediately
    if (!db.revokedSessions.some(r => r.id === sessionId && r.userId === user.id)) {
      db.revokedSessions.push({
        id: sessionId,
        userId: user.id,
        revokedAt: new Date().toISOString()
      });
    }

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
      details: selfLogout 
        ? `User signed out from ${sessionToRevoke?.browser || 'device'} (${sessionToRevoke?.ipAddress || 'IP'}).`
        : `Terminated active session on ${sessionToRevoke?.browser || 'device'} (${sessionToRevoke?.ipAddress || 'IP'}).`,
      createdAt: new Date().toISOString()
    });

    await saveDb(db);
    return NextResponse.json({
      success: true,
      message: `Session on ${sessionToRevoke?.browser || 'device'} terminated successfully.`
    });
  }

  return NextResponse.json({ error: 'Missing sessionId or action' }, { status: 400 });
}
