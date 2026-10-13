import React from 'react';
import { SearchBar } from '@/components/ui/SearchBar';

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
    <div className="responsive-filter-bar">
      {/* Left side: Search input + Dropdowns */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', flex: 1, minWidth: 'min(280px, 100%)' }}>
        
        {/* Search Field */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          maxWidth={380}
          minWidth={240}
        />

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
                border: f.value !== '' && f.value !== 'All' ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                backgroundColor: f.value !== '' && f.value !== 'All' ? 'var(--primary-light)' : '#ffffff',
                color: f.value !== '' && f.value !== 'All' ? 'var(--primary-text)' : '#0f172a',
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
