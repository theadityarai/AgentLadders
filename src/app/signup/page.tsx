'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '../login/auth.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    agency: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    country: 'India',
    currency: 'INR'
  });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (error) setError('');
  };

  // Live password strength calculation
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score += 1;

    switch (score) {
      case 1: return { score: 1, label: 'Weak', color: '#ef4444' };
      case 2: return { score: 2, label: 'Fair', color: '#f59e0b' };
      case 3: return { score: 3, label: 'Good', color: '#3b82f6' };
      case 4: return { score: 4, label: 'Strong', color: '#10b981' };
      default: return { score: 1, label: 'Weak', color: '#ef4444' };
    }
  };

  const pwStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!form.agency.trim()) {
      setError('Please enter your agency or brokerage name.');
      return;
    }
    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanPhoneDigits = form.phone.replace(/\D/g, '');
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      setError('Please enter your agency official 10-digit WhatsApp phone number.');
      return;
    }
    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!agree) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Auto sign in the newly registered agency owner
      const authRes = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      
      if (authRes?.error) {
        throw new Error(authRes.error);
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* ── LEFT SHOWCASE PANEL ── */}
      <div className={styles.imagePanel}>
        <div className={styles.imageBgWrapper}>
          <Image
            src="/images/hero_broker.jpg"
            alt="Real Estate Leader"
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
            <span className={styles.logoTag}>14-Day Free Trial</span>
          </Link>

          {/* Main Showcase Hero */}
          <div className={styles.showcaseHero}>
            {/* Live Floating Trial Badge */}
            <div className={styles.floatingDealCard}>
              <div className={styles.pulseDot} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  ⚡ Instant Cockpit Activation
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  Pre-loaded with sample Indian inventory & buyer leads so you can test live
                </div>
              </div>
            </div>

            <h1 className={styles.showcaseHeading}>
              Launch Your Brokerage Cockpit in Under 60 Seconds.
            </h1>
            <p className={styles.showcaseSub}>
              Equip your brokers with automatic buyer-to-property matching, RERA carpet area calculators, and direct WhatsApp client pitch generators.
            </p>

            {/* Stat Pills */}
            <div className={styles.statPills}>
              <div className={styles.statPill}>
                <strong>240+</strong> Brokerages
              </div>
              <div className={styles.statPill}>
                <strong>38%</strong> Shorter Sales Cycle
              </div>
              <div className={styles.statPill}>
                <strong>₹0</strong> Setup Fees
              </div>
            </div>

            {/* Testimonial Box */}
            <div className={styles.testimonialBox}>
              <p className={styles.quoteText}>
                &ldquo;Setting up our 24 agents on AgentLadders took less than 2 minutes. The daily habit tracker and automated site visit WhatsApp engine completely modernized how we close deals.&rdquo;
              </p>
              <div className={styles.authorRow}>
                <Image
                  src="/images/avatar_agent.jpg"
                  alt="Priya Sharma"
                  width={36}
                  height={36}
                  className={styles.authorAvatar}
                />
                <div>
                  <div className={styles.authorName}>Priya Sharma</div>
                  <div className={styles.authorTitle}>Managing Director • Skyline Properties, Bangalore</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges Footer */}
          <div className={styles.trustFooter}>
            <div className={styles.trustBadgeItem}>
              <span>✨</span> 14 Days Free
            </div>
            <div className={styles.trustBadgeItem}>
              <span>💳</span> No Credit Card Required
            </div>
            <div className={styles.trustBadgeItem}>
              <span>⚡</span> Cancel Anytime
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className={styles.formPanel}>
        <div className={`${styles.formContainer} ${styles.signupContainer}`}>
          <div className={styles.formHeader}>
            <div className={styles.formTag}>
              <span>✨</span> 14-Day Free Agency Trial
            </div>
            <h2 className={styles.formTitle}>Create Agency Account</h2>
            <p className={styles.formSubtitle}>
              Get full access to all Professional features. No credit card needed.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className={styles.alertCard}>
              <div className={styles.alertIcon}>⚠️</div>
              <div className={styles.alertText}>
                <div className={styles.alertTitle}>Notice</div>
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Agency Name */}
            <div className={styles.fieldGroup}>
              <label htmlFor="signup-agency" className={styles.fieldLabel}>
                Agency / Firm Name *
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                    <path d="M9 22v-4h6v4" />
                    <path d="M8 6h.01" />
                    <path d="M16 6h.01" />
                    <path d="M12 6h.01" />
                    <path d="M12 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 10h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 10h.01" />
                    <path d="M8 14h.01" />
                  </svg>
                </span>
                <input
                  id="signup-agency"
                  type="text"
                  placeholder="e.g. Apex Luxury Realty"
                  value={form.agency}
                  onChange={e => update('agency', e.target.value)}
                  required
                  className={styles.inputField}
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Full Name & Phone in 2 Columns */}
            <div className={styles.formRow2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="signup-name" className={styles.fieldLabel}>
                  Your Full Name *
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    className={styles.inputField}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="signup-phone" className={styles.fieldLabel}>
                  Official Agency WhatsApp *
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.phonePrefix}>
                    <span>🇮🇳</span> +91
                  </span>
                  <input
                    id="signup-phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    required
                    className={`${styles.inputField} ${styles.phoneField}`}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Work Email */}
            <div className={styles.fieldGroup}>
              <label htmlFor="signup-email" className={styles.fieldLabel}>
                Work Email Address *
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@agency.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                  className={styles.inputField}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password with Strength Meter */}
            <div className={styles.fieldGroup}>
              <label htmlFor="signup-password" className={styles.fieldLabel}>
                Create Password *
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="signup-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  minLength={8}
                  className={`${styles.inputField} ${styles.inputFieldWithAction}`}
                  autoComplete="new-password"
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

              {/* Password Strength Meter */}
              {form.password && (
                <div className={styles.strengthMeter}>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4].map(step => (
                      <div
                        key={step}
                        className={styles.strengthBar}
                        style={{
                          backgroundColor: step <= pwStrength.score ? pwStrength.color : '#e2e8f0'
                        }}
                      />
                    ))}
                  </div>
                  <div className={styles.strengthText}>
                    <span>Password Strength: <strong style={{ color: pwStrength.color }}>{pwStrength.label}</strong></span>
                    <span>{form.password.length}/8+ chars</span>
                  </div>
                </div>
              )}
            </div>

            {/* Country & Currency in 2 Columns */}
            <div className={styles.formRow2}>
              <div className={styles.fieldGroup}>
                <label htmlFor="signup-country" className={styles.fieldLabel}>
                  Country
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <span>🌐</span>
                  </span>
                  <select
                    id="signup-country"
                    value={form.country}
                    onChange={e => update('country', e.target.value)}
                    className={styles.selectField}
                  >
                    <option value="India">India 🇮🇳</option>
                    <option value="UAE">United Arab Emirates 🇦🇪</option>
                    <option value="United States">United States 🇺🇸</option>
                    <option value="United Kingdom">United Kingdom 🇬🇧</option>
                    <option value="Singapore">Singapore 🇸🇬</option>
                    <option value="Australia">Australia 🇦🇺</option>
                    <option value="Canada">Canada 🇨🇦</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="signup-currency" className={styles.fieldLabel}>
                  Primary Currency
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <span>🪙</span>
                  </span>
                  <select
                    id="signup-currency"
                    value={form.currency}
                    onChange={e => update('currency', e.target.value)}
                    className={styles.selectField}
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="AED">AED (د.إ UAE Dirham)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="GBP">GBP (£ British Pound)</option>
                    <option value="SGD">SGD (S$ Singapore Dollar)</option>
                    <option value="AUD">AUD (A$ Australian Dollar)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <label className={styles.termsText}>
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className={styles.checkbox}
              />
              <span>
                I agree to the <a href="#">Terms of Service</a>, <a href="#">Privacy Policy</a>, and to receive real-time broker notifications.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !agree}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  <span>Setting up your Agency Cockpit...</span>
                </>
              ) : (
                <>
                  <span>Create Agency & Start 14-Day Free Trial</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className={styles.footerText}>
            Already have an agency account?{' '}
            <Link href="/login" className={styles.linkAccent}>
              Sign In here
            </Link>
          </div>

          {/* Mobile trust badges */}
          <div className={styles.mobileTrustBadges}>
            🛡️ RERA & GST Compliant • 🔒 256-Bit SSL Secured • ⚡ Instant Broker Setup
          </div>
        </div>
      </div>
    </div>
  );
}
