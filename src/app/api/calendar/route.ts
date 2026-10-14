import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canMutateCRMRecords } from '@/lib/rbac';
import { sanitizeString } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.calendarEvents || []).filter(c => c.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyEvents = (db.calendarEvents || []).filter(c => c.agencyId === user.agencyId);
  return NextResponse.json({ events: agencyEvents });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to schedule calendar events.' }, { status: 403 });
  }

  const data = await req.json();
  const newEvent = {
    ...data,
    id: 'evt_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: sanitizeString(data.title || 'New Event', 150),
    date: sanitizeString(data.date || new Date().toISOString().split('T')[0], 50),
    time: sanitizeString(data.time || '10:00 AM', 50),
    type: sanitizeString(data.type || 'Meeting', 50),
    location: sanitizeString(data.location || 'Headquarters / Zoom Link', 200),
    attendees: sanitizeString(data.attendees || '', 200),
    notes: sanitizeString(data.notes || '', 500),
    createdAt: new Date().toISOString()
  };

  if (!db.calendarEvents) db.calendarEvents = [];
  db.calendarEvents.push(newEvent);
  saveDb(db);

  return NextResponse.json({ success: true, event: newEvent });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify calendar events.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  if (!db.calendarEvents) db.calendarEvents = [];
  const index = db.calendarEvents.findIndex(c => c.id === data.id && c.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const updatedEvent = {
    ...db.calendarEvents[index],
    ...data,
    id: db.calendarEvents[index].id, // IMMUTABLE
    agencyId: db.calendarEvents[index].agencyId, // IMMUTABLE: tenant isolation
    title: data.title !== undefined ? sanitizeString(data.title, 150) : db.calendarEvents[index].title,
    date: data.date !== undefined ? sanitizeString(data.date, 50) : db.calendarEvents[index].date,
    time: data.time !== undefined ? sanitizeString(data.time, 50) : db.calendarEvents[index].time,
    type: data.type !== undefined ? sanitizeString(data.type, 50) : db.calendarEvents[index].type,
    location: data.location !== undefined ? sanitizeString(data.location, 200) : db.calendarEvents[index].location,
    attendees: data.attendees !== undefined ? sanitizeString(data.attendees, 200) : db.calendarEvents[index].attendees,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 500) : db.calendarEvents[index].notes,
    updatedAt: new Date().toISOString()
  };

  db.calendarEvents[index] = updatedEvent;
  saveDb(db);

  return NextResponse.json({ success: true, event: updatedEvent });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete calendar events.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  if (db.calendarEvents) {
    db.calendarEvents = db.calendarEvents.filter(c => !(c.id === id && c.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}

