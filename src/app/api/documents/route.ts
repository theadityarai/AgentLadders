import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

  const data = await req.json();
  const newDoc = {
    id: 'doc_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: data.name || 'Document.pdf',
    type: data.type || 'PDF',
    category: data.category || 'General',
    size: data.size || '1.2 MB',
    fileData: data.fileData || '',
    uploadedBy: user.name || 'Agent',
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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing document id' }, { status: 400 });

  if (db.documents) {
    db.documents = db.documents.filter(d => !(d.id === id && d.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
