'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DEFAULT_PAYMENT_STATUSES } from '@/lib/formatters';

interface Payment {
  [key: string]: unknown;
  id: string;
  reference: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  status: string;
  paymentDate?: string;
  payerName?: string;
  notes?: string;
}

const METHODS = ['Bank Transfer', 'Corporate Cheque', 'Escrow Account', 'Card Payment'];

const initialForm = {
  reference: '',
  invoiceNumber: '',
  payerName: '',
  amount: '',
  method: 'Bank Transfer',
  status: 'Completed',
  paymentDate: new Date().toISOString().split('T')[0],
  notes: ''
};

export default function PaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>(DEFAULT_PAYMENT_STATUSES);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; reference: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const json = await res.json();
      if (json.payments) setData(json.payments);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('agentladders_agency_configs');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.paymentStatuses) && parsed.paymentStatuses.length > 0) {
            setPaymentStatuses(parsed.paymentStatuses);
          }
        }
      } catch {}
    }
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d?.agency?.paymentStatuses && Array.isArray(d.agency.paymentStatuses) && d.agency.paymentStatuses.length > 0) {
          setPaymentStatuses(d.agency.paymentStatuses);
        }
      })
      .catch(() => {});

    loadPayments();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (editingPayment) setEditingPayment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, editingPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: form.amount ? Number(form.amount) : 0
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadPayments();
  };

  const handleOpenEdit = (pay: Payment) => {
    setEditingPayment(pay);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    const res = await fetch('/api/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingPayment)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(p => p.id === editingPayment.id ? json.payment : p));
      setEditingPayment(null);
    }
  };

  const handleDownloadReceipt = (pay: Payment) => {
    const content = 
      `=================================================================\n` +
      `             AGENTLADDERS OFFICIAL PAYMENT RECEIPT               \n` +
      `=================================================================\n` +
      `Receipt Ref:     ${pay.reference}\n` +
      `Linked Invoice:  ${pay.invoiceNumber || 'DIRECT-REMITTANCE'}\n` +
      `Payment Date:    ${pay.paymentDate || 'N/A'}\n` +
      `Payer Name:      ${pay.payerName || 'Client Settlement'}\n` +
      `Payment Method:  ${pay.method}\n` +
      `Status:          ${pay.status.toUpperCase()}\n` +
      `-----------------------------------------------------------------\n` +
      `AMOUNT RECEIVED: ₹${pay.amount.toLocaleString('en-IN')}\n` +
      `=================================================================\n` +
      `Official receipt generated by AgentLadders India Treasury Engine\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${pay.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string, reference: string) => {
    setPaymentToDelete({ id, reference });
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/payments?id=${paymentToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(p => p.id !== paymentToDelete.id));
    }
    setIsDeleting(false);
    setPaymentToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(pay => {
      const matchesSearch = 
        !searchQuery.trim() ||
        pay.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.payerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMethod = methodFilter === 'All' || pay.method === methodFilter;
      const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [data, searchQuery, methodFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setMethodFilter('All');
    setStatusFilter('All');
  };

  const columns: Column<Payment>[] = [
    { 
      key: 'reference', 
      label: 'Payment Ref',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          💳 {r.reference}
        </span>
      )
    },
    { 
      key: 'invoiceNumber', 
      label: 'Linked Invoice',
      render: (r) => (
        <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 500 }}>
          {r.invoiceNumber || 'Direct Payment'}
        </span>
      )
    },
    {
      key: 'payerName',
      label: 'Payer / Account',
      render: (r) => <span style={{ fontWeight: 500, color: '#334155' }}>{r.payerName || 'Client Settlement'}</span>
    },
    { 
      key: 'amount', 
      label: 'Amount Paid', 
      render: (r) => <span style={{ fontWeight: 700, color: '#16a34a' }}>+₹{r.amount.toLocaleString('en-IN')}</span> 
    },
    { 
      key: 'method', 
      label: 'Payment Method',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#334155' }}>
          {r.method}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleDownloadReceipt(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Download Payment Receipt"
          >
            📥 Receipt
          </button>
          <button
            onClick={() => handleOpenEdit(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#1d4ed8'
            }}
            title="Edit Payment"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(r.id, r.reference)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e11d48'
            }}
            title="Delete Payment"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <PageHeader 
        title="Payment Transactions" 
        subtitle="Track incoming client remittances, escrow releases, and banking receipts" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Record Payment</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search payments by reference, payer, or invoice #..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'method',
            label: 'Method',
            value: methodFilter,
            onChange: setMethodFilter,
            options: [
              { label: 'All Methods', value: 'All' },
              ...METHODS.map(m => ({ label: m, value: m }))
            ]
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...paymentStatuses.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      {/* DESKTOP TABLE VIEW */}
      <div className="desktop-only-table" style={{ paddingBottom: '24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* MOBILE ONLY CARDS VIEW */}
      <div className="mobile-only-cards" style={{ paddingBottom: '24px' }}>
        {filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            No payments found matching the selected criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredData.map(pay => (
              <div
                key={pay.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.5px' }}>
                      {pay.reference}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                      {pay.payerName || 'Direct Remittance'}
                    </h4>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={pay.status} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                    ₹{pay.amount.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    📅 {pay.paymentDate || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 500,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb'
                  }}>
                    🏦 {pay.method}
                  </span>
                  {pay.invoiceNumber && (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569'
                    }}>
                      🧾 {pay.invoiceNumber}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 44px', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(pay)}
                    style={{
                      padding: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    📥 Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pay)}
                    style={{
                      padding: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pay.id, pay.reference)}
                    style={{
                      padding: '8px',
                      fontSize: '13px',
                      backgroundColor: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '8px',
                      color: '#e11d48',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete Payment"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PAYMENT MODAL */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="responsive-modal-overlay"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Record Incoming Payment</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Acknowledge client remittance or escrow release</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="responsive-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Reference # *</label>
                    <input
                      required
                      placeholder="TXN-498201"
                      value={form.reference}
                      onChange={e => setForm({ ...form, reference: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Linked Invoice #</label>
                    <input
                      placeholder="INV-2026-001"
                      value={form.invoiceNumber}
                      onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Amount (₹) *</label>
                    <input
                      required
                      type="number"
                      placeholder="250000"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payer / Client Name *</label>
                    <input
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={form.payerName}
                      onChange={e => setForm({ ...form, payerName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Method</label>
                    <select
                      value={form.method}
                      onChange={e => setForm({ ...form, method: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Clearance Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Date *</label>
                  <input
                    required
                    type="date"
                    value={form.paymentDate}
                    onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="responsive-modal-footer form-sticky-footer">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Record Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
      {editingPayment && (
        <div 
          onClick={() => setEditingPayment(null)}
          className="responsive-modal-overlay"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="responsive-modal"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Edit Payment: {editingPayment.reference}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Modify amount, clearance, or linked invoice</p>
              </div>
              <button onClick={() => setEditingPayment(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdatePayment} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="responsive-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Reference # *</label>
                    <input
                      required
                      value={editingPayment.reference || ''}
                      onChange={e => setEditingPayment({ ...editingPayment, reference: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Linked Invoice #</label>
                    <input
                      value={editingPayment.invoiceNumber || ''}
                      onChange={e => setEditingPayment({ ...editingPayment, invoiceNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Amount (₹) *</label>
                    <input
                      required
                      type="number"
                      value={editingPayment.amount || ''}
                      onChange={e => setEditingPayment({ ...editingPayment, amount: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payer Name *</label>
                    <input
                      required
                      value={editingPayment.payerName || ''}
                      onChange={e => setEditingPayment({ ...editingPayment, payerName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Method</label>
                    <select
                      value={editingPayment.method}
                      onChange={e => setEditingPayment({ ...editingPayment, method: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Clearance Status</label>
                    <select
                      value={editingPayment.status}
                      onChange={e => setEditingPayment({ ...editingPayment, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="responsive-modal-footer form-sticky-footer">
                <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Delete Payment Record"
        message={
          <>
            Are you sure you want to delete payment reference <strong>&ldquo;{paymentToDelete?.reference}&rdquo;</strong>?
            This will permanently remove the remittance record.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Payment'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
}
