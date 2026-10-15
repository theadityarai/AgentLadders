'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { SearchBar } from '@/components/ui/SearchBar';
import { 
  FONT_OPTIONS, 
  COLOR_SCHEMES, 
  applyTheme, 
  getStoredTheme,
  STATUS_COLOR_PALETTES,
  getStatusColorStyle,
  getStoredStatusColors,
  saveStoredStatusColors,
  StatusColorPalette
} from '@/lib/theme';
import { 
  DEFAULT_BHK_OPTIONS, 
  DEFAULT_PROPERTY_TYPES, 
  DEFAULT_LEAD_SOURCES,
  DEFAULT_PROPERTY_SPECS,
  DEFAULT_CONSTRUCTION_STAGES,
  DEFAULT_VASTU_FACINGS,
  DEFAULT_DEAL_STAGES,
  DEFAULT_PARKING_OPTIONS,
  DEFAULT_PROPERTY_STATUSES,
  DEFAULT_LEAD_STATUSES,
  DEFAULT_SITE_VISIT_STATUSES,
  DEFAULT_TASK_STATUSES,
  DEFAULT_CLIENT_STATUSES,
  DEFAULT_INVOICE_STATUSES,
  DEFAULT_PAYMENT_STATUSES,
  DEFAULT_INVOICE_SETTINGS,
  AgencyInvoiceSettings
} from '@/lib/formatters';
import styles from './settings.module.css';

