'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../login/auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call to send password reset
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.formPanel} style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: '24px' }}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader} style={{ textAlign: 'center' }}>
            <div className={styles.logoMark} style={{ margin: '0 auto 20px auto', width: 48, height: 48, fontSize: '1.2rem' }}>⬡</div>
            <h1>Reset your password</h1>
            <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="name@agency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading || !email}>
                {loading ? <span className={styles.spinner}></span> : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Check your email</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button onClick={() => setSubmitted(false)} className={styles.submitBtn} style={{ background: '#f1f5f9', color: '#1e293b' }}>
                Resend Email
              </button>
            </div>
          )}

          <div className={styles.footerText} style={{ marginTop: '40px' }}>
            Remembered your password? <Link href="/login" className={styles.linkAccent}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
