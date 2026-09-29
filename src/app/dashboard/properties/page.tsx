'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ShareModal } from '@/components/ui/ShareModal';
import Image from 'next/image';
import {
  formatINR,
  TOP_INDIAN_CITIES,
  CITY_LOCALITIES,
  INDIAN_BHK_OPTIONS,
  VASTU_FACINGS,
  POSSESSION_STAGES
} from '@/lib/formatters';
import { findMatchingLeadsForProperty } from '@/lib/match-engine';
import { openWhatsAppDirect, generatePropertyPitchWhatsApp } from '@/lib/whatsapp-engine';

export interface PropertyMedia {
  id: string;
  url: string;
  tag: string;
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
  bhk?: string;
  purpose?: 'For Sale' | 'For Rent';
  city?: string;
  locality?: string;
  subLocality?: string;
  location: string;
  price: number;
  status: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  areaSqFt?: number | string;
  carpetAreaSqFt?: number | string;
  floor?: string;
  vastuFacing?: string;
  reraId?: string;
  possessionStatus?: string;
  possessionDate?: string;
  maintenanceMonthly?: number;
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

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  leadPurpose?: 'Buy' | 'Rent';
  city?: string;
  preferredLocalities?: string[] | string;
  bhkNeeded?: string | string[];
  budgetMin?: number | string;
  budgetMax?: number | string;
  budget?: string;
  financingStatus?: string;
  urgency?: string;
  requirement?: string;
}

const PROPERTY_STATUSES = ['Available', 'Under Offer', 'Sold', 'Rented'];
const PROPERTY_TYPES = [
  'Apartment',
  'Penthouse',
  'Independent Villa / Bungalow',
  'Builder Floor',
  'Commercial Office',
  'Retail Showroom',
  'Residential Plot'
];

const PRESET_ROOM_TAGS = [
  'Exterior / Facade',
  'Hall / Living Area',
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Kitchen',
  'Washroom',
  'Balcony / Deck',
  'Dining Area',
  'Floor Plan',
  'Society Amenities'
];

const DEMO_LUXURY_PHOTOS: PropertyMedia[] = [
  { id: 'm_demo_1', url: '/images/property_hero.jpg', tag: 'Exterior / Facade', isCover: true, caption: 'Grand Architectural Facade' },
  { id: 'm_demo_2', url: '/images/deal_closing.jpg', tag: 'Hall / Living Area', isCover: false, caption: 'Double-Height Living Great Room' },
  { id: 'm_demo_3', url: '/images/luxury_bedroom.jpg', tag: 'Master Bedroom', isCover: false, caption: 'Presidential Master Suite with Skyline Panorama' },
  { id: 'm_demo_4', url: '/images/luxury_kitchen.jpg', tag: 'Kitchen', isCover: false, caption: 'Designer Modular Kitchen with Island' },
  { id: 'm_demo_5', url: '/images/luxury_washroom.jpg', tag: 'Washroom', isCover: false, caption: 'Luxury Marble Spa Bathroom' },
  { id: 'm_demo_6', url: '/images/hero_dashboard.jpg', tag: 'Balcony / Deck', isCover: false, caption: 'Private Sunset Balcony Deck' }
];

