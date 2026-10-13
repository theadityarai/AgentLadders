'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EditIcon, TrashIcon, CheckIcon, XIcon, PlusIcon } from '@/components/icons/NavIcons';

interface Task {
  [key: string]: unknown;
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: string;
}

export default function TasksPage() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const initialForm = {
    title: '',
    assignedTo: 'Marcus Vance',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category: 'Follow-up Call',
    priority: 'High',
    relatedTo: '',
    description: '',
    status: 'Pending'
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.tasks) setData(json.tasks);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      assignedTo: task.assignedTo || 'Marcus Vance',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      category: (task as any).category || 'Follow-up Call',
      priority: (task as any).priority || 'High',
      relatedTo: (task as any).relatedTo || '',
      description: (task as any).description || '',
      status: task.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTask ? 'PUT' : 'POST';
    const payload = editingTask ? { id: editingTask.id, ...form } : form;
    await fetch('/api/tasks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setShowModal(false);
    setEditingTask(null);
    setForm(initialForm);
    loadTasks();
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: nextStatus })
    });
    if (res.ok) {
      setData(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    }
  };

  const handleDelete = (id: string, title: string) => {
    setTaskToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/tasks?id=${taskToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(t => t.id !== taskToDelete.id));
    }
    setIsDeleting(false);
    setTaskToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(task => {
      const matchesSearch = 
        !searchQuery.trim() ||
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  const columns: Column<Task>[] = [
    { 
      key: 'title', 
      label: 'Task Description',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={r.status === 'Completed'}
            onChange={() => handleToggleStatus(r)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
            title="Toggle Complete"
          />
          <span style={{ 
            fontWeight: 500, 
            color: r.status === 'Completed' ? '#94a3b8' : '#1e293b',
            textDecoration: r.status === 'Completed' ? 'line-through' : 'none'
          }}>
            {r.title}
          </span>
        </div>
      )
    },
    { key: 'assignedTo', label: 'Assigned Agent' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleOpenEdit(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#1d4ed8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Edit Task"
          >
            <EditIcon size={12} color="#1d4ed8" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleToggleStatus(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: r.status === 'Completed' ? '#f8fafc' : '#f0fdf4',
              border: `1px solid ${r.status === 'Completed' ? '#cbd5e1' : '#bbf7d0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              color: r.status === 'Completed' ? '#475569' : '#166534',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {r.status === 'Completed' ? (
              <span>Mark Pending</span>
            ) : (
              <>
                <CheckIcon size={12} color="#166534" />
                <span>Complete</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleDelete(r.id, r.title)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e11d48',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete Task"
          >
            <TrashIcon size={13} color="#e11d48" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <PageHeader 
        title="Tasks & Follow-ups" 
        subtitle="Manage daily agent workflows, client callbacks, and closing checklists" 
        actions={<Button variant="primary" onClick={handleOpenAdd}>+ Add Task</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tasks by title or assigned agent..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Tasks', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' }
            ]
          }
        ]}
      />
      
      <div style={{ paddingBottom: '24px' }}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading tasks...</p>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData} 
            emptyMessage="No tasks matched your search"
            onResetFilters={handleResetFilters}
          />
        )}
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} className="responsive-modal" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {editingTask ? 'Edit Action Task' : 'Create Action Task'}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Assign critical follow-ups, contract inspections, and escrow deadlines</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                <XIcon size={18} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Primary Status Field (First / Top Field) */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Task Status *
                </label>
                <select 
                  value={form.status} 
                  onChange={e => setForm({...form, status: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Task Title / Objective *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Prepare Escrow & Title Documents for Beverly Hills Villa" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <div className="responsive-grid-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Task Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Follow-up Call</option>
                    <option>Contract Signing</option>
                    <option>Property Inspection</option>
                    <option>Title & Escrow Verification</option>
                    <option>Client Meeting</option>
                    <option>Mortgage Follow-up</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Assigned Team Member *</label>
                  <input required value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} placeholder="e.g. Marcus Vance" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Due Date *</label>
                  <input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Related Lead / Client / Deal Asset</label>
                <input value={form.relatedTo} onChange={e => setForm({...form, relatedTo: e.target.value})} placeholder="e.g. Brooklyn Lean (Lead), Beverly Hills Villa (Deal #1)" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Task Description & Instructions</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed action checklist, key contacts, or contingency deadlines..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <div>
                  {editingTask && (
                    <Button 
                      type="button" 
                      variant="danger" 
                      onClick={() => {
                        setShowModal(false);
                        handleDelete(editingTask.id, editingTask.title);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <TrashIcon size={14} color="#fff" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">
                    {editingTask ? 'Update Task' : 'Save Task'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Agent Task"
        message={
          <>
            Are you sure you want to delete task <strong>&ldquo;{taskToDelete?.title}&rdquo;</strong>? 
            This action cannot be undone.
          </>
        }
        confirmText="Delete Task"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
