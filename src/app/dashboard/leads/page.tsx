'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { MultiPropertySelector } from '@/components/ui/MultiPropertySelector';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { getStatusColorStyle } from '@/lib/theme';
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
  BuildingIcon,
  FileTextIcon,
  ChevronDownIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon 
} from '@/components/icons/NavIcons';
import { ShareModal } from '@/components/ui/ShareModal';
import { isValid10DigitPhone, extract10DigitPhone } from '@/lib/phone-validation';
import { PhoneInput } from '@/components/ui/PhoneInput';

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
  notes?: string;
  createdAt?: string;
  inquiredProperty?: string;
  properties?: string[];
  requirement?: string;
}

const STATUS_BADGE_MAP: Record<string, { bg: string; color: string; dot: string }> = {
  'New Inbound': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
  'Contacted': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  'Qualified': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  'Site Visit Scheduled': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
  'Negotiation': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  'Won': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'Lost': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  'Dead': { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' }
};

function getStatusBadge(s: string) {
  const style = STATUS_BADGE_MAP[s] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: style.bg, padding: '4px 10px', borderRadius: 20 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot }} />
      <span style={{ color: style.color, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</span>
    </div>
  );
}

function getSourceBadge(src?: string) {
  const s = src || 'Direct Inbound';
  let bg = '#f1f5f9';
  let color = '#475569';
  let border = '#e2e8f0';
  let dot = '#94a3b8';

  const lower = s.toLowerCase();
  if (lower.includes('self-created') || lower.includes('public listing') || lower.includes('self-interest')) {
    bg = '#fdf4ff'; color = '#a21caf'; border = '#f0abfc'; dot = '#c026d3';
  } else if (lower.includes('whatsapp')) {
    bg = '#dcfce7'; color = '#15803d'; border = '#86efac'; dot = '#16a34a';
  } else if (lower.includes('website')) {
    bg = '#eff6ff'; color = '#1d4ed8'; border = '#bfdbfe'; dot = '#2563eb';
  } else if (lower.includes('99acres') || lower.includes('magicbricks') || lower.includes('housing')) {
    bg = '#fff7ed'; color = '#c2410c'; border = '#fed7aa'; dot = '#ea580c';
  } else if (lower.includes('referral') || lower.includes('word of mouth')) {
    bg = '#faf5ff'; color = '#7e22ce'; border = '#e9d5ff'; dot = '#9333ea';
  } else if (lower.includes('walk-in')) {
    bg = '#f0fdf4'; color = '#166534'; border = '#bbf7d0'; dot = '#16a34a';
  } else if (lower.includes('instagram') || lower.includes('social')) {
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
}

export default function LeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');
  const [clientsList, setClientsList] = useState<{name: string; phone?: string; email?: string; preferredLocation?: string; type?: string}[]>([]);
  const [propertiesList, setPropertiesList] = useState<{title: string; locality?: string; city?: string; bhk?: string; price?: number; purpose?: string}[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedLeadIds, setExpandedLeadIds] = useState<Record<string, boolean>>({});

  const toggleExpandLead = (leadId: string) => {
    setExpandedLeadIds(prev => ({
      ...prev,
      [leadId]: !prev[leadId]
    }));
  };

  const isLeadRent = useCallback((l: Lead) => {
    const p = ((l as any).leadPurpose || (l as any).purpose || (l as any).leadType || (l as any).dealType || '').toLowerCase();
    const req = ((l as any).requirement || '').toLowerCase();
    return p.includes('rent') || p.includes('tenant') || p.includes('lease') || req.includes('rent') || req.includes('lease');
  }, []);

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
  const [sortBy, setSortBy] = useState('newest');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [sharingLead, setSharingLead] = useState<Lead | null>(null);
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
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (sharingLead) setSharingLead(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, sharingLead]);

  // Form State - Nothing pre-selected by default
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    leadPurpose: '', propertyTypeNeeded: '',
    bhkNeeded: '', budgetMax: '', city: '',
    preferredLocalities: '', urgency: '', status: '',
    source: '',
    furnishingPreference: '',
    constructionStagePreference: '',
    vastuPreference: '',
    parkingPreference: '',
    inquiredProperty: '',
    properties: [] as string[],
    notes: ''
  });

  const loadData = () => {
    Promise.all([
      fetch('/api/leads').then(res => res.json()).catch(() => ({ leads: [] })),
      fetch('/api/clients').then(res => res.json()).catch(() => ({ clients: [] })),
      fetch('/api/properties').then(res => res.json()).catch(() => ({ properties: [] }))
    ]).then(([leadsJson, clientsJson, propsJson]) => {
      if (leadsJson.leads) setData(leadsJson.leads);
      const combined = [
        ...(clientsJson.clients || []),
        ...(leadsJson.leads || [])
      ];
      const unique = Array.from(new Map(combined.map(c => [c.name, c])).values());
      setClientsList(unique);
      if (propsJson.properties) setPropertiesList(propsJson.properties);
    }).finally(() => setLoading(false));
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setData(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });
      if (res.ok) {
        showToast('success', `Inquiry status updated to "${newStatus}".`, 'Status Updated');
      } else {
        showToast('error', 'Failed to update status on server.', 'Update Failed');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      showToast('error', 'Network error while updating inquiry status.', 'Network Error');
    }
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
      leadPurpose: '', propertyTypeNeeded: '',
      bhkNeeded: '', budgetMax: '', city: '',
      preferredLocalities: '', urgency: '', status: '',
      source: '',
      furnishingPreference: '',
      constructionStagePreference: '',
      vastuPreference: '',
      parkingPreference: '',
      inquiredProperty: '',
      properties: [],
      notes: ''
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
      parkingPreference: lead.parkingPreference || 'Any',
      inquiredProperty: (lead as any).inquiredProperty || '',
      properties: Array.isArray((lead as any).properties) && (lead as any).properties.length > 0
        ? (lead as any).properties
        : ((lead as any).inquiredProperty ? [(lead as any).inquiredProperty] : []),
      notes: lead.notes || ''
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
    if (!formData.name?.trim() || formData.name.trim().length < 2) {
      showToast('error', 'Please enter client / lead name (at least 2 characters).', 'Name Required');
      return;
    }
    if (!isValid10DigitPhone(formData.phone)) {
      showToast('error', 'Please enter a valid 10-digit mobile number.', 'Invalid Phone Number');
      return;
    }
    if (!formData.status?.trim()) {
      showToast('error', 'Please select an inquiry pipeline status.', 'Status Required');
      return;
    }
    setIsSubmitting(true);
    try {
      const primaryProperty = formData.properties[0] || formData.inquiredProperty || '';
      const payload = {
        ...(editingLead ? { id: editingLead.id } : {}),
        ...formData,
        inquiredProperty: primaryProperty,
        properties: formData.properties,
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
          parkingPreference: 'Any',
          inquiredProperty: '',
          properties: [],
          notes: ''
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

  const matchesLeadStatus = useCallback((l: Lead, targetStatus: string) => {
    if (targetStatus === 'All') return true;
    if (targetStatus === 'Active') return !['Won', 'Lost', 'Dead'].includes(l.status);
    return l.status === targetStatus;
  }, []);

  const matchesLeadPurpose = useCallback((l: Lead, targetPurpose: 'All' | 'Buy' | 'Rent') => {
    if (targetPurpose === 'All') return true;
    const isRent = isLeadRent(l);
    if (targetPurpose === 'Rent') return isRent;
    if (targetPurpose === 'Buy') return !isRent;
    return true;
  }, [isLeadRent]);

  const matchesLeadSource = useCallback((l: Lead, targetSource: string) => {
    if (targetSource === 'All') return true;
    return (l.source || 'Direct Inbound') === targetSource;
  }, []);

  // Faceted Purpose Counts (Context-aware based on current Status filter, Source filter, and Search)
  const purposeCounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    const dataForPurpose = data.filter(l => {
      if (!matchesLeadStatus(l, filter)) return false;
      if (!matchesLeadSource(l, sourceFilter)) return false;
      if (q && !(l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.city?.toLowerCase().includes(q) || (l.source && l.source.toLowerCase().includes(q)) || (l.notes && l.notes.toLowerCase().includes(q)))) return false;
      return true;
    });

    let buy = 0;
    let rent = 0;
    for (const l of dataForPurpose) {
      if (isLeadRent(l)) rent++;
      else buy++;
    }
    return { all: dataForPurpose.length, buy, rent };
  }, [data, filter, sourceFilter, search, matchesLeadStatus, matchesLeadSource, isLeadRent]);

  // Faceted Status Counts (Context-aware based on current Purpose filter, Source filter, and Search)
  const statusCounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    const dataForStatus = data.filter(l => {
      if (!matchesLeadPurpose(l, purposeFilter)) return false;
      if (!matchesLeadSource(l, sourceFilter)) return false;
      if (q && !(l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.city?.toLowerCase().includes(q) || (l.source && l.source.toLowerCase().includes(q)) || (l.notes && l.notes.toLowerCase().includes(q)))) return false;
      return true;
    });

    const counts: Record<string, number> = {
      all: dataForStatus.length,
      active: dataForStatus.filter(l => !['Won', 'Lost', 'Dead'].includes(l.status)).length
    };
    leadStatuses.forEach(st => {
      counts[st] = dataForStatus.filter(l => l.status === st).length;
    });
    return counts;
  }, [data, purposeFilter, sourceFilter, search, leadStatuses, matchesLeadPurpose, matchesLeadSource]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    const matches = data.filter(l => {
      if (!matchesLeadPurpose(l, purposeFilter)) return false;
      if (!matchesLeadStatus(l, filter)) return false;
      if (!matchesLeadSource(l, sourceFilter)) return false;
      if (q) {
        return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.city?.toLowerCase().includes(q) || (l.source && l.source.toLowerCase().includes(q)) || (l.notes && l.notes.toLowerCase().includes(q));
      }
      return true;
    });

    return [...matches].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      } else if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      } else if (sortBy === 'budget_desc') {
        return (Number(b.budgetMax) || 0) - (Number(a.budgetMax) || 0);
      } else if (sortBy === 'budget_asc') {
        return (Number(a.budgetMax) || 0) - (Number(b.budgetMax) || 0);
      } else {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [data, purposeFilter, filter, sourceFilter, search, isLeadRent, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, purposeFilter, sourceFilter, sortBy]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredData.length / pageSize)), [filteredData.length, pageSize]);
  const paginatedLeads = useMemo(() => filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredData, currentPage, pageSize]);

  const renderInquiryDetails = (lead: Lead) => {
    const isRent = isLeadRent(lead);
    const associatedProps = Array.from(new Set([
      ...(lead.properties || []),
      ...(lead.inquiredProperty ? [lead.inquiredProperty] : [])
    ]));

    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Header bar of expanded view */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: isRent ? '#f3e8ff' : '#eff6ff',
              color: isRent ? '#7e22ce' : '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13
            }}>
              {lead.name ? lead.name.charAt(0).toUpperCase() : 'I'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>{lead.name}</span>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>•</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Inquiry ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>{lead.id.substring(0, 16)}</span>
              </span>
              {lead.createdAt && (
                <>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>•</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Received: {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleOpenEdit(lead)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                backgroundColor: '#ffffff',
                color: 'var(--primary)',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <EditIcon size={13} color="currentColor" />
              <span>Edit Inquiry</span>
            </button>

            <button
              type="button"
              onClick={() => toggleExpandLead(lead.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                backgroundColor: '#e2e8f0',
                color: '#334155',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>Collapse</span>
              <ChevronDownIcon size={14} color="#334155" style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>

        {/* Body Grid of Expanded Details */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top Grid: Contact, Requirements & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            
            {/* Card 1: Contact Information */}
            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserIcon size={14} color="var(--primary)" />
                <span>Contact Details</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Phone Number</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>{lead.phone}</span>
                    <a 
                      href={`tel:${lead.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        color: 'var(--primary)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                    >
                      <PhoneIcon size={12} color="currentColor" />
                      <span>Call</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSharingLead(lead)}
                      title="Share with Client or Anyone"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        color: '#15803d',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dcfce7'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                    >
                      <WhatsAppIcon size={12} color="currentColor" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Email Address</div>
                  <div style={{ fontWeight: 600, color: lead.email ? '#0f172a' : '#94a3b8', marginTop: 2 }}>
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                        {lead.email}
                      </a>
                    ) : 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Property Requirements */}
            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BuildingIcon size={14} color="var(--primary)" />
                <span>Property Requirements</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Transaction Purpose</div>
                  <div style={{ fontWeight: 700, color: isRent ? '#7e22ce' : '#1d4ed8', marginTop: 2 }}>
                    {isRent ? 'Rent / Lease' : 'Outright Buy'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Property Type & BHK</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                    {lead.propertyTypeNeeded || 'Apartment'} • {Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : (lead.bhkNeeded || 'Any BHK')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Budget Range</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 2, fontSize: 14 }}>
                    {lead.budgetMax ? `Up to ${formatINR(lead.budgetMax)}` : (lead.budget || 'Flexible')}
                    {lead.budgetMin ? ` (Min: ${formatINR(lead.budgetMin)})` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Location & Urgency */}
            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPinIcon size={14} color="var(--primary)" />
                <span>Location & Timeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>City & Preferred Localities</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                    {lead.city || 'Any City'}
                    {lead.preferredLocalities ? ` • ${lead.preferredLocalities}` : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Move-in Timeline / Urgency</div>
                  <div style={{ fontWeight: 600, color: '#334155', marginTop: 2 }}>
                    {lead.urgency || 'Normal Timeline'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Next Follow-Up Date</div>
                  <div style={{ fontWeight: 600, color: lead.nextFollowUp ? '#d97706' : '#94a3b8', marginTop: 2 }}>
                    {lead.nextFollowUp || 'No follow-up scheduled'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Specific Preferences Badges */}
          <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CompassIcon size={14} color="var(--primary)" />
              <span>Client Specifications & Criteria</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12.5 }}>
              <div style={{ padding: '4px 10px', backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Furnishing: </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{lead.furnishingPreference || 'Any'}</span>
              </div>
              <div style={{ padding: '4px 10px', backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Construction Stage: </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{lead.constructionStagePreference || 'Any'}</span>
              </div>
              <div style={{ padding: '4px 10px', backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Vastu Direction: </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{lead.vastuPreference || 'Any'}</span>
              </div>
              <div style={{ padding: '4px 10px', backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Car Parking: </span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{lead.parkingPreference || 'Any'}</span>
              </div>
              {lead.requirement && (
                <div style={{ padding: '4px 10px', backgroundColor: '#ffffff', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%' }}>
                  <span style={{ color: '#64748b' }}>Original Notes / Remarks: </span>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{lead.requirement}</span>
                </div>
              )}
            </div>
          </div>

          {/* Associated Shortlisted Properties */}
          {associatedProps.length > 0 && (
            <div style={{ padding: '12px 14px', backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HomeIcon size={14} color="#1d4ed8" />
                <span>Shortlisted / Inquired Properties ({associatedProps.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {associatedProps.map((propId: string) => {
                  const propObj = propertiesList.find(p => (p as any).id === propId || p.title === propId);
                  return (
                    <span key={propId} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, backgroundColor: '#ffffff', color: '#1e3a8a', border: '1px solid #93c5fd', fontWeight: 600 }}>
                      {propObj ? `${propObj.title}${propObj.locality ? ` • ${propObj.locality}` : ''}` : propId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Private Broker Notes Section */}
          <div style={{ padding: '14px 16px', backgroundColor: '#fefce8', borderRadius: 8, border: '1px solid #fef08a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileTextIcon size={14} color="#a16207" />
                <span>Private Broker Notes & Remarks</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEdit(lead)}
                style={{ fontSize: 11.5, color: '#854d0e', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                {lead.notes ? 'Edit Notes' : '+ Add Notes'}
              </button>
            </div>
            <div style={{ fontSize: 13, color: '#713f12', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {lead.notes || <span style={{ fontStyle: 'italic', color: '#a16207' }}>No private notes recorded for this inquiry yet. Click &apos;+ Add Notes&apos; to record negotiation details, client preferences, or loan remarks.</span>}
            </div>
          </div>

        </div>
      </div>
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
                    <option value="">Select Inquiry Status</option>
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
                    <option value="">Select Priority / Urgency</option>
                    <option value="Immediate (Hot Buyer)">Immediate (Hot Buyer - Ready Now)</option>
                    <option value="Within 15 Days">High Urgency (Within 15 Days)</option>
                    <option value="Within 1 Month">Moderate (Within 1 Month)</option>
                    <option value="1-3 Months">Standard (1-3 Months)</option>
                    <option value="Exploring / Low">Low / Long-term Exploring</option>
                  </select>
                </div>
              </div>

              {/* Client Selection (Searchable with Phone display or manual enter) */}
              <div>
                <SearchableCombobox
                  label="Select Registered Client (Optional)"
                  value={formData.name}
                  placeholder="Search existing clients by name or phone..."
                  searchPlaceholder="Type client name or phone (e.g. 98200...)"
                  options={clientsList.map(c => ({
                    value: c.name,
                    label: c.name,
                    sublabel: c.phone || 'No Phone',
                    badge: (c as any).type || (c as any).status || 'Client'
                  }))}
                  onChange={(val, opt) => {
                    if (!val) {
                      setFormData(prev => ({ ...prev, name: '', phone: '', email: '' }));
                      return;
                    }
                    const matched = clientsList.find(c => c.name === val);
                    const phoneVal = (matched && matched.phone) || (opt?.sublabel && opt.sublabel !== 'No Phone' ? opt.sublabel : formData.phone);
                    setFormData(prev => ({
                      ...prev,
                      name: val,
                      phone: phoneVal,
                      email: (matched && matched.email) || prev.email,
                      city: (matched as any)?.city || (matched as any)?.preferredLocation || prev.city
                    }));
                  }}
                  onAddNew={() => {}}
                  addNewLabel="+ New Client"
                />
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Select an existing contact to auto-fill details or type new client information below.
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Phone (10 Digits) *</label>
                  <PhoneInput
                    required
                    value={formData.phone}
                    onChange={(full) => setFormData({ ...formData, phone: full })}
                    placeholder="98200 45678"
                  />
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
                    <option value="">Select Inbound Source</option>
                    {leadSources.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />

              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>Requirements</h3>

              {/* Property Inquired About (MultiPropertySelector) */}
              <div>
                <MultiPropertySelector
                  label="Inquired / Shortlisted Properties (Optional)"
                  required={false}
                  itemPrefix="Property"
                  itemBadgeLabel="Properties Inquired"
                  addFirstLabel="Select Inquired Property"
                  addMoreLabel="+ Add Another Inquired Property"
                  selectActionLabel="+ Select"
                  availableProperties={propertiesList.map(p => ({
                    title: p.title,
                    locality: p.locality,
                    bhk: p.bhk,
                    price: p.price,
                    purpose: p.purpose
                  }))}
                  selectedProperties={formData.properties}
                  onChange={(newProps) => {
                    const firstProp = newProps[0] || '';
                    const matched = propertiesList.find(p => p.title === firstProp);
                    if (matched) {
                      const isRent = ((matched as any).purpose === 'For Rent' || (matched as any).listingType === 'For Rent') || matched.title.toLowerCase().includes('rent');
                      setFormData(prev => ({
                        ...prev,
                        properties: newProps,
                        inquiredProperty: firstProp,
                        leadPurpose: isRent ? 'Rent' : 'Buy',
                        bhkNeeded: matched.bhk || prev.bhkNeeded,
                        preferredLocalities: matched.locality || prev.preferredLocalities,
                        city: matched.city || prev.city,
                        budgetMax: matched.price ? matched.price.toString() : prev.budgetMax
                      }));
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        properties: newProps,
                        inquiredProperty: firstProp 
                      }));
                    }
                  }}
                  onAddNewProperty={() => {
                    window.location.href = '/dashboard/properties?new=true';
                  }}
                />
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Purpose</label>
                  <select value={formData.leadPurpose} onChange={e => setFormData({...formData, leadPurpose: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    <option value="">Select Purpose</option>
                    {['Buy', 'Rent'].map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Property Type</label>
                  <select value={formData.propertyTypeNeeded} onChange={e => setFormData({...formData, propertyTypeNeeded: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    <option value="">Select Property Type</option>
                    {propertyTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>BHK Needed</label>
                  <select value={formData.bhkNeeded} onChange={e => setFormData({...formData, bhkNeeded: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
                    <option value="">Select BHK</option>
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
                      <option value="">Select Furnishing</option>
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
                      <option value="">Select Construction Stage</option>
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
                      <option value="">Select Vastu Facing</option>
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
                      <option value="">Select Parking</option>
                      {['Any', ...parkingOptions].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Internal Notes & Follow-up Remarks */}
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="lead-notes-input" style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <FileTextIcon size={16} color="var(--primary)" />
                    <span>Broker Notes & Remarks</span>
                    <InfoTooltip text="Private broker notes regarding client preferences, negotiation points, loan pre-approval status, or specific conversation remarks. Only visible to your team." />
                  </label>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                    {formData.notes ? `${formData.notes.length}/1000` : 'Optional • Private'}
                  </span>
                </div>
                <textarea
                  id="lead-notes-input"
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Client needs loan pre-approval assistance from HDFC. Prefers higher floors with morning sunlight. Ready for token cheque if seller agrees to 5% negotiation..."
                  maxLength={1000}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    color: '#0f172a',
                    backgroundColor: '#fff',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    lineHeight: 1.5,
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
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
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{data.length} total inquiries</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredData.length} shown</span>
            {(purposeFilter !== 'All' || filter !== 'All' || sourceFilter !== 'All' || search) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--primary-text, var(--primary, #059669))', backgroundColor: 'var(--primary-light, #ecfdf5)', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>
                  Filtered: {[
                    purposeFilter !== 'All' ? (purposeFilter === 'Buy' ? 'Buy / Sale' : 'Rent / Tenant') : null,
                    filter !== 'All' ? filter : null,
                    sourceFilter !== 'All' ? sourceFilter : null,
                    search ? `"${search}"` : null
                  ].filter(Boolean).join(' + ')}
                </span>
                <button
                  type="button"
                  onClick={() => { setPurposeFilter('All'); setFilter('All'); setSourceFilter('All'); setSearch(''); }}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Clear filters
                </button>
              </span>
            )}
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

      {/* Unified Compact Filter Bar Card */}
      <div className="unified-filter-card">
        {/* Row 1: Segmented Type Switch + Search + Channel + Sort */}
        <div className="unified-filter-row-top">
          <FilterTabs
            variant="segmented"
            size="sm"
            tabs={[
              { id: 'All', label: 'All Inquiries', count: purposeCounts.all, icon: <ListIcon size={13} /> },
              { id: 'Buy', label: 'Buy / Sale', count: purposeCounts.buy, icon: <HomeIcon size={13} /> },
              { id: 'Rent', label: 'Rent / Tenant', count: purposeCounts.rent, icon: <KeyIcon size={13} /> }
            ]}
            activeTab={purposeFilter}
            onChange={(tabId) => setPurposeFilter(tabId as any)}
          />

          <div className="unified-filter-controls">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search name, phone, notes..."
              maxWidth={220}
            />

            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="unified-filter-select"
              style={{
                backgroundColor: sourceFilter === 'All' ? '#ffffff' : '#eff6ff',
                color: sourceFilter === 'All' ? '#334155' : '#1d4ed8'
              }}
            >
              <option value="All">All Sources</option>
              {leadSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="unified-filter-select"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
              <option value="budget_desc">Budget: High → Low</option>
              <option value="budget_asc">Budget: Low → High</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status Filter Pills in a Compact Horizontal Strip */}
        <div className="unified-filter-row-bottom">
          <FilterTabs
            label="Status:"
            size="sm"
            useStatusColors={true}
            tabs={[
              { id: 'All', label: 'All', count: statusCounts.all },
              { id: 'Active', label: 'Active Pipeline', count: statusCounts.active },
              ...leadStatuses.map(s => ({
                id: s,
                label: s,
                count: statusCounts[s] ?? 0
              }))
            ]}
            activeTab={filter}
            onChange={(tabId) => setFilter(tabId)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-only-table">
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div className="responsive-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 880 }}>
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
              paginatedLeads.map((lead, i) => (
                <React.Fragment key={lead.id}>
                  <tr 
                    onClick={() => handleOpenEdit(lead)}
                    style={{ 
                      cursor: 'pointer', 
                      borderBottom: expandedLeadIds[lead.id] ? 'none' : (i === paginatedLeads.length - 1 ? 'none' : '1px solid var(--border)'), 
                      backgroundColor: expandedLeadIds[lead.id] ? '#f8fafc' : 'transparent',
                      transition: 'background-color 0.15s ease' 
                    }} 
                    onMouseEnter={e => {
                      if (!expandedLeadIds[lead.id]) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }} 
                    onMouseLeave={e => {
                      if (!expandedLeadIds[lead.id]) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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

                  {/* Requirement Column - Clean one-line format per Item 2 */}
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#090d16', whiteSpace: 'nowrap' }}>
                      {(() => {
                        const purpose = isLeadRent(lead) ? 'Rent' : 'Buy';
                        const bhk = Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : (lead.bhkNeeded || '');
                        const loc = lead.city || (lead as any).locality || '';
                        return `${purpose} ${bhk} ${loc}`.replace(/\s+/g, ' ').trim() || 'Buy 3 BHK';
                      })()}
                    </div>
                  </td>

                  {/* Budget Column - Strictly one line per Item 4 */}
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                      {lead.budgetMax ? `Up to ${formatINR(lead.budgetMax)}` : (lead.budget ? (lead.budget.toLowerCase().startsWith('up to') ? lead.budget : `Up to ${lead.budget}`) : 'Up to ₹9.5 Cr')}
                    </div>
                  </td>

                  {/* Status Column - Unique dynamic status background & text per Item 5 */}
                  <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                    {(() => {
                      const sc = getStatusColorStyle(lead.status);
                      return (
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '5px 12px',
                            borderRadius: 20,
                            border: `1px solid ${sc.border}`,
                            backgroundColor: sc.bg,
                            color: sc.text,
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {leadStatuses.map(st => (
                            <option key={st} value={st} style={{ backgroundColor: '#ffffff', color: '#090d16' }}>{st}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {/* Collapsible Dropdown Details Toggle */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandLead(lead.id);
                        }}
                        title={expandedLeadIds[lead.id] ? "Collapse Details" : "View All Inquiry Details"}
                        aria-expanded={!!expandedLeadIds[lead.id]}
                        style={{
                          width: 32,
                          height: 32,
                          padding: 0,
                          backgroundColor: expandedLeadIds[lead.id] ? 'var(--primary)' : '#eff6ff',
                          color: expandedLeadIds[lead.id] ? '#ffffff' : 'var(--primary)',
                          border: `1px solid ${expandedLeadIds[lead.id] ? 'var(--primary)' : '#bfdbfe'}`,
                          borderRadius: 7,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          if (!expandedLeadIds[lead.id]) e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseLeave={e => {
                          if (!expandedLeadIds[lead.id]) e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        <ChevronDownIcon 
                          size={15} 
                          color={expandedLeadIds[lead.id] ? '#ffffff' : 'var(--primary)'}
                          style={{
                            transform: expandedLeadIds[lead.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      </button>

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
                          setSharingLead(lead);
                        }}
                        title="Share / WhatsApp with Client or Anyone"
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

                {/* Collapsible Inquiry Details View */}
                {expandedLeadIds[lead.id] && (
                  <tr 
                    style={{ 
                      backgroundColor: '#f8fafc',
                      borderBottom: i === paginatedLeads.length - 1 ? 'none' : '1px solid var(--border)'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <td colSpan={6} style={{ padding: '0 20px 20px 20px' }}>
                      {renderInquiryDetails(lead)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
          paginatedLeads.map(lead => (
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
              {/* Card Header: Client Info & Budget */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light, #d1fae5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--primary-text, #065f46)',
                    flexShrink: 0
                  }}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lead.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 1, fontWeight: 500 }}>
                      {lead.phone}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: 'var(--primary, #059669)',
                    backgroundColor: '#ecfdf5',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid #a7f3d0'
                  }}>
                    {lead.budgetMax ? formatINR(lead.budgetMax) : (lead.budget || 'Budget TBA')}
                  </span>
                </div>
              </div>

              {/* Status & Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#334155',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {leadStatuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
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

              {/* Private Notes in Mobile Card */}
              {lead.notes && (
                <div 
                  title={`Internal Note: ${lead.notes}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    padding: '8px 10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    fontSize: 11.5,
                    color: '#475569',
                    lineHeight: 1.4
                  }}
                >
                  <FileTextIcon size={13} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-word'
                  }}>
                    {lead.notes}
                  </span>
                </div>
              )}

              {/* Mobile Quick Action Buttons Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }} onClick={e => e.stopPropagation()}>
                {/* 1-Tap Call */}
                <button
                  type="button"
                  onClick={() => window.location.href = `tel:${lead.phone}`}
                  title="Call Client"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 8,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <PhoneIcon size={14} color="#1d4ed8" />
                  <span>Call</span>
                </button>

                {/* 1-Tap WhatsApp / Share */}
                <button
                  type="button"
                  onClick={() => setSharingLead(lead)}
                  title="Share / WhatsApp with Client or Anyone"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 8,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <WhatsAppIcon size={14} color="#15803d" />
                  <span>WhatsApp</span>
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(lead)}
                  title="Edit Inquiry"
                  style={{
                    width: 34,
                    height: 34,
                    padding: 0,
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <EditIcon size={14} color="#334155" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeletingLead(lead)}
                  title="Delete Inquiry"
                  style={{
                    width: 34,
                    height: 34,
                    padding: 0,
                    borderRadius: 8,
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <TrashIcon size={14} color="#dc2626" />
                </button>

                {/* Toggle Details Expand */}
                <button
                  type="button"
                  onClick={() => toggleExpandLead(lead.id)}
                  title={expandedLeadIds[lead.id] ? "Collapse Details" : "View All Details"}
                  style={{
                    width: 34,
                    height: 34,
                    padding: 0,
                    borderRadius: 8,
                    backgroundColor: expandedLeadIds[lead.id] ? 'var(--primary)' : '#f1f5f9',
                    color: expandedLeadIds[lead.id] ? '#ffffff' : '#475569',
                    border: `1px solid ${expandedLeadIds[lead.id] ? 'var(--primary)' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ChevronDownIcon
                    size={15}
                    color={expandedLeadIds[lead.id] ? '#ffffff' : '#475569'}
                    style={{
                      transform: expandedLeadIds[lead.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </button>
              </div>

              {/* Collapsible Full Details (Mobile View) */}
              {expandedLeadIds[lead.id] && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }} onClick={e => e.stopPropagation()}>
                  {renderInquiryDetails(lead)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="inquiries"
          style={{ marginTop: 20 }}
        />
      )}
    </div>

      {/* Universal Share Modal */}
      {sharingLead && (() => {
        const l = sharingLead;
        const defaultMsg = `Hi ${l.name},\n\nGreetings from AgentLadders! Thank you for connecting with us regarding your property requirement${l.preferredLocalities ? ` in ${l.preferredLocalities}` : ''}${l.bhkNeeded ? ` (${Array.isArray(l.bhkNeeded) ? l.bhkNeeded.join(', ') : l.bhkNeeded})` : ''}.\n\nI have curated a handpicked portfolio of matching verified properties for you. Please let me know when we can arrange a brief discussion or showing tour!`;

        return (
          <ShareModal
            isOpen={!!sharingLead}
            onClose={() => setSharingLead(null)}
            shareItem={{
              id: l.id,
              type: 'lead',
              title: `Client Inquiry • ${l.name}`,
              subtitle: `${(l as any).type || l.propertyTypeNeeded || 'Inquiry'} • ${l.phone || 'No Phone'} • Status: ${l.status}`,
              description: l.notes || l.requirement || undefined,
              badge: l.status,
              link: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/leads` : '',
              recipientName: l.name,
              recipientPhone: l.phone,
              recipientEmail: l.email,
              defaultMessage: defaultMsg
            }}
          />
        );
      })()}

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
