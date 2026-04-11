'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fadeInUp, blurReveal, staggerContainer, drift, scanLine } from '@/lib/animations';
import Magnetic from '@/components/animation/Magnetic';
import { 
  Sparkles, 
  Cpu, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  TrendingUp,
  ShoppingCart,
  Coins,
  ArrowRight,
  Filter,
  BrainCircuit,
  Lock,
  MessageSquareCode,
  Loader2,
  Star
} from 'lucide-react';
import { fetchWithAuth, API_ENDPOINTS, API_URL } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { useEffect } from 'react';

interface Prompt {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  likes_count: number;
  avg_rating: number;
  seller_handle: string;
  seller_avatar: string;
  created_at: string;
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const categories = [
    { title: 'All', icon: <Sparkles size={20} />, label: 'Intelligence' },
    { title: 'Jailbreak', icon: <Lock size={20} />, label: 'Bypass' },
    { title: 'Security', icon: <ShieldCheck size={20} />, label: 'Protection' },
    { title: 'Optimization', icon: <Zap size={20} />, label: 'Performance' },
    { title: 'Logic', icon: <BrainCircuit size={20} />, label: 'Reasoning' }
  ];

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const url = new URL(`${API_URL}/api/marketplace`);
        if (activeCategory !== 'All') url.searchParams.append('category', activeCategory);
        if (search) url.searchParams.append('search', search);

        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success) {
          setPrompts(data.prompts);
        }
      } catch (err) {
        console.error("Failed to fetch prompts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchPrompts, search ? 500 : 0);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-amber-500/30 overflow-x-hidden font-sans">
      {/* Background Ambience - Amber Theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500/5 blur-[100px] rounded-full" />

        <motion.div 
          variants={scanLine}
          initial="hidden"
          animate="visible"
          className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-amber-500/20 to-transparent z-10"
        />
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
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-amber-500">Market</span>
                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">Verified Hacks</span>
              </motion.div>
              
              <motion.h1 
                variants={blurReveal} 
                className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.8] uppercase"
              >
                {Array.from("Prompt").map((char, i) => (
                  <motion.span key={i} variants={drift(i * 0.05)} className="inline-block">{char}</motion.span>
                ))}
                <br />
                <span className="text-white/5 italic">
                  {Array.from("Marketplace.").map((char, i) => (
                    <motion.span key={i} variants={drift(i * 0.05 + 0.3)} className="inline-block">{char}</motion.span>
                  ))}
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp()} className="text-xl text-white/30 font-medium italic max-w-xl leading-relaxed">
                Source and sell high-performance AI methods. From bypass methods to logic optimization, trade knowledge directly.
              </motion.p>
            </div>

            <motion.div variants={fadeInUp()}>
               <Link href="/marketplace/sell">
                  <Magnetic strength={0.2}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-6 bg-amber-500 text-black font-black text-xs uppercase tracking-[0.3em] rounded-full shadow-[0_20px_60px_rgba(245,158,11,0.2)] transition-all flex items-center gap-4 italic"
                    >
                      Sell your Prompts <Coins size={14} className="animate-bounce" />
                    </motion.button>
                  </Magnetic>
               </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Search & Categories Bar */}
        <section className="mb-20 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-amber-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search methods, models, or hunters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-6 pl-16 pr-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-white italic font-medium placeholder:text-white/10 outline-none transition-all focus:bg-white/[0.04] focus:border-amber-500/20 shadow-2xl"
              />
            </div>

            <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-full flex gap-1 h-[76px] items-center px-4 overflow-x-auto no-scrollbar">
               {categories.map(cat => (
                 <button 
                   key={cat.title}
                   onClick={() => setActiveCategory(cat.title)}
                   className={`
                     group flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic whitespace-nowrap
                     ${activeCategory === cat.title 
                       ? 'bg-amber-500 text-black shadow-2xl' 
                       : 'bg-transparent text-white/20 hover:text-white/40'
                     }
                   `}
                 >
                   <span className={activeCategory === cat.title ? 'text-black' : 'text-amber-500/40'}>{cat.icon}</span>
                   {cat.title}
                 </button>
               ))}
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
               <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Syncing Marketplace...</p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20 border-2 border-dashed border-white/5 rounded-[56px]">
               <BrainCircuit className="w-12 h-12 text-white/10" />
               <p className="text-xs font-bold text-white/30 italic">No protocols found matching your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 lg:gap-24">
              <AnimatePresence mode="popLayout">
                {prompts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/marketplace/prompt/${p.id}`} className="block">
                      <Magnetic strength={0.02}>
                        <div className="min-h-[500px] md:min-h-[640px] p-10 md:p-24 rounded-[96px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-amber-500/40 transition-all duration-1000 flex flex-col lg:flex-row gap-20 group relative overflow-hidden backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                           {/* Premium Atmosphere */}
                           <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/[0.03] blur-[150px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                           <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/[0.02] blur-[150px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                           
                           {/* Details */}
                           <div className="flex-1 flex flex-col justify-between relative z-10">
                              <div>
                                 <div className="flex items-center gap-6 mb-12">
                                    <div className="w-20 h-20 bg-black/60 border border-white/10 rounded-[32px] flex items-center justify-center text-3xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                       <MessageSquareCode size={32} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <div className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] italic text-white/40 inline-block w-fit">
                                          {p.category}
                                       </div>
                                       <div className="flex items-center gap-2 mt-2">
                                          {[1, 2, 3, 4, 5].map((_, i) => (
                                             <Star key={i} size={12} className={i < Math.floor(p.avg_rating) ? 'text-amber-500 fill-amber-500' : 'text-white/5'} />
                                          ))}
                                          <span className="text-[10px] font-mono text-white/20 font-black">{parseFloat(p.avg_rating as any).toFixed(1)}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <h3 className="text-6xl md:text-9xl font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-12 group-hover:text-amber-500 transition-all duration-700 max-w-5xl">
                                   {p.title}
                                 </h3>
                                 <p className="text-white/25 text-2xl font-medium italic line-clamp-3 md:line-clamp-4 leading-relaxed mb-20 group-hover:text-white/60 transition-colors duration-700 max-w-4xl">
                                   {p.description}
                                 </p>

                                 <div className="flex items-center gap-6 p-4 rounded-full bg-white/[0.02] border border-white/5 w-fit pr-10">
                                    <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden border-2 border-white/10 shadow-2xl">
                                       <img src={p.seller_avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.3em] italic">Origin Signal</span>
                                       <span className="text-sm font-black uppercase tracking-widest text-white/50 italic group-hover:text-amber-500 transition-colors">@{p.seller_handle}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Commercials */}
                           <div className="w-full lg:w-auto lg:min-w-[320px] pt-16 lg:pt-0 lg:pl-16 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col justify-between items-end lg:items-start relative z-10">
                              <div className="space-y-6 w-full text-right lg:text-left">
                                 <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 inline-block group-hover:bg-amber-500/5 transition-colors">
                                    <p className="text-[11px] font-mono font-black text-amber-500 uppercase tracking-[0.4em] italic">Circulation: {p.likes_count} Units</p>
                                 </div>
                                 <div className="flex items-center gap-4 justify-end lg:justify-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] italic font-black">Trade Status: ACTIVE</span>
                                 </div>
                              </div>

                              <div className="text-right lg:text-left mt-20 lg:mt-0 w-full">
                                 <p className="text-[10px] font-mono font-black text-white/5 uppercase tracking-[0.5em] italic mb-6">Settlement Value</p>
                                 <div className="flex flex-col lg:flex-row lg:items-end justify-end lg:justify-start gap-12">
                                    <p className="text-8xl md:text-[10rem] font-black text-white italic tracking-tighter leading-none">
                                       {p.price > 0 ? formatPrice(p.price) : "ZERO"}
                                    </p>
                                    <div className="w-24 h-24 rounded-[32px] border border-white/10 flex items-center justify-center text-white/5 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 group-hover:shadow-[0_0_80px_rgba(245,158,11,0.5)] transition-all duration-700 self-end lg:self-auto translate-y-4">
                                       <ChevronRight size={40} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </Magnetic>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

      </main>

      <footer className="py-24 border-t border-white/5 bg-[#030303] relative z-10">
        <div className="max-w-[1400px] mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-6 group">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black italic group-hover:bg-amber-500 group-hover:text-black shadow-xl">D</div>
             <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-white/20">Debugr Marketplace</p>
          </div>
          <p className="text-white/10 text-[8px] font-mono uppercase tracking-[0.5em] italic">
            Knowledge Node // Commission 20%
          </p>
          <div className="flex gap-10">
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all uppercase tracking-[0.4em] italic cursor-pointer">Terms</span>
             <span className="text-[9px] font-mono text-white/10 hover:text-white transition-all uppercase tracking-[0.4em] italic cursor-pointer">Licensing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
