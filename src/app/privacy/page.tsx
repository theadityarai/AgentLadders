'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldIcon, 
  LockIcon, 
  CheckIcon, 
  PrinterIcon,
  FileTextIcon,
  UsersIcon,
  BuildingIcon,
  WhatsAppIcon
} from '@/components/icons/NavIcons';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const sections = [
    { id: 'overview', title: '1. Overview & DPDP Act (2023)' },
    { id: 'data-collected', title: '2. Information We Collect' },
    { id: 'usage-purpose', title: '3. How We Use Real Estate Data' },
    { id: 'fiduciary-role', title: '4. Data Fiduciary & Data Principal' },
    { id: 'whatsapp-data', title: '5. WhatsApp Cloud & Message Privacy' },
    { id: 'document-vault', title: '6. Document Vault & KYC Security' },
    { id: 'sharing-disclosure', title: '7. Information Sharing Disclosures' },
    { id: 'data-security', title: '8. 256-Bit Encryption & Storage' },
    { id: 'retention', title: '9. Data Retention & Erasure' },
    { id: 'principal-rights', title: '10. Your Rights Under Indian Law' },
    { id: 'cookies-session', title: '11. Cookies & Local Session Storage' },
    { id: 'policy-updates', title: '12. Updates to this Policy' },
    { id: 'grievance', title: '13. Statutory Grievance Redressal' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'var(--font-family, system-ui, -apple-system, sans-serif)' }}>
      {/* ── TOP NAVBAR ── */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
            }}>
              ⬡
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
                AgentLadders
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#059669', marginLeft: 8, padding: '2px 6px', backgroundColor: '#ecfdf5', borderRadius: 4, textTransform: 'uppercase' }}>
                Privacy Center
              </span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <PrinterIcon size={14} color="#64748b" /> Print Policy
            </button>
            <Link
              href="/terms"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#059669',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0'
              }}
            >
              Terms of Service →
            </Link>
            <Link
              href="/login"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: '#0f172a'
              }}
            >
              Agency Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section style={{
        background: 'linear-gradient(180deg, #090d16 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '56px 24px 48px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            color: '#34d399',
            marginBottom: 16
          }}>
            <LockIcon size={13} color="#34d399" /> Digital Personal Data Protection Act (DPDP 2023) Compliant
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 16, lineHeight: 1.2 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
            How AgentLadders protects, encrypts, and processes sensitive brokerage records, client identities, property title scans, and financial transaction data.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12.5, color: '#cbd5e1' }}>
            <span><strong>Status:</strong> Active &amp; Enforced</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> October 2026</span>
            <span>•</span>
            <span><strong>Data Hosting:</strong> AWS Mumbai Region (ap-south-1)</span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER WITH TOC SIDEBAR ── */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 40, alignItems: 'start' }}>
          
          {/* Main Legal Clauses Content */}
          <article style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '40px 48px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            lineHeight: 1.75,
            fontSize: '14.5px',
            color: '#334155'
          }}>
            
            {/* Guarantee Callout Box */}
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: 10,
              padding: '18px 22px',
              marginBottom: 36
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldIcon size={16} color="#059669" /> Our Zero-Leakage Privacy Pledge
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: '#047857', lineHeight: 1.6 }}>
                <strong>We will NEVER sell your leads, client databases, property listings, or deal transaction numbers.</strong> Your HNW buyer inquiries and proprietary owner connections belong solely to your brokerage. We operate strictly as an encrypted Data Processor under Indian law.
              </p>
            </div>

            {/* Section 1 */}
            <section id="overview" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                1. Overview &amp; DPDP Act (2023)
              </h2>
              <p>
                AgentLadders Technologies Private Limited (&quot;AgentLadders&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to upholding the highest standards of data security, confidentiality, and statutory compliance. This Privacy Policy outlines our practices regarding the collection, processing, storage, and protection of personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>, and applicable telecom regulations in India.
              </p>
              <p>
                This policy applies to all users of AgentLadders services, including agency owners, licensed brokers, sales channel partners, and administrative staff who access our web application, mobile interfaces, and APIs.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collected" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                2. Information We Collect
              </h2>
              <p>
                To provide enterprise real estate CRM functionality, we collect the following categories of information:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>Agency &amp; Broker Account Data:</strong> Agency name, official business address, contact numbers, official GSTIN, state RERA registration numbers, user email addresses, bcrypt-hashed passwords, and profile photographs.</li>
                <li><strong>Client &amp; Lead Inquiries:</strong> Prospective buyer/tenant names, phone numbers (for WhatsApp pitch dispatch and phone calls), preferred property types (BHK, carpet area), budget ranges, and inbound channel sources (Direct, 99acres, MagicBricks, Housing.com, WhatsApp Referral).</li>
                <li><strong>Property Inventory &amp; Spec Data:</strong> Project title, unit number, wing, locality, city, carpet area (SqFt), asking price, furnishing specs, construction stage, possession date, Vastu facing orientation, and property photographs/videos.</li>
                <li><strong>Document Vault Uploads:</strong> Digital scans of title deeds, 7/12 extracts, Index II, Occupancy Certificates (OC), leave and license agreements, token advance receipts, and client KYC identity proofs (PAN card, Aadhaar card masked).</li>
                <li><strong>Transaction &amp; Invoice Data:</strong> Deal pipeline stages, agreed consideration amounts, projected close dates, brokerage fee percentages, payment modes (NEFT/RTGS, UPI, Cheque), and GST invoices generated.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="usage-purpose" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                3. How We Use Real Estate Data
              </h2>
              <p>
                We use collected information solely for legitimate commercial purposes directly related to operating your brokerage cockpit:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>Automated AI Buyer Matching:</strong> Computing mathematical compatibility between active buyer preferences (budget, BHK, locality, Vastu) and available property inventory within your agency database.</li>
                <li><strong>1-Click WhatsApp Pitch Generation:</strong> Formatting standardized, clean property descriptions with verified Carpet Area metrics and RERA numbers for instant sharing with qualified buyers.</li>
                <li><strong>Site Visit Scheduling &amp; Gate Passes:</strong> Generating showing schedules, buyer tour itineraries, and coordination notes with property keys custodians.</li>
                <li><strong>Statutory GST Invoicing:</strong> Generating tax-compliant PDF invoices under SAC code 997222 with CGST/SGST/IGST breakdown and Indian currency word conversion.</li>
                <li><strong>Security &amp; Audit Trail:</strong> Logging user activities (e.g. lead deletion, price modifications, document downloads) in the Agency Audit Log to protect against rogue internal staff actions.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="fiduciary-role" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                4. Data Fiduciary &amp; Data Principal Relationships
              </h2>
              <p>
                Under Section 2(i) of the DPDP Act 2023:
              </p>
              <p>
                <strong>The Brokerage Firm is the &quot;Data Fiduciary&quot;</strong> in respect of the client leads, property owners, and buyers whose contact details are entered into the platform. You are responsible for ensuring lawful basis and prior commercial consent before contacting clients.
              </p>
              <p>
                <strong>AgentLadders acts as the &quot;Data Processor&quot;</strong>, processing client and transaction data strictly upon your agency&apos;s digital instructions. We do not independently communicate with, solicit, or market to your clients.
              </p>
            </section>

            {/* Section 5 */}
            <section id="whatsapp-data" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                5. WhatsApp Cloud &amp; Message Privacy
              </h2>
              <p>
                When using AgentLadders WhatsApp integration buttons:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li>Direct WhatsApp web URLs (`https://wa.me/`) launch communication directly between your agent&apos;s device and the client. Message content travels directly over WhatsApp&apos;s end-to-end encrypted protocol.</li>
                <li>AgentLadders does not eavesdrop on, intercept, or record private voice calls or continuous WhatsApp chat histories between brokers and clients.</li>
                <li>Phone numbers are validated using Google `libphonenumber` rules to ensure strict 10-digit Indian mobile format standards, preventing erroneous transmission.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="document-vault" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                6. Document Vault &amp; KYC Security
              </h2>
              <p>
                Documents uploaded to the Document Vault (including PAN scans, Aadhaar copies, 7/12 extracts, and Sale MOUs) are stored with strict encryption. Public preview links for floorplans or brochures are protected by cryptographically unguessable secure tokens (`/d/[token]`), ensuring that private legal documents cannot be indexed by search engines or accessed without authorized agency credentials.
              </p>
            </section>

            {/* Section 7 */}
            <section id="sharing-disclosure" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                7. Information Sharing Disclosures
              </h2>
              <p>
                We do not sell, rent, or trade your data. We disclose information only under the following limited circumstances:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>Cloud Infrastructure Providers:</strong> Highly reputable SOC2 / ISO-27001 certified cloud hosting providers (e.g. AWS Mumbai, Vercel) that operate our secure server infrastructure under strict data processing agreements.</li>
                <li><strong>Transactional Email / SMS Gateways:</strong> Service providers utilized strictly to deliver password reset tokens, two-factor OTPs, and agency invoice notification emails.</li>
                <li><strong>Legal &amp; Regulatory Mandate:</strong> When required by an official court order, law enforcement summons, or statutory regulatory notice issued under Indian law.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="data-security" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                8. 256-Bit Encryption &amp; Storage
              </h2>
              <p>
                AgentLadders enforces state-of-the-art security measures across the application:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>In-Transit Security:</strong> 100% of network traffic is encrypted using Transport Layer Security (TLS 1.3 / SSL 256-bit).</li>
                <li><strong>At-Rest Encryption:</strong> Storage volumes, databases, and document repositories are encrypted using AES-256 standard encryption.</li>
                <li><strong>Credential Hashing:</strong> Passwords are never stored in plaintext; they are salted and hashed using bcrypt (10 rounds).</li>
                <li><strong>Session &amp; 2FA Protection:</strong> Support for Time-based One-Time Passwords (TOTP via Google Authenticator) and remote session revocation to kill active logins across lost devices.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="retention" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                9. Data Retention &amp; Erasure
              </h2>
              <p>
                We retain your account data for as long as your agency maintains an active subscription.
              </p>
              <p>
                Under the Indian GST Act and Companies Act, records of issued tax invoices must be retained for a statutory period of <strong>8 (eight) financial years</strong>. Aside from statutory accounting obligations, you may request permanent erasure of your agency client records or terminate your account at any time by contacting our Data Protection Officer.
              </p>
            </section>

            {/* Section 10 */}
            <section id="principal-rights" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                10. Your Rights Under Indian Law (DPDP 2023)
              </h2>
              <p>
                As a Data Principal under the DPDP Act 2023, you enjoy statutory rights including:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>Right to Access Information:</strong> The right to obtain a summary of personal data being processed and the identities of third parties with whom data has been shared.</li>
                <li><strong>Right to Correction &amp; Erasure:</strong> The right to update inaccurate contact details or request deletion of data that is no longer necessary.</li>
                <li><strong>Right of Grievance Redressal:</strong> The right to have data protection complaints resolved within designated statutory timeframes.</li>
                <li><strong>Right to Nominate:</strong> The right to nominate an individual to exercise your data rights in the event of death or incapacity.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="cookies-session" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                11. Cookies &amp; Local Session Storage
              </h2>
              <p>
                AgentLadders uses secure, HTTP-only session cookies and browser LocalStorage strictly for functional purposes:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li>NextAuth JWT tokens for authenticating broker cockpit access.</li>
                <li>Device ID tags for monitoring multi-device sessions and unauthorized logins.</li>
                <li>User interface preferences (Dark/Light mode, sidebar collapse state, and table pagination sizing).</li>
              </ul>
              <p>
                We do NOT deploy invasive third-party cross-site advertising trackers or sell your browsing history to third-party ad networks.
              </p>
            </section>

            {/* Section 12 */}
            <section id="policy-updates" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                12. Updates to this Policy
              </h2>
              <p>
                We may revise this Privacy Policy periodically to reflect technological improvements, statutory notifications from the Data Protection Board of India, or amendments to real estate regulations. Material changes will be communicated via in-app dashboard notification and by updating the &quot;Last Updated&quot; date at the top of this document.
              </p>
            </section>

            {/* Section 13 */}
            <section id="grievance" style={{ scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                13. Statutory Grievance Redressal
              </h2>
              <p>
                If you have questions, concerns, or grievances regarding the processing of your data, or wish to exercise your rights under the DPDP Act 2023, please contact our designated Grievance Officer:
              </p>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '20px 24px',
                marginTop: 16
              }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>
                  Aditya Rai (Designated Data Protection &amp; Grievance Officer)
                </div>
                <div style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.6 }}>
                  AgentLadders Technologies Private Limited<br />
                  Level 14, Tower B, Peninsula Business Park, Lower Parel West,<br />
                  Mumbai, Maharashtra 400013, India<br />
                  <strong>Privacy &amp; DPDP Inquiries:</strong> privacy@agentladders.com | dpo@agentladders.com<br />
                  <strong>Statutory Grievance SLA:</strong> Written acknowledgment within 24 hours, resolution within 15 working days.
                </div>
              </div>
            </section>

          </article>

          {/* Sticky Table of Contents Sidebar */}
          <aside style={{ position: 'sticky', top: 96 }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: '24px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Privacy Clauses
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sections.map(s => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        padding: '6px 8px',
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#059669' : '#475569',
                        backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s.title}
                    </button>
                  );
                })}
              </nav>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  Questions about your data or client records?
                </div>
                <Link
                  href="/dashboard/support"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: 12.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <ShieldIcon size={14} color="#ffffff" /> Contact Privacy Officer
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '36px 24px', borderTop: '1px solid #1e293b', fontSize: 13 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            © 2026 AgentLadders Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
            <Link href="/privacy" style={{ color: '#34d399', textDecoration: 'underline' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Help &amp; Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
