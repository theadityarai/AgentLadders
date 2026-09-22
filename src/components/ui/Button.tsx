import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style, children, ...props }, ref) => {
    
    let bgColor = 'var(--primary-color)';
    let textColor = 'white';
    let border = '1px solid transparent';
    let hoverBg = 'var(--primary-hover)';

    if (variant === 'secondary') {
      bgColor = 'var(--secondary-color)';
      textColor = 'var(--text-primary)';
      hoverBg = '#e2e8f0';
    } else if (variant === 'outline') {
      bgColor = 'transparent';
      textColor = 'var(--text-primary)';
      border = '1px solid var(--border-color)';
      hoverBg = 'var(--background-color)';
    } else if (variant === 'ghost') {
      bgColor = 'transparent';
      textColor = 'var(--text-secondary)';
      hoverBg = 'rgba(0,0,0,0.05)';
    } else if (variant === 'danger') {
      bgColor = 'var(--danger)';
      hoverBg = '#dc2626';
    }

    const padding = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px';
    const fontSize = size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px';

    return (
      <button
        ref={ref}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border: border,
          padding: padding,
          fontSize: fontSize,
          fontWeight: 500,
          borderRadius: 'var(--radius-md)',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.55 : 1,
          pointerEvents: props.disabled ? 'none' : 'auto',
          transition: 'var(--transition)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          boxShadow: (variant === 'primary' || variant === 'danger') && !props.disabled ? 'var(--shadow-sm)' : 'none',
          ...style
        }}
        onMouseEnter={(e) => {
          if (props.disabled) return;
          e.currentTarget.style.backgroundColor = hoverBg;
          if (variant === 'primary' || variant === 'danger') {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseLeave={(e) => {
          if (props.disabled) return;
          e.currentTarget.style.backgroundColor = bgColor;
          if (variant === 'primary' || variant === 'danger') {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
