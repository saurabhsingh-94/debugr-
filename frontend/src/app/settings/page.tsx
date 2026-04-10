'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth, API_URL, deleteCookie } from '@/lib/api';
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
  { id: 'account', label: 'My Profile', icon: '👤', description: 'Your professional handle and contact point.' },
  { id: 'security', label: 'Security', icon: '🛡️', description: 'Manage login access and passwords.' },
  { id: 'payout', label: 'Payout Methods', icon: '💰', description: 'Configure where you receive your bounties.' },
  { id: 'privacy', label: 'Privacy', icon: '🔒', description: 'Control how you appear on the platform.' },
  { id: 'notifications', label: 'Alert Center', icon: '🔔', description: 'Platform updates and report notifications.' }
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
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [payoutForm, setPayoutForm] = useState({
    type: 'bank_account',
    bank_account: '',
    ifsc: '',
    upi_id: '',
    name: ''
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, activityRes, payoutRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/users/profile/me`),
          fetchWithAuth(`${API_URL}/api/users/activity`),
          fetchWithAuth(`${API_URL}/api/payouts/method`)
        ]);

        if (profileRes.status === 401) { router.push('/signin'); return; }
        
        const profileData = await profileRes.json();
        const activityResData = await activityRes.json();
        const payoutData = await payoutRes.json();

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

        if (payoutData.success) {
            setPayoutMethods(payoutData.methods || []);
            if (payoutData.methods && payoutData.methods.length > 0) {
                const existing = payoutData.methods[0];
                setPayoutForm({
                    type: existing.type,
                    bank_account: '',
                    ifsc: '',
                    upi_id: '',
                    name: existing.masked_details?.name || ''
                });
            }
        }
      } catch {
        showToast('System synchronization failed', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const payload = {
            type: payoutForm.type,
            details: payoutForm.type === 'bank_account' 
                ? { account_number: payoutForm.bank_account, ifsc: payoutForm.ifsc, name: payoutForm.name }
                : { upi_id: payoutForm.upi_id, name: payoutForm.name }
        };

        const res = await fetchWithAuth(`${API_URL}/api/payouts/method`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success) {
            showToast('Payout preferences secured', 'success');
            // Refresh payout methods to show the masked update
            const payoutRes = await fetchWithAuth(`${API_URL}/api/payouts/method`);
            const updatedData = await payoutRes.json();
            if (updatedData.success) setPayoutMethods(updatedData.methods);
        } else {
            showToast(data.error || 'Payout configuration failed', 'error');
        }
    } catch {
        showToast('Secure transmission failed', 'error');
    } finally {
        setSaving(false);
    }
  };

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
    <div className="min-h-screen text-white/90 selection:bg-indigo-500/30 bg-[#080808]">
      <Navbar />
      
      {/* Background Noise Only */}


      <main className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 pb-20 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Aspect: Meta & Navigation */}
        <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-40">
          <motion.div 
            variants={fadeInUp(0.05)}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-indigo-500" />
              <p className="subtle-mono text-[9px] text-indigo-400 uppercase tracking-[0.3em] font-black">Control Panel</p>
            </div>
            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
              User <span className="text-white/20">Settings.</span>
            </h1>
            <p className="text-t2 text-lg font-medium leading-relaxed max-w-sm">
              Adjust your account preferences and security credentials.
            </p>
          </motion.div>

          <nav className="space-y-2 p-1 bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
            {TABS.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 text-left group
                  ${activeTab === tab.id 
                    ? 'bg-white text-black shadow-2xl' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="font-black text-[11px] uppercase tracking-widest italic">{tab.label}</span>
                  <span className={`text-[8px] font-bold tracking-tight mt-1 opacity-40 uppercase ${activeTab === tab.id ? 'text-black/60' : ''}`}>
                    {tab.id}
                  </span>
                </div>
                <span className={`text-lg transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Aspect: Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springSoft}
              className="glass-panel p-1 border-white/5 rounded-[48px] bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-20">
                <header className="mb-16">
                  <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.3em] mb-4">Setting / {activeTab}</p>
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-4">
                     {TABS.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-t2 text-sm font-medium leading-relaxed italic max-w-md">
                    {TABS.find(t => t.id === activeTab)?.description}
                  </p>
                </header>

                {activeTab === 'account' && (
                  <form onSubmit={handleUpdateAccount} className="space-y-12 max-w-xl">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Username</label>
                        <input 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white font-black text-lg outline-none focus:border-white/20 focus:bg-white/5 transition-all" 
                          value={accountForm.handle}
                          readOnly
                        />
                        <p className="text-white/10 text-[9px] ml-2 font-black uppercase tracking-widest italic">Permanent Username.</p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <input 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white font-medium outline-none focus:border-white/20 focus:bg-white/5 transition-all" 
                          type="email"
                          value={accountForm.email}
                          onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="pt-6">
                      <motion.button 
                        type="submit" 
                        disabled={saving} 
                        whileHover={hoverScale}
                        whileTap={tapScale}
                        className="px-12 py-5 bg-white text-black rounded-[24px] font-black text-xs shadow-2xl hover:bg-white/90 transition-all disabled:opacity-50 uppercase tracking-widest"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-16 max-w-xl">
                     <form onSubmit={handleChangePassword} className="space-y-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Current Password</label>
                        <input 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 font-mono text-sm" 
                          type="password"
                          placeholder="••••••••••••"
                          value={pwForm.oldPassword}
                          onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">New Password</label>
                          <input 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 font-mono text-sm" 
                            type="password"
                            placeholder="8+ characters"
                            value={pwForm.newPassword}
                            onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                          <input 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 font-mono text-sm" 
                            type="password"
                            placeholder="Match new password"
                            value={pwForm.confirmPassword}
                            onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="pt-6">
                        <motion.button 
                          type="submit" 
                          disabled={saving}
                          whileHover={hoverScale}
                          whileTap={tapScale}
                          className="px-12 py-5 border border-white/10 bg-white/5 text-white/60 hover:text-white rounded-[24px] font-black text-xs hover:bg-white/10 transition-all shadow-xl uppercase tracking-widest"
                        >
                          Update Password
                        </motion.button>
                      </div>
                    </form>

                       <div className="pt-16 border-t border-white/5">
                      <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-10 ml-2 italic">Security Activity</h3>
                      <div className="space-y-4">
                        {activity.length === 0 ? (
                          <div className="py-20 text-center text-white/5 text-[10px] font-black uppercase tracking-widest italic">No activity detected.</div>
                        ) : (
                          activity.map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.01] border border-white/5 group hover:border-white/10 transition-all">
                              <div className="flex items-center gap-6">
                                <span className="text-xl opacity-30 group-hover:opacity-100 transition-opacity">💻</span>
                                <div>
                                  <div className="font-black text-sm uppercase tracking-tight text-white/60 group-hover:text-white transition-colors">{item.device || 'Unknown Device'}</div>
                                  <div className="text-[9px] text-white/20 uppercase tracking-widest font-black mt-1">
                                    {item.location || 'Unknown Location'} • {item.ip_address}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[8px] font-black text-white/20 bg-white/5 px-4 py-1.5 rounded-full uppercase tracking-widest italic">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-16 max-w-2xl">
                     <div className="flex items-center justify-between gap-12 p-10 rounded-[40px] bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all">
                      <div>
                        <h3 className="text-2xl font-black italic mb-2 uppercase tracking-tight">Private Profile</h3>
                        <p className="text-white/20 text-sm font-medium leading-relaxed italic max-w-sm">Conceal your activity from public rankings.</p>
                      </div>
                      <div 
                        className={`w-20 h-10 rounded-full p-1.5 cursor-pointer transition-all duration-700 ${privacy.is_private ? 'bg-indigo-600' : 'bg-white/5'}`}
                        onClick={() => handleTogglePrivacy(!privacy.is_private)}
                      >
                        <motion.div 
                          className="w-7 h-7 rounded-full shadow-2xl bg-white"
                          animate={{ x: privacy.is_private ? 40 : 0 }}
                          transition={springSoft}
                        />
                      </div>
                    </div>

                     <div className="pt-20 border-t border-white/5">
                      <h4 className="text-rose-500 font-black italic text-2xl mb-4 uppercase tracking-tighter">Delete Account</h4>
                      <p className="text-white/20 text-sm font-medium italic mb-10 max-w-lg leading-relaxed">Permanently delete all your data and progress. This action cannot be reversed.</p>
                      <button 
                        className="text-rose-500/40 hover:text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] transition-all italic border-b border-rose-500/0 hover:border-rose-500/20 pb-1"
                        onClick={() => {
                          if (confirm('Delete account?')) {
                            fetchWithAuth(`${API_URL}/api/users/account`, { method: 'DELETE' }).then(() => {
                              deleteCookie('debugr_token');
                              window.location.href = '/';
                            });
                          }
                        }}
                      >
                        Delete Account →
                      </button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'payout' && (

                    <div className="space-y-12 max-w-2xl">
                        {/* Status Message */}
                        <div className="p-8 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20">
                            <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-2 italic">Manual Transfer Protocol</h4>
                            <p className="text-white/40 text-[10px] font-bold uppercase leading-relaxed italic">
                                Payouts are processed manually by the admin to eliminate transaction fees. 
                                Details are encrypted with <span className="text-white/60">AES-256-GCM</span> and only decrypted during processing.
                            </p>
                        </div>

                        {/* Existing Methods */}
                        {payoutMethods.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Active Configuration</h3>
                                {payoutMethods.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-6">
                                            <span className="text-xl">{m.type === 'bank_account' ? '🏦' : '💎'}</span>
                                            <div>
                                                <div className="font-black text-sm uppercase tracking-tight text-white/80 italic">{m.type.replace('_', ' ')}</div>
                                                <div className="text-[9px] text-white/30 uppercase tracking-widest font-black mt-1">
                                                    {m.masked_details.name} • {m.type === 'bank_account' ? m.masked_details.account_number : m.masked_details.upi_id}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic">Encrypted</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Setup Form */}
                        <form onSubmit={handleSavePayout} className="space-y-10 border-t border-white/5 pt-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Transfer Mode</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['bank_account', 'upi'].map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setPayoutForm({ ...payoutForm, type: mode })}
                                                className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all italic
                                                    ${payoutForm.type === mode ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}`}
                                            >
                                                {mode.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Payee Name</label>
                                    <input 
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 text-sm font-medium" 
                                        placeholder="Full legal name"
                                        required
                                        value={payoutForm.name}
                                        onChange={e => setPayoutForm({ ...payoutForm, name: e.target.value })}
                                    />
                                </div>

                                {payoutForm.type === 'bank_account' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Account Number</label>
                                            <input 
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 text-sm font-mono" 
                                                placeholder="00000000000"
                                                required
                                                value={payoutForm.bank_account}
                                                onChange={e => setPayoutForm({ ...payoutForm, bank_account: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">IFSC CODE</label>
                                            <input 
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 text-sm font-mono" 
                                                placeholder="HDFC0001234"
                                                required
                                                value={payoutForm.ifsc}
                                                onChange={e => setPayoutForm({ ...payoutForm, ifsc: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">UPI ID</label>
                                        <input 
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 outline-none transition-all focus:border-white/20 text-sm font-mono" 
                                            placeholder="username@bank"
                                            required
                                            value={payoutForm.upi_id}
                                            onChange={e => setPayoutForm({ ...payoutForm, upi_id: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-6">
                                <motion.button 
                                    type="submit" 
                                    disabled={saving}
                                    whileHover={hoverScale}
                                    whileTap={tapScale}
                                    className="px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs hover:bg-indigo-500 transition-all shadow-xl uppercase tracking-widest italic"
                                >
                                    {saving ? 'Encrypting...' : 'Update Payout Details'}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                   <div className="py-32 flex flex-col items-center justify-center text-center opacity-20">
                    <div className="text-6xl mb-10">🔔</div>
                    <h3 className="text-2xl font-black italic mb-4 uppercase">Notification Settings</h3>
                    <p className="text-xs font-bold uppercase tracking-widest max-w-[280px] leading-relaxed italic">Updating communication methods for optimal delivery.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className={`
              fixed bottom-12 right-12 z-[100] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl backdrop-blur-3xl italic
              flex items-center gap-4 border
              ${toast.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'}
            `}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
