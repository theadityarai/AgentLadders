'use client';

import React, { useMemo, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  HomeIcon,
  BuildingIcon,
  UsersIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  FolderIcon,
  ReceiptIcon,
  CreditCardIcon,
  IndianRupeeIcon,
  CheckSquareIcon,
  BarChartIcon,
  TrendingUpIcon,
  ZapIcon,
  MegaphoneIcon,
  GlobeIcon,
  ClockIcon,
  ShieldIcon,
  MessageCircleIcon,
  SettingsIcon,
  CrownIcon,
  ChevronRightIcon,
  LockIcon,
  BellIcon,
  PhoneIcon,
  InfoIcon
} from '@/components/icons/NavIcons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }> | React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ROUTE_LABELS: Record<string, { label: string; icon?: React.ComponentType<any> }> = {
  dashboard: { label: 'Dashboard', icon: HomeIcon },
  properties: { label: 'Properties', icon: BuildingIcon },
  leads: { label: 'Inquiries', icon: UsersIcon },
  deals: { label: 'Deals Pipeline', icon: BriefcaseIcon },
  'site-visits': { label: 'Site Visits', icon: MapPinIcon },
  clients: { label: 'Clients', icon: UsersIcon },
  calendar: { label: 'Calendar', icon: CalendarIcon },
  documents: { label: 'Documents', icon: FolderIcon },
  invoices: { label: 'Invoices', icon: ReceiptIcon },
  expenses: { label: 'Expenses', icon: CreditCardIcon },
  payments: { label: 'Payments', icon: IndianRupeeIcon },
  tasks: { label: 'Tasks', icon: CheckSquareIcon },
  reports: { label: 'Reports', icon: BarChartIcon },
  analytics: { label: 'Analytics', icon: TrendingUpIcon },
  insights: { label: 'Performance Insights', icon: ZapIcon },
  marketing: { label: 'Marketing', icon: MegaphoneIcon },
  brokerage: { label: 'Brokerage & Splits', icon: IndianRupeeIcon },
  owners: { label: 'Property Owners', icon: UserIcon },
  companies: { label: 'Companies', icon: BuildingIcon },
  listings: { label: 'Portal Listings', icon: GlobeIcon },
  timeline: { label: 'Activity Timeline', icon: ClockIcon },
  'audit-logs': { label: 'Audit Logs', icon: ShieldIcon },
  support: { label: 'Help & Support', icon: MessageCircleIcon },
  settings: { label: 'Settings', icon: SettingsIcon },
  admin: { label: 'Super Admin', icon: CrownIcon },
  p: { label: 'Showcase', icon: BuildingIcon },
};

function renderCrumbIcon(
  icon: BreadcrumbItem['icon'],
  compact: boolean,
  isLast: boolean
) {
  if (!icon) return null;
  const iconSize = compact ? 13 : 14;
  const iconColor = isLast ? 'var(--primary, #059669)' : '#64748b';

  if (React.isValidElement(icon)) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
        {icon}
      </span>
    );
  }

  if (typeof icon === 'function') {
    const IconComp = icon as React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
        <IconComp size={iconSize} color={iconColor} strokeWidth={1.8} />
      </span>
    );
  }

  if (typeof icon === 'string') {
    return <span style={{ fontSize: compact ? '11px' : '12px', lineHeight: 1 }}>{icon}</span>;
  }

  return null;
}

function BreadcrumbsInner({ items, compact = false, className, style }: BreadcrumbsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const breadcrumbsList = useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    if (!pathname) return [{ label: 'Dashboard', href: '/dashboard', icon: HomeIcon }];

    const segments = pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];

    // Always start with Dashboard if inside dashboard
    if (segments[0] === 'dashboard') {
      result.push({
        label: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon
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
        icon: CrownIcon
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
        icon: BuildingIcon
      });
      result.push({
        label: 'Public Property Listing',
        icon: BuildingIcon
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
        const tabMeta: Record<string, { label: string; icon?: React.ComponentType<any> }> = {
          config: { label: 'System Configuration', icon: SettingsIcon },
          agency: { label: 'Agency Profile', icon: BuildingIcon },
          team: { label: 'Team & Roles', icon: UsersIcon },
          security: { label: 'Security & 2FA', icon: LockIcon },
          billing: { label: 'Plan & Billing', icon: CreditCardIcon },
          notifications: { label: 'Notifications', icon: BellIcon },
          tickets: { label: 'My Tickets', icon: MessageCircleIcon },
          faqs: { label: 'FAQs & Articles', icon: InfoIcon },
          contact: { label: 'Contact Support', icon: PhoneIcon }
        };
        if (tabMeta[tab]) {
          result.push({
            label: tabMeta[tab].label,
            icon: tabMeta[tab].icon
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
        gap: compact ? '2px' : '4px',
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
                    gap: '5px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 500,
                    padding: compact ? '2px 5px' : '3px 7px',
                    borderRadius: '5px',
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
                  {renderCrumbIcon(crumb.icon, compact, false)}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: isLast ? '#0f172a' : '#64748b',
                    fontWeight: isLast ? 650 : 500,
                    padding: compact ? '2px 5px' : '3px 7px'
                  }}
                >
                  {renderCrumbIcon(crumb.icon, compact, isLast)}
                  <span>{crumb.label}</span>
                </span>
              )}

              {!isLast && (
                <span 
                  aria-hidden="true" 
                  style={{ 
                    color: '#cbd5e1', 
                    userSelect: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    margin: '0 1px'
                  }}
                >
                  <ChevronRightIcon size={compact ? 11 : 12} color="#94a3b8" strokeWidth={2} />
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
