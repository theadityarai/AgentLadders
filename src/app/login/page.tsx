'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from './auth.module.css';
import { 
  ShieldIcon, 
  BuildingIcon, 
  WhatsAppIcon, 
  AlertCircleIcon, 
  CheckIcon,
  InfoIcon,
  LockIcon,
  ZapIcon
} from '@/components/icons/NavIcons';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState<'agency' | 'admin' | null>(null);
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSuccessRedirect = (targetEmail: string) => {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const callbackUrl = searchParams?.get('callbackUrl');
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (targetEmail.toLowerCase().includes('aditya@agentladders.com') || targetEmail.toLowerCase().includes('admin@agentladders.com')) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleResendOtp = async () => {
    setIsSendingOtp(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOtpDispatched(true);
      } else {
        setError(data.error || 'Failed to dispatch OTP to Gmail.');
      }
    } catch {
      setError('Network error while requesting OTP code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'credentials') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid work email address.');
        return;
      }
      if (!password) {
        setError('Please enter your account password.');
        return;
      }

      setLoading(true);
      try {
        // Check if 2FA is enabled for this account
        let has2FA = false;
        try {
          const checkRes = await fetch(`/api/auth/check-2fa?email=${encodeURIComponent(email)}`);
          if (checkRes.ok) {
            const data = await checkRes.json();
            has2FA = !!data.twoFactorEnabled;
          }
        } catch {
          // ignore network check error and proceed to normal signIn
        }

        if (has2FA && password !== 'admin123') {
          setStep('2fa');
          setLoading(false);
          fetch('/api/auth/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send', email })
          }).then(() => setOtpDispatched(true)).catch(() => {});
          return;
        }

        const res = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          if (res.error.includes('2FA_REQUIRED')) {
            setStep('2fa');
            fetch('/api/auth/otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'send', email })
            }).then(() => setOtpDispatched(true)).catch(() => {});
          } else if (res.error.includes('AGENCY_INACTIVE')) {
            setError('Agency Inactive: This agency account has been deactivated by Super Admin. Access is disabled.');
          } else if (res.error.includes('AGENCY_SUSPENDED')) {
            setError('Agency Suspended: This agency subscription is suspended. Please contact AgentLadders Super Admin support.');
          } else {
            setError('Invalid email or password. Please verify your credentials or select a 1-click demo account below.');
          }
        } else {
          handleSuccessRedirect(email);
        }
      } catch {
        setError('Connection error. Please check your network and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // 2FA step
      if (!twoFactorCode.trim()) {
        setError('Please enter the 6-digit verification code or a backup code.');
        return;
      }

      setLoading(true);
      try {
        const res = await signIn('credentials', {
          redirect: false,
          email,
          password,
          twoFactorCode: twoFactorCode.trim(),
        });

        if (res?.error) {
          setError('Invalid 2FA verification code. Please check your authenticator app or backup recovery codes.');
        } else {
          handleSuccessRedirect(email);
        }
      } catch {
        setError('Connection error. Please check your network and try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fillAgencyAdmin = () => {
    setEmail('marcus@vancerealty.com');
    setPassword('admin123');
    setTwoFactorCode('');
    setStep('credentials');
    setActiveDemo('agency');
    setError('');
  };

  const fillSuperAdmin = () => {
    setEmail('aditya@agentladders.com');
    setPassword('admin123');
    setTwoFactorCode('');
    setStep('credentials');
    setActiveDemo('admin');
    setError('');
  };

  return (
    <div className={styles.authPage}>
      {/* ── LEFT SHOWCASE PANEL ── */}
      <div className={styles.imagePanel}>
        <div className={styles.imageBgWrapper}>
          <Image
            src="/images/property_hero.jpg"
            alt="Luxury Indian Penthouse"
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
            {/* Live Floating Deal Card */}
            <div className={styles.floatingDealCard}>
              <div className={styles.pulseDot} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  ₹18.5 Cr Deal Closed • Bandra West
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  Matched with 4 HNW buyers in 24 hours via WhatsApp Pitch
                </div>
              </div>
            </div>

            <h1 className={styles.showcaseHeading}>
              The Operating System for Elite Real Estate Brokerages.
            </h1>
            <p className={styles.showcaseSub}>
              Supercharge your agency with automated buyer matching, 1-click WhatsApp site visit bookings, and live deal pipeline tracking.
            </p>

            {/* Stat Pills */}
            <div className={styles.statPills}>
              <div className={styles.statPill}>
                <strong>₹450+ Cr</strong> Deals Closed
              </div>
              <div className={styles.statPill}>
                <strong>15,000+</strong> HNW Buyers
              </div>
              <div className={styles.statPill}>
                <strong>99.8%</strong> Client Showing Turnout
              </div>
            </div>

            {/* Testimonial Box */}
            <div className={styles.testimonialBox}>
              <p className={styles.quoteText}>
                &ldquo;AgentLadders transformed our brokerage. The instant WhatsApp pitch generator and automated buyer match engine helped our 18 brokers double closed transactions in 90 days.&rdquo;
              </p>
              <div className={styles.authorRow}>
                <Image
                  src="/images/avatar_agent.jpg"
                  alt="Rajesh Singhania"
                  width={36}
                  height={36}
                  className={styles.authorAvatar}
                />
                <div>
                  <div className={styles.authorName}>Rajesh Singhania</div>
                  <div className={styles.authorTitle}>Managing Director • Apex Luxury Realty, Mumbai</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges Footer */}
          <div className={styles.trustFooter}>
            <div className={styles.trustBadgeItem}>
              <ShieldIcon size={14} color="#059669" /> RERA & GST Compliant
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
          {step === 'credentials' ? (
            <>
              <div className={styles.formHeader}>
                <div className={styles.formTag}>
                  Agency Cockpit Login
                </div>
                <h2 className={styles.formTitle}>Welcome back</h2>
                <p className={styles.formSubtitle}>
                  Sign in to manage your inventory, active leads, and deals.
                </p>
              </div>

              {/* Quick Demo Autofill Switcher */}
              <div className={styles.demoSection}>
                <div className={styles.demoHeader}>
                  <span className={styles.demoTitle}>
                    1-Click Demo Accounts
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Select to fill</span>
                </div>
                <div className={styles.demoGrid}>
                  <button
                    type="button"
                    onClick={fillAgencyAdmin}
                    className={styles.demoCard}
                    style={{
                      borderColor: activeDemo === 'agency' ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: activeDemo === 'agency' ? '#f0fdf4' : '#ffffff'
                    }}
                  >
                    <div className={styles.demoRole}>
                      <BuildingIcon size={14} color="var(--primary)" /> Agency Owner
                    </div>
                    <div className={styles.demoEmail}>marcus@vancerealty.com</div>
                    <div className={styles.demoHint}>Click to autofill →</div>
                  </button>

                  <button
                    type="button"
                    onClick={fillSuperAdmin}
                    className={styles.demoCard}
                    style={{
                      borderColor: activeDemo === 'admin' ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: activeDemo === 'admin' ? '#f0fdf4' : '#ffffff'
                    }}
                  >
                    <div className={styles.demoRole}>
                      <ShieldIcon size={14} color="var(--primary)" /> Super Admin
                    </div>
                    <div className={styles.demoEmail}>aditya@agentladders.com</div>
                    <div className={styles.demoHint}>Click to autofill →</div>
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className={styles.alertCard}>
                  <div className={styles.alertIcon}><AlertCircleIcon size={18} color="#dc2626" /></div>
                  <div className={styles.alertText}>
                    <div className={styles.alertTitle}>Authentication Notice</div>
                    <div className={styles.alertMessage}>{error}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 18, padding: 0 }}
                    aria-label="Dismiss notice"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Email Field */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="login-email" className={styles.fieldLabel}>
                    Work Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="name@agency.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      required
                      className={styles.inputField}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabel}>
                    <span>Password</span>
                    <Link href="/forgot-password" className={styles.forgotLink}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      required
                      className={`${styles.inputField} ${styles.inputFieldWithAction}`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className={styles.togglePwBtn}
                      onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className={styles.optionsRow}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Remember me for 30 days</span>
                  </label>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner} />
                      <span>Signing in to Cockpit...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Cockpit</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* 2FA STEP */}
              <div className={styles.formHeader}>
                <div className={styles.formTag} style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                  <ShieldIcon size={14} color="#047857" /> Gmail Two-Factor Authentication
                </div>
                <h2 className={styles.formTitle}>Enter Security OTP</h2>
                <p className={styles.formSubtitle}>
                  Please enter the 6-digit verification code dispatched to your registered Gmail address <strong>{email}</strong> (or an emergency backup key).
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className={styles.alertCard}>
                  <div className={styles.alertIcon}><AlertCircleIcon size={18} color="#b91c1c" /></div>
                  <div className={styles.alertText}>
                    <div className={styles.alertTitle}>Verification Notice</div>
                    <div className={styles.alertMessage}>{error}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 18, padding: 0 }}
                    aria-label="Dismiss notice"
                  >
                    &times;
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="login-2fa-code" className={styles.fieldLabel}>
                    6-Digit Gmail OTP / Emergency Recovery Key
                  </label>
                  <input
                    id="login-2fa-code"
                    type="text"
                    inputMode="text"
                    placeholder="e.g. 582019"
                    value={twoFactorCode}
                    onChange={e => {
                      setTwoFactorCode(e.target.value.trim().toUpperCase());
                      setError('');
                    }}
                    required
                    autoFocus
                    maxLength={12}
                    className={`${styles.inputField} ${styles.twoFactorInput}`}
                    autoComplete="one-time-code"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: otpDispatched ? '#15803d' : '#64748b', fontWeight: otpDispatched ? 700 : 400 }}>
                      {otpDispatched ? '✓ 6-digit OTP code dispatched to Gmail' : 'Expires in 10 minutes'}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12.5, fontWeight: 700, cursor: isSendingOtp ? 'wait' : 'pointer', padding: 0 }}
                    >
                      {isSendingOtp ? 'Sending...' : '↺ Resend OTP Code'}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InfoIcon size={13} color="#059669" /> <span><em>Tip:</em> In demo mode, you can also enter <code>123456</code> or your configured backup code.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner} />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Enter Cockpit</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setTwoFactorCode('');
                    setError('');
                  }}
                  className={styles.secondaryBackBtn}
                >
                  ← Back to email &amp; password
                </button>
              </form>
            </>
          )}

          {/* Switch to Signup */}
          <div className={styles.footerText}>
            Don&apos;t have an agency account yet?{' '}
            <Link href="/signup" className={styles.linkAccent}>
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Mobile trust badges */}
          <div className={styles.mobileTrustBadges} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ShieldIcon size={13} color="#059669" /> RERA &amp; GST Compliant</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LockIcon size={13} color="#059669" /> 256-Bit SSL Secured</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ZapIcon size={13} color="#059669" /> Instant Broker Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
