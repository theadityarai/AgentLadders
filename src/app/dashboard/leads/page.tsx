'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  formatINR,
  TOP_INDIAN_CITIES,
  CITY_LOCALITIES,
  INDIAN_BHK_OPTIONS
} from '@/lib/formatters';
import { findMatchingPropertiesForLead } from '@/lib/match-engine';
import { openWhatsAppDirect } from '@/lib/whatsapp-engine';

interface Lead {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  leadPurpose?: 'Buy' | 'Rent';
  city?: string;
  preferredLocalities?: string[] | string;
  bhkNeeded?: string | string[];
  propertyTypeNeeded?: string;
  bedroomsNeeded?: string;
  budget?: number | string;
  budgetMin?: number | string;
  budgetMax?: number | string;
  financingStatus?: string;
  urgency?: string;
  vastuPreference?: string;
  locationPreference?: string;
  priority?: string;
  assignedTo?: string;
  nextFollowUp?: string;
  notes?: string;
  requirement?: string;
}

interface Property {
  id: string;
  title: string;
  purpose?: string;
  type?: string;
  bhk?: string;
  bedrooms?: number | string;
  city?: string;
  locality?: string;
  location?: string;
  price: number;
  carpetAreaSqFt?: number | string;
  areaSqFt?: number | string;
  vastuFacing?: string;
  reraId?: string;
  status: string;
  media?: Array<{ url: string; isCover?: boolean; tag?: string }>;
  images?: string[];
  publicToken?: string;
}

