'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableFilterBar } from '@/components/ui/TableFilterBar';

interface Campaign {
  [key: string]: unknown;
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spend: number;
  leadsGenerated: number;
  dealsClosed: number;
  utmSource?: string;
  startDate: string;
}

export default function MarketingPage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUtmBuilder, setShowUtmBuilder] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');

  // New Campaign Form
  const initialForm = {
    name: '',
    platform: 'Meta Ads',
    budget: '',
    spend: '0',
    status: 'Active',
    utmSource: '',
    startDate: new Date().toISOString().split('T')[0]
  };
  const [form, setForm] = useState(initialForm);

  // UTM Link Builder Form
  const [utmProp, setUtmProp] = useState('prop_1');
  const [utmSource, setUtmSource] = useState('instagram_reels');
  const [generatedUtmUrl, setGeneratedUtmUrl] = useState('');
  const [utmCopied, setUtmCopied] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing');
      const json = await res.json();
      if (json.campaigns) setData(json.campaigns);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === 'All' || c.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [data, searchQuery, platformFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadCampaigns();
  };

  const generateUtmLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agentladders.com';
    const link = `${origin}/p/${utmProp}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=social&utm_campaign=agency_lead_gen`;
    setGeneratedUtmUrl(link);
  };

  const handleCopyUtm = () => {
    if (typeof navigator !== 'undefined' && generatedUtmUrl) {
      navigator.clipboard.writeText(generatedUtmUrl);
      setUtmCopied(true);
      setTimeout(() => setUtmCopied(false), 2000);
    }
  };

  // Aggregated KPIs
  const totalSpend = data.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalLeads = data.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const totalDeals = data.reduce((acc, c) => acc + (c.dealsClosed || 0), 0);
  const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

  const columns: Column<Campaign>[] = [
    {
      key: 'name',
      label: 'Campaign Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
            🎯
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>UTM: {r.utmSource || 'direct'} &middot; Start: {r.startDate}</div>
          </div>
        </div>
      )
    },
    {
      key: 'platform',
      label: 'Channel',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#1e293b' }}>
          {r.platform}
        </span>
      )
    },
    {
      key: 'budget',
      label: 'Budget & Spend',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>${(r.spend || 0).toLocaleString()}</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}> / ${r.budget.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'leadsGenerated',
      label: 'Leads',
      render: (r) => (
        <span style={{ fontWeight: 700, color: '#2563eb' }}>
          🔥 {r.leadsGenerated} leads
        </span>
      )
    },
    {
      key: 'dealsClosed',
      label: 'Conversions',
      render: (r) => (
        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#166534' }}>
          ✓ {r.dealsClosed} closed
        </span>
      )
    },
    {
      key: 'cpl',
      label: 'Cost / Lead',
      render: (r) => {
        const cpl = r.leadsGenerated > 0 ? Math.round((r.spend || 0) / r.leadsGenerated) : 0;
        return <span style={{ fontWeight: 600, color: '#475569' }}>${cpl}</span>;
      }
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <>
      <PageHeader
        title="Marketing & Lead Acquisition"
        subtitle="Manage ad campaigns, portal syndications, ROI tracking, and smart UTM tracking links"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Campaign
          </Button>
        }
      />

      {/* KPI Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Ad Spend</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>${totalSpend.toLocaleString()}</div>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>Active marketing budget</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Inbound Leads</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{totalLeads} Leads</div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Attributed to active channels</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Avg. Cost Per Lead</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>${avgCpl}</div>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>High conversion efficiency</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Deals Won via Campaigns</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{totalDeals} Deals</div>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500 }}>Verified pipeline conversions</span>
        </div>
      </div>

      {/* UTM Builder Banner */}
      <div style={{
        backgroundColor: '#eff6ff',
        borderRadius: '12px',
        border: '1px solid #bfdbfe',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>🔗</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e3a8a' }}>Smart UTM Tracking Link Builder</div>
            <div style={{ fontSize: '12px', color: '#3b82f6' }}>Create campaign-tagged links for Instagram, TikTok, and WhatsApp broadcasts</div>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setShowUtmBuilder(!showUtmBuilder)}>
          {showUtmBuilder ? 'Close Link Builder' : 'Open Link Builder'}
        </Button>
      </div>

      {/* Collapsible UTM Builder */}
      {showUtmBuilder && (
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Generate Tracked Property Link</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select Property</label>
              <select
                value={utmProp}
                onChange={e => setUtmProp(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="prop_1">Luxury Villa in Beverly Hills ($4.5M)</option>
                <option value="prop_2">Downtown Sky Penthouse ($2.85M)</option>
                <option value="prop_3">Modern Waterfront Residence ($1.65M)</option>
                <option value="prop_4">Silicon Valley Executive Condo ($1.25M)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Distribution Channel</label>
              <select
                value={utmSource}
                onChange={e => setUtmSource(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="instagram_reels">Instagram Reels & Bio</option>
                <option value="whatsapp_broadcast">WhatsApp VIP Broadcast</option>
                <option value="tiktok_property_tour">TikTok Virtual Tour</option>
                <option value="property_finder">Property Finder Featured</option>
                <option value="email_newsletter">Private Investor Email List</option>
              </select>
            </div>
            <Button variant="primary" onClick={generateUtmLink}>
              Generate URL
            </Button>
          </div>

          {generatedUtmUrl && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                type="text"
                readOnly
                value={generatedUtmUrl}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', fontFamily: 'monospace' }}
              />
              <Button variant="secondary" onClick={handleCopyUtm}>
                {utmCopied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table Filter Bar */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search campaigns by name or channel..."
        filters={[
          {
            key: 'platform',
            label: 'Channel',
            value: platformFilter,
            options: [
              { label: 'All Channels', value: 'All' },
              { label: 'Property Finder', value: 'Property Finder' },
              { label: 'Bayut', value: 'Bayut' },
              { label: 'Meta Ads', value: 'Meta Ads' },
              { label: 'Google Ads', value: 'Google Ads' },
              { label: 'WhatsApp Broadcast', value: 'WhatsApp Broadcast' }
            ],
            onChange: setPlatformFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setPlatformFilter('All');
        }}
        totalCount={data.length}
        filteredCount={filteredData.length}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        emptyMessage="No marketing campaigns found. Launch your first portal syndication or Meta ad!"
      />

      {/* Create Campaign Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>New Marketing Campaign</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waterfront Penthouse Meta Retargeting"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Marketing Channel</label>
                  <select
                    value={form.platform}
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    <option>Property Finder</option>
                    <option>Bayut</option>
                    <option>Meta Ads</option>
                    <option>Google Ads</option>
                    <option>WhatsApp Broadcast</option>
                    <option>Direct Referral</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Allocated Budget ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Launch Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
