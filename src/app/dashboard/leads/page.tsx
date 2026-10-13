'use client';

import React, { useState, useEffect } from 'react';
import { 
  formatINR, 
  DEFAULT_BHK_OPTIONS, 
  DEFAULT_PROPERTY_TYPES,
  DEFAULT_PROPERTY_SPECS,
  DEFAULT_CONSTRUCTION_STAGES,
  DEFAULT_VASTU_FACINGS,
  DEFAULT_PARKING_OPTIONS,
  DEFAULT_LEAD_SOURCES,
  DEFAULT_LEAD_STATUSES
} from '@/lib/formatters';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { 
  EditIcon, 
  TrashIcon, 
  WhatsAppIcon, 
  PhoneIcon, 
  SearchIcon, 
  PlusIcon, 
  KeyIcon, 
  HomeIcon, 
  ListIcon, 
  CompassIcon, 
  SparklesIcon, 
  BuildingIcon 
} from '@/components/icons/NavIcons';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  source?: string;
  isSelfCreated?: boolean;
  selfCreatedTag?: string;
  city?: string;
  bhkNeeded?: string | string[];
  propertyTypeNeeded?: string;
  furnishingPreference?: string;
  constructionStagePreference?: string;
  vastuPreference?: string;
  parkingPreference?: string;
  budgetMin?: number;
  budgetMax?: number;
  budget?: string;
  nextFollowUp?: string;
  preferredLocalities?: string;
  urgency?: string;
}

