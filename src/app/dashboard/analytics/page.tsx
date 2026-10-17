'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('ytd');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/dashboard-stats');
        const json = await res.json();
        if (json) setData(json);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (!data?.chartData) return [];
    if (timeRange === '30d') return data.chartData.slice(-2);
    if (timeRange === '90d') return data.chartData.slice(-3);
    if (timeRange === 'ytd') return data.chartData.slice(-5);
    return data.chartData;
  }, [data, timeRange]);

  // Dynamically compute KPIs based on active timeRange
  const reactiveMetrics = useMemo(() => {
    if (!data) return { revenue: '₹0', leads: 0, deals: 0, conversionRate: '0%' };

    const totalRawRevenue = chartData.reduce((acc: number, curr: any) => acc + (curr.revenue || 0), 0);
    const totalLeads = chartData.reduce((acc: number, curr: any) => acc + (curr.leads || 0), 0);
    const estimatedDeals = Math.max(1, Math.round(totalLeads * 0.18));
    const conversionRate = totalLeads > 0 ? ((estimatedDeals / totalLeads) * 100).toFixed(1) + '%' : '18.5%';

    const formatINR = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${val.toLocaleString('en-IN')}`;
    };

    return {
      revenue: formatINR(totalRawRevenue),
      leads: totalLeads,
      deals: estimatedDeals,
      conversionRate
    };
  }, [data, chartData]);

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value', 'Time Range'],
      ['Revenue', reactiveMetrics.revenue, timeRange.toUpperCase()],
      ['Lead Volume', reactiveMetrics.leads, timeRange.toUpperCase()],
      ['Deals Closed', reactiveMetrics.deals, timeRange.toUpperCase()],
      ['Pipeline Conversion Rate', reactiveMetrics.conversionRate, timeRange.toUpperCase()],
      [],
      ['Month', 'Revenue (₹)', 'Inbound Leads']
    ];
    chartData.forEach((row: any) => {
      rows.push([row.name, row.revenue, row.leads]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agentladders_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const agentsLeaderboard = [
    { name: 'Aditya Rai', role: 'Managing Broker', deals: 18, volume: '₹24.80 Cr', commission: '₹49.60 L', winRate: '84%' },
    { name: 'Marcus Vance', role: 'Senior Partner', deals: 14, volume: '₹18.40 Cr', commission: '₹36.80 L', winRate: '78%' },
    { name: 'Elena Rostova', role: 'Luxury Director', deals: 11, volume: '₹14.25 Cr', commission: '₹28.50 L', winRate: '71%' },
    { name: 'Tariq Mansoor', role: 'Commercial Associate', deals: 8, volume: '₹9.80 Cr', commission: '₹19.60 L', winRate: '65%' }
  ];

  return (
    <>
      <PageHeader 
        title="Performance Analytics & Intelligence" 
        subtitle="Deep dive into your agency's revenue velocity, deal pipeline conversion, and broker performance" 
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '3px', flexWrap: 'wrap' }}>
              {(['30d', '90d', 'ytd', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: timeRange === r ? '#ffffff' : 'transparent',
                    color: timeRange === r ? '#2563eb' : '#64748b',
                    boxShadow: timeRange === r ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : r === 'ytd' ? 'YTD' : 'All Time'}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={handleExport}>
              📥 Export CSV
            </Button>
          </div>
        } 
      />
      
      {loading || !data ? (
        <p style={{ padding: 24, color: '#64748b' }}>Crunching agency telemetry...</p>
      ) : (
        <>
          {/* REACTIVE KPI METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
                  {timeRange === '30d' ? '30 Days Revenue' : timeRange === '90d' ? '90 Days Revenue' : timeRange === 'ytd' ? 'YTD Revenue' : 'All-Time Revenue'}
                </p>
                <span style={{ fontSize: '18px' }}>💵</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-color)', margin: '0 0 6px' }}>{reactiveMetrics.revenue}</h3>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>↑ +16.4% pacing vs target</span>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>Inbound Lead Volume</p>
                <span style={{ fontSize: '18px' }}>🎯</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{reactiveMetrics.leads}</h3>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Filtered for {timeRange.toUpperCase()}</span>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>Pipeline Deals Converted</p>
                <span style={{ fontSize: '18px' }}>🤝</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{reactiveMetrics.deals}</h3>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Closed Won Contracts</span>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>Inquiry Conversion Rate</p>
                <span style={{ fontSize: '18px' }}>📈</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{reactiveMetrics.conversionRate}</h3>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Top 5% Agency Benchmark</span>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="analytics-grid-2" style={{ marginBottom: '24px' }}>
            {/* Revenue Velocity Chart */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Revenue Velocity ({timeRange.toUpperCase()})
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Cumulative closed transaction volume over time</p>
                </div>
                <span style={{ fontSize: '12px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  ↑ 14.8% vs prior window
                </span>
              </div>
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'var(--text-secondary)', fontSize: 12}} 
                      tickFormatter={(value) => value >= 10000000 ? `₹${(value / 10000000).toFixed(1)}Cr` : value >= 100000 ? `₹${(value / 100000).toFixed(0)}L` : `₹${(value / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads Volume Chart */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Lead Ingestion
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Qualified inquiries received</p>
                </div>
                <span style={{ fontSize: '12px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  Active Leads
                </span>
              </div>
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'var(--background-color)'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Bar dataKey="leads" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* BROKER LEADERBOARD TABLE */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    🏆 Broker Team Performance Leaderboard
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                    Agent transaction volume, closed deal count, and gross commission split
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '8px' }}>
                  4 Active Agents
                </span>
              </div>

              <div className="responsive-table-scroll touch-scroll-container">
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Broker Agent</th>
                      <th style={{ padding: '12px 16px' }}>Role</th>
                      <th style={{ padding: '12px 16px' }}>Closed Deals</th>
                      <th style={{ padding: '12px 16px' }}>Gross Sales Volume</th>
                      <th style={{ padding: '12px 16px' }}>Commission Earned</th>
                      <th style={{ padding: '12px 16px' }}>Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentsLeaderboard.map((a, i) => (
                      <tr key={i} style={{ borderBottom: i === agentsLeaderboard.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                        <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563eb' }}>
                            {a.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{a.name}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{a.role}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{a.deals} deals</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2563eb' }}>{a.volume}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>{a.commission}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#15803d' }}>
                            {a.winRate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
