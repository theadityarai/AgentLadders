'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const callbackUrl = searchParams?.get('callbackUrl');
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (email.toLowerCase().includes('aditya@agentladders.com') || email.toLowerCase().includes('admin@agentladders.com')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const fillSuperAdmin = () => {
    setEmail('aditya@agentladders.com');
    setPassword('admin123');
  };

  const fillAgencyAdmin = () => {
    setEmail('marcus@vancerealty.com');
    setPassword('admin123');
  };

  return (
    <div className={styles.authPage}>
      {/* LEFT — Image panel */}
      <div className={styles.imagePanel}>
        <div className={styles.imagePanelContent}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>⬡</div>
            <span className={styles.logoText}>AgentLadders</span>
          </div>
          <Image
            src="/images/property_hero.jpg"
            alt="Luxury property"
            width={600}
            height={700}
            className={styles.heroImage}
            priority
          />
          <div className={styles.testimonial}>
            <p className={styles.quote}>
              &ldquo;AgentLadders transformed our brokerage workflow. Instant buyer matching and 1-click WhatsApp site visits have made closing high-ticket deals seamless.&rdquo;
            </p>
            <span className={styles.author}>— Rajesh Singhania, Managing Director at Apex Luxury Realty, Mumbai</span>
            <div className={styles.statPills}>
              <div className={styles.statPill}><strong>15,000+</strong> Active Buyers</div>
              <div className={styles.statPill}><strong>₹450+ Cr</strong> Deals Closed</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Welcome back</h1>
            <p>Enter your credentials to access your dashboard.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={fillSuperAdmin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>🛡️</span> Fill Super Admin (aditya@agentladders.com)
              </button>

              <button
                type="button"
                onClick={fillAgencyAdmin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>🏢</span> Fill Agency Admin (marcus@vancerealty.com)
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="name@agency.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="login-password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className={styles.checkbox} />
                Remember me
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : 'Sign In'}
            </button>


          </form>

          <div className={styles.footerText}>
            Don&apos;t have an account? <Link href="/signup" className={styles.linkAccent}>Start Free Trial</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
