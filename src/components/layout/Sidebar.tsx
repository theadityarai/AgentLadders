'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: '◈', exact: true },
  { href: '/dashboard/leads', label: 'Inquiries', icon: '👥', exact: false },
  { href: '/dashboard/properties', label: 'Properties', icon: '🏠', exact: false },
  { href: '/dashboard/site-visits', label: 'Site Visits', icon: '📍', exact: false },
  { href: '/dashboard/deals', label: 'Deals', icon: '💼', exact: false },
  { href: '/dashboard/insights', label: 'Insights', icon: '📈', exact: false },
];

const BOTTOM_ITEMS = [
  { href: '/dashboard/support', label: 'Help & Support', icon: '💬', exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; email?: string; name?: string; image?: string } | undefined;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.email === 'aditya@agentladders.com' || user?.email === 'admin@agentladders.com';

  const [agencyLogo, setAgencyLogo] = useState<string>('');
  const [agencyName, setAgencyName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>(user?.image || '');

  const loadBrandData = () => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.agency) {
          if (d.agency.logo) setAgencyLogo(d.agency.logo);
          if (d.agency.name) setAgencyName(d.agency.name);
        }
        if (d.user) {
          const av = d.user.avatar || d.user.image;
          if (av) setUserAvatar(av);
        }
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    loadBrandData();
    const handleBrand = () => loadBrandData();
    window.addEventListener('brand-updated', handleBrand);
    window.addEventListener('profile-updated', handleBrand);
    return () => {
      window.removeEventListener('brand-updated', handleBrand);
      window.removeEventListener('profile-updated', handleBrand);
    };
  }, []);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="app-sidebar hide-on-mobile" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      backgroundColor: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36,
            background: agencyLogo ? '#ffffff' : 'var(--primary-gradient)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.4)',
            flexShrink: 0,
            overflow: 'hidden',
            padding: agencyLogo ? 3 : 0,
          }}>
            {agencyLogo ? (
              <img src={agencyLogo} alt={agencyName || "Agency Logo"} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 7 }} />
            ) : (
              '🏡'
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {agencyName || 'AgentLadders'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Real Estate CRM · India</div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>
          Main
        </div>
        {NAV_ITEMS.map(({ href, label, icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                backgroundColor: active ? 'rgba(var(--primary-rgb), 0.22)' : 'transparent',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.55)';
                }
              }}
              >
                <span style={{ fontSize: 15, flexShrink: 0, color: active ? 'var(--primary)' : 'inherit' }}>{icon}</span>
                <span>{label}</span>
                {label === 'Site Visits' && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, backgroundColor: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: 10 }}>
                    KEY
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px' }}>
          More
        </div>
        <Link href="/dashboard/documents" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
            color: 'rgba(255,255,255,0.45)', fontSize: 13.5, transition: 'all 0.15s ease', cursor: 'pointer',
            borderLeft: '2px solid transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <span style={{ fontSize: 15 }}>📁</span>
            <span>Documents</span>
          </div>
        </Link>
        <Link href="/dashboard/invoices" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
            color: 'rgba(255,255,255,0.45)', fontSize: 13.5, transition: 'all 0.15s ease', cursor: 'pointer',
            borderLeft: '2px solid transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <span style={{ fontSize: 15 }}>🧾</span>
            <span>Invoices</span>
          </div>
        </Link>
        <Link href="/dashboard/tasks" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
            color: 'rgba(255,255,255,0.45)', fontSize: 13.5, transition: 'all 0.15s ease', cursor: 'pointer',
            borderLeft: '2px solid transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <span style={{ fontSize: 15 }}>✅</span>
            <span>Tasks</span>
          </div>
        </Link>
        <Link href="/dashboard/reports" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
            color: 'rgba(255,255,255,0.45)', fontSize: 13.5, transition: 'all 0.15s ease', cursor: 'pointer',
            borderLeft: '2px solid transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <span style={{ fontSize: 15 }}>📊</span>
            <span>Reports</span>
          </div>
        </Link>
      </nav>

      {/* Bottom: Settings + User */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isSuperAdmin && (
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
              backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}>
              <span>🛡️</span>
              <span>Super Admin</span>
            </div>
          </Link>
        )}
        {BOTTOM_ITEMS.map(({ href, label, icon }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
              color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.75)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.45)'; }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        ))}
        {/* User pill */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginTop: 4,
            borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              overflow: 'hidden'
            }}>
              {userAvatar ? (
                <img src={userAvatar} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.name || user.email || 'U').substring(0, 2).toUpperCase()
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || 'Agent'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
