'use client';

import React, { useState, useEffect } from 'react';
import { formatINR, DEFAULT_DEAL_STAGES } from '@/lib/formatters';
import Link from 'next/link';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
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
  amount: number;
  stage: string;
  expectedCloseDate: string;
  dealType?: string;
}

export default function DealsPage() {
  const [data, setData] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stages, setStages] = useState<string[]>(DEFAULT_DEAL_STAGES);
  const [dealTypeFilter, setDealTypeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [clientsList, setClientsList] = useState<{name: string}[]>([]);
  const [propertiesList, setPropertiesList] = useState<{title: string; purpose?: string; listingType?: string}[]>([]);

  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  const [formData, setFormData] = useState({ title: '', clientName: '', propertyName: '', amount: '', dealType: 'Outright Sale', stage: 'Negotiation' });

  const isDealRent = (d: Deal) => {
    const dt = (d.dealType || '').toLowerCase();
    const t = (d.title || '').toLowerCase();
    const p = (d.propertyName || '').toLowerCase();
    return dt.includes('rent') || dt.includes('lease') || t.includes('rent') || t.includes('lease') || p.includes('rent') || p.includes('lease');
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
      fetch('/api/deals').then(res => res.json()),
      fetch('/api/leads').then(res => res.json()),
      fetch('/api/properties').then(res => res.json())
    ]).then(([dealsJson, leadsJson, propsJson]) => {
      if (dealsJson.deals) setData(dealsJson.deals);
      if (leadsJson.leads) setClientsList(leadsJson.leads);
      if (propsJson.properties) setPropertiesList(propsJson.properties);
    }).finally(() => setLoading(false));
  }, []);

  const getStageColor = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes('token') || lower.includes('won') || lower.includes('closed')) {
      return { border: '#bbf7d0', bg: '#f0fdf4', badge: '#059669', badgeBg: '#d1fae5', bar: '#10b981' };
    }
    if (lower.includes('lost') || lower.includes('drop') || lower.includes('cancel')) {
      return { border: '#fecaca', bg: '#fef2f2', badge: '#b91c1c', badgeBg: '#fee2e2', bar: '#ef4444' };
    }
    if (lower.includes('agreement') || lower.includes('draft') || lower.includes('legal')) {
      return { border: '#bfdbfe', bg: '#eff6ff', badge: '#1d4ed8', badgeBg: '#dbeafe', bar: '#3b82f6' };
    }
    if (lower.includes('registration') || lower.includes('pending') || lower.includes('loan')) {
      return { border: '#fde68a', bg: '#fffbeb', badge: '#b45309', badgeBg: '#fef3c7', bar: '#f59e0b' };
    }
    return { border: '#e2e8f0', bg: '#f8fafc', badge: '#475569', badgeBg: '#f1f5f9', bar: '#94a3b8' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Loading pipeline...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleMoveStage = async (dealId: string, newStage: string) => {
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
  };

  const saleCount = data.filter(d => !isDealRent(d)).length;
  const rentCount = data.filter(d => isDealRent(d)).length;

  const filteredDeals = data.filter(d => {
    if (dealTypeFilter !== 'All') {
      const isRent = isDealRent(d);
      if (dealTypeFilter === 'Rent' && !isRent) return false;
      if (dealTypeFilter === 'Buy' && isRent) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.clientName?.toLowerCase().includes(q) ||
        d.propertyName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate totals per stage
  const stageTotals = stages.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter(d => d.stage === stage).reduce((sum, d) => sum + (d.amount || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const activePipelineValue = filteredDeals.filter(d => !['Closed Won', 'Lost'].includes(d.stage)).reduce((a, b) => a + (b.amount || 0), 0);

  const handleOpenAdd = () => {
    setEditingDeal(null);
    setFormData({ title: '', clientName: '', propertyName: '', amount: '', dealType: 'Outright Sale', stage: 'Negotiation' });
    setShowModal(true);
  };

  const handleOpenEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      clientName: deal.clientName || '',
      propertyName: deal.propertyName || '',
      amount: deal.amount !== undefined ? deal.amount.toString() : '',
      dealType: deal.dealType || 'Outright Sale',
      stage: deal.stage || 'Negotiation'
    });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...(editingDeal ? { id: editingDeal.id } : {}),
        ...formData,
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
        setFormData({ title: '', clientName: '', propertyName: '', amount: '', dealType: 'Outright Sale', stage: 'Negotiation' });
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
  };

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

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Client Name *</label>
                  <select 
                    required 
                    value={formData.clientName}
                    onChange={e => { 
                       if (e.target.value === 'NEW') window.location.href = '/dashboard/leads?new=true';
                      else setFormData({...formData, clientName: e.target.value});
                    }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="">Select a client...</option>
                    {clientsList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    <option value="NEW" style={{ fontWeight: 700 }}>+ Add New Client...</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Property Name *</label>
                  <select 
                    required 
                    value={formData.propertyName}
                    onChange={e => { 
                      if (e.target.value === 'NEW') {
                        window.location.href = '/dashboard/properties?new=true';
                      } else {
                        const matched = propertiesList.find(p => p.title === e.target.value);
                        const isRent = (matched && ((matched as any).purpose === 'For Rent' || (matched as any).listingType === 'For Rent')) || e.target.value.toLowerCase().includes('rent') || e.target.value.toLowerCase().includes('lease');
                        setFormData({
                          ...formData,
                          propertyName: e.target.value,
                          dealType: isRent ? 'Rental Lease' : 'Outright Sale'
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
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            Total Pipeline Value: <strong style={{ color: 'var(--primary)', fontSize: 15 }}>{formatINR(activePipelineValue)}</strong>
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

      {/* Deals Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deal Type:
          </span>
          {[
            { id: 'All', label: 'All Deals', count: data.length, icon: ListIcon },
            { id: 'Buy', label: 'Sale / Buy Deals', count: saleCount, icon: HomeIcon },
            { id: 'Rent', label: 'Rental / Lease Deals', count: rentCount, icon: KeyIcon }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setDealTypeFilter(tab.id as any)}
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
                  backgroundColor: dealTypeFilter === tab.id ? '#0f172a' : '#f1f5f9',
                  color: dealTypeFilter === tab.id ? '#fff' : '#475569',
                  border: 'none'
                }}
              >
                <IconComp size={14} color={dealTypeFilter === tab.id ? '#fff' : '#64748b'} />
                <span>{tab.label}</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 11,
                  backgroundColor: dealTypeFilter === tab.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: dealTypeFilter === tab.id ? '#fff' : '#64748b'
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
            placeholder="Search deals, clients, properties..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px 8px 34px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 24, minHeight: 'calc(100vh - 180px)' }}>
        {stages.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage);
          const colors = getStageColor(stage);
          
          return (
            <div 
              key={stage} 
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        <BuildingIcon size={13} color="#94a3b8" />
                        <span>{deal.propertyName}</span>
                      </div>
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
