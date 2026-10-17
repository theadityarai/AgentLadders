'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { getStatusColorStyle } from '@/lib/theme';
import { DEFAULT_TASK_STATUSES } from '@/lib/formatters';
import {
  CheckIcon,
  XIcon,
  TrashIcon,
  EditIcon,
  PlusIcon,
  CalendarIcon,
  UsersIcon,
  BuildingIcon,
  BriefcaseIcon,
  WhatsAppIcon
} from '@/components/icons/NavIcons';
import { ShareModal } from '@/components/ui/ShareModal';
import { isValid10DigitPhone, extract10DigitPhone } from '@/lib/phone-validation';
import { PhoneInput } from '@/components/ui/PhoneInput';

export interface Task {
  [key: string]: unknown;
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  category?: string;
  priority?: string;
  relatedTo?: string;
  description?: string;
  phone?: string;
  createdAt?: string;
}

const TASK_CATEGORIES = [
  'Buyer Follow-up & Match Sharing',
  'Site Visit Coordination & Gate Pass',
  'Token & Escrow Agreement',
  'Registry, Title Clearance & NOC',
  'Commission Brokerage Invoicing',
  'Client KYC Collection',
  'Builder CP Meeting'
];

const TASK_PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];

const initialForm = {
  title: '',
  assignedTo: '',
  dueDate: '',
  category: '',
  priority: '',
  relatedTo: '',
  phone: '',
  description: '',
  status: ''
};

function getCategoryIcon(cat: string = ''): string {
  const c = cat.toLowerCase();
  if (c.includes('call') || c.includes('follow')) return '📞';
  if (c.includes('visit') || c.includes('walk')) return '🚗';
  if (c.includes('agreement') || c.includes('title') || c.includes('draft')) return '📜';
  if (c.includes('token') || c.includes('escrow') || c.includes('payment')) return '🛡️';
  if (c.includes('meeting') || c.includes('builder')) return '🏢';
  if (c.includes('kyc') || c.includes('client')) return '👤';
  return '📌';
}

function getPriorityBadge(priority: string = 'Medium') {
  const p = priority.toLowerCase();
  if (p === 'urgent') return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
  if (p === 'high') return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
  if (p === 'medium') return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
}

