'use client';

import React, { useState, useEffect } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { DEFAULT_SITE_VISIT_STATUSES } from '@/lib/formatters';
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
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);
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

  const [formData, setFormData] = useState({ 
    client: '', 
    clientPhone: '', 
    property: '', 
    properties: [] as string[], 
    date: '', 
    timeSlot: '', 
    purpose: 'Buy' as 'Buy' | 'Rent', 
    notes: '', 
    status: 'Scheduled', 
    priority: 'High Priority' 
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
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text || '')}`, '_blank');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

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

  const buyCount = data.filter(v => getVisitPurpose(v) === 'Buy').length;
  const rentCount = data.filter(v => getVisitPurpose(v) === 'Rent').length;

  const filteredData = data.filter(v => {
    if (purposeFilter !== 'All' && getVisitPurpose(v) !== purposeFilter) return false;
    if (filter === 'Upcoming') {
      if (v.date < today || v.status === 'Cancelled') return false;
    } else if (filter === 'Past') {
      if (v.date >= today) return false;
    } else if (filter === 'Cancelled') {
      if (v.status !== 'Cancelled') return false;
    }
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.client?.toLowerCase().includes(q) ||
        v.clientPhone?.toLowerCase().includes(q) ||
        v.property?.toLowerCase().includes(q) ||
        (Array.isArray(v.properties) && v.properties.some(p => p.toLowerCase().includes(q))) ||
        v.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.timeSlot || '').localeCompare(b.timeSlot || '');
  });

  const getStatusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; dot: string }> = {
      'Scheduled': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
      'Completed': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
      'Cancelled': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
      'No Show': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
      'Confirmed': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    };
    const style = map[s] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: style.bg, padding: '4px 10px', borderRadius: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot }} />
        <span style={{ color: style.color, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</span>
      </div>
    );
  };

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Syncing calendar...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingVisit(null);
    setFormData({ 
      client: '', 
      clientPhone: '', 
      property: '', 
      properties: [], 
      date: today, 
      timeSlot: '11:30 AM - 12:30 PM', 
      purpose: 'Buy', 
      notes: '', 
      status: 'Scheduled', 
      priority: 'High Priority' 
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
      status: visit.status || 'Scheduled',
      priority: visit.priority || (visit as any).urgency || 'High Priority',
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

    setIsSubmitting(true);
    try {
      const primaryProperty = formData.properties.length > 0 ? formData.properties[0] : (formData.property || 'Property Showing');
      const finalProperties = formData.properties.length > 0 ? formData.properties : [primaryProperty];

      const payload = {
        ...(editingVisit ? { id: editingVisit.id } : {}),
        ...formData,
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
          purpose: 'Buy', 
          notes: '', 
          status: 'Scheduled', 
          priority: 'High Priority' 
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
                    value={formData.priority || 'High Priority'} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                  >
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
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            Schedule and manage your property showings.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
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

      {/* Main Type / Purpose Filter (Buy vs Rent) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <FilterTabs
          label="Showing Type:"
          tabs={[
            { id: 'All', label: 'All Showings', count: data.length, icon: <ListIcon size={14} /> },
            { id: 'Buy', label: 'Buy Visits', count: buyCount, icon: <HomeIcon size={14} /> },
            { id: 'Rent', label: 'Rent Visits', count: rentCount, icon: <KeyIcon size={14} /> }
          ]}
          activeTab={purposeFilter}
          onChange={(tabId) => setPurposeFilter(tabId as any)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search client, property..."
            maxWidth={280}
          />
        </div>
      </div>

      {/* Visit Status Filter Pills Row */}
      <div style={{ marginBottom: 14 }}>
        <FilterTabs
          label="Visit Status:"
          tabs={[
            { id: 'All', label: 'All Statuses', count: data.length },
            ...siteVisitStatuses.map(s => ({
              id: s,
              label: s,
              count: data.filter(v => v.status === s).length
            }))
          ]}
          activeTab={statusFilter}
          onChange={(tabId) => setStatusFilter(tabId)}
        />
      </div>

      {/* Date Range Tabs */}
      <div style={{ marginBottom: 28 }}>
        <FilterTabs
          label="Schedule:"
          tabs={['All Dates', 'Upcoming', 'Past', 'Cancelled'].map(f => ({
            id: f,
            label: f,
            count: f === 'All Dates' ? data.length : undefined
          }))}
          activeTab={filter}
          onChange={(tabId) => setFilter(tabId)}
        />
      </div>

      {/* Timeline View */}
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
                    
                    {visit.clientPhone && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <PhoneIcon size={12} color="#64748b" />
                          <span>{visit.clientPhone}</span>
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const tourText = visit.properties && visit.properties.length > 1
                              ? `your upcoming showing tour on ${formatDate(visit.date)} (${visit.timeSlot || 'Scheduled Time'}):\n` + visit.properties.map((p, i) => `Stop ${i + 1}: ${p}`).join('\n') + `\n\nPlease let me know if you need any directions or gate passes!`
                              : `your upcoming site visit for ${visit.property} on ${formatDate(visit.date)} (${visit.timeSlot || 'Scheduled Time'}). Please let me know if you need location directions!`;
                            openWa(visit.clientPhone, `Hi ${visit.client}, this is regarding ${tourText}`);
                          }}
                          style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s ease' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <WhatsAppIcon size={14} color="#fff" />
                          <span>WhatsApp Client</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>

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
