'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { formatINR } from '@/lib/formatters';
import {
  WhatsAppIcon,
  DownloadIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  BriefcaseIcon,
  UsersIcon,
  BuildingIcon
} from '@/components/icons/NavIcons';

export interface Invoice {
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
  clientPhone?: string;
  clientEmail?: string;
}

const INVOICE_STATUSES = ['Pending', 'Paid', 'Overdue', 'Cancelled'];

const initialForm = {
  number: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  dealRef: '',
  amount: '',
  taxRate: '18',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
  status: 'Pending',
  notes: 'Brokerage advisory fees payable upon formal title verification and registration.'
};

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [form, setForm] = useState(initialForm);

  // Agency branding for Tax Invoices
  const [agencyInfo, setAgencyInfo] = useState<{ name: string; phone?: string; whatsapp?: string }>({
    name: 'AgentLadders Realty'
  });

  // CRM deals & clients for auto-completion
  const [crmDeals, setCrmDeals] = useState<{ id: string; title: string; clientName?: string; amount?: number }[]>([]);
  const [crmClients, setCrmClients] = useState<{ name: string; phone?: string; email?: string }[]>([]);

  // Delete modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

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

  const loadMeta = () => {
    Promise.all([
      fetch('/api/settings').then(r => r.json()).catch(() => ({})),
      fetch('/api/deals').then(r => r.json()).catch(() => ({})),
      fetch('/api/clients').then(r => r.json()).catch(() => ({}))
    ]).then(([settingsRes, dealsRes, clientsRes]) => {
      if (settingsRes.agency?.name) {
        setAgencyInfo({
          name: settingsRes.agency.name,
          phone: settingsRes.agency.phone,
          whatsapp: settingsRes.agency.whatsapp
        });
      }
      if (dealsRes.deals) setCrmDeals(dealsRes.deals);
      if (clientsRes.clients) setCrmClients(clientsRes.clients);
    }).catch(() => {});
  };

  useEffect(() => {
    loadInvoices();
    loadMeta();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (editingInvoice) setEditingInvoice(null);
        if (selectedInvoiceForPrint) setSelectedInvoiceForPrint(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, editingInvoice, selectedInvoiceForPrint]);

  const handleOpenAdd = () => {
    setEditingInvoice(null);
    setForm({
      ...initialForm,
      number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setShowModal(true);
  };

  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setForm({
      number: inv.number,
      clientName: inv.clientName || '',
      clientPhone: inv.clientPhone || '',
      clientEmail: inv.clientEmail || '',
      dealRef: inv.dealRef || '',
      amount: inv.amount?.toString() || '',
      taxRate: inv.taxRate?.toString() || '18',
      issueDate: inv.issueDate || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate || new Date().toISOString().split('T')[0],
      status: inv.status || 'Pending',
      notes: inv.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingInvoice ? 'PUT' : 'POST';
    const payload = {
      ...(editingInvoice ? { id: editingInvoice.id } : {}),
      ...form,
      amount: form.amount ? Number(form.amount) : 0,
      taxRate: form.taxRate ? Number(form.taxRate) : 18
    };

    try {
      const res = await fetch('/api/invoices', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingInvoice(null);
        setForm(initialForm);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: editingInvoice ? 'Invoice Updated' : 'Invoice Issued',
          message: `Invoice #${form.number} recorded successfully.`
        });
        loadInvoices();
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ id: Date.now().toString(), type: 'error', title: 'Save Failed', message: err.error || 'Failed to save invoice.' });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Could not connect to invoice server.' });
    }
  };

  const handleTogglePaid = async (inv: Invoice) => {
    const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
    setData(prev => prev.map(i => i.id === inv.id ? { ...i, status: nextStatus } : i));
    try {
      await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inv.id, status: nextStatus })
      });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Status Updated',
        message: `Invoice #${inv.number} marked as ${nextStatus}.`
      });
    } catch {
      loadInvoices();
    }
  };

  const handleWhatsAppReminder = (inv: Invoice) => {
    const phone = inv.clientPhone ? inv.clientPhone.replace(/[^0-9]/g, '') : '';
    const phoneTarget = phone ? (phone.startsWith('91') ? phone : `91${phone}`) : '';
    const msg = `Dear ${inv.clientName},\n\nGreetings from ${agencyInfo.name}!\n\nThis is a friendly update regarding your Tax Invoice *#${inv.number}* for real estate advisory services:\n\n• Amount Payable: *${formatINR(inv.amount)}*\n• Deal Reference: *${inv.dealRef || 'Property Advisory Mandate'}*\n• Due Date: *${inv.dueDate}*\n• Status: *${inv.status.toUpperCase()}*\n\nPlease transfer via NEFT/RTGS or UPI to the agency current account. Thank you!`;
    const url = phoneTarget ? `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleDelete = (id: string, number: string) => {
    setInvoiceToDelete({ id, number });
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/invoices?id=${invoiceToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(i => i.id !== invoiceToDelete.id));
        setToast({ id: Date.now().toString(), type: 'success', title: 'Invoice Removed', message: `Invoice #${invoiceToDelete.number} deleted.` });
      } else {
        setToast({ id: Date.now().toString(), type: 'error', title: 'Delete Failed', message: 'Could not delete invoice.' });
      }
    } catch {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Network Error', message: 'Failed to communicate with invoice server.' });
    } finally {
      setIsDeleting(false);
      setInvoiceToDelete(null);
    }
  };

  // Financial summary metrics
  const stats = useMemo(() => {
    const totalBilled = data.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const paidInvoices = data.filter(i => i.status === 'Paid');
    const totalCollected = paidInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const pendingInvoices = data.filter(i => i.status === 'Pending');
    const totalPending = pendingInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const overdueCount = data.filter(i => i.status === 'Overdue').length;

    return {
      totalBilled,
      totalCollected,
      totalPending,
      overdueCount,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(inv => {
      const matchesSearch =
        !searchQuery.trim() ||
        inv.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.dealRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return (a.issueDate || a.id || '').localeCompare(b.issueDate || b.id || '');
      } else if (sortBy === 'amount_desc') {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      } else if (sortBy === 'amount_asc') {
        return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (sortBy === 'client_asc') {
        return (a.clientName || '').localeCompare(b.clientName || '');
      } else if (sortBy === 'due_date_asc') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'due_date_desc') {
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      }
      // default: newest
      return (b.issueDate || b.id || '').localeCompare(a.issueDate || a.id || '');
    });
  }, [data, searchQuery, statusFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortBy('newest');
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      label: 'Invoice #',
      render: (r) => (
        <span
          onClick={() => setSelectedInvoiceForPrint(r)}
          style={{ fontWeight: 700, color: '#059669', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          title="Click to view full Tax Invoice"
        >
          <span>🧾</span>
          <span style={{ textDecoration: 'underline' }}>{r.number}</span>
        </span>
      )
    },
    {
      key: 'clientName',
      label: 'Client / Billed To',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.clientName}</div>
          {r.dealRef && (
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 2 }}>
              Deal: <strong style={{ color: '#334155' }}>{r.dealRef}</strong>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount (INR)',
      render: (r) => (
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
          {formatINR(r.amount)}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (r) => (
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          {r.dueDate}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Toggle Paid / Pending */}
          <button
            type="button"
            onClick={() => handleTogglePaid(r)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: r.status === 'Paid' ? '#eff6ff' : '#f0fdf4',
              border: `1px solid ${r.status === 'Paid' ? '#bfdbfe' : '#bbf7d0'}`,
              borderRadius: 6,
              cursor: 'pointer',
              color: r.status === 'Paid' ? '#1d4ed8' : '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title={r.status === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}
          >
            {r.status === 'Paid' ? 'Mark Pending' : '✓ Mark Paid'}
          </button>

          {/* WhatsApp Reminder */}
          <button
            type="button"
            onClick={() => handleWhatsAppReminder(r)}
            style={{
              padding: '6px 9px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #bbf7d0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Send WhatsApp Invoice Reminder"
          >
            <WhatsAppIcon size={14} color="#059669" />
          </button>

          {/* View / Print Tax Invoice */}
          <button
            type="button"
            onClick={() => setSelectedInvoiceForPrint(r)}
            style={{
              padding: '6px 9px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="View & Print Official Tax Invoice"
          >
            🖨️
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => handleOpenEdit(r)}
            style={{
              padding: '6px 9px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#334155'
            }}
            title="Edit Invoice"
          >
            <EditIcon size={13} color="#475569" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(r.id, r.number)}
            style={{
              padding: '6px 9px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#dc2626'
            }}
            title="Delete Invoice"
          >
            <TrashIcon size={13} color="#dc2626" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary, #059669)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Loading invoices and receivables...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-page-container animate-enter" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Header */}
        <PageHeader
          title="Invoices &amp; Accounts Receivable"
          subtitle="Generate RERA-compliant GST commission invoices, send WhatsApp reminders, and track client billing"
          actions={
            <Button variant="primary" onClick={handleOpenAdd}>
              + Create Invoice
            </Button>
          }
        />

        {/* Financial Stat Cards */}
        <div className="dashboard-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Total Invoiced</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{formatINR(stats.totalBilled)}</div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>Across {data.length} total billings</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>Total Collected (Paid)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{formatINR(stats.totalCollected)}</div>
            <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginTop: 3 }}>{stats.paidCount} cleared remittances</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 }}>Accounts Receivable</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{formatINR(stats.totalPending)}</div>
            <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600, marginTop: 3 }}>{stats.pendingCount} pending payment</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>Overdue Invoices</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{stats.overdueCount} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>invoices</span></div>
            <div style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600, marginTop: 3 }}>Immediate follow-up needed</div>
          </div>
        </div>

        {/* Filter Bar */}
        <TableFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search invoices by invoice #, client, or deal reference..."
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
            },
            {
              key: 'sort',
              label: 'Sort',
              value: sortBy,
              onChange: setSortBy,
              options: [
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
                { label: 'Amount: High to Low', value: 'amount_desc' },
                { label: 'Amount: Low to High', value: 'amount_asc' },
                { label: 'Client Name (A - Z)', value: 'client_asc' },
                { label: 'Due Date: Earliest', value: 'due_date_asc' },
                { label: 'Due Date: Latest', value: 'due_date_desc' }
              ]
            }
          ]}
        />

        {/* Data Table */}
        <div style={{ paddingBottom: 30 }}>
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="No invoices found. Issue your first brokerage commission invoice."
          />
        </div>

      </div>

      {/* CREATE / EDIT INVOICE MODAL */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="responsive-modal animate-enter"
            style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingInvoice ? 'Edit Commission Invoice' : 'Create Tax Invoice'}
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                  Record agency commission, GST rate, and client remittance schedule
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6 }}
              >
                <XIcon size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '22px' }}>
              {/* Row 1: Invoice # and Client Name */}
              <div className="responsive-grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Invoice # *</label>
                  <input
                    required
                    value={form.number}
                    onChange={e => setForm({ ...form, number: e.target.value })}
                    placeholder="e.g. INV-2026-0042"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Client / Company Name *</label>
                  <input
                    required
                    list="client-options"
                    value={form.clientName}
                    onChange={e => {
                      const val = e.target.value;
                      const matched = crmClients.find(c => c.name === val);
                      setForm({
                        ...form,
                        clientName: val,
                        clientPhone: matched?.phone || form.clientPhone,
                        clientEmail: matched?.email || form.clientEmail
                      });
                    }}
                    placeholder="Select or enter client name..."
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                  <datalist id="client-options">
                    {crmClients.map((c, idx) => (
                      <option key={idx} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Row 2: Client Phone & Deal Reference */}
              <div className="responsive-grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Client WhatsApp / Phone</label>
                  <input
                    value={form.clientPhone}
                    onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                    placeholder="e.g. +91 98200 12345"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Deal / Property Reference</label>
                  <input
                    list="deal-options"
                    value={form.dealRef}
                    onChange={e => {
                      const val = e.target.value;
                      const matched = crmDeals.find(d => d.title === val);
                      setForm({
                        ...form,
                        dealRef: val,
                        amount: matched?.amount ? (matched.amount * 0.02).toString() : form.amount,
                        clientName: matched?.clientName || form.clientName
                      });
                    }}
                    placeholder="Select deal to auto-fill..."
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                  <datalist id="deal-options">
                    {crmDeals.map((d, idx) => (
                      <option key={idx} value={d.title} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Row 3: Amount, GST Tax Rate, Status */}
              <div className="responsive-grid-3" style={{ gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Commission Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 150000"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>GST Rate</label>
                  <select
                    value={form.taxRate}
                    onChange={e => setForm({ ...form, taxRate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, backgroundColor: '#ffffff' }}
                  >
                    <option value="18">18% GST (9% CGST + 9% SGST)</option>
                    <option value="5">5% Concessional Rate</option>
                    <option value="0">0% Non-Taxable / Exempt</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Billing Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, backgroundColor: '#ffffff' }}
                  >
                    {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Issue Date & Due Date */}
              <div className="responsive-grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Issue Date *</label>
                  <input
                    required
                    type="date"
                    value={form.issueDate}
                    onChange={e => setForm({ ...form, issueDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Due Date *</label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Payment Terms &amp; Remittance Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Remittance details, bank account, RTGS IFSC..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, resize: 'vertical' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: 'var(--primary, #059669)', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingInvoice ? 'Update Invoice' : 'Issue Tax Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE / OFFICIAL TAX INVOICE PREVIEW MODAL */}
      {selectedInvoiceForPrint && (
        <div
          onClick={() => setSelectedInvoiceForPrint(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="responsive-modal animate-enter print-invoice-container"
            style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth: 680, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
          >
            {/* Top Toolbar */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }} className="hide-on-print">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                Official RERA Tax Invoice #{selectedInvoiceForPrint.number}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleWhatsAppReminder(selectedInvoiceForPrint)}
                  style={{ padding: '6px 12px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <WhatsAppIcon size={14} color="#059669" />
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ padding: '6px 14px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                >
                  <XIcon size={18} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Paper Layout */}
            <div style={{ padding: '32px 36px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'inherit' }}>
              
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: 20, marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <BuildingIcon size={16} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                      {agencyInfo.name}
                    </h2>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Licensed Real Estate Advisory &amp; Brokerage Firm</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>GSTIN: 27AABCA1234F1Z5 • RERA Reg: A51800029384</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', letterSpacing: '-0.5px' }}>
                    TAX INVOICE
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    #{selectedInvoiceForPrint.number}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Status: <strong style={{ color: selectedInvoiceForPrint.status === 'Paid' ? '#059669' : '#d97706' }}>{selectedInvoiceForPrint.status.toUpperCase()}</strong>
                  </div>
                </div>
              </div>

              {/* Billed To / Dates Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Billed To Client:</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{selectedInvoiceForPrint.clientName}</div>
                  {selectedInvoiceForPrint.clientPhone && <div style={{ color: '#475569', marginTop: 2 }}>Phone: {selectedInvoiceForPrint.clientPhone}</div>}
                  {selectedInvoiceForPrint.dealRef && (
                    <div style={{ color: '#059669', fontWeight: 600, marginTop: 4 }}>
                      Transaction: {selectedInvoiceForPrint.dealRef}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Issue Date: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedInvoiceForPrint.issueDate || 'Current'}</strong>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Due Date: </span>
                    <strong style={{ color: '#dc2626' }}>{selectedInvoiceForPrint.dueDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Place of Supply: </span>
                    <strong style={{ color: '#0f172a' }}>Maharashtra (27)</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Description of Service</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>SAC Code</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Taxable Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Real Estate Acquisition &amp; Brokerage Advisory</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Professional agency facilitation services for property transaction</div>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', color: '#64748b' }}>997221</td>
                    <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700 }}>
                      {formatINR(selectedInvoiceForPrint.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice Calculations Summary */}
              {(() => {
                const subtotal = Number(selectedInvoiceForPrint.amount) || 0;
                const taxRate = Number(selectedInvoiceForPrint.taxRate) || 18;
                const cgst = subtotal * (taxRate / 200);
                const sgst = subtotal * (taxRate / 200);
                const totalWithTax = subtotal + cgst + sgst;
                return (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                    <div style={{ width: 280, fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ color: '#64748b' }}>Subtotal (Taxable):</span>
                        <strong style={{ color: '#0f172a' }}>{formatINR(subtotal)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ color: '#64748b' }}>CGST ({taxRate / 2}%):</span>
                        <span>{formatINR(cgst)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ color: '#64748b' }}>SGST ({taxRate / 2}%):</span>
                        <span>{formatINR(sgst)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #0f172a', marginTop: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>Total Amount Payable:</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{formatINR(totalWithTax)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Remittance Instructions */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Remittance &amp; Bank Account Details:</div>
                <div>Account Name: <strong>{agencyInfo.name} Escrow Advisory</strong></div>
                <div>Bank: <strong>HDFC Bank Ltd • Current A/c No: 50200088921102</strong> • IFSC: <strong>HDFC0000128</strong></div>
                <div style={{ marginTop: 4 }}>UPI / QR Remittance ID: <strong>agency.realty@hdfcbank</strong></div>
              </div>

              {/* Signoff */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 11, color: '#64748b' }}>
                <div>Computer generated official electronic invoice. No physical signature required under IT Act 2000.</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>For {agencyInfo.name}</div>
                  <div style={{ marginTop: 28 }}>Authorized Broker Signatory</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Delete Invoice"
        message={
          <span>
            Are you sure you want to permanently delete Invoice <strong>#{invoiceToDelete?.number}</strong>? This action cannot be reversed.
          </span>
        }
        confirmText="Delete Invoice"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setInvoiceToDelete(null)}
      />

      {/* Toast Feedback */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-invoice-container, .print-invoice-container * {
            visibility: visible;
          }
          .print-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .hide-on-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
