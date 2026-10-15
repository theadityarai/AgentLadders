'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatINR, DEFAULT_DEAL_STAGES } from '@/lib/formatters';
import Link from 'next/link';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { MultiPropertySelector } from '@/components/ui/MultiPropertySelector';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  EditIcon, 
  TrashIcon, 
  SearchIcon, 
  PlusIcon, 
  KeyIcon, 
  HomeIcon, 
  BuildingIcon, 
  ListIcon, 
  UserIcon 
} from '@/components/icons/NavIcons';

interface Deal {
  id: string;
  title: string;
  clientName?: string;
  propertyName?: string;
  properties?: string[];
  amount: number;
  stage: string;
  expectedCloseDate: string;
  dealType?: string;
}

import { getStatusColorStyle } from '@/lib/theme';

function getStageColor(s: string) {
  const sc = getStatusColorStyle(s);
  return {
    border: sc.border,
    bg: sc.bg,
    badge: sc.text,
    badgeBg: sc.bg,
    bar: sc.dot
  };
}

export default function DealsPage() {
  const [data, setData] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stages, setStages] = useState<string[]>(DEFAULT_DEAL_STAGES);
  const [dealTypeFilter, setDealTypeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [clientsList, setClientsList] = useState<{name: string; phone?: string; email?: string; type?: string}[]>([]);
  const [propertiesList, setPropertiesList] = useState<{title: string; locality?: string; city?: string; bhk?: string; price?: number; purpose?: string; listingType?: string}[]>([]);

  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  }, []);

  const [formData, setFormData] = useState({ 
    title: '', 
    clientName: '', 
    propertyName: '', 
    properties: [] as string[],
    amount: '', 
    dealType: 'Outright Sale', 
    stage: 'Negotiation' 
  });

  const isDealRent = useCallback((d: Deal) => {
    const dt = (d.dealType || '').toLowerCase();
    const t = (d.title || '').toLowerCase();
    const p = (d.propertyName || '').toLowerCase();
    return dt.includes('rent') || dt.includes('lease') || t.includes('rent') || t.includes('lease') || p.includes('rent') || p.includes('lease');
  }, []);

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
          if (Array.isArray(parsed.dealStages) && parsed.dealStages.length > 0) {
            setStages(parsed.dealStages);
          }
        }
      } catch {}
    }

    // Refresh agency configs from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(settingsJson => {
        if (settingsJson.agency && Array.isArray(settingsJson.agency.dealStages) && settingsJson.agency.dealStages.length > 0) {
          setStages(settingsJson.agency.dealStages);
        }
      })
      .catch(() => {});

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agentladders_agency_configs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.dealStages) && parsed.dealStages.length > 0) setStages(parsed.dealStages);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/deals').then(res => res.json()).catch(() => ({ deals: [] })),
      fetch('/api/leads').then(res => res.json()).catch(() => ({ leads: [] })),
      fetch('/api/clients').then(res => res.json()).catch(() => ({ clients: [] })),
      fetch('/api/properties').then(res => res.json()).catch(() => ({ properties: [] }))
    ]).then(([dealsJson, leadsJson, clientsJson, propsJson]) => {
      if (dealsJson.deals) setData(dealsJson.deals);
      const combinedClients = [
        ...(leadsJson.leads || []),
        ...(clientsJson?.clients || [])
      ];
      const uniqueClients = Array.from(new Map(combinedClients.map(c => [c.name, c])).values());
      setClientsList(uniqueClients);
      if (propsJson.properties) setPropertiesList(propsJson.properties);
    }).finally(() => setLoading(false));
  }, []);



  const handleMoveStage = useCallback(async (dealId: string, newStage: string) => {
    const targetDeal = data.find(d => d.id === dealId);
    setData(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    try {
      const res = await fetch('/api/deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, stage: newStage })
      });
      if (res.ok) {
        showToast('success', `Deal "${targetDeal?.title || 'Item'}" moved to stage "${newStage}".`, 'Stage Updated');
      } else {
        showToast('error', 'Failed to update deal stage on server.', 'Update Failed');
      }
    } catch (err) {
      console.error('Failed to update deal stage', err);
      showToast('error', 'Network error while moving deal stage.', 'Network Error');
    }
  }, [data, showToast]);

  const allStagesList = useMemo(() => {
    return Array.from(new Set([...stages, 'Closed Won', 'Lost']));
  }, [stages]);

  const matchesDealStage = useCallback((d: Deal, targetStage: string) => {
    if (targetStage === 'All') return true;
    if (targetStage === 'Active') return !['Closed Won', 'Lost'].includes(d.stage);
    return d.stage === targetStage;
  }, []);

  const matchesDealType = useCallback((d: Deal, targetType: 'All' | 'Buy' | 'Rent') => {
    if (targetType === 'All') return true;
    const isRent = isDealRent(d);
    if (targetType === 'Rent') return isRent;
    if (targetType === 'Buy') return !isRent;
    return true;
  }, [isDealRent]);

  const matchesDealSearch = useCallback((d: Deal, q: string) => {
    if (!q) return true;
    return (
      d.title?.toLowerCase().includes(q) ||
      d.clientName?.toLowerCase().includes(q) ||
      d.propertyName?.toLowerCase().includes(q) ||
      (Array.isArray(d.properties) && d.properties.some(p => p.toLowerCase().includes(q)))
    );
  }, []);

  // Faceted Deal Type Counts (Context-aware based on current Stage filter and Search)
  const dealTypeCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const dataForType = data.filter(d => {
      if (!matchesDealStage(d, stageFilter)) return false;
      if (!matchesDealSearch(d, q)) return false;
      return true;
    });

    let buy = 0;
    let rent = 0;
    for (const d of dataForType) {
      if (isDealRent(d)) rent++;
      else buy++;
    }
    return { all: dataForType.length, buy, rent };
  }, [data, stageFilter, searchQuery, matchesDealStage, matchesDealSearch, isDealRent]);

  // Faceted Stage Counts (Context-aware based on current Deal Type filter and Search)
  const stageCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const dataForStage = data.filter(d => {
      if (!matchesDealType(d, dealTypeFilter)) return false;
      if (!matchesDealSearch(d, q)) return false;
      return true;
    });

    const counts: Record<string, number> = {
      all: dataForStage.length,
      active: dataForStage.filter(d => !['Closed Won', 'Lost'].includes(d.stage)).length
    };
    allStagesList.forEach(st => {
      counts[st] = dataForStage.filter(d => d.stage === st).length;
    });
    return counts;
  }, [data, dealTypeFilter, searchQuery, allStagesList, matchesDealType, matchesDealSearch]);

  const filteredDeals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return data.filter(d => {
      if (!matchesDealType(d, dealTypeFilter)) return false;
      if (!matchesDealStage(d, stageFilter)) return false;
      if (!matchesDealSearch(d, q)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return (a.id || '').localeCompare(b.id || '');
      } else if (sortBy === 'amount_desc') {
        return (b.amount || 0) - (a.amount || 0);
      } else if (sortBy === 'amount_asc') {
        return (a.amount || 0) - (b.amount || 0);
      } else if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'client_asc') {
        return (a.clientName || '').localeCompare(b.clientName || '');
      } else if (sortBy === 'close_date') {
        return (a.expectedCloseDate || '').localeCompare(b.expectedCloseDate || '');
      }
      // default: newest
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [data, dealTypeFilter, stageFilter, searchQuery, matchesDealType, matchesDealStage, matchesDealSearch, sortBy]);

  const columnsToDisplay = useMemo(() => {
    if (stageFilter === 'All') return stages;
    if (stageFilter === 'Active') return stages.filter(s => !['Closed Won', 'Lost'].includes(s));
    return [stageFilter];
  }, [stages, stageFilter]);

  // Calculate totals per stage in a single O(N) pass
  const { stageTotals, activePipelineValue, activeDealsCount } = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const s of allStagesList) totals[s] = 0;
    let pipelineVal = 0;
    let activeCount = 0;

    for (const d of filteredDeals) {
      const amt = d.amount || 0;
      if (totals[d.stage] !== undefined) totals[d.stage] += amt;
      else totals[d.stage] = amt;

      if (!['Closed Won', 'Lost'].includes(d.stage)) {
        pipelineVal += amt;
        activeCount++;
      }
    }

    return { stageTotals: totals, activePipelineValue: pipelineVal, activeDealsCount: activeCount };
  }, [filteredDeals, allStagesList]);

  const handleOpenAdd = useCallback(() => {
    setEditingDeal(null);
    setFormData({ 
      title: '', 
      clientName: '', 
      propertyName: '', 
      properties: [], 
      amount: '', 
      dealType: 'Outright Sale', 
      stage: 'Negotiation' 
    });
    setShowModal(true);
  }, []);

  const handleOpenEdit = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    const initialProps = Array.isArray(deal.properties) && deal.properties.length > 0
      ? deal.properties
      : (deal.propertyName ? [deal.propertyName] : []);
    setFormData({
      title: deal.title || '',
      clientName: deal.clientName || '',
      propertyName: deal.propertyName || '',
      properties: initialProps,
      amount: deal.amount !== undefined ? deal.amount.toString() : '',
      dealType: deal.dealType || 'Outright Sale',
      stage: deal.stage || 'Negotiation'
    });
    setShowModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingDeal) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/deals?id=${encodeURIComponent(deletingDeal.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(prev => prev.filter(d => d.id !== deletingDeal.id));
        if (editingDeal?.id === deletingDeal.id) {
          setShowModal(false);
          setEditingDeal(null);
        }
        showToast('success', `Deal "${deletingDeal.title}" deleted successfully.`, 'Deal Deleted');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error || 'Failed to delete deal.', 'Delete Failed');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Network error while attempting to delete deal.', 'Network Error');
    } finally {
      setIsDeleting(false);
      setDeletingDeal(null);
    }
  }, [deletingDeal, editingDeal, showToast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim() || formData.title.trim().length < 2) {
      showToast('error', 'Please enter a deal title / mandate name (at least 2 characters).', 'Title Required');
      return;
    }
    if (!formData.clientName?.trim()) {
      showToast('error', 'Please select or enter a client name for this deal.', 'Client Required');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', 'Please enter a valid deal / transaction value greater than ₹0.', 'Amount Required');
      return;
    }
    if (!formData.stage?.trim()) {
      showToast('error', 'Please select a pipeline stage for this deal.', 'Stage Required');
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryProperty = formData.properties[0] || formData.propertyName || '';
      const payload = {
        ...(editingDeal ? { id: editingDeal.id } : {}),
        ...formData,
        propertyName: primaryProperty,
        properties: formData.properties,
        amount: parseFloat(formData.amount) || 0
      };
      const method = editingDeal ? 'PUT' : 'POST';
      const res = await fetch('/api/deals', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const created = json.deal || json;
        setData(prev => [created, ...prev.filter(d => d.id !== created.id)]);
        setShowModal(false);
        setEditingDeal(null);
        setFormData({ 
          title: '', 
          clientName: '', 
          propertyName: '', 
          properties: [], 
          amount: '', 
          dealType: 'Outright Sale', 
          stage: 'Negotiation' 
        });
        showToast('success', editingDeal ? `Deal "${formData.title}" updated successfully!` : `Deal "${formData.title}" added to pipeline!`, editingDeal ? 'Deal Updated' : 'Deal Created');
        fetch('/api/deals').then(r => r.json()).then(j => { if (j.deals) setData(j.deals); });
      } else {
        showToast('error', json.error || 'Failed to save deal. Please verify amounts and fields.', 'Save Failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error occurred while saving deal.', 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingDeal, showToast]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Loading pipeline...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Slide-over Drawer for Creating / Editing Deal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="responsive-drawer animate-enter" style={{ backgroundColor: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingDeal ? 'Edit Deal' : 'Create Deal'} <InfoTooltip text="Log a new transaction or edit deal stages." />
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Primary Status / Pipeline Stage Field (First / Top Field) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Deal Status / Pipeline Stage *
                </label>
                <select 
                  value={formData.stage} 
                  onChange={e => setFormData({...formData, stage: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 600, outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
                >
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Closed Won">Closed Won</option>
                  <option value="Lost">Lost / Cancelled</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Deal Title *</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. 3BHK Lodha - Rahul" />
              </div>

              <div>
                <SearchableCombobox
                  label="Client Name & Phone Number"
                  required
                  value={formData.clientName}
                  placeholder="Select or search client by name or phone..."
                  searchPlaceholder="Type client name or phone (e.g. 98200...)"
                  options={clientsList.map(c => ({
                    value: c.name,
                    label: c.name,
                    sublabel: c.phone || 'No Phone',
                    badge: c.type || (c as any).leadPurpose || (c as any).status || 'Client'
                  }))}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, clientName: val }));
                  }}
                  onAddNew={() => {
                    window.location.href = '/dashboard/leads?new=true';
                  }}
                  addNewLabel="+ Add New Client / Inquiry..."
                />
              </div>

              <div>
                <MultiPropertySelector
                  label="Property Assets in Deal"
                  required
                  itemPrefix="Property"
                  itemBadgeLabel="Properties in Deal"
                  addFirstLabel="Select Property Asset for Deal"
                  addMoreLabel="+ Add Another Property to this Deal"
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
                    const isRent = (matched && ((matched as any).purpose === 'For Rent' || (matched as any).listingType === 'For Rent')) || firstProp.toLowerCase().includes('rent') || firstProp.toLowerCase().includes('lease');
                    
                    let totalEstimatedPrice = 0;
                    newProps.forEach(pt => {
                      const match = propertiesList.find(p => p.title === pt);
                      if (match?.price) totalEstimatedPrice += match.price;
                    });

                    setFormData(prev => ({
                      ...prev,
                      properties: newProps,
                      propertyName: firstProp,
                      dealType: newProps.length > 0 ? (isRent ? 'Rental Lease' : 'Outright Sale') : prev.dealType,
                      amount: totalEstimatedPrice > 0 && (!prev.amount || prev.amount === '0') ? totalEstimatedPrice.toString() : prev.amount
                    }));
                  }}
                  onAddNewProperty={() => {
                    window.location.href = '/dashboard/properties?new=true';
                  }}
                />
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Deal Type</label>
                  <select 
                    value={formData.dealType} 
                    onChange={e => setFormData({...formData, dealType: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Outright Sale">Outright Sale (Buy)</option>
                    <option value="Rental Lease">Rental / Lease</option>
                    <option value="Builder CP Booking">Builder CP Booking</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Deal Value (₹) *</label>
                  <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }} placeholder="e.g. 5000000" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', position: 'sticky', bottom: '-24px', backgroundColor: '#fff', padding: '16px 0', borderTop: '1px solid var(--border)', zIndex: 10 }}>
                {editingDeal && (
                  <button
                    type="button"
                    onClick={() => setDeletingDeal(editingDeal)}
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
                  {isSubmitting ? (editingDeal ? 'Updating...' : 'Saving...') : (editingDeal ? 'Update Deal' : 'Save Deal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-page-container animate-enter" style={{ maxWidth: '100%' }}>

      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
            Deals Pipeline <InfoTooltip text="Track and manage active transactions visually across the sales lifecycle." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{data.length} deals total</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{filteredDeals.length} shown</span>
            <span>•</span>
            <span>Pipeline Value: <strong style={{ color: 'var(--primary)', fontSize: 14 }}>{formatINR(activePipelineValue)}</strong></span>
            {(dealTypeFilter !== 'All' || stageFilter !== 'All' || searchQuery) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--primary-text, var(--primary, #059669))', backgroundColor: 'var(--primary-light, #ecfdf5)', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>
                  Filtered: {[
                    dealTypeFilter !== 'All' ? (dealTypeFilter === 'Buy' ? 'Sale / Buy' : 'Rental / Lease') : null,
                    stageFilter !== 'All' ? stageFilter : null,
                    searchQuery ? `"${searchQuery}"` : null
                  ].filter(Boolean).join(' + ')}
                </span>
                <button
                  type="button"
                  onClick={() => { setDealTypeFilter('All'); setStageFilter('All'); setSearchQuery(''); }}
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
            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)', transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-dark)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
        >
          <PlusIcon size={16} color="#fff" strokeWidth={2.5} />
          <span>Create Deal</span>
        </button>
      </div>

      {/* Unified Compact Filter Bar Card */}
      <div className="unified-filter-card">
        {/* Row 1: Segmented Deal Type Switch + Search + Sort */}
        <div className="unified-filter-row-top">
          <FilterTabs
            variant="segmented"
            size="sm"
            tabs={[
              { id: 'All', label: 'All Deals', count: dealTypeCounts.all, icon: <ListIcon size={13} /> },
              { id: 'Buy', label: 'Sale / Buy Deals', count: dealTypeCounts.buy, icon: <HomeIcon size={13} /> },
              { id: 'Rent', label: 'Rental / Lease Deals', count: dealTypeCounts.rent, icon: <KeyIcon size={13} /> }
            ]}
            activeTab={dealTypeFilter}
            onChange={(tabId) => setDealTypeFilter(tabId as any)}
          />

          <div className="unified-filter-controls">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search deals, clients, properties..."
              maxWidth={240}
            />

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="unified-filter-select"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount_desc">Deal Value: High → Low</option>
              <option value="amount_asc">Deal Value: Low → High</option>
              <option value="title_asc">Deal Name (A → Z)</option>
              <option value="client_asc">Client Name (A → Z)</option>
              <option value="close_date">Expected Close Date</option>
            </select>
          </div>
        </div>

        {/* Row 2: Deal Stage Filter Pills in a Compact Horizontal Strip */}
        <div className="unified-filter-row-bottom">
          <FilterTabs
            label="Stage:"
            size="sm"
            useStatusColors={true}
            tabs={[
              { id: 'All', label: 'All Stages', count: stageCounts.all },
              { id: 'Active', label: 'Active Pipeline', count: stageCounts.active },
              ...allStagesList.map(s => ({
                id: s,
                label: s,
                count: stageCounts[s] ?? 0
              }))
            ]}
            activeTab={stageFilter}
            onChange={(tabId) => setStageFilter(tabId)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="touch-scroll-container kanban-snap-container" style={{ display: 'flex', gap: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 24, minHeight: 'calc(100vh - 180px)' }}>
        {columnsToDisplay.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage);
          const colors = getStageColor(stage);
          
          return (
            <div 
              key={stage} 
              className="kanban-snap-lane"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const dealId = e.dataTransfer.getData('text/plain');
                if (dealId) {
                  handleMoveStage(dealId, stage);
                }
              }}
              style={{
                flex: '0 0 min(300px, 85vw)',
                backgroundColor: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                display: 'flex', flexDirection: 'column',
                maxHeight: '100%',
                boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                transition: 'background-color 0.2s ease'
              }}
            >
              
              {/* Stage Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: '#fff', borderRadius: '12px 12px 0 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.bar }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage}</h3>
                  <span style={{ backgroundColor: colors.badgeBg, color: colors.badge, fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                    {stageDeals.length}
                  </span>
                </div>
                
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {formatINR(stageTotals[stage])}
                </div>
              </div>

              {/* Stage Body */}
              <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stageDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', deal.id);
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onClick={() => handleOpenEdit(deal)}
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <div 
                        style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flex: 1 }}
                      >
                        {deal.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(deal)}
                          style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <EditIcon size={11} color="#1d4ed8" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDeal(deal)}
                          style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <TrashIcon size={11} color="#dc2626" />
                          <span>Delete</span>
                        </button>
                        <select
                          value={deal.stage}
                          onChange={(e) => {
                            handleMoveStage(deal.id, e.target.value);
                          }}
                          style={{ fontSize: 11, fontWeight: 600, padding: '3px 6px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', outline: 'none' }}
                        >
                          {stages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        backgroundColor: isDealRent(deal) ? '#f3e8ff' : '#eff6ff',
                        color: isDealRent(deal) ? '#7e22ce' : '#1d4ed8',
                        border: `1px solid ${isDealRent(deal) ? '#d8b4fe' : '#bfdbfe'}`
                      }}>
                        {isDealRent(deal) ? <KeyIcon size={11} color="currentColor" /> : <HomeIcon size={11} color="currentColor" />}
                        <span>{isDealRent(deal) ? 'Rental Lease' : 'Outright Sale'}</span>
                      </span>
                    </div>
                    
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginBottom: 16, letterSpacing: '-0.5px' }}>
                      {formatINR(deal.amount)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        <UserIcon size={13} color="#94a3b8" />
                        <span>{deal.clientName}</span>
                      </div>
                      {deal.properties && deal.properties.length > 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                            <BuildingIcon size={13} color="var(--primary)" />
                            <span>{deal.properties.length} Properties in Deal:</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 18 }}>
                            {deal.properties.map((prop, idx) => (
                              <div key={idx} style={{ fontSize: 11.5, color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                          <BuildingIcon size={13} color="#94a3b8" />
                          <span>{deal.propertyName || (deal.properties && deal.properties[0]) || 'No Property Assigned'}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Expected Close</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))}
                
                {stageDeals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 8, backgroundColor: 'transparent' }}>
                    Drop deals here
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>

      {/* Delete Confirmation Modal */}
      {deletingDeal && (
        <ConfirmModal
          isOpen={!!deletingDeal}
          title="Delete Deal?"
          message={
            <div>
              Are you sure you want to delete the deal <strong>{deletingDeal.title}</strong>?
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#64748b' }}>
                This deal value ({formatINR(deletingDeal.amount)}) and transaction record will be permanently removed.
              </div>
            </div>
          }
          confirmText="Yes, Delete Deal"
          cancelText="Cancel"
          danger
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingDeal(null)}
        />
      )}

      {/* Global Action Feedback Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
