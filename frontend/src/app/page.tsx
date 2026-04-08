'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';

/* ÔöÇÔöÇÔöÇ Types ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
});

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

/* ÔöÇÔöÇÔöÇ Data ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const numbers = [
  { n: '$15.2M', label: 'Paid to researchers' },
  { n: '8,500+', label: 'Active hunters' },
  { n: '12,000+', label: 'Vulnerabilities closed' },
  { n: '340+', label: 'Companies protected' },
];

const programs = [
  { name: 'FinTech Corp', type: 'Private', scope: 'Web ┬À Mobile ┬À API', max: '$15,000', open: true },
  { name: 'CloudNative Inc', type: 'Private', scope: 'Infrastructure ┬À API', max: '$25,000', open: true },
  { name: 'ShopPlatform', type: 'Public', scope: 'Web ┬À Mobile', max: '$8,000', open: false },
  { name: 'DataSafe Ltd', type: 'Private', scope: 'API ┬À Cloud', max: '$12,000', open: true },
  { name: 'StartupXYZ', type: 'Public', scope: 'Web ┬À API', max: '$5,000', open: true },
];

const steps = [
  { n: '01', title: 'Apply once', body: 'Create your researcher profile. We review it once ÔÇö then you have access to every program you qualify for.' },
  { n: '02', title: 'Pick a target', body: 'Browse programs by scope, payout range, or company. Private programs are invite-only based on your track record.' },
  { n: '03', title: 'Submit findings', body: 'Write a clear report. Our triage team reviews within 24h. Every submission gets a response ÔÇö no ghosting.' },
  { n: '04', title: 'Get paid fast', body: 'Verified reports trigger a payout within 48h. No NET-90 nonsense. Real money, real fast.' },
];

const recentActivity = [
  { type: 'SQL Injection', severity: 'Critical', company: 'FinTech Corp', reward: '$5,000' },
  { type: 'Auth Bypass', severity: 'Critical', company: 'CloudNative', reward: '$9,000' },
  { type: 'Stored XSS', severity: 'High', company: 'SaaS Core', reward: '$1,200' },
  { type: 'IDOR', severity: 'High', company: 'ShopPlatform', reward: '$2,500' },
  { type: 'SSRF', severity: 'Critical', company: 'DataSafe', reward: '$6,000' },
  { type: 'Race Condition', severity: 'Critical', company: 'ShopPlatform', reward: '$4,500' },
];

/* ÔöÇÔöÇÔöÇ Severity pill ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
function Sev({ s }: { s: string }) {
  const color = s === 'Critical' ? '#e5334b' : s === 'High' ? '#cc8800' : '#666';
  return (
    <span style={{ fontFamily: 'DM Mono', fontSize: 10, color, letterSpacing: '0.04em' }}>
      {s.toUpperCase()}
    </span>
  );
}

/* ÔöÇÔöÇÔöÇ Page ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export default function Home() {
  const [feedIdx, setFeedIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFeedIdx(p => (p + 1) % recentActivity.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: '#111111', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ HERO ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: '160px 24px 120px',
      }}>
        {/* Label */}
        <motion.p {...fade(0.1)} style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#e5334b', letterSpacing: '0.05em', marginBottom: 28 }}>
          Bug Bounty Platform
        </motion.p>

        {/* Headline */}
        <motion.h1 {...fade(0.2)} style={{
          fontWeight: 800, fontSize: 'clamp(44px, 6vw, 80px)',
          lineHeight: 1.05, letterSpacing: '-0.04em',
          color: '#f0f0f0', maxWidth: 800, marginBottom: 28,
        }}>
          Find vulnerabilities.<br />
          Get paid fairly.<br />
          <span style={{ color: '#444' }}>No games.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p {...fade(0.3)} style={{
          fontSize: 18, color: '#888', lineHeight: 1.65,
          maxWidth: 480, marginBottom: 44, fontWeight: 400,
        }}>
          Debugr connects elite security researchers with companies that 
          take vulnerability reports seriously. Transparent payouts, 
          fast response, real results.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fade(0.4)} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{
            fontSize: 14, fontWeight: 600, color: '#111', background: '#f0f0f0',
            padding: '11px 22px', borderRadius: 8, textDecoration: 'none',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0f0f0')}
          >
            Start hunting
          </Link>
          <Link href="/programs" style={{
            fontSize: 14, fontWeight: 500, color: '#888',
            padding: '11px 22px', borderRadius: 8, textDecoration: 'none',
            border: '1px solid #272727', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f0f0f0'; e.currentTarget.style.borderColor = '#444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#272727'; }}
          >
            Browse programs
          </Link>
        </motion.div>

        {/* Divider + recent activity strip */}
        <motion.div {...fade(0.55)} style={{ marginTop: 72, paddingTop: 28, borderTop: '1px solid #272727' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#444' }}>RECENTLY PAID</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.div
                key={feedIdx}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <Sev s={recentActivity[feedIdx].severity} />
                <span style={{ fontSize: 13, color: '#ccc' }}>{recentActivity[feedIdx].type}</span>
                <span style={{ fontSize: 13, color: '#555' }}>at {recentActivity[feedIdx].company}</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: 13, color: '#e5334b' }}>{recentActivity[feedIdx].reward}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ NUMBERS ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <section style={{ borderTop: '1px solid #272727', borderBottom: '1px solid #272727' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {numbers.map((item, i) => (
            <motion.div key={item.n} {...inView(i * 0.07)} style={{
              padding: '40px 0', borderRight: i < 3 ? '1px solid #272727' : 'none',
              paddingLeft: i === 0 ? 0 : 40,
            }}>
              <p style={{ fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: 6 }}>
                {item.n}
              </p>
              <p style={{ fontSize: 13.5, color: '#666' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ HOW IT WORKS ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px' }}>
        <motion.div {...inView()} style={{ marginBottom: 60 }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#e5334b', letterSpacing: '0.05em', marginBottom: 16 }}>
            How it works
          </p>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: 500 }}>
            Designed for researchers,<br />not companies.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
          {steps.map((s, i) => (
            <motion.div key={s.n} {...inView(i * 0.08)} style={{
              padding: '40px 40px',
              background: '#171717',
              border: '1px solid #272727',
              marginRight: i % 2 === 0 ? 0 : 0,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = '#1e1e1e')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = '#171717')}
            >
              <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#444', display: 'block', marginBottom: 20 }}>{s.n}</span>
              <h3 style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 12, color: '#f0f0f0' }}>{s.title}</h3>
              <p style={{ fontSize: 14.5, color: '#666', lineHeight: 1.7 }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ PROGRAMS ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <section style={{ borderTop: '1px solid #272727' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <motion.div {...inView()}>
              <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#e5334b', letterSpacing: '0.05em', marginBottom: 16 }}>Active programs</p>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px,3.5vw,42px)', letterSpacing: '-0.03em' }}>Current bounties</h2>
            </motion.div>
            <Link href="/programs" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#666')}
            >See all programs ÔåÆ</Link>
          </div>

          {/* Table */}
          <div style={{ border: '1px solid #272727' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 2fr 1fr 80px', gap: 16, padding: '10px 20px', borderBottom: '1px solid #272727', background: '#171717' }}>
              {['Program', 'Type', 'Scope', 'Max reward', ''].map(h => (
                <span key={h} style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {programs.map((p, i) => (
              <motion.div key={p.name} {...inView(i * 0.06)} style={{
                display: 'grid', gridTemplateColumns: '2fr 80px 2fr 1fr 80px', gap: 16,
                padding: '16px 20px', borderBottom: i < programs.length - 1 ? '1px solid #1e1e1e' : 'none',
                alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = '#171717')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: '#e0e0e0' }}>{p.name}</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#555' }}>{p.type}</span>
                <span style={{ fontSize: 13, color: '#666' }}>{p.scope}</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: 13, color: '#e5334b', fontWeight: 500 }}>{p.max}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.open ? '#4CAF50' : '#444' }} />
                  <span style={{ fontSize: 12, color: p.open ? '#4CAF50' : '#555' }}>{p.open ? 'Open' : 'Closed'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ CTA ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <section style={{ borderTop: '1px solid #272727' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <motion.div {...inView()} style={{ maxWidth: 560 }}>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
              Ready to find what others miss?
            </h2>
            <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7 }}>
              Apply for researcher access. We review every application manually. 
              If you&apos;re serious about security research, you belong here.
            </p>
          </motion.div>
          <motion.div {...inView(0.1)}>
            <Link href="/dashboard" style={{
              display: 'block', fontSize: 14, fontWeight: 600,
              color: '#111', background: '#f0f0f0', padding: '14px 28px',
              borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f0f0f0')}
            >Apply for access</Link>
          </motion.div>
        </div>
      </section>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ FOOTER ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <footer style={{ borderTop: '1px solid #272727', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="18" height="18" rx="4" stroke="#e5334b" strokeWidth="1.5"/>
              <path d="M6 10h8M10 6v8" stroke="#e5334b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Debugr</span>
            <span style={{ fontSize: 13, color: '#333', marginLeft: 12 }}>┬® 2024</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Security', 'Status', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: '#444', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
