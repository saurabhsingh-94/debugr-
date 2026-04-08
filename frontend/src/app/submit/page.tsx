'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { blurReveal, staggerContainer } from '@/lib/animations';

interface Program {
  id: string;
  name: string;
  reward_max: string;
}

export default function SubmitReport() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    program_id: '',
    title: '',
    severity: 'medium',
    asset: '',
    description: '',
    impact: '',
    steps_to_reproduce: '',
  });

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetchWithAuth('/api/programs');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPrograms(data.programs);
          }
        }
      } catch {
        console.error('Failed to load programs');
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.REPORTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard?submitted=true');
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)' }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '160px 24px 100px' }}>
        <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="visible">
          <motion.p variants={blurReveal} className="mono" style={{ fontSize: 11, color: 'var(--t2)', letterSpacing: '0.4em', marginBottom: 16 }}>
            STEP 0{step} {'//'} {step === 1 ? 'TARGET' : step === 2 ? 'DETAILS' : step === 3 ? 'TECHNICAL' : 'REVIEW'}
          </motion.p>
          <motion.h1 variants={blurReveal} className="metallic-text" style={{ fontSize: 48, fontWeight: 900, marginBottom: 48 }}>
            Submit <span className="text-gradient">Intelligence.</span>
          </motion.h1>
        </motion.div>

        <div className="glass-panel" style={{ padding: 48, borderRadius: 32, border: '1px solid var(--line)' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Select target program</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loading ? <p>Loading targets...</p> : programs.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setFormData({ ...formData, program_id: p.id }); nextStep(); }}
                      style={{
                        padding: '20px 24px', borderRadius: 16, textAlign: 'left',
                        background: formData.program_id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: `1px solid ${formData.program_id === p.id ? '#fff' : 'var(--line)'}`,
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#fff' }}>{p.name}</span>
                      <span className="subtle-mono" style={{ fontSize: 10 }}>UP TO ${Number(p.reward_max).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Classification</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="field">
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>VULNERABILITY TITLE</label>
                    <input 
                      type="text" className="neon-focus" placeholder="e.g. SQL Injection on login endpoint"
                      style={{ width: '100%', padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', color: '#fff' }}
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>AFFECTED ASSET</label>
                    <input 
                      type="text" className="neon-focus" placeholder="e.g. api.debugr.ops"
                      style={{ width: '100%', padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', color: '#fff' }}
                      value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>SEVERITY</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['low', 'medium', 'high', 'critical'].map(s => (
                        <button
                          key={s} type="button" onClick={() => setFormData({...formData, severity: s})}
                          style={{
                            flex: 1, padding: 12, borderRadius: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                            background: formData.severity === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: `1px solid ${formData.severity === s ? '#fff' : 'var(--line)'}`,
                            color: formData.severity === s ? '#fff' : 'var(--t3)', cursor: 'pointer'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button onClick={prevStep} style={{ flex: 1, padding: 16, borderRadius: 12, border: '1px solid var(--line)', color: '#fff', cursor: 'pointer' }}>Back</button>
                    <button onClick={nextStep} style={{ flex: 2, padding: 16, borderRadius: 12, background: '#fff', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Technical Specs</button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Technical Evidence</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>DESCRIPTION & IMPACT</label>
                    <textarea 
                      style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', color: '#fff' }}
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>STEPS TO REPRODUCE</label>
                    <textarea 
                      style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', color: '#fff' }}
                      value={formData.steps_to_reproduce} onChange={e => setFormData({...formData, steps_to_reproduce: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button onClick={prevStep} style={{ flex: 1, padding: 16, borderRadius: 12, border: '1px solid var(--line)', color: '#fff', cursor: 'pointer' }}>Back</button>
                    <button onClick={nextStep} style={{ flex: 2, padding: 16, borderRadius: 12, background: '#fff', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Review & Transmit</button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Final Audit</h2>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 32, borderRadius: 24, border: '1px solid var(--line)', marginBottom: 32 }}>
                  <p className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 8 }}>TITLE</p>
                  <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>{formData.title}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <p className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>SEVERITY</p>
                      <p style={{ textTransform: 'uppercase', fontWeight: 800, color: formData.severity === 'critical' ? '#e5334b' : '#fff' }}>{formData.severity}</p>
                    </div>
                    <div>
                      <p className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>TARGET</p>
                      <p style={{ fontWeight: 700 }}>{programs.find(p => p.id === formData.program_id)?.name}</p>
                    </div>
                  </div>
                </div>
                {error && <p style={{ color: '#ff4d4d', marginBottom: 24 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={prevStep} style={{ flex: 1, padding: 16, borderRadius: 12, border: '1px solid var(--line)', color: '#fff', cursor: 'pointer' }}>Back</button>
                  <button 
                    disabled={submitting} onClick={handleSubmit}
                    className="btn-luminous" style={{ flex: 2, padding: 20, fontSize: 16 }}
                  >
                    {submitting ? 'TRANSMITTING...' : 'SECURE SUBMISSION'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
