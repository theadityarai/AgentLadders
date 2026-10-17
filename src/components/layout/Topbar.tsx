'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  MenuIcon,
  XIcon,
  SearchIcon,
  SpinnerIcon,
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  FileTextIcon,
  ReceiptIcon,
  CheckSquareIcon,
  BarChartIcon,
  BellIcon,
  SettingsIcon,
  MessageCircleIcon,
  ShieldIcon,
  LogOutIcon,
  InfoIcon,
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  CompassIcon,
  SparklesIcon
} from '@/components/icons/NavIcons';

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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

    // Register or heartbeat active device session for this device
    if (typeof window !== 'undefined' && session?.user) {
      try {
        let devId = localStorage.getItem('agentladders_device_id');
        if (!devId) {
          const randHex = typeof window.crypto !== 'undefined' && window.crypto.getRandomValues
            ? Array.from(window.crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('')
            : Date.now().toString(36);
          devId = 'sess_' + randHex + '_' + Date.now().toString(36);
          localStorage.setItem('agentladders_device_id', devId);
        }
        const screenRes = `${window.screen.width} × ${window.screen.height}`;
        const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';
        fetch(`/api/auth/sessions?deviceId=${encodeURIComponent(devId)}&screen=${encodeURIComponent(screenRes)}&timezone=${encodeURIComponent(tz)}`).catch(() => {});
      } catch {}
    }

    return () => window.removeEventListener('profile-updated', loadProfile);
  }, [session?.user]);

  useEffect(() => {
    const handleOpenDrawer = () => setMobileMenuOpen(true);
    window.addEventListener('open-mobile-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-mobile-drawer', handleOpenDrawer);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-drawer-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-drawer-open');
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('close-mobile-drawer'));
    }
    return () => {
      document.body.classList.remove('mobile-drawer-open');
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      const devId = typeof window !== 'undefined' ? localStorage.getItem('agentladders_device_id') : null;
      if (devId) {
        await fetch('/api/auth/sessions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: devId, selfLogout: true })
        }).catch(() => {});
        localStorage.removeItem('agentladders_device_id');
      }
    } catch {}
    await signOut({ callbackUrl: '/login' });
  };

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
    <header style={{
      height: '66px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }} className="mobile-px-4">
      
      {/* Left Section: Mobile Hamburger + Brand Mark + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Mobile & Tablet Hamburger */}
        <button 
          className="show-on-tablet" 
          onClick={() => setMobileMenuOpen(true)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#0f172a',
            padding: '6px',
            cursor: 'pointer',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Open navigation menu"
        >
          <MenuIcon size={22} color="#0f172a" />
        </button>

        {/* Mobile & Tablet Brand Mark */}
        <div className="show-flex-on-tablet" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: 'var(--primary-gradient, linear-gradient(135deg, #059669 0%, #10b981 100%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
          }}>
            <BuildingIcon size={16} color="#ffffff" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1 }}>
            AgentLadders
          </span>
        </div>

        <div className="hide-on-tablet" style={{ display: 'flex', alignItems: 'center' }}>
          <Breadcrumbs compact />
        </div>
      </div>

      {/* Search Bar - Interactive Live Command Bar */}
      <div ref={searchRef} className="hide-on-tablet" style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
          {isSearching ? <SpinnerIcon size={16} color="var(--primary, #059669)" /> : <SearchIcon size={16} color="#94a3b8" />}
        </span>
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchResults) setSearchOpen(true); }}
          placeholder="Search inquiries, properties, deals... (Esc)" 
          style={{
            width: '100%',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '9px 16px 9px 40px',
            fontSize: '13.5px',
            color: '#0f172a',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocusCapture={e => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = 'var(--primary, #059669)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--primary-rgb, 5, 150, 105), 0.12)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 16px', letterSpacing: '0.04em' }}>Inquiries</div>
                    {searchResults.leads.map(l => (
                      <Link 
                        key={l.id} 
                        href={`/dashboard/leads`} 
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', textDecoration: 'none', color: '#0f172a', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <UsersIcon size={15} color="#64748b" />
                          <span style={{ fontWeight: 600 }}>{l.name}</span>
                          <span style={{ color: '#64748b', fontSize: 12 }}>({l.phone})</span>
                        </div>
                        <span style={{ fontSize: 11, backgroundColor: 'var(--primary-light, #d1fae5)', color: 'var(--primary-text, #065f46)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{l.status}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Properties */}
                {searchResults?.properties && searchResults.properties.length > 0 && (
                  <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 16px', letterSpacing: '0.04em' }}>Properties</div>
                    {searchResults.properties.map(p => (
                      <Link 
                        key={p.id} 
                        href={`/dashboard/properties`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', textDecoration: 'none', color: '#0f172a', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BuildingIcon size={15} color="#64748b" />
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 16px', letterSpacing: '0.04em' }}>Deals</div>
                    {searchResults.deals.map(d => (
                      <Link 
                        key={d.id} 
                        href={`/dashboard/deals`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', textDecoration: 'none', color: '#0f172a', fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BriefcaseIcon size={15} color="#64748b" />
                          <span style={{ fontWeight: 600 }}>{d.title}</span>
                        </div>
                        <span style={{ fontSize: 11, backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{d.stage}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Full-Screen/Top Search Overlay */}
      {mobileSearchOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '66px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          zIndex: 60,
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(false);
              setSearchOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            aria-label="Close search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ flex: 1, position: 'relative' }}>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length >= 2) setSearchOpen(true);
              }}
              placeholder="Search inquiries, properties, deals..."
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '9px 34px 9px 14px',
                fontSize: '14px',
                outline: 'none',
                color: '#0f172a'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                  setSearchOpen(false);
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 2,
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <XIcon size={16} color="#64748b" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex' }}>
          <div onClick={e => e.stopPropagation()} className="animate-slide-left" style={{ width: '100%', maxWidth: 'min(320px, 86vw)', backgroundColor: '#fff', height: '100dvh', maxHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '18px 16px 0', overflowY: 'auto', WebkitOverflowScrolling: 'touch', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'var(--primary, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>
                  <BuildingIcon size={18} color="#fff" />
                </div>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.2, letterSpacing: '-0.3px' }}>AgentLadders</span>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>India Real Estate OS</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setMobileMenuOpen(false)} 
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close menu"
              >
                <XIcon size={18} color="#64748b" />
              </button>
            </div>

            {/* Profile Card in Drawer */}
            <div style={{
              marginTop: 12,
              marginBottom: 8,
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'var(--primary, #059669)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0
              }}>
                {(session?.user?.name || 'A').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session?.user?.name || 'Agency Member'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(session?.user as any)?.agencyName || (session?.user as any)?.role || 'Apex Real Estate'}
                </div>
              </div>
            </div>

            {/* Navigation Sections */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0', flex: 1 }}>
              {/* Section 1: Core Dealflow */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '10px 8px 4px' }}>
                Core Dealflow
              </div>
              {[
                { href: '/dashboard', label: 'Today Workspace', icon: HomeIcon },
                { href: '/dashboard/leads', label: 'Inquiries (Leads)', icon: UsersIcon },
                { href: '/dashboard/properties', label: 'Properties & Inventory', icon: BuildingIcon },
                { href: '/dashboard/site-visits', label: 'Site Visits', icon: MapPinIcon },
                { href: '/dashboard/deals', label: 'Deals Pipeline', icon: BriefcaseIcon },
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 10px',
                      borderRadius: 8,
                      color: isActive ? 'var(--primary-text, #065f46)' : '#1e293b',
                      backgroundColor: isActive ? 'var(--primary-light, #ecfdf5)' : 'transparent',
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <ItemIcon size={17} color={isActive ? 'var(--primary, #059669)' : '#64748b'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Section 2: Operations */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 4px', borderTop: '1px solid #f1f5f9', marginTop: 6 }}>
                Operations & Financials
              </div>
              {[
                { href: '/dashboard/documents', label: 'Documents & Vault', icon: FileTextIcon },
                { href: '/dashboard/invoices', label: 'Invoices & Billing', icon: ReceiptIcon },
                { href: '/dashboard/tasks', label: 'Tasks & Follow-ups', icon: CheckSquareIcon },
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 10px',
                      borderRadius: 8,
                      color: isActive ? 'var(--primary-text, #065f46)' : '#334155',
                      backgroundColor: isActive ? 'var(--primary-light, #ecfdf5)' : 'transparent',
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <ItemIcon size={17} color={isActive ? 'var(--primary, #059669)' : '#64748b'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Section 3: Agency & Support */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 4px', borderTop: '1px solid #f1f5f9', marginTop: 6 }}>
                Agency & Support
              </div>
              {[
                { href: '/dashboard/settings', label: 'Agency Settings', icon: SettingsIcon },
                { href: '/dashboard/tutorial', label: 'Playbook & Tutorial', icon: CompassIcon },
                { href: '/dashboard/support', label: 'Help & Support', icon: MessageCircleIcon },
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 10px',
                      borderRadius: 8,
                      color: isActive ? 'var(--primary-text, #065f46)' : '#334155',
                      backgroundColor: isActive ? 'var(--primary-light, #ecfdf5)' : 'transparent',
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <ItemIcon size={17} color={isActive ? 'var(--primary, #059669)' : '#64748b'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {isSuperAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '10px 10px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    color: '#4f46e5',
                    fontSize: 13.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginTop: 8
                  }}
                >
                  <ShieldIcon size={17} color="#4f46e5" />
                  <span>Super Admin HQ</span>
                </Link>
              )}
            </nav>

            <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#ffffff', zIndex: 20, marginTop: 'auto', paddingTop: 14, paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
              <button 
                type="button"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 10px rgba(220, 38, 38, 0.25)',
                  transition: 'background 0.15s ease'
                }}
              >
                <LogOutIcon size={16} color="#ffffff" />
                Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )} 

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Mobile Search Button Trigger */}
        <button
          type="button"
          className="show-on-tablet"
          onClick={() => setMobileSearchOpen(true)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: '7px',
            cursor: 'pointer',
            borderRadius: '50%',
            color: '#334155',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Search"
          title="Search CRM"
        >
          <SearchIcon size={20} color="#334155" />
        </button>

        {isSuperAdmin && (
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#0f172a',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <ShieldIcon size={14} color="#a5b4fc" />
              <span>HQ</span>
            </div>
          </Link>
        )}

        {/* Playbook & Tutorial Topbar Control (Desktop & Tablet) - Theme Dynamic */}
        <div className="hide-on-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--primary-light, #ecfdf5)',
          borderRadius: '20px',
          border: '1px solid rgba(var(--primary-rgb, 5, 150, 105), 0.25)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <Link
            href="/dashboard/tutorial"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              color: 'var(--primary-text, var(--primary, #065f46))',
              fontSize: '12.5px',
              fontWeight: 700,
              transition: 'background-color 0.15s ease'
            }}
            title="Open Complete Playbook & Tutorial"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb, 5, 150, 105), 0.14)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <CompassIcon size={14} color="var(--primary, #059669)" />
            <span className="hide-on-tablet">Playbook & Tutorial</span>
          </Link>

          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(var(--primary-rgb, 5, 150, 105), 0.2)' }} />

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-on-screen-tutorial'))}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              color: 'var(--primary-text, var(--primary, #065f46))',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            title="Open Interactive Screen Tour for this page"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb, 5, 150, 105), 0.14)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <SparklesIcon size={13} color="var(--primary, #059669)" />
            <span className="hide-on-tablet">Tour</span>
          </button>
        </div>

        {/* Notifications Popover */}
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
            <BellIcon size={19} color={showNotifs ? '#0f172a' : '#475569'} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: '15px',
                height: '15px',
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '9.5px',
                fontWeight: 700,
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
            <>
              {/* Mobile Backdrop for clean tap-outside */}
              <div
                className="notifications-popover-backdrop"
                onClick={() => setShowNotifs(false)}
              />

              <div className="notifications-popover-dropdown">
                {/* Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellIcon size={16} color="#0f172a" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        {notifications.filter(n => !n.read).length} new
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      >
                        Mark all read
                      </button>
                    )}
                    {/* Close button for mobile */}
                    <button
                      type="button"
                      onClick={() => setShowNotifs(false)}
                      className="show-flex-on-mobile"
                      title="Close"
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#64748b',
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="notifications-popover-list">
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', backgroundColor: 'var(--primary-light, #ecfdf5)', marginBottom: 10, color: 'var(--primary, #059669)' }}>
                        <CheckIcon size={24} color="var(--primary, #059669)" />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>All caught up!</div>
                      <div style={{ fontSize: '12px', marginTop: '3px' }}>No unread updates right now.</div>
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
                        {/* Type Icon Badge */}
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          backgroundColor: n.type === 'warning' ? '#fef3c7' : n.type === 'system' ? '#e0e7ff' : n.type === 'info' ? '#dbeafe' : '#ecfdf5',
                          color: n.type === 'warning' ? '#d97706' : n.type === 'system' ? '#4f46e5' : n.type === 'info' ? '#2563eb' : '#059669',
                          border: `1px solid ${n.type === 'warning' ? '#fde68a' : n.type === 'system' ? '#c7d2fe' : n.type === 'info' ? '#bfdbfe' : '#a7f3d0'}`
                        }}>
                          {n.type === 'system' ? <SettingsIcon size={15} /> : n.type === 'warning' ? <AlertCircleIcon size={15} color="#d97706" /> : n.type === 'info' ? <InfoIcon size={15} color="#2563eb" /> : <BellIcon size={15} />}
                        </div>

                        {/* Title and Message */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: n.read ? 600 : 700, color: '#0f172a', lineHeight: 1.3 }}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0 }} />
                            )}
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>
                            {n.message}
                          </p>
                          <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </span>
                        </div>

                        {/* Dismiss button */}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch(`/api/notifications?id=${n.id}`, { method: 'DELETE' });
                            setNotifications(prev => prev.filter(item => item.id !== n.id));
                          }}
                          title="Dismiss"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <XIcon size={14} />
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
                    style={{ fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <SettingsIcon size={13} color="#64748b" />
                    <span>Preferences</span>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span>Live Sync</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0' }} />

        {/* Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', padding: '4px', borderRadius: 8 }}
          >
            <div className="hide-on-tablet" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {session?.user?.name || 'Agent'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {isSuperAdmin ? 'Super Admin' : 'Agent'}
              </span>
            </div>
            <div style={{
              width: '34px',
              height: '34px',
              backgroundColor: 'var(--primary-light, #d1fae5)',
              color: 'var(--primary-text, #065f46)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13.5px',
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
            <ChevronDownIcon size={14} color="#64748b" />
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '210px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              zIndex: 50
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.user?.name}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.user?.email}
                </div>
              </div>
              <div style={{ padding: '6px' }}>
                <Link href="/dashboard/settings" style={{ textDecoration: 'none' }} onClick={() => setShowDropdown(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <SettingsIcon size={15} color="#64748b" />
                    <span>Settings</span>
                  </div>
                </Link>
                <Link href="/dashboard/support" style={{ textDecoration: 'none' }} onClick={() => setShowDropdown(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', fontSize: '13px', color: '#334155', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <MessageCircleIcon size={15} color="#64748b" />
                    <span>Help & Support</span>
                  </div>
                </Link>
                <div 
                  onClick={handleSignOut}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', fontSize: '13px', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }} 
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')} 
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOutIcon size={15} color="#ef4444" />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
    </>
  );
}
