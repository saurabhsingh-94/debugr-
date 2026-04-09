'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { springSoft } from '@/lib/animations';

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
    <header className={`
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center
      ${scrolled ? 'h-16 bg-bg/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'h-24 bg-transparent'}
    `}>
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
              <span className="text-white font-black text-xl italic mt-[-1px]">D</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-white/90 transition-colors">
              Debugr
            </span>
          </motion.div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center">
            {[
              { label: 'Programs', href: '/programs' },
              { label: 'Bounties', href: '/bounties' },
              { label: 'Rankings', href: '/leaderboard' },
            ].map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                onMouseEnter={() => setHoveredLink(item.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative px-6 py-2.5"
              >
                <span className={`
                  relative z-10 text-[13px] font-black uppercase tracking-widest transition-colors duration-300
                  ${hoveredLink === item.label ? 'text-white' : 'text-white/30'}
                `}>
                  {item.label}
                </span>
                <AnimatePresence>
                  {hoveredLink === item.label && (
                    <motion.div 
                      layoutId="navHover"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 bg-white/5 border border-white/5 rounded-xl z-0"
                      transition={springSoft}
                    />
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block w-px h-6 bg-white/5 mx-4" />

          {!loading && (
            user ? (
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="hidden sm:block">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Dashboard
                  </motion.button>
                </Link>

                <div className="flex items-center gap-4">
                  <Link href="/profile" className="relative group">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all overflow-hidden"
                    >
                      <span className="text-white text-xs font-black uppercase">
                        {user?.handle?.substring(0, 2) || '??'}
                      </span>
                    </motion.div>
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/signin">
                  <span className="text-[13px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors px-4 py-2">
                    Sign In
                  </span>
                </Link>
                <Link href="/signup">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-white text-black text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all shadow-2xl"
                  >
                    Sign Up
                  </motion.div>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
