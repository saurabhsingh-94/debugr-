'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { inView, blurReveal, staggerContainer } from '@/lib/animations';

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
            // Sort by reward_max to show "High Impact" first
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
    { title: 'Web Infra', icon: '🌐', count: 24, color: 'indigo' },
    { title: 'Cloud Ops', icon: '☁️', count: 12, color: 'emerald' },
    { title: 'Embedded', icon: '📟', count: 8, color: 'rose' },
    { title: 'Blockchain', icon: '⛓️', count: 15, color: 'amber' }
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-white/10">
      <Navbar />

      <main className="pt-32 pb-20 px-6 lg:px-[8%]">
        
        {/* Hero Section */}
        <section className="mb-24">
          <motion.div variants={staggerContainer(0.1, 0)} initial="hidden" animate="visible">
            <motion.p variants={blurReveal} className="subtle-mono text-[10px] text-indigo-400 uppercase tracking-[0.4em] mb-4">Discovery Hub</motion.p>
            <motion.h1 
              variants={blurReveal} 
              className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase"
            >
              Scan the <br /><span className="text-white/20">Frontier.</span>
            </motion.h1>
          </motion.div>
        </section>

        {/* Categories Grid */}
        <section className="mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-panel p-8 rounded-[40px] border border-white/5 bg-white/[0.01] transition-all hover:bg-white/[0.03] cursor-pointer group"
              >
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-lg font-black italic uppercase mb-1">{cat.title}</h3>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{cat.count} Operations</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured / High Impact Tier */}
        <section className="mb-32">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="subtle-mono text-white/20 text-[10px] uppercase tracking-widest mb-2 font-black">Tier 01</p>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">High Impact Ops.</h2>
            </div>
            <Link href="/programs" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors pb-1 border-b border-white/10">View Directory →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[300px] rounded-[48px] bg-white/[0.02] animate-pulse border border-white/5" />
              ))
            ) : (
              featured.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="group relative p-10 glass-panel border border-white/5 hover:border-white/10 transition-all rounded-[48px] bg-white/[0.01] overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8">
                     <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 text-white/40">{p.type}</span>
                  </div>
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black text-xl mb-12 group-hover:scale-110 transition-transform">{p.name[0]}</div>
                  <h3 className="text-2xl font-black text-white mb-2 italic uppercase">{p.name}</h3>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Max Reward</p>
                    <p className="text-3xl font-black text-white tracking-tighter italic">${Number(p.reward_max).toLocaleString()}</p>
                  </div>
                  <Link href={`/programs/${p.id}`}>
                    <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white text-white hover:text-black font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all italic border border-white/5">Enter Mission</button>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Call to Action Mini */}
        <section className="py-20">
           <div className="glass-panel p-16 rounded-[60px] border border-white/5 bg-white/[0.01] flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent_70%)]" />
             <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 relative z-10">Can't find a <span className="text-white/20">Target?</span></h2>
             <p className="text-white/30 text-sm italic font-medium max-w-lg mb-8 relative z-10">Join our private network for exclusive, non-indexed bounty operations.</p>
             <Link href="/signup" className="relative z-10">
               <button className="px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all italic shadow-2xl">Apply for Elite Tier</button>
             </Link>
           </div>
        </section>

      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 Debugr Platform. Exploratory Branch.
        </p>
      </footer>
    </div>
  );
}
