'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Coins, Rocket, Shield, HelpCircle, CheckCircle2, AlertTriangle, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { fadeInUp, staggerContainer, blurReveal } from '@/lib/animations';
import Magnetic from '@/components/animation/Magnetic';
import CloudinaryUpload from '@/components/marketplace/CloudinaryUpload';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';

export default function SellPromptPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Security',
    description: '',
    promptText: '',
    sampleOutput: '',
    price: 0,
    models: [] as string[],
    proof_urls: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const commission = 0.20;
  const earnings = formData.price * (1 - commission);

  const modelOptions = ['GPT-4o', 'GPT-4', 'Claude 3.5 Sonnet', 'Claude 3 Opus', 'Llama 3 (70B)', 'Gemini 1.5 Pro'];
  const categoryOptions = ['Security', 'Jailbreak', 'Optimization', 'Logic', 'Creative', 'Finance'];

  const toggleModel = (model: string) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.includes(model) 
        ? prev.models.filter(m => m !== model)
        : [...prev.models, model]
    }));
  };

  const handleUploadSuccess = (url: string) => {
    setFormData(prev => ({
      ...prev,
      proof_urls: [...prev.proof_urls, url]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`/api/marketplace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          content: formData.promptText,
          proof_urls: formData.proof_urls
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep(4); // Success step
      } else {
        alert(data.error || "Failed to list prompt");
      }
    } catch (error) {
      console.error("Listing error:", error);
      alert("An error occurred while deploying your listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-amber-500/30 overflow-x-hidden">
      {/* Background ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/[0.03] blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-40 pb-32 px-6 max-w-[1200px] mx-auto">
        
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-20 max-w-md mx-auto">
           {[1, 2, 3].map(s => (
             <div key={s} className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-500
                  ${step === s ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : step > s ? 'bg-white/10 border-white/10 text-white' : 'bg-transparent border-white/5 text-white/20'}
                `}>
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                {s < 3 && <div className={`h-[2px] w-20 rounded-full ${step > s ? 'bg-amber-500/50' : 'bg-white/5'}`} />}
             </div>
           ))}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20 items-start">
           
           {/* Form Area */}
           <motion.div 
             key={step}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-12"
           >
              {step === 1 && (
                <div className="space-y-10">
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Define your <span className="text-amber-500">Protocol.</span></h2>
                      <p className="text-white/30 text-lg font-medium italic">What intelligence are you listing today?</p>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. CloudSec Advanced Jailbreak"
                          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-xl italic font-medium outline-none focus:border-amber-500/30 transition-all"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Category</label>
                          <select 
                            className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 italic font-medium outline-none appearance-none focus:border-amber-500/30"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">License Price ($)</label>
                          <input 
                            type="number" 
                            className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-xl italic font-black outline-none focus:border-amber-500/30 text-amber-500"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Target Models</label>
                        <div className="flex flex-wrap gap-3">
                           {modelOptions.map(m => (
                             <button
                               key={m}
                               onClick={() => toggleModel(m)}
                               className={`
                                 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all
                                 ${formData.models.includes(m) ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/20 hover:text-white/40'}
                               `}
                             >
                               {m}
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10">
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter">The <span className="text-amber-500">Payload.</span></h2>
                      <p className="text-white/30 text-lg font-medium italic">Encrypt your knowledge. Only buyers see the full prompt.</p>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">The Prompt (Secret)</label>
                        <textarea 
                          rows={6}
                          placeholder="Paste your system prompt or user query structure here..."
                          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm font-mono outline-none focus:border-amber-500/30 transition-all resize-none"
                          value={formData.promptText}
                          onChange={(e) => setFormData({...formData, promptText: e.target.value})}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Public Description</label>
                        <textarea 
                          rows={4}
                          placeholder="How does it work? What are the results?"
                          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 italic font-medium outline-none focus:border-amber-500/30 transition-all resize-none"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>

                      <div className="space-y-6">
                        <CloudinaryUpload 
                          onUploadSuccess={handleUploadSuccess}
                          label="Attachment Proof (Optional but Recommended)"
                        />
                        <p className="text-[10px] text-white/20 italic">Proof increases buyer trust by 400%. Show the prompt working on a target model.</p>
                      </div>
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10">
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Final <span className="text-amber-500">Commit.</span></h2>
                      <p className="text-white/30 text-lg font-medium italic">Review your listing and licensing terms.</p>
                   </div>

                   <div className="p-10 rounded-[40px] border border-amber-500/20 bg-amber-500/[0.02] space-y-8">
                      <div className="flex justify-between items-center text-sm font-black uppercase italic tracking-widest text-white/40">
                         <span>License Fee</span>
                         <span className="text-white">${formData.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black uppercase italic tracking-widest text-amber-500/40">
                         <span>Debugr Commission (20%)</span>
                         <span className="text-amber-500/60">-${(formData.price * 0.2).toFixed(2)}</span>
                      </div>
                      <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                         <span className="text-xl font-black uppercase italic tracking-tighter">Your Earnings</span>
                         <span className="text-4xl font-black text-amber-500 italic tracking-tighter">${earnings.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
                      <Shield className="text-amber-500" size={24} />
                      <p className="text-[10px] font-black uppercase tracking-widest italic text-white/30">Intelligence is verified by Sandbox-AI before going live.</p>
                   </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-10 text-center py-10">
                   <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto border border-green-500/20">
                      <CheckCircle2 size={40} />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Mission <span className="text-green-500">Accomplished.</span></h2>
                      <p className="text-white/30 text-lg font-medium italic">Your protocol has been indexed. Verification will be complete in ~2 hours.</p>
                   </div>
                   <div className="flex justify-center gap-6 pt-10">
                      <Link href="/marketplace" className="px-12 py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl hover:scale-[1.02] transition-all">
                        View Marketplace
                      </Link>
                   </div>
                </div>
              )}

               <div className="flex gap-6 pt-10">
                 {step > 1 && step < 4 && (
                   <button 
                     onClick={() => setStep(step - 1)}
                     disabled={isSubmitting}
                     className="px-8 py-5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5 transition-all flex items-center gap-3 disabled:opacity-50"
                   >
                     <ArrowLeft size={14} /> Back
                   </button>
                 )}
                 {step < 4 && (
                   <button 
                     onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                     disabled={isSubmitting}
                     className="flex-1 px-12 py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                   >
                     {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Indexing...
                        </>
                     ) : (
                        step === 3 ? 'Deploy Listing' : 'Continue'
                     )}
                   </button>
                 )}
              </div>
           </motion.div>

           {/* Sidebar Info */}
           <aside className="space-y-8 sticky top-40">
              <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black italic">!</div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] italic">Seller Guidelines</h4>
                 <ul className="space-y-4">
                    {[
                      'Prompts must be original work',
                      'No illegal malware generation',
                      'Describe limitations clearly',
                      '20% commission on every sale'
                    ].map(item => (
                      <li key={item} className="flex gap-3 text-[10px] text-white/30 font-medium italic">
                         <div className="w-1 h-1 rounded-full bg-amber-500 mt-1" />
                         {item}
                      </li>
                    ))}
                 </ul>
              </div>

              <div className="p-8 rounded-[40px] border border-white/5 bg-linear-to-br from-white/5 to-transparent space-y-6">
                 <Rocket className="text-amber-500" size={24} />
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] italic">Intelligence Hub</h4>
                 <p className="text-[10px] text-white/20 italic leading-relaxed">Your prompt will be indexed across the Debugr network, reaching 50k+ security researchers daily.</p>
              </div>
           </aside>

        </section>
      </main>
    </div>
  );
}
