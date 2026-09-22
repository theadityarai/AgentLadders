'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Broker {
  [key: string]: unknown;
  id: string;
  name: string;
  agency: string;
  commissionSplit: string;
}

export default function BrokeragePage() {
  const [data, setData] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const initialForm = {
    name: '',
    agency: '',
    commissionSplit: '70/30',
    phone: '',
    email: '',
    licenseNumber: '',
    territory: 'Metropolitan Luxury',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [brokerToDelete, setBrokerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [splitFilter, setSplitFilter] = useState('All');

  const loadBrokers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brokerage');
      const json = await res.json();
      if (json.brokers) setData(json.brokers);
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrokers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/brokerage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadBrokers();
  };

  const handleDelete = (id: string, name: string) => {
    setBrokerToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!brokerToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/brokerage?id=${brokerToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(b => b.id !== brokerToDelete.id));
    }
    setIsDeleting(false);
    setBrokerToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(broker => {
      const matchesSearch = 
        !searchQuery.trim() ||
        broker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broker.agency?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSplit = splitFilter === 'All' || broker.commissionSplit === splitFilter;

      return matchesSearch && matchesSplit;
    });
  }, [data, searchQuery, splitFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSplitFilter('All');
  };

  const columns: Column<Broker>[] = [
    { 
      key: 'name', 
      label: 'Broker Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#2563eb' }}>
            {r.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
          </div>
        </div>
      )
    },
    { key: 'agency', label: 'Agency Partner' },
    { 
      key: 'commissionSplit', 
      label: 'Commission Split',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
          {r.commissionSplit}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
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
          title="Delete Partner"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Brokerage Partners" 
        subtitle="Manage external agents, co-broking relationships, and commission splits" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Partner</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search external brokers or agency names..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'split',
            label: 'Split Tier',
            value: splitFilter,
            onChange: setSplitFilter,
            options: [
              { label: 'All Splits', value: 'All' },
              { label: '70/30 Split', value: '70/30' },
              { label: '60/40 Split', value: '60/40' },
              { label: '50/50 Split', value: '50/50' },
              { label: '80/20 Split', value: '80/20' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading partners...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No brokerage partners matched your criteria"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Register Co-Broking Partner</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Establish external broker agreements, commission split rates, and licensing credentials</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Broker Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Marcus Vance" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Partner Agency / Firm *</label>
                  <input required value={form.agency} onChange={e => setForm({...form, agency: e.target.value})} placeholder="e.g. Vance & Partners Luxury" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="broker@agency.com" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Direct Phone / WhatsApp</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 345-6789" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Commission Split Ratio</label>
                  <select value={form.commissionSplit} onChange={e => setForm({...form, commissionSplit: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>70/30</option>
                    <option>80/20</option>
                    <option>60/40</option>
                    <option>50/50</option>
                    <option>90/10</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>RERA / License Number</label>
                  <input value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} placeholder="e.g. BRN-84729" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Market Territory</label>
                  <input value={form.territory} onChange={e => setForm({...form, territory: e.target.value})} placeholder="e.g. Beverly Hills & Coast" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Co-Broking Notes & Settlement Terms</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Settlement terms, primary escrow contacts, referral agreements..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Partner</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!brokerToDelete}
        title="Remove Brokerage Partner"
        message={
          <>
            Are you sure you want to remove partner <strong>&ldquo;{brokerToDelete?.name}&rdquo;</strong>? 
            Their co-broking commission records and partner profile will be disconnected.
          </>
        }
        confirmText="Remove Partner"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBrokerToDelete(null)}
      />
    </>
  );
}
