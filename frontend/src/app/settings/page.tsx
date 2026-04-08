'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingTab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const TABS: SettingTab[] = [
  { id: 'account', label: 'Account Center', icon: '👤', description: 'Personal info & identifiers' },
  { id: 'security', label: 'Login & Security', icon: '🛡️', description: 'Password & login history' },
  { id: 'privacy', label: 'Privacy & Data', icon: '🔒', description: 'Profile visibility & sharing' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Alerts & communications' }
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data States
  const [accountForm, setAccountForm] = useState({ handle: '', email: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [privacy, setPrivacy] = useState({ is_private: false });
  const [activity, setActivity] = useState<any[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, activityRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/users/profile/me`),
          fetchWithAuth(`${API_URL}/api/users/activity`)
        ]);

        if (profileRes.status === 401) { router.push('/signin'); return; }
        
        const profileData = await profileRes.json();
        const activityData = await activityRes.json();

        if (profileData.success) {
          setAccountForm({
            handle: profileData.user.handle || '',
            email: profileData.user.email || ''
          });
          setPrivacy({ is_private: profileData.user.is_private || false });
        }
        
        if (activityData.success) {
          setActivity(activityData.activity);
        }
      } catch (err) {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // Handlers
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/users/account`, {
        method: 'PATCH',
        body: JSON.stringify(accountForm)
      });
      const data = await res.json();
      if (data.success) showToast('Account updated', 'success');
      else showToast(data.error || 'Update failed', 'error');
    } catch { showToast('Connection error', 'error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return showToast('Passwords do not match', 'error');
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/auth/change-password`, {
        method: 'PATCH',
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password changed', 'success');
        setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else showToast(data.error || 'Failed to change password', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setSaving(false); }
  };

  const handleTogglePrivacy = async (val: boolean) => {
    try {
      setPrivacy({ is_private: val });
      await fetchWithAuth(`${API_URL}/api/users/privacy`, {
        method: 'PATCH',
        body: JSON.stringify({ is_private: val })
      });
      showToast('Privacy updated', 'success');
    } catch { showToast('Failed to update privacy', 'error'); }
  };

  if (loading) return <div className="loading-container"><Navbar /><div className="loader" /></div>;

  return (
    <div className="settings-page">
      <Navbar />
      <style>{`
        .settings-page { min-height: 100vh; background: #08080a; color: #f5f5f7; }
        .settings-layout { display: flex; max-width: 1200px; margin: 40px auto; padding: 0 24px; gap: 40px; }
        
        /* Sidebar */
        .settings-sidebar { width: 280px; flex-shrink: 0; }
        .sidebar-header { margin-bottom: 32px; }
        .sidebar-title { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .nav-item { 
          display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
          border-radius: 12px; cursor: pointer; transition: all 0.2s;
          border: 1px solid transparent;
        }
        .nav-item:hover { background: rgba(255,255,255,0.03); }
        .nav-item.active { background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); color: #6366f1; }
        .nav-icon { font-size: 18px; }
        .nav-label { font-weight: 600; font-size: 14px; }

        /* Main Content */
        .settings-content { flex-grow: 1; max-width: 700px; }
        .section-header { margin-bottom: 32px; }
        .section-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .section-desc { color: #86868b; font-size: 14px; }

        .form-card { 
          background: #0e0e11; border: 1px solid #1c1c21; border-radius: 24px; 
          padding: 32px; margin-bottom: 24px; height: fit-content;
        }
        .input-group { margin-bottom: 24px; }
        .input-label { display: block; font-size: 12px; font-weight: 700; color: #86868b; margin-bottom: 8px; text-transform: uppercase; }
        .modern-input { 
          width: 100%; background: #1a1a1e; border: 1px solid #2c2c31; border-radius: 14px; 
          padding: 14px 18px; color: #fff; font-size: 15px; outline: none; transition: all 0.2s;
        }
        .modern-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        
        .btn-modern { 
          background: #6366f1; color: #fff; border: none; padding: 14px 28px; 
          border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          width: fit-content; align-self: flex-end;
        }
        .btn-modern:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); }
        .btn-modern:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Activity Row */
        .activity-item { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 16px 0; border-bottom: 1px solid #1c1c21;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-meta { display: flex; flex-direction: column; gap: 2px; }
        .activity-device { font-weight: 600; font-size: 14px; }
        .activity-loc { color: #86868b; font-size: 12px; }
        .activity-time { font-size: 12px; color: #6366f1; font-weight: 500; }

        /* Privacy Toggle */
        .toggle-row { display: flex; align-items: center; justify-content: space-between; }
        .toggle-switch { width: 44px; height: 24px; background: #2c2c31; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; }
        .toggle-switch.on { background: #6366f1; }
        .toggle-knob { width: 20px; height: 20px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
        .toggle-switch.on .toggle-knob { transform: translateX(20px); }

        .danger-section { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 20px; padding: 24px; }

        @media (max-width: 768px) {
          .settings-layout { flex-direction: column; padding-top: 20px; }
          .settings-sidebar { width: 100%; margin-bottom: 20px; }
          .sidebar-nav { flex-direction: row; overflow-x: auto; padding-bottom: 8px; }
          .nav-item { white-space: nowrap; flex-shrink: 0; }
        }
      `}</style>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Settings</h1>
          </div>
          <nav className="sidebar-nav">
            {TABS.map(tab => (
              <div 
                key={tab.id} 
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <main className="settings-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="section-header">
                <h2 className="section-title">{TABS.find(t => t.id === activeTab)?.label}</h2>
                <p className="section-desc">{TABS.find(t => t.id === activeTab)?.description}</p>
              </div>

              {activeTab === 'account' && (
                <div className="form-card">
                  <form onSubmit={handleUpdateAccount}>
                    <div className="input-group">
                      <label className="input-label">Public Handle</label>
                      <input 
                        className="modern-input" 
                        value={accountForm.handle}
                        onChange={e => setAccountForm({ ...accountForm, handle: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input 
                        className="modern-input" 
                        type="email"
                        value={accountForm.email}
                        onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <button type="submit" disabled={saving} className="btn-modern">
                      {saving ? 'Saving...' : 'Update Details'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <>
                  <div className="form-card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
                    <form onSubmit={handleChangePassword}>
                      <div className="input-group">
                        <label className="input-label">Current Password</label>
                        <input 
                          className="modern-input" 
                          type="password"
                          value={pwForm.oldPassword}
                          onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">New Password</label>
                        <input 
                          className="modern-input" 
                          type="password"
                          value={pwForm.newPassword}
                          onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Confirm New Password</label>
                        <input 
                          className="modern-input" 
                          type="password"
                          value={pwForm.confirmPassword}
                          onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                        />
                      </div>
                      <button type="submit" disabled={saving} className="btn-modern">
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="form-card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Where You're Logged In</h3>
                    <div className="activity-list">
                      {activity.map((item, idx) => (
                        <div key={item.id || idx} className="activity-item">
                          <div className="activity-meta">
                            <div className="activity-device">{item.device}</div>
                            <div className="activity-loc">{item.location} • {item.ip_address}</div>
                          </div>
                          <div className="activity-time">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'privacy' && (
                <div className="form-card">
                  <div className="toggle-row">
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Private Profile</h3>
                      <p style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>Only verified companies can see your full stats and history.</p>
                    </div>
                    <div 
                      className={`toggle-switch ${privacy.is_private ? 'on' : ''}`}
                      onClick={() => handleTogglePrivacy(!privacy.is_private)}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </div>

                  <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #1c1c21' }} />
                  
                  <div className="danger-section">
                    <h4 style={{ color: '#ef4444', margin: '0 0 8px' }}>Danger Zone</h4>
                    <p style={{ fontSize: 13, color: '#86868b', margin: '0 0 16px' }}>Permanently delete your account and all associated data.</p>
                    <button 
                      className="btn-modern" 
                      style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                      onClick={() => {
                        if (confirm('Delete everything? This is final.')) {
                          fetchWithAuth(`${API_URL}/api/users/account`, { method: 'DELETE' }).then(() => {
                            localStorage.removeItem('token');
                            router.push('/');
                          });
                        }
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="form-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>📡</span>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Notification Management</h3>
                  <p style={{ color: '#86868b', fontSize: 14 }}>Coming soon. You will be able to customize your email and push alerts here.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {toast && (
        <div style={{ 
          position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '14px 24px', borderRadius: 14,
          fontWeight: 700, fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