export default function PropertiesPage() {
  const [data, setData] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [activePreviewTag, setActivePreviewTag] = useState<string>('All');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Matching Buyers Drawer / Modal
  const [matchingModalProperty, setMatchingModalProperty] = useState<Property | null>(null);

  // Tabbed workflow inside modals
  const [activeAddTab, setActiveAddTab] = useState<'basic' | 'specs' | 'media' | 'access'>('basic');
  const [activeEditTab, setActiveEditTab] = useState<'basic' | 'specs' | 'media' | 'access'>('basic');

  // URL input helper for photos
  const [addUrlInput, setAddUrlInput] = useState('');
  const [addUrlTag, setAddUrlTag] = useState('Hall / Living Area');
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editUrlTag, setEditUrlTag] = useState('Hall / Living Area');

  const initialForm = {
    title: '',
    purpose: 'For Sale',
    type: 'Apartment',
    bhk: '3 BHK',
    city: 'Mumbai',
    locality: 'Worli',
    subLocality: '',
    location: 'Worli, Mumbai',
    price: '35000000',
    bedrooms: '3',
    bathrooms: '3',
    areaSqFt: '2200',
    carpetAreaSqFt: '1750',
    floor: '18th of 35 Floors',
    vastuFacing: 'East Facing (Vastu Compliant)',
    reraId: '',
    possessionStatus: 'Ready to Move (OC Received)',
    possessionDate: '',
    maintenanceMonthly: '12000',
    furnishing: 'Semi-Furnished',
    parking: '2 Covered Reserved',
    sellerName: '',
    sellerPhone: '',
    keyLocationNotes: 'Keys with building security desk; call 2 hours prior to showing.',
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
  const [cityFilter, setCityFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadProperties = async () => {
    setLoading(true);
    try {
      const [propsRes, leadsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/leads')
      ]);

      const propsJson = await propsRes.json();
      const leadsJson = await leadsRes.json();

      if (propsJson.properties) setData(propsJson.properties);
      if (leadsJson.leads) setLeads(leadsJson.leads);
    } catch (err) {
      console.error('Failed to load properties or leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Update composite location when city or locality changes
  const handleCityChange = (newCity: string, isEdit: boolean) => {
    const defaultLoc = (CITY_LOCALITIES[newCity] && CITY_LOCALITIES[newCity][0]) || '';
    if (isEdit && editingProperty) {
      setEditingProperty({
        ...editingProperty,
        city: newCity,
        locality: defaultLoc,
        location: defaultLoc ? `${defaultLoc}, ${newCity}` : newCity
      });
    } else {
      setForm(prev => ({
        ...prev,
        city: newCity,
        locality: defaultLoc,
        location: defaultLoc ? `${defaultLoc}, ${newCity}` : newCity
      }));
    }
  };

  const handleLocalityChange = (newLoc: string, isEdit: boolean) => {
    if (isEdit && editingProperty) {
      const city = editingProperty.city || 'Mumbai';
      setEditingProperty({
        ...editingProperty,
        locality: newLoc,
        location: newLoc ? `${newLoc}, ${city}` : city
      });
    } else {
      const city = form.city || 'Mumbai';
      setForm(prev => ({
        ...prev,
        locality: newLoc,
        location: newLoc ? `${newLoc}, ${city}` : city
      }));
    }
  };

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
      tag: tag || 'Hall / Living Area',
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
          tag: i === 0 ? 'Exterior / Facade' : (i === 1 ? 'Hall / Living Area' : (i === 2 ? 'Master Bedroom' : (i === 3 ? 'Kitchen' : 'Washroom'))),
          isCover: i === 0,
          caption: `${property.title} Photo`
        }));

    setEditingProperty({
      ...property,
      media: existingMedia,
      bhk: property.bhk || `${property.bedrooms || 3} BHK`,
      city: property.city || 'Mumbai',
      locality: property.locality || 'Worli',
      carpetAreaSqFt: property.carpetAreaSqFt || (property.areaSqFt ? Math.round(Number(property.areaSqFt) * 0.8) : 1500),
      vastuFacing: property.vastuFacing || 'East Facing (Vastu Compliant)',
      possessionStatus: property.possessionStatus || 'Ready to Move (OC Received)',
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

  // WhatsApp 1-Click Brochure Pitch
  const handleWhatsAppPitch = (prop: Property) => {
    const pitch = generatePropertyPitchWhatsApp(prop as any, 'AgentLadders Realty', '+91 98200 12345');
    openWhatsAppDirect('', pitch);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.bhk && item.bhk.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.locality && item.locality.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCity = cityFilter === 'All' || item.city === cityFilter;
      const matchesPurpose = purposeFilter === 'All' || item.purpose === purposeFilter || item.listingType === purposeFilter;
      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCity && matchesPurpose && matchesStatus;
    });
  }, [data, searchQuery, cityFilter, purposeFilter, statusFilter]);

  const columns: Column<Property>[] = [
    {
      header: 'Property & Verified RERA',
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
              title="Click to view full room-tagged photo gallery"
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
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
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                  {row.bhk || (row.bedrooms ? `${row.bedrooms} BHK` : '3 BHK')}
                </span>
                {row.reraId && (
                  <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                    ✓ RERA: {row.reraId}
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.title}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                📍 {row.locality ? `${row.locality}, ${row.city || 'Mumbai'}` : row.location}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Indian Quoting Price',
      accessor: (row) => {
        const carpet = Number(row.carpetAreaSqFt) || Number(row.areaSqFt) || 2000;
        const ratePerSqFt = Math.round(row.price / carpet);

        return (
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
              {formatINR(row.price)}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              ₹{ratePerSqFt.toLocaleString('en-IN')} / sq ft
            </div>
            {row.maintenanceMonthly && (
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Maint: ₹{Number(row.maintenanceMonthly).toLocaleString('en-IN')}/mo
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'RERA Carpet & Vastu',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>
            📐 {row.carpetAreaSqFt || (row.areaSqFt ? Math.round(Number(row.areaSqFt) * 0.8) : 1500)} sq ft
            <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600, marginLeft: '4px' }}>RERA</span>
          </div>
          {row.vastuFacing && (
            <div style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
              🧭 {row.vastuFacing}
            </div>
          )}
          {row.floor && (
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
              🏢 {row.floor}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Live Kundali Match',
      accessor: (row) => {
        const matchingLeads = findMatchingLeadsForProperty(row as any, leads as any);
        const hasMatches = matchingLeads.length > 0;

        return (
          <div>
            <button
              type="button"
              onClick={() => setMatchingModalProperty(row)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                border: hasMatches ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                backgroundColor: hasMatches ? '#fff7ed' : '#f8fafc',
                color: hasMatches ? '#c2410c' : '#64748b',
                cursor: 'pointer'
              }}
              title="Click to view all matching buyers waiting for this flat"
            >
              <span>{hasMatches ? '🔥' : '👥'}</span>
              <span>{matchingLeads.length} {matchingLeads.length === 1 ? 'Buyer' : 'Buyers'} Match</span>
            </button>
            {hasMatches && (
              <div style={{ fontSize: '10.5px', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
                Top: {matchingLeads[0].leadName} ({matchingLeads[0].matchScore}%)
              </div>
            )}
          </div>
        );
      }
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
          
          {/* WhatsApp Direct Pitch */}
          <button
            type="button"
            onClick={() => handleWhatsAppPitch(row)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#25d366',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 211, 102, 0.3)'
            }}
            title="Generate & copy complete Indian WhatsApp brochure"
          >
            <span>💬</span> Pitch
          </button>

          {/* Share Modal Trigger */}
          <button
            type="button"
            onClick={() => setPropertyToShare(row)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Generate Public Link / QR Code"
          >
            <span>🔗</span> Share
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            style={{
              padding: '5px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✏️
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(row.id, row.title)}
            style={{
              padding: '5px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
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
        title="Property Portfolio & Verified Inventory" 
        subtitle="Manage Indian residential & commercial inventory, RERA compliance, room-tagged photos, and instant buyer auto-matches" 
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              🏢 + Add Property Listing
            </Button>
          </div>
        } 
      />

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search properties by title, locality (Worli, Golf Course Rd...), or BHK..."
        filters={[
          {
            key: 'city',
            label: 'Indian City',
            value: cityFilter,
            options: [
              { label: 'All Cities', value: 'All' },
              ...TOP_INDIAN_CITIES.map(c => ({ label: c, value: c }))
            ],
            onChange: setCityFilter
          },
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
          setCityFilter('All');
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
            maxWidth: '840px',
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
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Onboard Indian Property Listing</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>RERA compliance, carpet area, Vastu orientation, and room-tagged photos</p>
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
                📐 2. Specs & Indian Location
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
                🔑 4. Access & Seller
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
                      placeholder="e.g. 4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>BHK Configuration *</label>
                    <select
                      value={form.bhk}
                      onChange={e => setForm({ ...form, bhk: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {INDIAN_BHK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Transaction Purpose</label>
                    <select
                      value={form.purpose}
                      onChange={e => setForm({ ...form, purpose: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="For Sale">For Sale (Outright / Resale / Builder)</option>
                      <option value="For Rent">For Rent (Lease / Corporate)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Asking Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85000000 for ₹8.50 Cr or 9200000 for ₹92 L"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    {/* Live Indian Currency Preview */}
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                      🇮🇳 Quoting in Indian Format: <span style={{ color: '#2563eb' }}>{formatINR(Number(form.price) || 0)}</span>
                    </div>
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Listing Description</label>
                    <textarea
                      rows={3}
                      placeholder="Unobstructed views, marble flooring, high ceilings, amenities, and developer reputation..."
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

              {/* TAB 2: SPECS & INDIAN LOCATION */}
              {activeAddTab === 'specs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Indian City *</label>
                    <select
                      value={form.city}
                      onChange={e => handleCityChange(e.target.value, false)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {TOP_INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Prime Locality / Micro-Market *</label>
                    <input
                      type="text"
                      list="add-locality-options"
                      required
                      placeholder="e.g. Worli, Golf Course Road, Indiranagar, Kharadi"
                      value={form.locality}
                      onChange={e => handleLocalityChange(e.target.value, false)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <datalist id="add-locality-options">
                      {form.city && CITY_LOCALITIES[form.city]?.map(l => <option key={l} value={l} />)}
                    </datalist>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>RERA Carpet Area (Sq Ft) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2450"
                      value={form.carpetAreaSqFt}
                      onChange={e => setForm({ ...form, carpetAreaSqFt: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Vastu Compliance</label>
                    <select
                      value={form.vastuFacing}
                      onChange={e => setForm({ ...form, vastuFacing: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {VASTU_FACINGS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>RERA Registration Number</label>
                    <input
                      type="text"
                      placeholder="e.g. P51900001339 or HRERA-PKL-GGM-1085-2019"
                      value={form.reraId}
                      onChange={e => setForm({ ...form, reraId: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Possession Stage</label>
                    <select
                      value={form.possessionStatus}
                      onChange={e => setForm({ ...form, possessionStatus: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {POSSESSION_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Floor Level</label>
                    <input
                      type="text"
                      placeholder="e.g. 42nd of 55 Floors or Penthouse Level"
                      value={form.floor}
                      onChange={e => setForm({ ...form, floor: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Reserved Car Parks</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Covered or 3 Stilt"
                      value={form.parking}
                      onChange={e => setForm({ ...form, parking: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveAddTab('basic')}>&larr; Back: Basic</Button>
                    <Button variant="primary" type="button" onClick={() => setActiveAddTab('media')}>Next: Photos & Media &rarr;</Button>
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTOS & MEDIA */}
              {activeAddTab === 'media' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Room-Tagged Photo Gallery</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Tag each photo as Living Hall, Master Bedroom, Modular Kitchen, Washroom, or Balcony.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadDemoPhotos(false)}
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      ⚡ Auto-Fill High-Res Luxury Photos
                    </button>
                  </div>

                  {/* Add URL Photo Box */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      placeholder="Paste image URL (e.g. https://... or /images/...)"
                      value={addUrlInput}
                      onChange={e => setAddUrlInput(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <select
                      value={addUrlTag}
                      onChange={e => setAddUrlTag(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {PRESET_ROOM_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddUrlImage(false)}
                      style={{ padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      + Add Photo
                    </button>
                  </div>

                  {/* Upload from Computer */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'inline-block', padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155', border: '1px dashed #94a3b8', borderRadius: '6px', cursor: 'pointer' }}>
                      📁 Upload Photos from Computer
                      <input type="file" multiple accept="image/*" onChange={e => handleFileUpload(e.target.files, false)} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {/* Photo Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {form.media.map((item, idx) => (
                      <div key={item.id} style={{ position: 'relative', border: item.isCover ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                        <div style={{ position: 'relative', width: '100%', height: '110px' }}>
                          <Image src={item.url} alt={item.tag} fill sizes="180px" style={{ objectFit: 'cover' }} />
                          {item.isCover && (
                            <span style={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#2563eb', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                              Cover
                            </span>
                          )}
                        </div>
                        <div style={{ padding: '8px' }}>
                          <select
                            value={item.tag}
                            onChange={e => handleUpdateMediaTag(idx, e.target.value, false)}
                            style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '6px' }}
                          >
                            {PRESET_ROOM_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(idx, false)}
                              style={{ flex: 1, padding: '3px 6px', fontSize: '10.5px', backgroundColor: item.isCover ? '#dbeafe' : '#f8fafc', color: item.isCover ? '#1d4ed8' : '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              {item.isCover ? '✓ Cover' : 'Set Cover'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx, false)}
                              style={{ padding: '3px 6px', fontSize: '10.5px', backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveAddTab('specs')}>&larr; Back: Specs</Button>
                    <Button variant="primary" type="button" onClick={() => setActiveAddTab('access')}>Next: Access & Seller &rarr;</Button>
                  </div>
                </div>
              )}

              {/* TAB 4: ACCESS & SELLER */}
              {activeAddTab === 'access' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Property Owner / Landlord Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunil & Neeta Singhania"
                      value={form.sellerName}
                      onChange={e => setForm({ ...form, sellerName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Owner WhatsApp / Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98201 54321"
                      value={form.sellerPhone}
                      onChange={e => setForm({ ...form, sellerPhone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Key Location & Showing Instructions</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Keys with caretaker Ramesh at Tower C gate. Society requires 2 hrs prior intimation."
                      value={form.keyLocationNotes}
                      onChange={e => setForm({ ...form, keyLocationNotes: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Button variant="outline" type="button" onClick={() => setActiveAddTab('media')}>&larr; Back: Photos</Button>
                    <Button variant="primary" type="submit">Publish Indian Property Listing 🚀</Button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT PROPERTY */}
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
            maxWidth: '840px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Property: {editingProperty.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update Indian specifications, RERA information, and tagged photos</p>
              </div>
              <button onClick={() => setEditingProperty(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateProperty} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
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
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>BHK Configuration</label>
                  <select
                    value={editingProperty.bhk || '3 BHK'}
                    onChange={e => setEditingProperty({ ...editingProperty, bhk: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {INDIAN_BHK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Asking Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProperty.price}
                    onChange={e => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                    🇮🇳 Quoting in Indian Format: <span style={{ color: '#2563eb' }}>{formatINR(editingProperty.price)}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Indian City</label>
                  <select
                    value={editingProperty.city || 'Mumbai'}
                    onChange={e => handleCityChange(e.target.value, true)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {TOP_INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Locality / Micro-Market</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.locality || ''}
                    onChange={e => handleLocalityChange(e.target.value, true)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>RERA Carpet Area (Sq Ft)</label>
                  <input
                    type="number"
                    value={editingProperty.carpetAreaSqFt || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, carpetAreaSqFt: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Vastu Facing</label>
                  <select
                    value={editingProperty.vastuFacing || 'East Facing (Vastu Compliant)'}
                    onChange={e => setEditingProperty({ ...editingProperty, vastuFacing: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {VASTU_FACINGS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>RERA Registration Number</label>
                  <input
                    type="text"
                    value={editingProperty.reraId || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, reraId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Inventory Status</label>
                  <select
                    value={editingProperty.status}
                    onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <Button variant="outline" type="button" onClick={() => setEditingProperty(null)}>Cancel</Button>
                  <Button variant="primary" type="submit">Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: MATCHING BUYERS MODAL (KUNDALI FIT) */}
      {/* ======================================================== */}
      {matchingModalProperty && (
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
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #fed7aa',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7ed' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    Active Buyers Matching: {matchingModalProperty.title}
                  </h3>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Quoting: <strong style={{ color: '#2563eb' }}>{formatINR(matchingModalProperty.price)}</strong> · {matchingModalProperty.locality}, {matchingModalProperty.city}
                </p>
              </div>
              <button onClick={() => setMatchingModalProperty(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const matched = findMatchingLeadsForProperty(matchingModalProperty as any, leads as any);
                if (matched.length === 0) {
                  return (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No active buyers in your CRM match this property&apos;s BHK and budget. Add new buyer requirements in Leads to expand matches!
                    </div>
                  );
                }

                return matched.map(lead => (
                  <div 
                    key={lead.leadId}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{lead.leadName}</strong>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: lead.matchScore >= 90 ? '#dcfce7' : '#fef9c3',
                          color: lead.matchScore >= 90 ? '#15803d' : '#854d0e'
                        }}>
                          {lead.matchScore}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px' }}>
                        Budget: <strong style={{ color: '#0f172a' }}>{lead.budgetFormatted}</strong> · Looking for {lead.bhkNeeded}
                      </div>
                      {lead.fundingStatus && (
                        <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                          ✓ Financing: {lead.fundingStatus}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {lead.matchReasons.map((r, i) => (
                          <span key={i} style={{ fontSize: '10.5px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const pitch = `Namaste ${lead.leadName} ji! 🙏\n\n` +
                          `Following up on your requirement for a *${matchingModalProperty.bhk || 'luxury flat'}* in *${matchingModalProperty.locality || 'prime location'}*.\n\n` +
                          `We just listed an exclusive verified property that matches your criteria:\n` +
                          `🏢 *${matchingModalProperty.title}*\n` +
                          `💰 *Price*: ${formatINR(matchingModalProperty.price)}\n` +
                          `📐 *Carpet Area*: ${matchingModalProperty.carpetAreaSqFt || 2000} sq ft RERA\n` +
                          (matchingModalProperty.vastuFacing ? `🧭 *Vastu*: ${matchingModalProperty.vastuFacing}\n` : '') +
                          (matchingModalProperty.reraId ? `🏛️ *RERA Reg*: ${matchingModalProperty.reraId}\n` : '') +
                          `\nWould you like to schedule a private viewing today or tomorrow?`;

                        openWhatsAppDirect(lead.leadPhone, pitch);
                      }}
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>💬</span> WhatsApp Pitch
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {propertyToShare && (
        <ShareModal
          isOpen={!!propertyToShare}
          onClose={() => setPropertyToShare(null)}
          property={{
            id: propertyToShare.id,
            title: propertyToShare.title,
            publicToken: propertyToShare.publicToken,
            location: propertyToShare.location,
            price: propertyToShare.price,
            type: propertyToShare.type
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!propertyToDelete}
        title="Delete Property Listing"
        message={`Are you sure you want to remove "${propertyToDelete?.title}" from your agency portfolio?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Listing'}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setPropertyToDelete(null)}
      />
    </>
  );
}
