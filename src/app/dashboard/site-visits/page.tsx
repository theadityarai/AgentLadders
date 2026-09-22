'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface SiteVisit {
  [key: string]: unknown;
  id: string;
  property: string;
  client: string;
  clientPhone?: string;
  date: string;
  timeSlot?: string;
  accompaniedBy?: string;
  status: string;
  interestLevel?: string;
  actionRequired?: string;
  notes?: string;
}

const VISIT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
const INTEREST_LEVELS = [
  'Extremely Interested 🔥',
  'Considering / Needs 2nd Viewing',
  'Price Negotiation Expected',
  'Not Interested'
];

export default function SiteVisitsPage() {
  const [data, setData] = useState<SiteVisit[]>([]);
  const [properties, setProperties] = useState<{ id: string; title: string; location: string }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const initialForm = {
    property: '',
    client: '',
    clientPhone: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    accompaniedBy: 'Marcus Vance',
    status: 'Scheduled',
    interestLevel: 'Extremely Interested 🔥',
    actionRequired: 'Send draft offer & floorplan',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [visitToDelete, setVisitToDelete] = useState<{ id: string; property: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [visitsRes, propsRes, clientsRes] = await Promise.all([
        fetch('/api/site-visits'),
        fetch('/api/properties'),
        fetch('/api/clients')
      ]);

      const visitsJson = await visitsRes.json();
      const propsJson = await propsRes.json();
      const clientsJson = await clientsRes.json();

      if (visitsJson.siteVisits) setData(visitsJson.siteVisits);
      if (propsJson.properties) setProperties(propsJson.properties);
      if (clientsJson.clients) setClients(clientsJson.clients);
    } catch (err) {
      console.error('Failed to load visits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClientSelect = (cName: string) => {
    const selected = clients.find(c => c.name === cName);
    setForm(prev => ({
      ...prev,
      client: cName,
      clientPhone: selected ? selected.phone : prev.clientPhone
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/site-visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadData();
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
      setData(prev => prev.map(v => v.id === editingVisit.id ? { ...v, ...editingVisit } : v));
      setEditingVisit(null);
    }
  };

  const handleQuickStatusChange = async (visitId: string, newStatus: string) => {
    setData(prev => prev.map(v => v.id === visitId ? { ...v, status: newStatus } : v));
    await fetch('/api/site-visits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: visitId, status: newStatus })
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

  // WhatsApp confirmation
  const sendWhatsAppConfirmation = (visit: SiteVisit) => {
    const phone = (visit.clientPhone || '9876543210').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hi ${visit.client}, this is Marcus from the agency confirming your upcoming private viewing of "${visit.property}" on ${visit.date} at ${visit.timeSlot || '11:00 AM'}. Please reply to confirm!`);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const columns: Column<SiteVisit>[] = [
    {
      header: 'Property Inspection',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.property}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            📅 {row.date} &bull; ⏰ {row.timeSlot || '11:00 AM'}
          </div>
        </div>
      )
    },
    {
      header: 'Client & Showing Confirmation',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13.5px' }}>{row.client}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => sendWhatsAppConfirmation(row)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Send WhatsApp confirmation to client"
            >
              💬 Confirm WhatsApp
            </button>
          </div>
        </div>
      )
    },
    {
      header: 'Buyer Interest & Feedback',
      accessor: (row) => (
        <div>
          <span style={{
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: row.interestLevel?.includes('Interested') ? '#ecfdf5' : '#eff6ff',
            color: row.interestLevel?.includes('Interested') ? '#047857' : '#1d4ed8',
            border: `1px solid ${row.interestLevel?.includes('Interested') ? '#a7f3d0' : '#bfdbfe'}`
          }}>
            {row.interestLevel || 'Considering / Neutral'}
          </span>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
            Next: {row.actionRequired || 'Follow up with comparable options'}
          </div>
        </div>
      )
    },
    {
      header: 'Tour Status',
      accessor: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleQuickStatusChange(row.id, e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: row.status === 'Completed' ? '#ecfdf5' : row.status === 'Cancelled' ? '#fef2f2' : '#ffffff',
            color: row.status === 'Completed' ? '#047857' : row.status === 'Cancelled' ? '#b91c1c' : '#1e293b',
            cursor: 'pointer'
          }}
        >
          {VISIT_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            style={{ fontSize: '11.5px', padding: '3px 8px' }}
          >
            ✏️ Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.property)}
            style={{ color: '#ef4444', fontSize: '12px', padding: '3px 6px' }}
          >
            🗑️
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Site Visits & Showings"
        subtitle="Coordinate private on-site property viewings, WhatsApp reminders, and buyer feedback"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Schedule Viewing
          </Button>
        }
      />

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search showings by property or client..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...VISIT_STATUSES.map(s => ({ label: s, value: s }))
            ],
            onChange: setStatusFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('All');
        }}
      />

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No showings scheduled. Click '+ Schedule Viewing' to arrange a property tour."
      />

      {/* MODAL: SCHEDULE VISIT */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Schedule Property Showing</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Coordinate client inspection with showing agent</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property *</label>
                  <select
                    required
                    value={form.property}
                    onChange={e => setForm({ ...form, property: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="">-- Select Property --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.title}>{p.title} ({p.location})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client *</label>
                  <select
                    required
                    value={form.client}
                    onChange={e => handleClientSelect(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Time Slot</label>
                  <select
                    value={form.timeSlot}
                    onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>01:30 PM</option>
                    <option>03:00 PM</option>
                    <option>04:30 PM</option>
                    <option>06:00 PM (Sunset Viewing)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Showing Agent</label>
                  <input
                    type="text"
                    value={form.accompaniedBy}
                    onChange={e => setForm({ ...form, accompaniedBy: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Expected Interest</label>
                  <select
                    value={form.interestLevel}
                    onChange={e => setForm({ ...form, interestLevel: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {INTEREST_LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Post-Viewing Action Item</label>
                  <input
                    type="text"
                    placeholder="e.g. Prepare purchase offer draft / Send floorplans to architect"
                    value={form.actionRequired}
                    onChange={e => setForm({ ...form, actionRequired: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Schedule Showing</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT VISIT */}
      {editingVisit && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Update Showing Details</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Log buyer feedback, rating, and next actions</p>
              </div>
              <button onClick={() => setEditingVisit(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateVisit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property</label>
                  <input
                    type="text"
                    value={editingVisit.property}
                    onChange={e => setEditingVisit({ ...editingVisit, property: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client</label>
                  <input
                    type="text"
                    value={editingVisit.client}
                    onChange={e => setEditingVisit({ ...editingVisit, client: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Date</label>
                  <input
                    type="date"
                    value={editingVisit.date}
                    onChange={e => setEditingVisit({ ...editingVisit, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Time Slot</label>
                  <input
                    type="text"
                    value={editingVisit.timeSlot || ''}
                    onChange={e => setEditingVisit({ ...editingVisit, timeSlot: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Buyer Interest Level</label>
                  <select
                    value={editingVisit.interestLevel || 'Extremely Interested 🔥'}
                    onChange={e => setEditingVisit({ ...editingVisit, interestLevel: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {INTEREST_LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Showing Status</label>
                  <select
                    value={editingVisit.status}
                    onChange={e => setEditingVisit({ ...editingVisit, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {VISIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Action Required / Client Feedback</label>
                  <textarea
                    rows={3}
                    value={editingVisit.actionRequired || editingVisit.notes || ''}
                    onChange={e => setEditingVisit({ ...editingVisit, actionRequired: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setEditingVisit(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!visitToDelete}
        title="Delete Showing"
        message={`Are you sure you want to cancel and remove the showing for "${visitToDelete?.property}"?`}
        confirmText="Delete Showing"
        danger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVisitToDelete(null)}
      />
    </>
  );
}
