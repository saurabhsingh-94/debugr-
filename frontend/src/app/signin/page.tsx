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
        // Redirect based on role
        if (data.user.role === 'company') {
          router.push('/dashboard/company');
        } else {
          router.push('/dashboard');
        }
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
    <div style={{ minHeight: '100vh', background: '#050505', color: '#f5f5f7', position: 'relative', overflowX: 'hidden' }}>
      {/* Background Aurora Effect */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1 animate-breathing" style={{ opacity: 0.1 }} />
        <div className="aurora-blob blob-2 animate-breathing" style={{ opacity: 0.1, animationDelay: '-4s' }} />
        <div className="aurora-blob blob-3 animate-breathing" style={{ opacity: 0.1, animationDelay: '-2s' }} />
      </div>

      <Navbar />

      <main style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '100px 5% 50px',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div 
          variants={staggerContainer(0.12, 0.2)}
          initial="hidden"
          animate="visible"
          className="glass-panel"
          style={{ 
            width: '100%', 
            maxWidth: '480px', 
            padding: '48px', 
            borderRadius: '32px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <motion.div variants={blurReveal} style={{ marginBottom: '40px', textAlign: 'center' }}>
            <p className="subtle-mono" style={{ marginBottom: '16px' }}>Secure Protocol 2.0</p>
            <h1 className="hero-title" style={{ fontSize: '42px', marginBottom: '12px' }}>Welcome Back</h1>
            <p style={{ color: '#a1a1a6', fontSize: '15px' }}>Enter your credentials to resume operations.</p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <motion.div variants={blurReveal} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>
                Identity / Handle <span style={{ color: 'var(--accent-purple)' }}>*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your handle or email"
                className="input-focus-glow"
                style={{
                  width: '100%', padding: '20px 24px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', transition: 'all 0.3s'
                }}
              />
            </motion.div>

            <motion.div variants={blurReveal} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>
                  Passcode <span style={{ color: 'var(--accent-blue)' }}>*</span>
                </label>
              </div>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="input-focus-glow"
                style={{
                  width: '100%', padding: '20px 24px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', transition: 'all 0.3s'
                }}
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ color: '#ff4b4b', fontSize: '13px', fontWeight: 600, textAlign: 'center', padding: '14px', background: 'rgba(255,75,75,0.08)', borderRadius: '14px', border: '1px solid rgba(255,75,75,0.2)' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button 
              variants={blurReveal}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-luminous"
              style={{ 
                width: '100%', padding: '22px', fontSize: '16px', fontWeight: 800, 
                background: '#fff', color: '#000', borderRadius: '18px', cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none', transition: 'all 0.3s'
              }}
            >
              {loading ? 'Authenticating...' : 'Resume Operation'}
            </motion.button>

            <motion.div variants={blurReveal} style={{ textAlign: 'center', marginTop: '10px' }}>
              <p style={{ fontSize: '14px', color: '#6e6e73' }}>
                New to the grid? <Link href="/signup" style={{ color: '#fff', fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px' }}>Initialize Profile</Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </main>

      {/* Security Status Pill */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}
      >
        <div className="glass-panel" style={{ padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="animate-breathing" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff41', boxShadow: '0 0 10px #00ff41' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', color: '#a1a1a6' }}>ENCRYPTION ACTIVE</span>
        </div>
      </motion.div>
    </div>
  );
}
