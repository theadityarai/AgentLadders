'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

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
}

export default function PropertiesPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
          title="Delete Property"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Property Management" 
        subtitle="Manage agency property inventory, listings, and valuations" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Property</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search inventory by property title or location..."
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
              { label: 'Villa', value: 'Villa' },
              { label: 'Apartment', value: 'Apartment' },
              { label: 'House', value: 'House' },
              { label: 'Penthouse', value: 'Penthouse' },
              { label: 'Commercial', value: 'Commercial' }
            ]
          },
          {
            key: 'status',
            label: 'Availability',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Available', value: 'Available' },
              { label: 'Under Offer', value: 'Under Offer' },
              { label: 'Sold', value: 'Sold' },
              { label: 'Rented', value: 'Rented' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading properties...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No properties matched your search or filters"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Add New Property Asset</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Capture architectural specs, commercial terms, and listing details</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Property Title / Building Name *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Modern Waterfront Residence" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Property Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Villa</option>
                    <option>Apartment</option>
                    <option>Penthouse</option>
                    <option>House</option>
                    <option>Commercial Office</option>
                    <option>Townhouse</option>
                    <option>Land Plot</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Listing Type</label>
                  <select value={form.listingType} onChange={e => setForm({...form, listingType: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>For Sale</option>
                    <option>For Rent / Lease</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Inventory Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option>Available</option>
                    <option>Under Offer</option>
                    <option>Sold</option>
                    <option>Rented</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Physical Location / Address *</label>
                  <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Miami Beach, FL" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Asking Price ($) *</label>
                  <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. 1650000" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Bedrooms</label>
                  <input type="number" min="0" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Bathrooms</label>
                  <input type="number" min="0" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Area (Sq Ft)</label>
                  <input type="number" min="100" value={form.areaSqFt} onChange={e => setForm({...form, areaSqFt: e.target.value})} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Landlord / Asset Owner Name</label>
                <input value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} placeholder="e.g. Richard Davenport" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Key Features & Architectural Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ocean view terrace, infinity pool, floor-to-ceiling glass, smart home automation..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Property</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!propertyToDelete}
        title="Delete Property Listing"
        message={
          <>
            Are you sure you want to delete property <strong>&ldquo;{propertyToDelete?.title}&rdquo;</strong>? 
            This real estate asset will be removed from your catalog and active syndications.
          </>
        }
        confirmText="Delete Property"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPropertyToDelete(null)}
      />
    </>
  );
}
