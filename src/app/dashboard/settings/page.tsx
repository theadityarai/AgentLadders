'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import styles from './settings.module.css';

const tabs = [
  { key: 'agency', label: 'Agency Profile' },
  { key: 'users', label: 'Users & Roles' },
  { key: 'billing', label: 'Subscription & Billing' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
  { key: 'config', label: 'Configuration' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('agency');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [agencyData, setAgencyData] = useState({ name: '', country: '', currency: '', plan: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [configs, setConfigs] = useState({ propertyTypes: [] as string[], leadSources: [] as string[] });
  const [notifications, setNotifications] = useState<Record<string, {inApp: boolean; email: boolean}>>({});

  // Custom Modal States
  const [planToUpgrade, setPlanToUpgrade] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'MANAGER' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showConfigModal, setShowConfigModal] = useState<{ type: 'propertyTypes' | 'leadSources'; label: string } | null>(null);
  const [newConfigValue, setNewConfigValue] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    setToast({ id: Date.now().toString(), type, message, title });
  };

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.agency) {
        setAgencyData({ 
          name: data.agency.name, 
          country: data.agency.country, 
          currency: data.agency.currency,
          plan: data.agency.plan || 'Professional'
        });
        setConfigs({
          propertyTypes: data.agency.propertyTypes || [],
          leadSources: data.agency.leadSources || []
        });
        setNotifications(data.agency.notificationPrefs || {});
      }
      if (data.users) {
        setUsers(data.users);
      }
      setLoading(false);
    });
  }, []);

  const handleSaveAgency = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateAgency', agencyName: agencyData.name, country: agencyData.country, currency: agencyData.currency })
    });
    setSaving(false);
    showToast('success', 'Agency Profile changes saved successfully!', 'Profile Updated');
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
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', role: 'MANAGER' });
      showToast('success', 'User invited! Default temporary password: welcome123', 'Invitation Sent');
      // reload users
      fetch('/api/settings').then(res => res.json()).then(data => setUsers(data.users || []));
    } else {
      const err = await res.json();
      showToast('error', err.error || 'Failed to invite user', 'Error');
    }
    setSaving(false);
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

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConfigModal || !newConfigValue.trim()) return;
    const type = showConfigModal.type;
    const updated = { ...configs, [type]: [...configs[type], newConfigValue.trim()] };
    setConfigs(updated);
    setShowConfigModal(null);
    setNewConfigValue('');
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updated })
    });
    showToast('success', `Added new ${type === 'propertyTypes' ? 'Property Type' : 'Lead Source'}!`, 'Config Updated');
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
                      <select className={styles.input} defaultValue="America/New_York">
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Asia/Dubai</option>
                        <option>Asia/Kolkata</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <Button variant="primary" onClick={handleSaveAgency} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Users & Roles</h2>
              <div className={styles.userList}>
                {users.map((user) => (
                  <div key={user.id} className={styles.userRow}>
                    <div className={styles.userAvatar}>{user.name.substring(0, 2).toUpperCase()}</div>
                    <div className={styles.userInfo}>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <span className={styles.roleBadge}>{user.role}</span>
                  </div>
                ))}
              </div>
              <Button variant="primary" className={styles.mt4} onClick={() => setShowInviteModal(true)} disabled={saving}>
                + Invite User
              </Button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Subscription & Billing</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className={styles.planCard} style={{ borderColor: agencyData.plan === 'Starter' ? 'var(--primary-color)' : 'var(--border-color)' }}>
                  {agencyData.plan === 'Starter' && <div className={styles.planBadge}>Current Plan</div>}
                  <h3>Starter Broker</h3>
                  <p className={styles.planPrice}>₹1,999/mo</p>
                  <ul className={styles.planFeatures}>
                    <li>Up to 2 Real Estate Agents</li>
                    <li>500 Active Properties (RERA Carpet & Vastu)</li>
                    <li>Daily Habit Cockpit & Match Engine</li>
                    <li>WhatsApp Web Pitch Generator</li>
                  </ul>
                  {agencyData.plan !== 'Starter' && <Button variant="outline" onClick={() => setPlanToUpgrade('Starter')}>Downgrade to Starter</Button>}
                </div>
                
                <div className={styles.planCard} style={{ borderColor: agencyData.plan === 'Professional' ? 'var(--primary-color)' : 'var(--border-color)' }}>
                  {agencyData.plan === 'Professional' && <div className={styles.planBadge}>Current Plan</div>}
                  <h3>Agency Unlimited</h3>
                  <p className={styles.planPrice}>₹4,999/mo</p>
                  <ul className={styles.planFeatures}>
                    <li>Up to 15 Agency Team Members</li>
                    <li>Unlimited Indian Inventory & Inquiries</li>
                    <li>Advanced Kundali Match with Tolerance</li>
                    <li>Automated Site Visit WhatsApp Pins</li>
                    <li>Priority Dedicated Real Estate Support</li>
                  </ul>
                  {agencyData.plan !== 'Professional' && <Button variant="primary" onClick={() => setPlanToUpgrade('Professional')}>Upgrade to Pro</Button>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              {['New lead assigned', 'Task reminder', 'Site visit reminder', 'Invoice overdue'].map(label => {
                const prefs = notifications[label] || { inApp: false, email: false };
                return (
                  <div key={label} className={styles.notifRow}>
                    <span>{label}</span>
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
              <h2 className={styles.sectionTitle}>Security Settings</h2>
              <div className={styles.securityItem}>
                <div>
                  <strong>Two-Factor Authentication (MFA)</strong>
                  <p className={styles.mutedText}>Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" onClick={() => showToast('info', 'Two-Factor Authentication is active for enterprise accounts.', '2FA Enabled')}>
                  Configure 2FA
                </Button>
              </div>
              <div className={styles.securityItem}>
                <div>
                  <strong>Change Password</strong>
                  <p className={styles.mutedText}>Update your account password securely.</p>
                </div>
                <Button variant="ghost" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>System Configuration</h2>
              <div className={styles.configGrid}>
                
                <div className={styles.configCard}>
                  <div>
                    <strong>Property Types</strong>
                    <p className={styles.mutedText}>Current: {configs.propertyTypes.join(', ')}</p>
                  </div>
                  <span className={styles.configCount}>{configs.propertyTypes.length} types</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowConfigModal({ type: 'propertyTypes', label: 'Property Type' });
                    setNewConfigValue('');
                  }}>+ Add Type</Button>
                </div>

                <div className={styles.configCard}>
                  <div>
                    <strong>Lead Sources</strong>
                    <p className={styles.mutedText}>Current: {configs.leadSources.join(', ')}</p>
                  </div>
                  <span className={styles.configCount}>{configs.leadSources.length} sources</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowConfigModal({ type: 'leadSources', label: 'Lead Source' });
                    setNewConfigValue('');
                  }}>+ Add Source</Button>
                </div>

              </div>
            </div>
          )}
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
                  <option value="MANAGER">Manager (Full Agency Access)</option>
                  <option value="ADMIN">Admin (Settings & Billing Access)</option>
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

      {/* Custom Add Config Modal */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setShowConfigModal(null)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#0f172a' }}>Add {showConfigModal.label}</h3>
              <button onClick={() => setShowConfigModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleConfigSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>{showConfigModal.label} Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={`e.g. ${showConfigModal.type === 'propertyTypes' ? 'Penthouse Suite' : 'Billboard / Outdoor'}`}
                  value={newConfigValue}
                  onChange={e => setNewConfigValue(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowConfigModal(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Add Option</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
