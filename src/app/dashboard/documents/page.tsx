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
  WhatsAppIcon
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
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewDarkBg, setPreviewDarkBg] = useState(false);
  const [wordRibbonTab, setWordRibbonTab] = useState<'Home' | 'File' | 'Layout' | 'Review' | 'View'>('Home');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setPreviewZoom(1);
    setPreviewRotation(0);
    setPreviewPage(1);
    setPreviewDarkBg(false);
    setWordRibbonTab('Home');
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

                  {/* Footer Action Row: Preview, Edit, WhatsApp Share, Download */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* View / Preview */}
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(doc)}
                        title="Quick View Document in PDF / Image / Word Viewer"
                        style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>👁️</span>
                        <span>Preview</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(doc)}
                        title="Edit Details"
                        style={{ padding: '6px 9px', backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit
                      </button>

                      {/* WhatsApp Share */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppShare(doc)}
                        title="Share Document with Client on WhatsApp"
                        style={{ padding: '6px 9px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <WhatsAppIcon size={14} color="#059669" />
                      </button>

                      {/* Download */}
                      {doc.fileData ? (
                        <a
                          href={doc.fileData}
                          download={doc.name}
                          title="Download File to Computer"
                          style={{ padding: '6px 10px', backgroundColor: '#0f172a', color: '#ffffff', textDecoration: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <DownloadIcon size={12} color="#ffffff" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (doc.name.toLowerCase().endsWith('.docx') || doc.name.toLowerCase().endsWith('.doc') || doc.type.toLowerCase().includes('word')) {
                              handleDownloadWordDoc(doc);
                            } else if (doc.name.toLowerCase().endsWith('.png') || doc.name.toLowerCase().endsWith('.jpg') || doc.type.toLowerCase().includes('image')) {
                              handleDownloadImage(doc);
                            } else {
                              handleDownloadPdf(doc);
                            }
                          }}
                          title="Download Stored Copy"
                          style={{ padding: '6px 10px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <DownloadIcon size={12} color="#ffffff" />
                        </button>
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

      {/* In-App Document Preview Modal (Interactive PDF, Image, Word DOC Viewers) */}
      {previewDoc && (() => {
        const isPdf = previewDoc.name.toLowerCase().endsWith('.pdf') || 
                      previewDoc.type.toLowerCase().includes('pdf') || 
                      Boolean(previewDoc.fileData && previewDoc.fileData.includes('application/pdf'));

        const isImage = Boolean(previewDoc.fileData?.startsWith('data:image')) ||
                        previewDoc.type.toLowerCase().includes('image') ||
                        previewDoc.type.toLowerCase().includes('blueprint') ||
                        /\.(jpe?g|png|webp|gif|svg)$/i.test(previewDoc.name);

        const isDoc = previewDoc.name.toLowerCase().endsWith('.docx') ||
                      previewDoc.name.toLowerCase().endsWith('.doc') ||
                      previewDoc.type.toLowerCase().includes('word') ||
                      previewDoc.type.toLowerCase().includes('doc') ||
                      Boolean(previewDoc.fileData && (previewDoc.fileData.includes('wordprocessingml') || previewDoc.fileData.includes('msword')));

        return (
          <div
            onClick={() => setPreviewDoc(null)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .print-document-container, .print-document-container * {
                  visibility: visible !important;
                }
                .print-document-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  background: #ffffff !important;
                  box-shadow: none !important;
                  border: none !important;
                  padding: 20px !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div
              onClick={e => e.stopPropagation()}
              className="responsive-modal document-preview-modal modal-wide animate-enter"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                maxHeight: '94vh',
                width: '100%',
                maxWidth: isDoc || isPdf || isImage ? 1020 : 860,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{getFileIcon(previewDoc.type, previewDoc.name)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                        {previewDoc.name}
                      </h3>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        backgroundColor: isPdf ? '#fef2f2' : isImage ? '#f0fdf4' : isDoc ? '#eff6ff' : '#f1f5f9',
                        color: isPdf ? '#dc2626' : isImage ? '#16a34a' : isDoc ? '#2563eb' : '#475569',
                        border: `1px solid ${isPdf ? '#fecaca' : isImage ? '#bbf7d0' : isDoc ? '#bfdbfe' : '#cbd5e1'}`
                      }}>
                        {isPdf ? '📕 PDF Viewer' : isImage ? '🖼️ Image Viewer' : isDoc ? '📘 Word Doc Viewer' : '📄 File Viewer'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{previewDoc.type}</span>
                      <span>•</span>
                      <span>{previewDoc.size}</span>
                      <span>•</span>
                      <span>Category: <strong>{previewDoc.category || 'General'}</strong></span>
                      <span>•</span>
                      <span>By <strong>{previewDoc.uploadedBy || 'Agent'}</strong></span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Close Preview (Esc)"
                >
                  <XIcon size={18} color="#64748b" />
                </button>
              </div>

              {/* Preview Body */}
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, backgroundColor: '#fdfdfd' }}>
                
                {/* 1. PDF VIEWER */}
                {isPdf ? (
                  <div style={{ marginBottom: 20 }}>
                    {/* PDF Control Toolbar */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12,
                      padding: '10px 14px',
                      backgroundColor: '#1e293b',
                      borderRadius: 10,
                      color: '#ffffff'
                    }}>
                      {/* Left: Mode & Page Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>📕</span> PDF Preview
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#334155', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>
                          <button
                            type="button"
                            onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                            disabled={previewPage <= 1}
                            style={{ background: 'none', border: 'none', color: previewPage <= 1 ? '#64748b' : '#ffffff', cursor: previewPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 700, padding: '0 4px' }}
                            title="Previous Page"
                          >
                            ◀
                          </button>
                          <span style={{ fontWeight: 600 }}>Page {previewPage} of 2</span>
                          <button
                            type="button"
                            onClick={() => setPreviewPage(prev => Math.min(2, prev + 1))}
                            disabled={previewPage >= 2}
                            style={{ background: 'none', border: 'none', color: previewPage >= 2 ? '#64748b' : '#ffffff', cursor: previewPage >= 2 ? 'not-allowed' : 'pointer', fontWeight: 700, padding: '0 4px' }}
                            title="Next Page"
                          >
                            ▶
                          </button>
                        </div>
                      </div>

                      {/* Center: Zoom Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.max(0.6, +(prev - 0.2).toFixed(1)))}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#fff', cursor: 'pointer' }}
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(1)}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#38bdf8', cursor: 'pointer' }}
                          title="Reset Zoom to 100%"
                        >
                          {Math.round(previewZoom * 100)}%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.min(2.0, +(prev + 0.2).toFixed(1)))}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#fff', cursor: 'pointer' }}
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(1)}
                          style={{ padding: '4px 9px', fontSize: 11, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#cbd5e1', cursor: 'pointer' }}
                          title="Fit Width"
                        >
                          Fit Width
                        </button>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={handlePrintDocument}
                          style={{ padding: '5px 11px', fontSize: 12, fontWeight: 600, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                          title="Print Document"
                        >
                          <span>🖨️</span>
                          <span>Print</span>
                        </button>

                        {previewDoc.fileData ? (
                          <a
                            href={previewDoc.fileData}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '5px 11px', fontSize: 12, fontWeight: 600, border: '1px solid #2563eb', borderRadius: 6, background: '#2563eb', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                            title="Open in Full Browser Tab"
                          >
                            <span>Open Tab ↗</span>
                          </a>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(previewDoc)}
                          style={{ padding: '5px 12px', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, background: 'var(--primary, #059669)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <DownloadIcon size={12} color="#ffffff" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* PDF Viewer Canvas Container */}
                    <div style={{
                      backgroundColor: '#525659',
                      borderRadius: 10,
                      padding: '24px 16px',
                      overflowX: 'auto',
                      overflowY: 'auto',
                      maxHeight: 560,
                      display: 'flex',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      {previewDoc.fileData ? (
                        <iframe
                          src={previewDoc.fileData}
                          title={previewDoc.name}
                          style={{
                            width: '100%',
                            maxWidth: 820,
                            height: '520px',
                            border: 'none',
                            borderRadius: 6,
                            backgroundColor: '#ffffff',
                            transform: `scale(${previewZoom})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease'
                          }}
                        />
                      ) : (
                        /* Authentic Maharashtra State Government Non-Judicial E-Stamp Legal Deed Sheet */
                        <div
                          className="print-document-container"
                          style={{
                            width: '100%',
                            maxWidth: 680,
                            backgroundColor: '#ffffff',
                            borderRadius: 4,
                            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                            padding: '36px 44px',
                            color: '#0f172a',
                            fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                            transform: `scale(${previewZoom})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease',
                            boxSizing: 'border-box',
                            position: 'relative'
                          }}
                        >
                          {/* Page 1: Stamp Paper & Legal Clauses */}
                          {previewPage === 1 && (
                            <div>
                              {/* E-Stamp Banner Header */}
                              <div style={{ border: '2.5px solid #065f46', borderRadius: 6, padding: '12px 14px', marginBottom: 22, backgroundColor: '#f0fdf4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #059669', paddingBottom: 8, marginBottom: 8 }}>
                                  <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#047857', letterSpacing: '1px' }}>GOVERNMENT OF MAHARASHTRA</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: '#064e3b', letterSpacing: '0.5px' }}>NON-JUDICIAL STAMP PAPER</div>
                                    <div style={{ fontSize: 9.5, color: '#047857' }}>सत्यमेव जयते • CERTIFICATE NO: MH-2026-STMP-894102-MUM</div>
                                  </div>
                                  <div style={{ textAlign: 'center', backgroundColor: '#065f46', color: '#ffffff', padding: '6px 12px', borderRadius: 6 }}>
                                    <div style={{ fontSize: 10, letterSpacing: '0.5px' }}>DENOMINATION</div>
                                    <div style={{ fontSize: 16, fontWeight: 900 }}>₹ 500</div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ width: 44, height: 44, border: '1.5px dashed #065f46', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5' }}>
                                      QR SEAL<br/>VERIFIED
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#064e3b', fontWeight: 600 }}>
                                  <span>MahaRERA Registration Ref: <strong>P51900001339</strong></span>
                                  <span>e-Challan: <strong>MH004921092812A</strong></span>
                                  <span>Sub-Registrar: <strong>Mumbai IV</strong></span>
                                </div>
                              </div>

                              {/* Document Title Header */}
                              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#64748b' }}>
                                  Official Real Estate Legal Repository
                                </div>
                                <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: '4px 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {previewDoc.name.toLowerCase().includes('agreement') ? 'AGREEMENT FOR SALE & TRANSFER OF IMMOVABLE PROPERTY' :
                                   previewDoc.name.toLowerCase().includes('maharera') ? 'MAHARASHTRA REAL ESTATE REGULATORY AUTHORITY REGISTRATION CERTIFICATE' :
                                   previewDoc.name.toLowerCase().includes('noc') ? 'CONDOMINIUM ASSOCIATION MAINTENANCE NO OBJECTION CERTIFICATE' :
                                   previewDoc.name.toLowerCase().includes('kyc') ? 'CONFIDENTIAL REAL ESTATE CLIENT KYC VERIFICATION DOSSIER' :
                                   previewDoc.name.toLowerCase().includes('search') ? 'LEGAL TITLE SEARCH & 30-YEAR NON-ENCUMBRANCE REPORT' :
                                   previewDoc.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}
                                </h2>
                                <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 700 }}>
                                  Under Real Estate (Regulation and Development) Act, 2016 (MahaRERA)
                                </div>
                              </div>

                              {/* Legal Deed Text */}
                              <div style={{ fontSize: 12.5, lineHeight: 1.65, color: '#1e293b', textAlign: 'justify', borderTop: '1px solid #cbd5e1', paddingTop: 14 }}>
                                <p style={{ margin: '0 0 10px' }}>
                                  <strong>THIS DEED / REGULATION INSTRUMENT</strong> is executed on this <strong>13th day of October, 2026</strong>, by and between:
                                </p>
                                <p style={{ margin: '0 0 10px', paddingLeft: 12, borderLeft: '3px solid #059669' }}>
                                  <strong>THE PROMOTER / TRANSFEROR:</strong> Lodha Developers Ltd., represented by Vance Luxury Realty Authorized Transaction Counsel, having its registered sales mandate at Lodha Park, Worli, Mumbai 400018 (hereinafter called the &ldquo;First Party&rdquo;).
                                </p>
                                <p style={{ margin: '0 0 14px', paddingLeft: 12, borderLeft: '3px solid #2563eb' }}>
                                  <strong>THE ALLOTTEE / TRANSFEREE:</strong> Vikram Malhotra, residing at Worli Seaface, Mumbai, verified via Aadhaar &amp; PAN Card compliance records (hereinafter called the &ldquo;Second Party&rdquo;).
                                </p>

                                <div style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', color: '#0f172a', margin: '14px 0 6px', letterSpacing: '0.5px' }}>
                                  TERMS, CLAUSES &amp; STATUTORY COVENANTS:
                                </div>
                                <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                                  <li style={{ marginBottom: 6 }}>
                                    <strong>Property Demarcation:</strong> The Promoter agrees to sell and the Allottee agrees to purchase Unit No. 3401, located on the 34th Floor, having a RERA Carpet Area of 2,450 sq. ft (227.6 sq. m) in Tower A, Lodha Park Worli.
                                  </li>
                                  <li style={{ marginBottom: 6 }}>
                                    <strong>Sale Consideration:</strong> The total agreed purchase price of ₹12,50,00,000/- (Rupees Twelve Crores Fifty Lakhs Only) plus applicable GST, stamp duty, and registration charges shall be payable strictly per RERA milestone schedules.
                                  </li>
                                  <li style={{ marginBottom: 6 }}>
                                    <strong>Escrow Compliance:</strong> 70% of all realization amounts shall be deposited into the dedicated MahaRERA Project Escrow Bank Account under Section 4(2)(l)(D) of the Act.
                                  </li>
                                  <li style={{ marginBottom: 6 }}>
                                    <strong>Clearance of Encumbrances:</strong> The Promoter warrants that the schedule property is free from mortgages, liens, or court litigation as attested by the 30-year advocate search report.
                                  </li>
                                </ol>

                                <div style={{ marginTop: 18, padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 6, fontSize: 11, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Official Vault Verification Hash: <strong>SHA256:7f9a2c...b81e</strong></span>
                                  <span style={{ fontWeight: 700, color: '#059669' }}>Page 1 of 2 (Turn for Signatures)</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Page 2: Schedule & Execution Signatures */}
                          {previewPage === 2 && (
                            <div>
                              <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px solid #0f172a', paddingBottom: 10 }}>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Schedule of Immovable Property &amp; Execution</div>
                                <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>SCHEDULE &lsquo;A&rsquo; — SPECIFICATIONS &amp; ATTESTATION</h3>
                              </div>

                              {/* Property Specifications Table */}
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, marginBottom: 18 }}>
                                <tbody>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#475569', width: '38%', backgroundColor: '#f8fafc' }}>Project &amp; Address</td>
                                    <td style={{ padding: '6px 8px', color: '#0f172a', fontWeight: 600 }}>Lodha Park, Pandurang Budhkar Marg, Worli, Mumbai 400018</td>
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>Unit &amp; Tower</td>
                                    <td style={{ padding: '6px 8px', color: '#0f172a', fontWeight: 600 }}>Unit 3401, 34th Floor, Tower A (Tower of Splendour)</td>
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>RERA Carpet Area</td>
                                    <td style={{ padding: '6px 8px', color: '#0f172a', fontWeight: 600 }}>2,450 sq.ft (227.6 sq. meters) + Exclusive Sky Deck</td>
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>Allocated Parking</td>
                                    <td style={{ padding: '6px 8px', color: '#0f172a', fontWeight: 600 }}>2 (Two) Covered Tandem Parking Bays (Level B2, Bays 114 &amp; 115)</td>
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc' }}>Registration Sub-District</td>
                                    <td style={{ padding: '6px 8px', color: '#0f172a', fontWeight: 600 }}>Sub-Registrar of Assurances, Mumbai City IV</td>
                                  </tr>
                                </tbody>
                              </table>

                              {/* Signatures & Corporate Seal */}
                              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, fontSize: 11.5 }}>
                                <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '12px', backgroundColor: '#fcfcfc', textAlign: 'center' }}>
                                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>FOR &amp; ON BEHALF OF PROMOTER</div>
                                  <div style={{ fontFamily: '"Brush Script MT", cursive', fontSize: 20, color: '#047857', marginBottom: 4 }}>Marcus Vance</div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Marcus Vance, Managing Partner</div>
                                  <div style={{ fontSize: 10, color: '#64748b' }}>Vance Luxury Realty • Mandate Desk</div>
                                  <div style={{ marginTop: 8, display: 'inline-block', border: '1.5px solid #059669', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 800, color: '#059669' }}>
                                    ✓ DIGITALLY CERTIFIED
                                  </div>
                                </div>

                                <div style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '12px', backgroundColor: '#fcfcfc', textAlign: 'center' }}>
                                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>FOR &amp; ON BEHALF OF ALLOTTEE</div>
                                  <div style={{ fontFamily: '"Brush Script MT", cursive', fontSize: 20, color: '#2563eb', marginBottom: 4 }}>Vikram Malhotra</div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Vikram Malhotra, Purchaser</div>
                                  <div style={{ fontSize: 10, color: '#64748b' }}>PAN: Verified • Aadhaar: Masked Compliant</div>
                                  <div style={{ marginTop: 8, display: 'inline-block', border: '1.5px solid #2563eb', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 800, color: '#2563eb' }}>
                                    ✓ IDENTITY VERIFIED
                                  </div>
                                </div>
                              </div>

                              {/* Attestation & Notary Public Seal */}
                              <div style={{ marginTop: 20, borderTop: '1px solid #cbd5e1', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, color: '#475569' }}>
                                <div>
                                  <div><strong>Witness 1:</strong> Rohit Singhania (PAN: ABCPS1234D)</div>
                                  <div><strong>Witness 2:</strong> Priya Desai (PAN: DEFPD5678K)</div>
                                </div>
                                <div style={{ border: '2px solid #b45309', borderRadius: 50, width: 72, height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b45309', fontSize: 7.5, fontWeight: 800, textAlign: 'center', lineHeight: 1.1 }}>
                                  <span>NOTARY</span>
                                  <span>PUBLIC</span>
                                  <span>MAHARASHTRA</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : isImage ? (
                  /* 2. IMAGE VIEWER */
                  <div style={{ marginBottom: 20 }}>
                    {/* Image Controls Toolbar */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12,
                      padding: '10px 14px',
                      backgroundColor: '#1e293b',
                      borderRadius: 10,
                      color: '#ffffff'
                    }}>
                      {/* Left: Mode */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🖼️</span> Architectural Image Viewer
                        </span>
                        <span style={{ fontSize: 11, backgroundColor: '#334155', color: '#38bdf8', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                          {previewDoc.size} • 2880 × 1800 px
                        </span>
                      </div>

                      {/* Center: Zoom & Rotate Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.max(0.4, +(prev - 0.25).toFixed(2)))}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#fff', cursor: 'pointer' }}
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(1)}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#38bdf8', cursor: 'pointer' }}
                          title="Reset Zoom to 100%"
                        >
                          {Math.round(previewZoom * 100)}%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.min(3.0, +(prev + 0.25).toFixed(2)))}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#fff', cursor: 'pointer' }}
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewRotation(prev => (prev + 90) % 360)}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Rotate 90 Degrees Clockwise"
                        >
                          <span>🔄</span>
                          <span>Rotate 90° ({previewRotation}°)</span>
                        </button>
                      </div>

                      {/* Right: Theme Toggle & Download */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setPreviewDarkBg(prev => !prev)}
                          style={{ padding: '5px 11px', fontSize: 12, fontWeight: 600, border: '1px solid #475569', borderRadius: 6, background: '#334155', color: '#fff', cursor: 'pointer' }}
                          title="Toggle Canvas Background"
                        >
                          {previewDarkBg ? '☀️ Blueprint Canvas' : '🌙 Dark Canvas'}
                        </button>

                        {previewDoc.fileData ? (
                          <a
                            href={previewDoc.fileData}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '5px 11px', fontSize: 12, fontWeight: 600, border: '1px solid #2563eb', borderRadius: 6, background: '#2563eb', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
                            title="Open in Full Browser Tab"
                          >
                            <span>Open Tab ↗</span>
                          </a>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleDownloadImage(previewDoc)}
                          style={{ padding: '5px 12px', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, background: 'var(--primary, #059669)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <DownloadIcon size={12} color="#ffffff" />
                          <span>Download Image</span>
                        </button>
                      </div>
                    </div>

                    {/* Image Canvas Container */}
                    <div style={{
                      overflow: 'auto',
                      maxHeight: 520,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: previewDarkBg ? '#090d16' : '#0b2545',
                      backgroundImage: previewDarkBg
                        ? 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)'
                        : 'linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                      borderRadius: 10,
                      padding: 24,
                      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{
                        transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {previewDoc.fileData ? (
                          <img
                            src={previewDoc.fileData}
                            alt={previewDoc.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: 460,
                              borderRadius: 8,
                              boxShadow: '0 12px 35px rgba(0,0,0,0.45)'
                            }}
                          />
                        ) : (
                          /* High-Resolution CAD Architectural Floor Plan Blueprint SVG */
                          <div style={{ backgroundColor: '#0f172a', padding: 12, borderRadius: 8, boxShadow: '0 20px 45px rgba(0,0,0,0.6)' }}>
                            <svg
                              id="blueprint-floorplan-svg"
                              width="760"
                              height="480"
                              viewBox="0 0 1000 640"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ display: 'block', backgroundColor: '#091e3a', borderRadius: 6 }}
                            >
                              {/* Background Blueprint Grid */}
                              <defs>
                                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
                                </pattern>
                              </defs>
                              <rect width="1000" height="640" fill="url(#cadGrid)" />

                              {/* Outer CAD Border */}
                              <rect x="20" y="20" width="960" height="600" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                              <rect x="25" y="25" width="950" height="590" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />

                              {/* North Arrow Compass Rose */}
                              <g transform="translate(60, 60)">
                                <circle cx="0" cy="0" r="22" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                                <polygon points="0,-18 5,0 0,-4 -5,0" fill="#38bdf8" />
                                <polygon points="0,18 5,0 0,4 -5,0" fill="#64748b" />
                                <text x="-4" y="-24" fill="#38bdf8" fontSize="12" fontWeight="bold">N</text>
                              </g>

                              {/* ROOM 1: Grand Living & Dining Salon */}
                              <rect x="120" y="60" width="460" height="280" fill="rgba(30, 58, 138, 0.25)" stroke="#38bdf8" strokeWidth="2" />
                              <text x="140" y="90" fill="#e0f2fe" fontSize="17" fontWeight="bold">GRAND LIVING &amp; DINING SALON</text>
                              <text x="140" y="112" fill="#7dd3fc" fontSize="13">32&apos;0&quot; × 18&apos;0&quot; (576 sq.ft)</text>
                              {/* Living room furniture layout outline */}
                              <rect x="140" y="140" width="180" height="120" rx="6" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                              <text x="180" y="205" fill="#38bdf8" fontSize="12">Seating Lounge</text>
                              <rect x="350" y="140" width="160" height="100" rx="6" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                              <text x="385" y="195" fill="#38bdf8" fontSize="12">8-Seat Dining</text>

                              {/* ROOM 2: Master Bedroom Suite */}
                              <rect x="600" y="60" width="360" height="280" fill="rgba(30, 58, 138, 0.35)" stroke="#38bdf8" strokeWidth="2" />
                              <text x="620" y="90" fill="#e0f2fe" fontSize="17" fontWeight="bold">MASTER BEDROOM SUITE</text>
                              <text x="620" y="112" fill="#7dd3fc" fontSize="13">24&apos;0&quot; × 16&apos;6&quot; (396 sq.ft)</text>
                              <rect x="650" y="130" width="150" height="140" rx="6" fill="none" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="1.5" />
                              <text x="695" y="205" fill="#38bdf8" fontSize="12">King Bed</text>
                              <rect x="820" y="130" width="120" height="140" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                              <text x="835" y="205" fill="#7dd3fc" fontSize="11">Walk-in Closet</text>

                              {/* ROOM 3: Sky Deck Balcony */}
                              <rect x="120" y="360" width="460" height="90" fill="rgba(14, 165, 233, 0.2)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
                              <text x="140" y="400" fill="#e0f2fe" fontSize="15" fontWeight="bold">SKY DECK TERRACE BALCONY</text>
                              <text x="140" y="422" fill="#38bdf8" fontSize="12.5">32&apos;0&quot; × 7&apos;0&quot; • Panoramic Arabian Sea View</text>

                              {/* ROOM 4: Bedroom 2 & Bath */}
                              <rect x="600" y="360" width="220" height="220" fill="rgba(30, 58, 138, 0.25)" stroke="#38bdf8" strokeWidth="2" />
                              <text x="615" y="390" fill="#e0f2fe" fontSize="15" fontWeight="bold">BEDROOM 2</text>
                              <text x="615" y="410" fill="#7dd3fc" fontSize="12">16&apos;0&quot; × 14&apos;0&quot;</text>
                              <rect x="635" y="430" width="110" height="110" rx="6" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1" strokeDasharray="3 3" />

                              {/* ROOM 5: Gourmet Modular Kitchen */}
                              <rect x="120" y="470" width="220" height="110" fill="rgba(30, 58, 138, 0.25)" stroke="#38bdf8" strokeWidth="2" />
                              <text x="135" y="500" fill="#e0f2fe" fontSize="14" fontWeight="bold">MODULAR KITCHEN</text>
                              <text x="135" y="520" fill="#7dd3fc" fontSize="11.5">14&apos;0&quot; × 11&apos;0&quot; + Dry Balcony</text>

                              {/* ROOM 6: Bedroom 3 / Guest Suite */}
                              <rect x="360" y="470" width="220" height="110" fill="rgba(30, 58, 138, 0.25)" stroke="#38bdf8" strokeWidth="2" />
                              <text x="375" y="500" fill="#e0f2fe" fontSize="14" fontWeight="bold">GUEST SUITE</text>
                              <text x="375" y="520" fill="#7dd3fc" fontSize="11.5">15&apos;0&quot; × 12&apos;0&quot;</text>

                              {/* ROOM 7: Private Elevator Foyer */}
                              <rect x="40" y="200" width="60" height="160" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" />
                              <text x="50" y="260" fill="#38bdf8" fontSize="11" fontWeight="bold" transform="rotate(-90 50 260)">PRIVATE FOYER</text>

                              {/* CAD Architectural Title Block (Bottom Right) */}
                              <g transform="translate(830, 480)">
                                <rect x="0" y="0" width="130" height="100" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                                <text x="10" y="22" fill="#e0f2fe" fontSize="11" fontWeight="bold">LODHA PARK</text>
                                <text x="10" y="38" fill="#38bdf8" fontSize="9">WORLI, MUMBAI</text>
                                <line x1="0" y1="46" x2="130" y2="46" stroke="#38bdf8" strokeWidth="0.8" />
                                <text x="10" y="60" fill="#94a3b8" fontSize="8.5">UNIT: 3401 (4 BHK)</text>
                                <text x="10" y="74" fill="#94a3b8" fontSize="8.5">RERA: 2,450 SQ.FT</text>
                                <text x="10" y="88" fill="#4ade80" fontSize="8.5" fontWeight="bold">APPROVED PLAN</text>
                              </g>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isDoc ? (
                  /* 3. WORD DOCUMENT VIEWER */
                  <div style={{ marginBottom: 20 }}>
                    {/* Microsoft Word Style Top Ribbon Toolbar */}
                    <div style={{
                      backgroundColor: '#2b579a',
                      borderRadius: '10px 10px 0 0',
                      padding: '10px 16px',
                      color: '#ffffff',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      {/* Left: Document Mode & Tabs */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13 }}>
                          <span>📘</span>
                          <span>Word Document Viewer</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {(['File', 'Home', 'Layout', 'Review', 'View'] as const).map(tab => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setWordRibbonTab(tab)}
                              style={{
                                padding: '4px 10px',
                                fontSize: 11.5,
                                fontWeight: wordRibbonTab === tab ? 700 : 500,
                                color: wordRibbonTab === tab ? '#ffffff' : '#bfdbfe',
                                backgroundColor: wordRibbonTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                              }}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Read-Only Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: 6 }}>
                        <span>🔒 Read-Only Document (Protected Agency Copy)</span>
                      </div>
                    </div>

                    {/* Word Secondary Action & Stats Bar */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 14px',
                      backgroundColor: '#f1f5f9',
                      borderLeft: '1px solid #cbd5e1',
                      borderRight: '1px solid #cbd5e1',
                      borderBottom: '1px solid #cbd5e1',
                      fontSize: 12,
                      color: '#334155'
                    }}>
                      {/* Left: Stats & Page Nav */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>
                          📄 1,480 Words • 2 Pages • Calibri • MahaRERA Compliant
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                            disabled={previewPage <= 1}
                            style={{ background: 'none', border: 'none', color: previewPage <= 1 ? '#94a3b8' : '#0f172a', cursor: previewPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                          >
                            ◀
                          </button>
                          <span style={{ fontWeight: 600 }}>Page {previewPage} of 2</span>
                          <button
                            type="button"
                            onClick={() => setPreviewPage(prev => Math.min(2, prev + 1))}
                            disabled={previewPage >= 2}
                            style={{ background: 'none', border: 'none', color: previewPage >= 2 ? '#94a3b8' : '#0f172a', cursor: previewPage >= 2 ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                          >
                            ▶
                          </button>
                        </div>
                      </div>

                      {/* Center: Zoom */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.max(0.6, +(prev - 0.2).toFixed(1)))}
                          style={{ padding: '3px 8px', fontSize: 11.5, fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(1)}
                          style={{ padding: '3px 8px', fontSize: 11.5, fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                        >
                          {Math.round(previewZoom * 100)}%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(prev => Math.min(2.0, +(prev + 0.2).toFixed(1)))}
                          style={{ padding: '3px 8px', fontSize: 11.5, fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={handlePrintDocument}
                          style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>🖨️</span>
                          <span>Print</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadWordDoc(previewDoc)}
                          style={{ padding: '4px 12px', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, background: '#2b579a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <DownloadIcon size={12} color="#ffffff" />
                          <span>Download .DOCX</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(previewDoc)}
                          style={{ padding: '4px 12px', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, background: 'var(--primary, #059669)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <DownloadIcon size={12} color="#ffffff" />
                          <span>Export PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Word Document Canvas */}
                    <div style={{
                      backgroundColor: '#e2e8f0',
                      borderRadius: '0 0 10px 10px',
                      padding: '28px 16px',
                      overflowX: 'auto',
                      overflowY: 'auto',
                      maxHeight: 560,
                      display: 'flex',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <div
                        className="print-document-container"
                        style={{
                          width: '100%',
                          maxWidth: 680,
                          backgroundColor: '#ffffff',
                          borderRadius: 4,
                          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                          padding: '42px 48px',
                          color: '#111827',
                          fontFamily: 'Calibri, Aptos, Arial, sans-serif',
                          transform: `scale(${previewZoom})`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.15s ease',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Word Page 1 */}
                        {previewPage === 1 && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: 6, marginBottom: 20, fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
                              <span>VANCE LUXURY REALTY — LEGAL &amp; CONTRACTS CELL</span>
                              <span>CONFIDENTIAL EXECUTION DRAFT</span>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                EXCLUSIVE SOLE SELLING REAL ESTATE BROKERAGE MANDATE AGREEMENT
                              </h1>
                              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                                Executed in accordance with MahaRERA Advisory &amp; The Indian Contract Act, 1872
                              </div>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 16px', marginBottom: 20, fontSize: 12, lineHeight: 1.6 }}>
                              <div><strong>DATED:</strong> 14th day of October, 2026 at Mumbai</div>
                              <div><strong>FIRST PARTY (THE &ldquo;OWNER / PROMOTER&rdquo;):</strong> Registered Legal Owner of designated residential units in Lodha Park, Worli.</div>
                              <div><strong>SECOND PARTY (THE &ldquo;EXCLUSIVE BROKER&rdquo;):</strong> Vance Luxury Realty, registered under MahaRERA Reg: <strong>A51900004921</strong>.</div>
                            </div>

                            <div style={{ fontSize: 12.5, lineHeight: 1.65, color: '#1e293b', textAlign: 'justify' }}>
                              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', margin: '14px 0 6px', textTransform: 'uppercase' }}>
                                ARTICLE 1: GRANT OF EXCLUSIVE MANDATE
                              </h3>
                              <p style={{ margin: '0 0 10px' }}>
                                The Owner hereby appoints Vance Luxury Realty as the sole, exclusive, and irrevocable real estate brokerage partner for marketing, showcasing, and negotiating outright disposition of luxury 4 BHK apartments in Lodha Park, Worli, Mumbai for an initial period of 180 days.
                              </p>

                              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', margin: '14px 0 6px', textTransform: 'uppercase' }}>
                                ARTICLE 2: PROFESSIONAL FEES &amp; MILESTONE DISBURSEMENT
                              </h3>
                              <p style={{ margin: '0 0 6px' }}>
                                (a) The Owner covenants to pay the Broker a professional fee of <strong>2.0% (Two Percent)</strong> plus applicable GST on the total gross agreement value of every booked and executed transaction.
                              </p>
                              <p style={{ margin: '0 0 10px' }}>
                                (b) Payment shall be disbursed in two equal tranches: 50% upon realization of the 10% token earnest bayana, and 50% upon registration of the formal Agreement for Sale with the Sub-Registrar.
                              </p>

                              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', margin: '14px 0 6px', textTransform: 'uppercase' }}>
                                ARTICLE 3: MARKETING SYNDICATION &amp; PORTAL ALLOCATION
                              </h3>
                              <p style={{ margin: '0 0 10px' }}>
                                The Broker is authorized to syndication campaigns across MagicBricks, 99acres, luxury HNI private networks, and direct WhatsApp marketing within an approved quarterly allocation of ₹1,50,000/-.
                              </p>

                              <div style={{ marginTop: 20, textAlign: 'right', fontSize: 11, color: '#64748b' }}>
                                <span>[Turn to Page 2 for Protection Clauses &amp; Signatures]</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Word Page 2 */}
                        {previewPage === 2 && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: 6, marginBottom: 20, fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
                              <span>SOLE SELLING MANDATE — PAGE 2 OF 2</span>
                              <span>VANCE LUXURY REALTY</span>
                            </div>

                            <div style={{ fontSize: 12.5, lineHeight: 1.65, color: '#1e293b', textAlign: 'justify' }}>
                              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', margin: '10px 0 6px', textTransform: 'uppercase' }}>
                                ARTICLE 4: POST-TERMINATION PROTECTION PERIOD (&ldquo;RUN-OFF CLAUSE&rdquo;)
                              </h3>
                              <p style={{ margin: '0 0 12px' }}>
                                In the event this Agreement expires or is terminated by either party, the Broker shall remain fully entitled to 2.0% commission for a run-off protection period of <strong>180 (One Hundred Eighty) days</strong> on any prospective buyer registered in the AgentLadders agency CRM database prior to termination.
                              </p>

                              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', margin: '14px 0 6px', textTransform: 'uppercase' }}>
                                ARTICLE 5: CONFIDENTIALITY &amp; NON-CIRCUMVENTION
                              </h3>
                              <p style={{ margin: '0 0 12px' }}>
                                All prospective buyer identities, financial inquiries, and proprietary commercial terms negotiated shall remain strictly confidential. The Owner covenants not to circumvent the Broker directly or indirectly with introduced parties.
                              </p>

                              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', margin: '14px 0 6px', textTransform: 'uppercase' }}>
                                ARTICLE 6: GOVERNING LAW &amp; JURISDICTION
                              </h3>
                              <p style={{ margin: '0 0 20px' }}>
                                This Agreement shall be governed by and construed in accordance with the laws of the Republic of India and subject to the exclusive jurisdiction of the Courts in Mumbai.
                              </p>

                              {/* Signature & Seal Blocks */}
                              <div style={{ marginTop: 32, borderTop: '2px solid #0f172a', paddingTop: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 18, color: '#0f172a' }}>
                                  IN WITNESS WHEREOF, THE PARTIES HERETO HAVE EXECUTED THIS MANDATE:
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28, fontSize: 11.5 }}>
                                  <div>
                                    <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: 24, marginBottom: 8 }}>
                                      <span style={{ fontFamily: '"Brush Script MT", cursive', fontSize: 22, color: '#047857' }}>Marcus Vance</span>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>FOR VANCE LUXURY REALTY</div>
                                    <div style={{ color: '#64748b' }}>Marcus Vance, Managing Partner</div>
                                    <div style={{ color: '#059669', fontWeight: 600, fontSize: 10 }}>MahaRERA: A51900004921</div>
                                  </div>

                                  <div>
                                    <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: 24, marginBottom: 8 }}>
                                      <span style={{ fontFamily: '"Brush Script MT", cursive', fontSize: 22, color: '#2563eb' }}>R. K. Lodha</span>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>FOR PROMOTER / OWNER</div>
                                    <div style={{ color: '#64748b' }}>Authorized Corporate Signatory</div>
                                    <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 10 }}>CIN: L45200MH1995PLC089</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 4. GENERIC FILE VIEWER */
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '36px 24px', textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>{getFileIcon(previewDoc.type, previewDoc.name)}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{previewDoc.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Category: <strong>{previewDoc.category || 'General'}</strong> • Size: <strong>{previewDoc.size}</strong> • Type: <strong>{previewDoc.type}</strong>
                    </div>
                  </div>
                )}

                {/* Note / Description Section */}
                {previewDoc.description && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>📝</span> Notes &amp; Description
                    </div>
                    <div style={{ fontSize: 13.5, color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {previewDoc.description}
                    </div>
                  </div>
                )}

                {/* Multi-selected Associated CRM Records */}
                {previewDoc.relatedTo && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>🔗</span> Associated CRM Records
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {previewDoc.relatedTo.split(', ').filter(Boolean).map((rel, idx) => {
                        const icon = rel.startsWith('Property') ? '🏢' : rel.startsWith('Client') ? '👤' : '💼';
                        return (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 14,
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              fontSize: 12.5,
                              fontWeight: 600,
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            <span>{icon}</span>
                            <span>{rel}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metadata Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20, fontSize: 13 }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Uploaded By</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{previewDoc.uploadedBy || 'Agent'}</span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Upload Date</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(previewDoc.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Action Buttons: WhatsApp, Edit Details, Download */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const doc = previewDoc;
                      setPreviewDoc(null);
                      handleOpenEdit(doc);
                    }}
                    style={{
                      padding: '11px',
                      borderRadius: 9,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7
                    }}
                  >
                    <span>✏️</span>
                    <span>Edit Details</span>
                  </button>

                  {/* Copy Direct Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyDirectLink(previewDoc)}
                    style={{
                      padding: '11px',
                      borderRadius: 9,
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7
                    }}
                  >
                    <span>🔗</span>
                    <span>Copy Direct Link</span>
                  </button>

                  {/* Share with Client / Anyone */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppShare(previewDoc)}
                    style={{
                      padding: '11px',
                      borderRadius: 9,
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7
                    }}
                  >
                    <WhatsAppIcon size={16} color="#ffffff" />
                    <span>Share with Client / Anyone</span>
                  </button>

                  {/* Download */}
                  {previewDoc.fileData ? (
                    <a
                      href={previewDoc.fileData}
                      download={previewDoc.name}
                      style={{
                        padding: '11px',
                        borderRadius: 9,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7
                      }}
                    >
                      <DownloadIcon size={14} color="#ffffff" />
                      <span>Download File</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (isDoc) {
                          handleDownloadWordDoc(previewDoc);
                        } else if (isImage) {
                          handleDownloadImage(previewDoc);
                        } else {
                          handleDownloadPdf(previewDoc);
                        }
                      }}
                      style={{
                        padding: '11px',
                        borderRadius: 9,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7
                      }}
                    >
                      <DownloadIcon size={14} color="#ffffff" />
                      <span>Download File</span>
                    </button>
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
