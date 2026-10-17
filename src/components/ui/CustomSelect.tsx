'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOptionObject {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export type SelectOption = string | SelectOptionObject;

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'form' | 'pill' | 'filter';
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  getOptionStyle?: (val: string) => { bg?: string; text?: string; border?: string; dot?: string };
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  variant = 'form',
  size = 'md',
  align = 'left',
  disabled = false,
  className = '',
  style,
  getOptionStyle
}: CustomSelectProps) {
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

  // Normalize options
  const normalizedOptions: SelectOptionObject[] = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(o => o.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : value;
  const customStyle = value && getOptionStyle ? getOptionStyle(value) : null;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = variant === 'form' ? Math.max(rect.width, 200) : Math.max(rect.width, 180);
    const estMenuHeight = Math.min(normalizedOptions.length * 38 + 12, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estMenuHeight && rect.top > estMenuHeight;

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuWidth - 8);
    }

    if (openUp) {
      setMenuCoords({
        bottom: window.innerHeight - rect.top + 4,
        left,
        width: variant === 'form' ? rect.width : undefined
      });
    } else {
      setMenuCoords({
        top: rect.bottom + 4,
        left,
        width: variant === 'form' ? rect.width : undefined
      });
    }
  }, [variant, align, normalizedOptions.length]);

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

  const handleSelect = (optVal: string) => {
    if (disabled) return;
    onChange(optVal);
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

  const isForm = variant === 'form';
  const isFilter = variant === 'filter';
  const isPill = variant === 'pill';

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        display: isForm ? 'block' : 'inline-block',
        width: isForm ? '100%' : 'auto',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: isForm ? '100%' : 'auto',
          height: size === 'sm' ? '34px' : '42px',
          padding: isPill
            ? (size === 'sm' ? '3px 10px' : '5px 12px')
            : (size === 'sm' ? '0 10px' : '0 12px'),
          borderRadius: isPill ? '20px' : (size === 'sm' ? '6px' : '8px'),
          border: customStyle?.border
            ? `1.5px solid ${customStyle.border}`
            : (isFilter ? '1px solid #cbd5e1' : '1.5px solid #cbd5e1'),
          backgroundColor: customStyle?.bg
            ? customStyle.bg
            : (isFilter ? '#ffffff' : (isPill ? '#f8fafc' : '#ffffff')),
          color: customStyle?.text
            ? customStyle.text
            : (value ? '#0f172a' : '#94a3b8'),
          fontSize: size === 'sm' ? '12.5px' : '13.5px',
          fontWeight: value ? 600 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isForm ? 'space-between' : 'center',
          gap: '8px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          userSelect: 'none'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          {customStyle?.dot && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: customStyle.dot,
                flexShrink: 0
              }}
            />
          )}
          {selectedOption?.icon && (
            <span style={{ flexShrink: 0 }}>{selectedOption.icon}</span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value ? '#0f172a' : '#94a3b8' }}>
            {selectedLabel || placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                marginLeft: '4px'
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </span>

        <span
          style={{
            fontSize: '9px',
            color: '#64748b',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
            marginLeft: isForm ? '8px' : '2px'
          }}
        >
          ▼
        </span>
      </button>

      {/* Floating Dropdown Listbox */}
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
            minWidth: isForm ? (menuCoords.width ? `${menuCoords.width}px` : '200px') : '190px',
            maxWidth: '360px',
            zIndex: 999999,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.22), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
            padding: '5px',
            maxHeight: '280px',
            overflowY: 'auto',
            animation: 'enter 0.12s ease-out'
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            const optStyle = getOptionStyle ? getOptionStyle(opt.value) : null;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {optStyle?.dot && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: optStyle.dot,
                        flexShrink: 0
                      }}
                    />
                  )}
                  {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary, #059669)' : '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {opt.label}
                    </div>
                    {opt.sublabel && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {opt.badge && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? '#dcfce7' : '#f1f5f9',
                        color: isSelected ? '#166534' : '#64748b'
                      }}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <span style={{ color: 'var(--primary, #059669)', fontWeight: 900, fontSize: '13px', paddingRight: '2px' }}>
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
