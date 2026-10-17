'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../login/auth.module.css';
import { 
  ShieldIcon, 
  CheckIcon, 
  AlertCircleIcon, 
  LockIcon, 
  BuildingIcon, 
  WhatsAppIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@/components/icons/NavIcons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [isUnregistered, setIsUnregistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      setIsUnregistered(false);
      return;
    }

    setLoading(true);
    setError('');
    setIsUnregistered(false);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process password reset request.');
        if (res.status === 404 || (data.error && data.error.toLowerCase().includes('not registered'))) {
          setIsUnregistered(true);
        }
        return;
      }

      setResetLink(data.resetLink || '');
      setSubmitted(true);
    } catch {
      setError('Network communication error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setError('');
    setIsUnregistered(false);
  };

  return (
    <div className={styles.authPage}>
      {/* ── LEFT SHOWCASE PANEL (LUXURY BRANDING) ── */}
      <div className={styles.imagePanel}>
        <div className={styles.imageBgWrapper}>
          <Image
            src="/images/deal_closing.jpg"
            alt="AgentLadders Real Estate Headquarters"
            fill
            className={styles.bgImage}
            priority
          />
        </div>
        <div className={styles.imageOverlay} />

        <div className={styles.imagePanelContent}>
          {/* Logo Row */}
          <Link href="/" className={styles.logoRow}>
            <div className={styles.logoMark}>⬡</div>
            <span className={styles.logoText}>AgentLadders</span>
            <span className={styles.logoTag}>India Broker CRM</span>
          </Link>

          {/* Main Showcase Hero */}
          <div className={styles.showcaseHero}>
            {/* Live Security Verification Card */}
            <div className={styles.floatingDealCard}>
              <div className={styles.pulseDot} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldIcon size={14} color="#10b981" /> Enterprise Account Recovery
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  256-bit encrypted single-use tokens with 60-min auto expiration
                </div>
              </div>
            </div>

            <h1 className={styles.showcaseHeading}>
              Secure Account Recovery &amp; Access Protection.
            </h1>
            <p className={styles.showcaseSub}>
              Recover your brokerage cockpit credentials safely. All password reset requests are protected by military-grade rate limiting and email authentication.
            </p>

            {/* Stat Pills */}
            <div className={styles.statPills}>
              <div className={styles.statPill}>
                <strong>256-Bit SSL</strong> Encrypted
              </div>
              <div className={styles.statPill}>
                <strong>60 Mins</strong> Token Expiry
              </div>
              <div className={styles.statPill}>
                <strong>Instant</strong> Verification
              </div>
            </div>

            {/* Security Testimonial Box */}
            <div className={styles.testimonialBox}>
              <p className={styles.quoteText}>
                &ldquo;With multi-tier client data and crores in escrow pipeline, account security is non-negotiable for our firm. AgentLadders makes credential recovery seamless without compromising agency data.&rdquo;
              </p>
              <div className={styles.authorRow}>
                <Image
                  src="/images/avatar_agent.jpg"
                  alt="Marcus Vance"
                  width={36}
                  height={36}
                  className={styles.authorAvatar}
                />
                <div>
                  <div className={styles.authorName}>Marcus Vance</div>
                  <div className={styles.authorTitle}>Principal Broker • Vance Luxury Realty</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges Footer */}
          <div className={styles.trustFooter}>
            <div className={styles.trustBadgeItem}>
              <ShieldIcon size={14} color="#059669" /> RERA &amp; GST Compliant
            </div>
            <div className={styles.trustBadgeItem}>
              <CheckIcon size={14} color="#059669" /> 256-Bit SSL Encryption
            </div>
            <div className={styles.trustBadgeItem}>
              <WhatsAppIcon size={14} color="#059669" /> WhatsApp Cloud Engine
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {/* Mobile-Only Brand Header */}
          <Link href="/" className={styles.mobileBrandHeader}>
            <div className={styles.mobileBrandLogo}>⬡</div>
            <div className={styles.mobileBrandText}>
              <span className={styles.mobileBrandName}>AgentLadders</span>
              <span className={styles.mobileBrandTag}>India Real Estate OS</span>
            </div>
          </Link>

          {!submitted ? (
            <>
              <div className={styles.formHeader}>
                <div className={styles.formTag}>
                  Account Security &amp; Recovery
                </div>
                <h1 className={styles.formTitle}>Reset your password</h1>
                <p className={styles.formSubtitle}>
                  Enter your registered work email and we&apos;ll verify your account and dispatch an encrypted password recovery link.
                </p>
              </div>

              {/* Demo Quick-Fill Pill Bar */}
              <div style={{
                marginBottom: 20,
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 12,
                color: '#64748b'
              }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SparklesIcon size={13} color="var(--primary, #059669)" /> Registered Demo Accounts:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('marcus@vancerealty.com')}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    marcus@vancerealty.com
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('aditya@agentladders.com')}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    aditya@agentladders.com
                  </button>
                </div>
              </div>

              {/* Error Alert Card */}
              {error && (
                <div className={styles.alertCard} style={{ marginBottom: 20 }}>
                  <div className={styles.alertIcon}>
                    <AlertCircleIcon size={20} color="#dc2626" />
                  </div>
                  <div className={styles.alertText}>
                    <div className={styles.alertTitle}>
                      {isUnregistered ? 'Unregistered Email Address' : 'Reset Request Failed'}
                    </div>
                    <div className={styles.alertMessage}>
                      {error}
                    </div>
                    {isUnregistered && (
                      <div style={{ marginTop: 8 }}>
                        <Link 
                          href="/signup" 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#b91c1c',
                            textDecoration: 'underline'
                          }}
                        >
                          Don&apos;t have an account? Sign up here →
                        </Link>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setError(''); setIsUnregistered(false); }}
                    style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 18, padding: 0 }}
                  >
                    &times;
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reset-email" className={styles.fieldLabel}>
                    Registered Work Email Address *
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="name@agency.com"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (error) {
                          setError('');
                          setIsUnregistered(false);
                        }
                      }}
                      required
                      autoFocus
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={loading || !email}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span className={styles.spinner}></span> Verifying Email...
                    </span>
                  ) : (
                    'Send Reset Link →'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── SUCCESS STATE ── */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2.5px solid #a7f3d0',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
              }}>
                <CheckIcon size={36} color="#059669" />
              </div>

              <div className={styles.formTag} style={{ margin: '0 auto 12px auto' }}>
                Reset Email Dispatched
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a', letterSpacing: '-0.5px' }}>
                Check your inbox
              </h2>

              <p style={{ color: '#475569', marginBottom: '20px', lineHeight: 1.6, fontSize: '14px' }}>
                We have verified your account and dispatched a secure password reset link to:
              </p>

              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14.5,
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: 24,
                wordBreak: 'break-all'
              }}>
                {email}
              </div>

              <div style={{
                padding: '12px 14px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                fontSize: 12.5,
                color: '#166534',
                marginBottom: 24,
                textAlign: 'left',
                lineHeight: 1.5
              }}>
                <strong>⏱️ Valid for 60 Minutes:</strong> For your agency&apos;s protection, this single-use recovery token will expire in one hour.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resetLink && (
                  <Link
                    href={resetLink}
                    className={styles.submitBtn}
                    style={{ 
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 8,
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    }}
                  >
                    Open Password Reset Form →
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className={styles.submitBtn}
                  style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', boxShadow: 'none' }}
                >
                  Use a Different Email
                </button>

                <Link
                  href="/login"
                  style={{ 
                    textDecoration: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#64748b',
                    padding: '8px 0'
                  }}
                >
                  ← Return to Sign In
                </Link>
              </div>
            </div>
          )}

          <div className={styles.footerText} style={{ marginTop: '28px' }}>
            Remembered your credentials? <Link href="/login" className={styles.linkAccent}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
