'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth, API_ENDPOINTS } from '@/lib/api';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ReportStatus = 'pending' | 'triaged' | 'resolved' | 'duplicate' | 'informative' | 'not-applicable';

interface CompanyReport {
  id: string;
  title: string;
  severity: Severity;
  status: ReportStatus;
  bounty: number;
  user_handle: string;
  created_at: string;
}

interface Program {
  id: string;
  name: string;
  status: string;
}

export default function CompanyDashboard() {
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'programs'>('inbox');

  useEffect(() => {
    async function loadCompanyData() {
      try {
        const [repRes, progRes] = await Promise.all([
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/company`),
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/programs/managed`)
        ]);

        if (repRes.ok) {
          const repData = await repRes.json();
          if (repData.success) setReports(repData.reports);
        }
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.success) setPrograms(progData.programs);
        }
      } catch (err) {
        console.error("Company data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyData();
  }, []);

  const totalPaid = reports.reduce((acc, r) => acc + Number(r.bounty || 0), 0);
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
      {/* ── Metrics ── */}
      <div style={{ paddingBottom: 48, borderBottom: '1px solid #272727', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <p className="mono" style={{ fontSize: 11, color: '#33d6e5', letterSpacing: '0.05em' }}>ORG // SECURITY COMMAND</p>
              <span className="badge-live" style={{ color: '#33d6e5', background: 'rgba(51,214,229,0.1)', borderColor: 'rgba(51,214,229,0.2)' }}>COMMAND ACTIVE</span>
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: '-0.04em', lineHeight: 1 }}>Defense Intelligence.</h1>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Total Bounties Paid', value: `$${totalPaid.toLocaleString()}`, highlight: true },
              { label: 'Active Reports', value: String(reports.length) },
              { label: 'Unresolved', value: String(pendingCount) },
            ].map(s => (
              <div key={s.label}>
                <p className="mono" style={{ fontSize: 10, color: '#444', letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: s.highlight ? '#fff' : '#888' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub Navigation ── */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid #1a1a1a' }}>
        {[
          { id: 'inbox', label: 'Triage Inbox', count: pendingCount },
          { id: 'programs', label: 'Managed Programs', count: programs.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ 
              padding: '12px 4px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'none', border: 'none', color: activeTab === tab.id ? '#fff' : '#444',
              borderBottom: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            {tab.label}
            {tab.count > 0 && <span style={{ fontSize: 10, background: activeTab === tab.id ? '#fff' : '#222', color: activeTab === tab.id ? '#000' : '#666', padding: '1px 6px', borderRadius: 10 }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'inbox' ? (
        <div style={{ border: '1px solid #272727', borderRadius: 12, background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 120px 100px 140px 100px',
            padding: '14px 24px', gap: 16, background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid #272727',
          }}>
            {['Vulnerability', 'Researcher', 'Severity', 'State', 'Bounty'].map(h => (
              <span key={h} style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          <div style={{ position: 'relative', minHeight: 200 }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#444', fontSize: 12, fontFamily: 'DM Mono' }}>POLLING API...</div>
            ) : reports.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#444', fontSize: 12, fontFamily: 'DM Mono' }}>INBOX ZERO. PERIMETER SECURE.</div>
            ) : (
              reports.map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 120px 100px 140px 100px',
                  padding: '18px 24px', gap: 16, alignItems: 'center',
                  borderBottom: i < reports.length - 1 ? '1px solid #1a1a1a' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#eee', marginBottom: 2 }}>{r.title}</p>
                    <p style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#3a3a3a' }}>REC: {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: 13, color: '#777' }}>@{r.user_handle || 'anonymous'}</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 700, color: r.severity === 'critical' ? '#e5334b' : '#cc8800', textTransform: 'uppercase' }}>{r.severity}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 4, background: '#1e1e1e', color: '#888', border: '1px solid #333', textTransform: 'uppercase' }}>{r.status}</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>${Number(r.bounty || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {programs.map(p => (
            <div key={p.id} style={{ 
              padding: 24, borderRadius: 16, border: '1px solid #272727', background: 'rgba(255,255,255,0.01)',
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{p.name}</h3>
                <p className="mono" style={{ fontSize: 11, color: '#444', textTransform: 'uppercase' }}>Status: {p.status}</p>
              </div>
              <Link href={`/programs/${p.id}/manage`} style={{ 
                marginTop: 'auto', textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 700,
                background: '#fff', color: '#000', borderRadius: 8, textDecoration: 'none'
              }}>Manage Policy</Link>
            </div>
          ))}
          <div style={{ 
            padding: 24, borderRadius: 16, border: '1px dashed #444', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, cursor: 'pointer'
          }}>
            <p style={{ color: '#444', fontSize: 14 }}>Deployment Ready</p>
            <button className="metallic-button" style={{ padding: '10px 20px', fontSize: 12 }}>+ New Bug Bounty Program</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
