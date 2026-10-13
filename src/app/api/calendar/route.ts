import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

  const data = await req.json();
  const newEvent = {
    ...data,
    id: 'evt_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: data.title || 'New Event',
    date: data.date || new Date().toISOString().split('T')[0],
    time: data.time || '10:00 AM',
    type: data.type || 'Meeting',
    location: data.location || 'Headquarters / Zoom Link',
    attendees: data.attendees || 'Marcus Vance, Client',
    notes: data.notes || '',
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

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  if (!db.calendarEvents) db.calendarEvents = [];
  const index = db.calendarEvents.findIndex(c => c.id === data.id && c.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const updatedEvent = {
    ...db.calendarEvents[index],
    ...data,
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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  if (db.calendarEvents) {
    db.calendarEvents = db.calendarEvents.filter(c => !(c.id === id && c.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
