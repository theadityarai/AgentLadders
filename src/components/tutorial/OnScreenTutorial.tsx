'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  XIcon,
  ChevronRightIcon,
  CompassIcon,
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  FileTextIcon,
  ReceiptIcon,
  CheckSquareIcon,
  BarChartIcon,
  SettingsIcon,
  SparklesIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@/components/icons/NavIcons';

interface QuickGuideItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  accentColor: string;
  badge: string;
  tagline: string;
  threeSteps: string[];
  keyActionName: string;
}

const PAGE_GUIDES: QuickGuideItem[] = [
  {
    id: 'today',
    name: 'Today Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    accentColor: '#059669',
    badge: 'DAILY WORKSTATION',
    tagline: 'Your morning action center for urgent callbacks & scheduled showings.',
    threeSteps: [
      'Check top KPI pulse cards for today\'s scheduled site visits and pipeline value.',
      'Call or WhatsApp hot buyer callbacks listed in High Priority queue before 11 AM.',
      'Review your afternoon site visits and tap the Maps pin to check directions.'
    ],
    keyActionName: 'Execute Morning Call Queue'
  },
  {
    id: 'leads',
    name: 'Inquiries & Leads',
    path: '/dashboard/leads',
    icon: UsersIcon,
    accentColor: '#2563eb',
    badge: 'LEAD GENERATION',
    tagline: 'Capture buyer requirements and run instant AI Magic Match.',
    threeSteps: [
      'Click "+ New Inquiry" and record buyer budget (min/max), BHK, and preferred locality.',
      'Tap "Magic Match 🪄" to scan your inventory and rank matching properties.',
      'Click "WhatsApp Pitch 💬" to dispatch a formatted brochure to the client in 5 seconds.'
    ],
    keyActionName: 'Add Inquiry & Magic Match'
  },
  {
    id: 'properties',
    name: 'Property Inventory',
    path: '/dashboard/properties',
    icon: BuildingIcon,
    accentColor: '#059669',
    badge: 'INVENTORY VAULT',
    tagline: 'Catalog builder and resale listings with pricing and digital flyers.',
    threeSteps: [
      'Click "+ Add Property" and enter Carpet Area, Asking Price, Floor, and Possession.',
      'Upload high-resolution photos of living room, kitchen, and society amenities.',
      'Click "Share on WhatsApp" to create a co-branded flyer with your agency RERA number.'
    ],
    keyActionName: 'Add & Share Property Flyer'
  },
  {
    id: 'site-visits',
    name: 'Site Visits',
    path: '/dashboard/site-visits',
    icon: MapPinIcon,
    accentColor: '#ea580c',
    badge: 'FIELD SHOWINGS',
    tagline: 'Coordinate physical property viewings and capture buyer reactions.',
    threeSteps: [
      'Click "+ Schedule Visit" with buyer, property, and appointment time.',
      'Click "Send Location Pin" to WhatsApp the buyer the exact society GPS coordinates.',
      'Mark status "Completed" and record buyer feedback or counter-offers immediately.'
    ],
    keyActionName: 'Schedule Showing & Dispatch GPS'
  },
  {
    id: 'deals',
    name: 'Deals Pipeline',
    path: '/dashboard/deals',
    icon: BriefcaseIcon,
    accentColor: '#b45309',
    badge: 'CLOSING KANBAN',
    tagline: 'Move agreed deals through Token Advance, Legal Check, and Registry.',
    threeSteps: [
      'Create a deal card when buyer and seller agree on commercial terms.',
      'Click "Issue Token Receipt" immediately upon receiving earnest money.',
      'Drag through Legal Check -> Sale Agreement -> Closed Won, then generate GST invoice.'
    ],
    keyActionName: 'Issue Token Receipt & Advance Stage'
  },
  {
    id: 'insights',
    name: 'Insights & Analytics',
    path: '/dashboard/insights',
    icon: TrendingUpIcon,
    accentColor: '#7c3aed',
    badge: 'ANALYTICS',
    tagline: 'Track conversion funnel drop-offs and high-margin micro-markets.',
    threeSteps: [
      'Review your Lead-to-Showing conversion rate to spot follow-up bottlenecks.',
      'Inspect the Micro-Market Revenue breakdown to see top closing localities.',
      'Export PDF performance summaries for partner and agency briefings.'
    ],
    keyActionName: 'Inspect Sales Conversion Funnel'
  },
  {
    id: 'documents',
    name: 'Documents Vault',
    path: '/dashboard/documents',
    icon: FileTextIcon,
    accentColor: '#059669',
    badge: 'LEGAL VAULT',
    tagline: 'Securely store and share title deeds, ECs, and KYC packages.',
    threeSteps: [
      'Upload Parent Deeds, 15-year Encumbrance Certificates, and Khata extracts.',
      'Tag documents by Deal so all papers for a property stay neatly grouped.',
      'Generate an instant, secure WhatsApp bundle link for bank home loan officers.'
    ],
    keyActionName: 'Generate Bank Document Bundle'
  },
  {
    id: 'invoices',
    name: 'Invoices & Billing',
    path: '/dashboard/invoices',
    icon: ReceiptIcon,
    accentColor: '#059669',
    badge: 'COMMISSION BILLING',
    tagline: 'Professional 1-click GST brokerage invoices that get paid on time.',
    threeSteps: [
      'Click "+ New Invoice" or generate directly from a closed deal card.',
      'Confirm 1% or 2% brokerage rate; system automatically calculates 18% GST.',
      'Send formatted invoice PDF with RTGS/UPI bank details directly over WhatsApp.'
    ],
    keyActionName: 'Generate GST Brokerage Invoice'
  },
  {
    id: 'tasks',
    name: 'Tasks & Reminders',
    path: '/dashboard/tasks',
    icon: CheckSquareIcon,
    accentColor: '#2563eb',
    badge: 'TASK EXECUTION',
    tagline: 'Stay on top of key collections, advocate follow-ups, and registry prep.',
    threeSteps: [
      'Create time-bound action tasks linked directly to a client deal.',
      'Apply standard templates like "Registry Day Checklist" 48 hours prior.',
      'Check off items as completed to keep your deal progress on track.'
    ],
    keyActionName: 'Check Off Priority Deal Tasks'
  },
  {
    id: 'settings',
    name: 'Agency Settings',
    path: '/dashboard/settings',
    icon: SettingsIcon,
    accentColor: '#7c3aed',
    badge: 'BRANDING & RERA',
    tagline: 'Configure company logo, RERA credentials, and payout bank accounts.',
    threeSteps: [
      'Upload your agency logo to display on all client flyers and invoices.',
      'Enter your State RERA registration number and GSTIN for compliance.',
      'Enter your bank current account coordinates for invoice wire transfers.'
    ],
    keyActionName: 'Save Agency Branding & RERA'
  }
];

