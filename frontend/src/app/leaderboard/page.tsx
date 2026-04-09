'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { fadeInUp, blurReveal, staggerContainer } from '@/lib/animations';
import { 
  Trophy, 
  Activity, 
  ChevronLeft, 
  ShieldCheck, 
  Fingerprint, 
  Cpu,
  BarChart3,
  Search
} from 'lucide-react';

interface HackerRank {
  id: string;
  email: string;
  total_earned: number;
  resolved_count: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<HackerRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'earned' | 'resolved'>('earned');

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/users/leaderboard?sortBy=${sortBy}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.leaderboard);
          }
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen pt-32">
        
        {/* Left Sidebar: Index Info */}
        <section className="w-full lg:w-[480px] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-32 p-12 lg:pl-12 lg:pr-16 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl flex flex-col gap-16">
          <motion.button 
            whileHover={{ x: -8 }}
            onClick={() => window.history.back()} 
            className="group text-white/20 text-[10px] font-mono font-black tracking-[0.4em] flex items-center gap-4 uppercase italic hover:text-white transition-all w-fit"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
          </motion.button>
          
          <motion.div variants={staggerContainer(0.1, 0)} initial="hidden" animate="visible" className="space-y-8">
            <div className="space-y-2">
               <p className="font-mono text-[9px] text-indigo-400 uppercase tracking-[0.6em] italic">Leaderboard</p>
               <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                 Researcher <br /><span className="text-white/5 italic">Rankings.</span>
               </h1>
            </div>
            <p className="text-white/30 text-lg leading-relaxed font-medium italic">
              The leading minds in global security, ranked by their verified impact and contribution to the ecosystem.
            </p>
          </motion.div>

          <div className="space-y-8">
            <p className="font-mono text-[9px] text-white/10 uppercase tracking-[0.4em] font-black italic">Sort By</p>
            <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-[24px] flex gap-2 shadow-2xl relative">
              {(['earned', 'resolved'] as const).map(m => (
                <button 
                  key={m}
                  onClick={() => setSortBy(m)}
                  className={`
                    relative flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all italic z-10
                    ${sortBy === m 
                      ? 'text-black' 
                      : 'text-white/20 hover:text-white/40'
                    }
                  `}
                >
                  {sortBy === m && (
                    <motion.div 
                      layoutId="sortHighlight"
                      className="absolute inset-0 bg-white rounded-[18px] shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.5 }}
                    />
                  )}
                  <span className="relative z-20">{m === 'earned' ? 'Earnings' : 'Resolved'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-6">
            <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[32px] group transition-all hover:bg-white/[0.03] hover:border-indigo-500/20 shadow-xl">
              <p className="font-mono text-[8px] text-white/10 mb-4 uppercase tracking-[0.3em] italic">AVG BOUNTY</p>
              <p className="text-3xl font-black text-white italic tracking-tighter">$2,450</p>
            </div>
            <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[32px] group transition-all hover:bg-white/[0.03] hover:border-indigo-500/20 shadow-xl">
              <p className="font-mono text-[8px] text-white/10 mb-4 uppercase tracking-[0.3em] italic">TOTAL REPORTS</p>
              <p className="text-3xl font-black text-white italic tracking-tighter">1,894</p>
            </div>
          </div>
        </section>

        {/* Right Content: Index Feed */}
        <section className="flex-1 p-8 md:p-12 lg:pl-20 lg:pr-32 lg:py-24">
          <div className="hidden md:grid grid-cols-[80px_1fr_180px_180px] px-12 mb-10 text-[9px] font-mono font-black uppercase tracking-[0.5em] text-white/5 italic">
            <span>Rank</span>
            <span>Identity</span>
            <span className="text-right">Verified Resolved</span>
            <span className="text-right">Verified Earnings</span>
          </div>

          <div className="flex flex-col gap-6">
            {loading && (
              <div className="py-48 text-center space-y-6">
                <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto shadow-2xl" />
                <p className="font-mono text-[10px] text-white/10 uppercase tracking-[0.6em] italic animate-pulse">Loading Rankings...</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {!loading && data.map((h, idx) => {
                const isTop3 = idx < 3;
                return (
                  <motion.div
                    key={h.id}
                    layout
                    variants={fadeInUp()}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className={`
                      grid grid-cols-1 md:grid-cols-[100px_1fr_160px_160px] items-center p-8 md:px-12 md:py-10 rounded-[48px] border transition-all duration-700 gap-8 md:gap-0 group
                      ${idx === 0
                        ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]' 
                        : isTop3 
                        ? 'bg-white/[0.03] border-white/10 shadow-3xl' 
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-indigo-500/20'
                      }
                    `}
                  >
                    <div className="flex flex-col">
                       <span className={`
                         text-2xl font-mono font-black italic tracking-tighter
                         ${idx === 0 ? 'text-indigo-400' : idx === 1 ? 'text-white/60' : idx === 2 ? 'text-white/40' : 'text-white/10'}
                       `}>
                         {idx === 0 ? <Trophy size={18} className="mb-2" /> : null}
                         {String(idx + 1).padStart(2, '0')}
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 rounded-2xl bg-[#080808] border border-white/10 flex items-center justify-center text-lg font-black text-white shadow-2xl group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                        {h.email[0].toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">
                          {h.email.split('@')[0]}
                        </p>
                        <div className="flex items-center gap-3">
                           <ShieldCheck size={10} className="text-indigo-400/40" />
                           <p className="text-[9px] text-white/20 font-mono uppercase tracking-[0.3em] font-black italic">Verified Researcher</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:text-right space-y-1">
                      <p className={`
                        text-2xl font-black italic tracking-tight transition-all
                        ${sortBy === 'resolved' ? 'text-white scale-110' : 'text-white/20'}
                      `}>
                        {Number(h.resolved_count).toLocaleString()}
                      </p>
                      <p className="md:hidden font-mono text-[8px] text-white/5 uppercase tracking-widest italic">Success Rate</p>
                    </div>

                    <div className="md:text-right space-y-1">
                      <p className={`
                        text-2xl font-black italic tracking-tight transition-all
                        ${sortBy === 'earned' ? 'text-white scale-110' : 'text-white/20'}
                      `}>
                        ${Number(h.total_earned).toLocaleString()}
                      </p>
                      <p className="md:hidden font-mono text-[8px] text-white/5 uppercase tracking-widest italic">Total Verified</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {!loading && data.length === 0 && (
              <div className="py-48 text-center border border-dashed border-white/5 rounded-[64px] bg-white/[0.005]">
                <p className="text-white/10 text-xl font-medium italic tracking-tight">No rankings found for this category.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
