'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ProfileAvatar, { getAvatarGradient } from '@/components/profile/ProfileAvatar';
import { API_URL } from '@/lib/api';

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
  created_at: string;
  stats: ResearcherStats;
}

const TABS = ['About', 'Skills', 'Achievements'] as const;
type Tab = typeof TABS[number];

function computeReputation(stats: ResearcherStats): number {
  const resolved = parseInt(stats.resolved_bugs) || 0;
  const submissions = parseInt(stats.total_submissions) || 0;
  const earned = parseFloat(stats.total_earned) || 0;
  const score = Math.min(100, Math.round((resolved * 12) + (earned / 500) + (submissions * 2)));
  return score;
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
  const [activeTab, setActiveTab] = useState<Tab>('About');
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
          setError(data.error || 'Researcher not found');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [handle]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Navbar />
        <div style={{ width: 44, height: 44, border: '3px solid #2c2c2e', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#6e6e73', fontSize: 13, letterSpacing: '0.1em' }}>LOADING PROFILE...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !researcher) {
    return (
      <div style={{ minHeight: '100vh', background: '#0e0e10', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <Navbar />
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#141416', border: '1px solid #2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>This account doesn&apos;t exist</h1>
        <p style={{ color: '#6e6e73', fontSize: 14, margin: 0, maxWidth: 280 }}>The handle <strong style={{ color: '#a1a1a6' }}>@{handle}</strong> was not found on Debugr.</p>
        <Link href="/dashboard" style={{ marginTop: 8, padding: '10px 24px', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 12, textDecoration: 'none' }}>
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const joinedDate = new Date(researcher.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalEarned = Math.floor(parseFloat(researcher.stats.total_earned));
  const reputation = computeReputation(researcher.stats);
  const gradient = getAvatarGradient(researcher.handle);
  const resolved = parseInt(researcher.stats.resolved_bugs) || 0;
  const submissions = parseInt(researcher.stats.total_submissions) || 0;

  // Compute achievements from real stats
  const achievements = [
    { emoji: '🩸', name: 'First Blood', desc: 'Submitted a valid bug report', earned: submissions > 0 },
    { emoji: '✅', name: 'Verified Hunter', desc: 'Got a report resolved', earned: resolved > 0 },
    { emoji: '🚀', name: 'Consistent', desc: 'Submitted 5+ reports', earned: submissions >= 5 },
    { emoji: '💰', name: 'Bounty Earner', desc: 'Earned a bug bounty payout', earned: totalEarned > 0 },
    { emoji: '🔒', name: 'Zero Day King', desc: 'Filed 10+ resolved reports', earned: resolved >= 10 },
    { emoji: '🏆', name: 'Elite Hunter', desc: 'Earned $1,000+ in bounties', earned: totalEarned >= 1000 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e10', color: '#f5f5f7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .tab-btn { transition: color 0.2s; }
        .tab-btn:hover { color: #f5f5f7 !important; }
        .skill-tag:hover { border-color: rgba(99,102,241,0.5) !important; background: rgba(99,102,241,0.18) !important; transform: translateY(-1px); }
        .stat-block:hover { background: rgba(255,255,255,0.04) !important; }
        .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .action-btn { transition: all 0.2s; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', borderLeft: '1px solid #1c1c21', borderRight: '1px solid #1c1c21', minHeight: '100vh', animation: 'fadeUp 0.4s ease' }}>

        {/* --- BANNER --- */}
        <div style={{
          height: 180,
          background: gradient,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Noise overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }} />
          {/* Reputation badge */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: reputation >= 50 ? '#10b981' : '#f59e0b', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            {reputation} REP
          </div>
        </div>

        {/* --- AVATAR + ACTIONS ROW --- */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: -52 }}>
          <ProfileAvatar handle={researcher.handle} name={researcher.name} size={100} border />
          <div style={{ display: 'flex', gap: 8, marginTop: 60 }}>
            <button
              className="action-btn"
              onClick={handleShare}
              style={{ padding: '7px 18px', border: '1px solid #2c2c2e', background: copied ? 'rgba(16,185,129,0.1)' : 'transparent', color: copied ? '#10b981' : '#a1a1a6', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer', borderColor: copied ? '#10b981' : '#2c2c2e' }}
            >
              {copied ? '✓ Copied!' : 'Share'}
            </button>
            {researcher.github_url && (
              <a
                href={researcher.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
                style={{ padding: '7px 18px', background: '#f5f5f7', color: '#0e0e10', fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>

        {/* --- IDENTITY --- */}
        <div style={{ padding: '14px 20px 0' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {researcher.name || researcher.handle}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 14, color: '#6e6e73', fontWeight: 500 }}>@{researcher.handle}</p>
        </div>

        {/* --- BIO --- */}
        {researcher.bio && (
          <div style={{ padding: '12px 20px 0', fontSize: 14.5, lineHeight: 1.65, color: '#d1d1d6' }}>
            {researcher.bio}
          </div>
        )}

        {/* --- META CHIPS --- */}
        <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 13, color: '#6e6e73' }}>
          {researcher.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              {researcher.location}
            </span>
          )}
          {researcher.website && (
            <a href={researcher.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
              {researcher.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            Joined {joinedDate}
          </span>
        </div>

        {/* --- STATS ROW --- */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 4, marginTop: 8 }}>
          {[
            { value: researcher.stats.total_submissions, label: 'Reports', icon: '📋' },
            { value: researcher.stats.resolved_bugs, label: 'Resolved', icon: '✅' },
            { value: researcher.stats.triaged_bugs, label: 'Triaged', icon: '🔍' },
            { value: `$${totalEarned.toLocaleString()}`, label: 'Earned', icon: '💰' },
          ].map(({ value, label, icon }) => (
            <div
              key={label}
              className="stat-block"
              style={{ flex: 1, background: '#141416', border: '1px solid #1c1c21', borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'default', transition: 'background 0.2s' }}
            >
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f5f5f7', marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#6e6e73', marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* --- REPUTATION BAR --- */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: '#6e6e73', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>Reputation Score</span>
            <span style={{ color: reputation >= 50 ? '#10b981' : '#f59e0b' }}>{reputation}/100</span>
          </div>
          <div style={{ height: 6, background: '#1c1c21', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${reputation}%`, height: '100%', background: reputation >= 50 ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #f59e0b, #d97706)', borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* --- TABS --- */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1c1c21', borderTop: '1px solid #1c1c21' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '14px 8px', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                  color: isActive ? '#f5f5f7' : '#6e6e73',
                  position: 'relative',
                  letterSpacing: '0.02em',
                }}
              >
                {tab}
                {isActive && (
                  <span style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 40, height: 3, background: 'linear-gradient(to right, #6366f1, #8b5cf6)', borderRadius: 99,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT --- */}
        <div style={{ minHeight: 300 }}>

          {activeTab === 'About' && (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.3s ease' }}>
              {researcher.description && (
                <div style={{ background: '#141416', border: '1px solid #1c1c21', borderRadius: 12, padding: 16 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6e6e73', fontWeight: 600 }}>About</p>
                  <p style={{ margin: 0, fontSize: 14, color: '#d1d1d6', lineHeight: 1.65 }}>{researcher.description}</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Industry', value: researcher.industry || 'General Security' },
                  { label: 'Experience', value: researcher.experience_level || 'Researcher' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#141416', border: '1px solid #1c1c21', borderRadius: 12, padding: 16 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6e6e73', fontWeight: 600 }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 14, color: '#f5f5f7', fontWeight: 600, textTransform: 'capitalize' }}>{value}</p>
                  </div>
                ))}
              </div>
              {researcher.github_url && (
                <a
                  href={researcher.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#141416', border: '1px solid #1c1c21', borderRadius: 12, textDecoration: 'none', color: '#f5f5f7' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>GitHub Profile</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6e6e73' }}>{researcher.github_url.replace(/^https?:\/\//, '')}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#6e6e73', fontSize: 12 }}>↗</span>
                </a>
              )}
            </div>
          )}

          {activeTab === 'Skills' && (
            <div style={{ padding: 20, animation: 'fadeUp 0.3s ease' }}>
              {researcher.skills.length > 0 ? (
                <>
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6e6e73' }}>{researcher.skills.length} skill{researcher.skills.length !== 1 ? 's' : ''} listed</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {researcher.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="skill-tag"
                        style={{
                          padding: '6px 16px',
                          background: 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.25)',
                          color: '#818cf8',
                          fontSize: 13, borderRadius: 999, fontWeight: 600,
                          cursor: 'default', transition: 'all 0.2s',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#6e6e73' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🛠</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 15, color: '#a1a1a6' }}>No skills listed yet</p>
                  <p style={{ margin: 0, fontSize: 13 }}>The researcher has not added any skills.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Achievements' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              {achievements.map(({ emoji, name, desc, earned }) => (
                <div
                  key={name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                    borderBottom: '1px solid #1c1c21',
                    opacity: earned ? 1 : 0.35,
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: earned ? 'rgba(99,102,241,0.15)' : '#141416',
                    border: `1px solid ${earned ? 'rgba(99,102,241,0.3)' : '#1c1c21'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: earned ? '#f5f5f7' : '#6e6e73' }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6e6e73' }}>{desc}</p>
                  </div>
                  {earned && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 99 }}>
                      EARNED
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
