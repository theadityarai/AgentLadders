'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PublicDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  description?: string;
  relatedTo?: string;
  fileData?: string;
  uploadedBy: string;
  createdAt: string;
  agencyName: string;
  agencyPhone?: string;
}

function getFileIcon(type: string, name: string = ''): string {
  const t = (type + ' ' + name).toLowerCase();
  if (t.includes('pdf')) return '📕';
  if (t.includes('image') || t.includes('jpg') || t.includes('png') || t.includes('webp')) return '🖼️';
  if (t.includes('sheet') || t.includes('excel') || t.includes('csv') || t.includes('xls')) return '📊';
  if (t.includes('word') || t.includes('doc')) return '📘';
  if (t.includes('contract') || t.includes('mou') || t.includes('agreement')) return '📜';
  if (t.includes('receipt') || t.includes('token') || t.includes('invoice')) return '🧾';
  return '📄';
}

function DocumentViewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const shouldAutoDownload = searchParams?.get('download') === '1';

  const [doc, setDoc] = useState<PublicDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/public/document/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Document not found or link has expired.');
        }
        return res.json();
      })
      .then((data: PublicDocument) => {
        setDoc(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load document.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Handle direct download
  const handleDownload = () => {
    if (!doc) return;
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([`Document: ${doc.name}\nType: ${doc.type}\nVerified by ${doc.agencyName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name.endsWith('.txt') ? doc.name : `${doc.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Auto-download if ?download=1
  useEffect(() => {
    if (doc && shouldAutoDownload && !downloadTriggered) {
      setDownloadTriggered(true);
      handleDownload();
    }
  }, [doc, shouldAutoDownload, downloadTriggered]);

  const handleWhatsAppContact = () => {
    if (!doc) return;
    const phone = doc.agencyPhone ? doc.agencyPhone.replace(/[^0-9]/g, '') : '';
    const msg = `Hello ${doc.agencyName}, I am reviewing the document "${doc.name}" shared with me.`;
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#059669',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <div style={{ fontSize: '15px', color: '#475569', fontWeight: 600 }}>
          Retrieving secure document...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '36px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Document Unavailable
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}>
            {error || 'This document link may have expired or been removed from the agency vault.'}
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Go to AgentLadders Home
          </Link>
        </div>
      </div>
    );
  }

  const icon = getFileIcon(doc.type, doc.name);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px 40px'
    }}>
      {/* Top Navbar */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '16px'
          }}>
            AL
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{doc.agencyName}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Verified Agency Document Vault</div>
          </div>
        </div>

        <div style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#059669',
          backgroundColor: '#ecfdf5',
          border: '1px solid #bbf7d0',
          padding: '4px 10px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>✓</span>
          <span>Verified Secure</span>
        </div>
      </div>

      {/* Main Document Container Card */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Document Header Hero */}
        <div style={{
          padding: '28px 24px 22px',
          borderBottom: '1px solid #f1f5f9',
          textAlign: 'center',
          backgroundColor: '#fafafa'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            {icon}
          </div>

          <div style={{
            display: 'inline-block',
            fontSize: '11.5px',
            fontWeight: 700,
            color: doc.category === 'Others' ? '#64748b' : '#059669',
            backgroundColor: doc.category === 'Others' ? '#f1f5f9' : '#ecfdf5',
            padding: '3px 10px',
            borderRadius: '14px',
            marginBottom: '8px'
          }}>
            {doc.category || 'General Document'}
          </div>

          <h1 style={{
            fontSize: '19px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px',
            wordBreak: 'break-word',
            lineHeight: 1.3
          }}>
            {doc.name}
          </h1>

          <div style={{
            fontSize: '12.5px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span>{doc.type}</span>
            <span>•</span>
            <span>{doc.size}</span>
            <span>•</span>
            <span>Shared on {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Notes / Remarks Callout if present */}
          {doc.description && (
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📝</span> Notes from Agent
              </div>
              <div style={{ fontSize: '13.5px', color: '#1e3a8a', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {doc.description}
              </div>
            </div>
          )}

          {/* Associated Entity Chips if present */}
          {doc.relatedTo && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Associated CRM Record
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {doc.relatedTo.split(', ').filter(Boolean).map((rel, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '3px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    {rel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* In-Browser Preview (for images) */}
          {doc.fileData && doc.fileData.startsWith('data:image') && (
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '14px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <img
                src={doc.fileData}
                alt={doc.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '380px',
                  borderRadius: '8px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          {/* Big Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Direct Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.28)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <span style={{ fontSize: '18px' }}>⬇️</span>
              <span>Download &ldquo;{doc.name}&rdquo;</span>
            </button>

            {/* Contact Agency Button */}
            <button
              type="button"
              onClick={handleWhatsAppContact}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#15803d',
                border: '1.5px solid #86efac',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <span style={{ fontSize: '17px' }}>💬</span>
              <span>Ask a Question on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: '11.5px',
          color: '#94a3b8'
        }}>
          Shared securely via <strong>AgentLadders Document Vault</strong> • Direct access link
        </div>
      </div>
    </div>
  );
}

export default function PublicDocumentViewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
        Loading document...
      </div>
    }>
      <DocumentViewContent />
    </Suspense>
  );
}
