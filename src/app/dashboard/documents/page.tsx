'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { SearchBar } from '@/components/ui/SearchBar';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  fileData?: string;
  uploadedBy: string;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('pdf')) return '📕';
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return '🖼️';
  if (t.includes('spreadsheet') || t.includes('excel') || t.includes('csv')) return '📊';
  if (t.includes('word') || t.includes('doc')) return '📘';
  return '📄';
}

export default function DocumentsPage() {
  const [data, setData] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Custom dialog & feedback states
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showUpload) {
        setShowUpload(false);
        setSelectedFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpload]);

  const loadDocuments = () => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(json => {
        if (json.documents) setData(json.documents);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFileDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    let docType = 'General Document';
    if (selectedFile.type.includes('pdf')) docType = 'PDF';
    if (selectedFile.type.includes('image')) docType = 'Image';
    if (selectedFile.type.includes('sheet') || selectedFile.type.includes('csv')) docType = 'Spreadsheet';

    const payload = {
      name: selectedFile.name,
      type: docType,
      size: formatFileSize(selectedFile.size),
      fileData: fileDataUrl,
    };

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowUpload(false);
        setSelectedFile(null);
        setFileDataUrl('');
        setToast({ id: Date.now().toString(), type: 'success', title: 'Uploaded', message: 'Document uploaded successfully!' });
        loadDocuments();
      } else {
        setToast({ id: Date.now().toString(), type: 'error', title: 'Upload Failed', message: 'Failed to upload document.' });
      }
    } catch (err) {
      console.error(err);
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Network error while uploading.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docToDelete.id })
      });
      if (res.ok) {
        setToast({ id: Date.now().toString(), type: 'success', title: 'Deleted', message: `"${docToDelete.name}" deleted successfully.` });
        setDocToDelete(null);
        loadDocuments();
      } else {
        setToast({ id: Date.now().toString(), type: 'error', title: 'Delete Failed', message: 'Failed to delete document.' });
      }
    } catch (err) {
      console.error(err);
      setToast({ id: Date.now().toString(), type: 'error', title: 'Delete Error', message: 'An error occurred while deleting document.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = data.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Loading documents...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Upload Modal */}
      {showUpload && (
        <div onClick={() => { setShowUpload(false); setSelectedFile(null); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} className="responsive-modal animate-enter" style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                Upload Document <InfoTooltip text="Upload client KYC, brochures, or property agreements securely." />
              </h2>
              <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ padding: 24 }}>
              {!selectedFile ? (
                <div 
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: `2px dashed ${dragActive ? '#059669' : '#cbd5e1'}`, 
                    backgroundColor: dragActive ? '#f0fdf4' : '#f8fafc',
                    borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFile(e.target.files[0])} style={{ display: 'none' }} />
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Click or drag file to this area to upload</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.</div>
                </div>
              ) : (
                <div style={{ padding: 20, backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 24 }}>{getFileIcon(selectedFile.type || selectedFile.name)}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                  </div>
                  
                  <button 
                    onClick={handleUploadSubmit} 
                    disabled={isUploading}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isUploading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-page-container animate-enter">
      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
            Documents <InfoTooltip text="Your centralized file storage. Attachments here can be linked directly to deals or client profiles." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            Securely manage brochures, contracts, and KYC forms.
          </p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          style={{
            backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(5,150,105,0.25)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#047857')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#059669')}
        >
          + Upload File
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search documents by name or type..."
          maxWidth={320}
        />
      </div>

      {/* Documents Grid */}
      {filteredData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff', borderRadius: 16, border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>No documents found</div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Upload your first brochure or agreement.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filteredData.map(doc => (
            <div key={doc.id} style={{ 
              backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20,
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex', flexDirection: 'column'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: 32 }}>{getFileIcon(doc.type)}</div>
                <button 
                  onClick={() => setDocToDelete(doc)} 
                  title="Delete Document"
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, borderRadius: 4 }} 
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'} 
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.name}>
                  {doc.name}
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </div>
                {doc.fileData ? (
                  <a 
                    href={doc.fileData} 
                    download={doc.name}
                    style={{ textDecoration: 'none', padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'background-color 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  >
                    Download
                  </a>
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>No File</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!docToDelete}
        title="Delete Document"
        message={
          <span>
            Are you sure you want to permanently delete <strong>{docToDelete?.name}</strong>? This action cannot be undone.
          </span>
        }
        confirmText="Delete Document"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocToDelete(null)}
      />

      {/* Custom Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
