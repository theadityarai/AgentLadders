'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  formatINR, 
  DEFAULT_BHK_OPTIONS, 
  DEFAULT_PROPERTY_TYPES,
  DEFAULT_PROPERTY_SPECS,
  DEFAULT_CONSTRUCTION_STAGES,
  DEFAULT_VASTU_FACINGS,
  DEFAULT_PARKING_OPTIONS,
  DEFAULT_PROPERTY_STATUSES
} from '@/lib/formatters';
import { openWhatsApp, openWhatsAppDirect, generatePropertyPitchWhatsApp } from '@/lib/whatsapp-engine';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  HomeIcon,
  BuildingIcon,
  MapPinIcon,
  WhatsAppIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  ExternalLinkIcon,
  PlusIcon
} from '@/components/icons/NavIcons';

export interface PropertyMedia {
  id: string;
  url: string;
  tag: string;
  isCover?: boolean;
}

interface Property {
  id: string;
  title: string;
  purpose?: 'For Sale' | 'For Rent';
  type: string;
  bhk?: string;
  locality?: string;
  city?: string;
  location?: string;
  price: number;
  status: string;
  carpetAreaSqFt?: number | string;
  description?: string;
  privateNotes?: string;
  furnishing?: string;
  possessionStatus?: string;
  vastuFacing?: string;
  parking?: string | number;
  bathrooms?: number | string;
  media?: PropertyMedia[];
  images?: string[];
  image?: string;
  listingType?: string;
  publicToken?: string;
}

const getStatusStyle = (s: string) => {
  switch(s) {
    case 'Available': return { bg: '#d1fae5', color: '#065f46' };
    case 'Under Offer': return { bg: '#fef3c7', color: '#92400e' };
    case 'Sold': return { bg: '#e2e8f0', color: '#475569' };
    case 'Rented': return { bg: '#e2e8f0', color: '#475569' };
    default: return { bg: '#f1f5f9', color: '#475569' };
  }
};

