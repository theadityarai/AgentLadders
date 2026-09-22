import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
}

interface TableFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  totalCount?: number;
  filteredCount?: number;
  onReset?: () => void;
}

export function TableFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  totalCount,
  filteredCount,
  onReset
}: TableFilterBarProps) {
  const isFiltered = searchQuery.trim() !== '' || filters.some(f => f.value !== '' && f.value !== 'All');

  return (
    <div style={{
      margin: '0 24px 16px 24px',
      padding: '14px 18px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}>
      {/* Left side: Search input + Dropdowns */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
        
        {/* Search Field */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94a3b8', fontSize: '14px' }}>
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '8px 32px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '13px',
              color: '#0f172a',
              outline: 'none',
              transition: 'border-color 0.2s, background-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '9px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px',
                padding: 0
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        {filters.map((f) => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
              {f.label}:
            </label>
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: f.value !== '' && f.value !== 'All' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: f.value !== '' && f.value !== 'All' ? '#eff6ff' : '#ffffff',
                color: f.value !== '' && f.value !== 'All' ? '#1d4ed8' : '#0f172a',
                fontSize: '13px',
                fontWeight: f.value !== '' && f.value !== 'All' ? 600 : 400,
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset / Clear Button */}
        {isFiltered && onReset && (
          <button
            onClick={onReset}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              color: '#b91c1c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Right side: Showing X of Y count badge */}
      {totalCount !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontWeight: 500
          }}>
            Showing <strong style={{ color: '#0f172a' }}>{filteredCount ?? totalCount}</strong> of {totalCount} {totalCount === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}
    </div>
  );
}
