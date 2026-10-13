'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { ShareModal } from '@/components/ui/ShareModal';
import { openWhatsAppDirect } from '@/lib/whatsapp-engine';
import { findMatchingPropertiesForLead } from '@/lib/match-engine';
import { formatINR } from '@/lib/formatters';
import {
  PhoneIcon,
  WhatsAppIcon,
  ShareIcon,
  UserIcon,
  CheckIcon,
  CheckSquareIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  BuildingIcon,
  MapPinIcon,
  TrashIcon,
  SparklesIcon,
  TrendingUpIcon,
  ExternalLinkIcon
} from '@/components/icons/NavIcons';

// ─── Types ───────────────────────────────────────────────────────────────────
interface VisitItem {
  id: string;
  property: string;
  client: string;
  clientPhone?: string;
  date: string;
  timeSlot?: string;
  status: string;
  source?: string;
  notes?: string;
}

interface LeadItem {
  id: string;
  name: string;
  phone: string;
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

interface HabitTrackerState {
  callsDone: number;
  callsGoal: number;
  visitsDone: number;
  visitsGoal: number;
  pitchesDone: number;
  pitchesGoal: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();

  // Core Data State
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [isTodayVisits, setIsTodayVisits] = useState(true);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sub-states
  const [leadFilter, setLeadFilter] = useState<'all' | 'hot' | 'matched'>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPropertyForShare, setSelectedPropertyForShare] = useState<PropertyItem | null>(null);

  // Daily Habits State (persisted in localStorage by date)
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [habits, setHabits] = useState<HabitTrackerState>({
    callsDone: 0,
    callsGoal: 5,
    visitsDone: 0,
    visitsGoal: 2,
    pitchesDone: 0,
    pitchesGoal: 3
  });

