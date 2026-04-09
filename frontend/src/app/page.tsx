'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fadeInUp, 
  staggerContainer, 
  blurIn,
  inView,
  hoverScale, 
  tapScale,
} from '@/lib/animations';
import { getCookie } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('debugr_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-white/10 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <Navbar />

      {/* Hero Section - Centered */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center">
        <motion.div
          variants={staggerContainer(0.1, 0)}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-10"
        >
          <motion.div variants={fadeInUp()} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-xl mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">Safety First Platform</span>
          </motion.div>

          <motion.h1 variants={fadeInUp()} className="text-6xl md:text-9xl font-black tracking-tight leading-[0.85] uppercase italic">
            <span className="block text-white/10 italic">Welcome To</span>
            <span className="block bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">Debugr.</span>
          </motion.h1>

          <motion.p variants={fadeInUp()} className="text-lg md:text-2xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed italic">
            A reliable, community-driven platform to find bugs and earn rewards. Join thousands of experts making the web safer for everyone.
          </motion.p>

          <motion.div variants={fadeInUp()} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_60px_rgba(255,255,255,0.15)] transition-all"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/explore">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl border border-white/5 backdrop-blur-md transition-all"
              >
                Join a Program
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Ribbon */}
      <section className="border-y border-white/5 bg-white/[0.01] backdrop-blur-xl px-6 py-16">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Active Researchers', value: '18.4k+' },
            { label: 'Total Bounties', value: '$2.4M+' },
            { label: 'Average Triage', value: '4.2 Hours' },
            { label: 'Verified Experts', value: '1,240' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">{stat.label}</p>
              <p className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-40 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-24">
            <p className="subtle-mono text-indigo-400 mb-6 tracking-[0.4em] uppercase text-[10px] italic">The Journey</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Simple, <br /><span className="text-white/20">Step by Step.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                step: '01', title: 'Start Up', 
                desc: 'Create your professional profile or register your organization. Verified in minutes.', 
                icon: '👋' 
              },
              { 
                step: '02', title: 'Collaborate', 
                desc: 'Find interesting programs and work with security teams to identify vulnerabilities.', 
                icon: '🤝' 
              },
              { 
                step: '03', title: 'Succeed', 
                desc: 'Earn rewards and build your reputation as a top-tier security researcher.', 
                icon: '💎' 
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative p-12 glass-panel border border-white/5 hover:border-white/10 transition-all rounded-[56px] bg-white/[0.02] flex flex-col items-center text-center"
              >
                <div className="text-5xl mb-10 group-hover:scale-125 transition-transform duration-700">{item.icon}</div>
                <div className="text-white/[0.03] text-8xl font-black absolute top-10 right-10 group-hover:text-white/10 transition-colors italic">{item.step}</div>
                <h3 className="text-2xl font-black text-white mb-5 uppercase italic tracking-tight">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium italic">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Foundation Section */}
      <section className="py-40 px-6 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85]">
              Built For <br /><span className="text-white/20">Trust.</span>
            </h2>
            <div className="space-y-10">
              {[
                { title: 'Secure Infrastructure', desc: 'We use professional encryption standards to keep your data safe and private.' },
                { title: 'Researcher Privacy', desc: 'Your identity is your choice. We support pseudonymous collaboration by default.' },
                { title: 'Verified Payments', desc: 'Reliable payment gateways ensure you get rewarded for your findings promptly.' }
              ].map((point, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 mt-2.5 group-hover:scale-150 group-hover:bg-indigo-400 transition-all" />
                  <div>
                    <h4 className="text-white font-black uppercase text-base mb-2 italic tracking-tight">{point.title}</h4>
                    <p className="text-white/30 text-xs leading-relaxed max-w-sm italic font-medium">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square max-w-lg mx-auto w-full"
          >
            <div className="absolute inset-0 bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
            <div className="relative h-full w-full glass-panel border border-white/10 rounded-[64px] flex items-center justify-center overflow-hidden bg-[#0a0a0a] shadow-3xl">
               {/* Simplified Trust Visual */}
               <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-6 h-full w-full gap-4 p-8">
                     {Array.from({length: 36}).map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-white" />
                     ))}
                  </div>
               </div>
               <div className="flex flex-col items-center gap-6 z-10">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-5xl">🛡️</div>
                  <p className="subtle-mono text-indigo-400/60 uppercase tracking-[0.5em] text-[10px] font-black italic">Safety Rating: AAA</p>
               </div>
               <div className="absolute bottom-12 left-12 right-12 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                  />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Programs Preview */}
      <section className="py-40 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-20 gap-8">
            <div className="text-center md:text-left">
              <p className="subtle-mono text-indigo-400 mb-4 tracking-[0.4em] uppercase text-[10px] italic">Active Rewards</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Featured <span className="text-white/20">Bounties.</span></h2>
            </div>
            <Link href="/explore" className="text-white/30 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest border-b-2 border-white/5 hover:border-indigo-500/40 pb-3 italic">View All Programs →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Vanguard Cloud', reward: '$12k - $40k', type: 'Public', color: 'emerald' },
              { name: 'Titan Infra', reward: '$5k - $25k', type: 'Private', color: 'indigo' },
              { name: 'Ghost Protocol', reward: '$15k - $60k', type: 'Public', color: 'rose' }
            ].map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -12, scale: 1.02 }}
                className="p-10 glass-panel border border-white/5 hover:border-white/10 transition-all rounded-[48px] bg-white/[0.01] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl group-hover:bg-indigo-500/5 transition-all" />
                <div className="flex justify-between items-start mb-16 relative z-10">
                   <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black text-xl italic group-hover:bg-indigo-500 group-hover:text-white transition-all">{p.name[0]}</div>
                   <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 text-white/30 group-hover:border-white/20 group-hover:text-white/50 transition-all">{p.type}</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-3 italic tracking-tight">{p.name}</h3>
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mb-4">Estimated Yield</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-black text-white tracking-tighter italic">{p.reward}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6">
         <div className="max-w-4xl mx-auto glass-panel p-20 md:p-32 rounded-[100px] border border-white/5 text-center relative overflow-hidden bg-white/[0.01] shadow-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%)] opacity-70" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 space-y-10"
            >
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">Ready to <br /><span className="text-white/20">Contribute?</span></h2>
              <p className="text-white/30 text-lg md:text-xl max-w-xl mx-auto font-medium italic leading-relaxed">Join a community of thousands collaborating to secure the digital future.</p>
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-16 py-7 bg-white text-black font-black text-base uppercase tracking-[0.2em] rounded-3xl shadow-3xl hover:bg-neutral-100 transition-all"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>
         </div>
      </section>

      <footer className="py-24 border-t border-white/5 text-center mt-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.5em] italic">
            &copy; 2026 Debugr Platform. Community Driven. Expertly Secured.
          </p>
        </div>
      </footer>
    </main>
  );
}