const PropertyCardItem = React.memo(function PropertyCardItem({ 
  prop, 
  statusStyle, 
  priceFormatted,
  onCopyPitchLink,
  onShare,
  onEdit,
  onDelete
}: { 
  prop: Property; 
  statusStyle: { bg: string; color: string }; 
  priceFormatted: string; 
  onCopyPitchLink?: (title: string) => void;
  onShare?: (prop: Property) => void;
  onEdit?: (prop: Property) => void;
  onDelete?: (prop: Property) => void;
}) {
  const mediaList = prop.media && prop.media.length > 0 
    ? prop.media 
    : [{ id: '0', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80', tag: 'Exterior' }];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const currentMedia = mediaList[currentImgIndex] || mediaList[0];
  const isRent = prop.purpose === 'For Rent' || prop.listingType === 'For Rent';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev + 1) % mediaList.length);
  };

  return (
    <div 
      onClick={() => onEdit && onEdit(prop)}
      title="Click to view or edit property"
      style={{
        backgroundColor: '#fff', 
        border: '1px solid #e2e8f0', 
        borderRadius: 14,
        overflow: 'hidden', 
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', 
        cursor: 'pointer',
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={e => { 
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; 
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 24px -4px rgba(15,23,42,0.1)'; 
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary, #059669)'; 
      }}
      onMouseLeave={e => { 
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; 
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; 
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; 
      }}
    >
      <div style={{ width: '100%', height: 190, position: 'relative', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        <img 
          src={currentMedia.url} 
          alt={prop.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
        />
        
        {/* Purpose Badge (Buy vs Rent) */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          backgroundColor: isRent ? '#7e22ce' : '#0f172a', color: '#fff',
          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)', zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 5,
          letterSpacing: '0.02em'
        }}>
          {isRent ? <BuildingIcon size={12} color="#fff" /> : <HomeIcon size={12} color="#fff" />}
          <span>{isRent ? 'FOR RENT' : 'FOR SALE'}</span>
        </div>

        {/* Top-Right: Status Badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 6 }}>
          <div style={{
            backgroundColor: statusStyle.bg, color: statusStyle.color,
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            letterSpacing: '0.02em'
          }}>
            {prop.status}
          </div>
        </div>

        {/* Media Tag if available */}
        {currentMedia.tag && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#fff',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            zIndex: 5
          }}>
            {currentMedia.tag}
          </div>
        )}

        {/* Forward & Backward Controls on Card */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.65)', color: '#fff',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 6, transition: 'all 0.15s ease', fontSize: 16
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.95)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)')}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.65)', color: '#fff',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 6, transition: 'all 0.15s ease', fontSize: 16
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.95)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)')}
            >
              ›
            </button>
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.65)', color: '#fff',
              padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700,
              zIndex: 5
            }}>
              {currentImgIndex + 1}/{mediaList.length}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span>{priceFormatted}{isRent ? <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}> / mo</span> : ''}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>{prop.type}</span>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {prop.bhk ? `${prop.bhk} • ` : ''}{prop.title}
        </div>
        <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPinIcon size={13} color="#94a3b8" />
          <span>{prop.locality || prop.city || 'Prime Location'}</span>
        </div>

        {/* Specs Badges Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {prop.carpetAreaSqFt && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
              {prop.carpetAreaSqFt} sq.ft.
            </span>
          )}
          {prop.possessionStatus && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              {prop.possessionStatus}
            </span>
          )}
          {prop.vastuFacing && prop.vastuFacing !== 'Not Applicable' && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              {prop.vastuFacing}
            </span>
          )}
          {prop.furnishing && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, backgroundColor: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff' }}>
              {prop.furnishing}
            </span>
          )}
          {prop.parking && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
              {prop.parking}
            </span>
          )}
        </div>
        
        {/* Visible Listing URL bar */}
        {(() => {
          const listingToken = prop.publicToken || prop.id;
          const listingPath = `/p/${listingToken}`;
          return (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                const fullUrl = `${window.location.origin}${listingPath}`;
                navigator.clipboard.writeText(fullUrl);
                if (onCopyPitchLink) {
                  onCopyPitchLink(prop.title);
                }
              }}
              title="Click to copy public brochure URL"
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '6px 10px',
                marginBottom: 10,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                <ExternalLinkIcon size={12} color="#64748b" />
                <span style={{ fontWeight: 600, color: '#334155', fontSize: 11.5, flexShrink: 0 }}>Brochure:</span>
                <span style={{ color: '#2563eb', fontWeight: 600, fontSize: 11.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {listingPath}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, paddingLeft: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: 4, border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <CopyIcon size={11} color="#2563eb" />
                  <span>Copy</span>
                </span>
                <a
                  href={listingPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  title="Open live brochure page"
                  style={{ fontSize: 11, fontWeight: 700, color: '#475569', backgroundColor: '#fff', padding: '3px 6px', borderRadius: 4, border: '1px solid #cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  <ExternalLinkIcon size={11} color="#475569" />
                </a>
              </div>
            </div>
          );
        })()}

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Primary WhatsApp Share Button */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onShare) {
                onShare(prop);
              } else {
                const msg = generatePropertyPitchWhatsApp(prop as any);
                openWhatsApp(msg);
              }
            }}
            title="Share on WhatsApp with Photo Card & details"
            style={{
              flex: 1,
              minWidth: 0,
              backgroundColor: '#25D366',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.2)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#22c55e';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#25D366';
            }}
          >
            <WhatsAppIcon size={15} color="#ffffff" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>WhatsApp Pitch</span>
          </button>
          
          {/* Share Modal Trigger (Icon-only with hover tooltip) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare && onShare(prop);
            }}
            title="Share Property Brochure & Photos"
            aria-label="Share Property"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              flexShrink: 0,
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#334155';
            }}
          >
            <ShareIcon size={14} color="#475569" />
          </button>
          
          {/* Edit Button (Icon-only with hover tooltip) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(prop);
            }}
            title="Edit Property"
            aria-label="Edit Property"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              flexShrink: 0,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              color: '#1d4ed8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
          >
            <EditIcon size={14} color="#1d4ed8" />
          </button>

          {/* Delete Button (Icon-only with hover tooltip) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(prop);
            }}
            title="Delete Property"
            aria-label="Delete Property"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              flexShrink: 0,
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#dc2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#fecaca';
              e.currentTarget.style.borderColor = '#f87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            <TrashIcon size={14} color="#dc2626" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default function PropertiesPage() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [sharingProperty, setSharingProperty] = useState<Property | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, purposeFilter]);

  const isPropertyRent = useCallback((p: Property) => {
    return p.purpose === 'For Rent' || p.listingType === 'For Rent';
  }, []);

  const handleCopyPitchLink = useCallback((title: string) => {
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Pitch Link Copied! 📋',
      message: `Ready to send: Public showcase link for "${title}" copied to clipboard.`
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Dynamic Agency Configurations
  const [bhkOptions, setBhkOptions] = useState<string[]>(DEFAULT_BHK_OPTIONS);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(DEFAULT_PROPERTY_TYPES);
  const [propertySpecs, setPropertySpecs] = useState<string[]>(DEFAULT_PROPERTY_SPECS);
  const [constructionStages, setConstructionStages] = useState<string[]>(DEFAULT_CONSTRUCTION_STAGES);
  const [vastuOptions, setVastuOptions] = useState<string[]>(DEFAULT_VASTU_FACINGS);
  const [parkingOptions, setParkingOptions] = useState<string[]>(DEFAULT_PARKING_OPTIONS);
  const [propertyStatuses, setPropertyStatuses] = useState<string[]>(DEFAULT_PROPERTY_STATUSES);

  // Form State
  const [formData, setFormData] = useState({
    title: '', purpose: 'For Sale', type: 'Apartment', bhk: '2 BHK',
    city: 'Mumbai', locality: '', price: '', carpetAreaSqFt: '', status: 'Available',
    furnishing: 'Semi-Furnished',
    possessionStatus: 'Ready to Move (OC Received)',
    vastuFacing: 'East Facing (Vastu Compliant)',
    parking: '1 Covered Car Park',
    bathrooms: '2',
    description: '', privateNotes: ''
  });
  
  // Media State
  const [mediaItems, setMediaItems] = useState<PropertyMedia[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTag, setNewMediaTag] = useState('');

  const loadData = () => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(json => {
        if (json.properties) setData(json.properties);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    // Check localStorage agency configs for instant sync
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('agentladders_agency_configs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.bhkOptions) && parsed.bhkOptions.length > 0) setBhkOptions(parsed.bhkOptions);
          if (Array.isArray(parsed.propertyTypes) && parsed.propertyTypes.length > 0) setPropertyTypes(parsed.propertyTypes);
          if (Array.isArray(parsed.propertySpecs) && parsed.propertySpecs.length > 0) setPropertySpecs(parsed.propertySpecs);
          if (Array.isArray(parsed.constructionStages) && parsed.constructionStages.length > 0) setConstructionStages(parsed.constructionStages);
          if (Array.isArray(parsed.vastuOptions) && parsed.vastuOptions.length > 0) setVastuOptions(parsed.vastuOptions);
          if (Array.isArray(parsed.parkingOptions) && parsed.parkingOptions.length > 0) setParkingOptions(parsed.parkingOptions);
          if (Array.isArray(parsed.propertyStatuses) && parsed.propertyStatuses.length > 0) setPropertyStatuses(parsed.propertyStatuses);
        }
      } catch {}
    }

    // Refresh agency configs from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.agency) {
          if (Array.isArray(data.agency.bhkOptions) && data.agency.bhkOptions.length > 0) setBhkOptions(data.agency.bhkOptions);
          if (Array.isArray(data.agency.propertyTypes) && data.agency.propertyTypes.length > 0) setPropertyTypes(data.agency.propertyTypes);
          if (Array.isArray(data.agency.propertySpecs) && data.agency.propertySpecs.length > 0) setPropertySpecs(data.agency.propertySpecs);
          if (Array.isArray(data.agency.constructionStages) && data.agency.constructionStages.length > 0) setConstructionStages(data.agency.constructionStages);
          if (Array.isArray(data.agency.vastuOptions) && data.agency.vastuOptions.length > 0) setVastuOptions(data.agency.vastuOptions);
          if (Array.isArray(data.agency.parkingOptions) && data.agency.parkingOptions.length > 0) setParkingOptions(data.agency.parkingOptions);
          if (Array.isArray(data.agency.propertyStatuses) && data.agency.propertyStatuses.length > 0) setPropertyStatuses(data.agency.propertyStatuses);
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      handleOpenAdd();
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agentladders_agency_configs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.bhkOptions) && parsed.bhkOptions.length > 0) setBhkOptions(parsed.bhkOptions);
          if (Array.isArray(parsed.propertyTypes) && parsed.propertyTypes.length > 0) setPropertyTypes(parsed.propertyTypes);
          if (Array.isArray(parsed.propertySpecs) && parsed.propertySpecs.length > 0) setPropertySpecs(parsed.propertySpecs);
          if (Array.isArray(parsed.constructionStages) && parsed.constructionStages.length > 0) setConstructionStages(parsed.constructionStages);
          if (Array.isArray(parsed.vastuOptions) && parsed.vastuOptions.length > 0) setVastuOptions(parsed.vastuOptions);
          if (Array.isArray(parsed.parkingOptions) && parsed.parkingOptions.length > 0) setParkingOptions(parsed.parkingOptions);
          if (Array.isArray(parsed.propertyStatuses) && parsed.propertyStatuses.length > 0) setPropertyStatuses(parsed.propertyStatuses);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingProperty(null);
    setFormData({
      title: '', purpose: 'For Sale', type: 'Apartment', bhk: '2 BHK',
      city: 'Mumbai', locality: '', price: '', carpetAreaSqFt: '', status: 'Available',
      furnishing: propertySpecs[0] || 'Semi-Furnished',
      possessionStatus: constructionStages[0] || 'Ready to Move (OC Received)',
      vastuFacing: vastuOptions[0] || 'East Facing (Vastu Compliant)',
      parking: parkingOptions[0] || '1 Covered Car Park',
      bathrooms: '2',
      description: '', privateNotes: ''
    });
    setMediaItems([]);
    setShowModal(true);
  }, [propertySpecs, constructionStages, vastuOptions, parkingOptions]);

  const handleOpenEdit = useCallback((prop: Property) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title || '',
      purpose: (prop.purpose || prop.listingType || 'For Sale') as any,
      type: prop.type || 'Apartment',
      bhk: prop.bhk || '2 BHK',
      city: prop.city || 'Mumbai',
      locality: prop.locality || '',
      price: prop.price !== undefined ? prop.price.toString() : '',
      carpetAreaSqFt: prop.carpetAreaSqFt !== undefined ? prop.carpetAreaSqFt.toString() : '',
      status: prop.status || 'Available',
      furnishing: prop.furnishing || propertySpecs[0] || 'Semi-Furnished',
      possessionStatus: prop.possessionStatus || constructionStages[0] || 'Ready to Move (OC Received)',
      vastuFacing: prop.vastuFacing || vastuOptions[0] || 'East Facing (Vastu Compliant)',
      parking: (prop.parking !== undefined && prop.parking !== null) ? prop.parking.toString() : (parkingOptions[0] || '1 Covered Car Park'),
      bathrooms: (prop.bathrooms !== undefined && prop.bathrooms !== null) ? prop.bathrooms.toString() : '2',
      description: prop.description || '',
      privateNotes: prop.privateNotes || ''
    });
    const existingMedia = (prop.media && prop.media.length > 0)
      ? prop.media
      : (prop.images && prop.images.length > 0
          ? prop.images.map((img: string, i: number) => ({
              id: 'm_' + i,
              url: img,
              tag: i === 0 ? 'Exterior / Facade' : 'Property Photo',
              isCover: i === 0
            }))
          : []);
    setMediaItems(existingMedia);
    setShowModal(true);
  }, [propertySpecs, constructionStages, vastuOptions, parkingOptions]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProperty) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/properties?id=${encodeURIComponent(deletingProperty.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(prev => prev.filter(p => p.id !== deletingProperty.id));
        if (editingProperty?.id === deletingProperty.id) {
          setShowModal(false);
          setEditingProperty(null);
        }
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Property Deleted 🗑️',
          message: `"${deletingProperty.title}" has been successfully removed from your inventory.`
        });
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Delete Failed',
          message: 'Could not delete property. Please try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to server to delete property.'
      });
    } finally {
      setIsDeleting(false);
      setDeletingProperty(null);
    }
  }, [deletingProperty, editingProperty]);

  const handleAddMediaUrl = useCallback(() => {
    if (!newMediaUrl) return;
    setMediaItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        url: newMediaUrl,
        tag: newMediaTag || 'General',
        isCover: prev.length === 0
      }
    ]);
    setNewMediaUrl('');
    setNewMediaTag('');
  }, [newMediaUrl, newMediaTag]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Create an object URL for local preview (in a real app, this would upload to S3/Cloudinary)
    const url = URL.createObjectURL(files[0]);
    
    setMediaItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        url: url,
        tag: newMediaTag || 'General',
        isCover: prev.length === 0
      }
    ]);
    
    // Reset file input and tag
    e.target.value = '';
    setNewMediaTag('');
  }, [newMediaTag]);

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...(editingProperty ? { id: editingProperty.id } : {}),
        ...formData,
        price: Number(formData.price),
        carpetAreaSqFt: Number(formData.carpetAreaSqFt),
        media: mediaItems
      };
      const method = editingProperty ? 'PUT' : 'POST';
      const res = await fetch('/api/properties', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        setShowModal(false);
        if (editingProperty) {
          setData(prev => prev.map(p => p.id === editingProperty.id ? { ...p, ...json.property } : p));
          setToast({
            id: Date.now().toString(),
            type: 'success',
            title: 'Property Updated! ✏️',
            message: `"${formData.title}" has been updated in inventory.`
          });
          setEditingProperty(null);
        } else {
          setData(prev => [json.property, ...prev]);
          setToast({
            id: Date.now().toString(),
            type: 'success',
            title: 'Property Added! 🏠',
            message: `"${formData.title}" has been added to inventory.`
          });
        }
        loadData();
        setFormData({ 
          title: '', purpose: 'For Sale', type: 'Apartment', bhk: '2 BHK', 
          city: 'Mumbai', locality: '', price: '', carpetAreaSqFt: '', status: 'Available',
          furnishing: propertySpecs[0] || 'Semi-Furnished',
          possessionStatus: constructionStages[0] || 'Ready to Move (OC Received)',
          vastuFacing: vastuOptions[0] || 'East Facing (Vastu Compliant)',
          parking: parkingOptions[0] || '1 Covered Car Park',
          bathrooms: '2',
          description: '', privateNotes: '' 
        });
        setMediaItems([]);
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Save Failed',
          message: json.error || 'Failed to save property'
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to server to save property.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingProperty, formData, mediaItems, propertySpecs, constructionStages, vastuOptions, parkingOptions]);

  // Memoized Buy/Rent Counts in a single pass
  const { buyCount, rentCount } = useMemo(() => {
    let buy = 0;
    let rent = 0;
    for (let i = 0; i < data.length; i++) {
      if (isPropertyRent(data[i])) {
        rent++;
      } else {
        buy++;
      }
    }
    return { buyCount: buy, rentCount: rent };
  }, [data, isPropertyRent]);

  // Memoized Filtered Properties
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(p => {
      if (purposeFilter !== 'All') {
        const isRent = isPropertyRent(p);
        if (purposeFilter === 'Rent' && !isRent) return false;
        if (purposeFilter === 'Buy' && isRent) return false;
      }
      if (filter !== 'All') {
        if (filter === 'Rented') {
          const s = p.status?.toLowerCase() || '';
          if (p.status !== 'Rented' && !s.includes('rent') && !s.includes('lease')) return false;
        } else if (p.status !== filter) {
          return false;
        }
      }
      if (q) {
        return (
          p.title?.toLowerCase().includes(q) ||
          p.locality?.toLowerCase().includes(q) ||
          p.bhk?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, purposeFilter, filter, search, isPropertyRent]);

  // Memoized Pagination calculations
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredData.length / pageSize)), [filteredData.length, pageSize]);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Loading properties...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <div 
          onClick={() => setShowModal(false)} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.55)', 
            zIndex: 100, 
            display: 'flex', 
            justifyContent: 'flex-end' 
          }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="responsive-drawer" 
            style={{ 
              backgroundColor: '#fff', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '-6px 0 30px rgba(0,0,0,0.2)',
              height: '100vh',
              width: '100%',
              maxWidth: '540px'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingProperty ? '✏️ Edit Property' : 'Add New Property'}
                  {editingProperty && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: editingProperty.purpose === 'For Rent' ? '#f3e8ff' : '#eff6ff', color: editingProperty.purpose === 'For Rent' ? '#7e22ce' : '#1d4ed8', border: `1px solid ${editingProperty.purpose === 'For Rent' ? '#d8b4fe' : '#bfdbfe'}` }}>
                      {editingProperty.purpose === 'For Rent' ? '🔑 Rent' : '🏠 Sale'}
                    </span>
                  )}
                  <InfoTooltip text="Add or edit listing details, photos, pricing, and private broker notes." />
                </h2>
                {editingProperty && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                    Editing: <strong style={{ color: '#0f172a' }}>{editingProperty.title}</strong>
                  </div>
                )}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Public Listing URL Info Banner in Edit Mode */}
              {editingProperty && (() => {
                const listingToken = editingProperty.publicToken || editingProperty.id;
                const listingPath = `/p/${listingToken}`;
                return (
                  <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🌐</span> Live Listing URL
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: 12 }}>
                        Public Showcase Link
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 12.5, color: '#0284c7', fontWeight: 600, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {typeof window !== 'undefined' ? `${window.location.origin}${listingPath}` : listingPath}
                      </span>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}${listingPath}`;
                            navigator.clipboard.writeText(url);
                            handleCopyPitchLink(editingProperty.title);
                          }}
                          style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: '1px solid #7dd3fc', backgroundColor: '#fff', color: '#0284c7', cursor: 'pointer' }}
                        >
                          📋 Copy Link
                        </button>
                        <a
                          href={listingPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: '1px solid #7dd3fc', backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                        >
                          View Live ↗
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Primary Status Field (First / Top Field) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Property Status *
                </label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                >
                  {propertyStatuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Title / Project Name *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. Lodha Bellissimo" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Price (₹) *</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. 25000000" />
                </div>
              </div>

              <div className="responsive-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>BHK</label>
                  <select value={formData.bhk} onChange={e => setFormData({...formData, bhk: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    {bhkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    {propertyTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Purpose / Listing Type</label>
                  <select value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value as any})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    {['For Sale', 'For Rent'].map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>City</label>
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Locality</label>
                  <input value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. Bandra West" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Carpet (SqFt)</label>
                  <input type="number" value={formData.carpetAreaSqFt} onChange={e => setFormData({...formData, carpetAreaSqFt: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
              </div>

              {/* Property Specs, Construction Stage, Vastu & Parking Section */}
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📋</span> Specifications, Vastu & Possession
                </div>

                <div className="responsive-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Furnishing / Specs <InfoTooltip text="Configured in Settings > System Configuration" />
                    </label>
                    <select 
                      value={formData.furnishing} 
                      onChange={e => setFormData({...formData, furnishing: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {propertySpecs.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Construction Stage <InfoTooltip text="Ready to Move vs Under Construction status" />
                    </label>
                    <select 
                      value={formData.possessionStatus} 
                      onChange={e => setFormData({...formData, possessionStatus: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {constructionStages.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="responsive-grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Vastu & Orientation <InfoTooltip text="Entry/Balcony facing for Indian buyer matching" />
                    </label>
                    <select 
                      value={formData.vastuFacing} 
                      onChange={e => setFormData({...formData, vastuFacing: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {vastuOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Parking Allocation <InfoTooltip text="Dedicated car parking bays allocation" />
                    </label>
                    <select 
                      value={formData.parking} 
                      onChange={e => setFormData({...formData, parking: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {parkingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Bathrooms
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      value={formData.bathrooms} 
                      onChange={e => setFormData({...formData, bathrooms: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} 
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>
              </div>
              
              {/* Public Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Public Description <span style={{color: '#94a3b8', fontWeight: 500}}>(Visible to clients)</span></label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical' }} 
                  placeholder="e.g. North-facing 2BHK. Veg only, bachelors not allowed. Close to metro station."
                />
              </div>

              {/* Private Notes */}
              <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: 8, border: '1px dashed #fdba74' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#c2410c', marginBottom: 6 }}>🔒 Private Broker Notes <span style={{color: '#fb923c', fontWeight: 500}}>(Only visible to you)</span></label>
                <textarea 
                  rows={3} 
                  value={formData.privateNotes} 
                  onChange={e => setFormData({...formData, privateNotes: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #fed7aa', backgroundColor: '#fff', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical' }} 
                  placeholder="e.g. Owner Name: Mr. Sharma. Phone: +91 9876543210. Exact address: Flat 402, B-Wing, Lodha Complex. Key is with watchman."
                />
              </div>

              {/* Media Section */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>Photos & Videos</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {/* Shared Tag Input */}
                  <div>
                    <input 
                      type="text" 
                      placeholder="Photo Tag (e.g. Living Room, Floor Plan, Exterior)" 
                      value={newMediaTag} 
                      onChange={e => setNewMediaTag(e.target.value)} 
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none' }} 
                    />
                  </div>

                  {/* URL Input */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="url" 
                      placeholder="Paste Image/Video URL..." 
                      value={newMediaUrl} 
                      onChange={e => setNewMediaUrl(e.target.value)} 
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none' }} 
                    />
                    <button type="button" onClick={handleAddMediaUrl} style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Add URL
                    </button>
                  </div>
                  
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>OR</div>

                  {/* File Upload */}
                  <label style={{ width: '100%', padding: '8px 16px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    + Upload File from Device
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={handleFileUpload}
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mediaItems.map((m, i) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: '8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                      {m.url.includes('video') || m.url.endsWith('.mp4') ? (
                        <div style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎥</div>
                      ) : (
                        <img src={m.url} alt={m.tag} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} onError={e => (e.currentTarget.src = 'https://via.placeholder.com/40')} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{m.tag}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{m.isCover ? 'Cover Image' : `Media ${i+1}`}</div>
                      </div>
                      <button type="button" onClick={() => handleRemoveMedia(m.id)} style={{ padding: 4, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                        &times;
                      </button>
                    </div>
                  ))}
                  {mediaItems.length === 0 && (
                    <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>No files uploaded yet.</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto', position: 'sticky', bottom: '-24px', backgroundColor: '#fff', padding: '16px 0', borderTop: '1px solid var(--border)', zIndex: 10, alignItems: 'center' }}>
                {editingProperty && (
                  <button 
                    type="button" 
                    onClick={() => setDeletingProperty(editingProperty)} 
                    style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Delete this listing"
                  >
                    <span>🗑️</span> Delete
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '12px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {isSubmitting ? 'Saving...' : (editingProperty ? 'Update Property' : 'Save Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-page-container animate-enter">
        <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
            Inventory <InfoTooltip text="Your central property catalog. Click on any card to edit details, or use the quick buttons to edit and delete." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            {data.length} properties total • {filteredData.length} shown
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          style={{
          backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px',
          fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)', transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-dark)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
        >
          + Add Property
        </button>
      </div>

      {/* Main Filter Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {/* Main Type / Purpose Filter Pills (Buy vs Rent) */}
        <FilterTabs
          label="Listing Type:"
          tabs={[
            { id: 'All', label: 'All Inventory', count: data.length },
            { id: 'Buy', label: 'For Sale', count: buyCount },
            { id: 'Rent', label: 'For Rent', count: rentCount }
          ]}
          activeTab={purposeFilter}
          onChange={(tabId) => setPurposeFilter(tabId as any)}
        />

        {/* Status Filter Pills */}
        <FilterTabs
          label="Property Status:"
          tabs={[
            { id: 'All', label: 'All Statuses', count: data.length },
            { id: 'Available', label: 'Available', count: data.filter(p => p.status === 'Available').length },
            { id: 'Under Offer', label: 'Under Offer', count: data.filter(p => p.status === 'Under Offer').length },
            { id: 'Under Contract', label: 'Under Contract', count: data.filter(p => p.status === 'Under Contract').length },
            { id: 'Sold', label: 'Sold', count: data.filter(p => p.status === 'Sold').length },
            { id: 'Rented', label: 'Rented', count: data.filter(p => p.status === 'Rented' || p.status?.toLowerCase().includes('rent') || p.status?.toLowerCase().includes('lease')).length },
            { id: 'Off Market', label: 'Off Market', count: data.filter(p => p.status === 'Off Market').length },
          ]}
          activeTab={filter}
          onChange={(tabId) => setFilter(tabId)}
        />

        {/* Search Toolbar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar 
            value={search}
            onChange={setSearch}
            placeholder="Search by title, location, BHK..."
            maxWidth={320}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
        {paginatedProperties.map(prop => (
          <PropertyCardItem 
            key={prop.id} 
            prop={prop} 
            statusStyle={getStatusStyle(prop.status)} 
            priceFormatted={formatINR(prop.price)} 
            onCopyPitchLink={handleCopyPitchLink}
            onShare={setSharingProperty}
            onEdit={handleOpenEdit}
            onDelete={setDeletingProperty}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 9, 18, 36]}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="properties"
          style={{ marginTop: 24 }}
        />
      )}
      
      {/* Empty State */}
      {filteredData.length === 0 && (
        <EmptyState
          icon={<BuildingIcon size={32} color="#64748b" />}
          title="No properties found"
          description="Try switching listing type (Buy / Rent), adjusting filters, or clearing your search keywords."
          action={{
            label: "Clear All Filters",
            onClick: () => { setSearch(''); setFilter('All'); setPurposeFilter('All'); }
          }}
          secondaryAction={{
            label: "+ Add Property",
            onClick: handleOpenAdd
          }}
        />
      )}
      </div>

      {/* Share Modal with Meesho/Flipkart Flyer Generator */}
      {sharingProperty && (
        <ShareModal
          isOpen={!!sharingProperty}
          onClose={() => setSharingProperty(null)}
          property={sharingProperty}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProperty && (
        <ConfirmModal
          isOpen={!!deletingProperty}
          title="Delete Property Listing?"
          message={
            <div>
              Are you sure you want to permanently delete <strong>{deletingProperty.title}</strong>?
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#64748b' }}>
                This listing will be removed from your catalog and any active client pitch links will no longer be accessible.
              </div>
            </div>
          }
          confirmText="Yes, Delete Listing"
          cancelText="Cancel"
          danger
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingProperty(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}

