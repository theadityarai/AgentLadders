'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AgencyItem {
  id: string;
  name: string;
  country: string;
  currency: string;
  plan: string;
  status: string;
  createdAt: string;
  owner: {
    name: string;
    email: string;
  };
  userCount: number;
  propertyCount: number;
  dealCount: number;
  leadCount: number;
  wonRevenue: number;
}

interface PlatformStats {
  totalAgencies: number;
  activeAgencies: number;
  suspendedAgencies: number;
  trialAgencies: number;
  totalUsers: number;
  totalProperties: number;
  totalDeals: number;
  closedWonCount: number;
  totalGmv: number;
  platformMrr: number;
  totalLeads: number;
  planCounts: Record<string, number>;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'agencies' | 'users' | 'subscriptions'>('agencies');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [agencies, setAgencies] = useState<AgencyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgencyForm, setNewAgencyForm] = useState({
    name: '',
    country: 'United States',
    currency: 'USD',
    plan: 'Professional',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: 'admin123'
  });

  const [editingAgency, setEditingAgency] = useState<AgencyItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    country: '',
    currency: '',
    plan: 'Professional',
    status: 'Active'
  });

  const [agencyToDelete, setAgencyToDelete] = useState<AgencyItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, agenciesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/agencies')
      ]);

      if (statsRes.status === 403 || agenciesRes.status === 403) {
        router.push('/dashboard');
        return;
      }

      const statsData = await statsRes.json();
      const agenciesData = await agenciesRes.json();

      if (statsData.stats) setStats(statsData.stats);
      if (agenciesData.agencies) setAgencies(agenciesData.agencies);
    } catch (err) {
      console.error('Failed to load Super Admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
      return;
    }
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  // Handle Impersonation
  const handleImpersonate = async (agency: AgencyItem) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAgencyId: agency.id })
      });
      if (res.ok) {
        showToast(`Switched active context to ${agency.name}`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Agency Status (Active / Suspended)
  const handleToggleStatus = async (agency: AgencyItem) => {
    const nextStatus = agency.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agency.id, status: nextStatus })
      });
      if (res.ok) {
        setAgencies(prev => prev.map(a => a.id === agency.id ? { ...a, status: nextStatus } : a));
        showToast(`Agency "${agency.name}" marked as ${nextStatus}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAgency.id, ...editForm })
      });
      if (res.ok) {
        setAgencies(prev => prev.map(a => a.id === editingAgency.id ? { ...a, ...editForm } : a));
        setEditingAgency(null);
        showToast(`Agency "${editForm.name}" updated successfully.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgencyForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setNewAgencyForm({
          name: '',
          country: 'United States',
          currency: 'USD',
          plan: 'Professional',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: 'admin123'
        });
        showToast(`New Agency "${data.agency.name}" created and seeded!`);
        loadData();
      } else {
        alert(data.error || 'Failed to create agency');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Agency
  const handleDeleteConfirm = async () => {
    if (!agencyToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/agencies?id=${agencyToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setAgencies(prev => prev.filter(a => a.id !== agencyToDelete.id));
        showToast(`Agency "${agencyToDelete.name}" deleted.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
      setAgencyToDelete(null);
    }
  };

  // Filtered agencies
  const filteredAgencies = useMemo(() => {
    return agencies.filter(ag => {
      const matchesSearch =
        ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan = planFilter === 'All' || ag.plan.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || ag.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [agencies, searchQuery, planFilter, statusFilter]);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' };
      case 'Professional':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'Starter':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: '#ecfdf5', color: '#047857', dot: '#10b981' };
      case 'Suspended':
        return { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' };
      case 'Trial':
        return { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' };
      default:
        return { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'inherit' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🛡️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Super Admin Executive Header */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '1px solid #1e293b',
        padding: '0 32px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#ffffff'
          }}>
            ⬡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                AgentLadders HQ
              </h1>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.25)',
                color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.4)',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Platform Super Admin
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
              Multi-tenant architecture & agency governance
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e293b'}
          >
            <span>🏢</span>
            <span>Switch to Tenant Workspace</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <span>+</span>
            <span>Onboard New Agency</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #334155', paddingLeft: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#f8fafc' }}>
                {session?.user?.name || 'Aditya Rai'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {session?.user?.email || 'aditya@agentladders.com'}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                background: 'none',
                border: '1px solid #475569',
                color: '#94a3b8',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px 64px' }}>
        
        {/* KPI Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          {/* Card 1: Platform MRR */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Platform MRR
              </span>
              <span style={{ fontSize: '18px' }}>💳</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              ${stats?.platformMrr?.toLocaleString() || '1,795'}<span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>/mo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
              <span>▲ $21.5K ARR Projected</span>
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>&bull; Across {stats?.activeAgencies || 5} active subs</span>
            </div>
          </div>

          {/* Card 2: Total Agencies */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tenant Agencies
              </span>
              <span style={{ fontSize: '18px' }}>🏢</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {stats?.totalAgencies || agencies.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '12px' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>● {stats?.activeAgencies || 0} Active</span>
              <span style={{ color: '#d97706', fontWeight: 600 }}>● {stats?.trialAgencies || 0} Trial</span>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>● {stats?.suspendedAgencies || 0} Suspended</span>
            </div>
          </div>

          {/* Card 3: Platform Users */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Platform Users
              </span>
              <span style={{ fontSize: '18px' }}>👥</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {stats?.totalUsers || 10}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
              <span>Brokers, Managers & Owners</span>
            </div>
          </div>

          {/* Card 4: Platform Inventory & GMV */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Inventory & Closed GMV
              </span>
              <span style={{ fontSize: '18px' }}>💎</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              ${((stats?.totalGmv || 5400000) / 1000000).toFixed(1)}M
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              <span>{stats?.totalProperties || 14} Listings</span>
              <span>&bull;</span>
              <span>{stats?.closedWonCount || 8} Closed Transactions</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveTab('agencies')}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'agencies' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'agencies' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            🏢 Tenant Agencies Directory ({agencies.length})
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            style={{
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'subscriptions' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'subscriptions' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            📊 Subscription Tiers & Billing Breakdown
          </button>
        </div>

        {/* TAB 1: AGENCIES TABLE */}
        {activeTab === 'agencies' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            
            {/* Filter and Search Bar */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fcfdfe'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '16px', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by agency, owner, email, or country..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Plan:</label>
                  <select
                    value={planFilter}
                    onChange={e => setPlanFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="All">All Plans</option>
                    <option value="Enterprise">Enterprise ($599/mo)</option>
                    <option value="Professional">Professional ($249/mo)</option>
                    <option value="Starter">Starter ($99/mo)</option>
                    <option value="Free">Free</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Status:</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <button
                  onClick={loadData}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Agency Name & Location</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Plan & MRR</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Primary Owner</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Volume / Assets</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Governance Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        No agencies match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAgencies.map((agency) => {
                      const planStyle = getPlanBadge(agency.plan);
                      const statusStyle = getStatusBadge(agency.status);

                      return (
                        <tr
                          key={agency.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {/* Agency Name */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                              {agency.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              📍 {agency.country} &bull; Currency: {agency.currency}
                            </div>
                          </td>

                          {/* Plan */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: planStyle.bg,
                              color: planStyle.color,
                              border: `1px solid ${planStyle.border}`,
                              fontWeight: 700,
                              fontSize: '11.5px',
                              display: 'inline-block'
                            }}>
                              {agency.plan}
                            </span>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              {agency.plan === 'Enterprise' ? '$599/mo' : agency.plan === 'Professional' ? '$249/mo' : agency.plan === 'Starter' ? '$99/mo' : 'Free tier'}
                            </div>
                          </td>

                          {/* Owner */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>
                              {agency.owner.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {agency.owner.email}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 700,
                              fontSize: '11.5px'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.dot }}></span>
                              {agency.status}
                            </span>
                          </td>

                          {/* Metrics */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                              {agency.propertyCount} Properties &bull; {agency.userCount} Users
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '2px', fontWeight: 500 }}>
                              Closed GMV: ${agency.wonRevenue?.toLocaleString() || 0}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              
                              {/* Impersonate Button */}
                              <button
                                onClick={() => handleImpersonate(agency)}
                                title="Enter and inspect this agency's workspace"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                              >
                                <span>👁️</span>
                                <span>Enter Agency</span>
                              </button>

                              {/* Quick Toggle Status */}
                              <button
                                onClick={() => handleToggleStatus(agency)}
                                title={agency.status === 'Suspended' ? 'Activate Agency' : 'Suspend Agency'}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: agency.status === 'Suspended' ? '#ecfdf5' : '#fef2f2',
                                  color: agency.status === 'Suspended' ? '#047857' : '#b91c1c',
                                  border: `1px solid ${agency.status === 'Suspended' ? '#a7f3d0' : '#fecaca'}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                {agency.status === 'Suspended' ? '✓ Activate' : '⏸ Suspend'}
                              </button>

                              {/* Edit Modal Button */}
                              <button
                                onClick={() => {
                                  setEditingAgency(agency);
                                  setEditForm({
                                    name: agency.name,
                                    country: agency.country,
                                    currency: agency.currency,
                                    plan: agency.plan,
                                    status: agency.status
                                  });
                                }}
                                title="Edit Agency Settings"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: '#f8fafc',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️ Edit
                              </button>

                              {/* Delete Agency Button */}
                              {agency.id !== 'ag_ql21vxnd' && (
                                <button
                                  onClick={() => setAgencyToDelete(agency)}
                                  title="Delete Agency"
                                  style={{
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    color: '#ef4444',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: SUBSCRIPTIONS & FINANCIAL BREAKDOWN */}
        {activeTab === 'subscriptions' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Enterprise Tier Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '2px solid #d8b4fe', boxShadow: '0 4px 20px rgba(126, 34, 206, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7e22ce', backgroundColor: '#f3e8ff', padding: '4px 8px', borderRadius: '4px' }}>
                    Enterprise Tier
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '12px 0 4px', color: '#0f172a' }}>
                    $599 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
                  </h3>
                </div>
                <div style={{ fontSize: '28px' }}>👑</div>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>
                Unlimited brokers, multi-branch governance, custom syndications, dedicated audit logs.
              </p>
              <div style={{ padding: '12px 16px', backgroundColor: '#faf5ff', borderRadius: '10px', fontSize: '13px', color: '#6b21a8', fontWeight: 600 }}>
                {stats?.planCounts?.Enterprise || 2} Agencies Subscribed &bull; ${((stats?.planCounts?.Enterprise || 2) * 599).toLocaleString()}/mo MRR
              </div>
            </div>

            {/* Professional Tier Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #bfdbfe', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px' }}>
                    Professional Tier
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '12px 0 4px', color: '#0f172a' }}>
                    $249 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
                  </h3>
                </div>
                <div style={{ fontSize: '28px' }}>💼</div>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>
                Up to 25 brokers, automated client invoices, marketing ad attribution, and advanced reporting.
              </p>
              <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', fontSize: '13px', color: '#1e40af', fontWeight: 600 }}>
                {stats?.planCounts?.Professional || 3} Agencies Subscribed &bull; ${((stats?.planCounts?.Professional || 3) * 249).toLocaleString()}/mo MRR
              </div>
            </div>

            {/* Starter Tier Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#047857', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '4px' }}>
                    Starter Tier
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '12px 0 4px', color: '#0f172a' }}>
                    $99 <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ month</span>
                  </h3>
                </div>
                <div style={{ fontSize: '28px' }}>🌱</div>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px' }}>
                Independent boutique brokerages up to 5 agents, basic listings and client CRM.
              </p>
              <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '10px', fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
                {stats?.planCounts?.Starter || 1} Agencies Subscribed &bull; ${((stats?.planCounts?.Starter || 1) * 99).toLocaleString()}/mo MRR
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL: ONBOARD NEW AGENCY */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
            maxWidth: '540px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Onboard Tenant Agency</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Provisions isolated tenant database, dummy data, and owner login</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Agency Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign International Realty"
                    value={newAgencyForm.name}
                    onChange={e => setNewAgencyForm({ ...newAgencyForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Country</label>
                  <select
                    value={newAgencyForm.country}
                    onChange={e => setNewAgencyForm({ ...newAgencyForm, country: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  >
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>UAE</option>
                    <option>India</option>
                    <option>Australia</option>
                    <option>Canada</option>
                    <option>Singapore</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Currency</label>
                  <select
                    value={newAgencyForm.currency}
                    onChange={e => setNewAgencyForm({ ...newAgencyForm, currency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  >
                    <option>USD</option>
                    <option>GBP</option>
                    <option>AED</option>
                    <option>INR</option>
                    <option>AUD</option>
                    <option>CAD</option>
                    <option>EUR</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Subscription Plan</label>
                  <select
                    value={newAgencyForm.plan}
                    onChange={e => setNewAgencyForm({ ...newAgencyForm, plan: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  >
                    <option value="Enterprise">Enterprise Tier ($599/mo)</option>
                    <option value="Professional">Professional Tier ($249/mo)</option>
                    <option value="Starter">Starter Tier ($99/mo)</option>
                    <option value="Free">Free Trial</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan Pierce"
                    value={newAgencyForm.ownerName}
                    onChange={e => setNewAgencyForm({ ...newAgencyForm, ownerName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jp@sovereign.com"
                    value={newAgencyForm.ownerEmail}
                    onChange={e => setNewAgencyForm({ ...newAgencyForm, ownerEmail: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontWeight: 600, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  {actionLoading ? 'Provisioning...' : 'Provision Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AGENCY */}
      {editingAgency && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Edit Agency Settings</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Update plan tier, status, and locale</p>
              </div>
              <button onClick={() => setEditingAgency(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Agency Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Subscription Plan</label>
                  <select
                    value={editForm.plan}
                    onChange={e => setEditForm({ ...editForm, plan: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  >
                    <option value="Enterprise">Enterprise ($599/mo)</option>
                    <option value="Professional">Professional ($249/mo)</option>
                    <option value="Starter">Starter ($99/mo)</option>
                    <option value="Free">Free</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Operational Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Currency</label>
                  <input
                    type="text"
                    value={editForm.currency}
                    onChange={e => setEditForm({ ...editForm, currency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAgency(null)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontWeight: 600, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!agencyToDelete}
        title="Delete Tenant Agency"
        message={
          agencyToDelete ? (
            <span>
              Are you sure you want to permanently delete <strong>{agencyToDelete.name}</strong>? All associated users, properties, leads, and transaction records will be permanently removed.
            </span>
          ) : ''
        }
        confirmText="Permanently Delete"
        danger={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAgencyToDelete(null)}
      />

    </div>
  );
}
