'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Deal {
  [key: string]: unknown;
  id: string;
  title: string;
  amount: number;
  stage: string;
  expectedCloseDate: string;
  clientName?: string;
  propertyName?: string;
  probability?: number;
  dealType?: string;
  commissionRate?: string;
  assignedBroker?: string;
  notes?: string;
}

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function DealsPage() {
  const [data, setData] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const initialForm = {
    title: '',
    amount: '',
    stage: 'Negotiation',
    clientName: '',
    propertyName: '',
    dealType: 'Sale Acquisition',
    probability: '50',
    commissionRate: '2.5%',
    assignedBroker: 'Marcus Vance',
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [dealToDelete, setDealToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deals');
      const json = await res.json();
      if (json.deals) setData(json.deals);
    } catch (err) {
      console.error('Failed to load deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadDeals();
  };

  const handleOpenEdit = (deal: Deal) => {
    setEditingDeal(deal);
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    const res = await fetch('/api/deals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingDeal)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(d => d.id === editingDeal.id ? json.deal : d));
      setEditingDeal(null);
    }
  };

  const handleStageChange = async (id: string, newStage: string) => {
    // Optimistic update
    setData(prev => prev.map(d => d.id === id ? { ...d, stage: newStage } : d));
    await fetch('/api/deals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage: newStage })
    });
  };

  const handleDelete = (id: string, title: string) => {
    setDealToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!dealToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/deals?id=${dealToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(d => d.id !== dealToDelete.id));
    }
    setIsDeleting(false);
    setDealToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(deal => {
      const matchesSearch = 
        !searchQuery.trim() ||
        deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.propertyName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'All' || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [data, searchQuery, stageFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStageFilter('All');
  };

  const columns: Column<Deal>[] = [
    { 
      key: 'title', 
      label: 'Deal Title',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
            💼
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.title}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>👤 {r.clientName || 'Private Client'} &middot; 🏡 {r.propertyName || 'Portfolio Asset'}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'amount', 
      label: 'Deal Value', 
      render: (r) => <span style={{ fontWeight: 700, color: '#0f172a' }}>${r.amount.toLocaleString()}</span> 
    },
    { 
      key: 'probability',
      label: 'Win Rate',
      render: (r) => (
        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#166534' }}>
          {r.probability ? `${r.probability}%` : '50%'}
        </span>
      )
    },
    { 
      key: 'stage', 
      label: 'Pipeline Stage', 
      render: (r) => (
        <select
          value={r.stage}
          onChange={(e) => handleStageChange(r.id, e.target.value)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: r.stage === 'Closed Won' ? '#dcfce7' : r.stage === 'Closed Lost' ? '#fee2e2' : '#f8fafc',
            color: r.stage === 'Closed Won' ? '#166534' : r.stage === 'Closed Lost' ? '#991b1b' : '#334155',
            cursor: 'pointer'
          }}
        >
          {STAGES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    { key: 'expectedCloseDate', label: 'Expected Close' },
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
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Edit Deal Details"
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
            title="Delete Deal"
          >
            🗑️ Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Deals & Pipelines" 
        subtitle="Track negotiation stages, expected closing dates, and agency commission pipeline" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ New Deal</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search active deals by title, client, or property..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'stage',
            label: 'Pipeline Stage',
            value: stageFilter,
            onChange: setStageFilter,
            options: [
              { label: 'All Stages', value: 'All' },
              ...STAGES.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE DEAL MODAL */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Create New Deal</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Deal Title *</label>
                <input
                  required
                  placeholder="e.g. Marina Penthouse Sale"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Deal Value ($) *</label>
                  <input
                    required
                    type="number"
                    placeholder="1250000"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Pipeline Stage</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm({ ...form, stage: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Associated Client</label>
                  <input
                    placeholder="Client Name"
                    value={form.clientName}
                    onChange={e => setForm({ ...form, clientName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Associated Property</label>
                  <input
                    placeholder="Property Name"
                    value={form.propertyName}
                    onChange={e => setForm({ ...form, propertyName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.probability}
                    onChange={e => setForm({ ...form, probability: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Expected Close Date</label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Deal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEAL MODAL */}
      {editingDeal && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Deal: {editingDeal.title}</h3>
            <form onSubmit={handleUpdateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Deal Title *</label>
                <input
                  required
                  value={editingDeal.title || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Deal Value ($) *</label>
                  <input
                    required
                    type="number"
                    value={editingDeal.amount || ''}
                    onChange={e => setEditingDeal({ ...editingDeal, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Pipeline Stage</label>
                  <select
                    value={editingDeal.stage}
                    onChange={e => setEditingDeal({ ...editingDeal, stage: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Associated Client</label>
                  <input
                    value={editingDeal.clientName || ''}
                    onChange={e => setEditingDeal({ ...editingDeal, clientName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Associated Property</label>
                  <input
                    value={editingDeal.propertyName || ''}
                    onChange={e => setEditingDeal({ ...editingDeal, propertyName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingDeal.probability ?? 50}
                    onChange={e => setEditingDeal({ ...editingDeal, probability: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Expected Close Date</label>
                  <input
                    type="date"
                    value={editingDeal.expectedCloseDate || ''}
                    onChange={e => setEditingDeal({ ...editingDeal, expectedCloseDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingDeal(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!dealToDelete}
        title="Delete Deal"
        message={
          <>
            Are you sure you want to delete the deal <strong>&ldquo;{dealToDelete?.title}&rdquo;</strong>?
            This will permanently remove it from your pipeline.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Deal'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDealToDelete(null)}
      />
    </>
  );
}
