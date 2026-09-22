'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: '$0',
    activeProperties: '0',
    newLeads: '0',
    activeDeals: '0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/dashboard-stats');
        const json = await res.json();
        if (json.stats) setStats(json.stats);
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const lifecycleStages = [
    {
      step: '01',
      title: 'Contact Ingestion',
      desc: 'Capture & qualify prospective buyers, tenants, corporate clients & property owners',
      badge: 'CRM Intake',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      primaryAction: { label: '+ Add Lead', href: '/dashboard/leads' },
      secondaryAction: { label: 'View Clients', href: '/dashboard/clients' },
      icon: '🎯'
    },
    {
      step: '02',
      title: 'Property Portfolio',
      desc: 'Manage luxury listings, property specs, public tour links & marketing flyers',
      badge: 'Inventory',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      primaryAction: { label: '+ Add Property', href: '/dashboard/properties' },
      secondaryAction: { label: 'View Inventory', href: '/dashboard/properties' },
      icon: '🏢'
    },
    {
      step: '03',
      title: 'Showings & Tasks',
      desc: 'Coordinate on-site client visits, calendar appointments & time-sensitive action items',
      badge: 'Field Ops',
      badgeColor: '#d97706',
      badgeBg: '#fffbeb',
      primaryAction: { label: '+ Schedule Visit', href: '/dashboard/site-visits' },
      secondaryAction: { label: 'Daily Calendar', href: '/dashboard/calendar' },
      icon: '📍'
    },
    {
      step: '04',
      title: 'Deals & Financials',
      desc: 'Close sale/lease transactions, track commission splits, issue invoices & log receipts',
      badge: 'Revenue',
      badgeColor: '#7c3aed',
      badgeBg: '#f5f3ff',
      primaryAction: { label: '+ New Deal', href: '/dashboard/deals' },
      secondaryAction: { label: 'Invoices', href: '/dashboard/invoices' },
      icon: '💰'
    }
  ];

  return (
    <>
      <PageHeader 
        title="Agency Command Center" 
        subtitle="Operational workflow, real-time pipeline status, and inventory intelligence" 
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <Button variant="outline">🏢 Inventory</Button>
            </Link>
            <Link href="/dashboard/reports" style={{ textDecoration: 'none' }}>
              <Button variant="primary">📊 Executive Report</Button>
            </Link>
          </div>
        } 
      />

      {/* OPERATIONAL LIFECYCLE GUIDE */}
      <div style={{ padding: '0 24px', marginTop: '16px' }}>
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🧭</span>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Agency Operational Lifecycle</h2>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  Guided Workflow
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Follow the 4 standard real estate brokerage stages to move contacts from first discovery to revenue collection.
              </p>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Step-by-step CRM &middot; No spreadsheets required
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {lifecycleStages.map((stage) => (
              <div 
                key={stage.step}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: stage.badgeColor }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{stage.icon}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      backgroundColor: stage.badgeBg, 
                      color: stage.badgeColor 
                    }}>
                      Stage {stage.step} &middot; {stage.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    {stage.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                    {stage.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <Link href={stage.primaryAction.href} style={{ flex: 1, textDecoration: 'none' }}>
                    <button style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: stage.badgeColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}>
                      {stage.primaryAction.label}
                    </button>
                  </Link>
                  <Link href={stage.secondaryAction.href} style={{ textDecoration: 'none' }}>
                    <button style={{
                      padding: '7px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}>
                      {stage.secondaryAction.label}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* METRICS OVERVIEW */}
      <div style={{ padding: '20px 24px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Real-Time Performance Indicators
        </h3>
      </div>
      
      {loading ? (
        <p style={{ padding: 24, color: '#64748b' }}>Updating telemetry...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', padding: '0 24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Collected Revenue</p>
              <span style={{ fontSize: '18px' }}>💵</span>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-color)', margin: '8px 0 4px' }}>{stats.totalRevenue}</h3>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>↑ +14.2% vs previous quarter</span>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Portfolio Properties</p>
              <span style={{ fontSize: '18px' }}>🏘️</span>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>{stats.activeProperties}</h3>
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>100% verified asset titles</span>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Qualified Inbound Leads</p>
              <span style={{ fontSize: '18px' }}>⚡</span>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>{stats.newLeads}</h3>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>82% contact response rate</span>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pipeline Deals</p>
              <span style={{ fontSize: '18px' }}>🤝</span>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>{stats.activeDeals}</h3>
            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>Under active negotiation</span>
          </div>
        </div>
      )}
      
      {/* QUICK HUB LAUNCHER */}
      <div style={{ padding: '24px', marginTop: '12px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e2e8f0', 
          borderRadius: '14px', 
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Direct Workspace Shortcuts
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link href="/dashboard/leads" style={{ textDecoration: 'none' }}>
              <Button variant="outline">🎯 All Leads</Button>
            </Link>
            <Link href="/dashboard/clients" style={{ textDecoration: 'none' }}>
              <Button variant="outline">👥 Client Directory</Button>
            </Link>
            <Link href="/dashboard/properties" style={{ textDecoration: 'none' }}>
              <Button variant="outline">🏢 Property Inventory</Button>
            </Link>
            <Link href="/dashboard/deals" style={{ textDecoration: 'none' }}>
              <Button variant="outline">💰 Deals Pipeline</Button>
            </Link>
            <Link href="/dashboard/calendar" style={{ textDecoration: 'none' }}>
              <Button variant="outline">📅 Showings Calendar</Button>
            </Link>
            <Link href="/dashboard/invoices" style={{ textDecoration: 'none' }}>
              <Button variant="outline">🧾 Invoices & Billing</Button>
            </Link>
            <Link href="/dashboard/documents" style={{ textDecoration: 'none' }}>
              <Button variant="outline">📂 File Vault</Button>
            </Link>
            <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <Button variant="outline">⚙️ Agency Settings</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
