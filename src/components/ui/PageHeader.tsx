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
      <div>
        {showBreadcrumbs && (
          <div style={{ marginBottom: '8px' }}>
            <Breadcrumbs items={customBreadcrumbs} />
          </div>
        )}
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
