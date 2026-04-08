'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ProfileAvatar, { getAvatarGradient } from '@/components/profile/ProfileAvatar';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
      <div style={{ minHeight: '100vh', background: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Navbar />
        <div style={{ width: 40, height: 40, border: '3px solid #2c2c2e', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0e0e10', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Navbar />
        <p style={{ color: '#6e6e73' }}>Could not load your profile.</p>
        <Link href="/signin" style={{ color: '#6366f1', textDecoration: 'none' }}>Sign in →</Link>
      </div>
    );
  }

  const gradient = getAvatarGradient(profile.handle);
  const totalEarned = Math.floor(parseFloat(profile.stats?.total_earned || '0'));
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const resolved = parseInt(profile.stats?.resolved_bugs || '0');
  const submissions = parseInt(profile.stats?.total_submissions || '0');
  const reputation = Math.min(100, Math.round((resolved * 12) + (totalEarned / 500) + (submissions * 2)));

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e10', color: '#f5f5f7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skill-tag:hover { border-color: rgba(99,102,241,0.5) !important; background: rgba(99,102,241,0.18) !important; }
        .stat-block:hover { background: rgba(255,255,255,0.04) !important; }
        .profile-action:hover { opacity: 0.85; transform: translateY(-1px); }
        .profile-action { transition: all 0.18s; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', borderLeft: '1px solid #1c1c21', borderRight: '1px solid #1c1c21', minHeight: '100vh', animation: 'fadeUp 0.4s ease' }}>

        {/* Banner */}
        <div style={{ height: 200, background: gradient, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #0e0e10, transparent)' }} />
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981', animation: 'pulsate 2s infinite' }} />
            {profile.role?.toUpperCase()} SECURITY
          </div>
        </div>

        {/* Avatar + Actions */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: -52 }}>
          <ProfileAvatar handle={profile.handle} name={profile.name} size={100} border />
          <div style={{ display: 'flex', gap: 8, marginTop: 60 }}>
            <Link
              href={`/hacker/${profile.handle}`}
              className="profile-action"
              style={{ padding: '7px 18px', border: '1px solid #2c2c2e', background: 'transparent', color: '#a1a1a6', fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}
            >
              Public View
            </Link>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="profile-action"
              style={{ padding: '7px 18px', background: '#6366f1', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: 'pointer', display: 'inline-block' }}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Identity */}
        <div style={{ padding: '16px 20px 0' }}>
          <h1 className="metallic-text" style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em' }}>{profile.name || profile.handle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <p style={{ margin: 0, fontSize: 15, color: '#6e6e73', fontWeight: 500 }}>@{profile.handle}</p>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#333' }} />
            <p style={{ margin: 0, fontSize: 12, color: '#4a4a52', fontWeight: 600, letterSpacing: '0.05em' }}>{profile.email}</p>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={{ padding: '12px 20px 0', fontSize: 14.5, lineHeight: 1.65, color: '#d1d1d6' }}>{profile.bio}</div>
        )}

        {/* Meta */}
        <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 13, color: '#6e6e73' }}>
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
              🔗 {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          <span>📅 Joined {joinedDate}</span>
        </div>

        {/* Stats */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 4, marginTop: 8 }}>
          {[
            { value: profile.stats?.total_submissions || '0', label: 'Reports', icon: '📋' },
            { value: profile.stats?.resolved_bugs || '0', label: 'Resolved', icon: '✅' },
            { value: profile.stats?.triaged_bugs || '0', label: 'Triaged', icon: '🔍' },
            { value: `$${totalEarned.toLocaleString()}`, label: 'Earned', icon: '💰' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="stat-block" style={{ flex: 1, background: '#141416', border: '1px solid #1c1c21', borderRadius: 12, padding: '12px 8px', textAlign: 'center', transition: 'background 0.2s' }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f5f5f7', marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#6e6e73', marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Reputation */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: '#6e6e73', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Reputation</span>
            <span style={{ color: reputation >= 50 ? '#10b981' : '#f59e0b' }}>{reputation}/100</span>
          </div>
          <div style={{ height: 6, background: '#1c1c21', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${reputation}%`, height: '100%', background: reputation >= 50 ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #f59e0b, #d97706)', borderRadius: 99 }} />
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1c1c21', paddingTop: 20 }}>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: '#6e6e73', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.map((skill: string) => (
                <span key={skill} className="skill-tag" style={{ padding: '5px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 13, borderRadius: 999, fontWeight: 600, transition: 'all 0.2s', cursor: 'default' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA if profile is empty */}
        {!profile.bio && (!profile.skills || profile.skills.length === 0) && (
          <div style={{ margin: '0 20px 24px', padding: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 16, color: '#fff' }}>Complete your security profile</p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6e6e73', lineHeight: 1.5 }}>Showcase your skills and experience to attract more bounty invites and climb the leaderboard.</p>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Initialize Identity →
            </button>
          </div>
        )}

      </div>

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
