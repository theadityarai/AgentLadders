'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterTabs } from '@/components/ui/FilterTabs';
import {
  FileTextIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  BuildingIcon,
  UsersIcon,
  BriefcaseIcon,
  WhatsAppIcon,
  EditIcon,
  ExternalLinkIcon,
  PrinterIcon
} from '@/components/icons/NavIcons';
import { ShareModal } from '@/components/ui/ShareModal';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category?: string;
  size: string;
  fileData?: string;
  uploadedBy: string;
  relatedTo?: string;
  description?: string;
  createdAt: string;
}

const DOCUMENT_CATEGORIES = [
  'All',
  'Contracts & MOUs',
  'Client KYC & Identity',
  'Brochures & Floor Plans',
  'Title Deeds & OC',
  'Payment Receipts',
  'Others'
] as const;

type DocCategory = typeof DOCUMENT_CATEGORIES[number];

// Standard legal & operational real estate starter templates
const REAL_ESTATE_TEMPLATES = [
  {
    title: 'Sole Selling Brokerage Agreement',
    category: 'Contracts & MOUs',
    format: 'PDF / DOC',
    desc: 'Standard RERA compliant agency mandate granting exclusive or semi-exclusive marketing rights.',
    sampleFileName: 'Agency_Sole_Selling_Rights_Mandate.pdf'
  },
  {
    title: 'Client Tenant Verification Form',
    category: 'Client KYC & Identity',
    format: 'PDF Form',
    desc: 'Police intimation and identity declaration form for residential rental agreements.',
    sampleFileName: 'Tenant_Police_Verification_KYC.pdf'
  },
  {
    title: 'Token Advance Acknowledgment Receipt',
    category: 'Payment Receipts',
    format: 'PDF Document',
    desc: 'Official earnest money receipt with non-refundable clauses and title escrow timeline.',
    sampleFileName: 'Token_Advance_Escrow_Receipt.pdf'
  },
  {
    title: 'Property Handover Inspection Checklist',
    category: 'Brochures & Floor Plans',
    format: 'Audit Sheet',
    desc: 'Room-by-room inventory, fittings, keys, electricity meter reading, and possession signoff.',
    sampleFileName: 'Possession_Handover_Inspection_Checklist.pdf'
  }
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

export default function DocumentsPage() {
  const [data, setData] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<DocCategory>('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modals & Feedback
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [viewerEngine, setViewerEngine] = useState<'native' | 'google'>('native');
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setViewerEngine('native');
    setPreviewZoom(1);
    setPreviewRotation(0);
  };

  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Multi-select Link to Entity State (Upload)
  const [linkEntityType, setLinkEntityType] = useState<'Property' | 'Client' | 'Deal'>('Property');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [entityFilterQuery, setEntityFilterQuery] = useState('');

  // Edit Document State
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSelectedLinks, setEditSelectedLinks] = useState<string[]>([]);
  const [editEntityType, setEditEntityType] = useState<'Property' | 'Client' | 'Deal'>('Property');
  const [editEntityFilterQuery, setEditEntityFilterQuery] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // CRM entity lists
  const [propertiesList, setPropertiesList] = useState<{ id: string; title: string; locality?: string }[]>([]);
  const [clientsList, setClientsList] = useState<{ id: string; name: string; phone?: string }[]>([]);
  const [dealsList, setDealsList] = useState<{ id: string; title: string; stage?: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = () => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(json => {
        if (json.documents) setData(json.documents);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadCRMEntities = () => {
    Promise.all([
      fetch('/api/properties').then(r => r.json()).catch(() => ({})),
      fetch('/api/leads').then(r => r.json()).catch(() => ({})),
      fetch('/api/deals').then(r => r.json()).catch(() => ({}))
    ]).then(([propsRes, leadsRes, dealsRes]) => {
      setPropertiesList(propsRes.properties || []);
      setClientsList(leadsRes.leads || []);
      setDealsList(dealsRes.deals || []);
    }).catch(() => {});
  };

  useEffect(() => {
    loadDocuments();
    loadCRMEntities();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUpload) {
          setShowUpload(false);
          setSelectedFile(null);
        }
        if (editingDoc) setEditingDoc(null);
        if (previewDoc) setPreviewDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpload, editingDoc, previewDoc]);

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

  // Toggle multi-select link (Upload)
  const toggleLink = (formattedValue: string) => {
    setSelectedLinks(prev => {
      if (prev.includes(formattedValue)) {
        return prev.filter(v => v !== formattedValue);
      } else {
        return [...prev, formattedValue];
      }
    });
  };

  // Toggle multi-select link (Edit)
  const toggleEditLink = (formattedValue: string) => {
    setEditSelectedLinks(prev => {
      if (prev.includes(formattedValue)) {
        return prev.filter(v => v !== formattedValue);
      } else {
        return [...prev, formattedValue];
      }
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setEditName(doc.name);
    setEditCategory(doc.category || 'Contracts & MOUs');
    setEditDescription(doc.description || '');
    setEditSelectedLinks(doc.relatedTo ? doc.relatedTo.split(', ').filter(Boolean) : []);
    setEditEntityType('Property');
    setEditEntityFilterQuery('');
  };

  // Save Edit Changes (Metadata only, media preserved)
  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    if (!editName.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Name Required', message: 'Document title cannot be blank.' });
      return;
    }
    if (!editCategory.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Category Required', message: 'Please select a document category.' });
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDoc.id,
          name: editName.trim(),
          category: editCategory,
          description: editDescription.trim(),
          relatedTo: editSelectedLinks.join(', ')
        })
      });

      if (res.ok) {
        const json = await res.json();
        setData(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...json.document } : d));
        if (previewDoc && previewDoc.id === editingDoc.id) {
          setPreviewDoc(json.document);
        }
        setEditingDoc(null);
        setToast({ id: Date.now().toString(), type: 'success', title: 'Document Updated', message: `"${editName.trim()}" details updated successfully!` });
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ id: Date.now().toString(), type: 'error', title: 'Update Failed', message: err.error || 'Failed to update document.' });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Could not communicate with vault server.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'File Required', message: 'Please select a document file to upload.' });
      return;
    }
    if (!uploadCategory.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Category Required', message: 'Please select a document category.' });
      return;
    }
    setIsUploading(true);
    
    let docType = 'General Document';
    if (selectedFile.type.includes('pdf')) docType = 'PDF';
    else if (selectedFile.type.includes('image')) docType = 'Image';
    else if (selectedFile.type.includes('sheet') || selectedFile.type.includes('csv')) docType = 'Spreadsheet';
    else if (selectedFile.type.includes('word') || selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx')) docType = 'Word Document';

    const payload = {
      name: selectedFile.name,
      type: docType,
      category: uploadCategory,
      size: formatFileSize(selectedFile.size),
      relatedTo: selectedLinks.length > 0 ? selectedLinks.join(', ') : undefined,
      description: uploadDescription.trim() || undefined,
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
        setUploadDescription('');
        setSelectedLinks([]);
        setEntityFilterQuery('');
        setToast({ id: Date.now().toString(), type: 'success', title: 'Document Saved', message: `"${selectedFile.name}" stored securely in agency vault!` });
        loadDocuments();
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ id: Date.now().toString(), type: 'error', title: 'Upload Failed', message: err.error || 'Failed to upload document.' });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Failed to communicate with vault server.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents?id=${encodeURIComponent(docToDelete.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setToast({ id: Date.now().toString(), type: 'success', title: 'Document Removed', message: `"${docToDelete.name}" deleted from vault.` });
        setDocToDelete(null);
        loadDocuments();
      } else {
        setToast({ id: Date.now().toString(), type: 'error', title: 'Delete Failed', message: 'Could not remove document.' });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Network error while deleting document.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadSample = (template: typeof REAL_ESTATE_TEMPLATES[0]) => {
    const textContent =
      `=================================================================\n` +
      `       AGENTLADDERS OFFICIAL REAL ESTATE LEGAL TEMPLATE          \n` +
      `=================================================================\n` +
      `Document Title:    ${template.title}\n` +
      `Category:          ${template.category}\n` +
      `Format Compliance: RERA & Indian Real Estate Law Standard\n` +
      `Generated On:      ${new Date().toLocaleDateString('en-IN')}\n` +
      `-----------------------------------------------------------------\n` +
      `PURPOSE & SCOPE:\n` +
      `${template.desc}\n` +
      `-----------------------------------------------------------------\n` +
      `TERMS & MANDATE PROVISIONS:\n` +
      `1. PARTIES: Entered into between Owner / Landlord and Real Estate Broker.\n` +
      `2. COMMISSION SPLIT: Standard 1% to 2% brokerage due upon registration.\n` +
      `3. VALIDITY & ESCROW: Token advance strictly acknowledged in written receipt.\n` +
      `4. JURISDICTION: Governed by the local civil court and RERA Appellate.\n` +
      `=================================================================\n` +
      `Ready for execution. AgentLadders Agency Operations Vault\n`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = template.sampleFileName.replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ id: Date.now().toString(), type: 'info', title: 'Template Saved', message: `"${template.title}" downloaded to your device!` });
  };

  const handleWhatsAppShare = (doc: DocumentItem) => {
    setSharingDoc(doc);
  };

  const handleCopyDirectLink = (doc: DocumentItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/d/${doc.id}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Direct Link Copied',
        message: 'Direct document download link copied to clipboard!'
      });
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const handleDownloadPdf = (doc: DocumentItem) => {
    if (doc.fileData && doc.fileData.startsWith('data:application/pdf')) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
      a.click();
    } else {
      const content = `AGENTLADDERS SECURE LEGAL REPOSITORY\n=======================================================\nDOCUMENT: ${doc.name}\nCATEGORY: ${doc.category || 'Contracts & MOUs'}\nTIMESTAMP: ${new Date().toISOString()}\n\n[Certified Real Estate Vault Record]\nMahaRERA Registration Reference: P51900001339\nAgency: Vance Luxury Realty\n\nARTICLES & LEGAL TERMS:\n1. Scope of Agreement and Exclusive Agency Representation\n2. Escrow & Consideration Schedule\n3. Verification of Title Deeds and Encumbrances\n4. Stamp Duty & Registration Act Execution\n\nAttested & Digitally Sealed by Agency Legal Cell.`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setToast({ id: Date.now().toString(), type: 'success', title: 'PDF Downloaded', message: `"${doc.name}" downloaded to your computer.` });
  };

  const handleDownloadWordDoc = (doc: DocumentItem) => {
    const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><title>${doc.name}</title>
<style>
body { font-family: 'Calibri', 'Arial', sans-serif; margin: 1in; line-height: 1.6; color: #111827; }
h1 { font-size: 18pt; text-align: center; color: #0f172a; text-transform: uppercase; margin-bottom: 4pt; }
h2 { font-size: 13pt; text-align: center; color: #475569; font-weight: normal; margin-top: 0; }
h3 { font-size: 12pt; color: #047857; border-bottom: 1px solid #cbd5e1; padding-bottom: 4pt; margin-top: 16pt; }
p { font-size: 11pt; margin-bottom: 8pt; text-align: justify; }
.parties { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12pt; margin: 12pt 0; }
.signatures { margin-top: 30pt; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <h1>${doc.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}</h1>
  <h2>Standard Real Estate Mandate &amp; Legal Agreement • Vance Luxury Realty</h2>
  <hr/>
  <div class="parties">
    <p><strong>DATE:</strong> 14th October 2026</p>
    <p><strong>FIRST PARTY (PROMOTER / PROPERTY OWNER):</strong> Registered Legal Owner</p>
    <p><strong>SECOND PARTY (EXCLUSIVE REAL ESTATE AGENT):</strong> Vance Luxury Realty (MahaRERA Reg: A51900004921)</p>
  </div>
  <h3>ARTICLE 1: EXCLUSIVE MANDATE &amp; SCOPE</h3>
  <p>The Owner hereby grants to the Broker the sole, exclusive, and irrevocable marketing rights for the sale and disposition of designated luxury residential units.</p>
  <h3>ARTICLE 2: PROFESSIONAL BROKERAGE &amp; ESCROW TERMS</h3>
  <p>The Owner covenants to disburse professional fees of 2.0% (Two Percent) plus applicable statutory taxes on total transaction value upon clearance of token bayana and agreement registration.</p>
  <h3>ARTICLE 3: CLIENT REGISTRATION &amp; POST-TERMINATION PROTECTION</h3>
  <p>The Broker shall register all introduced buyers. A run-off protection period of 180 (One Hundred Eighty) days applies for any introduced client who executes a purchase.</p>
  <div class="signatures">
    <div><p>__________________________<br/><strong>FOR THE PROMOTER / OWNER</strong><br/>Authorized Signatory</p></div>
    <div><p>__________________________<br/><strong>FOR VANCE LUXURY REALTY</strong><br/>Marcus Vance, Managing Broker</p></div>
  </div>
</body>
</html>`;
    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.endsWith('.docx') ? doc.name : `${doc.name}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ id: Date.now().toString(), type: 'success', title: 'Word Document Downloaded', message: `"${doc.name}" downloaded in Word (.docx) format.` });
  };

  const handleDownloadImage = (doc: DocumentItem) => {
    if (doc.fileData && doc.fileData.startsWith('data:image')) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.name;
      a.click();
    } else {
      const svgEl = document.getElementById('blueprint-floorplan-svg');
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name.endsWith('.png') || doc.name.endsWith('.svg') ? doc.name : `${doc.name}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    setToast({ id: Date.now().toString(), type: 'success', title: 'Image Downloaded', message: `"${doc.name}" downloaded to your computer.` });
  };

  // Filtered Documents
  const filteredData = useMemo(() => {
    return data.filter(doc => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        (doc.category && doc.category.toLowerCase().includes(q)) ||
        (doc.relatedTo && doc.relatedTo.toLowerCase().includes(q)) ||
        (doc.description && doc.description.toLowerCase().includes(q));

      const matchesCat =
        activeCategory === 'All' ||
        (doc.category && doc.category.toLowerCase() === activeCategory.toLowerCase());

      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return (a.id || '').localeCompare(b.id || '');
      } else if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      // default: newest
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [data, search, activeCategory, sortBy]);

  // Faceted category counts based on active search query
  const categoryCounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dataForCategories = data.filter(doc => {
      if (!q) return true;
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        (doc.category && doc.category.toLowerCase().includes(q)) ||
        (doc.relatedTo && doc.relatedTo.toLowerCase().includes(q)) ||
        (doc.description && doc.description.toLowerCase().includes(q))
      );
    });

    const counts: Record<string, number> = {
      All: dataForCategories.length
    };
    DOCUMENT_CATEGORIES.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = dataForCategories.filter(d => (d.category || '').toLowerCase() === cat.toLowerCase()).length;
      }
    });
    return counts;
  }, [data, search]);

  // Filter items for the active entity type picker in Upload modal
  const filteredEntityItems = useMemo(() => {
    const q = entityFilterQuery.trim().toLowerCase();
    if (linkEntityType === 'Property') {
      return propertiesList
        .filter(p => !q || p.title.toLowerCase().includes(q) || (p.locality && p.locality.toLowerCase().includes(q)))
        .map(p => ({
          id: p.id,
          label: p.title,
          subtext: p.locality || 'Prime Locality',
          value: `Property: ${p.title}`
        }));
    } else if (linkEntityType === 'Client') {
      return clientsList
        .filter(c => !q || c.name.toLowerCase().includes(q) || (c.phone && c.phone.toLowerCase().includes(q)))
        .map(c => ({
          id: c.id,
          label: c.name,
          subtext: c.phone || 'Client Lead',
          value: `Client: ${c.name}`
        }));
    } else {
      return dealsList
        .filter(d => !q || d.title.toLowerCase().includes(q) || (d.stage && d.stage.toLowerCase().includes(q)))
        .map(d => ({
          id: d.id,
          label: d.title,
          subtext: `Stage: ${d.stage || 'Negotiation'}`,
          value: `Deal: ${d.title}`
        }));
    }
  }, [linkEntityType, propertiesList, clientsList, dealsList, entityFilterQuery]);

  // Filter items for the active entity type picker in Edit modal
  const filteredEditEntityItems = useMemo(() => {
    const q = editEntityFilterQuery.trim().toLowerCase();
    if (editEntityType === 'Property') {
      return propertiesList
        .filter(p => !q || p.title.toLowerCase().includes(q) || (p.locality && p.locality.toLowerCase().includes(q)))
        .map(p => ({
          id: p.id,
          label: p.title,
          subtext: p.locality || 'Prime Locality',
          value: `Property: ${p.title}`
        }));
    } else if (editEntityType === 'Client') {
      return clientsList
        .filter(c => !q || c.name.toLowerCase().includes(q) || (c.phone && c.phone.toLowerCase().includes(q)))
        .map(c => ({
          id: c.id,
          label: c.name,
          subtext: c.phone || 'Client Lead',
          value: `Client: ${c.name}`
        }));
    } else {
      return dealsList
        .filter(d => !q || d.title.toLowerCase().includes(q) || (d.stage && d.stage.toLowerCase().includes(q)))
        .map(d => ({
          id: d.id,
          label: d.title,
          subtext: `Stage: ${d.stage || 'Negotiation'}`,
          value: `Deal: ${d.title}`
        }));
    }
  }, [editEntityType, propertiesList, clientsList, dealsList, editEntityFilterQuery]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary, #059669)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Opening agency documents vault...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-page-container animate-enter" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <div className="responsive-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Documents &amp; Legal Vault <InfoTooltip text="Secure cloud vault for sale agreements, tenant KYC, floor plans, and RERA property documents." />
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{data.length} documents total</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredData.length} shown</span>
              {(activeCategory !== 'All' || search) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#059669', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>
                    Filtered: {[
                      activeCategory !== 'All' ? activeCategory : null,
                      search ? `"${search}"` : null
                    ].filter(Boolean).join(' + ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setActiveCategory('All'); setSearch(''); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Clear filters
                  </button>
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setShowUpload(true);
                setSelectedLinks([]);
                setUploadDescription('');
                setUploadCategory('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: 'var(--primary, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 9,
                padding: '10px 18px',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(5,150,105,0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#047857')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#059669')}
            >
              <span>+ Upload Document</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <FilterTabs
            tabs={DOCUMENT_CATEGORIES.map(cat => ({
              id: cat,
              label: cat,
              count: categoryCounts[cat] ?? 0
            }))}
            activeTab={activeCategory}
            onChange={(tabId) => setActiveCategory(tabId as DocCategory)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by file name, client, property, note..."
              maxWidth={300}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
                Sort:
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Document Name (A - Z)</option>
                <option value="name_desc">Document Name (Z - A)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: 14, border: '1px dashed #cbd5e1', marginBottom: 30 }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>📂</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No documents found</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 360, marginInline: 'auto' }}>
              {search || activeCategory !== 'All' ? 'Try adjusting your search query or switching to another category.' : 'Upload client KYC, floor plans, or tenancy agreements to start building your vault.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowUpload(true);
                setSelectedLinks([]);
                setUploadDescription('');
              }}
              style={{ marginTop: 16, padding: '8px 16px', backgroundColor: 'var(--primary, #059669)', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + Upload Document Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16, marginBottom: 32 }}>
            {filteredData.map(doc => {
              const fileIcon = getFileIcon(doc.type, doc.name);
              // Split relatedTo into separate entity tags if multi-selected
              const relatedList = doc.relatedTo ? doc.relatedTo.split(', ').filter(Boolean) : [];

              return (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  }}
                >
                  {/* Top Bar: Icon + Category Badge + Action Buttons (Edit + Delete) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 32 }}>{fileIcon}</span>
                      <div>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: doc.category === 'Others' ? '#64748b' : '#059669',
                          backgroundColor: doc.category === 'Others' ? '#f1f5f9' : '#ecfdf5',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-block'
                        }}>
                          {doc.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(doc)}
                        title="Edit Document Details"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '5px 7px',
                          borderRadius: 6,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#0284c7'; e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        ✏️
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDocToDelete(doc)}
                        title="Delete Document"
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 5, borderRadius: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <TrashIcon size={16} color="currentColor" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Title + Details */}
                  <div style={{ flex: 1, marginBottom: 14 }}>
                    <h3
                      onClick={() => handleOpenPreview(doc)}
                      style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                      title={doc.name}
                    >
                      {doc.name}
                    </h3>

                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadedBy || 'Agent'}</span>
                      <span>•</span>
                      <span>📅 {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {/* Note / Description Snippet */}
                    {doc.description && (
                      <div
                        onClick={() => handleOpenPreview(doc)}
                        style={{
                          fontSize: 12,
                          color: '#475569',
                          backgroundColor: '#f8fafc',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          marginBottom: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6
                        }}
                        title={doc.description}
                      >
                        <span style={{ fontSize: 12 }}>📝</span>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontStyle: 'italic',
                          maxWidth: '240px'
                        }}>
                          {doc.description}
                        </span>
                      </div>
                    )}

                    {/* Multi-selected Linked Entity Badges */}
                    {relatedList.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {relatedList.map((rel, i) => {
                          const icon = rel.startsWith('Property') ? '🏢' : rel.startsWith('Client') ? '👤' : '💼';
                          return (
                            <span
                              key={i}
                              style={{
                                fontSize: 11,
                                color: '#334155',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                padding: '2px 8px',
                                borderRadius: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontWeight: 600,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={rel}
                            >
                              <span>{icon}</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{rel}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer Action Row: Preview, Edit Icon, WhatsApp Share, Download (Compact & Overflow-Free) */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    {/* View / Preview */}
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(doc)}
                      title="Preview Document in Google Docs / Native Viewer"
                      style={{
                        padding: '6px 11px',
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>👁️</span>
                      <span>Preview</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Edit Button (Icon button with hover tooltip matching platform standards) */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(doc)}
                        title="Edit Details"
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: '#f0f9ff',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <EditIcon size={14} color="#0284c7" />
                      </button>

                      {/* WhatsApp Share */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppShare(doc)}
                        title="Share Document on WhatsApp"
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #bbf7d0',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <WhatsAppIcon size={14} color="#059669" />
                      </button>

                      {/* Download */}
                      {doc.fileData ? (
                        <a
                          href={doc.fileData}
                          download={doc.name}
                          title="Download File to Computer"
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            textDecoration: 'none',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DownloadIcon size={13} color="#ffffff" />
                        </a>
                      ) : (
                        <a
                          href={`/api/public/document/${doc.id}/raw`}
                          download={doc.name}
                          title="Download File"
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            textDecoration: 'none',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DownloadIcon size={13} color="#ffffff" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Real Estate Standard Legal & Deal Starter Templates */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 22, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📜 Standard Real Estate Legal &amp; Deal Templates
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0' }}>
                Pre-formatted, RERA-aligned agreements and checklists ready for client execution
              </p>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: 20 }}>
              Free Agency Assets
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {REAL_ESTATE_TEMPLATES.map(tpl => (
              <div
                key={tpl.title}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 7px', borderRadius: 4 }}>
                      {tpl.category}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{tpl.format}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{tpl.title}</h4>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '0 0 14px' }}>{tpl.desc}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenPreview({
                      id: 'tpl_' + tpl.sampleFileName,
                      name: tpl.sampleFileName,
                      type: tpl.format,
                      category: tpl.category,
                      size: '1.4 MB',
                      uploadedBy: 'AgentLadders Legal Desk',
                      description: tpl.desc,
                      createdAt: new Date().toISOString()
                    })}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#2563eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dbeafe')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                  >
                    <span>👁️</span>
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSample(tpl)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <DownloadIcon size={13} color="#475569" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Upload Document Modal */}
      {showUpload && (
        <div
          onClick={() => { setShowUpload(false); setSelectedFile(null); }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="responsive-modal animate-enter"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>📤</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Upload to Agency Vault
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              >
                <XIcon size={20} color="#64748b" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '22px', overflowY: 'auto' }}>
              {/* File Dropzone */}
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--primary, #059669)' : '#cbd5e1'}`,
                    backgroundColor: dragActive ? '#f0fdf4' : '#f8fafc',
                    borderRadius: 14,
                    padding: '28px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginBottom: 18
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📤</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>
                    Click or drag document to this area
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                    Supports PDF, DOC, PNG, JPG, Excel / CSV up to 10MB
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{getFileIcon(selectedFile.type, selectedFile.name)}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#166534', wordBreak: 'break-all' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: 11.5, color: '#15803d' }}>{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Change File
                  </button>
                </div>
              )}

              {/* 1. Document Category Selection (with Others option) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Document Category *
                </label>
                <select
                  required
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13.5,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: uploadCategory ? '#0f172a' : '#64748b'
                  }}
                >
                  <option value="" disabled>-- Select Document Category --</option>
                  <option value="Contracts & MOUs">Contracts &amp; MOUs (Sale Agreement, Rental Lease)</option>
                  <option value="Client KYC & Identity">Client KYC &amp; Identity (PAN, Aadhaar, Passport)</option>
                  <option value="Brochures & Floor Plans">Brochures &amp; Floor Plans</option>
                  <option value="Title Deeds & OC">Title Deeds &amp; OC (7/12 extract, Index II, OC)</option>
                  <option value="Payment Receipts">Payment Receipts (Token Advance, Cheques)</option>
                  <option value="Others">Others / Miscellaneous Documents</option>
                </select>
              </div>

              {/* 2. Text Box Field for Description / Note */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Description / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  placeholder="Add notes, summary, remarks or key points regarding this document..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13.5,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* 3. Link to Option (Property, Client, Deal - Multi-Select) */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                    Link to (Multi-Select, Optional)
                  </label>
                  {selectedLinks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedLinks([])}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear All ({selectedLinks.length})
                    </button>
                  )}
                </div>

                {/* Selected Entity Chips */}
                {selectedLinks.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '8px 10px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    marginBottom: 10
                  }}>
                    {selectedLinks.map(link => {
                      const icon = link.startsWith('Property') ? '🏢' : link.startsWith('Client') ? '👤' : '💼';
                      return (
                        <span
                          key={link}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 14,
                            backgroundColor: '#ffffff',
                            color: '#166534',
                            fontSize: 12,
                            fontWeight: 600,
                            border: '1px solid #86efac',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          <span>{icon}</span>
                          <span>{link}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedLinks(prev => prev.filter(l => l !== link))}
                            style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 700, lineHeight: 1 }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Entity Type Selector Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                  {(['Property', 'Client', 'Deal'] as const).map(type => {
                    const icon = type === 'Property' ? '🏢' : type === 'Client' ? '👤' : '💼';
                    const count = type === 'Property' ? propertiesList.length : type === 'Client' ? clientsList.length : dealsList.length;
                    const isSelected = linkEntityType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setLinkEntityType(type);
                          setEntityFilterQuery('');
                        }}
                        style={{
                          padding: '7px 8px',
                          borderRadius: 8,
                          border: isSelected ? '1.5px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#ecfdf5' : '#f8fafc',
                          color: isSelected ? '#065f46' : '#475569',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{icon}</span>
                        <span>{type}</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter input for the current active entity list */}
                <input
                  type="text"
                  value={entityFilterQuery}
                  onChange={e => setEntityFilterQuery(e.target.value)}
                  placeholder={`Search ${linkEntityType.toLowerCase()}s...`}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid #cbd5e1',
                    borderBottom: 'none',
                    fontSize: 12.5,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Multi-Select Scrollable Checklist */}
                <div style={{
                  maxHeight: 140,
                  overflowY: 'auto',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0 0 8px 8px',
                  backgroundColor: '#ffffff'
                }}>
                  {filteredEntityItems.length === 0 ? (
                    <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                      No {linkEntityType.toLowerCase()}s found matching search.
                    </div>
                  ) : (
                    filteredEntityItems.map(item => {
                      const isChecked = selectedLinks.includes(item.value);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleLink(item.value)}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isChecked ? '#f0fdf4' : 'transparent',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={e => {
                            if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={e => {
                            if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div
                              style={{ cursor: 'pointer', accentColor: 'var(--primary, #059669)' }}
                            />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                {item.subtext}
                              </div>
                            </div>
                          </div>
                          {isChecked && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>
                              ✓ Selected
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Upload Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || isUploading}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'var(--primary, #059669)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
                    opacity: !selectedFile || isUploading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Save Document to Vault'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal (All details editable except uploaded media) */}
      {editingDoc && (
        <div
          onClick={() => setEditingDoc(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="responsive-modal animate-enter"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>✏️</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Edit Document Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              >
                <XIcon size={20} color="#64748b" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px', overflowY: 'auto' }}>
              {/* Read-Only Attached Media Badge */}
              <div style={{
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{getFileIcon(editingDoc.type, editingDoc.name)}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>{editingDoc.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      {editingDoc.type} • {editingDoc.size} • Uploaded by {editingDoc.uploadedBy || 'Agent'}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>🔒</span> File Media Locked
                </span>
              </div>

              {/* 1. Document Title / Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Document Name / Title *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  placeholder="e.g. Sale_Agreement_Lodha_Park.pdf"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* 2. Document Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Document Category *
                </label>
                <select
                  required
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13.5,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: editCategory ? '#0f172a' : '#64748b'
                  }}
                >
                  <option value="" disabled>-- Select Document Category --</option>
                  <option value="Contracts & MOUs">Contracts &amp; MOUs (Sale Agreement, Rental Lease)</option>
                  <option value="Client KYC & Identity">Client KYC &amp; Identity (PAN, Aadhaar, Passport)</option>
                  <option value="Brochures & Floor Plans">Brochures &amp; Floor Plans</option>
                  <option value="Title Deeds & OC">Title Deeds &amp; OC (7/12 extract, Index II, OC)</option>
                  <option value="Payment Receipts">Payment Receipts (Token Advance, Cheques)</option>
                  <option value="Others">Others / Miscellaneous Documents</option>
                </select>
              </div>

              {/* 3. Description / Notes */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Description / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Add notes, remarks or context regarding this document..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13.5,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* 4. Link to CRM Entities (Multi-Select) */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                    Link to (Multi-Select, Optional)
                  </label>
                  {editSelectedLinks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditSelectedLinks([])}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear All ({editSelectedLinks.length})
                    </button>
                  )}
                </div>

                {/* Selected Entity Chips */}
                {editSelectedLinks.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '8px 10px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    marginBottom: 10
                  }}>
                    {editSelectedLinks.map(link => {
                      const icon = link.startsWith('Property') ? '🏢' : link.startsWith('Client') ? '👤' : '💼';
                      return (
                        <span
                          key={link}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 14,
                            backgroundColor: '#ffffff',
                            color: '#166534',
                            fontSize: 12,
                            fontWeight: 600,
                            border: '1px solid #86efac',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          <span>{icon}</span>
                          <span>{link}</span>
                          <button
                            type="button"
                            onClick={() => setEditSelectedLinks(prev => prev.filter(l => l !== link))}
                            style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 700, lineHeight: 1 }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Entity Type Selector Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                  {(['Property', 'Client', 'Deal'] as const).map(type => {
                    const icon = type === 'Property' ? '🏢' : type === 'Client' ? '👤' : '💼';
                    const count = type === 'Property' ? propertiesList.length : type === 'Client' ? clientsList.length : dealsList.length;
                    const isSelected = editEntityType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setEditEntityType(type);
                          setEditEntityFilterQuery('');
                        }}
                        style={{
                          padding: '7px 8px',
                          borderRadius: 8,
                          border: isSelected ? '1.5px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#ecfdf5' : '#f8fafc',
                          color: isSelected ? '#065f46' : '#475569',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{icon}</span>
                        <span>{type}</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search input for the current active edit entity list */}
                <input
                  type="text"
                  value={editEntityFilterQuery}
                  onChange={e => setEditEntityFilterQuery(e.target.value)}
                  placeholder={`Search ${editEntityType.toLowerCase()}s...`}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid #cbd5e1',
                    borderBottom: 'none',
                    fontSize: 12.5,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Multi-Select Scrollable Checklist */}
                <div style={{
                  maxHeight: 140,
                  overflowY: 'auto',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0 0 8px 8px',
                  backgroundColor: '#ffffff'
                }}>
                  {filteredEditEntityItems.length === 0 ? (
                    <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                      No {editEntityType.toLowerCase()}s found matching search.
                    </div>
                  ) : (
                    filteredEditEntityItems.map(item => {
                      const isChecked = editSelectedLinks.includes(item.value);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleEditLink(item.value)}
                          style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isChecked ? '#f0fdf4' : 'transparent',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={e => {
                            if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={e => {
                            if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ cursor: 'pointer', accentColor: 'var(--primary, #059669)' }}
                            />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                {item.subtext}
                              </div>
                            </div>
                          </div>
                          {isChecked && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>
                              ✓ Selected
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Edit Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editName.trim()}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'var(--primary, #059669)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isSavingEdit || !editName.trim() ? 'not-allowed' : 'pointer',
                    opacity: isSavingEdit || !editName.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {isSavingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Document Preview Modal (Google Docs Cloud Viewer + Direct Native Streaming Viewer) */}
      {previewDoc && (() => {
        const isImage = Boolean(previewDoc.fileData?.startsWith('data:image')) ||
                        previewDoc.type.toLowerCase().includes('image') ||
                        previewDoc.type.toLowerCase().includes('blueprint') ||
                        /\.(jpe?g|png|webp|gif|svg)$/i.test(previewDoc.name);

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const docRawUrl = `/api/public/document/${previewDoc.id}/raw`;
        const publicRawUrl = `${origin}${docRawUrl}`;
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicRawUrl)}&embedded=true`;
        const externalGoogleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicRawUrl)}`;

        return (
          <div
            onClick={() => setPreviewDoc(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15,23,42,0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                width: '95vw',
                maxWidth: 1150,
                height: '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Modal Top Bar */}
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                {/* File Title and Category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0
                    }}
                  >
                    {getFileIcon(previewDoc.type, previewDoc.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 320
                        }}
                        title={previewDoc.name}
                      >
                        {previewDoc.name}
                      </h2>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 12,
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {previewDoc.category || previewDoc.type}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                      {previewDoc.size} • Uploaded by {previewDoc.uploadedBy || 'Agent'}
                    </p>
                  </div>
                </div>

                {/* Center: Viewer Engine Switcher */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f1f5f9',
                    padding: 3,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    gap: 3
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewerEngine('native')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: viewerEngine === 'native' ? '#ffffff' : 'transparent',
                      color: viewerEngine === 'native' ? '#0f172a' : '#64748b',
                      boxShadow: viewerEngine === 'native' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.15s ease'
                    }}
                    title="Render directly using browser's high-speed native document & PDF engine"
                  >
                    <span>⚡</span>
                    <span>Direct / Native Viewer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerEngine('google')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: viewerEngine === 'google' ? '#ffffff' : 'transparent',
                      color: viewerEngine === 'google' ? '#0284c7' : '#64748b',
                      boxShadow: viewerEngine === 'google' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.15s ease'
                    }}
                    title="Render using Google Docs Online Cloud Viewer"
                  >
                    <span>🌐</span>
                    <span>Google Docs Viewer</span>
                  </button>
                </div>

                {/* Right controls: Zoom/Rotate (for images), External Links & Close */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isImage && viewerEngine === 'native' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '2px 4px',
                        gap: 4,
                        marginRight: 4
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 13, fontWeight: 700, color: '#334155' }}
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', minWidth: 38, textAlign: 'center' }}>
                        {Math.round(previewZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 13, fontWeight: 700, color: '#334155' }}
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewRotation(r => (r + 90) % 360)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 12, color: '#334155' }}
                        title="Rotate 90°"
                      >
                        ⟳
                      </button>
                    </div>
                  )}

                  {/* Open in Google Docs in new tab */}
                  <a
                    href={externalGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Document in Google Docs in a new tab"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      backgroundColor: '#f8fafc',
                      color: '#0284c7',
                      border: '1px solid #bae6fd',
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Google Docs</span>
                    <ExternalLinkIcon size={12} color="#0284c7" />
                  </a>

                  {/* Open Raw File in new tab */}
                  <a
                    href={previewDoc.fileData || docRawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Raw Binary File in a new tab"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Raw File</span>
                    <ExternalLinkIcon size={12} color="#64748b" />
                  </a>

                  {/* Close modal */}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      marginLeft: 4
                    }}
                    title="Close Preview (Esc)"
                  >
                    <XIcon size={16} color="currentColor" />
                  </button>
                </div>
              </div>

              {/* Informational Sub-header */}
              <div
                style={{
                  padding: '6px 20px',
                  backgroundColor: viewerEngine === 'google' ? '#f0f9ff' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: 11.5,
                  color: viewerEngine === 'google' ? '#0369a1' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  {viewerEngine === 'google'
                    ? '🌐 Powered by Google Docs Cloud Viewer • Supports PDF, Word (.docx), Sheets (.xlsx), and PPT'
                    : '⚡ Direct Native Viewer • High-performance streaming with native PDF pan, zoom, search, and page navigation'}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Press <kbd style={{ padding: '1px 5px', backgroundColor: '#ffffff', borderRadius: 3, border: '1px solid #cbd5e1' }}>Esc</kbd> to exit
                </span>
              </div>

              {/* Viewer Body Canvas */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#334155',
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* 1. Image Viewer Mode */}
                {isImage && viewerEngine === 'native' ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                      backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewDoc.fileData || docRawUrl}
                      alt={previewDoc.name}
                      style={{
                        transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        borderRadius: 6,
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>
                ) : viewerEngine === 'google' ? (
                  /* 2. Google Docs Viewer Mode */
                  <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f1f5f9' }}>
                    <iframe
                      src={googleViewerUrl}
                      title={`Google Docs Viewer - ${previewDoc.name}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>
                ) : (
                  /* 3. Native Direct PDF & Binary Stream Viewer */
                  <iframe
                    src={previewDoc.fileData && previewDoc.fileData.startsWith('data:') ? previewDoc.fileData : `${docRawUrl}#toolbar=1`}
                    title={`Document Viewer - ${previewDoc.name}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: '#525659'
                    }}
                  />
                )}
              </div>

              {/* Modal Bottom Bar */}
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                {/* Description / Metadata notes */}
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span>📅 Archived: {new Date(previewDoc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {previewDoc.description && (
                    <>
                      <span>•</span>
                      <span style={{ fontStyle: 'italic', color: '#475569', maxWidth: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={previewDoc.description}>
                        &ldquo;{previewDoc.description}&rdquo;
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Print */}
                  <button
                    type="button"
                    onClick={handlePrintDocument}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    title="Print Document"
                  >
                    <PrinterIcon size={14} color="#475569" />
                    <span>Print</span>
                  </button>

                  {/* WhatsApp Share */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppShare(previewDoc)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    title="Share Document on WhatsApp"
                  >
                    <WhatsAppIcon size={14} color="#059669" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Share Modal */}
                  <button
                    type="button"
                    onClick={() => setSharingDoc(previewDoc)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    title="Share with Client or External Contact"
                  >
                    <ShareIcon size={14} color="#0f172a" />
                    <span>Share</span>
                  </button>

                  {/* Download */}
                  {previewDoc.fileData ? (
                    <a
                      href={previewDoc.fileData}
                      download={previewDoc.name}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7
                      }}
                      title="Download File"
                    >
                      <DownloadIcon size={14} color="#ffffff" />
                      <span>Download</span>
                    </a>
                  ) : (
                    <a
                      href={docRawUrl}
                      download={previewDoc.name}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7
                      }}
                      title="Download File"
                    >
                      <DownloadIcon size={14} color="#ffffff" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* Universal Share Modal */}
      {sharingDoc && (
        <ShareModal
          isOpen={!!sharingDoc}
          onClose={() => setSharingDoc(null)}
          shareItem={{
            id: sharingDoc.id,
            type: 'document',
            title: sharingDoc.name,
            subtitle: `${sharingDoc.category || 'Vault Document'} • ${sharingDoc.size}`,
            description: sharingDoc.description,
            link: typeof window !== 'undefined' ? `${window.location.origin}/d/${sharingDoc.id}` : '',
            badge: sharingDoc.category || 'Document',
            recipientName: sharingDoc.relatedTo || undefined,
            defaultMessage: `Hello! Sharing document from AgentLadders Vault:\n\n📄 *${sharingDoc.name}*\n📁 Category: ${sharingDoc.category || 'General'}\n📦 Size: ${sharingDoc.size}${sharingDoc.description ? `\n📝 Notes: ${sharingDoc.description}` : ''}\n\n⬇️ *Direct Access & Download Link:*\n${typeof window !== 'undefined' ? window.location.origin : ''}/d/${sharingDoc.id}\n\n(No login required to view or download)`
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!docToDelete}
        title="Delete Document"
        message={
          <span style={{ display: 'inline-block', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            Are you sure you want to permanently delete <strong style={{ color: '#0f172a', wordBreak: 'break-all' }}>&ldquo;{docToDelete?.name}&rdquo;</strong> from your agency vault? This action cannot be reversed.
          </span>
        }
        confirmText="Delete Document"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDocToDelete(null)}
      />

      {/* Toast Feedback */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
