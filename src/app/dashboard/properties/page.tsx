'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ShareModal } from '@/components/ui/ShareModal';
import Link from 'next/link';

interface Property {
  [key: string]: unknown;
  id: string;
  title: string;
  type: string;
  purpose?: 'For Sale' | 'For Rent';
  location: string;
  price: number;
  status: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  areaSqFt?: number | string;
  carpetAreaSqFt?: number | string;
  furnishing?: string;
  parking?: number | string;
  sellerName?: string;
  sellerPhone?: string;
  keyLocationNotes?: string;
  listingType?: string;
  ownerName?: string;
  description?: string;
  publicToken?: string;
  privacyMode?: string;
  sharesCount?: number;
}

const PROPERTY_STATUSES = ['Available', 'Under Offer', 'Sold', 'Rented'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Commercial Office', 'Plot'];

export default function PropertiesPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);

  const initialForm = {
    title: '',
    purpose: 'For Sale',
    type: 'Apartment',
    location: '',
    price: '',
    bedrooms: '3',
    bathrooms: '2',
    areaSqFt: '1800',
    carpetAreaSqFt: '1450',
    furnishing: 'Semi-Furnished',
    parking: '1',
    sellerName: '',
    sellerPhone: '',
    keyLocationNotes: 'Keys with building concierge; call 2 hours before showing.',
    status: 'Available',
    description: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('All');
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
      body: JSON.stringify({
        ...form,
        listingType: form.purpose
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadProperties();
  };

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
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
      setData(prev => prev.map(p => p.id === editingProperty.id ? { ...p, ...editingProperty } : p));
      setEditingProperty(null);
    }
  };

  const handleQuickStatusChange = async (propertyId: string, newStatus: string) => {
    setData(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
    await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: propertyId, status: newStatus })
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
    return data.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPurpose = purposeFilter === 'All' || item.purpose === purposeFilter || item.listingType === purposeFilter;
      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPurpose && matchesStatus;
    });
  }, [data, searchQuery, purposeFilter, statusFilter]);

  const columns: Column<Property>[] = [
    {
      header: 'Property & Purpose',
      accessor: (row) => {
        const isRent = row.purpose === 'For Rent' || row.listingType === 'For Rent';
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: isRent ? '#f3e8ff' : '#ecfdf5',
                color: isRent ? '#7e22ce' : '#047857',
                border: `1px solid ${isRent ? '#d8b4fe' : '#a7f3d0'}`
              }}>
                {isRent ? 'For Rent' : 'For Sale'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{row.type}</span>
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.title}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>📍 {row.location}</div>
          </div>
        );
      }
    },
    {
      header: 'Price & Furnishing',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
            ${row.price?.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
            {row.furnishing || 'Semi-Furnished'}
          </div>
        </div>
      )
    },
    {
      header: 'Specifications',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
            {row.bedrooms || 3} Beds &bull; {row.bathrooms || 2} Baths
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Built: {row.areaSqFt || 1800} sq ft {row.carpetAreaSqFt ? `(Carpet: ${row.carpetAreaSqFt} sq ft)` : ''}
          </div>
        </div>
      )
    },
    {
      header: 'Showing Instructions',
      accessor: (row) => (
        <div style={{ maxWidth: '200px' }}>
          <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500, lineHeight: 1.3 }}>
            {row.keyLocationNotes || (row.ownerName ? `Contact: ${row.ownerName}` : 'Keys with concierge')}
          </div>
          {row.sellerPhone && (
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              📞 {row.sellerPhone}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Inventory Status',
      accessor: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleQuickStatusChange(row.id, e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: row.status === 'Available' ? '#ecfdf5' : row.status === 'Sold' ? '#f1f5f9' : '#fffbeb',
            color: row.status === 'Available' ? '#047857' : row.status === 'Sold' ? '#475569' : '#b45309',
            cursor: 'pointer'
          }}
        >
          {PROPERTY_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          
          {/* Share Button */}
          <button
            type="button"
            onClick={() => setPropertyToShare(row)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Share via WhatsApp, Telegram, QR code, or client link"
          >
            <span>🔗</span> Share
          </button>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            style={{ fontSize: '11.5px', padding: '3px 8px' }}
          >
            ✏️ Edit
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.title)}
            style={{ color: '#ef4444', fontSize: '12px', padding: '3px 6px' }}
          >
            🗑️
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Properties Inventory"
        subtitle="Exclusive agency listings, architectural specifications, showing notes, and multi-channel marketing"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Add Property Listing
          </Button>
        }
      />

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search properties by title, location, or type..."
        filters={[
          {
            key: 'purpose',
            label: 'Purpose',
            value: purposeFilter,
            options: [
              { label: 'All (Sale & Rent)', value: 'All' },
              { label: 'For Sale', value: 'For Sale' },
              { label: 'For Rent', value: 'For Rent' }
            ],
            onChange: setPurposeFilter
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...PROPERTY_STATUSES.map(s => ({ label: s, value: s }))
            ],
            onChange: setStatusFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setPurposeFilter('All');
          setStatusFilter('All');
        }}
      />

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No properties match your filter. Click '+ Add Property Listing' to onboard an inventory unit."
      />

      {/* MODAL: ADD PROPERTY */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Onboard Property Listing</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Complete architectural specs and client showing coordination</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              
              {/* SECTION 1: IDENTITY */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                1. Property Identity & Pricing
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Listing Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Signature Penthouse with Private Terrace"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Transaction Purpose</label>
                  <select
                    value={form.purpose}
                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Asking Price ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2400000"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Locality / Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beverly Hills, CA"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* SECTION 2: SPECS */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                2. Architectural Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Bedrooms</label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Bathrooms</label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={e => setForm({ ...form, bathrooms: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Parking Spots</label>
                  <input
                    type="number"
                    value={form.parking}
                    onChange={e => setForm({ ...form, parking: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Built-up Sq Ft</label>
                  <input
                    type="number"
                    value={form.areaSqFt}
                    onChange={e => setForm({ ...form, areaSqFt: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Carpet Area Sq Ft</label>
                  <input
                    type="number"
                    value={form.carpetAreaSqFt}
                    onChange={e => setForm({ ...form, carpetAreaSqFt: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Furnishing</label>
                  <select
                    value={form.furnishing}
                    onChange={e => setForm({ ...form, furnishing: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Fully Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished / Bare Shell</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: SHOWINGS & SELLER */}
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                3. Showing Instructions & Owner Coordination
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Seller / Landlord Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Richard Hendricks"
                    value={form.sellerName}
                    onChange={e => setForm({ ...form, sellerName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Seller Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={form.sellerPhone}
                    onChange={e => setForm({ ...form, sellerPhone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Key & Viewing Coordination Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Keys with front desk. Call 2 hours in advance. Do not disturb tenants on weekdays."
                    value={form.keyLocationNotes}
                    onChange={e => setForm({ ...form, keyLocationNotes: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Property</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROPERTY */}
      {editingProperty && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Property: {editingProperty.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update pricing, specs, and status</p>
              </div>
              <button onClick={() => setEditingProperty(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateProperty} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Title</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.title}
                    onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Purpose</label>
                  <select
                    value={editingProperty.purpose || editingProperty.listingType || 'For Sale'}
                    onChange={e => setEditingProperty({ ...editingProperty, purpose: e.target.value as any, listingType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Type</label>
                  <select
                    value={editingProperty.type}
                    onChange={e => setEditingProperty({ ...editingProperty, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Price ($)</label>
                  <input
                    type="number"
                    value={editingProperty.price}
                    onChange={e => setEditingProperty({ ...editingProperty, price: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Location</label>
                  <input
                    type="text"
                    value={editingProperty.location}
                    onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Bedrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bedrooms || 3}
                    onChange={e => setEditingProperty({ ...editingProperty, bedrooms: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Bathrooms</label>
                  <input
                    type="number"
                    value={editingProperty.bathrooms || 2}
                    onChange={e => setEditingProperty({ ...editingProperty, bathrooms: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Furnishing</label>
                  <select
                    value={editingProperty.furnishing || 'Semi-Furnished'}
                    onChange={e => setEditingProperty({ ...editingProperty, furnishing: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option>Fully Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished / Bare Shell</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Status</label>
                  <select
                    value={editingProperty.status}
                    onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Key & Showing Notes</label>
                  <input
                    type="text"
                    value={editingProperty.keyLocationNotes || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, keyLocationNotes: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setEditingProperty(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
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
        message={`Are you sure you want to permanently delete "${propertyToDelete?.title}"?`}
        confirmText="Delete Property"
        danger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPropertyToDelete(null)}
      />
    </>
  );
}
