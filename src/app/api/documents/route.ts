import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canMutateCRMRecords } from '@/lib/rbac';
import { sanitizeString } from '@/lib/sanitize';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const agencyDocs = (db.documents || [])
    .filter(d => d.agencyId === user.agencyId)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return NextResponse.json({ documents: agencyDocs });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to upload documents.' }, { status: 403 });
  }

  const data = await req.json();

  // Guard against oversized payload attacks
  const rawFileData = typeof data.fileData === 'string' ? data.fileData : '';
  if (rawFileData.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Payload too large (max 5MB)' }, { status: 413 });
  }

  const newDoc = {
    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    agencyId: user.agencyId,
    name: sanitizeString(data.name || 'Document.pdf', 150),
    type: sanitizeString(data.type || 'PDF', 50),
    category: sanitizeString(data.category || 'General', 50),
    size: sanitizeString(data.size || '1.2 MB', 30),
    fileData: rawFileData,
    uploadedBy: sanitizeString(user.name || 'Agent', 100),
    relatedTo: data.relatedTo ? sanitizeString(data.relatedTo, 500) : undefined,
    description: data.description ? sanitizeString(data.description, 1000) : undefined,
    createdAt: new Date().toISOString()
  };

  if (!db.documents) db.documents = [];
  db.documents.unshift(newDoc);
  await saveDb(db);

  return NextResponse.json({ success: true, document: newDoc });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete documents.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  let id = searchParams.get('id');
  if (!id) {
    try {
      const body = await req.json();
      id = body.id;
    } catch {}
  }
  if (!id) return NextResponse.json({ error: 'Missing document id' }, { status: 400 });

  if (db.documents) {
    db.documents = db.documents.filter(d => !(d.id === id && d.agencyId === user.agencyId));
    await saveDb(db);
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to edit documents.' }, { status: 403 });
  }

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing document id' }, { status: 400 });

  if (!db.documents) db.documents = [];
  const index = db.documents.findIndex(d => d.id === data.id && d.agencyId === user.agencyId);
  if (index === -1) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  const existingDoc = db.documents[index];

  const updatedDoc = {
    ...existingDoc,
    name: data.name ? sanitizeString(data.name, 150) : existingDoc.name,
    category: data.category ? sanitizeString(data.category, 50) : existingDoc.category,
    description: data.description !== undefined ? sanitizeString(data.description || '', 1000) : existingDoc.description,
    relatedTo: data.relatedTo !== undefined ? sanitizeString(data.relatedTo || '', 500) : existingDoc.relatedTo,
    updatedAt: new Date().toISOString()
  };

  db.documents[index] = updatedDoc;
  await saveDb(db);

  return NextResponse.json({ success: true, document: updatedDoc });
}

