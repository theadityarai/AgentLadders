'use client';

import React, { useState, useEffect } from 'react';
import { generatePropertyPitchWhatsApp } from '@/lib/whatsapp-engine';
import { sharePropertyWithImage, generatePropertyFlyerBlob } from '@/lib/share-card-generator';
import { formatINR } from '@/lib/formatters';
import {
  WhatsAppIcon,
  ShareIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  XIcon,
  CheckIcon,
  MapPinIcon,
  SpinnerIcon
} from '@/components/icons/NavIcons';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: {
    id: string;
    title: string;
    price?: number;
    location?: string;
    type?: string;
    bedrooms?: number | string;
    bathrooms?: number | string;
    publicToken?: string;
    privacyMode?: string;
    sharesCount?: number;
    media?: Array<{ id?: string; url?: string; tag?: string; isCover?: boolean }>;
    images?: string[];
    image?: string;
    bhk?: string;
    carpetAreaSqFt?: number | string;
    furnishing?: string;
    parking?: string | number;
    locality?: string;
    city?: string;
    [key: string]: any;
  } | null;
  propertyId?: string;
  propertyTitle?: string;
  publicToken?: string;
  price?: number;
  location?: string;
  currentPrivacyMode?: string;
  onUpdatePrivacy?: (newMode: string) => void;
}

