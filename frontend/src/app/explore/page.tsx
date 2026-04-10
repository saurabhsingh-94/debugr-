'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { fadeInUp, blurReveal, staggerContainer } from '@/lib/animations';
import { 
  Globe, 
  Cloud, 
  Smartphone, 
  Box, 
  ArrowRight, 
  Shield, 
  Search, 
  Activity,
  Terminal,
  Lock,
  Unlock,
  ChevronRight,
  Filter,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  reward_min: string;
  reward_max: string;
  scope: string[];
}

interface Stats {
  total_payouts: number;
  total_resolved: number;
  total_hackers: number;
  total_companies: number;
}

export default function ExplorePage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [progRes, statsRes] = await Promise.all([
          fetchWithAuth('/api/programs'),
          fetchWithAuth('/api/programs/stats/global')
        ]);

        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.success) setPrograms(progData.programs);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
        }
      } catch (err) {
        console.error('Failed to load explore data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categories = [
    { title: 'All', icon: <Terminal size={20} />, label: 'Universal' },
    { title: 'Web', icon: <Globe size={20} />, label: 'Web Assets' },
    { title: 'Cloud', icon: <Cloud size={20} />, label: 'Infrastructure' },
    { title: 'Mobile', icon: <Smartphone size={20} />, label: 'Applications' },
    { title: 'Crypto', icon: <Shield size={20} />, label: 'Ledgers' }
  ];

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      const matchesCategory = activeCategory === 'All' || 
                              p.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
                              p.description.toLowerCase().includes(activeCategory.toLowerCase()) ||
                              p.scope.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [programs, search, filterType, activeCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-40 pb-32 px-6 lg:px-[10%] max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <section className="mb-24">
          <motion.div 
            variants={staggerContainer(0.1, 0)} 
            initial="hidden" 
            animate="visible" 
            className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end"
          >
            <div className="space-y-8">
              <motion.div variants={fadeInUp()} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400">Discovery Hub</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">Verified Programs</span>
              </motion.div>
              
              <motion.h1 
                variants={blurReveal} 
                className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase"
              >
                Explore <br /><span className="text-white/5 italic">Opportunities.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp()} className="text-xl text-white/30 font-medium italic max-w-xl leading-relaxed">
                Connect with high-stakes security programs. Filter by category, bounty level, and asset type to find your next target.
              </motion.p>
            </div>

            {/* Platform Stats Display */}
            <motion.div 
              variants={fadeInUp()} 
              className="grid grid-cols-2 gap-4 lg:w-80"
            >
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                 <p className="text-[8px] font-mono font-black text-white/20 uppercase tracking-widest mb-2 italic">Total Payouts</p>
                 <p className="text-2xl font-black italic text-indigo-400 leading-none">
                   ${stats ? (stats.total_payouts / 1000).toFixed(1) + 'k' : '---'}
                 </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                 <p className="text-[8px] font-mono font-black text-white/20 uppercase tracking-widest mb-2 italic">Active Hackers</p>
                 <p className="text-2xl font-black italic text-white leading-none">
                   {stats ? (stats.total_hackers).toLocaleString() : '---'}
                 </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Search & Categories Bar */}
        <section className="mb-20 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by program name, description, or scope..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-6 pl-16 pr-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-white italic font-medium placeholder:text-white/10 outline-none transition-all focus:bg-white/[0.04] focus:border-indigo-500/20 shadow-2xl"
              />
            </div>

            {/* Type Filter */}
            <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-full flex gap-1 h-[76px] items-center px-4">
              {(['all', 'public', 'private'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`
                    px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic whitespace-nowrap
                    ${filterType === t 
                      ? 'bg-white text-black shadow-2xl' 
                      : 'text-white/20 hover:text-white/40'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <motion.button
                key={cat.title}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(cat.title)}
                className={`
                  flex items-center gap-4 px-8 py-5 rounded-[24px] border transition-all italic
                  ${activeCategory === cat.title 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
                    : 'bg-white/[0.01] border-white/5 text-white/30 hover:border-white/10 hover:text-white'
                  }
                `}
              >
                <div className={`${activeCategory === cat.title ? 'text-indigo-400' : 'text-white/20'}`}>
                  {cat.icon}
                </div>
                <div className="text-left">
                   <p className="text-[8px] font-mono font-black uppercase tracking-widest opacity-50">{cat.label}</p>
                   <p className="text-sm font-black uppercase tracking-tight">{cat.title}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Results Grid */}
        <section className="relative min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 rounded-[56px] bg-white/[0.01] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {filteredPrograms.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -12, scale: 1.01 }}
                    >
                      <Link href={`/programs/${p.id}`} className="block h-full">
                        <div className="h-full glass-panel p-12 rounded-[56px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all duration-500 flex flex-col justify-between group shadow-3xl relative overflow-hidden">
                           {/* Ambient Glow */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                           <div>
                              <div className="flex justify-between items-start mb-10">
                                 <div className="w-14 h-14 bg-[#080808] border border-white/10 rounded-2xl flex items-center justify-center text-xl font-black italic group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-xl">
                                    {p.name[0]}
                                 </div>
                                 <div className={`
                                    px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2
                                    ${p.type === 'private' ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-white/30'}
                                 `}>
                                    {p.type === 'private' ? <Lock size={10} /> : <Unlock size={10} />}
                                    {p.type}
                                 </div>
                              </div>

                              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight mb-4 group-hover:text-indigo-400 transition-colors">
                                {p.name}
                              </h3>
                              <p className="text-white/20 text-xs font-medium italic line-clamp-2 leading-relaxed mb-6 group-hover:text-white/40 transition-colors">
                                {p.description}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {p.scope.slice(0, 3).map(s => (
                                  <span key={s} className="text-[9px] font-mono font-black text-white/10 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5 group-hover:border-white/10 transition-colors uppercase italic tracking-widest">
                                    {s}
                                  </span>
                                ))}
                              </div>
                           </div>

                           <div className="pt-10 mt-10 border-t border-white/5 flex items-end justify-between">
                              <div className="space-y-1">
                                 <p className="text-[8px] font-mono font-black text-white/10 uppercase tracking-widest italic">Max Bounty</p>
                                 <p className="text-3xl font-black text-white italic tracking-tighter leading-none">
                                   ${Number(p.reward_max).toLocaleString()}
                                 </p>
                              </div>
                              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-xl">
                                 <ChevronRight size={20} />
                              </div>
                           </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredPrograms.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="py-40 text-center border-2 border-dashed border-white/5 rounded-[64px] bg-white/[0.005]"
                >
                   <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 text-white/10">
                      <Search size={32} />
                   </div>
                   <p className="text-white/20 text-xl font-medium italic tracking-tight mb-8">No matching opportunities found for "{search || activeCategory}"</p>
                   <button 
                     onClick={() => {setSearch(''); setActiveCategory('All'); setFilterType('all');}} 
                     className="px-12 py-5 bg-white/[0.05] hover:bg-white text-white hover:text-black font-black text-[10px] uppercase tracking-[0.5em] rounded-full transition-all italic border border-white/10 shadow-2xl"
                   >
                     Reset Discovery
                   </button>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Dynamic CTA */}
        <section className="mt-48">
           <div className="glass-panel p-20 md:p-32 rounded-[100px] border border-white/5 bg-[#060606] relative overflow-hidden group shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)] opacity-50" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                 <div className="text-center md:text-left space-y-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8 animate-pulse mx-auto md:mx-0">
                       <Award size={32} />
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                       Exclusive <br /><span className="text-white/5 italic">Invites.</span>
                    </h2>
                    <p className="text-white/20 text-xl font-medium italic max-w-lg leading-relaxed">
                       Build your reputation on public targets to unlock verified access to high-stakes private environments.
                    </p>
                 </div>
                 
                 <div className="shrink-0">
                    <Link href="/signup">
                       <motion.button 
                         whileHover={{ scale: 1.05, y: -4 }}
                         whileTap={{ scale: 0.95 }}
                         className="px-16 py-8 bg-white text-black font-black text-[11px] uppercase tracking-[0.5em] rounded-full shadow-[0_30px_80px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all italic flex items-center gap-8"
                       >
                         Join Private Network <ChevronRight size={20} />
                       </motion.button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer className="py-24 border-t border-white/5 bg-[#030303] relative z-10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex items-center gap-6 group cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black italic transition-all group-hover:bg-indigo-500 group-hover:text-white shadow-xl">D</div>
             <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-white/20 group-hover:text-white/40">Debugr Discovery</p>
          </div>
          <p className="text-white/10 text-[8px] font-mono uppercase tracking-[0.5em] italic order-3 md:order-2">
            Engineering Node v4.1.0 // Latency 14ms
          </p>
          <div className="flex gap-10 order-2 md:order-3">
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">API Status</span>
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Directory</span>
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Encryption</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-linear-to-r from-transparent via-indigo-500/10 to-transparent" />
      </footer>
    </div>
  );
}
