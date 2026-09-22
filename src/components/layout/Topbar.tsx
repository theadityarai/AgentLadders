'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '../ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface SearchResult {
  title: string;
  subtitle: string;
  category: string;
  link: string;
}

export function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    if (session) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter((n: NotificationItem) => !n.read).length);
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [session]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick live search across leads, clients, properties
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Parallel fetch leads, clients, properties for live search
    Promise.all([
      fetch('/api/leads').then(r => r.json()).catch(() => ({ leads: [] })),
      fetch('/api/clients').then(r => r.json()).catch(() => ({ clients: [] })),
      fetch('/api/properties').then(r => r.json()).catch(() => ({ properties: [] }))
    ]).then(([leadsData, clientsData, propsData]) => {
      if (leadsData.leads) {
        leadsData.leads.forEach((l: any) => {
          if (l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q)) {
            results.push({ title: l.name, subtitle: `${l.status} • ${l.email || l.phone}`, category: 'Lead', link: '/dashboard/leads' });
          }
        });
      }
      if (clientsData.clients) {
        clientsData.clients.forEach((c: any) => {
          if (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) {
            results.push({ title: c.name, subtitle: `${c.type} Client • ${c.email || c.phone}`, category: 'Client', link: '/dashboard/clients' });
          }
        });
      }
      if (propsData.properties) {
        propsData.properties.forEach((p: any) => {
          if (p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)) {
            results.push({ title: p.title, subtitle: `${p.type} • $${p.price?.toLocaleString()} • ${p.location}`, category: 'Property', link: '/dashboard/properties' });
          }
        });
      }
      setSearchResults(results.slice(0, 6));
      setShowSearchDropdown(true);
    });
  }, [searchQuery]);

  const markAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true })
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markSingleAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <header style={{
      height: 'var(--topbar-height)',
      backgroundColor: 'var(--surface-color)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Global Interactive Search */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div ref={searchRef} style={{ position: 'relative', width: '320px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '9px', color: 'var(--text-muted)' }}>🔍</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
            placeholder="Search leads, clients, properties..." 
            style={{ 
              width: '100%', 
              padding: '8px 12px 8px 36px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--background-color)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }} 
          />

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '42px',
              left: 0,
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                Search Results
              </div>
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                    router.push(res.link);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid #f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{res.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{res.subtitle}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    {res.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Interactive Notifications Bell & Menu */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '10px',
                padding: '2px 6px',
                border: '2px solid white'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '-10px',
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <div style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Agency Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markSingleAsRead(notif.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: notif.read ? '#ffffff' : '#f0fdf4',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? '#ffffff' : '#f0fdf4'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{notif.title || 'Notification'}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        {notif.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Super Admin HQ shortcut */}
        {((session?.user as any)?.role === 'SUPER_ADMIN' || session?.user?.email === 'aditya@agentladders.com' || session?.user?.email === 'admin@agentladders.com') && (
          <Link href="/admin" style={{ textDecoration: 'none' }} title="Platform Super Admin Portal">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15,23,42,0.2)'
            }}>
              <span>🛡️</span>
              <span>Super Admin</span>
            </div>
          </Link>
        )}

        {/* Settings Icon Link */}
        <Link href="/dashboard/settings" style={{ textDecoration: 'none', color: 'inherit' }} title="Agency Settings">
          <div style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', padding: '6px' }}>
            ⚙️
          </div>
        </Link>

        {/* User Identity & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {session?.user?.name || 'Adi'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {session?.user?.email || 'adityarai366@gmail.com'}
            </p>
          </div>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })} style={{ marginLeft: '4px', fontSize: '13px' }}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
