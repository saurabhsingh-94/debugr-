'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { fadeInUp, blurReveal } from '@/lib/animations';
import { 
  Activity, 
  Shield, 
  Zap, 
  BarChart3, 
  Search, 
  Plus, 
  ChevronRight,
  Terminal,
  Clock,
  ExternalLink
} from 'lucide-react';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type Status = 'Triaged' | 'Resolved' | 'Pending' | 'Bounty Paid' | 'Verifying';

interface Report {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  earned: string;
  company: string;
  submitted: string;
  cvss: number;
}

const sevColor: Record<Severity | 'All', string> = {
  Critical: 'text-rose-500',
  High:     'text-amber-500',
  Medium:   'text-indigo-400',
  Low:      'text-white/20',
  All:      'text-white'
};

const statConfig: Record<Status, { text: string; bg: string; border: string }> = {
  Triaged:       { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  'Bounty Paid': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Resolved:      { text: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' },
  Pending:       { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Verifying:     { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

export default function HackerDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Severity | 'All'>('All');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    async function loadData() {
      try {
        const [reportsRes, profileRes] = await Promise.all([
          fetchWithAuth(API_ENDPOINTS.MY_REPORTS),
          fetchWithAuth(API_ENDPOINTS.PROFILE)
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            setBalance(profileData.user.wallet_balance || '0');
          }
        }

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          if (data.success) {
            const transformed = data.reports.map((r: any) => ({
              id: r.id.substring(0, 8).toUpperCase(),
              title: r.title,
              severity: r.severity.charAt(0).toUpperCase() + r.severity.slice(1),
              status: r.status === 'resolved' && (r.bounty || 0) > 0 ? 'Bounty Paid' : (r.status === 'triaged' ? 'Verifying' : r.status.charAt(0).toUpperCase() + r.status.slice(1)),
              earned: `$${Number(r.bounty || 0).toLocaleString()}`,
              company: r.company || 'Private Registry',
              submitted: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              cvss: r.severity === 'critical' ? 9.8 : r.severity === 'high' ? 7.5 : 5.0,
            }));
            setReports(transformed);
          }
        }
      } catch (err) {
        console.error("Dashboard compute error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = filter === 'All' ? reports : reports.filter(r => r.severity === filter);

  return (
    <div className="space-y-16">
      {/* ── Operational Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 pb-16 border-b border-white/5">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="subtle-mono text-[9px] text-white/20 tracking-[0.4em] uppercase italic">[ SYSTEM.INDEX ]</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
              <Activity size={10} className="text-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest">Feed_Synced</span>
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">
            Operational <br />
            <span className="text-white/5 italic">Hub.</span>
          </h1>
          <p className="text-white/30 text-sm font-medium italic max-w-lg leading-relaxed">
            Coordinating vulnerability lifecycles and reputation growth across the decentralized registry.
          </p>
        </div>

        <div className="flex gap-12 items-end">
          {[
            { label: 'Calculated Yield', value: `$${Number(balance).toLocaleString()}`, highlight: true, icon: <Zap size={14} /> },
            { label: 'Impact Vectors', value: String(reports.length), icon: <Shield size={14} /> },
            { label: 'Validated Rate', value: '94.2%', icon: <BarChart3 size={14} /> },
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

      {/* ── Triage Terminal Controls ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[24px] overflow-x-auto">
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`
                px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap italic
                ${filter === s 
                  ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
                  : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-4 px-6 py-3 rounded-full border border-white/5 bg-white/[0.01]">
             <Search size={14} className="text-white/10" />
             <span className="subtle-mono text-[9px] text-white/20 uppercase tracking-widest font-black italic">Search Index...</span>
          </div>
          <Link href="/submit">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center gap-4 italic"
            >
              <Plus size={14} /> Initialize Report
            </motion.button>
          </Link>
        </div>
      </div>

      {/* ── Operational Feed Grid ── */}
      <div className="glass-panel rounded-[40px] overflow-hidden border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
        <div className="hidden lg:grid grid-cols-[160px_1fr_180px_120px_160px_140px] px-12 py-6 bg-white/[0.02] border-b border-white/5">
          {['Vector_ID', 'Vulnerability Title', 'Identity_Registry', 'Sev.Index', 'Status.Vector', 'Valuation'].map(h => (
            <span key={h} className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black italic">{h}</span>
          ))}
        </div>

        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 gap-6">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border border-white/5 rounded-full" />
                <div className="absolute inset-0 border border-t-white/40 rounded-full animate-spin" />
              </div>
              <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-[0.4em] italic animate-pulse">Polling secure streams...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-40 text-center space-y-4">
              <p className="text-white/10 text-2xl font-black italic uppercase tracking-tighter">No Active Protocols.</p>
              <button 
                onClick={() => setFilter('All')} 
                className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] font-mono hover:text-white transition-colors italic"
              >
                Reset_Filter
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((r, i) => {
                const st = statConfig[r.status] || { text: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' };
                const sc = sevColor[r.severity as Severity] || 'text-white/40';
                return (
                  <motion.div 
                    key={r.id} 
                    layout
                    variants={blurReveal}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-1 lg:grid-cols-[160px_1fr_180px_120px_160px_140px] px-12 py-10 items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500/0 group-hover:bg-indigo-500/40 transition-all" />
                    
                    <span className="subtle-mono text-[11px] text-white/10 group-hover:text-white/40 transition-colors italic font-black">[ {r.id} ]</span>
                    
                    <div className="pr-12 space-y-2">
                      <p className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight italic select-none">{r.title}</p>
                      <div className="flex items-center gap-3">
                         <span className="w-1 h-1 rounded-full bg-white/10" />
                         <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-widest italic">INDEXED: {r.submitted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/20 group-hover:bg-white group-hover:text-black transition-all">{r.company[0]}</span>
                       <span className="text-xs font-black text-white/30 tracking-tight uppercase italic group-hover:text-white/60 transition-colors">{r.company}</span>
                    </div>

                    <div className="flex items-center gap-3">
                       <span className={`subtle-mono text-xs font-black italic tracking-tighter ${sc}`}>{r.cvss.toFixed(1)}</span>
                    </div>

                    <div>
                      <span className={`
                        inline-block px-5 py-2 rounded-[14px] text-[9px] font-black uppercase tracking-widest border italic
                        ${st.bg} ${st.text} ${st.border} shadow-inner
                      `}>
                        {r.status}
                      </span>
                    </div>

                    <div className="flex flex-col items-end lg:items-start group/reward">
                       <span className="text-2xl font-black text-white tracking-tighter italic group-hover:scale-110 transition-transform origin-left">{r.earned}</span>
                       <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1">Validated_USD</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── System Status Bar ── */}
      <div className="flex items-center justify-between px-10 py-6 rounded-[32px] bg-white/[0.01] border border-white/5">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="subtle-mono text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Network Protocols Stable</span>
            </div>
            <div className="h-4 w-[1px] bg-white/5" />
            <div className="flex items-center gap-3">
               <Terminal size={12} className="text-white/10" />
               <span className="subtle-mono text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">V2.4.b491</span>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <span className="subtle-mono text-[9px] text-white/10 uppercase tracking-widest italic">Session expires in: <span className="text-white/40 ml-2">4h 12m</span></span>
         </div>
      </div>
    </div>
  );
}
