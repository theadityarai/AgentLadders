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
  status: string;
}

export default function SiteVisitsPage() {
  const [data, setData] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
      label: 'Scheduled Date',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          🗓️ {r.date}
        </span>
      )
    },
    { 
      key: 'property', 
      label: 'Property',
      render: (r) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.property}</span>
    },
    { key: 'client', label: 'Prospective Client' },
    { key: 'status', label: 'Visit Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
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
          title="Delete Visit"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Site Visits & Property Viewings" 
        subtitle="Schedule and track on-site walkthroughs with buyers and tenants" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Schedule Visit</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search site visits by property name or client..."
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
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading visits...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No site visits matched your filters"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Schedule Property Showing</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Coordinate on-site client walkthroughs, agent escorts, and capture feedback</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Property Asset / Address *</label>
                  <input required value={form.property} onChange={e => setForm({...form, property: e.target.value})} placeholder="e.g. Luxury Villa in Beverly Hills" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Client / Buyer Full Name *</label>
                  <input required value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="e.g. Jonathan Reynolds" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Walkthrough Date *</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Time Slot</label>
                  <select value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>09:30 AM</option>
                    <option>11:00 AM</option>
                    <option>01:30 PM</option>
                    <option>03:00 PM</option>
                    <option>05:00 PM (Sunset Viewing)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Showing Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Scheduled</option>
                    <option>Confirmed</option>
                    <option>Completed</option>
                    <option>Rescheduled</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Escorting Agent / Broker</label>
                  <input value={form.accompaniedBy} onChange={e => setForm({...form, accompaniedBy: e.target.value})} placeholder="e.g. Marcus Vance" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Initial Client Impression / Outcome</label>
                  <select value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option value="">Awaiting Showing</option>
                    <option value="Very Interested - Preparing Offer">Very Interested - Preparing Offer</option>
                    <option value="Liked Layout - Considering Price">Liked Layout - Considering Price</option>
                    <option value="Requested 2nd Showing with Family">Requested 2nd Showing with Family</option>
                    <option value="Not Interested - Location Mismatch">Not Interested - Location Mismatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Visit Notes & Access Instructions</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Lockbox code, security gate check-in, owner notification status..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Confirm Visit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!visitToDelete}
        title="Cancel Site Visit"
        message={
          <>
            Are you sure you want to cancel and remove the scheduled walkthrough for <strong>&ldquo;{visitToDelete?.property}&rdquo;</strong>?
          </>
        }
        confirmText="Remove Visit"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVisitToDelete(null)}
      />
    </>
  );
}