export default function LeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');

  const isLeadRent = (l: Lead) => {
    const p = ((l as any).leadPurpose || (l as any).purpose || (l as any).leadType || (l as any).dealType || '').toLowerCase();
    const req = ((l as any).requirement || '').toLowerCase();
    return p.includes('rent') || p.includes('tenant') || p.includes('lease') || req.includes('rent') || req.includes('lease');
  };

  // Dynamic Agency Configurations
  const [bhkOptions, setBhkOptions] = useState<string[]>(DEFAULT_BHK_OPTIONS);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(DEFAULT_PROPERTY_TYPES);
  const [propertySpecs, setPropertySpecs] = useState<string[]>(DEFAULT_PROPERTY_SPECS);
  const [constructionStages, setConstructionStages] = useState<string[]>(DEFAULT_CONSTRUCTION_STAGES);
  const [vastuOptions, setVastuOptions] = useState<string[]>(DEFAULT_VASTU_FACINGS);
  const [parkingOptions, setParkingOptions] = useState<string[]>(DEFAULT_PARKING_OPTIONS);
  const [leadSources, setLeadSources] = useState<string[]>(DEFAULT_LEAD_SOURCES);
  const [leadStatuses, setLeadStatuses] = useState<string[]>(DEFAULT_LEAD_STATUSES);
  const [sourceFilter, setSourceFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    leadPurpose: 'Buy', propertyTypeNeeded: 'Apartment',
    bhkNeeded: '2 BHK', budgetMax: '', city: 'Mumbai',
    preferredLocalities: '', urgency: 'Within 1 Month', status: 'New Inbound',
    source: 'Website Inbound',
    furnishingPreference: 'Any',
    constructionStagePreference: 'Any',
    vastuPreference: 'Any',
    parkingPreference: 'Any'
  });

  const loadData = () => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(json => {
        if (json.leads) setData(json.leads);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    // Check localStorage agency configs for instant sync
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('agentladders_agency_configs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.bhkOptions) && parsed.bhkOptions.length > 0) setBhkOptions(parsed.bhkOptions);
          if (Array.isArray(parsed.propertyTypes) && parsed.propertyTypes.length > 0) setPropertyTypes(parsed.propertyTypes);
          if (Array.isArray(parsed.propertySpecs) && parsed.propertySpecs.length > 0) setPropertySpecs(parsed.propertySpecs);
          if (Array.isArray(parsed.constructionStages) && parsed.constructionStages.length > 0) setConstructionStages(parsed.constructionStages);
          if (Array.isArray(parsed.vastuOptions) && parsed.vastuOptions.length > 0) setVastuOptions(parsed.vastuOptions);
          if (Array.isArray(parsed.parkingOptions) && parsed.parkingOptions.length > 0) setParkingOptions(parsed.parkingOptions);
          if (Array.isArray(parsed.leadSources) && parsed.leadSources.length > 0) setLeadSources(parsed.leadSources);
          if (Array.isArray(parsed.leadStatuses) && parsed.leadStatuses.length > 0) setLeadStatuses(parsed.leadStatuses);
        }
      } catch {}
    }

    // Refresh agency configs from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.agency) {
          if (Array.isArray(data.agency.bhkOptions) && data.agency.bhkOptions.length > 0) setBhkOptions(data.agency.bhkOptions);
          if (Array.isArray(data.agency.propertyTypes) && data.agency.propertyTypes.length > 0) setPropertyTypes(data.agency.propertyTypes);
          if (Array.isArray(data.agency.propertySpecs) && data.agency.propertySpecs.length > 0) setPropertySpecs(data.agency.propertySpecs);
          if (Array.isArray(data.agency.constructionStages) && data.agency.constructionStages.length > 0) setConstructionStages(data.agency.constructionStages);
          if (Array.isArray(data.agency.vastuOptions) && data.agency.vastuOptions.length > 0) setVastuOptions(data.agency.vastuOptions);
          if (Array.isArray(data.agency.parkingOptions) && data.agency.parkingOptions.length > 0) setParkingOptions(data.agency.parkingOptions);
          if (Array.isArray(data.agency.leadSources) && data.agency.leadSources.length > 0) setLeadSources(data.agency.leadSources);
          if (Array.isArray(data.agency.leadStatuses) && data.agency.leadStatuses.length > 0) setLeadStatuses(data.agency.leadStatuses);
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setShowModal(true);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agentladders_agency_configs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.bhkOptions) && parsed.bhkOptions.length > 0) setBhkOptions(parsed.bhkOptions);
          if (Array.isArray(parsed.propertyTypes) && parsed.propertyTypes.length > 0) setPropertyTypes(parsed.propertyTypes);
          if (Array.isArray(parsed.propertySpecs) && parsed.propertySpecs.length > 0) setPropertySpecs(parsed.propertySpecs);
          if (Array.isArray(parsed.constructionStages) && parsed.constructionStages.length > 0) setConstructionStages(parsed.constructionStages);
          if (Array.isArray(parsed.vastuOptions) && parsed.vastuOptions.length > 0) setVastuOptions(parsed.vastuOptions);
          if (Array.isArray(parsed.parkingOptions) && parsed.parkingOptions.length > 0) setParkingOptions(parsed.parkingOptions);
          if (Array.isArray(parsed.leadSources) && parsed.leadSources.length > 0) setLeadSources(parsed.leadSources);
          if (Array.isArray(parsed.leadStatuses) && parsed.leadStatuses.length > 0) setLeadStatuses(parsed.leadStatuses);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      name: '', phone: '', email: '',
      leadPurpose: 'Buy', propertyTypeNeeded: 'Apartment',
      bhkNeeded: '2 BHK', budgetMax: '', city: 'Mumbai',
      preferredLocalities: '', urgency: 'Within 1 Month', status: 'New Inbound',
      source: leadSources[0] || 'Direct',
      furnishingPreference: 'Any',
      constructionStagePreference: 'Any',
      vastuPreference: 'Any',
      parkingPreference: 'Any'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    const isRent = isLeadRent(lead);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      leadPurpose: isRent ? 'Rent' : 'Buy',
      propertyTypeNeeded: lead.propertyTypeNeeded || 'Apartment',
      bhkNeeded: Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded[0] || '2 BHK' : (lead.bhkNeeded || '2 BHK'),
      budgetMax: lead.budgetMax ? lead.budgetMax.toString() : '',
      city: lead.city || 'Mumbai',
      preferredLocalities: lead.preferredLocalities || '',
      urgency: lead.urgency || 'Within 1 Month',
      status: lead.status || 'New Inbound',
      source: lead.source || leadSources[0] || 'Direct',
      furnishingPreference: lead.furnishingPreference || 'Any',
      constructionStagePreference: lead.constructionStagePreference || 'Any',
      vastuPreference: lead.vastuPreference || 'Any',
      parkingPreference: lead.parkingPreference || 'Any'
    });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/leads?id=${encodeURIComponent(deletingLead.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(prev => prev.filter(l => l.id !== deletingLead.id));
        if (editingLead?.id === deletingLead.id) {
          setShowModal(false);
          setEditingLead(null);
        }
        showToast('success', `Inquiry for "${deletingLead.name}" deleted successfully.`, 'Inquiry Deleted');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error || 'Failed to delete inquiry.', 'Delete Failed');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Network error while attempting to delete inquiry.', 'Network Error');
    } finally {
      setIsDeleting(false);
      setDeletingLead(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...(editingLead ? { id: editingLead.id } : {}),
        ...formData,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        bhkNeeded: [formData.bhkNeeded]
      };
      const method = editingLead ? 'PUT' : 'POST';
      const res = await fetch('/api/leads', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingLead(null);
        loadData();
        showToast('success', editingLead ? `Inquiry for "${formData.name}" updated successfully!` : `Inquiry for "${formData.name}" added successfully!`, editingLead ? 'Inquiry Updated' : 'Inquiry Created');
        setFormData({
          name: '', phone: '', email: '',
          leadPurpose: 'Buy', propertyTypeNeeded: 'Apartment',
          bhkNeeded: '2 BHK', budgetMax: '', city: 'Mumbai',
          preferredLocalities: '', urgency: 'Within 1 Month', status: 'New Inbound',
          source: leadSources[0] || 'Direct',
          furnishingPreference: 'Any',
          constructionStagePreference: 'Any',
          vastuPreference: 'Any',
          parkingPreference: 'Any'
        });
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error || 'Failed to save inquiry. Please check your inputs.', 'Save Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error occurred while saving inquiry.', 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buyCount = data.filter(l => !isLeadRent(l)).length;
  const rentCount = data.filter(l => isLeadRent(l)).length;

  const filteredData = data.filter(l => {
    if (purposeFilter !== 'All') {
      const isRent = isLeadRent(l);
      if (purposeFilter === 'Rent' && !isRent) return false;
      if (purposeFilter === 'Buy' && isRent) return false;
    }
    if (filter !== 'All') {
      if (filter === 'Active' && ['Won', 'Lost', 'Dead'].includes(l.status)) return false;
      if (filter !== 'Active' && l.status !== filter) return false;
    }
    if (sourceFilter !== 'All' && (l.source || 'Direct Inbound') !== sourceFilter) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.city?.toLowerCase().includes(q) || (l.source && l.source.toLowerCase().includes(q));
    }
    return true;
  });

  const getStatusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; dot: string }> = {
      'New Inbound': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
      'Contacted': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
      'Qualified': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
      'Site Visit Scheduled': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
      'Negotiation': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
      'Won': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
      'Lost': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
      'Dead': { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' }
    };
    const style = map[s] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: style.bg, padding: '4px 10px', borderRadius: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot }} />
        <span style={{ color: style.color, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</span>
      </div>
    );
  };

  const getSourceBadge = (src?: string) => {
    const s = src || 'Direct Inbound';
    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#e2e8f0';
    let dot = '#94a3b8';

    if (s.toLowerCase().includes('self-created') || s.toLowerCase().includes('public listing') || s.toLowerCase().includes('self-interest')) {
      bg = '#fdf4ff'; color = '#a21caf'; border = '#f0abfc'; dot = '#c026d3';
    } else if (s.toLowerCase().includes('whatsapp')) {
      bg = '#dcfce7'; color = '#15803d'; border = '#86efac'; dot = '#16a34a';
    } else if (s.toLowerCase().includes('website')) {
      bg = '#eff6ff'; color = '#1d4ed8'; border = '#bfdbfe'; dot = '#2563eb';
    } else if (s.toLowerCase().includes('99acres') || s.toLowerCase().includes('magicbricks') || s.toLowerCase().includes('housing')) {
      bg = '#fff7ed'; color = '#c2410c'; border = '#fed7aa'; dot = '#ea580c';
    } else if (s.toLowerCase().includes('referral') || s.toLowerCase().includes('word of mouth')) {
      bg = '#faf5ff'; color = '#7e22ce'; border = '#e9d5ff'; dot = '#9333ea';
    } else if (s.toLowerCase().includes('walk-in')) {
      bg = '#f0fdf4'; color = '#166534'; border = '#bbf7d0'; dot = '#16a34a';
    } else if (s.toLowerCase().includes('instagram') || s.toLowerCase().includes('social')) {
      bg = '#fdf2f8'; color = '#be185d'; border = '#fbcfe8'; dot = '#db2777';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        borderRadius: 6,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dot }} />
        <span>{s}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Fetching latest inquiries...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Slide-over Modal for Adding Lead */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="responsive-drawer animate-enter" style={{ backgroundColor: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingLead ? 'Edit Inquiry' : 'Add New Inquiry'}
                <InfoTooltip text="Log or update buyer and tenant inquiries, match requirements, and set pipeline status." />
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Primary Status & Priority / Urgency (Top 2 Fields) */}
              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Inquiry Status *
                    <InfoTooltip text="Pipeline stage for this inquiry, from initial inbound to qualified, site visit, negotiation, or won." />
                  </label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                  >
                    {leadStatuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Priority / Urgency *
                    <InfoTooltip text="Urgency or timeline readiness of this client (Hot buyer ready now vs exploring), helping agents prioritize fast follow-ups." />
                  </label>
                  <select 
                    value={formData.urgency} 
                    onChange={e => setFormData({...formData, urgency: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                  >
                    <option value="Immediate (Hot Buyer)">Immediate (Hot Buyer - Ready Now)</option>
                    <option value="Within 15 Days">High Urgency (Within 15 Days)</option>
                    <option value="Within 1 Month">Moderate (Within 1 Month)</option>
                    <option value="1-3 Months">Standard (1-3 Months)</option>
                    <option value="Exploring / Low">Low / Long-term Exploring</option>
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Phone *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. 9876543210" />
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="rahul@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Lead & Inbound Source <InfoTooltip text="Channel where inquiry originated: WhatsApp, 99acres, MagicBricks, Referral, Website, etc." />
                  </label>
                  <select 
                    value={formData.source} 
                    onChange={e => setFormData({...formData, source: e.target.value})} 
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {leadSources.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />

              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>Requirements</h3>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Purpose</label>
                  <select value={formData.leadPurpose} onChange={e => setFormData({...formData, leadPurpose: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    {['Buy', 'Rent'].map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Property Type</label>
                  <select value={formData.propertyTypeNeeded} onChange={e => setFormData({...formData, propertyTypeNeeded: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    {propertyTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>BHK Needed</label>
                  <select value={formData.bhkNeeded} onChange={e => setFormData({...formData, bhkNeeded: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    {bhkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Max Budget (₹)</label>
                  <input type="number" value={formData.budgetMax} onChange={e => setFormData({...formData, budgetMax: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. 20000000" />
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>City</label>
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Preferred Localities</label>
                  <input value={formData.preferredLocalities} onChange={e => setFormData({...formData, preferredLocalities: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. Bandra West, Worli" />
                </div>
              </div>

              {/* Preferences: Specs, Construction Stage, Vastu, Parking */}
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CompassIcon size={16} color="var(--primary)" />
                  <span>Client Preferences & Criteria</span>
                </div>

                <div className="responsive-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Furnishing / Specs <InfoTooltip text="Client furnishing expectation" />
                    </label>
                    <select 
                      value={formData.furnishingPreference} 
                      onChange={e => setFormData({...formData, furnishingPreference: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {['Any', ...propertySpecs].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Construction Stage <InfoTooltip text="Possession timeline required by client" />
                    </label>
                    <select 
                      value={formData.constructionStagePreference} 
                      onChange={e => setFormData({...formData, constructionStagePreference: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {['Any', ...constructionStages].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="responsive-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Vastu Preference <InfoTooltip text="Mandatory orientation for spiritual alignment" />
                    </label>
                    <select 
                      value={formData.vastuPreference} 
                      onChange={e => setFormData({...formData, vastuPreference: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {['Any', ...vastuOptions].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Parking Needed <InfoTooltip text="Car parking requirement" />
                    </label>
                    <select 
                      value={formData.parkingPreference} 
                      onChange={e => setFormData({...formData, parkingPreference: e.target.value})} 
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {['Any', ...parkingOptions].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', position: 'sticky', bottom: '-24px', backgroundColor: '#fff', padding: '16px 0', borderTop: '1px solid var(--border)', zIndex: 10 }}>
                {editingLead && (
                  <button
                    type="button"
                    onClick={() => setDeletingLead(editingLead)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <TrashIcon size={15} color="#dc2626" />
                    <span>Delete</span>
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '12px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {isSubmitting ? 'Saving...' : editingLead ? 'Update Inquiry' : 'Save Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-page-container animate-enter">
      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
            Inquiries <InfoTooltip text="Manage all your incoming leads and match them with properties instantly." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            {filteredData.length} active leads matching criteria
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          style={{
            backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-dark)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
        >
          <PlusIcon size={16} color="#fff" strokeWidth={2.5} />
          <span>Add Inquiry</span>
        </button>
      </div>

      {/* Primary Type / Purpose Filter (Buy vs Rent) */}
      <div className="responsive-pills-scroll" style={{ alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Inquiry Type:
        </span>
        {[
          { id: 'All', label: 'All Inquiries', count: data.length, icon: ListIcon },
          { id: 'Buy', label: 'Buy / Purchase', count: buyCount, icon: HomeIcon },
          { id: 'Rent', label: 'Rent / Tenant', count: rentCount, icon: KeyIcon }
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setPurposeFilter(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: purposeFilter === tab.id ? '#0f172a' : '#f1f5f9',
                color: purposeFilter === tab.id ? '#fff' : '#475569',
                border: 'none'
              }}
            >
              <IconComp size={14} color={purposeFilter === tab.id ? '#fff' : '#64748b'} />
              <span>{tab.label}</span>
              <span style={{
                padding: '1px 6px',
                borderRadius: 10,
                fontSize: 11,
                backgroundColor: purposeFilter === tab.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                color: purposeFilter === tab.id ? '#fff' : '#64748b'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="responsive-pills-scroll">
            {['Active', 'All', 'New Inbound', 'Site Visit Scheduled'].map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                  backgroundColor: filter === f ? '#0f172a' : '#f1f5f9',
                  color: filter === f ? '#fff' : '#475569',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Channel:</span>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                backgroundColor: sourceFilter === 'All' ? '#fff' : '#eff6ff',
                color: sourceFilter === 'All' ? '#334155' : '#1d4ed8',
                fontSize: 12.5,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Inbound Sources</option>
              {leadSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ position: 'relative', minWidth: 200, flex: '1 1 auto', maxWidth: 280 }}>
          <SearchIcon size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input 
            type="text"
            placeholder="Search name, phone, source..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 34px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-only-table">
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div className="responsive-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 640 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Details</th>
              <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inbound Source</th>
              <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirement</th>
              <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget</th>
              <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <SearchIcon size={36} color="#cbd5e1" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>No inquiries found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or search query.</div>
                </td>
              </tr>
            ) : (
              filteredData.map((lead, i) => (
                <tr 
                  key={lead.id} 
                  onClick={() => handleOpenEdit(lead)}
                  style={{ cursor: 'pointer', borderBottom: i === filteredData.length - 1 ? 'none' : '1px solid var(--border)', transition: 'background-color 0.15s ease' }} 
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#475569' }}>
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{lead.name}</span>
                          {((lead as any).isSelfCreated || (lead.source || '').toLowerCase().includes('self-created') || (lead.source || '').toLowerCase().includes('public listing')) && (
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, backgroundColor: '#fdf4ff', color: '#a21caf', border: '1px solid #f0abfc', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <SparklesIcon size={10} color="#a21caf" />
                              <span>Self-Interest</span>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          {lead.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    {getSourceBadge(lead.source)}
                  </td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        backgroundColor: isLeadRent(lead) ? '#f3e8ff' : '#eff6ff',
                        color: isLeadRent(lead) ? '#7e22ce' : '#1d4ed8',
                        border: `1px solid ${isLeadRent(lead) ? '#d8b4fe' : '#bfdbfe'}`
                      }}>
                        {isLeadRent(lead) ? <KeyIcon size={11} color="currentColor" /> : <HomeIcon size={11} color="currentColor" />}
                        <span>{isLeadRent(lead) ? 'Rent' : 'Buy'}</span>
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        {Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : (lead.bhkNeeded || 'Any')}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {lead.city || 'Any Location'}
                    </div>
                    {(lead.vastuPreference && lead.vastuPreference !== 'Any' || lead.constructionStagePreference && lead.constructionStagePreference !== 'Any') && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {lead.vastuPreference && lead.vastuPreference !== 'Any' && (
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <CompassIcon size={10} color="currentColor" />
                            <span>{lead.vastuPreference}</span>
                          </span>
                        )}
                        {lead.constructionStagePreference && lead.constructionStagePreference !== 'Any' && (
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <BuildingIcon size={10} color="currentColor" />
                            <span>{lead.constructionStagePreference}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                      {lead.budgetMax ? `Up to ${formatINR(lead.budgetMax)}` : (lead.budget || 'Unspecified')}
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    {getStatusBadge(lead.status)}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(lead);
                        }}
                        title="Edit Inquiry"
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: 7,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      >
                        <EditIcon size={14} color="#1d4ed8" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingLead(lead);
                        }}
                        title="Delete Inquiry"
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: 7,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      >
                        <TrashIcon size={14} color="#dc2626" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const phone = lead.phone.replace(/\D/g, '');
                          window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91'+phone}`, '_blank');
                        }}
                        title="Chat on WhatsApp"
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                          borderRadius: 7,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#dcfce7'}
                      >
                        <WhatsAppIcon size={14} color="#166534" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${lead.phone}`;
                        }}
                        title="Call Client"
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                          borderRadius: 7,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      >
                        <PhoneIcon size={14} color="#475569" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card List View (Touch-First, Zero Horizontal Scroll) */}
      <div className="mobile-only-cards">
        {filteredData.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <SearchIcon size={32} color="#cbd5e1" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No inquiries found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or search query.</div>
          </div>
        ) : (
          filteredData.map(lead => (
            <div
              key={`m-${lead.id}`}
              onClick={() => handleOpenEdit(lead)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: '14px 16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                cursor: 'pointer'
              }}
            >
              {/* Card Header: Client Info + Fast Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#475569',
                    flexShrink: 0
                  }}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lead.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                      {lead.phone}
                    </div>
                  </div>
                </div>

                {/* 4 Icon Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(lead)}
                    title="Edit Inquiry"
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: 7,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <EditIcon size={14} color="#1d4ed8" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingLead(lead)}
                    title="Delete Inquiry"
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: 7,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrashIcon size={14} color="#dc2626" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const phone = lead.phone.replace(/\D/g, '');
                      window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91'+phone}`, '_blank');
                    }}
                    title="Chat on WhatsApp"
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: 7,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <WhatsAppIcon size={14} color="#166534" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = `tel:${lead.phone}`}
                    title="Call Client"
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: 7,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PhoneIcon size={14} color="#475569" />
                  </button>
                </div>
              </div>

              {/* Status & Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {getStatusBadge(lead.status)}
                {getSourceBadge(lead.source)}
                {((lead as any).isSelfCreated || (lead.source || '').toLowerCase().includes('self-created') || (lead.source || '').toLowerCase().includes('public listing')) && (
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, backgroundColor: '#fdf4ff', color: '#a21caf', border: '1px solid #f0abfc', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <SparklesIcon size={10} color="#a21caf" />
                    <span>Self-Interest</span>
                  </span>
                )}
              </div>

              {/* Requirement & Budget */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                fontSize: 12.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 10.5,
                    fontWeight: 700,
                    backgroundColor: isLeadRent(lead) ? '#f3e8ff' : '#eff6ff',
                    color: isLeadRent(lead) ? '#7e22ce' : '#1d4ed8'
                  }}>
                    {isLeadRent(lead) ? <KeyIcon size={10} color="currentColor" /> : <HomeIcon size={10} color="currentColor" />}
                    <span>{isLeadRent(lead) ? 'Rent' : 'Buy'}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : (lead.bhkNeeded || 'Any')}
                  </span>
                  <span style={{ color: '#64748b' }}>• {lead.city || 'Any Location'}</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {lead.budgetMax ? formatINR(lead.budgetMax) : (lead.budget || 'Unspecified')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

      {/* Delete Confirmation Modal */}
      {deletingLead && (
        <ConfirmModal
          isOpen={!!deletingLead}
          title="Delete Inquiry?"
          message={
            <div>
              Are you sure you want to delete the inquiry for <strong>{deletingLead.name}</strong>?
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#64748b' }}>
                This record and associated requirement details will be permanently removed.
              </div>
            </div>
          }
          confirmText="Yes, Delete Inquiry"
          cancelText="Cancel"
          danger
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingLead(null)}
        />
      )}

      {/* Global Action Feedback Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
