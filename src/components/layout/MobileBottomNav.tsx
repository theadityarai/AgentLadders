'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  BriefcaseIcon,
  MenuIcon
} from '@/components/icons/NavIcons';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Today', icon: HomeIcon, exact: true },
    { href: '/dashboard/leads', label: 'Inquiries', icon: UsersIcon, exact: false },
    { href: '/dashboard/properties', label: 'Properties', icon: BuildingIcon, exact: false },
    { href: '/dashboard/deals', label: 'Deals', icon: BriefcaseIcon, exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const openDrawer = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-drawer'));
  };

  return (
    <nav
      className="mobile-bottom-nav show-flex-on-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #e2e8f0',
        display: 'none', // Overridden by media query in globals.css
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.05)'
      }}
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              gap: 3,
              padding: '6px 0',
              color: active ? 'var(--primary, #059669)' : '#64748b',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
          >
            {active && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '28px',
                  height: '3px',
                  backgroundColor: 'var(--primary, #059669)',
                  borderRadius: '0 0 3px 3px'
                }}
              />
            )}
            <Icon size={20} color={active ? 'var(--primary, #059669)' : '#64748b'} strokeWidth={active ? 2.2 : 1.8} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: active ? 700 : 500,
                letterSpacing: '-0.2px',
                lineHeight: 1
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}

      {/* Menu / More Button */}
      <button
        type="button"
        onClick={openDrawer}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 3,
          padding: '6px 0',
          color: '#64748b',
          transition: 'all 0.15s ease'
        }}
        aria-label="Open More Menu"
      >
        <MenuIcon size={20} color="#64748b" strokeWidth={1.8} />
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '-0.2px',
            lineHeight: 1
          }}
        >
          More
        </span>
      </button>
    </nav>
  );
}
