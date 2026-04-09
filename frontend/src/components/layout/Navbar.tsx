'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { springSoft } from '@/lib/animations';
import ProfileAvatar from '@/components/profile/ProfileAvatar';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  interface NavUser { handle: string; name: string; role: string; avatar_url: string; }
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
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500
      ${scrolled ? 'h-16 bg-bg/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl' : 'h-24 bg-transparent'}
    `}>
      <div className="w-full h-full flex items-center justify-between px-6 lg:px-12">
        
        {/* Brand Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <span className="text-white font-black text-xl italic mt-[-1px]">D</span>
              </div>
              <span className="hidden sm:block text-xl font-black tracking-tight text-white">
                Debugr
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Segmented Navigation */}
        <nav className="flex items-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center gap-1">
            {!loading && (() => {
              const navItems = !user 
                ? [
                    { label: 'Explore', href: '/programs' },
                    { label: 'Bounties', href: '/bounties' },
                    { label: 'Rankings', href: '/leaderboard' },
                  ]
                : user.role === 'hacker'
                ? [
                    { label: 'Explore', href: '/programs' },
                    { label: 'Bounties', href: '/bounties' },
                    { label: 'Rankings', href: '/leaderboard' },
                  ]
                : [
                    { label: 'Explore', href: '/programs' },
                    { label: 'Discovery', href: '/bounties' },
                    { label: 'Payments', href: '/add-funds' },
                  ];

              return navItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  onMouseEnter={() => setHoveredLink(item.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-5 py-2.5 outline-none"
                >
                  <span className={`
                    relative z-10 text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-300
                    ${hoveredLink === item.label ? 'text-white' : 'text-white/40'}
                  `}>
                    {item.label}
                  </span>
                  <AnimatePresence>
                    {hoveredLink === item.label && (
                      <motion.div 
                        layoutId="navSegment"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 bg-white/10 border border-white/10 rounded-full z-0"
                        transition={springSoft}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              ));
            })()}
          </div>
        </nav>

        {/* User Actions */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/settings" className="relative group">
                   <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                  >
                    <span className="text-[14px]">⚙️</span>
                  </motion.div>
                </Link>

                <Link href="/profile" className="relative group">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                  >
                    <span className="hidden md:block text-[11px] font-black text-white/50 uppercase tracking-widest">
                      {user.handle}
                    </span>
                    <ProfileAvatar 
                      handle={user.handle} 
                      name={user.name} 
                      avatarUrl={user.avatar_url} 
                      size={28} 
                      border={false} 
                    />
                  </motion.div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/signin">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors px-4 py-2">
                    Log In
                  </span>
                </Link>
                <Link href="/signup">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-white/90 transition-all shadow-xl"
                  >
                    Join
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
