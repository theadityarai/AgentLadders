'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { DEFAULT_LEAD_SOURCES, DEFAULT_CLIENT_STATUSES } from '@/lib/formatters';
import { isValid10DigitPhone, extract10DigitPhone, formatForWhatsApp } from '@/lib/phone-validation';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { getStatusColorStyle } from '@/lib/theme';
import { PhoneIcon, WhatsAppIcon, EditIcon, TrashIcon } from '@/components/icons/NavIcons';

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

export default function ClientsPage() {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [leadSources, setLeadSources] = useState<string[]>(DEFAULT_LEAD_SOURCES);
  const [clientStatuses, setClientStatuses] = useState<string[]>(DEFAULT_CLIENT_STATUSES);

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
  const [statusFilter, setStatusFilter] = useState('All');

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
          if (Array.isArray(parsed.clientStatuses) && parsed.clientStatuses.length > 0) setClientStatuses(parsed.clientStatuses);
        }
      } catch {}
    }

    // Refresh agency configs from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.agency) {
          if (Array.isArray(data.agency.leadSources) && data.agency.leadSources.length > 0) {
            setLeadSources(data.agency.leadSources);
          }
          if (Array.isArray(data.agency.clientStatuses) && data.agency.clientStatuses.length > 0) {
            setClientStatuses(data.agency.clientStatuses);
          }
        }
      })
      .catch(() => {});

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agentladders_agency_configs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.leadSources) && parsed.leadSources.length > 0) setLeadSources(parsed.leadSources);
          if (Array.isArray(parsed.clientStatuses) && parsed.clientStatuses.length > 0) setClientStatuses(parsed.clientStatuses);
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
    if (!form.name?.trim() || form.name.trim().length < 2) {
      showToast('error', 'Please enter a client name (at least 2 characters).', 'Name Required');
      return;
    }
    if (!isValid10DigitPhone(form.phone)) {
      showToast('error', 'Please enter a valid 10-digit mobile number.', 'Invalid Phone Number');
      return;
    }
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
    if (!editingClient.name?.trim() || editingClient.name.trim().length < 2) {
      showToast('error', 'Please enter a client name (at least 2 characters).', 'Name Required');
      return;
    }
    if (!isValid10DigitPhone(editingClient.phone)) {
      showToast('error', 'Please enter a valid 10-digit mobile number.', 'Invalid Phone Number');
      return;
    }
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
    const cleanPhone = formatForWhatsApp(phone, '91');
    const message = encodeURIComponent(`Hello ${name}, this is Marcus Vance following up regarding our curated property opportunities. Let me know when you'd like to schedule your next private viewing!`);
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        (item.preferredLocation && item.preferredLocation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [data, searchQuery, typeFilter, statusFilter]);

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
            {(() => {
              const sc = getStatusColorStyle(row.status || 'Active Search');
              return (
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: sc.bg,
                    color: sc.text,
                    border: `1px solid ${sc.border}`
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.dot }} />
                    {row.status || 'Active Search'}
                  </span>
                </div>
              );
            })()}
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
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...clientStatuses.map(s => ({ label: s, value: s }))
            ],
            onChange: setStatusFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('All');
          setStatusFilter('All');
        }}
      />

      {/* DATA TABLE & MOBILE CARDS */}
      <div style={{ paddingBottom: '24px' }}>
        <div className="desktop-only-table">
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="No clients found. Click '+ Add Client' or convert an inbound lead."
          />
        </div>

        <div className="mobile-only-cards">
          {filteredData.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No clients found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or search query.</div>
            </div>
          ) : (
            filteredData.map(c => {
              const sc = getStatusColorStyle(c.status || 'Active Search');
              const isInvestor = c.type === 'Investor / VIP';
              const isBuyer = c.type === 'Buyer';

              return (
                <div
                  key={`m-cli-${c.id}`}
                  onClick={() => handleOpenEdit(c)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer'
                  }}
                >
                  {/* Top Bar: Name, Avatar, Category Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        backgroundColor: isInvestor ? '#fef3c7' : isBuyer ? '#dbeafe' : '#ede9fe',
                        color: isInvestor ? '#92400e' : isBuyer ? '#1e40af' : '#6b21a8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 1, fontWeight: 500 }}>
                          {c.phone}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isInvestor ? '#fffbeb' : isBuyer ? '#eff6ff' : '#f5f3ff',
                        color: isInvestor ? '#92400e' : isBuyer ? '#1e40af' : '#6b21a8',
                        border: `1px solid ${isInvestor ? '#fde68a' : isBuyer ? '#bfdbfe' : '#ddd6fe'}`
                      }}>
                        {c.type || 'Buyer'}
                      </span>
                    </div>
                  </div>

                  {/* Status & Source Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: sc.bg,
                      color: sc.text,
                      border: `1px solid ${sc.border}`
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.dot }} />
                      {c.status || 'Active Search'}
                    </span>
                    {c.source && (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        📢 {c.source}
                      </span>
                    )}
                  </div>

                  {/* Requirement & Budget Box */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    fontSize: 12.5
                  }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.requirement || 'Requirement TBA'}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                        📍 {c.preferredLocation || 'Location TBA'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: 13.5 }}>
                        {c.budget || 'TBA'}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                        {c.assignedManager || 'Agent Assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  {c.notes && (
                    <div style={{ fontSize: 11.5, color: '#64748b', fontStyle: 'italic', backgroundColor: '#fafafa', padding: '6px 10px', borderRadius: 6, border: '1px dashed #e2e8f0' }}>
                      &ldquo;{c.notes}&rdquo;
                    </div>
                  )}

                  {/* Touch Action Buttons Row (min 44px height for mobile) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 44px', gap: 6, paddingTop: 4 }} onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => window.location.href = `tel:${c.phone}`}
                      title="Call Client"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        minHeight: 44,
                        borderRadius: 8,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <PhoneIcon size={14} color="#1d4ed8" />
                      <span>Call</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const cleanPhone = formatForWhatsApp(c.phone);
                        const msg = encodeURIComponent(`Hi ${c.name}, this is regarding your property search with our agency.`);
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                      }}
                      title="WhatsApp Client"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        minHeight: 44,
                        borderRadius: 8,
                        backgroundColor: '#ecfdf5',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <WhatsAppIcon size={14} color="#15803d" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      title="Edit Client"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        minHeight: 44,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <EditIcon size={14} color="#475569" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      title="Delete Client"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 44,
                        borderRadius: 8,
                        backgroundColor: '#fff1f2',
                        color: '#dc2626',
                        border: '1px solid #fecdd3',
                        cursor: 'pointer'
                      }}
                    >
                      <TrashIcon size={14} color="#dc2626" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: ADD CLIENT */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="responsive-modal-overlay"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Add Client</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Record verified real estate client and investment capacity</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                <div className="responsive-grid-2" style={{ gap: '14px' }}>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Phone / WhatsApp (10 Digits) *</label>
                    <PhoneInput
                      required
                      value={form.phone}
                      onChange={(full) => setForm({ ...form, phone: full })}
                      placeholder="98200 45678"
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {clientStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
              </div>

              <div className="responsive-modal-footer form-sticky-footer">
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
          className="responsive-modal-overlay"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Client: {editingClient.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update contact information, search criteria, and status</p>
              </div>
              <button onClick={() => setEditingClient(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateClient} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Phone / WhatsApp (10 Digits) *</label>
                    <PhoneInput
                      required
                      value={editingClient.phone}
                      onChange={(full) => setEditingClient({ ...editingClient, phone: full })}
                      placeholder="98200 45678"
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
                      {clientStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
              </div>

              <div className="responsive-modal-footer form-sticky-footer">
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
