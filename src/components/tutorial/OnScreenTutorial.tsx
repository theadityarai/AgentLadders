'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  XIcon,
  ChevronRightIcon,
  CheckIcon,
  CompassIcon,
  PhoneIcon,
  WhatsAppIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  SparklesIcon,
  RotateCcwIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '@/components/icons/NavIcons';

export interface TourStep {
  id: string;
  badge: string;
  badgeColor: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  proTip?: string;
  actionText?: string;
  actionHref?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    badge: 'Quick Tour • Step 1 of 6',
    badgeColor: '#059669',
    emoji: '🚀',
    title: 'Welcome to AgentLadders CRM',
    subtitle: 'The Real Estate Operating System for High-Earning Brokers',
    description: 'AgentLadders is designed specifically for Indian property consultants and agencies. Manage buyer inquiries, instant WhatsApp property brochures, site visits, and commission payouts in one place.',
    proTip: 'Brokers using AgentLadders close up to 3x more deals by never letting a hot buyer slip through the cracks.',
    actionText: 'View Full Deal Flowchart 🗺️',
    actionHref: '/dashboard/tutorial',
    icon: CompassIcon
  },
  {
    id: 'today',
    badge: 'Daily Routine • Step 2 of 6',
    badgeColor: '#2563eb',
    emoji: '📞',
    title: 'Your Daily Action Center',
    subtitle: 'High-Priority Calls & Scheduled Visits',
    description: 'Start every morning on the Today screen. You will see scheduled site visits, urgent buyer follow-up calls, and quick-action WhatsApp triggers with zero clutter.',
    proTip: 'Calling fresh leads within 5 minutes increases conversion rates by up to 8x!',
    actionText: 'Go to Today Dashboard',
    actionHref: '/dashboard',
    icon: PhoneIcon
  },
  {
    id: 'leads',
    badge: 'Inquiry Pipeline • Step 3 of 6',
    badgeColor: '#7c3aed',
    emoji: '🎯',
    title: 'Inquiries & AI Magic Match',
    subtitle: 'Pair Buyer Budgets with Inventory Instantly',
    description: 'Store client requirements (Budget, Preferred Locality, BHK type). The Magic Match Engine automatically cross-checks your property inventory to find exact matches in seconds.',
    proTip: 'Use tags like "Hot Buyer" or "Urgent Investor" to prioritize your follow-up list.',
    actionText: 'Explore Inquiries',
    actionHref: '/dashboard/leads',
    icon: SparklesIcon
  },
  {
    id: 'whatsapp',
    badge: 'Communication • Step 4 of 6',
    badgeColor: '#16a34a',
    emoji: '💬',
    title: '1-Click WhatsApp Property Pitches',
    subtitle: 'Professional Formatted Brochures in Hindi & English',
    description: 'No more typing long paragraphs on your phone! Click "WhatsApp Pitch" on any lead or property to generate a customized property presentation and launch WhatsApp immediately.',
    proTip: 'Includes prices in Lakhs/Crores, carpet area, possession date, and high-res photo links.',
    actionText: 'Try WhatsApp Pitches',
    actionHref: '/dashboard/leads',
    icon: WhatsAppIcon
  },
  {
    id: 'site_visits',
    badge: 'Field Inspections • Step 5 of 6',
    badgeColor: '#ea580c',
    emoji: '🚗',
    title: 'Site Visits & Inspection Tracker',
    subtitle: 'Convert Property Showings into Signed Deals',
    description: 'Lock in inspection dates and times with buyers. Share exact Google Maps pins, coordinate with property caretakers, and record buyer feedback right after the showing.',
    proTip: 'Never show more than 3 properties in one visit—buyers get overwhelmed and delay decisions.',
    actionText: 'Manage Site Visits',
    actionHref: '/dashboard/site-visits',
    icon: MapPinIcon
  },
  {
    id: 'deals',
    badge: 'Commission & Closing • Step 6 of 6',
    badgeColor: '#b45309',
    emoji: '🤝',
    title: 'Deal Pipeline & Brokerage Invoicing',
    subtitle: 'Token Advance, Legal Checks & 1-Click GST Invoices',
    description: 'Track deals through Negotiation, Token Advance, Document Verification, and Registry. Once closed, generate professional GST brokerage invoices in 1 click.',
    proTip: 'Always issue an official Token Receipt immediately upon receiving earnest money.',
    actionText: 'View Deals Pipeline',
    actionHref: '/dashboard/deals',
    icon: BriefcaseIcon
  }
];

