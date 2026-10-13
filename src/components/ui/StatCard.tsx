'use client';

import React from 'react';

export interface StatTrend {
  value: string | number;
  label?: string; // e.g. "vs last month"
  isPositive?: boolean; // true = green/up, false = red/down
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: StatTrend;
  colorScheme?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'slate';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_SCHEME_STYLES = {
  emerald: {
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    accentBorder: '#a7f3d0'
  },
  blue: {
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    accentBorder: '#bfdbfe'
  },
  amber: {
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    accentBorder: '#fde68a'
  },
  purple: {
    iconBg: '#faf5ff',
    iconColor: '#7c3aed',
    accentBorder: '#ddd6fe'
  },
  rose: {
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
    accentBorder: '#fecdd3'
  },
  slate: {
    iconBg: '#f8fafc',
    iconColor: '#475569',
    accentBorder: '#e2e8f0'
  }
};

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  colorScheme = 'emerald',
  onClick,
  className = '',
  style
}: StatCardProps) {
  const scheme = COLOR_SCHEME_STYLES[colorScheme] || COLOR_SCHEME_STYLES.emerald;

  return (
    <div
      className={`stat-card ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '18px 20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = scheme.accentBorder;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }
      }}
    >
      {/* Top Header: Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '-0.1px' }}>
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              backgroundColor: scheme.iconBg,
              color: scheme.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          {value}
        </span>
      </div>

      {/* Footer / Trend / Subtitle */}
      {(trend || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: 700,
                backgroundColor: trend.isPositive !== false ? '#dcfce7' : '#fee2e2',
                color: trend.isPositive !== false ? '#15803d' : '#b91c1c'
              }}
            >
              {trend.isPositive !== false ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {trend?.label && <span style={{ color: '#94a3b8' }}>{trend.label}</span>}
          {subtitle && !trend && <span style={{ color: '#64748b' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