export default function TasksPage() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskStatuses, setTaskStatuses] = useState<string[]>(DEFAULT_TASK_STATUSES);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(initialForm);

  // CRM context for linking
  const [crmOptions, setCrmOptions] = useState<{ label: string; value: string; phone?: string }[]>([]);

  // Delete & Share modal states
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'overdue' | 'high' | 'completed'>('all');
  const [sortBy, setSortBy] = useState('due_date_asc');

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

  const loadCRMContext = () => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()).catch(() => ({})),
      fetch('/api/properties').then(r => r.json()).catch(() => ({})),
      fetch('/api/deals').then(r => r.json()).catch(() => ({}))
    ]).then(([leadsRes, propsRes, dealsRes]) => {
      const opts: { label: string; value: string; phone?: string }[] = [];
      (leadsRes.leads || []).slice(0, 15).forEach((l: any) => {
        opts.push({ label: `Client: ${l.name}`, value: `Client: ${l.name}`, phone: l.phone });
      });
      (propsRes.properties || []).slice(0, 15).forEach((p: any) => {
        opts.push({ label: `Property: ${p.title}`, value: `Property: ${p.title}` });
      });
      (dealsRes.deals || []).slice(0, 10).forEach((d: any) => {
        opts.push({ label: `Deal: ${d.title}`, value: `Deal: ${d.title}` });
      });
      setCrmOptions(opts);
    }).catch(() => {});
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('agentladders_agency_configs');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.taskStatuses) && parsed.taskStatuses.length > 0) {
            setTaskStatuses(parsed.taskStatuses);
          }
        }
      } catch {}
    }
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d?.agency?.taskStatuses && Array.isArray(d.agency.taskStatuses) && d.agency.taskStatuses.length > 0) {
          setTaskStatuses(d.agency.taskStatuses);
        }
      })
      .catch(() => {});

    loadTasks();
    loadCRMContext();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
        setEditingTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleOpenAdd = (presetCategory?: string) => {
    setEditingTask(null);
    setForm({
      ...initialForm,
      category: presetCategory || 'Follow-up Call'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      assignedTo: task.assignedTo || 'Marcus Vance',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      category: task.category || 'Follow-up Call',
      priority: task.priority || 'High',
      relatedTo: task.relatedTo || '',
      phone: task.phone || '',
      description: task.description || '',
      status: task.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || form.title.trim().length < 2) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Task Title Required', message: 'Please enter a task title / description.' });
      return;
    }
    if (!form.dueDate?.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Due Date Required', message: 'Please select a due date for this task.' });
      return;
    }
    if (!form.status?.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Status Required', message: 'Please select a status for this task.' });
      return;
    }
    if (form.phone?.trim() && !isValid10DigitPhone(form.phone)) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Invalid Phone Number', message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    const method = editingTask ? 'PUT' : 'POST';
    const payload = {
      ...(editingTask ? { id: editingTask.id } : {}),
      ...form
    };

    try {
      const res = await fetch('/api/tasks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingTask(null);
        setForm(initialForm);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: editingTask ? 'Task Updated' : 'Task Scheduled',
          message: `Task "${form.title}" is queued.`
        });
        loadTasks();
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ id: Date.now().toString(), type: 'error', title: 'Error', message: err.error || 'Failed to save task.' });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Could not connect to task server.' });
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setData(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus })
      });
      setToast({
        id: Date.now().toString(),
        type: nextStatus === 'Completed' ? 'success' : 'info',
        title: nextStatus === 'Completed' ? 'Task Completed! 🎉' : 'Marked Pending',
        message: `"${task.title}" updated.`
      });
    } catch {
      loadTasks();
    }
  };

  const handleMoveKanban = async (taskId: string, newStatus: string) => {
    setData(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status: newStatus })
    });
  };

  const handleDelete = (id: string, title: string) => {
    setTaskToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks?id=${taskToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(t => t.id !== taskToDelete.id));
        setToast({ id: Date.now().toString(), type: 'success', title: 'Task Removed', message: `"${taskToDelete.title}" deleted.` });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Could not delete task.' });
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  // Quick WhatsApp follow-up action
  const handleWhatsAppAction = (task: Task) => {
    setSharingTask(task);
  };

  // Task Telemetry
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(t => t.status === 'Completed').length;
    const todayTasks = data.filter(t => t.dueDate === todayStr && t.status !== 'Completed').length;
    const overdue = data.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, todayTasks, overdue, completionRate };
  }, [data, todayStr]);

  // Faceted tab counts based on current search query
  const tabCounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const dataForTabs = data.filter(task => {
      if (!q) return true;
      return (
        task.title?.toLowerCase().includes(q) ||
        task.assignedTo?.toLowerCase().includes(q) ||
        task.relatedTo?.toLowerCase().includes(q) ||
        task.category?.toLowerCase().includes(q)
      );
    });

    return {
      all: dataForTabs.length,
      today: dataForTabs.filter(t => t.dueDate === todayStr && t.status !== 'Completed').length,
      overdue: dataForTabs.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length,
      high: dataForTabs.filter(t => (t.priority === 'High' || t.priority === 'Urgent') && t.status !== 'Completed').length,
      completed: dataForTabs.filter(t => t.status === 'Completed').length
    };
  }, [data, searchQuery, todayStr]);

  // Filtered Tasks
  const filteredData = useMemo(() => {
    return data.filter(task => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        task.title?.toLowerCase().includes(q) ||
        task.assignedTo?.toLowerCase().includes(q) ||
        task.relatedTo?.toLowerCase().includes(q) ||
        task.category?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterTab === 'today') return task.dueDate === todayStr && task.status !== 'Completed';
      if (filterTab === 'overdue') return task.dueDate < todayStr && task.status !== 'Completed';
      if (filterTab === 'high') return (task.priority === 'High' || task.priority === 'Urgent') && task.status !== 'Completed';
      if (filterTab === 'completed') return task.status === 'Completed';

      return true;
    }).sort((a, b) => {
      if (sortBy === 'due_date_desc') {
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      } else if (sortBy === 'priority_desc') {
        const pOrder: Record<string, number> = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const pa = pOrder[(a.priority || 'medium').toLowerCase()] ?? 2;
        const pb = pOrder[(b.priority || 'medium').toLowerCase()] ?? 2;
        if (pa !== pb) return pb - pa;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'newest') {
        return (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || '');
      }
      // default: due_date_asc
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    });
  }, [data, searchQuery, filterTab, todayStr, sortBy]);

  const columns: Column<Task>[] = [
    {
      key: 'status',
      label: 'Done',
      width: 50,
      align: 'center',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(r)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: r.status === 'Completed' ? 'none' : '1.5px solid #cbd5e1',
            backgroundColor: r.status === 'Completed' ? '#059669' : '#ffffff',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title={r.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
        >
          {r.status === 'Completed' && <CheckIcon size={14} color="#ffffff" strokeWidth={3} />}
        </button>
      )
    },
    {
      key: 'title',
      label: 'Task & Objective',
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{getCategoryIcon(r.category)}</span>
            <span
              onClick={() => handleOpenEdit(r)}
              style={{
                fontWeight: 700,
                color: r.status === 'Completed' ? '#94a3b8' : '#0f172a',
                textDecoration: r.status === 'Completed' ? 'line-through' : 'none',
                cursor: 'pointer'
              }}
            >
              {r.title}
            </span>
          </div>
          {r.relatedTo && (
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
              Link: <strong style={{ color: '#334155' }}>{r.relatedTo}</strong>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const sc = getStatusColorStyle(r.status);
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: sc.bg, border: `1px solid ${sc.border}`, padding: '3px 10px', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.dot }} />
            <span style={{ color: sc.text, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.status}</span>
          </div>
        );
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (r) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
          {r.category || 'General'}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => {
        const badge = getPriorityBadge(r.priority);
        return (
          <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 4 }}>
            {r.priority || 'Medium'}
          </span>
        );
      }
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (r) => {
        const isOverdue = r.dueDate < todayStr && r.status !== 'Completed';
        const isToday = r.dueDate === todayStr && r.status !== 'Completed';
        return (
          <span style={{ fontSize: 12.5, fontWeight: isOverdue || isToday ? 700 : 500, color: isOverdue ? '#dc2626' : isToday ? '#d97706' : '#475569' }}>
            {isOverdue ? '⚠️ ' : isToday ? '⏰ ' : ''}{r.dueDate}
          </span>
        );
      }
    },
    {
      key: 'assignedTo',
      label: 'Assignee',
      render: (r) => (
        <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>
          {r.assignedTo || 'Unassigned'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Quick WhatsApp */}
          <button
            type="button"
            onClick={() => handleWhatsAppAction(r)}
            style={{ padding: '6px 8px', backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 6, cursor: 'pointer' }}
            title="Send WhatsApp Follow-up"
          >
            <WhatsAppIcon size={14} color="#059669" />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => handleOpenEdit(r)}
            style={{ padding: '6px 8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
            title="Edit Task"
          >
            <EditIcon size={13} color="#475569" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(r.id, r.title)}
            style={{ padding: '6px 8px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer' }}
            title="Delete Task"
          >
            <TrashIcon size={13} color="#dc2626" />
          </button>
        </div>
      )
    }
  ];

  // Kanban Columns dynamically derived from taskStatuses
  const kanbanColumns = useMemo(() => {
    return taskStatuses.map(status => {
      const sc = getStatusColorStyle(status);
      return {
        id: status,
        label: status,
        color: sc.text,
        bg: sc.bg,
        border: sc.border,
        dot: sc.dot
      };
    });
  }, [taskStatuses]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary, #059669)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Loading tasks & action items...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-page-container animate-enter" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Page Header */}
        <div className="responsive-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Tasks &amp; Action Follow-ups <InfoTooltip text="Track lead follow-ups, site visit preparations, token receipts, and legal verification deadlines." />
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{data.length} tasks total</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredData.length} shown</span>
              {(filterTab !== 'all' || searchQuery) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--primary-text, var(--primary, #059669))', backgroundColor: 'var(--primary-light, #ecfdf5)', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>
                    Filtered: {[
                      filterTab !== 'all' ? ({ today: 'Due Today', overdue: 'Overdue', high: 'High Priority', completed: 'Completed' } as any)[filterTab] : null,
                      searchQuery ? `"${searchQuery}"` : null
                    ].filter(Boolean).join(' + ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setFilterTab('all'); setSearchQuery(''); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Clear filters
                  </button>
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Switcher: Board vs Table */}
            <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setViewMode('board')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: viewMode === 'board' ? 700 : 500,
                  backgroundColor: viewMode === 'board' ? '#ffffff' : 'transparent',
                  color: viewMode === 'board' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'board' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer'
                }}
              >
                📋 Kanban Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: viewMode === 'table' ? 700 : 500,
                  backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer'
                }}
              >
                📑 List Table
              </button>
            </div>

            <Button variant="primary" onClick={() => handleOpenAdd()}>
              + New Task
            </Button>
          </div>
        </div>

        {/* Task Velocity Cockpit */}
        <div className="dashboard-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Total Action Items</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{stats.total} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>tasks</span></div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: 4 }}>Due Today</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{stats.todayTasks} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>urgent</span></div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>Overdue Deadlines</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{stats.overdue} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>pending</span></div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>Execution Velocity</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{stats.completionRate}% <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>cleared</span></div>
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <FilterTabs
            tabs={[
              { id: 'all', label: 'All Tasks', count: tabCounts.all },
              { id: 'today', label: 'Due Today', count: tabCounts.today },
              { id: 'overdue', label: 'Overdue', count: tabCounts.overdue },
              { id: 'high', label: 'High Priority', count: tabCounts.high },
              { id: 'completed', label: 'Completed', count: tabCounts.completed }
            ]}
            activeTab={filterTab}
            onChange={(tabId) => setFilterTab(tabId as any)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 200 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks, clients, team..."
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: 20,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
                Sort:
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="due_date_asc">Due Date: Earliest First</option>
                <option value="due_date_desc">Due Date: Latest First</option>
                <option value="priority_desc">Priority: Urgent &amp; High First</option>
                <option value="title_asc">Task Title (A - Z)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Mode 1: Kanban Board */}
        {viewMode === 'board' ? (
          <div className="touch-scroll-container kanban-snap-container" style={{ display: 'flex', gap: 16, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 24 }}>
            {kanbanColumns.map((col, colIdx) => {
              const colTasks = filteredData.filter(t => {
                const tStatus = (t.status || '').trim().toLowerCase();
                const colId = col.id.trim().toLowerCase();
                if (tStatus === colId) return true;
                // If status is empty or not in taskStatuses list, place in first column
                if (colIdx === 0 && !taskStatuses.some(s => s.trim().toLowerCase() === tStatus)) {
                  return true;
                }
                return false;
              });

              return (
                <div
                  key={col.id}
                  className="kanban-snap-lane"
                  style={{
                    flex: '0 0 min(320px, 85vw)',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 220px)',
                    overflow: 'hidden'
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) handleMoveKanban(taskId, col.id);
                  }}
                >
                  {/* Column Header */}
                  {(() => {
                    const sc = getStatusColorStyle(col.id);
                    return (
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sc.dot }} />
                          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {col.label}
                          </h3>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: '2px 8px', borderRadius: 12 }}>
                          {colTasks.length}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Tasks List */}
                  <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {colTasks.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px 12px', color: '#94a3b8', fontSize: 13 }}>
                        No tasks in this lane
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const priorityBadge = getPriorityBadge(task.priority);
                        const isOverdue = task.dueDate < todayStr && task.status !== 'Completed';

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={e => {
                              e.dataTransfer.setData('text/plain', task.id);
                            }}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 10,
                              padding: '14px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease',
                              cursor: 'grab'
                            }}
                          >
                            {/* Card Top: Checkbox + Priority Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(task)}
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 4,
                                    border: task.status === 'Completed' ? 'none' : '1.5px solid #cbd5e1',
                                    backgroundColor: task.status === 'Completed' ? '#059669' : '#ffffff',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {task.status === 'Completed' && <CheckIcon size={12} color="#ffffff" strokeWidth={3} />}
                                </button>
                                <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: priorityBadge.bg, color: priorityBadge.text, border: `1px solid ${priorityBadge.border}`, padding: '1px 6px', borderRadius: 4 }}>
                                  {task.priority || 'Medium'}
                                </span>
                              </div>

                              <span style={{ fontSize: 11, color: '#64748b' }}>
                                {getCategoryIcon(task.category)} {task.category || 'Follow-up'}
                              </span>
                            </div>

                            {/* Title */}
                            <h4
                              onClick={() => handleOpenEdit(task)}
                              style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: task.status === 'Completed' ? '#94a3b8' : '#0f172a',
                                textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                                margin: '0 0 6px',
                                cursor: 'pointer'
                              }}
                            >
                              {task.title}
                            </h4>

                            {/* Related Entity */}
                            {task.relatedTo && (
                              <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginBottom: 8 }}>
                                🔗 {task.relatedTo}
                              </div>
                            )}

                            {/* Card Bottom: Due Date + Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 4 }}>
                              <span style={{ fontSize: 11.5, fontWeight: isOverdue ? 700 : 500, color: isOverdue ? '#dc2626' : '#64748b' }}>
                                📅 {task.dueDate}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => handleWhatsAppAction(task)}
                                  style={{ padding: '4px 6px', backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 4, cursor: 'pointer' }}
                                  title="WhatsApp Follow-up"
                                >
                                  <WhatsAppIcon size={12} color="#059669" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(task)}
                                  style={{ padding: '4px 6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                                  title="Edit"
                                >
                                  <EditIcon size={12} color="#475569" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(task.id, task.title)}
                                  style={{ padding: '4px 6px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 4, cursor: 'pointer' }}
                                  title="Delete"
                                >
                                  <TrashIcon size={12} color="#dc2626" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: Detailed List Table & Mobile Cards */
          <div style={{ paddingBottom: 30 }}>
            <div className="desktop-only-table">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                emptyMessage="No tasks found matching your filter criteria."
              />
            </div>

            <div className="mobile-only-cards">
              {filteredData.length === 0 ? (
                <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No tasks found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or search query.</div>
                </div>
              ) : (
                filteredData.map(task => {
                  const priorityBadge = getPriorityBadge(task.priority);
                  const isOverdue = task.dueDate < todayStr && task.status !== 'Completed';

                  return (
                    <div
                      key={`m-task-${task.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        padding: '14px 16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                    >
                      {/* Top Bar: Checkbox + Priority + Category */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(task)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: task.status === 'Completed' ? 'none' : '1.5px solid #cbd5e1',
                              backgroundColor: task.status === 'Completed' ? '#059669' : '#ffffff',
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {task.status === 'Completed' && <CheckIcon size={14} color="#ffffff" strokeWidth={3} />}
                          </button>
                          <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: priorityBadge.bg, color: priorityBadge.text, border: `1px solid ${priorityBadge.border}`, padding: '2px 8px', borderRadius: 4 }}>
                            {task.priority || 'Medium'}
                          </span>
                        </div>
                        <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
                          {getCategoryIcon(task.category)} {task.category || 'Follow-up'}
                        </span>
                      </div>

                      {/* Title & Notes */}
                      <div>
                        <h4
                          onClick={() => handleOpenEdit(task)}
                          style={{
                            fontSize: 14.5,
                            fontWeight: 700,
                            color: task.status === 'Completed' ? '#94a3b8' : '#0f172a',
                            textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                            margin: '0 0 4px',
                            cursor: 'pointer'
                          }}
                        >
                          {task.title}
                        </h4>
                        {task.relatedTo && (
                          <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>🔗</span>
                            <span>{task.relatedTo}</span>
                          </div>
                        )}
                      </div>

                      {/* Meta & Status Select */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 8,
                        fontSize: 12
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: isOverdue ? 700 : 500, color: isOverdue ? '#dc2626' : '#64748b' }}>
                            📅 {task.dueDate} {isOverdue && <span style={{ color: '#dc2626', fontWeight: 800 }}>• OVERDUE</span>}
                          </span>
                        </div>
                        <div>
                          {(() => {
                            const sc = getStatusColorStyle(task.status);
                            return (
                              <select
                                value={task.status}
                                onChange={(e) => handleMoveKanban(task.id, e.target.value)}
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  border: `1px solid ${sc.border}`,
                                  backgroundColor: sc.bg,
                                  color: sc.text,
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                {taskStatuses.map(st => {
                                  const optSc = getStatusColorStyle(st);
                                  return (
                                    <option key={st} value={st} style={{ backgroundColor: optSc.bg, color: optSc.text }}>
                                      {`● ${st}`}
                                    </option>
                                  );
                                })}
                              </select>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Touch Action Buttons Row (min 44px height for mobile) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppAction(task)}
                          title="WhatsApp Follow-up"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            minHeight: 44,
                            borderRadius: 8,
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: 'pointer'
                          }}
                        >
                          <WhatsAppIcon size={15} color="#059669" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(task)}
                          title="Edit Task"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            minHeight: 44,
                            borderRadius: 8,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: 'pointer'
                          }}
                        >
                          <EditIcon size={14} color="#475569" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id, task.title)}
                          title="Delete Task"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            minHeight: 44,
                            borderRadius: 8,
                            backgroundColor: '#fff1f2',
                            border: '1px solid #fecdd3',
                            color: '#dc2626',
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: 'pointer'
                          }}
                        >
                          <TrashIcon size={14} color="#dc2626" />
                          <span>Delete</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="responsive-modal animate-enter"
            style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingTask ? 'Edit Action Item' : 'Schedule Action Item & Follow-up'}
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                  Assign real estate checklists, site visit preparations, and escrow follow-ups
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6 }}
              >
                <XIcon size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
              {/* Task Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Task Title / Action Item *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Follow-up with Rohit Sharma after Bandra site visit"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                />
              </div>

              {/* Category, Priority & Status */}
              <div className="responsive-grid-3" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select Category...</option>
                    {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select Priority...</option>
                    {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Status</label>
                  {(() => {
                    const sc = form.status ? getStatusColorStyle(form.status) : null;
                    return (
                      <>
                        <select
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: sc ? `1.5px solid ${sc.border}` : '1px solid #cbd5e1',
                            borderRadius: 8,
                            fontSize: 13.5,
                            fontWeight: 700,
                            backgroundColor: sc ? sc.bg : '#ffffff',
                            color: sc ? sc.text : '#0f172a',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <option value="">Select Status...</option>
                          {taskStatuses.map(s => {
                            const optSc = getStatusColorStyle(s);
                            return (
                              <option key={s} value={s} style={{ backgroundColor: optSc.bg, color: optSc.text, fontWeight: 600 }}>
                                {`● ${s}`}
                              </option>
                            );
                          })}
                        </select>
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', padding: '6px 0 2px 0', width: '100%' }}>
                          {taskStatuses.map(s => {
                            const isSelected = form.status === s;
                            const optSc = getStatusColorStyle(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, status: s }))}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '4px 10px',
                                  borderRadius: 16,
                                  fontSize: 11.5,
                                  fontWeight: isSelected ? 700 : 500,
                                  backgroundColor: isSelected ? optSc.bg : '#ffffff',
                                  color: isSelected ? optSc.text : '#64748b',
                                  border: isSelected ? `1.5px solid ${optSc.border}` : '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: optSc.dot }} />
                                <span>{s}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Due Date with Quick Chips */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Due Date *</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: 'In 3 Days', days: 3 },
                    { label: 'Next Week', days: 7 }
                  ].map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + chip.days * 86400000).toISOString().split('T')[0];
                        setForm({ ...form, dueDate: d });
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <input
                  required
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                />
              </div>

              {/* Assignee & Link */}
              <div className="responsive-grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Assigned Team Member *</label>
                  <input
                    required
                    value={form.assignedTo}
                    onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Related Client / Deal</label>
                  <input
                    list="crm-tasks-list"
                    value={form.relatedTo}
                    onChange={e => {
                      const val = e.target.value;
                      const matched = crmOptions.find(o => o.value === val);
                      setForm({
                        ...form,
                        relatedTo: val,
                        phone: matched?.phone || form.phone
                      });
                    }}
                    placeholder="e.g. Client: Rohit Sharma"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                  <datalist id="crm-tasks-list">
                    {crmOptions.map((o, idx) => (
                      <option key={idx} value={o.value} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Client WhatsApp Phone */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Client Phone / WhatsApp (10 Digits for 1-Tap Messaging)
                </label>
                <PhoneInput
                  value={form.phone}
                  onChange={(full) => setForm({ ...form, phone: full })}
                  placeholder="98200 45678"
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Action Checklist &amp; Notes</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Key points, buyer questions, legal documents requested..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, resize: 'vertical' }}
                />
              </div>

              {/* Form Actions */}
              <div className="responsive-modal-footer form-sticky-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', marginTop: 16, backgroundColor: '#ffffff' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: 'var(--primary, #059669)', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingTask ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Share Modal */}
      {sharingTask && (() => {
        const t = sharingTask;
        const defaultMsg = `Hello! Following up regarding: *${t.title}*${t.relatedTo ? ` (${t.relatedTo})` : ''}\nDue Date: ${t.dueDate}\nStatus: ${t.status}\n\nPlease let me know when you're available for a quick discussion!`;

        return (
          <ShareModal
            isOpen={!!sharingTask}
            onClose={() => setSharingTask(null)}
            shareItem={{
              id: t.id,
              type: 'task',
              title: t.title,
              subtitle: `Due: ${t.dueDate} • Assigned: ${t.assignedTo} • Status: ${t.status}`,
              description: t.description || undefined,
              badge: t.category || t.status,
              recipientName: t.relatedTo || undefined,
              recipientPhone: t.phone || undefined,
              defaultMessage: defaultMsg
            }}
          />
        );
      })()}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={
          <span>
            Are you sure you want to delete task <strong>&quot;{taskToDelete?.title}&quot;</strong>?
          </span>
        }
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Toast Feedback */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
