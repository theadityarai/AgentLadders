import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if ((db.clients || []).filter(c => c.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyClients = (db.clients || []).filter(c => c.agencyId === user.agencyId);
  return NextResponse.json({ clients: agencyClients });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  const newClient = {
    ...data,
    id: 'cli_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: data.name || 'New Client',
    email: data.email || '',
    phone: data.phone || '',
    type: data.type || 'Buyer',
    requirement: data.requirement || '',
    budget: data.budget || '',
    preferredLocation: data.preferredLocation || '',
    preferredChannel: data.preferredChannel || 'WhatsApp',
    source: data.source || data.preferredChannel || 'Direct Inbound',
    assignedManager: data.assignedManager || 'Aditya Rai',
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };

  if (!db.clients) db.clients = [];
  db.clients.push(newClient);
  saveDb(db);

  return NextResponse.json({ success: true, client: newClient });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

  if (!db.clients) db.clients = [];
  const index = db.clients.findIndex(c => c.id === data.id && c.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const updatedClient = {
    ...db.clients[index],
    ...data,
    id: db.clients[index].id, // IMMUTABLE
    agencyId: db.clients[index].agencyId, // IMMUTABLE: cross-tenant isolation
    name: data.name !== undefined ? sanitizeString(data.name, 100) : db.clients[index].name,
    email: data.email !== undefined ? sanitizeString(data.email, 100) : db.clients[index].email,
    phone: data.phone !== undefined ? sanitizeString(data.phone, 30) : db.clients[index].phone,
    notes: data.notes !== undefined ? sanitizeString(data.notes, 1000) : db.clients[index].notes,
    updatedAt: new Date().toISOString()
  };

  db.clients[index] = updatedClient;
  saveDb(db);

  return NextResponse.json({ success: true, client: updatedClient });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing client id' }, { status: 400 });

  if (db.clients) {
    db.clients = db.clients.filter(c => !(c.id === id && c.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