const tabs = [
  { key: 'agency', label: 'Agency Profile' },
  { key: 'appearance', label: 'Theme & Typography' },
  { key: 'invoice', label: 'Invoice Settings' },
  { key: 'users', label: 'Users & Roles' },
  { key: 'billing', label: 'Subscription & Billing' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Profile & Security' },
  { key: 'config', label: 'Configuration' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  type ConfigCategoryKey = 
    | 'propertyStatuses'
    | 'leadStatuses'
    | 'dealStages'
    | 'siteVisitStatuses'
    | 'taskStatuses'
    | 'clientStatuses'
    | 'invoiceStatuses'
    | 'paymentStatuses'
    | 'bhkOptions'
    | 'propertyTypes'
    | 'leadSources'
    | 'propertySpecs'
    | 'constructionStages'
    | 'vastuOptions'
    | 'parkingOptions';

  const isStatusCategory = (type: ConfigCategoryKey): boolean => {
    return [
      'propertyStatuses',
      'leadStatuses',
      'dealStages',
      'siteVisitStatuses',
      'taskStatuses',
      'clientStatuses',
      'invoiceStatuses',
      'paymentStatuses'
    ].includes(type);
  };

  const getCategoryLabel = (type: ConfigCategoryKey): string => {
    switch (type) {
      case 'propertyStatuses': return 'Property Status';
      case 'leadStatuses': return 'Inquiry / Lead Status';
      case 'dealStages': return 'Deal Pipeline Stage';
      case 'siteVisitStatuses': return 'Site Visit Status';
      case 'taskStatuses': return 'Task Status';
      case 'clientStatuses': return 'Client Status';
      case 'invoiceStatuses': return 'Invoice & Billing Status';
      case 'paymentStatuses': return 'Payment Clearance Status';
      case 'bhkOptions': return 'BHK Option';
      case 'propertyTypes': return 'Property Type';
      case 'leadSources': return 'Lead Source';
      case 'propertySpecs': return 'Property Spec / Furnishing';
      case 'constructionStages': return 'Construction Stage';
      case 'vastuOptions': return 'Vastu & Orientation';
      case 'parkingOptions': return 'Parking Allocation';
    }
  };

  const [agencyData, setAgencyData] = useState({ name: '', country: 'India', currency: 'INR', plan: 'Professional', timezone: 'Asia/Kolkata', whatsapp: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [configs, setConfigs] = useState({
    bhkOptions: [] as string[],
    propertyTypes: [] as string[],
    leadSources: [] as string[],
    propertySpecs: [] as string[],
    constructionStages: [] as string[],
    vastuOptions: [] as string[],
    dealStages: [] as string[],
    parkingOptions: [] as string[],
    propertyStatuses: [] as string[],
    leadStatuses: [] as string[],
    siteVisitStatuses: [] as string[],
    taskStatuses: [] as string[],
    clientStatuses: [] as string[],
    invoiceStatuses: [] as string[],
    paymentStatuses: [] as string[],
    statusColors: {} as Record<string, string>
  });
  const [selectedStatusColor, setSelectedStatusColor] = useState('emerald');
  const [quickColorPicker, setQuickColorPicker] = useState<{ status: string; type: ConfigCategoryKey } | null>(null);
  const [configSubTab, setConfigSubTab] = useState<'statuses' | 'property' | 'sourcing' | 'all'>('statuses');
  const [configSearch, setConfigSearch] = useState('');
  const [notifications, setNotifications] = useState<Record<string, {inApp: boolean; email: boolean}>>({});

  // Theme & Appearance State - Default: Roboto & Emerald Prosperity
  const [selectedFont, setSelectedFont] = useState('roboto');
  const [selectedColor, setSelectedColor] = useState('emerald');
  const [savingTheme, setSavingTheme] = useState(false);

  // Agency Logo & User Avatar State
  const [agencyLogo, setAgencyLogo] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Invoice & Tax Settings State
  const [invoiceSettings, setInvoiceSettings] = useState<AgencyInvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  const [savingInvoiceSettings, setSavingInvoiceSettings] = useState(false);

  // Current Authenticated User & 2FA State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('AGLD-7734-K821-X992');
  const [backupCodes, setBackupCodes] = useState<string[]>(['4829-1029', '7361-9921', '8302-4410', '1928-3392', '5512-8801']);

  // Custom Modal States
  const [planToUpgrade, setPlanToUpgrade] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'MANAGER' });
  const [invitedUserResult, setInvitedUserResult] = useState<{ name: string; email: string; role: string; password: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email?: string } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [configModal, setConfigModal] = useState<{
    mode: 'add' | 'edit';
    type: ConfigCategoryKey;
    label: string;
    originalValue?: string;
  } | null>(null);
  const [configInputValue, setConfigInputValue] = useState('');
  const [configItemToDelete, setConfigItemToDelete] = useState<{
    type: ConfigCategoryKey;
    label: string;
    item: string;
  } | null>(null);

  // Real Device & Session Telemetry (Item 25)
  const [deviceInfo, setDeviceInfo] = useState({
    browser: 'Modern Browser',
    os: 'Windows PC',
    screen: '1920 × 1080',
    timezone: 'Asia/Kolkata',
    language: 'en-IN',
    online: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let browser = 'Modern Browser';
      if (ua.includes('Edg/')) browser = 'Microsoft Edge';
      else if (ua.includes('Chrome/')) browser = 'Google Chrome';
      else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
      else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';

      let os = 'Computer';
      if (ua.includes('Win')) os = 'Windows PC';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android Mobile';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'Apple iOS';

      setDeviceInfo({
        browser,
        os,
        screen: `${window.screen.width} × ${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        language: navigator.language || 'en-IN',
        online: navigator.onLine
      });
    }
  }, []);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  // Multi-Device Active Sessions State (User Telemetry & Remote Revocation)
  interface ActiveSessionItem {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    browser: string;
    browserVersion?: string;
    os: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    deviceModel?: string;
    ipAddress: string;
    location: string;
    screen?: string;
    timezone?: string;
    createdAt: string;
    lastActive: string;
    current?: boolean;
  }

  const [activeSessions, setActiveSessions] = useState<ActiveSessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [showIpDetails, setShowIpDetails] = useState(true);

  const formatSessionTime = (isoString?: string) => {
    if (!isoString) return 'Active recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Active just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Active ${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Active ${new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  };

  const loadActiveSessions = async (devIdToUse?: string) => {
    setLoadingSessions(true);
    let devId = devIdToUse || currentDeviceId;
    if (!devId && typeof window !== 'undefined') {
      devId = localStorage.getItem('agentladders_device_id') || '';
      if (!devId) {
        devId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        localStorage.setItem('agentladders_device_id', devId);
      }
      setCurrentDeviceId(devId);
    }
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width} × ${window.screen.height}` : '1920 × 1080';
    const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';

    try {
      const res = await fetch(`/api/auth/sessions?deviceId=${encodeURIComponent(devId || 'sess_default')}&screen=${encodeURIComponent(screenRes)}&timezone=${encodeURIComponent(tz)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) {
          setActiveSessions(data.sessions);
        }
      }
    } catch {
      // network fallback
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
        showToast('success', data.message || 'Session revoked successfully.', 'Session Terminated');
      } else {
        showToast('error', data.error || 'Failed to revoke session.', 'Error');
      }
    } catch {
      showToast('error', 'Network error revoking session.', 'Error');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revokeAllOther', currentDeviceId })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessions(prev => prev.filter(s => s.current || s.id === currentDeviceId));
        showToast('success', data.message || 'Terminated all other active sessions.', 'Sessions Cleared');
      }
    } catch {
      showToast('error', 'Failed to terminate other sessions.', 'Error');
    }
  };

  const handleSimulateSession = async (simulatedBrowser: string) => {
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate', simulatedBrowser })
      });
      if (res.ok) {
        loadActiveSessions();
        showToast('success', `Simulated login session created for ${simulatedBrowser}.`, 'New Session Connected');
      }
    } catch {
      showToast('error', 'Failed to simulate session', 'Error');
    }
  };

  useEffect(() => {
    const stored = getStoredTheme();
    setSelectedFont(stored.fontId);
    setSelectedColor(stored.colorId);

    // Initialize device ID and load active sessions
    let devId = '';
    if (typeof window !== 'undefined') {
      devId = localStorage.getItem('agentladders_device_id') || '';
      if (!devId) {
        devId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        localStorage.setItem('agentladders_device_id', devId);
      }
      setCurrentDeviceId(devId);
    }
    loadActiveSessions(devId);

    // Auto-poll active sessions every 20 seconds so cross-browser logins appear in real-time
    const sessionPollTimer = setInterval(() => {
      loadActiveSessions();
    }, 20000);

    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.avatar || data.user.image) {
          setUserAvatar(data.user.avatar || data.user.image);
        }
        if (data.user.twoFactorSecret) setTwoFactorSecret(data.user.twoFactorSecret);
        if (data.user.twoFactorBackupCodes && data.user.twoFactorBackupCodes.length > 0) {
          setBackupCodes(data.user.twoFactorBackupCodes);
        }
      }
      if (data.agency) {
        if (data.agency.logo) {
          setAgencyLogo(data.agency.logo);
        }
        setAgencyData({ 
          name: data.agency.name, 
          country: data.agency.country, 
          currency: data.agency.currency,
          plan: data.agency.plan || 'Professional',
          timezone: data.agency.timezone || 'Asia/Kolkata',
          whatsapp: data.agency.whatsapp || data.agency.phone || data.agency.ownerPhone || ''
        });
        const loadedConfigs = {
          bhkOptions: (data.agency.bhkOptions && data.agency.bhkOptions.length > 0) ? data.agency.bhkOptions : DEFAULT_BHK_OPTIONS,
          propertyTypes: (data.agency.propertyTypes && data.agency.propertyTypes.length > 0) ? data.agency.propertyTypes : DEFAULT_PROPERTY_TYPES,
          leadSources: (data.agency.leadSources && data.agency.leadSources.length > 0) ? data.agency.leadSources : DEFAULT_LEAD_SOURCES,
          propertySpecs: (data.agency.propertySpecs && data.agency.propertySpecs.length > 0) ? data.agency.propertySpecs : DEFAULT_PROPERTY_SPECS,
          constructionStages: (data.agency.constructionStages && data.agency.constructionStages.length > 0) ? data.agency.constructionStages : DEFAULT_CONSTRUCTION_STAGES,
          vastuOptions: (data.agency.vastuOptions && data.agency.vastuOptions.length > 0) ? data.agency.vastuOptions : DEFAULT_VASTU_FACINGS,
          dealStages: (data.agency.dealStages && data.agency.dealStages.length > 0) ? data.agency.dealStages : DEFAULT_DEAL_STAGES,
          parkingOptions: (data.agency.parkingOptions && data.agency.parkingOptions.length > 0) ? data.agency.parkingOptions : DEFAULT_PARKING_OPTIONS,
          propertyStatuses: (data.agency.propertyStatuses && data.agency.propertyStatuses.length > 0) ? data.agency.propertyStatuses : DEFAULT_PROPERTY_STATUSES,
          leadStatuses: (data.agency.leadStatuses && data.agency.leadStatuses.length > 0) ? data.agency.leadStatuses : DEFAULT_LEAD_STATUSES,
          siteVisitStatuses: (data.agency.siteVisitStatuses && data.agency.siteVisitStatuses.length > 0) ? data.agency.siteVisitStatuses : DEFAULT_SITE_VISIT_STATUSES,
          taskStatuses: (data.agency.taskStatuses && data.agency.taskStatuses.length > 0) ? data.agency.taskStatuses : DEFAULT_TASK_STATUSES,
          clientStatuses: (data.agency.clientStatuses && data.agency.clientStatuses.length > 0) ? data.agency.clientStatuses : DEFAULT_CLIENT_STATUSES,
          invoiceStatuses: (data.agency.invoiceStatuses && data.agency.invoiceStatuses.length > 0) ? data.agency.invoiceStatuses : DEFAULT_INVOICE_STATUSES,
          paymentStatuses: (data.agency.paymentStatuses && data.agency.paymentStatuses.length > 0) ? data.agency.paymentStatuses : DEFAULT_PAYMENT_STATUSES,
          statusColors: data.agency.statusColors || {}
        };
        setConfigs(loadedConfigs);
        if (data.agency.statusColors) {
          saveStoredStatusColors(data.agency.statusColors);
        }
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('agentladders_agency_configs', JSON.stringify(loadedConfigs));
          } catch {}
        }
        setNotifications(data.agency.notificationPrefs || {});
        const apiFont = data.agency.fontFamily || stored.fontId || 'roboto';
        const apiColor = data.agency.colorScheme || stored.colorId || 'emerald';
        setSelectedFont(apiFont);
        setSelectedColor(apiColor);
        applyTheme(apiFont, apiColor);
        if (data.agency.invoiceSettings) {
          setInvoiceSettings(data.agency.invoiceSettings);
        } else if (data.agency.name) {
          setInvoiceSettings({
            ...DEFAULT_INVOICE_SETTINGS,
            agencyName: data.agency.name,
            accountName: `${data.agency.name} Escrow Advisory`
          });
        }
      }
      if (data.users) {
        setUsers(data.users);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInviteModal) setShowInviteModal(false);
        if (configModal) setConfigModal(null);
        if (configItemToDelete) setConfigItemToDelete(null);
        if (planToUpgrade) setPlanToUpgrade(null);
        if (showTwoFactorModal) setShowTwoFactorModal(false);
        if (showDisable2FAModal) setShowDisable2FAModal(false);
        if (showBackupCodesModal) setShowBackupCodesModal(false);
        if (invitedUserResult) setInvitedUserResult(null);
        if (userToDelete) setUserToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInviteModal, showPasswordModal, configModal, configItemToDelete, planToUpgrade, showTwoFactorModal, showDisable2FAModal, showBackupCodesModal, invitedUserResult, userToDelete]);

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId);
    applyTheme(fontId, selectedColor);
  };

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
    applyTheme(selectedFont, colorId);
  };

  const handleSaveTheme = async () => {
    setSavingTheme(true);
    applyTheme(selectedFont, selectedColor);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateBranding',
          fontFamily: selectedFont,
          colorScheme: selectedColor
        })
      });
      if (res.ok) {
        showToast('success', 'Agency font style and color scheme saved globally!', 'Theme Saved');
      } else {
        showToast('warning', 'Theme applied to this session.', 'Theme Applied');
      }
    } catch {
      showToast('info', 'Theme saved to your local browser profile.', 'Theme Updated');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleResetTheme = () => {
    setSelectedFont('roboto');
    setSelectedColor('emerald');
    applyTheme('roboto', 'emerald');
    showToast('info', 'Reset to Roboto & Emerald Prosperity default theme.', 'Default Restored');
  };

  const handleSaveInvoiceSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingInvoiceSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateInvoiceSettings',
          invoiceSettings
        })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.invoiceSettings) {
          setInvoiceSettings(result.invoiceSettings);
        }
        showToast('success', 'Invoice & Tax configuration updated successfully.', 'Invoice Settings Saved');
      } else {
        showToast('error', 'Failed to save invoice settings. Please try again.', 'Save Error');
      }
    } catch {
      showToast('error', 'Network error while saving invoice settings.', 'Network Error');
    } finally {
      setSavingInvoiceSettings(false);
    }
  };

  const handleResetInvoiceSettings = () => {
    setInvoiceSettings({
      ...DEFAULT_INVOICE_SETTINGS,
      agencyName: agencyData.name || DEFAULT_INVOICE_SETTINGS.agencyName,
      accountName: `${agencyData.name || DEFAULT_INVOICE_SETTINGS.agencyName} Escrow Advisory`
    });
    showToast('info', 'Invoice settings reset to default values. Click Save to apply.', 'Defaults Loaded');
  };

  const handleSaveAgencyLogo = async (logoVal?: string) => {
    const logo = logoVal !== undefined ? logoVal : agencyLogo;
    setSavingLogo(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateAgencyLogo', logo })
      });
      if (res.ok) {
        setAgencyLogo(logo);
        window.dispatchEvent(new Event('brand-updated'));
        showToast('success', logo ? 'Agency logo updated successfully!' : 'Agency logo removed.', 'Logo Updated');
      } else {
        showToast('error', 'Failed to update agency logo.', 'Error');
      }
    } catch {
      showToast('error', 'Error updating agency logo.', 'Error');
    } finally {
      setSavingLogo(false);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      showToast('warning', 'Please select a logo smaller than 2.5MB.', 'File Too Large');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAgencyLogo(result);
      handleSaveAgencyLogo(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUserAvatar = async (avVal?: string) => {
    const avatar = avVal !== undefined ? avVal : userAvatar;
    setSavingAvatar(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateProfilePhoto', avatar })
      });
      if (res.ok) {
        setUserAvatar(avatar);
        if (currentUser) {
          setCurrentUser({ ...currentUser, avatar, image: avatar });
        }
        window.dispatchEvent(new Event('profile-updated'));
        showToast('success', avatar ? 'Profile photo updated successfully!' : 'Profile photo removed.', 'Photo Updated');
      } else {
        showToast('error', 'Failed to update profile photo.', 'Error');
      }
    } catch {
      showToast('error', 'Error updating profile photo.', 'Error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      showToast('warning', 'Please select a photo smaller than 2.5MB.', 'File Too Large');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUserAvatar(result);
      handleSaveUserAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAgency = async () => {
    const cleanWa = (agencyData.whatsapp || '').replace(/\D/g, '');
    if (!agencyData.whatsapp || cleanWa.length < 10) {
      showToast('error', 'Please enter a valid 10-digit WhatsApp number for your agency.', 'WhatsApp Number Required');
      return;
    }
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'updateAgency', 
        agencyName: agencyData.name, 
        country: agencyData.country, 
        currency: agencyData.currency,
        timezone: agencyData.timezone,
        whatsapp: agencyData.whatsapp
      })
    });
    setSaving(false);
    showToast('success', 'Agency Profile and WhatsApp number saved successfully!', 'Profile Updated');
  };

  const handleConfirmUpgradePlan = async () => {
    if (!planToUpgrade) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updatePlan', plan: planToUpgrade })
    });
    setAgencyData(prev => ({ ...prev, plan: planToUpgrade }));
    setSaving(false);
    const upgradedTo = planToUpgrade;
    setPlanToUpgrade(null);
    showToast('success', `Agency plan updated to ${upgradedTo} tier!`, 'Plan Updated');
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) {
      showToast('error', 'Please provide both user name and email.', 'Validation Error');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'inviteUser', email: inviteForm.email, name: inviteForm.name, role: inviteForm.role.toUpperCase() })
    });
    if (res.ok) {
      const resData = await res.json();
      const generatedPass = resData.temporaryPassword || '123456789012';
      const invitedData = { name: inviteForm.name, email: inviteForm.email, role: inviteForm.role.toUpperCase(), password: generatedPass };
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', role: 'MANAGER' });
      setInvitedUserResult(invitedData);
      showToast('success', `${invitedData.name} invited! Temporary password: ${generatedPass}`, 'Invitation Created');
      // reload users
      fetch('/api/settings').then(res => res.json()).then(data => setUsers(data.users || []));
    } else {
      const err = await res.json();
      showToast('error', err.error || 'Failed to invite user', 'Error');
    }
    setSaving(false);
  };

  const handleConfirmRemoveUser = async () => {
    if (!userToDelete) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'removeUser', userId: userToDelete.id, email: userToDelete.email })
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id && (!userToDelete.email || u.email?.toLowerCase() !== userToDelete.email.toLowerCase())));
        showToast('success', `Removed ${userToDelete.name} from team.`, 'User Removed');
      } else {
        const err = await res.json().catch(() => null);
        showToast('error', err?.error || 'Failed to remove user', 'Error');
      }
    } catch {
      showToast('error', 'Network error while removing user', 'Error');
    } finally {
      setUserToDelete(null);
      setSaving(false);
    }
  };

  const handleUpdateUserRole = async (targetUser: { id: string; email?: string; name?: string }, newRole: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUserRole', userId: targetUser.id, email: targetUser.email, role: newRole })
      });
      if (res.ok) {
        const resData = await res.json().catch(() => null);
        if (resData?.users) {
          setUsers(resData.users);
        } else {
          setUsers(prev => prev.map(u => (u.id === targetUser.id || (targetUser.email && u.email?.toLowerCase() === targetUser.email.toLowerCase())) ? { ...u, role: newRole } : u));
        }
        showToast('success', `${targetUser.name || 'User'} role updated to ${newRole}.`, 'Role Updated');
      } else {
        const err = await res.json().catch(() => null);
        showToast('error', err?.error || 'Failed to update user role.', 'Error');
      }
    } catch {
      showToast('error', 'Network error while updating user role.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Site Visit Confirmed 📅',
          message: 'Client Priya Mehta confirmed 3BHK visit at Lodha Park for tomorrow 11:30 AM.',
          type: 'info'
        })
      });
      if (res.ok) {
        showToast('success', 'Test notification dispatched! Check the 🔔 icon in your top navigation bar.', 'Notification Sent');
      }
    } catch {
      showToast('error', 'Failed to send test notification', 'Error');
    }
  };

  const handleOpenEnable2FA = async () => {
    setShowTwoFactorModal(true);
    setTwoFactorCode('');
    try {
      await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: currentUser?.email })
      });
      showToast('info', `A 6-digit OTP code has been dispatched to ${currentUser?.email || 'your Gmail'}.`, 'OTP Dispatched');
    } catch {}
  };

  const handleResendSettingsOtp = async () => {
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: currentUser?.email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('success', `New 6-digit OTP code dispatched to ${currentUser?.email || 'your Gmail'}.`, 'OTP Resent');
      } else {
        showToast('error', data.error || 'Failed to resend OTP code.', 'Error');
      }
    } catch {
      showToast('error', 'Network error while resending OTP.', 'Error');
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      showToast('error', 'Please enter the 6-digit verification code.', 'Code Incomplete');
      return;
    }
    setIsVerifying2FA(true);
    try {
      const otpRes = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: currentUser?.email, code: twoFactorCode })
      });
      const otpData = await otpRes.json().catch(() => ({}));
      if (otpRes.ok) {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'enable2FA',
            secret: twoFactorSecret,
            backupCodes
          })
        });
        setCurrentUser((prev: any) => ({ ...prev, twoFactorEnabled: true }));
        setShowTwoFactorModal(false);
        setTwoFactorCode('');
        showToast('success', 'Gmail 2FA has been successfully verified and activated on your account!', '2FA Protected');
      } else {
        showToast('error', otpData.error || 'Invalid or expired OTP verification code.', 'Verification Failed');
      }
    } catch {
      showToast('error', 'Network error while verifying OTP.', 'Error');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable2FA' })
      });
      if (res.ok) {
        setCurrentUser((prev: any) => ({ ...prev, twoFactorEnabled: false }));
        setShowDisable2FAModal(false);
        showToast('info', 'Two-Factor Authentication has been disabled.', '2FA Deactivated');
      } else {
        showToast('error', 'Failed to disable 2FA', 'Error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('error', 'Please fill in all password fields.', 'Validation Error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'New password and confirmation do not match.', 'Password Mismatch');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'changePassword', currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
    });
    if (res.ok) {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Your password has been changed securely.', 'Password Updated');
    } else {
      showToast('error', 'Failed to update password. Please check your current password.', 'Error');
    }
    setSaving(false);
  };

  const handleQuickStatusColorChange = async (statusName: string, paletteId: string) => {
    const updatedColors = { ...configs.statusColors, [statusName]: paletteId };
    setConfigs(prev => ({ ...prev, statusColors: updatedColors }));
    saveStoredStatusColors(updatedColors);
    setQuickColorPicker(null);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatusColors',
          statusColors: { [statusName]: paletteId }
        })
      });
      const pal = STATUS_COLOR_PALETTES.find(p => p.id === paletteId);
      showToast('success', `Color for "${statusName}" set to ${pal?.name || paletteId}.`, 'Status Color Updated');
    } catch {
      showToast('error', 'Failed to save status color preference.', 'Save Error');
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModal || !configInputValue.trim()) return;
    const { mode, type, label, originalValue } = configModal;
    const trimmed = configInputValue.trim();
    const isStatus = isStatusCategory(type);

    if (mode === 'add') {
      if (configs[type].some(item => item.toLowerCase() === trimmed.toLowerCase())) {
        showToast('warning', `"${trimmed}" already exists in ${label}s.`, 'Duplicate Option');
        return;
      }

      const updatedColors = isStatus 
        ? { ...configs.statusColors, [trimmed]: selectedStatusColor }
        : configs.statusColors;

      const updated = { 
        ...configs, 
        [type]: [...configs[type], trimmed],
        statusColors: updatedColors
      };
      setConfigs(updated);
      if (isStatus) {
        saveStoredStatusColors(updatedColors);
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('agentladders_agency_configs', JSON.stringify(updated));
        } catch {}
      }
      setConfigModal(null);
      setConfigInputValue('');

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateConfig', ...updated })
      });

      const categoryName = getCategoryLabel(type);
      showToast('success', `Added "${trimmed}" to ${categoryName}s!`, 'Option Added');
    } else {
      // mode === 'edit'
      if (originalValue === trimmed && (!isStatus || configs.statusColors[originalValue] === selectedStatusColor)) {
        setConfigModal(null);
        setConfigInputValue('');
        return;
      }

      if (configs[type].some(item => item.toLowerCase() === trimmed.toLowerCase() && item.toLowerCase() !== originalValue?.toLowerCase())) {
        showToast('warning', `"${trimmed}" already exists in ${label}s.`, 'Duplicate Option');
        return;
      }

      const updatedList = configs[type].map(item => item === originalValue ? trimmed : item);
      const updatedColors = { ...configs.statusColors };
      if (isStatus) {
        if (originalValue && originalValue !== trimmed) {
          delete updatedColors[originalValue];
        }
        updatedColors[trimmed] = selectedStatusColor;
        saveStoredStatusColors(updatedColors);
      }

      const updated = { ...configs, [type]: updatedList, statusColors: updatedColors };
      setConfigs(updated);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('agentladders_agency_configs', JSON.stringify(updated));
        } catch {}
      }
      setConfigModal(null);
      setConfigInputValue('');

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateConfig', ...updated })
      });

      const categoryName = getCategoryLabel(type);
      showToast('success', `Updated "${originalValue}" to "${trimmed}"!`, 'Option Updated');
    }
  };

  const handleConfirmDeleteConfigItem = async () => {
    if (!configItemToDelete) return;
    const { type, item } = configItemToDelete;
    const isStatus = isStatusCategory(type);

    if (configs[type].length <= 1) {
      showToast('warning', 'You must maintain at least one configured option.', 'Action Prohibited');
      setConfigItemToDelete(null);
      return;
    }

    const updatedList = configs[type].filter(i => i !== item);
    const updatedColors = { ...configs.statusColors };
    if (isStatus && updatedColors[item]) {
      delete updatedColors[item];
      saveStoredStatusColors(updatedColors);
    }

    const updated = { ...configs, [type]: updatedList, statusColors: updatedColors };
    setConfigs(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('agentladders_agency_configs', JSON.stringify(updated));
      } catch {}
    }
    setConfigItemToDelete(null);

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updated })
    });

    const categoryName = getCategoryLabel(type);
    showToast('info', `Deleted "${item}" from ${categoryName}s.`, 'Option Deleted');
  };

  const handleResetConfigDefaults = async (type: ConfigCategoryKey) => {
    let defaults: string[] = [];
    if (type === 'propertyStatuses') defaults = DEFAULT_PROPERTY_STATUSES;
    else if (type === 'leadStatuses') defaults = DEFAULT_LEAD_STATUSES;
    else if (type === 'siteVisitStatuses') defaults = DEFAULT_SITE_VISIT_STATUSES;
    else if (type === 'taskStatuses') defaults = DEFAULT_TASK_STATUSES;
    else if (type === 'clientStatuses') defaults = DEFAULT_CLIENT_STATUSES;
    else if (type === 'invoiceStatuses') defaults = DEFAULT_INVOICE_STATUSES;
    else if (type === 'paymentStatuses') defaults = DEFAULT_PAYMENT_STATUSES;
    else if (type === 'bhkOptions') defaults = DEFAULT_BHK_OPTIONS;
    else if (type === 'propertyTypes') defaults = DEFAULT_PROPERTY_TYPES;
    else if (type === 'leadSources') defaults = DEFAULT_LEAD_SOURCES;
    else if (type === 'propertySpecs') defaults = DEFAULT_PROPERTY_SPECS;
    else if (type === 'constructionStages') defaults = DEFAULT_CONSTRUCTION_STAGES;
    else if (type === 'vastuOptions') defaults = DEFAULT_VASTU_FACINGS;
    else if (type === 'dealStages') defaults = DEFAULT_DEAL_STAGES;
    else if (type === 'parkingOptions') defaults = DEFAULT_PARKING_OPTIONS;

    // Reset status color overrides for these items if status category
    const isStatus = isStatusCategory(type);
    const updatedColors = { ...configs.statusColors };
    if (isStatus) {
      defaults.forEach(d => {
        delete updatedColors[d];
      });
      saveStoredStatusColors(updatedColors);
    }

    const updated = { ...configs, [type]: defaults, statusColors: updatedColors };
    setConfigs(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('agentladders_agency_configs', JSON.stringify(updated));
      } catch {}
    }

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updated })
    });

    const categoryName = getCategoryLabel(type);
    showToast('success', `Reset ${categoryName} to standard Indian defaults.`, 'Defaults Restored');
  };

  const toggleNotification = async (key: string, type: 'inApp' | 'email') => {
    const updated = { ...notifications };
    if (!updated[key]) updated[key] = { inApp: false, email: false };
    updated[key][type] = !updated[key][type];
    
    setNotifications(updated);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateNotifications', notificationPrefs: updated })
    });
    showToast('info', `Notification preference updated for ${key}`, 'Preferences Saved');
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Agency configuration, team management, security, and billing" />

      <div className={styles.settingsLayout}>
        <nav className={styles.settingsTabs}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.settingsContent}>
          {activeTab === 'agency' && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Agency Profile</h2>
              {loading ? <p style={{ color: '#64748b' }}>Loading settings...</p> : (
                <>
                  {/* Agency Brand Logo Card */}
                  <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: 24,
                    marginBottom: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{
                          width: 72,
                          height: 72,
                          borderRadius: 12,
                          border: '2px dashed var(--border-color)',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {agencyLogo ? (
                            <img src={agencyLogo} alt="Agency Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: 32 }}>🏡</span>
                          )}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Agency Brand Logo</h3>
                          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                            Display your agency logo across the navigation bar, client portals, and property brochures.
                          </p>
                          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Recommended: Square or horizontal PNG / SVG with transparent background (Max 2.5MB)</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <span>📁</span> Upload Logo
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoFileUpload} style={{ display: 'none' }} />
                        </label>
                        {agencyLogo && (
                          <Button variant="outline" size="sm" onClick={() => handleSaveAgencyLogo('')} disabled={savingLogo}>
                            Remove Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>Agency Name</label>
                      <input type="text" value={agencyData.name} onChange={e => setAgencyData({...agencyData, name: e.target.value})} className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Country</label>
                      <select className={styles.input} value={agencyData.country} onChange={e => setAgencyData({...agencyData, country: e.target.value})}>
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>UAE</option>
                        <option>Australia</option>
                        <option>Canada</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Primary Currency</label>
                      <select className={styles.input} value={agencyData.currency} onChange={e => setAgencyData({...agencyData, currency: e.target.value})}>
                        <option>USD</option>
                        <option>INR</option>
                        <option>GBP</option>
                        <option>AED</option>
                        <option>AUD</option>
                        <option>CAD</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Timezone</label>
                      <select 
                        className={styles.input} 
                        value={agencyData.timezone || 'Asia/Kolkata'}
                        onChange={e => setAgencyData({ ...agencyData, timezone: e.target.value })}
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                        <option value="Europe/London">Europe/London (GMT / BST)</option>
                        <option value="America/New_York">America/New_York (EST / EDT)</option>
                        <option value="America/Chicago">America/Chicago (CST / CDT)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                        <option value="Australia/Sydney">Australia/Sydney (AEST +10:00)</option>
                      </select>
                    </div>
                    <div className={`${styles.inputGroup} ${styles.fullSpan}`}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Official Broker WhatsApp Number *</span>
                        <InfoTooltip text="This WhatsApp number is used when clients click 'Connect with me on WhatsApp' on public property listings." />
                      </label>
                      <input 
                        type="tel" 
                        value={agencyData.whatsapp || ''} 
                        onChange={e => setAgencyData({...agencyData, whatsapp: e.target.value})} 
                        placeholder="+91 98200 12345" 
                        className={styles.input} 
                        required
                      />
                      <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
                        💬 Leads clicking <strong>Connect with me on WhatsApp</strong> on public showcases will start a chat directly with this number.
                      </span>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <Button variant="primary" onClick={handleSaveAgency} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className={styles.formSection} style={{ maxWidth: 960 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                    Brand Typography & Color Scheme
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13.5, margin: '6px 0 0' }}>
                    Customize your agency’s font family and brand colors. Changes apply immediately across the dashboard and client presentation pages.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleResetTheme}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#fff',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTheme}
                    disabled={savingTheme}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    {savingTheme ? 'Saving...' : 'Save Branding'}
                  </button>
                </div>
              </div>

              {/* Section 1: Font Selection */}
              {/* Section 1: Typography Selection */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>🔤</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Select Typography (7 Font Options • Default: Roboto)
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {FONT_OPTIONS.map(font => {
                    const isSelected = selectedFont === font.id;
                    const isDefault = font.id === 'roboto';
                    return (
                      <div
                        key={font.id}
                        onClick={() => handleFontChange(font.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid #e2e8f0',
                          borderRadius: 14,
                          padding: 16,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected 
                            ? '0 0 0 4px rgba(var(--primary-rgb), 0.18), 0 10px 25px -4px rgba(var(--primary-rgb), 0.25)' 
                            : '0 1px 3px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transform: isSelected ? 'translateY(-2px)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 15.5, fontWeight: 800, color: isSelected ? 'var(--primary)' : '#0f172a' }}>
                                {font.name}
                              </span>
                              {isDefault && (
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  backgroundColor: '#ecfdf5',
                                  color: '#065f46',
                                  border: '1px solid #a7f3d0',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  letterSpacing: '0.04em'
                                }}>
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                              {font.category}
                            </div>
                          </div>

                          {isSelected ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: 'var(--primary)',
                              color: '#ffffff',
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 20,
                              boxShadow: '0 2px 6px rgba(var(--primary-rgb), 0.35)',
                              letterSpacing: '0.02em'
                            }}>
                              <span>✓</span> ACTIVE
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: '#f8fafc',
                              color: '#64748b',
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '3px 9px',
                              borderRadius: 14,
                              border: '1px solid #e2e8f0'
                            }}>
                              Select
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.45 }}>
                          {font.tagline}
                        </p>

                        {/* Live Font Specimen */}
                        <div style={{ 
                          backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.04)' : '#f8fafc', 
                          padding: '12px 14px', 
                          borderRadius: 10, 
                          border: isSelected ? '1.5px solid rgba(var(--primary-rgb), 0.25)' : '1px solid #f1f5f9',
                          fontFamily: font.fontFamily,
                          marginTop: 'auto'
                        }}>
                          <div style={{ fontSize: 11, color: isSelected ? 'var(--primary)' : '#94a3b8', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Specimen:</span>
                            {isSelected && <span style={{ fontSize: 10.5, fontWeight: 800 }}>● Currently Applied</span>}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                            {font.previewHeading}
                          </div>
                          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.35 }}>
                            {font.previewBody}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Color Palette Selection */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>🎨</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Select Color Scheme (6 Real Estate Palettes • Default: Emerald Prosperity)
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {COLOR_SCHEMES.map(scheme => {
                    const isSelected = selectedColor === scheme.id;
                    const isDefault = scheme.id === 'emerald';
                    return (
                      <div
                        key={scheme.id}
                        onClick={() => handleColorChange(scheme.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: isSelected ? `2.5px solid ${scheme.primary}` : '1.5px solid #e2e8f0',
                          borderRadius: 14,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected 
                            ? `0 0 0 4px rgba(${scheme.primaryRgb}, 0.22), 0 12px 28px -4px rgba(${scheme.primaryRgb}, 0.28)` 
                            : '0 1px 3px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          position: 'relative'
                        }}
                      >
                        {/* Gradient header swatch */}
                        <div style={{
                          height: 38,
                          background: scheme.previewGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 14px'
                        }}>
                          <span style={{
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                            textTransform: 'uppercase'
                          }}>
                            {scheme.id}
                          </span>
                          {isSelected ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: '#ffffff',
                              color: scheme.primary,
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: 14,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                            }}>
                              <span>✓</span> ACTIVE
                            </span>
                          ) : (
                            <span style={{
                              color: 'rgba(255,255,255,0.85)',
                              fontSize: 11,
                              fontWeight: 600,
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              Select
                            </span>
                          )}
                        </div>

                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 15.5, fontWeight: 800, color: isSelected ? scheme.primary : '#0f172a' }}>
                              {scheme.name}
                            </span>
                            {isDefault && (
                              <span style={{
                                fontSize: 10,
                                fontWeight: 800,
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                                padding: '1px 6px',
                                borderRadius: 4,
                                letterSpacing: '0.04em'
                              }}>
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px', lineHeight: 1.45 }}>
                            {scheme.tagline}
                          </p>

                          {/* Swatches circles */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div title="Primary Brand" style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: scheme.primary, boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '2px solid #fff' }} />
                            <div title="Hover / Dark" style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: scheme.primaryDark, boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '2px solid #fff' }} />
                            <div title="Accent Highlight" style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: scheme.accent, boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '2px solid #fff' }} />
                            <div title="Soft Background / Badge" style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: scheme.badgeBg, border: '1.5px solid #cbd5e1' }} />
                          </div>

                          {/* Mini UI elements showing the colors with selected indicator */}
                          <div style={{
                            display: 'flex',
                            gap: 8,
                            marginTop: 'auto',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 8,
                            backgroundColor: isSelected ? scheme.badgeBg : '#f8fafc',
                            border: isSelected ? `1px solid ${scheme.accent}` : '1px solid #f1f5f9'
                          }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <div style={{ backgroundColor: scheme.primary, color: '#fff', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                Button
                              </div>
                              <div style={{ backgroundColor: isSelected ? '#ffffff' : scheme.badgeBg, color: scheme.badgeText, padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700, border: isSelected ? `1px solid ${scheme.accent}` : 'none' }}>
                                Available
                              </div>
                            </div>
                            {isSelected && (
                              <span style={{ fontSize: 11, fontWeight: 800, color: scheme.primaryText, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span>✓</span> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Live Interactive Preview Sandbox */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: 24,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Live Real-Time Sandbox Preview
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 12.5, margin: '2px 0 0' }}>
                      Active combination: <strong>{FONT_OPTIONS.find(f => f.id === selectedFont)?.name}</strong> + <strong>{COLOR_SCHEMES.find(c => c.id === selectedColor)?.name}</strong>
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    Live Client View
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: 20 }}>
                  {/* Sample Property Card */}
                  <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border-color)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>₹3.85 Crore</span>
                      <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700 }}>
                        Exclusive
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      Lodha Altamount Horizon Suite
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                      4 BHK • 3,250 Sq.Ft • Altamount Road, Mumbai
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button style={{ flex: 1, backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                        Book Site Visit
                      </button>
                      <button style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', border: '1px solid var(--primary-light)', borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                        Share Pitch
                      </button>
                    </div>
                  </div>

                  {/* Sample Metric & Notification Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border-color)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Active Pipeline Value</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>₹42.8 Crore</div>
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        🏢
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid var(--border-color)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      <div style={{ fontSize: 13, color: '#334155' }}>
                        Next site visit scheduled with <strong>Rahul Sharma</strong> today at 5:30 PM.
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={handleResetTheme}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#fff',
                      color: '#475569',
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTheme}
                    disabled={savingTheme}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {savingTheme ? 'Saving Branding...' : 'Save Brand Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className={styles.formSection} style={{ maxWidth: 960 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                    Invoice &amp; Tax Settings
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13.5, margin: '6px 0 0' }}>
                    Configure legal entity name, GSTIN, RERA registration, bank remittance account, place of supply, and SAC code printed on official client invoices and tax receipts.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="outline" size="sm" type="button" onClick={handleResetInvoiceSettings}>
                    Reset Defaults
                  </Button>
                  <Button variant="primary" size="sm" type="button" onClick={handleSaveInvoiceSettings} disabled={savingInvoiceSettings}>
                    {savingInvoiceSettings ? 'Saving Settings...' : 'Save Invoice Settings'}
                  </Button>
                </div>
              </div>

              {/* Section 1: Agency Legal & RERA Identifiers */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '22px 24px',
                marginBottom: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>🏢</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>Legal Entity &amp; RERA Registration</h3>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                      Official company details shown on invoice headers and statutory compliance footers.
                    </p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>
                      Agency / Legal Entity Name *
                      <InfoTooltip text="Full legal brokerage name printed on invoice header (e.g. Vance Luxury Realty)" />
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceSettings.agencyName}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, agencyName: e.target.value })}
                      placeholder="e.g. Vance Luxury Realty"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      Business Tagline / Service Subtitle
                      <InfoTooltip text="Service classification printed beneath agency name (e.g. Licensed Real Estate Advisory & Brokerage Firm)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.tagline}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, tagline: e.target.value })}
                      placeholder="e.g. Licensed Real Estate Advisory & Brokerage Firm"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      GSTIN (Goods &amp; Services Tax ID)
                      <InfoTooltip text="15-digit State GST identification number (e.g. 27AABCA1234F1Z5 for Maharashtra)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.gstin}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, gstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 27AABCA1234F1Z5"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      RERA Registration No.
                      <InfoTooltip text="State Real Estate Regulatory Authority broker license number (e.g. A51800029384)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.reraReg}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, reraReg: e.target.value.toUpperCase() })}
                      placeholder="e.g. A51800029384"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Remittance & Bank Account Details */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '22px 24px',
                marginBottom: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>💳</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>Remittance &amp; Bank Account Details</h3>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                      Current account, NEFT/RTGS IFSC, and UPI handle for client payments and brokerage remittance.
                    </p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>
                      Account Holder Name
                      <InfoTooltip text="Bank account beneficiary name (e.g. Vance Luxury Realty Escrow Advisory)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.accountName}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, accountName: e.target.value })}
                      placeholder="e.g. Vance Luxury Realty Escrow Advisory"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      Bank Name
                      <InfoTooltip text="Commercial bank name (e.g. HDFC Bank Ltd)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.bankName}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank Ltd"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      Account Type
                      <InfoTooltip text="Select whether this is a Current or Savings business account" />
                    </label>
                    <select
                      value={invoiceSettings.accountType || 'Current'}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, accountType: e.target.value })}
                      className={styles.input}
                    >
                      <option value="Current">Current Account</option>
                      <option value="Savings">Savings Account</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      Account Number
                      <InfoTooltip text="Bank account number for brokerage wire remittance (e.g. 50200088921102)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.accountNumber}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, accountNumber: e.target.value })}
                      placeholder="e.g. 50200088921102"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      IFSC Code
                      <InfoTooltip text="11-character Indian Financial System Code (e.g. HDFC0000128)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.ifscCode}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0000128"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                    <label>
                      UPI / QR Remittance ID
                      <InfoTooltip text="Virtual payment address (VPA) for instant UPI payments (e.g. agency.realty@hdfcbank)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.upiId}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, upiId: e.target.value.toLowerCase() })}
                      placeholder="e.g. agency.realty@hdfcbank"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Tax Jurisdiction & SAC Code */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '22px 24px',
                marginBottom: 20,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>⚖️</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>Tax Jurisdiction &amp; Service Classification</h3>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                      GST place of supply and HSN/SAC service accounting code for real estate brokerage advisory.
                    </p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>
                      Place of Supply (State &amp; Code)
                      <InfoTooltip text="State name and 2-digit GST code (e.g. Maharashtra (27))" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.placeOfSupply}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, placeOfSupply: e.target.value })}
                      placeholder="e.g. Maharashtra (27)"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      SAC Code (Services Accounting Code)
                      <InfoTooltip text="Standard 6-digit SAC for Real Estate Services on a Fee or Contract Basis (e.g. 997221)" />
                    </label>
                    <input
                      type="text"
                      value={invoiceSettings.sacCode}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, sacCode: e.target.value })}
                      placeholder="e.g. 997221"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                    <label>
                      Default Payment Terms &amp; Remittance Notes
                      <InfoTooltip text="Standard terms and payment conditions printed on invoices (e.g. Brokerage advisory fees payable upon formal title verification and registration.)" />
                    </label>
                    <textarea
                      rows={2}
                      value={invoiceSettings.defaultNotes || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, defaultNotes: e.target.value })}
                      placeholder="e.g. Brokerage advisory fees payable upon formal title verification and registration."
                      className={styles.input}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: 14,
                padding: '20px 24px',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                    Live Tax Invoice Header &amp; Remittance Preview
                  </span>
                  <span style={{ fontSize: 11, backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                    Auto-Updates Live
                  </span>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        {invoiceSettings.agencyName || 'Your Agency Legal Name'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {invoiceSettings.tagline || 'Licensed Real Estate Advisory & Brokerage Firm'}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        GSTIN: <strong>{invoiceSettings.gstin || '27AABCA1234F1Z5'}</strong> • RERA Reg: <strong>{invoiceSettings.reraReg || 'A51800029384'}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>TAX INVOICE</div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        Place of Supply: <strong>{invoiceSettings.placeOfSupply || 'Maharashtra (27)'}</strong>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>
                        SAC Code: <strong>{invoiceSettings.sacCode || '997221'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Remittance preview */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 12,
                    color: '#475569'
                  }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Remittance &amp; Bank Account Details:</div>
                    <div>Account Name: <strong>{invoiceSettings.accountName || `${invoiceSettings.agencyName} Escrow Advisory`}</strong></div>
                    <div>Bank: <strong>{invoiceSettings.bankName || 'Bank Name'} • Current A/c No: {invoiceSettings.accountNumber || 'Account No'}</strong> • IFSC: <strong>{invoiceSettings.ifscCode || 'IFSC'}</strong></div>
                    {invoiceSettings.upiId && <div style={{ marginTop: 2 }}>UPI / QR Remittance ID: <strong>{invoiceSettings.upiId}</strong></div>}
                  </div>

                  {/* Payment Terms & Remittance Notes Preview */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 12,
                    color: '#475569',
                    marginTop: 10
                  }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Payment Terms &amp; Remittance Notes:</div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#334155' }}>
                      {invoiceSettings.defaultNotes || 'Brokerage advisory fees payable upon formal title verification and registration.'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button variant="outline" type="button" onClick={handleResetInvoiceSettings}>
                  Reset Defaults
                </Button>
                <Button variant="primary" type="button" onClick={handleSaveInvoiceSettings} disabled={savingInvoiceSettings}>
                  {savingInvoiceSettings ? 'Saving Settings...' : 'Save Invoice Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className={styles.formSection}>
              {/* Permission Notice Banner for Admin, Agent, Read-Only */}
              {!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes((currentUser?.role || '').toUpperCase()) && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color: '#475569'
                }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Directory View-Only Mode:</strong> Your account role (<strong>{currentUser?.role || 'AGENT'}</strong>) does not have permission to modify team members or permissions. Role management is restricted to the <strong>Agency Owner</strong> and <strong>Managers</strong>.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Team & Permissions</h2>
                  <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
                    Manage access credentials, role permissions, and active broker accounts for your agency.
                  </p>
                </div>
                {['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes((currentUser?.role || '').toUpperCase()) && (
                  <Button variant="primary" onClick={() => setShowInviteModal(true)} disabled={saving}>
                    + Invite Team Member
                  </Button>
                )}
              </div>

              <div className={styles.userList}>
                {users.map((user) => {
                  const isCurrent = user.id === currentUser?.id || user.email === currentUser?.email;
                  const currentRole = (currentUser?.role || '').toUpperCase();
                  const targetRole = (user.role || '').toUpperCase();
                  const isOwner = targetRole === 'OWNER';

                  // RBAC Evaluators for UI controls:
                  // 1. Owner can never be modified or removed by anyone
                  // 2. Manager can modify Admin, Agent, Read-Only. Cannot modify Owner or other Managers.
                  // 3. Admin, Agent, Read-Only cannot modify any roles or remove anyone.
                  const canEditThisUser = !isOwner && !isCurrent && (
                    ['OWNER', 'SUPER_ADMIN'].includes(currentRole) ||
                    (currentRole === 'MANAGER' && ['ADMIN', 'AGENT', 'READONLY'].includes(targetRole))
                  );

                  const canRemoveThisUser = !isOwner && !isCurrent && (
                    ['OWNER', 'SUPER_ADMIN'].includes(currentRole) ||
                    (currentRole === 'MANAGER' && ['ADMIN', 'AGENT', 'READONLY'].includes(targetRole))
                  );

                  return (
                    <div key={user.id} className={styles.userRow} style={{ justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className={styles.userAvatar}>
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'AG'}
                        </div>
                        <div className={styles.userInfo}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong>{user.name}</strong>
                            {isCurrent && (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, backgroundColor: '#dcfce7', color: '#15803d' }}>
                                You
                              </span>
                            )}
                            {isOwner && (
                              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 6, backgroundColor: '#fef3c7', color: '#92400e', letterSpacing: '0.05em' }}>
                                OWNER
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 13, color: '#64748b' }}>{user.email}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {canEditThisUser ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: 12.5,
                              fontWeight: 600,
                              backgroundColor: '#fff',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {/* Manager can only assign Admin, Agent, Read-Only */}
                            {['OWNER', 'SUPER_ADMIN'].includes(currentRole) && (
                              <option value="MANAGER">Manager (Full Agency)</option>
                            )}
                            <option value="ADMIN">Admin (Billing & Operations)</option>
                            <option value="AGENT">Agent (Standard Broker)</option>
                            <option value="READONLY">Read-Only Agent</option>
                          </select>
                        ) : (
                          <span className={styles.roleBadge} style={{
                            backgroundColor: isOwner ? '#fef3c7' : undefined,
                            color: isOwner ? '#92400e' : undefined,
                            fontWeight: isOwner ? 700 : undefined
                          }}>
                            {user.role}
                          </span>
                        )}

                        {canRemoveThisUser && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete({ id: user.id, name: user.name, email: user.email })}
                            title="Remove from agency"
                            style={{
                              border: '1px solid #fecaca',
                              backgroundColor: '#fff',
                              color: '#ef4444',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className={styles.formSection}>
              <div style={{ marginBottom: 20 }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Subscription &amp; Billing</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
                  Manage your agency tier, broker seat allocations, and enterprise inventory limits.
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Plan 1: Starter */}
                {(() => {
                  const isActive = agencyData.plan?.toLowerCase() === 'starter';
                  return (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isActive ? '2px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                        boxShadow: isActive ? '0 0 18px rgba(5, 150, 105, 0.22)' : '0 2px 8px rgba(0,0,0,0.03)',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isActive && (
                        <div style={{ position: 'absolute', top: -12, right: 18, backgroundColor: 'var(--primary, #059669)', color: '#ffffff', fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20, boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)' }}>
                          ✓ Active Plan
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Starter Broker</h3>
                        <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>₹1,999<span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>/mo</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Up to 2 Real Estate Agents</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> 500 Active Properties Catalog</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Daily Habit Cockpit &amp; Match Engine</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> WhatsApp Pitch Generator</li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        disabled={isActive}
                        onClick={() => setPlanToUpgrade('Starter')}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: 8,
                          border: isActive ? '1px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                          backgroundColor: isActive ? 'rgba(5, 150, 105, 0.08)' : '#0f172a',
                          color: isActive ? 'var(--primary, #059669)' : '#ffffff',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: isActive ? 'default' : 'pointer'
                        }}
                      >
                        {isActive ? '✓ Current Plan' : 'Switch to Starter'}
                      </button>
                    </div>
                  );
                })()}

                {/* Plan 2: Pro */}
                {(() => {
                  const isActive = agencyData.plan?.toLowerCase() === 'professional' || agencyData.plan?.toLowerCase() === 'pro';
                  return (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isActive ? '2px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                        boxShadow: isActive ? '0 0 18px rgba(5, 150, 105, 0.22)' : '0 2px 8px rgba(0,0,0,0.03)',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isActive && (
                        <div style={{ position: 'absolute', top: -12, right: 18, backgroundColor: 'var(--primary, #059669)', color: '#ffffff', fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20, boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)' }}>
                          ✓ Active Plan
                        </div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 7px', borderRadius: 4 }}>MOST POPULAR</span>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Agency Unlimited</h3>
                        <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>₹4,999<span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>/mo</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Up to 15 Agency Team Members</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Unlimited Properties &amp; Inquiries</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Advanced Kundali Match Engine</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Multi-Property Showing Tours</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Priority Dedicated Real Estate Support</li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        disabled={isActive}
                        onClick={() => setPlanToUpgrade('Professional')}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: 8,
                          border: isActive ? '1px solid var(--primary, #059669)' : 'none',
                          backgroundColor: isActive ? 'rgba(5, 150, 105, 0.08)' : 'var(--primary, #059669)',
                          color: isActive ? 'var(--primary, #059669)' : '#ffffff',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: isActive ? 'default' : 'pointer'
                        }}
                      >
                        {isActive ? '✓ Current Plan' : 'Switch to Pro'}
                      </button>
                    </div>
                  );
                })()}

                {/* Plan 3: Enterprise */}
                {(() => {
                  const isActive = agencyData.plan?.toLowerCase() === 'enterprise';
                  return (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isActive ? '2px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                        boxShadow: isActive ? '0 0 18px rgba(5, 150, 105, 0.22)' : '0 2px 8px rgba(0,0,0,0.03)',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isActive && (
                        <div style={{ position: 'absolute', top: -12, right: 18, backgroundColor: 'var(--primary, #059669)', color: '#ffffff', fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20, boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)' }}>
                          ✓ Active Plan
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Enterprise Brokerage</h3>
                        <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>₹9,999<span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>/mo</span></p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Unlimited Brokers &amp; Branch Offices</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> Custom Agency Domain &amp; Whitelabel</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> REST API &amp; Webhooks Integration</li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>✓</span> 24/7 Phone &amp; On-Site Account Manager</li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        disabled={isActive}
                        onClick={() => setPlanToUpgrade('Enterprise')}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: 8,
                          border: isActive ? '1px solid var(--primary, #059669)' : '1px solid #cbd5e1',
                          backgroundColor: isActive ? 'rgba(5, 150, 105, 0.08)' : '#0f172a',
                          color: isActive ? 'var(--primary, #059669)' : '#ffffff',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: isActive ? 'default' : 'pointer'
                        }}
                      >
                        {isActive ? '✓ Current Plan' : 'Switch to Enterprise'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.formSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Notification Preferences</h2>
                  <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
                    Control how and when your team receives real-time transaction updates, customer inquiries, and reminders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #0f172a',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  🔔 Send Test Notification
                </button>
              </div>

              {[
                { label: 'Support ticket updates', desc: 'Real-time alert whenever AgentLadders HQ replies to your helpdesk tickets or updates ticket status.' },
                { label: 'New lead assigned', desc: 'When a buyer inquiry is routed to an agent or imported from portals.' },
                { label: 'Task reminder', desc: 'Alerts 30 minutes before high-priority daily habit cockpit deadlines.' },
                { label: 'Site visit reminder', desc: 'Automated 1-hour and morning alerts before scheduled client property showings.' },
                { label: 'Invoice overdue', desc: 'Alerts when commission brokerage payouts or client retainers are past due.' },
                { label: 'WhatsApp Pitch Generated', desc: 'Notifications when team members dispatch WhatsApp property cards to prospects.' },
                { label: 'Daily Habit Cockpit Summary', desc: 'Morning dispatch with calls required, site visits pending, and active deals.' }
              ].map(({ label, desc }) => {
                const prefs = notifications[label] || { inApp: false, email: false };
                return (
                  <div key={label} className={styles.notifRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{label}</span>
                      <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0' }}>{desc}</p>
                    </div>
                    <div className={styles.toggleGroup}>
                      <label className={styles.toggle}>
                        <input type="checkbox" checked={prefs.inApp} onChange={() => toggleNotification(label, 'inApp')} /> In-App
                      </label>
                      <label className={styles.toggle}>
                        <input type="checkbox" checked={prefs.email} onChange={() => toggleNotification(label, 'email')} /> Email
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles.formSection}>
              <div>
                <h2 className={styles.sectionTitle}>Profile & Security Settings</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 20px' }}>
                  Manage personal profile picture, account access credentials, multi-factor authentication, and security policies.
                </p>
              </div>

              {/* User Profile Photo Card */}
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: 24,
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      border: '2px solid var(--primary-light)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      fontWeight: 800,
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {userAvatar ? (
                        <img src={userAvatar} alt={currentUser?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (currentUser?.name || currentUser?.email || 'U').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                        {currentUser?.name || 'Agent'} — Profile Photo
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                        {currentUser?.email} · <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{currentUser?.role || 'AGENT'}</span>
                      </p>
                      <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Your portrait appears in the topbar, sidebar, deal activity logs, and WhatsApp pitch cards.</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>📷</span> Upload Photo
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarFileUpload} style={{ display: 'none' }} />
                    </label>
                    {userAvatar && (
                      <Button variant="outline" size="sm" onClick={() => handleSaveUserAvatar('')} disabled={savingAvatar}>
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2FA Card (Gmail OTP 2FA) */}
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '24px',
                marginBottom: 16,
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div style={{ maxWidth: 520 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🛡️</span>
                    <div>
                      <strong style={{ fontSize: 15, color: '#0f172a' }}>Gmail One-Time Password (2FA OTP)</strong>
                      <span style={{
                        marginLeft: 10,
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        backgroundColor: currentUser?.twoFactorEnabled ? '#dcfce7' : '#fef3c7',
                        color: currentUser?.twoFactorEnabled ? '#15803d' : '#b45309'
                      }}>
                        {currentUser?.twoFactorEnabled ? 'Active & Protected' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <p className={styles.mutedText} style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>
                    {currentUser?.twoFactorEnabled
                      ? `Your account is protected with 6-digit Gmail OTP verification. A one-time code is delivered directly to ${currentUser?.email} every time you sign in.`
                      : `Protect your agency inventory, private client notes, and deals by requiring a 6-digit OTP sent to your registered Gmail (${currentUser?.email}) upon signing in.`}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {currentUser?.twoFactorEnabled ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setShowBackupCodesModal(true)}>
                        View Recovery Codes
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowDisable2FAModal(true)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: '1px solid #fecaca',
                          backgroundColor: '#fff',
                          color: '#dc2626',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Disable 2FA
                      </button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={handleOpenEnable2FA}>
                      Enable Gmail OTP 2FA
                    </Button>
                  )}
                </div>
              </div>

              {/* Password Card */}
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '24px',
                marginBottom: 16,
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🔒</span>
                    <strong style={{ fontSize: 15, color: '#0f172a' }}>Account Password</strong>
                  </div>
                  <p className={styles.mutedText} style={{ marginTop: 6, fontSize: 13 }}>
                    Update your account password regularly to protect your confidential property contracts.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </Button>
              </div>

              {/* Active Sessions Card (Multi-Device, Real Telemetry & Remote Session Revocation) */}
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '24px',
                backgroundColor: '#fff',
                marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>💻</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 16, color: '#0f172a' }}>Current Device &amp; Active Sessions</strong>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 12,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                            {activeSessions.length} {activeSessions.length === 1 ? 'Device' : 'Devices'} Connected
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>
                      Live telemetry, hardware attributes, IP addresses, and geolocation for all browsers and devices authenticated into your account.
                    </p>
                  </div>

                  {/* Header Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Toggle IP & Location Options */}
                    <button
                      type="button"
                      onClick={() => setShowIpDetails(!showIpDetails)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: showIpDetails ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                        backgroundColor: showIpDetails ? '#f8fafc' : '#ffffff',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      title="Toggle IP and geolocation details display"
                    >
                      <span>{showIpDetails ? '🌐 Hide IP/Location Details' : '🌐 Show IP/Location Details'}</span>
                    </button>

                    {/* Refresh */}
                    <button
                      type="button"
                      onClick={() => loadActiveSessions()}
                      disabled={loadingSessions}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      title="Refresh active sessions"
                    >
                      <span>🔄 Refresh</span>
                    </button>

                    {/* Revoke All Other Sessions */}
                    {activeSessions.filter(s => !s.current && s.id !== currentDeviceId).length > 0 && (
                      <button
                        type="button"
                        onClick={handleRevokeAllOtherSessions}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid #fecaca',
                          backgroundColor: '#fff1f2',
                          color: '#dc2626',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <span>🚪 Sign Out All Other Devices ({activeSessions.filter(s => !s.current && s.id !== currentDeviceId).length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Sessions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeSessions.map((session, idx) => {
                    const isCurrent = session.current || session.id === currentDeviceId || idx === 0;
                    const isMobile = session.deviceType === 'mobile' || session.browser?.toLowerCase().includes('mobile') || session.os?.toLowerCase().includes('ios') || session.os?.toLowerCase().includes('android');
                    const isFirefox = session.browser?.toLowerCase().includes('firefox');
                    const isSafari = session.browser?.toLowerCase().includes('safari') && !session.browser?.toLowerCase().includes('chrome');
                    const isEdge = session.browser?.toLowerCase().includes('edge') || session.browser?.toLowerCase().includes('edg');
                    
                    const browserIcon = isFirefox ? '🦊' : isSafari ? '🧭' : isEdge ? '🌊' : isMobile ? '📱' : '🌐';

                    return (
                      <div
                        key={session.id}
                        style={{
                          backgroundColor: isCurrent ? '#f0fdf4' : '#f8fafc',
                          border: isCurrent ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '16px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 16,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Left: Device Info */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 260 }}>
                          <span style={{
                            fontSize: 24,
                            backgroundColor: isCurrent ? '#dcfce7' : '#ffffff',
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: isCurrent ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                          }}>
                            {browserIcon}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: 14.5, color: '#0f172a' }}>
                                {session.browser}
                              </strong>
                              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                                on {session.os}
                              </span>
                              
                              {isCurrent && (
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  backgroundColor: '#16a34a',
                                  color: '#ffffff',
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  ✓ This Device
                                </span>
                              )}

                              <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: isCurrent ? '#dcfce7' : '#e2e8f0',
                                color: isCurrent ? '#15803d' : '#475569',
                                padding: '2px 7px',
                                borderRadius: 10
                              }}>
                                {isCurrent ? '● Active Now' : '● Signed In'}
                              </span>
                            </div>

                            {/* IP Address & Location Row */}
                            {showIpDetails && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: 12.5, color: '#334155' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                  <span style={{ color: '#0284c7' }}>🌐</span>
                                  <span style={{ fontWeight: 600 }}>IP:</span>
                                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{session.ipAddress}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cleanIp = session.ipAddress.split(' ')[0];
                                      navigator.clipboard?.writeText(cleanIp);
                                      showToast('info', `Copied IP address: ${cleanIp}`, 'IP Copied');
                                    }}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 11, color: '#64748b' }}
                                    title="Copy IP Address"
                                  >
                                    📋
                                  </button>
                                </div>

                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                  <span style={{ color: '#ea580c' }}>📍</span>
                                  <span style={{ fontWeight: 600 }}>Location:</span>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{session.location}</span>
                                </div>

                                {session.screen && (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 11.5 }}>
                                    <span>🖥️ {session.screen}</span>
                                  </div>
                                )}

                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 11.5 }}>
                                  <span>🕒 {formatSessionTime(session.lastActive)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Action */}
                        <div>
                          {isCurrent ? (
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#15803d',
                              backgroundColor: '#dcfce7',
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid #bbf7d0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}>
                              🔒 Current Session
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={revokingSessionId === session.id}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                border: '1px solid #fecaca',
                                backgroundColor: '#ffffff',
                                color: '#dc2626',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {revokingSessionId === session.id ? 'Revoking...' : 'Terminate Session'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Multi-Device Test Helper */}
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    💡 Log in from any other browser (Chrome, Firefox, Safari, Edge, Mobile) to see it appear here in real-time.
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleSimulateSession('Mozilla Firefox')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#fff',
                        fontSize: 11.5,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + Test Firefox Login
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateSession('Apple Safari Mobile')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#fff',
                        fontSize: 11.5,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + Test Mobile Safari Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (() => {
            interface ConfigSectionDef {
              key: ConfigCategoryKey;
              title: string;
              icon: string;
              group: 'statuses' | 'property' | 'sourcing';
              groupLabel: string;
              usageBadges: string[];
              description: string;
              placeholder: string;
              tip: string;
            }

            const CONFIG_SECTIONS: ConfigSectionDef[] = [
              // 1. Statuses of all places separately
              {
                key: 'propertyStatuses',
                title: 'Property Listing Statuses',
                icon: '🏷️',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Properties Catalog', 'Public Showcase (/p/[id])'],
                description: 'Manage inventory lifecycle states for your properties (Available, Under Offer, Under Negotiation, Sold, Rented, Off Market).',
                placeholder: 'e.g. Under Contract or Price Reduced',
                tip: '💡 This status immediately appears in property catalog filters, inventory editing drawers, and public listing previews.'
              },
              {
                key: 'leadStatuses',
                title: 'Inquiry / Lead Statuses',
                icon: '🎯',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Inquiries Pipeline', 'Lead Drawer', 'Matching Engine'],
                description: 'Pipeline stages for prospective buyers and tenants from initial inbound to won/lost (New Inbound, Contacted, Qualified, Negotiation, Won, Lost, etc.).',
                placeholder: 'e.g. Document Verification or Loan Approved',
                tip: '💡 This stage appears in the Inquiry Status dropdown, client follow-up tracking, and pipeline conversions.'
              },
              {
                key: 'dealStages',
                title: 'Deal Pipeline Stages',
                icon: '💼',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Deals Kanban', 'Pipeline Value', 'Commission Forecast'],
                description: 'Milestones in your transaction board (Negotiation, Token Received, Agreement Drafted, Registration Pending, Closed Won, Lost).',
                placeholder: 'e.g. KYC Verified or Escrow Deposit',
                tip: '💡 This column appears on your Deals Kanban board, stage transition menus, and brokerage forecasting.'
              },
              {
                key: 'siteVisitStatuses',
                title: 'Site Visit Statuses',
                icon: '📅',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Site Visits Calendar', 'Showing Bookings', 'Agent Schedule'],
                description: 'Operational statuses for client property showings and walkthroughs (Scheduled, Confirmed, Completed, Rescheduled, Cancelled, No Show).',
                placeholder: 'e.g. Virtual Tour or Feedback Pending',
                tip: '💡 This status appears in site visit booking drawers, calendar timeline nodes, and quick status selectors.'
              },
              {
                key: 'taskStatuses',
                title: 'Task Statuses',
                icon: '✅',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Agent Daily Tasks', 'Follow-up Reminders', 'Audit Logs'],
                description: 'Workflow states for daily agent action items, paperwork tasks, and deal reminders (Pending, In Progress, Completed, Overdue, Cancelled).',
                placeholder: 'e.g. Awaiting Documents or Blocked',
                tip: '💡 This status appears across agent task management lists and follow-up checklists.'
              },
              {
                key: 'clientStatuses',
                title: 'Client Relationship Statuses',
                icon: '👥',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Client CRM Table', 'Relationship Manager'],
                description: 'Relationship statuses for buyers, sellers, landlords, and investors (Active Search, In Contract, Closed Client, Past Client, Inactive).',
                placeholder: 'e.g. VIP Dormant or Renewal Due',
                tip: '💡 This status appears in client detail views, contact filters, and relationship manager dashboards.'
              },
              {
                key: 'invoiceStatuses',
                title: 'Invoice & Billing Statuses',
                icon: '🧾',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Invoices Table', 'Print Invoice', 'Payment Tracker'],
                description: 'Lifecycle stages for client commission invoices (Draft, Pending, Partially Paid, Paid, Overdue, Cancelled).',
                placeholder: 'e.g. Under Dispute or Escrow Hold',
                tip: '💡 This status appears in the Invoices table, invoice edit modal, live status dropdown, and printable tax invoice.'
              },
              {
                key: 'paymentStatuses',
                title: 'Payment Clearance Statuses',
                icon: '💳',
                group: 'statuses',
                groupLabel: 'Status & Workflow',
                usageBadges: ['Payments History', 'Clearance Tracker'],
                description: 'Financial settlement and clearance states for agency commission receipts (Completed, Pending Clearance, Processing, Failed, Refunded).',
                placeholder: 'e.g. Cheque Clearing or On Hold',
                tip: '💡 This status appears in the Payments table, payment filters, and receipt clearance records.'
              },

              // 2. Property Taxonomy & Attributes
              {
                key: 'bhkOptions',
                title: 'BHK Needed / Unit Types',
                icon: '🛏️',
                group: 'property',
                groupLabel: 'Property Attribute',
                usageBadges: ['Properties (BHK)', 'Inquiries (BHK Needed)'],
                description: 'Standard room configurations and space types for residential and commercial units (1 BHK, 2 BHK, 3 BHK, Studio, Penthouse, Duplex, etc.).',
                placeholder: 'e.g. 3.5 BHK, Studio, or 6 BHK',
                tip: '💡 This option appears in both Property listings (BHK) and Buyer Inquiries (BHK Needed).'
              },
              {
                key: 'propertyTypes',
                title: 'Property Asset Classes',
                icon: '🏢',
                group: 'property',
                groupLabel: 'Property Attribute',
                usageBadges: ['Property Types', 'Inquiry Requirements'],
                description: 'Real estate asset classes and building typologies in your market (Apartment, Villa / Bungalow, Penthouse, Commercial Office, Farmhouse, etc.).',
                placeholder: 'e.g. Penthouse Suite or Farmhouse',
                tip: '💡 This asset class appears in Property listings and Buyer Inquiries requirements.'
              },
              {
                key: 'propertySpecs',
                title: 'Specifications & Furnishing',
                icon: '🛋️',
                group: 'property',
                groupLabel: 'Property Attribute',
                usageBadges: ['Furnishing Tiers', 'WhatsApp Pitch Cards'],
                description: 'Interior fit-out and furnishing tiers for commercial and residential units (Fully Furnished, Semi-Furnished, Bare Shell, Luxury Designer Furnished).',
                placeholder: 'e.g. Italian Marble Furnished or Warm Shell',
                tip: '💡 This specification tier appears in Property inventory, Buyer Inquiries, and WhatsApp pitch templates.'
              },
              {
                key: 'constructionStages',
                title: 'Construction & Possession Stages',
                icon: '🏗️',
                group: 'property',
                groupLabel: 'Property Attribute',
                usageBadges: ['Possession Status', 'Matching Engine'],
                description: 'Project delivery timelines and readiness milestones (Ready to Move, Under Construction, Newly Launched, Pre-Launch, etc.).',
                placeholder: 'e.g. Possession in 6 Months or OC Received',
                tip: '💡 This stage appears in Property listings, Inquiries, and the Kundali automated matching engine.'
              },
              {
                key: 'vastuOptions',
                title: 'Vastu & Compass Orientations',
                icon: '🧭',
                group: 'property',
                groupLabel: 'Property Attribute',
                usageBadges: ['Vastu Facing', 'Buyer Inquiries Matching'],
                description: 'Compass facings and traditional Vastu compliance orientations (East Facing, North Facing, North-East / Ishanya, etc.).',
                placeholder: 'e.g. North-East / Ishanya or East Facing',
                tip: '💡 This orientation appears in Property listings, Inquiries, and matching filters.'
              },
              {
                key: 'parkingOptions',
                title: 'Parking Allocations',
                icon: '🚗',
                group: 'property',
                groupLabel: 'Property Attribute',
                usageBadges: ['Property Details', 'Inquiry Parking Needs'],
                description: 'Vehicle parking allocations and spot arrangements (1 Covered Car Park, 2 Covered, Stilt, Open, etc.).',
                placeholder: 'e.g. 2 Covered Car Parks or Stilt',
                tip: '💡 This parking allocation choice appears in Property inventory and Buyer Inquiries requirements.'
              },

              // 3. Lead Sourcing & Inbound Channels
              {
                key: 'leadSources',
                title: 'Lead Acquisition Sources',
                icon: '🌐',
                group: 'sourcing',
                groupLabel: 'Lead Sourcing',
                usageBadges: ['Buyer Inquiries', 'Marketing Analytics'],
                description: 'Channels where inquiries originate (Direct, Website, Referral, Listing Websites).',
                placeholder: 'e.g. Listing Websites or Direct',
                tip: '💡 This acquisition source appears in Buyer Inquiries, client onboarding, and marketing reports.'
              }
            ];

            const filteredSections = CONFIG_SECTIONS.filter(sec => {
              if (configSubTab !== 'all' && sec.group !== configSubTab) return false;
              if (configSearch) {
                const q = configSearch.toLowerCase();
                const matchesTitle = sec.title.toLowerCase().includes(q);
                const matchesDesc = sec.description.toLowerCase().includes(q);
                const matchesItems = ((configs as any)[sec.key] || []).some((item: string) => item.toLowerCase().includes(q));
                const matchesBadges = sec.usageBadges.some(b => b.toLowerCase().includes(q));
                return matchesTitle || matchesDesc || matchesItems || matchesBadges;
              }
              return true;
            });

            const statusCount = CONFIG_SECTIONS.filter(s => s.group === 'statuses').length;
            const propertyCount = CONFIG_SECTIONS.filter(s => s.group === 'property').length;
            const sourcingCount = CONFIG_SECTIONS.filter(s => s.group === 'sourcing').length;

            return (
              <div className={styles.formSection}>
                {/* Header & Quick Search Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                  <div>
                    <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                      <span>⚙️</span> Agency Configuration
                    </h2>
                    <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0', lineHeight: 1.5, maxWidth: 680 }}>
                      Manage operational statuses across all CRM areas, property taxonomies, and acquisition channels.
                      Changes update in real-time across property catalogs, inquiry pipelines, site visits, and deal tracking.
                    </p>
                  </div>

                  {/* Real-time search filter */}
                  <SearchBar
                    value={configSearch}
                    onChange={setConfigSearch}
                    placeholder="Quick search configs..."
                    maxWidth={320}
                  />
                </div>

                {/* Organized Category Tabs / Switcher */}
                <div className="responsive-pills-scroll" style={{
                  alignItems: 'center',
                  padding: '6px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 12,
                  marginBottom: 20
                }}>
                  {[
                    { id: 'statuses', label: 'Statuses & Pipelines', icon: '🎯', count: statusCount },
                    { id: 'property', label: 'Property Attributes', icon: '🏡', count: propertyCount },
                    { id: 'sourcing', label: 'Lead Sourcing', icon: '🌐', count: sourcingCount },
                    { id: 'all', label: 'All Configurations', icon: '📋', count: CONFIG_SECTIONS.length }
                  ].map(tab => {
                    const isActive = configSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setConfigSubTab(tab.id as any)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          borderRadius: 9,
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#0f172a' : '#64748b',
                          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                          border: 'none',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 10,
                          backgroundColor: isActive ? '#f1f5f9' : '#e2e8f0',
                          color: isActive ? '#0f172a' : '#64748b'
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Configuration Sections List */}
                {filteredSections.length === 0 ? (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: 14,
                    border: '1px dashed #cbd5e1',
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>No configurations matched &quot;{configSearch}&quot;</div>
                    <div style={{ fontSize: 13.5, marginTop: 4 }}>Try searching for &quot;status&quot;, &quot;bhk&quot;, &quot;stage&quot;, or clear the search query.</div>
                    <button
                      type="button"
                      onClick={() => { setConfigSearch(''); setConfigSubTab('all'); }}
                      style={{
                        marginTop: 16,
                        padding: '8px 16px',
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Show All Configurations
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {filteredSections.map(sec => {
                      const items: string[] = (configs as any)[sec.key] || [];
                      return (
                        <div
                          key={sec.key}
                          className={styles.configItemCard}
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 14,
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'border-color 0.15s ease'
                          }}
                        >
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <div style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 18,
                                  flexShrink: 0
                                }}>
                                  {sec.icon}
                                </div>
                                <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                                  {sec.title}
                                </h3>
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  backgroundColor: '#ecfdf5',
                                  color: '#065f46',
                                  border: '1px solid #a7f3d0'
                                }}>
                                  {items.length} {items.length === 1 ? 'Option' : 'Options'}
                                </span>
                                {sec.usageBadges.map(badge => (
                                  <span
                                    key={badge}
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: 600,
                                      padding: '2px 7px',
                                      borderRadius: 6,
                                      backgroundColor: '#f1f5f9',
                                      color: '#475569',
                                      border: '1px solid #e2e8f0'
                                    }}
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                              <p style={{ fontSize: 12.5, color: '#64748b', margin: '6px 0 0', lineHeight: 1.45 }}>
                                {sec.description}
                              </p>
                            </div>

                            {/* Actions: Reset Defaults & Add Option */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => handleResetConfigDefaults(sec.key)}
                                title={`Reset ${sec.title} to standard defaults`}
                                style={{
                                  padding: '6px 11px',
                                  borderRadius: 8,
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#fff',
                                  color: '#64748b',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                              >
                                ↺ Reset Defaults
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfigModal({ mode: 'add', type: sec.key, label: getCategoryLabel(sec.key) });
                                  setConfigInputValue('');
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  border: 'none',
                                  backgroundColor: '#0f172a',
                                  color: '#fff',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5
                                }}
                              >
                                <span>+</span> Add {getCategoryLabel(sec.key)}
                              </button>
                            </div>
                          </div>

                          {/* Options Container Chips */}
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            padding: '12px 14px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                            minHeight: 46
                          }}>
                            {items.length === 0 ? (
                              <div style={{ fontSize: 12.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>No options configured yet.</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfigModal({ mode: 'add', type: sec.key, label: getCategoryLabel(sec.key) });
                                    setConfigInputValue('');
                                    setSelectedStatusColor('emerald');
                                  }}
                                  style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12.5 }}
                                >
                                  + Click to add
                                </button>
                              </div>
                            ) : (
                              items.map(item => {
                                const isStatusSec = isStatusCategory(sec.key);
                                const itemColorStyle = isStatusSec ? getStatusColorStyle(item, configs.statusColors[item]) : null;
                                const isColorPickerOpen = quickColorPicker?.status === item && quickColorPicker?.type === sec.key;

                                return (
                                  <div
                                    key={item}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      padding: isStatusSec ? '4px 8px 4px 10px' : '5px 8px 5px 12px',
                                      borderRadius: isStatusSec ? 20 : 8,
                                      backgroundColor: isStatusSec ? itemColorStyle!.bg : '#ffffff',
                                      border: `1px solid ${isStatusSec ? itemColorStyle!.border : '#cbd5e1'}`,
                                      fontSize: 12.5,
                                      fontWeight: 600,
                                      color: isStatusSec ? itemColorStyle!.text : '#0f172a',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                      transition: 'all 0.15s ease',
                                      position: 'relative'
                                    }}
                                  >
                                    {isStatusSec && (
                                      <span
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          backgroundColor: itemColorStyle!.dot,
                                          flexShrink: 0
                                        }}
                                      />
                                    )}
                                    <span>{item}</span>

                                    {/* Action items */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      borderLeft: `1px solid ${isStatusSec ? itemColorStyle!.border : '#e2e8f0'}`,
                                      paddingLeft: 6,
                                      marginLeft: 2
                                    }}>
                                      {/* Quick Color Picker Button for Statuses */}
                                      {isStatusSec && (
                                        <div style={{ position: 'relative' }}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setQuickColorPicker(isColorPickerOpen ? null : { status: item, type: sec.key });
                                            }}
                                            title={`Change color for "${item}"`}
                                            style={{
                                              border: 'none',
                                              background: 'none',
                                              cursor: 'pointer',
                                              padding: '2px 3px',
                                              borderRadius: 4,
                                              fontSize: 11,
                                              display: 'flex',
                                              alignItems: 'center',
                                              opacity: 0.85
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                                          >
                                            🎨
                                          </button>

                                          {/* Quick Color Popover */}
                                          {isColorPickerOpen && (
                                            <div
                                              style={{
                                                position: 'absolute',
                                                bottom: 'calc(100% + 8px)',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                backgroundColor: '#ffffff',
                                                borderRadius: 12,
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.22), 0 0 1px 1px rgba(0,0,0,0.06)',
                                                border: '1px solid #e2e8f0',
                                                padding: '10px 12px',
                                                zIndex: 9999,
                                                width: 210,
                                                boxSizing: 'border-box'
                                              }}
                                              onClick={e => e.stopPropagation()}
                                            >
                                              <div style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: '#334155',
                                                marginBottom: 8,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                              }}>
                                                <span>Pick Status Color:</span>
                                                <button
                                                  type="button"
                                                  onClick={() => setQuickColorPicker(null)}
                                                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                                                {STATUS_COLOR_PALETTES.map(pal => {
                                                  const isSel = (configs.statusColors[item] || itemColorStyle?.paletteId) === pal.id;
                                                  return (
                                                    <button
                                                      key={pal.id}
                                                      type="button"
                                                      onClick={() => handleQuickStatusColorChange(item, pal.id)}
                                                      title={pal.name}
                                                      style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 8,
                                                        backgroundColor: pal.bg,
                                                        border: isSel ? `2px solid ${pal.text}` : `1px solid ${pal.border}`,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        transition: 'transform 0.1s ease',
                                                        transform: isSel ? 'scale(1.12)' : 'scale(1)'
                                                      }}
                                                    >
                                                      <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: pal.dot }} />
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfigModal({ mode: 'edit', type: sec.key, label: getCategoryLabel(sec.key), originalValue: item });
                                          setConfigInputValue(item);
                                          if (isStatusSec) {
                                            setSelectedStatusColor(configs.statusColors[item] || itemColorStyle?.paletteId || 'emerald');
                                          }
                                        }}
                                        title={`Edit "${item}"`}
                                        style={{ border: 'none', background: 'none', color: isStatusSec ? itemColorStyle!.text : '#64748b', cursor: 'pointer', padding: '2px 3px', borderRadius: 4, fontSize: 11 }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#2563eb')}
                                        onMouseLeave={e => (e.currentTarget.style.color = isStatusSec ? itemColorStyle!.text : '#64748b')}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfigItemToDelete({ type: sec.key, label: getCategoryLabel(sec.key), item });
                                        }}
                                        title={`Delete "${item}"`}
                                        style={{ border: 'none', background: 'none', color: isStatusSec ? itemColorStyle!.text : '#94a3b8', cursor: 'pointer', padding: '2px 3px', borderRadius: 4, fontSize: 11, opacity: 0.7 }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = '1'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = isStatusSec ? itemColorStyle!.text : '#94a3b8'; e.currentTarget.style.opacity = '0.7'; }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Plan Upgrade Confirmation Modal */}
      <ConfirmModal
        isOpen={!!planToUpgrade}
        title="Confirm Plan Change"
        variant="primary"
        confirmText={`Switch to ${planToUpgrade}`}
        message={
          <>
            Are you sure you want to change your agency subscription to the <strong>{planToUpgrade}</strong> plan? 
            Your monthly billing and limits will be updated immediately.
          </>
        }
        isLoading={saving}
        onConfirm={handleConfirmUpgradePlan}
        onCancel={() => setPlanToUpgrade(null)}
      />

      {/* Custom Invite User Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setShowInviteModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#0f172a' }}>Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleInviteSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={inviteForm.name}
                  onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Role Permission</label>
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  {['OWNER', 'SUPER_ADMIN'].includes((currentUser?.role || '').toUpperCase()) && (
                    <option value="MANAGER">Manager (Full Agency Access)</option>
                  )}
                  <option value="ADMIN">Admin (Billing & Operations Access)</option>
                  <option value="AGENT">Agent (Standard Broker Access)</option>
                  <option value="READONLY">Read-Only Agent</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Inviting...' : 'Send Invitation'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setShowPasswordModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#0f172a' }}>Update Password</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new strong password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Add / Edit Config Option Modal */}
      {configModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setConfigModal(null)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{configModal.mode === 'add' ? '✨' : '✏️'}</span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {configModal.mode === 'add' ? `Add ${configModal.label}` : `Edit ${configModal.label}`}
                </h3>
              </div>
              <button onClick={() => setConfigModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleConfigSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {configModal.label} Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={
                    configModal.type === 'propertyStatuses'
                      ? 'e.g. Under Contract or Price Reduced'
                      : configModal.type === 'leadStatuses'
                      ? 'e.g. In Review or Loan Approved'
                      : configModal.type === 'dealStages'
                      ? 'e.g. Token Advance or KYC Verified'
                      : configModal.type === 'siteVisitStatuses'
                      ? 'e.g. Virtual Tour or Feedback Pending'
                      : configModal.type === 'taskStatuses'
                      ? 'e.g. Awaiting Documents or Blocked'
                      : configModal.type === 'clientStatuses'
                      ? 'e.g. VIP Dormant or Renewal Due'
                      : configModal.type === 'invoiceStatuses'
                      ? 'e.g. Under Dispute or Escrow Hold'
                      : configModal.type === 'paymentStatuses'
                      ? 'e.g. Cheque Clearing or On Hold'
                      : configModal.type === 'bhkOptions'
                      ? 'e.g. 3.5 BHK, Studio, or 6 BHK'
                      : configModal.type === 'propertyTypes'
                      ? 'e.g. Penthouse Suite or Farmhouse'
                      : configModal.type === 'leadSources'
                      ? 'e.g. Listing Websites or Direct'
                      : configModal.type === 'propertySpecs'
                      ? 'e.g. Italian Marble Furnished or Warm Shell'
                      : configModal.type === 'constructionStages'
                      ? 'e.g. Possession in 6 Months or OC Received'
                      : configModal.type === 'vastuOptions'
                      ? 'e.g. North-East / Ishanya or East Facing'
                      : 'e.g. 2 Covered Car Parks or Stilt'
                  }
                  value={configInputValue}
                  onChange={e => setConfigInputValue(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: 1.45 }}>
                  {configModal.type === 'propertyStatuses'
                    ? '💡 This status immediately appears in property catalog filters, inventory editing drawers, and public listing previews.'
                    : configModal.type === 'leadStatuses'
                    ? '💡 This stage appears in the Inquiry Status dropdown, client follow-up tracking, and pipeline conversions.'
                    : configModal.type === 'dealStages'
                    ? '💡 This pipeline column appears on your Deals Kanban board, stage transition menus, and brokerage forecasting.'
                    : configModal.type === 'siteVisitStatuses'
                    ? '💡 This status appears in site visit booking drawers, calendar timeline nodes, and quick status selectors.'
                    : configModal.type === 'taskStatuses'
                    ? '💡 This status appears across agent task management lists and follow-up checklists.'
                    : configModal.type === 'clientStatuses'
                    ? '💡 This status appears in client detail views, contact filters, and relationship manager dashboards.'
                    : configModal.type === 'invoiceStatuses'
                    ? '💡 This status appears in the Invoices table, invoice edit modal, live status dropdown, and printable tax invoice.'
                    : configModal.type === 'paymentStatuses'
                    ? '💡 This status appears in the Payments table, payment filters, and receipt clearance records.'
                    : configModal.type === 'bhkOptions'
                    ? '💡 This option will immediately appear in both Property listings (BHK) and Buyer Inquiries (BHK Needed).'
                    : configModal.type === 'propertyTypes'
                    ? '💡 This asset class will immediately appear in Property listings (Property Type) and Buyer Inquiries (Property Type Needed).'
                    : configModal.type === 'leadSources'
                    ? '💡 This acquisition source will immediately appear in Buyer Inquiries (Lead Source), client onboarding, and marketing reports.'
                    : configModal.type === 'propertySpecs'
                    ? '💡 This specification tier will immediately appear in Property inventory (Furnishing), Buyer Inquiries, and WhatsApp pitch templates.'
                    : configModal.type === 'constructionStages'
                    ? '💡 This stage will immediately appear in Property listings (Possession Status), Inquiries, and the Kundali automated matching engine.'
                    : configModal.type === 'vastuOptions'
                    ? '💡 This orientation will immediately appear in Property listings (Vastu Facing), Inquiries (Vastu Preference), and matching filters.'
                    : '💡 This parking allocation choice will immediately appear in Property inventory and Buyer Inquiries requirements.'
                  }
                </div>
              </div>

              {/* Status Color Badge & Dot Selector */}
              {isStatusCategory(configModal.type) && (() => {
                const previewStyle = getStatusColorStyle(configInputValue.trim() || configModal.label, selectedStatusColor);
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0 }}>
                        Status Color Badge &amp; Dot
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Live Preview:</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            backgroundColor: previewStyle.bg,
                            color: previewStyle.text,
                            border: `1px solid ${previewStyle.border}`
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: previewStyle.dot }} />
                          {configInputValue.trim() || configModal.label}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 8,
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0'
                    }}>
                      {STATUS_COLOR_PALETTES.map(pal => {
                        const isSelected = selectedStatusColor === pal.id;
                        return (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={() => setSelectedStatusColor(pal.id)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 4,
                              padding: '8px 4px',
                              borderRadius: 8,
                              border: isSelected ? `2px solid ${pal.text}` : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? pal.bg : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <span style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              backgroundColor: pal.dot,
                              border: `2px solid ${pal.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 800
                            }}>
                              {isSelected ? '✓' : ''}
                            </span>
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? pal.text : '#475569',
                              textAlign: 'center',
                              lineHeight: 1.1
                            }}>
                              {pal.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setConfigModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">
                  {configModal.mode === 'add' ? 'Add Option' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Item Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!configItemToDelete}
        title={`Delete ${configItemToDelete?.label || 'Option'}`}
        variant="danger"
        confirmText="Delete Option"
        message={
          <>
            Are you sure you want to delete <strong>&quot;{configItemToDelete?.item}&quot;</strong> from your agency&apos;s {configItemToDelete?.label}s?
            Existing saved listings and inquiries with this value will retain their information, but it will no longer appear as a selectable choice for new entries.
          </>
        }
        isLoading={saving}
        onConfirm={handleConfirmDeleteConfigItem}
        onCancel={() => setConfigItemToDelete(null)}
      />

      {/* User Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Remove Team Member"
        variant="danger"
        confirmText="Remove Member"
        message={
          <>
            Are you sure you want to remove <strong>{userToDelete?.name}</strong> from your agency? 
            They will immediately lose access to all client records, property inventory, and active deals.
          </>
        }
        isLoading={saving}
        onConfirm={handleConfirmRemoveUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Invited User Credentials Display Modal */}
      {invitedUserResult && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setInvitedUserResult(null)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Invitation Created</h3>
              </div>
              <button onClick={() => setInvitedUserResult(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px' }}>
                <strong>{invitedUserResult.name}</strong> has been added as a <strong>{invitedUserResult.role}</strong>. Share the temporary credentials below:
              </p>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Login Email:</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{invitedUserResult.email}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Temporary Password:</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>{invitedUserResult.password}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => {
                  navigator.clipboard.writeText(`AgentLadders Login:\nEmail: ${invitedUserResult.email}\nPassword: ${invitedUserResult.password}\nURL: ${window.location.origin}/login`);
                  showToast('success', 'Credentials copied to clipboard!', 'Copied');
                }}>
                  📋 Copy Details
                </Button>
                <Button variant="primary" type="button" onClick={() => setInvitedUserResult(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gmail Two-Factor Authentication Setup Modal */}
      {showTwoFactorModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setShowTwoFactorModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Verify Your Gmail Address</h3>
              </div>
              <button onClick={() => setShowTwoFactorModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleEnable2FA} style={{ padding: '24px' }}>
              
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 2 }}>
                  Verification Code Dispatched
                </div>
                <div style={{ fontSize: 12.5, color: '#1d4ed8', lineHeight: 1.45 }}>
                  We sent a 6-digit verification code to <strong>{currentUser?.email}</strong>. Enter it below to activate Two-Factor Authentication.
                </div>
              </div>

              {/* 6 Digit Code Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 582019"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '20px', textAlign: 'center', letterSpacing: '8px', fontWeight: 800, boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>Expires in 10 minutes</span>
                  <button
                    type="button"
                    onClick={handleResendSettingsOtp}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    ↺ Resend Code
                  </button>
                </div>
              </div>

              {/* Emergency Backup Codes */}
              <div style={{ marginBottom: '20px', backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '12px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#854d0e', textTransform: 'uppercase' }}>
                    Emergency Backup Codes
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodes.join('\n'));
                      showToast('success', 'Backup codes copied!', 'Copied');
                    }}
                    style={{ background: 'none', border: 'none', color: '#854d0e', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Copy All
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', fontSize: '11.5px', fontFamily: 'monospace', color: '#713f12' }}>
                  {backupCodes.map((code, idx) => (
                    <span key={idx}>{code}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowTwoFactorModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isVerifying2FA}>
                  {isVerifying2FA ? 'Verifying...' : 'Verify & Activate 2FA'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      <ConfirmModal
        isOpen={showDisable2FAModal}
        title="Disable Two-Factor Authentication"
        variant="danger"
        confirmText="Disable 2FA"
        message="Are you sure you want to disable Two-Factor Authentication? Your account will no longer require a secondary code upon signing in."
        isLoading={saving}
        onConfirm={handleDisable2FA}
        onCancel={() => setShowDisable2FAModal(false)}
      />

      {/* View Backup Codes Modal */}
      {showBackupCodesModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setShowBackupCodesModal(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>2FA Recovery Codes</h3>
              <button onClick={() => setShowBackupCodesModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                Store these single-use recovery codes in a safe place. You can use them to log in if you lose access to your authenticator app.
              </p>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13.5px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                  {backupCodes.map((code, idx) => (
                    <span key={idx}>{code}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  showToast('success', 'Backup recovery codes copied!', 'Copied');
                }}>
                  📋 Copy All
                </Button>
                <Button variant="primary" type="button" onClick={() => setShowBackupCodesModal(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
