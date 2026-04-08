'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fadeInUp, 
  staggerContainer, 
  blurIn,
  easeOutExpo, 
  hoverScale, 
  tapScale,
  viewportConfig
} from '@/lib/animations';

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      title: 'Advanced Analytics',
      desc: 'Real-time threat intelligence and vulnerability distribution mapping.',
      icon: '📊',
      color: '#c084fc'
    },
    {
      title: 'Global Researcher Network',
      desc: 'Connect with elite security researchers from around the world.',
      icon: '🌐',
      color: '#60a5fa'
    },
    {
      title: 'Rapid Triage',
      desc: 'Industry-leading SLA for vulnerability validation and processing.',
      icon: '⚡',
      color: '#f472b6'
    }
  ];

  return (
    <main style={{ background: '#050505', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', minHeight: '100vh', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', padding: '0 5%',
        paddingTop: 80
      }}>
        {/* Animated Background Blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ 
              position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw',
              background: 'radial-gradient(circle, rgba(157, 80, 187, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)', borderRadius: '50%'
            }}
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -40, 0],
              y: [0, 40, 0],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ 
              position: 'absolute', bottom: '10%', right: '10%', width: '45vw', height: '45vw',
              background: 'radial-gradient(circle, rgba(64, 150, 238, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)', borderRadius: '50%'
            }}
          />
        </div>

        <motion.div 
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900 }}
        >
          <motion.div variants={fadeInUp()}>
            <span style={{ 
              display: 'inline-block', padding: '10px 24px', borderRadius: 100,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--accent-purple)', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginBottom: 32,
              boxShadow: '0 0 30px rgba(157, 80, 187, 0.1)'
            }}>
              Unleash the Power of Elite Security
            </span>
          </motion.div>

          <motion.h1 
            variants={blurIn(0.1)}
            style={{ 
              fontSize: 'clamp(48px, 8vw, 100px)', fontWeight: 900, color: '#fff',
              lineHeight: 0.9, letterSpacing: '-0.05em', marginBottom: 32,
            }}
          >
            Securing the <br /> 
            <span style={{ 
              background: 'linear-gradient(to right, var(--accent-purple), var(--accent-blue))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(157, 80, 187, 0.3))'
            }}>Digital Horizon.</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp(0.3)}
            style={{ 
              fontSize: 20, color: '#a1a1a6', maxWidth: 640, margin: '0 auto 48px',
              lineHeight: 1.6, fontWeight: 500
            }}
          >
            Connect with top-tier security researchers and protect your infrastructure 
            with the world&apos;s most advanced crowdsourced security platform.
          </motion.p>

          <motion.div 
            variants={fadeInUp(0.4)}
            style={{ display: 'flex', gap: 20, justifyContent: 'center' }}
          >
            <Link href="/programs" style={{ textDecoration: 'none' }}>
              <motion.div 
                whileHover={hoverScale}
                whileTap={tapScale}
                className="glass-panel"
                style={{ 
                  padding: '18px 40px', borderRadius: 16, background: '#fff', color: '#000',
                  fontWeight: 800, fontSize: 16, border: '1px solid #fff'
                }}
              >
                View Programs
              </motion.div>
            </Link>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <motion.div 
                whileHover={hoverScale}
                whileTap={tapScale}
                className="glass-panel"
                style={{ 
                  padding: '18px 40px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', 
                  color: '#fff', fontWeight: 800, fontSize: 16, border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Start Hacking
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '160px 5%', position: 'relative' }}>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer(0.2)}
          style={{ maxWidth: 1400, margin: '0 auto' }}
        >
          <motion.div variants={fadeInUp()} style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 20 }}>
              The Industrial Standard
            </h2>
            <p style={{ color: '#a1a1a6', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Powerful tools designed for the modern security ecosystem.
            </p>
          </motion.div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32
          }}>
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp()}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  padding: 40, borderRadius: 24, background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)', position: 'relative',
                  overflow: 'hidden', transition: 'all 0.5s ease'
                }}
              >
                {/* Interaction Light */}
                <AnimatePresence>
                  {hoveredFeature === idx && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: easeOutExpo }}
                      style={{
                        position: 'absolute', top: -100, left: -100, width: 400, height: 400,
                        background: `radial-gradient(circle, ${feature.color}15 0%, transparent 70%)`,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </AnimatePresence>

                <div style={{ fontSize: 40, marginBottom: 24 }}>{feature.icon}</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#a1a1a6', fontSize: 16, lineHeight: 1.6 }}>
                  {feature.desc}
                </p>

                <motion.div 
                  className="glow-effect"
                  animate={{ 
                    opacity: hoveredFeature === idx ? 1 : 0,
                    borderColor: hoveredFeature === idx ? feature.color : 'rgba(255,255,255,0.08)'
                  }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 24,
                    border: '1px solid transparent', pointerEvents: 'none'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '160px 5%', textAlign: 'center' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeInUp()}
          className="glass-panel"
          style={{
            maxWidth: 1000, margin: '0 auto', padding: '100px 40px',
            borderRadius: 40, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '100%', height: '100%',
              background: 'radial-gradient(circle, rgba(157, 80, 187, 0.05) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }} />
          </div>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, color: '#fff', marginBottom: 32, lineHeight: 1.1 }}>
            Ready to secure <br /> your future?
          </h2>
          <p style={{ color: '#a1a1a6', fontSize: 20, maxWidth: 600, margin: '0 auto 48px' }}>
            Join 10,000+ researchers and companies building a safer web together.
          </p>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <motion.div 
              whileHover={hoverScale}
              whileTap={tapScale}
              style={{
                display: 'inline-block', padding: '20px 56px', borderRadius: 20,
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                color: '#fff', fontWeight: 900, fontSize: 18,
                boxShadow: '0 20px 40px rgba(157, 80, 187, 0.2)'
              }}
            >
              Sign Up Now
            </motion.div>
          </Link>
        </motion.div>
      </section>

      <footer style={{ padding: '80px 5%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#6e6e73', fontSize: 14, fontWeight: 500 }}>
          © 2026 Debugr Platform. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  );
}
