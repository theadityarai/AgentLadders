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
          <div style={{ fontWeight: 500, color: '#1e293b' }}>{r.contactPerson || 'General Inquiries'}</div>
          {r.email && <div style={{ fontSize: '12px', color: '#64748b' }}>{r.email}</div>}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact Phone',
      render: (r) => <span style={{ fontSize: '13px', color: '#334155' }}>{r.phone || 'N/A'}</span>
    },
    { 
      key: 'website', 
      label: 'Website',
      render: (r) => r.website ? (
        <a href={r.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '13px' }}>
          {r.website.replace(/^https?:\/\//, '')}
        </a>
      ) : <span style={{ color: '#94a3b8' }}>N/A</span>
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
          title="Delete Company"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Corporate Accounts & Companies" 
        subtitle="Manage developer partnerships, corporate clients, and vendor organizations" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Company</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search companies by name, contact person, or industry..."
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
              { label: 'Real Estate & Development', value: 'Real Estate' },
              { label: 'Private Equity / Investment', value: 'Investment' },
              { label: 'Hospitality', value: 'Hospitality' },
              { label: 'Legal & Escrow', value: 'Legal' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading corporate accounts...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No corporate accounts matched your search criteria"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, #f8fafc, #ffffff)'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  🏢 Add Corporate Account
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Register property developers, investment entities, and corporate partners
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Company / Entity Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Apex Horizon Capital & Development"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Industry Sector *
                  </label>
                  <select
                    value={form.industry}
                    onChange={e => setForm({...form, industry: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Real Estate & Development">Real Estate & Development</option>
                    <option value="Private Equity & Capital">Private Equity & Capital</option>
                    <option value="Asset Management">Asset Management</option>
                    <option value="Hospitality & Resorts">Hospitality & Resorts</option>
                    <option value="Legal & Escrow Services">Legal & Escrow Services</option>
                    <option value="Architecture & Construction">Architecture & Construction</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => setForm({...form, website: e.target.value})}
                    placeholder="https://www.apexhorizon.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Key Contact Representative
                  </label>
                  <input
                    value={form.contactPerson}
                    onChange={e => setForm({...form, contactPerson: e.target.value})}
                    placeholder="e.g. Marcus Vance (VP of Acquisitions)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Corporate Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+1 (555) 890-1234"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="partnerships@apexhorizon.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Tax ID / Trade License #
                  </label>
                  <input
                    value={form.taxId}
                    onChange={e => setForm({...form, taxId: e.target.value})}
                    placeholder="e.g. US-EIN-9482104"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Headquarters / Office Address
                  </label>
                  <input
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="e.g. 500 Park Avenue, Floor 32, New York, NY 10022"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Company</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!companyToDelete}
        title="Delete Company"
        message={
          <>
            Are you sure you want to delete corporate account <strong>&ldquo;{companyToDelete?.name}&rdquo;</strong>? 
            This company record will be permanently removed.
          </>
        }
        confirmText="Delete Company"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCompanyToDelete(null)}
      />
    </>
  );
}
