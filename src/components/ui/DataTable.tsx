'use client';

import React, { useState, useMemo } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';

export interface Column<T> {
  key?: keyof T | string;
  label?: string;
  header?: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface PaginationConfig {
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  loading?: boolean;
  pagination?: boolean | PaginationConfig;
  className?: string;
  style?: React.CSSProperties;
}

export function DataTable<T extends Record<string, unknown>>({ 
  data, 
  columns, 
  onRowClick, 
  emptyMessage = 'No matching records found', 
  emptyDescription = 'Try adjusting your search query or selecting a different filter.',
  onResetFilters,
  loading = false,
  pagination = true,
  className = '',
  style
}: DataTableProps<T>) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const defaultPageSize = typeof pagination === 'object' && pagination.pageSize ? pagination.pageSize : 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Compute total pages
  const totalItems = data ? data.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset page when data shrinks below current page
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Paginate records if pagination is enabled
  const displayData = useMemo(() => {
    if (!pagination || !data) return data;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, pagination, currentPage, pageSize]);

  if (loading) {
    return (
      <div 
        className={`responsive-table-container ${className}`} 
        style={{
          padding: '60px 24px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: 500,
          ...style
        }}
      >
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary, #059669)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <div>Loading records...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        action={onResetFilters ? { label: 'Clear Filters', onClick: onResetFilters, variant: 'primary' } : undefined}
        style={style}
      />
    );
  }

  const paginationConfig = typeof pagination === 'object' ? pagination : {};

  return (
    <div 
      className={`responsive-table-container ${className}`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        ...style
      }}
    >
      <div className="responsive-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ 
                    padding: '13px 18px', 
                    fontWeight: 700, 
                    color: '#475569', 
                    textTransform: 'uppercase', 
                    fontSize: '11px', 
                    letterSpacing: '0.05em',
                    textAlign: col.align || 'left',
                    width: col.width
                  }}
                >
                  {col.header ?? col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ 
                  borderBottom: rowIndex === displayData.length - 1 && !pagination ? 'none' : '1px solid #f1f5f9',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    style={{ 
                      padding: '14px 18px', 
                      color: '#1e293b',
                      textAlign: col.align || 'left'
                    }}
                  >
                    {col.render 
                      ? col.render(row) 
                      : col.accessor 
                        ? col.accessor(row) 
                        : (col.key ? (row[col.key as keyof T] as React.ReactNode) : null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Built-in Pagination */}
      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={paginationConfig.pageSizeOptions || [10, 25, 50]}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          showPageSizeSelector={paginationConfig.showPageSizeSelector ?? true}
          style={{ border: 'none', borderTop: '1px solid #e2e8f0', borderRadius: '0 0 12px 12px', boxShadow: 'none' }}
        />
      )}
    </div>
  );
}
