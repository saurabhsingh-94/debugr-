'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { API_URL } from '@/lib/api';
import { fadeInUp, staggerContainer, springSoft, hoverScale, tapScale } from '@/lib/animations';
import { motion, AnimatePresence } from 'framer-motion';

interface ResearcherStats {
  total_submissions: string;
  resolved_bugs: string;
  triaged_bugs: string;
  total_earned: string;
}

interface Researcher {
  handle: string;
  name: string;
  bio: string;
  website: string;
  location: string;
  github_url: string;
  skills: string[];
  industry: string;
  experience_level: string;
  description: string;
  avatar_url: string;
  created_at: string;
  stats: ResearcherStats;
}

const TABS = ['Identity', 'Portfolio', 'Milestones'] as const;
type Tab = typeof TABS[number];

function computeReputation(stats: ResearcherStats): number {
  const resolved = parseInt(stats.resolved_bugs) || 0;
  const submissions = parseInt(stats.total_submissions) || 0;
  const earned = parseFloat(stats.total_earned) || 0;
  return Math.min(100, Math.round((resolved * 12) + (earned / 500) + (submissions * 2)));
}

function parseSkills(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export default function ResearcherProfile() {
  const params = useParams();
  const handle = typeof params.handle === 'string'
    ? params.handle
    : Array.isArray(params.handle) ? params.handle[0] : '';

  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('Identity');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!handle) return;
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/users/profile/${handle}`);
        const data = await res.json();
        if (data.success) {
          setResearcher({ ...data.user, skills: parseSkills(data.user.skills) });
        } else {
          setError(data.error || 'Identity not found');
        }
      } catch {
        setError('Synchronizing failed');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [handle]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6">
        <Navbar />
        <div className="w-10 h-10 border-2 border-white/5 border-t-white/40 rounded-full animate-spin shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
        <p className="subtle-mono text-white/20 tracking-[0.3em] uppercase animate-pulse">Synchronizing Profile...</p>
      </div>
    );
  }

  if (error || !researcher) {
    return (
      <div className="min-h-screen bg-bg text-white flex flex-col items-center justify-center gap-8 p-6 text-center">
        <Navbar />
        <div className="glass-panel p-10 rounded-[48px] border-white/5 shadow-2xl flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-center text-3xl opacity-20 italic">?</div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Identity<br /><span className="text-white/20">Missing.</span></h1>
          <p className="text-white/30 text-sm font-medium italic max-w-xs leading-relaxed">The handle <strong className="text-white/60">@{handle}</strong> is not registered within the collective.</p>
          <Link href="/" className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/90 transition-all shadow-xl italic">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const joinedDate = new Date(researcher.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const reputation = computeReputation(researcher.stats);
  const milestones = [
    { emoji: '🩸', name: 'First Discovery', desc: 'Authorized a security disclosure', earned: parseInt(researcher.stats.total_submissions) > 0 },
    { emoji: '✅', name: 'Verified Asset', desc: 'Successfully resolved a bottleneck', earned: parseInt(researcher.stats.resolved_bugs) > 0 },
    { emoji: '💰', name: 'Bounty Veteran', desc: 'Earned bounty rewards across programs', earned: parseFloat(researcher.stats.total_earned) > 0 },
    { emoji: '🛡️', name: 'Vanguard Elite', desc: 'Resolved 10+ critical vulnerabilities', earned: parseInt(researcher.stats.resolved_bugs) >= 10 },
  ];

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-6 pt-40 pb-20 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-12 lg:gap-20">
        
        {/* Left Panel: Identity Bar */}
        <aside className="lg:sticky lg:top-40 self-start space-y-12">
          <motion.div 
            variants={staggerContainer(0.1)} 
            initial="hidden" 
            animate="visible"
            className="glass-panel p-1 text-white/5 rounded-[56px] shadow-2xl relative overflow-hidden group"
          >
            <div className="bg-[#0b0b0d] p-12 rounded-[52px] border border-white/5">
              <div className="flex flex-col items-center">
                <div className="relative mb-10 group/avatar">
                  <div className="absolute -inset-4 bg-linear-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700 blur-2xl" />
                  <ProfileAvatar handle={researcher.handle} name={researcher.name} avatarUrl={researcher.avatar_url} size={150} border />
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-indigo-600 border-4 border-[#0b0b0d] flex items-center justify-center text-[10px] font-black italic">✓</div>
                </div>

                <div className="text-center space-y-3 mb-12">
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{researcher.name || researcher.handle}</h1>
                  <p className="text-white/20 font-black tracking-[0.4em] uppercase text-[10px] italic">@{researcher.handle}</p>
                </div>

                <div className="w-full flex gap-3 mb-10">
                  <motion.button 
                    whileHover={hoverScale} whileTap={tapScale}
                    onClick={handleShare}
                    className="flex-1 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border border-white/5 bg-white/2 text-white/40 hover:text-white"
                  >
                    {copied ? 'Link Copied' : 'Share Identity'}
                  </motion.button>
                  {researcher.github_url && (
                    <motion.a 
                      whileHover={hoverScale} whileTap={tapScale}
                      href={researcher.github_url} 
                      target="_blank" 
                      className="flex-1 px-6 py-4 rounded-3xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all text-center flex items-center justify-center gap-2 italic"
                    >
                      Arsenal
                    </motion.a>
                  )}
                </div>

                <div className="w-full space-y-8 pt-10 border-t border-white/5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                      <span>Reputation Index</span>
                      <span className="text-white">{reputation}%</span>
                    </div>
                    <div className="h-1.5 bg-white/2 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${reputation}%` }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="h-full rounded-full bg-linear-to-r from-indigo-500 to-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[32px] bg-white/2 border border-white/5 text-center group-hover:bg-white/5 transition-all duration-500">
                      <div className="text-3xl font-black italic mb-1 uppercase tracking-tighter leading-none">{researcher.stats.total_submissions}</div>
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Disclosures</div>
                    </div>
                    <div className="p-6 rounded-[32px] bg-white/2 border border-white/5 text-center group-hover:bg-white/5 transition-all duration-500">
                      <div className="text-3xl font-black italic mb-1 uppercase tracking-tighter leading-none">{researcher.stats.resolved_bugs}</div>
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Neutralized</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp(0.2)} initial="hidden" animate="visible" className="glass-panel p-10 rounded-[48px] border border-white/5 space-y-8 shadow-2xl">
             <div className="space-y-6">
               {[
                 { label: 'Base', value: researcher.location, icon: '📍' },
                 { label: 'Tenure', value: joinedDate, icon: '📅' },
                 { label: 'Domain', value: researcher.industry || 'Global Security', icon: '💼' }
               ].filter(i => i.value).map(item => (
                 <div key={item.label} className="flex items-center gap-5 text-sm font-medium group">
                   <span className="w-10 h-10 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-lg grayscale group-hover:grayscale-0 group-hover:bg-white/5 transition-all duration-500">{item.icon}</span>
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-0.5">{item.label}</span>
                     <span className="text-white/60 italic">{item.value}</span>
                   </div>
                 </div>
               ))}
             </div>
          </motion.div>
        </aside>

        {/* Right Panel: Progressive Information */}
        <section className="space-y-12">
          <nav className="flex gap-2 p-2 bg-white/2 border border-white/5 rounded-3xl w-fit shadow-2xl backdrop-blur-3xl">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-10 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 italic
                  ${activeTab === tab ? 'bg-white text-black shadow-2xl scale-[1.05]' : 'text-white/20 hover:text-white/40 hover:bg-white/2'}
                `}
              >
                {tab}
              </button>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={springSoft}
              className="space-y-12"
            >
              {activeTab === 'Identity' && (
                <div className="space-y-10">
                  <div className="glass-panel p-12 rounded-[56px] border border-white/5 relative overflow-hidden group shadow-2xl shadow-indigo-500/5">
                    <div className="absolute top-0 right-0 p-12 opacity-5 text-8xl font-black italic uppercase select-none">Mission</div>
                    <div className="relative z-10 leading-relaxed text-white/60 text-xl font-medium italic underline decoration-indigo-500/20 underline-offset-[12px] decoration-4">
                      &ldquo;{researcher.description || researcher.bio || "No mission objective documented."}&rdquo;
                    </div>
                  </div>
                  {researcher.bio && researcher.description && (
                    <div className="glass-panel p-12 rounded-[56px] border border-white/5 space-y-6 shadow-2xl">
                      <h3 className="subtle-mono text-[9px] text-indigo-400 uppercase tracking-[0.3em] font-black">Historical Intel</h3>
                      <p className="text-white/40 leading-relaxed font-medium italic">{researcher.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Portfolio' && (
                <div className="glass-panel p-12 rounded-[56px] border border-white/5 shadow-2xl">
                  <h3 className="subtle-mono text-[9px] text-indigo-400 uppercase tracking-[0.3em] mb-10 font-black">Technical Proficiency</h3>
                  {researcher.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {researcher.skills.map(skill => (
                        <span key={skill} className="px-6 py-3.5 bg-white/2 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/10 hover:bg-white/5 transition-all cursor-default italic">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-white/5 text-sm italic font-black uppercase tracking-[0.3em]">No Arsenal Documented.</div>
                  )}
                </div>
              )}

              {activeTab === 'Milestones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {milestones.map((ach) => (
                    <div 
                      key={ach.name} 
                      className={`
                        p-10 rounded-[48px] border flex gap-6 items-center transition-all duration-700 relative overflow-hidden group
                        ${ach.earned ? 'bg-white/2 border-white/5 shadow-2xl hover:border-white/10 hover:bg-white/3' : 'bg-black/20 border-white/2 opacity-20 grayscale'}
                      `}
                    >
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center text-2xl relative z-10
                        ${ach.earned ? 'bg-indigo-500/5 border border-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500' : 'bg-white/5 border border-white/5'}
                      `}>
                        {ach.emoji}
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-[13px] mb-1 uppercase italic tracking-tight">{ach.name}</h4>
                        <p className="text-[10px] text-white/30 font-medium italic">{ach.desc}</p>
                      </div>
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity font-black text-4xl italic uppercase">Elite</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
