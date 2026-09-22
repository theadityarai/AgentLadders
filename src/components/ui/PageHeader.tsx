import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '32px 24px',
      backgroundColor: 'transparent'
    }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '12px' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
