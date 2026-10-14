'use client';

import React from 'react';
import { SearchIcon } from '@/components/icons/NavIcons';

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  maxWidth?: number | string;
  minWidth?: number | string;
  width?: number | string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  maxWidth = 320,
  minWidth = 200,
  width,
  style,
  inputStyle,
  size = 'md',
  id,
  autoFocus = false,
  className
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const py = isSm ? '6px' : isLg ? '10px' : '8px';
  const pxLeft = isSm ? '32px' : isLg ? '38px' : '34px';
  const pxRight = isSm ? '30px' : isLg ? '36px' : '32px';
  const iconSize = isSm ? 13 : isLg ? 16 : 14;
  const iconLeft = isSm ? 10 : isLg ? 13 : 11;
  const fontSize = isSm ? 12.5 : isLg ? 14 : 13;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: width ? undefined : '1 1 auto',
        width: width || undefined,
        maxWidth: typeof maxWidth === 'number' ? `min(${maxWidth}px, 100%)` : maxWidth,
        minWidth: typeof minWidth === 'number' ? `min(${minWidth}px, 100%)` : minWidth,
        boxSizing: 'border-box',
        ...style
      }}
    >
      <SearchIcon
        size={iconSize}
        color="#94a3b8"
        style={{
          position: 'absolute',
          left: iconLeft,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          flexShrink: 0
        }}
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: `${py} ${pxRight} ${py} ${pxLeft}`,
          borderRadius: 20,
          border: '1px solid #cbd5e1',
          backgroundColor: '#f8fafc',
          fontSize: fontSize,
          color: '#0f172a',
          outline: 'none',
          transition: 'all 0.15s ease',
          ...inputStyle
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--primary, #059669)';
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          title="Clear search"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            backgroundColor: '#e2e8f0',
            color: '#64748b',
            borderRadius: '50%',
            width: isSm ? 18 : 20,
            height: isSm ? 18 : 20,
            fontSize: isSm ? 10 : 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#cbd5e1')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
};
