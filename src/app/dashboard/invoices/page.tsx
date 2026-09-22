'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Invoice {
  [key: string]: unknown;
  id: string;
  number: string;
  clientName: string;
  amount: number;
  status: string;
  dueDate: string;
  dealRef?: string;
  taxRate?: number;
  issueDate?: string;
  notes?: string;
}

const initialForm = {
  number: '',
  clientName: '',
  dealRef: '',
  amount: '',
  taxRate: '5',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  status: 'Pending',
  notes: ''
};

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const json = await res.json();
      if (json.invoices) setData(json.invoices);
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: form.amount ? Number(form.amount) : 0,
        taxRate: form.taxRate ? Number(form.taxRate) : 0
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadInvoices();
  };

  const handleDelete = (id: string, number: string) => {
    setInvoiceToDelete({ id, number });
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/invoices?id=${invoiceToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(i => i.id !== invoiceToDelete.id));
    }
    setIsDeleting(false);
    setInvoiceToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(inv => {
      const matchesSearch = 
        !searchQuery.trim() ||
        inv.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.dealRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  const columns: Column<Invoice>[] = [
    { 
      key: 'number', 
      label: 'Invoice #',
      render: (r) => (
        <span style={{ fontWeight: 600, color: '#2563eb' }}>
          🧾 {r.number}
        </span>
      )
    },
    { 
      key: 'clientName', 
      label: 'Client / Debtor',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.clientName}</div>
          {r.dealRef && <div style={{ fontSize: '12px', color: '#64748b' }}>Deal: {r.dealRef}</div>}
        </div>
      )
    },
    { 
      key: 'amount', 
      label: 'Invoice Amount', 
      render: (r) => <span style={{ fontWeight: 700, color: '#0f172a' }}>${r.amount.toLocaleString()}</span> 
    },
    { 
      key: 'dueDate', 
      label: 'Due Date',
      render: (r) => (
        <span style={{ fontSize: '13px', color: '#334155' }}>
          📅 {r.dueDate}
        </span>
      )
    },
    { key: 'status', label: 'Billing Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => handleDelete(r.id, r.number)}
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
          title="Delete Invoice"
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Invoices & Billing" 
        subtitle="Manage commission invoices, client billing, and accounts receivable" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Create Invoice</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoices by invoice #, client name, or deal ref..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'status',
            label: 'Billing Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Overdue', value: 'Overdue' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading invoices...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No invoices matched your billing filters"
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
                  🧾 Generate Client Invoice
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Issue professional commission statements and escrow billing
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
                    Invoice Number *
                  </label>
                  <input
                    required
                    value={form.number}
                    onChange={e => setForm({...form, number: e.target.value})}
                    placeholder="e.g. INV-2026-004"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Client / Payer Name *
                  </label>
                  <input
                    required
                    value={form.clientName}
                    onChange={e => setForm({...form, clientName: e.target.value})}
                    placeholder="e.g. Jonathan Reynolds"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Linked Deal Reference
                  </label>
                  <input
                    value={form.dealRef}
                    onChange={e => setForm({...form, dealRef: e.target.value})}
                    placeholder="e.g. DEAL-2026-001 (Marina Penthouse)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Invoice Amount ($) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="e.g. 90000"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Tax Rate (% VAT)
                  </label>
                  <input
                    type="number"
                    value={form.taxRate}
                    onChange={e => setForm({...form, taxRate: e.target.value})}
                    placeholder="5"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Billing Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Pending">Pending (Sent)</option>
                    <option value="Paid">Paid in Full</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={e => setForm({...form, issueDate: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Due Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({...form, dueDate: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Payment Instructions & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Wire instructions: Bank of America, Escrow Account #... Due within 14 days."
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
                <Button type="submit" variant="primary">Save Invoice</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Delete Billing Invoice"
        message={
          <>
            Are you sure you want to delete invoice <strong>&ldquo;{invoiceToDelete?.number}&rdquo;</strong>? 
            This billing record will be removed from your accounts receivable.
          </>
        }
        confirmText="Delete Invoice"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setInvoiceToDelete(null)}
      />
    </>
  );
}
