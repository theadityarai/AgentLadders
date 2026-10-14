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
    <>
      <nav
        className="mobile-bottom-nav modern-android-nav"
        aria-label="Handheld App Navigation"
      >
        <div className="modern-android-nav-inner">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item-btn ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <div className={`icon-capsule ${active ? 'capsule-active' : ''}`}>
                  <Icon
                    size={20}
                    color={active ? 'var(--primary, #059669)' : '#64748b'}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </div>
                <span className="nav-label">{label}</span>
              </Link>
            );
          })}

          {/* More Drawer Button */}
          <button
            type="button"
            onClick={openDrawer}
            className="nav-item-btn"
            aria-label="Open More App Modules"
          >
            <div className="icon-capsule">
              <MenuIcon size={20} color="#64748b" strokeWidth={1.8} />
            </div>
            <span className="nav-label">More</span>
          </button>
        </div>
      </nav>

      {/* Modern Android Material 3 Bottom Bar Styling */}
      <style>{`
        .modern-android-nav {
          position: fixed;
          z-index: 50;
          background-color: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          user-select: none;
          transition: all 0.2s ease;
        }

        /* Mobile phones: Docked bottom bar */
        @media (max-width: 640px) {
          .modern-android-nav {
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: calc(64px + env(safe-area-inset-bottom, 0px));
            padding-bottom: max(env(safe-area-inset-bottom, 0px), 4px);
            border-top: 1px solid rgba(226, 232, 240, 0.9);
            box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.06);
          }
        }

        /* Tablets: Floating centered pill bar */
        @media (min-width: 641px) and (max-width: 1024px) {
          .modern-android-nav {
            bottom: 14px;
            left: 50%;
            transform: translateX(-50%);
            width: min(520px, calc(100vw - 32px));
            height: 66px;
            border-radius: 26px;
            border: 1px solid rgba(226, 232, 240, 0.95);
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.04);
          }
        }

        .modern-android-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 100%;
          width: 100%;
          padding: 0 6px;
        }

        .nav-item-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          gap: 2px;
          color: #64748b;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }

        .nav-item-btn:active {
          transform: scale(0.92);
        }

        .icon-capsule {
          width: 54px;
          height: 28px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .capsule-active {
          background-color: var(--primary-light, #d1fae5);
          box-shadow: 0 1px 3px rgba(5, 150, 105, 0.12);
        }

        .nav-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: -0.2px;
          line-height: 1.1;
          color: #64748b;
          transition: color 0.15s ease;
        }

        .nav-item-btn.is-active .nav-label {
          color: var(--primary-dark, #047857);
          font-weight: 750;
        }
      `}</style>
    </>
  );
}
