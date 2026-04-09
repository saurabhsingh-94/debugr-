'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { fadeInUp, blurReveal, springSoft } from '@/lib/animations';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ReportStatus = 'pending' | 'triaged' | 'resolved' | 'duplicate' | 'informative' | 'not-applicable';

interface CompanyReport {
  id: string;
  title: string;
  severity: Severity;
  status: ReportStatus;
  bounty: number;
  user_handle: string;
  created_at: string;
}

interface Program {
  id: string;
  name: string;
  status: string;
}

export default function CompanyDashboard() {
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'programs'>('inbox');
  const [balance, setBalance] = useState('0');
  const [showNewProgram, setShowNewProgram] = useState(false);

  useEffect(() => {
    async function loadCompanyData() {
      try {
        const [repRes, progRes, profileRes] = await Promise.all([
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/company`),
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/programs/managed`),
          fetchWithAuth(API_ENDPOINTS.PROFILE)
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            setBalance(profileData.user.wallet_balance || '0');
          }
        }

        if (repRes.ok) {
          const repData = await repRes.json();
          if (repData.success) setReports(repData.reports);
        }
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.success) setPrograms(progData.programs);
        }
      } catch (err) {
        console.error("Company data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyData();
  }, []);

  const totalPaid = reports.reduce((acc, r) => acc + Number(r.bounty || 0), 0);
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-12">
      {/* ── Metrics Header ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 pb-12 border-b border-white/5">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="subtle-mono text-[9px] text-white/20 tracking-[0.3em]">Security Operations</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Command Active</span>
            </div>
          </div>
          <h1 className="hero-title text-4xl md:text-6xl tracking-tighter leading-none mb-4">Security Perimeter.</h1>
          <p className="text-t2 text-sm font-medium opacity-60">Oversee your disclosure programs, triage incoming reports, and manage security partnerships.</p>
        </div>

        <div className="flex gap-12 items-end">
          {[
            { label: 'Available Funds', value: `$${Number(balance).toLocaleString()}`, highlight: true },
            { label: 'Total Bounties Paid', value: `$${totalPaid.toLocaleString()}` },
            { label: 'Active Reports', value: String(reports.length) },
          ].map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="space-y-2 text-right md:text-left"
            >
              <p className="subtle-mono text-[8px] text-white/20 uppercase tracking-[0.2em] font-black">{s.label}</p>
              <p className={`text-2xl md:text-4xl font-black tracking-tighter ${s.highlight ? 'text-white' : 'text-white/40'}`}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Sub Navigation ── */}
      <div className="flex gap-12 border-b border-white/5 pb-0.5">
        {[
          { id: 'inbox', label: 'Security Inbox', count: pendingCount },
          { id: 'programs', label: 'Active Programs', count: programs.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              relative py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all
              ${activeTab === tab.id ? 'text-white' : 'text-white/20 hover:text-white/40'}
            `}
          >
            <span className="flex items-center gap-3">
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-[9px] font-black
                  ${activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/20'}
                `}>
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-white shadow-[0_0_10px_#fff]"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'inbox' ? (
          <motion.div 
            key="inbox"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel rounded-[32px] overflow-hidden border border-white/5 shadow-2xl"
          >
            <div className="hidden lg:grid grid-cols-[1fr_140px_120px_140px_120px] px-10 py-5 bg-white/3 border-b border-white/5">
              {['Vulnerability', 'Researcher', 'Severity', 'State', 'Bounty'].map(h => (
                <span key={h} className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">{h}</span>
              ))}
            </div>
            <div className="relative min-h-[300px]">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-20 gap-4">
                  <div className="w-8 h-8 border-2 border-white/5 border-t-white/20 rounded-full animate-spin" />
                  <p className="subtle-mono text-[9px] text-white/10 italic">Polling secure feeds...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="py-32 text-center">
                  <p className="text-white/10 text-xl font-black italic tracking-widest uppercase">Perimeter Secure.</p>
                  <p className="text-t2 text-xs mt-2 opacity-40">Inbox zero achieved across all programs.</p>
                </div>
              ) : (
                reports.map((r, i) => (
                  <motion.div 
                    key={r.id} 
                    variants={blurReveal}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_140px_120px_140px_120px] px-10 py-7 items-center border-b border-white/3 hover:bg-white/2 transition-colors group"
                  >
                    <div>
                      <p className="text-[15px] font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{r.title}</p>
                      <p className="subtle-mono text-[9px] text-white/10 mt-2 uppercase tracking-widest leading-none">Received: {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-bold text-white/40 tracking-tight">@{r.user_handle || 'anonymous'}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${r.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'}`}>{r.severity}</span>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10">
                        {r.status}
                      </span>
                    </div>
                    <span className="text-xl font-black text-white text-right md:text-left tracking-tighter">${Number(r.bounty || 0).toLocaleString()}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="programs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {programs.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[40px] bg-white/2 border border-white/10 flex flex-col gap-8 group hover:bg-white/3 hover:border-white/20 transition-all duration-500 shadow-2xl"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{p.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-[-1px]" />
                       <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-widest font-black italic">Status: {p.status}</p>
                    </div>
                  </div>
                </div>
                <Link href={`/programs/${p.id}/manage`} className="mt-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 text-center rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-white/90 transition-all"
                  >
                    Manage Policy
                  </motion.div>
                </Link>
              </motion.div>
            ))}
            <motion.div 
              onClick={() => setShowNewProgram(true)}
              whileHover={{ scale: 1.02 }}
              className="p-10 rounded-[40px] border-2 border-dashed border-white/5 bg-transparent flex flex-col items-center justify-center gap-8 group cursor-pointer hover:border-white/20 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10 group-hover:text-white/40 group-hover:bg-white/10 transition-all duration-500">
                 <span className="text-3xl">+</span>
              </div>
              <div className="text-center space-y-2">
                <p className="text-white/20 font-black text-sm uppercase tracking-widest">Deployment Ready</p>
                <p className="text-t2 text-[11px] font-medium opacity-40 max-w-[200px] mx-auto">Initialize a new crowdsourced security program in seconds.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Program Modal ── */}
      <AnimatePresence>
        {showNewProgram && (
          <NewProgramModal onClose={() => setShowNewProgram(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewProgramModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', description: '', reward_min: 0, reward_max: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={springSoft}
        className="glass-panel w-full max-w-xl p-12 rounded-[64px] border border-white/10 overflow-hidden relative shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div className="space-y-1">
            <p className="subtle-mono text-[9px] text-white/20 tracking-widest font-black uppercase italic">Vanguard Deployment</p>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Deploy Program</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Program Identifier</label>
            <input 
              required
              className="w-full bg-white/3 border border-white/5 rounded-2xl px-6 py-4 text-white text-[15px] font-medium outline-none focus:border-white/20 focus:bg-white/5 transition-all shadow-lg"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Debugr VDP Core"
            />
          </div>
          <div className="space-y-3">
            <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Management Directives</label>
            <textarea 
              required
              className="w-full bg-white/3 border border-white/5 rounded-3xl px-6 py-5 text-white text-[15px] font-medium h-40 outline-none focus:border-white/20 focus:bg-white/5 transition-all shadow-lg resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe scope, reward tiers, and submission criteria..."
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Lower Reward Ceiling ($)</label>
              <input 
                type="number"
                className="w-full bg-white/3 border border-white/5 rounded-2xl px-6 py-4 text-white text-[15px] font-medium transition-all"
                value={formData.reward_min}
                onChange={e => setFormData({ ...formData, reward_min: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-3">
              <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Upper Reward Ceiling ($)</label>
              <input 
                type="number"
                className="w-full bg-white/3 border border-white/5 rounded-2xl px-6 py-4 text-white text-[15px] font-medium transition-all"
                value={formData.reward_max}
                onChange={e => setFormData({ ...formData, reward_max: Number(e.target.value) })}
              />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-white/90 transition-all uppercase tracking-widest text-[13px] shadow-[0_20px_40px_rgba(255,255,255,0.1)] mt-4"
          >
            {isSubmitting ? 'Deploying...' : 'Initialize Program'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
