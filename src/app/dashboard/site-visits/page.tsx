'use client';

import React, { useState, useEffect } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { DEFAULT_SITE_VISIT_STATUSES } from '@/lib/formatters';
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
  const [propertiesList, setPropertiesList] = useState<{title: string; purpose?: string; listingType?: string}[]>([]);
  const [siteVisitStatuses, setSiteVisitStatuses] = useState<string[]>(DEFAULT_SITE_VISIT_STATUSES);

  const [formData, setFormData] = useState({ client: '', clientPhone: '', property: '', date: '', timeSlot: '', purpose: 'Buy', notes: '', status: 'Scheduled', priority: 'High Priority' });

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
      fetch('/api/site-visits').then(res => res.json()),
      fetch('/api/leads').then(res => res.json()),
      fetch('/api/properties').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([svJson, leadsJson, propsJson, settingsJson]) => {
      if (svJson.siteVisits) setData(svJson.siteVisits);
      if (leadsJson.leads) setClientsList(leadsJson.leads);
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
    if (filter === 'Upcoming') return v.date >= today && v.status !== 'Cancelled';
    if (filter === 'Past') return v.date < today;
    if (filter === 'Cancelled') return v.status === 'Cancelled';
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.client?.toLowerCase().includes(q) || v.property?.toLowerCase().includes(q) || v.notes?.toLowerCase().includes(q);
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
    setFormData({ client: '', clientPhone: '', property: '', date: '', timeSlot: '', purpose: 'Buy', notes: '', status: 'Scheduled', priority: 'High Priority' });
    setShowModal(true);
  };

  const handleOpenEdit = (visit: SiteVisit) => {
    setEditingVisit(visit);
    setFormData({
      client: visit.client || '',
      clientPhone: visit.clientPhone || '',
      property: visit.property || '',
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
    setIsSubmitting(true);
    try {
      const payload = {
        ...(editingVisit ? { id: editingVisit.id } : {}),
        ...formData
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
        setFormData({ client: '', clientPhone: '', property: '', date: '', timeSlot: '', purpose: 'Buy', notes: '', status: 'Scheduled', priority: 'High Priority' });
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Client Name *</label>
                <select 
                  required 
                  value={formData.client}
                  onChange={e => { 
                    if (e.target.value === 'NEW') {
                      window.location.href = '/dashboard/leads?new=true';
                    } else {
                      const matched = clientsList.find(c => c.name === e.target.value);
                      setFormData({
                        ...formData,
                        client: e.target.value,
                        clientPhone: matched?.phone || formData.clientPhone
                      });
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select a client...</option>
                  {clientsList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  <option value="NEW" style={{ fontWeight: 700 }}>+ Add New Client...</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Property *</label>
                <select 
                  required 
                  value={formData.property}
                  onChange={e => { 
                    if (e.target.value === 'NEW') {
                      window.location.href = '/dashboard/properties?new=true';
                    } else {
                      const matched = propertiesList.find(p => p.title === e.target.value);
                      const isRent = (matched && ((matched as any).purpose === 'For Rent' || (matched as any).listingType === 'For Rent')) || e.target.value.toLowerCase().includes('rent') || e.target.value.toLowerCase().includes('lease');
                      setFormData({
                        ...formData,
                        property: e.target.value,
                        purpose: isRent ? 'Rent' : 'Buy'
                      });
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select a property...</option>
                  {propertiesList.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
                  <option value="NEW" style={{ fontWeight: 700 }}>+ Add New Property...</option>
                </select>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Showing Type:
          </span>
          {[
            { id: 'All', label: 'All Showings', count: data.length, icon: ListIcon },
            { id: 'Buy', label: 'Buy Visits', count: buyCount, icon: HomeIcon },
            { id: 'Rent', label: 'Rent Visits', count: rentCount, icon: KeyIcon }
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

        <div style={{ position: 'relative', minWidth: 200, flex: '1 1 auto', maxWidth: 280 }}>
          <SearchIcon size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input 
            type="text"
            placeholder="Search client, property..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px 8px 34px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="responsive-pills-scroll" style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        {['Upcoming', 'Past', 'Cancelled'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
              backgroundColor: filter === f ? 'var(--primary)' : 'transparent',
              color: filter === f ? '#fff' : '#64748b',
              border: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={e => { if (filter !== f) e.currentTarget.style.backgroundColor = '#f1f5f9' }}
            onMouseLeave={e => { if (filter !== f) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {f}
          </button>
        ))}
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
                    <div style={{ position: 'absolute', left: -31, top: 24, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#fff', border: '3px solid var(--primary)' }} />
                    
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
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Property</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{visit.property}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Client</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UserIcon size={13} color="#94a3b8" />
                          <span>{visit.client}</span>
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
                            openWa(visit.clientPhone, `Hi ${visit.client}, this is regarding your upcoming site visit for ${visit.property} on ${formatDate(visit.date)} (${visit.timeSlot || 'Scheduled Time'}). Please let me know if you need location directions!`);
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
