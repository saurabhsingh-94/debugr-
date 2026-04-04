'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
        width: '100%', height: '100%',
        padding: '0 5%', display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 'auto' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #f5f5f7 0%, #a1a1a6 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#111', fontWeight: 900, fontSize: 18 }}>D</span>
          </div>
          <span className="metallic-text" style={{ fontSize: 20, fontWeight: 850, letterSpacing: '-0.03em' }}>
            Debugr
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {[
            { label: 'Directory', href: '/programs' },
            { label: 'Leaderboard', href: '/leaderboard' },
            { label: 'Docs', href: '/docs' }
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              style={{ fontSize: 13, fontWeight: 500, color: '#a1a1a6', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f5f5f7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#a1a1a6')}
            >
              {item.label}
            </Link>
          ))}
          
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', marginLeft: 8, marginRight: 8 }} />
          
          <Link href="/signin" style={{ fontSize: 13, fontWeight: 500, color: '#f5f5f7', textDecoration: 'none' }}>
            Sign in
          </Link>

          <Link href="/signup" style={{
            fontSize: 13, fontWeight: 700, color: '#111', background: '#f5f5f7',
            padding: '10px 24px', borderRadius: 8, textDecoration: 'none',
            transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(255,255,255,0.1)'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#f5f5f7'; }}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
