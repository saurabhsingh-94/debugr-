'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { inView } from '@/lib/animations';

interface Program {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  reward_min: string;
  reward_max: string;
  scope: string[];
}

export default function BountyDirectory() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

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
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-white/10">
      <Navbar />

      <main className="w-full grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_2fr] min-h-screen">
        
        {/* Sidebar / Hero (Left) */}
        <section className="hidden lg:flex flex-col gap-10 p-[160px_48px_60px_8%] border-r border-white/5 bg-white/1 sticky top-0 h-screen overflow-y-auto">
          <motion.div variants={inView()} initial="hidden" animate="visible">
            <p className="subtle-mono mb-4 text-white/30">Verified Opportunities</p>
            <h1 className="hero-title text-[clamp(40px,4vw,56px)] mb-6 leading-[0.9]">
              Secure the<br /><span className="text-white/20">Future.</span>
            </h1>
            <p className="text-t2 text-[15px] leading-relaxed max-w-[320px]">
              Explore high-impact security targets vetted by our team. Refine your search by reward size, platform, or industry standards.
            </p>
          </motion.div>

          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Search Programs</label>
              <input 
                type="text" 
                placeholder="Company, keyword, or asset..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-focus-glow w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Access Type</label>
              <div className="flex gap-2">
                {(['all', 'public', 'private'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`
                      flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                      ${filterType === t 
                        ? 'bg-white/10 text-white border border-white/20 shadow-lg' 
                        : 'text-white/30 border border-white/5 hover:bg-white/5'
                      }
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 rounded-3xl bg-white/3 border border-white/5">
            <p className="text-xs font-bold text-white/40">{filtered.length} active opportunities found</p>
          </div>
        </section>

        {/* Main Content (Right) */}
        <section className="p-[140px_8%_100px] flex flex-col gap-8">
          {loading && (
            <div className="py-20 text-center text-white/20 italic">Loading active programs...</div>
          )}

          <AnimatePresence mode="popLayout">
            {!loading && filtered.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link href={`/programs/${p.id}`} className="block group">
                  <div className="glass-panel p-8 md:p-10 rounded-[40px] border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)]">
                    <div className="flex gap-8 items-center">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform duration-500">
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-2xl font-black tracking-tight text-white">{p.name}</h3>
                          <span className={`
                            text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest
                            ${p.type === 'private' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}
                          `}>
                            {p.type}
                          </span>
                        </div>
                        <p className="text-t2 text-[14px] mb-4 max-w-sm line-clamp-2 leading-relaxed">{p.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.scope.slice(0, 3).map(s => (
                            <span key={s} className="text-[11px] font-bold text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/5">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto text-left md:text-right p-6 md:p-0 rounded-3xl bg-white/3 md:bg-transparent border border-white/5 md:border-none">
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-2">Bounty Pool</p>
                      <p className="text-3xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-500 origin-right">
                        ${Number(p.reward_max).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && filtered.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-white/20 text-lg">No programs match your search criteria.</p>
              <button onClick={() => {setSearch(''); setFilterType('all');}} className="mt-6 text-white text-sm font-bold border-b border-white/10 pb-1 hover:border-white transition-all">Clear All Filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
