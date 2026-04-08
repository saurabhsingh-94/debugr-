'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { fadeInUp } from '@/lib/animations';

interface Program {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  reward_min: string;
  reward_max: string;
  scope: string[];
}

export default function BountyExplorer() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [minBounty, setMinBounty] = useState(0);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetchWithAuth('/api/programs');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPrograms(data.programs);
          }
        }
      } catch (err) {
        console.error('Failed to load programs', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const filtered = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesBounty = Number(p.reward_max) >= minBounty;
    return matchesSearch && matchesType && matchesBounty;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#f5f5f7' }}>
      <Navbar />

      <main style={{ paddingTop: 100, paddingBottom: 100 }}>
        {/* ─── Hero / Header ─── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5%', marginBottom: 64 }}>
          <motion.div variants={fadeInUp(0.1)} initial="hidden" animate="visible">
            <h1 className="metallic-text" style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 24 }}>
              Hunt the Untraceable.
            </h1>
            <p style={{ color: '#a1a1a6', fontSize: 18, maxWidth: 600 }}>
              Discover elite targets, explore program scopes, and earn bounties for finding legitimate vulnerabilities. 
              The most transparent way to get paid fairly for your researcher impact.
            </p>
          </motion.div>
        </div>

        {/* ─── Discovery Engine (Filters & List) ─── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5%', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 48 }}>
          
          {/* Sidebar FILTERS */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div>
              <p className="mono" style={{ fontSize: 10, color: '#6e6e73', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Search Hub</p>
              <input 
                type="text" 
                placeholder="Find a target..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '14px 18px', color: '#fff', fontSize: 14, outline: 'none'
                }}
              />
            </div>

            <div>
              <p className="mono" style={{ fontSize: 10, color: '#6e6e73', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Program Visibility</p>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10 }}>
                {(['all', 'public', 'private'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterType(t)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: filterType === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: filterType === t ? '#fff' : '#6e6e73',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mono" style={{ fontSize: 10, color: '#6e6e73', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Minimum Max Reward (${minBounty.toLocaleString()})</p>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="1000" 
                value={minBounty}
                onChange={e => setMinBounty(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f5f5f7' }}
              />
            </div>

            <div style={{ marginTop: 40, padding: 24, background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Pro Hunter Tip</p>
              <p style={{ fontSize: 12, color: '#a1a1a6', lineHeight: 1.5 }}>Private programs are unlocked by proving your impact on public targets. Start broad, then specialize.</p>
            </div>
          </aside>

          {/* RESULTS Feed */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {loading && (
              <div style={{ padding: 48, textAlign: 'center', opacity: 0.5 }}>
                <p className="mono" style={{ fontSize: 12 }}>SCANNING FOR ACTIVE BOUNTIES...</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {!loading && filtered.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/programs/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div className="metallic-card" style={{ 
                      padding: 32, borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)'
                    }}>
                      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div style={{ width: 56, height: 56, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>
                          {p.name[0]}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{p.name}</h3>
                            <span style={{ fontSize: 9, fontWeight: 900, background: p.type === 'private' ? 'rgba(229,51,75,0.1)' : 'rgba(76,175,80,0.1)', color: p.type === 'private' ? '#e5334b' : '#4caf50', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{p.type}</span>
                          </div>
                          <p style={{ fontSize: 13, color: '#a1a1a6', marginBottom: 12, maxWidth: 400 }}>{p.description}</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {p.scope.slice(0, 3).map(s => (
                              <span key={s} className="mono" style={{ fontSize: 9, color: '#a1a1a6', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 100 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 10, color: '#6e6e73', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Up To</p>
                        <p className="metallic-text" style={{ fontSize: 28, fontWeight: 900 }}>${Number(p.reward_max).toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && filtered.length === 0 && (
              <div style={{ padding: 64, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 24 }}>
                <p style={{ color: '#a1a1a6' }}>No bounties match your filters.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
