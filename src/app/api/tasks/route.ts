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

  if ((db.tasks || []).filter(t => t.agencyId === user.agencyId).length === 0) {
    generateDummyDataForAgency(user.agencyId, db);
  }

  const agencyTasks = (db.tasks || []).filter(t => t.agencyId === user.agencyId);
  return NextResponse.json({ tasks: agencyTasks });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to create tasks.' }, { status: 403 });
  }

  const data = await req.json();
  const newTask = {
    ...data,
    id: 'task_' + Math.random().toString(36).substring(2, 10),
    agencyId: user.agencyId,
    title: data.title || 'New Task',
    assignedTo: data.assignedTo || user.name || 'Agent',
    dueDate: data.dueDate || new Date().toISOString().split('T')[0],
    category: data.category || 'Follow-up Call',
    priority: data.priority || 'Medium',
    relatedTo: data.relatedTo || '',
    description: data.description || '',
    status: data.status || 'Pending',
    createdAt: new Date().toISOString()
  };

  if (!db.tasks) db.tasks = [];
  db.tasks.push(newTask);
  saveDb(db);

  return NextResponse.json({ success: true, task: newTask });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to modify tasks.' }, { status: 403 });
  }

  const data = await req.json();
  const task = (db.tasks || []).find(t => t.id === data.id && t.agencyId === user.agencyId);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  if (data.status) task.status = sanitizeString(data.status, 50);
  if (data.title) task.title = sanitizeString(data.title, 200);
  if (data.assignedTo) task.assignedTo = sanitizeString(data.assignedTo, 100);
  if (data.dueDate) task.dueDate = sanitizeString(data.dueDate, 50);
  if (data.category) task.category = sanitizeString(data.category, 50);
  if (data.priority) task.priority = sanitizeString(data.priority, 50);
  if (data.relatedTo !== undefined) task.relatedTo = sanitizeString(data.relatedTo, 200);
  if (data.description !== undefined) task.description = sanitizeString(data.description, 1000);

  saveDb(db);
  return NextResponse.json({ success: true, task });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canMutateCRMRecords(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Read-Only users do not have permission to delete tasks.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing task id' }, { status: 400 });

  if (db.tasks) {
    db.tasks = db.tasks.filter(t => !(t.id === id && t.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
