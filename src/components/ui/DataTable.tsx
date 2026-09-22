import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  onResetFilters?: () => void;
}

export function DataTable<T extends Record<string, unknown>>({ 
  data, 
  columns, 
  onRowClick, 
  emptyMessage = 'No matching records found.', 
  onResetFilters 
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '50px 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        margin: '0 24px',
        border: '1px dashed #cbd5e1',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0' }}>
          {emptyMessage}
        </h4>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>
          Try clearing your search query or selecting a different filter category.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      margin: '0 24px', 
      backgroundColor: '#ffffff', 
      borderRadius: '12px', 
      border: '1px solid #e2e8f0', 
      overflow: 'hidden', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' 
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ 
                    padding: '14px 20px', 
                    fontWeight: 600, 
                    color: '#475569', 
                    textTransform: 'uppercase', 
                    fontSize: '11px', 
                    letterSpacing: '0.05em' 
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ 
                  borderBottom: rowIndex === data.length - 1 ? 'none' : '1px solid #f1f5f9',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ padding: '16px 20px', color: '#1e293b' }}>
                    {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
