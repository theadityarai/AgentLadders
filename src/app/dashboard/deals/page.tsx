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
}

export default function DealsPage() {
  const [data, setData] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
        deal.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
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
    { key: 'stage', label: 'Pipeline Stage', render: (r) => <StatusBadge status={r.stage} /> },
    { key: 'expectedCloseDate', label: 'Expected Close' },
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
          title="Delete Deal"
        >
          🗑️ Delete
        </button>
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
        searchPlaceholder="Search active deals by title..."
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
              { label: 'Prospecting', value: 'Prospecting' },
              { label: 'Qualification', value: 'Qualification' },
              { label: 'Proposal', value: 'Proposal' },
              { label: 'Negotiation', value: 'Negotiation' },
              { label: 'Closed Won', value: 'Closed Won' },
              { label: 'Closed Lost', value: 'Closed Lost' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading deals...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No deals matched your search criteria"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create New Deal Pipeline</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Link client, property, closing terms, and forecast agency commission</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Deal Title / Transaction Reference *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Beverly Hills Luxury Villa Purchase" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Linked Client / Buyer *</label>
                  <input required value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="e.g. Jonathan Reynolds" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Target Property Asset *</label>
                  <input required value={form.propertyName} onChange={e => setForm({...form, propertyName: e.target.value})} placeholder="e.g. Luxury Villa in Beverly Hills" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Deal Value ($) *</label>
                  <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="e.g. 4500000" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Pipeline Stage</label>
                  <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Prospecting</option>
                    <option>Qualification</option>
                    <option>Proposal</option>
                    <option>Negotiation</option>
                    <option>Closed Won</option>
                    <option>Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Transaction Type</label>
                  <select value={form.dealType} onChange={e => setForm({...form, dealType: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Sale Acquisition</option>
                    <option>Commercial Lease</option>
                    <option>Residential Tenancy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Closing Probability (%)</label>
                  <select value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option value="25">25% - Early Discovery</option>
                    <option value="50">50% - Proposal Active</option>
                    <option value="75">75% - Active Contract Review</option>
                    <option value="90">90% - Closing in Escrow</option>
                    <option value="100">100% - Fully Executed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Expected Commission %</label>
                  <input value={form.commissionRate} onChange={e => setForm({...form, commissionRate: e.target.value})} placeholder="e.g. 2.5%" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Target Close Date *</label>
                  <input required type="date" value={form.expectedCloseDate} onChange={e => setForm({...form, expectedCloseDate: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Assigned Broker / Agent</label>
                <input value={form.assignedBroker} onChange={e => setForm({...form, assignedBroker: e.target.value})} placeholder="e.g. Marcus Vance" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Deal Notes & Contingencies</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Title search contingencies, mortgage pre-approval status, escrow attorney notes..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Deal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!dealToDelete}
        title="Delete Deal Pipeline"
        message={
          <>
            Are you sure you want to delete deal <strong>&ldquo;{dealToDelete?.title}&rdquo;</strong>? 
            This deal and its forecasted commission will be removed from your pipeline.
          </>
        }
        confirmText="Delete Deal"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDealToDelete(null)}
      />
    </>
  );
}
