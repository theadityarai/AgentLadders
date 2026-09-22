'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface SiteVisit {
  [key: string]: unknown;
  id: string;
  property: string;
  client: string;
  date: string;
  timeSlot?: string;
  accompaniedBy?: string;
  status: string;
  feedback?: string;
  notes?: string;
}

const VISIT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];

export default function SiteVisitsPage() {
  const [data, setData] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const initialForm = {
    property: '',
    client: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    accompaniedBy: 'Marcus Vance',
    status: 'Scheduled',
    feedback: '',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [visitToDelete, setVisitToDelete] = useState<{ id: string; property: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-visits');
      const json = await res.json();
      if (json.siteVisits) setData(json.siteVisits);
    } catch (err) {
      console.error('Failed to load visits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/site-visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadVisits();
  };

  const handleOpenEdit = (visit: SiteVisit) => {
    setEditingVisit(visit);
  };

  const handleUpdateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit) return;
    const res = await fetch('/api/site-visits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingVisit)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(v => v.id === editingVisit.id ? json.visit : v));
      setEditingVisit(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setData(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    await fetch('/api/site-visits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
  };

  const handleDelete = (id: string, property: string) => {
    setVisitToDelete({ id, property });
  };

  const handleConfirmDelete = async () => {
    if (!visitToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/site-visits?id=${visitToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(v => v.id !== visitToDelete.id));
    }
    setIsDeleting(false);
    setVisitToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(visit => {
      const matchesSearch = 
        !searchQuery.trim() ||
        visit.property?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.client?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || visit.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  const columns: Column<SiteVisit>[] = [
    { 
      key: 'date', 
      label: 'Scheduled Date & Time',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>🗓️ {r.date}</span>
          <div style={{ fontSize: '12px', color: '#64748b' }}>🕒 {r.timeSlot || '11:00 AM'}</div>
        </div>
      )
    },
    { 
      key: 'property', 
      label: 'Property', 
      render: (r) => <span style={{ fontWeight: 600, color: '#1e293b' }}>🏡 {r.property}</span> 
    },
    { 
      key: 'client', 
      label: 'Client & Broker',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>👤 {r.client}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Host: {r.accompaniedBy || 'Marcus Vance'}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: r.status === 'Completed' ? '#dcfce7' : r.status === 'Cancelled' ? '#fee2e2' : '#eff6ff',
            color: r.status === 'Completed' ? '#166534' : r.status === 'Cancelled' ? '#991b1b' : '#1d4ed8',
            cursor: 'pointer'
          }}
        >
          {VISIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              color: '#1d4ed8'
            }}
            title="Edit Visit"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(r.id, r.property)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e11d48'
            }}
            title="Cancel & Delete Visit"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Site Visits & Showings" 
        subtitle="Schedule property viewings, log attendee feedback, and manage showings calendar" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Schedule Visit</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search visits by property or client name..."
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
              { label: 'All Statuses', value: 'All' },
              ...VISIT_STATUSES.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE VISIT MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '540px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Schedule Site Visit</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Title *</label>
                <input
                  required
                  placeholder="e.g. Palm Jumeirah Signature Villa"
                  value={form.property}
                  onChange={e => setForm({ ...form, property: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Prospective Client *</label>
                <input
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={form.client}
                  onChange={e => setForm({ ...form, client: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Time Slot *</label>
                  <input
                    required
                    placeholder="11:00 AM"
                    value={form.timeSlot}
                    onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Hosting Broker</label>
                  <input
                    value={form.accompaniedBy}
                    onChange={e => setForm({ ...form, accompaniedBy: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {VISIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Notes & Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Gate security code, client interest specifics..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Schedule Visit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VISIT MODAL */}
      {editingVisit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '540px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Showing</h3>
            <form onSubmit={handleUpdateVisit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Title *</label>
                <input
                  required
                  value={editingVisit.property || ''}
                  onChange={e => setEditingVisit({ ...editingVisit, property: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Prospective Client *</label>
                <input
                  required
                  value={editingVisit.client || ''}
                  onChange={e => setEditingVisit({ ...editingVisit, client: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Date *</label>
                  <input
                    required
                    type="date"
                    value={editingVisit.date || ''}
                    onChange={e => setEditingVisit({ ...editingVisit, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Time Slot *</label>
                  <input
                    required
                    value={editingVisit.timeSlot || ''}
                    onChange={e => setEditingVisit({ ...editingVisit, timeSlot: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Hosting Broker</label>
                  <input
                    value={editingVisit.accompaniedBy || ''}
                    onChange={e => setEditingVisit({ ...editingVisit, accompaniedBy: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingVisit.status}
                    onChange={e => setEditingVisit({ ...editingVisit, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {VISIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Attendee Feedback & Notes</label>
                <textarea
                  rows={2}
                  value={editingVisit.feedback || editingVisit.notes || ''}
                  onChange={e => setEditingVisit({ ...editingVisit, feedback: e.target.value, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingVisit(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM CANCEL / DELETE MODAL */}
      <ConfirmModal
        isOpen={!!visitToDelete}
        title="Cancel Site Visit"
        message={
          <>
            Are you sure you want to cancel and remove the scheduled walkthrough for <strong>&ldquo;{visitToDelete?.property}&rdquo;</strong>?
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Confirm Cancellation'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVisitToDelete(null)}
      />
    </>
  );
}
