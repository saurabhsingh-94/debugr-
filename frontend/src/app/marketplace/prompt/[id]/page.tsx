"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useCurrency } from '@/context/CurrencyContext';
import { fetchWithAuth, API_URL } from '@/lib/api';

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

  const handleCheckout = async () => {
    setIsBuying(true);
    try {
      const res = await fetchWithAuth(`/api/marketplace/buy/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success && data.payment_session_id) {
        // Cashfree SDK integration
        // @ts-ignore
        const cashfree = window.Cashfree({ mode: "production" });
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
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Decrypting Protocol...</p>
      </div>
    );
  }

  if (!prompt) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40 italic">Protocol Nullized.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] selection:bg-amber-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-40 pb-32 px-6 lg:px-[10%] max-w-[1400px] mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-3 mb-12 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all">
            <ArrowLeft size={14} />
          </div>
          Back to Terminal
        </button>

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-20 items-start">
          
          {/* Left: Media & Details */}
          <div className="space-y-12">
            
            {/* Image Gallery */}
            <div className="space-y-6">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative aspect-video rounded-[40px] overflow-hidden border border-white/5 bg-white/5 group"
               >
                 {prompt.proof_urls && prompt.proof_urls.length > 0 ? (
                   <img 
                     src={prompt.proof_urls[activeImage]} 
                     alt="Proof" 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                   />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/10">
                      <Lock size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Visual Proof Provided</p>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </motion.div>

               {prompt.proof_urls && prompt.proof_urls.length > 1 && (
                 <div className="flex gap-4">
                   {prompt.proof_urls.map((url, i) => (
                     <button 
                       key={i} 
                       onClick={() => setActiveImage(i)}
                       className={`w-24 aspect-video rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-amber-500' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                     >
                       <img src={url} alt="Proof Thumb" className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Title & Stats */}
            <div className="space-y-8">
               <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <span className="px-5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 italic">
                      {prompt.category}
                    </span>
                    <span className="px-5 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic flex items-center gap-2">
                      <Globe size={10} /> Commercial License
                    </span>
                  </div>
                  <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                    {prompt.title}
                  </h1>
               </div>

               <div className="flex items-center gap-10 py-8 border-y border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] font-mono font-black text-white/10 uppercase tracking-widest italic">Protocol Rating</p>
                    <div className="flex items-center gap-2">
                       <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                              key={s} 
                              size={12} 
                              className={s <= prompt.avg_rating ? 'text-amber-500 fill-amber-500' : 'text-white/10'} 
                            />
                          ))}
                       </div>
                       <span className="text-xs font-black text-white italic">{parseFloat(prompt.avg_rating as any).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-mono font-black text-white/10 uppercase tracking-widest italic">Social Karma</p>
                    <div className="flex items-center gap-2">
                       <Heart size={14} className="text-pink-500 fill-pink-500" />
                       <span className="text-xs font-black text-white italic">{prompt.likes_count} Likes</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-mono font-black text-white/10 uppercase tracking-widest italic">Author</p>
                    <div className="flex items-center gap-3">
                       <img src={prompt.seller_avatar} className="w-5 h-5 rounded-full object-cover grayscale opacity-50" alt="" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">@{prompt.seller_handle}</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/40">Technical Brief</h4>
                 <p className="text-lg text-white/40 font-medium italic leading-relaxed prose prose-invert max-w-none">
                    {prompt.description}
                 </p>
               </div>
            </div>
          </div>

          {/* Right: Checkout & Interaction */}
          <div className="space-y-12 sticky top-40">
             
             {/* Checkout Card */}
             <div className="p-10 rounded-[56px] border border-white/10 bg-white/[0.02] backdrop-blur-3xl space-y-10 shadow-3xl">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Investment</p>
                      <div className="flex items-center gap-2 text-green-500">
                         <ShieldCheck size={14} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Escrow Protected</span>
                      </div>
                   </div>
                   <h2 className="text-7xl font-black italic tracking-tighter text-white">
                      {formatPrice(prompt.price)}
                   </h2>
                </div>

                <div className="space-y-4">
                  <Magnetic strength={0.1}>
                    <button 
                      onClick={handleCheckout}
                      disabled={isBuying}
                      className="w-full py-8 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.5em] italic text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          Initialize Protocol <ShoppingCart size={16} />
                        </>
                      )}
                    </button>
                  </Magnetic>
                  <p className="text-center text-[8px] font-mono font-black text-white/10 uppercase tracking-widest">
                    Encrypted Key will be delivered to your profile after block confirmation
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={handleLike}
                     className={`py-5 rounded-3xl border flex items-center justify-center gap-3 transition-all ${liked ? 'border-pink-500/50 bg-pink-500/10 text-pink-500' : 'border-white/5 bg-white/5 text-white/30 hover:text-white hover:bg-white/10'}`}
                   >
                     <Heart size={16} className={liked ? 'fill-pink-500' : ''} />
                     <span className="text-[10px] font-black uppercase tracking-widest italic">{liked ? 'Liked' : 'Like'}</span>
                   </button>
                   <button className="py-5 rounded-3xl border border-white/5 bg-white/5 text-white/30 hover:text-white hover:bg-white/10 flex items-center justify-center gap-3 transition-all">
                     <Share2 size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest italic">Share</span>
                   </button>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 italic">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Live Network Stats
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[8px] font-mono font-black text-white/5 uppercase tracking-widest">Global Rank</p>
                        <p className="text-sm font-black text-white italic">#12 in {prompt.category}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[8px] font-mono font-black text-white/5 uppercase tracking-widest">Market Status</p>
                        <p className="text-sm font-black text-green-500 italic uppercase">Liquid</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Comments Section */}
             <div className="space-y-8">
                <div className="flex items-center gap-4">
                   <MessageSquare className="text-amber-500" size={20} />
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] italic text-white/40">Reviews ({comments.length})</h3>
                </div>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="p-8 rounded-[32px] border border-dashed border-white/5 text-center">
                       <p className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">No intelligence logs found for this protocol.</p>
                    </div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <img src={c.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">@{c.handle}</span>
                           </div>
                           <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className={s <= c.rating ? 'text-amber-500 fill-amber-500' : 'text-white/5'} />)}
                           </div>
                        </div>
                        <p className="text-xs text-white/40 font-medium italic leading-relaxed">"{c.message}"</p>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>

        </section>
      </main>
      
      {/* Footer protocol */}
      <footer className="py-20 border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
         <div className="max-w-[1400px] mx-auto px-12 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black italic text-xs">D</div>
               <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-white/10">Protocol Audit v4.1 // SECURE</p>
            </div>
            <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest italic flex items-center gap-2">
               <ShieldCheck size={12} /> Verified by Debugr Intel
            </p>
         </div>
      </footer>
    </div>
  );
}
