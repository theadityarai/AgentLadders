'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { openWhatsAppDirect, generateSiteVisitWhatsApp } from '@/lib/whatsapp-engine';

interface DashboardStats {
  totalInventoryValue: string;
  totalInventoryRaw: number;
  brokeragePipeline: string;
  brokeragePipelineRaw: number;
  activeProperties: string;
  readyBuyers: string;
  hotBuyersCount: string;
  todayVisitsCount: string;
  activeDealsCount: string;
}

interface VisitItem {
  id: string;
  property: string;
  client: string;
  clientPhone?: string;
  date: string;
  timeSlot?: string;
  slotTime?: string;
  locality?: string;
  status: string;
  notes?: string;
}

interface FollowUpItem {
  id: string;
  name: string;
  phone: string;
  bhkNeeded?: string;
  budget?: string;
  city?: string;
  priority?: string;
  status: string;
  requirement?: string;
  financingStatus?: string;
}

interface KundaliMatchItem {
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadBudget: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: string;
  propertyLocation: string;
  propertyBhk: string;
  matchScore: number;
  matchReasons: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryValue: '₹40.25 Cr',
    totalInventoryRaw: 402500000,
    brokeragePipeline: '₹57.55 Lakhs',
    brokeragePipelineRaw: 5755000,
    activeProperties: '5',
    readyBuyers: '5',
    hotBuyersCount: '3',
    todayVisitsCount: '2',
    activeDealsCount: '3'
  });

  const [todayVisits, setTodayVisits] = useState<VisitItem[]>([]);
  const [todayFollowUps, setTodayFollowUps] = useState<FollowUpItem[]>([]);
  const [kundaliMatches, setKundaliMatches] = useState<KundaliMatchItem[]>([]);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/dashboard-stats');
        const json = await res.json();
        if (json.stats) setStats(json.stats);
        if (json.todayVisits) setTodayVisits(json.todayVisits);
        if (json.todayFollowUps) setTodayFollowUps(json.todayFollowUps);
        if (json.kundaliMatches) setKundaliMatches(json.kundaliMatches);
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      }
    };
    loadStats();
  }, []);

  const handleSendMatchWhatsApp = (match: KundaliMatchItem) => {
    const pitch = `Namaste ${match.leadName} ji! 🙏\n\n` +
      `Based on your requirement for a *${match.propertyBhk}* in *${match.propertyLocation}*,\n` +
      `we have a high-priority verified listing that matches your search (*${match.matchScore}% Match Score*):\n\n` +
      `🏢 *${match.propertyTitle}*\n` +
      `💰 *Quoting Price*: ${match.propertyPrice}\n` +
      `📍 *Location*: ${match.propertyLocation}\n` +
      `🎯 *Key Highlights*: ${match.matchReasons.join(' · ')}\n\n` +
      `Would you like to schedule a private viewing today or this weekend? Let me know and I will send the key pass.\n\n` +
      `Best regards,\n*Aditya Rai | AgentLadders Advisory*`;

    openWhatsAppDirect(match.leadPhone, pitch);
    setCopiedPitchId(match.leadId);
    setTimeout(() => setCopiedPitchId(null), 3000);
  };

  const handleSendVisitReminderWhatsApp = (visit: VisitItem) => {
    const msg = generateSiteVisitWhatsApp({
      leadName: visit.client,
      propertyTitle: visit.property,
      propertyLocation: visit.locality || 'Prime Location',
      scheduledDate: 'Today',
      scheduledTime: visit.timeSlot || visit.slotTime || '11:30 AM',
      agentName: 'Aditya Rai',
      agentPhone: '+91 98200 12345'
    });

    openWhatsAppDirect(visit.clientPhone || '', msg);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <PageHeader 
        title="Broker Daily Habit Cockpit" 
        subtitle={`Operational intelligence for Indian real estate advisors · ${currentDateFormatted}`} 
        actions={
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/dashboard/leads" style={{ textDecoration: 'none' }}>
              <Button variant="outline">🎯 + New Inbound Lead</Button>
            </Link>
            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <Button variant="outline">🏢 + Add Property</Button>
            </Link>
            <Link href="/dashboard/site-visits" style={{ textDecoration: 'none' }}>
              <Button variant="primary">📍 + Schedule Visit</Button>
            </Link>
          </div>
        } 
      />

      {/* DAILY COCKPIT BANNER */}
      <div style={{ padding: '0 24px', marginTop: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: 'white',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🇮🇳</span>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                backgroundColor: 'rgba(255,255,255,0.12)', 
                padding: '4px 10px', 
                borderRadius: '20px' 
              }}>
                India Real Estate Operating System
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>·</span>
              <span style={{ fontSize: '12.5px', color: '#38bdf8', fontWeight: 600 }}>
                Mumbai · Delhi NCR · Bengaluru · Pune
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              Namaste, Aditya! Here is your daily closing queue.
            </h2>
            <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              You have <strong style={{ color: '#fde047' }}>{stats.todayVisitsCount} site showings</strong> scheduled today and <strong style={{ color: '#4ade80' }}>{kundaliMatches.length} high-intent buyers</strong> awaiting instant WhatsApp property brochures.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                Est. Brokerage Pipeline
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                {stats.brokeragePipeline}
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                Active Portfolio
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fde047', marginTop: '2px' }}>
                {stats.totalInventoryValue}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARDS IN ₹ CRORES & LAKHS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', padding: '20px 24px 0' }}>
        
        {/* Card 1: Inventory Valuation */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Active Inventory Valuation</span>
            <span style={{ fontSize: '20px' }}>🏢</span>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {stats.totalInventoryValue}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
            <span>✓ {stats.activeProperties} Verified Listings</span>
            <span style={{ color: '#94a3b8' }}>·</span>
            <Link href="/dashboard/properties" style={{ color: '#2563eb', textDecoration: 'none' }}>View All →</Link>
          </div>
        </div>

        {/* Card 2: Hot Inquiries */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Hot Buyers Waiting</span>
            <span style={{ fontSize: '20px' }}>🔥</span>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', margin: '8px 0 4px' }}>
            {stats.hotBuyersCount} Ready Buyers
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
            <span>{stats.readyBuyers} total qualified leads in CRM</span>
            <Link href="/dashboard/leads" style={{ color: '#2563eb', textDecoration: 'none', marginLeft: 'auto' }}>Pipeline →</Link>
          </div>
        </div>

        {/* Card 3: Today's Site Visits */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Today&apos;s Site Visits</span>
            <span style={{ fontSize: '20px' }}>📍</span>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', margin: '8px 0 4px' }}>
            {stats.todayVisitsCount} Showings
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
            <span>Worli & Golf Course Rd</span>
            <span style={{ color: '#94a3b8' }}>·</span>
            <Link href="/dashboard/site-visits" style={{ color: '#2563eb', textDecoration: 'none' }}>Calendar →</Link>
          </div>
        </div>

        {/* Card 4: Brokerage Pipeline */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Gross Brokerage Pipeline</span>
            <span style={{ fontSize: '20px' }}>💰</span>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#7c3aed', margin: '8px 0 4px' }}>
            {stats.brokeragePipeline}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
            <span>Across {stats.activeDealsCount} active deals</span>
            <Link href="/dashboard/deals" style={{ color: '#7c3aed', textDecoration: 'none', marginLeft: 'auto' }}>Deals →</Link>
          </div>
        </div>

      </div>

      {/* KUNDALI AUTO-MATCH ENGINE (INSTANT BUYER <-> PROPERTY FIT) */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #fed7aa',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ea580c, #f97316, #fbbf24)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>🔮</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Live Kundali Auto-Match Engine
                </h2>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 9px', 
                  borderRadius: '12px', 
                  backgroundColor: '#ffedd5', 
                  color: '#c2410c',
                  border: '1px solid #fed7aa'
                }}>
                  Instant Broker Habit
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Antigravity AI scans all your active buyer requirements against available property inventory in real-time.
              </p>
            </div>

            <div style={{ fontSize: '12px', color: '#9a3412', fontWeight: 600, backgroundColor: '#fff7ed', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
              ⚡ 1-Click WhatsApp Property Pitch to Ready Buyer
            </div>
          </div>

          {kundaliMatches.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              Add more buyer requirements and property inventory to generate instant automatic matches!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
              {kundaliMatches.map((m) => (
                <div 
                  key={`${m.leadId}-${m.propertyId}`}
                  style={{
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    {/* Top match score badge & buyer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px' }}>👤</span>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{m.leadName}</strong>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: m.matchScore >= 90 ? '#dcfce7' : '#fef9c3',
                        color: m.matchScore >= 90 ? '#15803d' : '#854d0e',
                        border: m.matchScore >= 90 ? '1px solid #bbf7d0' : '1px solid #fef08a'
                      }}>
                        {m.matchScore}% Match
                      </span>
                    </div>

                    {/* Buyer Budget vs Property Quoting */}
                    <div style={{ fontSize: '12px', color: '#57534e', marginBottom: '8px', lineHeight: 1.4 }}>
                      <div>Budget: <strong style={{ color: '#0f172a' }}>{m.leadBudget}</strong></div>
                      <div>Target: <span style={{ color: '#2563eb', fontWeight: 600 }}>{m.propertyBhk}</span> in {m.propertyLocation}</div>
                    </div>

                    {/* Matched Property Box */}
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        🏢 {m.propertyTitle}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb' }}>{m.propertyPrice}</span>
                        <span style={{ color: '#64748b' }}>📍 {m.propertyLocation}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {m.matchReasons.map((r, i) => (
                          <span key={i} style={{ fontSize: '10.5px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click WhatsApp Pitch Button */}
                  <button
                    onClick={() => handleSendMatchWhatsApp(m)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      backgroundColor: '#25d366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(37, 211, 102, 0.25)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#20ba5a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#25d366'; }}
                  >
                    <span>💬</span>
                    <span>{copiedPitchId === m.leadId ? '✓ Opening WhatsApp...' : 'Send WhatsApp Pitch to Buyer'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S SHOWINGS & DAILY FOLLOW-UPS (TWO COLUMNS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', padding: '24px' }}>
        
        {/* COLUMN 1: TODAY'S SITE VISITS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Today&apos;s Site Showings ({todayVisits.length})
              </h3>
            </div>
            <Link href="/dashboard/site-visits" style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              + Schedule Visit
            </Link>
          </div>

          {todayVisits.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No site visits scheduled for today yet. Use the Schedule Visit button above to add a showing!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayVisits.map((v) => (
                <div 
                  key={v.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        backgroundColor: '#dbeafe', 
                        color: '#1d4ed8', 
                        padding: '3px 8px', 
                        borderRadius: '6px',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        ⏰ {v.timeSlot || v.slotTime || '11:30 AM'}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
                        {v.property}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        Client: <strong style={{ color: '#0f172a' }}>{v.client}</strong> ({v.clientPhone || 'No Phone'})
                      </p>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      backgroundColor: '#f0fdf4', 
                      color: '#16a34a', 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0'
                    }}>
                      {v.status}
                    </span>
                  </div>

                  {v.notes && (
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '10px' }}>
                      &ldquo;{v.notes}&rdquo;
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleSendVisitReminderWhatsApp(v)}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>💬</span> Send WhatsApp Location Pin
                    </button>
                    {v.clientPhone && (
                      <a 
                        href={`tel:${v.clientPhone}`}
                        style={{
                          padding: '7px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <span>📞</span> Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: TODAY'S FOLLOW-UP QUEUE */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                High-Intent Follow-ups Today ({todayFollowUps.length})
              </h3>
            </div>
            <Link href="/dashboard/leads" style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              All Leads ({stats.readyBuyers}) →
            </Link>
          </div>

          {todayFollowUps.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              All client follow-ups for today are up to date! Check the pipeline for tomorrow&apos;s leads.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayFollowUps.map((l) => (
                <div 
                  key={l.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                        {l.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        {l.bhkNeeded || '3 BHK'} · Budget: <strong style={{ color: '#0f172a' }}>{l.budget || '₹1.5 - ₹3 Cr'}</strong>
                      </p>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      backgroundColor: '#ffedd5', 
                      color: '#c2410c', 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      border: '1px solid #fed7aa'
                    }}>
                      {l.status}
                    </span>
                  </div>

                  {l.requirement && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                      Requirement: {l.requirement}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const greeting = `Namaste ${l.name} ji! 🙏 Following up on your property search for ${l.bhkNeeded || 'luxury residence'}. We have a couple of verified options matching your requirements. Are you free for a quick 2-min call?`;
                        openWhatsAppDirect(l.phone, greeting);
                      }}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>💬</span> WhatsApp Follow-up
                    </button>
                    <a 
                      href={`tel:${l.phone}`}
                      style={{
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <span>📞</span> Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* INDIAN TOP MICRO-MARKETS DIRECT NAVIGATION */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px 24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Prime Micro-Markets Active Inventory
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Click to view active inventory & verified listings by cluster
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>Mumbai Micro-Market</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Worli & Juhu</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>₹8.50 Cr - ₹12.50 Cr · 4 BHK</div>
              </div>
            </Link>

            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Gurgaon / NCR</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Golf Course Rd & Sec 48</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>DLF Camellias & Central Park</div>
              </div>
            </Link>

            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>Bengaluru Prime</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Indiranagar 100ft Rd</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>₹3.85 Cr · 3 BHK Vastu East</div>
              </div>
            </Link>

            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>Pune IT Corridor</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Kharadi EON Free Zone</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>₹92 Lakhs · 2 BHK Smart Flat</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
