'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { fadeInUp, blurReveal } from '@/lib/animations';

interface Program {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  reward_min: string;
  reward_max: string;
  scope: string[];
}

export default function BountyExplorer() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [minBounty, setMinBounty] = useState(0);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetchWithAuth('/api/programs');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPrograms(data.programs);
          }
        }
      } catch (err) {
        console.error('Failed to load programs', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const filtered = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesBounty = Number(p.reward_max) >= minBounty;
    return matchesSearch && matchesType && matchesBounty;
  });

  return (
    <div className="min-h-screen bg-bg text-[#f5f5f7] selection:bg-white/10">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div variants={fadeInUp(0.1)} initial="hidden" animate="visible">
            <h1 className="hero-title text-[clamp(40px,5vw,64px)] mb-6 leading-[1.1]">
              Hunt the <br /><span className="text-white/20">Untraceable.</span>
            </h1>
            <p className="text-t2 text-lg max-w-2xl leading-relaxed font-medium">
              Discover high-impact targets and earn rewards for uncovering legitimate vulnerabilities. 
              Debugr provides a transparent pathway from discovery to compensation.
            </p>
          </motion.div>
        </div>

        {/* Intelligence Hub */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
          
          {/* Filters Sidebar */}
          <aside className="space-y-10 lg:sticky lg:top-32 self-start">
            <div className="space-y-4">
              <label className="subtle-mono text-[10px] text-white/30 ml-1">Vulnerability Search</label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Find a target..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-white/20 focus:bg-white/5 transition-all shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="subtle-mono text-[10px] text-white/30 ml-1">Access Tier</label>
              <div className="flex gap-2 p-1.5 bg-white/3 border border-white/5 rounded-2xl">
                {(['all', 'public', 'private'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`
                      flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${filterType === t 
                        ? 'bg-white/10 text-white shadow-xl border border-white/10' 
                        : 'text-white/20 hover:text-white/40'
                      }
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-white/30 px-1">
                <span>Min Reward</span>
                <span className="text-white">${minBounty.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="1000" 
                value={minBounty}
                onChange={e => setMinBounty(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="p-8 rounded-[32px] bg-linear-to-br from-white/5 to-transparent border border-white/5 group transition-all duration-500 hover:bg-white/5">
              <p className="text-sm font-black text-white mb-3">Professional Insight</p>
              <p className="text-xs text-t2 leading-loose font-medium opacity-60">Private intelligence programs are unlocked by proving impact on public assets. Start broad, then specialize.</p>
            </div>
          </aside>

          {/* Opportunities List */}
          <section className="space-y-6">
            {loading && (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-2 border-white/5 border-t-white/40 rounded-full animate-spin mx-auto mb-6" />
                <p className="subtle-mono text-white/20">Scanning intelligence feeds...</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {!loading && filtered.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  variants={blurReveal}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/programs/${p.id}`} className="block group">
                    <div className="glass-panel p-8 md:p-10 rounded-[48px] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group-hover:bg-white/2 group-hover:border-white/10 transition-all duration-500 group-hover:shadow-2xl">
                      <div className="flex gap-8 items-center">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          {p.name[0]}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                            <span className={`
                              text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest
                              ${p.type === 'private' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}
                            `}>
                              {p.type}
                            </span>
                          </div>
                          <p className="text-t2 text-sm max-w-md line-clamp-2 leading-relaxed font-medium">{p.description}</p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {p.scope.slice(0, 3).map(s => (
                              <span key={s} className="text-[10px] font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5 group-hover:text-white/40 transition-colors">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto text-left md:text-right p-6 md:p-0 rounded-3xl bg-white/3 md:bg-transparent border border-white/5 md:border-none">
                        <p className="subtle-mono text-[9px] text-white/20 mb-2 uppercase">Reward Ceiling</p>
                        <p className="hero-title text-4xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500 origin-right">
                          ${Number(p.reward_max).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && filtered.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                <p className="text-white/20 text-lg font-medium italic">No intelligence matching your criteria.</p>
                <button 
                  onClick={() => {setSearch(''); setFilterType('all'); setMinBounty(0);}} 
                  className="mt-6 text-indigo-400 text-sm font-bold border-b border-indigo-400/20 pb-1 hover:border-indigo-400 transition-all font-mono tracking-widest uppercase"
                >
                  Clear Protocols
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
