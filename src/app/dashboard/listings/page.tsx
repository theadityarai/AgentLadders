'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ShareModal } from '@/components/ui/ShareModal';
import Link from 'next/link';

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
  publicToken?: string;
  privacyMode?: string;
  sharesCount?: number;
}

const LISTING_STATUSES = ['Active', 'Paused', 'Expired', 'Draft'];
const PLATFORMS = ['Property Finder', 'Bayut', 'Dubizzle', 'Zillow', 'Rightmove'];

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
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [listingToShare, setListingToShare] = useState<Listing | null>(null);
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

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    const res = await fetch('/api/listings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingListing)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(l => l.id === editingListing.id ? json.listing : l));
      setEditingListing(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setData(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    await fetch('/api/listings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
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
            backgroundColor: r.status === 'Active' ? '#dcfce7' : r.status === 'Paused' ? '#fef3c7' : '#f1f5f9',
            color: r.status === 'Active' ? '#166534' : r.status === 'Paused' ? '#b45309' : '#334155',
            cursor: 'pointer'
          }}
        >
          {LISTING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setListingToShare(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Share on WhatsApp, Telegram, Email, etc."
          >
            <span>📲</span> Share
          </button>
          <Link
            href={`/p/${r.publicToken || r.id}`}
            target="_blank"
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Open Public Showcase Webpage"
          >
            <span>↗</span> Page
          </Link>
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
            title="Edit Listing"
          >
            ✏️
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
            title="Delete Listing"
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
        title="Portal Listings & Syndication" 
        subtitle="Manage syndication across Property Finder, Bayut, and external luxury portals" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ New Listing</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search listings by title or syndication portal..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'platform',
            label: 'Portal',
            value: platformFilter,
            onChange: setPlatformFilter,
            options: [
              { label: 'All Portals', value: 'All' },
              ...PLATFORMS.map(p => ({ label: p, value: p }))
            ]
          },
          {
            key: 'status',
            label: 'Listing Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...LISTING_STATUSES.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE LISTING MODAL */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Create New Portal Listing</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Listing Title *</label>
                <input
                  required
                  placeholder="e.g. Marina View Luxury 4BHK"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Syndication Portal</label>
                  <select
                    value={form.platform}
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {LISTING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Listed Price ($)</label>
                  <input
                    type="number"
                    placeholder="1850000"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Portal External URL</label>
                  <input
                    placeholder="https://propertyfinder.ae/..."
                    value={form.externalUrl}
                    onChange={e => setForm({ ...form, externalUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Listing</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LISTING MODAL */}
      {editingListing && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Listing: {editingListing.title}</h3>
            <form onSubmit={handleUpdateListing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Listing Title *</label>
                <input
                  required
                  value={editingListing.title || ''}
                  onChange={e => setEditingListing({ ...editingListing, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Syndication Portal</label>
                  <select
                    value={editingListing.platform}
                    onChange={e => setEditingListing({ ...editingListing, platform: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingListing.status}
                    onChange={e => setEditingListing({ ...editingListing, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {LISTING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Listed Price ($)</label>
                  <input
                    type="number"
                    value={editingListing.price || ''}
                    onChange={e => setEditingListing({ ...editingListing, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Portal External URL</label>
                  <input
                    value={editingListing.externalUrl || ''}
                    onChange={e => setEditingListing({ ...editingListing, externalUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingListing(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {listingToShare && (
        <ShareModal
          isOpen={!!listingToShare}
          property={{
            id: listingToShare.id,
            title: listingToShare.title,
            price: listingToShare.price,
            location: listingToShare.platform,
            publicToken: listingToShare.publicToken || listingToShare.id,
            privacyMode: listingToShare.privacyMode || 'public'
          }}
          propertyId={listingToShare.id}
          propertyTitle={listingToShare.title}
          publicToken={listingToShare.publicToken || listingToShare.id}
          price={listingToShare.price}
          location={listingToShare.platform}
          currentPrivacyMode={listingToShare.privacyMode || 'public'}
          onClose={() => setListingToShare(null)}
          onUpdatePrivacy={(newMode) => {
            setData(prev => prev.map(l => l.id === listingToShare.id ? { ...l, privacyMode: newMode } : l));
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!listingToDelete}
        title="Delete Listing"
        message={
          <>
            Are you sure you want to remove the portal listing <strong>&ldquo;{listingToDelete?.title}&rdquo;</strong>?
            This will unsyndicate it from the partner portal.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Listing'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setListingToDelete(null)}
      />
    </>
  );
}
