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
      router.push('/dashboard');
    }
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
              &ldquo;AgentLadders replaced 5 separate tools for our agency. Deal flow visibility is unmatched.&rdquo;
            </p>
            <span className={styles.author}>— Marcus Vance, Principal Broker at Vance Real Estate</span>
            <div className={styles.statPills}>
              <div className={styles.statPill}><strong>12K+</strong> Leads Managed</div>
              <div className={styles.statPill}><strong>$48M</strong> Deals Closed</div>
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
