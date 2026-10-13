'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ShareModal } from '@/components/ui/ShareModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { openWhatsAppDirect } from '@/lib/whatsapp-engine';
import { formatINR } from '@/lib/formatters';
import {
  PhoneIcon,
  WhatsAppIcon,
  ShareIcon,
  UserIcon,
  CheckIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  BuildingIcon,
  MapPinIcon,
  TrashIcon,
  SearchIcon,
  SparklesIcon,
  CheckSquareIcon
} from '@/components/icons/NavIcons';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface VisitItem {
  id: string;
  property: string;
  propertyId?: string;
  client: string;
  clientPhone?: string;
  date: string;
  timeSlot?: string;
  slotTime?: string;
  locality?: string;
  status: string;
  source?: string;
  purpose?: string;
  notes?: string;
}

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bhkNeeded?: string | string[];
  budgetMax?: number | string;
  budgetMin?: number | string;
  budget?: number | string;
  city?: string;
  preferredLocalities?: string[] | string;
  locationPreference?: string;
  status: string;
  priority?: string;
  urgency?: string;
  leadPurpose?: string;
  purpose?: string;
  requirement?: string;
  notes?: string;
}

interface TaskItem {
  id: string;
  title: string;
  assignedTo?: string;
  dueDate?: string;
  category?: string;
  priority?: string;
  status: string;
}

interface PropertyItem {
  id: string;
  title: string;
  price: number;
  bhk?: string;
  bedrooms?: number | string;
  locality?: string;
  city?: string;
  location?: string;
  carpetAreaSqFt?: number | string;
  furnishing?: string;
  publicToken?: string;
  media?: Array<{ id?: string; url?: string; tag?: string; isCover?: boolean }>;
  images?: string[];
  image?: string;
  [key: string]: any;
}

interface DealItem {
  id: string;
  title?: string;
  dealValue?: number | string;
  stage?: string;
  status?: string;
  [key: string]: any;
}

