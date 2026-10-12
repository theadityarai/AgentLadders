'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { TableFilterBar } from '@/components/ui/TableFilterBar';

interface AuditLogItem {
  [key: string]: unknown;
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

interface RecycleItem {
  [key: string]: unknown;
  id: string;
  entityType: string;
  originalId: string;
  name: string;
  deletedBy: string;
  deletedAt: string;
}

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'recycle'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [recycleBin, setRecycleBin] = useState<RecycleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const json = await res.json();
      if (json.auditLogs) setAuditLogs(json.auditLogs);
      if (json.recycleBin) setRecycleBin(json.recycleBin);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestore = async (id: string, name: string) => {
    setRestoringId(id);
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', recycleId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`✓ ${name} successfully restored to active records!`);
        setTimeout(() => setFeedback(''), 3000);
        loadData();
      }
    } catch {
      console.error('Restore failed');
    } finally {
      setRestoringId(null);
    }
  };

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(a => {
      const matchesSearch = a.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.entity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === 'All' || a.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return { bg: '#eff6ff', color: '#1d4ed8' };
      case 'UPDATE': return { bg: '#fef3c7', color: '#b45309' };
      case 'DELETE': return { bg: '#fef2f2', color: '#b91c1c' };
      case 'RESTORE': return { bg: '#f0fdf4', color: '#15803d' };
      case 'SHARE': return { bg: '#f5f3ff', color: '#6d28d9' };
      case 'LOGIN': return { bg: '#f1f5f9', color: '#334155' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const auditColumns: Column<AuditLogItem>[] = [
    {
      key: 'action',
      label: 'Operation',
      render: (r) => {
        const badge = getActionBadge(r.action);
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: badge.bg,
            color: badge.color
          }}>
            {r.action}
          </span>
        );
      }
    },
    {
      key: 'entity',
      label: 'Object / Entity',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.entity}</span>
          <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {r.entityId}</div>
        </div>
      )
    },
    { key: 'details', label: 'Activity Details' },
    {
      key: 'userName',
      label: 'Actor / User',
      render: (r) => (
        <span style={{ fontWeight: 500, color: '#334155' }}>
          👤 {r.userName}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (r) => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(r.createdAt).toLocaleString()}
        </span>
      )
    }
  ];

  const recycleColumns: Column<RecycleItem>[] = [
    {
      key: 'entityType',
      label: 'Entity Type',
      render: (r) => (
        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155' }}>
          {r.entityType}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Original Name / Title',
      render: (r) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</span>
    },
    {
      key: 'deletedBy',
      label: 'Deleted By',
      render: (r) => <span>👤 {r.deletedBy}</span>
    },
    {
      key: 'deletedAt',
      label: 'Deleted Date',
      render: (r) => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(r.deletedAt).toLocaleString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => handleRestore(r.id, r.name)}
          disabled={restoringId === r.id}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #bbf7d0',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            fontWeight: 600,
            fontSize: '12px',
            cursor: restoringId === r.id ? 'not-allowed' : 'pointer'
          }}
        >
          {restoringId === r.id ? 'Restoring...' : '♻️ Restore to CRM'}
        </button>
      )
    }
  ];

  return (
    <div className="dashboard-page-container">
      <PageHeader
        title="Audit Logs & Recycle Bin"
        subtitle="Full forensic audit trail of all data changes and recovery bin for soft-deleted records"
      />

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          {feedback}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="responsive-pills-scroll" style={{
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '14px',
            color: activeTab === 'audit' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'audit' ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          📜 System Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('recycle')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '14px',
            color: activeTab === 'recycle' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'recycle' ? '2px solid #2563eb' : '2px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          ♻️ Soft-Delete Recycle Bin ({recycleBin.length})
        </button>
      </div>

      <div style={{ paddingBottom: '24px' }}>
        {activeTab === 'audit' ? (
          <>
            <TableFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search audit log by actor, operation, or details..."
              filters={[
                {
                  key: 'action',
                  label: 'Action Type',
                  value: actionFilter,
                  options: [
                    { label: 'All Operations', value: 'All' },
                    { label: 'CREATE', value: 'CREATE' },
                    { label: 'UPDATE', value: 'UPDATE' },
                    { label: 'DELETE', value: 'DELETE' },
                    { label: 'RESTORE', value: 'RESTORE' },
                    { label: 'SHARE', value: 'SHARE' },
                    { label: 'LOGIN', value: 'LOGIN' }
                  ],
                  onChange: setActionFilter
                }
              ]}
              onReset={() => {
                setSearchQuery('');
                setActionFilter('All');
              }}
              totalCount={auditLogs.length}
              filteredCount={filteredAuditLogs.length}
            />
            <DataTable
              columns={auditColumns}
              data={filteredAuditLogs}
              emptyMessage="No audit log entries recorded yet."
            />
          </>
        ) : (
          <DataTable
            columns={recycleColumns}
            data={recycleBin}
            emptyMessage="Recycle bin is completely empty. No deleted records."
          />
        )}
      </div>
    </div>
  );
}
