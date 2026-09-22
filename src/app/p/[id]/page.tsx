'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface PublicProperty {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number | null;
  status: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  listingType: string;
  description: string;
  images: string[];
  features: string[];
  publicToken: string;
  privacyMode: string;
  viewsCount: number;
  agencyName: string;
  agencyCountry: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
}

export default function PublicPropertyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inquiry form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);

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
          setError(data.error || 'Property listing not found or is currently private.');
        }
      } catch {
        setError('Failed to connect to property registry.');
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || (!form.email && !form.phone)) {
      setSubmitError('Please provide your name and at least an email or phone number.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/public/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property?.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          preferredDate: form.preferredDate,
          message: form.message
        })
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitSuccess(json.message || 'Inquiry successfully submitted! Our advisor will be in touch shortly.');
        setForm({ name: '', email: '', phone: '', preferredDate: '', message: '' });
      } else {
        setSubmitError(json.error || 'Failed to submit inquiry.');
      }
    } catch {
      setSubmitError('Network error. Please try again or contact the agent directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = property ? `Check out this luxury ${property.type}: ${property.title} in ${property.location} - ${property.price ? `$${property.price.toLocaleString()}` : ''}` : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Loading Exclusive Property Presentation...</h2>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px' }}>
          🔒
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px' }}>Listing Unavailable</h1>
        <p style={{ maxWidth: '440px', color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
          {error || 'This property is either private or has been removed by the listing brokerage.'}
        </p>
        <Link href="/" style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
          Return to AgentLadders
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : ['/images/property_hero.jpg'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
            AL
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', letterSpacing: '-0.3px' }}>{property.agencyName}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Verified Real Estate Partner &middot; {property.agencyCountry}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(property.agentPhone.replace(/[^0-9+]/g, ''))}&text=${encodeURIComponent(`Hi ${property.agentName}, I am inquiring about "${property.title}" (${currentUrl})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#25D366',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            <span>💬</span> WhatsApp Agent
          </a>
          <a
            href="#tour-booking"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            Schedule VIP Tour
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px 80px' }}>
        
        {/* Title & Location Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                {property.listingType.toUpperCase()}
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#166534' }}>
                ✓ Verified Exclusive
              </span>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                ID: {property.id}
              </span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
              {property.title}
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              📍 {property.location}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Offering Price
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#2563eb', letterSpacing: '-1px' }}>
              {property.price ? `$${property.price.toLocaleString()}` : 'Price on Application'}
            </div>
            {property.price && (
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Est. ${Math.round(property.price / (property.areaSqFt || 3200)).toLocaleString()} / sq.ft
              </div>
            )}
          </div>
        </div>

        {/* Hero Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', backgroundColor: '#000' }}>
          {/* Main Large Showcase Image */}
          <div style={{ position: 'relative', minHeight: '440px', backgroundColor: '#1e293b' }}>
            <Image
              src={images[activeImageIndex] || images[0]}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
              style={{ objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
              Photo {activeImageIndex + 1} of {images.length}
            </div>
          </div>

          {/* Side Thumbnails Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#0f172a', justifyContent: 'center' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  position: 'relative',
                  height: '130px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImageIndex === idx ? '3px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                  opacity: activeImageIndex === idx ? 1 : 0.7,
                  transition: 'all 0.2s ease'
                }}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Specifications Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          backgroundColor: '#ffffff',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '32px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Bedrooms</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>🛏️ {property.bedrooms} Beds</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Bathrooms</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>🛁 {property.bathrooms} Baths</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Area</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>📐 {property.areaSqFt.toLocaleString()} sqft</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Property Type</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>🏛️ {property.type}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Market Status</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>🟢 {property.status}</div>
          </div>
        </div>

        {/* 2-Column Layout: Details + Inquiry Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Column: Description & Amenities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Description Card */}
            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Property Overview
              </h2>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>
                {property.description}
              </p>
            </div>

            {/* Key Features & Amenities Card */}
            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Highlights & Bespoke Amenities
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {property.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span> {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Share Bar */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px 28px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                Share This Presentation
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#25D366', color: '#ffffff', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                >
                  💬 WhatsApp
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#0088cc', color: '#ffffff', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                >
                  ✈️ Telegram
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(shareText + '\n\nView Property: ' + currentUrl)}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#475569', color: '#ffffff', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                >
                  ✉️ Email
                </a>

                {/* SMS */}
                <a
                  href={`sms:?body=${encodeURIComponent(shareText + ' ' + currentUrl)}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#64748b', color: '#ffffff', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                >
                  📱 SMS
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#0a66c2', color: '#ffffff', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                >
                  💼 LinkedIn
                </a>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: copied ? '#10b981' : '#0f172a', color: '#ffffff', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Agent Card & VIP Tour Booking */}
          <div id="tour-booking" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Agent Contact Card */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px', color: '#2563eb', border: '2px solid #dbeafe' }}>
                  {property.agentName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>{property.agentName}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Certified Luxury Specialist</div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>{property.agencyName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`tel:${property.agentPhone}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                >
                  📞 Call {property.agentPhone}
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(property.agentPhone.replace(/[^0-9+]/g, ''))}&text=${encodeURIComponent(`Hello ${property.agentName}, I would like more information on "${property.title}" (${currentUrl})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', backgroundColor: '#25D366', color: '#ffffff', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Direct Client Inquiry & Showing Booking Form */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '28px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Schedule Private Showing
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                Reserve an exclusive viewing or request full architectural specifications directly with the listing broker.
              </p>

              {submitSuccess ? (
                <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Inquiry Registered</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{submitSuccess}</div>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess('')}
                    style={{ marginTop: '16px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #16a34a', backgroundColor: '#ffffff', color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {submitError && (
                    <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px' }}>
                      ⚠️ {submitError}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jonathan Reynolds"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. client@investments.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2831"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                      Preferred Showing Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={e => setForm({ ...form, preferredDate: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                      Questions / Special Requests
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Interested in private tour schedule, title deed status, or wire transfer terms..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: submitting ? '#94a3b8' : '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      marginTop: '6px',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    {submitting ? 'Transmitting Request...' : 'Confirm Showing Request'}
                  </button>
                  <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                    🔒 Confidentiality guaranteed. Your details are never sold or shared.
                  </p>
                </form>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '32px 24px', textAlign: 'center', fontSize: '13px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            &copy; {new Date().getFullYear()} {property.agencyName}. All rights reserved. Real Estate License Verified.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span style={{ color: '#38bdf8' }}>Powered by AgentLadders</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
