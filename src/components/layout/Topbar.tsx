'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function Topbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userAvatar, setUserAvatar] = useState<string>((session?.user as any)?.image || '');

  useEffect(() => {
    if ((session?.user as any)?.image) {
      setUserAvatar((session?.user as any).image);
    }
    const loadProfile = () => {
      fetch('/api/settings')
        .then(r => r.json())
        .then(d => {
          if (d.user && (d.user.avatar || d.user.image)) {
            setUserAvatar(d.user.avatar || d.user.image);
          }
        })
        .catch(() => {});
    };
    loadProfile();
    window.addEventListener('profile-updated', loadProfile);
    return () => window.removeEventListener('profile-updated', loadProfile);
  }, [session?.user]);

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => {
        if (d.notifications) setNotifications(d.notifications);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    leads: { id: string; name: string; phone: string; status: string }[];
    properties: { id: string; title: string; price?: number; locality?: string }[];
    deals: { id: string; title: string; amount?: number; stage: string }[];
  } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const cachedDataRef = useRef<{ leads: any[]; properties: any[]; deals: any[]; timestamp: number } | null>(null);

  // Click outside listener for search, profile & notification dropdowns + Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setSearchOpen(false);
        setShowNotifs(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Optimized live search with in-memory TTL cache & AbortController
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }

    const abortCtrl = new AbortController();

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const now = Date.now();
        let leads: any[] = [];
        let properties: any[] = [];
        let deals: any[] = [];

        if (cachedDataRef.current && (now - cachedDataRef.current.timestamp < 30000)) {
          leads = cachedDataRef.current.leads;
          properties = cachedDataRef.current.properties;
          deals = cachedDataRef.current.deals;
        } else {
          const [leadsRes, propsRes, dealsRes] = await Promise.all([
            fetch('/api/leads', { signal: abortCtrl.signal }).then(r => r.json()).catch(() => ({})),
            fetch('/api/properties', { signal: abortCtrl.signal }).then(r => r.json()).catch(() => ({})),
            fetch('/api/deals', { signal: abortCtrl.signal }).then(r => r.json()).catch(() => ({}))
          ]);
          leads = leadsRes.leads || [];
          properties = propsRes.properties || [];
          deals = dealsRes.deals || [];
          cachedDataRef.current = { leads, properties, deals, timestamp: now };
        }

        const q = searchQuery.toLowerCase();
        const filteredLeads = leads.filter((l: any) => 
          l.name?.toLowerCase().includes(q) || l.phone?.includes(q)
        ).slice(0, 3);
        const filteredProps = properties.filter((p: any) => 
          p.title?.toLowerCase().includes(q) || p.locality?.toLowerCase().includes(q)
        ).slice(0, 3);
        const filteredDeals = deals.filter((d: any) => 
          d.title?.toLowerCase().includes(q) || d.clientName?.toLowerCase().includes(q)
        ).slice(0, 3);

        setSearchResults({ leads: filteredLeads, properties: filteredProps, deals: filteredDeals });
        setSearchOpen(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search error', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      abortCtrl.abort();
    };
  }, [searchQuery]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  const totalResults = (searchResults?.leads.length || 0) + (searchResults?.properties.length || 0) + (searchResults?.deals.length || 0);

  return (
    <>
    <div style={{
      height: '70px',
      backgroundColor: '#fff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }} className="mobile-px-4">
      
      {/* Left Section: Mobile Hamburger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile Hamburger */}
        <button 
          className="show-on-mobile" 
          onClick={() => setMobileMenuOpen(true)}
          style={{ display: 'none', background: 'none', border: 'none', fontSize: 24, padding: '8px 0', cursor: 'pointer' }}
        >
          ☰
        </button>

        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center' }}>
          <Breadcrumbs compact />
        </div>
      </div>

      {/* Search Bar - Interactive Live Command Bar */}
      <div ref={searchRef} className="hide-on-mobile" style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>
          {isSearching ? '⏳' : '🔍'}
        </span>
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchResults) setSearchOpen(true); }}
          placeholder="Search leads, properties, deals... (Press Esc to close)" 
          style={{
            width: '100%',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '10px 16px 10px 40px',
            fontSize: '13.5px',
            color: '#0f172a',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
        />

        {/* Search Results Dropdown */}
        {searchOpen && (
          <div style={{
            position: 'absolute',
            top: '46px',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease'
          }}>
            {totalResults === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No records matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Leads */}
                {searchResults?.leads && searchResults.leads.length > 0 && (
                  <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 16px' }}>Inquiries</div>
                    {searchResults.leads.map(l => (
                      <Link 
                        key={l.id} 
                        href={`/dashboard/leads`} 
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', textDecoration: 'none', color: '#0f172a', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>👤</span>
                          <span style={{ fontWeight: 600 }}>{l.name}</span>
                          <span style={{ color: '#64748b', fontSize: 12 }}>({l.phone})</span>
                        </div>
                        <span style={{ fontSize: 11, backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', padding: '2px 8px', borderRadius: 10 }}>{l.status}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Properties */}
                {searchResults?.properties && searchResults.properties.length > 0 && (
                  <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 16px' }}>Properties</div>
                    {searchResults.properties.map(p => (
                      <Link 
                        key={p.id} 
                        href={`/dashboard/properties`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', textDecoration: 'none', color: '#0f172a', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>🏠</span>
                          <span style={{ fontWeight: 600 }}>{p.title}</span>
                          {p.locality && <span style={{ color: '#64748b', fontSize: 12 }}>• {p.locality}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Deals */}
                {searchResults?.deals && searchResults.deals.length > 0 && (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 16px' }}>Deals</div>
                    {searchResults.deals.map(d => (
                      <Link 
                        key={d.id} 
                        href={`/dashboard/deals`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', textDecoration: 'none', color: '#0f172a', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>💼</span>
                          <span style={{ fontWeight: 600 }}>{d.title}</span>
                        </div>
                        <span style={{ fontSize: 11, backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 10 }}>{d.stage}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '360px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏡</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>AgentLadders</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0' }}>
              {[
                { href: '/dashboard', label: 'Today Cockpit', icon: '◈' },
                { href: '/dashboard/leads', label: 'Inquiries', icon: '👥' },
                { href: '/dashboard/properties', label: 'Properties', icon: '🏠' },
                { href: '/dashboard/site-visits', label: 'Site Visits', icon: '📍' },
                { href: '/dashboard/deals', label: 'Deals Pipeline', icon: '💼' },
                { href: '/dashboard/insights', label: 'Performance Insights', icon: '📈' },
                { href: '/dashboard/documents', label: 'Documents', icon: '📁' },
                { href: '/dashboard/invoices', label: 'Invoices', icon: '🧾' },
                { href: '/dashboard/tasks', label: 'Tasks', icon: '✅' },
                { href: '/dashboard/reports', label: 'Reports', icon: '📊' },
                { href: '/dashboard/support', label: 'Help & Support', icon: '💬' },
                { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
              ].map(item => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)} 
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, color: '#0f172a', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {isSuperAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.1)', color: '#4f46e5', fontSize: 15, fontWeight: 700, textDecoration: 'none', marginTop: 12 }}
                >
                  <span>🛡️</span>
                  <span>Super Admin HQ</span>
                </Link>
              )}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )} 


      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {isSuperAdmin && (
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#0f172a',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15,23,42,0.15)'
            }}>
              <span>🛡️</span> HQ
            </div>
          </Link>
        )}

        {/* Notifications Popover Center */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="View notifications"
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: showNotifs ? '#0f172a' : '#64748b',
              fontSize: '18px',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: showNotifs ? '#f1f5f9' : 'transparent',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { if (!showNotifs) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={e => { if (!showNotifs) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            🔔
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: 3,
                right: 3,
                minWidth: '16px',
                height: '16px',
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                border: '2px solid #fff',
                lineHeight: 1
              }}>
                {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: '-10px',
              width: '360px',
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: '#fff',
              borderRadius: '14px',
              boxShadow: '0 20px 40px -8px rgba(15,23,42,0.18)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'fadeIn 0.15s ease'
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                      {notifications.filter(n => !n.read).length} new
                    </span>
                  )}
                </div>
                {notifications.filter(n => !n.read).length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch('/api/notifications', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ markAllRead: true })
                      });
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>You&apos;re all caught up!</div>
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>No pending notifications.</div>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        if (!n.read) {
                          await fetch('/api/notifications', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: n.id })
                          });
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: n.read ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f8fafc')}
                    >
                      <div style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>
                        {n.type === 'system' ? '⚙️' : n.type === 'warning' ? '⚠️' : n.type === 'info' ? 'ℹ️' : '🔔'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', marginTop: '4px' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await fetch(`/api/notifications?id=${n.id}`, { method: 'DELETE' });
                          setNotifications(prev => prev.filter(item => item.id !== n.id));
                        }}
                        title="Dismiss"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          padding: '0 2px',
                          fontSize: '12px',
                          lineHeight: 1
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 16px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowNotifs(false)}
                  style={{ fontSize: '11.5px', color: '#475569', textDecoration: 'none', fontWeight: 600 }}
                >
                  Configure Preferences ⚙️
                </Link>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  AgentLadders Live Sync
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

        {/* Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div className="hide-on-mobile" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {session?.user?.name || 'Agent'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {isSuperAdmin ? 'Super Admin' : 'Agent'}
              </span>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: 700,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {userAvatar ? (
                <img src={userAvatar} alt={session?.user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(session?.user?.name)
              )}
            </div>
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '200px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              zIndex: 50
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.user?.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.user?.email}
                </div>
              </div>
              <div style={{ padding: '8px' }}>
                <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px 12px', fontSize: '13px', color: '#475569', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    ⚙️ Settings
                  </div>
                </Link>
                <Link href="/dashboard/support" style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px 12px', fontSize: '13px', color: '#475569', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    💬 Help & Support
                  </div>
                </Link>
                <div 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  style={{ padding: '10px 12px', fontSize: '13px', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }} 
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')} 
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  🚪 Logout
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
    </>
  );
}
