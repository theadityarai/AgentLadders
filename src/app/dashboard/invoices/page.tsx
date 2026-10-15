'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getStatusColorStyle } from '@/lib/theme';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { SearchBar } from '@/components/ui/SearchBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { 
  formatActualINR,
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
import { PhoneInput } from '@/components/ui/PhoneInput';
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
  PlusIcon,
  FileTextIcon
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
  taxType?: 'intra' | 'inter' | 'exempt' | 'not_applicable' | 'none' | string;
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
    taxType: 'none' as 'intra' | 'inter' | 'exempt' | 'not_applicable' | 'none',
    taxRate: 'none',
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
  const [customPercentage, setCustomPercentage] = useState('');
  const [targetLineItemIndex, setTargetLineItemIndex] = useState(0);

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
    const isGstEnabled = Boolean(invoiceSettings.enableGstTaxation);
    const taxRate = isGstEnabled && form.taxRate !== 'none' ? (parseFloat(form.taxRate) || 0) : 0;
    const taxType = isGstEnabled ? form.taxType : 'none';
    const isInter = taxType === 'inter';
    const isExempt = taxType === 'exempt';
    const isNoTax = !isGstEnabled || taxType === 'none' || taxType === 'not_applicable' || isExempt || taxRate === 0;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (!isNoTax) {
      if (isInter) {
        igst = subtotal * (taxRate / 100);
      } else {
        cgst = subtotal * (taxRate / 200);
        sgst = subtotal * (taxRate / 200);
      }
    }

    const totalTax = cgst + sgst + igst;
    const totalAmount = Math.round((subtotal + totalTax) * 100) / 100;

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount,
      inWords: numberToIndianWords(totalAmount)
    };
  }, [form.items, form.taxRate, form.taxType, invoiceSettings.enableGstTaxation]);

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
      taxType: 'none',
      taxRate: 'none',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      status: 'Pending',
      notes: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'NEFT / RTGS',
      paymentRef: ''
    });
    setSelectedProperties([]);
    setCalcBasePrice('');
    setCalcPercentage('2');
    setCustomPercentage('');
    setTargetLineItemIndex(0);
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
      taxType: ((inv.taxType as any) || (invoiceSettings.enableGstTaxation ? 'intra' : 'none')),
      taxRate: inv.taxRate !== undefined && inv.taxRate !== null && inv.taxRate.toString() !== '0' ? inv.taxRate.toString() : (invoiceSettings.enableGstTaxation ? (inv.taxRate === 0 ? '0' : 'none') : 'none'),
      issueDate: inv.issueDate || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate || new Date().toISOString().split('T')[0],
      status: inv.status || 'Pending',
      notes: inv.notes || '',
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
    setTargetLineItemIndex(0);
    setCustomPercentage('');
    setCalcBasePrice('');
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
    if (targetLineItemIndex >= form.items.length - 1) {
      setTargetLineItemIndex(Math.max(0, form.items.length - 2));
    }
  };

  const handleUpdateItem = (index: number, field: string, val: string) => {
    setForm(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, items: updated };
    });
  };

  // Quick commission calculator appliers (target selected line item with actual amounts and actual percentage)
  const applyCommission = (pct: number) => {
    const base = parseFloat(calcBasePrice) || 0;
    if (base <= 0) {
      setToast({ id: Date.now().toString(), type: 'info', title: 'Deal Value Required', message: 'Enter deal value to calculate commission percentage.' });
      return;
    }
    if (pct <= 0) {
      setToast({ id: Date.now().toString(), type: 'info', title: 'Invalid Percentage', message: 'Enter a valid percentage greater than 0.' });
      return;
    }
    const rawAmt = base * (pct / 100);
    const amt = Math.round(rawAmt * 100) / 100;
    const amtStr = amt % 1 === 0 ? amt.toFixed(0) : amt.toFixed(2);
    const targetIdx = (targetLineItemIndex >= 0 && targetLineItemIndex < form.items.length) ? targetLineItemIndex : 0;

    setForm(prev => {
      const items = [...prev.items];
      if (items.length <= targetIdx) return prev;
      const dealLabel = prev.dealRef ? `on ${prev.dealRef} ` : '';
      items[targetIdx] = {
        ...items[targetIdx],
        description: `${pct}% Brokerage Commission ${dealLabel}(Transaction Value: ${formatActualINR(base)})`,
        amount: amtStr
      };
      return { ...prev, items };
    });

    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Commission Applied',
      message: `Calculated ${pct}% on ${formatActualINR(base)} = ${formatActualINR(amt)} applied to Line Item #${targetIdx + 1}.`
    });
  };

  const applyRentalCommission = () => {
    const base = parseFloat(calcBasePrice) || 0;
    if (base <= 0) {
      setToast({ id: Date.now().toString(), type: 'info', title: 'Deal Value Required', message: 'Enter monthly rental value to apply rental brokerage.' });
      return;
    }
    const amt = Math.round(base * 100) / 100;
    const amtStr = amt % 1 === 0 ? amt.toFixed(0) : amt.toFixed(2);
    const targetIdx = (targetLineItemIndex >= 0 && targetLineItemIndex < form.items.length) ? targetLineItemIndex : 0;
    setForm(prev => {
      const items = [...prev.items];
      if (items.length <= targetIdx) return prev;
      const dealLabel = prev.dealRef ? `on ${prev.dealRef} ` : '';
      items[targetIdx] = {
        ...items[targetIdx],
        description: `1 Month Rental Tenancy Brokerage ${dealLabel}(Monthly Rent: ${formatActualINR(base)})`,
        amount: amtStr
      };
      return { ...prev, items };
    });
    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Rent Brokerage Applied',
      message: `1 Month Rent (${formatActualINR(base)}) applied to Line Item #${targetIdx + 1}.`
    });
  };

  // Quick Due Date Presets
  const setDueDatePreset = (daysFromNow: number) => {
    const d = new Date(Date.now() + 86400000 * daysFromNow);
    setForm(prev => ({ ...prev, dueDate: d.toISOString().split('T')[0] }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validate Client Name
    const cleanClientName = (form.clientName || '').trim();
    if (!cleanClientName || cleanClientName.length < 2) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Client Name Required',
        message: 'Please enter the Client / Bill To Name (at least 2 characters).'
      });
      return;
    }

    // 2. Validate Client Phone
    const cleanPhone = (form.clientPhone || '').trim();
    if (!cleanPhone || !isValid10DigitPhone(cleanPhone)) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Valid Mobile Number Required',
        message: 'Please enter a valid 10-digit mobile number for the client.'
      });
      return;
    }

    // 3. Validate Line Items
    if (!form.items || form.items.length === 0) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Line Item Required',
        message: 'Please add at least one line item to this invoice.'
      });
      return;
    }

    const hasEmptyDescription = form.items.some(it => !it.description || !it.description.trim());
    if (hasEmptyDescription) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Description Missing',
        message: 'All line items must have a service description or particulars.'
      });
      return;
    }

    const validItemsWithAmount = form.items.filter(it => (parseFloat(it.amount) || 0) > 0);
    if (validItemsWithAmount.length === 0) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Taxable Amount Required',
        message: 'Please enter a taxable amount greater than ₹0 on at least one line item.'
      });
      return;
    }

    // 4. Validate Total Payable
    if (formCalculations.totalAmount <= 0) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Invoice Total Zero',
        message: 'Total invoice payable amount must be greater than ₹0.'
      });
      return;
    }

    // 5. Validate Dates
    if (!form.issueDate || !form.dueDate) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Dates Required',
        message: 'Please specify both the Issue Date and Due Date.'
      });
      return;
    }

    const method = editingInvoice ? 'PUT' : 'POST';

    // Parse sanitized items
    const parsedItems: InvoiceItem[] = form.items.map((it, idx) => ({
      id: it.id || `item_${idx + 1}`,
      description: it.description?.trim() || 'Professional Real Estate Brokerage Advisory',
      sacCode: it.sacCode?.trim() || invoiceSettings.sacCode || '997221',
      amount: parseFloat(it.amount) || 0
    }));

    const isGstEnabled = Boolean(invoiceSettings.enableGstTaxation);

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
      taxType: isGstEnabled ? form.taxType : 'none',
      taxRate: isGstEnabled && form.taxRate !== 'none' ? (parseFloat(form.taxRate) || 0) : 0,
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
          message: `Invoice #${form.number} saved with total ${formatActualINR(formCalculations.totalAmount)}.`
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
    const taxRate = Number(inv.taxRate ?? 0);
    const taxType = inv.taxType || 'none';
    const isInter = taxType === 'inter';
    const isExempt = taxType === 'exempt';
    const isNoTax = taxType === 'none' || taxType === 'not_applicable' || isExempt || taxRate === 0;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (!isNoTax) {
      if (isInter) {
        igst = subtotal * (taxRate / 100);
      } else {
        cgst = subtotal * (taxRate / 200);
        sgst = subtotal * (taxRate / 200);
      }
    }

    const total = inv.totalAmount !== undefined ? Number(inv.totalAmount) : (subtotal + cgst + sgst + igst);
    return { subtotal, cgst, sgst, igst, total, isInter, isExempt, isNoTax, taxRate, taxType };
  };

  const handleWhatsAppShare = (inv: Invoice) => {
    const { subtotal, total, taxRate } = getInvoiceAmounts(inv);
    const phone = inv.clientPhone ? inv.clientPhone.replace(/[^0-9]/g, '') : '';
    const phoneTarget = phone ? (phone.startsWith('91') ? phone : `91${phone}`) : '';
    const firmName = invoiceSettings.agencyName || agencyInfo.name;
    const accType = invoiceSettings.accountType || 'Current';

    const msg = `Dear *${inv.clientName}*,\n\nGreetings from *${firmName}*!\n\nHere are the details of your Official Commission Invoice *#${inv.number}* for real estate advisory services:\n\n• *Deal / Transaction:* ${inv.dealRef || 'Exclusive Advisory Mandate'}\n• *Taxable Base Value:* ${formatActualINR(subtotal)}\n• *GST Rate:* ${taxRate}% GST\n• *TOTAL AMOUNT PAYABLE:* *${formatActualINR(total)}* (${formatINRFull(total)})\n• *Due Date:* ${inv.dueDate}\n• *Billing Status:* ${inv.status.toUpperCase()}\n\n*Bank Remittance Details (${accType} A/c):*\n• *Account Name:* ${invoiceSettings.accountName}\n• *Bank:* ${invoiceSettings.bankName}\n• *Account Number:* ${invoiceSettings.accountNumber}\n• *IFSC Code:* ${invoiceSettings.ifscCode}${invoiceSettings.upiId ? `\n• *UPI ID:* ${invoiceSettings.upiId}` : ''}\n\nKindly process remittance via RTGS/NEFT or UPI and share the UTR reference for receipt generation.\n\nThank you for choosing *${firmName}*!`;

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
    const text = `Tax Invoice #${inv.number} | Client: ${inv.clientName} | Total Payable: ${formatActualINR(total)} (${formatINRFull(total)}) | Due: ${inv.dueDate} | Bank: ${invoiceSettings.bankName} A/c: ${invoiceSettings.accountNumber} IFSC: ${invoiceSettings.ifscCode}`;
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.length };
    invoiceStatuses.forEach(st => {
      counts[st] = data.filter(inv => inv.status === st).length;
    });
    return counts;
  }, [data, invoiceStatuses]);

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
        const { subtotal, total, taxRate, isNoTax } = getInvoiceAmounts(r);
        return (
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
              {formatActualINR(total)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 1 }}>
              Base: {formatActualINR(subtotal)}{!isNoTax && taxRate > 0 ? ` + ${taxRate}% GST` : ''}
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
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{formatActualINR(stats.totalBilled)}</div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>Across {data.length} total billings</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>Total Collected (Paid)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{formatActualINR(stats.totalCollected)}</div>
            <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginTop: 3 }}>{stats.paidCount} cleared remittances</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 }}>Accounts Receivable</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{formatActualINR(stats.totalPending)}</div>
            <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600, marginTop: 3 }}>{stats.pendingCount} pending payment</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>Overdue Invoices</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{stats.overdueCount} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>invoices</span></div>
            <div style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600, marginTop: 3 }}>Immediate follow-up needed</div>
          </div>
        </div>

        {/* Unified Compact Filter Bar Card */}
        <div className="unified-filter-card" style={{ marginBottom: 20 }}>
          {/* Row 1: Search + Sort + Reset */}
          <div className="unified-filter-row-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 'min(280px, 100%)' }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search invoices by invoice #, client, GSTIN, or deal..."
                maxWidth={380}
              />
              <span style={{ fontSize: 12, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: 9999, fontWeight: 500, whiteSpace: 'nowrap' }}>
                Showing <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> of {data.length} invoices
              </span>
            </div>

            <div className="unified-filter-controls">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="unified-filter-select"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="amount_desc">Amount: High → Low</option>
                <option value="amount_asc">Amount: Low → High</option>
                <option value="client_asc">Client Name (A → Z)</option>
                <option value="due_date_asc">Due Date: Earliest</option>
                <option value="due_date_desc">Due Date: Latest</option>
              </select>

              {(searchQuery.trim() !== '' || statusFilter !== 'All') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '7px',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Status Filter Pills in a Compact Horizontal Strip */}
          <div className="unified-filter-row-bottom">
            <FilterTabs
              label="Status:"
              size="sm"
              useStatusColors={true}
              tabs={[
                { id: 'All', label: 'All Invoices', count: statusCounts.all },
                ...invoiceStatuses.map(s => ({
                  id: s,
                  label: s,
                  count: statusCounts[s] ?? 0
                }))
              ]}
              activeTab={statusFilter}
              onChange={(tabId) => setStatusFilter(tabId)}
            />
          </div>
        </div>

        {/* Data Table & Mobile Cards */}
        <div style={{ paddingBottom: 30 }}>
          <div className="desktop-only-table">
            <DataTable
              columns={columns}
              data={filteredData}
              loading={loading}
              emptyMessage="No invoices found. Issue your first brokerage commission invoice."
            />
          </div>

          <div className="mobile-only-cards">
            {filteredData.length === 0 ? (
              <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No invoices found</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or search query.</div>
              </div>
            ) : (
              filteredData.map(inv => {
                const subtotal = inv.items?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || inv.amount;
                const isNoTax = inv.taxType === 'none';
                const taxRate = isNoTax ? 0 : (Number(inv.taxRate) || 18);
                const taxAmount = isNoTax ? 0 : Math.round(subtotal * (taxRate / 100));
                const total = subtotal + taxAmount;
                const isPastDue = new Date(inv.dueDate) < new Date() && inv.status !== 'Paid';
                const statusStyle = getStatusColorStyle(inv.status);

                return (
                  <div
                    key={`m-inv-${inv.id}`}
                    onClick={() => setSelectedInvoiceForPrint(inv)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      padding: '14px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      cursor: 'pointer'
                    }}
                  >
                    {/* Header: Invoice # and Status Dropdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          #{inv.number}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          {inv.issueDate}
                        </span>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <select
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv, e.target.value)}
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1.5px solid ${statusStyle.border}`,
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {invoiceStatuses.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Client & Deal Information */}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        {inv.clientName}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {inv.dealRef && <span>Deal: <strong style={{ color: '#334155' }}>{inv.dealRef}</strong></span>}
                        {inv.clientPhone && <span>• {inv.clientPhone}</span>}
                      </div>
                    </div>

                    {/* Financial Summary Box */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #f1f5f9'
                    }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                          Amount Due
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                          {formatActualINR(total)}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                          Base: {formatActualINR(subtotal)}{!isNoTax && taxRate > 0 ? ` + ${taxRate}% GST` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: isPastDue ? '#dc2626' : '#64748b' }}>
                          {isPastDue ? 'OVERDUE' : 'Due Date'}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isPastDue ? '#dc2626' : '#334155', marginTop: 2 }}>
                          {inv.dueDate}
                        </div>
                      </div>
                    </div>

                    {/* Touch Action Buttons Row (min 44px height for touch accessibility) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, paddingTop: 4 }} onClick={e => e.stopPropagation()}>
                      {/* WhatsApp Share */}
                      <button
                        type="button"
                        onClick={() => setSharingInvoice(inv)}
                        title="Share on WhatsApp"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          minHeight: 44,
                          borderRadius: 8,
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#059669',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        <WhatsAppIcon size={15} color="#059669" />
                        <span>WA</span>
                      </button>

                      {/* View / Print */}
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        title="View / Print PDF"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          minHeight: 44,
                          borderRadius: 8,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        <PrinterIcon size={14} color="#475569" />
                        <span>View</span>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(inv)}
                        title="Edit Invoice"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          minHeight: 44,
                          borderRadius: 8,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        <EditIcon size={14} color="#475569" />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(inv.id, inv.number)}
                        title="Delete Invoice"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          minHeight: 44,
                          borderRadius: 8,
                          backgroundColor: '#fff1f2',
                          border: '1px solid #fecdd3',
                          color: '#dc2626',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        <TrashIcon size={14} color="#dc2626" />
                        <span>Del</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* CREATE / EDIT INVOICE MODAL */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="invoice-editor-modal animate-enter"
            style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxWidth: 880, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--primary-light, #ecfdf5)', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileTextIcon size={20} color="var(--primary, #059669)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap' }}>
                      {editingInvoice ? `Edit Tax Invoice #${form.number}` : 'Create Tax Invoice'}
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, backgroundColor: 'var(--primary-light, #ecfdf5)', color: 'var(--primary-text, var(--primary, #059669))', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', whiteSpace: 'nowrap' }}>
                      RERA &amp; GST Compliant
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Generate real estate brokerage commission invoice with automatic GST calculations
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {/* Invoice Number Badge with Regenerate */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#475569', whiteSpace: 'nowrap' }}>Invoice #:</span>
                  <input
                    value={form.number}
                    onChange={e => setForm({ ...form, number: e.target.value })}
                    style={{ width: 120, border: 'none', background: 'transparent', fontWeight: 800, color: '#0f172a', fontSize: 12.5, outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, number: generateInvoiceNumber() }))}
                    title="Generate new invoice sequence"
                    style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <RotateCcwIcon size={13} color="#059669" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Close modal"
                >
                  <XIcon size={20} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Modal Form Body: Single comfortable, spacious flow */}
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* SECTION 1: BILLED CLIENT DETAILS */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <UsersIcon size={15} color="#059669" />
                    <span>Billed To (Client &amp; Entity Details)</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Search CRM client or enter details manually</span>
                </div>

                {/* CRM Client Autocomplete Dropdown */}
                <div style={{ marginBottom: 14 }}>
                  <SearchableCombobox
                    label="Select Registered CRM Client (Auto-fill)"
                    value={form.clientName}
                    placeholder="Search existing clients by name or phone..."
                    searchPlaceholder="Type client name or phone..."
                    options={crmClients.map(c => ({
                      value: c.name,
                      label: c.name,
                      sublabel: c.phone || 'No phone',
                      badge: (c as any).type || (c as any).status || 'Client'
                    }))}
                    onChange={(val, opt) => {
                      if (!val) {
                        setForm(prev => ({ ...prev, clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', clientGstin: '' }));
                        return;
                      }
                      const matched = crmClients.find(c => c.name === val);
                      const phoneVal = (matched && matched.phone) || (opt?.sublabel && opt.sublabel !== 'No phone' ? opt.sublabel : form.clientPhone);
                      setForm(prev => ({
                        ...prev,
                        clientName: val,
                        clientPhone: phoneVal,
                        clientEmail: (matched && matched.email) || prev.clientEmail,
                        clientAddress: (matched && matched.address) || prev.clientAddress,
                        clientGstin: (matched && matched.gstin) || prev.clientGstin
                      }));
                    }}
                  />
                </div>

                {/* 2-Column Inputs for Name & Phone */}
                <div className="responsive-grid-2" style={{ gap: 14, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Client / Entity Legal Name *
                    </label>
                    <input
                      required
                      value={form.clientName}
                      onChange={e => setForm({ ...form, clientName: e.target.value })}
                      placeholder="e.g. Vikram Malhotra / Indus Ventures Pvt Ltd"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Client WhatsApp / Phone
                    </label>
                    <PhoneInput
                      value={form.clientPhone || ''}
                      onChange={(full) => setForm({ ...form, clientPhone: full })}
                      placeholder="98200 45678"
                    />
                  </div>
                </div>

                {/* 2-Column Inputs for Email & GSTIN */}
                <div className="responsive-grid-2" style={{ gap: 14, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                      placeholder="vikram@example.com"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Client GSTIN <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional for B2B)</span>
                    </label>
                    <input
                      value={form.clientGstin}
                      onChange={e => setForm({ ...form, clientGstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 27AAACN1234F1Z1"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none', letterSpacing: '0.04em' }}
                    />
                  </div>
                </div>

                {/* Full Width Address */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Billing Address
                  </label>
                  <input
                    value={form.clientAddress}
                    onChange={e => setForm({ ...form, clientAddress: e.target.value })}
                    placeholder="e.g. Flat 1402, Lodha Park Tower 2, Worli, Mumbai 400018"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* SECTION 2: LINKED PROPERTY / DEAL & 1-CLICK COMMISSION CALCULATOR */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <BuildingIcon size={15} color="#059669" />
                    <span>Transaction &amp; Deal Reference (Optional)</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>1-Click calculate brokerage into line items</span>
                </div>

                {/* Property / Deal Dropdown */}
                <div style={{ marginBottom: 12 }}>
                  <SearchableCombobox
                    label="Link Property Asset or Pipeline Deal"
                    value={form.dealRef}
                    placeholder="Select property or closed deal from CRM (optional)..."
                    searchPlaceholder="Type property title or deal..."
                    options={[
                      ...crmProperties.map(p => ({
                        value: p.title,
                        label: p.title,
                        sublabel: `${p.locality || p.city || 'Prime Location'} • ${p.bhk || p.purpose || 'Property'}`,
                        badge: p.price ? formatActualINR(p.price) : 'Property'
                      })),
                      ...crmDeals.map(d => ({
                        value: d.title,
                        label: d.title,
                        sublabel: d.clientName ? `Deal for ${d.clientName}` : 'Pipeline Deal',
                        badge: d.amount ? formatActualINR(d.amount) : 'Deal'
                      }))
                    ]}
                    onChange={(val) => {
                      setForm(prev => ({ ...prev, dealRef: val }));
                      const matchProp = crmProperties.find(p => p.title === val);
                      const matchDeal = crmDeals.find(d => d.title === val);
                      const priceVal = matchProp?.price || matchDeal?.amount;
                      if (priceVal) {
                        setCalcBasePrice(priceVal.toString());
                      }
                    }}
                  />
                </div>

                {/* Deal Value & Quick Percentage Buttons */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  
                  {/* Top row: Deal Value input + Target Line Item Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                        Deal / Transaction Value (₹)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={calcBasePrice}
                        onKeyDown={(e) => {
                          if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                          }
                          if (e.key === '.' && calcBasePrice.includes('.')) {
                            e.preventDefault();
                          }
                        }}
                        onChange={e => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) {
                            val = parts[0] + '.' + parts.slice(1).join('');
                          }
                          setCalcBasePrice(val);
                        }}
                        placeholder="e.g. 999999"
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #86efac', borderRadius: 6, fontSize: 13, backgroundColor: '#ffffff', fontWeight: 700, color: '#166534', outline: 'none' }}
                      />
                      {calcBasePrice && !isNaN(parseFloat(calcBasePrice)) && parseFloat(calcBasePrice) > 0 && (
                        <div style={{ fontSize: 11, color: '#15803d', fontWeight: 700, marginTop: 4 }}>
                          Actual Amount: {formatActualINR(calcBasePrice)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                        Apply Brokerage To Line Item
                      </label>
                      <select
                        value={targetLineItemIndex}
                        onChange={e => setTargetLineItemIndex(parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #86efac', borderRadius: 6, fontSize: 12.5, backgroundColor: '#ffffff', fontWeight: 700, color: '#166534', outline: 'none' }}
                      >
                        {form.items.map((it, idx) => (
                          <option key={it.id || idx} value={idx}>
                            Line Item #{idx + 1}{it.description ? ` (${it.description.slice(0, 24)}${it.description.length > 24 ? '...' : ''})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Second row: Preset buttons + Custom Percentage Input */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #dcfce7', paddingTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', marginRight: 4 }}>
                        Presets:
                      </span>
                      {[
                        { label: '1% Brokerage', pct: 1 },
                        { label: '2% Brokerage', pct: 2 },
                        { label: '3% Brokerage', pct: 3 }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => applyCommission(item.pct)}
                          style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid #16a34a', backgroundColor: '#ffffff', color: '#166534', whiteSpace: 'nowrap' }}
                        >
                          {item.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={applyRentalCommission}
                        style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid #16a34a', backgroundColor: '#ffffff', color: '#166534', whiteSpace: 'nowrap' }}
                      >
                        1 Month Rent
                      </button>
                    </div>

                    {/* Custom Percentage Input & Apply */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#166534' }}>
                        Custom %:
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={customPercentage}
                        onChange={e => setCustomPercentage(e.target.value)}
                        placeholder="e.g. 1.5"
                        style={{ width: 75, padding: '5px 8px', border: '1px solid #86efac', borderRadius: 6, fontSize: 12, backgroundColor: '#ffffff', fontWeight: 700, color: '#166534', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const p = parseFloat(customPercentage);
                          if (isNaN(p) || p <= 0) {
                            setToast({ id: Date.now().toString(), type: 'info', title: 'Enter Percentage', message: 'Please enter a valid custom percentage (e.g. 1.5 or 2.5).' });
                            return;
                          }
                          applyCommission(p);
                        }}
                        style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', whiteSpace: 'nowrap' }}
                      >
                        Apply %
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 3: SERVICES & LINE ITEMS TABLE (FULL WIDTH & SPACIOUS) */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <BriefcaseIcon size={15} color="var(--primary, #059669)" />
                    <span>Advisory Services &amp; Line Items</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary-text, var(--primary, #059669))', background: 'none', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', padding: '5px 12px', borderRadius: 6, backgroundColor: 'var(--primary-light, #ecfdf5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <PlusIcon size={14} color="var(--primary, #059669)" />
                    <span>Add Line Item</span>
                  </button>
                </div>

                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 130px 170px 36px', gap: 10, padding: '6px 10px', fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Service Description / Particulars</span>
                  <span style={{ textAlign: 'center' }}>SAC / HSN Code</span>
                  <span style={{ textAlign: 'right' }}>Taxable Amount (₹)</span>
                  <span></span>
                </div>

                {/* Line Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {form.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) 130px 170px 36px',
                        gap: 10,
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <input
                          required
                          value={it.description}
                          onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                          placeholder="e.g. Real Estate Acquisition & Brokerage Advisory"
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                        />
                      </div>
                      <div>
                        <input
                          value={it.sacCode}
                          onChange={e => handleUpdateItem(idx, 'sacCode', e.target.value)}
                          placeholder="998224"
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5, textAlign: 'center', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <input
                          required
                          type="text"
                          inputMode="decimal"
                          value={it.amount}
                          onKeyDown={(e) => {
                            if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                              e.preventDefault();
                            }
                            if (e.key === '.' && it.amount.includes('.')) {
                              e.preventDefault();
                            }
                          }}
                          onChange={e => {
                            let val = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) {
                              val = parts[0] + '.' + parts.slice(1).join('');
                            }
                            handleUpdateItem(idx, 'amount', val);
                          }}
                          placeholder="0.00"
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, fontWeight: 700, textAlign: 'right', outline: 'none' }}
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
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remove Line Item"
                        >
                          <TrashIcon size={16} color="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: INVOICE TERMS & TOTALS (2-COLUMN BALANCED BOTTOM SECTION) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 1fr)', gap: 16, alignItems: 'start' }} className="invoice-modal-grid">
                
                {/* LEFT BOX: Dates, Tax Regime, Status & Payment Clearance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  
                  {/* DATES & STATUS */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarIcon size={14} color="#059669" />
                      <span>Invoice Schedule &amp; Status</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 3 }}>Issue Date *</label>
                        <input
                          required
                          type="date"
                          value={form.issueDate}
                          onChange={e => setForm({ ...form, issueDate: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 3 }}>Due Date *</label>
                        <input
                          required
                          type="date"
                          value={form.dueDate}
                          onChange={e => setForm({ ...form, dueDate: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Quick Due Date Presets */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      <button type="button" onClick={() => setDueDatePreset(0)} style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 5, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>Today</button>
                      <button type="button" onClick={() => setDueDatePreset(7)} style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 5, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>+7 Days</button>
                      <button type="button" onClick={() => setDueDatePreset(14)} style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 5, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>+14 Days</button>
                      <button type="button" onClick={() => setDueDatePreset(30)} style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 5, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>+30 Days</button>
                    </div>

                    {/* Status Pill Buttons */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>Payment Status</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {invoiceStatuses.map(s => {
                          const isSel = form.status === s;
                          const col = getStatusColorStyle(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, status: s }))}
                              style={{
                                flex: '1 1 auto',
                                minWidth: 70,
                                padding: '6px 10px',
                                borderRadius: 7,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: isSel ? `2px solid ${col.text}` : '1px solid #cbd5e1',
                                backgroundColor: isSel ? col.bg : '#ffffff',
                                color: isSel ? col.text : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: col.dot }} />
                              {s}
                            </button>
                          );
                        })}
                      </div>

                      {/* If editing and status is not in current list */}
                      {!invoiceStatuses.includes(form.status) && (
                        <div style={{ marginTop: 6, fontSize: 11.5, color: '#dc2626', fontWeight: 700 }}>
                          Current Status: {form.status}
                        </div>
                      )}
                    </div>

                    {/* Payment Clearance Details (if Paid) */}
                    {form.status === 'Paid' && (
                      <div style={{ marginTop: 12, padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 8 }}>
                          Payment Clearance Details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>Payment Date</label>
                            <input
                              type="date"
                              value={form.paymentDate}
                              onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                              style={{ width: '100%', padding: '5px 8px', border: '1px solid #86efac', borderRadius: 6, fontSize: 11.5 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>Payment Mode</label>
                            <select
                              value={form.paymentMode}
                              onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                              style={{ width: '100%', padding: '5px 8px', border: '1px solid #86efac', borderRadius: 6, fontSize: 11.5, backgroundColor: '#fff' }}
                            >
                              <option value="NEFT / RTGS">NEFT / RTGS Transfer</option>
                              <option value="UPI">UPI / QR Remittance</option>
                              <option value="Cheque">Corporate Cheque</option>
                              <option value="Escrow Transfer">Direct Escrow Transfer</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>UTR / Transaction Ref #</label>
                          <input
                            value={form.paymentRef}
                            onChange={e => setForm({ ...form, paymentRef: e.target.value })}
                            placeholder="e.g. HDFC984210"
                            style={{ width: '100%', padding: '5px 8px', border: '1px solid #86efac', borderRadius: 6, fontSize: 11.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BANK INSTRUCTIONS / NOTES */}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Payment Terms &amp; Bank Remittance Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="Bank account, RTGS IFSC, escrow terms..."
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, resize: 'vertical', outline: 'none' }}
                    />
                  </div>

                </div>

                {/* RIGHT BOX: GST Taxation & Live Breakdown Card */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      GST Taxation &amp; Place of Supply
                    </div>
                    {invoiceSettings.enableGstTaxation ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 4 }}>
                        Module Active
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4 }}>
                        Disabled
                      </span>
                    )}
                  </div>

                  {!invoiceSettings.enableGstTaxation ? (
                    <div style={{ backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 10, padding: '16px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        GST Taxation &amp; Place of Supply is Disabled
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>
                        GST tax calculation and place of supply breakdown are currently turned off for this agency. Invoices will be issued with ₹0 tax.
                      </div>
                      <a
                        href="/dashboard/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-text, var(--primary, #059669))', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', backgroundColor: 'var(--primary-light, #ecfdf5)', border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)', borderRadius: 6 }}
                      >
                        Enable in Invoice Settings →
                      </a>
                    </div>
                  ) : (
                    /* Supply Type & Tax Rate */
                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 3 }}>Supply Type</label>
                        <select
                          value={form.taxType}
                          onChange={e => {
                            const val = e.target.value as any;
                            setForm(prev => ({
                              ...prev,
                              taxType: val,
                              taxRate: val === 'exempt' ? '0' : prev.taxRate
                            }));
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, backgroundColor: '#ffffff', outline: 'none' }}
                        >
                          <option value="none">None</option>
                          <option value="inter">Inter State (IGST)</option>
                          <option value="intra">Intra State (CGST + SGST)</option>
                          <option value="exempt">Exempt</option>
                          <option value="not_applicable">Not Applicable</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 3 }}>Tax Rate</label>
                        <select
                          disabled={form.taxType === 'exempt' || form.taxType === 'not_applicable' || form.taxType === 'none'}
                          value={form.taxRate}
                          onChange={e => setForm({ ...form, taxRate: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, backgroundColor: (form.taxType === 'exempt' || form.taxType === 'not_applicable' || form.taxType === 'none') ? '#f1f5f9' : '#ffffff', outline: 'none' }}
                        >
                          <option value="none">None</option>
                          <option value="18">18% Standard GST</option>
                          <option value="6">6% Composition Scheme</option>
                          <option value="0">0% Exempt</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* LIVE FINANCIAL CALCULATION SUMMARY CARD */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: '14px 16px', marginTop: 4 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                      Tax Invoice Financial Summary
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12.5 }}>
                      <span style={{ color: '#64748b' }}>Taxable Subtotal:</span>
                      <strong style={{ color: '#0f172a' }}>{formatINRFull(formCalculations.subtotal)}</strong>
                    </div>

                    {invoiceSettings.enableGstTaxation && form.taxType === 'intra' && form.taxRate !== 'none' && form.taxRate !== '0' && (
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

                    {invoiceSettings.enableGstTaxation && form.taxType === 'inter' && form.taxRate !== 'none' && form.taxRate !== '0' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>IGST ({parseFloat(form.taxRate)}%):</span>
                        <span>{formatINRFull(formCalculations.igst)}</span>
                      </div>
                    )}

                    {(!invoiceSettings.enableGstTaxation || form.taxType === 'none' || form.taxType === 'not_applicable') && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12, color: '#64748b' }}>
                        <span>Taxes (GST):</span>
                        <span>₹0.00 ({!invoiceSettings.enableGstTaxation ? 'GST Disabled' : 'None / NA'})</span>
                      </div>
                    )}

                    {invoiceSettings.enableGstTaxation && (form.taxType === 'exempt' || form.taxRate === '0') && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12, color: '#059669' }}>
                        <span>GST Exemption:</span>
                        <span>₹0.00 (0% Exempt)</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px', borderTop: '2px solid #0f172a', marginTop: 8, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>Total Amount Payable:</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>{formatINRFull(formCalculations.totalAmount)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', textAlign: 'right', marginTop: 4 }}>
                      {formCalculations.inWords}
                    </div>
                  </div>

                </div>

              </div>
            </form>

            {/* Modal Actions Footer (Fixed at Bottom) */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Total Payable:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>{formatINRFull(formCalculations.totalAmount)}</span>
                <span>•</span>
                <span>{form.items.length} {form.items.length === 1 ? 'Line Item' : 'Line Items'}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit as any}
                  style={{ padding: '9px 24px', borderRadius: 8, border: 'none', backgroundColor: 'var(--primary, #059669)', color: '#ffffff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 4px rgba(5,150,105,0.2)' }}
                >
                  {editingInvoice ? 'Update Invoice' : 'Issue Tax Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE / OFFICIAL TAX INVOICE PREVIEW MODAL */}
      {selectedInvoiceForPrint && (() => {
        const inv = selectedInvoiceForPrint;
        const { subtotal, cgst, sgst, igst, total, isInter, isExempt, isNoTax, taxRate } = getInvoiceAmounts(inv);
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

                    {!isInter && !isExempt && !isNoTax && (cgst > 0 || sgst > 0) && (
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

                    {isInter && !isExempt && !isNoTax && igst > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span style={{ color: '#64748b' }}>IGST ({taxRate}%):</span>
                        <span>{formatINRFull(igst)}</span>
                      </div>
                    )}

                    {isExempt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#059669' }}>
                        <span>GST Exemption:</span>
                        <span>₹0.00 (Exempt)</span>
                      </div>
                    )}

                    {isNoTax && !isExempt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                        <span>Taxes:</span>
                        <span>₹0.00</span>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      {invoiceSettings.bankName && (
                        <span>Bank: <strong>{invoiceSettings.bankName}</strong></span>
                      )}
                      {invoiceSettings.bankName && invoiceSettings.accountNumber && <span>•</span>}
                      {invoiceSettings.accountNumber && (
                        <span>{invoiceSettings.accountType || 'Current'} A/c No: <strong>{invoiceSettings.accountNumber}</strong></span>
                      )}
                      {(invoiceSettings.bankName || invoiceSettings.accountNumber) && invoiceSettings.ifscCode && <span>•</span>}
                      {invoiceSettings.ifscCode && (
                        <span>IFSC: <strong>{invoiceSettings.ifscCode}</strong></span>
                      )}
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

        const defaultMsg = `Dear *${inv.clientName}*,\n\nGreetings from *${firmName}*!\n\nHere are the details of your Official Commission Invoice *#${inv.number}* for real estate advisory services:\n\n• *Deal / Transaction:* ${inv.dealRef || 'Exclusive Advisory Mandate'}\n• *Taxable Base Value:* ${formatActualINR(subtotal)}\n• *GST Rate:* ${taxRate}% GST\n• *TOTAL AMOUNT PAYABLE:* *${formatActualINR(total)}* (${formatINRFull(total)})\n• *Due Date:* ${inv.dueDate}\n• *Billing Status:* ${inv.status.toUpperCase()}\n\n*Bank Remittance Details (${accType} A/c):*\n• *Account Name:* ${invoiceSettings.accountName}\n• *Bank:* ${invoiceSettings.bankName}\n• *Account Number:* ${invoiceSettings.accountNumber}\n• *IFSC Code:* ${invoiceSettings.ifscCode}${invoiceSettings.upiId ? `\n• *UPI ID:* ${invoiceSettings.upiId}` : ''}\n\nKindly process remittance via RTGS/NEFT or UPI and share the UTR reference for receipt generation.\n\nThank you for choosing *${firmName}*!`;

        return (
          <ShareModal
            isOpen={!!sharingInvoice}
            onClose={() => setSharingInvoice(null)}
            shareItem={{
              id: inv.id,
              type: 'invoice',
              title: `Tax Invoice #${inv.number} • ${inv.clientName}`,
              subtitle: `Total Payable: ${formatActualINR(total)} • Due: ${inv.dueDate} • Status: ${inv.status}`,
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
