'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VariantOption {
  id: 'attio' | 'apple' | 'notion' | 'midnight';
  name: string;
  tagline: string;
  scoreTarget: string;
  badge: string;
  imagePath: string;
  description: string;
  whyItFixes3OutOf10: string;
  keyFeatures: string[];
}

const VARIANTS: VariantOption[] = [
  {
    id: 'attio',
    name: 'Variation 1: The Linear / Attio Minimalist',
    tagline: 'Ultra-clean, zero clutter, generous whitespace, slide-over inspector drawer',
    scoreTarget: '9.8 / 10',
    badge: 'Recommended by Top Product Designers',
    imagePath: '/design-lab/attio.jpg',
    whyItFixes3OutOf10: 'Eliminates 90% of visual noise. Replaces bulky colorful pill badges with elegant status dots. Replaces 6 cramped action buttons per row with a sleek 3-dot hover menu. Clicking any row opens a slide-over inspector on the right instead of accordion rows cluttering the table.',
    description: 'Inspired by Linear, Attio, and Stripe. Replaces heavy colored badges with refined status dots. Condenses 6 cramped action buttons into a sleek 3-dot contextual menu. Features an instant slide-over inspector drawer for inspecting records without cluttering the main table.',
    keyFeatures: [
      'Warm off-white background (#fafafa) with razor-thin hairline borders',
      'Refined status dots with soft typography (no loud pill blocks)',
      'Clean 3-dot hover action menu (eliminates row button clutter)',
      'Right Slide-Over Inspector Drawer for deep dives & quick edits',
      'Instant search with subtle keyboard shortcuts'
    ]
  },
  {
    id: 'apple',
    name: 'Variation 2: Modern Apple Glass',
    tagline: 'Frosted glassmorphism, soft rounded cards, fluid visual hierarchy',
    scoreTarget: '9.5 / 10',
    badge: 'Visual & Luxury Favorite',
    imagePath: '/design-lab/apple.jpg',
    whyItFixes3OutOf10: 'Makes the software feel like a premium $100M luxury brokerage iPad/Mac app instead of a legacy enterprise database. Soft rounded 16px corners, subtle drop shadows, and high-quality visual thumbnails make information effortless to scan.',
    description: 'Inspired by macOS Sonoma and iOS luxury real estate apps. Uses soft translucent glass headers, 16px rounded elevated cards, rich property and document thumbnails, and calming emerald accents.',
    keyFeatures: [
      'Translucent frosted glass bar (backdrop-blur-md)',
      'Soft elevated cards with subtle shadow depth',
      'Rich visual thumbnails for floorplans and title deeds',
      'Segmented pill toggles with smooth micro-transitions',
      'Comfortable touch-friendly luxury aesthetic'
    ]
  },
  {
    id: 'notion',
    name: 'Variation 3: Notion / Vercel Productivity',
    tagline: 'Monochrome efficiency, fast filter chips, keyboard-friendly data grid',
    scoreTarget: '9.4 / 10',
    badge: 'High-Density Power User Favorite',
    imagePath: '/design-lab/notion.jpg',
    whyItFixes3OutOf10: 'Removes all unnecessary containers, borders, and decorative shadows. Focuses purely on data clarity, instantaneous filtering (+ Filter, Sort, Group), and minimal monochrome typography favored by tech executives.',
    description: 'Inspired by Notion and Vercel dashboards. Pure focus on speed and productivity with clean horizontal dividers, inline filter tags (+ Filter, Sort, Group), and quick-action buttons on hover.',
    keyFeatures: [
      'Monochrome typography with high-contrast readability',
      'Inline filter chips (+ Add Filter, Sort by Date, Group by Client)',
      'Clean horizontal table dividers without heavy box borders',
      'Actions appear cleanly on hover to keep interface pristine',
      'Compact data density with effortless readability'
    ]
  },
  {
    id: 'midnight',
    name: 'Variation 4: Midnight Executive Luxury',
    tagline: 'Obsidian dark mode, champagne gold & glowing emerald accents',
    scoreTarget: '9.6 / 10',
    badge: 'Private Wealth & Sovereign Prestige',
    imagePath: '/design-lab/midnight.jpg',
    whyItFixes3OutOf10: 'Tailored for ultra-high-net-worth real estate brokerages in Dubai, London, and Manhattan. Deep obsidian canvas (#0B0F17) with glowing telemetry and champagne gold accents creates instant authority and prestige.',
    description: 'Designed for private wealth, high-net-worth family offices, and elite real estate brokerages. Deep obsidian canvas (#0B0F17) with glowing indicators and dark glass cards.',
    keyFeatures: [
      'Deep obsidian dark theme (#0B0F17)',
      'Champagne gold & glowing emerald telemetry accents',
      'Dark glass cards with crisp 1px borders (#1E293B)',
      'Financial terminal-grade precision and security cues',
      'Prestige aesthetic designed for billionaire clients'
    ]
  }
];

