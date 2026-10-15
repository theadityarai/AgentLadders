'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { isValid10DigitPhone } from '@/lib/phone-validation';

interface Owner {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  phone: string;
  propertiesCount: number;
  ownerType?: string;
  ownershipShare?: string;
  primaryProperty?: string;
  taxId?: string;
  notes?: string;
}

const OWNER_TYPES = ['Individual Owner', 'Family Trust', 'Corporate Landlord', 'Property Fund'];

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

export default function OwnersPage() {
  const [data, setData] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (editingOwner) setEditingOwner(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, editingOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || form.name.trim().length < 2) {
      alert('Please enter owner / landlord name (at least 2 characters).');
      return;
    }
    if (!isValid10DigitPhone(form.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    await fetch('/api/owners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        propertiesCount: parseInt(form.propertiesCount) || 1
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadOwners();
  };

  const handleOpenEdit = (owner: Owner) => {
    setEditingOwner(owner);
  };

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;
    if (!editingOwner.name?.trim() || editingOwner.name.trim().length < 2) {
      alert('Please enter owner / landlord name (at least 2 characters).');
      return;
    }
    if (editingOwner.phone && !isValid10DigitPhone(editingOwner.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    const res = await fetch('/api/owners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingOwner)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(o => o.id === editingOwner.id ? json.owner : o));
      setEditingOwner(null);
    }
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
            {r.ownerType && <div style={{ fontSize: '11px', color: '#64748b' }}>{r.ownerType}</div>}
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
            title="Edit Owner"
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
            title="Delete Owner"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <PageHeader 
        title="Property Owners & Landlords" 
        subtitle="Manage landlord accounts, title deeds, and property management representation" 
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
            label: 'Portfolio Size',
            value: portfolioFilter,
            onChange: setPortfolioFilter,
            options: [
              { label: 'All Portfolios', value: 'All' },
              { label: 'Single Asset (1 Property)', value: 'single' },
              { label: 'Multi-Asset (2-4 Properties)', value: 'multi' },
              { label: 'Large Portfolio (5+ Properties)', value: 'portfolio' }
            ]
          }
        ]}
      />

      <div style={{ paddingBottom: '24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE OWNER MODAL */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
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
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add Property Owner</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Owner Name *</label>
                <input
                  required
                  placeholder="e.g. Sheikh Rashid Al Maktoum"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="rashid@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                  <PhoneInput
                    required
                    value={form.phone}
                    onChange={(full) => setForm({ ...form, phone: full })}
                    placeholder="98200 12345"
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Owner Type</label>
                  <select
                    value={form.ownerType}
                    onChange={e => setForm({ ...form, ownerType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {OWNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Properties Count</label>
                  <input
                    type="number"
                    min="1"
                    value={form.propertiesCount}
                    onChange={e => setForm({ ...form, propertiesCount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>National ID / Tax ID</label>
                  <input
                    placeholder="784-1985-1234567-1"
                    value={form.taxId}
                    onChange={e => setForm({ ...form, taxId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Primary Asset</label>
                  <input
                    placeholder="e.g. Marina Gate Penthouse"
                    value={form.primaryProperty}
                    onChange={e => setForm({ ...form, primaryProperty: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Owner</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OWNER MODAL */}
      {editingOwner && (
        <div 
          onClick={() => setEditingOwner(null)}
          style={{
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
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Owner: {editingOwner.name}</h3>
            <form onSubmit={handleUpdateOwner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Owner Name *</label>
                <input
                  required
                  value={editingOwner.name || ''}
                  onChange={e => setEditingOwner({ ...editingOwner, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    required
                    type="email"
                    value={editingOwner.email || ''}
                    onChange={e => setEditingOwner({ ...editingOwner, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                  <PhoneInput
                    required
                    value={editingOwner.phone || ''}
                    onChange={(full) => setEditingOwner({ ...editingOwner, phone: full })}
                    placeholder="98200 12345"
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Owner Type</label>
                  <select
                    value={editingOwner.ownerType || 'Individual Owner'}
                    onChange={e => setEditingOwner({ ...editingOwner, ownerType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {OWNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Properties Count</label>
                  <input
                    type="number"
                    min="1"
                    value={editingOwner.propertiesCount || 1}
                    onChange={e => setEditingOwner({ ...editingOwner, propertiesCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>National ID / Tax ID</label>
                  <input
                    value={editingOwner.taxId || ''}
                    onChange={e => setEditingOwner({ ...editingOwner, taxId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Primary Asset</label>
                  <input
                    value={editingOwner.primaryProperty || ''}
                    onChange={e => setEditingOwner({ ...editingOwner, primaryProperty: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingOwner(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!ownerToDelete}
        title="Delete Owner"
        message={
          <>
            Are you sure you want to delete owner <strong>&ldquo;{ownerToDelete?.name}&rdquo;</strong>?
            This will remove their ownership record.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Owner'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setOwnerToDelete(null)}
      />
    </div>
  );
}
