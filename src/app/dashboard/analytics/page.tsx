'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('ytd');

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch('/api/dashboard-stats');
      const json = await res.json();
      if (json) setData(json);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', data.stats.totalRevenue],
      ['Active Properties', data.stats.activeProperties],
      ['Lead Volume', data.stats.newLeads],
      ['Active Deals', data.stats.activeDeals],
      [],
      ['Period', 'Revenue ($)', 'Leads']
    ];
    if (data.chartData) {
      data.chartData.forEach((row: any) => {
        rows.push([row.name, row.revenue, row.leads]);
      });
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agentladders_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredChartData = () => {
    if (!data || !data.chartData) return [];
    if (timeRange === '30d') return data.chartData.slice(-2);
    if (timeRange === '90d') return data.chartData.slice(-3);
    return data.chartData;
  };

  return (
    <>
      <PageHeader 
        title="Performance Analytics" 
        subtitle="Deep dive into your agency's performance, deal flow, and lead generation velocity" 
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
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
        <p style={{ padding: 24, color: '#64748b' }}>Crunching agency metrics...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '0 24px 24px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                {timeRange === '30d' ? 'Last 30 Days Revenue' : timeRange === '90d' ? 'Last 90 Days Revenue' : 'YTD Revenue'}
              </p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary-color)' }}>{data.stats.totalRevenue}</h3>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Active Listings</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700 }}>{data.stats.activeProperties}</h3>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Lead Volume</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700 }}>{data.stats.newLeads}</h3>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Open Pipelines</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700 }}>{data.stats.activeDeals}</h3>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Revenue Trend Chart */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Revenue Velocity ({timeRange.toUpperCase()})
                </h3>
                <span style={{ fontSize: '12px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  ↑ 14.8% vs prior
                </span>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getFilteredChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads Bar Chart */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Lead Volume
                </h3>
                <span style={{ fontSize: '12px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  Inquiries
                </span>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getFilteredChartData()} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'var(--background-color)'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Bar dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