  // Load habits from localStorage on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`agentladders_habits_${todayDateStr}`);
        if (saved) {
          setHabits(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse habits', e);
      }
    }
  }, [todayDateStr]);

  // Persist habits to localStorage
  const updateHabits = (updater: (prev: HabitTrackerState) => HabitTrackerState) => {
    setHabits(prev => {
      const updated = updater(prev);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`agentladders_habits_${todayDateStr}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save habits', e);
        }
      }
      return updated;
    });
  };

  // Redirect Super Admin
  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      if (u.role === 'SUPER_ADMIN' || u.email === 'aditya@agentladders.com' || u.email === 'admin@agentladders.com') {
        window.location.href = '/admin';
      }
    }
  }, [session]);

  // Fetch Dashboard Action Data in Parallel
  useEffect(() => {
    Promise.all([
      fetch('/api/site-visits').then(r => r.json()).catch(() => ({})),
      fetch('/api/leads').then(r => r.json()).catch(() => ({})),
      fetch('/api/tasks').then(r => r.json()).catch(() => ({})),
      fetch('/api/properties').then(r => r.json()).catch(() => ({}))
    ]).then(([visitsData, leadsData, tasksData, propertiesData]) => {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Site Visits
      if (visitsData.siteVisits) {
        const todayVisits = visitsData.siteVisits.filter((v: VisitItem) => v.date === todayStr);
        if (todayVisits.length > 0) {
          setVisits(todayVisits);
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
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Compute Lead Matches Map
  const leadMatchMap = useMemo(() => {
    const map = new Map<string, { topMatch: any; score: number }>();
    if (properties.length === 0 || leads.length === 0) return map;

    leads.forEach(lead => {
      const matches = findMatchingPropertiesForLead(lead as any, properties as any);
      if (matches.length > 0 && matches[0].matchScore >= 50) {
        const topProp = properties.find(p => p.id === matches[0].propertyId) || null;
        map.set(lead.id, {
          topMatch: topProp || matches[0],
          score: matches[0].matchScore
        });
      }
    });
    return map;
  }, [leads, properties]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (leadFilter === 'hot') {
      result = result.filter(l => 
        (l.priority && l.priority.toLowerCase().includes('hot')) || 
        (l.status && l.status.toLowerCase().includes('hot')) ||
        (l.urgency && l.urgency.toLowerCase().includes('immediate'))
      );
    } else if (leadFilter === 'matched') {
      result = result.filter(l => leadMatchMap.has(l.id));
    }
    return result.slice(0, 6);
  }, [leads, leadFilter, leadMatchMap]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return tasks.filter(t => t.status !== 'Completed');
    if (taskFilter === 'completed') return tasks.filter(t => t.status === 'Completed');
    return tasks;
  }, [tasks, taskFilter]);

  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === 'Completed').length, [tasks]);

  // Action Handlers
  const handleCallLead = (phone: string) => {
    updateHabits(h => ({ ...h, callsDone: h.callsDone + 1 }));
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppLead = (lead: LeadItem, matchedProperty?: PropertyItem | null) => {
    updateHabits(h => ({ ...h, pitchesDone: h.pitchesDone + 1 }));
    const propTitle = matchedProperty?.title || 'premium inventory options';
    const message = `Hello ${lead.name}, this is regarding your property search in ${lead.preferredLocalities || lead.city || 'the city'}. I have exclusive details ready on ${propTitle}. Would today be a good time for a quick 2-minute discussion?`;
    openWhatsAppDirect(lead.phone, message);
  };

  const handleOpenShareFlyer = (prop: PropertyItem) => {
    setSelectedPropertyForShare(prop);
    setShareModalOpen(true);
    updateHabits(h => ({ ...h, pitchesDone: h.pitchesDone + 1 }));
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
    updateHabits(h => ({ ...h, visitsDone: h.visitsDone + 1 }));
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

  // Header Time & Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = session?.user?.name?.split(' ')[0] || 'Aditya';
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Initializing your daily action planner...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container animate-enter" style={{ maxWidth: 1280, margin: '0 auto', paddingBottom: 40 }}>
      
      {/* ── 1. HEADER: GREETING & QUICK MISSION STRIP ── */}
      <div className="responsive-header" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              {greeting}, {firstName}
            </h1>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '3px 9px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <SparklesIcon size={12} color="#059669" /> Action Planner
            </span>
          </div>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            {formattedToday} • Focus on today&apos;s site visits, client follow-ups, and checklist actions.
          </p>
        </div>

        {/* Quick Header Navigation Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/dashboard/site-visits"
            style={{
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <CalendarIcon size={14} color="#0f172a" />
            <span>Site Visits</span>
          </Link>

          <Link
            href="/dashboard/leads?new=true"
            style={{
              textDecoration: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 8,
              padding: '9px 15px',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <PlusIcon size={15} color="#ffffff" strokeWidth={2.5} />
            <span>+ Add Inquiry</span>
          </Link>
        </div>
      </div>

      {/* ── 2. BROKER DAILY HABIT TRACKER CARD ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon size={15} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                Broker Daily Momentum Tracker
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Daily Indian broker targets: 5 Calls • 2 Visits • 3 Property Flyer Pitches
              </div>
            </div>
          </div>

          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', backgroundColor: '#f0fdf4', padding: '3px 10px', borderRadius: 20 }}>
            Active Session
          </span>
        </div>

        {/* 3 Habit Progress Bars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}>
          {/* 1. Calls Goal */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <PhoneIcon size={13} color="#2563eb" /> Calls Target
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: habits.callsDone >= habits.callsGoal ? '#059669' : '#0f172a' }}>
                  {habits.callsDone} / {habits.callsGoal}
                </span>
                <button
                  onClick={() => updateHabits(h => ({ ...h, callsDone: h.callsDone + 1 }))}
                  title="Increment Call Count"
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    borderRadius: 4,
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round((habits.callsDone / habits.callsGoal) * 100))}%`,
                height: '100%',
                backgroundColor: habits.callsDone >= habits.callsGoal ? '#059669' : '#2563eb',
                borderRadius: 4,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* 2. Site Visits Goal */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MapPinIcon size={13} color="#d97706" /> Site Visits Goal
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: habits.visitsDone >= habits.visitsGoal ? '#059669' : '#0f172a' }}>
                  {habits.visitsDone} / {habits.visitsGoal}
                </span>
                <button
                  onClick={() => updateHabits(h => ({ ...h, visitsDone: h.visitsDone + 1 }))}
                  title="Increment Visit Count"
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    borderRadius: 4,
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round((habits.visitsDone / habits.visitsGoal) * 100))}%`,
                height: '100%',
                backgroundColor: habits.visitsDone >= habits.visitsGoal ? '#059669' : '#d97706',
                borderRadius: 4,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* 3. WhatsApp Flyer Pitches */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <WhatsAppIcon size={13} color="#15803d" /> WhatsApp Pitches
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: habits.pitchesDone >= habits.pitchesGoal ? '#059669' : '#0f172a' }}>
                  {habits.pitchesDone} / {habits.pitchesGoal}
                </span>
                <button
                  onClick={() => updateHabits(h => ({ ...h, pitchesDone: h.pitchesDone + 1 }))}
                  title="Increment Pitch Count"
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    borderRadius: 4,
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round((habits.pitchesDone / habits.pitchesGoal) * 100))}%`,
                height: '100%',
                backgroundColor: '#15803d',
                borderRadius: 4,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. CORE TWO-COLUMN ACTION GRID ── */}
      <div className="cockpit-grid">
        
        {/* ── COLUMN 1: HIGH-PRIORITY FOLLOW-UPS & INQUIRIES ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            {/* Card Header with Filter Pills */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Priority Follow-Up Calls
                  <InfoTooltip text="High-intent buyers requiring contact today, with automatic AI property matches ready for 1-click WhatsApp flyer pitches." />
                </h2>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {leads.length} active buyer leads in pipeline
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, backgroundColor: '#f1f5f9', padding: 3, borderRadius: 8 }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'hot', label: 'Hot Buyers' },
                  { key: 'matched', label: 'Matches Ready' }
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setLeadFilter(t.key as any)}
                    style={{
                      border: 'none',
                      backgroundColor: leadFilter === t.key ? '#ffffff' : 'transparent',
                      color: leadFilter === t.key ? '#0f172a' : '#64748b',
                      fontWeight: leadFilter === t.key ? 700 : 500,
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      boxShadow: leadFilter === t.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredLeads.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No leads match the selected filter.
                </div>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const match = leadMatchMap.get(lead.id);
                  const matchedProp = match?.topMatch as PropertyItem | undefined;

                  return (
                    <div
                      key={lead.id}
                      style={{
                        padding: '16px 20px',
                        borderBottom: idx === filteredLeads.length - 1 ? 'none' : '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      {/* Top Lead Info Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>
                              {lead.name}
                            </span>
                            {lead.priority?.toLowerCase().includes('hot') && (
                              <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 4 }}>
                                Hot Buyer
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {lead.phone} • {lead.preferredLocalities || lead.city || 'Mumbai'}
                          </div>
                        </div>

                        {/* Specs & Budget Badge */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#059669' }}>
                            {lead.budgetMax ? formatINR(Number(lead.budgetMax)) : 'Budget TBA'}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 600 }}>
                            {Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : (lead.bhkNeeded || 'Residential')}
                          </div>
                        </div>
                      </div>

                      {/* AI Matched Property Box if available */}
                      {matchedProp && (
                        <div style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: '#059669', color: '#ffffff', padding: '2px 6px', borderRadius: 4 }}>
                              {match?.score}% MATCH
                            </span>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                              {matchedProp.title}
                            </span>
                            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                              ({matchedProp.price ? formatINR(matchedProp.price) : ''})
                            </span>
                          </div>

                          {/* 1-Click WhatsApp Property Pitch & Flyer Share */}
                          <button
                            onClick={() => handleOpenShareFlyer(matchedProp)}
                            style={{
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '5px 11px',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                            }}
                          >
                            <ShareIcon size={12} color="#ffffff" />
                            <span>Share Flyer</span>
                          </button>
                        </div>
                      )}

                      {/* Direct Lead Action Buttons Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {/* Call Button */}
                        <button
                          onClick={() => handleCallLead(lead.phone)}
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#0f172a',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <PhoneIcon size={12} color="#0f172a" />
                          <span>Call</span>
                        </button>

                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleWhatsAppLead(lead, matchedProp)}
                          style={{
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <WhatsAppIcon size={13} color="#047857" />
                          <span>WhatsApp Pitch</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* View All Leads Link */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fafafa', textAlign: 'center' }}>
              <Link href="/dashboard/leads" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span>View Full Lead Pipeline ({leads.length} Contacts)</span>
                <ArrowRightIcon size={13} color="currentColor" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── COLUMN 2: SITE VISITS & QUICK TASK CHECKLIST ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* ── WIDGET A: TODAY'S SITE VISITS ── */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 15.5, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isTodayVisits ? "Today's Site Visits" : "Upcoming Site Visits"}
                </h2>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  {visits.length} showings scheduled
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: 10 }}>
                {visits.filter(v => v.status === 'Completed').length}/{visits.length} Done
              </span>
            </div>

            {visits.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>
                {isTodayVisits ? "No site visits scheduled for today." : "No upcoming site visits scheduled."}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {visits.map(v => (
                  <div
                    key={v.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '12px 14px',
                      backgroundColor: v.status === 'Completed' ? '#f8fafc' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ClockIcon size={12} color="#059669" />
                        {!isTodayVisits ? `${new Date(v.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • ` : ''}
                        {v.timeSlot || 'Time TBD'}
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: v.status === 'Completed' ? '#d1fae5' : '#eff6ff',
                        color: v.status === 'Completed' ? '#065f46' : '#1d4ed8',
                        padding: '2px 7px',
                        borderRadius: 8
                      }}>
                        {v.status}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        {v.property}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <UserIcon size={12} color="#94a3b8" />
                        <span>{v.client}</span>
                        {v.source === 'Client Portal' && (
                          <span style={{ fontSize: 9.5, fontWeight: 700, backgroundColor: '#fef08a', color: '#854d0e', padding: '1px 5px', borderRadius: 4 }}>
                            Portal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visit Actions: Call, WhatsApp Directions, Mark Done */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                      {v.clientPhone && (
                        <button
                          onClick={() => handleCallLead(v.clientPhone!)}
                          title="Call Client"
                          style={{
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            color: '#334155'
                          }}
                        >
                          <PhoneIcon size={11} color="#334155" />
                          <span>Call</span>
                        </button>
                      )}

                      {v.status !== 'Completed' && (
                        <button
                          onClick={() => handleCompleteVisit(v.id)}
                          style={{
                            border: '1px solid #a7f3d0',
                            backgroundColor: '#ecfdf5',
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#047857'
                          }}
                        >
                          <CheckIcon size={11} color="#047857" strokeWidth={3} />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/dashboard/site-visits"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid #f1f5f9',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              <span>Open Site Visits Schedule</span>
              <ArrowRightIcon size={12} color="currentColor" />
            </Link>
          </div>

          {/* ── WIDGET B: QUICK TASK CHECKLIST ── */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15.5, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Quick Action Checklist
                </h2>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  {completedTasksCount} of {tasks.length} tasks completed
                </div>
              </div>

              {/* Task Filter */}
              <div style={{ display: 'flex', gap: 4, backgroundColor: '#f1f5f9', padding: 2, borderRadius: 6 }}>
                {(['all', 'pending', 'completed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    style={{
                      border: 'none',
                      backgroundColor: taskFilter === f ? '#ffffff' : 'transparent',
                      color: taskFilter === f ? '#0f172a' : '#64748b',
                      fontWeight: taskFilter === f ? 700 : 500,
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Add Task Input Form */}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <input
                type="text"
                placeholder="Add quick action (e.g. 'Collect token cheque')..."
                value={newTaskInput}
                onChange={e => setNewTaskInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 11px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  outline: 'none',
                  color: '#0f172a'
                }}
              />
              <button
                type="submit"
                disabled={addingTask || !newTaskInput.trim()}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: addingTask || !newTaskInput.trim() ? 0.6 : 1
                }}
              >
                Add
              </button>
            </form>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12.5, padding: '16px 0' }}>
                  No tasks in this view.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const isDone = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        backgroundColor: isDone ? '#f8fafc' : '#ffffff',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleTaskStatus(task)}
                          style={{
                            width: 15,
                            height: 15,
                            accentColor: '#059669',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{
                          fontSize: 12.5,
                          color: isDone ? '#94a3b8' : '#0f172a',
                          textDecoration: isDone ? 'line-through' : 'none',
                          fontWeight: isDone ? 400 : 500
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
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                      >
                        <TrashIcon size={12} color="currentColor" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── 4. HOT INVENTORY QUICK FLYER PITCH DRAWER ── */}
      {properties.length > 0 && (
        <div style={{
          marginTop: 24,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                Hot Inventory Spotlight
                <InfoTooltip text="Quickly generate and share 1080x1080 photo flyer cards on WhatsApp for top fast-moving properties." />
              </h2>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                1-click Meesho-style WhatsApp card generator for client inquiries
              </div>
            </div>

            <Link href="/dashboard/properties" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>View All Properties ({properties.length})</span>
              <ArrowRightIcon size={12} color="currentColor" />
            </Link>
          </div>

          {/* Property Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16
          }}>
            {properties.slice(0, 4).map(prop => {
              const coverMedia = prop.media?.find(m => m.isCover) || prop.media?.[0];
              const imageUrl = coverMedia?.url || prop.images?.[0] || prop.image || '/images/hero_dashboard.jpg';

              return (
                <div
                  key={prop.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.15s ease'
                  }}
                >
                  {/* Photo with Price Badge */}
                  <div style={{ position: 'relative', width: '100%', height: 120, backgroundColor: '#0f172a' }}>
                    <Image
                      src={imageUrl}
                      alt={prop.title}
                      fill
                      sizes="300px"
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {formatINR(prop.price)}
                    </div>
                  </div>

                  {/* Property Details & 1-Click WhatsApp Flyer Action */}
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prop.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        {prop.bhk ? `${prop.bhk} • ` : ''}{prop.locality || prop.city || 'Mumbai'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenShareFlyer(prop)}
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        width: '100%'
                      }}
                    >
                      <ShareIcon size={12} color="#047857" />
                      <span>WhatsApp Photo Flyer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. REUSABLE MEESHO-STYLE WHATSAPP FLYER SHARE MODAL ── */}
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
