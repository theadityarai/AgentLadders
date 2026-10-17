'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '../login/auth.module.css';
import { 
  ShieldIcon, 
  CheckIcon, 
  AlertCircleIcon, 
  LockIcon, 
  BuildingIcon, 
  WhatsAppIcon,
  SparklesIcon
} from '@/components/icons/NavIcons';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [tokenParam, emailParam]);

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

  const pwStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing password reset token. Please check your reset link or request a new one.');
      return;
    }

    if (!email) {
      setError('Missing registered email address. Please check your reset link or request a new one.');
      return;
    }

    if (password.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          email: email.trim(),
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update password.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network communication error. Please try again.');
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
            <div className={styles.floatingDealCard}>
              <div className={styles.pulseDot} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LockIcon size={14} color="#10b981" /> Encrypted Credential Update
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  Bcrypt salted hash encryption with multi-session invalidation
                </div>
              </div>
            </div>

            <h1 className={styles.showcaseHeading}>
              Create a New Secure Password.
            </h1>
            <p className={styles.showcaseSub}>
              Ensure your agency cockpit remains protected with a strong, multi-character password.
            </p>

            <div className={styles.statPills}>
              <div className={styles.statPill}>
                <strong>Bcrypt</strong> Salted Hashing
              </div>
              <div className={styles.statPill}>
                <strong>256-Bit</strong> Session Security
              </div>
              <div className={styles.statPill}>
                <strong>100%</strong> Zero-Knowledge
              </div>
            </div>

            <div className={styles.testimonialBox}>
              <p className={styles.quoteText}>
                &ldquo;Account integrity and zero data leaks are essential when coordinating high-stakes luxury property transactions. AgentLadders sets the benchmark for real estate software security.&rdquo;
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
          <Link href="/" className={styles.mobileBrandHeader}>
            <div className={styles.mobileBrandLogo}>⬡</div>
            <div className={styles.mobileBrandText}>
              <span className={styles.mobileBrandName}>AgentLadders</span>
              <span className={styles.mobileBrandTag}>India Real Estate OS</span>
            </div>
          </Link>

          {!success ? (
            <>
              <div className={styles.formHeader}>
                <div className={styles.formTag}>
                  Credential Security
                </div>
                <h1 className={styles.formTitle}>Set new password</h1>
                <p className={styles.formSubtitle}>
                  Please choose a strong password of at least 8 characters for <strong style={{ color: '#0f172a' }}>{email || 'your account'}</strong>.
                </p>
              </div>

              {error && (
                <div className={styles.alertCard} style={{ marginBottom: 20 }}>
                  <div className={styles.alertIcon}>
                    <AlertCircleIcon size={20} color="#dc2626" />
                  </div>
                  <div className={styles.alertText}>
                    <div className={styles.alertTitle}>Password Reset Error</div>
                    <div className={styles.alertMessage}>{error}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 18, padding: 0 }}
                  >
                    &times;
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                {!tokenParam && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Reset Token</label>
                    <input
                      type="text"
                      placeholder="Paste your 64-character token..."
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      required
                      className={styles.inputField}
                    />
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label htmlFor="new-password" className={styles.fieldLabel}>
                    New Password (min. 8 characters) *
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <LockIcon size={17} color="#94a3b8" />
                    </span>
                    <input
                      id="new-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className={styles.inputField}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className={styles.passwordToggle}
                    >
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Password Strength:</span>
                        <strong style={{ color: pwStrength.color }}>{pwStrength.label}</strong>
                      </div>
                      <div style={{ height: 4, width: '100%', backgroundColor: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(pwStrength.score / 4) * 100}%`,
                          backgroundColor: pwStrength.color,
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="confirm-password" className={styles.fieldLabel}>
                    Confirm New Password *
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <LockIcon size={17} color="#94a3b8" />
                    </span>
                    <input
                      id="confirm-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={loading || !password || password.length < 8 || password !== confirmPassword}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span className={styles.spinner}></span> Updating Password...
                    </span>
                  ) : (
                    'Save New Password →'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
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
                Password Updated
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>
                Password Reset Successfully!
              </h2>

              <p style={{ color: '#475569', marginBottom: '24px', lineHeight: 1.6, fontSize: '14px' }}>
                Your password has been securely updated. You can now log into your agency cockpit using your new credentials.
              </p>

              <Link
                href="/login"
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
                Sign In to Dashboard →
              </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#ffffff' }}>
        Loading password recovery...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
