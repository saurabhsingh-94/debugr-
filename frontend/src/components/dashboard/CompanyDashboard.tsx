'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { fadeInUp, blurReveal, springSoft } from '@/lib/animations';
import { 
  Shield, 
  Activity, 
  Zap, 
  Layers, 
  Inbox, 
  Plus, 
  ChevronRight, 
  Cpu, 
  Lock,
  Terminal,
  Server,
  Cloud
} from 'lucide-react';

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
    <div className="space-y-16">
      {/* ── Security Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 pb-16 border-b border-white/5">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="subtle-mono text-[9px] text-indigo-400 tracking-[0.4em] uppercase italic">[ PERIMETER.NODE ]</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest">Surveillance_Active</span>
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">
            Security <br />
            <span className="text-white/5 italic">Perimeter.</span>
          </h1>
          <p className="text-white/30 text-sm font-medium italic max-w-lg leading-relaxed">
            Consolidating vulnerability telemetry and specialized research coordination across managed registries.
          </p>
        </div>

        <div className="flex gap-12 items-end">
          {[
            { label: 'Available Liquidity', value: `$${Number(balance).toLocaleString()}`, highlight: true, icon: <Zap size={14} /> },
            { label: 'Cumulative Yield', value: `$${totalPaid.toLocaleString()}`, icon: <Layers size={14} /> },
            { label: 'Triage Queue', value: String(pendingCount), icon: <Inbox size={14} /> },
          ].map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="space-y-4 text-right md:text-left"
            >
              <div className="flex items-center gap-3 justify-end md:justify-start">
                <span className="text-white/10">{s.icon}</span>
                <p className="subtle-mono text-[8px] text-white/20 uppercase tracking-[0.2em] font-black italic">{s.label}</p>
              </div>
              <p className={`text-4xl font-black tracking-tighter italic ${s.highlight ? 'text-white' : 'text-white/40'}`}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Context Navigation ── */}
      <div className="flex gap-16 border-b border-white/5 pb-0.5">
        {(['inbox', 'programs'] as const).map(tabId => {
          const tab = tabId === 'inbox' 
            ? { id: 'inbox', label: 'Vulnerability Feed', count: pendingCount, icon: <Activity size={12} /> }
            : { id: 'programs', label: 'Program Registry', count: programs.length, icon: <Layers size={12} /> };
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'inbox' | 'programs')}
              className={`
                relative py-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all italic
                ${activeTab === tab.id ? 'text-white' : 'text-white/20 hover:text-white/40'}
              `}
            >
              <span className="flex items-center gap-4">
                <span className={activeTab === tab.id ? 'text-indigo-400' : 'text-white/10'}>{tab.icon}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-[8px] font-mono font-black italic
                    ${activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/20'}
                  `}>
                    {tab.count.toString().padStart(2, '0')}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500/40"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'inbox' ? (
          <motion.div 
            key="inbox"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="glass-panel rounded-[40px] overflow-hidden border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="hidden lg:grid grid-cols-[1fr_180px_120px_160px_140px] px-12 py-6 bg-white/[0.02] border-b border-white/5">
              {['Vulnerability_Vector', 'Researcher_ID', 'Sev_Index', 'Triage_State', 'Valuation'].map(h => (
                <span key={h} className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black italic">{h}</span>
              ))}
            </div>
            <div className="relative min-h-[400px]">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-20 gap-6">
                  <div className="w-8 h-8 border border-white/5 border-t-white/40 rounded-full animate-spin" />
                  <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-[0.4em] italic animate-pulse">Polling secure feeds...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="py-40 text-center space-y-4">
                  <p className="text-white/10 text-2xl font-black italic uppercase tracking-tighter">Perimeter Secure.</p>
                  <p className="subtle-mono text-[10px] text-white/10 uppercase tracking-[0.4em]">All Vectors Neutralized.</p>
                </div>
              ) : (
                reports.map((r, i) => (
                  <motion.div 
                    key={r.id} 
                    variants={blurReveal}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_180px_120px_160px_140px] px-12 py-10 items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500/0 group-hover:bg-indigo-500/40 transition-all" />
                    
                    <div className="space-y-2">
                      <p className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight italic select-none">{r.title}</p>
                      <div className="flex items-center gap-3">
                         <span className="w-1 h-1 rounded-full bg-white/10" />
                         <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-widest italic leading-none">RECEIVED: {new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full font-black text-white/30 tracking-tight uppercase italic group-hover:text-white group-hover:bg-white/10 transition-all">@{r.user_handle || 'anonymous'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className={`subtle-mono text-xs font-black uppercase italic tracking-widest ${r.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'}`}>{r.severity}</span>
                    </div>

                    <div>
                      <span className="inline-block px-5 py-2 rounded-[14px] text-[9px] font-black uppercase tracking-widest bg-white/[0.02] text-white/30 border border-white/5 italic">
                        [ {r.status} ]
                      </span>
                    </div>

                    <div className="flex flex-col items-end lg:items-start group/reward">
                       <span className="text-2xl font-black text-white tracking-tighter italic group-hover:scale-110 transition-transform origin-left">${Number(r.bounty || 0).toLocaleString()}</span>
                       <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1">Allocation_USD</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="programs"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {programs.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-12 rounded-[56px] glass-panel border border-white/5 flex flex-col gap-10 group hover:bg-white/[0.02] hover:border-indigo-500/20 transition-all duration-500 shadow-2xl relative overflow-hidden h-[480px] justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-500/[0.05] transition-all" />
                
                <div className="space-y-8 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-inner group-hover:scale-110 transition-transform duration-500 italic">
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-3 uppercase italic leading-none">{p.name}</h3>
                    <div className="flex items-center gap-3">
                       <span className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                       <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black italic">STATUS: {p.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                   <div className="flex justify-between items-center py-4 border-y border-white/5">
                      <span className="subtle-mono text-[8px] text-white/20 uppercase tracking-widest italic">Vulnerability Flow</span>
                      <span className="text-[10px] font-black text-white italic group-hover:text-indigo-400">Synced</span>
                   </div>
                   <Link href={`/programs/${p.id}/manage`} className="block">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 text-center rounded-[24px] bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-neutral-200 transition-all italic flex items-center justify-center gap-3"
                    >
                      <Terminal size={12} /> Manage Policy
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              onClick={() => setShowNewProgram(true)}
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-12 rounded-[56px] border-2 border-dashed border-white/5 bg-transparent flex flex-col items-center justify-center gap-10 group cursor-pointer hover:border-indigo-500/20 hover:bg-white/[0.01] transition-all duration-500 h-[480px]"
            >
              <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-700 relative">
                 <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-center space-y-4">
                <p className="text-white/20 font-black text-xs uppercase tracking-[0.4em] italic group-hover:text-white/40">Initialize Registry</p>
                <p className="text-white/10 text-[10px] font-medium italic max-w-[200px] mx-auto leading-relaxed">
                  Provision a new coordination channel for specialized security research.
                </p>
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={springSoft}
        className="glass-panel w-full max-w-2xl p-16 rounded-[64px] border border-white/10 overflow-hidden relative shadow-[0_80px_160px_rgba(0,0,0,0.9)]"
      >
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex justify-between items-start mb-16 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <p className="subtle-mono text-[10px] text-indigo-400 tracking-[0.4em] font-black uppercase italic">[ VANGUARD_DEPLOYMENT ]</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Config <br /><span className="text-white/5">Registry.</span></h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            onClick={onClose} 
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all font-light"
          >✕</motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="space-y-4">
            <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Program.Identifier</label>
            <div className="relative group">
               <Server className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-hover:text-indigo-400 transition-colors" size={18} />
               <input 
                 required
                 className="w-full bg-white/[0.03] border border-white/5 rounded-[32px] pl-16 pr-8 py-6 text-white text-base font-medium outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all shadow-2xl"
                 value={formData.name}
                 onChange={e => setFormData({ ...formData, name: e.target.value })}
                 placeholder="e.g. DEBUGR_VDP_PRO"
               />
            </div>
          </div>

          <div className="space-y-4">
            <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Management.Directives</label>
            <div className="relative group">
               <Cpu className="absolute left-6 top-8 text-white/10 group-hover:text-indigo-400 transition-colors" size={18} />
               <textarea 
                 required
                 className="w-full bg-white/[0.03] border border-white/5 rounded-[40px] pl-16 pr-8 py-8 text-white text-base font-medium h-48 outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all shadow-2xl resize-none leading-relaxed"
                 value={formData.description}
                 onChange={e => setFormData({ ...formData, description: e.target.value })}
                 placeholder="Scope definition, validation criteria, and rewards protocol..."
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Lower Floor ($)</label>
              <input 
                type="number"
                className="w-full bg-white/[0.03] border border-white/5 rounded-[28px] px-8 py-6 text-white text-base font-black italic transition-all outline-none focus:border-indigo-500/40"
                value={formData.reward_min}
                onChange={e => setFormData({ ...formData, reward_min: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-4">
              <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Upper Ceiling ($)</label>
              <input 
                type="number"
                className="w-full bg-white/[0.03] border border-white/5 rounded-[28px] px-8 py-6 text-white text-base font-black italic transition-all outline-none focus:border-indigo-500/40"
                value={formData.reward_max}
                onChange={e => setFormData({ ...formData, reward_max: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-6">
            <motion.button 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-7 bg-white text-black font-black rounded-[32px] hover:bg-neutral-100 transition-all uppercase tracking-[0.4em] text-xs shadow-[0_30px_60px_rgba(255,255,255,0.1)] mt-4 flex items-center justify-center gap-4 italic"
            >
              <Cloud size={16} /> {isSubmitting ? 'Deploying...' : 'Initialize Program'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
