'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { inView } from '@/lib/animations';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect based on role
        if (data.user.role === 'company') {
          router.push('/dashboard/company');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)' }}>
      <Navbar />

      <main style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', minHeight: '100vh' }}>
        
        {/* ─── Brand / Visual (Left) ─── */}
        <section style={{ 
          padding: '160px 60px 60px 8%', 
          borderRight: '1px solid var(--line)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
          display: 'flex', flexDirection: 'column', gap: 40,
          position: 'sticky', top: 0, height: '100vh'
        }}>
          <motion.div variants={inView()} initial="hidden" animate="visible">
            <p className="mono" style={{ fontSize: 11, color: 'var(--t2)', letterSpacing: '0.2em', marginBottom: 16 }}>SECURE PROTOCOL</p>
            <h1 className="metallic-text" style={{ fontSize: 'clamp(40px, 4vw, 64px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
              Resuming<br />Operations.
            </h1>
            <p style={{ color: 'var(--t2)', fontSize: 16, lineHeight: 1.6, maxWidth: 360 }}>
              Re-establish your connection to the global security grid. Your session is protected by multi-layer encryption.
            </p>
          </motion.div>

          <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid var(--line)' }}>
            <p className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 16, textTransform: 'uppercase' }}>Security status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff41', boxShadow: '0 0 10px #00ff41' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>End-to-End Encryption Active</span>
            </div>
          </div>
        </section>

        {/* ─── Form (Right) ─── */}
        <section style={{ padding: '0 10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            style={{ width: '100%', maxWidth: 440 }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identity (Email)</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hacker@debugr.tst"
                    style={{
                      width: '100%', padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--line)', color: '#fff', fontSize: 15, transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passcode</label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--line)', color: '#fff', fontSize: 15, transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: '#ff4b4b', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '12px', background: 'rgba(255,75,75,0.05)', borderRadius: 12 }}>
                  {error}
                </p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="metallic-button"
                style={{ width: '100%', padding: '20px', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--t3)' }}>
                New to the grid? <a href="/signup" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Initialize Profile</a>
              </p>
            </form>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
