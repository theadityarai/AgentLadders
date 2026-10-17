'use client';

import React from 'react';
import { getStatusColorStyle } from '@/lib/theme';

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
  useStatusColors?: boolean; // When true, tabs representing CRM statuses use their specific status palette colors
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
  useStatusColors = false,
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
  const getButtonStyle = (isActive: boolean, disabled?: boolean, tab?: TabItem<T>): React.CSSProperties => {
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
        backgroundColor: isActive ? 'var(--primary, #059669)' : 'transparent',
        color: isActive ? '#ffffff' : '#334155',
        boxShadow: isActive ? '0 2px 6px rgba(var(--primary-rgb, 5, 150, 105), 0.28)' : 'none',
        fontWeight: isActive ? 700 : 500
      };
    }

    if (variant === 'underline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: `${sizeStyles.padding.split(' ')[0]} 4px`,
        color: isActive ? 'var(--primary, #059669)' : '#64748b',
        borderBottom: isActive ? '2px solid var(--primary, #059669)' : '2px solid transparent',
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
    const isAll = !tab || tab.id.toLowerCase() === 'all' || tab.id.toLowerCase().startsWith('all ');
    const sc = useStatusColors && !isAll && tab ? getStatusColorStyle(tab.id || tab.label) : null;

    if (sc) {
      if (isActive) {
        return {
          ...base,
          borderRadius: '20px',
          backgroundColor: sc.bg,
          color: sc.text,
          border: `2px solid ${sc.text}`,
          boxShadow: `0 2px 6px ${sc.border}`,
          fontWeight: 800
        };
      } else {
        return {
          ...base,
          borderRadius: '20px',
          backgroundColor: sc.bg,
          color: sc.text,
          border: `1px solid ${sc.border}`,
          fontWeight: 600
        };
      }
    }

    return {
      ...base,
      borderRadius: '20px',
      backgroundColor: isActive ? 'var(--primary, #059669)' : '#f1f5f9',
      color: isActive ? '#ffffff' : '#475569',
      border: isActive ? '1px solid var(--primary, #059669)' : '1px solid #e2e8f0',
      boxShadow: isActive ? '0 2px 6px rgba(var(--primary-rgb, 5, 150, 105), 0.28)' : 'none',
      fontWeight: isActive ? 700 : 500
    };
  };

  // Badge styling
  const getBadgeStyle = (isActive: boolean, customColor?: string, tab?: TabItem<T>): React.CSSProperties => {
    let bg = '#e2e8f0';
    let text = '#475569';

    const isAll = !tab || tab.id.toLowerCase() === 'all' || tab.id.toLowerCase().startsWith('all ');
    const sc = useStatusColors && !isAll && tab && variant === 'pills' ? getStatusColorStyle(tab.id || tab.label) : null;

    if (sc) {
      if (isActive) {
        bg = sc.text;
        text = '#ffffff';
      } else {
        bg = sc.border;
        text = sc.text;
      }
    } else if (isActive) {
      if (variant === 'pills' || variant === 'segmented') {
        bg = 'rgba(255, 255, 255, 0.25)';
        text = '#ffffff';
      } else {
        bg = 'var(--primary, #059669)';
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
          className="filter-tabs-label"
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

      <div
        className={`filter-tabs-container filter-tabs-${variant}`}
        style={{ ...getContainerStyle(), minWidth: 0, flex: '1 1 auto' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAll = tab.id.toLowerCase() === 'all' || tab.id.toLowerCase().startsWith('all ');
          const sc = useStatusColors && !isAll && variant === 'pills' ? getStatusColorStyle(tab.id || tab.label) : null;

          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`filter-tabs-btn ${isActive ? 'filter-tabs-btn-active' : ''}`}
              style={getButtonStyle(isActive, tab.disabled, tab)}
              aria-selected={isActive}
              role="tab"
            >
              {tab.icon ? (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>
              ) : sc ? (
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.dot, flexShrink: 0 }} />
              ) : null}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={getBadgeStyle(isActive, tab.badgeColor, tab)}>
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
