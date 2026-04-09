'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { 
  Search, 
  Filter, 
  Terminal, 
  Shield, 
  Database, 
  ArrowRight,
  ChevronRight,
  Activity,
  Lock,
  Unlock
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
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-[minmax(400px,450px)_1fr] min-h-screen">
        
        {/* Sidebar / Filter (Left) */}
        <section className="hidden lg:flex flex-col gap-12 p-[160px_64px_60px_10%] border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl sticky top-0 h-screen overflow-y-auto">
          <motion.div variants={staggerContainer(0.1, 0)} initial="hidden" animate="visible" className="space-y-8">
            <div className="space-y-2">
               <p className="font-mono text-[9px] text-indigo-400 uppercase tracking-[0.6em] italic">[ ASSET_DISCOVERY ]</p>
               <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                 Registry <br /><span className="text-white/5 italic">Directory.</span>
               </h1>
            </div>
            <p className="text-white/30 text-base leading-relaxed font-medium italic">
              Access the validated registry of technical assets and infrastructure units. Filter by operational tier or asset protocol.
            </p>
          </motion.div>

          <div className="flex flex-col gap-10">
            <div className="space-y-4">
              <label className="font-mono text-[9px] text-white/10 uppercase tracking-[0.4em] font-black italic ml-1 flex items-center gap-3">
                 <Search size={12} /> SEARCH_PROTOCOL
              </label>
              <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="ASSET_ID, Keyword..."
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-white text-sm outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.04] italic font-medium placeholder:text-white/10"
                 />
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-mono text-[9px] text-white/10 uppercase tracking-[0.4em] font-black italic ml-1 flex items-center gap-3">
                 <Filter size={12} /> ACCESS_LEVEL
              </label>
              <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-1">
                {(['all', 'public', 'private'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`
                      flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic
                      ${filterType === t 
                        ? 'bg-white text-black shadow-2xl' 
                        : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                      }
                    `}
                  >
                    {t === 'all' ? 'FULL' : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-4 p-8 rounded-[32px] bg-white/[0.01] border border-white/5">
             <Activity size={16} className="text-indigo-500 animate-pulse" />
             <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] italic">{filtered.length} Validated Assets Online</p>
          </div>
        </section>

        {/* Main Content (Right) */}
        <section className="p-[160px_10%_120px] flex flex-col gap-10">
          {loading && (
            <div className="py-48 text-center space-y-6">
               <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto" />
               <p className="font-mono text-[10px] text-white/10 uppercase tracking-[0.6em] italic animate-pulse">Initializing Data Stream...</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {!loading && filtered.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Link href={`/programs/${p.id}`} className="block group">
                  <div className="glass-panel p-10 md:p-14 rounded-[56px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-indigo-500/20 transition-all duration-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 group-hover:shadow-[0_50px_120px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex gap-10 items-center relative z-10 w-full md:w-auto">
                      <div className="w-20 h-20 bg-[#080808] border border-white/10 rounded-3xl flex items-center justify-center text-3xl font-black text-white italic group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-2xl">
                        {p.name[0]}
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-6">
                           <p className="font-mono text-[9px] text-white/10 uppercase tracking-[0.5em] italic">[ ASSET_{p.id.slice(0, 4)} ]</p>
                           <div className={`
                             flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] italic
                             ${p.type === 'private' ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-white/30'}
                           `}>
                             {p.type === 'private' ? <Lock size={10} /> : <Unlock size={10} />}
                             {p.type} Level
                           </div>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase italic leading-none">{p.name}</h3>
                        <div className="flex flex-wrap gap-4 pt-2">
                          {p.scope.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] font-mono font-black text-white/10 bg-white/[0.02] px-4 py-1.5 rounded-full border border-white/5 group-hover:border-white/10 transition-colors uppercase tracking-widest italic">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative z-10 w-full md:w-auto text-left md:text-right p-10 md:p-0 rounded-[32px] bg-white/[0.02] md:bg-transparent border border-white/5 md:border-none flex flex-row md:flex-col justify-between items-center md:items-end gap-4">
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] text-white/10 font-black uppercase tracking-[0.4em] italic mb-1">POTENTIAL_VALUATION</p>
                        <p className="text-4xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-700 origin-right italic">
                          ${Number(p.reward_max).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight size={24} className="text-white/10 md:hidden" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && filtered.length === 0 && (
            <div className="py-48 text-center border border-dashed border-white/5 rounded-[64px] bg-white/[0.005]">
              <p className="text-white/10 text-xl font-medium italic tracking-tight mb-8">No asset records match the specified protocol filters.</p>
              <button onClick={() => {setSearch(''); setFilterType('all');}} className="px-10 py-5 bg-white/[0.05] hover:bg-white text-white hover:text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full transition-all italic border border-white/10">Reset Search Protocol</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
