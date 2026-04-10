'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowLeft, 
  ShieldCheck, 
  Info, 
  CreditCard,
  Building2,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import CashfreeCheckout from '@/components/payment/CashfreeCheckout';
import Magnetic from '@/components/animation/Magnetic';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';

export default function AddFundsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(5000);
  const [phone, setPhone] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth(API_ENDPOINTS.PROFILE);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setPhone(data.user.phone || '9999999999');
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const quickAmounts = [1000, 5000, 10000, 25000];

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse delay-700" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 pt-40 pb-32 px-6 lg:px-[10%] max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-16 space-y-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] italic mx-auto"
            >
              <Wallet size={14} /> Currency Protocol
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-white"
            >
              Treasury <br/> Integration
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/40 font-medium italic max-w-2xl mx-auto"
            >
              Deposit funds to your company vault to initialize research bounties and secure platform-wide acquisitions.
            </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-12 max-w-6xl mx-auto items-start">
            
            {/* Payment Configuration */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="p-10 lg:p-14 rounded-[56px] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-3xl space-y-12"
            >
                {/* Amount Selection */}
                <div className="space-y-8">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Balance Injection</p>
                      <TrendingUp size={16} className="text-green-500" />
                   </div>
                   
                   <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-5xl font-black italic text-white/20">₹</span>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-transparent border-b-2 border-white/5 hover:border-white/20 focus:border-indigo-500 py-8 pl-14 text-7xl font-black italic tracking-tighter text-white outline-none transition-all placeholder:text-white/5"
                        placeholder="0"
                      />
                   </div>

                   <div className="flex flex-wrap gap-3 pt-4">
                      {quickAmounts.map((q) => (
                        <button
                          key={q}
                          onClick={() => setAmount(q)}
                          className={`px-6 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${amount === q ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                        >
                          +₹{q.toLocaleString()}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Contact Verification */}
                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Verification Protocol</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Vault Identifier</p>
                         <p className="text-xs font-black text-white italic truncate">{user?.handle || 'Unknown Node'}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Authorized Mobile</p>
                         <input 
                           type="text"
                           value={phone}
                           onChange={(e) => setPhone(e.target.value)}
                           className="bg-transparent border-none p-0 text-xs font-black text-white italic outline-none w-full"
                           placeholder="Enter Mobile"
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-6">
                    <CashfreeCheckout 
                      amount={amount}
                      customerDetails={{
                        customer_id: user?.id?.toString() || 'guest',
                        customer_phone: phone,
                        customer_name: user?.name || 'Authorized Client'
                      }}
                    />
                </div>
            </motion.div>

            {/* Platform Trust & Info */}
            <div className="space-y-8">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="p-10 rounded-[48px] bg-indigo-500/5 border border-indigo-500/10 space-y-6"
               >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Military-Grade Security</h3>
                  <p className="text-sm text-white/40 font-medium italic leading-relaxed">
                    All financial operations are executed through isolated sub-networks. Private keys are never stored on platform nodes, ensuring end-to-end treasury protection.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-2 gap-6"
               >
                  <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.02] space-y-4">
                     <Zap size={20} className="text-amber-500" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Instant Sync</p>
                  </div>
                  <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.02] space-y-4">
                     <Building2 size={20} className="text-white/40" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tax Ready</p>
                  </div>
               </motion.div>

               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-4 p-8 rounded-[40px] border border-dashed border-white/10"
               >
                  <Info size={18} className="text-white/20 shrink-0 mt-1" />
                  <p className="text-[10px] font-medium leading-relaxed italic text-white/20 uppercase tracking-widest">
                    Standard processing times for block confirmations may vary significantly depending on network congestion and gateway protocol latency.
                  </p>
               </motion.div>
            </div>

        </div>

      </main>
    </div>
  );
}
