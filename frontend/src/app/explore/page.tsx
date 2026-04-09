'use client';
import { useState, useEffect } from 'react';
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
  Target, 
  Activity,
  Terminal,
  Shield,
  Search,
  ChevronRight
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  reward_max: string;
}

export default function ExplorePage() {
  const [featured, setFeatured] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetchWithAuth('/api/programs');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const sorted = [...data.programs].sort((a, b) => Number(b.reward_max) - Number(a.reward_max));
            setFeatured(sorted.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load featured programs', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const categories = [
    { title: 'Web Systems', icon: <Globe size={24} />, count: 24, label: 'Web Assets' },
    { title: 'Cloud Infrastructure', icon: <Cloud size={24} />, count: 12, label: 'Cloud Systems' },
    { title: 'Mobile Apps', icon: <Smartphone size={24} />, count: 8, label: 'Mobile Clients' },
    { title: 'Data Services', icon: <Box size={24} />, count: 15, label: 'Data Nodes' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-48 pb-32 px-6 lg:px-[8%]">
        
        {/* Hero Section */}
        <section className="mb-32">
          <motion.div variants={staggerContainer(0.1, 0)} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={fadeInUp()} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400">Directory</span>
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">Explore Programs</span>
            </motion.div>
            <motion.h1 
              variants={blurReveal} 
              className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] uppercase"
            >
              Asset <br /><span className="text-white/5 italic">Registry.</span>
            </motion.h1>
            <motion.p variants={fadeInUp()} className="text-xl text-white/30 font-medium italic max-w-xl leading-relaxed">
              Analyze and engage with verified technical assets across high-stakes digital environments. Secure your reputation through validated impact.
            </motion.p>
          </motion.div>
        </section>

        {/* Categories Grid - Engineering View */}
        <section className="mb-48">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-10 glass-panel border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-indigo-500/20 transition-all rounded-[40px] cursor-pointer shadow-2xl overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-indigo-500/10 group-hover:scale-110 group-hover:text-indigo-400 transition-all text-white/40 shadow-inner">
                  {cat.icon}
                </div>
                <div className="space-y-3 relative z-10">
                   <p className="text-[9px] font-mono font-black text-indigo-400/40 uppercase tracking-[0.3em]">{cat.label}</p>
                   <h3 className="text-2xl font-black italic uppercase text-white/80 group-hover:text-white transition-colors">{cat.title}</h3>
                   <div className="flex items-center gap-3 pt-2">
                      <Activity size={12} className="text-white/10 animate-pulse" />
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{cat.count} Validated Units</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured / High Impact Tier - Dossier Style */}
        <section className="mb-48">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <p className="text-indigo-400 font-mono text-[9px] uppercase tracking-[0.6em] italic">Priority Opportunities</p>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">High-Impact <span className="text-white/5">Programs.</span></h2>
            </div>
            <Link href="/programs" className="group flex items-center gap-4 text-white/20 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] pb-5 border-b-2 border-white/5 hover:border-indigo-500/40 italic">
               Access Asset Directory <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[520px] rounded-[64px] bg-white/[0.01] animate-pulse border border-white/5 shadow-2xl" />
              ))
            ) : (
              featured.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ y: -16, scale: 1.01 }}
                  className="group relative p-14 glass-panel border border-white/5 hover:border-indigo-500/30 transition-all rounded-[64px] bg-white/[0.01] overflow-hidden flex flex-col justify-between h-[580px] shadow-3xl"
                >
                  <div className="absolute top-0 right-0 p-12">
                     <span className="text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-white/10 text-white/20 group-hover:text-white group-hover:border-indigo-500/40 transition-all italic">{p.type}</span>
                  </div>
                  
                  <div>
                    <div className="w-16 h-16 bg-[#080808] border border-white/10 rounded-2xl flex items-center justify-center font-black text-2xl italic mb-14 group-hover:bg-white group-hover:text-black transition-all shadow-xl">{p.name[0]}</div>
                    <div className="space-y-4">
                       <p className="text-[9px] font-mono text-white/10 uppercase tracking-[0.4em]">Program ID {p.id.slice(0, 4)}</p>
                       <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <p className="text-[9px] font-mono font-black text-white/10 uppercase tracking-[0.5em] italic">MAX BOUNTY</p>
                      <p className="text-5xl font-black text-white tracking-tighter italic leading-none">${Number(p.reward_max).toLocaleString()}</p>
                    </div>
                    <Link href={`/programs/${p.id}`} className="block">
                       <button className="w-full py-6 bg-white/[0.03] hover:bg-white text-white hover:text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-full transition-all italic border border-white/5 shadow-2xl">View Details</button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Call to Action - System Join */}
        <section className="py-32">
           <div className="glass-panel p-24 md:p-32 rounded-[80px] border border-white/5 bg-[#060606] flex flex-col items-center text-center relative overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.8)]">
             <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent_70%)] opacity-50" />
             
             <div className="relative z-10 space-y-10">
                <Shield size={48} className="text-white/10 mx-auto mb-4 animate-pulse" />
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">Elevate your <br /><span className="text-white/5 italic">Authority.</span></h2>
                <p className="text-white/20 text-xl font-medium italic max-w-xl mx-auto leading-relaxed">Join our private network for prioritized triage access to exclusive, invitation-only asset environments.</p>
                <div className="pt-8 flex justify-center">
                  <Link href="/signup">
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-16 py-8 bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-full hover:bg-neutral-200 transition-all italic shadow-[0_30px_70px_rgba(255,255,255,0.15)] flex items-center gap-6"
                    >
                      Join Private Collective <ChevronRight size={18} />
                    </motion.button>
                  </Link>
                </div>
             </div>
           </div>
        </section>

      </main>

      <footer className="py-24 border-t border-white/5 bg-[#030303]">
        <div className="max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-6 group cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black italic group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">D</div>
             <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-white/20">Debugr Explore</p>
          </div>
          <p className="text-white/10 text-[9px] font-mono uppercase tracking-[0.5em] italic order-3 md:order-2">
            Secure Platform v2.4.0
          </p>
          <div className="flex gap-10 order-2 md:order-3">
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Programs</span>
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Terminal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
