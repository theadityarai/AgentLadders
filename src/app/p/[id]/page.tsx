'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatINR } from '@/lib/formatters';
import { generatePropertyPitchWhatsApp, openWhatsApp } from '@/lib/whatsapp-engine';
import { ShareModal } from '@/components/ui/ShareModal';
import {
  WhatsAppIcon,
  ShareIcon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  CheckIcon,
  AlertCircleIcon
} from '@/components/icons/NavIcons';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { isValid10DigitPhone } from '@/lib/phone-validation';

interface PublicPropertyMedia {
  id: string;
  url: string;
  tag: string;
  isCover?: boolean;
}

interface PublicProperty {
  id: string;
  title: string;
  type: string;
  price: number | null;
  status: string;
  areaSqFt: number;
  carpetAreaSqFt?: number;
  purpose?: string;
  description: string;
  media?: PublicPropertyMedia[];
  images: string[];
  agencyName: string;
  agentName: string;
  agentPhone: string;
  agentWhatsApp?: string;
  bhk?: string;
  city?: string;
  locality?: string;
  location?: string;
  publicToken?: string;
  furnishing?: string;
  parking?: string | number;
  reraId?: string;
  possessionStatus?: string;
  vastuFacing?: string;
  videoTourUrl?: string;
}

export default function PublicPropertyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Share Modal state
  const [showShareModal, setShowShareModal] = useState(false);

  // Form State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [modalMode, setModalMode] = useState<'interest' | 'visit'>('interest');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', timeSlot: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadProperty() {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/property/${id}`);
        const data = await res.json();
        if (res.ok && data.property) {
          setProperty(data.property);
        } else {
          setError(data.error || 'Property not found.');
        }
      } catch {
        setError('Failed to connect.');
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showInquiryModal) setShowInquiryModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInquiryModal]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid10DigitPhone(form.phone)) {
      setInquiryError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    setSubmitting(true);
    setInquiryError(null);
    try {
      const res = await fetch(`/api/public/property/${id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowInquiryModal(false);
          setSubmitSuccess(false);
          setForm({ name: '', phone: '', email: '', date: '', timeSlot: '', note: '' });
        }, 2000);
      } else {
        setInquiryError('Failed to send request. Please try WhatsApp directly or contact support.');
      }
    } catch {
      setInquiryError('Network error. Please try WhatsApp directly or check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnectWhatsApp = () => {
    if (!property) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agentladders.com';
    const publicUrl = `${origin}/p/${property.publicToken || property.id}`;
    const priceText = property.price ? formatINR(property.price) : 'Price on Request';
    const locationText = property.locality ? `${property.locality}, ${property.city || ''}` : (property.location || 'Prime Location');
    const msg = `Hi ${property.agentName || 'there'}, I am interested in your property listing:\n\n*${property.title}*\n*Price*: ${priceText}\n*Location*: ${locationText}\n\n*Showcase Link*:\n${publicUrl}\n\nPlease share floor plans and schedule a private site visit.`;
    const brokerPhone = property.agentWhatsApp || property.agentPhone || '';
    openWhatsApp(msg, brokerPhone);
  };

  const handleOpenShare = () => {
    setShowShareModal(true);
  };

  // Normalize media
  const allMedia = React.useMemo(() => {
    if (!property) return [];
    const media = property.media && property.media.length > 0 
      ? property.media 
      : property.images?.map((url, i) => ({ id: String(i), url, tag: 'Photo' })) || [];
      
    if (media.length === 0) {
      return [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', tag: 'Exterior' }];
    }
    return media;
  }, [property]);

  const handleNextImage = React.useCallback(() => {
    if (allMedia.length <= 1) return;
    setActiveImageIndex(prev => (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  const handlePrevImage = React.useCallback(() => {
    if (allMedia.length <= 1) return;
    setActiveImageIndex(prev => (prev - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  // Automatic slider (autoplay every 4 seconds, pauses when user hovers or touches)
  useEffect(() => {
    if (allMedia.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % allMedia.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allMedia.length, isPaused]);

  // Keyboard navigation (ArrowLeft and ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInquiryModal) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextImage, handlePrevImage, showInquiryModal]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>Loading exclusive property...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BuildingIcon size={32} color="#94a3b8" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Listing Not Found</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>{error}</p>
      </div>
    );
  }

  const activeMedia = allMedia[activeImageIndex] || allMedia[0];

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      {/* Mobile Top Nav (transparent) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', pointerEvents: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          {property.agencyName || 'Exclusive Listing'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'auto' }}>
          <button
            type="button"
            onClick={handleOpenShare}
            title="Share property listing"
            style={{
              backgroundColor: 'rgba(37, 211, 102, 0.95)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <ShareIcon size={14} color="#ffffff" />
            <span>Share</span>
          </button>
          <div style={{ backgroundColor: property.status === 'Available' ? '#10b981' : '#f59e0b', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            {property.status}
          </div>
        </div>
      </div>

      {/* Hero Image Section with Automatic Slider & Forward/Back Controls */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ position: 'relative', width: '100%', height: '52vh', minHeight: 420, backgroundColor: '#0f172a', overflow: 'hidden', userSelect: 'none' }}
      >
        {/* Images with smooth crossfade */}
        {allMedia.map((media, index) => (
          <img 
            key={media.id || index}
            src={media.url} 
            alt={media.tag || `Property Photo ${index + 1}`} 
            style={{ 
              position: 'absolute',
              inset: 0,
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              opacity: index === activeImageIndex ? 1 : 0,
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: index === activeImageIndex ? 'auto' : 'none'
            }} 
          />
        ))}

        {/* Subtle dark ambient gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', pointerEvents: 'none' }} />
        
        {/* Forward & Backward Navigation Buttons */}
        {allMedia.length > 1 && (
          <>
            {/* Backward / Previous Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Previous image"
              style={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 25,
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.55)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Forward / Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Next image"
              style={{
                position: 'absolute',
                right: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 25,
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.55)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Tag Badge */}
        <div style={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20, 
          backgroundColor: 'rgba(15, 23, 42, 0.65)', 
          backdropFilter: 'blur(8px)', 
          WebkitBackdropFilter: 'blur(8px)', 
          color: '#fff', 
          padding: '6px 14px', 
          borderRadius: 20, 
          fontSize: 13, 
          fontWeight: 600, 
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 20
        }}>
          <span>{activeMedia?.tag || 'Property Photo'}</span>
        </div>

        {/* Slide Counter & Interactive Indicator Dots */}
        {allMedia.length > 1 && (
          <div style={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 20
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.04em' }}>
              {activeImageIndex + 1} / {allMedia.length}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {allMedia.map((_, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(i);
                  }}
                  style={{ 
                    width: i === activeImageIndex ? 18 : 7, 
                    height: 7, 
                    borderRadius: 4, 
                    padding: 0, 
                    border: 'none', 
                    cursor: 'pointer', 
                    backgroundColor: i === activeImageIndex ? '#10b981' : 'rgba(255,255,255,0.45)', 
                    transition: 'all 0.25s ease' 
                  }}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '24px 20px 96px', maxWidth: 800, margin: '0 auto', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
            {property.price ? formatINR(property.price) : 'Price on Request'}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#475569', margin: 0, lineHeight: 1.4 }}>
            {property.title}
          </h1>
          <div style={{ fontSize: 15, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <MapPinIcon size={16} color="#64748b" />
            <span>{property.locality ? `${property.locality}, ${property.city}` : property.city || 'Prime Location'}</span>
          </div>

          {/* Quick Buyer Action Badges */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setModalMode('interest');
                setShowInquiryModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                border: '1.5px solid #fecdd3',
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Interested</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setModalMode('visit');
                setShowInquiryModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1.5px solid #bbf7d0',
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarIcon size={15} color="#166534" />
              <span>Schedule Site Visit</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Configuration</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{property.bhk || 'Not Specified'}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Carpet Area</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{property.carpetAreaSqFt || property.areaSqFt} <span style={{ fontSize: 12, fontWeight: 500 }}>Sq.Ft</span></div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Property Type</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{property.type || 'Apartment'}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Purpose</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{property.purpose || 'For Sale'}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>About this property</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {property.description || 'No description provided by the agent.'}
          </p>
        </div>

        {/* Listed By Agency Card */}
        <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BuildingIcon size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Listed By</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>{property.agencyName || 'Agency'}</div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Crucial for Mobile) */}
      <div className="public-property-bottom-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, zIndex: 40, boxShadow: '0 -4px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap', boxSizing: 'border-box' }}>
        <button 
          type="button"
          onClick={handleConnectWhatsApp}
          style={{ flex: '1.2 1 180px', padding: '12px 14px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px rgba(37,211,102,0.25)' }}
          title="Connect directly with broker on WhatsApp"
        >
          <WhatsAppIcon size={18} color="#ffffff" />
          <span>Connect with me on WhatsApp</span>
        </button>
        <button 
          type="button"
          onClick={handleOpenShare}
          title="Share property listing across WhatsApp, Social & more"
          style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1.5px solid #bbf7d0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
        >
          <ShareIcon size={16} color="#15803d" />
          <span>Share</span>
        </button>
        <button 
          type="button"
          onClick={() => {
            setModalMode('interest');
            setShowInquiryModal(true);
          }}
          style={{ flex: '1 1 120px', padding: '12px', backgroundColor: '#e11d48', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 12px rgba(225,29,72,0.25)' }}
        >
          <span>Interested</span>
        </button>
        <button 
          type="button"
          onClick={() => {
            setModalMode('visit');
            setShowInquiryModal(true);
          }}
          style={{ flex: '0.9 1 100px', padding: '12px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          Book Visit
        </button>
      </div>

      {/* Inquiry & Interest Modal */}
      {showInquiryModal && (
        <div onClick={() => setShowInquiryModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '32px 24px', animation: 'slideUp 0.3s ease-out', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  {modalMode === 'interest' ? "Inquire About This Property" : 'Book Site Visit Walkthrough'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  {modalMode === 'interest' 
                    ? 'Leave your details and the agency will reach out directly with pricing & floor plans.' 
                    : 'Schedule an on-site property walkthrough with the agency team.'}
                </p>
              </div>
              <button onClick={() => setShowInquiryModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckIcon size={28} color="#16a34a" strokeWidth={3} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  {modalMode === 'interest' ? 'Interest Registered!' : 'Visit Request Sent!'}
                </div>
                <div style={{ fontSize: 15, color: '#64748b' }}>
                  The agency team has been notified and will contact you shortly.
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {inquiryError && (
                  <div style={{ padding: '12px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertCircleIcon size={16} color="#dc2626" />
                    <span style={{ flex: 1, fontWeight: 500 }}>{inquiryError}</span>
                    <button type="button" onClick={() => setInquiryError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>&times;</button>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Your Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 15, outline: 'none' }} placeholder="Enter your full name" />
                </div>
                
                <div className="responsive-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Phone Number *</label>
                    <PhoneInput
                      required
                      value={form.phone}
                      onChange={(full) => setForm({...form, phone: full})}
                      placeholder="98200 12345"
                      inputStyle={{ padding: '12px 14px', fontSize: 14 }}
                      selectStyle={{ padding: '12px 10px', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Email (Optional)</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 15, outline: 'none' }} placeholder="your@email.com" />
                  </div>
                </div>

                {modalMode === 'visit' && (
                  <div className="responsive-grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Preferred Date *</label>
                      <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 15, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Time Slot (Optional)</label>
                      <input type="time" value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 15, outline: 'none' }} />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    {modalMode === 'interest' ? 'Specific Requirements / Message' : 'Additional Notes (Optional)'}
                  </label>
                  <textarea 
                    value={form.note} 
                    onChange={e => setForm({...form, note: e.target.value})} 
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 15, outline: 'none', resize: 'vertical', minHeight: 80 }} 
                    placeholder={modalMode === 'interest' ? "e.g. Looking for high floor, flexible on payment plans, need brochure..." : "Any specific timings or preferences?"} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    backgroundColor: modalMode === 'interest' ? '#e11d48' : 'var(--primary)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 12, 
                    fontSize: 16, 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    marginTop: 12, 
                    boxShadow: modalMode === 'interest' ? '0 4px 12px rgba(225,29,72,0.25)' : '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                >
                  {submitting 
                    ? 'Submitting...' 
                    : (modalMode === 'interest' ? "Submit My Interest" : 'Confirm Site Visit')}
                </button>
              </form>
            )}
          </div>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Multi-channel Share Modal */}
      {property && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          property={property as any}
        />
      )}
    </div>
  );
}
