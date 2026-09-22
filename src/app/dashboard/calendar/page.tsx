'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface CalendarEvent {
  [key: string]: unknown;
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  location?: string;
  attendees?: string;
  notes?: string;
}

const EVENT_TYPES = ['Viewing', 'Meeting', 'Closing', 'Internal Training', 'Inspection'];

const initialForm = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00 AM',
  type: 'Viewing',
  location: '',
  attendees: '',
  notes: ''
};

export default function CalendarPage() {
  const [data, setData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const json = await res.json();
      if (json.calendarEvents) setData(json.calendarEvents);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadEvents();
  };

  const handleOpenEdit = (evt: CalendarEvent) => {
    setEditingEvent(evt);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const res = await fetch('/api/calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEvent)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(c => c.id === editingEvent.id ? json.event : c));
      setEditingEvent(null);
    }
  };

  const handleDelete = (id: string, title: string) => {
    setEventToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/calendar?id=${eventToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(c => c.id !== eventToDelete.id));
    }
    setIsDeleting(false);
    setEventToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(evt => {
      const matchesSearch = 
        !searchQuery.trim() ||
        evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.attendees?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.date?.includes(searchQuery);
      
      const matchesType = typeFilter === 'All' || evt.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
  };

  const columns: Column<CalendarEvent>[] = [
    { 
      key: 'date', 
      label: 'Scheduled Date',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          📅 {r.date}
        </span>
      )
    },
    { key: 'time', label: 'Time Slot' },
    { 
      key: 'title', 
      label: 'Event Title',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.title}</span>
          {r.notes && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {r.notes}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'location', 
      label: 'Location / Venue',
      render: (r) => r.location ? (
        <span style={{ fontSize: '13px', color: '#334155' }}>📍 {r.location}</span>
      ) : (
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Agency Office</span>
      )
    },
    { 
      key: 'attendees', 
      label: 'Attendees',
      render: (r) => r.attendees ? (
        <span style={{ fontSize: '13px', color: '#334155' }}>👥 {r.attendees}</span>
      ) : (
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Internal</span>
      )
    },
    { 
      key: 'type', 
      label: 'Event Type',
      render: (r) => (
        <span style={{
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: r.type === 'Viewing' ? '#eff6ff' : r.type === 'Meeting' ? '#f0fdf4' : '#fef3c7',
          color: r.type === 'Viewing' ? '#1d4ed8' : r.type === 'Meeting' ? '#15803d' : '#b45309'
        }}>
          {r.type}
        </span>
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
            title="Edit Event"
          >
            ✏️ Edit
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
              color: '#e11d48'
            }}
            title="Cancel Event"
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
        title="Schedule & Calendar" 
        subtitle="Manage showing appointments, client walkthroughs, and team meetings" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Schedule Event</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search events by title, venue, or attendees..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'type',
            label: 'Event Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'All' },
              ...EVENT_TYPES.map(t => ({ label: t, value: t }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE EVENT MODAL */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Schedule Calendar Event</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Event Title *</label>
                <input
                  required
                  placeholder="e.g. VIP Showing: Downtown Penthouse"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
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
                    placeholder="10:00 AM"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Event Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Location / Venue</label>
                  <input
                    placeholder="e.g. Burj Khalifa Suite 80"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Attendees</label>
                <input
                  placeholder="e.g. Marcus Vance, John Doe, Client Legal Advisor"
                  value={form.attendees}
                  onChange={e => setForm({ ...form, attendees: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Meeting agenda, key talking points..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Schedule Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Event: {editingEvent.title}</h3>
            <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Event Title *</label>
                <input
                  required
                  value={editingEvent.title || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Date *</label>
                  <input
                    required
                    type="date"
                    value={editingEvent.date || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Time Slot *</label>
                  <input
                    required
                    value={editingEvent.time || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Event Type</label>
                  <select
                    value={editingEvent.type}
                    onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Location / Venue</label>
                  <input
                    value={editingEvent.location || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Attendees</label>
                <input
                  value={editingEvent.attendees || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, attendees: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Notes</label>
                <textarea
                  rows={2}
                  value={editingEvent.notes || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingEvent(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!eventToDelete}
        title="Cancel Calendar Event"
        message={
          <>
            Are you sure you want to cancel the event <strong>&ldquo;{eventToDelete?.title}&rdquo;</strong>?
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Cancel Event'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </>
  );
}
