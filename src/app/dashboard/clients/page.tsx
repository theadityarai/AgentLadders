'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { DEFAULT_LEAD_SOURCES } from '@/lib/formatters';

interface Client {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status?: string;
  source?: string;
  requirement?: string;
  budget?: string;
  preferredLocation?: string;
  preferredChannel?: string;
  assignedManager?: string;
  notes?: string;
}

const CLIENT_TYPES = ['Buyer', 'Seller / Landlord', 'Tenant', 'Investor / VIP'];
const CLIENT_STATUSES = ['Active Search', 'In Contract', 'Closed Client', 'Past Client'];

export default function ClientsPage() {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [leadSources, setLeadSources] = useState<string[]>(DEFAULT_LEAD_SOURCES);

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    type: 'Buyer',
    status: 'Active Search',
    source: 'WhatsApp Inbound',
    requirement: '',
    budget: '$1,500,000',
    preferredLocation: '',
    preferredChannel: 'WhatsApp',
    assignedManager: 'Marcus Vance',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal states
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      const json = await res.json();
      if (json.clients) setData(json.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();

    // Check localStorage agency configs for instant sync
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('agentladders_agency_configs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.leadSources) && parsed.leadSources.length > 0) setLeadSources(parsed.leadSources);
        }
      } catch {}
    }

    // Refresh agency configs from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.agency && Array.isArray(data.agency.leadSources) && data.agency.leadSources.length > 0) {
          setLeadSources(data.agency.leadSources);
        }
      })
      .catch(() => {});

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agentladders_agency_configs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.leadSources) && parsed.leadSources.length > 0) setLeadSources(parsed.leadSources);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (editingClient) setEditingClient(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, editingClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowModal(false);
        setForm(initialForm);
        loadClients();
        showToast('success', `Client "${form.name}" registered successfully!`, 'Client Added');
      } else {
        showToast('error', json.error || 'Failed to add client profile.', 'Save Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while adding client.', 'Network Error');
    }
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClient)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setData(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...editingClient } : c));
        setEditingClient(null);
        showToast('success', `Client profile for "${editingClient.name}" updated!`, 'Client Updated');
      } else {
        showToast('error', json.error || 'Failed to update client profile.', 'Update Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while updating client profile.', 'Network Error');
    }
  };

  const handleDelete = (id: string, name: string) => {
    setClientToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients?id=${clientToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(c => c.id !== clientToDelete.id));
        showToast('success', `Client profile for "${clientToDelete.name}" deleted.`, 'Client Deleted');
      } else {
        const json = await res.json().catch(() => ({}));
        showToast('error', json.error || 'Failed to delete client.', 'Delete Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while deleting client.', 'Network Error');
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  // WhatsApp click handler
  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${name}, this is Marcus Vance following up regarding our curated property opportunities. Let me know when you'd like to schedule your next private viewing!`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank');
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        (item.preferredLocation && item.preferredLocation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  const columns: Column<Client>[] = [
    {
      header: 'Client & Communications',
      accessor: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.name}</span>
            {((row as any).isSelfCreated || (row.source || '').toLowerCase().includes('self-') || (row.type || '').toLowerCase().includes('self-')) && (
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, backgroundColor: '#fdf4ff', color: '#a21caf', border: '1px solid #f0abfc', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                ✨ User-Created (Self-Interest)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{row.phone}</span>
            {row.phone && (
              <button
                type="button"
                onClick={() => openWhatsApp(row.phone, row.name)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Chat directly on WhatsApp"
              >
                💬 WhatsApp
              </button>
            )}
          </div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Category & Status',
      accessor: (row) => {
        const isBuyer = row.type?.includes('Buyer');
        const isInvestor = row.type?.includes('Investor');
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: isInvestor ? '#fef3c7' : isBuyer ? '#eff6ff' : '#f5f3ff',
                color: isInvestor ? '#b45309' : isBuyer ? '#1d4ed8' : '#6d28d9',
                border: `1px solid ${isInvestor ? '#fde68a' : isBuyer ? '#bfdbfe' : '#ddd6fe'}`
              }}>
                {row.type || 'Buyer'}
              </span>
              {row.source && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '5px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0'
                }}>
                  📢 {row.source}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
              ● {row.status || 'Active Search'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Budget / Portfolio',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
            {row.budget || '$1,500,000'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
            Agent: {row.assignedManager || 'Marcus Vance'}
          </div>
        </div>
      )
    },
    {
      header: 'Search Criteria & Notes',
      accessor: (row) => (
        <div style={{ maxWidth: '240px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
            {row.requirement || '3-4 Bed Luxury Residence'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            📍 {row.preferredLocation || 'Prime District'}
          </div>
          {row.notes && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
              &ldquo;{row.notes}&rdquo;
            </div>
          )}
        </div>
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
            onClick={() => handleDelete(row.id, row.name)}
            style={{ color: '#ef4444', fontSize: '12px', padding: '3px 6px' }}
          >
            🗑️
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <PageHeader
        title="Clients Directory"
        subtitle="Verified property buyers, landlords, tenants, high-net-worth investors, and VIP clients"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Add Client
          </Button>
        }
      />

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search clients by name, phone, email, or area..."
        filters={[
          {
            key: 'type',
            label: 'Category',
            value: typeFilter,
            options: [
              { label: 'All Categories', value: 'All' },
              ...CLIENT_TYPES.map(t => ({ label: t, value: t }))
            ],
            onChange: setTypeFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('All');
        }}
      />

      {/* DATA TABLE */}
      <div style={{ paddingBottom: '24px' }}>
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          emptyMessage="No clients found. Click '+ Add Client' or convert an inbound lead."
        />
      </div>

      {/* MODAL: ADD CLIENT */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              padding: 0
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Add Client</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Record verified real estate client and investment capacity</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="responsive-grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singhania"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 99887 76655"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. vikram@investments.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client Category</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Budget / Net Worth</label>
                  <input
                    type="text"
                    placeholder="e.g. $2,500,000"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Lead & Inbound Source</label>
                  <select
                    value={form.source || 'WhatsApp Inbound'}
                    onChange={e => setForm({ ...form, source: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Specific Requirements & Preferred Locations</label>
                  <input
                    type="text"
                    placeholder="e.g. Looking for sea-view 4 BHK or penthouse in Jumeirah"
                    value={form.requirement}
                    onChange={e => setForm({ ...form, requirement: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client Preferences & Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Prefers viewings on weekends. Cash purchase, no mortgage required."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Client</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLIENT */}
      {editingClient && (
        <div 
          onClick={() => setEditingClient(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              padding: 0
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Client: {editingClient.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update contact information, search criteria, and status</p>
              </div>
              <button onClick={() => setEditingClient(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateClient} style={{ padding: '24px' }}>
              <div className="responsive-grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client Name</label>
                  <input
                    type="text"
                    required
                    value={editingClient.name}
                    onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={editingClient.phone}
                    onChange={e => setEditingClient({ ...editingClient, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Category</label>
                  <select
                    value={editingClient.type}
                    onChange={e => setEditingClient({ ...editingClient, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Status</label>
                  <select
                    value={editingClient.status || 'Active Search'}
                    onChange={e => setEditingClient({ ...editingClient, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {CLIENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Lead & Inbound Source</label>
                  <select
                    value={editingClient.source || 'WhatsApp Inbound'}
                    onChange={e => setEditingClient({ ...editingClient, source: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Requirements & Locations</label>
                  <input
                    type="text"
                    value={editingClient.requirement || ''}
                    onChange={e => setEditingClient({ ...editingClient, requirement: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Notes</label>
                  <textarea
                    rows={3}
                    value={editingClient.notes || ''}
                    onChange={e => setEditingClient({ ...editingClient, notes: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setEditingClient(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!clientToDelete}
        title="Delete Client"
        message={`Are you sure you want to permanently delete "${clientToDelete?.name}"?`}
        confirmText="Delete Client"
        danger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientToDelete(null)}
      />

      {/* Global Action Feedback Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
