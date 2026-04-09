'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { fadeInUp, blurReveal, springSoft } from '@/lib/animations';

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
  Medium:   'text-slate-400',
  Low:      'text-slate-600',
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
              status: r.status === 'resolved' && r.bounty > 0 ? 'Bounty Paid' : (r.status === 'triaged' ? 'Verifying' : r.status.charAt(0).toUpperCase() + r.status.slice(1)),
              earned: `$${Number(r.bounty || 0).toLocaleString()}`,
              company: r.company || 'Private Program',
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
    <div className="space-y-12">
      {/* ── Stats Header ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 pb-12 border-b border-white/5">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="subtle-mono text-[9px] text-white/20 tracking-[0.3em]">Researcher Operations</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Feed Active</span>
            </div>
          </div>
          <h1 className="hero-title text-4xl md:text-6xl tracking-tighter leading-none mb-4">Command Center.</h1>
          <p className="text-t2 text-sm font-medium opacity-60">Manage your vulnerability reports, earnings, and reputation across all programs.</p>
        </div>

        <div className="flex gap-12 items-end">
          {[
            { label: 'Intelligence Assets', value: `$${Number(balance).toLocaleString()}`, highlight: true },
            { label: 'Total Disclosures', value: String(reports.length) },
            { label: 'Success Rate', value: '94.2%' },
          ].map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="space-y-2 text-right md:text-left"
            >
              <p className="subtle-mono text-[8px] text-white/20 uppercase tracking-[0.2em] font-black">{s.label}</p>
              <p className={`text-2xl md:text-4xl font-black tracking-tighter ${s.highlight ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-white/60'}`}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Controls & Filter ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-white/3 border border-white/5 rounded-2xl overflow-x-auto">
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`
                px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${filter === s 
                  ? 'bg-white text-black shadow-2xl' 
                  : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-6">
           <span className="subtle-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">
            Identified: <span className="text-white ml-2">{filtered.length} Disclosures</span>
          </span>
          <Link href="/submit">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20"
            >
              + Submit Disclosure
            </motion.button>
          </Link>
        </div>
      </div>

      {/* ── Reports Grid ── */}
      <div className="glass-panel rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
        <div className="hidden lg:grid grid-cols-[140px_1fr_160px_100px_150px_120px] px-10 py-5 bg-white/3 border-b border-white/5">
          {['Ref ID', 'Disclosure Title', 'Program', 'Toxicity', 'Status', 'Reward'].map(h => (
            <span key={h} className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">{h}</span>
          ))}
        </div>

        <div className="relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 gap-4">
              <div className="w-8 h-8 border-2 border-white/5 border-t-white/20 rounded-full animate-spin" />
              <p className="subtle-mono text-[9px] text-white/10 italic">Synchronizing feeds...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-white/20 text-lg font-medium italic">No disclosure records found.</p>
              <button 
                onClick={() => setFilter('All')} 
                className="mt-4 text-indigo-400 text-xs font-bold uppercase tracking-widest font-mono"
              >
                Reset Filter
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
                    className="grid grid-cols-1 lg:grid-cols-[140px_1fr_160px_100px_150px_120px] px-10 py-7 items-center border-b border-white/3 hover:bg-white/2 transition-colors group relative"
                  >
                    <span className="subtle-mono text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer">{r.id}</span>
                    <div className="pr-12">
                      <p className="text-[15px] font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{r.title}</p>
                      <p className="subtle-mono text-[9px] text-white/10 mt-2">TIMESTAMP: {r.submitted}</p>
                    </div>
                    <span className="text-sm font-bold text-white/40 tracking-tight">{r.company}</span>
                    <div className="flex items-center gap-2">
                       <span className={`subtle-mono text-xs font-black italic ${sc}`}>{r.cvss}</span>
                    </div>
                    <div>
                      <span className={`
                        inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
                        ${st.bg} ${st.text} ${st.border} shadow-lg
                      `}>
                        {r.status}
                      </span>
                    </div>
                    <span className="text-xl font-black text-white text-right md:text-left tracking-tighter group-hover:scale-110 transition-transform origin-left">{r.earned}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
