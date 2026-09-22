'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Company {
  [key: string]: unknown;
  id: string;
  name: string;
  industry: string;
  website?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
}

const initialForm = {
  name: '',
  industry: 'Real Estate & Development',
  website: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxId: ''
};

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const json = await res.json();
      if (json.companies) setData(json.companies);
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadCompanies();
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    const res = await fetch('/api/companies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCompany)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(c => c.id === editingCompany.id ? json.company : c));
      setEditingCompany(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setCompanyToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/companies?id=${companyToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(c => c.id !== companyToDelete.id));
    }
    setIsDeleting(false);
    setCompanyToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(comp => {
      const matchesSearch = 
        !searchQuery.trim() ||
        comp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.website?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = industryFilter === 'All' || comp.industry?.toLowerCase().includes(industryFilter.toLowerCase());

      return matchesSearch && matchesIndustry;
    });
  }, [data, searchQuery, industryFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setIndustryFilter('All');
  };

  const columns: Column<Company>[] = [
    { 
      key: 'name', 
      label: 'Company Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            🏢
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
            {r.taxId && <div style={{ fontSize: '11px', color: '#64748b' }}>Tax ID: {r.taxId}</div>}
          </div>
        </div>
      )
    },
    { 
      key: 'industry', 
      label: 'Industry Sector',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
          {r.industry}
        </span>
      )
    },
    {
      key: 'contactPerson',
      label: 'Key Representative',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{r.contactPerson || 'General Admin'}</div>
          {r.email && <div style={{ fontSize: '12px', color: '#64748b' }}>{r.email}</div>}
        </div>
      )
    },
    { key: 'phone', label: 'Direct Phone' },
    { 
      key: 'website', 
      label: 'Corporate Portal',
      render: (r) => r.website ? (
        <a href={r.website.startsWith('http') ? r.website : `https://${r.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
          {r.website.replace(/^https?:\/\//, '')} ↗
        </a>
      ) : (
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
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
            title="Edit Company"
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
            title="Delete Company"
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
        title="Corporate Entities & Developers" 
        subtitle="Manage developer accounts, master agency agreements, and corporate institutional partners" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Company</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search companies by name, sector, representative, or website..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'industry',
            label: 'Industry Sector',
            value: industryFilter,
            onChange: setIndustryFilter,
            options: [
              { label: 'All Industries', value: 'All' },
              { label: 'Real Estate & Development', value: 'Real Estate & Development' },
              { label: 'Property Asset Management', value: 'Property Asset Management' },
              { label: 'Hospitality & Luxury Hotels', value: 'Hospitality & Luxury Hotels' },
              { label: 'Private Wealth & Family Office', value: 'Private Wealth & Family Office' }
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE COMPANY MODAL */}
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
            width: '560px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add Corporate Partner</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Company Legal Name *</label>
                <input
                  required
                  placeholder="e.g. Emaar Properties PJSC"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Industry Sector</label>
                  <select
                    value={form.industry}
                    onChange={e => setForm({ ...form, industry: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Real Estate & Development</option>
                    <option>Property Asset Management</option>
                    <option>Hospitality & Luxury Hotels</option>
                    <option>Private Wealth & Family Office</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Corporate Website</label>
                  <input
                    placeholder="https://emaar.com"
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Key Representative</label>
                  <input
                    placeholder="e.g. Mohamed Alabbar"
                    value={form.contactPerson}
                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Direct Phone</label>
                  <input
                    placeholder="+971 4 367 3333"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Official Email</label>
                  <input
                    type="email"
                    placeholder="partnerships@emaar.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tax / VAT Registration ID</label>
                  <input
                    placeholder="TRN-10023456789"
                    value={form.taxId}
                    onChange={e => setForm({ ...form, taxId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Headquarters Address</label>
                <input
                  placeholder="Downtown Dubai, UAE"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Partner</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COMPANY MODAL */}
      {editingCompany && (
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
            width: '560px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Company: {editingCompany.name}</h3>
            <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Company Legal Name *</label>
                <input
                  required
                  value={editingCompany.name || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Industry Sector</label>
                  <select
                    value={editingCompany.industry}
                    onChange={e => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Real Estate & Development</option>
                    <option>Property Asset Management</option>
                    <option>Hospitality & Luxury Hotels</option>
                    <option>Private Wealth & Family Office</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Corporate Website</label>
                  <input
                    value={editingCompany.website || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, website: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Key Representative</label>
                  <input
                    value={editingCompany.contactPerson || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Direct Phone</label>
                  <input
                    value={editingCompany.phone || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Official Email</label>
                  <input
                    type="email"
                    value={editingCompany.email || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Tax / VAT Registration ID</label>
                  <input
                    value={editingCompany.taxId || ''}
                    onChange={e => setEditingCompany({ ...editingCompany, taxId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Headquarters Address</label>
                <input
                  value={editingCompany.address || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingCompany(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!companyToDelete}
        title="Delete Company"
        message={
          <>
            Are you sure you want to delete corporate record <strong>&ldquo;{companyToDelete?.name}&rdquo;</strong>?
            This will permanently remove the corporate entity.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Company'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCompanyToDelete(null)}
      />
    </>
  );
}