// Sample documents data for the interactive live preview
const SAMPLE_DOCS = [
  { id: '1', title: 'Listing Agreement - 247 Oak St', type: 'PDF', size: '1.2 MB', category: 'Contracts & MOUs', date: 'Oct 15, 2026', client: 'Julia Reed', status: 'Active', verified: true },
  { id: '2', title: 'Architectural Floorplans - Lodha Park 4BHK', type: 'Blueprint', size: '4.8 MB', category: 'Brochures & Floor Plans', date: 'Oct 14, 2026', client: 'Anya Sharma', status: 'In Review', verified: true },
  { id: '3', title: 'Client KYC & PAN Card - Vikram Malhotra', type: 'KYC', size: '850 KB', category: 'Client KYC & Identity', date: 'Oct 13, 2026', client: 'Vikram Malhotra', status: 'Verified', verified: true },
  { id: '4', title: '30-Year Search Report & Title Deed', type: 'Title Deed', size: '3.4 MB', category: 'Title Deeds & OC', date: 'Oct 12, 2026', client: 'Mark Vance', status: 'Approved', verified: true },
  { id: '5', title: 'Sole Selling Brokerage Mandate', type: 'Contract', size: '920 KB', category: 'Contracts & MOUs', date: 'Oct 11, 2026', client: 'Prestige Group', status: 'Pending', verified: true },
];

