'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  blurReveal, 
  fadeInUp,
  springSoft,
  hoverScale,
  tapScale
} from '@/lib/animations';

interface ActivityItem {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  created_at: string;
}

interface SettingTab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const TABS: SettingTab[] = [
  { id: 'account', label: 'My Identity', icon: '👤', description: 'Your professional handle and contact point.' },
  { id: 'security', label: 'Verification', icon: '🛡️', description: 'Manage login access and security protocols.' },
  { id: 'privacy', label: 'Stealth Mode', icon: '🔒', description: 'Control how you appear in the collective.' },
  { id: 'notifications', label: 'Alert Center', icon: '🔔', description: 'disclosure updates and system intel.' }
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
  const [activity, setActivity] = useState<ActivityItem[]>([]);

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
        const activityResData = await activityRes.json();

        if (profileData.success) {
          setAccountForm({
            handle: profileData.user.handle || '',
            email: profileData.user.email || ''
          });
          setPrivacy({ is_private: profileData.user.is_private || false });
        }
        
        if (activityResData.success) {
          setActivity(activityResData.activity || []);
        }
      } catch {
        showToast('System synchronization failed', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/users/account`, {
        method: 'PATCH',
        body: JSON.stringify(accountForm)
      });
      const data = await res.json();
      if (data.success) showToast('Identity updated successfully', 'success');
      else showToast(data.error || 'Identity update rejected', 'error');
    } catch { showToast('Transmission failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return showToast('Tokens do not match', 'error');
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/auth/change-password`, {
        method: 'PATCH',
        body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Security verification updated', 'success');
        setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else showToast(data.error || 'Security update failed', 'error');
    } catch { showToast('Network obstruction', 'error'); }
    finally { setSaving(false); }
  };

  const handleTogglePrivacy = async (val: boolean) => {
    try {
      setPrivacy({ is_private: val });
      await fetchWithAuth(`${API_URL}/api/users/privacy`, {
        method: 'PATCH',
        body: JSON.stringify({ is_private: val })
      });
      showToast('Visibility state updated', 'success');
    } catch { showToast('Failed to toggle stealth state', 'error'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white/90 selection:bg-indigo-500/30 bg-bg">
      <Navbar />
      
      {/* Background Aurora */}
      <div className="aurora-bg">
        <div className="aurora-blob animate-breathing opacity-40 blur-3xl shadow-[0_0_100px_rgba(157,80,187,0.2)]" style={{ background: '#9d50bb', top: '-10%', left: '-10%' }} />
        <div className="aurora-blob animate-breathing opacity-30 delay-[-4s] blur-2xl font-black italic" style={{ background: '#c084fc', bottom: '-10%', right: '-10%' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-40 pb-20">
        <motion.div 
          variants={fadeInUp(0.05)}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-indigo-500" />
            <p className="subtle-mono text-indigo-400">Settings / Account Center</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">
            Manage <span className="text-white/20">Identity.</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
          
          {/* Sidebar Navigation */}
          <motion.aside 
            variants={fadeInUp(0.1)}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-40 glass-panel p-2 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="bg-white/1 rounded-[38px] p-4 flex lg:flex-col gap-2 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-5 px-6 py-5 rounded-3xl transition-all duration-500 text-left whitespace-nowrap relative group
                    ${activeTab === tab.id 
                      ? 'bg-white text-black shadow-2xl scale-[1.02]' 
                      : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                    }
                  `}
                >
                  <span className={`text-xl transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {tab.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-black text-[13px] uppercase tracking-tighter italic leading-none">{tab.label}</span>
                    <span className={`text-[9px] font-medium tracking-tight mt-1 opacity-40 hidden md:block max-w-[140px] truncate ${activeTab === tab.id ? 'text-black/60' : ''}`}>
                      {tab.description}
                    </span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div layoutId="active-tab" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black/20" />
                  )}
                </button>
              ))}
            </div>
          </motion.aside>

          {/* Settings Content Area */}
          <main className="min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20, filter: 'blur(20px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(20px)' }}
                transition={springSoft}
                className="space-y-12"
              >
                <div className="glass-panel p-1 border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-8xl font-black select-none uppercase tracking-tighter italic">Vanguard</div>
                  
                  <div className="bg-white/1 backdrop-blur-3xl p-10 md:p-16 rounded-[44px] border border-white/5 relative z-10">
                    <header className="mb-12">
                      <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase leading-none">
                         {TABS.find(t => t.id === activeTab)?.label}
                      </h2>
                      <p className="text-white/30 text-base font-medium italic">
                        {TABS.find(t => t.id === activeTab)?.description}
                      </p>
                    </header>

                    {activeTab === 'account' && (
                      <form onSubmit={handleUpdateAccount} className="space-y-10 max-w-2xl">
                        <div className="grid grid-cols-1 gap-10">
                          <div className="space-y-4">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest font-black">Professional Handle</label>
                            <input 
                              className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-3xl px-8 py-5 text-white font-black text-lg transition-all shadow-inner outline-none focus:border-white/20" 
                              value={accountForm.handle}
                              onChange={e => setAccountForm({ ...accountForm, handle: e.target.value })}
                              placeholder="@username"
                            />
                            <p className="text-white/10 text-[10px] ml-4 font-medium italic uppercase tracking-tight">Only lowercase alphanumeric characters allowed.</p>
                          </div>
                          <div className="space-y-4">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest font-black">Secure Email Address</label>
                            <input 
                              className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-3xl px-8 py-5 text-white font-medium text-lg transition-all shadow-inner outline-none focus:border-white/20" 
                              type="email"
                              value={accountForm.email}
                              onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                              placeholder="identity@vanguard.sh"
                            />
                          </div>
                        </div>
                        <div className="pt-8 flex justify-end">
                          <motion.button 
                            type="submit" 
                            disabled={saving} 
                            whileHover={hoverScale}
                            whileTap={tapScale}
                            className="px-12 py-5 bg-white text-black rounded-3xl font-black text-sm shadow-2xl hover:bg-white/90 transition-all disabled:opacity-50 uppercase tracking-widest italic"
                          >
                            {saving ? 'Transmitting...' : 'Update Identity'}
                          </motion.button>
                        </div>
                      </form>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-16 max-w-2xl">
                        <form onSubmit={handleChangePassword} className="space-y-10">
                          <div className="space-y-4">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest font-black">Current verification Token</label>
                            <input 
                              className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-3xl px-8 py-5 outline-none transition-all shadow-inner font-mono text-sm" 
                              type="password"
                              placeholder="••••••••••••"
                              value={pwForm.oldPassword}
                              onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest font-black">New Passcode</label>
                              <input 
                                className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-3xl px-8 py-5 outline-none transition-all shadow-inner font-mono text-sm" 
                                type="password"
                                placeholder="8+ characters"
                                value={pwForm.newPassword}
                                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest font-black">Verify New Passcode</label>
                              <input 
                                className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-3xl px-8 py-5 outline-none transition-all shadow-inner font-mono text-sm" 
                                type="password"
                                placeholder="Match new passcode"
                                value={pwForm.confirmPassword}
                                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <motion.button 
                              type="submit" 
                              disabled={saving}
                              whileHover={hoverScale}
                              whileTap={tapScale}
                              className="px-12 py-5 border border-white/5 bg-white/2 text-white/40 rounded-3xl font-black text-sm hover:text-white hover:bg-white/5 transition-all shadow-xl uppercase tracking-widest italic"
                            >
                              Update Security
                            </motion.button>
                          </div>
                        </form>

                        <div className="pt-16 border-t border-white/5">
                          <h3 className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.3em] mb-10 ml-2 font-black italic">Recent Session Logs</h3>
                          <div className="space-y-3">
                            {activity.length === 0 ? (
                              <div className="py-20 text-center text-white/5 text-sm italic font-medium uppercase tracking-[0.2em]">Zero Active Sessions Detected.</div>
                            ) : (
                              activity.map((item, idx) => (
                                <div key={item.id || idx} className="flex items-center justify-between p-8 rounded-[32px] bg-white/1 border border-white/5 hover:border-white/10 transition-all duration-500 group">
                                  <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💻</div>
                                    <div>
                                      <div className="font-black text-[15px] uppercase italic tracking-tight">{item.device || 'Unidentified Node'}</div>
                                      <div className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">
                                        {item.location || 'Dark Sector'} • <span className="text-white/40">{item.ip_address}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-[9px] font-black text-white/20 bg-white/5 border border-white/5 px-6 py-2 rounded-full uppercase tracking-[0.2em] italic">
                                    Logged {new Date(item.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'privacy' && (
                      <div className="space-y-16 max-w-3xl">
                        <div className="flex items-center justify-between gap-12 p-8 rounded-[40px] bg-white/1 border border-white/5 hover:bg-white/2 transition-all duration-500 shadow-xl">
                          <div>
                            <h3 className="text-2xl font-black italic mb-2 uppercase tracking-tight">Stealth Mode</h3>
                            <p className="text-white/30 text-sm font-medium leading-relaxed italic max-w-sm">Conceal your activity and reputation metrics from global rankings and public visibility.</p>
                          </div>
                          <div 
                            className={`w-20 h-10 rounded-full p-1.5 cursor-pointer transition-all duration-700 shadow-inner ${privacy.is_private ? 'bg-indigo-600' : 'bg-white/5'}`}
                            onClick={() => handleTogglePrivacy(!privacy.is_private)}
                          >
                            <motion.div 
                              className="w-7 h-7 rounded-full shadow-2xl bg-white"
                              animate={{ x: privacy.is_private ? 40 : 0 }}
                              transition={springSoft}
                            />
                          </div>
                        </div>

                        <div className="p-12 rounded-[48px] bg-rose-500/5 border border-rose-500/10 mt-16 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-10 opacity-5 text-6xl font-black italic uppercase select-none group-hover:opacity-10 transition-opacity">Danger</div>
                          <div className="relative z-10">
                            <h4 className="text-rose-500 font-black italic text-2xl mb-3 uppercase tracking-tighter">Decommission Identity</h4>
                            <p className="text-white/20 text-sm font-medium italic mb-10 max-w-lg leading-relaxed">Permanently closing your account will purge all encrypted reports, reputation credits, and identity metadata. This action is irreversible.</p>
                            <motion.button 
                              whileHover={{ x: 8, color: '#f43f5e' }}
                              className="text-rose-500/40 font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-4 italic"
                              onClick={() => {
                                if (confirm('Initiate account purge? This cannot be undone.')) {
                                  fetchWithAuth(`${API_URL}/api/users/account`, { method: 'DELETE' }).then(() => {
                                    localStorage.removeItem('token');
                                    router.push('/');
                                  });
                                }
                              }}
                            >
                              Purge Identity From Collective →
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'notifications' && (
                      <div className="py-40 flex flex-col items-center justify-center text-center">
                        <motion.div 
                          animate={{ 
                            y: [0, -15, 0],
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="text-9xl mb-12 grayscale opacity-10"
                        >
                          🔔
                        </motion.div>
                        <h3 className="text-3xl font-black italic mb-6 uppercase tracking-tighter">Notification Engine</h3>
                        <p className="text-white/20 text-base font-medium italic max-w-[340px] leading-relaxed">System alert protocols and push intelligence are currently being recalibrated for optimized delivery.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Modern Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className={`
              fixed bottom-12 right-12 z-100 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl glass-panel italic
              flex items-center gap-6 border-l-4
              ${toast.type === 'success' ? 'border-indigo-500 bg-indigo-500/5' : 'border-rose-500 bg-rose-500/5'}
            `}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
