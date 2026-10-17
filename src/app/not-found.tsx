'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
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
      overflow: 'hidden',
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '36px 32px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Icon */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)'
        }}>
          <span style={{ fontSize: '24px' }}>🏢</span>
        </div>

        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          marginBottom: '16px'
        }}>
          ERROR 404 • RECORD NOT FOUND
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: '#ffffff',
          margin: '0 0 10px',
          lineHeight: 1.2
        }}>
          Looking for a missing listing?
        </h1>

        <p style={{
          fontSize: '14.5px',
          color: '#94a3b8',
          lineHeight: 1.6,
          margin: '0 0 28px'
        }}>
          The page, property showcase, or document you requested cannot be located. It may have been archived, transferred, or the URL might contain a typo.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/dashboard"
            style={{
              flex: '1 1 180px',
              maxWidth: '220px',
              padding: '12px 20px',
              backgroundColor: '#059669',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>⚡ Open Dashboard</span>
          </Link>

          <Link
            href="/"
            style={{
              flex: '1 1 180px',
              maxWidth: '220px',
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>🏠 Home Page</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '28px',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <Link href="/dashboard/properties" style={{ color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
            Properties
          </Link>
          <Link href="/dashboard/leads" style={{ color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
            Inquiries
          </Link>
          <Link href="/dashboard/site-visits" style={{ color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
            Site Visits
          </Link>
          <Link href="/help" style={{ color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
            Help & Legal
          </Link>
          <Link href="/login" style={{ color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
