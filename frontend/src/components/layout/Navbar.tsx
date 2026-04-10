'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  Compass, 
  Trophy, 
  Target,
  Wallet,
  Menu,
  ChevronRight
} from 'lucide-react';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { springSoft } from '@/lib/animations';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import Magnetic from '@/components/animation/Magnetic';

export default function Navbar() {
  const pathname = usePathname();
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
      <div className="w-full h-full flex items-center justify-between px-4 lg:px-12">
        
        {/* Back & Brand Logo */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4">
          <AnimatePresence>
            {!['/', '/dashboard', '/leaderboard'].includes(pathname) && (
              <Magnetic strength={0.2}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.history.back()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all mr-2"
                  title="Go Back"
                >
                  <ArrowLeft size={16} />
                </motion.button>
              </Magnetic>
            )}
          </AnimatePresence>

          <Link href="/" className="group">
            <Magnetic strength={0.3}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <span className="text-white font-black text-xl italic mt-[-1px]">D</span>
                </div>
                <span className="hidden sm:block text-xl font-black tracking-tight text-white italic">
                  Debugr
                </span>
              </motion.div>
            </Magnetic>
          </Link>
        </div>

        {/* Segmented Navigation */}
        <nav className="flex items-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center gap-1">
            {!loading && (() => {
              const navItems = !user 
                ? [
                    { label: 'Explore', href: '/explore', icon: null },
                    { label: 'Bounties', href: '/programs', icon: null },
                    { label: 'Rankings', href: '/leaderboard', icon: null },
                  ]
                : user.role === 'hacker'
                ? [
                    { label: 'Explore', href: '/explore', icon: null },
                    { label: 'Bounties', href: '/programs', icon: null },
                    { label: 'Rankings', href: '/leaderboard', icon: null },
                  ]
                : [
                    { label: 'Explore', href: '/explore', icon: null },
                    { label: 'Programs', href: '/programs', icon: null },
                    { label: 'Payments', href: '/add-funds', icon: null },
                  ];

              return navItems.map((item) => (
                <Magnetic key={item.label} strength={0.15}>
                  <Link 
                    href={item.href} 
                    onMouseEnter={() => setHoveredLink(item.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="relative px-5 py-2.5 outline-none block"
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
                          className="absolute inset-0 bg-white/10 border border-white/10 rounded-full z-0 shadow-lg"
                          transition={springSoft}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                </Magnetic>
              ));
            })()}
          </div>
        </nav>

        {/* User Actions */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link href="/profile" className="relative group">
                  <Magnetic strength={0.2}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2.5 pl-2.5 pr-1 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                    >
                      <span className="hidden lg:block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
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
                  </Magnetic>
                </Link>

                <Link href="/settings" className="relative group">
                  <Magnetic strength={0.3}>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                    >
                      <Settings size={16} className="text-white/40" />
                    </motion.div>
                  </Magnetic>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/signin">
                  <Magnetic strength={0.2}>
                    <span className="inline-block text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors px-4 py-2">
                      Log In
                    </span>
                  </Magnetic>
                </Link>
                <Link href="/signup">
                  <Magnetic strength={0.3}>
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group overflow-hidden px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                    >
                      <span className="relative z-10 flex items-center gap-2">Get Started <ChevronRight size={14} /></span>
                    </motion.div>
                  </Magnetic>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
