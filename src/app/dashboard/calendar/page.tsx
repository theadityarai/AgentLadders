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

const initialForm = {
  title: '',
  date: '',
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
          title="Delete Event"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Agency Calendar" 
        subtitle="Schedule property viewings, contract signings, and client meetings" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Event</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search calendar events by title, location, or attendee..."
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
              { label: 'Viewing', value: 'Viewing' },
              { label: 'Meeting', value: 'Meeting' },
              { label: 'Call', value: 'Call' },
              { label: 'Reminder', value: 'Reminder' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading calendar...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No calendar events match your filters"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, #f8fafc, #ffffff)'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  📅 Schedule Calendar Event
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Organize showings, investor calls, and closing sessions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Event Title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. VIP Penthouse Showing & Escrow Consultation"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Event Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Time Slot *
                  </label>
                  <input
                    required
                    value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                    placeholder="e.g. 10:00 AM - 11:30 AM"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Event Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Viewing">Property Viewing</option>
                    <option value="Meeting">Client / Owner Meeting</option>
                    <option value="Call">Conference / Video Call</option>
                    <option value="Reminder">Action Item Reminder</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Venue / Meeting URL
                  </label>
                  <input
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                    placeholder="e.g. Unit 402 or Google Meet link"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Participants & Attendees
                  </label>
                  <input
                    value={form.attendees}
                    onChange={e => setForm({...form, attendees: e.target.value})}
                    placeholder="e.g. Sarah Jenkins (Client), Michael Torres (Broker)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Agenda & Special Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Key discussion points, gate access code, or documents to review..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!eventToDelete}
        title="Remove Calendar Event"
        message={
          <>
            Are you sure you want to remove event <strong>&ldquo;{eventToDelete?.title}&rdquo;</strong> from your schedule? 
            Any associated agent reminders will be cancelled.
          </>
        }
        confirmText="Remove Event"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </>
  );
}
