'use client';

import React, { useMemo, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ROUTE_LABELS: Record<string, { label: string; icon?: string }> = {
  dashboard: { label: 'Cockpit', icon: '◈' },
  properties: { label: 'Properties', icon: '🏠' },
  leads: { label: 'Inquiries', icon: '👥' },
  deals: { label: 'Deals Pipeline', icon: '💼' },
  'site-visits': { label: 'Site Visits', icon: '📍' },
  clients: { label: 'Clients', icon: '🤝' },
  calendar: { label: 'Calendar', icon: '📅' },
  documents: { label: 'Documents', icon: '📁' },
  invoices: { label: 'Invoices', icon: '🧾' },
  expenses: { label: 'Expenses', icon: '💳' },
  payments: { label: 'Payments', icon: '💰' },
  tasks: { label: 'Tasks', icon: '✅' },
  reports: { label: 'Reports', icon: '📊' },
  analytics: { label: 'Analytics', icon: '📈' },
  insights: { label: 'Performance Insights', icon: '⚡' },
  marketing: { label: 'Marketing', icon: '📢' },
  brokerage: { label: 'Brokerage & Splits', icon: '🤝' },
  owners: { label: 'Property Owners', icon: '👤' },
  companies: { label: 'Companies', icon: '🏢' },
  listings: { label: 'Portal Listings', icon: '🌐' },
  timeline: { label: 'Activity Timeline', icon: '⏳' },
  'audit-logs': { label: 'Audit Logs', icon: '🛡️' },
  support: { label: 'Help & Support', icon: '💬' },
  settings: { label: 'Settings', icon: '⚙️' },
  admin: { label: 'Super Admin', icon: '👑' },
  p: { label: 'Showcase', icon: '🏡' },
};

function BreadcrumbsInner({ items, compact = false, className, style }: BreadcrumbsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const breadcrumbsList = useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    if (!pathname) return [{ label: 'Dashboard', href: '/dashboard', icon: '◈' }];

    const segments = pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];

    // Always start with Cockpit/Dashboard if inside dashboard
    if (segments[0] === 'dashboard') {
      result.push({
        label: 'Dashboard',
        href: '/dashboard',
        icon: '◈'
      });

      if (segments.length > 1) {
        let currentPath = '/dashboard';
        for (let i = 1; i < segments.length; i++) {
          const seg = segments[i];
          currentPath += `/${seg}`;
          const routeMeta = ROUTE_LABELS[seg] || { 
            label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ') 
          };
          
          result.push({
            label: routeMeta.label,
            href: i === segments.length - 1 ? undefined : currentPath,
            icon: routeMeta.icon
          });
        }
      }
    } else if (segments[0] === 'admin') {
      result.push({
        label: 'Super Admin',
        href: '/admin',
        icon: '👑'
      });
      if (segments.length > 1) {
        for (let i = 1; i < segments.length; i++) {
          const seg = segments[i];
          result.push({
            label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
          });
        }
      }
    } else if (segments[0] === 'p') {
      result.push({
        label: 'Properties',
        href: '/dashboard/properties',
        icon: '🏠'
      });
      result.push({
        label: 'Public Property Listing',
        icon: '🏡'
      });
    } else {
      let currentPath = '';
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        currentPath += `/${seg}`;
        const routeMeta = ROUTE_LABELS[seg] || { 
          label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ') 
        };
        result.push({
          label: routeMeta.label,
          href: i === segments.length - 1 ? undefined : currentPath,
          icon: routeMeta.icon
        });
      }
    }

    // Contextual query parameter breadcrumbs (e.g., settings tabs or support tabs)
    if (searchParams) {
      const tab = searchParams.get('tab');
      if (tab) {
        const tabLabels: Record<string, string> = {
          config: 'System Configuration',
          agency: 'Agency Profile',
          team: 'Team & Roles',
          security: 'Security & 2FA',
          billing: 'Plan & Billing',
          notifications: 'Notifications',
          tickets: 'My Tickets',
          faqs: 'FAQs & Articles',
          contact: 'Contact Support'
        };
        if (tabLabels[tab]) {
          result.push({
            label: tabLabels[tab]
          });
        }
      }
    }

    return result;
  }, [items, pathname, searchParams]);

  if (breadcrumbsList.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: compact ? '12px' : '13px',
        color: '#64748b',
        ...style
      }}
    >
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: compact ? '4px' : '6px',
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        {breadcrumbsList.map((crumb, idx) => {
          const isLast = idx === breadcrumbsList.length - 1;

          return (
            <li 
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: compact ? '4px' : '6px'
              }}
            >
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 500,
                    padding: compact ? '1px 4px' : '2px 6px',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {crumb.icon && <span style={{ fontSize: compact ? '11px' : '12px' }}>{crumb.icon}</span>}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: isLast ? '#0f172a' : '#64748b',
                    fontWeight: isLast ? 700 : 500,
                    padding: compact ? '1px 4px' : '2px 6px'
                  }}
                >
                  {crumb.icon && <span style={{ fontSize: compact ? '11px' : '12px' }}>{crumb.icon}</span>}
                  <span>{crumb.label}</span>
                </span>
              )}

              {!isLast && (
                <span 
                  aria-hidden="true" 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: compact ? '10px' : '11px',
                    userSelect: 'none',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Breadcrumbs(props: BreadcrumbsProps) {
  return (
    <Suspense fallback={null}>
      <BreadcrumbsInner {...props} />
    </Suspense>
  );
}
