'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fadeInUp, 
  staggerContainer, 
  blurIn,
  hoverScale, 
  tapScale,
} from '@/lib/animations';
import { getCookie } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
    <main className="bg-bg min-h-screen overflow-hidden text-white font-sans selection:bg-white/10">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" />

        <motion.div 
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center max-w-[1000px]"
        >
          <motion.h1 
            variants={blurIn(0.1)}
            className="text-[clamp(44px,8vw,96px)] font-black leading-[0.9] tracking-tighter mb-10"
          >
            Securing the <br /> 
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(157,80,187,0.3)]">
              Digital Horizon.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp(0.3)}
            className="text-t2 text-base md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            The world&apos;s premier bug bounty platform. Partner with elite hackers to protect your infrastructure.
          </motion.p>

          <motion.div 
            variants={fadeInUp(0.4)}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Link href="/programs">
              <motion.div 
                whileHover={hoverScale}
                whileTap={tapScale}
                className="px-10 py-5 bg-white text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-white/90 transition-all"
              >
                View Opportunities
              </motion.div>
            </Link>
            <Link href="/signup">
              <motion.div 
                whileHover={hoverScale}
                whileTap={tapScale}
                className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl"
              >
                Hacker Sign Up
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <div className="w-6 h-10 rounded-full border border-white/10 relative">
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3], y: [4, 24, 4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1 left-1/2 -ml-[1.5px] w-[3px] h-2 bg-white rounded-full shadow-[0_0_8px_#fff]"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-40 px-6 relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer(0.2)}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={fadeInUp()} className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Built for Impact
            </h2>
            <p className="text-t2 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Powerful tools designed for the modern security ecosystem.
            </p>
          </motion.div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp()}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group p-10 rounded-[40px] bg-white/1 border border-white/5 relative overflow-hidden transition-all duration-300 hover:bg-white/2 hover:border-white/10 neon-edge-hover"
              >
                <div className="text-4xl mb-8 group-hover:scale-110 transition-transform duration-500 origin-left">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-t2 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>

                <AnimatePresence>
                  {hoveredFeature === idx && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${feature.color}05 0%, transparent 70%)`
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp()}
          className="glass-panel max-w-5xl mx-auto p-16 md:p-32 rounded-[64px] relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
            Join the <br /> Vanguard.
          </h2>
          <p className="text-t2 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            Partner with elite hackers and industry leaders to build a safer digital future.
          </p>
          <Link href="/signup">
            <motion.div 
              whileHover={hoverScale}
              whileTap={tapScale}
              className="inline-block px-12 py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_50px_rgba(99,102,241,0.4)] transition-all"
            >
              Get Started
            </motion.div>
          </Link>
        </motion.div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-white/10 text-xs font-black uppercase tracking-[0.3em]">
          &copy; 2026 Debugr Platform. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
