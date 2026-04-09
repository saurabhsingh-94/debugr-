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
    <div className="min-h-screen text-white/90 selection:bg-indigo-500/30 bg-[#080808]">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(157,80,187,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <Navbar />

      <main className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 pb-20 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Aspect: Context & Identity */}
        <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-40">
          <motion.div 
            variants={staggerContainer(0.1)} 
            initial="hidden" 
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={fadeInUp(0.1)} className="flex items-center gap-3">
              <span className="h-px w-8 bg-white/20" />
              <p className="subtle-mono text-[9px] text-white/30 tracking-[0.3em] font-black uppercase">
                Protocol Phase {step} / 4
              </p>
            </motion.div>
            
            <motion.h1 variants={fadeInUp(0.2)} className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
              <span className="block italic opacity-40 uppercase">Transmit</span>
              <span className="block bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">DISCLOSURE.</span>
            </motion.h1>

            <motion.p variants={fadeInUp(0.3)} className="text-t2 text-lg font-medium leading-relaxed max-w-md">
              Securely submit your findings to the registry. Each disclosure follows a structured verification protocol.
            </motion.p>

            {/* Step Indicators */}
            <motion.div variants={fadeInUp(0.4)} className="flex items-center gap-4 pt-4">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex flex-col gap-2">
                  <div className={`h-1 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-500' : 'bg-white/5'}`} />
                  <span className={`text-[8px] font-black tracking-widest uppercase ${s === step ? 'text-white' : 'text-white/20'}`}>0{s}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Aspect: Operational Input */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-1 border-white/5 rounded-[48px] shadow-2xl bg-white/[0.02] backdrop-blur-3xl overflow-hidden">
            <div className="p-8 md:p-14 space-y-12">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-10 text-left">
                      <h2 className="text-3xl font-black tracking-tight mb-3">Target Profile</h2>
                      <p className="text-t2 text-sm font-medium">Select the active program registry for this disclosure.</p>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                      {loading ? (
                        <div className="py-20 text-center opacity-20 italic font-mono text-[10px] tracking-widest uppercase">Initializing Registry...</div>
                      ) : programs.length === 0 ? (
                        <div className="py-20 text-center opacity-20 italic">No active targets found</div>
                      ) : programs.map((p, idx) => (
                        <motion.button
                          key={p.id}
                          variants={fadeInUp(idx * 0.04)}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => { setFormData({ ...formData, program_id: p.id }); nextStep(); }}
                          className={`
                            w-full p-8 rounded-3xl text-left transition-all duration-500 flex items-center justify-between border
                            ${formData.program_id === p.id 
                              ? 'bg-white/5 border-white/20 shadow-2xl' 
                              : 'bg-white/2 hover:bg-white/5 border-white/5'
                            }
                          `}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-1.5 h-1.5 rounded-full ${formData.program_id === p.id ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-white/10'}`} />
                            <span className="text-lg font-black tracking-tight text-white uppercase">{p.name}</span>
                          </div>
                          <span className="subtle-mono text-[9px] text-white/20 font-black tracking-widest">EXP: ${Number(p.reward_max).toLocaleString()}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-left"
                  >
                    <div className="mb-10">
                      <h2 className="text-3xl font-black tracking-tight mb-3">Operational Identity</h2>
                      <p className="text-t2 text-sm font-medium">Define the vulnerability scope and estimated severity tier.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Disclosure Handle</label>
                        <input 
                          type="text" 
                          placeholder="Brief finding title..."
                          className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-medium"
                          value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                      </div>

                      <div className="space-y-3 text-left">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Target Asset Path</label>
                        <input 
                          type="text" 
                          placeholder="URL / Asset Identifier..."
                          className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-mono text-sm"
                          value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})}
                        />
                      </div>

                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Priority Tier</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['low', 'medium', 'high', 'critical'].map(s => (
                            <motion.button
                              key={s} 
                              type="button" 
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setFormData({...formData, severity: s})}
                              className={`
                                py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border
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
                          className="flex-1 p-5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
                        >
                          Return
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                          onClick={nextStep} 
                          className="flex-[2] p-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] shadow-2xl"
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
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-left"
                  >
                    <div className="mb-10">
                      <h2 className="text-3xl font-black tracking-tight mb-3">Technical Evidence</h2>
                      <p className="text-t2 text-sm font-medium">Provide explicit root cause analysis and reproduction logic.</p>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Impact Analysis</label>
                        <textarea 
                          placeholder="Describe the potential operational risk..."
                          className="w-full min-h-[160px] bg-white/2 border border-white/5 rounded-3xl px-6 py-6 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-medium resize-none"
                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Reproduction Logic</label>
                        <textarea 
                          placeholder="1. Step one...\n2. Step two..."
                          className="w-full min-h-[160px] bg-white/2 border border-white/5 rounded-3xl px-6 py-6 outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white font-mono text-sm resize-none"
                          value={formData.steps_to_reproduce} onChange={e => setFormData({...formData, steps_to_reproduce: e.target.value})}
                        />
                      </div>

                      <div className="flex gap-4 pt-10 border-t border-white/5">
                        <button 
                          onClick={prevStep} 
                          className="flex-1 p-5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
                        >
                          Return
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                          onClick={nextStep} 
                          className="flex-[2] p-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] shadow-2xl"
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
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-left"
                  >
                    <div className="mb-12">
                      <h2 className="text-4xl font-black tracking-tighter mb-4 italic uppercase">Final Audit.</h2>
                      <p className="text-t2 text-sm font-medium">Verify your disclosure details before secure transmission.</p>
                    </div>

                    <div className="glass-panel p-10 rounded-[40px] border-white/10 mb-12 overflow-hidden relative shadow-2xl bg-white/[0.01]">
                      <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black select-none uppercase tracking-tighter italic">Vanguard</div>
                      
                      <div className="relative z-10 space-y-10">
                        <div>
                          <p className="text-[9px] font-black text-white/20 mb-3 uppercase tracking-widest">Handle</p>
                          <p className="text-2xl font-black tracking-tight uppercase text-white leading-tight">{formData.title || '( NO TITLE )'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-12">
                          <div>
                            <p className="text-[9px] font-black text-white/20 mb-3 uppercase tracking-widest">Priority</p>
                            <p className={`text-xl font-black uppercase tracking-tighter italic ${formData.severity === 'critical' ? 'text-rose-500' : 'text-white/60'}`}>
                              {formData.severity}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-white/20 mb-3 uppercase tracking-widest">Target</p>
                            <p className="text-xl font-black truncate uppercase text-white/60">{programs.find(p => p.id === formData.program_id)?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && <p className="text-rose-500 text-center font-black text-[10px] mb-8 tracking-widest uppercase italic">!! {error} !!</p>}
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <button 
                        onClick={prevStep} 
                        className="flex-1 p-6 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all shadow-lg"
                      >
                        Refine
                      </button>
                      <motion.button 
                        disabled={submitting} 
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-[2] p-6 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
                      >
                        {submitting ? 'TRANSMITTING...' : 'Submit Disclosure'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
