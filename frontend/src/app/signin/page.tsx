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
    <div className="min-h-screen bg-transparent text-[#f5f5f7] relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="aurora-bg">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
      </div>
      <Navbar />

      <main className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] min-h-screen relative z-10">
        
        {/* Left Side: Modern Context Panel */}
        <section className="hidden lg:flex flex-col gap-10 p-[160px_8%_60px_12%] border-r border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 h-screen">
          <motion.div variants={staggerContainer(0.1, 0.3)} initial="hidden" animate="visible">
            <motion.div variants={blurReveal} className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-indigo-500" />
              <p className="subtle-mono text-indigo-400">
                Sign In
              </p>
            </motion.div>
            
            <motion.h1 
              variants={blurReveal}
              className="hero-title text-7xl font-black italic tracking-tighter mb-8 leading-[0.8] uppercase"
            >
              Welcome<br /><span className="text-white/20">Back.</span>
            </motion.h1>
            
            <motion.p variants={blurReveal} className="text-t2 text-xl font-medium tracking-tight leading-relaxed max-w-[440px] italic">
              Log in to continue securing platforms and earning bounties. Let's make the internet safer together.
            </motion.p>
          </motion.div>
        </section>

        {/* Right Side: Form */}
        <section className="flex flex-col items-center justify-center p-[40px] md:p-[60px] lg:p-[100px] min-h-screen">
          <motion.div 
            variants={staggerContainer(0.12, 0.2)}
            initial="hidden"
            animate="visible"
            className="w-full max-max-w-[420px] glass-panel p-[32px] md:p-[40px] rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10"
          >
            <motion.div variants={blurReveal} className="mb-[40px] text-center lg:hidden">
              <p className="subtle-mono mb-[16px] text-indigo-400">Sign In</p>
              <h1 className="hero-title text-[42px] mb-[12px] leading-tight uppercase italic font-black">Welcome Back</h1>
            </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[32px]">
            <motion.div variants={blurReveal} className="flex flex-col gap-[12px]">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-[4px]">
                Username
              </label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username or Email"
                className="input-focus-glow w-full py-[22px] px-[28px] rounded-[24px] bg-white/2 border border-white/5 text-white text-[15px] font-medium transition-all shadow-inner"
              />
            </motion.div>

            <motion.div variants={blurReveal} className="flex flex-col gap-[12px]">
              <div className="flex justify-between items-center pr-[4px]">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-[4px]">
                  Password
                </label>
              </div>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="input-focus-glow w-full py-[22px] px-[28px] rounded-[24px] bg-white/2 border border-white/5 text-white text-[15px] transition-all shadow-inner"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-rose-500 text-[11px] font-black text-center p-[16px] bg-rose-500/5 rounded-[18px] border border-rose-500/10 uppercase tracking-widest italic"
                >
                  !! {error} !!
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button 
              variants={blurReveal}
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 0 40px rgba(157, 80, 187, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-[24px] text-[15px] font-black bg-white text-black rounded-[24px] shadow-2xl transition-all uppercase tracking-widest hover:italic"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>

            <motion.div variants={blurReveal} className="text-center mt-[10px]">
              <p className="text-[13px] text-white/20 font-medium tracking-tight">
                New here? <Link href="/signup" className="text-white font-black hover:text-indigo-400 transition-colors">Create your account</Link>
              </p>
            </motion.div>
          </form>
          </motion.div>
        </section>
      </main>


    </div>
  );
}
