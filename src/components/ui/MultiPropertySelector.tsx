'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BuildingIcon, 
  MapPinIcon, 
  PlusIcon, 
  XIcon, 
  SearchIcon, 
  CheckIcon, 
  ChevronDownIcon,
  HomeIcon,
  TrashIcon
} from '@/components/icons/NavIcons';
import { formatINR } from '@/lib/formatters';

export interface PropertyOptionItem {
  id?: string;
  title: string;
  locality?: string;
  city?: string;
  bhk?: string;
  price?: number;
  purpose?: string;
  status?: string;
}

interface MultiPropertySelectorProps {
  availableProperties: PropertyOptionItem[];
  selectedProperties: string[];
  onChange: (properties: string[]) => void;
  onAddNewProperty?: () => void;
  label?: string;
  required?: boolean;
  itemPrefix?: string;
  addFirstLabel?: string;
  addMoreLabel?: string;
  itemBadgeLabel?: string;
  selectActionLabel?: string;
}

export function MultiPropertySelector({
  availableProperties,
  selectedProperties,
  onChange,
  onAddNewProperty,
  label = 'Properties to Visit (Multi-Property Tour)',
  required = true,
  itemPrefix = 'Stop',
  addFirstLabel,
  addMoreLabel,
  itemBadgeLabel,
  selectActionLabel
}: MultiPropertySelectorProps) {
  const isTour = itemPrefix === 'Stop';
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter available properties based on search query
  const filteredProperties = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableProperties.filter(p => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.locality && p.locality.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.bhk && p.bhk.toLowerCase().includes(q))
      );
    });
  }, [availableProperties, search]);

  const handleAddProperty = (title: string) => {
    if (!selectedProperties.includes(title)) {
      onChange([...selectedProperties, title]);
    }
    setIsOpen(false);
    setSearch('');
  };

  const handleRemoveProperty = (indexToRemove: number) => {
    onChange(selectedProperties.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...selectedProperties];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= selectedProperties.length - 1) return;
    const updated = [...selectedProperties];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Label and Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {selectedProperties.length > 0 && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 12,
            backgroundColor: selectedProperties.length > 1 ? '#dcfce7' : '#f1f5f9',
            color: selectedProperties.length > 1 ? '#15803d' : '#475569'
          }}>
            {selectedProperties.length} {selectedProperties.length === 1 ? `${itemPrefix} Selected` : (itemBadgeLabel || (isTour ? 'Properties in Tour Itinerary' : 'Properties Selected'))}
          </span>
        )}
      </div>

      {/* Selected Itinerary Stops List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {selectedProperties.map((propTitle, idx) => {
          const detail = availableProperties.find(p => p.title.trim().toLowerCase() === propTitle.trim().toLowerCase());
          return (
            <div
              key={`${propTitle}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 8,
                gap: 10,
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                {/* Stop Order Pill */}
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {itemPrefix} {idx + 1}
                </span>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {propTitle}
                  </div>
                  {detail && (
                    <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                      {detail.locality && <span>📍 {detail.locality}</span>}
                      {detail.bhk && <span>• {detail.bhk}</span>}
                      {detail.price ? <span>• {formatINR(detail.price)}</span> : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Reorder and Delete controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {selectedProperties.length > 1 && (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      title={isTour ? 'Move Up in Tour' : 'Move Up'}
                      style={{
                        background: 'none',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        color: idx === 0 ? '#cbd5e1' : '#475569',
                        backgroundColor: '#fff'
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === selectedProperties.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      title={isTour ? 'Move Down in Tour' : 'Move Down'}
                      style={{
                        background: 'none',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        cursor: idx === selectedProperties.length - 1 ? 'not-allowed' : 'pointer',
                        color: idx === selectedProperties.length - 1 ? '#cbd5e1' : '#475569',
                        backgroundColor: '#fff'
                      }}
                    >
                      ▼
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveProperty(idx)}
                  title={isTour ? 'Remove from Tour' : 'Remove'}
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    padding: '4px 6px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 4
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fca5a5')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                >
                  <XIcon size={12} color="#dc2626" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Another Property Button / Dropdown */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearch('');
          }}
          style={{
            width: '100%',
            padding: '9px 12px',
            border: isOpen ? '1.5px solid var(--primary, #10b981)' : '1.5px dashed #94a3b8',
            borderRadius: 8,
            backgroundColor: isOpen ? '#f0fdf4' : '#ffffff',
            color: 'var(--primary, #10b981)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            if (!isOpen) e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
          onMouseLeave={e => {
            if (!isOpen) e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <PlusIcon size={15} color="currentColor" strokeWidth={2.5} />
          <span>
            {selectedProperties.length === 0 
              ? (addFirstLabel || (isTour ? 'Select First Stop / Property' : 'Select Property Asset')) 
              : (addMoreLabel || (isTour ? `+ Add Another Stop (${itemPrefix} ${selectedProperties.length + 1})` : `+ Add Another Property`))}
          </span>
        </button>

        {/* Dropdown with search */}
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
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
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
                placeholder="Search property by title, locality, or BHK..."
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
                  if (e.key === 'Enter' && filteredProperties.length > 0) {
                    e.preventDefault();
                    handleAddProperty(filteredProperties[0].title);
                  }
                }}
              />
            </div>

            {/* Properties List */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
              {filteredProperties.length === 0 ? (
                <div style={{ padding: '16px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No matching properties found
                </div>
              ) : (
                filteredProperties.map(prop => {
                  const isAlreadyAdded = selectedProperties.includes(prop.title);
                  return (
                    <div
                      key={prop.title}
                      role="button"
                      tabIndex={0}
                      onClick={() => !isAlreadyAdded && handleAddProperty(prop.title)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: isAlreadyAdded ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        backgroundColor: isAlreadyAdded ? '#f1f5f9' : 'transparent',
                        opacity: isAlreadyAdded ? 0.6 : 1,
                        transition: 'background-color 0.1s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isAlreadyAdded) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={e => {
                        if (!isAlreadyAdded) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prop.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                          {prop.locality && <span>📍 {prop.locality}</span>}
                          {prop.bhk && <span>• {prop.bhk}</span>}
                          {prop.price ? <span>• {formatINR(prop.price)}</span> : null}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {isAlreadyAdded ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                            {isTour ? 'Added' : 'Selected'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary, #10b981)' }}>
                            {selectActionLabel || (isTour ? '+ Add Stop' : '+ Select')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {onAddNewProperty && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setIsOpen(false);
                  onAddNewProperty();
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
                  gap: 6
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <PlusIcon size={14} color="currentColor" strokeWidth={2.5} />
                <span>+ Create New Property in Inventory...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
