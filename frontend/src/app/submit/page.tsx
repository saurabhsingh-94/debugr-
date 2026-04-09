'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { 
  staggerContainer, 
  fadeInUp
} from '@/lib/animations';
import { 
  Shield, 
  Activity, 
  Terminal, 
  Cpu, 
  Server, 
  Layers, 
  ChevronRight, 
  AlertCircle,
  FileText,
  Send
} from 'lucide-react';

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
        setError(data.message || 'Transmission failed.');
      }
    } catch {
      setError('Signal synchronization error. Retry transmission.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen text-[#f5f5f7] selection:bg-indigo-500/30 bg-[#050505] relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1 animate-breathing opacity-10" />
        <div className="aurora-blob blob-2 animate-breathing opacity-10 delay-[-4s]" />
      </div>

      <Navbar />

      <main className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-44 pb-20 z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
        
        {/* Left Aspect: Dispatch Context */}
        <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-44">
          <motion.div 
            variants={staggerContainer(0.1)} 
            initial="hidden" 
            animate="visible"
            className="space-y-10"
          >
            <motion.div variants={fadeInUp(0.1)} className="flex items-center gap-4">
              <span className="subtle-mono text-[9px] text-indigo-400 tracking-[0.4em] uppercase italic">Vulnerability Report</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10">
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest italic">Step {step}/4</span>
              </div>
            </motion.div>
            
            <motion.h1 variants={fadeInUp(0.2)} className="text-7xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-6">
              Submit <br />
              <span className="text-white/5">Report.</span>
            </motion.h1>

            <motion.p variants={fadeInUp(0.3)} className="text-white/20 text-lg font-medium italic max-w-sm leading-relaxed">
              Submit a new vulnerability report. Please ensure all details are accurate for efficient review.
            </motion.p>

            {/* Tactical Progress */}
            <motion.div variants={fadeInUp(0.4)} className="flex flex-col gap-8 pt-8 border-t border-white/5">
              {[
                { id: 1, label: 'Select Program', icon: <Server size={12} /> },
                { id: 2, label: 'Vulnerability Details', icon: <Cpu size={12} /> },
                { id: 3, label: 'Evidence & Steps', icon: <Layers size={12} /> },
                { id: 4, label: 'Review & Submit', icon: <Shield size={12} /> },
              ].map(s => (
                <div key={s.id} className={`flex items-center gap-6 transition-all duration-700 ${s.id === step ? 'translate-x-4' : 'opacity-20 translate-x-0'}`}>
                   <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${s.id <= step ? 'bg-white border-white text-black' : 'bg-transparent border-white/10 text-white/20'}`}>
                      {s.id < step ? <Shield size={10} /> : s.icon}
                   </div>
                   <div className="space-y-1">
                      <p className={`subtle-mono text-[10px] font-black uppercase tracking-[0.2em] italic ${s.id === step ? 'text-white' : 'text-white/40'}`}>{s.label}</p>
                      {s.id === step && <motion.div layoutId="dispatch-state" className="h-0.5 w-12 bg-indigo-500/40 rounded-full" />}
                   </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Aspect: Mission Configuration */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-1 rounded-[56px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-white/[0.01] border border-white/5 overflow-hidden">
            <div className="p-10 md:p-16 space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none italic font-black text-8xl uppercase tracking-tighter">Vector</div>
              
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                  >
                    <div className="mb-12">
                      <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Select Program.</h2>
                      <p className="subtle-mono text-[10px] text-white/20 uppercase tracking-[0.3em] italic">Select an active security program for your report.</p>
                    </div>

                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-4 scrollbar-hide">
                      {loading ? (
                        <div className="py-24 text-center">
                          <div className="w-8 h-8 border-2 border-white/5 border-t-indigo-500/40 rounded-full animate-spin mx-auto mb-6" />
                          <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-[0.4em] italic animate-pulse">Loading Programs...</p>
                        </div>
                      ) : programs.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                          <p className="subtle-mono text-[10px] text-white/10 uppercase tracking-[0.4em] italic">No programs available.</p>
                        </div>
                      ) : programs.map((p) => (
                        <motion.button
                          key={p.id}
                          whileHover={{ scale: 1.01, x: 8 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => { setFormData({ ...formData, program_id: p.id }); nextStep(); }}
                          className={`
                            w-full p-10 rounded-[36px] text-left transition-all duration-700 flex items-center justify-between border
                            ${formData.program_id === p.id 
                              ? 'bg-white/5 border-indigo-500/20 shadow-2xl' 
                              : 'bg-white/[0.02] border-white/5'
                            }
                          `}
                        >
                          <div className="flex items-center gap-8">
                            <div className={`w-2 h-2 rounded-full ${formData.program_id === p.id ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-white/10'}`} />
                            <span className="text-2xl font-black italic tracking-tighter text-white uppercase">{p.name}</span>
                          </div>
                          <div className="text-right">
                             <p className="subtle-mono text-[8px] text-white/20 uppercase tracking-widest italic mb-1">Max Reward</p>
                             <span className="text-sm font-black text-indigo-400 italic">${Number(p.reward_max).toLocaleString()}</span>
                          </div>
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
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                  >
                    <div className="mb-12">
                      <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Report Details.</h2>
                      <p className="subtle-mono text-[10px] text-white/20 uppercase tracking-[0.3em] italic">Describe the vulnerability and the target asset.</p>
                    </div>

                    <div className="space-y-12">
                      <div className="space-y-4">
                        <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Report Title</label>
                        <div className="relative group">
                           <Terminal className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-400 transition-colors" size={18} />
                           <input 
                             type="text" 
                             placeholder="Brief title for your finding..."
                             className="w-full bg-white/[0.02] border border-white/5 rounded-[32px] pl-20 pr-10 py-7 outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all text-white font-black italic shadow-2xl"
                             value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Target Asset</label>
                        <div className="relative group">
                           <Server className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-400 transition-colors" size={18} />
                           <input 
                             type="text" 
                             placeholder="e.g. https://api.example.com"
                             className="w-full bg-white/[0.02] border border-white/5 rounded-[32px] pl-20 pr-10 py-7 outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all text-white font-mono text-sm shadow-2xl"
                             value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Severity Level</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                          {['low', 'medium', 'high', 'critical'].map(s => (
                            <motion.button
                              key={s} 
                              type="button" 
                              whileHover={{ y: -4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setFormData({...formData, severity: s})}
                              className={`
                                py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] transition-all border italic
                                ${formData.severity === s 
                                  ? 'bg-white text-black border-white shadow-2xl' 
                                  : 'bg-white/[0.02] text-white/20 border-white/5 hover:text-white/40'
                                }
                              `}
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-6 pt-12 border-t border-white/5">
                        <button 
                          onClick={prevStep} 
                          className="flex-1 py-6 rounded-[28px] border border-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all italic hover:bg-white/[0.02]"
                        >
                          Return
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                          onClick={nextStep} 
                          className="flex-[2] py-6 rounded-[32px] bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl italic flex items-center justify-center gap-3"
                        >
                          Next Step <ChevronRight size={14} />
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
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                  >
                    <div className="mb-12">
                      <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Evidence & Steps.</h2>
                      <p className="subtle-mono text-[10px] text-white/20 uppercase tracking-[0.3em] italic">Provide description and steps to reproduce the issue.</p>
                    </div>

                    <div className="space-y-12">
                      <div className="space-y-4">
                        <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Description & Impact</label>
                        <div className="relative group">
                           <FileText className="absolute left-8 top-8 text-white/10 group-focus-within:text-indigo-400 transition-colors" size={18} />
                           <textarea 
                             placeholder="Describe the vulnerability and its impact..."
                             className="w-full min-h-[220px] bg-white/[0.02] border border-white/5 rounded-[40px] pl-20 pr-10 py-10 outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all text-white font-medium italic shadow-2xl resize-none leading-relaxed"
                             value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                           />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <label className="subtle-mono text-[9px] text-white/20 ml-6 uppercase tracking-[0.3em] font-black italic">Steps to Reproduce</label>
                        <div className="relative group">
                           <Activity className="absolute left-8 top-8 text-white/10 group-focus-within:text-indigo-400 transition-colors" size={18} />
                           <textarea 
                             placeholder="1. Open the application.\n2. In the signal tab..."
                             className="w-full min-h-[220px] bg-white/[0.02] border border-white/5 rounded-[40px] pl-20 pr-10 py-10 outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all text-white font-mono text-sm shadow-2xl resize-none leading-relaxed"
                             value={formData.steps_to_reproduce} onChange={e => setFormData({...formData, steps_to_reproduce: e.target.value})}
                           />
                        </div>
                      </div>

                      <div className="flex gap-6 pt-12 border-t border-white/5">
                        <button 
                          onClick={prevStep} 
                          className="flex-1 py-6 rounded-[28px] border border-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all italic hover:bg-white/[0.02]"
                        >
                          Return
                        </button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                          onClick={nextStep} 
                          className="flex-[2] py-6 rounded-[32px] bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl italic flex items-center justify-center gap-3"
                        >
                          Review Report <ChevronRight size={14} />
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
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                  >
                    <div className="mb-14">
                      <h2 className="text-5xl font-black tracking-tighter italic uppercase mb-3">Review Report.</h2>
                      <p className="subtle-mono text-[10px] text-white/20 uppercase tracking-[0.3em] italic">Review your report details before submitting.</p>
                    </div>

                    <div className="glass-panel p-12 rounded-[56px] border border-white/5 mb-14 overflow-hidden relative shadow-2xl bg-white/[0.01]">
                      <div className="absolute top-0 right-0 p-10 opacity-5 text-8xl font-black select-none uppercase tracking-tighter italic pointer-events-none">READY</div>
                      
                      <div className="relative z-10 space-y-12">
                        <div>
                          <p className="subtle-mono text-[9px] font-black text-white/20 mb-4 uppercase tracking-[0.4em] italic text-xs">Title</p>
                          <p className="text-4xl font-black italic tracking-tighter uppercase text-white leading-tight">{formData.title || '( UNTITLED )'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-16">
                          <div>
                            <p className="subtle-mono text-[9px] font-black text-white/20 mb-4 uppercase tracking-[0.4em] italic text-xs">Severity</p>
                            <p className={`text-2xl font-black italic uppercase tracking-tighter ${formData.severity === 'critical' ? 'text-rose-500' : 'text-indigo-400'}`}>
                              {formData.severity}
                            </p>
                          </div>
                          <div>
                            <p className="subtle-mono text-[9px] font-black text-white/20 mb-4 uppercase tracking-[0.4em] italic text-xs">Program</p>
                            <p className="text-2xl font-black italic truncate uppercase text-white/60">{programs.find(p => p.id === formData.program_id)?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center justify-center gap-3 mb-10 text-rose-500 font-black text-[10px] tracking-[0.3em] uppercase italic animate-pulse">
                         <AlertCircle size={14} /> !! {error} !!
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <button 
                        onClick={prevStep} 
                        className="flex-1 py-7 rounded-[32px] border border-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all shadow-xl italic hover:bg-white/[0.02]"
                      >
                        Refine
                      </button>
                      <motion.button 
                        disabled={submitting} 
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-[2] py-7 rounded-[36px] bg-white text-black font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-neutral-100 transition-all italic flex items-center justify-center gap-4"
                      >
                        <Send size={16} /> {submitting ? 'SUBMITTING...' : 'Submit Report'}
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
