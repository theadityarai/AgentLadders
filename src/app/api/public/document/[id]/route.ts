import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const limitCheck = checkRateLimit(`public_doc_${ip}`, { limit: 120, windowMs: 60 * 1000 });
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const { id } = await params;
  const db = getDb();

  const doc = (db.documents || []).find(d => d.id === id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found or link has expired.' }, { status: 404 });
  }

  // Get agency info for public branding
  const agency = (db.agencies || []).find(a => a.id === doc.agencyId);

  return NextResponse.json({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    category: doc.category || 'General',
    size: doc.size,
    description: doc.description || '',
    relatedTo: doc.relatedTo || '',
    fileData: doc.fileData || '',
    uploadedBy: doc.uploadedBy || 'Agent',
    createdAt: doc.createdAt,
    agencyName: agency?.name || 'AgentLadders Real Estate',
    agencyPhone: agency?.phone || agency?.whatsapp || '',
    agencyLogo: agency?.logo || agency?.logoUrl || ''
  });
}
