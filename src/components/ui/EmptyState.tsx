'use client';

import React from 'react';
import Link from 'next/link';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className = '',
  style
}: EmptyStateProps) {
  // Default fallback icon
  const defaultIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const renderActionButton = (act: EmptyStateAction, isSecondary: boolean = false) => {
    const isPrimary = !isSecondary && (act.variant === 'primary' || !act.variant);

    const btnStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: compact ? '7px 14px' : '9px 18px',
      fontSize: compact ? '12.5px' : '13.5px',
      fontWeight: 600,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      textDecoration: 'none',
      border: isPrimary ? 'none' : '1px solid #cbd5e1',
      backgroundColor: isPrimary ? 'var(--primary, #059669)' : '#ffffff',
      color: isPrimary ? '#ffffff' : '#334155',
      boxShadow: isPrimary ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
    };

    if (act.href) {
      return (
        <Link key={act.label} href={act.href} style={btnStyle}>
          {act.icon}
          {act.label}
        </Link>
      );
    }

    return (
      <button
        key={act.label}
        type="button"
        onClick={act.onClick}
        style={btnStyle}
      >
        {act.icon}
        {act.label}
      </button>
    );
  };

  return (
    <div
      className={`empty-state-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '32px 20px' : '56px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1.5px dashed #cbd5e1',
        margin: '10px 0',
        ...style
      }}
    >
      {/* Icon with soft circular backdrop */}
      <div
        style={{
          width: compact ? '48px' : '60px',
          height: compact ? '48px' : '60px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: compact ? '12px' : '16px',
          color: '#64748b',
          fontSize: compact ? '22px' : '28px'
        }}
      >
        {icon ?? defaultIcon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: compact ? '15px' : '17px',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 6px 0',
          letterSpacing: '-0.2px'
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: compact ? '12.5px' : '13.5px',
            color: '#64748b',
            maxWidth: '420px',
            margin: '0 0 20px 0',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      )}

      {/* Action buttons */}
      {(action || secondaryAction) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {action && renderActionButton(action, false)}
          {secondaryAction && renderActionButton(secondaryAction, true)}
        </div>
      )}
    </div>
  );
}