export function OnScreenTutorial() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check initial state from localStorage or listen to event
  useEffect(() => {
    const handleOpenEvent = (e?: any) => {
      const step = e?.detail?.step !== undefined ? e.detail.step : 0;
      setCurrentStepIndex(step);
      setIsCompleted(false);
      setIsOpen(true);
    };

    window.addEventListener('open-on-screen-tutorial', handleOpenEvent);

    // Auto-prompt on first visit to /dashboard if not seen before
    const hasSeenTour = localStorage.getItem('agentladders_tour_dismissed_v1');
    if (!hasSeenTour && pathname === '/dashboard') {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1400);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('open-on-screen-tutorial', handleOpenEvent);
      };
    }

    return () => {
      window.removeEventListener('open-on-screen-tutorial', handleOpenEvent);
    };
  }, [pathname]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      localStorage.setItem('agentladders_tour_dismissed_v1', 'true');
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsCompleted(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('agentladders_tour_dismissed_v1', 'true');
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsOpen(true);
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Tutorial Container Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Top Progress Bar */}
        <div style={{ height: 5, backgroundColor: '#f1f5f9', width: '100%', position: 'relative' }}>
          <div style={{
            height: '100%',
            backgroundColor: isCompleted ? '#10b981' : currentStep.badgeColor,
            width: isCompleted ? '100%' : `${progressPercent}%`,
            transition: 'width 0.35s ease, background-color 0.35s ease'
          }} />
        </div>

        {/* Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px 12px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: `${currentStep.badgeColor}15`,
              color: currentStep.badgeColor,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              <span>{currentStep.emoji}</span>
              {isCompleted ? 'Tour Completed 🎉' : currentStep.badge}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/dashboard/tutorial"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#64748b',
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
              title="Open full visual flowchart page"
            >
              <BookOpenIcon size={14} color="#64748b" />
              <span>Full Flowchart</span>
            </Link>

            <button
              onClick={handleDismiss}
              aria-label="Close tutorial"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '6px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <XIcon size={18} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isCompleted ? (
          <div style={{ padding: '24px' }}>
            {/* Step Icon & Title Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: `${currentStep.badgeColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1.5px solid ${currentStep.badgeColor}30`
              }}>
                <StepIcon size={26} color={currentStep.badgeColor} />
              </div>

              <div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 4px',
                  lineHeight: 1.3
                }}>
                  {currentStep.title}
                </h3>
                <p style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#64748b',
                  margin: 0
                }}>
                  {currentStep.subtitle}
                </p>
              </div>
            </div>

            {/* Description Text */}
            <p style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: '#334155',
              margin: '0 0 16px',
              backgroundColor: '#f8fafc',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              {currentStep.description}
            </p>

            {/* Pro Tip Box */}
            {currentStep.proTip && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 20
              }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>💡</span>
                <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5, fontWeight: 500 }}>
                  <strong style={{ color: '#78350f', fontWeight: 700 }}>Broker Pro Tip: </strong>
                  {currentStep.proTip}
                </div>
              </div>
            )}

            {/* Quick Action Link for this specific step */}
            {currentStep.actionHref && (
              <div style={{ marginBottom: 12 }}>
                <Link
                  href={currentStep.actionHref}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: currentStep.badgeColor,
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    backgroundColor: `${currentStep.badgeColor}10`,
                    border: `1px solid ${currentStep.badgeColor}25`
                  }}
                >
                  <span>{currentStep.actionText}</span>
                  <ChevronRightIcon size={14} color={currentStep.badgeColor} />
                </Link>
              </div>
            )}

            {/* Step Indicator Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid #f1f5f9'
            }}>
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  aria-label={`Jump to step ${idx + 1}: ${step.title}`}
                  style={{
                    width: idx === currentStepIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: idx === currentStepIndex ? currentStep.badgeColor : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Tour Completed Screen */
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              border: '2px solid #a7f3d0'
            }}>
              <CheckCircleIcon size={38} color="#059669" />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              You Are Ready to Close Deals! 🏆
            </h3>
            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, maxWidth: 440, margin: '0 auto 24px' }}>
              You have completed the essential AgentLadders CRM tour. For the complete visual step-by-step pipeline blueprint, check out the Deal Flowchart page anytime!
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯</span> Recommended Next Actions:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                <li>Add your first buyer inquiry in <Link href="/dashboard/leads" onClick={() => setIsOpen(false)} style={{ color: '#059669', fontWeight: 600 }}>Inquiries</Link></li>
                <li>Match them with properties in <Link href="/dashboard/properties" onClick={() => setIsOpen(false)} style={{ color: '#059669', fontWeight: 600 }}>Properties</Link></li>
                <li>Study ready WhatsApp closing scripts in <Link href="/dashboard/tutorial" onClick={() => setIsOpen(false)} style={{ color: '#059669', fontWeight: 600 }}>Deal Flowchart</Link></li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                href="/dashboard/tutorial"
                onClick={() => setIsOpen(false)}
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 24px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                }}
              >
                <span>Open Full Deal Flowchart 🗺️</span>
              </Link>

              <button
                onClick={handleDismiss}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Go to Workspace
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        {!isCompleted && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: 6
              }}
            >
              Skip Tour
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                style={{
                  backgroundColor: currentStep.badgeColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: `0 4px 12px ${currentStep.badgeColor}35`
                }}
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour 🚀' : 'Next Step'}</span>
                <ChevronRightIcon size={14} color="#ffffff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
