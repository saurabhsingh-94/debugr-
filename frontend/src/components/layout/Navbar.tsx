'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { hoverScale, tapScale, springSoft } from '@/lib/animations';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  interface NavUser { handle: string; name: string; role: string; }
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    
    const fetchUser = async () => {
      const token = getCookie('debugr_token');
      if (token) {
        try {
          const res = await fetchWithAuth(API_ENDPOINTS.PROFILE);
          const data = await res.json();
          if (data.success) setUser(data.user);
          else deleteCookie('debugr_token');
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }
      }
      setLoading(false);
    };

    fetchUser();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => {
    deleteCookie('debugr_token');
    window.location.href = '/signin';
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: scrolled ? 64 : 88,
      background: scrolled ? 'rgba(5,5,5,0.4)' : 'transparent',
      backdropFilter: scrolled ? 'blur(32px)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex', alignItems: 'center'
    }}>
      <div style={{
        width: '100%', maxWidth: '1400px', margin: '0 auto',
        padding: '0 40px', display: 'flex', alignItems: 'center',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ 
              width: 32, height: 32, 
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', 
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(157, 80, 187, 0.3)'
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>D</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>
              Debugr
            </span>
          </motion.div>
        </Link>

        {/* Links */}
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
          {[
            { label: 'Programs', href: '/programs' },
            { label: 'Bounties', href: '/bounties' },
            { label: 'Leaderboard', href: '/leaderboard' },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              onMouseEnter={() => setHoveredLink(item.label)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{ position: 'relative', padding: '10px 20px', textDecoration: 'none' }}
            >
              <span style={{ 
                position: 'relative', zIndex: 2, fontSize: 13, fontWeight: 600, 
                color: hoveredLink === item.label ? '#fff' : '#a1a1a6',
                transition: 'color 0.3s ease'
              }}>
                {item.label}
              </span>
              <AnimatePresence>
                {hoveredLink === item.label && (
                  <motion.div 
                    layoutId="navHover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ 
                      position: 'absolute', inset: 0, zIndex: 1,
                      background: 'rgba(255,255,255,0.05)', borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                    transition={springSoft}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
          
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 16px' }} />
          
          {!loading && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <motion.div 
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.3s'
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                      {user?.name?.charAt(0) || user?.handle?.charAt(0) || 'U'}
                    </span>
                  </motion.div>
                </Link>

                <motion.button 
                  whileHover={{ color: '#fff', x: 2 }}
                  onClick={handleLogout} 
                  style={{ background: 'none', border: 'none', color: '#6e6e73', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link href="/signin" style={{ textDecoration: 'none' }}>
                  <motion.span 
                    whileHover={{ color: '#fff' }}
                    style={{ fontSize: 14, fontWeight: 600, color: '#a1a1a6' }}
                  >
                    Sign In
                  </motion.span>
                </Link>
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                  <motion.div 
                    whileHover={hoverScale}
                    whileTap={tapScale}
                    className="glass-panel hover-glow"
                    style={{
                      fontSize: 13, fontWeight: 800, color: '#fff',
                      padding: '12px 28px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Get Started
                  </motion.div>
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
