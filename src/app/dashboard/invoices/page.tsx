'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatINR } from '@/lib/formatters';

interface Invoice {
  [key: string]: unknown;
  id: string;
  number: string;
  clientName: string;
  amount: number;
  status: string;
  dueDate: string;
  dealRef?: string;
  taxRate?: number | string;
  issueDate?: string;
  notes?: string;
}

const INVOICE_STATUSES = ['Pending', 'Paid', 'Overdue', 'Cancelled'];

const initialForm = {
  number: '',
  clientName: '',
  dealRef: '',
  amount: '',
  taxRate: '5',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
  status: 'Pending',
  notes: ''
};

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (editingInvoice) setEditingInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, editingInvoice]);

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

  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    const res = await fetch('/api/invoices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingInvoice)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(i => i.id === editingInvoice.id ? json.invoice : i));
      setEditingInvoice(null);
    }
  };

  const handleTogglePaid = async (inv: Invoice) => {
    const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
    setData(prev => prev.map(i => i.id === inv.id ? { ...i, status: nextStatus } : i));
    await fetch('/api/invoices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inv.id, status: nextStatus })
    });
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    const content = 
      `=================================================================\n` +
      `                   AGENTLADDERS OFFICIAL TAX INVOICE             \n` +
      `=================================================================\n` +
      `Invoice #: ${inv.number}\n` +
      `Issue Date: ${inv.issueDate || 'N/A'}\n` +
      `Due Date:   ${inv.dueDate}\n` +
      `Status:     ${inv.status.toUpperCase()}\n` +
      `-----------------------------------------------------------------\n` +
      `BILL TO:\n` +
      `Client Name: ${inv.clientName}\n` +
      `Deal Reference: ${inv.dealRef || 'Real Estate Brokerage Service'}\n` +
      `-----------------------------------------------------------------\n` +
      `DESCRIPTION                                               AMOUNT\n` +
      `-----------------------------------------------------------------\n` +
      `Agency Brokerage / Advisory Commission             ₹${inv.amount.toLocaleString('en-IN')}\n` +
      `GST Compliance: 18% Applicable\n` +
      `-----------------------------------------------------------------\n` +
      `TOTAL PAYABLE:                                     ₹${inv.amount.toLocaleString('en-IN')}\n` +
      `=================================================================\n` +
      `Notes: ${inv.notes || 'Payment due strictly upon invoice receipt. Thank you for your business.'}\n` +
      `Remittance: RTGS / NEFT / UPI to Agency Real Estate Current Account\n` +
      `=================================================================\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${inv.number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      render: (r) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(r.amount)}</span> 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleTogglePaid(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: r.status === 'Paid' ? '#eff6ff' : '#f0fdf4',
              border: `1px solid ${r.status === 'Paid' ? '#bfdbfe' : '#bbf7d0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              color: r.status === 'Paid' ? '#1d4ed8' : '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={r.status === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}
          >
            {r.status === 'Paid' ? '↩ Reopen' : '✓ Mark Paid'}
          </button>
          <button
            onClick={() => handleDownloadInvoice(r)}
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
            title="Download Tax Invoice"
          >
            📥 PDF
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
            title="Edit Invoice"
          >
            ✏️
          </button>
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
            🗑️
          </button>
        </div>
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
              ...INVOICE_STATUSES.map(s => ({ label: s, value: s }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE INVOICE MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} className="responsive-modal" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Create New Invoice</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Invoice # *</label>
                  <input
                    required
                    placeholder="INV-2026-001"
                    value={form.number}
                    onChange={e => setForm({ ...form, number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Billing Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Client / Payee *</label>
                  <input
                    required
                    placeholder="e.g. Acme Holdings Ltd"
                    value={form.clientName}
                    onChange={e => setForm({ ...form, clientName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Deal Reference</label>
                  <input
                    placeholder="e.g. Marina Penthouse Closing"
                    value={form.dealRef}
                    onChange={e => setForm({ ...form, dealRef: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Invoice Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="450000"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Due Date *</label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Instructions & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Wire transfer instructions, escrow details..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Invoice</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div onClick={() => setEditingInvoice(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} className="responsive-modal" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Invoice: {editingInvoice.number}</h3>
            <form onSubmit={handleUpdateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Invoice # *</label>
                  <input
                    required
                    value={editingInvoice.number || ''}
                    onChange={e => setEditingInvoice({ ...editingInvoice, number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Billing Status</label>
                  <select
                    value={editingInvoice.status}
                    onChange={e => setEditingInvoice({ ...editingInvoice, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Client / Payee *</label>
                  <input
                    required
                    value={editingInvoice.clientName || ''}
                    onChange={e => setEditingInvoice({ ...editingInvoice, clientName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Deal Reference</label>
                  <input
                    value={editingInvoice.dealRef || ''}
                    onChange={e => setEditingInvoice({ ...editingInvoice, dealRef: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Invoice Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    value={editingInvoice.amount || ''}
                    onChange={e => setEditingInvoice({ ...editingInvoice, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Due Date *</label>
                  <input
                    required
                    type="date"
                    value={editingInvoice.dueDate || ''}
                    onChange={e => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Instructions & Notes</label>
                <textarea
                  rows={3}
                  value={editingInvoice.notes || ''}
                  onChange={e => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingInvoice(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Delete Invoice"
        message={
          <>
            Are you sure you want to delete invoice <strong>&ldquo;{invoiceToDelete?.number}&rdquo;</strong>?
            This will permanently remove the invoice from billing records.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Invoice'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setInvoiceToDelete(null)}
      />
    </>
  );
}
