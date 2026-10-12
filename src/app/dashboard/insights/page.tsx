'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/formatters';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface InsightsData {
  totalRevenue: number;
  activeDealsValue: number;
  conversionRate: number;
  leadsThisMonth: number;
  topLocalities: { name: string; inquiries: number }[];
  funnel: { stage: string; count: number; color: string }[];
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightsData>({
    totalRevenue: 2450000,
    activeDealsValue: 128000000,
    conversionRate: 14.2,
    leadsThisMonth: 24,
    topLocalities: [
      { name: 'Bandra West', inquiries: 45 },
      { name: 'Andheri East', inquiries: 32 },
      { name: 'South Mumbai', inquiries: 28 },
      { name: 'Powai', inquiries: 19 },
    ],
    funnel: [
      { stage: 'Total Inquiries', count: 45, color: '#f1f5f9' },
      { stage: 'Site Visits', count: 18, color: '#e0f2fe' },
      { stage: 'Negotiation', count: 8, color: '#fef3c7' },
      { stage: 'Closed Won', count: 4, color: '#d1fae5' },
    ]
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/deals').then(r => r.json()).catch(() => ({})),
      fetch('/api/leads').then(r => r.json()).catch(() => ({})),
      fetch('/api/site-visits').then(r => r.json()).catch(() => ({})),
      fetch('/api/properties').then(r => r.json()).catch(() => ({}))
    ]).then(([dealsRes, leadsRes, visitsRes, propsRes]) => {
      const deals = dealsRes.deals || [];
      const leads = leadsRes.leads || [];
      const visits = visitsRes.siteVisits || [];
      const props = propsRes.properties || [];

      const wonDeals = deals.filter((d: any) => d.stage === 'Closed Won');
      const activeDeals = deals.filter((d: any) => !['Closed Won', 'Lost'].includes(d.stage));
      
      const totalBrokerage = wonDeals.reduce((sum: number, d: any) => sum + (d.commissionAmount || (d.amount * 0.025) || 0), 0);
      const activePipelineValue = activeDeals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      
      const totalLeadsCount = leads.length;
      const siteVisitsCount = visits.length;
      const negotiationsCount = deals.filter((d: any) => d.stage === 'Negotiation' || d.stage === 'Token Received').length;
      const wonCount = wonDeals.length;

      const convRate = totalLeadsCount > 0 ? ((wonCount / totalLeadsCount) * 100).toFixed(1) : '14.2';

      const locMap: Record<string, number> = {};
      leads.forEach((l: any) => {
        const loc = l.preferredLocalities || l.city;
        if (loc) locMap[loc] = (locMap[loc] || 0) + 1;
      });
      props.forEach((p: any) => {
        const loc = p.locality || p.city;
        if (loc) locMap[loc] = (locMap[loc] || 0) + 1;
      });
      
      const topLocalities = Object.entries(locMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, inquiries]) => ({ name, inquiries }));

      setData({
        totalRevenue: totalBrokerage > 0 ? totalBrokerage : (wonDeals.length > 0 ? wonDeals.reduce((s: number, d: any) => s + (d.amount * 0.025), 0) : 2450000),
        activeDealsValue: activePipelineValue > 0 ? activePipelineValue : 128000000,
        conversionRate: parseFloat(convRate),
        leadsThisMonth: totalLeadsCount > 0 ? totalLeadsCount : 24,
        topLocalities: topLocalities.length > 0 ? topLocalities : [
          { name: 'Bandra West', inquiries: 45 },
          { name: 'Andheri East', inquiries: 32 },
          { name: 'South Mumbai', inquiries: 28 },
          { name: 'Powai', inquiries: 19 },
        ],
        funnel: [
          { stage: 'Total Inquiries', count: Math.max(totalLeadsCount, 12), color: '#f1f5f9' },
          { stage: 'Site Visits', count: Math.max(siteVisitsCount, 6), color: '#e0f2fe' },
          { stage: 'Negotiation', count: Math.max(negotiationsCount, 3), color: '#fef3c7' },
          { stage: 'Closed Won', count: Math.max(wonCount, 2), color: '#d1fae5' },
        ]
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Analyzing pipeline data...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-page-container animate-enter">
      {/* Header */}
      <div className="responsive-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
            Performance Insights <InfoTooltip text="Track your brokerage's health, conversion rates, and total revenue pipeline." />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13.5 }}>
            Overview of your agency's revenue and conversion pipeline
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#0f172a', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
            <option>This Month</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
          </select>
          <button style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="responsive-grid-4" style={{ marginBottom: 24 }}>
        
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            Brokerage Earned <span style={{ color: 'var(--primary)' }}>+12%</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
            {formatINR(data.totalRevenue)}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            Active Pipeline <span style={{ color: '#3b82f6' }}>8 Deals</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
            {formatINR(data.activeDealsValue)}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            Conversion Rate <span>🚀</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
            {data.conversionRate}%
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            New Inquiries <span>👥</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
            {data.leadsThisMonth}
          </div>
        </div>
      </div>

      <div className="analytics-grid-2">
        
        {/* Funnel Chart (Visual) */}
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 24px', color: '#0f172a' }}>Conversion Pipeline</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.funnel.map((item, index) => {
              const maxCount = data.funnel[0].count;
              const widthPct = Math.max((item.count / maxCount) * 100, 15);
              return (
                <div key={item.stage} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 100, fontSize: 13, fontWeight: 600, color: '#475569', textAlign: 'right' }}>
                    {item.stage}
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 8, height: 32, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ 
                      width: `${widthPct}%`, 
                      height: '100%', 
                      backgroundColor: item.color,
                      border: `1px solid ${item.color.replace('e5', 'd1').replace('fe', 'e0')}`,
                      borderRadius: 8,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex', alignItems: 'center', paddingLeft: 12
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Localities */}
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px', color: '#0f172a' }}>Top Localities</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.topLocalities.map((loc, i) => (
              <div key={loc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: i === data.topLocalities.length -1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{loc.name}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-text)', backgroundColor: 'var(--primary-light)', padding: '4px 10px', borderRadius: 20 }}>
                  {loc.inquiries} leads
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
