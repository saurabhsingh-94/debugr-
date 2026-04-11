"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { load } from '@cashfreepayments/cashfree-js';
import { 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Heart, 
  Share2, 
  Globe, 
  Lock, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  ExternalLink,
  Coins
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useCurrency } from '@/context/CurrencyContext';
import { fetchWithAuth, API_URL } from '@/lib/api';
import Magnetic from '@/components/animation/Magnetic';

interface PromptDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  seller_handle: string;
  seller_avatar: string;
  proof_urls: string[];
  avg_rating: number;
  likes_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  handle: string;
  avatar_url: string;
  message: string;
  rating: number;
  created_at: string;
}

export default function PromptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { formatPrice, currency } = useCurrency();
  
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/marketplace/${id}`);
        const data = await res.json();
        if (data.success) {
          setPrompt(data.prompt);
          setComments(data.comments);
        }
      } catch (err) {
        console.error("Error fetching prompt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await fetchWithAuth(`/api/marketplace/like/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        if (prompt) setPrompt({...prompt, likes_count: data.liked ? prompt.likes_count + 1 : prompt.likes_count - 1});
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetchWithAuth(`/api/marketplace/comment/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commentText, rating: commentRating })
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setCommentText('');
        setCommentRating(5);
        // Show success state briefly
        alert("Transmission Success: Review Published.");
      } else {
        alert(data.error || "Failed to post review");
      }
    } catch (err) {
      console.error("Comment error:", err);
      alert("Error posting review.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCheckout = async () => {
    setIsBuying(true);
    try {
      const res = await fetchWithAuth(`/api/marketplace/buy/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success && data.payment_session_id) {
        const cashfree = await load({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PROD' ? 'production' : 'sandbox'
        });

        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: `${window.location.origin}/marketplace/success?order_id=${data.order_id}`,
        });
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment gateway connection failed.");
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Loading Hack...</p>
      </div>
    );
  }

  if (!prompt) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40 italic">Prompt Not Found.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-amber-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Dynamic Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-40 pb-32 px-6 lg:px-[10%] max-w-[1500px] mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-4 mb-16 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all italic"
        >
          <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all">
            <ArrowLeft size={16} />
          </div>
          Return to Marketplace
        </button>

        <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-16 lg:gap-24 items-start">
          
          {/* Left Side: Immersive Proof & Details */}
          <div className="space-y-20">
            
            {/* High-Fidelity Proof Display */}
            <div className="space-y-10">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative aspect-square md:aspect-video rounded-[40px] overflow-hidden border border-white/5 bg-black/40 group shadow-[0_0_100px_rgba(0,0,0,0.5)]"
               >
                 {prompt.proof_urls && prompt.proof_urls.length > 0 ? (
                   <img 
                     src={prompt.proof_urls[activeImage]} 
                     alt="Protocol Proof" 
                     className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-105" 
                   />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-8 text-white/5">
                      <Lock size={80} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-[0.6em]">Classified Proof Material</p>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />
                 
                 <div className="absolute bottom-12 left-12 flex items-center gap-6">
                    <div className="px-6 py-2.5 rounded-full backdrop-blur-3xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.4em] text-amber-500 italic shadow-2xl">
                      Verified Environment Proof
                    </div>
                    <div className="flex items-center gap-2 px-6 py-2.5 rounded-full backdrop-blur-3xl bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic">
                      <ShieldCheck size={12} className="text-green-500" /> SECURE HANDSHAKE
                    </div>
                 </div>
               </motion.div>

               {prompt.proof_urls && prompt.proof_urls.length > 1 && (
                 <div className="flex gap-6 px-4">
                   {prompt.proof_urls.map((url, i) => (
                     <button 
                       key={i} 
                       onClick={() => setActiveImage(i)}
                       className={`w-28 aspect-square rounded-[32px] overflow-hidden border-2 transition-all duration-500 ${activeImage === i ? 'border-amber-500 scale-110 shadow-3xl shadow-amber-500/20' : 'border-white/5 opacity-20 hover:opacity-100 hover:scale-105'}`}
                     >
                       <img src={url} alt="Proof Thumb" className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Core Info & Narrative */}
            <div className="space-y-16">
               <div className="space-y-10">
                  <div className="flex flex-wrap gap-4">
                    <span className="px-8 py-3 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl">
                        {prompt.category}
                    </span>
                    <span className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">
                       Internal Protocol v4.01
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight text-white max-w-4xl drop-shadow-2xl">
                    {prompt.title}
                  </h1>
               </div>

               <div className="flex flex-wrap items-center gap-16 py-12 border-y border-white/5">
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono font-black text-white/10 uppercase tracking-[0.5em] italic ml-1">Trust Score</p>
                    <div className="flex items-center gap-4">
                       <div className="flex gap-1.5 p-3 bg-white/5 rounded-2xl border border-white/5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                              key={s} 
                              size={16} 
                              className={s <= prompt.avg_rating ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/5'} 
                            />
                          ))}
                       </div>
                       <span className="text-xl font-black text-white italic tracking-widest">{parseFloat(prompt.avg_rating as any).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono font-black text-white/10 uppercase tracking-[0.5em] italic ml-1">Market Karma</p>
                    <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                       <Heart size={20} className="text-pink-500 fill-pink-500 animate-pulse" />
                       <span className="text-xl font-black text-white italic tracking-widest">{prompt.likes_count} VOTES</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono font-black text-white/10 uppercase tracking-[0.5em] italic ml-1">Creator Profile</p>
                    <div className="flex items-center gap-5 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                       <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10 shadow-2xl">
                          <img src={prompt.seller_avatar} className="w-full h-full object-cover" alt="" />
                       </div>
                       <span className="text-sm font-black text-white/40 uppercase tracking-[0.3em] italic">@{prompt.seller_handle}</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="flex items-center gap-6 text-white/5">
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] whitespace-nowrap">Technical Briefing</span>
                    <div className="h-[2px] w-full bg-white/5" />
                  </div>
                  <p className="text-xl md:text-2xl text-white/40 font-medium italic leading-relaxed max-w-4xl">
                    {prompt.description}
                  </p>
               </div>
            </div>
          </div>

          {/* Right Side: Command Center / Checkout */}
          <div className="space-y-16 sticky top-40">
             
             {/* Premium Checkout Sidebar */}
             <div className="p-10 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-[120px] space-y-12 shadow-[0_60px_120px_rgba(0,0,0,0.6)] relative overflow-hidden group/checkout">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/checkout:opacity-100 transition-opacity duration-1000" />
                
                <div className="space-y-8 relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">Acquisition Value</p>
                        <div className="flex items-center gap-3 text-amber-500/60 p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl w-fit">
                           <ShieldCheck size={16} />
                           <span className="text-[9px] font-black uppercase tracking-[0.4em] italic">Full Escrow Protection</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/10">
                         <Coins size={20} />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-7xl font-black italic tracking-tighter text-white leading-none">
                         {formatPrice(prompt.price)}
                      </h2>
                      <p className="text-[10px] font-mono font-black text-white/10 uppercase tracking-[0.4em] italic mt-2">One-time protocol issuance fee</p>
                   </div>
                </div>

                <div className="space-y-10 relative z-10">
                  <Magnetic strength={0.1}>
                    <button 
                      onClick={handleCheckout}
                      disabled={isBuying}
                      className="w-full py-6 bg-[#f5f5f7] text-black rounded-2xl font-black uppercase tracking-[0.5em] italic text-sm hover:bg-amber-500 transition-all duration-700 flex items-center justify-center gap-6 disabled:opacity-50 shadow-[0_20px_40px_rgba(255,255,255,0.05)] relative overflow-hidden group/btn"
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin" />
                          STABILIZING...
                        </>
                      ) : (
                        <>
                          SECURE PROTOCOL <ShoppingCart size={24} className="group-hover/btn:translate-x-3 transition-transform duration-500" />
                        </>
                      )}
                    </button>
                  </Magnetic>
                  
                  <div className="flex items-center gap-6 justify-center">
                     <div className="h-px flex-1 bg-white/5" />
                     <p className="text-[9px] font-mono font-black text-white/10 uppercase tracking-[0.6em] italic">
                       Authorized Transaction
                     </p>
                     <div className="h-px flex-1 bg-white/5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 relative z-10">
                   <button 
                     onClick={handleLike}
                     className={`py-5 rounded-2xl border flex items-center justify-center gap-4 transition-all duration-700 ${liked ? 'border-pink-500/50 bg-pink-500/10 text-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.15)]' : 'border-white/5 bg-white/5 text-white/20 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
                   >
                     <Heart size={18} className={liked ? 'fill-pink-500' : ''} />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">{liked ? 'VOTED' : 'VOTE'}</span>
                   </button>
                   <button className="py-5 rounded-2xl border border-white/5 bg-white/5 text-white/20 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-4 transition-all duration-700">
                     <Share2 size={18} />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">SIGNAL</span>
                   </button>
                </div>
             </div>

             {/* Enhanced Reviews Section */}
             <div className="space-y-12">
                <div className="flex items-center gap-6">
                   <MessageSquare className="text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" size={24} />
                   <h3 className="text-sm font-black uppercase tracking-[0.5em] italic text-white/40">Collective Testimony ({comments.length})</h3>
                </div>

                {/* Interactive Comment Form */}
                <form onSubmit={handleCommentSubmit} className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 space-y-8 group/form relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover/form:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-center relative z-10">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30 italic">Establish Signal</h4>
                       <div className="flex flex-col items-end gap-3">
                          <div className="flex gap-2.5 p-4 bg-black/60 rounded-[28px] border border-white/5">
                             {[1, 2, 3, 4, 5].map(s => (
                               <button 
                                 key={s} 
                                 type="button" 
                                 onMouseEnter={() => setCommentRating(s)}
                                 onClick={() => setCommentRating(s)}
                                 className="transition-all duration-500 transform hover:scale-150 focus:outline-none"
                               >
                                  <Star 
                                    size={20} 
                                    className={`transition-all duration-500 ${s <= commentRating ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'text-white/5'}`} 
                                  />
                               </button>
                             ))}
                          </div>
                          <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-[0.5em] mr-4">{commentRating} / 5 Rating Magnitude</span>
                       </div>
                    </div>
                    <div className="relative z-10">
                       <textarea 
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Transmit your findings to the collective archive..."
                          className="w-full min-h-[180px] p-6 rounded-2xl bg-black/80 border border-white/5 text-base text-white focus:border-amber-500/50 outline-none resize-none italic font-medium placeholder:text-white/5 transition-all duration-700 shadow-inner"
                       />
                       <div className="absolute bottom-8 right-10 text-[9px] font-mono text-white/10 uppercase tracking-[0.5em] italic">Secure Transmission Buffer</div>
                    </div>
                    <motion.button 
                      type="submit"
                      disabled={isSubmittingComment}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-\[0.4em\] italic text-[10px] disabled:opacity-50 shadow-[0_20px_60px_rgba(245,158,11,0.2)] relative z-10"
                    >
                       {isSubmittingComment ? 'BROADCASTING...' : 'INITIALIZE BROADCAST'}
                    </motion.button>
                </form>

                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="p-8 rounded-[32px] border-2 border-dashed border-white/5 text-center bg-white/[0.01]">
                       <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.6em] italic">No testimonies recorded for this protocol.</p>
                    </div>
                  ) : (
                    comments.map(c => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={c.id} 
                        className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all duration-700 group/msg"
                      >
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-5">
                              <img src={c.avatar_url} className="w-10 h-10 rounded-full border border-white/10 shadow-xl" alt="" />
                              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic group-hover/msg:text-amber-500/60 transition-colors">@{c.handle}</span>
                           </div>
                           <div className="flex gap-1.5 p-2 bg-black/40 rounded-xl border border-white/5">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= c.rating ? 'text-amber-500 fill-amber-500' : 'text-white/5'} />)}
                           </div>
                        </div>
                        <p className="text-base text-white/40 font-medium italic leading-relaxed pl-4 border-l-2 border-amber-500/10 group-hover/msg:text-white/60 transition-colors">"{c.message}"</p>
                      </motion.div>
                    ))
                  )}
                </div>
             </div>
          </div>

        </section>
      </main>

      {/* Corporate Protocol Footer */}
      <footer className="py-24 border-t border-white/5 bg-black/60 backdrop-blur-3xl relative z-10">
         <div className="max-w-[1500px] mx-auto px-16 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black italic text-base">D</div>
               <div>
                  <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-white/20 leading-none">Debugr Terminal</p>
                  <p className="text-[8px] font-mono font-black uppercase tracking-[0.6em] text-white/5 mt-2 italic">SECURE CONNECTION ESTABLISHED</p>
               </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] font-mono text-white/10 uppercase tracking-[0.6em] italic flex items-center gap-3">
                 <ShieldCheck size={14} className="text-amber-500/40" /> VERIFIED BY DEBUGR PROTOCOL SUPPORT
              </p>
              <div className="flex gap-10">
                 <span className="text-[9px] font-mono text-white/5 hover:text-white/20 transition-all uppercase tracking-[0.6em] italic cursor-wait">Access Logs</span>
                 <span className="text-[9px] font-mono text-white/5 hover:text-white/20 transition-all uppercase tracking-[0.6em] italic cursor-wait">Trace Protocol</span>
              </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
