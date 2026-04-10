'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { 
  ShieldCheck, 
  Activity, 
  ArrowLeft, 
  ArrowRight,
  Fingerprint,
  Lock,
  ChevronRight
} from 'lucide-react';
import { getCookie, setCookie, API_URL } from '@/lib/api';
import { blurReveal, staggerContainer, hoverScale, tapScale } from '@/lib/animations';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setCookie('debugr_token', data.token);
        router.push('/explore');
      } else {
        setError(data.error || data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] relative overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(157,80,187,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>
      
      <Navbar />

      <main className="w-full min-h-screen relative z-10 lg:grid lg:grid-cols-2">
        
        {/* Left Side: Context & Branding (Desktop Only) */}
        <section className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden bg-white/[0.01]">
          <motion.div 
            variants={staggerContainer(0.1, 0.2)}
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-12 relative z-10"
          >
            <motion.div variants={blurReveal}>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400">SIGN IN</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">SECURE ACCESS</span>
              </div>
              <h1 className="text-7xl font-black italic tracking-tighter leading-[0.9] uppercase">
                Welcome <br /><span className="text-white/20">Back.</span>
              </h1>
            </motion.div>

            <motion.div variants={blurReveal} className="space-y-10">
              <div className="flex gap-8 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                   <ShieldCheck className="text-indigo-400/60" size={24} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase italic tracking-widest text-white mb-2">Secure Login</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed max-w-sm">Access your secure dashboard to manage vulnerability reports and bounty payments.</p>
                </div>
              </div>
              <div className="flex gap-8 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                   <Activity className="text-indigo-400/60" size={24} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase italic tracking-widest text-white mb-2">Live Updates</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed max-w-sm">Track real-time updates and collaborate directly with security teams from your account.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full opacity-40 pointer-events-none" />
        </section>

        {/* Right Side: Authentication Vessel */}
        <section className="flex items-center justify-center p-6 md:p-12 relative">
          <motion.div 
            variants={staggerContainer(0.12, 0.4)}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[440px] space-y-12"
          >
            {/* Header (Mobile Only) */}
            <div className="text-center space-y-4 lg:hidden">
              <motion.h1 
                variants={blurReveal}
                className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]"
              >
                Sign In.
              </motion.h1>
            </div>

            {/* Form Vessel */}
            <motion.div 
              variants={blurReveal}
              className="glass-panel p-10 md:p-14 rounded-[56px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5 bg-white/[0.01] backdrop-blur-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative z-10">
                <div className="flex flex-col gap-4">
                  <label className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.4em] ml-2">
                    Username or Email
                  </label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter handle or email"
                      className="w-full py-6 pl-16 pr-8 rounded-2xl bg-white/[0.03] border border-white/5 text-white text-sm font-medium transition-all focus:bg-white/[0.05] focus:border-indigo-500/30 outline-none shadow-inner placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.4em] ml-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full py-6 pl-16 pr-8 rounded-2xl bg-white/[0.03] border border-white/5 text-white text-sm transition-all focus:bg-white/[0.05] focus:border-indigo-500/30 outline-none shadow-inner placeholder:text-white/10"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-rose-400 text-[10px] font-mono font-black text-center p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 uppercase tracking-widest italic"
                    >
                      ERR: {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  type="submit" 
                  disabled={loading} 
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-7 text-xs font-black bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/20 transition-all uppercase tracking-[0.3em] italic hover:bg-indigo-500"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </motion.button>
              </form>
            </motion.div>

            {/* Footer Link */}
            <motion.div variants={blurReveal} className="text-center">
              <p className="text-center text-white/20 font-medium text-[12px] tracking-tight">
                New researcher? <Link href="/signup" className="group text-white font-black hover:text-indigo-400 transition-all uppercase tracking-[0.2em] text-[10px] ml-3 inline-flex items-center gap-2">Sign Up <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /></Link>
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
