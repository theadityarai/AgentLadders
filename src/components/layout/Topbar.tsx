'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
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
    return () => window.removeEventListener('profile-updated', loadProfile);
  }, [session?.user]);

  useEffect(() => {
    const handleOpenDrawer = () => setMobileMenuOpen(true);
    window.addEventListener('open-mobile-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-mobile-drawer', handleOpenDrawer);
  }, []);

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
      <div ref={searchRef} className="hide-on-mobile" style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
          {isSearching ? <SpinnerIcon size={16} color="#059669" /> : <SearchIcon size={16} color="#94a3b8" />}
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
      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex' }}>
          <div onClick={e => e.stopPropagation()} className="animate-slide-left" style={{ width: '100%', maxWidth: '320px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 16px', overflowY: 'auto', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'var(--primary, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <BuildingIcon size={18} color="#fff" />
                </div>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>AgentLadders</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Broker Cockpit</span>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6, borderRadius: 6 }}>
                <XIcon size={20} color="#64748b" />
              </button>
            </div>

            {/* Mobile Drawer Quick Search */}
            <div style={{ position: 'relative', marginTop: 14, marginBottom: 6 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                <SearchIcon size={15} color="#94a3b8" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads, deals, properties..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  backgroundColor: '#f8fafc',
                  outline: 'none'
                }}
              />
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 0' }}>
              {/* Section 1: Core Dealflow */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
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
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8, color: '#0f172a', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ItemIcon size={17} color="#059669" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Section 2: Operations & Finance */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 4px', borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
                Operations & Financials
              </div>
              {[
                { href: '/dashboard/documents', label: 'Documents & Vault', icon: FileTextIcon },
                { href: '/dashboard/invoices', label: 'Invoices & Billing', icon: ReceiptIcon },
                { href: '/dashboard/tasks', label: 'Tasks & Follow-ups', icon: CheckSquareIcon },
                { href: '/dashboard/calendar', label: 'Calendar Schedule', icon: MapPinIcon },
                { href: '/dashboard/owners', label: 'Property Owners', icon: UsersIcon },
                { href: '/dashboard/companies', label: 'Corporate Clients', icon: BuildingIcon },
                { href: '/dashboard/brokerage', label: 'Brokerage Splits', icon: BriefcaseIcon },
              ].map(item => {
                const ItemIcon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8, color: '#334155', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ItemIcon size={17} color="#64748b" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Section 3: Mastery & Support */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 4px', borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
                Mastery & Support
              </div>
              {[
                { href: '/dashboard/tutorial', label: 'Playbook & Tutorial 📖', icon: CompassIcon },
                { href: '/dashboard/support', label: 'Help & Support 💬', icon: MessageCircleIcon },
                { href: '/dashboard/settings', label: 'Agency Settings ⚙️', icon: SettingsIcon },
              ].map(item => {
                const ItemIcon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 8, color: '#334155', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ItemIcon size={17} color="#059669" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {isSuperAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 10px', borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.1)', color: '#4f46e5', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', marginTop: 8 }}
                >
                  <ShieldIcon size={17} color="#4f46e5" />
                  <span>Super Admin HQ</span>
                </Link>
              )}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ width: '100%', padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <LogOutIcon size={16} color="#991b1b" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
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

        {/* Playbook & Tutorial Topbar Control (Desktop & Tablet) */}
        <div className="hide-on-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ecfdf5',
          borderRadius: '20px',
          border: '1px solid #a7f3d0',
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
              color: '#065f46',
              fontSize: '12.5px',
              fontWeight: 700,
              transition: 'background-color 0.15s ease'
            }}
            title="Open Complete Playbook & Tutorial"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <CompassIcon size={14} color="#059669" />
            <span className="hide-on-tablet">Playbook & Tutorial</span>
          </Link>

          <div style={{ width: 1, height: 16, backgroundColor: '#a7f3d0' }} />

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
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            title="Open Interactive Screen Tour for this page"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <SparklesIcon size={13} color="#059669" />
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
            <div style={{
              position: 'absolute',
              top: '46px',
              right: '-10px',
              width: '360px',
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 16px 36px -4px rgba(15,23,42,0.16)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              {/* Header */}
              <div style={{
                padding: '13px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
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
                    <div style={{ display: 'inline-flex', padding: 10, borderRadius: '50%', backgroundColor: '#f1f5f9', marginBottom: 8, color: '#059669' }}>
                      <CheckIcon size={22} color="#059669" />
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>All caught up!</div>
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>No unread updates.</div>
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
                      <div style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }}>
                        {n.type === 'system' ? <SettingsIcon size={16} /> : n.type === 'warning' ? <AlertCircleIcon size={16} color="#d97706" /> : n.type === 'info' ? <InfoIcon size={16} color="#2563eb" /> : <BellIcon size={16} />}
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
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <XIcon size={13} />
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
                  style={{ fontSize: '11.5px', color: '#475569', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <SettingsIcon size={13} color="#475569" />
                  Preferences
                </Link>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Live Sync
                </span>
              </div>
            </div>
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
                  onClick={() => signOut({ callbackUrl: '/login' })}
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
