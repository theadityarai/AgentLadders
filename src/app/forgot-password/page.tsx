'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../login/auth.module.css';
import { FileTextIcon } from '@/components/icons/NavIcons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Mock API call to send password reset
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className={styles.authPage} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className={styles.formPanel} style={{ maxWidth: '480px', width: '100%', margin: '0 auto', background: 'transparent', boxShadow: 'none' }}>
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
              <div className={styles.formHeader} style={{ textAlign: 'center' }}>
                <div className={styles.logoMark} style={{ margin: '0 auto 16px auto', width: 48, height: 48, fontSize: '1.3rem' }}>⬡</div>
                <h1 className={styles.formTitle}>Reset your password</h1>
                <p className={styles.formSubtitle}>
                  Enter your registered work email and we&apos;ll send you instructions to recover your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reset-email" className={styles.fieldLabel}>
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
                      id="reset-email"
                      type="email"
                      placeholder="name@agency.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
                  {loading ? <span className={styles.spinner}></span> : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '2px solid #a7f3d0'
              }}>
                <FileTextIcon size={32} color="#059669" />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Check your email</h2>
              <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: 1.5, fontSize: '14px' }}>
                We have dispatched a password reset link to <strong style={{ color: '#0f172a' }}>{email}</strong>. Please check your inbox or spam folder.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className={styles.submitBtn}
                  style={{ background: '#f1f5f9', color: '#1e293b', boxShadow: 'none' }}
                >
                  Resend Email
                </button>
                <Link
                  href="/login"
                  className={styles.submitBtn}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