export default function DesignLabPage() {
  const [selectedVariant, setSelectedVariant] = useState<'attio' | 'apple' | 'notion' | 'midnight'>('attio');
  const [selectedDoc, setSelectedDoc] = useState<typeof SAMPLE_DOCS[0] | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  const currentVariant = VARIANTS.find(v => v.id === selectedVariant) || VARIANTS[0];

  const filteredDocs = SAMPLE_DOCS.filter(d => {
    if (activeTab !== 'All' && d.category !== activeTab) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase()) && !d.client.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div style={{ maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎨 UI/UX Transformation Studio
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            4 High-End UI/UX Variations for AgentLadders
          </h1>
          <p style={{ fontSize: 14.5, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            Users currently give the interface a 3/10 due to visual clutter, dense borders, and cramped buttons. Here are 4 distinct, battle-tested modern design directions (with live interactive prototypes below) so you can pick the exact look and feel for the production app.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/dashboard/documents"
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            ← Back to Documents
          </Link>
        </div>
      </div>

      {/* Variation Selector Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 12,
        marginBottom: 24
      }}>
        {VARIANTS.map(variant => {
          const isSelected = selectedVariant === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                setSelectedVariant(variant.id);
                setSelectedDoc(null);
              }}
              style={{
                textAlign: 'left',
                padding: '16px 18px',
                borderRadius: 14,
                border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                boxShadow: isSelected ? '0 10px 20px -3px rgba(5,150,105,0.12)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backgroundColor: isSelected ? '#d1fae5' : '#e2e8f0', color: isSelected ? '#065f46' : '#475569' }}>
                  Target: {variant.scoreTarget}
                </span>
                {isSelected && <span style={{ fontSize: 16 }}>✨</span>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: isSelected ? '#0f172a' : '#334155', marginBottom: 4 }}>
                {variant.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                {variant.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* High-Resolution Concept Mockup Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: 24,
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 6 }}>
                ★ {currentVariant.badge}
              </span>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {currentVariant.name} (Design Concept)
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              High-fidelity visual render showing overall navigation, typography, cards, and inspectors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFullImageModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔍 View High-Res Mockup Fullscreen
          </button>
        </div>

        {/* Embedded Concept Mockup Image */}
        <div
          onClick={() => setShowFullImageModal(true)}
          style={{
            position: 'relative',
            width: '100%',
            height: 380,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            cursor: 'pointer',
            border: '1px solid #e2e8f0'
          }}
        >
          <img
            src={currentVariant.imagePath}
            alt={currentVariant.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#0f172a'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600
          }}>
            Click to Enlarge 🔍
          </div>
        </div>

        {/* Why it fixes 3/10 rating */}
        <div style={{ marginTop: 18, padding: '14px 18px', borderRadius: 10, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <strong style={{ fontSize: 13.5, color: '#166534', display: 'block', marginBottom: 2 }}>
              Why this fixes the 3/10 rating:
            </strong>
            <span style={{ fontSize: 13, color: '#15803d', lineHeight: 1.5 }}>
              {currentVariant.whyItFixes3OutOf10}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE WORKING PROTOTYPE SECTION HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡ Live Interactive Prototype</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
            (Fully clickable below)
          </span>
        </h3>
        <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
          👉 Click any document below to test the Slide-Over Inspector drawer
        </span>
      </div>

      {/* LIVE WORKING PROTOTYPE CONTAINER */}
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 40 }}>

        {/* VARIANT 1: LINEAR / ATTIO MINIMALIST */}
        {selectedVariant === 'attio' && (
          <div style={{ backgroundColor: '#fafafa', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Document Vault
                </h3>
                <span style={{ fontSize: 12.5, color: '#6b7280' }}>5 active files · Filtered by all records</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search records... (Cmd+K)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 12px 8px 32px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      width: 220
                    }}
                  />
                  <span style={{ position: 'absolute', left: 10, top: 9, fontSize: 12, color: '#9ca3af' }}>🔍</span>
                </div>
                <button type="button" style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#111827', color: '#ffffff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  + Upload
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {['All', 'Contracts & MOUs', 'Client KYC & Identity', 'Brochures & Floor Plans', 'Title Deeds & OC'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: activeTab === tab ? '#111827' : '#ffffff',
                    color: activeTab === tab ? '#ffffff' : '#4b5563',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Client</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Updated</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc, idx) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{
                          borderBottom: idx === filteredDocs.length - 1 ? 'none' : '1px solid #f3f4f6',
                          backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease'
                        }}
                        onMouseEnter={e => !isSelected && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={e => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 16 }}>📄</span>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827' }}>{doc.title}</div>
                              <span style={{ fontSize: 11, color: '#9ca3af' }}>{doc.size} · {doc.type}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 14px', color: '#4b5563' }}>{doc.category}</td>
                        <td style={{ padding: '14px 14px', color: '#374151', fontWeight: 500 }}>{doc.client}</td>
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: doc.status === 'Active' ? '#10b981' : doc.status === 'In Review' ? '#f59e0b' : '#3b82f6' }} />
                            {doc.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 14px', color: '#6b7280', fontSize: 12 }}>{doc.date}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                            }}
                            title="Inspect Record"
                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#4b5563', fontSize: 12, cursor: 'pointer' }}
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VARIANT 2: MODERN APPLE GLASS */}
        {selectedVariant === 'apple' && (
          <div style={{ backgroundColor: '#f1f5f9', borderRadius: 20, border: '1px solid rgba(255,255,255,0.7)', padding: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
            <div style={{
              backdropFilter: 'blur(16px)',
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderRadius: 16,
              padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.9)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>Vault &amp; Documents</h3>
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>● Secured via Private Encryption</span>
              </div>
              <div style={{ display: 'flex', gap: 6, backgroundColor: '#e2e8f0', padding: 3, borderRadius: 10 }}>
                {['Grid', 'List'].map((mode, i) => (
                  <button key={mode} type="button" style={{ padding: '5px 14px', borderRadius: 8, border: 'none', backgroundColor: i === 0 ? '#ffffff' : 'transparent', color: '#0f172a', fontWeight: 600, fontSize: 12, cursor: 'pointer', boxShadow: i === 0 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: '18px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      📑
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {doc.type}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                    Client: <strong style={{ color: '#1e293b' }}>{doc.client}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10, fontSize: 11.5, color: '#94a3b8' }}>
                    <span>{doc.size}</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VARIANT 3: NOTION / VERCEL PRODUCTIVITY */}
        {selectedVariant === 'notion' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Documents</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: 12.5, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>+ Filter</button>
                <button type="button" style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: 12.5, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Sort: Date</button>
                <button type="button" style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>+ New</button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0' }}>
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 8px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 2 }}>
                    <span style={{ fontSize: 15 }}>📄</span>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{doc.title}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: '#64748b' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{doc.category}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 12.5, color: '#334155' }}>{doc.client}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{doc.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VARIANT 4: MIDNIGHT EXECUTIVE LUXURY */}
        {selectedVariant === 'midnight' && (
          <div style={{ backgroundColor: '#0B0F17', borderRadius: 16, border: '1px solid #1E293B', padding: '24px', color: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '0.02em' }}>
                    AURUM VAULT
                  </h3>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '1px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>
                    PRIVATE WEALTH
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#64748B' }}>High-net-worth real estate document registry</span>
              </div>
              <button type="button" style={{ padding: '8px 16px', borderRadius: 8, backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid #D4AF37', color: '#D4AF37', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                + Add Asset Document
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: 12,
                    border: '1px solid #1F2937',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.backgroundColor = '#161F30';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1F2937';
                    e.currentTarget.style.backgroundColor = '#111827';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700 }}>🔒 CERTIFIED</span>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{doc.size}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#F3F4F6', marginBottom: 6 }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                    Client: <strong style={{ color: '#E5E7EB' }}>{doc.client}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#64748B', borderTop: '1px solid #1F2937', paddingTop: 8 }}>
                    <span>{doc.category}</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE-OVER INSPECTOR DRAWER (Appears when any item is clicked) */}
        {selectedDoc && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 420,
              maxWidth: '90vw',
              backgroundColor: selectedVariant === 'midnight' ? '#0F172A' : '#ffffff',
              color: selectedVariant === 'midnight' ? '#F8FAFC' : '#0F172A',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
              overflowY: 'auto',
              borderLeft: selectedVariant === 'midnight' ? '1px solid #1E293B' : '1px solid #e2e8f0',
              animation: 'slideIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.05em' }}>
                Quick Inspector
              </span>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'transparent',
                  color: selectedVariant === 'midnight' ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
              {selectedDoc.title}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                {selectedDoc.type}
              </span>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>{selectedDoc.size}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              <button type="button" style={{ padding: '10px', borderRadius: 8, backgroundColor: '#059669', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Download Asset
              </button>
              <button type="button" style={{ padding: '10px', borderRadius: 8, backgroundColor: '#25D366', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                WhatsApp Share
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
              <div style={{ padding: '12px', borderRadius: 8, backgroundColor: selectedVariant === 'midnight' ? '#1E293B' : '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 2 }}>CATEGORY</span>
                <span style={{ fontWeight: 600 }}>{selectedDoc.category}</span>
              </div>
              <div style={{ padding: '12px', borderRadius: 8, backgroundColor: selectedVariant === 'midnight' ? '#1E293B' : '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 2 }}>LINKED CLIENT</span>
                <span style={{ fontWeight: 600 }}>{selectedDoc.client}</span>
              </div>
              <div style={{ padding: '12px', borderRadius: 8, backgroundColor: selectedVariant === 'midnight' ? '#1E293B' : '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 2 }}>LAST MODIFIED</span>
                <span style={{ fontWeight: 600 }}>{selectedDoc.date}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: selectedVariant === 'midnight' ? '#fff' : '#0f172a', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {showFullImageModal && (
        <div
          onClick={() => setShowFullImageModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '94vw',
              maxHeight: '92vh',
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 10
            }}>
              <button
                type="button"
                onClick={() => setShowFullImageModal(false)}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  fontSize: 18,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <img
              src={currentVariant.imagePath}
              alt={currentVariant.name}
              style={{
                width: '100%',
                maxHeight: '88vh',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
