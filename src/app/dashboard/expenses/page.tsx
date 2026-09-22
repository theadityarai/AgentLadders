'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Expense {
  [key: string]: unknown;
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  paymentMethod?: string;
  taxDeductible?: boolean;
  receiptRef?: string;
}

const CATEGORIES = ['Marketing', 'Office & Utilities', 'Travel & Transport', 'Legal & Compliance', 'Software & IT', 'Entertaining & Events'];
const PAYMENT_METHODS = ['Corporate Card', 'Bank Wire Transfer', 'Cheque', 'Petty Cash'];

const initialForm = {
  category: 'Marketing',
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  vendor: '',
  paymentMethod: 'Corporate Card',
  taxDeductible: true,
  receiptRef: ''
};

export default function ExpensesPage() {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; description: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      const json = await res.json();
      if (json.expenses) setData(json.expenses);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: form.amount ? Number(form.amount) : 0
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadExpenses();
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const res = await fetch('/api/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingExpense)
    });
    if (res.ok) {
      const json = await res.json();
      setData(prev => prev.map(e => e.id === editingExpense.id ? json.expense : e));
      setEditingExpense(null);
    }
  };

  const handleDownloadVoucher = (exp: Expense) => {
    const content = 
      `=================================================================\n` +
      `             AGENTLADDERS OFFICIAL EXPENSE VOUCHER               \n` +
      `=================================================================\n` +
      `Voucher ID:    ${exp.id}\n` +
      `Receipt Ref:   ${exp.receiptRef || 'RCPT-' + exp.id.slice(-6).toUpperCase()}\n` +
      `Date:          ${exp.date}\n` +
      `Category:      ${exp.category}\n` +
      `Description:   ${exp.description}\n` +
      `Vendor:        ${exp.vendor || 'Authorized Supplier'}\n` +
      `Payment Mode:  ${exp.paymentMethod || 'Corporate Card'}\n` +
      `Tax Eligible:  ${exp.taxDeductible ? 'YES (VAT Deductible)' : 'NO'}\n` +
      `-----------------------------------------------------------------\n` +
      `TOTAL CHARGED: $${exp.amount.toLocaleString()}\n` +
      `=================================================================\n` +
      `Approved by Agency Finance & Auditing Controller\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expense_Voucher_${exp.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string, description: string) => {
    setExpenseToDelete({ id, description });
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/expenses?id=${expenseToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(e => e.id !== expenseToDelete.id));
    }
    setIsDeleting(false);
    setExpenseToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(exp => {
      const matchesSearch = 
        !searchQuery.trim() ||
        exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [data, searchQuery, categoryFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
  };

  const columns: Column<Expense>[] = [
    { 
      key: 'date', 
      label: 'Date',
      render: (r) => (
        <span style={{ fontWeight: 500, color: '#64748b' }}>
          📅 {r.date}
        </span>
      )
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155' }}>
          {r.category}
        </span>
      )
    },
    { 
      key: 'description', 
      label: 'Description & Receipt',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.description}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {r.vendor && <span>🏢 {r.vendor} &middot; </span>}
            Receipt: {r.receiptRef || 'Verified'}
          </div>
        </div>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      render: (r) => <span style={{ fontWeight: 700, color: '#e11d48' }}>-${r.amount.toLocaleString()}</span> 
    },
    {
      key: 'paymentMethod',
      label: 'Paid Via',
      render: (r) => (
        <span style={{ fontSize: '12px', color: '#475569' }}>
          💳 {r.paymentMethod || 'Corporate Card'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleDownloadVoucher(r)}
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
            title="Download Voucher"
          >
            🧾 Voucher
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
            title="Edit Expense"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(r.id, r.description)}
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
            title="Delete Expense"
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
        title="Operating Expenses" 
        subtitle="Track marketing spend, portal fees, office operations, and company expenditures" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Add Expense</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search expenses by description, vendor, or category..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'All' },
              ...CATEGORIES.map(c => ({ label: c, value: c }))
            ]
          }
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* CREATE EXPENSE MODAL */}
      {showModal && (
        <div style={{
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
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '540px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Record Operating Expense</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Expense Description *</label>
                <input
                  required
                  placeholder="e.g. Property Finder Premier Syndication Tier"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Amount ($) *</label>
                  <input
                    required
                    type="number"
                    placeholder="3400"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Vendor / Payee</label>
                  <input
                    placeholder="e.g. Property Finder Group"
                    value={form.vendor}
                    onChange={e => setForm({ ...form, vendor: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Receipt Reference #</label>
                  <input
                    placeholder="RCPT-883492"
                    value={form.receiptRef}
                    onChange={e => setForm({ ...form, receiptRef: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Record Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXPENSE MODAL */}
      {editingExpense && (
        <div style={{
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
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '540px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Edit Expense: {editingExpense.description}</h3>
            <form onSubmit={handleUpdateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Expense Description *</label>
                <input
                  required
                  value={editingExpense.description || ''}
                  onChange={e => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={editingExpense.category}
                    onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Amount ($) *</label>
                  <input
                    required
                    type="number"
                    value={editingExpense.amount || ''}
                    onChange={e => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Vendor / Payee</label>
                  <input
                    value={editingExpense.vendor || ''}
                    onChange={e => setEditingExpense({ ...editingExpense, vendor: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Date *</label>
                  <input
                    required
                    type="date"
                    value={editingExpense.date || ''}
                    onChange={e => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Payment Method</label>
                  <select
                    value={editingExpense.paymentMethod || 'Corporate Card'}
                    onChange={e => setEditingExpense({ ...editingExpense, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Receipt Reference #</label>
                  <input
                    value={editingExpense.receiptRef || ''}
                    onChange={e => setEditingExpense({ ...editingExpense, receiptRef: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setEditingExpense(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        title="Delete Expense"
        message={
          <>
            Are you sure you want to delete expense record <strong>&ldquo;{expenseToDelete?.description}&rdquo;</strong>?
            This will remove the transaction from accounting reports.
          </>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Expense'}
        cancelText="Cancel"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </>
  );
}
