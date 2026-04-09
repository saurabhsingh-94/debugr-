'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { 
  blurReveal, 
  staggerContainer, 
  fadeInUp, 
  hoverScale, 
  tapScale,
  springSoft
} from '@/lib/animations';

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
            setPrograms(data.programs || []);
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
    <div className="min-h-screen text-white/90 selection:bg-indigo-500/30 bg-bg">
      <Navbar />

      <main className="relative max-w-4xl mx-auto px-6 pt-40 pb-20">
        <motion.div 
          variants={staggerContainer(0.1)} 
          initial="hidden" 
          animate="visible"
          className="mb-16"
        >
          <motion.div variants={blurReveal} className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-white/20" />
            <p className="subtle-mono text-[9px] text-white/30 tracking-[0.3em]">
              Disclosure Protocol – Phase {step} / 4
            </p>
          </motion.div>
          
          <motion.h1 variants={blurReveal} className="text-5xl md:text-7xl font-black tracking-tighter hero-title leading-[0.9] uppercase italic">
            Submit <span className="text-white/20">Disclosure.</span>
          </motion.h1>
        </motion.div>

        <div className="glass-panel p-1 border-white/5 rounded-[48px] shadow-2xl">
          <div className="bg-white/1 backdrop-blur-3xl p-10 md:p-16 rounded-[44px] border border-white/5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }} 
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} 
                  exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }}
                  transition={springSoft}
                >
                  <div className="mb-10">
                    <h2 className="text-3xl font-black tracking-tight mb-3">Target Selection</h2>
                    <p className="text-t2 text-sm font-medium">Identify the program for this specific vulnerability disclosure.</p>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {loading ? (
                      <div className="py-20 text-center opacity-20 italic font-mono text-xs tracking-widest uppercase">Initializing Registry...</div>
                    ) : programs.length === 0 ? (
                      <div className="py-20 text-center opacity-20 italic">No active targets found</div>
                    ) : programs.map((p, idx) => (
                      <motion.button
                        key={p.id}
                        variants={fadeInUp(idx * 0.04)}
                        whileHover={hoverScale}
                        whileTap={tapScale}
                        onClick={() => { setFormData({ ...formData, program_id: p.id }); nextStep(); }}
                        className={`
                          w-full p-8 rounded-3xl text-left transition-all duration-500 flex items-center justify-between border
                          ${formData.program_id === p.id 
                            ? 'bg-white/10 border-white/20 shadow-2xl scale-[1.02]' 
                            : 'bg-white/2 hover:bg-white/5 border-white/5'
                          }
                        `}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-1.5 h-1.5 rounded-full ${formData.program_id === p.id ? 'bg-indigo-400 animate-pulse' : 'bg-white/10'}`} />
                          <span className="text-lg font-black tracking-tight text-white uppercase">{p.name}</span>
                        </div>
                        <span className="subtle-mono text-[9px] text-white/20 font-black tracking-widest">Ceiling: ${Number(p.reward_max).toLocaleString()}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, filter: 'blur(10px)', x: 20 }} 
                  animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }} 
                  exit={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
                  transition={springSoft}
                >
                  <div className="mb-10">
                    <h2 className="text-3xl font-black tracking-tight mb-3">Finding Overview</h2>
                    <p className="text-t2 text-sm font-medium">Define the core identity and severity of the vulnerability.</p>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Finding Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Critical SQL Injection in Authentication Flow"
                        className="w-full bg-white/3 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-medium shadow-inner"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Target Identity (URL/Asset)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. api.vanguard.sh/v1/auth/login"
                        className="w-full bg-white/3 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-mono text-sm shadow-inner"
                        value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Severity Tier</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['low', 'medium', 'high', 'critical'].map(s => (
                          <motion.button
                            key={s} 
                            type="button" 
                            whileHover={hoverScale}
                            whileTap={tapScale}
                            onClick={() => setFormData({...formData, severity: s})}
                            className={`
                              py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-lg
                              ${formData.severity === s 
                                ? 'bg-white text-black border-white' 
                                : 'bg-white/5 text-white/20 border-white/5 hover:text-white/40'
                              }
                            `}
                          >
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-10 border-t border-white/5">
                      <button 
                        onClick={prevStep} 
                        className="flex-1 p-5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all shadow-lg"
                      >
                        Return
                      </button>
                      <motion.button 
                        whileHover={hoverScale} whileTap={tapScale}
                        onClick={nextStep} 
                        className="flex-2 p-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-white/90"
                      >
                        Next: Evidence
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, filter: 'blur(10px)', x: 20 }} 
                  animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }} 
                  exit={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
                  transition={springSoft}
                >
                  <div className="mb-10">
                    <h2 className="text-3xl font-black tracking-tight mb-3">Disclosure Evidence</h2>
                    <p className="text-t2 text-sm font-medium">Provide explicit technical details and reproduction logic.</p>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Vulnerability Impact</label>
                      <textarea 
                        placeholder="Describe the operational risk and data exposure potential..."
                        className="w-full min-h-[160px] bg-white/3 border border-white/5 rounded-3xl px-6 py-6 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-medium shadow-inner resize-none"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="subtle-mono text-[9px] text-white/30 ml-2 uppercase">Reproduction Workflow</label>
                      <textarea 
                        placeholder="1. Authenticate...\n2. Execute Payload..."
                        className="w-full min-h-[160px] bg-white/3 border border-white/5 rounded-3xl px-6 py-6 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-mono text-sm shadow-inner resize-none"
                        value={formData.steps_to_reproduce} onChange={e => setFormData({...formData, steps_to_reproduce: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-4 pt-10 border-t border-white/5">
                      <button 
                        onClick={prevStep} 
                        className="flex-1 p-5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all shadow-lg"
                      >
                        Return
                      </button>
                      <motion.button 
                        whileHover={hoverScale} whileTap={tapScale}
                        onClick={nextStep} 
                        className="flex-2 p-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-white/90"
                      >
                        Final Review
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4" 
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }} 
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={springSoft}
                >
                  <div className="mb-12 text-center">
                    <h2 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">Validation.</h2>
                    <p className="text-t2 text-sm font-medium">Verify your disclosure details before submission.</p>
                  </div>

                  <div className="glass-panel p-10 rounded-[40px] border-white/10 mb-12 overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black select-none uppercase tracking-tighter italic">Vanguard</div>
                    
                    <div className="relative z-10 space-y-10">
                      <div>
                        <p className="subtle-mono text-[8px] text-white/20 mb-3 uppercase tracking-widest font-black">Finding Title</p>
                        <p className="text-2xl font-black tracking-tight uppercase text-white">{formData.title || '( No Title Provided )'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-12">
                        <div>
                          <p className="subtle-mono text-[8px] text-white/20 mb-3 uppercase tracking-widest font-black">Severity</p>
                          <p className={`text-xl font-black uppercase tracking-tighter italic ${formData.severity === 'critical' ? 'text-rose-500 underline decoration-indigo-500/50 underline-offset-8' : 'text-white/60'}`}>
                            {formData.severity}
                          </p>
                        </div>
                        <div>
                          <p className="subtle-mono text-[8px] text-white/20 mb-3 uppercase tracking-widest font-black">Target</p>
                          <p className="text-xl font-black truncate uppercase text-white/60">{programs.find(p => p.id === formData.program_id)?.name || 'Unknown Target'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-rose-500 text-center font-black text-[10px] mb-8 animate-pulse tracking-widest uppercase italic">!! {error} !!</p>}
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={prevStep} 
                      className="flex-1 p-6 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all shadow-lg"
                    >
                      Refine Evidence
                    </button>
                    <motion.button 
                      disabled={submitting} 
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-2 p-6 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all font-mono"
                    >
                      {submitting ? 'TRANSMITTING...' : 'Submit Disclosure'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
