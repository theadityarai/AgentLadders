'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  requirement?: string;
  budget?: string;
  leadType?: string;
  locationPreference?: string;
  priority?: string;
  assignedTo?: string;
  nextFollowUp?: string;
  notes?: string;
}

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

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
    leadType: 'Buyer',
    requirement: '',
    budget: '',
    locationPreference: '',
    source: 'Direct',
    status: 'New',
    priority: 'Medium',
    assignedTo: 'Marcus Vance',
    nextFollowUp: '',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

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
      const json = await res.json();
      setData(prev => prev.map(l => l.id === editingLead.id ? json.lead : l));
      setEditingLead(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setData(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
  };

  const handleConvertToClient = async (lead: Lead) => {
    try {
      // 1. Create client record
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          type: lead.leadType || 'Buyer',
          requirement: lead.requirement || 'Primary Residence',
          budget: lead.budget || 'Undisclosed',
          preferredLocation: lead.locationPreference || 'Dubai',
          notes: `Converted from Lead ID: ${lead.id}. ${lead.notes || ''}`
        })
      });

      // 2. Mark lead as Qualified
      handleStatusChange(lead.id, 'Qualified');

      setConvertFeedback(`Successfully converted "${lead.name}" to CRM Client!`);
      setTimeout(() => setConvertFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to convert lead', err);
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

  const filteredData = useMemo(() => {
    return data.filter(lead => {
      const matchesSearch = 
        !searchQuery.trim() ||
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [data, searchQuery, statusFilter, sourceFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSourceFilter('All');
  };

  const columns: Column<Lead>[] = [
    { 
      key: 'name', 
      label: 'Lead Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#2563eb' }}>
            {r.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{r.email}</div>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'requirement', 
      label: 'Requirement',
      render: (r) => (
        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
          {r.requirement || 'General Inquiry'}
        </span>
      )
    },
    { 
      key: 'budget', 
      label: 'Budget',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {r.budget || 'Undisclosed'}
        </span>
      )
    },
    { 
      key: 'source', 
      label: 'Source',
      render: (r) => (
        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#475569' }}>
          {r.source}
        </span>
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
            backgroundColor: r.status === 'Qualified' ? '#dcfce7' : r.status === 'Lost' ? '#fee2e2' : '#eff6ff',
            color: r.status === 'Qualified' ? '#166534' : r.status === 'Lost' ? '#991b1b' : '#1d4ed8',
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
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleConvertToClient(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Promote Lead to Active Client"
          >
            👤 Client
          </button>
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
            title="Edit Lead"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(r.id, r.name)}
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
            title="Delete Lead"
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
        title="Lead Management" 
        subtitle="Track, qualify, and convert buyer and tenant inquiries" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Lead</Button>} 
      />

      {convertFeedback && (
        <div style={{
          margin: '0 24px 16px',
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px',
          color: '#15803d',
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>✨ {convertFeedback}</span>
          <button onClick={() => setConvertFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}>✕</button>
        </div>
      )}

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leads by name, email, or phone..."
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
              ...LEAD_STATUSES.map(s => ({ label: s, value: s }))
            ]
          },
          {
            key: 'source',
            label: 'Source',
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { label: 'All Sources', value: 'All' },
              { label: 'Website', value: 'Website' },
              { label: 'Referral', value: 'Referral' },
              { label: 'Zillow', value: 'Zillow' },
              { label: 'Property Finder', value: 'Property Finder' },
              { label: 'Social Media', value: 'Social Media' },
              { label: 'Walk-in', value: 'Walk-in' }
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE LEAD MODAL */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add New Lead</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input
                  required
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                  <input
                    required
                    placeholder="+971 50 123 4567"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Lead Type</label>
                  <select
                    value={form.leadType}
                    onChange={e => setForm({ ...form, leadType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Buyer</option>
                    <option>Tenant</option>
                    <option>Investor</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Source</label>
                  <select
                    value={form.source}
                    onChange={e => setForm({ ...form, source: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Direct</option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Property Finder</option>
                    <option>Zillow</option>
                    <option>Social Media</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Target Requirement</label>
                  <input
                    placeholder="e.g. 3BHK Penthouse"
                    value={form.requirement}
                    onChange={e => setForm({ ...form, requirement: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Estimated Budget</label>
                  <input
                    placeholder="e.g. $1.5M - $2M"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Lead: {editingLead.name}</h3>
            <form onSubmit={handleUpdateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input
                  required
                  value={editingLead.name || ''}
                  onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    required
                    type="email"
                    value={editingLead.email || ''}
                    onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                  <input
                    required
                    value={editingLead.phone || ''}
                    onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Lead Status</label>
                  <select
                    value={editingLead.status}
                    onChange={e => setEditingLead({ ...editingLead, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Lead Type</label>
                  <select
                    value={editingLead.leadType || 'Buyer'}
                    onChange={e => setEditingLead({ ...editingLead, leadType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Buyer</option>
                    <option>Tenant</option>
                    <option>Investor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Target Requirement</label>
                  <input
                    value={editingLead.requirement || ''}
                    onChange={e => setEditingLead({ ...editingLead, requirement: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Estimated Budget</label>
                  <input
                    value={editingLead.budget || ''}
                    onChange={e => setEditingLead({ ...editingLead, budget: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingLead(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="Delete Lead"
        message={
          <>
            Are you sure you want to delete lead <strong>&ldquo;{leadToDelete?.name}&rdquo;</strong>?
            This action cannot be undone.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Lead'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLeadToDelete(null)}
      />
    </>
  );
}
