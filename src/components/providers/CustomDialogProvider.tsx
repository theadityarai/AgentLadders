'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface DialogOptions {
  title?: string;
  message: string;
  type?: 'alert' | 'confirm';
  variant?: 'info' | 'success' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface CustomDialogContextType {
  showAlert: (message: string, title?: string, variant?: 'info' | 'success' | 'warning' | 'danger') => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string, variant?: 'warning' | 'danger') => void;
}

const CustomDialogContext = createContext<CustomDialogContextType>({
  showAlert: () => {},
  showConfirm: () => {}
});

export function useCustomDialog() {
  return useContext(CustomDialogContext);
}

export default function CustomDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const showAlert = useCallback((message: string, title: string = 'Notice', variant: 'info' | 'success' | 'warning' | 'danger' = 'info') => {
    setDialog({
      title,
      message,
      type: 'alert',
      variant,
      confirmText: 'OK',
    });
  }, []);

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = 'Confirmation',
    variant: 'warning' | 'danger' = 'warning'
  ) => {
    setDialog({
      title,
      message,
      type: 'confirm',
      variant,
      confirmText: variant === 'danger' ? 'Yes, Delete' : 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  // Intercept native browser alert and confirm
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalAlert = window.alert;

    window.alert = (message?: any) => {
      const msgStr = typeof message === 'string' ? message : String(message || '');
      showAlert(msgStr, 'AgentLadders Notice', 'info');
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialog) return;
      if (e.key === 'Escape') {
        if (dialog.onCancel) dialog.onCancel();
        closeDialog();
      }
      if (e.key === 'Enter') {
        if (dialog.onConfirm) dialog.onConfirm();
        closeDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, closeDialog]);

  const getVariantStyles = (variant: string = 'info') => {
    switch (variant) {
      case 'success':
        return {
          icon: '✅',
          iconBg: '#f0fdf4',
          iconColor: '#16a34a',
          buttonBg: 'var(--primary, #059669)',
          buttonHover: 'var(--primary-dark, #047857)'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: '#fffbeb',
          iconColor: '#d97706',
          buttonBg: '#d97706',
          buttonHover: '#b45309'
        };
      case 'danger':
        return {
          icon: '🗑️',
          iconBg: '#fef2f2',
          iconColor: '#dc2626',
          buttonBg: '#dc2626',
          buttonHover: '#b91c1c'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          buttonBg: 'var(--primary, #2563eb)',
          buttonHover: 'var(--primary-dark, #1d4ed8)'
        };
    }
  };

  const styles = dialog ? getVariantStyles(dialog.variant) : null;

  return (
    <CustomDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Global Custom Modal Dialog */}
      {dialog && styles && (
        <div
          onClick={closeDialog}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px',
            animation: 'fadeInDialog 0.15s ease-out'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              animation: 'scaleUpDialog 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: styles.iconBg,
                    color: styles.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0
                  }}
                >
                  {styles.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {dialog.title || 'Notice'}
                  </h3>
                  <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {dialog.message}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  onClick={() => {
                    if (dialog.onCancel) dialog.onCancel();
                    closeDialog();
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  {dialog.cancelText || 'Cancel'}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  closeDialog();
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: styles.buttonBg,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = styles.buttonHover)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = styles.buttonBg)}
              >
                {dialog.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInDialog {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUpDialog {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </CustomDialogContext.Provider>
  );
}
