'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fadeInUp, 
  staggerContainer, 
  blurIn,
  inView,
  hoverScale, 
  tapScale,
} from '@/lib/animations';
import { getCookie } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const token = getCookie('debugr_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const features = [
    {
      title: 'Real-time Metrics',
      desc: 'Instant insight into vulnerability impact and resolution status.',
      icon: '📊',
      color: '#c084fc'
    },
    {
      title: 'Hacker Network',
      desc: 'Connect with a global community of elite security researchers.',
      icon: '🌍',
      color: '#60a5fa'
    },
    {
      title: 'Fast Verification',
      desc: 'Rapid triage and verification process handled by security experts.',
      icon: '⚡',
      color: '#f472b6'
    }
  ];

  return (
    <main className="min-h-screen bg-bg selection:bg-accent-purple/30 selection:text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(157,80,187,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-12">
            <motion.div
              variants={fadeInUp(0.1)}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Network Status: Operational</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white">
                <span className="block italic opacity-40 uppercase">Secure The</span>
                <span className="block bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">FRONTIER.</span>
              </h1>

              <p className="text-lg md:text-xl text-t2 max-w-xl font-medium leading-relaxed">
                The next-generation bug bounty terminal for elite researchers and secure systems. Submit, track, and earn in the shadows.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp(0.3)}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-6"
            >
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-5 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all"
                >
                  Join the Grid
                </motion.button>
              </Link>
              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl border border-white/5 transition-all"
                >
                  Explore Ops
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Visual Element */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div
              variants={blurIn(0.5)}
              initial="hidden"
              animate="visible"
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/20 to-transparent rounded-[60px] blur-3xl" />
              <div className="relative h-full w-full glass-panel border border-white/10 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-xl rounded-[60px]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
                <div className="text-[80px] opacity-10 font-black tracking-tighter filter blur-[2px] select-none">DEBUGR</div>
                <div className="absolute w-40 h-40 border-2 border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute w-60 h-60 border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
                
                {/* Minimal HUD overlay placeholder */}
                <div className="absolute bottom-10 left-10 right-10 flex justify-between">
                  <div className="text-[10px] font-mono text-white/20">SYSTEM_ID: X-88</div>
                  <div className="text-[10px] font-mono text-white/20">REDACTED_DATA</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Stats */}
      <section className="px-6 lg:px-12 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Tasks', value: '42', icon: '⚡' },
              { label: 'Bounties Paid', value: '$840k', icon: '💰' },
              { label: 'Elite Hackers', value: '1.2k', icon: '👁️' },
              { label: 'Nodes Secured', value: '18.4k', icon: '🛡️' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp(0.2 + i * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group p-8 glass-panel border border-white/5 hover:border-white/10 transition-all bg-white/[0.02] rounded-[32px]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</span>
                </div>
                <div className="text-4xl font-black text-white">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; 2026 Debugr Platform. Operational Integrity Guaranteed.
        </p>
      </footer>
    </main>
  );
}
