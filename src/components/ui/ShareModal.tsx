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
  XIcon,
  CheckIcon,
  SpinnerIcon,
  PhoneIcon,
  MailIcon
} from '@/components/icons/NavIcons';
import {
  extract10DigitPhone,
  isValid10DigitPhone,
  formatForWhatsApp,
  isValidEmail,
  format10DigitDisplay
} from '@/lib/phone-validation';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';

function safeOpenUrl(url: string, targetBlank = true) {
  try {
    const a = document.createElement('a');
    a.href = url;
    if (targetBlank) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    if (targetBlank) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }
}

function safeOpenMailto(email: string, subject: string, body: string) {
  const mailtoUrl = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  try {
    const a = document.createElement('a');
    a.href = mailtoUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.location.href = mailtoUrl;
  }
}

export interface UniversalShareItem {
  id?: string;
  type?: 'property' | 'document' | 'invoice' | 'site-visit' | 'lead' | 'task' | 'general';
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  badge?: string;
  
  // Pre-attached client details (saved phone and email)
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  
  // Custom pre-formatted message
  defaultMessage?: string;
  
  // For properties: property object for flyer generation
  property?: any;
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareItem?: UniversalShareItem | null;
  property?: any;
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
  shareItem,
  property,
  propertyId,
  propertyTitle,
  publicToken,
  price,
  location,
  currentPrivacyMode,
  onUpdatePrivacy
}: ShareModalProps) {
  // Unify legacy property props or shareItem
  const activeProperty = property || shareItem?.property || (propertyId ? {
    id: propertyId,
    title: propertyTitle || 'Property',
    price,
    location,
    publicToken: publicToken || propertyId,
    privacyMode: currentPrivacyMode || 'Public',
    sharesCount: 0
  } : null);

  const activeItem: UniversalShareItem | null = shareItem || (activeProperty ? {
    id: activeProperty.id,
    type: 'property',
    title: activeProperty.title,
    subtitle: `${activeProperty.bhk || activeProperty.bedrooms || ''} BHK • ${activeProperty.location || activeProperty.locality || 'Prime Location'} • ${activeProperty.price ? formatINR(activeProperty.price) : 'Price on Request'}`,
    description: activeProperty.description,
    link: typeof window !== 'undefined' ? `${window.location.origin}/p/${activeProperty.publicToken || activeProperty.id}` : '',
    property: activeProperty
  } : null);

  // Tabs: 'savedClient' (Direct Client with saved number & email) vs 'anyone' (Share with anyone on WhatsApp/Email)
  const [activeTab, setActiveTab] = useState<'savedClient' | 'anyone'>('savedClient');

  // CRM Clients Directory
  const [crmClients, setCrmClients] = useState<Array<{ id: string; name: string; phone?: string; email?: string }>>([]);

  // Client Selection State (for Tab 1: Share with Saved Client)
  const [selectedClientId, setSelectedClientId] = useState<string>('custom');
  const [savedClientName, setSavedClientName] = useState<string>('');
  const [savedClientPhone, setSavedClientPhone] = useState<string>('');
  const [savedClientEmail, setSavedClientEmail] = useState<string>('');

  // Custom Input State (for Tab 2: Share with Anyone)
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');

  // Editable Message State
  const [messageText, setMessageText] = useState<string>('');
  const [showEditMessage, setShowEditMessage] = useState<boolean>(false);

  // Property Specific States (Flyer, Privacy, QR)
  const initialPrivacy = (activeProperty?.privacyMode as any) || (currentPrivacyMode as any) || 'Public';
  const [privacyMode, setPrivacyModeState] = useState<'Public' | 'Restricted' | 'Private'>(
    initialPrivacy === 'restricted' ? 'Restricted' : initialPrivacy === 'private' ? 'Private' : 'Public'
  );
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [flyerNotice, setFlyerNotice] = useState<string | null>(null);
  const [sharesCount, setSharesCount] = useState(activeProperty?.sharesCount || 0);

  // Feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Load CRM clients directory on mount
  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        if (data.leads && Array.isArray(data.leads)) {
          setCrmClients(data.leads);
        }
      })
      .catch(() => {});
  }, []);

  // When modal opens or share item changes, initialize contacts & default message
  useEffect(() => {
    if (!isOpen || !activeItem) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const itemLink = activeItem.link || (activeProperty ? `${origin}/p/${activeProperty.publicToken || activeProperty.id}` : '');

    // Resolve pre-attached client details
    const initName = activeItem.recipientName || activeProperty?.clientName || '';
    const initPhone = activeItem.recipientPhone || activeProperty?.clientPhone || '';
    const initEmail = activeItem.recipientEmail || activeProperty?.clientEmail || '';

    setSavedClientName(initName);
    setSavedClientPhone(initPhone);
    setSavedClientEmail(initEmail);

    // Try finding matching client in CRM directory to link dropdown
    if (initName || initPhone) {
      const match = crmClients.find(c => 
        (initPhone && c.phone && c.phone.replace(/\D/g, '').endsWith(initPhone.replace(/\D/g, '').slice(-10))) ||
        (initName && c.name && c.name.toLowerCase().trim() === initName.toLowerCase().trim())
      );
      if (match) {
        setSelectedClientId(match.id);
        if (!initPhone && match.phone) setSavedClientPhone(match.phone);
        if (!initEmail && match.email) setSavedClientEmail(match.email);
      } else {
        setSelectedClientId('custom');
      }
    } else {
      setSelectedClientId(crmClients.length > 0 ? crmClients[0].id : 'custom');
      if (crmClients.length > 0) {
        setSavedClientName(crmClients[0].name);
        setSavedClientPhone(crmClients[0].phone || '');
        setSavedClientEmail(crmClients[0].email || '');
      }
    }

    // Default message composition
    if (activeItem.defaultMessage) {
      setMessageText(activeItem.defaultMessage);
    } else if (activeProperty) {
      setMessageText(generatePropertyPitchWhatsApp(activeProperty as any));
    } else {
      let msg = `Hello! Sharing from AgentLadders Agency CRM:\n\n📌 *${activeItem.title}*\n`;
      if (activeItem.subtitle) msg += `ℹ️ ${activeItem.subtitle}\n`;
      if (activeItem.description) msg += `📝 ${activeItem.description}\n`;
      if (itemLink) msg += `\n🔗 *Direct Access Link:*\n${itemLink}\n`;
      msg += `\nFeel free to reach out with any questions!`;
      setMessageText(msg);
    }

    // Tab default: if pre-attached saved client or CRM clients exist, open saved client tab
    if (initPhone || initName || crmClients.length > 0) {
      setActiveTab('savedClient');
    } else {
      setActiveTab('anyone');
    }

    setCopiedLink(false);
    setCopiedMessage(false);
    setShareNotice(null);
  }, [isOpen, activeItem, activeProperty, crmClients]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeItem) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const resolvedShareUrl = activeItem.link || (activeProperty ? `${origin}/p/${activeProperty.publicToken || activeProperty.id}` : '');

  // Live 10-digit phone & email validation states
  const isSavedPhoneValid = isValid10DigitPhone(savedClientPhone);
  const savedPhoneDigits = extract10DigitPhone(savedClientPhone);
  const isSavedEmailValid = isValidEmail(savedClientEmail);

  const isCustomPhoneValid = isValid10DigitPhone(customPhone);
  const customPhoneDigits = extract10DigitPhone(customPhone);
  const isCustomEmailValid = isValidEmail(customEmail);

  // Resolve primary image for property flyer generator
  let primaryImage = '';
  if (activeProperty) {
    if (activeProperty.image && typeof activeProperty.image === 'string') {
      primaryImage = activeProperty.image.trim();
    } else if (Array.isArray(activeProperty.images) && activeProperty.images.length > 0) {
      primaryImage = activeProperty.images[0];
    } else if (Array.isArray(activeProperty.media) && activeProperty.media.length > 0) {
      const cover = activeProperty.media.find((m: any) => m.isCover && m.url) || activeProperty.media.find((m: any) => m.url);
      if (cover?.url) primaryImage = cover.url;
    }
    if (!primaryImage) {
      primaryImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80';
    } else if (primaryImage.startsWith('/')) {
      primaryImage = `${origin}${primaryImage}`;
    }
  }

  // Handle client selection dropdown
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'custom') return;
    const client = crmClients.find(c => c.id === clientId);
    if (client) {
      setSavedClientName(client.name);
      setSavedClientPhone(client.phone || '');
      setSavedClientEmail(client.email || '');

      // Personalize message greeting if starts with "Dear" or "Hi"
      setMessageText(prev => {
        if (/^(Dear|Hi|Hello)\s+[^,\n]+,/i.test(prev)) {
          return prev.replace(/^(Dear|Hi|Hello)\s+[^,\n]+,/i, `Hi ${client.name},`);
        }
        return prev;
      });
    }
  };

  const recordShare = async (channel: string) => {
    if (!activeProperty?.id) return;
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
    } catch {}
  };

  // SEND ACTIONS

  // 1. WhatsApp to Saved Client
  const handleSendWhatsAppToSavedClient = () => {
    if (!isValid10DigitPhone(savedClientPhone)) return;
    const num = formatForWhatsApp(savedClientPhone, '91');
    recordShare(`WhatsApp to Saved Client: ${savedClientName || num}`);
    const waUrl = `https://wa.me/${num}?text=${encodeURIComponent(messageText)}`;
    safeOpenUrl(waUrl, true);
    setShareNotice(`Opening WhatsApp to chat with ${savedClientName || format10DigitDisplay(savedClientPhone)}...`);
    setTimeout(() => setShareNotice(null), 4000);
  };

  // 2. Email to Saved Client
  const handleSendEmailToSavedClient = () => {
    if (!savedClientEmail.trim() || !isValidEmail(savedClientEmail)) return;
    const subject = `${activeItem.title} — Vance Luxury Realty`;
    recordShare(`Email to Saved Client: ${savedClientEmail}`);
    safeOpenMailto(savedClientEmail, subject, messageText);
    setShareNotice(`Opening email draft for ${savedClientName || savedClientEmail}...`);
    setTimeout(() => setShareNotice(null), 4000);
  };

  // 3. Call Saved Client
  const handleCallSavedClient = () => {
    if (!savedClientPhone.trim()) return;
    const clean = savedClientPhone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${clean}`;
  };

  // 4. WhatsApp to Custom Number (Anyone)
  const handleSendWhatsAppToCustom = () => {
    if (!isValid10DigitPhone(customPhone)) return;
    const num = formatForWhatsApp(customPhone, countryCode);
    recordShare(`WhatsApp to +${num}`);
    const waUrl = `https://wa.me/${num}?text=${encodeURIComponent(messageText)}`;
    safeOpenUrl(waUrl, true);
    setShareNotice(`Opening WhatsApp to message +${num}...`);
    setTimeout(() => setShareNotice(null), 4000);
  };

  // 5. Open WhatsApp to choose Any Chat or Group
  const handleOpenWhatsAppAnyChat = () => {
    recordShare('WhatsApp Generic Broadcast');
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    safeOpenUrl(waUrl, true);
    setShareNotice('Opening WhatsApp to pick any contact or group...');
    setTimeout(() => setShareNotice(null), 4000);
  };

  // 6. Email to Custom Address
  const handleSendEmailToCustom = () => {
    if (!customEmail.trim() || !isValidEmail(customEmail)) return;
    const subject = `${activeItem.title} — Vance Luxury Realty`;
    recordShare(`Email to ${customEmail}`);
    safeOpenMailto(customEmail, subject, messageText);
    setShareNotice(`Opening email draft for ${customEmail}...`);
    setTimeout(() => setShareNotice(null), 4000);
  };

  // 7. Copy Link
  const handleCopyLink = () => {
    if (!resolvedShareUrl) return;
    recordShare('Copy Share Link');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // 8. Copy Formatted Message Text
  const handleCopyMessage = () => {
    recordShare('Copy Pitch Text');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  // 9. Native Web Share
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: activeItem.title,
          text: messageText,
          url: resolvedShareUrl || undefined
        });
        recordShare('Native Device Share');
      } catch {}
    }
  };

  // Property Specific: Photo Card
  const handleWhatsAppWithPhoto = async () => {
    if (!activeProperty) return;
    setIsGeneratingFlyer(true);
    setFlyerNotice('Creating branded photo flyer...');
    recordShare('WhatsApp with Photo Card');

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
    }, messageText);

    setIsGeneratingFlyer(false);
    if (result.method === 'download-and-open') {
      setFlyerNotice('Photo flyer downloaded! Paste (Ctrl+V) in WhatsApp.');
      setTimeout(() => setFlyerNotice(null), 6000);
    } else {
      setFlyerNotice(null);
    }
  };

  const handleDownloadFlyer = async () => {
    if (!activeProperty) return;
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

  const changePrivacyMode = async (mode: 'Public' | 'Restricted' | 'Private') => {
    setPrivacyModeState(mode);
    if (onUpdatePrivacy) onUpdatePrivacy(mode);
    if (activeProperty?.id) {
      try {
        await fetch('/api/properties', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeProperty.id, privacyMode: mode })
        });
      } catch {}
    }
  };

  // Determine Item Type Icon
  const getItemIcon = () => {
    switch (activeItem.type) {
      case 'property': return '🏢';
      case 'document': return '📕';
      case 'invoice': return '🧾';
      case 'site-visit': return '📅';
      case 'lead': return '👤';
      case 'task': return '📌';
      default: return '📄';
    }
  };

  return (
    <div 
      onClick={onClose}
      className="share-modal-overlay"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="share-modal-dialog animate-enter"
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{getItemIcon()}</span>
            <div>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                Share &amp; Distribute
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                Share directly with client via saved contact or send to anyone on WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close modal"
          >
            <XIcon size={18} color="#64748b" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          
          {/* Item Snapshot Card */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeItem.title}
              </div>
              {activeItem.subtitle && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeItem.subtitle}
                </div>
              )}
            </div>

            {resolvedShareUrl && (
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: '6px 12px',
                  backgroundColor: copiedLink ? '#10b981' : '#ffffff',
                  color: copiedLink ? '#ffffff' : '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '7px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {copiedLink ? <CheckIcon size={12} color="#fff" /> : <CopyIcon size={12} color="#0f172a" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            )}
          </div>

          {/* Feedback banner */}
          {shareNotice && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>✓</span>
              <span>{shareNotice}</span>
            </div>
          )}

          {flyerNotice && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              {isGeneratingFlyer ? <SpinnerIcon size={14} color="#1d4ed8" /> : <CheckIcon size={14} color="#1d4ed8" />}
              <span>{flyerNotice}</span>
            </div>
          )}

          {/* TWO PRIMARY SHARE OPTIONS (SEGMENTED TABS) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '18px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('savedClient')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'savedClient' ? '#ffffff' : 'transparent',
                color: activeTab === 'savedClient' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'savedClient' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: activeTab === 'savedClient' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>👤</span>
              <span>Share Directly with Client</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('anyone')}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'anyone' ? '#ffffff' : 'transparent',
                color: activeTab === 'anyone' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'anyone' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: activeTab === 'anyone' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🌐</span>
              <span>Share with Anyone</span>
            </button>
          </div>

          {/* TAB 1: SHARE DIRECTLY WITH SAVED CLIENT */}
          {activeTab === 'savedClient' && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1.5px solid #a7f3d0',
              backgroundColor: '#f0fdf4',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👤</span> Saved Client Contact
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: 12, border: '1px solid #86efac' }}>
                  DIRECT CLIENT DELIVERY
                </span>
              </div>

              {/* Client Selector (Searchable Combobox matching Inquiries, Properties & Site Visits) */}
              {crmClients.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <SearchableCombobox
                    label="Select / Switch Client from CRM Directory:"
                    value={crmClients.find(c => c.id === selectedClientId)?.name || (selectedClientId === 'custom' ? '-- Custom Client Contact --' : '')}
                    placeholder="Search existing client by name or phone..."
                    searchPlaceholder="Type client name or phone (e.g. 98200...)"
                    options={[
                      ...crmClients.map(c => ({
                        value: c.id,
                        label: c.name,
                        sublabel: c.phone ? `${c.phone}${c.email ? ` • ${c.email}` : ''}` : (c.email || 'No Phone'),
                        badge: (c as any).leadPurpose || (c as any).type || 'Client'
                      })),
                      {
                        value: 'custom',
                        label: '-- Custom Client Contact --',
                        sublabel: 'Manually enter recipient phone & name'
                      }
                    ]}
                    onChange={(val) => {
                      if (!val || val === 'custom') {
                        handleSelectClient('custom');
                      } else {
                        handleSelectClient(val);
                      }
                    }}
                    onAddNew={() => handleSelectClient('custom')}
                    addNewLabel="+ Use Custom Client Contact"
                  />
                </div>
              )}

              {/* Active Client Details Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '14px',
                boxShadow: '0 2px 5px rgba(22, 101, 52, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px'
                  }}>
                    {(savedClientName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {savedClientName || 'Saved Client'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                      <span>📱 Phone: <strong style={{ color: isSavedPhoneValid ? '#15803d' : (savedClientPhone ? '#dc2626' : '#64748b') }}>
                        {savedClientPhone ? (isSavedPhoneValid ? format10DigitDisplay(savedClientPhone) : savedClientPhone) : 'Not set'}
                      </strong></span>
                      {savedClientPhone && !isSavedPhoneValid && (
                        <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 700 }}>
                          (⚠️ {savedPhoneDigits.length}/10 digits - 10 required)
                        </span>
                      )}
                      <span>✉️ Email: <strong style={{ color: isSavedEmailValid ? '#1d4ed8' : '#64748b' }}>{savedClientEmail || 'Not set'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Edit fields if custom client selected or phone/email missing */}
                {(!savedClientPhone || !savedClientEmail || selectedClientId === 'custom') && (
                  <div className="share-2col-grid" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #bbf7d0' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Phone Number (10 Digits):</span>
                      <PhoneInput
                        value={savedClientPhone}
                        onChange={(full, raw) => setSavedClientPhone(raw)}
                        placeholder="98200 45678"
                        style={{ marginTop: 3 }}
                        showValidationMessage={true}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Email Address:</span>
                      <input
                        type="email"
                        value={savedClientEmail}
                        onChange={e => setSavedClientEmail(e.target.value)}
                        placeholder="client@gmail.com"
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${savedClientEmail.trim() && !isSavedEmailValid ? '#f87171' : '#cbd5e1'}`,
                          fontSize: '12px',
                          marginTop: 3
                        }}
                      />
                      {savedClientEmail.trim() && (
                        <div style={{ fontSize: '10.5px', marginTop: 3, fontWeight: 600, color: isSavedEmailValid ? '#16a34a' : '#ea580c' }}>
                          {isSavedEmailValid ? '✓ Valid email' : '⚠️ Valid email required'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Action Buttons for Saved Client */}
              <div className="share-client-actions-grid">
                {/* Send on WhatsApp to Saved Number */}
                {isSavedPhoneValid ? (
                  <a
                    href={`https://wa.me/${formatForWhatsApp(savedClientPhone, '91')}?text=${encodeURIComponent(messageText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordShare(`WhatsApp to Saved Client: ${savedClientName || savedClientPhone}`);
                      setShareNotice(`Opening WhatsApp to chat with ${savedClientName || format10DigitDisplay(savedClientPhone)}...`);
                      setTimeout(() => setShareNotice(null), 4000);
                    }}
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      textDecoration: 'none',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Send message to client on WhatsApp"
                  >
                    <WhatsAppIcon size={16} color="#ffffff" />
                    <span>Send on WhatsApp</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#cbd5e1',
                      color: '#64748b',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px'
                    }}
                    title="Enter a valid 10-digit mobile number to enable"
                  >
                    <WhatsAppIcon size={16} color="#64748b" />
                    <span>Send on WhatsApp</span>
                  </button>
                )}

                {/* Send Email to Saved Email */}
                {isSavedEmailValid ? (
                  <a
                    href={`mailto:${encodeURIComponent(savedClientEmail.trim())}?subject=${encodeURIComponent(`${activeItem.title} — Vance Luxury Realty`)}&body=${encodeURIComponent(messageText)}`}
                    onClick={() => {
                      recordShare(`Email to Saved Client: ${savedClientEmail}`);
                      setShareNotice(`Opening email draft for ${savedClientName || savedClientEmail}...`);
                      setTimeout(() => setShareNotice(null), 4000);
                    }}
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textDecoration: 'none',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Send email to client"
                  >
                    <span>✉️</span>
                    <span>Send Email</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#cbd5e1',
                      color: '#64748b',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px'
                    }}
                    title="Enter a valid email address to enable"
                  >
                    <span>✉️</span>
                    <span>Send Email</span>
                  </button>
                )}

                {/* Call Saved Phone */}
                {isSavedPhoneValid ? (
                  <a
                    href={`tel:${formatForWhatsApp(savedClientPhone, '91')}`}
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                    title="Direct Phone Call"
                  >
                    <PhoneIcon size={14} color="currentColor" />
                    <span>Call</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: '11px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#94a3b8',
                      border: '1px solid #cbd5e1',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                    title="Valid 10-digit phone required"
                  >
                    <PhoneIcon size={14} color="currentColor" />
                    <span>Call</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SHARE WITH ANYONE (CUSTOM NUMBER, EMAIL, WHATSAPP) */}
          {activeTab === 'anyone' && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🌐</span> Share on WhatsApp with Anyone
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: 12 }}>
                  CUSTOM OR BROADCAST
                </span>
              </div>

              {/* Share to specific custom phone number */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Send on WhatsApp to Any Phone Number (10 Digits Required):
                </label>
                <div className="share-responsive-row">
                  <PhoneInput
                    value={customPhone}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    onChange={(full, raw, code) => {
                      setCustomPhone(raw);
                      setCountryCode(code);
                    }}
                    placeholder="98200 12345"
                    showValidationMessage={true}
                    style={{ flex: 1 }}
                  />

                  {isCustomPhoneValid ? (
                    <a
                      href={`https://wa.me/${formatForWhatsApp(customPhone, countryCode)}?text=${encodeURIComponent(messageText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        recordShare(`WhatsApp to +${formatForWhatsApp(customPhone, countryCode)}`);
                        setShareNotice(`Opening WhatsApp to message +${formatForWhatsApp(customPhone, countryCode)}...`);
                        setTimeout(() => setShareNotice(null), 4000);
                      }}
                      style={{
                        padding: '9px 16px',
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      title="Send on WhatsApp"
                    >
                      <WhatsAppIcon size={14} color="#ffffff" />
                      <span>Send WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      style={{
                        padding: '9px 16px',
                        backgroundColor: '#cbd5e1',
                        color: '#64748b',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Enter a valid 10-digit mobile number to enable"
                    >
                      <WhatsAppIcon size={14} color="#64748b" />
                      <span>Send WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Or Open WhatsApp to Pick Any Chat/Group */}
              <div
                className="share-card-row"
                style={{
                  padding: '12px 14px',
                  borderRadius: '9px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Open WhatsApp to Choose Any Chat / Group
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Opens your WhatsApp app or Web so you can pick from your recent conversations
                  </div>
                </div>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    recordShare('WhatsApp Generic Broadcast');
                    setShareNotice('Opening WhatsApp to pick any contact or group...');
                    setTimeout(() => setShareNotice(null), 4000);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #86efac',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <WhatsAppIcon size={14} color="#15803d" />
                  <span>Choose Chat ↗</span>
                </a>
              </div>

              {/* Send to Custom Email */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Send via Email to Anyone:
                </label>
                <div className="share-responsive-row">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    placeholder="e.g. buyer@example.com or colleague@firm.com"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${customEmail.trim() && !isCustomEmailValid ? '#f87171' : '#cbd5e1'}`,
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' && isCustomEmailValid) handleSendEmailToCustom(); }}
                  />
                  {isCustomEmailValid ? (
                    <a
                      href={`mailto:${encodeURIComponent(customEmail.trim())}?subject=${encodeURIComponent(`${activeItem.title} — Vance Luxury Realty`)}&body=${encodeURIComponent(messageText)}`}
                      onClick={() => {
                        recordShare(`Email to ${customEmail}`);
                        setShareNotice(`Opening email draft for ${customEmail}...`);
                        setTimeout(() => setShareNotice(null), 4000);
                      }}
                      style={{
                        padding: '9px 16px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                      title="Send Email"
                    >
                      <MailIcon size={14} color="#ffffff" />
                      <span>Send Email</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      style={{
                        padding: '9px 16px',
                        backgroundColor: '#cbd5e1',
                        color: '#64748b',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Enter a valid email address to enable"
                    >
                      <MailIcon size={14} color="#64748b" />
                      <span>Send Email</span>
                    </button>
                  )}
                </div>
                {customEmail.trim() && !isCustomEmailValid && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', marginTop: 4 }}>
                    ⚠️ Please enter a valid email format (e.g. name@domain.com)
                  </div>
                )}
              </div>

              {/* Quick Actions (Copy Message, Native Share) */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: copiedMessage ? '#10b981' : '#ffffff',
                    color: copiedMessage ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {copiedMessage ? <CheckIcon size={14} color="#fff" /> : <CopyIcon size={14} color="#64748b" />}
                  <span>{copiedMessage ? 'Message Copied!' : 'Copy Formatted Text'}</span>
                </button>

                {typeof navigator !== 'undefined' && (navigator as any).share && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <ShareIcon size={14} color="#0f172a" />
                    <span>Device Share</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PROPERTY-SPECIFIC ACTIONS (Branded Photo Card & Flyer) */}
          {activeProperty && (
            <div style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🖼️</span> Branded Property Photo Card &amp; Flyer
                </div>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>{sharesCount} Shares Logged</span>
              </div>

              <div className="share-2col-grid">
                <button
                  type="button"
                  onClick={handleWhatsAppWithPhoto}
                  disabled={isGeneratingFlyer}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: isGeneratingFlyer ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isGeneratingFlyer ? <SpinnerIcon size={14} color="#ffffff" /> : <WhatsAppIcon size={14} color="#ffffff" />}
                  <span>Share with Photo Card</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFlyer}
                  disabled={isGeneratingFlyer}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: isGeneratingFlyer ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <DownloadIcon size={14} color="#475569" />
                  <span>Download Photo Flyer</span>
                </button>
              </div>

              {/* Privacy Mode Selector */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  Public Showcase Access Mode:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {(['Public', 'Restricted', 'Private'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => changePrivacyMode(mode)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: privacyMode === mode ? '2px solid #059669' : '1px solid #cbd5e1',
                        backgroundColor: privacyMode === mode ? '#ecfdf5' : '#ffffff',
                        color: privacyMode === mode ? '#047857' : '#475569',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EDITABLE MESSAGE PREVIEW ACCORDION */}
          <div style={{
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}>
            <div
              onClick={() => setShowEditMessage(!showEditMessage)}
              style={{
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span>
                <span>Personalize Message Content</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 600 }}>
                {showEditMessage ? 'Hide Preview ▲' : 'Edit Text ▼'}
              </span>
            </div>

            {showEditMessage && (
              <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 6px' }}>
                  Changes will be reflected in both WhatsApp and Email outgoing messages:
                </p>
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    lineHeight: 1.45,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px calc(14px + env(safe-area-inset-bottom, 0px))',
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
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 700,
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
