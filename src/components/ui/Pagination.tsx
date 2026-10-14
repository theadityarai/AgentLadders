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
 * Computes an array of page numbers with ellipses
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
  const safeTotalPages = Math.max(1, totalPages || 1);
  const pageNumbers = getPageNumbers(currentPage, safeTotalPages);

  // Calculate item range
  const startItem = totalItems !== undefined && pageSize ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : null;
  const endItem = totalItems !== undefined && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div
      className={`modern-pagination-wrapper ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '12px 18px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '13px',
        color: '#475569',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Left side: Item count summary & Rows-per-page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {totalItems !== undefined && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12.5px'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--primary, #059669)',
              boxShadow: '0 0 6px rgba(5, 150, 105, 0.45)'
            }} />
            <span style={{ color: '#475569', fontWeight: 500 }}>
              {startItem && endItem ? (
                <>
                  Showing <strong style={{ color: '#0f172a', fontWeight: 700 }}>{startItem}–{endItem}</strong> of{' '}
                  <strong style={{ color: '#0f172a', fontWeight: 700 }}>{totalItems}</strong> {itemLabel}
                </>
              ) : (
                <>
                  Total <strong style={{ color: '#0f172a', fontWeight: 700 }}>{totalItems}</strong> {itemLabel}
                </>
              )}
            </span>
          </div>
        )}

        {showPageSizeSelector && pageSize && onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Rows:</span>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Rows per page"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  padding: '5px 24px 5px 10px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary, #059669)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ position: 'absolute', right: 7, pointerEvents: 'none' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Right side: Page navigation buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage <= 1 ? '#f8fafc' : '#ffffff',
            color: currentPage <= 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: currentPage <= 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={(e) => {
            if (currentPage > 1) {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage > 1) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="pagination-text">Prev</span>
        </button>

        {/* Desktop Page Numbers */}
        <div className="pagination-pages-desktop" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  style={{
                    padding: '0 6px',
                    color: '#94a3b8',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '1px'
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
                aria-label={`Page ${page}`}
                style={{
                  minWidth: '34px',
                  height: '34px',
                  padding: '0 8px',
                  borderRadius: '8px',
                  border: isActive ? 'none' : '1px solid #e2e8f0',
                  background: isActive ? 'var(--primary, #059669)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 2px 8px rgba(5, 150, 105, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile Page Indicator */}
        <div className="pagination-pages-mobile" style={{ display: 'none', padding: '0 8px', fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
          {currentPage} / {safeTotalPages}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          aria-label="Next page"
          title="Next page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            height: '34px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage >= safeTotalPages ? '#f8fafc' : '#ffffff',
            color: currentPage >= safeTotalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage >= safeTotalPages ? 'not-allowed' : 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: currentPage >= safeTotalPages ? 'none' : '0 1px 2px rgba(0,0,0,0.04)'
          }}
          onMouseEnter={(e) => {
            if (currentPage < safeTotalPages) {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage < safeTotalPages) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }
          }}
        >
          <span className="pagination-text">Next</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Responsive mobile handling */}
      <style>{`
        @media (max-width: 640px) {
          .modern-pagination-wrapper {
            justify-content: center !important;
          }
          .pagination-pages-desktop {
            display: none !important;
          }
          .pagination-pages-mobile {
            display: block !important;
          }
          .pagination-text {
            display: none !important;
          }
        }
      `}</style>
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
