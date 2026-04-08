'use client';
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { fetchWithAuth } from '@/lib/api';
import { inView } from '@/lib/animations';

interface Program {
  id: string;
  name: string;
  description: string;
  type: string;
  reward_min: number;
  reward_max: number;
  scope: any;
  logo_url: string;
}

export default function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgram() {
      try {
        const res = await fetchWithAuth(`/api/programs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProgram(data.program);
        }
      } catch (err) {
        console.error('Failed to load program', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgram();
  }, [id]);

  if (loading) return <div style={{ background: '#111', minHeight: '100vh', color: '#fff', padding: 100 }}>Decrypting program specs...</div>;
  if (!program) return <div style={{ background: '#111', minHeight: '100vh', color: '#fff', padding: 100 }}>Program not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)' }}>
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '160px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 60 }}>
          
          <section>
            <motion.div variants={inView()} initial="hidden" animate="visible">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <span style={{ 
                  fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 4, 
                  background: program.type === 'private' ? 'rgba(229,51,75,0.1)' : 'rgba(76,175,80,0.1)',
                  color: program.type === 'private' ? '#e5334b' : '#4caf50',
                  textTransform: 'uppercase'
                }}>
                  {program.type} PROGRAM
                </span>
                <span style={{ color: 'var(--t3)', fontSize: 12 }}>ID: {program.id}</span>
              </div>
              <h1 className="metallic-text" style={{ fontSize: 48, fontWeight: 900, marginBottom: 24 }}>{program.name}</h1>
              <p style={{ color: 'var(--t2)', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>{program.description}</p>
            </motion.div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 40 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 32 }}>Bounty Table</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Low', color: '#a1a1a6', value: program.reward_min },
                  { label: 'Medium', color: '#4caf50', value: (program.reward_max * 0.3).toFixed(0) },
                  { label: 'High', color: '#fdd835', value: (program.reward_max * 0.7).toFixed(0) },
                  { label: 'Critical', color: '#e5334b', value: program.reward_max },
                ].map(tier => (
                  <div key={tier.label} className="metallic-card" style={{ padding: 24, textAlign: 'center', borderRadius: 16, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>{tier.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: tier.color }}>${Number(tier.value).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 60 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Scope Details</h3>
              <div className="metallic-card" style={{ padding: 40, borderRadius: 24, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.01)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '16px 0', fontSize: 12, color: 'var(--t3)', textTransform: 'uppercase' }}>Asset Type</th>
                      <th style={{ padding: '16px 0', fontSize: 12, color: 'var(--t3)', textTransform: 'uppercase' }}>In Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(program.scope) ? program.scope.map((s: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '20px 0', fontWeight: 600 }}>{s}</td>
                        <td style={{ padding: '20px 0', color: '#4caf50' }}>● Active</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>No scope definitions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside>
            <div className="metallic-card" style={{ 
              padding: 32, borderRadius: 24, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)',
              position: 'sticky', top: 160
            }}>
              <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24, lineHeight: 1.5 }}>
                Ready to submit a vulnerability? Ensure your report follows our disclosure guidelines.
              </p>
              <Link href={`/dashboard?program=${program.id}`} style={{
                display: 'block', textAlign: 'center', width: '100%', background: '#f5f5f7', 
                color: '#111', padding: '16px 0', borderRadius: 12, fontWeight: 800, textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f7'; }}
              >
                Submit Vulnerability
              </Link>
              
              <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>Last Updated</p>
                  <p style={{ fontSize: 13 }}>3 days ago</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>Platform Confidence</p>
                  <p style={{ fontSize: 13, color: '#4caf50' }}>Verified Elite</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
