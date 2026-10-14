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

  if ((db.reports || []).filter(r => r.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyReports = (db.reports || []).filter(r => r.agencyId === user.agencyId);
  return NextResponse.json({ reports: agencyReports });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to generate reports.' }, { status: 403 });
  }

  const data = await req.json();
  const newReport = {
    ...data,
    id: 'rep_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    name: sanitizeString(data.name || 'Executive Agency Performance Summary', 150),
    type: sanitizeString(data.type || 'Financial', 50),
    frequency: sanitizeString(data.frequency || 'Monthly', 50),
    dateRange: sanitizeString(data.dateRange || 'Last 30 Days', 50),
    format: sanitizeString(data.format || 'PDF Report', 50),
    scope: sanitizeString(data.scope || 'All Teams & Agents', 100),
    createdAt: new Date().toISOString()
  };

  if (!db.reports) db.reports = [];
  db.reports.push(newReport);
  saveDb(db);

  return NextResponse.json({ success: true, report: newReport });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete reports.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing report id' }, { status: 400 });

  if (db.reports) {
    db.reports = db.reports.filter(r => !(r.id === id && r.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}

