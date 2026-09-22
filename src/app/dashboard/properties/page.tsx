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

interface Property {
  [key: string]: unknown;
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  status: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  areaSqFt?: number | string;
  listingType?: string;
  ownerName?: string;
  description?: string;
  publicToken?: string;
  privacyMode?: string;
  sharesCount?: number;
}

const PROPERTY_STATUSES = ['Available', 'Under Offer', 'Sold', 'Rented'];
const PROPERTY_TYPES = ['Villa', 'Apartment', 'Penthouse', 'Townhouse', 'Commercial Office', 'Plot'];

export default function PropertiesPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);

  const initialForm = {
    title: '',
    type: 'Villa',
    listingType: 'For Sale',
    location: '',
    price: '',
    bedrooms: '4',
    bathrooms: '3',
    areaSqFt: '2800',
    status: 'Available',
    ownerName: '',
    description: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/properties');
      const json = await res.json();
      if (json.properties) setData(json.properties);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadProperties();
  };

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    const res = await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProperty)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(p => p.id === editingProperty.id ? json.property : p));
      setEditingProperty(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
  };

  const handleDelete = (id: string, title: string) => {
    setPropertyToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/properties?id=${propertyToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(p => p.id !== propertyToDelete.id));
    }
    setIsDeleting(false);
    setPropertyToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(prop => {
      const matchesSearch = 
        !searchQuery.trim() ||
        prop.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || prop.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || prop.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [data, searchQuery, typeFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  const columns: Column<Property>[] = [
    { 
      key: 'title', 
      label: 'Property Details',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            🏡
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.title}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{r.location}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#334155' }}>
          {r.type}
        </span>
      )
    },
    {
      key: 'specs',
      label: 'Specs',
      render: (r) => (
        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', gap: '8px' }}>
          <span>🛏️ {r.bedrooms || 3} Beds</span>
          <span>🛁 {r.bathrooms || 2} Baths</span>
          <span>📐 {r.areaSqFt ? `${r.areaSqFt.toLocaleString()} sqft` : '2,200 sqft'}</span>
        </div>
      )
    },
    { 
      key: 'price', 
      label: 'Asking Price', 
      render: (r) => <span style={{ fontWeight: 700, color: '#0f172a' }}>${r.price.toLocaleString()}</span> 
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
            backgroundColor: r.status === 'Available' ? '#dcfce7' : r.status === 'Under Offer' ? '#fef3c7' : '#f1f5f9',
            color: r.status === 'Available' ? '#166534' : r.status === 'Under Offer' ? '#b45309' : '#334155',
            cursor: 'pointer'
          }}
        >
          {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setPropertyToShare(r)}
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
            title="Edit Property"
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
            title="Delete Property"
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
        title="Properties & Inventory" 
        subtitle="Manage available listings, specifications, marketing materials, and client shares" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Property</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search properties by title, location, or type..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'type',
            label: 'Property Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'All' },
              ...PROPERTY_TYPES.map(t => ({ label: t, value: t }))
            ]
          },
          {
            key: 'status',
            label: 'Availability',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...PROPERTY_STATUSES.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE PROPERTY MODAL */}
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Add New Property</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Title *</label>
                <input
                  required
                  placeholder="e.g. Royal Atlantis Luxury Penthouse"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Listing Type</label>
                  <select
                    value={form.listingType}
                    onChange={e => setForm({ ...form, listingType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option>For Sale</option>
                    <option>For Rent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Asking Price ($) *</label>
                  <input
                    required
                    type="number"
                    placeholder="2500000"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Location / Community *</label>
                  <input
                    required
                    placeholder="e.g. Palm Jumeirah, Dubai"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Bedrooms</label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Bathrooms</label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={e => setForm({ ...form, bathrooms: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    value={form.areaSqFt}
                    onChange={e => setForm({ ...form, areaSqFt: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Owner / Landlord</label>
                  <input
                    placeholder="e.g. Al Habtoor Group"
                    value={form.ownerName}
                    onChange={e => setForm({ ...form, ownerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Description</label>
                <textarea
                  rows={3}
                  placeholder="Architectural specs, panoramic sea views, smart home features..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Property</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Property: {editingProperty.title}</h3>
            <form onSubmit={handleUpdateProperty} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Title *</label>
                <input
                  required
                  value={editingProperty.title || ''}
                  onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Type</label>
                  <select
                    value={editingProperty.type}
                    onChange={e => setEditingProperty({ ...editingProperty, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingProperty.status}
                    onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Asking Price ($) *</label>
                  <input
                    required
                    type="number"
                    value={editingProperty.price || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Location / Community *</label>
                  <input
                    required
                    value={editingProperty.location || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Bedrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bedrooms || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Bathrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bathrooms || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    value={editingProperty.areaSqFt || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, areaSqFt: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Property Description</label>
                <textarea
                  rows={3}
                  value={editingProperty.description || ''}
                  onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingProperty(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {propertyToShare && (
        <ShareModal
          isOpen={!!propertyToShare}
          property={propertyToShare}
          propertyId={propertyToShare.id}
          propertyTitle={propertyToShare.title}
          publicToken={propertyToShare.publicToken || propertyToShare.id}
          price={propertyToShare.price}
          location={propertyToShare.location}
          currentPrivacyMode={propertyToShare.privacyMode || 'public'}
          onClose={() => setPropertyToShare(null)}
          onUpdatePrivacy={(newMode) => {
            setData(prev => prev.map(p => p.id === propertyToShare.id ? { ...p, privacyMode: newMode } : p));
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!propertyToDelete}
        title="Delete Property"
        message={
          <>
            Are you sure you want to delete the property <strong>&ldquo;{propertyToDelete?.title}&rdquo;</strong>?
            This will remove the listing and all syndication links.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Property'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPropertyToDelete(null)}
      />
    </>
  );
}
