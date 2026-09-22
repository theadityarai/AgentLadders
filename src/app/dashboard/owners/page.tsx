'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Owner {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  phone: string;
  propertiesCount: number;
}

export default function OwnersPage() {
  const [data, setData] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    propertiesCount: '1',
    ownerType: 'Individual Owner',
    ownershipShare: '100%',
    primaryProperty: '',
    taxId: '',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [ownerToDelete, setOwnerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState('All');

  const loadOwners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owners');
      const json = await res.json();
      if (json.owners) setData(json.owners);
    } catch (err) {
      console.error('Failed to load owners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/owners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadOwners();
  };

  const handleDelete = (id: string, name: string) => {
    setOwnerToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!ownerToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/owners?id=${ownerToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(o => o.id !== ownerToDelete.id));
    }
    setIsDeleting(false);
    setOwnerToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(owner => {
      const matchesSearch = 
        !searchQuery.trim() ||
        owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesPortfolio = true;
      if (portfolioFilter === 'single') {
        matchesPortfolio = owner.propertiesCount === 1;
      } else if (portfolioFilter === 'multi') {
        matchesPortfolio = owner.propertiesCount >= 2 && owner.propertiesCount <= 4;
      } else if (portfolioFilter === 'portfolio') {
        matchesPortfolio = owner.propertiesCount >= 5;
      }

      return matchesSearch && matchesPortfolio;
    });
  }, [data, searchQuery, portfolioFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPortfolioFilter('All');
  };

  const columns: Column<Owner>[] = [
    { 
      key: 'name', 
      label: 'Owner / Landlord',
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
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'propertiesCount', 
      label: 'Portfolio Size',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
          🏠 {r.propertiesCount} {r.propertiesCount === 1 ? 'Property' : 'Properties'}
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
          title="Delete Owner"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Landlord & Owner Management" 
        subtitle="Manage property owners, title holders, and portfolio landlords" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Owner</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search owners by name, email, or phone..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'portfolio',
            label: 'Portfolio',
            value: portfolioFilter,
            onChange: setPortfolioFilter,
            options: [
              { label: 'All Portfolios', value: 'All' },
              { label: 'Single Unit (1)', value: 'single' },
              { label: 'Multi-Unit (2 - 4)', value: 'multi' },
              { label: 'Portfolio Holder (5+)', value: 'portfolio' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading owners...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No property owners matched your filters"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Register Property Owner / Landlord</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Maintain master asset ownership records and portfolio management details</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Owner Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Richard Davenport" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Entity Category</label>
                  <select value={form.ownerType} onChange={e => setForm({...form, ownerType: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Individual Owner</option>
                    <option>Property Development Co</option>
                    <option>Family Office</option>
                    <option>Investment Trust / Fund</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Email Address *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="owner@example.com" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Contact Phone / Mobile *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 123-4567" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Portfolio Property Count *</label>
                  <input required type="number" min="1" value={form.propertiesCount} onChange={e => setForm({...form, propertiesCount: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Ownership Equity Share</label>
                  <select value={form.ownershipShare} onChange={e => setForm({...form, ownershipShare: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>100% Sole Owner</option>
                    <option>50% Joint Partner</option>
                    <option>Fractional Syndicate</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Primary Asset / Address</label>
                  <input value={form.primaryProperty} onChange={e => setForm({...form, primaryProperty: e.target.value})} placeholder="e.g. Beverly Hills Villa, Unit 4A" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Tax ID / Land Title Registration</label>
                  <input value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} placeholder="e.g. TAX-99482-USA" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Owner Notes & Bank Routing Info</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Rental payout instructions, Power of Attorney details, management agreement terms..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Owner</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!ownerToDelete}
        title="Delete Property Owner"
        message={
          <>
            Are you sure you want to delete owner <strong>&ldquo;{ownerToDelete?.name}&rdquo;</strong>? 
            Their landlord profile and property linkages will be removed.
          </>
        }
        confirmText="Delete Owner"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setOwnerToDelete(null)}
      />
    </>
  );
}
