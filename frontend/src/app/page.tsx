'use client';

import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Fingerprint, 
  Unplug, 
  Workflow, 
  Terminal,
  Activity,
  Globe,
  Layers,
  ArrowRight,
  ChevronRight,
  Lock,
  Cpu,
  Monitor,
  Code2
} from 'lucide-react';
import { getCookie } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { fadeInUp, staggerContainer, blurReveal } from '@/lib/animations';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('debugr_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* Background Ambience - Sophisticated Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      {/* Hero Section - Asymmetric & Bold */}
      <section className="relative pt-48 pb-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
           <motion.div
             variants={staggerContainer(0.1, 0)}
             initial="hidden"
             animate="visible"
             className="lg:col-span-8 space-y-12"
           >
              <motion.div variants={fadeInUp()} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400">DEBUGR</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">SECURITY REIMAGINED</span>
              </motion.div>

              <motion.h1 variants={fadeInUp()} className="text-7xl md:text-[130px] font-black tracking-tighter leading-[0.85] uppercase italic">
                <span className="block text-white/5">Precision</span>
                <span className="block bg-linear-to-b from-white via-white to-white/40 bg-clip-text text-transparent -mt-2">Security.</span>
              </motion.h1>

              <motion.div variants={fadeInUp()} className="max-w-xl space-y-10">
                <p className="text-xl md:text-2xl text-white/40 font-medium leading-tight italic">
                  A professional work environment for independent security researchers and engineering teams. Validating impact, securing the digital economy.
                </p>
                
                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group px-10 py-6 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-full shadow-[0_20px_60px_rgba(255,255,255,0.15)] transition-all flex items-center gap-4"
                    >
                      Claim your handle <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link href="/explore">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-10 py-6 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.3em] rounded-full border border-white/10 backdrop-blur-md transition-all"
                    >
                      Explore Programs
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
             animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
             transition={{ duration: 1.2, delay: 0.6 }}
             className="lg:col-span-4 hidden lg:block"
           >
              <div className="relative aspect-[4/5] glass-panel border border-white/5 rounded-[48px] p-10 flex flex-col justify-between overflow-hidden bg-white/[0.01]">
                 <div className="space-y-8">
                    <div className="flex justify-between items-start">
                       <Terminal className="text-indigo-400/40" size={20} />
                       <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">Live Activity</span>
                    </div>
                    <div className="space-y-6">
                         <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-mono text-white/20 mb-1">{item.id}</span>
                               <span className="text-xs font-black uppercase italic tracking-wider text-white/50">{item.target}</span>
                            </div>
                            <div className="text-right">
                               <span className="block text-sm font-black text-indigo-400 italic">{item.reward}</span>
                               <span className={`text-[8px] font-mono uppercase tracking-widest ${item.type === 'Critical' ? 'text-rose-500/50' : 'text-white/10'}`}>{item.type}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-4 text-indigo-400/40 animate-pulse">
                       <Activity size={14} />
                       <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Researcher Network Active</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ x: '-100%' }}
                         animate={{ x: '100%' }}
                         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         className="w-1/4 h-full bg-linear-to-r from-transparent via-indigo-500 to-transparent"
                       />
                    </div>
                 </div>
                 <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-indigo-500/5 pointer-events-none" />
              </div>
           </motion.div>
        </div>
      </section>

      {/* Activity Bar - Bespoke Replacement for Ticker */}
      <section className="border-y border-white/5 bg-[#080808] backdrop-blur-sm relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex items-center h-16 px-12 overflow-hidden whitespace-nowrap">
           <motion.div 
             animate={{ x: [0, -1200] }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             className="flex items-center gap-24"
           >
              {[1,2,3,4,5,6].map((_, i) => (
                <div key={i} className="flex items-center gap-16 text-[9px] font-mono font-black uppercase tracking-[0.5em] text-white/20">
                   <div className="flex items-center gap-6">
                      <span className="text-indigo-400/30">Secure Transfer</span>
                      <Shield size={14} className="text-indigo-400/30" />
                      <span className="text-indigo-400/30">Verified Impact</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-indigo-500/20" />
                   <div className="flex items-center gap-6">
                      <span className="text-indigo-400/30">VERIFICATION_XP</span>
                      <span className="text-white/40">Expert_Researcher</span>
                      <span className="text-indigo-400/60">+2,400 CR</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-indigo-500/20" />
                </div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* Philosophy - Asymmetric Stacked Content */}
      <section className="py-56 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
             <div className="lg:col-span-6 sticky top-32 space-y-10">
                <p className="text-indigo-400 font-mono text-[9px] uppercase tracking-[0.6em] italic">Process Map</p>
                <h2 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] mb-8">
                   Refined <br />
                   <span className="text-white/5 italic">Validation.</span>
                </h2>
                <p className="text-xl text-white/30 font-medium italic leading-relaxed max-w-md">
                   We remove the bureaucracy between identifying a vulnerability and securing its resolution.
                </p>
             </div>
             
             <div className="lg:col-span-6 space-y-12">
                {[
                  { 
                    title: 'Secure Onboarding', 
                    desc: 'Claim your handle and build your profile in minutes. We prioritize privacy and security to keep your research activity professional.',
                    icon: <Fingerprint className="text-indigo-400/60" size={28} />
                  },
                  { 
                    title: 'Expert Analysis', 
                    desc: 'Access exclusive review surfaces across high-stakes infrastructure. Submit findings via our simplified technical gateway.',
                    icon: <Monitor className="text-indigo-400/60" size={28} />
                  },
                  { 
                    title: 'Career Growth', 
                    desc: 'Build your reputation based on verified impact. Unlock specialized programs and higher earnings as your technical expertise is proven.',
                    icon: <TrendingUp className="text-indigo-400/60" size={28} />
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.8 }}
                    className="group relative p-12 glass-panel border border-white/5 hover:border-indigo-500/20 transition-all rounded-[40px] bg-white/[0.01] flex flex-col sm:flex-row gap-10 items-start shadow-2xl"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                       {item.icon}
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{item.title}</h3>
                       <p className="text-white/20 text-sm leading-relaxed font-medium italic group-hover:text-white/40 transition-colors">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Stats - Technical Ledger View */}
      <section className="py-56 px-6 lg:px-12 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-24 items-center">
            <div className="flex-1 space-y-16">
                <div className="space-y-6">
                  <p className="text-indigo-400 font-mono text-[9px] uppercase tracking-[0.6em] italic">Platform Performance</p>
                  <h2 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
                    Operational <br />
                    <span className="text-white/5 italic">Authority.</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {[
                    { label: 'Network Quality', value: 'Level 04', sub: 'Pro Grade' },
                    { label: 'Impact Response', value: '4.2h', sub: 'Avg Review' },
                    { label: 'Impact Verified', value: '99.9%', sub: 'Accuracy Rate' },
                    { label: 'Global Network', value: '180+', sub: 'Impact Partners' }
                  ].map((s, i) => (
                    <div key={i} className="p-10 rounded-[32px] bg-[#080808] border border-white/5 group hover:border-white/10 transition-all shadow-xl">
                        <span className="block text-[8px] font-mono text-white/20 uppercase tracking-[0.5em] mb-4 italic">{s.label}</span>
                        <div className="flex items-end gap-3">
                           <span className="text-5xl font-black italic tracking-tighter text-white/80 group-hover:text-white transition-colors leading-none">{s.value}</span>
                           <span className="text-[9px] font-mono text-indigo-400/40 uppercase mb-1">{s.sub}</span>
                        </div>
                    </div>
                  ))}
                </div>
            </div>

            <div className="flex-1 relative w-full h-[640px] glass-panel border border-white/5 rounded-[56px] overflow-hidden bg-[#070707] flex items-center justify-center p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
               
               <div className="relative z-10 w-full max-w-sm space-y-12">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <div className="space-y-1">
                         <p className="text-[10px] font-mono tracking-[0.4em] text-indigo-400 uppercase">System Status: Stable</p>
                         <p className="text-[8px] font-mono text-white/10 uppercase">Production v2.4.0</p>
                      </div>
                      <Cpu className="text-white/10" size={18} />
                  </div>

                  <div className="py-16 px-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow- inner flex flex-col items-center gap-10 group relative overflow-hidden">
                     <div className="w-28 h-28 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center relative shadow-2xl group-hover:scale-105 transition-transform duration-700">
                        <ShieldCheck size={56} className="text-indigo-500/80 animate-pulse" />
                        <div className="absolute inset-0 bg-linear-to-t from-indigo-500/10 via-transparent to-transparent opacity-40" />
                     </div>
                     <div className="text-center space-y-4">
                        <p className="text-4xl font-black italic tracking-tighter uppercase leading-none">Secure.</p>
                        <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.6em] italic">Hardened Infrastructure</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center group hover:bg-white/[0.05] transition-all">
                        <Monitor size={20} className="mx-auto mb-4 text-white/10 group-hover:text-indigo-400/50 transition-colors" />
                        <span className="block text-[8px] font-mono uppercase tracking-[0.3em] text-white/30">Secure Gateway</span>
                     </div>
                     <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center group hover:bg-white/[0.05] transition-all">
                        <Code2 size={20} className="mx-auto mb-4 text-white/10 group-hover:text-indigo-400/50 transition-colors" />
                        <span className="block text-[8px] font-mono uppercase tracking-[0.3em] text-white/30">Technical Review</span>
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </section>

      {/* Featured Programs - Grounded Labels */}
      <section className="py-56 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-28 gap-8">
            <div className="text-center md:text-left space-y-6">
              <p className="text-indigo-400 font-mono text-[9px] uppercase tracking-[0.6em] italic">Available Opportunities</p>
              <h2 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">Active <br /><span className="text-white/5 italic">Targets.</span></h2>
            </div>
            <Link href="/explore" className="group flex items-center gap-4 text-white/20 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] pb-5 border-b-2 border-white/5 hover:border-indigo-500/40 italic">
               View All Programs <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { name: 'Vanguard Unified', reward: '$15k - $50k', type: 'Public', code: 'VGD092', desc: 'Secure the core authentication and payment systems for a leading global infrastructure provider.' },
              { name: 'Nexus Core Infra', reward: '$8k - $30k', type: 'Private', code: 'NXS401', desc: 'Deep-dive analysis into the distributed ledger and cloud orchestration layer of Nexus Technical.' },
              { name: 'Solidity Financial', reward: '$20k - $80k', type: 'Financial', code: 'SOL772', desc: 'Examine high-level cryptographic implementations and smart contract logic across decentralized assets.' }
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -16, scale: 1.01 }}
                className="p-14 glass-panel border border-white/5 hover:border-indigo-500/30 transition-all rounded-[64px] bg-white/[0.01] relative overflow-hidden group h-[580px] flex flex-col justify-between shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.03] rounded-full -translate-x-1/4 translate-y-1/2 blur-3xl group-hover:bg-indigo-500/[0.08] transition-all" />
                
                <div>
                   <div className="flex justify-between items-start mb-16">
                      <div className="w-16 h-16 bg-[#080808] border border-white/10 rounded-2xl flex items-center justify-center font-black text-2xl italic group-hover:bg-white group-hover:text-black transition-all shadow-xl">
                        {p.name[0]}
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-mono text-white/10 block mb-2 uppercase tracking-[0.4em]">{p.code}</span>
                         <span className="text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border border-white/10 text-white/20 group-hover:text-white group-hover:border-indigo-500/40 transition-all italic">{p.type}</span>
                      </div>
                   </div>
                   <h3 className="text-4xl font-black text-white mb-6 italic tracking-tight uppercase">{p.name}</h3>
                   <p className="text-sm text-white/20 leading-relaxed font-medium italic group-hover:text-white/40 transition-colors">{p.desc}</p>
                </div>

                <div className="space-y-8">
                   <div className="space-y-3">
                      <p className="text-[9px] font-mono font-black text-white/10 uppercase tracking-[0.5em] italic">MAX BOUNTY</p>
                      <p className="text-5xl font-black text-white tracking-tighter italic group-hover:text-indigo-400 transition-colors leading-none">{p.reward}</p>
                   </div>
                   <motion.button 
                     className="w-full py-6 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-black uppercase tracking-[0.3em] group-hover:bg-white group-hover:text-black transition-all shadow-xl italic"
                   >
                     View Protocol
                   </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Dark & Minimal */}
      <section className="py-64 px-6 lg:px-12">
         <div className="max-w-6xl mx-auto rounded-[100px] border border-white/5 p-28 md:p-40 text-center relative overflow-hidden group bg-[#060606] shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)]" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 space-y-16"
            >
              <h2 className="text-7xl md:text-[140px] font-black uppercase italic tracking-tighter leading-[0.8] ">
                 Secure The <br />
                 <span className="text-white/5 italic">Logic.</span>
              </h2>
              <p className="text-white/20 text-2xl max-w-2xl mx-auto font-medium italic leading-relaxed">
                 Join the professional collective of researchers securing high-impact digital infrastructure.
              </p>
              
              <div className="flex justify-center pt-8">
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-16 py-8 bg-white text-black font-black text-xs uppercase tracking-[0.4em] rounded-full shadow-[0_30px_70px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all flex items-center gap-6 italic"
                  >
                    Get Started <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
         </div>
      </section>

      <footer className="py-24 border-t border-white/5 bg-[#030303] relative z-10">
        <div className="max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-6 group cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black italic transition-all group-hover:bg-indigo-500 group-hover:text-white shadow-xl">D</div>
             <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-white/20 group-hover:text-white/40">Debugr Network</p>
          </div>
          <p className="text-white/10 text-[9px] font-mono uppercase tracking-[0.5em] italic order-3 md:order-2">
            Security Platform v2.4.0
          </p>
          <div className="flex gap-10 order-2 md:order-3">
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Twitter</span>
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Discord</span>
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-[0.4em] italic">Docs</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
