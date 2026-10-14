import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
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

  const agencyDocs = (db.documents || []).filter(d => d.agencyId === user.agencyId);
  return NextResponse.json({ documents: agencyDocs });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
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
    id: 'doc_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: sanitizeString(data.name || 'Document.pdf', 150),
    type: sanitizeString(data.type || 'PDF', 50),
    category: sanitizeString(data.category || 'General', 50),
    size: sanitizeString(data.size || '1.2 MB', 30),
    fileData: rawFileData,
    uploadedBy: sanitizeString(user.name || 'Agent', 100),
    createdAt: new Date().toISOString()
  };

  if (!db.documents) db.documents = [];
  db.documents.push(newDoc);
  saveDb(db);

  return NextResponse.json({ success: true, document: newDoc });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete documents.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing document id' }, { status: 400 });

  if (db.documents) {
    db.documents = db.documents.filter(d => !(d.id === id && d.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}

