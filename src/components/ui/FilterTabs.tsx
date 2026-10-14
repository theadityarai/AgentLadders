'use client';

import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  badgeColor?: string;
  disabled?: boolean;
}

export interface FilterTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: 'pills' | 'segmented' | 'underline' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  label?: string; // Optional label on the left (e.g. "LISTING TYPE:")
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function FilterTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  size = 'md',
  label,
  fullWidth = false,
  className = '',
  style
}: FilterTabsProps<T>) {
  // Size-specific styles
  const sizeStyles = {
    sm: {
      padding: '4px 10px',
      fontSize: '12px',
      gap: '4px',
      badgeSize: '16px',
      badgeFont: '10px'
    },
    md: {
      padding: '6px 14px',
      fontSize: '13px',
      gap: '6px',
      badgeSize: '18px',
      badgeFont: '11px'
    },
    lg: {
      padding: '8px 18px',
      fontSize: '14px',
      gap: '8px',
      badgeSize: '20px',
      badgeFont: '12px'
    }
  }[size];

  // Container styling depending on variant
  const getContainerStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'segmented':
        return {
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          gap: '2px',
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        };
      case 'underline':
        return {
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          gap: '16px',
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        };
      case 'soft':
      case 'pills':
      default:
        return {
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: '8px',
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        };
    }
  };

  // Button styling depending on variant and active state
  const getButtonStyle = (isActive: boolean, disabled?: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizeStyles.gap,
      padding: sizeStyles.padding,
      fontSize: sizeStyles.fontSize,
      fontWeight: isActive ? 600 : 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      transition: 'all 0.15s ease',
      border: 'none',
      outline: 'none',
      userSelect: 'none'
    };

    if (fullWidth) {
      base.flex = 1;
    }

    if (variant === 'segmented') {
      return {
        ...base,
        borderRadius: '7px',
        backgroundColor: isActive ? '#ffffff' : 'transparent',
        color: isActive ? '#0f172a' : '#64748b',
        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none',
        fontWeight: isActive ? 600 : 500
      };
    }

    if (variant === 'underline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: `${sizeStyles.padding.split(' ')[0]} 4px`,
        color: isActive ? '#0f172a' : '#64748b',
        borderBottom: isActive ? '2px solid #0f172a' : '2px solid transparent',
        marginBottom: '-1px'
      };
    }

    if (variant === 'soft') {
      return {
        ...base,
        borderRadius: '8px',
        backgroundColor: isActive ? 'var(--primary-light, #ecfdf5)' : '#f8fafc',
        color: isActive ? 'var(--primary, #059669)' : '#64748b',
        border: isActive ? '1px solid var(--primary, #059669)' : '1px solid #e2e8f0'
      };
    }

    // Default 'pills' variant
    return {
      ...base,
      borderRadius: '20px',
      backgroundColor: isActive ? '#0f172a' : '#f1f5f9',
      color: isActive ? '#ffffff' : '#475569',
      border: '1px solid transparent'
    };
  };

  // Badge styling
  const getBadgeStyle = (isActive: boolean, customColor?: string): React.CSSProperties => {
    let bg = '#e2e8f0';
    let text = '#475569';

    if (isActive) {
      if (variant === 'pills') {
        bg = 'rgba(255, 255, 255, 0.22)';
        text = '#ffffff';
      } else {
        bg = '#0f172a';
        text = '#ffffff';
      }
    } else if (customColor) {
      bg = customColor;
      text = '#ffffff';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: sizeStyles.badgeSize,
      height: sizeStyles.badgeSize,
      padding: '0 5px',
      borderRadius: '10px',
      backgroundColor: bg,
      color: text,
      fontSize: sizeStyles.badgeFont,
      fontWeight: 700,
      lineHeight: 1
    };
  };

  return (
    <div
      className={`filter-tabs-wrapper ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        ...style
      }}
    >
      {label && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {label}
        </span>
      )}

      <div style={{ ...getContainerStyle(), minWidth: 0, flex: '1 1 auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              style={getButtonStyle(isActive, tab.disabled)}
              aria-selected={isActive}
              role="tab"
            >
              {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={getBadgeStyle(isActive, tab.badgeColor)}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
