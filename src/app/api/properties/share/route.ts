import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
    const data = await req.json();
    const { propertyId, channel, privacyMode } = data;

    const prop = db.properties.find(p => p.id === propertyId && p.agencyId === user.agencyId);
    if (!prop) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // Ensure public token exists
    if (!prop.publicToken) {
      prop.publicToken = 'tok_' + Math.random().toString(36).substring(2, 12);
    }
    if (privacyMode) {
      prop.privacyMode = privacyMode;
    }
    prop.sharesCount = (prop.sharesCount || 0) + 1;

    const now = new Date().toISOString();
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const publicUrl = `${protocol}://${host}/p/${prop.publicToken || prop.id}`;

    // Record share audit log
    db.sharedLinks = db.sharedLinks || [];
    db.sharedLinks.unshift({
      id: 'sh_' + Math.random().toString(36).substring(2, 9),
      agencyId: user.agencyId,
      propertyId: prop.id,
      propertyTitle: prop.title,
      channel: channel || 'WhatsApp',
      publicUrl,
      sharedBy: user.name || 'Agent',
      privacyMode: prop.privacyMode || 'Public',
      createdAt: now
    });

    // Record activity timeline entry
    db.activities = db.activities || [];
    db.activities.unshift({
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      agencyId: user.agencyId,
      actor: user.name || 'Agent',
      type: 'Property Share',
      relatedEntity: 'Property',
      relatedId: prop.id,
      summary: `Shared "${prop.title}" on ${channel || 'WhatsApp'}`,
      details: `Channel: ${channel}, Privacy Mode: ${prop.privacyMode || 'Public'}, Link: ${publicUrl}`,
      createdAt: now
    });

    // Record audit log entry
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      agencyId: user.agencyId,
      userId: user.id,
      userName: user.name || 'Agent',
      action: 'SHARE',
      entity: 'Property',
      entityId: prop.id,
      details: `Shared property "${prop.title}" via ${channel}`,
      createdAt: now
    });

    saveDb(db);

    return NextResponse.json({
      success: true,
      publicUrl,
      sharesCount: prop.sharesCount,
      publicToken: prop.publicToken,
      privacyMode: prop.privacyMode
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to record share: ' + errorMsg }, { status: 500 });
  }
}
