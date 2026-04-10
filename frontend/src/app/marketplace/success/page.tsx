"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Download, ExternalLink, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Magnetic from '@/components/animation/Magnetic';
import { fetchWithAuth } from '@/lib/api';

export default function MarketplaceSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    const checkStatus = async () => {
      try {
        // Poll backend for order status
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'https://debugr-backend-production.up.railway.app'}/api/marketplace/order-status/${orderId}`);
        const data = await res.json();
        
        if (data.success && data.status === 'PAID') {
          setStatus('success');
        } else if (data.status === 'PENDING') {
           // Retry in 3 seconds
           setTimeout(checkStatus, 3000);
        } else {
           setStatus('error');
        }
      } catch (err) {
        console.error("Status check failed:", err);
        setStatus('error');
      }
    };

    checkStatus();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 overflow-hidden">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 pt-48 pb-32 px-6 flex flex-col items-center justify-center min-h-[80vh]">
        
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Awaiting Block Confirmation...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full space-y-12 text-center"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
                <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10 mx-auto" strokeWidth={1} />
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                  Protocol <span className="text-green-500">Secured</span>
                </h1>
                <p className="text-white/30 text-sm italic font-medium max-w-md mx-auto">
                  Your purchase is complete. The prompt key has been injected into your encrypted vault.
                </p>
              </div>

              <div className="p-10 rounded-[48px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl space-y-8">
                 <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Order ID</span>
                    <span className="text-xs font-mono font-bold text-white/60">{orderId}</span>
                 </div>
                 <div className="flex justify-between items-center py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Delivery Status</span>
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                       <ShieldCheck size={14} /> Instant Access
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Magnetic strength={0.1}>
                      <button 
                        onClick={() => router.push('/dashboard/prompts')}
                        className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] italic flex items-center justify-center gap-3"
                      >
                        Access Vault <Package size={14} />
                      </button>
                    </Magnetic>
                    <Magnetic strength={0.1}>
                      <button 
                        onClick={() => router.push('/marketplace')}
                        className="w-full py-6 border border-white/10 text-white/40 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] italic flex items-center justify-center gap-3 hover:bg-white/5 hover:text-white transition-all"
                      >
                        Continue Exploring <ArrowRight size={14} />
                      </button>
                    </Magnetic>
                 </div>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                 <ExternalLink className="text-red-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black italic uppercase text-white">Handshake Failed</h2>
                <p className="text-white/20 text-xs italic">The transaction could not be verified or was cancelled.</p>
              </div>
              <button 
                onClick={() => router.push('/marketplace')}
                className="px-10 py-5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5"
              >
                Return to Marketplace
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