export default function DashboardPage() {
  const { data: session } = useSession();

  // ── Core CRM Data State ─────────────────────────────────────────────────────
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [isTodayVisits, setIsTodayVisits] = useState(true);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filters & Search States ─────────────────────────────────────────────────
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // ── Share Modal & Flyer Picker ──────────────────────────────────────────────
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPropertyForShare, setSelectedPropertyForShare] = useState<PropertyItem | null>(null);
  const [selectedClientForFlyer, setSelectedClientForFlyer] = useState<LeadItem | null>(null);

  // ── Mobile FAB State ────────────────────────────────────────────────────────
  const [fabOpen, setFabOpen] = useState(false);

  // ── Super Admin Redirect ────────────────────────────────────────────────────
  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      if (u.role === 'SUPER_ADMIN' || u.email === 'aditya@agentladders.com' || u.email === 'admin@agentladders.com') {
        window.location.href = '/admin';
      }
    }
  }, [session]);

  // ── Fetch Dashboard Data in Parallel ────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch('/api/site-visits').then(r => r.json()).catch(() => ({})),
      fetch('/api/leads').then(r => r.json()).catch(() => ({})),
      fetch('/api/tasks').then(r => r.json()).catch(() => ({})),
      fetch('/api/properties').then(r => r.json()).catch(() => ({})),
      fetch('/api/deals').then(r => r.json()).catch(() => ({}))
    ]).then(([visitsData, leadsData, tasksData, propertiesData, dealsData]) => {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Site Visits
      if (visitsData.siteVisits) {
        const todayList = visitsData.siteVisits.filter((v: VisitItem) => v.date === todayStr);
        if (todayList.length > 0) {
          setVisits(todayList);
          setIsTodayVisits(true);
        } else {
          const upcoming = visitsData.siteVisits
            .filter((v: VisitItem) => v.date >= todayStr && v.status !== 'Cancelled')
            .sort((a: VisitItem, b: VisitItem) => a.date.localeCompare(b.date));
          setVisits(upcoming.slice(0, 5));
          setIsTodayVisits(false);
        }
      }

      // 2. Leads
      if (leadsData.leads) {
        setLeads(leadsData.leads);
      }

      // 3. Tasks
      if (tasksData.tasks) {
        setTasks(tasksData.tasks);
      }

      // 4. Properties
      if (propertiesData.properties) {
        setProperties(propertiesData.properties);
      }

      // 5. Deals
      if (dealsData.deals) {
        setDeals(dealsData.deals);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // ── Agent & Greeting Details ────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';
  const agentName = session?.user?.name || 'Marcus Vance';
  const firstName = agentName.split(' ')[0] || 'Marcus';
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // ── Derived Statistics ──────────────────────────────────────────────────────
  const todayVisitsCount = useMemo(() => isTodayVisits ? visits.length : 0, [isTodayVisits, visits]);
  const completedVisitsCount = useMemo(() => visits.filter(v => v.status === 'Completed').length, [visits]);
  
  const hotLeads = useMemo(() => {
    return leads.filter(l => 
      (l.priority && l.priority.toLowerCase().includes('hot')) || 
      (l.status && l.status.toLowerCase().includes('hot')) ||
      (l.urgency && l.urgency.toLowerCase().includes('immediate'))
    );
  }, [leads]);

  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === 'Completed').length, [tasks]);

  const totalDealsValue = useMemo(() => {
    let sum = 0;
    deals.forEach(d => {
      const val = typeof d.dealValue === 'number' ? d.dealValue : parseFloat(String(d.dealValue || '0'));
      if (!isNaN(val)) sum += val;
    });
    return sum > 0 ? formatINR(sum) : '₹24.0 Cr';
  }, [deals]);

  // ── Filtered Leads ──────────────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (leadFilter === 'hot') {
      result = hotLeads;
    } else if (leadFilter !== 'all') {
      result = leads.filter(l => l.status === leadFilter);
    }

    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase().trim();
      result = result.filter(l => {
        const nameMatch = l.name?.toLowerCase().includes(q);
        const phoneMatch = l.phone?.toLowerCase().includes(q);
        const locStr = Array.isArray(l.preferredLocalities) ? l.preferredLocalities.join(' ') : (l.preferredLocalities || l.city || '');
        const locMatch = locStr.toLowerCase().includes(q);
        const reqMatch = l.requirement?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || locMatch || reqMatch;
      });
    }

    return result.slice(0, 10);
  }, [leads, hotLeads, leadFilter, leadSearch]);

  // ── Action Handlers ─────────────────────────────────────────────────────────
  const handleCallClient = (phone: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleWhatsAppClient = (lead: LeadItem) => {
    const locality = Array.isArray(lead.preferredLocalities) 
      ? lead.preferredLocalities[0] 
      : (lead.preferredLocalities || lead.city || 'prime localities');
    const bhk = Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded[0] : (lead.bhkNeeded || 'luxury residence');
    
    const message = `Namaste ${lead.name.split(' ')[0]} ji, this is ${agentName} from Vance Luxury Realty. I have verified options matching your requirement for ${bhk} in ${locality}. When would be a good time today for a brief 2-minute discussion?`;
    
    openWhatsAppDirect(lead.phone, message);
  };

  const handleOpenFlyerPickerForClient = (lead: LeadItem) => {
    setSelectedClientForFlyer(lead);
  };

  const handleSelectPropertyForClient = (prop: PropertyItem) => {
    if (!selectedClientForFlyer) return;
    const client = selectedClientForFlyer;
    setSelectedClientForFlyer(null);
    setSelectedPropertyForShare(prop);
    setShareModalOpen(true);
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus })
      });
    } catch (e) {
      console.error('Failed to update task', e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || addingTask) return;
    setAddingTask(true);

    const title = newTaskInput.trim();
    setNewTaskInput('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          priority: 'High',
          status: 'Pending',
          category: 'Follow-up Call'
        })
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => [data.task, ...prev]);
      }
    } catch (e) {
      console.error('Failed to create task', e);
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete task', e);
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'Completed' } : v));
    try {
      await fetch('/api/site-visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitId, status: 'Completed' })
      });
    } catch (e) {
      console.error('Failed to complete visit', e);
    }
  };

  // Helper for location display
  const formatLocationString = (lead: LeadItem): string => {
    if (Array.isArray(lead.preferredLocalities) && lead.preferredLocalities.length > 0) {
      return lead.preferredLocalities.join(', ');
    }
    if (typeof lead.preferredLocalities === 'string' && lead.preferredLocalities.trim()) {
      return lead.preferredLocalities;
    }
    return lead.city || 'Mumbai';
  };

  const formatBhkString = (bhk: any): string => {
    if (Array.isArray(bhk)) return bhk.join(', ');
    return String(bhk || '');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '65vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#475569', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Opening your Broker Workstation...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container animate-enter" style={{ maxWidth: 1320, margin: '0 auto', paddingBottom: 110 }}>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 1: EXECUTIVE WELCOME HEADER
          High-contrast, professional, friendly, with zero muddy text colors.
      ───────────────────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 55%, #059669 100%)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 24,
        color: '#ffffff',
        boxShadow: '0 8px 28px -4px rgba(4, 120, 87, 0.28)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle geometric circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 120, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, position: 'relative', zIndex: 1 }}>
          <div>
            {/* Agency Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: 10,
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }} />
              Vance Luxury Realty • Broker Cockpit
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{greetingEmoji}</span>
              {greeting}, {firstName}!
            </h1>
            
            <div style={{ fontSize: 15, color: '#e2e8f0', margin: '6px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📅 {todayFormatted}</span>
              <span>•</span>
              <span style={{ color: '#a7f3d0' }}>
                {todayVisitsCount > 0 ? `🚗 ${todayVisitsCount} Site Visits Scheduled Today` : `Ready to follow up with ${leads.length} buyers`}
              </span>
            </div>
          </div>

          {/* Direct Action Triggers - Big, Bold, Easy to Tap */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/dashboard/site-visits?new=true"
              style={{
                textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: 14,
                padding: '13px 22px',
                fontSize: 15,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 20 }}>🚗</span>
              Book Site Visit
            </Link>

            <Link
              href="/dashboard/leads?new=true"
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                color: '#065f46',
                borderRadius: 14,
                padding: '13px 24px',
                fontSize: 15,
                fontWeight: 800,
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 20 }}>➕</span>
              Add New Buyer
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 2: ESSENTIAL BUSINESS METRIC CARDS (4 Real Numbers, No Donut Counters)
          Large text, high clarity, direct links to corresponding sections.
      ───────────────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Metric 1: Today's Site Visits */}
        <Link
          href="/dashboard/site-visits"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            border: '2px solid #fef3c7',
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 3px 12px rgba(245, 158, 11, 0.08)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0
          }}>
            🚗
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Site Visits Today
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
              {isTodayVisits ? visits.length : 0}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginLeft: 6 }}>
                ({completedVisitsCount} Done)
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#b45309', fontWeight: 600 }}>
              {visits.length > 0 ? 'Tap to view schedule →' : 'Book a showing →'}
            </div>
          </div>
        </Link>

        {/* Metric 2: Active Buyer Enquiries */}
        <Link
          href="/dashboard/leads"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            border: '2px solid #d1fae5',
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 3px 12px rgba(5, 150, 105, 0.08)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            backgroundColor: '#d1fae5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0
          }}>
            👥
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Buyers
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
              {leads.length}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginLeft: 8 }}>
                🔥 {hotLeads.length} Hot
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
              Tap to see all buyers →
            </div>
          </div>
        </Link>

        {/* Metric 3: Properties in Inventory */}
        <Link
          href="/dashboard/properties"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            border: '2px solid #dbeafe',
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 3px 12px rgba(37, 99, 235, 0.08)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0
          }}>
            🏡
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Listed Inventory
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
              {properties.length}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginLeft: 6 }}>
                Units
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>
              View listed inventory →
            </div>
          </div>
        </Link>

        {/* Metric 4: Pipeline Value / Deals */}
        <Link
          href="/dashboard/deals"
          style={{
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            border: '2px solid #ede9fe',
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 3px 12px rgba(124, 58, 237, 0.08)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            backgroundColor: '#ede9fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0
          }}>
            💼
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pipeline Value
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
              {totalDealsValue}
            </div>
            <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>
              {deals.length} active negotiations →
            </div>
          </div>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 3: MAIN WORKSTATION GRID (2 Columns: Inquiries vs Visits & Tasks)
      ───────────────────────────────────────────────────────────────────────── */}
      <div className="cockpit-grid">

        {/* ── LEFT COLUMN: PRIORITY CLIENT FOLLOW-UPS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            {/* Header + Search + Filters */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1.5px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>📱</span>
                    Client Enquiries & Follow-Ups
                    <InfoTooltip text="Call or WhatsApp your buyers directly. One tap opens dialer or WhatsApp with personalized greeting." />
                  </h2>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                    {leads.length} total buyers looking for properties in Mumbai & NCR
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: 6, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setLeadFilter('all')}
                    style={{
                      border: 'none',
                      backgroundColor: leadFilter === 'all' ? '#ffffff' : 'transparent',
                      color: leadFilter === 'all' ? '#0f172a' : '#64748b',
                      fontWeight: leadFilter === 'all' ? 800 : 600,
                      fontSize: 13.5,
                      padding: '7px 14px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      boxShadow: leadFilter === 'all' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    👥 All ({leads.length})
                  </button>
                  <button
                    onClick={() => setLeadFilter('hot')}
                    style={{
                      border: 'none',
                      backgroundColor: leadFilter === 'hot' ? '#ffffff' : 'transparent',
                      color: leadFilter === 'hot' ? '#dc2626' : '#64748b',
                      fontWeight: leadFilter === 'hot' ? 800 : 600,
                      fontSize: 13.5,
                      padding: '7px 14px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      boxShadow: leadFilter === 'hot' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🔥 Hot ({hotLeads.length})
                  </button>
                  {['New Inbound', 'Site Visit Scheduled', 'Negotiation'].map(st => {
                    const cnt = leads.filter(l => l.status === st).length;
                    if (cnt === 0 && leadFilter !== st) return null;
                    return (
                      <button
                        key={st}
                        onClick={() => setLeadFilter(st)}
                        style={{
                          border: 'none',
                          backgroundColor: leadFilter === st ? '#ffffff' : 'transparent',
                          color: leadFilter === st ? '#059669' : '#64748b',
                          fontWeight: leadFilter === st ? 800 : 600,
                          fontSize: 13.5,
                          padding: '7px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          boxShadow: leadFilter === st ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {st} ({cnt})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instant Search Bar & Status Dropdown */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <SearchBar
                  value={leadSearch}
                  onChange={setLeadSearch}
                  placeholder="Search buyer name, phone, or location (e.g. Vikram, Worli, 98200)..."
                  size="md"
                  minWidth={240}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>Status:</span>
                  <select
                    value={leadFilter}
                    onChange={e => setLeadFilter(e.target.value)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: leadFilter === 'all' ? '#ffffff' : '#ecfdf5',
                      color: leadFilter === 'all' ? '#0f172a' : '#047857',
                      fontSize: 13.5,
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Enquiries ({leads.length})</option>
                    <option value="hot">🔥 Hot Priority ({hotLeads.length})</option>
                    {Array.from(new Set(leads.map(l => l.status).filter(Boolean))).map(st => (
                      <option key={st} value={st}>{st} ({leads.filter(l => l.status === st).length})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Leads List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredLeads.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>No clients found</div>
                  <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
                    Try searching for another name or switch back to All Buyers.
                  </div>
                </div>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const isHot = lead.priority?.toLowerCase().includes('hot') || lead.status?.toLowerCase().includes('hot');
                  const locationDisplay = formatLocationString(lead);
                  const bhkDisplay = formatBhkString(lead.bhkNeeded);
                  const budgetDisplay = lead.budget || (lead.budgetMax ? formatINR(Number(lead.budgetMax)) : '₹ TBA');

                  return (
                    <div
                      key={lead.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: idx === filteredLeads.length - 1 ? 'none' : '1.5px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafcfa',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Top Row: Name + Badges + Budget */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                              {lead.name}
                            </span>
                            {isHot && (
                              <span style={{
                                fontSize: 12,
                                fontWeight: 800,
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1.5px solid #fecaca',
                                padding: '3px 10px',
                                borderRadius: 20,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                🔥 Hot Buyer
                              </span>
                            )}
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              padding: '3px 10px',
                              borderRadius: 20
                            }}>
                              {lead.leadPurpose || 'Buy'}
                            </span>
                          </div>

                          {/* Location & BHK - Clean with commas */}
                          <div style={{ fontSize: 14.5, color: '#475569', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ color: '#059669' }}>📍 {locationDisplay}</span>
                            {bhkDisplay && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#0f172a', fontWeight: 700 }}>🏠 {bhkDisplay}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Budget Pill - Big & Clear */}
                        <div style={{
                          backgroundColor: '#ecfdf5',
                          border: '2px solid #a7f3d0',
                          borderRadius: 14,
                          padding: '8px 16px',
                          textAlign: 'right'
                        }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#047857' }}>
                            {budgetDisplay}
                          </div>
                          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>
                            Client Budget
                          </div>
                        </div>
                      </div>

                      {/* Requirement note if present */}
                      {lead.requirement && (
                        <div style={{
                          fontSize: 13.5,
                          color: '#475569',
                          backgroundColor: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: 10,
                          borderLeft: '3px solid #059669',
                          lineHeight: 1.45
                        }}>
                          💬 <strong>Notes:</strong> {lead.requirement}
                        </div>
                      )}

                      {/* Client Phone Number & Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>📞</span>
                          <span>{lead.phone || 'Phone not available'}</span>
                        </div>

                        {/* BIG ACTION BUTTONS */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {/* 1-Tap Call */}
                          <button
                            onClick={() => handleCallClient(lead.phone)}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '2px solid #bfdbfe',
                              borderRadius: 12,
                              padding: '11px 18px',
                              fontSize: 14.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              transition: 'all 0.15s ease',
                              minHeight: 46
                            }}
                          >
                            <span style={{ fontSize: 18 }}>📞</span>
                            Call Client
                          </button>

                          {/* 1-Tap WhatsApp */}
                          <button
                            onClick={() => handleWhatsAppClient(lead)}
                            style={{
                              backgroundColor: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 12,
                              padding: '11px 20px',
                              fontSize: 14.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                              transition: 'all 0.15s ease',
                              minHeight: 46
                            }}
                          >
                            <WhatsAppIcon size={18} color="#ffffff" />
                            WhatsApp
                          </button>

                          {/* Send Property Flyer Modal Trigger */}
                          <button
                            onClick={() => handleOpenFlyerPickerForClient(lead)}
                            title="Pick a property from inventory and share flyer with this buyer"
                            style={{
                              backgroundColor: '#f0fdf4',
                              color: '#065f46',
                              border: '1.5px solid #a7f3d0',
                              borderRadius: 12,
                              padding: '11px 16px',
                              fontSize: 14,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.15s ease',
                              minHeight: 46
                            }}
                          >
                            <span>📤</span>
                            Send Flyer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* View All Leads Link */}
            <div style={{ padding: '16px 24px', borderTop: '1.5px solid #e2e8f0', backgroundColor: '#fafbfc', textAlign: 'center' }}>
              <Link
                href="/dashboard/leads"
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#065f46',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 12,
                  backgroundColor: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>👥 See Full Client Registry ({leads.length} Buyers)</span>
                <ArrowRightIcon size={15} color="currentColor" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: TODAY'S VISITS & TO-DO CHECKLIST ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* ── CARD A: TODAY'S SITE VISITS ── */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: 18,
            padding: 22,
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>🚗</span>
                  {isTodayVisits ? "Today's Site Visits" : "Upcoming Site Visits"}
                </h2>
                <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 3, fontWeight: 600 }}>
                  {visits.length} scheduled property showings
                </div>
              </div>

              <span style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#065f46',
                backgroundColor: '#d1fae5',
                padding: '6px 14px',
                borderRadius: 20,
                border: '1.5px solid #a7f3d0'
              }}>
                {completedVisitsCount}/{visits.length} Done
              </span>
            </div>

            {visits.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: 14.5, padding: '36px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>🗓️</div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>
                  {isTodayVisits ? "No visits scheduled for today." : "No upcoming visits."}
                </div>
                <div style={{ marginTop: 6, fontSize: 13.5, color: '#94a3b8' }}>
                  Schedule client visits to keep your deal pipeline moving!
                </div>
                <Link
                  href="/dashboard/site-visits?new=true"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 16,
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  ➕ Schedule a Visit
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {visits.map(v => {
                  const isDone = v.status === 'Completed';

                  return (
                    <div
                      key={v.id}
                      style={{
                        border: isDone ? '2px solid #a7f3d0' : '2px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '16px',
                        backgroundColor: isDone ? '#f0fdf4' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Time Slot & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 16 }}>⏰</span>
                          {!isTodayVisits ? `${new Date(v.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • ` : ''}
                          {v.timeSlot || v.slotTime || '11:00 AM'}
                        </div>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 800,
                          backgroundColor: isDone ? '#d1fae5' : '#dbeafe',
                          color: isDone ? '#065f46' : '#1d4ed8',
                          padding: '4px 12px',
                          borderRadius: 20,
                          border: isDone ? '1px solid #a7f3d0' : '1px solid #93c5fd'
                        }}>
                          {isDone ? '✅ Completed' : '📌 ' + v.status}
                        </span>
                      </div>

                      {/* Property & Client */}
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>
                          🏢 {v.property}
                        </div>
                        {v.locality && (
                          <div style={{ fontSize: 13, color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                            📍 {v.locality}
                          </div>
                        )}
                        <div style={{ fontSize: 14, color: '#334155', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <span>👤</span>
                          <span>{v.client}</span>
                          {v.clientPhone && (
                            <span style={{ color: '#2563eb', fontWeight: 700 }}>({v.clientPhone})</span>
                          )}
                        </div>
                      </div>

                      {/* Visit Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                        {v.clientPhone && (
                          <button
                            onClick={() => handleCallClient(v.clientPhone!)}
                            title="Call Client"
                            style={{
                              flex: 1,
                              minWidth: 100,
                              border: '2px solid #bfdbfe',
                              backgroundColor: '#eff6ff',
                              borderRadius: 10,
                              padding: '9px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: '#1d4ed8',
                              minHeight: 40
                            }}
                          >
                            📞 Call
                          </button>
                        )}

                        {v.clientPhone && (
                          <button
                            onClick={() => {
                              const msg = `Namaste ${v.client.split(' ')[0]} ji, confirming our site visit today at ${v.timeSlot || 'the scheduled time'} for ${v.property}. I will meet you at the gate reception. Let me know if you need location directions!`;
                              openWhatsAppDirect(v.clientPhone!, msg);
                            }}
                            title="Send WhatsApp Directions"
                            style={{
                              flex: 1,
                              minWidth: 110,
                              border: 'none',
                              backgroundColor: '#25D366',
                              borderRadius: 10,
                              padding: '9px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: '#ffffff',
                              minHeight: 40
                            }}
                          >
                            <WhatsAppIcon size={16} color="#ffffff" />
                            WhatsApp
                          </button>
                        )}

                        {!isDone && (
                          <button
                            onClick={() => handleCompleteVisit(v.id)}
                            style={{
                              flex: 1,
                              minWidth: 110,
                              border: '2px solid #a7f3d0',
                              backgroundColor: '#ecfdf5',
                              borderRadius: 10,
                              padding: '9px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              fontSize: 13.5,
                              fontWeight: 800,
                              color: '#065f46',
                              minHeight: 40
                            }}
                          >
                            ✅ Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/dashboard/site-visits"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 18,
                padding: '12px 18px',
                borderTop: '1px solid #f1f5f9',
                fontSize: 14.5,
                fontWeight: 800,
                color: '#065f46',
                textDecoration: 'none',
                borderRadius: 12,
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                transition: 'all 0.15s ease'
              }}
            >
              <span>📋 Open Full Site Visits Calendar</span>
              <ArrowRightIcon size={14} color="currentColor" />
            </Link>
          </div>

          {/* ── CARD B: DAILY TO-DO CHECKLIST ── */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: 18,
            padding: 22,
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  Daily Action Tasks
                </h2>
                <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 3, fontWeight: 600 }}>
                  {completedTasksCount} of {tasks.length} items checked off
                </div>
              </div>

              <span style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#065f46',
                backgroundColor: '#d1fae5',
                padding: '4px 12px',
                borderRadius: 20
              }}>
                {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}% Done
              </span>
            </div>

            {/* Quick Add Task */}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Type a new task (e.g. Call Lodha manager)..."
                value={newTaskInput}
                onChange={e => setNewTaskInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  outline: 'none',
                  color: '#0f172a',
                  fontWeight: 600
                }}
              />
              <button
                type="submit"
                disabled={addingTask || !newTaskInput.trim()}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  opacity: addingTask || !newTaskInput.trim() ? 0.5 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                ➕ Add
              </button>
            </form>

            {/* Task list with big checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '24px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                  No pending tasks for today.
                </div>
              ) : (
                tasks.map(task => {
                  const isDone = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 12,
                        backgroundColor: isDone ? '#f0fdf4' : '#ffffff',
                        border: isDone ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1, minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleTaskStatus(task)}
                          style={{
                            width: 24,
                            height: 24,
                            accentColor: '#059669',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <span style={{
                          fontSize: 14.5,
                          color: isDone ? '#94a3b8' : '#0f172a',
                          textDecoration: isDone ? 'line-through' : 'none',
                          fontWeight: isDone ? 500 : 700,
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}>
                          {task.title}
                        </span>
                      </label>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task"
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <TrashIcon size={16} color="currentColor" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>



      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 5: CLIENT FLYER SELECTOR MODAL
          When an agent clicks "Send Flyer" on an Inquiry card, this lets them pick
          any property from inventory and immediately share it on WhatsApp!
      ───────────────────────────────────────────────────────────────────────── */}
      {selectedClientForFlyer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            maxWidth: 640,
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Select Property to Send on WhatsApp
                </h3>
                <div style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                  Sending to: <strong>{selectedClientForFlyer.name}</strong> ({selectedClientForFlyer.phone})
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForFlyer(null)}
                style={{
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: 16
                }}
              >
                ✕
              </button>
            </div>

            {/* Property Items List */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {properties.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPropertyForClient(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: '#ffffff'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 24 }}>🏢</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>📍 {p.locality || p.city} • {p.bhk || ''}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>{formatINR(p.price)}</div>
                    <div style={{ fontSize: 12, color: '#25D366', fontWeight: 800 }}>Select & Share 💬</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 6: FLOATING ACTION BUTTON (FAB) FOR MOBILE USABILITY
      ───────────────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        {/* Expanded FAB Menu */}
        {fabOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            animation: 'enter 0.2s ease-out forwards'
          }}>
            <Link
              href="/dashboard/leads?new=true"
              onClick={() => setFabOpen(false)}
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                color: '#065f46',
                border: '2px solid #a7f3d0',
                borderRadius: 14,
                padding: '12px 20px',
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: 20 }}>👤</span> Add New Buyer
            </Link>
            <Link
              href="/dashboard/site-visits?new=true"
              onClick={() => setFabOpen(false)}
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                color: '#b45309',
                border: '2px solid #fde68a',
                borderRadius: 14,
                padding: '12px 20px',
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: 20 }}>🚗</span> Book Site Visit
            </Link>
            <Link
              href="/dashboard/properties?new=true"
              onClick={() => setFabOpen(false)}
              style={{
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                color: '#1d4ed8',
                border: '2px solid #bfdbfe',
                borderRadius: 14,
                padding: '12px 20px',
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: 20 }}>🏡</span> Add Property
            </Link>
          </div>
        )}

        {/* Main Floating Trigger */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          aria-label="Quick Actions"
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            backgroundColor: fabOpen ? '#ef4444' : '#059669',
            color: '#ffffff',
            border: 'none',
            fontSize: 30,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(5, 150, 105, 0.45)',
            transition: 'all 0.25s ease',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
        >
          +
        </button>
      </div>

      {/* FAB Backdrop */}
      {fabOpen && (
        <div
          onClick={() => setFabOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 55,
            transition: 'all 0.2s ease'
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 7: SHARE MODAL (Meesho-Style Image Flyer Generator)
      ───────────────────────────────────────────────────────────────────────── */}
      {selectedPropertyForShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedPropertyForShare(null);
          }}
          property={selectedPropertyForShare}
        />
      )}

    </div>
  );
}
