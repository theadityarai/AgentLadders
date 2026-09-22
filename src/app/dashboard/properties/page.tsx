'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ShareModal } from '@/components/ui/ShareModal';
import Image from 'next/image';

export interface PropertyMedia {
  id: string;
  url: string;
  tag: string; // e.g. "Hall", "Master Bedroom", "Washroom", "Kitchen", "Balcony", "Floor Plan", or freetext
  caption?: string;
  isCover?: boolean;
}

export interface PropertyVideo {
  id: string;
  url: string;
  title?: string;
  type?: 'video' | '360_tour';
}

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
  images?: string[];
  media?: PropertyMedia[];
  videos?: PropertyVideo[];
  videoTourUrl?: string;
  virtualTourUrl?: string;
  publicToken?: string;
  privacyMode?: string;
  sharesCount?: number;
}

const PROPERTY_STATUSES = ['Available', 'Under Offer', 'Sold', 'Rented'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Commercial Office', 'Plot'];

const PRESET_ROOM_TAGS = [
  'Hall',
  'Master Bedroom',
  'Bedroom',
  'Kitchen',
  'Washroom',
  'Balcony',
  'Dining Room',
  'Exterior',
  'Floor Plan',
  'Terrace',
  'Amenities'
];

const DEMO_LUXURY_PHOTOS: PropertyMedia[] = [
  { id: 'm_demo_1', url: '/images/property_hero.jpg', tag: 'Exterior', isCover: true, caption: 'Architectural Facade' },
  { id: 'm_demo_2', url: '/images/deal_closing.jpg', tag: 'Hall', isCover: false, caption: 'Double-Height Living Great Room' },
  { id: 'm_demo_3', url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Primary Bedroom Suite with City Views' },
  { id: 'm_demo_4', url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'Designer Modular Kitchen with Island' },
  { id: 'm_demo_5', url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Luxury Marble Spa Bathroom' },
  { id: 'm_demo_6', url: '/images/hero_dashboard.jpg', tag: 'Balcony', isCover: false, caption: 'Private Sunset Balcony Lounge' }
];

export default function PropertiesPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [activePreviewTag, setActivePreviewTag] = useState<string>('All');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Tabbed workflow inside modals
  const [activeAddTab, setActiveAddTab] = useState<'basic' | 'specs' | 'media' | 'access'>('basic');
  const [activeEditTab, setActiveEditTab] = useState<'basic' | 'specs' | 'media' | 'access'>('basic');

  // URL input helper for photos
  const [addUrlInput, setAddUrlInput] = useState('');
  const [addUrlTag, setAddUrlTag] = useState('Hall');
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editUrlTag, setEditUrlTag] = useState('Hall');

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
    description: '',
    videoTourUrl: '',
    virtualTourUrl: '',
    media: [] as PropertyMedia[]
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

  // --- Photo Handling Helpers ---
  const handleFileUpload = (files: FileList | null, isEdit: boolean) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string;
        if (!resultUrl) return;

        const defaultTag = PRESET_ROOM_TAGS[i % PRESET_ROOM_TAGS.length];
        const newMediaItem: PropertyMedia = {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          url: resultUrl,
          tag: defaultTag,
          caption: `${defaultTag} View`,
          isCover: false
        };

        if (isEdit && editingProperty) {
          setEditingProperty(prev => {
            if (!prev) return null;
            const currentMedia = prev.media || [];
            const isFirst = currentMedia.length === 0;
            return {
              ...prev,
              media: [...currentMedia, { ...newMediaItem, isCover: isFirst }]
            };
          });
        } else {
          setForm(prev => {
            const currentMedia = prev.media || [];
            const isFirst = currentMedia.length === 0;
            return {
              ...prev,
              media: [...currentMedia, { ...newMediaItem, isCover: isFirst }]
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = (isEdit: boolean) => {
    const url = isEdit ? editUrlInput.trim() : addUrlInput.trim();
    const tag = isEdit ? editUrlTag : addUrlTag;
    if (!url) return;

    const newMediaItem: PropertyMedia = {
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      url,
      tag: tag || 'Hall',
      caption: `${tag} View`,
      isCover: false
    };

    if (isEdit && editingProperty) {
      setEditingProperty(prev => {
        if (!prev) return null;
        const currentMedia = prev.media || [];
        return {
          ...prev,
          media: [...currentMedia, { ...newMediaItem, isCover: currentMedia.length === 0 }]
        };
      });
      setEditUrlInput('');
    } else {
      setForm(prev => {
        const currentMedia = prev.media || [];
        return {
          ...prev,
          media: [...currentMedia, { ...newMediaItem, isCover: currentMedia.length === 0 }]
        };
      });
      setAddUrlInput('');
    }
  };

  const handleLoadDemoPhotos = (isEdit: boolean) => {
    if (isEdit && editingProperty) {
      setEditingProperty(prev => prev ? { ...prev, media: [...DEMO_LUXURY_PHOTOS] } : null);
    } else {
      setForm(prev => ({ ...prev, media: [...DEMO_LUXURY_PHOTOS] }));
    }
  };

  const handleUpdateMediaTag = (index: number, newTag: string, isEdit: boolean) => {
    if (isEdit && editingProperty) {
      setEditingProperty(prev => {
        if (!prev || !prev.media) return prev;
        const nextMedia = [...prev.media];
        nextMedia[index] = { ...nextMedia[index], tag: newTag };
        return { ...prev, media: nextMedia };
      });
    } else {
      setForm(prev => {
        const nextMedia = [...prev.media];
        nextMedia[index] = { ...nextMedia[index], tag: newTag };
        return { ...prev, media: nextMedia };
      });
    }
  };

  const handleSetCoverPhoto = (index: number, isEdit: boolean) => {
    if (isEdit && editingProperty) {
      setEditingProperty(prev => {
        if (!prev || !prev.media) return prev;
        const nextMedia = prev.media.map((m, i) => ({ ...m, isCover: i === index }));
        return { ...prev, media: nextMedia };
      });
    } else {
      setForm(prev => {
        const nextMedia = prev.media.map((m, i) => ({ ...m, isCover: i === index }));
        return { ...prev, media: nextMedia };
      });
    }
  };

  const handleRemovePhoto = (index: number, isEdit: boolean) => {
    if (isEdit && editingProperty) {
      setEditingProperty(prev => {
        if (!prev || !prev.media) return prev;
        const nextMedia = prev.media.filter((_, i) => i !== index);
        if (nextMedia.length > 0 && !nextMedia.some(m => m.isCover)) {
          nextMedia[0].isCover = true;
        }
        return { ...prev, media: nextMedia };
      });
    } else {
      setForm(prev => {
        const nextMedia = prev.media.filter((_, i) => i !== index);
        if (nextMedia.length > 0 && !nextMedia.some(m => m.isCover)) {
          nextMedia[0].isCover = true;
        }
        return { ...prev, media: nextMedia };
      });
    }
  };

  // Submit Add
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mediaToSave = form.media.length > 0 ? form.media : DEMO_LUXURY_PHOTOS;
    
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        media: mediaToSave,
        images: mediaToSave.map(m => m.url),
        listingType: form.purpose
      })
    });
    setShowAddModal(false);
    setForm(initialForm);
    setActiveAddTab('basic');
    loadProperties();
  };

  // Open Edit
  const handleOpenEdit = (property: Property) => {
    const existingMedia = property.media && property.media.length > 0 
      ? property.media 
      : (property.images || []).map((img, i) => ({
          id: `m_${i}`,
          url: img,
          tag: i === 0 ? 'Exterior' : (i === 1 ? 'Hall' : (i === 2 ? 'Master Bedroom' : (i === 3 ? 'Kitchen' : 'Washroom'))),
          isCover: i === 0,
          caption: `${property.title} Photo`
        }));

    setEditingProperty({
      ...property,
      media: existingMedia,
      videoTourUrl: property.videoTourUrl || 'https://www.youtube.com/watch?v=ScMzIvxBSi4'
    });
    setActiveEditTab('basic');
  };

  // Submit Edit
  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    
    const mediaToSave = editingProperty.media && editingProperty.media.length > 0
      ? editingProperty.media
      : DEMO_LUXURY_PHOTOS;

    const payload = {
      ...editingProperty,
      media: mediaToSave,
      images: mediaToSave.map(m => m.url)
    };

    const res = await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setData(prev => prev.map(p => p.id === editingProperty.id ? { ...p, ...payload } : p));
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

  // WhatsApp 1-Click Share
  const handleWhatsAppShare = (prop: Property) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicUrl = `${origin}/p/${prop.publicToken || prop.id}`;
    
    const tagsList = prop.media && prop.media.length > 0
      ? Array.from(new Set(prop.media.map(m => m.tag))).join(', ')
      : 'Hall, Master Bedroom, Modular Kitchen, Luxury Washroom';

    const text = `🏡 *Exclusive Real Estate Listing*\n\n` +
      `*${prop.title}*\n` +
      `💰 *Price*: $${Number(prop.price).toLocaleString()} (${prop.purpose || 'For Sale'})\n` +
      `📍 *Location*: ${prop.location}\n` +
      `📐 *Specs*: ${prop.bedrooms || 3} BHK | ${prop.bathrooms || 2} Baths | Carpet: ${prop.carpetAreaSqFt || prop.areaSqFt} sq ft (${prop.furnishing || 'Semi-Furnished'})\n` +
      `📸 *Tagged Photos*: ${tagsList}\n` +
      (prop.videoTourUrl ? `🎥 *Video Walkthrough*: ${prop.videoTourUrl}\n` : '') +
      `\n🔗 *View Interactive Brochure & Gallery*:\n${publicUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
      header: 'Property & Tagged Media',
      accessor: (row) => {
        const isRent = row.purpose === 'For Rent' || row.listingType === 'For Rent';
        const coverMedia = (row.media && row.media.find(m => m.isCover)) || (row.media && row.media[0]);
        const coverUrl = coverMedia?.url || (row.images && row.images[0]) || '/images/property_hero.jpg';
        const photosCount = row.media?.length || row.images?.length || 0;
        const hasVideo = !!row.videoTourUrl || (row.videos && row.videos.length > 0);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Clickable Image Thumbnail with Tag & Count Badge */}
            <div 
              onClick={() => {
                setPreviewProperty(row);
                setActivePreviewTag('All');
                setActivePreviewIndex(0);
              }}
              style={{
                position: 'relative',
                width: '74px',
                height: '62px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                cursor: 'pointer',
                flexShrink: 0,
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              title="Click to view full tagged photo gallery"
            >
              <Image
                src={coverUrl}
                alt={row.title}
                fill
                sizes="74px"
                style={{ objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#fff',
                fontSize: '9.5px',
                fontWeight: 700,
                padding: '2px 4px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                📷 {photosCount} {hasVideo ? '• 🎥' : ''}
              </div>
            </div>

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
          </div>
        );
      }
    },
    {
      header: 'Price & Furnishing',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14.5px' }}>
            ${row.price?.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
            {row.furnishing || 'Semi-Furnished'}
          </div>
        </div>
      )
    },
    {
      header: 'Specs & Carpet Area',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
            {row.bedrooms || 3} Beds &bull; {row.bathrooms || 2} Baths
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            📐 Carpet: <strong style={{ color: '#0f172a' }}>{row.carpetAreaSqFt || (row.areaSqFt ? Math.round(Number(row.areaSqFt) * 0.8) : 1440)}</strong> sq ft
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Built-up: {row.areaSqFt || 1800} sq ft &bull; {row.parking || 1} Parking
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
          
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={() => handleWhatsAppShare(row)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Send tagged property brochure directly to client on WhatsApp"
          >
            <span>💬</span> WhatsApp
          </button>

          {/* Share Modal Trigger */}
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
            title="Share options, QR Code, and Client Link"
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
        subtitle="Single unified inventory hub with tagged room photos (Hall, Bedroom, Kitchen, Washroom), 4K video tours, and client brochure sharing"
        actions={
          <Button variant="primary" onClick={() => { setShowAddModal(true); setActiveAddTab('basic'); }}>
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

      {/* ======================================================== */}
      {/* MODAL 1: ADD PROPERTY (TABBED WORKFLOW) */}
      {/* ======================================================== */}
      {showAddModal && (
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
            maxWidth: '820px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Onboard Property Listing</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Complete architectural specifications, tagged room photos, and showing coordination</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            {/* TAB BAR */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '0 24px' }}>
              <button
                type="button"
                onClick={() => setActiveAddTab('basic')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeAddTab === 'basic' ? 700 : 500,
                  color: activeAddTab === 'basic' ? '#2563eb' : '#64748b',
                  borderBottom: activeAddTab === 'basic' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📌 1. Basic & Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveAddTab('specs')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeAddTab === 'specs' ? 700 : 500,
                  color: activeAddTab === 'specs' ? '#2563eb' : '#64748b',
                  borderBottom: activeAddTab === 'specs' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📐 2. Specs & Location
              </button>
              <button
                type="button"
                onClick={() => setActiveAddTab('media')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeAddTab === 'media' ? 700 : 500,
                  color: activeAddTab === 'media' ? '#2563eb' : '#64748b',
                  borderBottom: activeAddTab === 'media' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📸 3. Photos & Media
                <span style={{
                  backgroundColor: form.media.length > 0 ? '#dbeafe' : '#f1f5f9',
                  color: form.media.length > 0 ? '#1d4ed8' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {form.media.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveAddTab('access')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeAddTab === 'access' ? 700 : 500,
                  color: activeAddTab === 'access' ? '#2563eb' : '#64748b',
                  borderBottom: activeAddTab === 'access' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔑 4. Access & Showing Notes
              </button>
            </div>

            {/* TAB CONTENTS */}
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              
              {/* TAB 1: BASIC & PRICING */}
              {activeAddTab === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property Title *</label>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Inventory Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Listing Description / Overview</label>
                    <textarea
                      rows={3}
                      placeholder="Architectural features, views, luxury upgrades, and key selling propositions..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <Button variant="primary" type="button" onClick={() => setActiveAddTab('specs')}>
                      Next: Specifications &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS & LOCATION */}
              {activeAddTab === 'specs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Locality / Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 740 Park Avenue, Upper East Side, Manhattan, NY"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Carpet Area (Sq Ft) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={form.carpetAreaSqFt}
                      onChange={e => setForm({ ...form, carpetAreaSqFt: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Built-Up Area (Sq Ft)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1900"
                      value={form.areaSqFt}
                      onChange={e => setForm({ ...form, areaSqFt: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Furnishing Status</label>
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

                  <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveAddTab('basic')}>
                      &larr; Back
                    </Button>
                    <Button variant="primary" type="button" onClick={() => setActiveAddTab('media')}>
                      Next: Photos & Videos &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTOS & VIDEOS (THE CORE USER REQUIREMENT) */}
              {activeAddTab === 'media' && (
                <div>
                  {/* Info Header Banner */}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                        📸 Tagged Room Photos & 🎥 Video Tours
                      </div>
                      <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                        Tag each photo with its exact room label (Hall, Master Bedroom, Washroom, Kitchen, Balcony) or type a custom free-text tag.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadDemoPhotos(false)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ⚡ Load Luxury Demo Photos
                    </button>
                  </div>

                  {/* UPLOAD & ADD OPTIONS */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1'
                  }}>
                    {/* File Dropzone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        📁 Upload Files from Device
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="add-file-input"
                        onChange={(e) => handleFileUpload(e.target.files, false)}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="add-file-input"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '18px 12px',
                          border: '2px dashed #94a3b8',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontSize: '24px', marginBottom: '4px' }}>🖼️</span>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563eb' }}>Click to Browse or Drag Photos Here</span>
                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Supports JPG, PNG, WEBP with instant preview</span>
                      </label>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        🌐 Or Add Image via URL
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={addUrlInput}
                          onChange={e => setAddUrlInput(e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <select
                          value={addUrlTag}
                          onChange={e => setAddUrlTag(e.target.value)}
                          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        >
                          {PRESET_ROOM_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddUrlImage(false)}
                        style={{ width: '100%', fontSize: '12px' }}
                      >
                        + Add Image URL
                      </Button>
                    </div>
                  </div>

                  {/* VIDEO TOUR URLS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        🎥 4K Video Walkthrough URL (YouTube, Vimeo, MP4)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=ScMzIvxBSi4"
                        value={form.videoTourUrl}
                        onChange={e => setForm({ ...form, videoTourUrl: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        🌐 360° Virtual Tour Link (Matterport / Kuula)
                      </label>
                      <input
                        type="url"
                        placeholder="https://my.matterport.com/show/?m=..."
                        value={form.virtualTourUrl}
                        onChange={e => setForm({ ...form, virtualTourUrl: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  {/* UPLOADED PHOTO CARDS WITH TAG OPTIONS */}
                  <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Attached Photos & Room Tagging ({form.media.length})
                    </div>
                    {form.media.length > 0 && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        ⭐ Star indicates the main cover listing photo
                      </span>
                    )}
                  </div>

                  {form.media.length === 0 ? (
                    <div style={{
                      padding: '30px',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px dashed #cbd5e1',
                      color: '#64748b',
                      fontSize: '13px'
                    }}>
                      No photos added yet. Upload files above or click <strong>&quot;⚡ Load Luxury Demo Photos&quot;</strong> to start with tagged Hall, Bedroom, Kitchen, and Washroom photos.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                      {form.media.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            border: item.isCover ? '2px solid #eab308' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            boxShadow: item.isCover ? '0 4px 6px -1px rgba(234, 179, 8, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Image preview */}
                          <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: '#0f172a' }}>
                            <Image
                              src={item.url}
                              alt={item.tag}
                              fill
                              sizes="240px"
                              style={{ objectFit: 'cover' }}
                            />
                            {item.isCover && (
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                backgroundColor: '#eab308',
                                color: '#000',
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}>
                                ⭐ Cover Photo
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx, false)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete Photo"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Tag & Label Controls */}
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            {/* Free-text Tag Input */}
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                🏷️ Room Tag (Free-Text):
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Hall, Washroom, Balcony..."
                                value={item.tag}
                                onChange={(e) => handleUpdateMediaTag(idx, e.target.value, false)}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#1d4ed8',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px'
                                }}
                              />
                            </div>

                            {/* Quick Select Preset Pills */}
                            <div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                                Quick Tag:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {['Hall', 'Master Bedroom', 'Kitchen', 'Washroom', 'Balcony'].map(pill => (
                                  <button
                                    key={pill}
                                    type="button"
                                    onClick={() => handleUpdateMediaTag(idx, pill, false)}
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: item.tag === pill ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                      backgroundColor: item.tag === pill ? '#2563eb' : '#f8fafc',
                                      color: item.tag === pill ? '#fff' : '#64748b',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {pill}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Cover Toggle Button */}
                            <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                              {!item.isCover ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverPhoto(idx, false)}
                                  style={{
                                    width: '100%',
                                    padding: '5px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ⭐ Set as Cover
                                </button>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#ca8a04', fontWeight: 700, textAlign: 'center' }}>
                                  ✓ Primary Cover Selected
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveAddTab('specs')}>
                      &larr; Back
                    </Button>
                    <Button variant="primary" type="button" onClick={() => setActiveAddTab('access')}>
                      Next: Showing & Access Notes &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 4: ACCESS & SHOWING NOTES */}
              {activeAddTab === 'access' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Seller Phone (WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={form.sellerPhone}
                      onChange={e => setForm({ ...form, sellerPhone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      🔑 Lockbox Code & Showing Access Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lockbox #4821 on front door. Keys with building concierge; call 2 hours prior."
                      value={form.keyLocationNotes}
                      onChange={e => setForm({ ...form, keyLocationNotes: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveAddTab('media')}>
                      &larr; Back
                    </Button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" type="submit">
                        ✓ Save & Publish Property
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT PROPERTY (WITH FULL PHOTO & TAGGING SUPPORT) */}
      {/* ======================================================== */}
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
            maxWidth: '820px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Property: {editingProperty.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update specs, tagged photos, video tours, and status</p>
              </div>
              <button onClick={() => setEditingProperty(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            {/* TAB BAR */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '0 24px' }}>
              <button
                type="button"
                onClick={() => setActiveEditTab('basic')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeEditTab === 'basic' ? 700 : 500,
                  color: activeEditTab === 'basic' ? '#2563eb' : '#64748b',
                  borderBottom: activeEditTab === 'basic' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📌 1. Basic & Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('specs')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeEditTab === 'specs' ? 700 : 500,
                  color: activeEditTab === 'specs' ? '#2563eb' : '#64748b',
                  borderBottom: activeEditTab === 'specs' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📐 2. Specs & Location
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('media')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeEditTab === 'media' ? 700 : 500,
                  color: activeEditTab === 'media' ? '#2563eb' : '#64748b',
                  borderBottom: activeEditTab === 'media' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📸 3. Photos & Media
                <span style={{
                  backgroundColor: (editingProperty.media?.length || 0) > 0 ? '#dbeafe' : '#f1f5f9',
                  color: (editingProperty.media?.length || 0) > 0 ? '#1d4ed8' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {editingProperty.media?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEditTab('access')}
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: activeEditTab === 'access' ? 700 : 500,
                  color: activeEditTab === 'access' ? '#2563eb' : '#64748b',
                  borderBottom: activeEditTab === 'access' ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔑 4. Access & Notes
              </button>
            </div>

            {/* TAB CONTENTS */}
            <form onSubmit={handleUpdateProperty} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              
              {/* TAB 1: BASIC & PRICING */}
              {activeEditTab === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property Title</label>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Status</label>
                    <select
                      value={editingProperty.status}
                      onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <Button variant="primary" type="button" onClick={() => setActiveEditTab('specs')}>
                      Next: Specifications &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS */}
              {activeEditTab === 'specs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Location / Address</label>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Parking Spots</label>
                    <input
                      type="number"
                      value={editingProperty.parking !== undefined ? editingProperty.parking : 1}
                      onChange={e => setEditingProperty({ ...editingProperty, parking: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Carpet Area (Sq Ft)</label>
                    <input
                      type="number"
                      value={editingProperty.carpetAreaSqFt || (editingProperty.areaSqFt ? Math.round(Number(editingProperty.areaSqFt) * 0.8) : 1440)}
                      onChange={e => setEditingProperty({ ...editingProperty, carpetAreaSqFt: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Built-Up Area (Sq Ft)</label>
                    <input
                      type="number"
                      value={editingProperty.areaSqFt || 1800}
                      onChange={e => setEditingProperty({ ...editingProperty, areaSqFt: parseInt(e.target.value) || 0 })}
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

                  <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveEditTab('basic')}>
                      &larr; Back
                    </Button>
                    <Button variant="primary" type="button" onClick={() => setActiveEditTab('media')}>
                      Next: Photos & Videos &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTOS & VIDEOS (EDITING) */}
              {activeEditTab === 'media' && (
                <div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                        📸 Tagged Room Photos & 🎥 Video Tours
                      </div>
                      <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                        Modify room labels (Hall, Master Bedroom, Kitchen, Washroom) or type custom free-text tags.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadDemoPhotos(true)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ⚡ Reset to Luxury Demo Photos
                    </button>
                  </div>

                  {/* UPLOAD & ADD OPTIONS */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1'
                  }}>
                    {/* File Dropzone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        📁 Add More Photos from Computer
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="edit-file-input"
                        onChange={(e) => handleFileUpload(e.target.files, true)}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="edit-file-input"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '18px 12px',
                          border: '2px dashed #94a3b8',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <span style={{ fontSize: '24px', marginBottom: '4px' }}>🖼️</span>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563eb' }}>Click to Browse New Photos</span>
                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Instant base64 preview</span>
                      </label>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        🌐 Add via Image URL
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={editUrlInput}
                          onChange={e => setEditUrlInput(e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        />
                        <select
                          value={editUrlTag}
                          onChange={e => setEditUrlTag(e.target.value)}
                          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                        >
                          {PRESET_ROOM_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddUrlImage(true)}
                        style={{ width: '100%', fontSize: '12px' }}
                      >
                        + Add Image URL
                      </Button>
                    </div>
                  </div>

                  {/* VIDEO TOUR URLS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        🎥 4K Video Walkthrough URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={editingProperty.videoTourUrl || ''}
                        onChange={e => setEditingProperty({ ...editingProperty, videoTourUrl: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        🌐 360° Virtual Tour Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://my.matterport.com/..."
                        value={editingProperty.virtualTourUrl || ''}
                        onChange={e => setEditingProperty({ ...editingProperty, virtualTourUrl: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  {/* PHOTO CARDS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {(editingProperty.media || []).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          border: item.isCover ? '2px solid #eab308' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: '#0f172a' }}>
                          <Image
                            src={item.url}
                            alt={item.tag}
                            fill
                            sizes="240px"
                            style={{ objectFit: 'cover' }}
                          />
                          {item.isCover && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              backgroundColor: '#eab308',
                              color: '#000',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '4px'
                            }}>
                              ⭐ Cover Photo
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx, true)}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                          {/* Free-text Tag Input */}
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              🏷️ Room Tag (Free-Text):
                            </label>
                            <input
                              type="text"
                              value={item.tag}
                              onChange={(e) => handleUpdateMediaTag(idx, e.target.value, true)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#1d4ed8',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px'
                              }}
                            />
                          </div>

                          {/* Quick Preset Buttons */}
                          <div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Quick Tag:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {['Hall', 'Master Bedroom', 'Kitchen', 'Washroom', 'Balcony'].map(pill => (
                                <button
                                  key={pill}
                                  type="button"
                                  onClick={() => handleUpdateMediaTag(idx, pill, true)}
                                  style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: item.tag === pill ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                    backgroundColor: item.tag === pill ? '#2563eb' : '#f8fafc',
                                    color: item.tag === pill ? '#fff' : '#64748b',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {pill}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                            {!item.isCover ? (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(idx, true)}
                                style={{
                                  width: '100%',
                                  padding: '5px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#f8fafc',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ⭐ Set as Cover
                              </button>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#ca8a04', fontWeight: 700, textAlign: 'center' }}>
                                ✓ Primary Cover
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveEditTab('specs')}>
                      &larr; Back
                    </Button>
                    <Button variant="primary" type="button" onClick={() => setActiveEditTab('access')}>
                      Next: Showing & Access Notes &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 4: ACCESS & NOTES */}
              {activeEditTab === 'access' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Seller / Landlord Name</label>
                    <input
                      type="text"
                      value={editingProperty.sellerName || editingProperty.ownerName || ''}
                      onChange={e => setEditingProperty({ ...editingProperty, sellerName: e.target.value, ownerName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Seller Phone (WhatsApp)</label>
                    <input
                      type="tel"
                      value={editingProperty.sellerPhone || ''}
                      onChange={e => setEditingProperty({ ...editingProperty, sellerPhone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Lockbox Code & Showing Notes</label>
                    <input
                      type="text"
                      value={editingProperty.keyLocationNotes || ''}
                      onChange={e => setEditingProperty({ ...editingProperty, keyLocationNotes: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveEditTab('media')}>
                      &larr; Back
                    </Button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="outline" type="button" onClick={() => setEditingProperty(null)}>
                        Cancel
                      </Button>
                      <Button variant="primary" type="submit">
                        ✓ Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INTERACTIVE DASHBOARD PHOTO GALLERY PREVIEW */}
      {/* ======================================================== */}
      {previewProperty && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.92)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          {(() => {
            const mediaList: PropertyMedia[] = (previewProperty.media && previewProperty.media.length > 0)
              ? previewProperty.media
              : (previewProperty.images || []).map((img, i) => ({
                  id: `img_${i}`,
                  url: img,
                  tag: i === 0 ? 'Exterior' : (i === 1 ? 'Hall' : (i === 2 ? 'Master Bedroom' : (i === 3 ? 'Kitchen' : 'Washroom'))),
                  isCover: i === 0,
                  caption: ''
                }));
            const uniqueTags = Array.from(new Set(mediaList.map(m => m.tag))).filter(Boolean);
            const filteredMedia = activePreviewTag === 'All'
              ? mediaList
              : mediaList.filter(m => m.tag === activePreviewTag);
            const currentItem = filteredMedia[activePreviewIndex] || filteredMedia[0] || mediaList[0];

            return (
              <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                      📸 {previewProperty.title} &bull; Tagged Gallery
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                      📍 {previewProperty.location} &bull; ${previewProperty.price?.toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppShare(previewProperty)}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      💬 WhatsApp Brochure
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewProperty(null)}
                      style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                </div>

                {/* Tag Filter Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setActivePreviewTag('All'); setActivePreviewIndex(0); }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: activePreviewTag === 'All' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    All ({mediaList.length})
                  </button>
                  {uniqueTags.map(tag => {
                    const count = mediaList.filter(m => m.tag === tag).length;
                    const isSelected = activePreviewTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => { setActivePreviewTag(tag); setActivePreviewIndex(0); }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: isSelected ? 700 : 500,
                          backgroundColor: isSelected ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        🏷️ {tag} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Main Image Stage */}
                <div style={{ position: 'relative', width: '100%', height: '58vh', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
                  <Image
                    src={currentItem?.url || '/images/property_hero.jpg'}
                    alt={currentItem?.tag || 'Property Image'}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                  {/* Tag Pill Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    🏷️ {currentItem?.tag || 'Property Photo'}
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {currentItem?.caption || currentItem?.tag || ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setActivePreviewIndex(prev => prev > 0 ? prev - 1 : filteredMedia.length - 1)}
                      style={{ padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      &larr; Prev
                    </button>
                    <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                      {activePreviewIndex + 1} / {filteredMedia.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePreviewIndex(prev => prev < filteredMedia.length - 1 ? prev + 1 : 0)}
                      style={{ padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
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