const LEAD_STATUSES = ['New Inbound', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Done', 'Offer Made', 'Won', 'Lost'];
const FINANCING_OPTIONS = [
  'Pre-Approved Home Loan (HDFC / ICICI / SBI)',
  '100% Self-Funded / Equity / ESOPs',
  'Home Loan in Process',
  'Company / MNC Corporate Lease',
  'Exploring Financing'
];

export default function LeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertFeedback, setConvertFeedback] = useState<string | null>(null);

  // Matching properties drawer / modal for a selected lead
  const [matchingModalLead, setMatchingModalLead] = useState<Lead | null>(null);

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    leadPurpose: 'Buy' as 'Buy' | 'Rent',
    city: 'Mumbai',
    preferredLocalities: 'Worli, Lower Parel',
    bhkNeeded: '3 BHK',
    propertyTypeNeeded: 'Apartment',
    budgetMin: '30000000',
    budgetMax: '45000000',
    financingStatus: 'Pre-Approved Home Loan (HDFC / ICICI / SBI)',
    urgency: 'Immediate (Within 30 Days)',
    vastuPreference: 'East Facing Mandatory',
    source: 'WhatsApp Referral',
    status: 'Qualified',
    priority: 'Hot 🔥',
    assignedTo: 'Aditya Rai',
    nextFollowUp: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: '',
    requirement: 'Looking for ready luxury residence with 2 car parks.'
  };
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    try {
      const [leadsRes, propsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/properties')
      ]);

      const leadsJson = await leadsRes.json();
      const propsJson = await propsRes.json();

      if (leadsJson.leads) setData(leadsJson.leads);
      if (propsJson.properties) setProperties(propsJson.properties);
    } catch (err) {
      console.error('Failed to load leads or properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        budget: `${formatINR(Number(form.budgetMin))} - ${formatINR(Number(form.budgetMax))}`
      })
    });
    setShowModal(false);
    setForm(initialForm);
    loadData();
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    const res = await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingLead)
    });
    if (res.ok) {
      setData(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...editingLead } : l));
      setEditingLead(null);
    }
  };

  const handleQuickStatusChange = async (leadId: string, newStatus: string) => {
    setData(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, status: newStatus })
    });
  };

  const handleConvertToClient = async (lead: Lead) => {
    try {
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          type: lead.leadPurpose === 'Rent' ? 'Tenant' : 'Buyer',
          requirement: `${lead.bhkNeeded || '3 BHK'} in ${lead.preferredLocalities || lead.city || 'Prime Location'}`,
          budget: lead.budgetMax ? formatINR(Number(lead.budgetMax)) : (lead.budget || '₹2 Cr - ₹4 Cr'),
          notes: `Converted from lead. Financing: ${lead.financingStatus || 'N/A'}. Urgency: ${lead.urgency || 'N/A'}`
        })
      });

      if (clientRes.ok) {
        await handleQuickStatusChange(lead.id, 'Won');
        setConvertFeedback(`✓ Successfully converted "${lead.name}" to Active Client Directory!`);
        setTimeout(() => setConvertFeedback(null), 4000);
      }
    } catch (e) {
      console.error('Failed to convert lead:', e);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setLeadToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/leads?id=${leadToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(l => l.id !== leadToDelete.id));
    }
    setIsDeleting(false);
    setLeadToDelete(null);
  };

  // WhatsApp quick greeting
  const handleOpenLeadWhatsApp = (lead: Lead) => {
    const greeting = `Namaste ${lead.name} ji! 🙏\n\n` +
      `This is Aditya Rai from AgentLadders Real Estate Advisory.\n` +
      `I am reaching out regarding your requirement for a *${lead.bhkNeeded || 'luxury residence'}* in *${lead.city || 'India'}*.\n\n` +
      `We have verified listings matching your budget and Vastu preferences. Are you free for a quick 2-minute conversation today?`;

    openWhatsAppDirect(lead.phone, greeting);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (typeof item.preferredLocalities === 'string' && item.preferredLocalities.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCity = cityFilter === 'All' || item.city === cityFilter;
      const matchesPurpose = purposeFilter === 'All' || item.leadPurpose === purposeFilter;
      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCity && matchesPurpose && matchesStatus;
    });
  }, [data, searchQuery, cityFilter, purposeFilter, statusFilter]);

  const columns: Column<Lead>[] = [
    {
      header: 'Buyer / Contact',
      accessor: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14.5px' }}>{row.name}</span>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '9999px',
              backgroundColor: row.priority?.includes('Hot') ? '#fef2f2' : '#f8fafc',
              color: row.priority?.includes('Hot') ? '#dc2626' : '#475569',
              border: `1px solid ${row.priority?.includes('Hot') ? '#fecaca' : '#cbd5e1'}`
            }}>
              {row.priority || 'Hot 🔥'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{row.phone || 'No phone'}</span>
            {row.phone && (
              <button
                type="button"
                onClick={() => handleOpenLeadWhatsApp(row)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Send personalized WhatsApp greeting"
              >
                <span>💬</span> WhatsApp
              </button>
            )}
          </div>
          {row.email && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{row.email}</div>
          )}
        </div>
      )
    },
    {
      header: 'Requirement & Localities',
      accessor: (row) => {
        const isRent = row.leadPurpose === 'Rent';
        const localities = Array.isArray(row.preferredLocalities) 
          ? row.preferredLocalities.join(', ') 
          : (row.preferredLocalities || row.locationPreference || 'Prime Area');

        return (
          <div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: isRent ? '#f3e8ff' : '#ecfdf5',
                color: isRent ? '#7e22ce' : '#047857',
                border: `1px solid ${isRent ? '#d8b4fe' : '#a7f3d0'}`
              }}>
                {row.leadPurpose || 'Buy'}
              </span>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#2563eb' }}>
                {Array.isArray(row.bhkNeeded) ? row.bhkNeeded.join(', ') : (row.bhkNeeded || row.bedroomsNeeded || '3 BHK')}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
              📍 {localities} {row.city ? `(${row.city})` : ''}
            </div>
            {row.vastuPreference && (
              <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
                🧭 Vastu: {row.vastuPreference}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Budget & Financing',
      accessor: (row) => {
        let budgetDisplay = '₹1.50 Cr - ₹3.0 Cr';
        if (row.budgetMin && row.budgetMax) {
          budgetDisplay = `${formatINR(Number(row.budgetMin))} - ${formatINR(Number(row.budgetMax))}`;
        } else if (row.budgetMax) {
          budgetDisplay = `Up to ${formatINR(Number(row.budgetMax))}`;
        } else if (row.budget) {
          budgetDisplay = String(row.budget);
        }

        return (
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
              {budgetDisplay}
            </div>
            <span style={{
              fontSize: '11px',
              color: '#065f46',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '2px 6px',
              borderRadius: '4px',
              marginTop: '3px',
              display: 'inline-block',
              fontWeight: 600
            }}>
              ✓ {row.financingStatus || 'Self-Funded'}
            </span>
            {row.urgency && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                ⏱ {row.urgency}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Live Property Match',
      accessor: (row) => {
        const matchingProps = findMatchingPropertiesForLead(row as any, properties as any);
        const hasMatches = matchingProps.length > 0;

        return (
          <div>
            <button
              type="button"
              onClick={() => setMatchingModalLead(row)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                border: hasMatches ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                backgroundColor: hasMatches ? '#fff7ed' : '#f8fafc',
                color: hasMatches ? '#c2410c' : '#64748b',
                cursor: 'pointer'
              }}
              title="Click to view exact inventory flats matching this buyer"
            >
              <span>{hasMatches ? '🔥' : '🏢'}</span>
              <span>{matchingProps.length} {matchingProps.length === 1 ? 'Match' : 'Matches'}</span>
            </button>
            {hasMatches && (
              <div style={{ fontSize: '10.5px', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
                Top: {matchingProps[0].propertyTitle.slice(0, 24)}... ({matchingProps[0].matchScore}%)
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Stage Status',
      accessor: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleQuickStatusChange(row.id, e.target.value)}
          style={{
            padding: '5px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: row.status.includes('Won') ? '#ecfdf5' : row.status.includes('Hot') ? '#fef2f2' : '#f8fafc',
            color: row.status.includes('Won') ? '#047857' : row.status.includes('Hot') ? '#dc2626' : '#334155',
            cursor: 'pointer'
          }}
        >
          {LEAD_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          
          {/* Convert to Client */}
          {row.status !== 'Won' && (
            <button
              type="button"
              onClick={() => handleConvertToClient(row)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Convert this lead to active client directory"
            >
              <span>⭐</span> Client
            </button>
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✏️
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(row.id, row.name)}
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
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
        title="Inbound Inquiries & Buyer Requirements" 
        subtitle="Manage prospective buyers, BHK preferences, financing status, and instant property matching" 
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            🎯 + Capture Inbound Buyer
          </Button>
        } 
      />

      {/* FEEDBACK TOAST */}
      {convertFeedback && (
        <div style={{
          margin: '0 24px 16px',
          padding: '12px 18px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {convertFeedback}
        </div>
      )}

      {/* FILTER BAR */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leads by name, phone, locality (Worli, Kharadi...)..."
        filters={[
          {
            key: 'city',
            label: 'Indian City',
            value: cityFilter,
            options: [
              { label: 'All Cities', value: 'All' },
              ...TOP_INDIAN_CITIES.map(c => ({ label: c, value: c }))
            ],
            onChange: setCityFilter
          },
          {
            key: 'purpose',
            label: 'Purpose',
            value: purposeFilter,
            options: [
              { label: 'All (Buy & Rent)', value: 'All' },
              { label: 'Buy', value: 'Buy' },
              { label: 'Rent', value: 'Rent' }
            ],
            onChange: setPurposeFilter
          },
          {
            key: 'status',
            label: 'Stage Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              ...LEAD_STATUSES.map(s => ({ label: s, value: s }))
            ],
            onChange: setStatusFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setCityFilter('All');
          setPurposeFilter('All');
          setStatusFilter('All');
        }}
      />

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No leads match your filter. Click '+ Capture Inbound Buyer' to add a buyer requirement."
      />

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW INBOUND BUYER */}
      {/* ======================================================== */}
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
            maxWidth: '720px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Capture Inbound Buyer / Tenant</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Configure BHK requirements, budget range, and financing readiness</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Mobile / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98200 45678"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Purpose</label>
                  <select
                    value={form.leadPurpose}
                    onChange={e => setForm({ ...form, leadPurpose: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Buy">Looking to Buy (Outright / Resale)</option>
                    <option value="Rent">Looking to Rent (Lease)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>BHK Configuration Needed *</label>
                  <select
                    value={form.bhkNeeded}
                    onChange={e => setForm({ ...form, bhkNeeded: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {INDIAN_BHK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Indian City *</label>
                  <select
                    value={form.city}
                    onChange={e => {
                      const newCity = e.target.value;
                      const defaultLoc = (CITY_LOCALITIES[newCity] && CITY_LOCALITIES[newCity].slice(0, 2).join(', ')) || '';
                      setForm({ ...form, city: newCity, preferredLocalities: defaultLoc });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {TOP_INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Preferred Localities *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Worli, Lower Parel, Bandra West"
                    value={form.preferredLocalities}
                    onChange={e => setForm({ ...form, preferredLocalities: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  {form.city && CITY_LOCALITIES[form.city] && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                      Suggestions: {CITY_LOCALITIES[form.city].slice(0, 4).join(', ')}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Minimum Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70000000 for ₹7.0 Cr"
                    value={form.budgetMin}
                    onChange={e => setForm({ ...form, budgetMin: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                    Min: {formatINR(Number(form.budgetMin) || 0)}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Maximum Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 95000000 for ₹9.5 Cr"
                    value={form.budgetMax}
                    onChange={e => setForm({ ...form, budgetMax: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                    Max: {formatINR(Number(form.budgetMax) || 0)}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Financing Readiness</label>
                  <select
                    value={form.financingStatus}
                    onChange={e => setForm({ ...form, financingStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {FINANCING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Purchase Urgency</label>
                  <select
                    value={form.urgency}
                    onChange={e => setForm({ ...form, urgency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Immediate (Within 30 Days)">Immediate (Within 30 Days)</option>
                    <option value="Within 45 Days">Within 45 Days</option>
                    <option value="2 - 3 Months">2 - 3 Months</option>
                    <option value="Exploring Market">Exploring Market</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Specific Client Notes / Requirement</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Sea-facing preferred, high floor, requires 3 covered car parks, Vastu compliant entrance."
                    value={form.requirement}
                    onChange={e => setForm({ ...form, requirement: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">Save Inbound Buyer 🚀</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT INBOUND BUYER */}
      {/* ======================================================== */}
      {editingLead && (
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
            maxWidth: '720px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Edit Buyer: {editingLead.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update requirements, budget, and follow-up timeline</p>
              </div>
              <button onClick={() => setEditingLead(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleUpdateLead} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Client Name</label>
                  <input
                    type="text"
                    required
                    value={editingLead.name}
                    onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={editingLead.phone}
                    onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>BHK Needed</label>
                  <select
                    value={String(editingLead.bhkNeeded || '3 BHK')}
                    onChange={e => setEditingLead({ ...editingLead, bhkNeeded: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {INDIAN_BHK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Target Indian City</label>
                  <select
                    value={editingLead.city || 'Mumbai'}
                    onChange={e => setEditingLead({ ...editingLead, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {TOP_INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Max Budget (₹)</label>
                  <input
                    type="number"
                    value={editingLead.budgetMax ? String(editingLead.budgetMax) : ''}
                    onChange={e => setEditingLead({ ...editingLead, budgetMax: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  {editingLead.budgetMax && (
                    <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                      Formatted: {formatINR(Number(editingLead.budgetMax))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Financing Readiness</label>
                  <select
                    value={editingLead.financingStatus || 'Pre-Approved Home Loan (HDFC / ICICI / SBI)'}
                    onChange={e => setEditingLead({ ...editingLead, financingStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    {FINANCING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Requirement & Notes</label>
                  <textarea
                    rows={2}
                    value={editingLead.requirement || ''}
                    onChange={e => setEditingLead({ ...editingLead, requirement: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <Button variant="outline" type="button" onClick={() => setEditingLead(null)}>Cancel</Button>
                  <Button variant="primary" type="submit">Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: MATCHING PROPERTIES (KUNDALI FIT FOR BUYER) */}
      {/* ======================================================== */}
      {matchingModalLead && (
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
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #fed7aa',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff7ed' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🔮</span>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    Matching Properties for {matchingModalLead.name}
                  </h3>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Target: <strong style={{ color: '#2563eb' }}>{String(matchingModalLead.bhkNeeded || '3 BHK')}</strong> in {String(matchingModalLead.preferredLocalities || matchingModalLead.city || 'India')} · Budget: {matchingModalLead.budgetMax ? formatINR(Number(matchingModalLead.budgetMax)) : '₹2 Cr - ₹4 Cr'}
                </p>
              </div>
              <button onClick={() => setMatchingModalLead(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const matched = findMatchingPropertiesForLead(matchingModalLead as any, properties as any);
                if (matched.length === 0) {
                  return (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No active listings in your inventory match this buyer&apos;s BHK and budget. Add new property inventory in Properties to generate matches!
                    </div>
                  );
                }

                return matched.map(prop => (
                  <div 
                    key={prop.propertyId}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{prop.propertyTitle}</strong>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: prop.matchScore >= 90 ? '#dcfce7' : '#fef9c3',
                          color: prop.matchScore >= 90 ? '#15803d' : '#854d0e'
                        }}>
                          {prop.matchScore}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px' }}>
                        Quoting: <strong style={{ color: '#2563eb' }}>{prop.priceFormatted}</strong> · {prop.locality}, {prop.city} · {prop.bhk}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {prop.matchReasons.map((r, i) => (
                          <span key={i} style={{ fontSize: '10.5px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const pitch = `Namaste ${matchingModalLead.name} ji! 🙏\n\n` +
                          `Based on your search for a *${matchingModalLead.bhkNeeded || 'luxury residence'}* in *${prop.locality}*,\n` +
                          `we have an exclusive verified property that matches your criteria (*${prop.matchScore}% Match*):\n\n` +
                          `🏢 *${prop.propertyTitle}*\n` +
                          `💰 *Price*: ${prop.priceFormatted}\n` +
                          `📍 *Location*: ${prop.locality}, ${prop.city}\n` +
                          `🎯 *Highlights*: ${prop.matchReasons.join(' · ')}\n\n` +
                          `Would you like to schedule a private viewing today or tomorrow?`;

                        openWhatsAppDirect(matchingModalLead.phone, pitch);
                      }}
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#25d366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>💬</span> WhatsApp Pitch
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="Delete Lead"
        message={`Are you sure you want to remove "${leadToDelete?.name}" from your inquiries?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Lead'}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setLeadToDelete(null)}
      />
    </>
  );
}
