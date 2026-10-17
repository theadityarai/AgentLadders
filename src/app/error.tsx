'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error monitoring service in production
    console.error('[Production Error Boundary caught exception]:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '36px 32px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          fontSize: '24px'
        }}>
          ⚠️
        </div>

        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: '14px'
        }}>
          UNEXPECTED APPLICATION STATE
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#ffffff',
          margin: '0 0 10px',
          letterSpacing: '-0.3px'
        }}>
          Something went wrong
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          lineHeight: 1.55,
          margin: '0 0 24px'
        }}>
          An unexpected glitch interrupted your request. Your CRM data is safe. Try reloading the active view or return to the dashboard.
        </p>

        {error?.digest && (
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            color: '#64748b',
            fontFamily: 'monospace',
            marginBottom: '24px',
            wordBreak: 'break-all'
          }}>
            Incident Digest: {error.digest}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              flex: '1 1 140px',
              maxWidth: '180px',
              padding: '12px 18px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}
          >
            🔄 Try Again
          </button>

          <Link
            href="/dashboard"
            style={{
              flex: '1 1 140px',
              maxWidth: '180px',
              padding: '12px 18px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
