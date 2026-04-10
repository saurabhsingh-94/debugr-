'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  ChevronRight
} from 'lucide-react';
import { getCookie, deleteCookie, fetchWithAuth, API_ENDPOINTS } from '@/lib/api';
import { springSoft } from '@/lib/animations';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import Magnetic from '@/components/animation/Magnetic';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  interface NavUser { handle: string; name: string; role: string; avatar_url: string; }
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    setIsMenuOpen(false);
    
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

  const getNavItems = () => {
    if (loading) return [];
    
    const base = [
      { label: 'Explore', href: '/explore' },
      { label: user?.role === 'hacker' || !user ? 'Bounties' : 'Programs', href: '/programs' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Rankings', href: '/leaderboard' },
    ];

    if (user?.role === 'company' || user?.role === 'admin') {
      base.push({ label: 'Payments', href: '/add-funds' });
    }

    return base;
  };

  const navItems = getNavItems();

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500
      ${scrolled ? 'h-16 bg-[#050505]/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl' : 'h-24 bg-transparent'}
    `}>
      <div className="w-full h-full flex items-center justify-between px-6 lg:px-12 relative z-50">
        
        {/* Back & Brand Logo */}
        <div className="flex-1 flex items-center gap-3 sm:gap-4">
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
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <span className="text-white font-black text-xl italic mt-[-1px]">D</span>
                </div>
                <span className="hidden sm:block text-xl font-black tracking-tight text-white italic">
                  Debugr
                </span>
              </motion.div>
            </Magnetic>
          </Link>
        </div>

        {/* Segmented Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center gap-1">
            {navItems.map((item) => (
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
            ))}
          </div>
        </nav>

        {/* User Actions & Mobile Toggle */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6">
          <div className="hidden sm:flex items-center gap-4">
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
                  
                  <CurrencySwitcher />

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
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-12 h-12 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 text-white relative z-[110]"
          >
            <motion.span 
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 8 : 0 }}
              className="w-5 h-0.5 bg-white rounded-full" 
            />
            <motion.span 
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              className="w-5 h-0.5 bg-white rounded-full" 
            />
            <motion.span 
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -8 : 0 }}
              className="w-5 h-0.5 bg-white rounded-full" 
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-[#050505] lg:hidden pt-32 px-10 pb-20 flex flex-col justify-between"
          >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full" />
            </div>

            <nav className="relative z-10 flex flex-col gap-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-5xl font-black italic uppercase tracking-tighter text-white/20 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="relative z-10 space-y-8">
              {!loading && (
                user ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                      <ProfileAvatar handle={user.handle} name={user.name} avatarUrl={user.avatar_url} size={48} />
                      <div>
                        <p className="text-sm font-black text-white italic">{user.name}</p>
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest italic">@{user.handle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/profile" className="py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase text-center tracking-widest italic" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                      <button onClick={handleLogout} className="py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase text-center tracking-widest italic text-red-500/50">Logout</button>
                    </div>
                    <div className="flex justify-center pt-2">
                      <CurrencySwitcher />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link href="/signin" onClick={() => setIsMenuOpen(false)} className="w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-center text-sm font-black uppercase tracking-widest italic">Log In</Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="w-full py-6 rounded-3xl bg-white text-black text-center text-sm font-black uppercase tracking-widest italic">Get Started</Link>
                  </div>
                )
              )}
              <div className="pt-10 border-t border-white/10 flex justify-between items-center">
                 <p className="text-[8px] font-mono font-black text-white/10 uppercase tracking-[0.5em] italic">Debugr // Mobile Protocol</p>
                 <div className="flex gap-4">
                   <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                   <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
                   <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-150" />
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
