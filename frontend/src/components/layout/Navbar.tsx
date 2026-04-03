'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const links = ['Programs', 'Leaderboard', 'Blog', 'Docs'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header style={{
      position: 'fixed', inset: '0 0 auto 0', zIndex: 100,
      height: 60,
      borderBottom: `1px solid ${scrolled ? '#272727' : 'transparent'}`,
      background: scrolled ? 'rgba(17,17,17,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', height: '100%',
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 'auto' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="18" height="18" rx="4" stroke="#e5334b" strokeWidth="1.5"/>
            <path d="M6 10h8M10 6v8" stroke="#e5334b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: '#f0f0f0' }}>Debugr</span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {links.map(l => (
            <Link key={l} href="#" style={{
              fontSize: 13.5, color: '#888', textDecoration: 'none', fontWeight: 400,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}
            >{l}</Link>
          ))}
        </nav>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 32 }}>
          <Link href="/login" style={{ fontSize: 13.5, color: '#888', textDecoration: 'none', fontWeight: 400 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >Log in</Link>
          <Link href="/dashboard" style={{
            fontSize: 13, fontWeight: 500, color: '#111', background: '#f0f0f0',
            padding: '6px 16px', borderRadius: 6, textDecoration: 'none',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0f0f0')}
          >Get started</Link>
        </div>
      </div>
    </header>
  );
}
