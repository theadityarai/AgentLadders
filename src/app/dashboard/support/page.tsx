'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface SupportMessage {
  id: string;
  sender: string;
  isStaff: boolean;
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdByName: string;
  messages: SupportMessage[];
  createdAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const initialForm = {
    subject: '',
    category: 'CRM Feature',
    priority: 'Medium',
    message: ''
  };
  const [form, setForm] = useState(initialForm);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support');
      const json = await res.json();
      if (json.tickets) {
        setTickets(json.tickets);
        if (!selectedTicket && json.tickets.length > 0) {
          setSelectedTicket(json.tickets[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    if (json.ticket) {
      setSelectedTicket(json.ticket);
    }
    setShowModal(false);
    setForm(initialForm);
    loadTickets();
  };

  return (
    <>
      <PageHeader
        title="Agency Support & Helpdesk"
        subtitle="Dedicated SLA assistance, custom integration requests, and platform guides"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Open New Ticket
          </Button>
        }
      />

      {/* FAQs and Knowledge Base Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🌐</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>Custom Domain DNS Guide</h4>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Map properties.youragency.com directly to public showcases by pointing a CNAME record to proxy.agentladders.com.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>💬</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>WhatsApp Click-to-Chat</h4>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Every public property showcase includes an automated WhatsApp trigger that routes inbound buyers directly to the assigned agent.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🛡️</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>Enterprise Tenant Privacy</h4>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Owner identity, tax IDs, and confidential commission agreements are strictly ring-fenced and never exposed on public webpages.
          </p>
        </div>
      </div>

      {/* Main Support Grid: Ticket List + Message Thread */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Tickets List */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
            Active Tickets ({tickets.length})
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No support tickets open.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tickets.map(t => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{t.ticketNumber}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                      {t.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px' }}>
                      <span>📂 {t.category}</span>
                      <span>⚡ {t.priority} Priority</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          minHeight: '400px'
        }}>
          {selectedTicket ? (
            <div>
              {/* Ticket Header */}
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{selectedTicket.ticketNumber}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>
                      {selectedTicket.subject}
                    </h3>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px' }}>
                  <span>Created by: <strong>{selectedTicket.createdByName}</strong></span>
                  <span>Category: <strong>{selectedTicket.category}</strong></span>
                  <span>Priority: <strong>{selectedTicket.priority}</strong></span>
                </div>
              </div>

              {/* Messages Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {selectedTicket.messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: msg.isStaff ? '#f0fdf4' : '#f8fafc',
                      border: msg.isStaff ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      maxWidth: '90%',
                      alignSelf: msg.isStaff ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '16px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: msg.isStaff ? '#166534' : '#0f172a' }}>
                        {msg.isStaff ? '🛡️ ' + msg.sender : '👤 ' + msg.sender}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                Replies from AgentLadders tier-1 engineering are guaranteed within 4 hours during business hours.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              Select a ticket to view conversation history.
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Submit Helpdesk Request</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need assistance setting up portal webhook"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    <option>CRM Feature</option>
                    <option>Integrations</option>
                    <option>Billing</option>
                    <option>Bug Report</option>
                    <option>General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what you are trying to configure or what issue occurred..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Submit Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
