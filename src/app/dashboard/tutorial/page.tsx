'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CompassIcon,
  SparklesIcon,
  CopyIcon
} from '@/components/icons/NavIcons';
import { Toast } from '@/components/ui/Toast';
import { MODULE_TUTORIALS, Hotspot, StepItem, ModuleTutorial, ModalShowcaseItem } from '@/data/tutorialData';

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PlaybookAndTutorialPage() {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'steps' | 'visual' | 'modals' | 'scripts' | 'tactics'>('steps');
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null);
  const [activeStepNumber, setActiveStepNumber] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [lightboxActiveHotspotId, setLightboxActiveHotspotId] = useState<number | null>(null);

  // Filter modules
  const filteredModules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return MODULE_TUTORIALS;
    return MODULE_TUTORIALS.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.tagline.toLowerCase().includes(q) ||
      m.overview.toLowerCase().includes(q) ||
      m.steps.some(s => s.title.toLowerCase().includes(q) || s.action.toLowerCase().includes(q)) ||
      m.whatsAppVault.some(w => w.title.toLowerCase().includes(q) || w.englishScript.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeModule = useMemo(() => {
    return MODULE_TUTORIALS.find(m => m.id === selectedModuleId) || MODULE_TUTORIALS[0];
  }, [selectedModuleId]);

  // Reset step number and hotspot when module changes
  useEffect(() => {
    setActiveStepNumber(1);
    setActiveHotspotId(null);
    setLightboxActiveHotspotId(null);
  }, [selectedModuleId]);

  // Handle keyboard shortcuts when lightbox is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel(prev => Math.min(2.5, prev + 0.25));
      } else if (e.key === '-' || e.key === '_') {
        setZoomLevel(prev => Math.max(0.75, prev - 0.25));
      } else if (e.key === '0') {
        setZoomLevel(1);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const pinId = parseInt(e.key, 10);
        if (activeModule.mockPreview.hotspots.some(h => h.id === pinId)) {
          setLightboxActiveHotspotId(pinId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeModule]);

  const handleCopy = useCallback((text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setToastMessage(`Copied ${label} to clipboard! 📋`);
    }
  }, []);

  const launchOnScreenTour = useCallback(() => {
    window.dispatchEvent(new CustomEvent('open-on-screen-tutorial', { detail: { moduleId: activeModule.id } }));
  }, [activeModule.id]);

  const currentStep = useMemo(() => {
    return activeModule.steps.find(s => s.number === activeStepNumber) || activeModule.steps[0];
  }, [activeModule, activeStepNumber]);

  const currentLightboxHotspot = useMemo(() => {
    return activeModule.mockPreview.hotspots.find(h => h.id === lightboxActiveHotspotId) || null;
  }, [activeModule, lightboxActiveHotspotId]);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', paddingBottom: 100, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {toastMessage && (
        <Toast
          toast={{ id: 'tutorial-toast', type: 'success', message: toastMessage }}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          INTERACTIVE FULLSCREEN SCREENSHOT LIGHTBOX MODAL
      ───────────────────────────────────────────────────────────────────── */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.94)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '96vw',
              maxWidth: 1480,
              height: '92vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              borderRadius: 20,
              border: '1px solid #334155',
              overflow: 'hidden',
              boxShadow: '0 25px 70px -15px rgba(0,0,0,0.85)'
            }}
          >
            {/* Modal Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              backgroundColor: '#1e293b',
              borderBottom: '1px solid #334155',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>📸</span>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{activeModule.name}</span>
                    <span style={{ fontSize: 11, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      Live Preview
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'monospace' }}>
                    app.agentladders.com{activeModule.url}
                  </div>
                </div>
              </div>

              {/* Module Selector Inside Lightbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={activeModule.id}
                  onChange={e => {
                    setSelectedModuleId(e.target.value);
                    setLightboxActiveHotspotId(null);
                  }}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {MODULE_TUTORIALS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.shortName}
                    </option>
                  ))}
                </select>

                {/* Zoom Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0f172a', padding: '4px 8px', borderRadius: 8, border: '1px solid #334155' }}>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 15, fontWeight: 800, padding: '2px 8px' }}
                    title="Zoom out (-)"
                  >
                    -
                  </button>
                  <span style={{ fontSize: 12, color: '#38bdf8', minWidth: 42, textAlign: 'center', fontWeight: 700 }}>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                    style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 15, fontWeight: 800, padding: '2px 8px' }}
                    title="Zoom in (+)"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 11, padding: '2px 6px', borderLeft: '1px solid #334155' }}
                  >
                    100%
                  </button>
                </div>

                <button
                  onClick={() => setIsLightboxOpen(false)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '6px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: 700
                  }}
                >
                  Close [✕]
                </button>
              </div>
            </div>

            {/* Modal Image Body with Interactive Pins */}
            <div style={{ overflow: 'auto', flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', backgroundColor: '#020617', position: 'relative' }}>
              <div style={{ position: 'relative', transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease', display: 'inline-block' }}>
                <img
                  src={activeModule.screenshotUrl}
                  alt={activeModule.name}
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 12, display: 'block', border: '1px solid #334155' }}
                />

                {/* Hotspot Pins on Lightbox Screenshot */}
                {activeModule.mockPreview.hotspots.map((spot) => {
                  const isSelected = lightboxActiveHotspotId === spot.id;
                  return (
                    <div
                      key={spot.id}
                      style={{
                        position: 'absolute',
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 25
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxActiveHotspotId(isSelected ? null : spot.id);
                        }}
                        style={{
                          width: isSelected ? 38 : 30,
                          height: isSelected ? 38 : 30,
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#10b981' : '#dc2626',
                          color: '#ffffff',
                          border: '3px solid #ffffff',
                          boxShadow: isSelected ? '0 0 20px #10b981' : '0 4px 14px rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isSelected ? 15 : 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          animation: isSelected ? 'none' : 'pulse 1.8s infinite'
                        }}
                        title={`Pin #${spot.id}: ${spot.title}`}
                      >
                        {spot.id}
                      </button>

                      {/* Tooltip Card Overlay directly next to Pin */}
                      {isSelected && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: spot.y > 60 ? 'auto' : 44,
                            bottom: spot.y > 60 ? 44 : 'auto',
                            left: spot.x > 70 ? 'auto' : 0,
                            right: spot.x > 70 ? 0 : 'auto',
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#ffffff',
                            borderRadius: 14,
                            padding: '16px 18px',
                            width: 320,
                            boxShadow: '0 20px 45px rgba(0,0,0,0.8)',
                            zIndex: 40,
                            border: '1px solid #34d399',
                            fontSize: 12.5,
                            lineHeight: 1.45
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontWeight: 800, color: '#34d399', fontSize: 13 }}>
                              Pin #{spot.id} • {spot.title}
                            </div>
                            <button
                              onClick={() => setLightboxActiveHotspotId(null)}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                            >
                              ✕
                            </button>
                          </div>

                          <div style={{ color: '#cbd5e1', marginBottom: 10 }}>
                            {spot.description}
                          </div>

                          <div style={{ fontSize: 11.5, color: '#38bdf8', fontWeight: 600, backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                            👉 <strong>Operator Action:</strong> {spot.actionHint}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lightbox Footer Bar with Clickable Hotspots & Key Hints */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#1e293b',
              borderTop: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Inspect Hotspots:
                </span>
                {activeModule.mockPreview.hotspots.map(h => {
                  const isSel = lightboxActiveHotspotId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setLightboxActiveHotspotId(isSel ? null : h.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        backgroundColor: isSel ? '#10b981' : '#0f172a',
                        color: '#ffffff',
                        border: isSel ? '1px solid #34d399' : '1px solid #334155',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Pin #{h.id}: {h.title}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                💡 Press <strong>1-4</strong> to inspect pins • <strong>+/-</strong> to zoom • <strong>Esc</strong> to close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          HEADER BANNER
      ───────────────────────────────────────────────────────────────────── */}
      <div className="tutorial-header-banner">
        <div style={{ position: 'absolute', top: -70, right: -70, width: 260, height: 260, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', pointerEvents: 'none', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 240, width: 200, height: 200, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', pointerEvents: 'none', filter: 'blur(40px)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 820 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#34d399',
              marginBottom: 14
            }}>
              <CompassIcon size={15} color="#34d399" />
              <span>Broker Operating System & Mastery Blueprint</span>
            </div>

            <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px', color: '#ffffff' }}>
              Playbook & Tutorial 📖
            </h1>

            <p style={{ fontSize: 15.5, color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
              In-depth operational guide for all 12 modules in AgentLadders. Explore high-resolution live application screenshots, interactive visual hotspot pins, step-by-step checklists with exact data inputs, modal blueprints, ready WhatsApp closing scripts, and legal closing secrets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={launchOnScreenTour}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 20px',
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
            >
              <SparklesIcon size={16} color="#34d399" />
              <span>Launch On-Screen Tour ⚡</span>
            </button>

            <Link
              href={activeModule.url}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                borderRadius: 12,
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              <span>Open Live {activeModule.shortName} ↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Quick Module Horizontal Scroll Picker */}
      <div className="show-on-mobile" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Select Module ({MODULE_TUTORIALS.length})
        </div>
        <div className="responsive-pills-scroll" style={{ paddingBottom: 6 }}>
          {MODULE_TUTORIALS.map(mod => {
            const isSel = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModuleId(mod.id);
                  setActiveHotspotId(null);
                  setActiveStepNumber(1);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: isSel ? 700 : 500,
                  backgroundColor: isSel ? 'var(--primary, #059669)' : '#ffffff',
                  color: isSel ? '#ffffff' : '#334155',
                  border: isSel ? '1px solid var(--primary, #059669)' : '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSel ? '0 2px 8px rgba(var(--primary-rgb, 5, 150, 105), 0.25)' : 'none'
                }}
              >
                <span>{mod.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          TWO-COLUMN WORKSPACE: LEFT DIRECTORY + RIGHT MASTER DETAIL
      ───────────────────────────────────────────────────────────────────── */}
      <div className="tutorial-layout-grid">

        {/* ── LEFT NAVIGATION RAIL (MODULE SELECTOR DIRECTORY) ── */}
        <div className="tutorial-sidebar" style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          {/* Search Header */}
          <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>Module Directory</span>
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>{filteredModules.length} Modules</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search modules, features, scripts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 32px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: 12.5,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 9, fontSize: 12, color: '#94a3b8' }}>🔍</span>
            </div>
          </div>

          {/* Module List Grouped by Category */}
          <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', padding: '8px' }}>
            {[
              { catId: 'core', label: '🏆 Core Dealflow' },
              { catId: 'operations', label: '📑 Operations & Legal' },
              { catId: 'admin', label: '⚙️ Agency Setup & Support' }
            ].map(group => {
              const groupModules = filteredModules.filter(m => m.category === group.catId);
              if (groupModules.length === 0) return null;

              return (
                <div key={group.catId} style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '8px 10px 4px'
                  }}>
                    {group.label}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {groupModules.map(mod => {
                      const isSel = mod.id === activeModule.id;
                      const ModIcon = mod.icon;

                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            setSelectedModuleId(mod.id);
                            setActiveHotspotId(null);
                            setActiveStepNumber(1);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 12,
                            backgroundColor: isSel ? '#ecfdf5' : 'transparent',
                            border: isSel ? '1px solid #a7f3d0' : '1px solid transparent',
                            color: isSel ? '#065f46' : '#334155',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            if (!isSel) e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={e => {
                            if (!isSel) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: isSel ? 'var(--primary, #059669)' : '#f1f5f9',
                            color: isSel ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <ModIcon size={16} color={isSel ? '#ffffff' : '#64748b'} />
                          </div>

                          <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: isSel ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {mod.shortName}
                            </div>
                            <div style={{ fontSize: 11, color: isSel ? 'var(--primary, #059669)' : '#94a3b8', marginTop: 1 }}>
                              {mod.url}
                            </div>
                          </div>

                          {isSel && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary, #059669)', flexShrink: 0 }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT MAIN CANVAS (IN-DEPTH MODULE SHOWCASE) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', minWidth: 0, overflow: 'hidden' }}>

          {/* Module Banner Card */}
          <div className="tutorial-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: `${activeModule.badgeColor}15`,
                    color: activeModule.badgeColor,
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 8
                  }}>
                    {activeModule.badge}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    ⚖️ {activeModule.reraComplianceTag}
                  </span>
                </div>

                <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>
                  {activeModule.name}
                </h2>

                <p style={{ fontSize: 15, color: '#475569', margin: 0, lineHeight: 1.5, maxWidth: 840 }}>
                  {activeModule.overview}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#065f46'
                  }}
                >
                  <span>🔍 View Full Screenshot</span>
                </button>

                <button
                  onClick={() => handleCopy(window.location.origin + activeModule.url, 'Page Link')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#334155'
                  }}
                >
                  <CopyIcon size={14} color="#64748b" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* 4 Summary Metric Pills */}
            <div className="tutorial-summary-metrics-grid">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>🎯 Goal</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 3 }}>{activeModule.primaryGoal}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>⏱️ Frequency</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 3 }}>{activeModule.frequency}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>👥 Audience</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 3 }}>{activeModule.targetRole}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>💰 Revenue Impact</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', marginTop: 3 }}>{activeModule.closingImpact}</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Switcher */}
          <div className="tutorial-tab-nav touch-scroll-container">
            {[
              { id: 'steps', label: '⚡ Step-by-Step Operator Guide' },
              { id: 'visual', label: '📸 Live Screenshot & Hotspots' },
              { id: 'modals', label: '🪟 Key Modals & Form Blueprints' },
              { id: 'scripts', label: '💬 WhatsApp Closing Scripts' },
              { id: 'tactics', label: '💡 Top 1% Broker Tactics & Legal' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 15px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? 'var(--primary, #059669)' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              TAB 1: STEP-BY-STEP OPERATOR GUIDE (WITH SCREENSHOT CALLOUTS)
          ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'steps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Integrated Visual Screenshot Header with Step Stepper */}
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: 20,
                border: '1px solid #334155',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.4)'
              }}>
                {/* Stepper Navigation Header */}
                <div style={{
                  backgroundColor: '#1e293b',
                  padding: '14px 20px',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step Sequence:
                    </span>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>
                      Step {currentStep.number} of {activeModule.steps.length}: <strong>{currentStep.title}</strong>
                    </span>
                  </div>

                  {/* Step Buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {activeModule.steps.map(s => {
                      const isActiveStep = s.number === activeStepNumber;
                      return (
                        <button
                          key={s.number}
                          onClick={() => {
                            setActiveStepNumber(s.number);
                            setActiveHotspotId(s.hotspotIndex);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: 8,
                            backgroundColor: isActiveStep ? 'var(--primary, #059669)' : 'rgba(255,255,255,0.08)',
                            color: '#ffffff',
                            border: isActiveStep ? '1px solid var(--accent, #34d399)' : '1px solid rgba(255,255,255,0.15)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Step {s.number}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Fullscreen
                    </button>
                  </div>
                </div>

                {/* Screenshot with highlighted active hotspot */}
                <div style={{ position: 'relative', width: '100%', backgroundColor: '#020617', overflow: 'hidden' }}>
                  <img
                    src={activeModule.screenshotUrl}
                    alt={activeModule.name}
                    style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.95 }}
                  />

                  {/* Render all hotspots, pulsing the one related to current step */}
                  {activeModule.mockPreview.hotspots.map((spot) => {
                    const isFocus = currentStep.hotspotIndex === spot.id || activeHotspotId === spot.id;
                    return (
                      <div
                        key={spot.id}
                        style={{
                          position: 'absolute',
                          left: `${spot.x}%`,
                          top: `${spot.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 25
                        }}
                      >
                        <button
                          onClick={() => {
                            setActiveHotspotId(spot.id);
                            const matchingStep = activeModule.steps.find(st => st.hotspotIndex === spot.id);
                            if (matchingStep) setActiveStepNumber(matchingStep.number);
                          }}
                          aria-label={`Step Focus: ${spot.title}`}
                          style={{
                            width: isFocus ? 40 : 30,
                            height: isFocus ? 40 : 30,
                            borderRadius: '50%',
                            backgroundColor: isFocus ? '#10b981' : '#dc2626',
                            color: '#ffffff',
                            border: isFocus ? '3px solid #ffffff' : '2px solid #ffffff',
                            boxShadow: isFocus ? '0 0 24px #10b981' : '0 4px 12px rgba(0,0,0,0.5)',
                            cursor: 'pointer',
                            fontSize: isFocus ? 15 : 12,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            animation: isFocus ? 'pulse 1.8s infinite' : 'none'
                          }}
                        >
                          {spot.id}
                        </button>
                      </div>
                    );
                  })}

                  <div style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 14,
                    right: 14,
                    maxWidth: 'calc(100% - 28px)',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(15, 23, 42, 0.88)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    backdropFilter: 'blur(8px)',
                    fontSize: 12.5,
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8
                  }}>
                    <span>🎯 <strong>Active Step Focus:</strong> Pin #{currentStep.hotspotIndex} on screenshot</span>
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      Enlarge Screenshot ↗
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Step Cards Container */}
              <div className="tutorial-card">
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  Detailed Operational SOP: {activeModule.shortName}
                </div>
                <div style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>
                  Follow this exact sequential checklist to execute operations, input data, and trigger closing events with 100% precision.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {activeModule.steps.map((st) => {
                    const isSelected = st.number === activeStepNumber;
                    return (
                      <div
                        key={st.number}
                        onClick={() => {
                          setActiveStepNumber(st.number);
                          setActiveHotspotId(st.hotspotIndex);
                        }}
                        className="tutorial-step-card"
                        style={{
                          backgroundColor: isSelected ? '#f0fdf4' : '#f8fafc',
                          border: isSelected ? '2px solid #34d399' : '1px solid #e2e8f0',
                          boxShadow: isSelected ? '0 8px 24px rgba(16, 185, 129, 0.12)' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Step Number Badge */}
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: isSelected ? 'var(--primary, #059669)' : '#0f172a',
                          color: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 16,
                          flexShrink: 0,
                          boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-rgb, 5, 150, 105), 0.35)' : 'none'
                        }}>
                          <span style={{ fontSize: 10, textTransform: 'uppercase', opacity: 0.8 }}>Step</span>
                          <span>{st.number}</span>
                        </div>

                        {/* Step Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ fontSize: 16.5, fontWeight: 800, color: '#0f172a' }}>
                              {st.title}
                            </div>

                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: isSelected ? '#065f46' : '#64748b',
                              backgroundColor: isSelected ? '#d1fae5' : '#e2e8f0',
                              padding: '3px 10px',
                              borderRadius: 20
                            }}>
                              Hotspot Pin #{st.hotspotIndex}
                            </span>
                          </div>

                          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 12 }}>
                            <strong>Action:</strong> {st.action}
                          </div>

                          {/* Specific UI Element & Exact Field */}
                          <div className="tutorial-field-grid">
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                                🔘 Exact Button / Field to Click:
                              </div>
                              <code style={{
                                backgroundColor: '#f1f5f9',
                                padding: '4px 10px',
                                borderRadius: 6,
                                color: '#0f172a',
                                fontWeight: 700,
                                fontSize: 13,
                                display: 'inline-block'
                              }}>
                                {st.exactFieldOrButton}
                              </code>
                            </div>

                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                                📝 Sample Data / Realistic Input:
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 12.5, color: '#334155', fontFamily: 'monospace', fontWeight: 600 }}>
                                  {st.sampleInput}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(st.sampleInput, 'Sample Data');
                                  }}
                                  title="Copy sample data"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    padding: '2px 4px'
                                  }}
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expected Outcome */}
                          <div style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>✓</span>
                            <span><strong>Expected System Result:</strong> {st.result}</span>
                          </div>

                          {/* Pro Tip */}
                          <div style={{
                            fontSize: 12.5,
                            color: '#065f46',
                            backgroundColor: '#ecfdf5',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #a7f3d0',
                            lineHeight: 1.4
                          }}>
                            💡 <strong>Top Broker Secret:</strong> {st.proTip}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 2: LIVE SCREENSHOT & INTERACTIVE HOTSPOTS
          ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'visual' && (
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: 22,
              border: '1px solid #334155',
              overflow: 'hidden',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.45)'
            }}>
              {/* Browser Window Chrome */}
              <div style={{
                backgroundColor: '#1e293b',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                </div>

                <div style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  padding: '5px 18px',
                  fontSize: 12,
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  maxWidth: 440,
                  width: '100%',
                  justifyContent: 'center',
                  border: '1px solid #334155'
                }}>
                  <span style={{ color: '#10b981' }}>🔒</span>
                  <span>app.agentladders.com{activeModule.url}</span>
                </div>

                <button
                  onClick={() => setIsLightboxOpen(true)}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔍 Enlarge
                </button>
              </div>

              {/* Real High-Resolution Screenshot with Interactive Hotspots */}
              <div style={{ position: 'relative', width: '100%', backgroundColor: '#020617' }}>
                <img
                  src={activeModule.screenshotUrl}
                  alt={activeModule.name}
                  onClick={() => setIsLightboxOpen(true)}
                  style={{ width: '100%', height: 'auto', display: 'block', cursor: 'zoom-in' }}
                />

                {/* Hotspot Pins mapped over real screenshot */}
                {activeModule.mockPreview.hotspots.map((spot) => {
                  const isHotspotActive = activeHotspotId === spot.id;
                  return (
                    <div
                      key={spot.id}
                      style={{
                        position: 'absolute',
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 25
                      }}
                    >
                      <button
                        onClick={() => setActiveHotspotId(isHotspotActive ? null : spot.id)}
                        aria-label={`Hotspot ${spot.id}: ${spot.title}`}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: isHotspotActive ? '#10b981' : '#dc2626',
                          color: '#ffffff',
                          border: '3px solid #ffffff',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          animation: isHotspotActive ? 'none' : 'pulse 2s infinite'
                        }}
                      >
                        {spot.id}
                      </button>

                      {isHotspotActive && (
                        <div style={{
                          position: 'absolute',
                          top: spot.y > 60 ? 'auto' : 42,
                          bottom: spot.y > 60 ? 42 : 'auto',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          borderRadius: 14,
                          padding: '16px 18px',
                          width: 290,
                          boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                          zIndex: 35,
                          border: '1px solid #334155',
                          fontSize: 12.5,
                          lineHeight: 1.45
                        }}>
                          <div style={{ fontWeight: 800, color: '#34d399', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>Pin #{spot.id}:</span>
                            <span>{spot.title}</span>
                          </div>
                          <div style={{ color: '#cbd5e1', marginBottom: 10 }}>
                            {spot.description}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#38bdf8', fontWeight: 600 }}>
                            👉 {spot.actionHint}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspotId(null);
                            }}
                            style={{
                              marginTop: 12,
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Close [✕]
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Screenshot Footer Controls */}
              <div style={{
                padding: '14px 20px',
                backgroundColor: '#1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                fontSize: 12.5,
                color: '#94a3b8'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📍 Click pulsing numbered pins (1-4) on the screenshot to inspect key UI controls.</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {activeModule.mockPreview.hotspots.map(h => (
                    <button
                      key={h.id}
                      onClick={() => setActiveHotspotId(h.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        backgroundColor: activeHotspotId === h.id ? 'var(--primary, #059669)' : '#0f172a',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Pin #{h.id}: {h.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 3: KEY MODALS & FORM BLUEPRINTS (NEW)
          ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'modals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="tutorial-card">
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  Modal Workflows & Form Input Blueprints: {activeModule.shortName}
                </div>
                <div style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>
                  Comprehensive guides for every modal window triggered from this screen. Learn exact field requirements, CustomSelect dropdown choices, and data entry best practices.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {activeModule.modalShowcase && activeModule.modalShowcase.length > 0 ? (
                    activeModule.modalShowcase.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: 16,
                          border: '1px solid #cbd5e1',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Modal Header Badge */}
                        <div style={{
                          backgroundColor: '#ffffff',
                          padding: '16px 20px',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 18 }}>🪟</span>
                              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                                {m.modalTitle}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                              {m.purpose}
                            </div>
                          </div>

                          <div style={{
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#065f46'
                          }}>
                            Trigger: <strong>{m.triggerButton}</strong>
                          </div>
                        </div>

                        {/* Fields Breakdown Table */}
                        <div style={{ padding: '20px' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
                            Key Input Fields & CustomSelect Formats:
                          </div>

                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>Field Name</th>
                                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>Input Type</th>
                                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>Operational Guidance & Constraints</th>
                                </tr>
                              </thead>
                              <tbody>
                                {m.keyFields.map((f, fIdx) => (
                                  <tr key={fIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{f.fieldName}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                      <span style={{
                                        backgroundColor: f.inputType.includes('CustomSelect') ? '#dbeafe' : '#f1f5f9',
                                        color: f.inputType.includes('CustomSelect') ? '#1e40af' : '#475569',
                                        padding: '3px 8px',
                                        borderRadius: 6,
                                        fontSize: 11.5,
                                        fontWeight: 600
                                      }}>
                                        {f.inputType}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', color: '#334155' }}>{f.guidance}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Operator Pro Tip */}
                          <div style={{
                            marginTop: 16,
                            backgroundColor: '#ecfdf5',
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid #a7f3d0',
                            fontSize: 12.5,
                            color: '#065f46',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            <span>💡</span>
                            <span><strong>Operator Tip:</strong> {m.operatorTip}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No modal workflows defined for this module.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 4: WHATSAPP CLOSING SCRIPTS VAULT
          ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'scripts' && (
            <div className="tutorial-card">
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                Ready-to-Copy WhatsApp Closing Scripts
              </div>
              <div style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20 }}>
                Battle-tested communication templates crafted specifically for the {activeModule.shortName} stage.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {activeModule.whatsAppVault.map((sc, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 16,
                    padding: '20px 22px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{sc.title}</div>
                        <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>🎯 {sc.useCase}</div>
                      </div>
                    </div>

                    <div className="tutorial-script-grid">
                      {/* Hinglish Version */}
                      <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>🇮🇳 Hinglish Script</span>
                          <button
                            onClick={() => handleCopy(sc.hinglishScript, 'Hinglish Script')}
                            style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Copy Script 📋
                          </button>
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {sc.hinglishScript}
                        </div>
                      </div>

                      {/* English Version */}
                      <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>🌐 English Formal Script</span>
                          <button
                            onClick={() => handleCopy(sc.englishScript, 'English Script')}
                            style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Copy Script 📋
                          </button>
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {sc.englishScript}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 5: TOP 1% BROKER TACTICS & LEGAL SECRETS
          ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'tactics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                backgroundColor: '#ecfdf5',
                borderRadius: 18,
                padding: '24px 28px',
                border: '1px solid #a7f3d0'
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💡</span>
                  <span>Top 1% Broker Closing Tactic: {activeModule.shortName}</span>
                </div>
                <div style={{ fontSize: 14.5, color: '#047857', lineHeight: 1.6 }}>
                  {activeModule.closingTactics.proTip}
                </div>
              </div>

              <div style={{
                backgroundColor: '#fff1f2',
                borderRadius: 18,
                padding: '24px 28px',
                border: '1px solid #fecdd3'
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#9f1239', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span>
                  <span>Legal & Operational Trap to Avoid</span>
                </div>
                <div style={{ fontSize: 14.5, color: '#be123c', lineHeight: 1.6 }}>
                  {activeModule.closingTactics.legalTrapToAvoid}
                </div>
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                borderRadius: 18,
                padding: '20px 24px',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}>
                <span style={{ fontSize: 24 }}>📊</span>
                <div style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.5, fontWeight: 600 }}>
                  {activeModule.closingTactics.statOrMetric}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="tutorial-card" style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>
                Ready to put {activeModule.shortName} into action?
              </div>
              <div style={{ fontSize: 13.5, color: '#94a3b8' }}>
                Open the live screen in your workspace and start closing deals faster.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={launchOnScreenTour}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}
              >
                Launch On-Screen Tour ⚡
              </button>

              <Link
                href={activeModule.url}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 10,
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Open Live Page ↗</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
