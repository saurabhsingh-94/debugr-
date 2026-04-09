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
    <div className="bg-bg min-h-screen text-white selection:bg-white/10">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Profile Identity Bar */}
        <motion.div 
          variants={fadeInUp()}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 p-8 rounded-[32px] bg-white/2 border border-white/5 backdrop-blur-3xl shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-inner">
              {user?.email[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-white uppercase group-hover:text-indigo-400 transition-colors">
                {user?.handle || user?.email.split('@')[0]}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="subtle-mono text-[9px] text-white/20 uppercase tracking-widest font-black">
                  {user?.role === 'HACKER' ? 'Elite Security Specialist' : 'Organization'} Identity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={handleLogout}
              className="w-full md:w-auto px-6 py-3 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        <section className="animate-in fade-in duration-700 delay-150 fill-mode-both">
          {user?.role === 'company' ? <CompanyDashboard /> : <HackerDashboard />}
        </section>

      </main>
    </div>
  );
}
