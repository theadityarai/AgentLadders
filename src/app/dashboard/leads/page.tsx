'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Lead {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  leadPurpose?: 'Buy' | 'Rent';
  propertyTypeNeeded?: string;
  bedroomsNeeded?: string;
  budget?: number | string;
  budgetMin?: number | string;
  budgetMax?: number | string;
  financingStatus?: string;
  urgency?: string;
  locationPreference?: string;
  priority?: string;
  assignedTo?: string;
  nextFollowUp?: string;
  notes?: string;
}

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Site Visit Done', 'Won', 'Lost'];

export default function LeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertFeedback, setConvertFeedback] = useState<string | null>(null);

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    leadPurpose: 'Buy',
    propertyTypeNeeded: 'Apartment',
    bedroomsNeeded: '3 BHK',
    budgetMin: '',
    budgetMax: '',
    financingStatus: 'Pre-Approved Mortgage',
    urgency: '1 - 2 Months',
    locationPreference: '',
    source: 'Website',
    status: 'New',
    priority: 'Hot 🔥',
    assignedTo: 'Marcus Vance',
    nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.leads) setData(json.leads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadLeads();
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    const res = await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingLead)
    });
    if (res.ok) {
      setData(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...editingLead } : l));
      setEditingLead(null);
    }
  };

  const handleQuickStatusChange = async (leadId: string, newStatus: string) => {
    setData(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, status: newStatus })
    });
  };

  const handleConvertToClient = async (lead: Lead) => {
    try {
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          type: lead.leadPurpose === 'Rent' ? 'Tenant' : 'Buyer',
          requirement: `${lead.bedroomsNeeded || ''} ${lead.propertyTypeNeeded || ''} in ${lead.locationPreference || 'Prime Location'}`,
          budget: lead.budgetMax ? `$${Number(lead.budgetMax).toLocaleString()}` : '$1M - $2M',
          notes: `Converted from lead. Financing: ${lead.financingStatus || 'N/A'}. Urgency: ${lead.urgency || 'N/A'}`
        })
      });

      if (clientRes.ok) {
        await handleQuickStatusChange(lead.id, 'Won');
        setConvertFeedback(`✓ Successfully converted "${lead.name}" to Active Client!`);
        setTimeout(() => setConvertFeedback(null), 4000);
      }
    } catch (e) {
      console.error('Failed to convert lead:', e);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setLeadToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/leads?id=${leadToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(l => l.id !== leadToDelete.id));
    }
    setIsDeleting(false);
    setLeadToDelete(null);
  };

  // WhatsApp click handler
  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${name}, this is Marcus from the agency following up on your property requirement. Are you available for a brief call?`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`, '_blank');
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        (item.locationPreference && item.locationPreference.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPurpose = purposeFilter === 'All' || item.leadPurpose === purposeFilter;
      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPurpose && matchesStatus;
    });
  }, [data, searchQuery, purposeFilter, statusFilter]);

  const columns: Column<Lead>[] = [
    {
      header: 'Lead Contact',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{row.phone || 'No phone'}</span>
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
                title="Open WhatsApp chat with client"
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
      header: 'Requirement & Unit',
      accessor: (row) => {
        const isRent = row.leadPurpose === 'Rent';
        return (
          <div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: isRent ? '#f3e8ff' : '#ecfdf5',
                color: isRent ? '#7e22ce' : '#047857',
                border: `1px solid ${isRent ? '#d8b4fe' : '#a7f3d0'}`
              }}>
                {row.leadPurpose || 'Buy'}
              </span>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                {row.bedroomsNeeded || '3 BHK'} {row.propertyTypeNeeded || 'Apartment'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              📍 {row.locationPreference || 'Prime Area / Downtown'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Budget & Financing',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
            {row.budgetMax ? `$${Number(row.budgetMax).toLocaleString()}` : (row.budget ? String(row.budget) : '$1,500,000')}
          </div>
          <span style={{
            fontSize: '11px',
            color: '#1e40af',
            backgroundColor: '#eff6ff',
            padding: '2px 6px',
            borderRadius: '4px',
            marginTop: '3px',
            display: 'inline-block'
          }}>
            {row.financingStatus || 'Mortgage Approved'}
          </span>
        </div>
      )
    },
    {
      header: 'Urgency & Priority',
      accessor: (row) => (
        <div>
          <span style={{
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '9999px',
            backgroundColor: row.priority?.includes('Hot') ? '#fef2f2' : '#f8fafc',
            color: row.priority?.includes('Hot') ? '#dc2626' : '#475569',
            border: `1px solid ${row.priority?.includes('Hot') ? '#fecaca' : '#cbd5e1'}`
          }}>
            {row.priority || 'Hot 🔥'}
          </span>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            ⏱ {row.urgency || '1 - 2 Months'}
          </div>
        </div>
      )
    },
    {
      header: 'Stage Status',
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
            backgroundColor: row.status === 'Won' ? '#ecfdf5' : row.status === 'Lost' ? '#fef2f2' : '#ffffff',
            color: row.status === 'Won' ? '#047857' : row.status === 'Lost' ? '#b91c1c' : '#1e293b',
            cursor: 'pointer'
          }}
        >
          {LEAD_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {row.status !== 'Won' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConvertToClient(row)}
              style={{ fontSize: '11.5px', color: '#16a34a', borderColor: '#86efac', padding: '3px 8px' }}
              title="Promote lead to verified client"
            >
              👤 Client
            </Button>
          )}

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
    <>
      <PageHeader
        title="Leads Pipeline"
        subtitle="Inbound real estate inquiries, WhatsApp communications, and buyer qualification"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Inbound Lead
          </Button>
        }
      />

      {convertFeedback && (
        <div style={{
          margin: '0 24px 16px',
          padding: '12px 18px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '13.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {convertFeedback}
        </div>
      )}

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leads by name, phone, email, or area..."
        filters={[
          {
            key: 'purpose',
            label: 'Purpose',
            value: purposeFilter,
            options: [
              { label: 'All (Buy & Rent)', value: 'All' },
              { label: 'Looking to Buy', value: 'Buy' },
              { label: 'Looking to Rent', value: 'Rent' }
            ],
            onChange: setPurposeFilter
          },
          {
            key: 'status',
            label: 'Stage',
            value: statusFilter,
            options: [
              { label: 'All Stages', value: 'All' },
              ...LEAD_STATUSES.map(s => ({ label: s, value: s }))
            ],
            onChange: setStatusFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setPurposeFilter('All');
          setStatusFilter('All');
        }}
      />

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No leads found. Click '+ New Inbound Lead' to record a new buyer inquiry."
      />

      {/* MODAL: CREATE LEAD */}
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
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Capture Inbound Lead</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Structured real estate buyer & tenant qualification</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              
              {/* SECTION 1: CONTACT */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                1. Contact Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
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
                    placeholder="e.g. +91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* SECTION 2: REQUIREMENT */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                2. Property Requirements
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Looking To:</label>
                  <select
                    value={form.leadPurpose}
                    onChange={e => setForm({ ...form, leadPurpose: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Buy">Buy Property</option>
                    <option value="Rent">Rent Property</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property Type</label>
                  <select
                    value={form.propertyTypeNeeded}
                    onChange={e => setForm({ ...form, propertyTypeNeeded: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Apartment</option>
                    <option>Luxury Villa</option>
                    <option>Penthouse</option>
                    <option>Commercial Office</option>
                    <option>Townhouse</option>
                    <option>Plot / Land</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Bedrooms / Layout</label>
                  <select
                    value={form.bedroomsNeeded}
                    onChange={e => setForm({ ...form, bedroomsNeeded: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Studio</option>
                    <option>1 BHK</option>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4+ BHK</option>
                    <option>Commercial Space</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Locality / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Bandra West, Downtown, Palm Jumeirah"
                    value={form.locationPreference}
                    onChange={e => setForm({ ...form, locationPreference: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* SECTION 3: BUDGET & FINANCING */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                3. Budget & Financing
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Max Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500000"
                    value={form.budgetMax}
                    onChange={e => setForm({ ...form, budgetMax: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Financing Status</label>
                  <select
                    value={form.financingStatus}
                    onChange={e => setForm({ ...form, financingStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Cash Ready (Immediate)</option>
                    <option>Pre-Approved Mortgage</option>
                    <option>Need Home Loan Assistance</option>
                    <option>Investor Syndicate</option>
                  </select>
                </div>
              </div>

              {/* SECTION 4: TIMELINE & PRIORITY */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                4. Urgency & Assignment
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Decision Timeline</label>
                  <select
                    value={form.urgency}
                    onChange={e => setForm({ ...form, urgency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Immediate (&lt; 15 days)</option>
                    <option>1 - 2 Months</option>
                    <option>3 - 6 Months</option>
                    <option>Just Exploring</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Lead Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Hot 🔥</option>
                    <option>Warm ☀️</option>
                    <option>Cold ❄️</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Inbound Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT LEAD */}
      {editingLead && (
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
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Lead: {editingLead.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update requirements, status, and budget</p>
              </div>
              <button onClick={() => setEditingLead(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateLead} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingLead.name}
                    onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={editingLead.phone}
                    onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Purpose</label>
                  <select
                    value={editingLead.leadPurpose || 'Buy'}
                    onChange={e => setEditingLead({ ...editingLead, leadPurpose: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Bedrooms / Unit</label>
                  <select
                    value={editingLead.bedroomsNeeded || '3 BHK'}
                    onChange={e => setEditingLead({ ...editingLead, bedroomsNeeded: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Studio</option>
                    <option>1 BHK</option>
                    <option>2 BHK</option>
                    <option>3 BHK</option>
                    <option>4+ BHK</option>
                    <option>Commercial Space</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Budget Max ($)</label>
                  <input
                    type="number"
                    value={editingLead.budgetMax || ''}
                    onChange={e => setEditingLead({ ...editingLead, budgetMax: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Area</label>
                  <input
                    type="text"
                    value={editingLead.locationPreference || ''}
                    onChange={e => setEditingLead({ ...editingLead, locationPreference: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Pipeline Stage</label>
                  <select
                    value={editingLead.status}
                    onChange={e => setEditingLead({ ...editingLead, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Priority</label>
                  <select
                    value={editingLead.priority || 'Hot 🔥'}
                    onChange={e => setEditingLead({ ...editingLead, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Hot 🔥</option>
                    <option>Warm ☀️</option>
                    <option>Cold ❄️</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setEditingLead(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="Delete Lead"
        message={`Are you sure you want to permanently remove "${leadToDelete?.name}"?`}
        confirmText="Delete Lead"
        danger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLeadToDelete(null)}
      />
    </>
  );
}
