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
          <motion.div variants={fadeInUp()} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Secure The Frontier</span>
          </motion.div>

          <motion.h1 variants={fadeInUp()} className="text-6xl md:text-9xl font-black tracking-tight leading-[0.85] uppercase italic">
            <span className="block text-white/20">The Elite</span>
            <span className="block bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">Grid.</span>
          </motion.h1>

          <motion.p variants={fadeInUp()} className="text-lg md:text-2xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed italic">
            Next-gen decentralized security terminal. Connect with organizations, discover vulnerabilities, and earn rewards in a deep matte ecosystem.
          </motion.p>

          <motion.div variants={fadeInUp()} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all"
              >
                Initialize Account
              </motion.button>
            </Link>
            <Link href="/explore">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl border border-white/5 transition-all"
              >
                Scan Operations
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Ribbon */}
      <section className="border-y border-white/5 bg-white/[0.01] backdrop-blur-sm px-6 py-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Security Nodes', value: '18.4k+' },
            { label: 'Total Rewards', value: '$2.4M+' },
            { label: 'Avg Triage', value: '4.2h' },
            { label: 'Elite Hackers', value: '1,240' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-white italic">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-24">
            <p className="subtle-mono text-indigo-400 mb-4 tracking-[0.4em] uppercase text-[10px]">The Methodology</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">How it <span className="text-white/20">Works.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', title: 'Connect', 
                desc: 'Integrate your security profile or organization. Authenticate via secure protocols.', 
                icon: '🔗' 
              },
              { 
                step: '02', title: 'Discover', 
                desc: 'Scan the grid for mission-critical vulnerabilities across Web, Cloud, and Infrastructure.', 
                icon: '🛰️' 
              },
              { 
                step: '03', title: 'Resolve', 
                desc: 'Submit detailed impact reports and collaborate directly with engineers for resolution.', 
                icon: '🛡️' 
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative p-10 glass-panel border border-white/5 hover:border-white/10 transition-all rounded-[48px] bg-white/[0.02]"
              >
                <div className="text-4xl mb-8 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <div className="text-white/10 text-7xl font-black absolute top-6 right-10 group-hover:text-white/20 transition-colors">{item.step}</div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase italic">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security DNA Section */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">
              Hardened <br />By <span className="text-white/20">Design.</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Military-Grade Encryption', desc: 'Every byte of your data is secured with AES-256 and PGP protocols.' },
                { title: 'Operational Anonymity', desc: 'We prioritize researcher privacy, allowing for fully pseudonymous interactions.' },
                { title: 'Zero-Trust Architecture', desc: 'No single point of failure. Every access point is verified at the edge.' }
              ].map((point, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-px h-12 bg-indigo-500/30" />
                  <div>
                    <h4 className="text-white font-black uppercase text-sm mb-1 italic">{point.title}</h4>
                    <p className="text-white/30 text-xs leading-relaxed max-w-sm">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square max-w-lg mx-auto"
          >
            <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full" />
            <div className="relative h-full w-full glass-panel border border-white/10 rounded-[60px] flex items-center justify-center overflow-hidden bg-black/60 shadow-2xl">
              <div className="text-[120px] opacity-10 font-black tracking-tighter rotate-[-10deg] select-none">DNA</div>
              <div className="absolute inset-10 border border-white/5 rounded-full animate-pulse" />
              <div className="absolute inset-20 border border-white/5 rounded-full animate-pulse delay-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1 h-32 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent animate-bounce" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Programs Preview */}
      <section className="py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-16 px-4">
            <div>
              <p className="subtle-mono text-indigo-400 mb-4 tracking-[0.4em] uppercase text-[10px]">High Impact</p>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">Live Ops.</h2>
            </div>
            <Link href="/explore" className="text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2 italic">View All Targets →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Vanguard Cloud', reward: '$12k - $40k', type: 'Public', color: 'emerald' },
              { name: 'Titan Infra', reward: '$5k - $25k', type: 'Private', color: 'indigo' },
              { name: 'Ghost Protocol', reward: '$15k - $60k', type: 'Public', color: 'rose' }
            ].map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 glass-panel border border-white/5 hover:border-white/10 transition-all rounded-[40px] bg-white/[0.01]"
              >
                <div className="flex justify-between items-start mb-12">
                   <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-black">{p.name[0]}</div>
                   <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 text-white/40">{p.type}</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 italic">{p.name}</h3>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Potential Yield:</p>
                <p className="text-2xl font-black text-white tracking-tighter">{p.reward}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
         <div className="max-w-4xl mx-auto glass-panel p-20 rounded-[80px] border border-white/5 text-center relative overflow-hidden bg-white/[0.01]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] opacity-50" />
            <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-8 relative z-10">Start Your <span className="text-white/20">Descent.</span></h2>
            <p className="text-white/40 text-lg mb-12 relative z-10 font-medium italic">Join the most advanced bounty grid in the security landscape.</p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link href="/signup">
                <button className="px-12 py-6 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all">Get Started</button>
              </Link>
            </div>
         </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center mt-32">
        <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 Debugr Platform. Operational Integrity Guaranteed.
        </p>
      </footer>
    </main>
  );
}
