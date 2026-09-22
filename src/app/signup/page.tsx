'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '../login/auth.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ agency: '', name: '', email: '', phone: '', password: '', country: 'United States', currency: 'USD' });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.imagePanel}>
        <div className={styles.imagePanelContent}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>⬡</div>
            <span className={styles.logoText}>AgentLadders</span>
          </div>
          <Image
            src="/images/hero_broker.jpg"
            alt="Real estate professional"
            width={600}
            height={700}
            className={styles.heroImage}
            priority
          />
          <div className={styles.testimonial}>
            <p className={styles.quote}>
              &ldquo;AgentLadders transformed how our 24 agents operate. Our lead-to-close cycle dropped by 38%.&rdquo;
            </p>
            <span className={styles.author}>— Priya Sharma, Managing Director at Skyline Properties</span>
            <div className={styles.statPills}>
              <div className={styles.statPill}><strong>245+</strong> Agencies</div>
              <div className={styles.statPill}><strong>99.9%</strong> Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Create your account</h1>
            <p>Set up your agency and start managing deals in minutes.</p>
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
              <label htmlFor="signup-agency">Agency Name</label>
              <input id="signup-agency" type="text" placeholder="NextGen Realty" value={form.agency} onChange={e => update('agency', e.target.value)} required className={styles.input} />
            </div>

            <div className={styles.twoCol}>
              <div className={styles.inputGroup}>
                <label htmlFor="signup-name">Full Name</label>
                <input id="signup-name" type="text" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} required className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="signup-phone">Phone</label>
                <input id="signup-phone" type="tel" placeholder="+1 555 123 4567" value={form.phone} onChange={e => update('phone', e.target.value)} className={styles.input} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-email">Work Email</label>
              <input id="signup-email" type="email" placeholder="john@nextgen.com" value={form.email} onChange={e => update('email', e.target.value)} required className={styles.input} />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} className={styles.input} />
            </div>

            <div className={styles.twoCol}>
              <div className={styles.inputGroup}>
                <label htmlFor="signup-country">Country</label>
                <select id="signup-country" value={form.country} onChange={e => update('country', e.target.value)} className={styles.selectInput}>
                  <option>United States</option>
                  <option>India</option>
                  <option>United Kingdom</option>
                  <option>UAE</option>
                  <option>Australia</option>
                  <option>Canada</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="signup-currency">Primary Currency</label>
                <select id="signup-currency" value={form.currency} onChange={e => update('currency', e.target.value)} className={styles.selectInput}>
                  <option>USD</option>
                  <option>INR</option>
                  <option>GBP</option>
                  <option>AED</option>
                  <option>AUD</option>
                  <option>CAD</option>
                </select>
              </div>
            </div>

            <label className={styles.termsLabel}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className={styles.checkbox} />
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>

            <button type="submit" className={styles.submitBtn} disabled={loading || !agree}>
              {loading ? <span className={styles.spinner}></span> : 'Create Account & Start Trial'}
            </button>


          </form>

          <div className={styles.footerText}>
            Already have an account? <Link href="/login" className={styles.linkAccent}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
