'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Report {
  [key: string]: unknown;
  id: string;
  name: string;
  type: string;
  frequency: string;
  createdAt: string;
  dateRange?: string;
  format?: string;
  scope?: string;
}

const initialForm = {
  name: '',
  type: 'Financial Summary',
  frequency: 'Monthly',
  dateRange: 'Current Quarter (Q3)',
  format: 'PDF Document',
  scope: 'Agency-Wide Operations'
};

export default function ReportsPage() {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Delete modal state
  const [reportToDelete, setReportToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [frequencyFilter, setFrequencyFilter] = useState('All');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const json = await res.json();
      if (json.reports) setData(json.reports);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadReports();
  };

  const handleDownload = (report: Report) => {
    const content = `AGENTLADDERS AGENCY AUDIT & EXECUTIVE REPORT\n` +
      `==================================================\n` +
      `Report Title: ${report.name}\n` +
      `Report Type: ${report.type}\n` +
      `Operational Scope: ${report.scope || 'Agency-Wide Operations'}\n` +
      `Reporting Window: ${report.dateRange || 'Current Quarter'}\n` +
      `Export Format: ${report.format || 'Standard Audit Doc'}\n` +
      `Cadence: ${report.frequency}\n` +
      `Generated Timestamp: ${new Date(report.createdAt).toLocaleString()}\n\n` +
      `Executive Summary:\n` +
      `- Pipeline Health: 100% Verified\n` +
      `- Commission Reconciliation: Balanced\n` +
      `- Inventory Syndication: In Sync\n` +
      `==================================================\n` +
      `Exported via AgentLadders High-Velocity Core Engine\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string, name: string) => {
    setReportToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    const res = await fetch(`/api/reports?id=${reportToDelete.id}`, { method: 'DELETE' });
    if (res.ok) {
      setData(prev => prev.filter(r => r.id !== reportToDelete.id));
    }
    setIsDeleting(false);
    setReportToDelete(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(rep => {
      const matchesSearch = 
        !searchQuery.trim() ||
        rep.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.scope?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || rep.type === typeFilter;
      const matchesFrequency = frequencyFilter === 'All' || rep.frequency === frequencyFilter;

      return matchesSearch && matchesType && matchesFrequency;
    });
  }, [data, searchQuery, typeFilter, frequencyFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setFrequencyFilter('All');
  };

  const columns: Column<Report>[] = [
    { 
      key: 'name', 
      label: 'Report Title',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            📊
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
            {r.scope && <div style={{ fontSize: '11px', color: '#64748b' }}>Scope: {r.scope}</div>}
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Report Type',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155' }}>
          {r.type}
        </span>
      )
    },
    { 
      key: 'dateRange', 
      label: 'Time Range',
      render: (r) => <span style={{ fontSize: '13px', color: '#334155' }}>{r.dateRange || 'Quarterly'}</span>
    },
    { key: 'frequency', label: 'Cadence' },
    { key: 'createdAt', label: 'Generated At', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleDownload(r)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Download Statement"
          >
            📥 Export
          </button>
          <button
            onClick={() => handleDelete(r.id, r.name)}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e11d48'
            }}
            title="Delete Report"
          >
            🗑️ Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader 
        title="Intelligence Reports & Statements" 
        subtitle="Generate financial statements, agent performance audits, and pipeline health analytics" 
        actions={<Button variant="primary" onClick={() => setShowModal(true)}>+ Generate Report</Button>} 
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search statements by title, scope, or report type..."
        totalCount={data.length}
        filteredCount={filteredData.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'type',
            label: 'Report Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'All' },
              { label: 'Financial Summary', value: 'Financial Summary' },
              { label: 'Sales & Pipeline', value: 'Sales' },
              { label: 'Agent Performance', value: 'Performance' },
              { label: 'Inventory Valuation', value: 'Inventory Valuation' }
            ]
          },
          {
            key: 'frequency',
            label: 'Cadence',
            value: frequencyFilter,
            onChange: setFrequencyFilter,
            options: [
              { label: 'All Frequencies', value: 'All' },
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Monthly', value: 'Monthly' },
              { label: 'Quarterly', value: 'Quarterly' }
            ]
          }
        ]}
      />
      
      {loading ? (
        <p style={{ padding: 20 }}>Loading reports...</p>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No reports matched your filters"
          onResetFilters={handleResetFilters}
        />
      )}

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, #f8fafc, #ffffff)'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  📊 Generate Intelligence Report
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Export executive audits, financial metrics, and operational performance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              <div className="responsive-grid-2" style={{ gap: '18px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Statement / Report Title *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Q3 Agency Commission & Portfolio Performance Statement"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Report Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Financial Summary">Financial & Commission Summary</option>
                    <option value="Sales">Sales Pipeline & Conversion</option>
                    <option value="Performance">Broker & Agent KPI Scorecard</option>
                    <option value="Inventory Valuation">Portfolio & Listing Valuation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Cadence / Frequency *
                  </label>
                  <select
                    value={form.frequency}
                    onChange={e => setForm({...form, frequency: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Monthly">Monthly Cycle</option>
                    <option value="Quarterly">Quarterly Review</option>
                    <option value="Annual">Annual Fiscal Audit</option>
                    <option value="Weekly">Weekly Digest</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Time Window / Date Range
                  </label>
                  <select
                    value={form.dateRange}
                    onChange={e => setForm({...form, dateRange: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Current Quarter (Q3)">Current Quarter (Q3)</option>
                    <option value="Year-to-Date (YTD)">Year-to-Date (YTD)</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Previous Fiscal Year">Previous Fiscal Year</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Export File Format
                  </label>
                  <select
                    value={form.format}
                    onChange={e => setForm({...form, format: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="PDF Document">PDF Executive Document</option>
                    <option value="Excel Spreadsheet">Microsoft Excel (.xlsx)</option>
                    <option value="CSV Data Export">Raw CSV Data Feed</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Operational Scope
                  </label>
                  <select
                    value={form.scope}
                    onChange={e => setForm({...form, scope: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="Agency-Wide Operations">Agency-Wide Full Operations</option>
                    <option value="Luxury Commercial Division">Luxury Commercial Division</option>
                    <option value="Prime Residential Division">Prime Residential Division</option>
                    <option value="Property Management Portfolio">Property Management Portfolio</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Generate Statement</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={!!reportToDelete}
        title="Delete Generated Report"
        message={
          <>
            Are you sure you want to delete report <strong>&ldquo;{reportToDelete?.name}&rdquo;</strong>? 
            This statement export will be removed from your reports log.
          </>
        }
        confirmText="Delete Report"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setReportToDelete(null)}
      />
    </>
  );
}
