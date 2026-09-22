'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Deal {
  [key: string]: unknown;
  id: string;
  title: string;
  amount: number;
  stage: string;
  expectedCloseDate: string;
  clientName?: string;
  propertyName?: string;
  probability?: number;
  dealType?: string;
  commissionRate?: string;
  commissionAmount?: number;
  assignedBroker?: string;
  notes?: string;
}

const STAGES = [
  'Prospecting',
  'Site Visit Done',
  'Offer Submitted',
  'Under Contract',
  'Closed Won',
  'Closed Lost'
];

export default function DealsPage() {
  const [data, setData] = useState<Deal[]>([]);
  const [properties, setProperties] = useState<{ id: string; title: string; price: number }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const initialForm = {
    title: '',
    amount: '',
    stage: 'Offer Submitted',
    clientName: '',
    propertyName: '',
    dealType: 'Sale Acquisition',
    probability: '75',
    commissionRate: '2.5%',
    commissionAmount: 0,
    assignedBroker: 'Marcus Vance',
    expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [dealToDelete, setDealToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dealsRes, propsRes, clientsRes] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/properties'),
        fetch('/api/clients')
      ]);

      const dealsJson = await dealsRes.json();
      const propsJson = await propsRes.json();
      const clientsJson = await clientsRes.json();

      if (dealsJson.deals) setData(dealsJson.deals);
      if (propsJson.properties) setProperties(propsJson.properties);
      if (clientsJson.clients) setClients(clientsJson.clients);
    } catch (err) {
      console.error('Failed to load deals data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePropertySelect = (propTitle: string) => {
    const selectedProp = properties.find(p => p.title === propTitle);
    setForm(prev => {
      const price = selectedProp ? String(selectedProp.price) : prev.amount;
      const autoTitle = prev.clientName ? `${prev.clientName} - ${propTitle}` : propTitle;
      return {
        ...prev,
        propertyName: propTitle,
        amount: price,
        title: autoTitle
      };
    });
  };

  const handleClientSelect = (cName: string) => {
    setForm(prev => {
      const autoTitle = prev.propertyName ? `${cName} - ${prev.propertyName}` : prev.title || cName;
      return {
        ...prev,
        clientName: cName,
        title: autoTitle
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dealPrice = parseFloat(form.amount) || 0;
    const commPct = parseFloat(form.commissionRate) || 2.5;
    const commVal = Math.round(dealPrice * (commPct / 100));

    await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: dealPrice,
        commissionAmount: commVal
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadData();
  };

  const handleOpenEdit = (deal: Deal) => {
    setEditingDeal(deal);
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;

    const dealPrice = parseFloat(String(editingDeal.amount)) || 0;
    const commPct = parseFloat(String(editingDeal.commissionRate)) || 2.5;
    const commVal = Math.round(dealPrice * (commPct / 100));

    const updated = {
      ...editingDeal,
      amount: dealPrice,
      commissionAmount: commVal
    };

    const res = await fetch('/api/deals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      setData(prev => prev.map(d => d.id === editingDeal.id ? { ...d, ...updated } : d));
      setEditingDeal(null);
    }
  };

  const handleQuickStageChange = async (dealId: string, newStage: string) => {
    setData(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    await fetch('/api/deals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dealId, stage: newStage })
    });
  };

  const handleDelete = (id: string, title: string) => {
    setDealToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!dealToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/deals?id=${dealToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(d => d.id !== dealToDelete.id));
    }
    setIsDeleting(false);
    setDealToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.clientName && item.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.propertyName && item.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = stageFilter === 'All' || item.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [data, searchQuery, stageFilter]);

  const columns: Column<Deal>[] = [
    {
      header: 'Deal Title & Context',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.title}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
            🏢 {row.propertyName || 'Exclusive Listing'} &bull; 👤 {row.clientName || 'Private Buyer'}
          </div>
        </div>
      )
    },
    {
      header: 'Deal Value & Commission',
      accessor: (row) => {
        const commAmt = row.commissionAmount || Math.round(row.amount * 0.025);
        return (
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14.5px' }}>
              ${row.amount?.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
              Commission: ${commAmt?.toLocaleString()} ({row.commissionRate || '2.5%'})
            </div>
          </div>
        );
      }
    },
    {
      header: 'Pipeline Stage',
      accessor: (row) => {
        const isWon = row.stage === 'Closed Won';
        const isLost = row.stage === 'Closed Lost';
        return (
          <select
            value={row.stage}
            onChange={(e) => handleQuickStageChange(row.id, e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: isWon ? '#ecfdf5' : isLost ? '#fef2f2' : '#eff6ff',
              color: isWon ? '#047857' : isLost ? '#b91c1c' : '#1d4ed8',
              cursor: 'pointer'
            }}
          >
            {STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        );
      }
    },
    {
      header: 'Close Target & Broker',
      accessor: (row) => (
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
            📅 {row.expectedCloseDate || 'Within 30 days'}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
            Broker: {row.assignedBroker || 'Marcus Vance'}
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            style={{ fontSize: '11.5px', padding: '3px 8px' }}
          >
            ✏️ Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id, row.title)}
            style={{ color: '#ef4444', fontSize: '12px', padding: '3px 6px' }}
          >
            🗑️
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Deals Pipeline"
        subtitle="Active sale negotiations, lease transactions, commission projections, and target closing dates"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Deal
          </Button>
        }
      />

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search deals by title, property, or client..."
        filters={[
          {
            key: 'stage',
            label: 'Stage',
            value: stageFilter,
            options: [
              { label: 'All Stages', value: 'All' },
              ...STAGES.map(s => ({ label: s, value: s }))
            ],
            onChange: setStageFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setStageFilter('All');
        }}
      />

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No deals found. Click '+ New Deal' to track an active transaction."
      />

      {/* MODAL: ADD DEAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Initiate Real Estate Deal</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Link property inventory, client buyer, and track commission</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                
                {/* Property Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Linked Property</label>
                  <select
                    value={form.propertyName}
                    onChange={e => handlePropertySelect(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="">-- Select Property --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.title}>{p.title} (${p.price?.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                {/* Client Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Linked Client / Buyer</label>
                  <select
                    value={form.clientName}
                    onChange={e => handleClientSelect(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Deal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acquisition of Beverly Hills Penthouse"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Agreed Deal Value ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2400000"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Commission Split</label>
                  <select
                    value={form.commissionRate}
                    onChange={e => setForm({ ...form, commissionRate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="2.0%">2.0% ($40,000 / $2M)</option>
                    <option value="2.5%">2.5% Standard ($50,000 / $2M)</option>
                    <option value="3.0%">3.0% ($60,000 / $2M)</option>
                    <option value="5.0%">5.0% Commercial ($100,000 / $2M)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Current Deal Stage</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm({ ...form, stage: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Closing Date</label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Real Estate Deal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DEAL */}
      {editingDeal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Deal: {editingDeal.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update value, stage, and close timeline</p>
              </div>
              <button onClick={() => setEditingDeal(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateDeal} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Deal Title</label>
                  <input
                    type="text"
                    required
                    value={editingDeal.title}
                    onChange={e => setEditingDeal({ ...editingDeal, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Deal Value ($)</label>
                  <input
                    type="number"
                    value={editingDeal.amount}
                    onChange={e => setEditingDeal({ ...editingDeal, amount: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Commission Rate</label>
                  <input
                    type="text"
                    value={editingDeal.commissionRate || '2.5%'}
                    onChange={e => setEditingDeal({ ...editingDeal, commissionRate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Stage</label>
                  <select
                    value={editingDeal.stage}
                    onChange={e => setEditingDeal({ ...editingDeal, stage: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Closing Date</label>
                  <input
                    type="date"
                    value={editingDeal.expectedCloseDate}
                    onChange={e => setEditingDeal({ ...editingDeal, expectedCloseDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setEditingDeal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!dealToDelete}
        title="Delete Deal"
        message={`Are you sure you want to permanently delete "${dealToDelete?.title}"?`}
        confirmText="Delete Deal"
        danger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDealToDelete(null)}
      />
    </>
  );
}
