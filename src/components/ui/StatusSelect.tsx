'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width?: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = variant === 'form' ? rect.width : 190;
    const estMenuHeight = Math.min(options.length * 36 + 12, 260);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estMenuHeight && rect.top > estMenuHeight;

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuWidth - 8);
    }

    if (openUp) {
      setMenuCoords({
        bottom: window.innerHeight - rect.top + 5,
        left,
        width: variant === 'form' ? rect.width : undefined
      });
    } else {
      setMenuCoords({
        top: rect.bottom + 5,
        left,
        width: variant === 'form' ? rect.width : undefined
      });
    }
  }, [variant, align, options.length]);

  // Open/close and position synchronization
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  const sc = value ? getStatusColorStyle(value) : null;

  const handleSelect = (opt: string) => {
    if (disabled) return;
    onChange(opt);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
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
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={toggleOpen}
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
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={toggleOpen}
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

      {/* Floating Dropdown Menu rendered via Portal to prevent any parent clipping */}
      {mounted && isOpen && menuCoords && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: menuCoords.top !== undefined ? `${menuCoords.top}px` : undefined,
            bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : undefined,
            left: `${menuCoords.left}px`,
            width: menuCoords.width ? `${menuCoords.width}px` : undefined,
            minWidth: variant === 'form' ? (menuCoords.width ? `${menuCoords.width}px` : '100%') : '185px',
            maxWidth: '300px',
            zIndex: 999999,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.22), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
            padding: '5px',
            maxHeight: '260px',
            overflowY: 'auto',
            animation: 'enter 0.12s ease-out'
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
        </div>,
        document.body
      )}
    </div>
  );
}