export function ShareModal({
  isOpen,
  onClose,
  property,
  propertyId,
  propertyTitle,
  publicToken,
  price,
  location,
  currentPrivacyMode,
  onUpdatePrivacy
}: ShareModalProps) {
  const activeProperty = property || (propertyId ? {
    id: propertyId,
    title: propertyTitle || 'Property',
    price,
    location,
    publicToken: publicToken || propertyId,
    privacyMode: currentPrivacyMode || 'Public',
    sharesCount: 0
  } : null);

  const initialPrivacy = (activeProperty?.privacyMode as any) || (currentPrivacyMode as any) || 'Public';
  const [privacyMode, setPrivacyModeState] = useState<'Public' | 'Restricted' | 'Private'>(
    initialPrivacy === 'restricted' ? 'Restricted' : initialPrivacy === 'private' ? 'Private' : 'Public'
  );
  const [copied, setCopied] = useState(false);
  const [pitchCopied, setPitchCopied] = useState(false);
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [flyerNotice, setFlyerNotice] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [sharesCount, setSharesCount] = useState(activeProperty?.sharesCount || 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeProperty) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const token = activeProperty.publicToken || activeProperty.id;
  const shareUrl = `${origin}/p/${token}`;

  // Resolve primary image for flyer generator
  let primaryImage = '';
  if (activeProperty.image && typeof activeProperty.image === 'string') {
    primaryImage = activeProperty.image.trim();
  } else if (Array.isArray(activeProperty.images) && activeProperty.images.length > 0) {
    primaryImage = activeProperty.images[0];
  } else if (Array.isArray(activeProperty.media) && activeProperty.media.length > 0) {
    const cover = activeProperty.media.find(m => m.isCover && m.url) || activeProperty.media.find(m => m.url);
    if (cover?.url) primaryImage = cover.url;
  }
  if (!primaryImage) {
    primaryImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80';
  } else if (primaryImage.startsWith('/')) {
    primaryImage = `${origin}${primaryImage}`;
  }

  const changePrivacyMode = async (mode: 'Public' | 'Restricted' | 'Private') => {
    setPrivacyModeState(mode);
    if (onUpdatePrivacy) {
      onUpdatePrivacy(mode);
    }
    try {
      await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeProperty.id, privacyMode: mode })
      });
    } catch (e) {
      console.error('Failed to update privacy mode:', e);
    }
  };

  const recordShare = async (channel: string) => {
    try {
      const res = await fetch('/api/properties/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: activeProperty.id,
          channel,
          privacyMode
        })
      });
      const data = await res.json();
      if (data.sharesCount !== undefined) {
        setSharesCount(data.sharesCount);
      }
    } catch (err) {
      console.error('Failed to log share:', err);
    }
  };

  // Meesho / Flipkart style WhatsApp Share with Flyer Image
  const handleWhatsAppWithPhoto = async () => {
    setIsGeneratingFlyer(true);
    setFlyerNotice('Creating branded photo flyer...');
    recordShare('WhatsApp with Photo Card');

    const msg = generatePropertyPitchWhatsApp(activeProperty as any);
    const result = await sharePropertyWithImage({
      title: activeProperty.title,
      price: activeProperty.price || 0,
      bhk: activeProperty.bhk,
      bedrooms: activeProperty.bedrooms,
      locality: activeProperty.locality,
      city: activeProperty.city,
      location: activeProperty.location,
      carpetAreaSqFt: activeProperty.carpetAreaSqFt,
      imageUrl: primaryImage,
      purpose: activeProperty.purpose || 'For Sale'
    }, msg);

    setIsGeneratingFlyer(false);
    if (result.method === 'download-and-open') {
      setFlyerNotice('Photo flyer downloaded! Paste (Ctrl+V) in WhatsApp.');
      setTimeout(() => setFlyerNotice(null), 6000);
    } else {
      setFlyerNotice(null);
    }
  };

  // Standard WhatsApp Pitch Text
  const handleWhatsAppText = () => {
    recordShare('WhatsApp Pitch');
    const msg = generatePropertyPitchWhatsApp(activeProperty as any);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Download flyer only
  const handleDownloadFlyer = async () => {
    setIsGeneratingFlyer(true);
    setFlyerNotice('Generating image flyer...');
    const blob = await generatePropertyFlyerBlob({
      title: activeProperty.title,
      price: activeProperty.price || 0,
      bhk: activeProperty.bhk,
      bedrooms: activeProperty.bedrooms,
      locality: activeProperty.locality,
      city: activeProperty.city,
      location: activeProperty.location,
      carpetAreaSqFt: activeProperty.carpetAreaSqFt,
      imageUrl: primaryImage,
      purpose: activeProperty.purpose || 'For Sale'
    });
    setIsGeneratingFlyer(false);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProperty.title.replace(/[^a-zA-Z0-9]/g, '_')}_Flyer.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setFlyerNotice('Flyer saved to Downloads!');
      setTimeout(() => setFlyerNotice(null), 3000);
    }
  };

  const handleCopyPitch = () => {
    recordShare('Copy WhatsApp Pitch');
    const msg = generatePropertyPitchWhatsApp(activeProperty as any);
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(msg);
      setPitchCopied(true);
      setTimeout(() => setPitchCopied(false), 2500);
    }
  };

  const handleCopy = () => {
    recordShare('Copy Link');
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="share-modal-dialog"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '580px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
              Share Property Showcase
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              WhatsApp pitch formatting, photo flyer & client links
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Close modal"
          >
            <XIcon size={20} color="#64748b" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px 24px', maxHeight: 'calc(85vh - 130px)', overflowY: 'auto' }}>
          
          {/* Property Card Snapshot */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#166534' }}>{activeProperty.title}</div>
              <div style={{ fontSize: '12.5px', color: '#15803d', marginTop: '3px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPinIcon size={13} color="#15803d" />
                <span>{activeProperty.location || activeProperty.locality || 'Prime Location'}</span>
                <span>•</span>
                <span style={{ fontWeight: 700 }}>{activeProperty.price ? formatINR(activeProperty.price) : 'Price on Request'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#ffffff',
                color: '#166534',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #86efac'
              }}>
                {sharesCount} Shares
              </span>
            </div>
          </div>

          {/* PRIMARY: WhatsApp Share Section (Meesho/Flipkart Style) */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #86efac',
            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.08)',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WhatsAppIcon size={16} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>WhatsApp Distribution</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Includes photo card, pricing, specs & direct link</div>
                </div>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 7px', borderRadius: 4 }}>
                RECOMMENDED
              </span>
            </div>

            {flyerNotice && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                {isGeneratingFlyer ? <SpinnerIcon size={14} color="#1d4ed8" /> : <CheckIcon size={14} color="#1d4ed8" />}
                <span>{flyerNotice}</span>
              </div>
            )}

            <div className="share-modal-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* Button 1: Share with Photo Card */}
              <button
                type="button"
                onClick={handleWhatsAppWithPhoto}
                disabled={isGeneratingFlyer}
                style={{
                  padding: '11px 12px',
                  borderRadius: '9px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: isGeneratingFlyer ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                  transition: 'background 0.15s ease'
                }}
              >
                {isGeneratingFlyer ? <SpinnerIcon size={16} color="#ffffff" /> : <WhatsAppIcon size={16} color="#ffffff" />}
                <span>Share with Photo Card</span>
              </button>

              {/* Button 2: Download Flyer Image */}
              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={isGeneratingFlyer}
                style={{
                  padding: '11px 12px',
                  borderRadius: '9px',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: isGeneratingFlyer ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px'
                }}
              >
                <DownloadIcon size={15} color="#475569" />
                <span>Download Photo Flyer</span>
              </button>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              {/* Button 3: Text Only */}
              <button
                type="button"
                onClick={handleWhatsAppText}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '7px',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Send Pitch Text on WhatsApp</span>
              </button>

              {/* Button 4: Copy Formatted Pitch */}
              <button
                type="button"
                onClick={handleCopyPitch}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '7px',
                  backgroundColor: pitchCopied ? '#10b981' : '#f8fafc',
                  color: pitchCopied ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {pitchCopied ? <CheckIcon size={14} color="#fff" /> : <CopyIcon size={14} color="#64748b" />}
                <span>{pitchCopied ? 'Pitch Copied!' : 'Copy Pitch Text'}</span>
              </button>
            </div>
          </div>

          {/* Quick Copy Public URL */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Interactive Client Brochure URL:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '12.5px',
                  color: '#334155',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '9px 16px',
                  backgroundColor: copied ? '#10b981' : 'var(--primary, #059669)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <CheckIcon size={14} color="#fff" /> : <CopyIcon size={14} color="#fff" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '9px 12px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
                title="Open Public Brochure"
              >
                <ExternalLinkIcon size={15} color="#475569" />
              </a>
            </div>
          </div>

          {/* Privacy Mode Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Listing Visibility & Access Mode:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => changePrivacyMode('Public')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: privacyMode === 'Public' ? '2px solid #059669' : '1px solid #cbd5e1',
                  backgroundColor: privacyMode === 'Public' ? '#ecfdf5' : '#ffffff',
                  color: privacyMode === 'Public' ? '#047857' : '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Public (Full)
              </button>
              <button
                type="button"
                onClick={() => changePrivacyMode('Restricted')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: privacyMode === 'Restricted' ? '2px solid #d97706' : '1px solid #cbd5e1',
                  backgroundColor: privacyMode === 'Restricted' ? '#fffbeb' : '#ffffff',
                  color: privacyMode === 'Restricted' ? '#b45309' : '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Restricted (Masked)
              </button>
              <button
                type="button"
                onClick={() => changePrivacyMode('Private')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: privacyMode === 'Private' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  backgroundColor: privacyMode === 'Private' ? '#fef2f2' : '#ffffff',
                  color: privacyMode === 'Private' ? '#b91c1c' : '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Private (Internal)
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>
              {privacyMode === 'Public' && 'Anyone with link views all photos, exact address & pricing.'}
              {privacyMode === 'Restricted' && 'Sensitive details & price masked; buyer must submit inquiry to unlock.'}
              {privacyMode === 'Private' && 'Link deactivated; accessible only to agency staff inside CRM.'}
            </div>
          </div>

          {/* QR Code Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowQr(!showQr);
                if (!showQr) recordShare('QR Code');
              }}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: showQr ? '#f1f5f9' : '#ffffff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px'
              }}
            >
              <ShareIcon size={14} color="#64748b" />
              <span>{showQr ? 'Hide QR Code' : 'Show QR Code for Print Flyers & Open House'}</span>
            </button>

            {showQr && (
              <div style={{
                marginTop: '10px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '130px',
                  height: '130px',
                  backgroundColor: '#ffffff',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="114" height="114" viewBox="0 0 100 100" fill="#0f172a">
                    <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

                    <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

                    <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

                    <rect x="40" y="10" width="8" height="8" />
                    <rect x="55" y="15" width="8" height="8" />
                    <rect x="35" y="35" width="8" height="8" />
                    <rect x="48" y="45" width="12" height="12" />
                    <rect x="65" y="35" width="8" height="8" />
                    <rect x="80" y="55" width="8" height="8" />
                    <rect x="40" y="70" width="8" height="8" />
                    <rect x="55" y="80" width="8" height="8" />
                    <rect x="70" y="75" width="8" height="8" />
                    <rect x="85" y="85" width="8" height="8" />
                  </svg>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', textAlign: 'center' }}>
                  Scan to open live interactive brochure on smartphone
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
