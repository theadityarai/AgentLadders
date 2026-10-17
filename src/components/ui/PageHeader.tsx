import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  showBreadcrumbs = false,
  customBreadcrumbs 
}: PageHeaderProps) {
  return (
    <div className="responsive-page-header">
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        {showBreadcrumbs && (
          <div style={{ marginBottom: '8px' }}>
            <Breadcrumbs items={customBreadcrumbs} />
          </div>
        )}
        <h1 style={{ fontSize: 'clamp(20px, 4.5vw, 26px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 'clamp(12px, 3.2vw, 14px)', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{subtitle}</p>}
      </div>
      {actions && (
        <div className="responsive-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
