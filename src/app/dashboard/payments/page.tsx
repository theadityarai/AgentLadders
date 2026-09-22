'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

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
  const [showModal, setShowModal] = useState(false);
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
    loadPayments();
  }, []);

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
      render: (r) => <span style={{ fontWeight: 700, color: '#16a34a' }}>+${r.amount.toLocaleString()}</span> 
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
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
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
              { label: 'Bank Transfer', value: 'Bank Transfer' },
              { label: 'Credit Card', value: 'Credit Card' },
              { label: 'Wire / Escrow', value: 'Wire / Escrow' },
              { label: 'Cheque', value: 'Cheque' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Failed', value: 'Failed' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading payments...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No payment records matched your criteria"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, #f8fafc, #ffffff)'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  💳 Record Payment Receipt
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Log incoming funds, wire deposits, and credit transactions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Payment Reference # *
                  </label>
                  <input
                    required
                    value={form.reference}
                    onChange={e => setForm({...form, reference: e.target.value})}
                    placeholder="e.g. TXN-984212"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Linked Invoice #
                  </label>
                  <input
                    value={form.invoiceNumber}
                    onChange={e => setForm({...form, invoiceNumber: e.target.value})}
                    placeholder="e.g. INV-2026-001"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Payer / Remitter Name
                  </label>
                  <input
                    value={form.payerName}
                    onChange={e => setForm({...form, payerName: e.target.value})}
                    placeholder="e.g. Elena Rostova / Title Escrow"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Amount Received ($) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="e.g. 50000"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Payment Method
                  </label>
                  <select
                    value={form.method}
                    onChange={e => setForm({...form, method: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Bank Transfer">Bank Transfer (ACH / SEPA)</option>
                    <option value="Wire / Escrow">Federal Wire / Escrow</option>
                    <option value="Credit Card">Credit Card (Stripe)</option>
                    <option value="Cheque">Manager Cheque</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Settlement Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Completed">Completed (Cleared)</option>
                    <option value="Processing">Processing (Pending Clearance)</option>
                    <option value="Failed">Failed / Reversed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Settlement Date
                  </label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={e => setForm({...form, paymentDate: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Escrow & Transaction Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Bank reference notes, escrow clearance verification ID, or receipt remarks..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Delete Payment Record"
        message={
          <>
            Are you sure you want to delete payment receipt <strong>&ldquo;{paymentToDelete?.reference}&rdquo;</strong>? 
            This transaction record will be removed from accounts history.
          </>
        }
        confirmText="Delete Payment"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPaymentToDelete(null)}
      />
    </>
  );
}
