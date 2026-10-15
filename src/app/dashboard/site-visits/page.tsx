'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { DEFAULT_SITE_VISIT_STATUSES } from '@/lib/formatters';
import { getStatusColorStyle } from '@/lib/theme';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { MultiPropertySelector } from '@/components/ui/MultiPropertySelector';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  CalendarIcon, 
  EditIcon, 
  TrashIcon, 
  WhatsAppIcon, 
  PhoneIcon, 
  SearchIcon, 
  PlusIcon, 
  KeyIcon, 
  HomeIcon, 
  UserIcon, 
  FileTextIcon, 
  ListIcon,
  FlameIcon,
  SparklesIcon
} from '@/components/icons/NavIcons';
import { ShareModal } from '@/components/ui/ShareModal';
import { isValid10DigitPhone, extract10DigitPhone } from '@/lib/phone-validation';

interface SiteVisit {
  id: string;
  property: string;
  properties?: string[];
  propertyId?: string;
  client: string;
  clientPhone?: string;
  date: string;
  timeSlot?: string;
  status: string;
  priority?: string;
  urgency?: string;
  source?: string;
  notes?: string;
  accompaniedBy?: string;
  purpose?: 'Buy' | 'Rent';
  visitType?: string;
}

export default function SiteVisitsPage() {
  const [data, setData] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Upcoming');
  const [statusFilter, setStatusFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);
  const [sharingVisit, setSharingVisit] = useState<SiteVisit | null>(null);
  const [deletingVisit, setDeletingVisit] = useState<SiteVisit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  const [clientsList, setClientsList] = useState<{name: string; phone?: string}[]>([]);
  const [propertiesList, setPropertiesList] = useState<{title: string; purpose?: string; listingType?: string; locality?: string; bhk?: string; price?: number}[]>([]);
  const [siteVisitStatuses, setSiteVisitStatuses] = useState<string[]>(DEFAULT_SITE_VISIT_STATUSES);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const [formData, setFormData] = useState({ 
    client: '', 
    clientPhone: '', 
    property: '', 
    properties: [] as string[], 
    date: '', 
    timeSlot: '', 
    purpose: '' as 'Buy' | 'Rent' | '', 
    notes: '', 
    status: '', 
    priority: '' 
  });

  const getVisitPurpose = (visit: SiteVisit): 'Buy' | 'Rent' => {
    if (visit.purpose === 'Rent' || (visit as any).visitType === 'Rent') return 'Rent';
    if (visit.purpose === 'Buy' || (visit as any).visitType === 'Buy') return 'Buy';
    // Resolve from matching property in propertiesList
    const matched = propertiesList.find(p => p.title?.trim().toLowerCase() === visit.property?.trim().toLowerCase());
    if (matched && ((matched as any).purpose === 'For Rent' || (matched as any).listingType === 'For Rent')) return 'Rent';
    const lowerProp = (visit.property || '').toLowerCase();
    const lowerNotes = (visit.notes || '').toLowerCase();
    if (lowerProp.includes('rent') || lowerProp.includes('lease') || lowerNotes.includes('rent') || lowerNotes.includes('lease') || lowerNotes.includes('tenant')) {
      return 'Rent';
    }
    return 'Buy';
  };

  const openWa = (phone?: string, text?: string) => {
    if (!phone) return;
    const clean = phone.replace(/\D/g, '');
    const num = clean.startsWith('91') ? clean : `91${clean}`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text || '')}`;
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (sharingVisit) setSharingVisit(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, sharingVisit]);

  useEffect(() => {
    // Check localStorage agency configs for instant sync
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('agentladders_agency_configs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.siteVisitStatuses) && parsed.siteVisitStatuses.length > 0) {
            setSiteVisitStatuses(parsed.siteVisitStatuses);
          }
        }
      } catch {}
    }

    setLoading(true);
    Promise.all([
      fetch('/api/site-visits').then(res => res.json()).catch(() => ({ siteVisits: [] })),
      fetch('/api/leads').then(res => res.json()).catch(() => ({ leads: [] })),
      fetch('/api/clients').then(res => res.json()).catch(() => ({ clients: [] })),
      fetch('/api/properties').then(res => res.json()).catch(() => ({ properties: [] })),
      fetch('/api/settings').then(res => res.json()).catch(() => ({}))
    ]).then(([svJson, leadsJson, clientsJson, propsJson, settingsJson]) => {
      if (svJson.siteVisits) setData(svJson.siteVisits);
      const combinedClients = [
        ...(leadsJson.leads || []),
        ...(clientsJson?.clients || [])
      ];
      const uniqueClients = Array.from(new Map(combinedClients.map(c => [c.name, c])).values());
      setClientsList(uniqueClients);
      if (propsJson.properties) setPropertiesList(propsJson.properties);
      if (settingsJson?.agency?.siteVisitStatuses && Array.isArray(settingsJson.agency.siteVisitStatuses) && settingsJson.agency.siteVisitStatuses.length > 0) {
        setSiteVisitStatuses(settingsJson.agency.siteVisitStatuses);
      }
    }).finally(() => setLoading(false));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agentladders_agency_configs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.siteVisitStatuses) && parsed.siteVisitStatuses.length > 0) {
            setSiteVisitStatuses(parsed.siteVisitStatuses);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const matchesVisitPurpose = useCallback((v: SiteVisit, targetPurpose: 'All' | 'Buy' | 'Rent') => {
    if (targetPurpose === 'All') return true;
    return getVisitPurpose(v) === targetPurpose;
  }, [getVisitPurpose]);

  const matchesVisitSchedule = useCallback((v: SiteVisit, targetSchedule: string, todayDate: string) => {
    if (targetSchedule === 'All Dates' || targetSchedule === 'All') return true;
    if (targetSchedule === 'Upcoming') return v.date >= todayDate && v.status !== 'Cancelled';
    if (targetSchedule === 'Past') return v.date < todayDate;
    if (targetSchedule === 'Cancelled') return v.status === 'Cancelled';
    return true;
  }, []);

  const matchesVisitStatus = useCallback((v: SiteVisit, targetStatus: string) => {
    if (targetStatus === 'All') return true;
    return v.status === targetStatus;
  }, []);

  const matchesVisitSearch = useCallback((v: SiteVisit, q: string) => {
    if (!q) return true;
    return (
      v.client?.toLowerCase().includes(q) ||
      v.clientPhone?.toLowerCase().includes(q) ||
      v.property?.toLowerCase().includes(q) ||
      (Array.isArray(v.properties) && v.properties.some(p => p.toLowerCase().includes(q))) ||
      v.notes?.toLowerCase().includes(q)
    );
  }, []);

  // Faceted Purpose Counts (Context-aware based on current Schedule, Status, and Search)
  const purposeCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const dataForPurpose = data.filter(v => {
      if (!matchesVisitSchedule(v, filter, today)) return false;
      if (!matchesVisitStatus(v, statusFilter)) return false;
      if (!matchesVisitSearch(v, q)) return false;
      return true;
    });

    let buy = 0;
    let rent = 0;
    for (const v of dataForPurpose) {
      if (getVisitPurpose(v) === 'Rent') rent++;
      else buy++;
    }
    return { all: dataForPurpose.length, buy, rent };
  }, [data, filter, statusFilter, searchQuery, today, matchesVisitSchedule, matchesVisitStatus, matchesVisitSearch, getVisitPurpose]);

  // Faceted Schedule Counts (Context-aware based on current Purpose, Status, and Search)
  const scheduleCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const dataForSchedule = data.filter(v => {
      if (!matchesVisitPurpose(v, purposeFilter)) return false;
      if (!matchesVisitStatus(v, statusFilter)) return false;
      if (!matchesVisitSearch(v, q)) return false;
      return true;
    });

    return {
      all: dataForSchedule.length,
      upcoming: dataForSchedule.filter(v => v.date >= today && v.status !== 'Cancelled').length,
      past: dataForSchedule.filter(v => v.date < today).length,
      cancelled: dataForSchedule.filter(v => v.status === 'Cancelled').length
    };
  }, [data, purposeFilter, statusFilter, searchQuery, today, matchesVisitPurpose, matchesVisitStatus, matchesVisitSearch]);

  // Faceted Status Counts (Context-aware based on current Purpose, Schedule, and Search)
  const statusCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const dataForStatus = data.filter(v => {
      if (!matchesVisitPurpose(v, purposeFilter)) return false;
      if (!matchesVisitSchedule(v, filter, today)) return false;
      if (!matchesVisitSearch(v, q)) return false;
      return true;
    });

    const counts: Record<string, number> = {
      all: dataForStatus.length
    };
    siteVisitStatuses.forEach(s => {
      counts[s] = dataForStatus.filter(v => v.status === s).length;
    });
    return counts;
  }, [data, purposeFilter, filter, searchQuery, today, siteVisitStatuses, matchesVisitPurpose, matchesVisitSchedule, matchesVisitSearch]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter(v => {
      if (!matchesVisitPurpose(v, purposeFilter)) return false;
      if (!matchesVisitSchedule(v, filter, today)) return false;
      if (!matchesVisitStatus(v, statusFilter)) return false;
      if (!matchesVisitSearch(v, q)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.timeSlot || '').localeCompare(a.timeSlot || '');
      } else if (sortBy === 'client_asc') {
        return (a.client || '').localeCompare(b.client || '');
      } else if (sortBy === 'client_desc') {
        return (b.client || '').localeCompare(a.client || '');
      } else if (sortBy === 'priority_desc') {
        const pOrder: Record<string, number> = { 'High Priority': 3, 'Medium Priority': 2, 'Standard': 1, 'Low Priority': 0 };
        const pa = pOrder[a.priority || ''] ?? 1;
        const pb = pOrder[b.priority || ''] ?? 1;
        if (pa !== pb) return pb - pa;
        return a.date.localeCompare(b.date);
      } else if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      // Default: date_asc
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.timeSlot || '').localeCompare(b.timeSlot || '');
    });
  }, [data, purposeFilter, filter, statusFilter, searchQuery, today, matchesVisitPurpose, matchesVisitSchedule, matchesVisitStatus, matchesVisitSearch, sortBy]);

  const getStatusBadge = (s: string) => {
    const sc = getStatusColorStyle(s);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: sc.bg, border: `1px solid ${sc.border}`, padding: '3px 10px', borderRadius: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: sc.dot }} />
        <span style={{ color: sc.text, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</span>
      </div>
    );
  };

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNum, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNum: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let j = 1; j <= remaining; j++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
      days.push({ dayNum: j, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [calendarDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  };

  const handleStatusChange = async (visitId: string, newStatus: string) => {
    setData(prev => prev.map(v => v.id === visitId ? { ...v, status: newStatus } : v));
    try {
      const res = await fetch('/api/site-visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitId, status: newStatus })
      });
      if (res.ok) {
        showToast('success', `Visit status updated to "${newStatus}".`, 'Status Updated');
      } else {
        showToast('error', 'Failed to update visit status on server.', 'Update Failed');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      showToast('error', 'Network error while updating visit status.', 'Error');
    }
  };

  // Group by date
  const groupedData: Record<string, SiteVisit[]> = {};
  filteredData.forEach(v => {
    if (!groupedData[v.date]) groupedData[v.date] = [];
    groupedData[v.date].push(v);
  });

  const nextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToToday = () => {
    setCalendarDate(new Date());
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Syncing calendar...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleOpenAdd = (defaultDate?: string) => {
    setEditingVisit(null);
    setFormData({ 
      client: '', 
      clientPhone: '', 
      property: '', 
      properties: [], 
      date: defaultDate || today, 
      timeSlot: '', 
      purpose: '' as any, 
      notes: '', 
      status: '', 
      priority: '' 
    });
    setShowModal(true);
  };

  const handleOpenEdit = (visit: SiteVisit) => {
    setEditingVisit(visit);
    const initialProps = Array.isArray(visit.properties) && visit.properties.length > 0
      ? visit.properties
      : (visit.property ? [visit.property] : []);

    setFormData({
      client: visit.client || '',
      clientPhone: visit.clientPhone || '',
      property: visit.property || (initialProps[0] || ''),
      properties: initialProps,
      date: visit.date || '',
      timeSlot: visit.timeSlot || '',
      purpose: getVisitPurpose(visit),
      status: visit.status || '',
      priority: visit.priority || (visit as any).urgency || '',
      notes: visit.notes || ''
    });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVisit) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/site-visits?id=${encodeURIComponent(deletingVisit.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(prev => prev.filter(v => v.id !== deletingVisit.id));
        if (editingVisit?.id === deletingVisit.id) {
          setShowModal(false);
          setEditingVisit(null);
        }
        showToast('success', `Site visit for "${deletingVisit.property}" deleted successfully.`, 'Visit Deleted');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error || 'Failed to delete site visit.', 'Delete Failed');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Network error while attempting to delete site visit.', 'Network Error');
    } finally {
      setIsDeleting(false);
      setDeletingVisit(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client.trim()) {
      showToast('error', 'Please select or enter client name.', 'Client Required');
      return;
    }
    if (formData.properties.length === 0 && !formData.property) {
      showToast('error', 'Please select at least one property to visit.', 'Property Required');
      return;
    }
    if (!formData.status) {
      showToast('error', 'Please select a visit status.', 'Status Required');
      return;
    }
    if (formData.clientPhone?.trim() && !isValid10DigitPhone(formData.clientPhone)) {
      showToast('error', 'Please enter a valid 10-digit mobile number for the client.', 'Invalid Phone Number');
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryProperty = formData.properties.length > 0 ? formData.properties[0] : (formData.property || 'Property Showing');
      const finalProperties = formData.properties.length > 0 ? formData.properties : [primaryProperty];

      const payload = {
        ...(editingVisit ? { id: editingVisit.id } : {}),
        ...formData,
        purpose: formData.purpose || 'Buy',
        property: primaryProperty,
        properties: finalProperties
      };

      const method = editingVisit ? 'PUT' : 'POST';
      const res = await fetch('/api/site-visits', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const created = json.visit || json;
        setData(prev => [created, ...prev.filter(v => v.id !== created.id)]);
        setShowModal(false);
        setEditingVisit(null);
        setFormData({ 
          client: '', 
          clientPhone: '', 
          property: '', 
          properties: [], 
          date: '', 
          timeSlot: '', 
          purpose: '' as any, 
          notes: '', 
          status: '', 
          priority: '' 
        });
        showToast('success', editingVisit ? `Site visit updated for "${formData.client}"!` : `Site visit booked for "${formData.client}"!`, editingVisit ? 'Visit Updated' : 'Visit Booked');
        fetch('/api/site-visits').then(r => r.json()).then(j => { if (j.siteVisits) setData(j.siteVisits); });
      } else {
        showToast('error', json.error || 'Failed to save site visit. Please verify required fields.', 'Save Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error occurred while saving site visit.', 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };
              
  return (
    <>
      {/* Slide-over Modal for Booking / Editing Visit */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="responsive-drawer animate-enter" style={{ backgroundColor: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingVisit ? 'Edit Site Visit' : 'Book Site Visit'} <InfoTooltip text="Schedule and track client property showings." />
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Primary Status & Priority / Urgency (Top 2 Fields) */}
              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Visit Status *
                    <InfoTooltip text="Current scheduling status: Scheduled, Confirmed, Completed, Rescheduled, or Cancelled." />
                  </label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                  >
                    <option value="">Select Visit Status...</option>
                    {siteVisitStatuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Visit Priority / Urgency *
                    <InfoTooltip text="Priority level of this tour based on buyer readiness, property exclusivity, and deal velocity." />
                  </label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                  >
                    <option value="">Select Priority / Urgency...</option>
                    <option value="High Priority">High Priority (Decision Maker / Ready to Close)</option>
                    <option value="Medium Priority">Medium Priority (Qualified Buyer)</option>
                    <option value="Standard">Standard Priority (First Screening)</option>
                    <option value="Low Priority">Low Priority (Browsing / Preliminary)</option>
                  </select>
                </div>
              </div>

              <div>
                <SearchableCombobox
                  label="Client Name & Phone Number"
                  required
                  value={formData.client}
                  placeholder="Select or search client by name or phone..."
                  searchPlaceholder="Type client name or phone number (e.g. 98200...)"
                  options={clientsList.map(c => ({
                    value: c.name,
                    label: c.name,
                    sublabel: c.phone || 'No Phone',
                    badge: (c as any).leadPurpose || (c as any).status || 'Client'
                  }))}
                  onChange={(val, opt) => {
                    const phoneToUse = opt?.sublabel && opt.sublabel !== 'No Phone' ? opt.sublabel : formData.clientPhone;
                    setFormData(prev => ({
                      ...prev,
                      client: val,
                      clientPhone: phoneToUse
                    }));
                  }}
                  onAddNew={() => {
                    window.location.href = '/dashboard/leads?new=true';
                  }}
                  addNewLabel="+ Add New Client / Inquiry..."
                />

                {/* Client Phone with 10-digit validation */}
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Client Mobile Number (10 Digits for WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone || ''}
                    onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="e.g. 98200 45678"
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `1px solid ${formData.clientPhone?.trim() && !isValid10DigitPhone(formData.clientPhone) ? '#ef4444' : '#cbd5e1'}`,
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                  {formData.clientPhone?.trim() && (
                    <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: isValid10DigitPhone(formData.clientPhone) ? '#16a34a' : '#ea580c' }}>
                      {isValid10DigitPhone(formData.clientPhone) ? '✓ Valid 10-digit mobile number' : `⚠️ Enter 10 digits (${extract10DigitPhone(formData.clientPhone).length}/10 digits)`}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <MultiPropertySelector
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
                    const isRent = (matched && ((matched as any).purpose === 'For Rent' || (matched as any).listingType === 'For Rent')) || firstProp.toLowerCase().includes('rent') || firstProp.toLowerCase().includes('lease');
                    setFormData(prev => ({
                      ...prev,
                      properties: newProps,
                      property: firstProp,
                      purpose: newProps.length > 0 ? (isRent ? 'Rent' : 'Buy') : prev.purpose
                    }));
                  }}
                  onAddNewProperty={() => {
                    window.location.href = '/dashboard/properties?new=true';
                  }}
                />
              </div>

              <div className="responsive-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Showing Type</label>
                  <select 
                    value={formData.purpose} 
                    onChange={e => setFormData({...formData, purpose: e.target.value as any})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="">Select Showing Type (Buy / Rent)...</option>
                    <option value="Buy">Buy / Sale Showing</option>
                    <option value="Rent">Rent / Lease Showing</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Date *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Time Slot</label>
                  <input type="time" value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Notes (Optional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80 }} placeholder="Add any special instructions or client requirements..." />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', position: 'sticky', bottom: '-24px', backgroundColor: '#fff', padding: '16px 0', borderTop: '1px solid var(--border)', zIndex: 10 }}>
                {editingVisit && (
                  <button
                    type="button"
                    onClick={() => setDeletingVisit(editingVisit)}
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
                    <TrashIcon size={14} color="#dc2626" />
                    <span>Delete</span>
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '12px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {isSubmitting ? (editingVisit ? 'Updating...' : 'Booking...') : (editingVisit ? 'Update Visit' : 'Book Visit')}
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
            Site Visits <InfoTooltip text="Schedule and track client property showings. Syncs automatically with your leads pipeline." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{data.length} visits total</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredData.length} shown</span>
            {(purposeFilter !== 'All' || filter !== 'All Dates' || statusFilter !== 'All' || searchQuery) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#059669', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>
                  Filtered: {[
                    purposeFilter !== 'All' ? (purposeFilter === 'Buy' ? 'Buy Visits' : 'Rent Visits') : null,
                    filter !== 'All Dates' ? filter : null,
                    statusFilter !== 'All' ? statusFilter : null,
                    searchQuery ? `"${searchQuery}"` : null
                  ].filter(Boolean).join(' + ')}
                </span>
                <button
                  type="button"
                  onClick={() => { setPurposeFilter('All'); setFilter('All Dates'); setStatusFilter('All'); setSearchQuery(''); }}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Clear filters
                </button>
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* View Mode Switcher: List View vs Calendar View */}
          <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: viewMode === 'list' ? 700 : 500,
                backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#64748b',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <ListIcon size={14} color={viewMode === 'list' ? '#ffffff' : '#64748b'} />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: viewMode === 'calendar' ? 700 : 500,
                backgroundColor: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'calendar' ? '#ffffff' : '#64748b',
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <CalendarIcon size={14} color={viewMode === 'calendar' ? '#ffffff' : '#64748b'} />
              <span>Calendar View</span>
            </button>
          </div>

          <button 
            onClick={() => handleOpenAdd()}
            style={{
              backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-dark)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            <PlusIcon size={16} color="#fff" strokeWidth={2.5} />
            <span>Book Visit</span>
          </button>
        </div>
      </div>

      {/* Unified Compact Filter Bar Card */}
      <div className="unified-filter-card">
        {/* Row 1: Segmented Showing Type Switch + Search + Sort */}
        <div className="unified-filter-row-top">
          <FilterTabs
            variant="segmented"
            size="sm"
            tabs={[
              { id: 'All', label: 'All Showings', count: purposeCounts.all, icon: <ListIcon size={13} /> },
              { id: 'Buy', label: 'Buy Visits', count: purposeCounts.buy, icon: <HomeIcon size={13} /> },
              { id: 'Rent', label: 'Rent Visits', count: purposeCounts.rent, icon: <KeyIcon size={13} /> }
            ]}
            activeTab={purposeFilter}
            onChange={(tabId) => setPurposeFilter(tabId as any)}
          />

          <div className="unified-filter-controls">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search client, property..."
              maxWidth={240}
            />

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="unified-filter-select"
            >
              <option value="date_asc">Date: Earliest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="client_asc">Client Name (A → Z)</option>
              <option value="client_desc">Client Name (Z → A)</option>
              <option value="priority_desc">Priority (High → Low)</option>
              <option value="status">Visit Status</option>
            </select>
          </div>
        </div>

        {/* Row 2: Schedule & Status in Compact Horizontal Strips */}
        <div className="unified-filter-row-bottom" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <FilterTabs
              label="Schedule:"
              size="sm"
              tabs={[
                { id: 'Upcoming', label: 'Upcoming', count: scheduleCounts.upcoming },
                { id: 'Past', label: 'Past', count: scheduleCounts.past },
                { id: 'Cancelled', label: 'Cancelled', count: scheduleCounts.cancelled },
                { id: 'All Dates', label: 'All Dates', count: scheduleCounts.all }
              ]}
              activeTab={filter}
              onChange={(tabId) => setFilter(tabId as any)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #f8fafc', paddingTop: 6 }}>
            <FilterTabs
              label="Status:"
              size="sm"
              tabs={[
                { id: 'All', label: 'All Statuses', count: statusCounts.all },
                ...siteVisitStatuses.map(s => ({
                  id: s,
                  label: s,
                  count: statusCounts[s] ?? 0
                }))
              ]}
              activeTab={statusFilter}
              onChange={(tabId) => setStatusFilter(tabId)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area: Calendar View OR Timeline View */}
      {viewMode === 'calendar' ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {/* Calendar Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {calendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h2>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                {filteredData.filter(v => v.date.startsWith(`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`)).length} Visits This Month
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 8, backgroundColor: '#ffffff', color: '#334155', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                ◀ Prev
              </button>
              <button
                type="button"
                onClick={goToToday}
                style={{ padding: '6px 14px', border: '1px solid #cbd5e1', borderRadius: 8, backgroundColor: '#ffffff', color: '#0f172a', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={nextMonth}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 8, backgroundColor: '#ffffff', color: '#334155', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div key={day} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: idx === 0 || idx === 6 ? '#dc2626' : '#475569', letterSpacing: '0.05em' }}>
                {day.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', backgroundColor: 'var(--border)', gap: '1px' }}>
            {calendarDays.map((day) => {
              const dayVisits = groupedData[day.dateStr] || [];
              const isToday = day.dateStr === today;

              return (
                <div
                  key={day.dateStr}
                  style={{
                    backgroundColor: day.isCurrentMonth ? '#ffffff' : '#f8fafc',
                    minHeight: 125,
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    position: 'relative',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: isToday ? 800 : (day.isCurrentMonth ? 700 : 500),
                        color: isToday ? '#ffffff' : (day.isCurrentMonth ? '#0f172a' : '#94a3b8'),
                        backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                        width: isToday ? 24 : 'auto',
                        height: isToday ? 24 : 'auto',
                        borderRadius: isToday ? '50%' : 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {day.dayNum}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenAdd(day.dateStr)}
                      title={`Book visit on ${day.dateStr}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontSize: 14,
                        lineHeight: 1,
                        borderRadius: 4
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      +
                    </button>
                  </div>

                  {/* Visits Chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', maxHeight: 110 }}>
                    {dayVisits.map((v) => {
                      const sc = getStatusColorStyle(v.status);
                      const isRent = getVisitPurpose(v) === 'Rent';

                      return (
                        <div
                          key={v.id}
                          onClick={() => handleOpenEdit(v)}
                          title={`${v.timeSlot || 'Visit'}: ${v.client} - ${v.property} (${v.status})`}
                          style={{
                            padding: '4px 6px',
                            borderRadius: 6,
                            backgroundColor: sc.bg,
                            border: `1px solid ${sc.border}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            fontSize: 11,
                            transition: 'all 0.12s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <span style={{ fontWeight: 800, color: sc.text, fontSize: 10.5 }}>
                              {v.timeSlot || 'Anytime'}
                            </span>
                            <span style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              padding: '1px 4px',
                              borderRadius: 4,
                              backgroundColor: isRent ? '#f3e8ff' : '#eff6ff',
                              color: isRent ? '#7e22ce' : '#1d4ed8'
                            }}>
                              {isRent ? 'Rent' : 'Buy'}
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.client}
                          </div>
                          <div style={{ color: '#475569', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.property}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
      /* Timeline View */
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.keys(groupedData).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: 16, border: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <CalendarIcon size={36} color="#cbd5e1" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>No {filter.toLowerCase()} site visits found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing the search or changing showing type (Buy / Rent).</div>
          </div>
        ) : (
          Object.keys(groupedData).map((date) => (
            <div key={date} className="responsive-timeline-item">
              
              {/* Date Column */}
              <div className="responsive-timeline-date" style={{ width: 100, flexShrink: 0, textAlign: 'right', paddingTop: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{formatDate(date).split(',')[1]}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formatDate(date).split(',')[0]}</div>
              </div>

              {/* Timeline Connector & Cards */}
              <div className="responsive-timeline-content" style={{ position: 'relative', flex: 1, paddingLeft: 24, borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {groupedData[date].map((visit) => {
                  const purpose = getVisitPurpose(visit);
                  const isRent = purpose === 'Rent';

                  return (
                  <div key={visit.id} 
                    onClick={() => handleOpenEdit(visit)}
                    style={{ 
                    position: 'relative', backgroundColor: '#fff', border: '1px solid var(--border)', 
                    borderRadius: 16, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}
                  >
                    {/* Node Dot */}
                    <div className="timeline-node-dot" style={{ position: 'absolute', left: -31, top: 24, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#fff', border: '3px solid var(--primary)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{visit.timeSlot || 'TBD'}</div>
                        {getStatusBadge(visit.status)}
                        {(visit.priority || (visit as any).urgency) && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: (visit.priority || '').includes('High') ? '#fef2f2' : '#f0fdf4',
                            color: (visit.priority || '').includes('High') ? '#b91c1c' : '#15803d',
                            border: `1px solid ${(visit.priority || '').includes('High') ? '#fecaca' : '#bbf7d0'}`,
                            padding: '3px 8px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {(visit.priority || '').includes('High') ? <FlameIcon size={11} color="currentColor" /> : <SparklesIcon size={11} color="currentColor" />}
                            <span>{visit.priority || (visit as any).urgency}</span>
                          </span>
                        )}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: isRent ? '#f3e8ff' : '#eff6ff',
                          color: isRent ? '#7e22ce' : '#1d4ed8',
                          border: `1px solid ${isRent ? '#d8b4fe' : '#bfdbfe'}`,
                          padding: '3px 8px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700
                        }}>
                          {isRent ? <KeyIcon size={11} color="currentColor" /> : <HomeIcon size={11} color="currentColor" />}
                          <span>{isRent ? 'Rent Showing' : 'Buy Showing'}</span>
                        </span>
                        {visit.source === 'Client Portal' && (
                          <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            Portal
                          </span>
                        )}
                      </div>
                      
                      {/* Actions: Edit + Delete + Quick Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(visit)}
                          style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <EditIcon size={12} color="#1d4ed8" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingVisit(visit)}
                          style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <TrashIcon size={12} color="#dc2626" />
                          <span>Delete</span>
                        </button>
                        <select
                          value={visit.status}
                          onChange={(e) => handleStatusChange(visit.id, e.target.value)}
                          style={{ fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="No Show">No Show</option>
                        </select>
                      </div>
                    </div>

                    <div className="responsive-grid-2">
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>
                          {visit.properties && visit.properties.length > 1 ? `Showing Tour (${visit.properties.length} Stops)` : 'Property'}
                        </div>
                        {visit.properties && visit.properties.length > 1 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {visit.properties.map((p, idx) => (
                              <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, backgroundColor: '#0f172a', color: '#fff', flexShrink: 0 }}>
                                  Stop {idx + 1}
                                </span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{visit.property}</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Client</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UserIcon size={13} color="#94a3b8" />
                          <span>{visit.client}</span>
                          {visit.clientPhone && <span style={{ fontSize: 12, color: '#64748b' }}>({visit.clientPhone})</span>}
                        </div>
                      </div>
                    </div>

                    {visit.notes && (
                      <div style={{ marginTop: 12, padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <FileTextIcon size={14} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.4 }}>{visit.notes}</span>
                      </div>
                    )}
                    
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {visit.clientPhone ? (
                            <>
                              <PhoneIcon size={12} color="#64748b" />
                              <span>{visit.clientPhone}</span>
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Client: {visit.client}</span>
                          )}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSharingVisit(visit);
                          }}
                          style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s ease' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          title="Share Site Visit Schedule with Client or Anyone"
                        >
                          <WhatsAppIcon size={14} color="#fff" />
                          <span>Share / WhatsApp</span>
                        </button>
                      </div>
                  </div>
                );
              })}
              </div>
            </div>
          ))
        )}
      </div>
      )}
    </div>

      {/* Universal Share Modal */}
      {sharingVisit && (() => {
        const v = sharingVisit;
        const tourText = v.properties && v.properties.length > 1
          ? `showing tour on ${formatDate(v.date)} (${v.timeSlot || 'Scheduled Time'}):\n` + v.properties.map((p, i) => `Stop ${i + 1}: ${p}`).join('\n') + `\n\nPlease let me know if you need any directions or gate passes!`
          : `site visit for ${v.property} on ${formatDate(v.date)} (${v.timeSlot || 'Scheduled Time'}). Please let me know if you need location directions!`;

        const defaultMsg = `Hi ${v.client},\n\nGreetings from AgentLadders! This is regarding your upcoming ${tourText}`;

        return (
          <ShareModal
            isOpen={!!sharingVisit}
            onClose={() => setSharingVisit(null)}
            shareItem={{
              id: v.id,
              type: 'site-visit',
              title: `Site Visit • ${v.client}`,
              subtitle: `${v.property || 'Property Showing'} • ${formatDate(v.date)} (${v.timeSlot || 'Scheduled'})`,
              description: v.notes || undefined,
              badge: v.status || 'Scheduled',
              link: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/site-visits` : '',
              recipientName: v.client,
              recipientPhone: v.clientPhone,
              defaultMessage: defaultMsg
            }}
          />
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deletingVisit && (
        <ConfirmModal
          isOpen={!!deletingVisit}
          title="Delete Site Visit?"
          message={
            <div>
              Are you sure you want to delete the site visit for <strong>{deletingVisit.property}</strong> with <strong>{deletingVisit.client}</strong>?
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#64748b' }}>
                This schedule record will be permanently removed.
              </div>
            </div>
          }
          confirmText="Yes, Delete Visit"
          cancelText="Cancel"
          danger
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingVisit(null)}
        />
      )}

      {/* Global Action Feedback Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
