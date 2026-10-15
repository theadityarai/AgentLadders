'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { isValid10DigitPhone } from '@/lib/phone-validation';
import { formatINR } from '@/lib/formatters';

interface AgencyItem {
  id: string;
  name: string;
  subdomain?: string;
  country?: string;
  currency?: string;
  plan: string;
  status: string;
  createdAt: string;
  inviteToken?: string;
  inviteSentAt?: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  userCount: number;
  propertyCount: number;
  dealCount?: number;
  leadCount?: number;
  wonRevenue?: number;
}

interface PlatformStats {
  totalAgencies: number;
  activeAgencies: number;
  inactiveAgencies?: number;
  suspendedAgencies?: number;
  trialAgencies?: number;
  totalUsers: number;
  totalProperties: number;
  totalDeals?: number;
  totalLeads?: number;
  totalGmv?: number;
  mrr?: number;
}

interface SupportMessage {
  id: string;
  sender: string;
  isStaff: boolean;
  text: string;
  timestamp: string;
}

interface AdminTicket {
  id: string;
  ticketNumber: string;
  agencyId: string;
  agencyName: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdByName: string;
  createdByEmail?: string;
  contractType?: string;
  messages: SupportMessage[];
  createdAt: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [activeTab, setActiveTab] = useState<'agencies' | 'tickets'>('agencies');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [agencies, setAgencies] = useState<AgencyItem[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Agency Filters
  const [agencyStatusFilter, setAgencyStatusFilter] = useState('All');
  const [agencyPlanFilter, setAgencyPlanFilter] = useState('All');
  const [agencySearch, setAgencySearch] = useState('');

  // Ticket Filters
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState('All');
  const [ticketSearch, setTicketSearch] = useState('');

  // Add / Invite Agency Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [onboardMode, setOnboardMode] = useState<'invite' | 'full_setup'>('invite');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    plan: 'Professional',
    status: 'Active',
    country: 'India',
    currency: 'INR',
    seedDemoData: true
  });

  // Edit Agency Modal State
  const [editingAgency, setEditingAgency] = useState<AgencyItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    plan: 'Professional',
    status: 'Active',
    country: 'India',
    currency: 'INR'
  });
  const [isUpdatingAgency, setIsUpdatingAgency] = useState(false);

  // Delete Agency Modal State
  const [deletingAgency, setDeletingAgency] = useState<AgencyItem | null>(null);
  const [isDeletingAgency, setIsDeletingAgency] = useState(false);

  // Ticket Detail & Reply Modal State
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('In Review');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now().toString(), text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      const [statsRes, agenciesRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/agencies'),
        fetch('/api/admin/tickets')
      ]);

      if (statsRes.status === 403 || agenciesRes.status === 403) {
        // Not a super admin -> redirect away
        router.push('/login');
        return;
      }

      const statsData = await statsRes.json();
      const agenciesData = await agenciesRes.json();
      const ticketsData = await ticketsRes.json();

      setStats(statsData.stats || statsData);
      if (agenciesData.agencies) setAgencies(agenciesData.agencies);
      if (ticketsData.tickets) setTickets(ticketsData.tickets);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setOnboardMode('invite');
    setInviteSuccessLink(null);
    setFormData({
      name: '',
      subdomain: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      ownerPassword: '',
      plan: 'Professional',
      status: 'Active',
      country: 'India',
      currency: 'INR',
      seedDemoData: true
    });
    setShowAddModal(true);
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid10DigitPhone(formData.ownerPhone)) {
      showToast('Please enter a valid 10-digit official WhatsApp number for the agency', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        mode: onboardMode,
        name: formData.name.trim(),
        subdomain: formData.subdomain.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        ownerPassword: onboardMode === 'full_setup' ? formData.ownerPassword : undefined,
        plan: formData.plan,
        status: onboardMode === 'invite' ? 'Pending Invite' : formData.status,
        country: formData.country,
        currency: formData.currency,
        seedDemoData: formData.seedDemoData
      };

      const res = await fetch('/api/admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (data.inviteLink) {
          setInviteSuccessLink(data.inviteLink);
          showToast(`Agency created! Invitation link generated for ${formData.ownerEmail}.`);
        } else {
          setShowAddModal(false);
          showToast(`Agency "${formData.name}" fully onboarded and ready for login!`);
        }
        loadData();
      } else {
        showToast(data.error || 'Failed to create agency', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while creating agency', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (agencyId: string, newStatus: string) => {
    setAgencies(prev => prev.map(a => a.id === agencyId ? { ...a, status: newStatus } : a));
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agencyId, status: newStatus })
      });
      if (res.ok) {
        showToast(`Agency status updated to "${newStatus}".`);
        loadData();
      } else {
        showToast('Failed to update agency status', 'error');
        loadData();
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating status', 'error');
      loadData();
    }
  };

  const handleOpenEdit = (ag: AgencyItem) => {
    setEditingAgency(ag);
    setEditFormData({
      name: ag.name || '',
      ownerName: ag.owner?.name || ag.ownerName || '',
      ownerEmail: ag.owner?.email || ag.ownerEmail || '',
      ownerPhone: ag.owner?.phone || ag.ownerPhone || '',
      plan: ag.plan || 'Professional',
      status: ag.status || 'Active',
      country: ag.country || 'India',
      currency: ag.currency || 'INR'
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency) return;
    setIsUpdatingAgency(true);
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAgency.id,
          ...editFormData
        })
      });
      if (res.ok) {
        showToast(`Agency "${editFormData.name}" updated successfully.`);
        setEditingAgency(null);
        loadData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update agency', 'error');
      }
    } catch {
      showToast('Network error updating agency', 'error');
    } finally {
      setIsUpdatingAgency(false);
    }
  };

  const handleConfirmDeleteAgency = async () => {
    if (!deletingAgency) return;
    setIsDeletingAgency(true);
    try {
      const res = await fetch(`/api/admin/agencies?id=${encodeURIComponent(deletingAgency.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Agency "${deletingAgency.name}" permanently deleted.`);
        setAgencies(prev => prev.filter(a => a.id !== deletingAgency.id));
        setDeletingAgency(null);
        loadData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to delete agency', 'error');
      }
    } catch {
      showToast('Network error while deleting agency', 'error');
    } finally {
      setIsDeletingAgency(false);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: replyStatus,
          replyMessage: replyMessage.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setSelectedTicket(data.ticket);
        setTickets(prev => prev.map(t => t.id === data.ticket.id ? data.ticket : t));
        setReplyMessage('');
        showToast('Reply dispatched to agency helpdesk.');
      } else {
        showToast(data.error || 'Failed to send reply', 'error');
      }
    } catch {
      showToast('Network error sending reply', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

  const filteredAgencies = agencies.filter(a => {
    if (agencyStatusFilter !== 'All' && a.status !== agencyStatusFilter) return false;
    if (agencyPlanFilter !== 'All' && a.plan !== agencyPlanFilter) return false;
    if (agencySearch) {
      const q = agencySearch.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q) ||
        a.owner?.email?.toLowerCase().includes(q) ||
        a.owner?.name?.toLowerCase().includes(q) ||
        a.subdomain?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = ticketStatusFilter === 'All' || t.status === ticketStatusFilter;
    const matchesCategory = ticketCategoryFilter === 'All' || t.category === ticketCategoryFilter;
    const q = ticketSearch.toLowerCase();
    const matchesSearch = !q || 
      t.ticketNumber?.toLowerCase().includes(q) || 
      t.subject?.toLowerCase().includes(q) || 
      t.agencyName?.toLowerCase().includes(q) ||
      t.createdByName?.toLowerCase().includes(q);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusBadge = (s: string) => {
    const map: Record<string, { bg: string; color: string; dot: string }> = {
      'Active': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
      'Inactive': { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
      'Suspended': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
      'Trial': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
      'Pending Invite': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' }
    };
    const style = map[s] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: style.bg, color: style.color, padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot }} />
        {s}
      </span>
    );
  };

  if (loading || authStatus === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>Loading Super Admin HQ...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── TOPBAR (Matching AgentLadders Agency Brand Identity) ── */}
      <header style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left: Brand & Portal Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(15,23,42,0.15)'
          }}>
            ⬡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                AgentLadders HQ
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                Super Admin
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>
              Multi-Tenant Brokerage Orchestration & Central Helpdesk
            </div>
          </div>
        </div>

        {/* Right: Support Alert, Super Admin User Pill, Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Support Ticket Quick Alert */}
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: openTicketsCount > 0 ? '#fff1f2' : '#f1f5f9',
              color: openTicketsCount > 0 ? '#e11d48' : '#475569',
              border: `1px solid ${openTicketsCount > 0 ? '#fecdd3' : '#e2e8f0'}`,
              cursor: 'pointer'
            }}
          >
            <span>💬</span>
            <span>{openTicketsCount} Open {openTicketsCount === 1 ? 'Inquiry' : 'Inquiries'}</span>
          </button>

          {/* Super Admin User Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 12px 5px 6px',
            borderRadius: 30,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800
            }}>
              AR
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                {session?.user?.name || 'Aditya Rai'}
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b' }}>
                Super Administrator
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              color: '#475569',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#475569'; }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 85,
          right: 32,
          zIndex: 100,
          backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '12px 20px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.2s ease'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '32px 32px 60px', flex: 1 }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Super Admin Console
              <InfoTooltip text="Central command center for agency onboarding, subscription lifecycle, tenant access control, and central broker helpdesk." />
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
              Oversee multi-tenant agencies, provision new onboardings, enforce tenant access status, and resolve broker inquiries.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: 9,
              padding: '10px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0f172a'}
          >
            <span>✨</span>
            <span>+ Invite / Add Agency</span>
          </button>
        </div>

        {/* ── STAT CARDS GRID (Real platform aggregates) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            {
              label: 'Total Agencies',
              value: stats?.totalAgencies ?? agencies.length,
              subtext: 'Registered brokerages',
              icon: '🏢',
              color: '#2563eb',
              bg: '#eff6ff'
            },
            {
              label: 'Active Subscriptions',
              value: stats?.activeAgencies ?? agencies.filter(a => a.status === 'Active').length,
              subtext: 'Operational tenants',
              icon: '✅',
              color: '#16a34a',
              bg: '#f0fdf4'
            },
            {
              label: 'Platform Users',
              value: stats?.totalUsers ?? agencies.reduce((acc, a) => acc + (a.userCount || 1), 0),
              subtext: 'Agents & brokers active',
              icon: '👥',
              color: '#9333ea',
              bg: '#faf5ff'
            },
            {
              label: 'Listed Properties',
              value: stats?.totalProperties ?? agencies.reduce((acc, a) => acc + (a.propertyCount || 0), 0),
              subtext: 'Inventory across agencies',
              icon: '🏠',
              color: '#ea580c',
              bg: '#fff7ed'
            },
            {
              label: 'Open Inquiries',
              value: openTicketsCount,
              subtext: 'Awaiting HQ resolution',
              icon: '💬',
              color: '#e11d48',
              bg: '#fff1f2'
            },
            {
              label: 'Estimated MRR',
              value: `$${(stats?.mrr || agencies.length * 199).toLocaleString()}`,
              subtext: 'Monthly recurring revenue',
              icon: '💰',
              color: '#0891b2',
              bg: '#ecfeff'
            }
          ].map((card, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
                <span style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16
                }}>
                  {card.icon}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                {card.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS SWITCHER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('agencies')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 20,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'agencies' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'agencies' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🏢</span>
            <span>Registered Agencies</span>
            <span style={{
              fontSize: 11,
              padding: '1px 7px',
              borderRadius: 10,
              backgroundColor: activeTab === 'agencies' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
              color: activeTab === 'agencies' ? '#fff' : '#64748b'
            }}>
              {agencies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 20,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'tickets' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'tickets' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <span>💬</span>
            <span>Broker Inquiries & Helpdesk</span>
            {openTicketsCount > 0 && (
              <span style={{
                fontSize: 11,
                padding: '1px 7px',
                borderRadius: 10,
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: 800
              }}>
                {openTicketsCount} Open
              </span>
            )}
          </button>
        </div>

        {/* ── TAB 1: AGENCIES DIRECTORY ── */}
        {activeTab === 'agencies' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            
            {/* Filter Toolbar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              
              {/* Status Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: 4 }}>
                  Status:
                </span>
                {['All', 'Active', 'Inactive', 'Suspended', 'Pending Invite'].map(st => (
                  <button
                    key={st}
                    onClick={() => setAgencyStatusFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: agencyStatusFilter === st ? '#2563eb' : '#f1f5f9',
                      color: agencyStatusFilter === st ? '#fff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {st === 'All' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>

              {/* Search & Plan Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <select
                  value={agencyPlanFilter}
                  onChange={e => setAgencyPlanFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#334155',
                    backgroundColor: '#fff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Plans</option>
                  <option value="Starter">Starter Plan</option>
                  <option value="Professional">Professional Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                </select>

                <div style={{ position: 'relative', minWidth: 240 }}>
                  <span style={{ position: 'absolute', left: 10, top: 7, fontSize: 13, color: '#94a3b8' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search agency, owner, email..."
                    value={agencySearch}
                    onChange={e => setAgencySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 12px 7px 32px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 12.5,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Agency / Tenant</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Owner & Contact</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Plan</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>
                      Access Status <InfoTooltip text="Inactive or Suspended agencies cannot log in." />
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Usage Volume</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Created</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '50px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No matching agencies found</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing your search query or status filter.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredAgencies.map((ag) => (
                      <tr
                        key={ag.id}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Agency info */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>
                            {ag.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
                              {ag.id}
                            </span>
                            {ag.subdomain && (
                              <span style={{ fontSize: 11, color: '#2563eb' }}>
                                • {ag.subdomain}.agentladders.com
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Owner & contact */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>
                            👤 {ag.owner?.name || ag.ownerName || 'Unassigned'}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            ✉️ {ag.owner?.email || ag.ownerEmail || '—'}
                          </div>
                          {(ag.owner?.phone || ag.ownerPhone) && (
                            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                              📞 {ag.owner?.phone || ag.ownerPhone}
                            </div>
                          )}
                        </td>

                        {/* Plan */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            backgroundColor: ag.plan === 'Enterprise' ? '#faf5ff' : ag.plan === 'Starter' ? '#f0fdf4' : '#eff6ff',
                            color: ag.plan === 'Enterprise' ? '#6b21a8' : ag.plan === 'Starter' ? '#166534' : '#1d4ed8',
                            border: `1px solid ${ag.plan === 'Enterprise' ? '#e9d5ff' : ag.plan === 'Starter' ? '#bbf7d0' : '#bfdbfe'}`
                          }}>
                            {ag.plan || 'Professional'}
                          </span>
                        </td>

                        {/* Status (Live Selector) */}
                        <td style={{ padding: '16px 20px' }}>
                          <select
                            value={ag.status || 'Active'}
                            onChange={(e) => handleQuickStatusChange(ag.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid #cbd5e1',
                              outline: 'none',
                              backgroundColor: ag.status === 'Active' ? '#f0fdf4' : ag.status === 'Inactive' ? '#f8fafc' : ag.status === 'Suspended' ? '#fef2f2' : '#fffbeb',
                              color: ag.status === 'Active' ? '#166534' : ag.status === 'Inactive' ? '#475569' : ag.status === 'Suspended' ? '#991b1b' : '#92400e'
                            }}
                          >
                            <option value="Active">🟢 Active</option>
                            <option value="Inactive">⚪ Inactive (Block Login)</option>
                            <option value="Suspended">🔴 Suspended</option>
                            <option value="Pending Invite">🟡 Pending Invite</option>
                          </select>
                        </td>

                        {/* Usage volume */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                            <span>👥 {ag.userCount || 1}</span>
                            <span>🏠 {ag.propertyCount || 0}</span>
                            <span>💼 {ag.dealCount || 0}</span>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '16px 20px', fontSize: 12, color: '#64748b' }}>
                          {ag.createdAt ? new Date(ag.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {ag.status === 'Pending Invite' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const url = `${window.location.origin}/login?invite=${ag.inviteToken || ag.id}&email=${encodeURIComponent(ag.owner?.email || ag.ownerEmail || '')}`;
                                  navigator.clipboard.writeText(url);
                                  showToast('Invitation link copied to clipboard!');
                                }}
                                title="Copy invitation onboarding link"
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: 6,
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  backgroundColor: '#fffbeb',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  cursor: 'pointer'
                                }}
                              >
                                ✉️ Link
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(ag)}
                              title="Edit Agency Details"
                              style={{
                                padding: '5px 9px',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 600,
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingAgency(ag)}
                              title="Delete Agency"
                              style={{
                                padding: '5px 9px',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 600,
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: SUPPORT & BROKER HELP DESK ── */}
        {activeTab === 'tickets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Ticket Filters */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Filter Inquiries:
                </span>
                {['All', 'Open', 'In Review', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: ticketStatusFilter === st ? '#0f172a' : '#f1f5f9',
                      color: ticketStatusFilter === st ? '#fff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {st === 'All' ? 'All Tickets' : st}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: 260 }}>
                <span style={{ position: 'absolute', left: 10, top: 7, fontSize: 13, color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search tickets, subject, agency..."
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 12.5,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Tickets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {filteredTickets.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 14, border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No support inquiries found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>All broker questions and tickets are resolved.</div>
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const isResolved = ticket.status === 'Resolved';
                  const lastMsg = ticket.messages?.[ticket.messages.length - 1];

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setReplyStatus(ticket.status); }}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: 20,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                            {ticket.ticketNumber || ticket.id}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 12,
                            backgroundColor: isResolved ? '#d1fae5' : '#fee2e2',
                            color: isResolved ? '#065f46' : '#991b1b'
                          }}>
                            {ticket.status}
                          </span>
                        </div>

                        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>
                          {ticket.subject}
                        </div>

                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🏢 {ticket.agencyName}</span>
                          <span>•</span>
                          <span>👤 {ticket.createdByName}</span>
                        </div>

                        {lastMsg && (
                          <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#475569', lineHeight: 1.4, border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: lastMsg.isStaff ? '#2563eb' : '#0f172a' }}>
                              {lastMsg.isStaff ? 'AgentLadders HQ: ' : `${lastMsg.sender}: `}
                            </strong>
                            {lastMsg.text.length > 90 ? `${lastMsg.text.substring(0, 90)}...` : lastMsg.text}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#94a3b8' }}>
                        <span>{ticket.messages?.length || 0} messages</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>Click to Reply & Inspect ↗</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── MODAL: INVITE / ONBOARD AGENCY ── */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '580px', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Provision & Onboard Agency
                  <InfoTooltip text="Choose between sending a self-serve invitation link or filling full setup details on behalf of the agency." />
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                  Add a new real estate brokerage to the multi-tenant platform.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ padding: '14px 24px 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, backgroundColor: '#e2e8f0', padding: 4, borderRadius: 10 }}>
                <button
                  type="button"
                  onClick={() => setOnboardMode('invite')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: onboardMode === 'invite' ? '#ffffff' : 'transparent',
                    color: onboardMode === 'invite' ? '#0f172a' : '#64748b',
                    boxShadow: onboardMode === 'invite' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ✉️ Option A: Send Invitation Link
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardMode('full_setup')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: onboardMode === 'full_setup' ? '#ffffff' : 'transparent',
                    color: onboardMode === 'full_setup' ? '#0f172a' : '#64748b',
                    boxShadow: onboardMode === 'full_setup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📝 Option B: Full Setup On Behalf
                </button>
              </div>

              <div style={{ padding: '10px 4px 14px', fontSize: 12, color: '#64748b' }}>
                {onboardMode === 'invite' 
                  ? 'Generate a unique onboarding invitation link. The agency owner sets their own password, team members, and preferences.'
                  : 'Super Admin enters all initial credentials and agency parameters directly. The agency can log in immediately.'}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAgency} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {inviteSuccessLink ? (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 18, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>Agency Invitation Generated!</div>
                  <p style={{ fontSize: 12.5, color: '#166534', margin: '4px 0 14px' }}>
                    Share this secure onboarding link with <strong>{formData.ownerEmail}</strong> to let them activate their agency workspace.
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      readOnly
                      value={inviteSuccessLink}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #86efac', backgroundColor: '#fff', fontSize: 12, fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteSuccessLink);
                        showToast('Invitation link copied to clipboard!');
                      }}
                      style={{ padding: '9px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      📋 Copy Link
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Agency Legal / Brand Name *
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Apex Luxury Realty India"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                    />
                  </div>

                  {onboardMode === 'full_setup' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Workspace Subdomain / Slug
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          value={formData.subdomain}
                          onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                          placeholder={formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'apexrealty'}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px 0 0 8px', fontSize: 13.5, outline: 'none' }}
                        />
                        <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderLeft: 'none', padding: '10px 12px', borderRadius: '0 8px 8px 0', fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>
                          .agentladders.com
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Owner Full Name *
                      </label>
                      <input
                        required
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="e.g. Rahul Singhania"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Owner Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.ownerEmail}
                        onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                        placeholder="rahul@apexrealty.com"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Agency Official WhatsApp Number *
                      </label>
                      <PhoneInput
                        required
                        value={formData.ownerPhone}
                        onChange={(full) => setFormData({ ...formData, ownerPhone: full })}
                        placeholder="98200 54321"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Subscription Plan
                      </label>
                      <select
                        value={formData.plan}
                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        <option value="Starter">Starter Plan</option>
                        <option value="Professional">Professional Plan</option>
                        <option value="Enterprise">Enterprise VIP Plan</option>
                      </select>
                    </div>
                  </div>

                  {onboardMode === 'full_setup' ? (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Owner Login Password *
                        </label>
                        <input
                          required
                          value={formData.ownerPassword}
                          onChange={e => setFormData({ ...formData, ownerPassword: e.target.value })}
                          placeholder="e.g. ApexSecure2026!"
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Initial Tenant Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                          >
                            <option value="Active">🟢 Active</option>
                            <option value="Trial">🔵 Trial</option>
                            <option value="Inactive">⚪ Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Base Currency
                          </label>
                          <select
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                          >
                            <option value="INR">INR (₹ Indian Rupee)</option>
                            <option value="USD">USD ($ US Dollar)</option>
                            <option value="AED">AED (د.إ UAE Dirham)</option>
                          </select>
                        </div>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', cursor: 'pointer', marginTop: 4 }}>
                        <input
                          type="checkbox"
                          checked={formData.seedDemoData}
                          onChange={e => setFormData({ ...formData, seedDemoData: e.target.checked })}
                          style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                        />
                        <span>Pre-populate starter demo properties, leads & workflow templates</span>
                      </label>
                    </>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Country / Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        <option value="INR">India (₹ INR - Lakhs & Crores)</option>
                        <option value="USD">United States ($ USD)</option>
                        <option value="AED">UAE (AED)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  {inviteSuccessLink ? 'Close' : 'Cancel'}
                </button>
                {!inviteSuccessLink && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ flex: 2, padding: '11px', borderRadius: 8, border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isSubmitting ? 'Processing...' : (onboardMode === 'invite' ? '✉️ Generate & Send Invite' : '✨ Complete Full Setup')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT AGENCY DETAILS ── */}
      {editingAgency && (
        <div onClick={() => setEditingAgency(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  ✏️ Edit Agency Details
                </h2>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Editing tenant ID: <strong style={{ color: '#0f172a' }}>{editingAgency.id}</strong>
                </div>
              </div>
              <button onClick={() => setEditingAgency(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Agency Name</label>
                <input
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Owner Name</label>
                  <input
                    value={editFormData.ownerName}
                    onChange={e => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Owner Email</label>
                  <input
                    type="email"
                    value={editFormData.ownerEmail}
                    onChange={e => setEditFormData({ ...editFormData, ownerEmail: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Access Status *
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Active">🟢 Active</option>
                    <option value="Inactive">⚪ Inactive (Block Login)</option>
                    <option value="Suspended">🔴 Suspended</option>
                    <option value="Pending Invite">🟡 Pending Invite</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Plan</label>
                  <select
                    value={editFormData.plan}
                    onChange={e => setEditFormData({ ...editFormData, plan: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Starter">Starter Plan</option>
                    <option value="Professional">Professional Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setEditingAgency(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAgency}
                  style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {isUpdatingAgency ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TICKET REPLY & INSPECTION ── */}
      {selectedTicket && (
        <div onClick={() => setSelectedTicket(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                    {selectedTicket.ticketNumber}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, backgroundColor: selectedTicket.status === 'Resolved' ? '#d1fae5' : '#fee2e2', color: selectedTicket.status === 'Resolved' ? '#065f46' : '#991b1b' }}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                  {selectedTicket.subject}
                </h3>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Agency: <strong>{selectedTicket.agencyName}</strong> • Requester: <strong>{selectedTicket.createdByName}</strong>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Conversation Messages */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14, backgroundColor: '#f8fafc' }}>
              {selectedTicket.messages?.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.isStaff ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: msg.isStaff ? '#0f172a' : '#ffffff',
                    color: msg.isStaff ? '#ffffff' : '#0f172a',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: msg.isStaff ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: msg.isStaff ? '#38bdf8' : '#2563eb' }}>
                      {msg.isStaff ? '🛡️ AgentLadders HQ Staff' : msg.sender}
                    </span>
                    <span style={{ fontSize: 10, color: msg.isStaff ? '#94a3b8' : '#94a3b8' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendAdminReply} style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Reply as HQ Staff:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Set Status:</span>
                  <select
                    value={replyStatus}
                    onChange={e => setReplyStatus(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="In Review">🟡 In Review</option>
                    <option value="Resolved">🟢 Resolved / Closed</option>
                    <option value="Open">🔴 Open</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={3}
                required
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                placeholder="Type official response, technical resolution, or instructions to the agency broker..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingReply}
                  style={{ padding: '9px 18px', borderRadius: 8, border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSendingReply ? 'Sending...' : 'Send Reply & Update Status'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: DELETE CONFIRMATION ── */}
      {deletingAgency && (
        <ConfirmModal
          isOpen={!!deletingAgency}
          title="Permanently Delete Agency?"
          message={
            <div>
              Are you sure you want to permanently delete <strong>{deletingAgency.name}</strong> (ID: {deletingAgency.id})?
              <div style={{ marginTop: 8, fontSize: 12.5, color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: 6, border: '1px solid #fecaca' }}>
                ⚠️ Warning: This action deletes all {deletingAgency.userCount} users, {deletingAgency.propertyCount} properties, associated deals, and leads for this agency. This cannot be undone.
              </div>
            </div>
          }
          confirmText="Yes, Delete Agency"
          cancelText="Cancel"
          danger
          isLoading={isDeletingAgency}
          onConfirm={handleConfirmDeleteAgency}
          onCancel={() => setDeletingAgency(null)}
        />
      )}

    </div>
  );
}