export function OnScreenTutorial() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string>('today');

  // Detect current page and set initial guide
  useEffect(() => {
    const currentGuide = PAGE_GUIDES.find(g => pathname === g.path || (g.path !== '/dashboard' && pathname.startsWith(g.path)));
    if (currentGuide) {
      setSelectedGuideId(currentGuide.id);
    }
  }, [pathname]);

  // Listen to open-on-screen-tutorial event from anywhere in the app
  useEffect(() => {
    const handleOpenEvent = (e?: any) => {
      if (e?.detail?.moduleId) {
        setSelectedGuideId(e.detail.moduleId);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-on-screen-tutorial', handleOpenEvent);
    return () => window.removeEventListener('open-on-screen-tutorial', handleOpenEvent);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeGuide = PAGE_GUIDES.find(g => g.id === selectedGuideId) || PAGE_GUIDES[0];
  const GuideIcon = activeGuide.icon;

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Interactive Screen Guide Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 500,
          backgroundColor: '#ffffff',
          borderRadius: 22,
          boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid #e2e8f0'
        }}
      >
          {/* Top Header */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <GuideIcon size={18} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
                  {activeGuide.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Active Module Quick Guide
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link
                href="/dashboard/tutorial"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#34d399',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(52, 211, 153, 0.12)'
                }}
              >
                Full Playbook 📖
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <XIcon size={18} color="#94a3b8" />
              </button>
            </div>
          </div>

          {/* Module Switcher Strip */}
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {PAGE_GUIDES.map(g => {
              const isSel = g.id === activeGuide.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuideId(g.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 14,
                    fontSize: 11.5,
                    fontWeight: isSel ? 700 : 500,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: isSel ? '#0f172a' : '#ffffff',
                    color: isSel ? '#ffffff' : '#64748b',
                    boxShadow: isSel ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {g.name}
                </button>
              );
            })}
          </div>

          {/* Guide Body */}
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
              {activeGuide.tagline}
            </div>

            {/* 3 Action Steps */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: 14,
              padding: '14px 16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                ⚡ 3 Key Actions for This Screen:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeGuide.threeSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#1e293b', lineHeight: 1.4 }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Jump to In-Depth Tutorial */}
            <Link
              href="/dashboard/tutorial"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                backgroundColor: '#059669',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <BookOpenIcon size={16} color="#ffffff" />
              <span>Open In-Depth Visual Page Tutorial 📖</span>
            </Link>

            {/* Navigate directly to page if not already there */}
            {pathname !== activeGuide.path && (
              <Link
                href={activeGuide.path}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: 12.5,
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <span>Navigate to {activeGuide.name} Screen ↗</span>
              </Link>
            )}
          </div>
        </div>
      </div>
  );
}
