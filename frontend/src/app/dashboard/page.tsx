'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import HackerDashboard from '@/components/dashboard/HackerDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

interface User {
  email: string;
  role: string;
  handle?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getCookie('debugr_token');
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        const res = await fetchWithAuth(API_ENDPOINTS.PROFILE);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          deleteCookie('debugr_token');
          router.push('/signin');
        }
      } catch (err) {
        console.error(err);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    deleteCookie('debugr_token');
    window.location.href = '/signin';
  };

  if (loading) {
    return (
      <div className="bg-bg min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-2 border-white/5 border-t-white/40 rounded-full animate-spin mb-8" />
        <p className="subtle-mono text-[10px] animate-pulse">Initializing Interface...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#080808] min-h-screen text-white selection:bg-white/10">
      <Navbar />
      <div className="fixed inset-0 z-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <main className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 pb-20 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Aspect: Identity & Status */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-40">
          <motion.div 
            variants={fadeInUp(0.05)}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-indigo-500" />
              <p className="subtle-mono text-[9px] text-indigo-400 uppercase tracking-[0.3em] font-black">Active Terminal</p>
            </div>
            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
              System <span className="text-white/20">Access.</span>
            </h1>
            
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-inner shrink-0">
                  {user?.email[0].toUpperCase()}
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h2 className="text-xl font-black tracking-tight text-white uppercase truncate">
                    {user?.handle || user?.email.split('@')[0]}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="subtle-mono text-[8px] text-white/20 uppercase tracking-[0.2em] font-black italic">Connected Node</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                  <span>Role Classification</span>
                  <span className="text-indigo-400">{user?.role === 'hacker' ? 'Hacker' : 'Registry Admin'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                  <span>Security Level</span>
                  <span className="text-white/60">Tier 1 Elite</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all italic"
              >
                Terminate Session
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Aspect: Operational Feed */}
        <div className="lg:col-span-8">
          <section className="animate-in fade-in duration-700 delay-150 fill-mode-both">
            {user?.role === 'company' ? <CompanyDashboard /> : <HackerDashboard />}
          </section>
        </div>

      </main>
    </div>
  );
}
