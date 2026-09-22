'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 60px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
            AL
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>AgentLadders</span>
        </div>
        
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'var(--transition)' }}>Features</a>
          <a href="#testimonials" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'var(--transition)' }}>Testimonials</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'var(--transition)' }}>Pricing</a>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Start Free Trial</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '120px 24px 80px', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
            🚀 The #1 CRM for Independent Brokers
          </div>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-2px'
          }}>
            Close more deals without the <span style={{ color: 'var(--primary-color)' }}>operational chaos.</span>
          </h1>
          <p style={{ fontSize: '22px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
            Unify your property inventory, lead pipelines, client communications, and brokerage financials into one single, powerful operating system.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" style={{ fontSize: '18px', padding: '16px 32px' }}>Start 14-Day Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg" style={{ fontSize: '18px', padding: '16px 32px' }}>Book a Demo</Button>
          </div>
        </div>

        {/* Hero Image */}
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 10
        }}>
          <img src="/images/hero_dashboard_1789986182849.jpg" alt="AgentLadders Dashboard" style={{ width: '100%', display: 'block' }} />
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '60px 24px', backgroundColor: 'var(--text-primary)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px', fontWeight: 600 }}>Trusted by elite brokerages worldwide</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap', opacity: 0.7 }}>
          <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 300 }}>AURORA REALTY</h3>
          <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 700, fontStyle: 'italic' }}>Vanguard Estates</h3>
          <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>NEXUS</h3>
          <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 400, letterSpacing: '0.2em' }}>OAK & STONE</h3>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '120px 24px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Feature 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '80px', marginBottom: '120px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.2, letterSpacing: '-1px' }}>Total mastery over your property inventory.</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Manage thousands of residential and commercial listings. Attach high-res media, track availability, and share public property links directly with clients via WhatsApp in one click.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Unlimited property listings', 'Rich media & video support', 'One-click client sharing'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 500 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' }}>✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="/images/property_hero_1789987270099.jpg" alt="Property Management" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>

          {/* Feature 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexDirection: 'row-reverse' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.2, letterSpacing: '-1px' }}>Close deals faster with automated pipelines.</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Never drop the ball on a lead again. Track every conversation, schedule site visits, set follow-up tasks, and move deals through a visual pipeline until the commission is in your bank.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Visual deal tracking', 'Automated task reminders', 'Full client history timeline'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 500 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' }}>✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="/images/deal_closing_1789987288956.jpg" alt="Deal Pipeline" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>

        </div>
      </section>

      {/* Testimonial */}
      <section id="testimonials" style={{ padding: '120px 24px', backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '24px' }}>"</div>
          <h2 style={{ fontSize: '32px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '40px' }}>
            Since moving our agency to AgentLadders, our deal closing velocity has increased by 40%. We finally have our properties, agents, and financials working together in one beautiful system.
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <img src="/images/avatar_agent_1789986214571.jpg" alt="Sarah Mitchell" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Sarah Mitchell</p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Founder, Vanguard Estates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" style={{ padding: '120px 24px', backgroundColor: 'var(--background-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>Simple, transparent pricing.</h2>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>Start for free, upgrade when you need to grow your team.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            
            {/* Starter */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Solo Broker</h3>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', height: '48px' }}>Perfect for independent agents starting out.</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)' }}>$29</span>
                <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mo</span>
              </div>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="outline" style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '32px' }}>Start Free Trial</Button>
              </Link>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['1 User Account', '500 Properties', 'Basic Pipeline', 'Standard Support'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div style={{ color: 'var(--primary-color)' }}>✓</div> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '2px solid var(--primary-color)', boxShadow: 'var(--shadow-lg)', position: 'relative', transform: 'scale(1.05)', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary-color)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 700 }}>
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Agency Pro</h3>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', height: '48px' }}>For growing teams that need collaboration.</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)' }}>$99</span>
                <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/mo</span>
              </div>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="primary" style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '32px' }}>Start Free Trial</Button>
              </Link>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Up to 10 Users', 'Unlimited Properties', 'Advanced Analytics', 'Invoicing & Accounting', 'Priority Support'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 500 }}>
                    <div style={{ color: 'var(--primary-color)' }}>✓</div> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Enterprise</h3>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', height: '48px' }}>Custom limits for massive brokerages.</p>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)' }}>Custom</span>
              </div>
              <Button variant="outline" style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '32px' }}>Contact Sales</Button>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Unlimited Users', 'API Access & Webhooks', 'Custom Data Migration', 'Dedicated Success Manager'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div style={{ color: 'var(--primary-color)' }}>✓</div> {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'white', padding: '80px 60px 40px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px', maxWidth: '1200px', margin: '0 auto 60px' }}>
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                AL
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>AgentLadders</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
              The modern operating system for elite real estate brokerages and ambitious independent agents.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '80px' }}>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Features</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Pricing</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Security</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>About Us</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Careers</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Blog</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>© 2026 AgentLadders Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
