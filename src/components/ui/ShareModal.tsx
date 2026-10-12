'use client';

import React, { useState, useEffect } from 'react';

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

  const summary = `${activeProperty.title} - ${activeProperty.type || 'Property'} in ${activeProperty.location || 'Prime Location'}${activeProperty.price ? ` ($${activeProperty.price.toLocaleString()})` : ''} | ${activeProperty.bedrooms || 3} Beds, ${activeProperty.bathrooms || 2} Baths.`;

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

  const handleWhatsApp = () => {
    recordShare('WhatsApp');
    const text = encodeURIComponent(`Hi! Take a look at this property listing:\n\n🏡 *${activeProperty.title}*\n📍 ${activeProperty.location || ''}\n💰 ${activeProperty.price ? `$${activeProperty.price.toLocaleString()}` : 'Price on Request'}\n\n👉 Full details & tour booking: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegram = () => {
    recordShare('Telegram');
    const text = encodeURIComponent(summary);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const handleEmail = () => {
    recordShare('Email');
    const subject = encodeURIComponent(`Property Presentation: ${activeProperty.title}`);
    const body = encodeURIComponent(`Hello,\n\nI wanted to share this property opportunity with you:\n\n${summary}\n\nView high-resolution photos and specifications:\n${shareUrl}\n\nPlease let me know if you would like to arrange a private viewing.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSMS = () => {
    recordShare('SMS');
    const body = encodeURIComponent(`${activeProperty.title} - ${shareUrl}`);
    window.location.href = `sms:?body=${body}`;
  };

  const handleLinkedIn = () => {
    recordShare('LinkedIn');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleTwitter = () => {
    recordShare('X');
    const text = encodeURIComponent(`Exclusive Property: ${activeProperty.title} in ${activeProperty.location || 'prime area'}.`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'modalFadeIn 0.15s ease-out'
        }}
      >
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Share Property & Public Link
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Multi-platform distribution with live tracking
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Property Card Snapshot */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e3a8a' }}>{activeProperty.title}</div>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                📍 {activeProperty.location || 'Prime Location'} &middot; {activeProperty.price ? `$${activeProperty.price.toLocaleString()}` : 'Price on Request'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#ffffff',
                color: '#2563eb',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #bfdbfe'
              }}>
                {sharesCount} Shares
              </span>
            </div>
          </div>

          {/* Privacy Mode Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Public Webpage Privacy Mode:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => changePrivacyMode('Public')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: privacyMode === 'Public' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: privacyMode === 'Public' ? '#eff6ff' : '#ffffff',
                  color: privacyMode === 'Public' ? '#1d4ed8' : '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🌍 Public (All)
              </button>
              <button
                type="button"
                onClick={() => changePrivacyMode('Restricted')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: privacyMode === 'Restricted' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  backgroundColor: privacyMode === 'Restricted' ? '#fffbeb' : '#ffffff',
                  color: privacyMode === 'Restricted' ? '#b45309' : '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🔒 Restricted
              </button>
              <button
                type="button"
                onClick={() => changePrivacyMode('Private')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: privacyMode === 'Private' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  backgroundColor: privacyMode === 'Private' ? '#fef2f2' : '#ffffff',
                  color: privacyMode === 'Private' ? '#b91c1c' : '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🚫 Private
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              {privacyMode === 'Public' && 'Anyone with the link can view all property photos, details, and request viewings.'}
              {privacyMode === 'Restricted' && 'Link works, but price and sensitive details are masked. Client must submit an inquiry.'}
              {privacyMode === 'Private' && 'Public link is deactivated. Only authenticated agency staff can view the property.'}
            </div>
          </div>

          {/* Quick Copy Link Bar */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Client Presentation URL:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '13px',
                  color: '#334155',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '10px 18px',
                  backgroundColor: copied ? '#10b981' : '#2563eb',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Channel Grid */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
              Direct Share Channels:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>💬</span>
                WhatsApp
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleTelegram}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #bae6fd',
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>✈️</span>
                Telegram
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleEmail}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>✉️</span>
                Email Client
              </button>

              {/* SMS */}
              <button
                type="button"
                onClick={handleSMS}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>📱</span>
                SMS Message
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleLinkedIn}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>💼</span>
                LinkedIn Post
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleTwitter}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '24px' }}>✖️</span>
                X / Twitter
              </button>
            </div>
          </div>

          {/* QR Code Section Toggle */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowQr(!showQr);
                if (!showQr) recordShare('QR Code');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: showQr ? '#f1f5f9' : '#ffffff',
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>📷</span> {showQr ? 'Hide QR Code' : 'Generate QR Code for Open Houses & Print Flyers'}
            </button>

            {showQr && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                {/* SVG Simulated QR Code */}
                <div style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="#0f172a">
                    {/* QR Code pattern */}
                    <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

                    <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                    <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                    <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

                    <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                    <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                    <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

                    {/* Data dots */}
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
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                  Scan with any smartphone camera to open public property showcase
                </div>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#2563eb',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  ↗ Preview Public Page Live
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
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
