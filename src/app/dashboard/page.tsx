'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

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

interface FollowUpItem {
  id: string;
  name: string;
  phone: string;
  bhkNeeded?: string | string[];
  budgetMax?: number;
  city?: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [isTodayVisits, setIsTodayVisits] = useState(true);
  const [leads, setLeads] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      if (u.role === 'SUPER_ADMIN' || u.email === 'aditya@agentladders.com' || u.email === 'admin@agentladders.com') {
        window.location.href = '/admin';
        return;
      }
    }
  }, [session]);

  useEffect(() => {
    Promise.all([
      fetch('/api/site-visits').then(r => r.json()).catch(() => ({})),
      fetch('/api/leads').then(r => r.json()).catch(() => ({}))
    ]).then(([visitsData, leadsData]) => {
      const todayStr = new Date().toISOString().split('T')[0];
      
      if (visitsData.siteVisits) {
        const todayVisits = visitsData.siteVisits.filter((v: VisitItem) => v.date === todayStr);
        if (todayVisits.length > 0) {
          setVisits(todayVisits.slice(0, 5));
          setIsTodayVisits(true);
        } else {
          const upcoming = visitsData.siteVisits
            .filter((v: VisitItem) => v.date >= todayStr && v.status !== 'Cancelled')
            .sort((a: VisitItem, b: VisitItem) => a.date.localeCompare(b.date));
          setVisits(upcoming.slice(0, 5));
          setIsTodayVisits(false);
        }
      }
      if (leadsData.leads) {
        setLeads(leadsData.leads.slice(0, 5));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = session?.user?.name?.split(' ')[0] || 'Aditya';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Organizing your day...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container animate-enter">
      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {greeting}, {firstName} <InfoTooltip text="Your daily command center. Site visits and priority follow-ups all in one place." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            {isTodayVisits ? `You have ${visits.length} site visits and ${leads.length} follow-ups scheduled for today.` : `You have ${visits.length} upcoming site visits and ${leads.length} active follow-ups.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard/properties" style={{ textDecoration: 'none', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
            Browse Inventory
          </Link>
          <Link href="/dashboard/leads?new=true" style={{ textDecoration: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>+ Add Inquiry</span>
          </Link>
        </div>
      </div>

      <div className="cockpit-grid">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          

          {/* Today's Follow-ups */}
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Priority Follow-ups</h3>
              <Link href="/dashboard/leads" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View All →</Link>
            </div>
            <div className="responsive-table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 440 }}>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No follow-ups today.</td></tr>
                  ) : (
                    leads.map(lead => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{lead.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{lead.phone}</div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                            {Array.isArray(lead.bhkNeeded) ? lead.bhkNeeded.join(', ') : lead.bhkNeeded}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
                            {lead.budgetMax ? `Up to ${formatINR(lead.budgetMax)}` : 'Budget TBA'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button 
                            onClick={() => window.location.href = `tel:${lead.phone}`}
                            style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            📞 Call
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Site Visits Widget */}
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {isTodayVisits ? "Today's Site Visits" : "Upcoming Site Visits"}
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-text)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: 10 }}>
                {visits.length} scheduled
              </span>
            </div>
            
            {visits.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>
                {isTodayVisits ? "No site visits scheduled for today." : "No upcoming site visits scheduled."}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {visits.map(v => (
                  <div key={v.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    <div style={{ width: 2, backgroundColor: 'var(--primary)', borderRadius: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          {!isTodayVisits ? `${new Date(v.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • ` : ''}{v.timeSlot || 'TBD'}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {v.source === 'Client Portal' && (
                            <span style={{ fontSize: 9.5, fontWeight: 700, backgroundColor: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: 6 }}>
                              🌐 Portal
                            </span>
                          )}
                          <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: v.status === 'Completed' ? '#d1fae5' : '#dbeafe', color: v.status === 'Completed' ? '#065f46' : '#1e40af', padding: '2px 8px', borderRadius: 10 }}>
                            {v.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>{v.property}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        👤 {v.client}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Link href="/dashboard/site-visits" style={{ display: 'block', textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              Open Calendar →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
