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
          {r.receiptRef && <div style={{ fontSize: '11px', color: '#64748b' }}>Receipt: {r.receiptRef}</div>}
        </div>
      )
    },
    {
      key: 'vendor',
      label: 'Vendor / Payee',
      render: (r) => <span style={{ fontSize: '13px', color: '#334155' }}>{r.vendor || 'General Overhead'}</span>
    },
    { 
      key: 'amount', 
      label: 'Amount Paid', 
      render: (r) => <span style={{ fontWeight: 700, color: '#dc2626' }}>-${r.amount.toLocaleString()}</span> 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
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
          🗑️ Delete
        </button>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Agency Operating Expenses" 
        subtitle="Track marketing campaigns, portal subscriptions, office overhead, and operational costs" 
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
              { label: 'Marketing', value: 'Marketing' },
              { label: 'Software', value: 'Software' },
              { label: 'Office Overhead', value: 'Office' },
              { label: 'Travel & Viewings', value: 'Travel' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading expenses...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No expenses matched your search"
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
                  💸 Add Operating Expense
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Record agency overhead, portal advertising, and operational costs
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
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Marketing">Portal Marketing & Ads</option>
                    <option value="Software">Software & Subscriptions</option>
                    <option value="Office">Office Overhead & Rent</option>
                    <option value="Travel">Client Travel & Transport</option>
                    <option value="Legal">Legal & Professional Fees</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Expense Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Vendor / Payee *
                  </label>
                  <input
                    required
                    value={form.vendor}
                    onChange={e => setForm({...form, vendor: e.target.value})}
                    placeholder="e.g. Property Finder MENA / AWS Cloud"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Amount Paid ($) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="e.g. 2400"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Expense Description *
                  </label>
                  <input
                    required
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="e.g. Featured Developer Banner Placement & Lead Boost Campaign"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({...form, paymentMethod: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Corporate Card">Agency Corporate Card</option>
                    <option value="Bank Wire">Direct Wire Transfer</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Founder Reimbursement">Founder Reimbursement</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Receipt / Invoice Ref
                  </label>
                  <input
                    value={form.receiptRef}
                    onChange={e => setForm({...form, receiptRef: e.target.value})}
                    placeholder="e.g. RCPT-2026-9810"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={form.taxDeductible}
                      onChange={e => setForm({...form, taxDeductible: e.target.checked})}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Tax Deductible Business Expense (Include in annual corporate tax filings)
                  </label>
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
                <Button type="submit" variant="primary">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        title="Delete Expense Record"
        message={
          <>
            Are you sure you want to delete expense <strong>&ldquo;{expenseToDelete?.description}&rdquo;</strong>? 
            This expenditure entry will be permanently removed from your financial ledger.
          </>
        }
        confirmText="Delete Expense"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </>
  );
}
