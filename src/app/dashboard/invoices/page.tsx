'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getStatusColorStyle } from '@/lib/theme';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { 
  formatINR, 
  formatINRFull, 
  numberToIndianWords, 
  DEFAULT_INVOICE_SETTINGS, 
  DEFAULT_INVOICE_STATUSES,
  AgencyInvoiceSettings 
} from '@/lib/formatters';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { MultiPropertySelector } from '@/components/ui/MultiPropertySelector';
import { ShareModal } from '@/components/ui/ShareModal';
import { isValid10DigitPhone, extract10DigitPhone } from '@/lib/phone-validation';
import {
  WhatsAppIcon,
  DownloadIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  BriefcaseIcon,
  UsersIcon,
  BuildingIcon,
  MailIcon,
  PrinterIcon,
  CopyIcon,
  ShareIcon,
  ExternalLinkIcon,
  CalendarIcon,
  RotateCcwIcon,
  PlusIcon
} from '@/components/icons/NavIcons';

export interface InvoiceItem {
  id: string;
  description: string;
  sacCode: string;
  amount: number;
}

export interface Invoice {
  [key: string]: unknown;
  id: string;
  number: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGstin?: string;
  dealRef?: string;
  items?: InvoiceItem[];
  amount: number; // Subtotal (Taxable Value)
  totalAmount?: number; // Total with Tax
  taxType?: 'intra' | 'inter' | 'exempt';
  taxRate?: number | string;
  issueDate?: string;
  dueDate: string;
  status: string;
  notes?: string;
  paymentDetails?: {
    paidAt?: string;
    paymentMode?: string;
    transactionRef?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const COMMON_SAC_CODES = [
  { code: '997221', label: '997221 - Real Estate Brokerage / Advisory on a Fee or Contract Basis' },
  { code: '998213', label: '998213 - Legal Documentation, Title Verification & ATS Stamping Facilitation' },
  { code: '998311', label: '998311 - Management & Real Estate Strategic Advisory' },
  { code: '997212', label: '997212 - Rental Property Leasing / Tenancy Brokerage Service' }
];

const DEFAULT_LINE_ITEM = () => ({
  id: 'item_' + Math.random().toString(36).substring(2, 8),
  description: 'Real Estate Acquisition & Brokerage Advisory Mandate',
  sacCode: '997221',
  amount: ''
});

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${rand}`;
};

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceStatuses, setInvoiceStatuses] = useState<string[]>(DEFAULT_INVOICE_STATUSES);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
  // Modals for Preview, Share, and Delete
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [sharingInvoice, setSharingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form State
  const [form, setForm] = useState({
    number: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    clientGstin: '',
    dealRef: '',
    items: [DEFAULT_LINE_ITEM()],
    taxType: 'intra' as 'intra' | 'inter' | 'exempt',
    taxRate: '18',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    status: 'Pending',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'NEFT / RTGS',
    paymentRef: ''
  });

  // Commission Calculator Helper within Form
  const [calcBasePrice, setCalcBasePrice] = useState('');
  const [calcPercentage, setCalcPercentage] = useState('2');

  // Agency branding & invoice configuration
  const [agencyInfo, setAgencyInfo] = useState<{ name: string; phone?: string; whatsapp?: string }>({
    name: 'Vance Luxury Realty'
  });
  const [invoiceSettings, setInvoiceSettings] = useState<AgencyInvoiceSettings>(DEFAULT_INVOICE_SETTINGS);

  // CRM autocomplete datasets
  const [crmDeals, setCrmDeals] = useState<{ id: string; title: string; clientName?: string; amount?: number }[]>([]);
  const [crmClients, setCrmClients] = useState<{ name: string; phone?: string; email?: string; address?: string; gstin?: string }[]>([]);
  const [crmProperties, setCrmProperties] = useState<{ id: string; title: string; locality?: string; city?: string; bhk?: string; price?: number; purpose?: string }[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

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
      fetch('/api/clients').then(r => r.json()).catch(() => ({})),
      fetch('/api/properties').then(r => r.json()).catch(() => ({}))
    ]).then(([settingsRes, dealsRes, clientsRes, propsRes]) => {
      if (settingsRes.agency?.invoiceSettings) {
        setInvoiceSettings(settingsRes.agency.invoiceSettings);
      } else if (settingsRes.agency?.name) {
        setInvoiceSettings(prev => ({
          ...prev,
          agencyName: settingsRes.agency.name,
          accountName: `${settingsRes.agency.name} Escrow Advisory`
        }));
      }
      if (settingsRes.agency?.invoiceStatuses && Array.isArray(settingsRes.agency.invoiceStatuses) && settingsRes.agency.invoiceStatuses.length > 0) {
        setInvoiceStatuses(settingsRes.agency.invoiceStatuses);
      }
      if (settingsRes.agency?.name) {
        setAgencyInfo({
          name: settingsRes.agency.name,
          phone: settingsRes.agency.phone,
          whatsapp: settingsRes.agency.whatsapp
        });
      }
      if (dealsRes.deals) setCrmDeals(dealsRes.deals);
      if (clientsRes.clients) setCrmClients(clientsRes.clients);
      if (propsRes.properties) setCrmProperties(propsRes.properties);
    }).catch(() => {});
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('agentladders_agency_configs');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.invoiceStatuses) && parsed.invoiceStatuses.length > 0) {
            setInvoiceStatuses(parsed.invoiceStatuses);
          }
        }
      } catch {}
    }
    loadInvoices();
    loadMeta();
  }, []);

  // Keyboard escape listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (editingInvoice) setEditingInvoice(null);
        if (selectedInvoiceForPrint) setSelectedInvoiceForPrint(null);
        if (sharingInvoice) setSharingInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, editingInvoice, selectedInvoiceForPrint, sharingInvoice]);

  // Form Live Calculations
  const formCalculations = useMemo(() => {
    const subtotal = form.items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);
    const taxRate = parseFloat(form.taxRate) || 0;
    const isInter = form.taxType === 'inter';
    const isExempt = form.taxType === 'exempt';

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (!isExempt) {
      if (isInter) {
        igst = subtotal * (taxRate / 100);
      } else {
        cgst = subtotal * (taxRate / 200);
        sgst = subtotal * (taxRate / 200);
      }
    }

    const totalTax = cgst + sgst + igst;
    const totalAmount = Math.round(subtotal + totalTax);

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount,
      inWords: numberToIndianWords(totalAmount)
    };
  }, [form.items, form.taxRate, form.taxType]);

  const handleOpenAdd = () => {
    setEditingInvoice(null);
    setForm({
      number: generateInvoiceNumber(),
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      clientGstin: '',
      dealRef: '',
      items: [DEFAULT_LINE_ITEM()],
      taxType: 'intra',
      taxRate: '18',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      status: 'Pending',
      notes: invoiceSettings.defaultNotes || 'Brokerage advisory fees payable upon formal title verification and registration.',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'NEFT / RTGS',
      paymentRef: ''
    });
    setSelectedProperties([]);
    setCalcBasePrice('');
    setCalcPercentage('2');
    setShowModal(true);
  };

  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    
    // Normalize line items
    let existingItems = (inv.items && inv.items.length > 0)
      ? inv.items.map(it => ({
          id: it.id || ('item_' + Math.random().toString(36).substring(2, 8)),
          description: it.description || 'Real Estate Advisory Service',
          sacCode: it.sacCode || invoiceSettings.sacCode || '997221',
          amount: it.amount?.toString() || ''
        }))
      : [{
          id: 'item_1',
          description: inv.dealRef ? `Brokerage Commission - ${inv.dealRef}` : 'Real Estate Acquisition & Brokerage Advisory',
          sacCode: invoiceSettings.sacCode || '997221',
          amount: inv.amount?.toString() || '0'
        }];

    setForm({
      number: inv.number,
      clientName: inv.clientName || '',
      clientPhone: inv.clientPhone || '',
      clientEmail: inv.clientEmail || '',
      clientAddress: inv.clientAddress || '',
      clientGstin: inv.clientGstin || '',
      dealRef: inv.dealRef || '',
      items: existingItems,
      taxType: (inv.taxType as any) || 'intra',
      taxRate: inv.taxRate?.toString() || '18',
      issueDate: inv.issueDate || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate || new Date().toISOString().split('T')[0],
      status: inv.status || 'Pending',
      notes: inv.notes || invoiceSettings.defaultNotes || '',
      paymentDate: inv.paymentDetails?.paidAt || new Date().toISOString().split('T')[0],
      paymentMode: inv.paymentDetails?.paymentMode || 'NEFT / RTGS',
      paymentRef: inv.paymentDetails?.transactionRef || ''
    });

    if (inv.dealRef) {
      const parts = inv.dealRef.split(',').map(s => s.trim()).filter(Boolean);
      setSelectedProperties(parts);
    } else {
      setSelectedProperties([]);
    }
    setShowModal(true);
  };

  // Line item helpers
  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: 'item_' + Math.random().toString(36).substring(2, 8),
          description: '',
          sacCode: invoiceSettings.sacCode || '997221',
          amount: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: string, val: string) => {
    setForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, items: updated };
    });
  };

  // Quick commission calculator applier
  const handleApplyCommissionCalc = () => {
    const base = parseFloat(calcBasePrice) || 0;
    const pct = parseFloat(calcPercentage) || 0;
    if (base <= 0 || pct <= 0) return;

    const commissionAmt = Math.round(base * (pct / 100));
    setForm(prev => {
      const updatedItems = [...prev.items];
      if (updatedItems.length > 0) {
        updatedItems[0] = {
          ...updatedItems[0],
          description: prev.dealRef 
            ? `${pct}% Brokerage Commission on ${prev.dealRef}`
            : `${pct}% Agency Commission on Property Transaction (${formatINR(base)})`,
          amount: commissionAmt.toString()
        };
      }
      return { ...prev, items: updatedItems };
    });

    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Commission Applied',
      message: `Calculated ${pct}% on ${formatINR(base)} = ${formatINR(commissionAmt)} applied to Item #1.`
    });
  };

  // Quick Due Date Presets
  const setDueDatePreset = (daysFromNow: number) => {
    const d = new Date(Date.now() + 86400000 * daysFromNow);
    setForm(prev => ({ ...prev, dueDate: d.toISOString().split('T')[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.clientPhone?.trim() && !isValid10DigitPhone(form.clientPhone)) {
      setToast({ id: Date.now().toString(), type: 'error', title: 'Invalid Phone Number', message: 'Please enter a valid 10-digit mobile number for the client.' });
      return;
    }
    const method = editingInvoice ? 'PUT' : 'POST';

    // Parse sanitized items
    const parsedItems: InvoiceItem[] = form.items.map((it, idx) => ({
      id: it.id || `item_${idx + 1}`,
      description: it.description || 'Professional Real Estate Brokerage Advisory',
      sacCode: it.sacCode || invoiceSettings.sacCode || '997221',
      amount: parseFloat(it.amount) || 0
    }));

    const payload = {
      ...(editingInvoice ? { id: editingInvoice.id } : {}),
      number: form.number,
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      clientEmail: form.clientEmail,
      clientAddress: form.clientAddress,
      clientGstin: form.clientGstin,
      dealRef: form.dealRef,
      items: parsedItems,
      amount: formCalculations.subtotal,
      totalAmount: formCalculations.totalAmount,
      taxType: form.taxType,
      taxRate: parseFloat(form.taxRate) || 0,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      status: form.status,
      notes: form.notes,
      paymentDetails: form.status === 'Paid' ? {
        paidAt: form.paymentDate,
        paymentMode: form.paymentMode,
        transactionRef: form.paymentRef
      } : undefined
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
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: editingInvoice ? 'Invoice Updated' : 'Tax Invoice Created',
          message: `Invoice #${form.number} saved with total ${formatINR(formCalculations.totalAmount)}.`
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

  const handleStatusChange = async (inv: Invoice, nextStatus: string) => {
    setData(prev => prev.map(i => i.id === inv.id ? { ...i, status: nextStatus as any } : i));
    try {
      await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: inv.id, 
          status: nextStatus,
          paymentDetails: nextStatus === 'Paid' ? {
            paidAt: new Date().toISOString().split('T')[0],
            paymentMode: 'NEFT / RTGS',
            transactionRef: 'DIRECT-PORTAL-CONFIRMATION'
          } : undefined
        })
      });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Status Updated',
        message: `Invoice #${inv.number} status changed to ${nextStatus}.`
      });
    } catch {
      loadInvoices();
    }
  };

  const handleTogglePaid = async (inv: Invoice) => {
    const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
    await handleStatusChange(inv, nextStatus);
  };

  // Multi-Channel Share Helpers
  const getInvoiceAmounts = (inv: Invoice) => {
    const subtotal = Number(inv.amount) || 0;
    const taxRate = Number(inv.taxRate ?? 18);
    const taxType = inv.taxType || 'intra';
    const isInter = taxType === 'inter';
    const isExempt = taxType === 'exempt';

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (!isExempt) {
      if (isInter) {
        igst = subtotal * (taxRate / 100);
      } else {
        cgst = subtotal * (taxRate / 200);
        sgst = subtotal * (taxRate / 200);
      }
    }

    const total = inv.totalAmount !== undefined ? Number(inv.totalAmount) : (subtotal + cgst + sgst + igst);
    return { subtotal, cgst, sgst, igst, total, isInter, isExempt, taxRate };
  };

  const handleWhatsAppShare = (inv: Invoice) => {
    const { subtotal, total, taxRate } = getInvoiceAmounts(inv);
    const phone = inv.clientPhone ? inv.clientPhone.replace(/[^0-9]/g, '') : '';
    const phoneTarget = phone ? (phone.startsWith('91') ? phone : `91${phone}`) : '';
    const firmName = invoiceSettings.agencyName || agencyInfo.name;
    const accType = invoiceSettings.accountType || 'Current';

    const msg = `Dear *${inv.clientName}*,\n\nGreetings from *${firmName}*!\n\nHere are the details of your Official Commission Invoice *#${inv.number}* for real estate advisory services:\n\n• *Deal / Transaction:* ${inv.dealRef || 'Exclusive Advisory Mandate'}\n• *Taxable Base Value:* ${formatINR(subtotal)}\n• *GST Rate:* ${taxRate}% GST\n• *TOTAL AMOUNT PAYABLE:* *${formatINR(total)}* (${formatINRFull(total)})\n• *Due Date:* ${inv.dueDate}\n• *Billing Status:* ${inv.status.toUpperCase()}\n\n*Bank Remittance Details (${accType} A/c):*\n• *Account Name:* ${invoiceSettings.accountName}\n• *Bank:* ${invoiceSettings.bankName}\n• *Account Number:* ${invoiceSettings.accountNumber}\n• *IFSC Code:* ${invoiceSettings.ifscCode}${invoiceSettings.upiId ? `\n• *UPI ID:* ${invoiceSettings.upiId}` : ''}\n\nKindly process remittance via RTGS/NEFT or UPI and share the UTR reference for receipt generation.\n\nThank you for choosing *${firmName}*!`;

    const url = phoneTarget ? `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleEmailShare = (inv: Invoice) => {
    const { subtotal, total, taxRate } = getInvoiceAmounts(inv);
    const firmName = invoiceSettings.agencyName || agencyInfo.name;
    const accType = invoiceSettings.accountType || 'Current';
    const subject = `Tax Invoice #${inv.number} - Real Estate Advisory Services [${firmName}]`;

    const body = `Dear ${inv.clientName},\n\nPlease find attached the tax invoice breakdown for real estate advisory services provided by ${firmName}.\n\nINVOICE SUMMARY:\n- Invoice Number: #${inv.number}\n- Issue Date: ${inv.issueDate || 'Current'}\n- Due Date: ${inv.dueDate}\n- Deal Reference: ${inv.dealRef || 'Property Transaction Advisory'}\n\nFINANCIAL BREAKDOWN:\n- Taxable Subtotal: ${formatINRFull(subtotal)}\n- Applicable GST: ${taxRate}%\n- TOTAL PAYABLE: ${formatINRFull(total)}\n- Amount in Words: ${numberToIndianWords(total)}\n\nREMITTANCE BANK DETAILS:\n- Beneficiary Account: ${invoiceSettings.accountName}\n- Bank: ${invoiceSettings.bankName}\n- ${accType} Account No: ${invoiceSettings.accountNumber}\n- IFSC Code: ${invoiceSettings.ifscCode}${invoiceSettings.upiId ? `\n- UPI ID: ${invoiceSettings.upiId}` : ''}\n\nPlease transfer via NEFT/RTGS or UPI and reply with transaction UTR confirmation.\n\nWarm regards,\nAccounts & Advisory Desk\n${firmName}${invoiceSettings.gstin ? `\nGSTIN: ${invoiceSettings.gstin}` : ''}${invoiceSettings.reraReg ? ` | RERA: ${invoiceSettings.reraReg}` : ''}`;

    const mailtoUrl = `mailto:${inv.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyRemittance = () => {
    const accType = invoiceSettings.accountType || 'Current';
    const text = `*Remittance & Bank Account Details:*\nAccount Name: ${invoiceSettings.accountName}\nBank: ${invoiceSettings.bankName}\n${accType} A/c No: ${invoiceSettings.accountNumber}\nIFSC Code: ${invoiceSettings.ifscCode}${invoiceSettings.upiId ? `\nUPI ID: ${invoiceSettings.upiId}` : ''}`;
    navigator.clipboard.writeText(text);
    setToast({ id: Date.now().toString(), type: 'success', title: 'Copied to Clipboard', message: 'Bank remittance details copied.' });
  };

  const handleCopySummary = (inv: Invoice) => {
    const { total } = getInvoiceAmounts(inv);
    const text = `Tax Invoice #${inv.number} | Client: ${inv.clientName} | Total Payable: ${formatINR(total)} (${formatINRFull(total)}) | Due: ${inv.dueDate} | Bank: ${invoiceSettings.bankName} A/c: ${invoiceSettings.accountNumber} IFSC: ${invoiceSettings.ifscCode}`;
    navigator.clipboard.writeText(text);
    setToast({ id: Date.now().toString(), type: 'success', title: 'Invoice Summary Copied', message: 'Ready to paste into messages.' });
  };

  // Download Standalone HTML Invoice Document
  const handleDownloadStandaloneHtml = (inv: Invoice) => {
    const firmName = invoiceSettings.agencyName || agencyInfo.name;
    const { subtotal, cgst, sgst, igst, total, isInter, isExempt, taxRate } = getInvoiceAmounts(inv);
    const words = numberToIndianWords(total);

    const items = (inv.items && inv.items.length > 0) ? inv.items : [
      {
        id: '1',
        description: inv.dealRef ? `Brokerage Advisory Mandate - ${inv.dealRef}` : 'Real Estate Advisory & Brokerage Services',
        sacCode: invoiceSettings.sacCode || '997221',
        amount: subtotal
      }
    ];

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice #${inv.number} - ${firmName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f8fafc; font-size: 13px; line-height: 1.4; }
    .card { max-width: 780px; margin: 0 auto; background: #fff; padding: 32px 36px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; border-bottom: 2.5px solid #059669; padding-bottom: 14px; margin-bottom: 18px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; font-size: 12.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12.5px; }
    th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 8px 10px; text-align: left; color: #334155; font-weight: 700; }
    td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; }
    .remittance { background: #f8fafc; padding: 12px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11.5px; margin-bottom: 12px; color: #334155; }
    .notes { background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11.5px; margin-bottom: 16px; color: #334155; }
    @media print { 
      @page { size: A4 portrait; margin: 8mm 10mm; } 
      html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; background: #fff !important; font-size: 11px !important; } 
      .card { max-width: 100% !important; padding: 10px 14px !important; border: none !important; box-shadow: none !important; page-break-inside: avoid !important; break-inside: avoid !important; } 
      table { margin-bottom: 10px !important; }
      th, td { padding: 5px 8px !important; }
      .header { margin-bottom: 10px !important; padding-bottom: 8px !important; }
      .meta-grid { margin-bottom: 10px !important; gap: 10px !important; }
      .remittance { padding: 8px 10px !important; margin-bottom: 8px !important; font-size: 10.5px !important; }
      .notes { padding: 8px 10px !important; margin-bottom: 8px !important; font-size: 10.5px !important; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1 style="margin: 0; font-size: 18px; color: #0f172a;">${firmName}</h1>
        ${invoiceSettings.tagline ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${invoiceSettings.tagline}</div>` : ''}
        ${invoiceSettings.address ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">${invoiceSettings.address}</div>` : ''}
        ${([invoiceSettings.phone ? `Tel: ${invoiceSettings.phone}` : '', invoiceSettings.email ? `Email: ${invoiceSettings.email}` : ''].filter(Boolean).length > 0) ? `
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ${[invoiceSettings.phone ? `Tel: ${invoiceSettings.phone}` : '', invoiceSettings.email ? `Email: ${invoiceSettings.email}` : ''].filter(Boolean).join(' • ')}
          </div>
        ` : ''}
        ${([invoiceSettings.gstin ? `GSTIN: <strong>${invoiceSettings.gstin}</strong>` : '', invoiceSettings.reraReg ? `RERA Reg: <strong>${invoiceSettings.reraReg}</strong>` : '', invoiceSettings.pan ? `PAN: <strong>${invoiceSettings.pan}</strong>` : ''].filter(Boolean).length > 0) ? `
          <div style="font-size: 11.5px; color: #334155; margin-top: 4px;">
            ${[invoiceSettings.gstin ? `GSTIN: <strong>${invoiceSettings.gstin}</strong>` : '', invoiceSettings.reraReg ? `RERA Reg: <strong>${invoiceSettings.reraReg}</strong>` : '', invoiceSettings.pan ? `PAN: <strong>${invoiceSettings.pan}</strong>` : ''].filter(Boolean).join(' • ')}
          </div>
        ` : ''}
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">TAX INVOICE</div>
        <div style="font-size: 13.5px; font-weight: 700; margin-top: 2px;">#${inv.number}</div>
        <div style="font-size: 12px; margin-top: 2px;">Status: <strong style="color: ${inv.status === 'Paid' ? '#059669' : '#d97706'}">${inv.status.toUpperCase()}</strong></div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Billed To Client:</div>
        <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">${inv.clientName}</div>
        ${inv.clientGstin ? `<div style="font-size: 12px; color: #059669; font-weight: 700; margin-top: 2px;">GSTIN: ${inv.clientGstin} (B2B Registered Taxpayer)</div>` : ''}
        ${inv.clientAddress ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">${inv.clientAddress}</div>` : ''}
        ${inv.clientPhone ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">Phone: ${inv.clientPhone}</div>` : ''}
        ${inv.clientEmail ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">Email: ${inv.clientEmail}</div>` : ''}
        ${inv.dealRef ? `<div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 4px;">Deal: ${inv.dealRef}</div>` : ''}
      </div>
      <div style="text-align: right;">
        <div><span style="color: #64748b;">Issue Date:</span> <strong>${inv.issueDate || 'Current'}</strong></div>
        <div style="margin-top: 4px;"><span style="color: #64748b;">Due Date:</span> <strong style="color: #dc2626;">${inv.dueDate}</strong></div>
        ${invoiceSettings.placeOfSupply ? `<div style="margin-top: 4px;"><span style="color: #64748b;">Place of Supply:</span> <strong>${invoiceSettings.placeOfSupply}</strong></div>` : ''}
        <div style="margin-top: 4px;"><span style="color: #64748b;">Reverse Charge:</span> <strong>No</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>Description of Service</th>
          <th style="text-align: center;">SAC Code</th>
          <th style="text-align: right;">Taxable Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, idx) => `
          <tr>
            <td style="text-align: center; color: #64748b;">${idx + 1}</td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${it.description}</div>
              <div style="font-size: 11px; color: #64748b;">Real Estate Agency Facilitation & Advisory Mandate</div>
            </td>
            <td style="text-align: center; color: #64748b;">${it.sacCode || invoiceSettings.sacCode || '997221'}</td>
            <td style="text-align: right; font-weight: 700;">${formatINRFull(it.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
      <div style="width: 320px; font-size: 12.5px;">
        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
          <span style="color: #64748b;">Subtotal (Taxable):</span>
          <strong>${formatINRFull(subtotal)}</strong>
        </div>
        ${!isInter && !isExempt ? `
          <div style="display: flex; justify-content: space-between; padding: 3px 0;">
            <span style="color: #64748b;">CGST (${taxRate / 2}%):</span>
            <span>${formatINRFull(cgst)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 3px 0;">
            <span style="color: #64748b;">SGST (${taxRate / 2}%):</span>
            <span>${formatINRFull(sgst)}</span>
          </div>
        ` : ''}
        ${isInter && !isExempt ? `
          <div style="display: flex; justify-content: space-between; padding: 3px 0;">
            <span style="color: #64748b;">IGST (${taxRate}%):</span>
            <span>${formatINRFull(igst)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 2px solid #0f172a; margin-top: 4px;">
          <span style="font-size: 13.5px; font-weight: 800;">Total Amount Payable:</span>
          <span style="font-size: 15px; font-weight: 800; color: #059669;">${formatINRFull(total)}</span>
        </div>
        <div style="font-size: 10.5px; color: #64748b; font-style: italic; margin-top: 2px; text-align: right;">
          ${words}
        </div>
      </div>
    </div>

    ${(invoiceSettings.accountNumber || invoiceSettings.bankName || invoiceSettings.accountName) ? `
      <div class="remittance">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px;">Remittance & Bank Account Details:</div>
        ${invoiceSettings.accountName ? `<div>Account Name: <strong>${invoiceSettings.accountName}</strong></div>` : ''}
        <div>${[
          invoiceSettings.bankName ? `Bank: <strong>${invoiceSettings.bankName}</strong>` : '',
          invoiceSettings.accountNumber ? `${invoiceSettings.accountType || 'Current'} A/c No: <strong>${invoiceSettings.accountNumber}</strong>` : '',
          invoiceSettings.ifscCode ? `IFSC: <strong>${invoiceSettings.ifscCode}</strong>` : ''
        ].filter(Boolean).join(' • ')}</div>
        ${invoiceSettings.upiId ? `<div>UPI / QR Remittance ID: <strong>${invoiceSettings.upiId}</strong></div>` : ''}
      </div>
    ` : ''}

    ${(inv.notes || invoiceSettings.defaultNotes) ? `
      <div class="notes">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px;">Payment Terms & Remittance Notes:</div>
        <div style="white-space: pre-wrap; line-height: 1.4; color: #334155;">${inv.notes || invoiceSettings.defaultNotes}</div>
      </div>
    ` : ''}

    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10.5px; color: #64748b;">
      <div>Computer generated electronic tax invoice under Section 65B of Evidence Act & IT Act 2000.</div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: #0f172a;">For ${firmName}</div>
        <div style="margin-top: 24px;">Authorized Broker Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Invoice_${inv.number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Invoice Downloaded',
      message: `Tax_Invoice_${inv.number}.html saved.`
    });
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
    let totalBilled = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let overdueCount = 0;
    let paidCount = 0;
    let pendingCount = 0;

    data.forEach(inv => {
      const { total } = getInvoiceAmounts(inv);
      totalBilled += total;
      if (inv.status === 'Paid') {
        totalCollected += total;
        paidCount++;
      } else if (inv.status === 'Pending' || inv.status === 'Draft') {
        totalPending += total;
        pendingCount++;
      } else if (inv.status === 'Overdue') {
        totalPending += total;
        overdueCount++;
      }
    });

    return {
      totalBilled,
      totalCollected,
      totalPending,
      overdueCount,
      paidCount,
      pendingCount
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(inv => {
      const matchesSearch =
        !searchQuery.trim() ||
        inv.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.dealRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientGstin?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return (a.issueDate || a.id || '').localeCompare(b.issueDate || b.id || '');
      } else if (sortBy === 'amount_desc') {
        const amtA = a.totalAmount || a.amount || 0;
        const amtB = b.totalAmount || b.amount || 0;
        return amtB - amtA;
      } else if (sortBy === 'amount_asc') {
        const amtA = a.totalAmount || a.amount || 0;
        const amtB = b.totalAmount || b.amount || 0;
        return amtA - amtB;
      } else if (sortBy === 'client_asc') {
        return (a.clientName || '').localeCompare(b.clientName || '');
      } else if (sortBy === 'due_date_asc') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'due_date_desc') {
        return (b.dueDate || '').localeCompare(a.dueDate || '');
      }
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
          <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{r.clientName}</span>
            {r.clientGstin && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 4, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                B2B GST
              </span>
            )}
          </div>
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
      label: 'Payable Amount (INR)',
      render: (r) => {
        const { subtotal, total, taxRate } = getInvoiceAmounts(r);
        return (
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14.5px' }}>
              {formatINR(total)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              Base: {formatINR(subtotal)} + {taxRate}% GST
            </div>
          </div>
        );
      }
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (r) => {
        const isPastDue = new Date(r.dueDate) < new Date() && r.status !== 'Paid';
        return (
          <div style={{ fontSize: '13px', color: isPastDue ? '#dc2626' : '#475569', fontWeight: isPastDue ? 700 : 500 }}>
            {r.dueDate}
            {isPastDue && <div style={{ fontSize: 10.5, color: '#dc2626', fontWeight: 700 }}>OVERDUE</div>}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const style = getStatusColorStyle(r.status);
        return (
          <select
            value={r.status}
            onChange={(e) => handleStatusChange(r, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: style.bg,
              color: style.text,
              border: `1.5px solid ${style.border}`,
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {invoiceStatuses.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        );
      }
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
              padding: '6px 9px',
              fontSize: '11.5px',
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
            {r.status === 'Paid' ? 'Pending' : '✓ Paid'}
          </button>

          {/* Quick Share Menu */}
          <button
            type="button"
            onClick={() => setSharingInvoice(r)}
            style={{
              padding: '6px 8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
            title="Share via WhatsApp, Email or Copy Link"
          >
            <ShareIcon size={13} color="#059669" />
          </button>

          {/* View / Print Tax Invoice */}
          <button
            type="button"
            onClick={() => setSelectedInvoiceForPrint(r)}
            style={{
              padding: '6px 8px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="View Official RERA Tax Invoice"
          >
            <PrinterIcon size={13} color="#334155" />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => handleOpenEdit(r)}
            style={{
              padding: '6px 8px',
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
              padding: '6px 8px',
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
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Total Invoiced (Gross)</div>
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
          searchPlaceholder="Search invoices by invoice #, client, GSTIN, or deal..."
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
                ...invoiceStatuses.map(s => ({ label: s, value: s }))
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
            style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxWidth: 760, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingInvoice ? 'Edit Commission Tax Invoice' : 'Create Commission Tax Invoice'}
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                  Compliant with Indian RERA &amp; GST guidelines for real estate brokerage firms
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

            <form onSubmit={handleSubmit} style={{ padding: '22px', overflowY: 'auto' }}>
              
              {/* SECTION 1: INVOICE META */}
              <div style={{ marginBottom: 16, backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                  1. Invoice Identifiers &amp; Schedule
                </div>
                
                <div className="responsive-grid-3" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      <span>Invoice Number *</span>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, number: generateInvoiceNumber() }))}
                        title="Generate random new invoice sequence"
                        style={{ background: 'none', border: 'none', color: '#059669', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}
                      >
                        <RotateCcwIcon size={11} color="#059669" />
                        <span>Regenerate</span>
                      </button>
                    </label>
                    <input
                      required
                      value={form.number}
                      onChange={e => setForm({ ...form, number: e.target.value })}
                      placeholder="e.g. INV-2026-0042"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, outline: 'none', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Issue Date *</label>
                    <input
                      required
                      type="date"
                      value={form.issueDate}
                      onChange={e => setForm({ ...form, issueDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Due Date *</label>
                    <input
                      required
                      type="date"
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <button type="button" onClick={() => setDueDatePreset(0)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569', whiteSpace: 'nowrap' }}>Today</button>
                      <button type="button" onClick={() => setDueDatePreset(7)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569', whiteSpace: 'nowrap' }}>+7d</button>
                      <button type="button" onClick={() => setDueDatePreset(14)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569', whiteSpace: 'nowrap' }}>+14d</button>
                      <button type="button" onClick={() => setDueDatePreset(30)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569', whiteSpace: 'nowrap' }}>+30d</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Initial Status</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {invoiceStatuses.map(s => {
                      const isSel = form.status === s;
                      const col = getStatusColorStyle(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, status: s }))}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            border: isSel ? `2px solid ${col.text}` : '1px solid #cbd5e1',
                            backgroundColor: isSel ? col.bg : '#ffffff',
                            color: isSel ? col.text : '#475569',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: col.dot }} />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: CLIENT DETAILS */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                  2. Client &amp; Billing Entity (Billed To)
                </div>

                {/* Auto-fill from CRM client */}
                <div style={{ marginBottom: 12 }}>
                  <SearchableCombobox
                    label="Select Registered CRM Client (Auto-fill)"
                    value={form.clientName}
                    placeholder="Search existing clients by name or phone..."
                    searchPlaceholder="Type client name or phone..."
                    options={crmClients.map(c => ({
                      value: c.name,
                      label: c.name,
                      sublabel: c.phone || 'No Phone',
                      badge: (c as any).type || (c as any).status || 'Client'
                    }))}
                    onChange={(val, opt) => {
                      if (!val) {
                        setForm(prev => ({ ...prev, clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', clientGstin: '' }));
                        return;
                      }
                      const matched = crmClients.find(c => c.name === val);
                      const phoneVal = (matched && matched.phone) || (opt?.sublabel && opt.sublabel !== 'No Phone' ? opt.sublabel : form.clientPhone);
                      setForm(prev => ({
                        ...prev,
                        clientName: val,
                        clientPhone: phoneVal,
                        clientEmail: (matched && matched.email) || prev.clientEmail,
                        clientAddress: (matched && matched.address) || prev.clientAddress,
                        clientGstin: (matched && matched.gstin) || prev.clientGstin
                      }));
                    }}
                    onAddNew={() => {}}
                    addNewLabel="+ New Client"
                  />
                </div>

                <div className="responsive-grid-2" style={{ gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Client / Entity Legal Name *</label>
                    <input
                      required
                      value={form.clientName}
                      onChange={e => setForm({ ...form, clientName: e.target.value })}
                      placeholder="e.g. Vikram Malhotra / Indus Capital PE"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Client GSTIN <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional for B2B Tax Credit)</span>
                    </label>
                    <input
                      value={form.clientGstin}
                      onChange={e => setForm({ ...form, clientGstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 27AAACN1234F1Z1"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, outline: 'none', letterSpacing: '0.04em' }}
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Client WhatsApp / Phone (10 Digits)
                    </label>
                    <input
                      type="tel"
                      maxLength={15}
                      value={form.clientPhone}
                      onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                      placeholder="e.g. 98200 45678"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: `1px solid ${form.clientPhone?.trim() && !isValid10DigitPhone(form.clientPhone) ? '#ef4444' : '#cbd5e1'}`,
                        borderRadius: 7,
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                    {form.clientPhone?.trim() && (
                      <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: isValid10DigitPhone(form.clientPhone) ? '#16a34a' : '#ea580c' }}>
                        {isValid10DigitPhone(form.clientPhone) ? '✓ Valid 10-digit mobile number' : `⚠️ Enter 10 digits (${extract10DigitPhone(form.clientPhone).length}/10 digits)`}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Client Email Address</label>
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                      placeholder="e.g. vikram@example.com"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Client Billing Address</label>
                  <input
                    value={form.clientAddress}
                    onChange={e => setForm({ ...form, clientAddress: e.target.value })}
                    placeholder="e.g. Flat 1402, Lodha Park Tower 2, Worli, Mumbai 400018"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* SECTION 3: TRANSACTION & DEAL REFERENCE */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                  3. Deal &amp; Property Reference
                </div>

                <div style={{ marginBottom: 10 }}>
                  <MultiPropertySelector
                    label="Referenced Property Assets / Deals"
                    required={false}
                    itemPrefix="Property"
                    itemBadgeLabel="Referenced Properties / Deals"
                    addFirstLabel="Select Property Asset for Invoice"
                    addMoreLabel="+ Add Another Property Asset"
                    selectActionLabel="+ Select"
                    availableProperties={[
                      ...crmProperties.map(p => ({
                        id: p.id,
                        title: p.title,
                        locality: p.locality || p.city,
                        bhk: p.bhk,
                        price: p.price,
                        purpose: p.purpose || 'Property'
                      })),
                      ...crmDeals.map(d => ({
                        id: d.id,
                        title: d.title,
                        locality: d.clientName ? `Deal for ${d.clientName}` : 'Deals Pipeline',
                        bhk: 'Deal',
                        price: d.amount,
                        purpose: 'Pipeline Deal'
                      }))
                    ]}
                    selectedProperties={selectedProperties}
                    onChange={(newProps) => {
                      setSelectedProperties(newProps);
                      const refString = newProps.join(', ');
                      setForm(prev => ({
                        ...prev,
                        dealRef: refString
                      }));

                      // Auto-fill calculator base price from first selected asset
                      const matchProp = crmProperties.find(p => p.title === newProps[0]);
                      const matchDeal = crmDeals.find(d => d.title === newProps[0]);
                      const val = matchProp?.price || matchDeal?.amount;
                      if (val) {
                        setCalcBasePrice(val.toString());
                      }
                    }}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Custom Deal / Property Reference Description
                  </label>
                  <input
                    value={form.dealRef}
                    onChange={e => setForm({ ...form, dealRef: e.target.value })}
                    placeholder="e.g. 4 BHK Sea-Facing Ultra Luxury Flat, Lodha Park"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, outline: 'none' }}
                  />
                </div>

                {/* Quick Commission Calculator Banner */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>⚡ Quick Brokerage Commission Calculator</span>
                    <InfoTooltip text="Quickly calculate 1% or 2% advisory commission from transaction value and inject into Line Item 1." />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 180px' }}>
                      <input
                        type="number"
                        value={calcBasePrice}
                        onChange={e => setCalcBasePrice(e.target.value)}
                        placeholder="Deal Value (e.g. 85000000)"
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #86efac', borderRadius: 6, fontSize: 12.5, backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['1', '2', '3'].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCalcPercentage(pct)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: calcPercentage === pct ? '1px solid #15803d' : '1px solid #bbf7d0',
                            backgroundColor: calcPercentage === pct ? '#15803d' : '#ffffff',
                            color: calcPercentage === pct ? '#ffffff' : '#166534'
                          }}
                        >
                          {pct}%
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseFloat(calcBasePrice) || 0;
                          if (val > 0) {
                            // 1 month rent equivalent
                            const rentAmt = Math.round(val);
                            setForm(prev => {
                              const updatedItems = [...prev.items];
                              if (updatedItems.length > 0) {
                                updatedItems[0] = {
                                  ...updatedItems[0],
                                  description: prev.dealRef ? `1 Month Rental Brokerage - ${prev.dealRef}` : 'Rental Tenancy Facilitation Brokerage (1 Month Rent)',
                                  amount: rentAmt.toString()
                                };
                              }
                              return { ...prev, items: updatedItems };
                            });
                          }
                        }}
                        style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', border: '1px solid #bbf7d0', backgroundColor: '#ffffff', color: '#166534' }}
                      >
                        1 Mo. Rent
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCommissionCalc}
                      style={{ padding: '6px 12px', borderRadius: 6, backgroundColor: '#15803d', color: '#ffffff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Apply to Item #1
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: ITEMIZED SERVICES / LINE ITEMS */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    4. Advisory Services &amp; Line Items
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <PlusIcon size={13} color="#059669" />
                    <span>+ Add Line Item</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        display: 'grid',
                        gridTemplateColumns: '1fr 140px 130px 32px',
                        gap: 8,
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <input
                          required
                          value={it.description}
                          onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                          placeholder="e.g. 2% Brokerage Commission on Lodha Park ATS execution"
                          style={{ width: '100%', padding: '7px 9px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5 }}
                        />
                      </div>
                      <div>
                        <input
                          value={it.sacCode}
                          onChange={e => handleUpdateItem(idx, 'sacCode', e.target.value)}
                          placeholder="SAC: 997221"
                          style={{ width: '100%', padding: '7px 9px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, textAlign: 'center' }}
                        />
                      </div>
                      <div>
                        <input
                          required
                          type="number"
                          value={it.amount}
                          onChange={e => handleUpdateItem(idx, 'amount', e.target.value)}
                          placeholder="Taxable ₹"
                          style={{ width: '100%', padding: '7px 9px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          disabled={form.items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: form.items.length <= 1 ? 'not-allowed' : 'pointer',
                            color: form.items.length <= 1 ? '#cbd5e1' : '#dc2626',
                            padding: 4
                          }}
                          title="Remove Line Item"
                        >
                          <XIcon size={14} color="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: GST TAXATION & SUPPLY TYPE */}
              <div style={{ marginBottom: 16, backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                  5. GST Taxation &amp; Place of Supply
                </div>

                <div className="responsive-grid-2" style={{ gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      GST Supply Type
                    </label>
                    <select
                      value={form.taxType}
                      onChange={e => setForm({ ...form, taxType: e.target.value as any })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, backgroundColor: '#ffffff' }}
                    >
                      <option value="intra">Intra-State: CGST (9%) + SGST (9%) - Same State</option>
                      <option value="inter">Inter-State: IGST (18%) - Client from other State</option>
                      <option value="exempt">Non-Taxable / Exempt (0% GST)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      GST Tax Rate (%)
                    </label>
                    <select
                      disabled={form.taxType === 'exempt'}
                      value={form.taxRate}
                      onChange={e => setForm({ ...form, taxRate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 13, backgroundColor: '#ffffff' }}
                    >
                      <option value="18">18% Standard GST (9% CGST + 9% SGST / 18% IGST)</option>
                      <option value="5">5% Concessional GST</option>
                      <option value="12">12% Intermediate GST</option>
                      <option value="0">0% Non-Taxable / Exempt</option>
                    </select>
                  </div>
                </div>

                {/* LIVE CALCULATION SUMMARY CARD */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12.5 }}>
                    <span style={{ color: '#64748b' }}>Taxable Value (Subtotal):</span>
                    <strong style={{ color: '#0f172a' }}>{formatINRFull(formCalculations.subtotal)}</strong>
                  </div>
                  
                  {form.taxType === 'intra' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>CGST ({parseFloat(form.taxRate) / 2}%):</span>
                        <span>{formatINRFull(formCalculations.cgst)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>SGST ({parseFloat(form.taxRate) / 2}%):</span>
                        <span>{formatINRFull(formCalculations.sgst)}</span>
                      </div>
                    </>
                  )}

                  {form.taxType === 'inter' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>IGST ({parseFloat(form.taxRate)}%):</span>
                      <span>{formatINRFull(formCalculations.igst)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px', borderTop: '2px solid #0f172a', marginTop: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>Total Amount Payable:</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{formatINRFull(formCalculations.totalAmount)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', textAlign: 'right' }}>
                    {formCalculations.inWords}
                  </div>
                </div>
              </div>

              {/* SECTION 6: PAYMENT TERMS & REMITTANCE NOTES */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Payment Terms &amp; Remittance Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Remittance details, bank account, RTGS IFSC..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, resize: 'vertical' }}
                />
              </div>

              {/* SECTION 7: PAYMENT DETAILS (IF PAID) */}
              {form.status === 'Paid' && (
                <div style={{ marginBottom: 16, backgroundColor: '#f0fdf4', padding: '14px 16px', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 10 }}>
                    Payment Clearance Details
                  </div>
                  <div className="responsive-grid-3" style={{ gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>Date of Remittance</label>
                      <input
                        type="date"
                        value={form.paymentDate}
                        onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                        style={{ width: '100%', padding: '7px 9px', border: '1px solid #86efac', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>Payment Mode</label>
                      <select
                        value={form.paymentMode}
                        onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                        style={{ width: '100%', padding: '7px 9px', border: '1px solid #86efac', borderRadius: 6, fontSize: 12, backgroundColor: '#fff' }}
                      >
                        <option value="NEFT / RTGS">NEFT / RTGS Transfer</option>
                        <option value="UPI">UPI / QR Remittance</option>
                        <option value="Cheque">Corporate Cheque</option>
                        <option value="Escrow Transfer">Direct Escrow Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>UTR / Cheque Ref #</label>
                      <input
                        value={form.paymentRef}
                        onChange={e => setForm({ ...form, paymentRef: e.target.value })}
                        placeholder="e.g. HDFC984210"
                        style={{ width: '100%', padding: '7px 9px', border: '1px solid #86efac', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>
              )}

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
      {selectedInvoiceForPrint && (() => {
        const inv = selectedInvoiceForPrint;
        const { subtotal, cgst, sgst, igst, total, isInter, isExempt, taxRate } = getInvoiceAmounts(inv);
        const words = numberToIndianWords(total);
        const items = (inv.items && inv.items.length > 0) ? inv.items : [
          {
            id: 'item_1',
            description: inv.dealRef ? `Brokerage Advisory Mandate - ${inv.dealRef}` : 'Real Estate Acquisition & Brokerage Advisory',
            sacCode: invoiceSettings.sacCode || '997221',
            amount: subtotal
          }
        ];

        return (
          <div
            onClick={() => setSelectedInvoiceForPrint(null)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="responsive-modal animate-enter print-invoice-container"
              style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth: 800, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
            >
              {/* Top Toolbar */}
              <div style={{ padding: '14px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }} className="hide-on-print">
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Official RERA Tax Invoice #{inv.number}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* WhatsApp / Share */}
                  <button
                    type="button"
                    onClick={() => setSharingInvoice(inv)}
                    style={{ padding: '6px 10px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                    title="Share Invoice with Client or Anyone"
                  >
                    <WhatsAppIcon size={14} color="#059669" />
                    <span>Share / WhatsApp</span>
                  </button>

                  {/* Email */}
                  <button
                    type="button"
                    onClick={() => handleEmailShare(inv)}
                    style={{ padding: '6px 10px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                    title="Send Invoice via Email"
                  >
                    <MailIcon size={13} color="#2563eb" />
                    <span>Email</span>
                  </button>

                  {/* Download HTML */}
                  <button
                    type="button"
                    onClick={() => handleDownloadStandaloneHtml(inv)}
                    style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                    title="Download Standalone HTML Document"
                  >
                    <DownloadIcon size={13} color="#334155" />
                    <span>HTML</span>
                  </button>

                  {/* Print */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{ padding: '6px 12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                    title="Print or Save as PDF"
                  >
                    <PrinterIcon size={13} color="#ffffff" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForPrint(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, marginLeft: 4 }}
                  >
                    <XIcon size={18} color="#64748b" />
                  </button>
                </div>
              </div>

              {/* Printable Tax Invoice Paper Layout */}
              <div className="print-invoice-paper" style={{ padding: '32px 36px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'inherit' }}>
                
                {/* Invoice Header */}
                <div className="print-invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #059669', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <BuildingIcon size={17} color="#fff" />
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                        {invoiceSettings.agencyName || agencyInfo.name || 'Real Estate Advisory'}
                      </h2>
                    </div>
                    {invoiceSettings.tagline && (
                      <div style={{ fontSize: 12, color: '#64748b' }}>{invoiceSettings.tagline}</div>
                    )}
                    {invoiceSettings.address && (
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{invoiceSettings.address}</div>
                    )}
                    {(invoiceSettings.phone || invoiceSettings.email) && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {[
                          invoiceSettings.phone ? `Tel: ${invoiceSettings.phone}` : '',
                          invoiceSettings.email ? `Email: ${invoiceSettings.email}` : ''
                        ].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    {([invoiceSettings.gstin, invoiceSettings.reraReg, invoiceSettings.pan].some(Boolean)) && (
                      <div style={{ fontSize: 11.5, color: '#334155', marginTop: 4 }}>
                        {[
                          invoiceSettings.gstin && <span>GSTIN: <strong>{invoiceSettings.gstin}</strong></span>,
                          invoiceSettings.reraReg && <span>RERA Reg: <strong>{invoiceSettings.reraReg}</strong></span>,
                          invoiceSettings.pan && <span>PAN: <strong>{invoiceSettings.pan}</strong></span>
                        ].filter(Boolean).reduce((prev, curr, idx) => [prev, ' • ', curr] as any)}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', letterSpacing: '-0.5px' }}>
                      TAX INVOICE
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                      #{inv.number}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: inv.status === 'Paid' ? '#dcfce7' : (inv.status === 'Overdue' ? '#fee2e2' : '#fef3c7'),
                        color: inv.status === 'Paid' ? '#15803d' : (inv.status === 'Overdue' ? '#dc2626' : '#b45309')
                      }}>
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Dates Meta Grid */}
                <div className="print-meta-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20, fontSize: 12.5 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Billed To Client:</div>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a' }}>{inv.clientName}</div>
                    {inv.clientGstin && (
                      <div style={{ color: '#059669', fontWeight: 700, fontSize: 12, marginTop: 2 }}>
                        GSTIN: {inv.clientGstin} (B2B Registered Taxpayer)
                      </div>
                    )}
                    {inv.clientAddress && <div style={{ color: '#475569', marginTop: 2 }}>{inv.clientAddress}</div>}
                    {inv.clientPhone && <div style={{ color: '#475569', marginTop: 2 }}>Phone: {inv.clientPhone}</div>}
                    {inv.clientEmail && <div style={{ color: '#475569', marginTop: 2 }}>Email: {inv.clientEmail}</div>}
                    {inv.dealRef && (
                      <div style={{ color: '#059669', fontWeight: 600, marginTop: 4 }}>
                        Transaction: {inv.dealRef}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Issue Date: </span>
                      <strong style={{ color: '#0f172a' }}>{inv.issueDate || 'Current'}</strong>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Due Date: </span>
                      <strong style={{ color: '#dc2626' }}>{inv.dueDate}</strong>
                    </div>
                    {invoiceSettings.placeOfSupply && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Place of Supply: </span>
                        <strong style={{ color: '#0f172a' }}>{invoiceSettings.placeOfSupply}</strong>
                      </div>
                    )}
                    <div>
                      <span style={{ color: '#64748b' }}>Reverse Charge: </span>
                      <strong style={{ color: '#0f172a' }}>No</strong>
                    </div>
                  </div>
                </div>

                {/* Itemized Services Table */}
                <table className="print-invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: 40, fontWeight: 700, color: '#334155' }}>#</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Description of Service</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: 90, fontWeight: 700, color: '#334155' }}>SAC Code</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: 140, fontWeight: 700, color: '#334155' }}>Taxable Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.description}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Real estate advisory and mandate facilitation services</div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{it.sacCode || invoiceSettings.sacCode || '997221'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                          {formatINRFull(it.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Invoice Calculations Summary */}
                <div className="print-calc-summary" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                  <div style={{ width: 300, fontSize: 12.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ color: '#64748b' }}>Subtotal (Taxable):</span>
                      <strong style={{ color: '#0f172a' }}>{formatINRFull(subtotal)}</strong>
                    </div>

                    {!isInter && !isExempt && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                          <span style={{ color: '#64748b' }}>CGST ({taxRate / 2}%):</span>
                          <span>{formatINRFull(cgst)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                          <span style={{ color: '#64748b' }}>SGST ({taxRate / 2}%):</span>
                          <span>{formatINRFull(sgst)}</span>
                        </div>
                      </>
                    )}

                    {isInter && !isExempt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span style={{ color: '#64748b' }}>IGST ({taxRate}%):</span>
                        <span>{formatINRFull(igst)}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid #0f172a', marginTop: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800 }}>Total Amount Payable:</span>
                      <span style={{ fontSize: 15.5, fontWeight: 800, color: '#059669' }}>{formatINRFull(total)}</span>
                    </div>

                    <div style={{ fontSize: 10.5, color: '#64748b', fontStyle: 'italic', marginTop: 2, textAlign: 'right' }}>
                      {words}
                    </div>
                  </div>
                </div>

                {/* Payment Remittance Instructions */}
                {(invoiceSettings.accountNumber || invoiceSettings.bankName || invoiceSettings.accountName) && (
                  <div className="print-remittance-box" style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11.5, color: '#475569', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Remittance &amp; Bank Account Details:</div>
                      <button
                        type="button"
                        className="hide-on-print"
                        onClick={handleCopyRemittance}
                        style={{ fontSize: 11, background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}
                      >
                        <CopyIcon size={12} color="#059669" />
                        <span>Copy Details</span>
                      </button>
                    </div>
                    {invoiceSettings.accountName && (
                      <div>Account Name: <strong>{invoiceSettings.accountName}</strong></div>
                    )}
                    <div>
                      {[
                        invoiceSettings.bankName ? `Bank: <strong>${invoiceSettings.bankName}</strong>` : '',
                        invoiceSettings.accountNumber ? `${invoiceSettings.accountType || 'Current'} A/c No: <strong>${invoiceSettings.accountNumber}</strong>` : '',
                        invoiceSettings.ifscCode ? `IFSC: <strong>${invoiceSettings.ifscCode}</strong>` : ''
                      ].filter(Boolean).reduce((prev, curr) => [prev, ' • ', <span key={Math.random()} dangerouslySetInnerHTML={{ __html: curr }} />] as any)}
                    </div>
                    {invoiceSettings.upiId && <div style={{ marginTop: 2 }}>UPI / QR Remittance ID: <strong>{invoiceSettings.upiId}</strong></div>}
                  </div>
                )}

                {/* Payment Terms & Remittance Notes */}
                {(inv.notes || invoiceSettings.defaultNotes) && (
                  <div className="print-notes-box" style={{ backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11.5, color: '#475569', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Payment Terms &amp; Remittance Notes:</div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#334155' }}>
                      {inv.notes || invoiceSettings.defaultNotes}
                    </div>
                  </div>
                )}

                {/* Signoff */}
                <div className="print-signoff" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 14, fontSize: 10.5, color: '#64748b' }}>
                  <div>Computer generated official electronic invoice under Section 65B of Evidence Act &amp; IT Act 2000.</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>For {invoiceSettings.agencyName || agencyInfo.name}</div>
                    <div style={{ marginTop: 22 }}>Authorized Broker Signatory</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* UNIVERSAL SHARE INVOICE MODAL */}
      {sharingInvoice && (() => {
        const inv = sharingInvoice;
        const { total, subtotal, taxRate } = getInvoiceAmounts(inv);
        const firmName = invoiceSettings.agencyName || agencyInfo.name;
        const accType = invoiceSettings.accountType || 'Current';

        const defaultMsg = `Dear *${inv.clientName}*,\n\nGreetings from *${firmName}*!\n\nHere are the details of your Official Commission Invoice *#${inv.number}* for real estate advisory services:\n\n• *Deal / Transaction:* ${inv.dealRef || 'Exclusive Advisory Mandate'}\n• *Taxable Base Value:* ${formatINR(subtotal)}\n• *GST Rate:* ${taxRate}% GST\n• *TOTAL AMOUNT PAYABLE:* *${formatINR(total)}* (${formatINRFull(total)})\n• *Due Date:* ${inv.dueDate}\n• *Billing Status:* ${inv.status.toUpperCase()}\n\n*Bank Remittance Details (${accType} A/c):*\n• *Account Name:* ${invoiceSettings.accountName}\n• *Bank:* ${invoiceSettings.bankName}\n• *Account Number:* ${invoiceSettings.accountNumber}\n• *IFSC Code:* ${invoiceSettings.ifscCode}${invoiceSettings.upiId ? `\n• *UPI ID:* ${invoiceSettings.upiId}` : ''}\n\nKindly process remittance via RTGS/NEFT or UPI and share the UTR reference for receipt generation.\n\nThank you for choosing *${firmName}*!`;

        return (
          <ShareModal
            isOpen={!!sharingInvoice}
            onClose={() => setSharingInvoice(null)}
            shareItem={{
              id: inv.id,
              type: 'invoice',
              title: `Tax Invoice #${inv.number} • ${inv.clientName}`,
              subtitle: `Total Payable: ${formatINR(total)} • Due: ${inv.dueDate} • Status: ${inv.status}`,
              description: inv.dealRef ? `Transaction Deal: ${inv.dealRef}` : undefined,
              badge: inv.status.toUpperCase(),
              link: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/invoices?id=${inv.id}` : '',
              recipientName: inv.clientName,
              recipientPhone: inv.clientPhone,
              recipientEmail: inv.clientEmail,
              defaultMessage: defaultMsg
            }}
          />
        );
      })()}

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
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            height: 100% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            font-size: 11px !important;
          }
          body * {
            visibility: hidden !important;
          }
          .print-invoice-container, .print-invoice-container * {
            visibility: visible !important;
          }
          .print-invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .print-invoice-paper {
            padding: 10px 14px !important;
          }
          .print-invoice-header {
            padding-bottom: 8px !important;
            margin-bottom: 10px !important;
          }
          .print-meta-grid {
            margin-bottom: 10px !important;
            gap: 10px !important;
          }
          .print-invoice-table {
            margin-bottom: 10px !important;
          }
          .print-invoice-table th,
          .print-invoice-table td {
            padding: 5px 8px !important;
          }
          .print-calc-summary {
            margin-bottom: 10px !important;
          }
          .print-remittance-box {
            padding: 8px 10px !important;
            margin-bottom: 8px !important;
          }
          .print-notes-box {
            padding: 8px 10px !important;
            margin-bottom: 8px !important;
          }
          .print-signoff {
            padding-top: 8px !important;
          }
          .hide-on-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
