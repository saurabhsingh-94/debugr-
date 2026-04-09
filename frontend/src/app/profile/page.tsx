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
        <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
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

      <main className="max-w-[1300px] mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[380px_1fr] gap-12">
          
          {/* Identity Sidebar - Left Panel */}
          <motion.aside 
            variants={fadeInUp(0.05)}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-32 h-fit space-y-6"
          >
            <div className="glass-panel rounded-[40px] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              {/* Cover Area */}
              <div className="h-28 bg-gradient-to-br from-white/10 to-transparent relative">
                <div className="absolute inset-0 backdrop-blur-3xl opacity-20" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              </div>
              
              <div className="px-10 pb-12 -mt-14 relative flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-white/0 via-white/20 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                  <ProfileAvatar handle={profile.handle} name={profile.name} avatarUrl={profile.avatar_url} size={120} border />
                </div>
                
                <div className="mt-8 text-center w-full">
                  <h1 className="text-3xl font-black tracking-tight mb-2">{profile.name || profile.handle}</h1>
                  <p className="text-white/30 text-sm font-bold tracking-tight">@{profile.handle}</p>
                </div>

                {profile.bio && (
                  <p className="mt-8 text-[15px] leading-relaxed text-white/40 text-center font-medium italic">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}

                <div className="w-full flex flex-col gap-4 mt-10 pt-10 border-t border-white/5 text-[13px] text-white/30 font-bold">
                  {profile.location && (
                    <div className="flex items-center gap-4 hover:text-white/60 transition-colors">
                      <span className="text-lg grayscale opacity-50">📍</span> {profile.location}
                    </div>
                  )}
                  {profile.github_url && (
                    <a href={`https://${profile.github_url.replace(/^https?:\/\//, '')}`} target="_blank" className="flex items-center gap-4 text-white/50 hover:text-white transition-all">
                      <span className="text-lg grayscale opacity-50">🔗</span> GitHub
                    </a>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-lg grayscale opacity-50">📅</span> Member since {joinedDate}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3 mt-10">
                  <Link href="/dashboard" className="w-full">
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 px-6 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-[13px] shadow-[0_10px_30px_rgba(99,102,241,0.3)] uppercase tracking-widest italic"
                    >
                      Access Dashboard
                    </motion.button>
                  </Link>

                  <motion.button 
                    onClick={() => setIsEditModalOpen(true)}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 px-6 bg-transparent border border-white/10 text-white/60 rounded-2xl font-black text-[13px] transition-all uppercase tracking-widest"
                  >
                    Edit Profile
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Reputation Sub-Card */}
            <div className="glass-panel p-8 rounded-[32px] border border-white/10 flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Reputation Grade</p>
                  <h3 className="text-2xl font-black tracking-tight">Elite Tier</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white/40 uppercase tracking-widest">Level</span>
                  <div className="text-2xl font-black text-white">04</div>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                />
              </div>
            </div>
          </motion.aside>

          {/* Activity & Stats - Right Panel */}
          <div className="space-y-10">
            {/* Stats Overview Panel */}
            <motion.div 
              variants={staggerContainer(0.05, 0)}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Total Findings', value: profile.stats?.total_submissions || '0', icon: '📝' },
                { label: 'Reputation', value: profile.stats?.triaged_bugs || '0', icon: '⚡' },
                { label: 'Resolved', value: profile.stats?.resolved_bugs || '0', icon: '🛡️' },
                { label: 'Earnings (USD)', value: `$${totalEarned.toLocaleString()}`, icon: '💎' },
              ].map((stat) => (
                <motion.div 
                  key={stat.label}
                  variants={blurReveal}
                  className="glass-panel p-6 rounded-[28px] border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="text-xl mb-3 grayscale group-hover:grayscale-0 transition-all duration-300 opacity-30 group-hover:opacity-100">{stat.icon}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight text-white/90">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Expertise & Role Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp(0.1)} className="glass-panel p-10 rounded-[40px] border border-white/5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 mb-8 ml-2">Core Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? profile.skills.map((skill: string) => (
                    <span 
                      key={skill} 
                      className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-[12px] font-black text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  )) : (
                    <p className="text-sm text-white/10 italic p-4">Awaiting expertise declaration...</p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={fadeInUp(0.15)} className="glass-panel p-10 rounded-[40px] border border-white/5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 mb-8 ml-2">Identity</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Designation</span>
                    <span className="text-sm font-black text-white italic">
                      {profile.role === 'HACKER' ? 'Elite Hacker' : profile.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-5 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Active Status</span>
                    <span className="text-sm font-black text-white">{profile.experience_level || 'Awaiting Assessment'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Activity Timeline Placeholder */}
            <motion.div 
              variants={fadeInUp(0.2)}
              className="glass-panel p-20 rounded-[48px] border border-white/5 min-h-[500px] flex flex-col items-center justify-center text-center group"
            >
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-10 grayscale opacity-10 group-hover:opacity-30 group-hover:grayscale-0 transition-all duration-500"
              >
                📁
              </motion.div>
              <h3 className="text-3xl font-black italic mb-4 tracking-tight">Activity</h3>
              <p className="text-white/20 max-w-sm text-sm font-bold leading-relaxed mb-10">
                Fetching your recent hacker activity. Your reports and rewards will show up here.
              </p>
              <Link href="/programs">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="text-[12px] font-black text-white/60 uppercase tracking-[0.2em] flex items-center gap-3 cursor-pointer"
                >
                  Discover Opportunities <span className="text-lg">→</span>
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
