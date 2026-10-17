'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getStatusColorStyle } from '@/lib/theme';

export interface StatusSelectProps {
  value: string;
  onChange: (newStatus: string) => void;
  options: string[];
  placeholder?: string;
  variant?: 'pill' | 'form';
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function StatusSelect({
  value,
  onChange,
  options,
  placeholder = 'Select Status...',
  variant = 'pill',
  size = 'md',
  align = 'left',
  disabled = false,
  className = '',
  style
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sc = value ? getStatusColorStyle(value) : null;

  const handleSelect = (opt: string) => {
    if (disabled) return;
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`status-select-container ${className}`}
      style={{
        position: 'relative',
        display: variant === 'form' ? 'block' : 'inline-block',
        width: variant === 'form' ? '100%' : 'auto',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger Button */}
      {variant === 'form' ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 12px',
            borderRadius: '8px',
            border: sc ? `1.5px solid ${sc.border}` : '1.5px solid #cbd5e1',
            backgroundColor: sc ? sc.bg : '#ffffff',
            color: sc ? sc.text : '#0f172a',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            outline: 'none',
            transition: 'all 0.15s ease',
            boxSizing: 'border-box'
          }}
        >
          {value ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: sc?.dot || '#64748b',
                  flexShrink: 0
                }}
              />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value}
              </span>
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>{placeholder}</span>
          )}
          <span
            style={{
              fontSize: '10px',
              color: sc ? sc.text : '#64748b',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              flexShrink: 0
            }}
          >
            ▼
          </span>
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: size === 'sm' ? '5px' : '6px',
            padding: size === 'sm' ? '3px 9px' : '5px 12px',
            borderRadius: '20px',
            border: sc ? `1px solid ${sc.border}` : '1px solid #cbd5e1',
            backgroundColor: sc ? sc.bg : '#f8fafc',
            color: sc ? sc.text : '#475569',
            fontSize: size === 'sm' ? '11px' : '12px',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease',
            userSelect: 'none'
          }}
        >
          {sc?.dot && (
            <span
              style={{
                width: size === 'sm' ? '6px' : '7px',
                height: size === 'sm' ? '6px' : '7px',
                borderRadius: '50%',
                backgroundColor: sc.dot,
                flexShrink: 0
              }}
            />
          )}
          <span>{value || placeholder}</span>
          <span
            style={{
              fontSize: '8px',
              opacity: 0.7,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              marginLeft: '2px'
            }}
          >
            ▼
          </span>
        </button>
      )}

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            [align === 'right' ? 'right' : 'left']: 0,
            zIndex: 99999,
            minWidth: variant === 'form' ? '100%' : '185px',
            maxWidth: '300px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '5px',
            maxHeight: '260px',
            overflowY: 'auto',
            animation: 'enter 0.15s ease-out'
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            const optSc = getStatusColorStyle(opt);
            return (
              <div
                key={opt}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '7px 9px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f8fafc' : 'transparent',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected ? '#f1f5f9' : '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected ? '#f8fafc' : 'transparent';
                }}
              >
                {/* Status Badge Pill */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: optSc.bg,
                    color: optSc.text,
                    border: `1px solid ${optSc.border}`,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: optSc.dot,
                      flexShrink: 0
                    }}
                  />
                  <span>{opt}</span>
                </span>

                {/* Selected Checkmark */}
                {isSelected && (
                  <span style={{ color: optSc.text, fontWeight: 900, fontSize: '12px', paddingRight: '4px' }}>
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
