'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
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

const MOCK_REPORTS: Report[] = [
  { id: 'DB-1001', title: 'SQL Injection in User Profile Auth', severity: 'Critical', status: 'Triaged', earned: '$5,000', company: 'FinTech Corp', submitted: 'Mar 28', cvss: 9.8 },
  { id: 'DB-1002', title: 'Stored XSS via Markdown Comments', severity: 'High', status: 'Bounty Paid', earned: '$1,200', company: 'SaaS Core', submitted: 'Mar 25', cvss: 7.4 },
  { id: 'DB-1003', title: 'Broken IDOR in /api/orders', severity: 'High', status: 'Triaged', earned: '$2,500', company: 'CloudNative', submitted: 'Mar 22', cvss: 7.1 },
  { id: 'DB-1004', title: 'Exposed Environment Variables', severity: 'Medium', status: 'Pending', earned: '$500', company: 'StartupXYZ', submitted: 'Mar 20', cvss: 5.3 },
  { id: 'DB-1005', title: 'Race Condition in Checkout Flow', severity: 'Critical', status: 'Triaged', earned: '$4,500', company: 'ShopPlatform', submitted: 'Mar 18', cvss: 9.1 },
  { id: 'DB-1006', title: 'Sensitive Data in Error Logs', severity: 'Low', status: 'Resolved', earned: '$300', company: 'DataSafe', submitted: 'Mar 15', cvss: 3.7 },
];

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

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
});

export default function Dashboard() {
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
          if (data.success && data.reports.length > 0) {
            // Transform backend reports to UI format
            const transformed = data.reports.map((r: any) => ({
              id: r.id.substring(0, 8).toUpperCase(),
              title: r.title,
              severity: r.severity.charAt(0).toUpperCase() + r.severity.slice(1),
              status: r.status === 'resolved' && r.bounty > 0 ? 'Bounty Paid' : r.status.charAt(0).toUpperCase() + r.status.slice(1),
              earned: `$${Number(r.bounty).toLocaleString()}`,
              company: 'General', // Default for now
              submitted: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              cvss: r.severity === 'critical' ? 9.8 : r.severity === 'high' ? 7.5 : 5.0,
            }));
            setReports(transformed);
            setIsLive(true);
          } else {
            // No reports found, stay with empty list or fallback for testing
            setReports(MOCK_REPORTS);
          }
        } else {
          // Fallback to mock data if not logged in or backend down
          setReports(MOCK_REPORTS);
        }
      } catch (err) {
        setReports(MOCK_REPORTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = filter === 'All' ? reports : reports.filter(r => r.severity === filter);
  const total = reports.reduce((s, r) => s + Number(r.earned.replace(/[$,]/g, '')), 0);

  return (
    <div style={{ background: '#111111', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* ── Header ── */}
        <div style={{ paddingTop: 20, paddingBottom: 48, borderBottom: '1px solid #272727', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <p style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#e5334b', letterSpacing: '0.05em' }}>Hunter Dashboard</p>
                {isLive && (
                  <span style={{ fontSize: 10, background: 'rgba(76,175,80,0.1)', color: '#4caf50', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(76,175,80,0.2)' }}>Live Data</span>
                )}
              </div>
              <h1 style={{ fontWeight: 800, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: '-0.04em', lineHeight: 1 }}>Your Cockpit</h1>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { label: 'Total earned', value: `$${total.toLocaleString()}`, red: true },
                { label: 'Reports', value: String(reports.length) },
                { label: 'Global rank', value: '#42' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#444', letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</p>
                  <p style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: s.red ? '#e5334b' : '#f0f0f0' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#444', marginRight: 4 }}>Severity</span>
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${filter === s ? '#e5334b' : '#272727'}`,
              background: filter === s ? 'rgba(229,51,75,0.08)' : 'transparent',
              color: filter === s ? '#e5334b' : '#666',
              transition: 'all 0.15s',
            }}>{s}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: 'DM Mono', fontSize: 11, color: '#444' }}>
            {filtered.length} report{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{ border: '1px solid #272727', borderRadius: 8, overflow: 'hidden' }}>
          {/* TH */}
          <div style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 130px 70px 130px 90px',
            padding: '10px 20px', gap: 16, background: '#171717', borderBottom: '1px solid #272727',
          }}>
            {['ID', 'Vulnerability', 'Company', 'CVSS', 'Status', 'Reward'].map(h => (
              <span key={h} style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ position: 'relative' }}>
            {loading && (
              <div style={{ padding: 40, textAlign: 'center', color: '#666', fontSize: 13 }}>Loading reports...</div>
            )}
            
            <AnimatePresence>
              {!loading && filtered.map((r, i) => {
                const st = statConfig[r.status] || { text: '#ccc', bg: '#1e1e1e' };
                const sv = sevColor[r.severity] || { text: '#888' };
                return (
                  <motion.div key={r.id} {...inView(0)} style={{
                    display: 'grid', gridTemplateColumns: '110px 1fr 130px 70px 130px 90px',
                    padding: '16px 20px', gap: 16, alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid #1a1a1a' : 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    whileHover={{ backgroundColor: '#171717' }}
                  >
                    <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#444' }}>{r.id === 'MOCK' ? '----' : r.id}</span>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: '#e0e0e0', marginBottom: 2 }}>{r.title}</p>
                      <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#3a3a3a' }}>{r.submitted}</p>
                    </div>
                    <span style={{ fontSize: 13, color: '#666' }}>{r.company}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: sv.text, fontWeight: 500 }}>{r.cvss}</span>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 500,
                      padding: '3px 10px', borderRadius: 4,
                      background: st.bg, color: st.text,
                    }}>{r.status}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 13, color: '#f0f0f0', fontWeight: 600, textAlign: 'right' }}>{r.earned}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/submit" style={{
            fontSize: 13, fontWeight: 600, color: '#111', background: '#f0f0f0',
            padding: '9px 20px', borderRadius: 7, textDecoration: 'none',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0f0f0')}
          >+ New report</Link>
        </div>
      </div>
    </div>
  );
}
