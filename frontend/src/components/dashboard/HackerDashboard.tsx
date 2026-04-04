'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type Status = 'Triaged' | 'Resolved' | 'Pending' | 'Bounty Paid';

interface Report {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  earned: string;
  company: string;
  submitted: string;
  cvss: number;
}

const sevColor: Record<Severity, { text: string }> = {
  Critical: { text: '#e5334b' },
  High:     { text: '#cc8800' },
  Medium:   { text: '#888' },
  Low:      { text: '#444' },
};

const statConfig: Record<Status, { text: string; bg: string }> = {
  Triaged:       { text: '#ccc', bg: '#1e1e1e' },
  'Bounty Paid': { text: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
  Resolved:      { text: '#555', bg: '#171717' },
  Pending:       { text: '#cc8800', bg: 'rgba(204,136,0,0.1)' },
};

export default function HackerDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Severity | 'All'>('All');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchWithAuth(API_ENDPOINTS.MY_REPORTS);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const transformed = data.reports.map((r: any) => ({
              id: r.id.substring(0, 8).toUpperCase(),
              title: r.title,
              severity: r.severity.charAt(0).toUpperCase() + r.severity.slice(1),
              status: r.status === 'resolved' && r.bounty > 0 ? 'Bounty Paid' : r.status.charAt(0).toUpperCase() + r.status.slice(1),
              earned: `$${Number(r.bounty || 0).toLocaleString()}`,
              company: r.company || 'Private Program',
              submitted: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              cvss: r.severity === 'critical' ? 9.8 : r.severity === 'high' ? 7.5 : 5.0,
            }));
            setReports(transformed);
            setIsLive(true);
          }
        }
      } catch (err) {
        console.error("Dashboard compute error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = filter === 'All' ? reports : reports.filter(r => r.severity === filter);
  const total = reports.reduce((s, r) => s + Number(r.earned.replace(/[$,]/g, '')), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
      {/* ── Header ── */}
      <div style={{ paddingBottom: 48, borderBottom: '1px solid #272727', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <p className="mono" style={{ fontSize: 11, color: '#e5334b', letterSpacing: '0.05em' }}>RESEARCHER OPS // DASHBOARD</p>
              {isLive && (
                <span className="badge-live">LIVE GRID</span>
              )}
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: '-0.04em', lineHeight: 1 }}>Control Center.</h1>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Total revenue', value: `$${total.toLocaleString()}`, highlight: true },
              { label: 'Vulnerabilities', value: String(reports.length) },
              { label: 'Signal strength', value: '88%' },
            ].map(s => (
              <div key={s.label}>
                <p className="mono" style={{ fontSize: 10, color: '#444', letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: s.highlight ? '#e5334b' : '#f0f0f0' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#444', marginRight: 4, textTransform: 'uppercase' }}>Severity Filter</span>
        {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${filter === s ? '#e5334b' : '#272727'}`,
            background: filter === s ? 'rgba(229,51,75,0.08)' : 'rgba(255,255,255,0.02)',
            color: filter === s ? '#e5334b' : '#666',
            transition: 'all 0.2s',
          }}>{s}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'DM Mono', fontSize: 11, color: '#444' }}>
          LOADED: {filtered.length} FRAGMENTS
        </span>
      </div>

      {/* ── Grid ── */}
      <div style={{ border: '1px solid #272727', borderRadius: 12, background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '110px 1fr 130px 70px 130px 90px',
          padding: '14px 24px', gap: 16, background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid #272727',
        }}>
          {['Vector ID', 'Vulnerability Title', 'Target', 'CVSS', 'State', 'Bounty'].map(h => (
            <span key={h} style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        <div style={{ position: 'relative', minHeight: 200 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#444', fontSize: 12, fontFamily: 'DM Mono' }}>SYNCHRONIZING DATA...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#444', fontSize: 12, fontFamily: 'DM Mono' }}>NO THREAT DATA DETECTED.</div>
          ) : (
            <AnimatePresence>
              {filtered.map((r, i) => {
                const st = statConfig[r.status] || { text: '#ccc', bg: '#1e1e1e' };
                const sv = sevColor[r.severity] || { text: '#888' };
                return (
                  <motion.div 
                    key={r.id} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '110px 1fr 130px 70px 130px 90px',
                      padding: '18px 24px', gap: 16, alignItems: 'center',
                      borderBottom: i < filtered.length - 1 ? '1px solid #1a1a1a' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#444' }}>{r.id}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#eee', marginBottom: 2 }}>{r.title}</p>
                      <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#3a3a3a' }}>SUBMITTED: {r.submitted}</p>
                    </div>
                    <span style={{ fontSize: 13, color: '#777' }}>{r.company}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 13, color: sv.text, fontWeight: 700 }}>{r.cvss}</span>
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 4, textTransform: 'uppercase',
                      background: st.bg, color: st.text, border: `1px solid ${st.text}22`
                    }}>{r.status}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 14, color: '#fff', fontWeight: 700, textAlign: 'right' }}>{r.earned}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/submit" className="metallic-button" style={{ padding: '12px 24px', fontSize: 13 }}>
          + Initiate New Report
        </Link>
      </div>
    </motion.div>
  );
}
