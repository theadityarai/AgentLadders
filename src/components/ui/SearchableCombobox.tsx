'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SearchIcon, ChevronDownIcon, CheckIcon, XIcon, PlusIcon, UserIcon, PhoneIcon } from '@/components/icons/NavIcons';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string; // e.g. Phone number "+91 98200 45678" or locality "Worli"
  badge?: string; // e.g. "Buyer", "₹8.50 Cr", "4 BHK"
  icon?: React.ReactNode;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (val: string, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onAddNew?: () => void;
  addNewLabel?: string;
  emptyMessage?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  label,
  required = false,
  disabled = false,
  onAddNew,
  addNewLabel = '+ Add New...',
  emptyMessage = 'No matching results found',
  style,
  className
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opening
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Selected Option Object
  const selectedOption = useMemo(() => {
    return options.find(o => o.value === value || o.label === value);
  }, [options, value]);

  // Filtered Options
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(o => 
      o.label.toLowerCase().includes(q) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(q)) ||
      (o.badge && o.badge.toLowerCase().includes(q)) ||
      o.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value, option);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }} className={className}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearch('');
          }
        }}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          width: '100%',
          padding: '10px 14px',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          border: isOpen ? '1.5px solid var(--primary, #10b981)' : '1px solid #cbd5e1',
          borderRadius: 8,
          fontSize: 14,
          color: selectedOption ? '#0f172a' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.12)' : 'none',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selectedOption?.icon}
          {selectedOption ? (
            <span style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 6 }}>
                  - {selectedOption.sublabel}
                </span>
              )}
            </span>
          ) : (
            <span style={{ color: '#94a3b8' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selection"
              style={{
                background: 'none',
                border: 'none',
                padding: 2,
                cursor: 'pointer',
                color: '#94a3b8',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 2
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              <XIcon size={14} color="currentColor" />
            </button>
          )}
          <ChevronDownIcon 
            size={16} 
            color="#64748b" 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.2s ease' 
            }} 
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Search Box */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', position: 'relative', backgroundColor: '#f8fafc' }}>
            <SearchIcon size={14} color="#94a3b8" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 13,
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') setIsOpen(false);
                if (e.key === 'Enter' && filteredOptions.length > 0) {
                  e.preventDefault();
                  handleSelect(filteredOptions[0]);
                }
              }}
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '16px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption?.value === opt.value;
                return (
                  <div
                    key={opt.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                      color: isSelected ? '#166534' : '#0f172a',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                      {opt.icon}
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontWeight: isSelected ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {opt.label}
                          {opt.sublabel && (
                            <span style={{ fontWeight: 400, color: isSelected ? '#15803d' : '#64748b', marginLeft: 6 }}>
                              - {opt.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {opt.badge && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 4,
                          backgroundColor: isSelected ? '#dcfce7' : '#e2e8f0',
                          color: isSelected ? '#166534' : '#475569'
                        }}>
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <CheckIcon size={14} color="#16a34a" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Optional Add New Button */}
          {onAddNew && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setIsOpen(false);
                onAddNew();
              }}
              style={{
                padding: '9px 12px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc',
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--primary, #10b981)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background-color 0.1s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            >
              <PlusIcon size={14} color="currentColor" strokeWidth={2.5} />
              <span>{addNewLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
