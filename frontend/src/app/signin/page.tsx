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
      setError('Connection refused. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] relative overflow-x-hidden">
      {/* Background Aurora Effect */}
      <div className="aurora-bg">
        <div className="aurora-blob animate-breathing opacity-40 blur-3xl shadow-[0_0_100px_rgba(157,80,187,0.3)]" style={{ background: '#9d50bb', top: '-10%', left: '-10%' }} />
        <div className="aurora-blob animate-breathing opacity-30 delay-[-4s] blur-2xl" style={{ background: '#c084fc', bottom: '-10%', right: '-10%' }} />
        <div className="aurora-blob animate-breathing opacity-50 delay-[-2s] blur-3xl shadow-[0_0_100px_rgba(31,31,31,0.5)]" style={{ background: '#050505', top: '30%', right: '20%' }} />
      </div>

      <Navbar />

      <main className="w-full flex items-center justify-center min-h-screen px-[5%] pt-[100px] pb-[50px] relative z-10">
        <motion.div 
          variants={staggerContainer(0.12, 0.2)}
          initial="hidden"
          animate="visible"
          className="glass-panel w-full max-w-[480px] p-[48px] rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10"
        >
          <motion.div variants={blurReveal} className="mb-[40px] text-center">
            <p className="subtle-mono mb-[16px] text-indigo-400">Secure Access</p>
            <h1 className="hero-title text-[42px] mb-[12px] leading-tight uppercase italic font-black">Welcome Back</h1>
            <p className="text-[#a1a1a6] text-[15px] font-medium italic opacity-60">Authentication required to access the perimeter.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[32px]">
            <motion.div variants={blurReveal} className="flex flex-col gap-[12px]">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-[4px]">
                Researcher Identity
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
                  Passcode
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
              {loading ? 'Verifying Identity...' : 'Login Now'}
            </motion.button>

            <motion.div variants={blurReveal} className="text-center mt-[10px]">
              <p className="text-[13px] text-white/20 font-medium tracking-tight">
                New researcher? <Link href="/signup" className="text-white font-black hover:text-indigo-400 transition-colors">Apply for access</Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </main>

      {/* Security Status Pill */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-[40px] left-1/2 -translate-x-1/2 z-[100]"
      >
        <div className="glass-panel py-[12px] px-[24px] rounded-full flex items-center gap-[12px] border border-white/5 shadow-2xl">
          <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[9px] font-black tracking-[0.4em] text-white/30 uppercase">Perimeter Secure</span>
        </div>
      </motion.div>
    </div>
  );
}
