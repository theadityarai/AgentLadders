'use client';

import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export function Toast({ toast, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#15803d',
      icon: '✅'
    },
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      color: '#b91c1c',
      icon: '❌'
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      color: '#b45309',
      icon: '⚠️'
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#1d4ed8',
      icon: 'ℹ️'
    }
  }[toast.type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 10000,
        backgroundColor: typeConfig.bg,
        border: `1px solid ${typeConfig.border}`,
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '400px',
        animation: 'slideInRight 0.2s ease-out'
      }}
    >
      <span style={{ fontSize: '18px' }}>{typeConfig.icon}</span>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <div style={{ fontWeight: 600, fontSize: '14px', color: typeConfig.color, marginBottom: '2px' }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#1e293b' }}>{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          fontSize: '14px',
          padding: '2px 4px',
          borderRadius: '4px'
        }}
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
