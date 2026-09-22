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
  phone?: string;
  email?: string;
  licenseNumber?: string;
  territory?: string;
}

const SPLITS = ['50/50', '60/40', '70/30', '80/20', '90/10'];

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

export default function BrokeragePage() {
  const [data, setData] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
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

  const handleOpenEdit = (broker: Broker) => {
    setEditingBroker(broker);
  };

  const handleUpdateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroker) return;
    const res = await fetch('/api/brokerage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingBroker)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(b => b.id === editingBroker.id ? json.broker : b));
      setEditingBroker(null);
    }
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
        broker.agency?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broker.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
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
            {r.email && <div style={{ fontSize: '11px', color: '#64748b' }}>{r.email}</div>}
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
    { key: 'phone', label: 'Phone' },
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
            title="Edit Broker"
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
            title="Delete Partner"
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
        title="Brokerage & Co-Broking" 
        subtitle="Manage inter-agency partnerships, split commissions, and external co-broker agreements" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Partner Broker</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search brokers by name, agency, or email..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'split',
            label: 'Commission Split',
            value: splitFilter,
            onChange: setSplitFilter,
            options: [
              { label: 'All Splits', value: 'All' },
              ...SPLITS.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE BROKER MODAL */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add Partner Broker</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Broker Name *</label>
                <input
                  required
                  placeholder="e.g. David Sterling"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Agency Affiliation *</label>
                  <input
                    required
                    placeholder="e.g. Sterling Real Estate"
                    value={form.agency}
                    onChange={e => setForm({ ...form, agency: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Agreed Commission Split</label>
                  <select
                    value={form.commissionSplit}
                    onChange={e => setForm({ ...form, commissionSplit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {SPLITS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="david@sterling.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    placeholder="+971 50 333 4444"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Broker</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BROKER MODAL */}
      {editingBroker && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Partner Broker: {editingBroker.name}</h3>
            <form onSubmit={handleUpdateBroker} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Broker Name *</label>
                <input
                  required
                  value={editingBroker.name || ''}
                  onChange={e => setEditingBroker({ ...editingBroker, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Agency Affiliation *</label>
                  <input
                    required
                    value={editingBroker.agency || ''}
                    onChange={e => setEditingBroker({ ...editingBroker, agency: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Agreed Commission Split</label>
                  <select
                    value={editingBroker.commissionSplit}
                    onChange={e => setEditingBroker({ ...editingBroker, commissionSplit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {SPLITS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    value={editingBroker.email || ''}
                    onChange={e => setEditingBroker({ ...editingBroker, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    value={editingBroker.phone || ''}
                    onChange={e => setEditingBroker({ ...editingBroker, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingBroker(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!brokerToDelete}
        title="Delete Partner Broker"
        message={
          <>
            Are you sure you want to remove partner broker <strong>&ldquo;{brokerToDelete?.name}&rdquo;</strong>?
            This will remove their profile from commission split agreements.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Broker'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBrokerToDelete(null)}
      />
    </>
  );
}
