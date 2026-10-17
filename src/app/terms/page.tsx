'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldIcon, 
  FileTextIcon, 
  CheckIcon, 
  ArrowRightIcon, 
  ExternalLinkIcon,
  BuildingIcon,
  PrinterIcon,
  LockIcon,
  ClockIcon
} from '@/components/icons/NavIcons';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

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
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. Eligibility & Agency Accounts' },
    { id: 'rera-compliance', title: '3. RERA & Indian Regulatory Compliance' },
    { id: 'platform-use', title: '4. Cockpit License & Permitted Use' },
    { id: 'listing-accuracy', title: '5. Listing Accuracy & Carpet Area' },
    { id: 'whatsapp-policy', title: '6. WhatsApp Cloud & Anti-Spam Policy' },
    { id: 'confidentiality', title: '7. HNW Client & Escrow Confidentiality' },
    { id: 'invoicing-gst', title: '8. Brokerage Invoicing & 18% GST' },
    { id: 'subscription', title: '9. Subscriptions, Fees & Billing' },
    { id: 'ip-rights', title: '10. Intellectual Property Rights' },
    { id: 'disclaimers', title: '11. Warranty Disclaimers & Transactions' },
    { id: 'liability', title: '12. Limitation of Liability' },
    { id: 'dispute', title: '13. Governing Law & Dispute Resolution' },
    { id: 'grievance', title: '14. Grievance Officer & Contact' },
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
                Legal Center
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
              <PrinterIcon size={14} color="#64748b" /> Print Terms
            </button>
            <Link
              href="/privacy"
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
              Privacy Policy →
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
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
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
            <ShieldIcon size={13} color="#34d399" /> RERA &amp; Indian Contract Act (1872) Compliant
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 16, lineHeight: 1.2 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
            Standard commercial agreement governing use of the AgentLadders India Real Estate Broker CRM, Inbound Inquiry Engine, and Agency Operations Platform.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12.5, color: '#cbd5e1' }}>
            <span><strong>Version:</strong> 2.4 (Enterprise)</span>
            <span>•</span>
            <span><strong>Effective Date:</strong> October 1, 2026</span>
            <span>•</span>
            <span><strong>Jurisdiction:</strong> Mumbai / Maharashtra, India</span>
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
            
            {/* Quick Summary Alert Box */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 10,
              padding: '18px 22px',
              marginBottom: 36
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📋</span> Plain English Summary for Brokerage Owners
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: '#14532d', lineHeight: 1.6 }}>
                AgentLadders is a cloud-based CRM software designed specifically for licensed Indian real estate brokers, channel partner firms, and property advisors. We provide tools for lead tracking, inventory management, automated WhatsApp pitches, GST invoicing, and deal pipelines. You retain 100% ownership of your clients and listings. We do not act as a buyer, seller, or legal escrow guarantor for your property deals.
              </p>
            </div>

            {/* Section 1 */}
            <section id="acceptance" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By signing up, creating an account, accessing, or using the AgentLadders platform (accessible via web, mobile, and APIs, operated by <strong>AgentLadders Technologies Private Limited</strong>, hereinafter &quot;AgentLadders&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you (&quot;Subscriber&quot;, &quot;Agency Owner&quot;, &quot;Broker&quot;, or &quot;User&quot;) agree to be legally bound by these Terms of Service (&quot;Terms&quot;), our Privacy Policy, and any supplemental guidelines published on our platform.
              </p>
              <p>
                If you are registering an account on behalf of a real estate brokerage firm, proprietary concern, LLP, or private limited company, you represent and warrant that you possess full corporate and statutory authority to bind that entity to these Terms. If you do not agree to these Terms, you must immediately cease accessing or using the platform.
              </p>
            </section>

            {/* Section 2 */}
            <section id="eligibility" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                2. Eligibility &amp; Agency Accounts
              </h2>
              <p>
                To utilize the services provided by AgentLadders, you must:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li>Be at least 18 years of age and legally competent to enter into a binding contract under the <strong>Indian Contract Act, 1872</strong>.</li>
                <li>Operate as a genuine real estate brokerage, channel partner, developer sales mandate, or property advisory professional in India or international corridors.</li>
                <li>Maintain accurate, true, and up-to-date business credentials, including legal business name, registered office address, official GSTIN, and state Real Estate Regulatory Authority (RERA) registration numbers where applicable.</li>
                <li>Safeguard account credentials, password hashes, and two-factor authentication (2FA) recovery codes. You are strictly responsible for all activities and deal transactions conducted under your agency cockpit seats.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="rera-compliance" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                3. RERA &amp; Indian Regulatory Compliance
              </h2>
              <p>
                As an enterprise platform engineered specifically for Indian real estate, compliance with the <strong>Real Estate (Regulation and Development) Act, 2016 (RERA)</strong> and respective State Real Estate Regulatory Authorities (including MahaRERA, HRERA, UP RERA, Karnataka RERA, and TNRERA) is of paramount importance:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>Broker Registration Representation:</strong> Real estate brokers marketing registered projects must hold an active RERA Real Estate Agent Registration number and input this number into their AgentLadders agency settings.</li>
                <li><strong>Mandatory RERA Project Number:</strong> Whenever sharing project flyers, automated WhatsApp pitches, or public microsite links generated via AgentLadders for under-construction or newly launched projects, the official RERA registration number and official authority portal link must be clearly displayed.</li>
                <li><strong>No Deceptive Advertisements:</strong> Subscribers agree not to publish false promises, unauthorized super built-up area claims, or misrepresent completion deadlines or approval sanctions granted by municipal corporations (such as BMC, BBMP, DTCP, or DDA).</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="platform-use" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                4. Cockpit License &amp; Permitted Use
              </h2>
              <p>
                AgentLadders grants you a non-exclusive, non-transferable, revocable license to access the platform in accordance with your subscribed plan. You agree NOT to:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li>Scrape, reverse-engineer, decompile, or extract the underlying code, database schemas, or algorithms of the buyer-property match engine.</li>
                <li>Share individual agent login seats across multiple unauthorized field brokers outside your registered agency domain.</li>
                <li>Use the platform to distribute unsolicited commercial communications (spam) violating national Do-Not-Disturb (DND) telecom standards.</li>
                <li>Upload fraudulent title deeds, forged No-Objection Certificates (NOC), or counterfeit identity records into the Document Vault.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="listing-accuracy" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                5. Listing Accuracy &amp; Carpet Area Standards
              </h2>
              <p>
                Under Section 4(2) of RERA, real estate transactions in India must strictly quote and execute on <strong>Carpet Area</strong> (the net usable floor area of an apartment excluding the area covered by external walls, areas under service shafts, exclusive balcony, or verandah).
              </p>
              <p>
                Subscribers using the Property Inventory Module agree that all property listings uploaded to AgentLadders will accurately specify the certified Carpet Area in square feet or square meters. While loading factors and super built-up estimations may be calculated for commercial comparisons, the statutory Carpet Area must always be made available to prospective buyers.
              </p>
            </section>

            {/* Section 6 */}
            <section id="whatsapp-policy" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                6. WhatsApp Cloud &amp; Anti-Spam Policy
              </h2>
              <p>
                The instant WhatsApp pitch generator, site visit coordination links, and client inquiry sharing features utilize standard web protocol endpoints and official WhatsApp Business Cloud mechanisms. You agree to adhere to:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li><strong>Meta Business &amp; WhatsApp Commercial Policies:</strong> Communications must strictly be sent to existing inquiries, qualified leads, or clients who have given prior commercial consent to be contacted.</li>
                <li><strong>TRAI Telecom Commercial Communications Customer Preference Regulations (TCCCPR):</strong> Brokers must respect national Do Not Call / DND registries. Unsolicited blast messaging to scraped databases is strictly prohibited and constitutes grounds for immediate agency account termination.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="confidentiality" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                7. HNW Client &amp; Escrow Confidentiality
              </h2>
              <p>
                AgentLadders recognizes that high-net-worth (HNW) client identities, owner phone numbers, survey numbers, and escrow transaction values represent the core proprietary value of your brokerage.
              </p>
              <p>
                <strong>We guarantee that AgentLadders will never sell, lease, commercialize, or share your proprietary client records, deal stages, or owner databases with rival brokerages, financial institutions, or third-party marketers.</strong> All data stored in your agency cockpit remains encrypted and protected under strict multi-tenant isolation.
              </p>
            </section>

            {/* Section 8 */}
            <section id="invoicing-gst" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                8. Brokerage Invoicing &amp; 18% GST Compliance
              </h2>
              <p>
                The GST Invoicing Module allows generating tax invoices under Service Accounting Code (SAC) <strong>997222</strong> (Real estate brokerage and agency services). When issuing invoices through the platform:
              </p>
              <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
                <li>The Subscriber is solely responsible for determining whether their annual aggregate turnover exceeds the statutory ₹20 Lakhs / ₹10 Lakhs threshold requiring mandatory GST registration under the <strong>Central Goods and Services Tax Act, 2017</strong>.</li>
                <li>Invoices generated will reflect either 18% IGST (Inter-state transactions) or 9% CGST + 9% SGST (Intra-state transactions) based on the place of supply configured by the user.</li>
                <li>AgentLadders provides automated calculation templates but does not provide formal chartered accountant certification or legal tax filing on your behalf.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="subscription" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                9. Subscriptions, Fees &amp; Billing
              </h2>
              <p>
                Access to premium cockpit tiers (Standard, Growth, Enterprise Mandate) is billed in advance on a monthly or annual cadence. All fees are quoted in Indian Rupees (INR) or designated local billing currencies and are exclusive of applicable taxes unless stated otherwise.
              </p>
              <p>
                Subscriptions may be cancelled at any time from your <em>Settings &gt; Subscription &amp; Billing</em> panel. Upon cancellation, your cockpit access will remain operational through the end of the current pre-paid billing cycle, after which your account will transition to read-only archival status.
              </p>
            </section>

            {/* Section 10 */}
            <section id="ip-rights" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                10. Intellectual Property Rights
              </h2>
              <p>
                The platform software, UI design systems, branding, algorithms, logos, domain names, and downloadable legal contract models are the exclusive intellectual property of AgentLadders Technologies Private Limited.
              </p>
              <p>
                You retain complete ownership of all property images, floorplans, client records, and agency branding uploaded by you. By uploading content, you grant AgentLadders a limited license solely to host, process, format, and display your assets as necessary to operate the platform for your agency.
              </p>
            </section>

            {/* Section 11 */}
            <section id="disclaimers" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                11. Warranty Disclaimers &amp; Real Estate Transactions
              </h2>
              <p>
                THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              </p>
              <p>
                <strong>AgentLadders is a software technology provider and is NOT a real estate broker, lender, developer, title guarantor, or legal escrow agent.</strong> We do not inspect real estate properties, verify legal title ownership at sub-registrar offices, conduct 7/12 extract title scrutiny, or guarantee that any lead or buyer introduced through your listings will execute a final sale deed or pay earnest money tokens. You are solely responsible for conducting physical site inspections, due diligence, and statutory legal checks.
              </p>
            </section>

            {/* Section 12 */}
            <section id="liability" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                12. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable Indian law, in no event shall AgentLadders, its directors, employees, or affiliates be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including but not limited to loss of profits, brokerage commissions, goodwill, or deal terminations resulting from platform downtime, telecom WhatsApp gateway delays, or unauthorized account access.
              </p>
              <p>
                Our aggregate liability for any claims arising out of or relating to these Terms shall not exceed the total subscription fees paid by you to AgentLadders in the preceding twelve (12) months.
              </p>
            </section>

            {/* Section 13 */}
            <section id="dispute" style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                13. Governing Law &amp; Dispute Resolution
              </h2>
              <p>
                These Terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>India</strong>, without regard to conflict of law principles.
              </p>
              <p>
                Any dispute, controversy, or claim arising out of or relating to this agreement shall first be submitted to good-faith mutual mediation. If unresolved within 30 days, it shall be settled by binding arbitration in accordance with the <strong>Arbitration and Conciliation Act, 1996</strong> by a sole arbitrator mutually appointed by the parties. The seat and venue of arbitration shall be <strong>Mumbai, Maharashtra, India</strong>, and the proceedings shall be conducted in English.
              </p>
            </section>

            {/* Section 14 */}
            <section id="grievance" style={{ scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: 10, marginBottom: 16 }}>
                14. Grievance Officer &amp; Legal Notices
              </h2>
              <p>
                In accordance with the <strong>Information Technology Act, 2000</strong> and the <strong>Digital Personal Data Protection Act, 2023</strong>, the details of the designated Grievance Officer for legal inquiries, compliance reports, and notices are as follows:
              </p>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '20px 24px',
                marginTop: 16
              }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>
                  Aditya Rai (Designated Grievance &amp; Compliance Officer)
                </div>
                <div style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.6 }}>
                  AgentLadders Technologies Private Limited<br />
                  Level 14, Tower B, Peninsula Business Park, Lower Parel West,<br />
                  Mumbai, Maharashtra 400013, India<br />
                  <strong>Official Legal Email:</strong> legal@agentladders.com | compliance@agentladders.com<br />
                  <strong>Statutory Response SLA:</strong> Within 48 business hours
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
                On This Page
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
                  Need legal drafting help or customized brokerage mandates?
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
                  <FileTextIcon size={14} color="#ffffff" /> Open Legal Templates
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
            <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: '#34d399', textDecoration: 'underline' }}>Terms of Service</Link>
            <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Help &amp; Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
