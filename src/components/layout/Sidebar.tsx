'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  FileTextIcon,
  ReceiptIcon,
  CheckSquareIcon,
  BarChartIcon,
  MessageCircleIcon,
  SettingsIcon,
  ShieldIcon,
  CompassIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon
} from '@/components/icons/NavIcons';

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  exact: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: '/dashboard', label: 'Today', icon: HomeIcon, exact: true },
  { href: '/dashboard/leads', label: 'Inquiries', icon: UsersIcon, exact: false },
  { href: '/dashboard/properties', label: 'Properties', icon: BuildingIcon, exact: false },
  { href: '/dashboard/site-visits', label: 'Site Visits', icon: MapPinIcon, exact: false, badge: 'KEY' },
  { href: '/dashboard/deals', label: 'Deals', icon: BriefcaseIcon, exact: false },
];

const MORE_ITEMS: NavItemConfig[] = [
  { href: '/dashboard/documents', label: 'Documents', icon: FileTextIcon, exact: false },
  { href: '/dashboard/invoices', label: 'Invoices', icon: ReceiptIcon, exact: false },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquareIcon, exact: false },
];

const BOTTOM_ITEMS: NavItemConfig[] = [
  { href: '/dashboard/support', label: 'Help & Support', icon: MessageCircleIcon, exact: false },
  { href: '/dashboard/tutorial', label: 'Playbook & Tutorial', icon: CompassIcon, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar } = useSidebar();
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

  useEffect(() => {
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
    <aside
      className="app-sidebar hide-on-mobile"
      style={{
        width: isCollapsed ? 68 : 240,
        height: '100vh',
        backgroundColor: 'var(--sidebar-bg, #0f172a)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
        overflowY: isCollapsed ? 'visible' : 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '16px 12px 14px' : '20px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: 10,
          transition: 'padding 0.22s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div
            onClick={isCollapsed ? toggleSidebar : undefined}
            title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : undefined}
            style={{
              width: 36,
              height: 36,
              background: agencyLogo ? '#ffffff' : 'var(--primary-gradient, linear-gradient(135deg, #059669 0%, #10b981 100%))',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              flexShrink: 0,
              overflow: 'hidden',
              padding: agencyLogo ? 2 : 0,
              color: '#ffffff',
              cursor: isCollapsed ? 'pointer' : 'default',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => {
              if (isCollapsed) e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={e => {
              if (isCollapsed) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {agencyLogo ? (
              <img src={agencyLogo} alt={agencyName || 'Agency Logo'} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 7 }} />
            ) : (
              <BuildingIcon size={18} color="#ffffff" strokeWidth={2} />
            )}
          </div>

          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {agencyName || 'AgentLadders'}
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 1, letterSpacing: '0.02em', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Broker Workstation
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, padding: isCollapsed ? '12px 8px' : '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!isCollapsed ? (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px 6px' }}>
            Workspace
          </div>
        ) : (
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 6px 8px' }} />
        )}

        {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }} title={isCollapsed ? label : undefined}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? 0 : 11,
                  padding: isCollapsed ? '10px 0' : '9px 12px',
                  borderRadius: 8,
                  backgroundColor: active ? 'rgba(var(--primary-rgb, 5, 150, 105), 0.22)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  borderLeft: isCollapsed ? 'none' : (active ? '3px solid var(--primary, #059669)' : '3px solid transparent'),
                  position: 'relative',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: active ? 'var(--primary, #10b981)' : 'rgba(255,255,255,0.55)', position: 'relative' }}>
                  <Icon size={18} />
                  {isCollapsed && badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -3,
                        right: -4,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '1.5px solid #0f172a'
                      }}
                    />
                  )}
                </span>
                {!isCollapsed && (
                  <>
                    <span style={{ letterSpacing: '-0.1px', whiteSpace: 'nowrap' }}>{label}</span>
                    {badge && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          backgroundColor: 'rgba(var(--primary-rgb, 5, 150, 105), 0.35)',
                          color: 'var(--primary-light, #d1fae5)',
                          padding: '2px 6px',
                          borderRadius: 6,
                          border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.4)'
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: isCollapsed ? '6px 6px' : '10px 6px' }} />

        {!isCollapsed && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px' }}>
            Operations
          </div>
        )}

        {MORE_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }} title={isCollapsed ? label : undefined}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? 0 : 11,
                  padding: isCollapsed ? '9px 0' : '8px 12px',
                  borderRadius: 8,
                  backgroundColor: active ? 'rgba(var(--primary-rgb, 5, 150, 105), 0.22)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  borderLeft: isCollapsed ? 'none' : (active ? '3px solid var(--primary, #059669)' : '3px solid transparent'),
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: active ? 'var(--primary, #10b981)' : 'rgba(255,255,255,0.45)' }}>
                  <Icon size={17} />
                </span>
                {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions, User Profile & Collapse Toggle */}
      <div style={{ padding: isCollapsed ? '10px 8px 16px' : '12px 10px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isSuperAdmin && (
          <Link href="/admin" style={{ textDecoration: 'none' }} title={isCollapsed ? 'Super Admin HQ' : undefined}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: 10,
                padding: isCollapsed ? '8px 0' : '8px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(99,102,241,0.18)',
                color: '#a5b4fc',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: '1px solid rgba(99,102,241,0.25)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <ShieldIcon size={16} color="#a5b4fc" />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Super Admin HQ</span>}
            </div>
          </Link>
        )}

        {BOTTOM_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }} title={isCollapsed ? label : undefined}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? 0 : 11,
                  padding: isCollapsed ? '8px 0' : '8px 12px',
                  borderRadius: 8,
                  backgroundColor: active ? 'rgba(var(--primary-rgb, 5, 150, 105), 0.22)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: isCollapsed ? 'none' : (active ? '3px solid var(--primary, #059669)' : '3px solid transparent'),
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: active ? 'var(--primary, #10b981)' : 'rgba(255,255,255,0.45)' }}>
                  <Icon size={17} />
                </span>
                {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              </div>
            </Link>
          );
        })}

        {/* User Pill */}
        {user && (
          <div
            title={isCollapsed ? `${user.name || 'User'} (${user.email})` : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 10,
              padding: isCollapsed ? '6px 0' : '8px 10px',
              marginTop: 4,
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'var(--primary, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (user.name || user.email || 'U').substring(0, 2).toUpperCase()
              )}
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || 'Broker Agent'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Expand / Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: 10,
            padding: isCollapsed ? '8px 0' : '8px 12px',
            marginTop: 4,
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {isCollapsed ? (
              <PanelLeftOpenIcon size={16} color="currentColor" />
            ) : (
              <PanelLeftCloseIcon size={16} color="currentColor" />
            )}
            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Collapse</span>}
          </div>
          {!isCollapsed && (
            <kbd
              style={{
                fontSize: 9.5,
                fontFamily: 'monospace',
                padding: '2px 5px',
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              Ctrl+B
            </kbd>
          )}
        </button>
      </div>
    </aside>
  );
}
