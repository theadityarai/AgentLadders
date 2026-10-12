'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { TableFilterBar } from '@/components/ui/TableFilterBar';

interface ActivityItem {
  id: string;
  actor: string;
  type: string;
  relatedEntity: string;
  relatedId?: string;
  summary: string;
  details?: string;
  createdAt: string;
}

export default function TimelinePage() {
  const [data, setData] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const initialForm = {
    type: 'Call',
    relatedEntity: 'Lead',
    summary: '',
    details: ''
  };
  const [form, setForm] = useState(initialForm);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timeline');
      const json = await res.json();
      if (json.activities) setData(json.activities);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const filteredData = useMemo(() => {
    return data.filter(a => {
      const matchesSearch = a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.details && a.details.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'All' || a.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowModal(false);
    setForm(initialForm);
    loadActivities();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call': return { icon: '📞', bg: '#eff6ff', color: '#1d4ed8' };
      case 'WhatsApp': return { icon: '💬', bg: '#f0fdf4', color: '#15803d' };
      case 'Email': return { icon: '✉️', bg: '#f8fafc', color: '#475569' };
      case 'Site Visit': return { icon: '📍', bg: '#fef3c7', color: '#b45309' };
      case 'Deal Update': return { icon: '💰', bg: '#ecfdf5', color: '#047857' };
      case 'Property Share': return { icon: '📲', bg: '#f5f3ff', color: '#6d28d9' };
      default: return { icon: '📝', bg: '#f1f5f9', color: '#334155' };
    }
  };

  return (
    <>
      <PageHeader
        title="Communication & Activity Timeline"
        subtitle="Chronological audit trail of all broker calls, WhatsApp messages, client showings, and transactions"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Log Interaction
          </Button>
        }
      />

      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search interactions by client, agent, or notes..."
        filters={[
          {
            key: 'type',
            label: 'Activity Type',
            value: typeFilter,
            options: [
              { label: 'All Activities', value: 'All' },
              { label: 'Phone Call', value: 'Call' },
              { label: 'WhatsApp Message', value: 'WhatsApp' },
              { label: 'Email', value: 'Email' },
              { label: 'Site Visit', value: 'Site Visit' },
              { label: 'Deal Update', value: 'Deal Update' },
              { label: 'Property Share', value: 'Property Share' },
              { label: 'Note', value: 'Note' }
            ],
            onChange: setTypeFilter
          }
        ]}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('All');
        }}
        totalCount={data.length}
        filteredCount={filteredData.length}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading communication stream...
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📜</div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>No timeline entries found</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Log your first call, client tour, or WhatsApp share to record interaction history.</div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            {/* Timeline Vertical Line */}
            <div style={{
              position: 'absolute',
              left: '15px',
              top: '10px',
              bottom: '10px',
              width: '2px',
              backgroundColor: '#e2e8f0'
            }} />

            {filteredData.map((act) => {
              const style = getActivityIcon(act.type);
              const date = new Date(act.createdAt);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={act.id}
                  style={{
                    position: 'relative',
                    marginBottom: '24px',
                    paddingBottom: '8px'
                  }}
                >
                  {/* Timeline Badge Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: style.bg,
                    border: `2px solid ${style.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {style.icon}
                  </div>

                  {/* Card Content */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{act.summary}</span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: style.bg,
                          color: style.color,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {act.type}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{formattedDate}</span>
                    </div>

                    {act.details && (
                      <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: '6px 0 10px' }}>
                        {act.details}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                      <span>👤 Logged by: <strong>{act.actor}</strong></span>
                      <span>🎯 Entity: <strong>{act.relatedEntity}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Log Client Interaction</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Interaction Channel</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    <option>Call</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Site Visit</option>
                    <option>Note</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Associated Entity</label>
                  <select
                    value={form.relatedEntity}
                    onChange={e => setForm({ ...form, relatedEntity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    <option>Lead</option>
                    <option>Client</option>
                    <option>Property</option>
                    <option>Deal</option>
                    <option>Owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Summary Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed counter-offer terms with buyer"
                  value={form.summary}
                  onChange={e => setForm({ ...form, summary: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Detailed Notes / Meeting Outcome</label>
                <textarea
                  rows={3}
                  placeholder="Client confirmed interest in 4-bedroom villa, scheduled follow-up wire deposit confirmation..."
                  value={form.details}
                  onChange={e => setForm({ ...form, details: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Record to Timeline</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
