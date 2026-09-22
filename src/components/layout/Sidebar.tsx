'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const isCurrent = (path: string) => pathname === path;

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: string }) => {
    const active = isCurrent(href);
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '9px 14px',
          margin: '2px 10px',
          borderRadius: '8px',
          backgroundColor: active ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
          color: active ? '#2563eb' : '#475569',
          fontWeight: active ? 600 : 500,
          transition: 'all 0.15s ease-in-out',
          cursor: 'pointer',
          borderLeft: active ? '3px solid #2563eb' : '3px solid transparent'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
            e.currentTarget.style.color = '#0f172a';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#475569';
          }
        }}
        >
          <span style={{ marginRight: '10px', fontSize: '16px' }}>{icon}</span>
          <span style={{ fontSize: '13.5px' }}>{label}</span>
        </div>
      </Link>
    );
  };

  const Section = ({ title, stage }: { title: string; stage?: string }) => (
    <div style={{
      padding: '18px 20px 6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }}>
        {title}
      </span>
      {stage && (
        <span style={{
          fontSize: '9.5px',
          fontWeight: 700,
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #dbeafe'
        }}>
          {stage}
        </span>
      )}
    </div>
  );

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      backgroundColor: 'var(--surface-color)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
      overflowY: 'auto'
    }}>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          width: '34px',
          height: '34px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: '17px',
          marginRight: '12px',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
        }}>
          AL
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            AgentLadders
          </h1>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Real Estate Operating System</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '8px 0 20px' }}>
        <Section title="Overview" />
        <NavItem href="/dashboard" label="Dashboard" icon="📊" />
        <NavItem href="/dashboard/analytics" label="Analytics" icon="📈" />
        
        <Section title="Ingestion & CRM" stage="Stage 1" />
        <NavItem href="/dashboard/leads" label="Leads" icon="🎯" />
        <NavItem href="/dashboard/clients" label="Clients" icon="👥" />
        <NavItem href="/dashboard/companies" label="Companies" icon="🏢" />
        <NavItem href="/dashboard/owners" label="Owners" icon="🏠" />
        <NavItem href="/dashboard/brokerage" label="Brokerage" icon="🤝" />

        <Section title="Inventory & Feeds" stage="Stage 2" />
        <NavItem href="/dashboard/properties" label="Properties" icon="🏢" />
        <NavItem href="/dashboard/listings" label="Listings" icon="📋" />

        <Section title="Showings & Activity" stage="Stage 3" />
        <NavItem href="/dashboard/site-visits" label="Site Visits" icon="📍" />
        <NavItem href="/dashboard/calendar" label="Calendar" icon="📅" />
        <NavItem href="/dashboard/tasks" label="Tasks" icon="✅" />

        <Section title="Deals & Finance" stage="Stage 4" />
        <NavItem href="/dashboard/deals" label="Deals" icon="💰" />
        <NavItem href="/dashboard/invoices" label="Invoices" icon="🧾" />
        <NavItem href="/dashboard/payments" label="Payments" icon="💳" />
        <NavItem href="/dashboard/expenses" label="Expenses" icon="📉" />

        <Section title="Assets & Reporting" />
        <NavItem href="/dashboard/documents" label="Documents" icon="📂" />
        <NavItem href="/dashboard/reports" label="Reports" icon="📊" />
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <NavItem href="/dashboard/settings" label="Settings" icon="⚙️" />
      </div>
    </aside>
  );
}
