import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function createSamplePdfBuffer(title: string, category: string, description: string): Buffer {
  // Generates a valid minimal binary PDF (PDF-1.4 standard)
  const safeTitle = title.replace(/[()\\]/g, '');
  const safeCategory = category.replace(/[()\\]/g, '');
  const safeDesc = description.replace(/[()\\]/g, '').substring(0, 200);

  const streamContent = `BT
/F1 18 Tf
50 720 Td
(${safeTitle}) Tj
ET
BT
/F1 12 Tf
50 680 Td
(Category: ${safeCategory} | AgentLadders Agency Vault) Tj
ET
BT
/F1 10 Tf
50 640 Td
(${safeDesc}) Tj
ET
BT
/F1 10 Tf
50 600 Td
(This document is officially archived in AgentLadders Real Estate CRM.) Tj
ET`;

  const streamLength = Buffer.byteLength(streamContent);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
368
%%EOF`;

  return Buffer.from(pdf, 'binary');
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const limitCheck = checkRateLimit(`public_raw_${ip}`, { limit: 60, windowMs: 60 * 1000 });
  if (!limitCheck.allowed) {
    return new NextResponse('Too many download requests. Please try again later.', { status: 429 });
  }

  const { id } = await params;
  const db = await getDb();

  const doc = (db.documents || []).find(d => d.id === id);
  if (!doc) {
    return new NextResponse('Document Not Found', { status: 404 });
  }

  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'",
    'X-Frame-Options': 'SAMEORIGIN',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  };

  // 1. If document has real fileData (data URI e.g. data:application/pdf;base64,...)
  if (doc.fileData && doc.fileData.startsWith('data:')) {
    try {
      const [header, base64] = doc.fileData.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const buffer = Buffer.from(base64, 'base64');

      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          ...securityHeaders,
          'Content-Type': mime,
          'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
          'Content-Length': buffer.length.toString(),
        }
      });
    } catch {
      // Fall through to fallback generator
    }
  }

  // 2. Synthesize real valid PDF file for seed documents so Google Docs & PDF viewers render properly
  const isImage = (doc.type + ' ' + doc.name).toLowerCase().match(/(image|png|jpg|jpeg|webp)/);
  if (isImage) {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(pngBase64, 'base64');
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        ...securityHeaders,
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
      }
    });
  }

  const pdfBuffer = createSamplePdfBuffer(doc.name, doc.category || 'General', doc.description || 'Verified Document');
  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      ...securityHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
      'Content-Length': pdfBuffer.length.toString(),
    }
  });
}

