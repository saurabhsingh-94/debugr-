'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { setCookie, API_URL } from '@/lib/api';
import { blurReveal, staggerContainer } from '@/lib/animations';

type Role = 'hacker' | 'company' | null;

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [formData, setFormData] = useState({ 
    email: '', password: '', confirmPassword: '',
    name: '', handle: '', specialization: 'Web', industry: '', experience_level: 'Intermediate',
    bio: '', website: '', location: '', github_url: '', skills: [] as string[], company_size: '1-10', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    
    // Step 2 Validation: Must match backend requirements
    if (step === 2) {
      if (!formData.email || !formData.email.includes('@')) {
        setError('A valid email protocol is required');
        return;
      }
      // Aligned with backend/routes/auth.js regex
      const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passRegex.test(formData.password)) {
        setError('Passcode must be 8+ characters with at least one uppercase letter and one number');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passcodes do not match');
        return;
      }
    }
    
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      if (data.success) {
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.email, password: formData.password }),
        });
        const loginData = await loginRes.json();
        
        if (loginData.success) {
          setCookie('debugr_token', loginData.token);
          router.push('/dashboard');
        } else {
          router.push('/signin');
        }
      } else {
        const errorMsg = data.error || data.message || (data.errors && data.errors[0]?.message) || 'Registration failed';
        setError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', color: 'var(--t1)', overflowX: 'hidden' }}>
      <div className="aurora-bg">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
      </div>
      <Navbar />

      <main style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.2fr', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        
        {/* Left Side: Sticky Info */}
        <section style={{ 
          padding: '160px 60px 60px 12%', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
          display: 'flex', flexDirection: 'column', gap: 40,
          position: 'sticky', top: 0, height: '100vh'
        }}>
          <motion.div variants={staggerContainer(0.1, 0.3)} initial="hidden" animate="visible">
            <motion.p variants={blurReveal} className="mono" style={{ fontSize: 11, color: 'var(--t2)', letterSpacing: '0.4em', marginBottom: 20 }}>
              {step === 1 ? 'STEP 01 // IDENTITY' : step === 2 ? 'STEP 02 // SECURITY' : 'STEP 03 // PROFILE'}
            </motion.p>
            <motion.h1 
              variants={blurReveal}
              style={{ fontSize: 'clamp(44px, 5vw, 72px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 24 }}
            >
              Join the<br /><span className="text-gradient">Collective.</span>
            </motion.h1>
            <motion.p variants={blurReveal} style={{ color: 'var(--t2)', fontSize: 18, lineHeight: 1.6, maxWidth: 400 }}>
              {role ? `Initializing encrypted tunnel for ${role} operations...` : "Choose your path and establish your digital presence within the most advanced security grid."}
            </motion.p>
          </motion.div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ 
                  width: i === step ? 60 : 30, 
                  background: i <= step ? '#fff' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === step ? '0 0 15px rgba(255,255,255,0.3)' : 'none'
                }}
                style={{ height: 3, borderRadius: 2 }} 
              />
            ))}
          </div>
        </section>

        {/* Right Side: Interactive Flow */}
        <section style={{ padding: '120px 8% 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={blurReveal}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: '100%', maxWidth: step === 3 ? 740 : 540 }}
            >
              
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 className="metallic-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Choose your Path</h2>
                    <p style={{ color: 'var(--t3)', fontSize: 16 }}>Select your operational identity to continue</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {[
                      { 
                        id: 'hacker', title: 'Hacker', desc: 'Hunt bugs, uncover flaws, and earn reputation + rewards.', icon: '⚡',
                        fullEffect: <LightningField />
                      },
                      { 
                        id: 'company', title: 'Organization', desc: 'Secure your assets through world-class security intelligence.', icon: '🛡️',
                        fullEffect: <ShieldWall />
                      }
                    ].map(r => (
                      <motion.button 
                        key={r.id} 
                        onClick={() => { setRole(r.id as Role); nextStep(); }} 
                        whileHover="hover"
                        initial="initial"
                        className="glass-panel hover-glow"
                        style={{ 
                          textAlign: 'left', padding: '40px 32px', borderRadius: 32, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', gap: 20,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                          position: 'relative', overflow: 'hidden'
                        }}
                        variants={{
                          hover: { y: -8, scale: 1.02, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
                          initial: { y: 0, scale: 1 }
                        }}
                      >
                        {/* Immersive Full-Board Effect */}
                        <AnimatePresence>
                          {r.fullEffect}
                        </AnimatePresence>

                        <motion.div 
                          style={{ fontSize: 32, display: 'inline-block', width: 'fit-content', position: 'relative', zIndex: 2 }}
                        >
                          {r.icon}
                        </motion.div>
                        <div>
                          <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{r.title}</h3>
                          <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.5 }}>{r.desc}</p>
                        </div>
                        <div style={{ 
                          position: 'absolute', top: 0, right: 0, padding: '12px 20px', 
                          background: 'rgba(255,255,255,0.05)', borderBottomLeftRadius: 20,
                          fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', opacity: 0.4
                        }}>SELECT</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="glass-panel" style={{ padding: '48px', borderRadius: 40, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                      <motion.button 
                        whileHover={{ x: -3 }}
                        onClick={prevStep} 
                        style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <span style={{ fontSize: 16 }}>←</span> PREVIEW IDENTITY
                      </motion.button>
                      <h2 className="hero-title" style={{ fontSize: 32, fontWeight: 800, marginTop: 16 }}>Establish Credentials</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <Input label="Email Protocol" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="hacker@debugr.ops" />
                      <Input label="Secure Passcode" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} />
                      <Input label="Confirm Passcode" type="password" value={formData.confirmPassword} onChange={v => setFormData({...formData, confirmPassword: v})} />
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        style={{ fontSize: 13, color: '#ff4d4d', background: 'rgba(255,100,100,0.05)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,100,100,0.1)' }}
                      >
                        <span style={{ fontWeight: 800 }}>ALERT: </span> {error}
                      </motion.div>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={nextStep} 
                      className="btn-luminous" 
                      style={{ width: '100%', padding: '20px', fontSize: 15 }}
                    >
                      Continue to Profile
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="glass-panel" style={{ padding: '48px', borderRadius: 40 }}>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    <div>
                      <motion.button 
                        whileHover={{ x: -3 }}
                        type="button" onClick={prevStep} 
                        style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}
                      >
                        ← BACK TO SECURITY
                      </motion.button>
                      <h2 className="hero-title" style={{ fontSize: 32, fontWeight: 800, marginTop: 16 }}>Initialize Profile</h2>
                      <p style={{ color: 'var(--t3)', fontSize: 14 }}>Configure your public metadata for the collective.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                      {role === 'hacker' ? (
                        <>
                          <div style={{ gridColumn: 'span 2' }}>
                            <Input label="Public Handle" value={formData.handle} onChange={v => setFormData({...formData, handle: v})} placeholder="e.g. shadow_walker" />
                          </div>
                          <Input label="Operational Base" value={formData.location} onChange={v => setFormData({...formData, location: v})} placeholder="e.g. Neo Tokyo" />
                          <Input label="Command Center (URL)" value={formData.github_url} onChange={v => setFormData({...formData, github_url: v})} placeholder="github.com/hacker" />
                          
                          <div style={{ gridColumn: 'span 1' }}>
                            <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 10 }}>SPECIALIZATION</label>
                            <select 
                              value={formData.specialization} 
                              onChange={e => setFormData({...formData, specialization: e.target.value})}
                              className="neon-focus"
                              style={{ width: '100%', padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14 }}
                            >
                              <option>Web Infrastructure</option>
                              <option>Cloud Architecture</option>
                              <option>Kernel Mining</option>
                              <option>Smart Contracts</option>
                            </select>
                          </div>
                          <div style={{ gridColumn: 'span 1' }}>
                            <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 10 }}>EXPERIENCE</label>
                            <select 
                              value={formData.experience_level} 
                              onChange={e => setFormData({...formData, experience_level: e.target.value})}
                              className="neon-focus"
                              style={{ width: '100%', padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14 }}
                            >
                              <option>Entry Protocol</option>
                              <option>Regular Operative</option>
                              <option>Senior Architect</option>
                              <option>Elite / L33t</option>
                            </select>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 10 }}>OPERATIONAL BIO</label>
                            <textarea 
                              value={formData.bio}
                              onChange={e => setFormData({...formData, bio: e.target.value})}
                              placeholder="Describe your technical methodology..."
                              className="neon-focus"
                              style={{ width: '100%', minHeight: 120, padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', resize: 'vertical', fontSize: 14 }}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 16 }}>CORE TACTICS</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                              {['XSS', 'SQLi', 'RCE', 'SSR_F', 'Auth Bypass', 'API Security'].map(skill => (
                                <motion.button 
                                  key={skill}
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    const newSkills = formData.skills.includes(skill) 
                                      ? formData.skills.filter(s => s !== skill)
                                      : [...formData.skills, skill];
                                    setFormData({...formData, skills: newSkills});
                                  }}
                                  style={{
                                    padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                                    background: formData.skills.includes(skill) ? '#fff' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${formData.skills.includes(skill) ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                                    color: formData.skills.includes(skill) ? '#000' : 'var(--t2)',
                                  }}
                                >
                                  {skill}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ gridColumn: 'span 2' }}>
                            <Input label="Organization Identity" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Cyberdyne Systems" />
                          </div>
                          <Input label="Official Domain" value={formData.website} onChange={v => setFormData({...formData, website: v})} placeholder="https://organization.com" />
                          <Input label="Industry Sector" value={formData.industry} onChange={v => setFormData({...formData, industry: v})} placeholder="e.g. Deep Tech" />
                          
                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 10 }}>GRID SCALE (EMPLOYEES)</label>
                            <select 
                              value={formData.company_size} 
                              onChange={e => setFormData({...formData, company_size: e.target.value})}
                              className="neon-focus"
                              style={{ width: '100%', padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14 }}
                            >
                              <option>1-10 Units</option>
                              <option>11-100 Units</option>
                              <option>101-500 Units</option>
                              <option>500+ Units</option>
                            </select>
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 10 }}>MISSION DESCRIPTION</label>
                            <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Describe your security mission..."
                              className="neon-focus"
                              style={{ width: '100%', minHeight: 140, padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', resize: 'vertical', fontSize: 14 }}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {error && (
                      <div style={{ fontSize: 14, color: '#ff4d4d', background: 'rgba(255,100,100,0.05)', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,100,100,0.1)' }}>
                        <span style={{ fontWeight: 800 }}>CRITICAL: </span> {error}
                      </div>
                    )}
                    
                    <motion.button 
                      type="submit" 
                      disabled={loading} 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="btn-luminous" 
                      style={{ width: '100%', padding: '20px', fontSize: 16 }}
                    >
                      {loading ? 'Initializing Interface...' : 'Finalize Profile'}
                    </motion.button>
                  </form>
                </div>
              )}

              <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--t3)', marginTop: 48 }}>
                Existing profile? <a href="/signin" style={{ color: '#fff', fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>Resume Session</a>
              </p>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function Input({ label, type = 'text', value, onChange, placeholder }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label className="subtle-mono" style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)' }}>{label}</label>
      <input 
        type={type} required value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="neon-focus"
        style={{ width: '100%', padding: '18px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15 }}
      />
    </div>
  );
}

// --- Immersive Effects Components ---

function LightningField() {
  const bolts = useMemo(() => [
    { id: 1, delay: 0.5, duration: 5, left: 15, path: "M 50 0 L 45 30 L 55 60 L 48 100" },
    { id: 2, delay: 2.0, duration: 6, left: 50, path: "M 50 0 L 58 35 L 42 65 L 50 100" },
    { id: 3, delay: 3.5, duration: 4.5, left: 85, path: "M 50 0 L 42 40 L 58 70 L 52 100" }
  ], []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: 'hidden' }}
    >
      {/* Dynamic Lightning Bolts - Slow & Smooth */}
      {bolts.map((bolt) => (
        <motion.svg 
          key={bolt.id}
          viewBox="0 0 100 100" 
          strokeLinecap="round"
          style={{ position: 'absolute', top: 0, left: `${bolt.left}%`, width: '30%', height: '100%', opacity: 0.3 }}
          animate={{ 
            opacity: [0, 0.6, 0.2, 0.8, 0],
            scale: [1, 1.05, 1],
            filter: ['blur(1px)', 'blur(3px)', 'blur(1px)']
          }}
          transition={{ 
            duration: bolt.duration, 
            repeat: Infinity, 
            delay: bolt.delay,
            ease: "easeInOut"
          }}
        >
          <path 
            d={bolt.path} 
            fill="none" 
            stroke="rgba(191, 123, 255, 0.8)" 
            strokeWidth="0.8"
            style={{ filter: 'drop-shadow(0 0 15px rgba(191, 123, 255, 0.6))' }}
          />
        </motion.svg>
      ))}
      
      {/* Slow Background Pulse */}
      <motion.div 
        animate={{ opacity: [0.03, 0.1, 0.03] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          position: 'absolute', inset: 0, 
          background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, transparent 80%)',
          mixBlendMode: 'plus-lighter' 
        }}
      />
    </motion.div>
  );
}

function ShieldWall() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        background: `
          radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 80%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 15 L60 45 L30 60 L0 45 L0 15 Z' fill='none' stroke='white' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E")
        `,
        backgroundSize: '100% 100%, 40px 45px'
      }}
    >
      {/* Slow Ripple Effect */}
      <motion.div 
        animate={{ 
          scale: [0.9, 1.3, 0.9],
          opacity: [0.05, 0.2, 0.05],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ 
          position: 'absolute', inset: -100, 
          background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.2) 0%, transparent 60%)',
          filter: 'blur(40px)'
        }}
      />
      
      {/* Surface Glimmer */}
      <motion.div 
        animate={{ 
          x: ['-100%', '100%'],
          opacity: [0, 0.2, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
        }}
      />
    </motion.div>
  );
}

