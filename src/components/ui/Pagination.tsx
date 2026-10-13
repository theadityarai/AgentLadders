'use client';

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  showPageSizeSelector?: boolean;
}

/**
 * Computes an array of page numbers with ellipses (-1 represents '...')
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Always include page 1
  pages.push(1);

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  // Window around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  // Always include last page
  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  itemLabel = 'records',
  className = '',
  style,
  showPageSizeSelector = true
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 10))) {
    // If only 1 page and no items or total items fit on 1 page, we can still show a minimal footer if totalItems is passed
    if (!totalItems) return null;
  }

  const pageNumbers = getPageNumbers(currentPage, Math.max(1, totalPages));

  // Calculate item range
  const startItem = totalItems && pageSize ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : null;
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div
      className={`pagination-container ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '0 0 12px 12px',
        fontSize: '13px',
        color: '#475569',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Left side: Item count summary & optional page size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {totalItems !== undefined && (
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {startItem && endItem ? (
              <>
                Showing <strong style={{ color: '#0f172a' }}>{startItem}–{endItem}</strong> of{' '}
                <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemLabel}
              </>
            ) : (
              <>
                Total <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemLabel}
              </>
            )}
          </span>
        )}

        {showPageSizeSelector && pageSize && onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation buttons */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage <= 1 ? '#f8fafc' : '#ffffff',
              color: currentPage <= 1 ? '#cbd5e1' : '#334155',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="pagination-text">Prev</span>
          </button>

          {/* Page numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {pageNumbers.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    style={{
                      padding: '0 6px',
                      color: '#94a3b8',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    …
                  </span>
                );
              }

              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0 8px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid #0f172a' : '1px solid transparent',
                    backgroundColor: isActive ? '#0f172a' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#ffffff',
              color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <span className="pagination-text">Next</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Convenient React hook to manage pagination state and slice arrays.
 */
export function usePagination<T>(items: T[], initialPageSize: number = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset page if it exceeds new total pages
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Paginated items slice
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    paginationProps: {
      currentPage,
      totalPages,
      onPageChange: setCurrentPage,
      totalItems: items.length,
      pageSize,
      onPageSizeChange: (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
      }
    }
  };
}
