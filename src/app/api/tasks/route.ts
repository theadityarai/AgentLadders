import { NextResponse } from 'next/server';
import { getDb, saveDb, generateDummyDataForAgency } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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

  const data = await req.json();
  const task = (db.tasks || []).find(t => t.id === data.id && t.agencyId === user.agencyId);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  if (data.status) task.status = data.status;
  if (data.title) task.title = data.title;
  if (data.assignedTo) task.assignedTo = data.assignedTo;
  if (data.dueDate) task.dueDate = data.dueDate;
  if (data.category) task.category = data.category;
  if (data.priority) task.priority = data.priority;
  if (data.relatedTo !== undefined) task.relatedTo = data.relatedTo;
  if (data.description !== undefined) task.description = data.description;

  saveDb(db);
  return NextResponse.json({ success: true, task });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const user = db.users.find(u => u.id === (session.user as any).id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing task id' }, { status: 400 });

  if (db.tasks) {
    db.tasks = db.tasks.filter(t => !(t.id === id && t.agencyId === user.agencyId));
    saveDb(db);
  }

  return NextResponse.json({ success: true });
}
