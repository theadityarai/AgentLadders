'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  SearchIcon, 
  FileTextIcon, 
  ShieldIcon, 
  CompassIcon, 
  MessageCircleIcon, 
  WhatsAppIcon, 
  CheckIcon,
  ArrowRightIcon,
  BuildingIcon,
  LockIcon,
  HelpCircleIcon
} from '@/components/icons/NavIcons';

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');

  const helpTopics = [
    {
      title: 'Interactive Broker Playbook & Tutorials',
      description: 'Step-by-step interactive workflow guides for property matching, lead capturing, site visit tours, and deal closings.',
      icon: <CompassIcon size={24} color="#059669" />,
      link: '/dashboard/tutorial',
      badge: 'Interactive Guide',
      cta: 'Explore Playbook →'
    },
    {
      title: 'Broker Legal Contracts & Leave & License Templates',
      description: 'Legally enforceable agreements under the Indian Easements Act 1882, Sole Selling Mandates, and NCNDA documents.',
      icon: <FileTextIcon size={24} color="#059669" />,
      link: '/dashboard/support',
      badge: 'Ready to Draft',
      cta: 'View Legal Vault →'
    },
    {
      title: 'Terms of Service & RERA Guidelines',
      description: 'Complete commercial agreement, Section 4(2) Carpet Area requirements, and broker licensing obligations.',
      icon: <ShieldIcon size={24} color="#059669" />,
      link: '/terms',
      badge: 'RERA Compliance',
      cta: 'Read Terms of Service →'
    },
    {
      title: 'Privacy Policy & DPDP Act (2023)',
      description: 'How AgentLadders encrypts and protects sensitive client identities, HNW inquiries, and property title scans.',
      icon: <LockIcon size={24} color="#059669" />,
      link: '/privacy',
      badge: 'Data Protection',
      cta: 'Read Privacy Policy →'
    },
    {
      title: 'Agency Cockpit Support Tickets',
      description: 'Submit technical assistance tickets, custom agreement review requests, or billing inquiries with guaranteed 4h SLA.',
      icon: <MessageCircleIcon size={24} color="#059669" />,
      link: '/dashboard/support',
      badge: 'Priority Support',
      cta: 'Open Support Ticket →'
    },
    {
      title: 'WhatsApp Cloud Engine & Pitch Generator',
      description: 'Guidelines on connecting WhatsApp Business, creating verified property pitches, and adhering to TRAI DND rules.',
      icon: <WhatsAppIcon size={24} color="#059669" />,
      link: '/dashboard/tutorial',
      badge: 'Messaging Engine',
      cta: 'WhatsApp Guide →'
    }
  ];

  const filteredTopics = helpTopics.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'var(--font-family, system-ui, -apple-system, sans-serif)' }}>
      {/* ── TOP HEADER ── */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}>
              ⬡
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
                AgentLadders
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#059669', marginLeft: 8, padding: '2px 6px', backgroundColor: '#ecfdf5', borderRadius: 4, textTransform: 'uppercase' }}>
                Help Center
              </span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/terms"
              style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', padding: '8px 12px' }}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', padding: '8px 12px' }}
            >
              Privacy
            </Link>
            <Link
              href="/dashboard/support"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: '#059669'
              }}
            >
              Go to Dashboard Support →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SEARCH SECTION ── */}
      <section style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '64px 24px 56px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            color: '#34d399',
            marginBottom: 16
          }}>
            <HelpCircleIcon size={14} color="#34d399" /> AgentLadders Knowledgebase &amp; Legal Center
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 16 }}>
            How can we help your agency today?
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
            Search documentation, real estate compliance standards, legal agreement templates, and platform operating procedures.
          </p>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              placeholder="Search topics (e.g., terms, privacy, RERA, carpet area, invoices)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 46px',
                borderRadius: 12,
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                fontSize: 15,
                outline: 'none',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={18} color="#94a3b8" />
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── HELP TOPICS GRID ── */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Core Knowledge Resources
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Comprehensive documentation for modern Indian real estate brokerages.
            </p>
          </div>
          {search && (
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Showing results for &quot;<strong>{search}</strong>&quot; ({filteredTopics.length} found)
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {filteredTopics.map((topic, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {topic.icon}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    {topic.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.3 }}>
                  {topic.title}
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
                  {topic.description}
                </p>
              </div>

              <Link
                href={topic.link}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: 13.5,
                  textDecoration: 'none'
                }}
              >
                {topic.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* ── DIRECT CONTACT CALLOUT ── */}
        <div style={{
          marginTop: 56,
          backgroundColor: '#0f172a',
          borderRadius: 16,
          padding: '36px 36px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              Need Dedicated Agency Support?
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, maxWidth: '600px', lineHeight: 1.5 }}>
              Our dedicated Mumbai and Delhi client relationship managers provide direct onboarding assistance, legal contract reviews, and agency CRM domain integrations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/dashboard/support"
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: 'none'
              }}
            >
              Contact Support Team →
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#090d16', color: '#94a3b8', padding: '36px 24px', fontSize: 13 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            © 2026 AgentLadders Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
            <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/dashboard/support" style={{ color: '#34d399', textDecoration: 'underline' }}>Help &amp; Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
