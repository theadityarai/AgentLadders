'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BuildingIcon, 
  HomeIcon, 
  ZapIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  MenuIcon, 
  XIcon 
} from '@/components/icons/NavIcons';

// Inline SVG Icons for pixel-perfect, crisp rendering
const IconCheck = ({ size = 16, color = '#059669' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrowRight = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconSparkles = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const IconShield = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconCalendar = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconChevronDown = ({ open }: { open: boolean }) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive ROI Calculator states
  const [activeListingsCount, setActiveListingsCount] = useState<number>(35);
  const [avgTicketSizeCr, setAvgTicketSizeCr] = useState<number>(3.5);

  // Computed ROI Metrics
  const estimatedHoursSaved = Math.round(activeListingsCount * 0.45 + 5);
  const extraDealsClosed = Math.max(1, Math.round(activeListingsCount * 0.12));
  const estimatedUpsideLakhs = Math.round(extraDealsClosed * (avgTicketSizeCr * 100 * 0.02)); // assuming standard 2% brokerage

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'var(--font-family)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div style={{
        background: 'linear-gradient(90deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#d1fae5',
        fontSize: '13px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        letterSpacing: '0.01em'
      }}>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
          NEW 2026 EDITION
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ZapIcon size={14} color="#34d399" /> Public Client Portals with Verified Site Visit Booking &amp; WhatsApp Automation are now live!
        </span>
        <Link href="/signup" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 700 }}>
          Try Free →
        </Link>
      </div>

      {/* 2. STICKY GLASS NAVIGATION */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        transition: 'all 0.2s ease'
      }}>
        <nav style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Brand Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              color: '#ffffff',
            }}>
              <BuildingIcon size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                AgentLadders
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Real Estate CRM · India
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: 600 }}>
            <a href="#features" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
            <a href="#workflow" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Workflow</a>
            <a href="#roi-calculator" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>ROI Calculator</a>
            <a href="#comparison" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Why AgentLadders</a>
            <a href="#pricing" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>Pricing</a>
            <a href="#faq" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>FAQ</a>
          </div>

          {/* Auth Action Buttons */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/login" style={{
              color: '#334155',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.15s'
            }}>
              Sign In
            </Link>
            <Link href="/signup" style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.15s ease'
            }}>
              Start Free Trial →
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="show-on-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              padding: '6px'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <XIcon size={24} color="#0f172a" /> : <MenuIcon size={24} color="#0f172a" />}
          </button>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Features</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Workflow</a>
            <a href="#roi-calculator" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>ROI Calculator</a>
            <a href="#comparison" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Why AgentLadders</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>FAQ</a>
            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0f172a', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Sign In</Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} style={{ backgroundColor: '#059669', color: '#ffffff', textAlign: 'center', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
              Start 14-Day Free Trial →
            </Link>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (High-Class & Conversion-Focused) */}
      <section style={{
        position: 'relative',
        padding: '70px 24px 90px',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(5, 150, 105, 0.15), rgba(255, 255, 255, 0))',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Main Hero Header */}
          <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
            
            {/* Top Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#065f46',
              marginBottom: '24px',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              <span>RERA-Ready · Built for Indian Real Estate Brokers & Channel Partners</span>
            </div>

            {/* Main Headline */}
            <h1 className="mobile-text-4xl" style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-1.8px',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Close More High-Ticket Deals.{' '}
              <span className="gradient-text-emerald">Manage Zero Spreadsheets.</span>
            </h1>

            {/* Sub-headline */}
            <p style={{
              fontSize: '19px',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 36px',
              fontWeight: 400
            }}>
              Unify your property listings, buyer inquiries, WhatsApp pitches, and closing pipelines into one high-velocity CRM. Trusted by top brokers closing <strong style={{ color: '#0f172a' }}>₹1,500+ Cr</strong> in annual transactions across Mumbai, Bengaluru, Delhi-NCR, Hyderabad & Dubai.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              <Link href="/signup" style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '16px 36px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.45)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Start 14-Day Free Trial
                <IconArrowRight />
              </Link>

              <Link href="/dashboard" style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '16px 28px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ZapIcon size={16} color="#059669" />
                Explore Live Interactive CRM
              </Link>
            </div>

            {/* Social Trust Line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#f59e0b' }}>★★★★★</span> 4.9/5 from 850+ Elite Brokers
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} /> Instant 2-Minute Setup
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} /> No Credit Card Required
              </span>
            </div>

          </div>

          {/* 3D Dashboard Showcase Mockup with Ambient Glow & Floating Widgets */}
          <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>
            
            {/* Ambient Background Glow */}
            <div style={{
              position: 'absolute',
              top: '5%',
              left: '10%',
              right: '10%',
              bottom: '5%',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.3) 0%, rgba(16, 185, 129, 0.15) 100%)',
              filter: 'blur(70px)',
              zIndex: 0,
              borderRadius: '24px'
            }} />

            {/* Main Mockup Container */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '20px',
              padding: '8px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.7) 100%)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ position: 'relative', width: '100%', height: 'auto', borderRadius: '14px', overflow: 'hidden' }}>
                <Image
                  src="/images/hero_dashboard.jpg"
                  alt="AgentLadders Real Estate CRM Dashboard"
                  width={1200}
                  height={800}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '14px'
                  }}
                  priority
                />
              </div>

              {/* Floating Live Badge 1: Token Received Closed Deal */}
              <div className="hide-on-mobile animate-float-slow" style={{
                position: 'absolute',
                top: '40px',
                right: '-24px',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px 18px',
                boxShadow: '0 20px 35px -5px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 2
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BriefcaseIcon size={20} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal Closed · Token Received</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>₹8.40 Cr · Lodha World One</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Brokerage Invoiced: ₹16.80 Lakhs</div>
                </div>
              </div>

              {/* Floating Live Badge 2: Site Visits Scheduled */}
              <div className="hide-on-mobile animate-float-slow-reverse" style={{
                position: 'absolute',
                bottom: '40px',
                left: '-24px',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px 18px',
                boxShadow: '0 20px 35px -5px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 2
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPinIcon size={20} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekend Calendar</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>14 Site Visits Booked</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>● Automated WhatsApp Gate Passes sent</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. PREMIER DEVELOPER SYNDICATION LOGOS */}
      <section style={{
        padding: '36px 20px',
        backgroundColor: '#fafbfc',
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '20px'
          }}>
            Powers channel partners & independent brokers handling luxury inventory from
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            opacity: 0.75
          }}>
            {['DLF LUXURY', 'LODHA GROUP', 'GODREJ PROPERTIES', 'PRESTIGE ESTATES', 'OBEROI REALTY', 'SOBHA LTD', 'BRIGADE GROUP', 'HIRANANDANI'].map((developer, i) => (
              <span key={i} style={{
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#334155'
              }}>
                {developer}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW LIFECYCLE: 01 to 04 */}
      <section id="workflow" style={{ padding: '90px 24px', maxWidth: '1140px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          backgroundColor: '#eff6ff',
          borderRadius: '20px',
          color: '#1d4ed8',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          OPERATIONAL LIFECYCLE
        </div>
        <h2 className="mobile-text-3xl" style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.8px', color: '#0f172a', marginBottom: '16px' }}>
          Engineered for how Indian real estate actually gets sold.
        </h2>
        <p style={{ fontSize: '16.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto 60px', lineHeight: 1.6 }}>
          Never lose a prospective buyer between inquiry and token signing. AgentLadders orchestrates your workflow across every transaction milestone.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          textAlign: 'left'
        }}>
          {[
            {
              step: '01',
              title: 'Capture Inquiries',
              desc: 'Seamlessly capture incoming leads from portals, WhatsApp, and call logs with instant budget & location categorization.',
              tag: 'Zero Lead Leakage',
              tagColor: '#059669',
              tagBg: '#d1fae5'
            },
            {
              step: '02',
              title: 'AI Smart Match',
              desc: 'Our engine instantly pairs buyer preferences against available listings, generating one-click WhatsApp brochures.',
              tag: 'Instant Pitching',
              tagColor: '#2563eb',
              tagBg: '#dbeafe'
            },
            {
              step: '03',
              title: 'Schedule Site Visits',
              desc: 'Book visits into calendar with client notes, time slots, and verified user booking links with SMS/WhatsApp directions.',
              tag: 'Weekend Velocity',
              tagColor: '#d97706',
              tagBg: '#fef3c7'
            },
            {
              step: '04',
              title: 'Milestone Closing',
              desc: 'Track negotiations through Token Received, Agreement, and Registration. Generate brokerage invoices with GST calculation.',
              tag: 'Guaranteed Payouts',
              tagColor: '#7c3aed',
              tagBg: '#ede9fe'
            }
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '30px 24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#cbd5e1',
                marginBottom: '14px',
                letterSpacing: '-1px'
              }}>
                {item.step}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: item.tagBg,
                color: item.tagColor,
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                {item.tag}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DEEP DIVE FEATURE SHOWCASES WITH GRAPHICS & MEDIA */}
      <section id="features" style={{ backgroundColor: '#f8fafc', padding: '100px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '90px' }}>
          
          {/* Feature 1: Centralized Inventory & Client Microsites */}
          <div className="mobile-col mobile-gap-8" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                PROPERTY INVENTORY ENGINE
              </div>
              <h2 className="mobile-text-3xl" style={{ fontSize: '34px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: '18px' }}>
                Private broker control with stunning public client links.
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Maintain confidential seller numbers, commission agreements, and lockbox codes in private notes. Simultaneously generate branded microsite links for clients to view photos, specs, and schedule site visits directly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Strict confidentiality: Owner contacts never leak to clients.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Client booking form tags visits as &ldquo;Direct Client&rdquo; automatically.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Instant WhatsApp brochure generator with formatted specifications.
                </div>
              </div>
              <Link href="/dashboard/properties" style={{
                color: '#059669',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Explore Properties Module <IconArrowRight color="#059669" />
              </Link>
            </div>
            
            {/* Visual Media Card */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                border: '1px solid #cbd5e1'
              }}>
                <Image
                  src="/images/property_hero.jpg"
                  alt="Luxury Real Estate Portfolio"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '24px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <BuildingIcon size={22} color="#059669" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Aurora Residences · Worli</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Active Public Booking Portal Enabled</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Mobile Deal Velocity & WhatsApp Pitching */}
          <div className="mobile-col-reverse mobile-gap-8" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
            {/* Visual Media Card */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                border: '1px solid #cbd5e1'
              }}>
                <Image
                  src="/images/feature_mobile.jpg"
                  alt="Mobile Real Estate CRM Interface"
                  width={600}
                  height={600}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                MOBILE DEAL VELOCITY
              </div>
              <h2 className="mobile-text-3xl" style={{ fontSize: '34px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: '18px' }}>
                Operate from site visits, developer launches, or traffic.
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Indian real estate brokers rarely sit behind a desktop. Our responsive mobile experience lets you log inquiries on the move, verify client site visit feedback in real time, and chat via WhatsApp without typing manual essays.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Direct WhatsApp link with pre-formatted pitch messaging.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Complete access to client budgets and pending callbacks.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Responsive touch swiping for Kanban stages and calendars.
                </div>
              </div>
              <Link href="/dashboard/leads" style={{
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Explore Inquiries Engine <IconArrowRight color="#2563eb" />
              </Link>
            </div>
          </div>

          {/* Feature 3: Deals Pipeline & Financial Commission Settlement */}
          <div className="mobile-col mobile-gap-8" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                COMMISSION & CLOSING ENGINE
              </div>
              <h2 className="mobile-text-3xl" style={{ fontSize: '34px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: '18px' }}>
                From Token Advance to Registration and Brokerage Payout.
              </h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Track every transaction milestone across Negotiation, Token Received, Agreement for Sale, and Registration. Never lose track of developer invoices, TDS deductions, and co-broker commission splits.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Visual Kanban tracking with Lakhs & Crores pipeline value.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Inbuilt invoice generator with GST and automated payment status.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  <IconCheck /> Forensic audit trail of deal stage transitions.
                </div>
              </div>
              <Link href="/dashboard/deals" style={{
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                View Deals Pipeline <IconArrowRight color="#7c3aed" />
              </Link>
            </div>

            {/* Visual Media Card */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                border: '1px solid #cbd5e1'
              }}>
                <Image
                  src="/images/deal_closing.jpg"
                  alt="Real Estate Transaction Closing"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)'
              }}>
                ✓ Agreement Registered · ₹12.50 Cr
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. LIVE INTERACTIVE ROI & COMMISSION UPSIDE CALCULATOR */}
      <section id="roi-calculator" style={{ padding: '90px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '60px 48px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-40%',
            right: '-20%',
            width: '400px',
            height: '400px',
            backgroundColor: 'rgba(5, 150, 105, 0.25)',
            filter: 'blur(80px)',
            borderRadius: '50%'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ backgroundColor: 'rgba(5,150,105,0.2)', color: '#34d399', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                INTERACTIVE ROI CALCULATOR
              </span>
              <h2 className="mobile-text-3xl" style={{ fontSize: '36px', fontWeight: 800, marginTop: '12px', marginBottom: '12px', letterSpacing: '-0.8px' }}>
                Calculate Your Agency&apos;s Revenue Upside
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                See how much time your team saves and how many additional transactions you close with AgentLadders.
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="mobile-col mobile-grid-1 mobile-gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '48px', alignItems: 'center' }}>
              
              {/* Sliders Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Active Property Inventory</label>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>{activeListingsCount} listings</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={activeListingsCount}
                    onChange={(e) => setActiveListingsCount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    <span>10 Listings</span>
                    <span>150 Listings</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Average Transaction Value</label>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>₹{avgTicketSizeCr.toFixed(1)} Cr</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={avgTicketSizeCr}
                    onChange={(e) => setAvgTicketSizeCr(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    <span>₹1 Cr (Affordable Luxury)</span>
                    <span>₹15 Cr+ (Ultra Prime)</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Computed Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Time Saved / Week:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>~{estimatedHoursSaved} Hours</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Est. Additional Deals / Year:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>+{extraDealsClosed} Closings</span>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Projected Extra Annual Brokerage Earned
                  </div>
                  <div style={{ fontSize: '38px', fontWeight: 900, color: '#10b981', letterSpacing: '-1px' }}>
                    ₹{estimatedUpsideLakhs >= 100 ? `${(estimatedUpsideLakhs / 100).toFixed(2)} Cr` : `${estimatedUpsideLakhs} Lakhs`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    *Based on 2% standard brokerage commission rate
                  </div>
                </div>

                <Link href="/signup" style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '14px'
                }}>
                  Unlock Your Agency Upside →
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 8. COMPARISON MATRIX: Why Independent Brokers Choose Us */}
      <section id="comparison" style={{ padding: '90px 24px', maxWidth: '1140px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          backgroundColor: '#fef3c7',
          borderRadius: '20px',
          color: '#b45309',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          RIGOROUS COMPARISON
        </div>
        <h2 className="mobile-text-3xl" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.8px', color: '#0f172a', marginBottom: '16px' }}>
          Why Excel & Foreign CRMs Fall Short for Indian Brokers
        </h2>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '640px', margin: '0 auto 48px' }}>
          Foreign tools require months of expensive consultants. Excel leaks leads and lacks client-facing passes. AgentLadders is custom-built for how real estate is sold in India.
        </p>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '18px 24px', fontWeight: 700, color: '#334155' }}>Feature Capability</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, color: '#64748b' }}>Excel & WhatsApp</th>
                <th style={{ padding: '18px 24px', fontWeight: 600, color: '#64748b' }}>Salesforce / HubSpot</th>
                <th style={{ padding: '18px 24px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5' }}>AgentLadders</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'Indian Currency Formatting (Lakhs & Crores)',
                  excel: 'Manual Formulas',
                  foreign: 'Dollars ($) / Millions only',
                  agent: '✓ Native ₹ Lakhs & Cr'
                },
                {
                  feature: 'Shareable Public Property Portals with Visit Booking',
                  excel: '❌ None',
                  foreign: '❌ Requires custom CMS',
                  agent: '✓ 1-Click Instant Link'
                },
                {
                  feature: 'Confidential Owner Notes vs Client Public View',
                  excel: '❌ Risk of accidental leak',
                  foreign: 'Requires complex roles',
                  agent: '✓ Strict Field Separation'
                },
                {
                  feature: 'Direct 1-Click WhatsApp Pitch Generator',
                  excel: '❌ Manual copy-paste',
                  foreign: '❌ Expensive Twilio add-on',
                  agent: '✓ Native 1-Click WhatsApp'
                },
                {
                  feature: 'Site Visit Scheduling with "Created By User" Tagging',
                  excel: '❌ Scattered in chats',
                  foreign: 'Generic calendar only',
                  agent: '✓ Dedicated Real Estate Engine'
                },
                {
                  feature: 'Token -> Agreement -> Registration Deal Milestones',
                  excel: '❌ Unstructured columns',
                  foreign: 'Western stages only',
                  agent: '✓ Native Indian Milestones'
                },
                {
                  feature: 'Setup Time & Learning Curve',
                  excel: 'Instant (but chaotic)',
                  foreign: '4–8 Weeks implementation',
                  agent: '✓ 2 Minutes (Zero Training)'
                }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{row.feature}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{row.excel}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{row.foreign}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#059669', backgroundColor: '#f0fdf4' }}>{row.agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. REAL VERIFIED BROKER TESTIMONIALS */}
      <section style={{ backgroundColor: '#f8fafc', padding: '90px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            VERIFIED BROKER EXPERIENCES
          </span>
          <h2 className="mobile-text-3xl" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.8px', color: '#0f172a', marginTop: '12px', marginBottom: '48px' }}>
            Trusted by the Top 1% of Indian Real Estate Advisory Teams
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
            textAlign: 'left'
          }}>
            {[
              {
                quote: "Managing ₹120 Cr+ in Worli and Bandra West inventory used to be pure chaos across 8 Google Sheets. AgentLadders organized our weekend site visits and helped us close 3 extra luxury penthouses within 60 days.",
                author: "Rajesh Singhania",
                role: "Managing Director",
                firm: "Singhania Luxury Advisory · Mumbai",
                img: "/images/hero_broker.jpg",
                metric: "Closed ₹24 Cr in Q1"
              },
              {
                quote: "The public property microsite with the 'Book Visit' form is brilliant. Inquiries from our Instagram and WhatsApp marketing book their own slots directly, and my agents get real-time lead alerts immediately.",
                author: "Vikramaditya Rao",
                role: "Principal Broker",
                firm: "Prestige Capital Realty · Bangalore",
                img: "/images/avatar_agent.jpg",
                metric: "18 Hours Saved Weekly"
              },
              {
                quote: "Finally a software built for how Indian deals actually progress! Token received, agreement signing, RERA registration, and developer GST invoices are all tracked right out of the box.",
                author: "Ananya Sharma",
                role: "Founder & Lead Channel Partner",
                firm: "Skyline Partners · Golf Course Rd, Gurgaon",
                img: "/images/deal_closing.jpg",
                metric: "100% Commission Audit Trail"
              }
            ].map((t, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px 28px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '14px' }}>★★★★★</div>
                  <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e2e8f0', position: 'relative' }}>
                      <Image src={t.img} alt={t.author} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{t.author}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{t.role} · {t.firm}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '6px' }}>
                    {t.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. PRICING TIERS (Clear, Transparent, Indian Rupee Pricing) */}
      <section id="pricing" style={{ padding: '90px 24px', maxWidth: '1140px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          SIMPLE, HONEST PRICING
        </span>
        <h2 className="mobile-text-3xl" style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.8px', color: '#0f172a', marginTop: '12px', marginBottom: '16px' }}>
          Invest in Your Deal Velocity
        </h2>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '580px', margin: '0 auto 36px' }}>
          No hidden implementation fees. Cancel anytime with 1 click.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '30px',
          marginBottom: '50px'
        }}>
          <button
            onClick={() => setAnnualBilling(false)}
            style={{
              padding: '8px 18px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: !annualBilling ? '#ffffff' : 'transparent',
              color: !annualBilling ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: !annualBilling ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnualBilling(true)}
            style={{
              padding: '8px 18px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: annualBilling ? '#059669' : 'transparent',
              color: annualBilling ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: annualBilling ? '0 2px 6px rgba(5,150,105,0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Annual Billing <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>Save 20%</span>
          </button>
        </div>

        {/* 3 Pricing Plans */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
          textAlign: 'left',
          alignItems: 'stretch'
        }}>
          
          {/* Plan 1: Starter */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '36px 30px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Starter Broker</div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Ideal for solo independent real estate advisors.</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a' }}>
                  ₹{annualBilling ? '1,599' : '1,999'}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}> / month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {['1 User Seat', '50 Active Property Listings', 'Inquiries & Lead Management', '1-Click WhatsApp Pitching', 'Direct Client Public Listing Links', 'Standard Support'].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <IconCheck size={15} /> {feat}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/signup" style={{
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              textAlign: 'center',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid #cbd5e1'
            }}>
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Plan 2: Pro Agency (Popular) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '36px 30px',
            border: '2px solid #059669',
            boxShadow: '0 12px 30px -5px rgba(5, 150, 105, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-13px',
              right: '24px',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '3px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              MOST POPULAR
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Pro Agency</div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>For growing broker agencies & channel partner teams.</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a' }}>
                  ₹{annualBilling ? '3,999' : '4,999'}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}> / month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {[
                  'Up to 5 Agent Seats',
                  'Unlimited Property Listings',
                  'AI Smart Match & Auto-budgeting',
                  'Site Visit Calendar & QR Passes',
                  'Kanban Deals & Milestones Pipeline',
                  'GST Invoice & Commission Generator',
                  'Priority WhatsApp Support'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#0f172a', fontWeight: 600 }}>
                    <IconCheck size={15} /> {feat}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/signup" style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              textAlign: 'center',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(5,150,105,0.35)'
            }}>
              Start 14-Day Free Trial →
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '36px 30px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Enterprise Brokerage</div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Multi-office advisory firms and premier channel partners.</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a' }}>
                  ₹{annualBilling ? '9,599' : '11,999'}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}> / month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {[
                  'Up to 20 Agent Seats (Scaleable)',
                  'Custom Domain & White-Label Microsites',
                  'Multi-Branch Inventory Synchronization',
                  'Automated Commission Settlement Splits',
                  'Dedicated Concierge Account Manager',
                  'Custom Data Import from Excel/Old CRM',
                  '24/7 SLA Guarantee'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <IconCheck size={15} /> {feat}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/signup" style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              textAlign: 'center',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Contact Concierge Team
            </Link>
          </div>

        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section id="faq" style={{ backgroundColor: '#f8fafc', padding: '90px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mobile-text-3xl" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.8px', color: '#0f172a', marginTop: '12px' }}>
              Everything You Need to Know
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                q: 'Is my client and property owner data 100% private from other brokers?',
                a: 'Yes, absolutely. AgentLadders uses enterprise-grade tenant isolation with 256-bit encryption. Your listings, client phone numbers, landlord contacts, private commission notes, and negotiations are strictly confidential to your agency and will NEVER be shared or visible to any external broker.'
              },
              {
                q: 'How does 1-Click WhatsApp Pitching work without third-party API costs?',
                a: 'Every property, inquiry, and deal card includes a native 1-click WhatsApp action. It automatically composes property highlights, pricing in Indian units (₹ Lakhs / Crores), key amenities, and a tokenized privacy showcase link. It opens directly in your official WhatsApp Web or phone app with zero third-party fees and zero ban risks.'
              },
              {
                q: 'How does the Public Client Microsite and Site Visit Booking work?',
                a: 'For any listing in your inventory, you can share a clean, luxury public showcase link (e.g. /p/your-token). Clients see high-res photo carousels, verified Carpet Area specs, and a "Book Visit" drawer. When they submit, the visit is instantly logged in your CRM tagged as "Created by Buyer", while owner details and private margins remain 100% hidden.'
              },
              {
                q: 'How does AgentLadders ensure Indian RERA compliance?',
                a: 'AgentLadders enforces dedicated RERA registration IDs and certified Carpet Area measurements (as mandated by Section 4(2) of RERA) across all listings and marketing materials, preventing statutory penalties for your agency.'
              },
              {
                q: 'How are Co-Broker (50:50) and Internal Agent Commission splits handled?',
                a: 'In the Deals Pipeline, you can record Buyer and Seller Commission percentages and toggle "Co-Broker Split". The system automatically computes Net Agency Receivable, calculates external partner broker shares, and allocates commission payouts to your internal agents.'
              },
              {
                q: 'What legal contracts and agreements are included out-of-the-box?',
                a: 'In the Help & Legal Center, you get instant access to 10 legally vetted Indian real estate agreements: 11-Month Residential Leave & License (Rent), Commercial Space Leases, Property Token (Bayana) Agreements, Sole Selling Exclusive Mandates, Co-Brokerage MoUs, Channel Partner Agreements, and Police Verification Undertakings. You can copy or download them as editable text files with 1 click.'
              },
              {
                q: 'How does the Magic-Match buyer-to-property engine work?',
                a: 'When an inquiry enters your pipeline, Magic-Match analyzes the buyer’s budget range, required BHK configuration, preferred localities, and purpose (Buy/Rent) against your active property database, displaying ranked compatibility scores so agents can pitch ideal properties instantly.'
              },
              {
                q: 'Can I import my existing Excel sheets and WhatsApp leads?',
                a: 'Yes! We provide a 1-click CSV import for your leads, properties, and landlords. Our onboarding concierge team is also available to migrate your legacy spreadsheets free of charge.'
              },
              {
                q: 'Can we customize the CRM with our agency logo and corporate theme?',
                a: 'Yes. In Settings, you can upload your agency logo, select from 6 luxury real estate font pairings, and choose from 5 curated color palettes (Emerald, Sapphire, Rose Gold, Amber, Indigo). Your branding propagates across all dashboards, client links, and downloadable contracts in real time.'
              },
              {
                q: 'What happens after the 14-day free trial?',
                a: 'You can test the complete platform with your team for 14 days with zero risk and no credit card required. At the end of the trial, you can select the plan that fits your agency size, or cancel with 1 click.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <span>{item.q}</span>
                  <IconChevronDown open={openFaq === idx} />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 24px 20px', fontSize: '14.5px', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ paddingTop: '12px' }}>{item.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. HIGH-IMPACT FINAL CTA BANNER */}
      <section style={{
        padding: '90px 24px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(5,150,105,0.3) 0%, rgba(15,23,42,0) 70%)',
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(5, 150, 105, 0.2)',
            color: '#34d399',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '24px'
          }}>
            <ZapIcon size={14} color="#34d399" /> Instant Setup in 2 Minutes · No Credit Card Required
          </div>
          <h2 className="mobile-text-3xl" style={{ fontSize: '46px', fontWeight: 800, letterSpacing: '-1.2px', marginBottom: '20px', lineHeight: 1.15 }}>
            Ready to upgrade your brokerage to the next tier?
          </h2>
          <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '36px' }}>
            Join 850+ forward-thinking real estate brokers closing ₹1,500+ Cr in properties annually across India.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '16px 36px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(5, 150, 105, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Start 14-Day Free Trial <IconArrowRight />
            </Link>
            <Link href="/login" style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              padding: '16px 28px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              Sign In to Your Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 13. COMPREHENSIVE FOOTER */}
      <footer style={{
        backgroundColor: '#020617',
        color: '#64748b',
        padding: '70px 24px 36px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '13px'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}>
            {/* Col 1: Brand Info */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}>
                  <BuildingIcon size={18} color="#ffffff" />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>AgentLadders</span>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
                The premier operating system for high-performing real estate brokers, channel partners, and luxury property advisors across India.
              </p>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                Proudly Built &amp; Engineered for Indian Real Estate
              </div>
            </div>

            {/* Col 2: Product Modules */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Platform Modules
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Today Cockpit</Link>
                <Link href="/dashboard/leads" style={{ color: '#94a3b8', textDecoration: 'none' }}>Inquiries & AI Match</Link>
                <Link href="/dashboard/properties" style={{ color: '#94a3b8', textDecoration: 'none' }}>Property Inventory</Link>
                <Link href="/dashboard/site-visits" style={{ color: '#94a3b8', textDecoration: 'none' }}>Site Visit Scheduler</Link>
                <Link href="/dashboard/deals" style={{ color: '#94a3b8', textDecoration: 'none' }}>Deals & Kanban</Link>
                <Link href="/dashboard/invoices" style={{ color: '#94a3b8', textDecoration: 'none' }}>GST Invoicing</Link>
              </div>
            </div>

            {/* Col 3: Solutions */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Solutions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Independent Luxury Brokers</span>
                <span style={{ color: '#94a3b8' }}>Channel Partner Teams</span>
                <span style={{ color: '#94a3b8' }}>Commercial Leasing Advisory</span>
                <span style={{ color: '#94a3b8' }}>Developer Mandate Agencies</span>
                <span style={{ color: '#94a3b8' }}>NRI Property Management</span>
              </div>
            </div>

            {/* Col 4: Trust & Compliance */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Compliance & Security
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconShield /> RERA Compatible
                </span>
                <span style={{ color: '#94a3b8' }}>256-Bit SSL Encryption</span>
                <span style={{ color: '#94a3b8' }}>Strict Tenant Data Privacy</span>
                <span style={{ color: '#94a3b8' }}>Daily Automated Backups</span>
                <span style={{ color: '#94a3b8' }}>99.98% Uptime SLA</span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Legal Links */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              © 2026 AgentLadders Technologies Pvt. Ltd. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link>
              <Link href="/help" style={{ color: '#94a3b8', textDecoration: 'none' }}>Help & Documentation</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
