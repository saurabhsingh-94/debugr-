'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { blurReveal, staggerContainer } from '@/lib/animations';
import { setCookie, API_URL } from '@/lib/api';

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
        router.push('/dashboard');
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
    <div className="min-h-screen bg-[#080808] text-[#f5f5f7] relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(157,80,187,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>
      
      <Navbar />

      <main className="w-full min-h-screen relative z-10 lg:grid lg:grid-cols-2">
        
        {/* Left Side: Context & Branding (Desktop Only) */}
        <section className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden">
          <motion.div 
            variants={staggerContainer(0.1, 0.2)}
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-12 relative z-10"
          >
            <motion.div variants={blurReveal}>
              <p className="subtle-mono text-[10px] text-indigo-400 uppercase tracking-[0.4em] mb-4 font-black italic">Access Your Account</p>
              <h1 className="text-7xl font-black italic tracking-tighter leading-[0.9] uppercase">
                Welcome<br /><span className="text-white/20">Back.</span>
              </h1>
            </motion.div>

            <motion.div variants={blurReveal} className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">🤝</div>
                <div>
                  <h2 className="text-sm font-black uppercase italic tracking-widest text-white mb-1">Secure Sign-In</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed">Your data is safe with us. We use industry-standard encryption to keep your account secure.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">📈</div>
                <div>
                  <h2 className="text-sm font-black uppercase italic tracking-widest text-white mb-1">Track Progress</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed">Check your latest bounties and rankings across the platform.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full opacity-40 pointer-events-none" />
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
                Login.
              </motion.h1>
            </div>

            {/* Form Vessel */}
            <motion.div 
              variants={blurReveal}
              className="glass-panel p-8 md:p-12 rounded-[48px] shadow-2xl border border-white/10 bg-white/[0.01] backdrop-blur-2xl"
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">
                    Username or email
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="input-focus-glow w-full py-5 px-7 rounded-2xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner placeholder:text-white/10"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">
                    Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-focus-glow w-full py-5 px-7 rounded-2xl bg-white/2 border border-white/5 text-white text-sm transition-all shadow-inner placeholder:text-white/10"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-rose-500 text-[10px] font-black text-center p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 uppercase tracking-widest italic"
                    >
                      !! {error} !!
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-sm font-black bg-white text-black rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] italic hover:bg-white/90"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>
            </motion.div>

            {/* Footer Link */}
            <motion.div variants={blurReveal} className="text-center">
              <p className="text-[12px] text-white/20 font-medium tracking-tight">
                New identity? <Link href="/signup" className="text-white font-black hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px] ml-2">Register Here</Link>
              </p>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
