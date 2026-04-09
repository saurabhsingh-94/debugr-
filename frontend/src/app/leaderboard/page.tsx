'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { inView, blurReveal } from '@/lib/animations';

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
    <div className="min-h-screen bg-bg text-[#f5f5f7] selection:bg-white/10">
      <Navbar />

      <main className="w-full flex flex-col lg:flex-row min-h-screen pt-24">
        
        {/* Left Sidebar: Titles & Stats */}
        <section className="w-full lg:w-[450px] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 p-10 lg:pl-[8%] lg:pr-12 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/1 flex flex-col gap-12">
          <motion.div variants={inView()} initial="hidden" animate="visible">
            <p className="subtle-mono text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4">Global Security Rankings</p>
            <h1 className="hero-title text-5xl md:text-6xl mb-6 leading-[1.1]">
              Vanguard <br /> Excellence.
            </h1>
            <p className="text-t2 text-base leading-relaxed font-medium">
              Recognizing the elite researchers who safeguard our digital infrastructure. Rankings are updated in real-time based on verified impact.
            </p>
          </motion.div>

          <div className="space-y-6">
            <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">Sort Metrics</p>
            <div className="p-1.5 bg-white/3 border border-white/5 rounded-2xl flex gap-2">
              {(['earned', 'resolved'] as const).map(m => (
                <button 
                  key={m}
                  onClick={() => setSortBy(m)}
                  className={`
                    flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                    ${sortBy === m 
                      ? 'bg-white text-black shadow-2xl' 
                      : 'text-white/30 hover:text-white/50 hover:bg-white/5'
                    }
                  `}
                >
                  {m === 'earned' ? 'Bounty Volume' : 'Impact Count'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/2 border border-white/5 rounded-3xl group transition-all hover:bg-white/4">
              <p className="subtle-mono text-[8px] text-white/20 mb-3 uppercase">Avg Reward</p>
              <p className="text-2xl font-black text-white">$1,240</p>
            </div>
            <div className="p-6 bg-white/2 border border-white/5 rounded-3xl group transition-all hover:bg-white/4">
              <p className="subtle-mono text-[8px] text-white/20 mb-3 uppercase">Monthly Impact</p>
              <p className="text-2xl font-black text-white">482</p>
            </div>
          </div>
        </section>

        {/* Right Content: Rankings Feed */}
        <section className="flex-1 p-10 lg:px-[8%] lg:py-16">
          <div className="hidden md:grid grid-cols-[80px_1fr_140px_140px] px-8 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/10">
            <span>Rank</span>
            <span>Researcher</span>
            <span className="text-right">Impact</span>
            <span className="text-right">Rewards</span>
          </div>

          <div className="flex flex-col gap-4">
            {loading && (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="subtle-mono text-[10px] text-white/20 uppercase tracking-widest">Calculating Global Tiers...</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {!loading && data.map((h, idx) => {
                const isTop3 = idx < 3;
                return (
                  <motion.div
                    key={h.id}
                    layout
                    variants={blurReveal}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: idx * 0.05 }}
                    className={`
                      grid grid-cols-1 md:grid-cols-[80px_1fr_140px_140px] items-center p-6 md:px-8 md:py-7 rounded-[32px] border transition-all duration-500 gap-4 md:gap-0
                      ${isTop3 
                        ? 'bg-white/5 border-white/15 shadow-2xl relative' 
                        : 'bg-white/1 border-white/5 hover:bg-white/3 hover:border-white/10'
                      }
                    `}
                  >
                    <span className={`
                      text-2xl font-black tracking-tighter
                      ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-white/20'}
                    `}>
                      #{idx + 1}
                    </span>
                    
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-white shadow-inner">
                        {h.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                          {h.email.split('@')[0]}
                        </p>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Verified Identity</p>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className={`
                        text-xl font-black tracking-tight
                        ${sortBy === 'resolved' ? 'text-white' : 'text-white/20'}
                      `}>
                        {Number(h.resolved_count).toLocaleString()}
                      </p>
                      <p className="md:hidden subtle-mono text-[8px] text-white/10 uppercase">Impacts</p>
                    </div>

                    <div className="md:text-right">
                      <p className={`
                        text-xl font-black tracking-tight
                        ${sortBy === 'earned' ? 'text-white' : 'text-white/20'}
                      `}>
                        ${Number(h.total_earned).toLocaleString()}
                      </p>
                      <p className="md:hidden subtle-mono text-[8px] text-white/10 uppercase">Rewards</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {!loading && data.length === 0 && (
              <div className="py-32 text-center border border-dashed border-white/5 rounded-[48px]">
                <p className="text-white/20 text-lg font-medium italic">No rankings available for this tier.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
