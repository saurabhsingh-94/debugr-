'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { blurReveal, staggerContainer, fadeInUp } from '@/lib/animations';
import { 
  Shield, 
  MapPin, 
  Globe, 
  Calendar, 
  Award, 
  Terminal, 
  Activity as ActivityIcon, 
  Zap,
  Briefcase,
  Layers,
  Inbox,
  Link as LinkIcon,
  ChevronRight,
  Cpu
} from 'lucide-react';

interface UserProfile {
  id: string;
  handle: string;
  email: string;
  role: string;
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
  stats: {
    total_submissions: string;
    resolved_bugs: string;
    triaged_bugs: string;
    total_earned: string;
  };
}

function parseSkills(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export default function MyProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.PROFILE);
      if (res.status === 401) { router.push('/signin'); return; }
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setProfile({ ...data.user, skills: parseSkills(data.user.skills) });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [router, loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-6">
        <Navbar />
        <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
        <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-[0.4em] italic animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const totalEarned = Math.floor(parseFloat(profile.stats?.total_earned || '0'));
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] relative overflow-x-hidden">
      <div className="aurora-bg">
        <div className="aurora-blob blob-1 animate-breathing opacity-10" />
        <div className="aurora-blob blob-2 animate-breathing opacity-10 delay-[-4s]" />
      </div>
      
      <Navbar />

      <main className="w-full px-8 md:px-16 lg:px-24 pt-44 pb-32 relative z-10">
        <div className="flex flex-col xl:grid xl:grid-cols-[440px_1fr] gap-20">
          
          {/* Identity Sidebar - Left Panel */}
          <motion.aside 
            variants={fadeInUp(0.05)}
            initial="hidden"
            animate="visible"
            className="xl:sticky xl:top-40 h-fit space-y-10"
          >
            <div className="glass-panel rounded-[56px] border border-white/5 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
              {/* Cover Area */}
              <div className="h-32 bg-linear-to-br from-indigo-500/10 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-3xl opacity-20" />

              </div>
              
              <div className="px-12 pb-16 -mt-16 relative flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
                  <ProfileAvatar handle={profile.handle} name={profile.name} avatarUrl={profile.avatar_url} size={140} border />
                </div>
                
                <div className="mt-10 text-center w-full">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="subtle-mono text-[9px] text-white/20 uppercase tracking-[0.4em] italic">ONLINE</span>
                  </div>
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-3">{profile.name || profile.handle}</h1>
                  <p className="subtle-mono text-[10px] text-indigo-400 font-black tracking-[0.2em] italic">@{profile.handle}</p>
                </div>

                {profile.bio && (
                  <p className="mt-10 text-[15px] leading-relaxed text-white/30 text-center font-medium italic">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}

                <div className="w-full flex flex-col gap-5 mt-12 pt-12 border-t border-white/5">
                  {[
                    { icon: <MapPin size={14} />, text: profile.location, show: !!profile.location },
                    { icon: <LinkIcon size={14} />, text: 'Website', link: profile.website, show: !!profile.website },
                    { icon: <Globe size={14} />, text: 'GitHub', link: profile.github_url, show: !!profile.github_url },
                    { icon: <Calendar size={14} />, text: `Joined ${joinedDate}`, show: true },
                  ].map((item, idx) => item.show && (
                    <div key={idx} className="flex items-center gap-4 group/item">
                      <span className="text-white/10 group-hover/item:text-indigo-400 transition-colors">{item.icon}</span>
                      {item.link ? (
                        <a href={item.link} target="_blank" className="subtle-mono text-[9px] text-white/20 hover:text-white transition-all uppercase tracking-widest italic">{item.text}</a>
                      ) : (
                        <span className="subtle-mono text-[9px] text-white/20 uppercase tracking-widest italic">{item.text}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-full flex flex-col gap-4 mt-12">
                  <Link href="/dashboard" className="w-full">
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 px-6 bg-white text-black rounded-[24px] font-black text-[11px] shadow-2xl uppercase tracking-[0.3em] italic flex items-center justify-center gap-3"
                    >
                      <Terminal size={14} /> Dashboard
                    </motion.button>
                  </Link>

                  <motion.button 
                    onClick={() => setIsEditModalOpen(true)}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 px-6 bg-transparent border border-white/5 text-white/20 rounded-[24px] font-black text-[11px] transition-all uppercase tracking-[0.3em] italic hover:text-white/40"
                  >
                    Edit Profile
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Reputation Monitor */}
            <div className="glass-panel p-10 rounded-[48px] border border-white/5 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <Shield size={64} className="group-hover:scale-125 transition-transform duration-1000" />
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    <p className="subtle-mono text-[8px] font-black uppercase tracking-[0.3em] text-white/20 italic">Registry Score</p>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic">Active Researcher</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest italic leading-none">Status</span>
                  <div className="text-2xl font-black text-indigo-400 italic">ONLINE</div>
                </div>
              </div>
              <div className="h-1.5 bg-white/[0.02] rounded-full overflow-hidden border border-white/5 p-px">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="h-full bg-linear-to-r from-indigo-500 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full"
                />
              </div>
              <p className="subtle-mono text-[9px] text-white/10 uppercase tracking-[0.4em] text-center italic">Reliability: 98.42%</p>
            </div>
          </motion.aside>

          {/* Activity & Stats - Right Panel */}
          <div className="space-y-12">
            {/* Stats Grid */}
            <motion.div 
              variants={staggerContainer(0.05, 0)}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { label: 'REPORTS', value: profile.stats?.total_submissions || '0', icon: <Inbox size={14} />, highlight: false },
                { label: 'RELIABILITY', value: profile.stats?.triaged_bugs || '0', icon: <Zap size={14} />, highlight: true },
                { label: 'RESOLVED', value: profile.stats?.resolved_bugs || '0', icon: <Shield size={14} />, highlight: false },
                { label: 'EARNINGS', value: `$${totalEarned.toLocaleString()}`, icon: <Award size={14} />, highlight: true },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  variants={blurReveal}
                  className="glass-panel p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all">
                    {stat.icon}
                  </div>
                  <div className="relative z-10">
                    <p className="subtle-mono text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 italic">{stat.label}</p>
                    <p className={`text-3xl font-black tracking-tighter italic ${stat.highlight ? 'text-white' : 'text-white/40'}`}>{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Expertise & Identity Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div variants={fadeInUp(0.1)} className="glass-panel p-12 rounded-[56px] border border-white/5 relative overflow-hidden h-fit">
                <div className="flex items-center gap-3 mb-10">
                  <Terminal size={12} className="text-white/20" />
                  <h3 className="subtle-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.length > 0 ? profile.skills.map((skill: string) => (
                    <span 
                      key={skill} 
                      className="px-6 py-3 rounded-[20px] bg-white/[0.02] border border-white/5 text-[11px] font-black text-white/30 hover:text-white hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-default italic uppercase tracking-widest"
                    >
                      {skill}
                    </span>
                  )) : (
                    <p className="subtle-mono text-[10px] text-white/10 uppercase tracking-[0.4em] py-8 italic">No skills added yet.</p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={fadeInUp(0.15)} className="glass-panel p-12 rounded-[56px] border border-white/5 h-fit">
                <div className="flex items-center gap-3 mb-10">
                  <Terminal size={12} className="text-white/20" />
                  <h3 className="subtle-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Account Info</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-6 rounded-[28px] bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all">
                    <span className="subtle-mono text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">Role</span>
                    <span className="text-sm font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase">
                      {profile.role === 'HACKER' ? 'Expert Researcher' : profile.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-6 rounded-[28px] bg-white/[0.01] border border-white/5 group hover:bg-white/[0.03] transition-all">
                    <span className="subtle-mono text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">Experience</span>
                    <span className="text-sm font-black text-white italic opacity-40 uppercase">{profile.experience_level || 'Pending'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Activity Hub Placeholder */}
            <motion.div 
              variants={fadeInUp(0.2)}
              className="glass-panel p-24 rounded-[64px] border border-white/5 min-h-[550px] flex flex-col items-center justify-center text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="w-28 h-28 rounded-[36px] bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white/5 mb-12 shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Briefcase size={40} className="relative z-10 group-hover:text-indigo-400/30 transition-colors" />
              </motion.div>
              <h3 className="text-4xl font-black italic mb-6 tracking-tight uppercase">Activity Log</h3>
              <p className="text-white/20 max-w-sm text-sm font-bold leading-relaxed mb-12 italic">
                Recent reports and reward distributions will be shown here.
              </p>
              <Link href="/programs">
                <motion.div
                  whileHover={{ x: 8 }}
                  className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-4 cursor-pointer italic"
                >
                  Explore Programs <ChevronRight size={14} />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadProfile}
        initialData={{
          name: profile.name || '',
          bio: profile.bio || '',
          website: profile.website || '',
          location: profile.location || '',
          github_url: profile.github_url || '',
          skills: profile.skills || [],
          industry: profile.industry || '',
          experience_level: profile.experience_level || '',
        }}
      />
    </div>
  );
}
