import React from 'react';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'emerald';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusBadgeVariant;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_CONFIGS: Record<StatusBadgeVariant, { bg: string; color: string; border: string; dot: string }> = {
  success: {
    bg: '#dcfce7',
    color: '#15803d',
    border: '#bbf7d0',
    dot: '#22c55e'
  },
  emerald: {
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
    dot: '#10b981'
  },
  warning: {
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
    dot: '#f59e0b'
  },
  danger: {
    bg: '#fee2e2',
    color: '#991b1b',
    border: '#fecdd3',
    dot: '#ef4444'
  },
  info: {
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    dot: '#3b82f6'
  },
  purple: {
    bg: '#faf5ff',
    color: '#6b21a8',
    border: '#e9d5ff',
    dot: '#a855f7'
  },
  neutral: {
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
    dot: '#94a3b8'
  }
};

/**
 * Automatically determine badge variant from real estate status text
 */
function resolveVariant(status: string): StatusBadgeVariant {
  const s = status.toLowerCase();

  if (
    s.includes('active') ||
    s.includes('available') ||
    s.includes('won') ||
    s.includes('paid') ||
    s.includes('completed') ||
    s.includes('verified') ||
    s.includes('success')
  ) {
    return 'success';
  }

  if (
    s.includes('pending') ||
    s.includes('progress') ||
    s.includes('negotiation') ||
    s.includes('proposal') ||
    s.includes('scheduled') ||
    s.includes('warm') ||
    s.includes('medium') ||
    s.includes('under offer')
  ) {
    return 'warning';
  }

  if (
    s.includes('hot') ||
    s.includes('lost') ||
    s.includes('cancelled') ||
    s.includes('overdue') ||
    s.includes('failed') ||
    s.includes('high') ||
    s.includes('urgent')
  ) {
    return 'danger';
  }

  if (
    s.includes('under contract') ||
    s.includes('contracted') ||
    s.includes('exclusive') ||
    s.includes('vip')
  ) {
    return 'purple';
  }

  if (
    s.includes('new') ||
    s.includes('open') ||
    s.includes('follow') ||
    s.includes('cold') ||
    s.includes('info')
  ) {
    return 'info';
  }

  return 'neutral';
}

export function StatusBadge({
  status,
  variant,
  showDot = false,
  size = 'md',
  className = '',
  style
}: StatusBadgeProps) {
  const activeVariant = variant || resolveVariant(status);
  const cfg = VARIANT_CONFIGS[activeVariant] || VARIANT_CONFIGS.neutral;

  const isSmall = size === 'sm';

  return (
    <span
      className={`status-badge status-badge-${activeVariant} ${className}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '20px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {showDot && (
        <span
          style={{
            width: isSmall ? '5px' : '6px',
            height: isSmall ? '5px' : '6px',
            borderRadius: '50%',
            backgroundColor: cfg.dot,
            flexShrink: 0
          }}
        />
      )}
      {status}
    </span>
  );
}
