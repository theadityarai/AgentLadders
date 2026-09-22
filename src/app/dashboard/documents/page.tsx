'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface DocumentItem {
  [key: string]: unknown;
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

function detectDocumentType(fileName: string, mimeType: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf' || mimeType.includes('pdf')) return 'PDF';
  if (['doc', 'docx'].includes(ext) || mimeType.includes('word')) return 'Word Document';
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('sheet') || mimeType.includes('csv')) return 'Spreadsheet';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) || mimeType.startsWith('image/')) return 'Image';
  if (['txt', 'rtf'].includes(ext)) return 'Text Document';
  if (['zip', 'rar', '7z'].includes(ext)) return 'Archive';
  return 'General Document';
}

export default function DocumentsPage() {
  const [data, setData] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Delete modal state
  const [docToDelete, setDocToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Selected file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Sales Contract');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');

  // Table filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const json = await res.json();
      if (json.documents) setData(json.documents);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setDocName(file.name);
    
    // Convert to Data URL for real client-side downloadability
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

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

  const resetModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setDocName('');
    setFileDataUrl('');
    setDocCategory('Sales Contract');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !docName) return;

    setIsUploading(true);
    try {
      const payload = {
        name: docName || selectedFile?.name || 'Document.pdf',
        type: docCategory || (selectedFile ? detectDocumentType(selectedFile.name, selectedFile.type) : 'Document'),
        size: selectedFile ? formatFileSize(selectedFile.size) : '1.0 MB',
        fileData: fileDataUrl
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetModal();
        loadDocuments();
      }
    } catch (err) {
      console.error('Error saving document', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDocToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents?id=${docToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(d => d.id !== docToDelete.id));
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a mock download for legacy documents without fileData
      const blob = new Blob([`AgentLadders Document: ${doc.name}\nType: ${doc.type}\nUploaded By: ${doc.uploadedBy}\nDate: ${doc.createdAt}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name.includes('.') ? doc.name : `${doc.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const columns: Column<DocumentItem>[] = [
    {
      key: 'name',
      label: 'Document Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontSize: '18px'
          }}>
            📄
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{r.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Category',
      render: (r) => (
        <span style={{
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 500,
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #dbeafe'
        }}>
          {r.type}
        </span>
      )
    },
    {
      key: 'size',
      label: 'Size',
      render: (r) => <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>{r.size}</span>
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded By',
      render: (r) => <span style={{ color: '#475569', fontSize: '13px' }}>{r.uploadedBy}</span>
    },
    {
      key: 'createdAt',
      label: 'Upload Date',
      render: (r) => <span style={{ color: '#64748b', fontSize: '13px' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleDownload(r)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Download Document"
          >
            ⬇️ Download
          </button>
          <button
            onClick={() => handleDelete(r.id, r.name)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e11d48'
            }}
            title="Delete Document"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  const filteredData = useMemo(() => {
    return data.filter(doc => {
      const matchesSearch = 
        !searchQuery.trim() ||
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || doc.type === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [data, searchQuery, categoryFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
  };

  return (
    <>
      <PageHeader
        title="Document Management"
        subtitle="Securely store, organize, and download agency contracts, title deeds, and KYC records"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Upload File
          </Button>
        }
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search documents by title or file name..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'All' },
              { label: 'Sales Contract', value: 'Sales Contract' },
              { label: 'Title Deed', value: 'Title Deed' },
              { label: 'KYC / Passport', value: 'KYC / Passport' },
              { label: 'Floor Plan & Blueprint', value: 'Floor Plan & Blueprint' },
              { label: 'Marketing Brochure', value: 'Marketing Brochure' },
              { label: 'General Document', value: 'General Document' }
            ]
          }
        ]}
      />

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <p>Loading documents...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '32px auto'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>No documents uploaded yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            Keep all your agency contracts, customer KYC files, title deeds, and marketing brochures organized in one place.
          </p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Upload First Document
          </Button>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No documents match your filters"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '28px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Upload Document</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Select a file from your device to attach to your agency repository</p>
              </div>
              <button
                type="button"
                onClick={resetModal}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* File Dropzone / Selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Select File <span style={{ color: '#ef4444' }}>*</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  id="document-file-input"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.txt"
                />

                {!selectedFile ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragActive ? '#2563eb' : '#cbd5e1'}`,
                      backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                      borderRadius: '10px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      Click to browse or drag and drop
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      PDF, DOCX, XLSX, PNG, JPG, or TXT (up to 25MB)
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '24px' }}>📄</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatFileSize(selectedFile.size)} • {detectDocumentType(selectedFile.name, selectedFile.type)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setDocName('');
                        setFileDataUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '4px 8px'
                      }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Document Name / Title */}
              <div>
                <label htmlFor="doc-title-input" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Document Title
                </label>
                <input
                  id="doc-title-input"
                  required
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. Sales Purchase Agreement - Villa 4B"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="doc-category-select" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Category
                </label>
                <select
                  id="doc-category-select"
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Sales Contract">Sales Contract</option>
                  <option value="Tenancy Agreement">Tenancy Agreement</option>
                  <option value="Title Deed">Title Deed</option>
                  <option value="KYC / Passport">KYC / Identification</option>
                  <option value="Property Inspection">Property Inspection Report</option>
                  <option value="Floor Plan & Blueprint">Floor Plan & Blueprint</option>
                  <option value="Marketing Brochure">Marketing Brochure</option>
                  <option value="Invoice & Commission">Invoice & Commission</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <Button type="button" variant="ghost" onClick={resetModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUploading || (!selectedFile && !docName)}
                >
                  {isUploading ? 'Uploading...' : 'Save Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!docToDelete}
        title="Delete Document"
        message={
          <>
            Are you sure you want to permanently delete <strong>&ldquo;{docToDelete?.name}&rdquo;</strong>? 
            This file will be permanently removed from secure agency cloud storage.
          </>
        }
        confirmText="Delete File"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocToDelete(null)}
      />
    </>
  );
}
