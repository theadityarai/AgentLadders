'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Listing {
  [key: string]: unknown;
  id: string;
  title: string;
  platform: string;
  status: string;
  views: number;
  price?: number;
  featured?: boolean;
  expiryDate?: string;
  externalUrl?: string;
}

const initialForm = {
  title: '',
  platform: 'Property Finder',
  status: 'Active',
  price: '',
  featured: false,
  expiryDate: '',
  externalUrl: ''
};

export default function ListingsPage() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [listingToDelete, setListingToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/listings');
      const json = await res.json();
      if (json.listings) setData(json.listings);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: form.price ? Number(form.price) : 0,
        views: 0
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadListings();
  };

  const handleDelete = (id: string, title: string) => {
    setListingToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/listings?id=${listingToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(l => l.id !== listingToDelete.id));
    }
    setIsDeleting(false);
    setListingToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(listing => {
      const matchesSearch = 
        !searchQuery.trim() ||
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.platform?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlatform = platformFilter === 'All' || listing.platform === platformFilter;
      const matchesStatus = statusFilter === 'All' || listing.status === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [data, searchQuery, platformFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPlatformFilter('All');
    setStatusFilter('All');
  };

  const columns: Column<Listing>[] = [
    { 
      key: 'title', 
      label: 'Listing Title',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            🌐
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.title}</div>
            {r.externalUrl && (
              <a href={r.externalUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'underline' }}>
                View on portal ↗
              </a>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'platform', 
      label: 'Syndicated Portal',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
          {r.platform}
        </span>
      )
    },
    { 
      key: 'price', 
      label: 'Listed Price',
      render: (r) => r.price ? (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>${r.price.toLocaleString()}</span>
      ) : (
        <span style={{ color: '#94a3b8' }}>POA</span>
      )
    },
    { 
      key: 'views', 
      label: 'Traffic Views', 
      render: (r) => <span style={{ fontWeight: 600, color: '#0f172a' }}>👀 {r.views.toLocaleString()}</span> 
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
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
          title="Delete Listing"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Syndicated Portal Listings" 
        subtitle="Manage multi-portal feeds, active listings, and digital syndication across Property Finder, Bayut, and Zillow" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Publish Listing</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search syndicated listings by property title or portal..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'platform',
            label: 'Portal Feed',
            value: platformFilter,
            onChange: setPlatformFilter,
            options: [
              { label: 'All Portals', value: 'All' },
              { label: 'Property Finder', value: 'Property Finder' },
              { label: 'Bayut', value: 'Bayut' },
              { label: 'Zillow', value: 'Zillow' },
              { label: 'Company Website', value: 'Company Website' }
            ]
          },
          {
            key: 'status',
            label: 'Listing Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Expired', value: 'Expired' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading listings...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No listings matched your criteria"
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
                  🌐 Publish Portal Listing
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Distribute property feed to external listing portals and marketplace feeds
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
                    Listing Headline / Title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Ultra-Luxury 4BR Sky Villa with Panoramic Marina Skyline Views"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Target Portal Feed *
                  </label>
                  <select
                    value={form.platform}
                    onChange={e => setForm({...form, platform: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Property Finder">Property Finder</option>
                    <option value="Bayut">Bayut</option>
                    <option value="Zillow">Zillow</option>
                    <option value="Realtor.com">Realtor.com</option>
                    <option value="Company Website">Company Website</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Feed Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Active">Active (Live Feed)</option>
                    <option value="Draft">Draft (Pending Approval)</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Public Asking Price ($)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    placeholder="e.g. 1850000"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Syndication Expiration Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm({...form, expiryDate: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    External Listing Portal URL
                  </label>
                  <input
                    type="url"
                    value={form.externalUrl}
                    onChange={e => setForm({...form, externalUrl: e.target.value})}
                    placeholder="https://www.propertyfinder.ae/en/listing/..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm({...form, featured: e.target.checked})}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Mark as Premium Featured Listing (Prioritized in search results & banner rotation)
                  </label>
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
                <Button type="submit" variant="primary">Publish Listing</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!listingToDelete}
        title="Remove Syndicated Listing"
        message={
          <>
            Are you sure you want to delete listing <strong>&ldquo;{listingToDelete?.title}&rdquo;</strong>? 
            This portal publication will be withdrawn and deleted.
          </>
        }
        confirmText="Delete Listing"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setListingToDelete(null)}
      />
    </>
  );
}
