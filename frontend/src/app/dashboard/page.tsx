'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import HackerDashboard from '@/components/dashboard/HackerDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { 
  Shield, 
  User, 
  Terminal, 
  Power, 
  Fingerprint, 
  Lock, 
  Activity,
  Globe
} from 'lucide-react';

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
      <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
          <div className="absolute inset-0 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse" />
        </div>
        <p className="subtle-mono text-[10px] text-white/20 uppercase tracking-[0.4em] animate-pulse italic">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#080808] min-h-screen text-white selection:bg-indigo-500/20">
      <Navbar />

      {/* Global Ambience */}

      <div className="fixed top-0 left-0 w-full h-[500px] bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative w-full px-8 md:px-16 lg:px-24 pt-44 pb-32 z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
        
        {/* Left Aspect: Identity & Status */}
        <div className="lg:col-span-3 space-y-12 lg:sticky lg:top-44">
          <motion.div 
            variants={fadeInUp(0.05)}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[1px] w-10 bg-indigo-500/40" />
              <p className="subtle-mono text-[9px] text-indigo-400 uppercase tracking-[0.4em] font-black italic">IDENTITY STATUS</p>
            </div>

            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8] mb-12">
              Identity <br />
              <span className="text-white/5 italic">Status.</span>
            </h1>
            
            <div className="p-8 md:p-10 rounded-[48px] glass-panel border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-500/[0.05] transition-all" />
              
              <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent" />
                    {user?.email[0].toUpperCase()}
                  </div>
                  <div className="space-y-2 min-w-0">
                    <h2 className="text-xl font-black tracking-tight text-white uppercase italic truncate">
                      {user?.handle || user?.email.split('@')[0]}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                      <p className="subtle-mono text-[8px] text-white/20 uppercase tracking-[0.2em] font-black italic">Active Researcher</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-xl transition-all cursor-default">
                    <div className="flex items-center gap-3">
                      <Shield size={12} className="text-white/20 group-hover/item:text-indigo-400 transition-colors" />
                      <span className="subtle-mono text-[8px] font-black uppercase tracking-widest text-white/30">Identity Role</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic">
                      {user?.role === 'hacker' ? 'Researcher' : 'Admin'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-xl transition-all cursor-default">
                    <div className="flex items-center gap-3">
                      <Activity size={12} className="text-white/20 group-hover/item:text-indigo-400 transition-colors" />
                      <span className="subtle-mono text-[8px] font-black uppercase tracking-widest text-white/30">Registry Status</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 italic">Online</span>
                  </div>
                </div>

                <motion.button 
                   onClick={handleLogout}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="w-full py-4 rounded-3xl bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all italic flex items-center justify-center gap-3 mt-4"
                 >
                   <Power size={11} />
                   Sign Out
                 </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Aspect: Dashboard Activity */}
        <div className="lg:col-span-9">
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
            {user?.role === 'company' ? <CompanyDashboard /> : <HackerDashboard />}
          </section>
        </div>

      </main>
    </div>
  );
}

