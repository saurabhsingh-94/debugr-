'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { setCookie, API_URL } from '@/lib/api';
import { blurReveal, staggerContainer, springSoft, hoverScale, tapScale } from '@/lib/animations';

type Role = 'hacker' | 'company' | null;

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [formData, setFormData] = useState({ 
    email: '', password: '', confirmPassword: '',
    name: '', handle: '', specialization: 'Web Infrastructure', industry: '', experience_level: 'Intermediate',
    bio: '', website: '', location: '', github_url: '', skills: [] as string[], company_size: '1-10', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    
    if (step === 2) {
      if (!formData.handle || !formData.handle.match(/^[a-z0-9_]{3,20}$/)) {
        setError('Username is required (3-20 lowercase alphanumeric characters)');
        return;
      }
      if (!formData.email || !formData.email.includes('@')) {
        setError('A valid email address is required');
        return;
      }
      const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passRegex.test(formData.password)) {
        setError('Password must be 8+ characters with at least one uppercase letter and one number');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
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

      const registerData = await res.json();
      if (registerData.success) {
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: formData.handle || formData.email, 
            password: formData.password 
          }),
        });
        const loginData = await loginRes.json();
        
        if (loginData.success) {
          setCookie('debugr_token', loginData.token);
          router.push('/dashboard');
        } else {
          router.push('/signin');
        }
      } else {
        const errorMsg = registerData.error || registerData.message || (registerData.errors && registerData.errors[0]?.message) || 'Registration failed';
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
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Aurora Effect */}
      <div className="aurora-bg">
        <div className="aurora-blob animate-breathing opacity-40 blur-3xl shadow-[0_0_100px_rgba(157,80,187,0.3)]" style={{ background: '#9d50bb', top: '-10%', left: '-10%' }} />
        <div className="aurora-blob animate-breathing opacity-30 delay-[-4s] blur-2xl font-black italic" style={{ background: '#c084fc', bottom: '-10%', right: '-10%' }} />
        <div className="aurora-blob animate-breathing opacity-50 delay-[-2s] blur-3xl shadow-[0_0_100px_rgba(31,31,31,0.5)]" style={{ background: '#050505', top: '30%', right: '20%' }} />
      </div>

      <Navbar />

      <main className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] min-h-screen relative z-10">
        
        {/* Left Side: Modern Context Panel */}
        <section className="hidden lg:flex flex-col gap-10 p-[160px_8%_60px_12%] border-r border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 h-screen">
          <motion.div variants={staggerContainer(0.1, 0.3)} initial="hidden" animate="visible">
            <motion.div variants={blurReveal} className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-indigo-500" />
              <p className="subtle-mono text-indigo-400">
                Phase 0{step}
              </p>
            </motion.div>
            
            <motion.h1 
              variants={blurReveal}
              className="hero-title text-7xl font-black italic tracking-tighter mb-8 leading-[0.8] uppercase"
            >
              Start Your<br /><span className="text-white/20">Journey.</span>
            </motion.h1>
            
            <motion.p variants={blurReveal} className="text-[#a1a1a6] text-xl font-medium tracking-tight leading-relaxed max-w-[440px] italic">
              {role === 'hacker' 
                ? "Gain access to high-value intelligence opportunities and elite disclosure tools." 
                : role === 'company' 
                ? "Deploy your security perimeter and collaborate with the world's most talented researchers." 
                : "Choose your path to begin collaborating with the elite security collective."}
            </motion.p>
          </motion.div>

          {/* Step Indicators */}
          <div className="mt-auto flex gap-4">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ 
                  width: i === step ? 80 : 40, 
                  background: i <= step ? '#fff' : 'rgba(255,255,255,0.05)',
                  boxShadow: i === step ? '0 0 30px rgba(255,255,255,0.2)' : 'none'
                }}
                className="h-1 rounded-full transition-all duration-700"
              />
            ))}
          </div>
        </section>

        {/* Right Side: Progressive Forms */}
        <section className="flex flex-col items-center justify-start p-[160px_8%_120px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ opacity: 0, x: 20, filter: 'blur(20px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(20px)' }}
              transition={springSoft}
              className={`w-full ${step === 3 ? 'max-w-[840px]' : 'max-w-[540px]'}`}
            >
              
              {step === 1 && (
                <div className="flex flex-col gap-16">
                  <div className="text-center">
                    <h2 className="text-5xl font-black italic tracking-tighter mb-4 uppercase">Identity Type</h2>
                    <p className="text-white/30 text-lg font-medium italic">Select your professional path to continue.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { 
                        id: 'hacker', title: 'Security Researcher', desc: 'Find vulnerabilities, join elite programs, and earn bounties.', icon: '⚡',
                        Effect: LightningField
                      },
                      { 
                        id: 'company', title: 'Security Partner', desc: 'Manage your assets, triage disclosures, and secure your perimeter.', icon: '🛡️',
                        Effect: ShieldWall
                      }
                    ].map(r => (
                      <RoleButton 
                        key={r.id} 
                        id={r.id as Role}
                        title={r.title}
                        desc={r.desc}
                        icon={r.icon}
                        Effect={r.Effect}
                        onSelect={() => { setRole(r.id as Role); nextStep(); }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="glass-panel p-1 border-white/5 rounded-[48px] shadow-2xl">
                  <div className="bg-white/1 backdrop-blur-3xl p-12 md:p-16 rounded-[44px] border border-white/5 flex flex-col gap-12">
                    <div>
                      <motion.button 
                        whileHover={{ x: -4 }}
                        onClick={prevStep} 
                        className="text-white/20 text-[10px] font-black tracking-[0.3em] flex items-center gap-3 uppercase italic hover:text-white transition-all"
                      >
                        <span className="text-lg">←</span> Previous Phase
                      </motion.button>
                      <h2 className="text-4xl font-black italic tracking-tighter mt-6 uppercase leading-tight">Secure<br /><span className="text-white/20">Credentials.</span></h2>
                    </div>

                    <div className="flex flex-col gap-8">
                      <Input label="Username" value={formData.handle} onChange={v => setFormData({...formData, handle: v.replace(/[^a-z0-9_]/g, '')})} placeholder="e.g. janesmith" />
                      <Input label="Email Address" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="jane@example.com" />
                      <Input label="Create Password" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} />
                      <Input label="Verify Password" type="password" value={formData.confirmPassword} onChange={v => setFormData({...formData, confirmPassword: v})} />
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="text-rose-500 text-[11px] font-black text-center p-[20px] bg-rose-500/5 rounded-3xl border border-rose-500/10 uppercase tracking-widest italic"
                      >
                       !! {error} !!
                      </motion.div>
                    )}

                    <motion.button 
                      whileHover={hoverScale}
                      whileTap={tapScale}
                      onClick={nextStep} 
                      className="w-full py-6 text-base font-black bg-white text-black rounded-3xl shadow-2xl transition-all uppercase tracking-widest italic hover:bg-white/90"
                    >
                      Continue to Profile
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="glass-panel p-1 border-white/5 rounded-[48px] shadow-2xl">
                  <form onSubmit={handleSubmit} className="bg-white/1 backdrop-blur-3xl p-12 md:p-16 rounded-[44px] border border-white/5 flex flex-col gap-12">
                    <div>
                      <motion.button 
                        whileHover={{ x: -4 }}
                        type="button" onClick={prevStep} 
                        className="text-white/20 text-[10px] font-black tracking-[0.3em] flex items-center gap-3 uppercase italic hover:text-white transition-all"
                      >
                        ← Update Credentials
                      </motion.button>
                      <h2 className="text-4xl font-black italic tracking-tighter mt-6 uppercase leading-tight">Establish<br /><span className="text-white/20">Identity.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {role === 'hacker' ? (
                        <>
                          <Input label="Current Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} placeholder="e.g. San Francisco, CA" />
                          <Input label="GitHub Identity" value={formData.github_url} onChange={v => setFormData({...formData, github_url: v})} placeholder="github.com/username" />
                          
                          <div>
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Professional Focus</label>
                            <select 
                              value={formData.specialization} 
                              onChange={e => setFormData({...formData, specialization: e.target.value})}
                              className="input-focus-glow w-full py-5 px-6 rounded-2xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner"
                            >
                              <option className="bg-bg">Web Infrastructure</option>
                              <option className="bg-bg">Cloud Architecture</option>
                              <option className="bg-bg">Legacy Mining</option>
                              <option className="bg-bg">Smart Contracts</option>
                              <option className="bg-bg">Zero-Day Research</option>
                            </select>
                          </div>
                          <div>
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Field Experience</label>
                            <select 
                              value={formData.experience_level} 
                              onChange={e => setFormData({...formData, experience_level: e.target.value})}
                              className="input-focus-glow w-full py-5 px-6 rounded-2xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner"
                            >
                              <option className="bg-bg text-white">Entry</option>
                              <option className="bg-bg text-white">Intermediate</option>
                              <option className="bg-bg text-white">Advanced</option>
                              <option className="bg-bg text-white">Elite</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Researcher Bio</label>
                            <textarea 
                              value={formData.bio}
                              onChange={e => setFormData({...formData, bio: e.target.value})}
                              placeholder="Briefly describe your methodology and mission..."
                              className="input-focus-glow w-full min-h-[140px] p-6 rounded-3xl bg-white/2 border border-white/5 text-white resize-none text-sm font-medium transition-all shadow-inner"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-5">Primary Arsenal</label>
                            <div className="flex flex-wrap gap-3">
                              {['XSS', 'SQLi', 'RCE', 'SSRF', 'Auth Bypass', 'Logic', 'Cryptographic', 'API'].map(skill => (
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
                                  className={`px-5 py-3 rounded-xl text-[10px] font-black cursor-pointer transition-all border ${
                                    formData.skills.includes(skill) 
                                      ? 'bg-white text-black border-white shadow-xl' 
                                      : 'bg-white/2 text-white/20 border-white/5 hover:text-white hover:border-white/20'
                                  } uppercase tracking-widest`}
                                >
                                  {skill}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-span-1 md:col-span-2">
                            <Input label="Organization Legal Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Vanguard Security Group" />
                          </div>
                          <Input label="Official Domain" value={formData.website} onChange={v => setFormData({...formData, website: v})} placeholder="https://vanguard.sh" />
                          <Input label="Industry Sector" value={formData.industry} onChange={v => setFormData({...formData, industry: v})} placeholder="e.g. Next-Gen Infrastructure" />
                          
                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Workforce Size</label>
                            <select 
                              value={formData.company_size} 
                              onChange={e => setFormData({...formData, company_size: e.target.value})}
                              className="input-focus-glow w-full py-5 px-6 rounded-2xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner"
                            >
                              <option className="bg-bg">1-10 Members</option>
                              <option className="bg-bg">11-100 Members</option>
                              <option className="bg-bg">101-500 Members</option>
                              <option className="bg-bg">500+ Members</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Security Mission</label>
                            <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Describe your security goals and values..."
                              className="input-focus-glow w-full min-h-[160px] p-6 rounded-3xl bg-white/2 border border-white/5 text-white resize-none text-sm font-medium transition-all shadow-inner"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-[11px] font-black text-center p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 uppercase tracking-widest italic">
                        !! {error} !!
                      </motion.div>
                    )}
                    
                    <motion.button 
                      type="submit" 
                      disabled={loading} 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-7 text-base font-black bg-indigo-600 text-white rounded-3xl shadow-2xl shadow-indigo-600/30 transition-all uppercase tracking-[0.2em] italic hover:bg-indigo-500"
                    >
                      {loading ? 'Transmitting...' : 'Complete Phase 3'}
                    </motion.button>
                  </form>
                </div>
              )}

              <p className="text-center text-white/20 font-medium text-[13px] tracking-tight mt-16">
                Already part of the collective? <Link href="/signin" className="text-white font-black hover:text-indigo-400 underline underline-offset-8 decoration-white/10 transition-all">Authenticate now</Link>
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
    <div className="flex flex-col gap-3">
      <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block">{label}</label>
      <input 
        type={type} required value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-focus-glow w-full py-5 px-6 rounded-2xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner placeholder:text-white/10"
      />
    </div>
  );
}

function RoleButton({ title, desc, icon, Effect, onSelect }: { 
  id: Role, title: string, desc: string, icon: string, Effect: React.ComponentType, onSelect: () => void 
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button 
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover="hover"
      initial="initial"
      className="glass-panel p-10 rounded-[48px] border border-white/5 text-left cursor-pointer transition-all relative overflow-hidden flex flex-col gap-8 shadow-2xl group"
      variants={{
        hover: { y: -10, scale: 1.02, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
        initial: { y: 0, scale: 1 }
      }}
    >
      <AnimatePresence>
        {isHovered && <Effect />}
      </AnimatePresence>

      <div className="text-5xl relative z-10 w-fit p-5 rounded-3xl bg-white/5 border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-white text-2xl font-black mb-3 tracking-tighter uppercase italic">{title}</h3>
        <p className="text-sm text-white/30 font-medium leading-relaxed group-hover:text-white/50 transition-colors uppercase tracking-tight">{desc}</p>
      </div>
      
      <div className="absolute top-0 right-0 p-6 bg-white/5 rounded-bl-[20px] text-[8px] font-black tracking-widest text-indigo-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-0 group-hover:scale-100 duration-500 origin-top-right">
        Select
      </div>
    </motion.button>
  );
}

function LightningField() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <motion.path
          d="M 85 0 L 78 15 L 85 30 L 70 50 L 80 65 L 45 85 L 55 92 L 15 100"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            opacity: [0, 1, 0, 1, 0, 0.8, 0],
          }}
          transition={{ 
            duration: 0.6,
            times: [0, 0.1, 0.15, 0.2, 0.25, 0.3, 1],
            ease: "easeOut"
          }}
          className="shadow-[0_0_20px_#fff]"
        />
      </svg>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.1, 0] }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-white mix-blend-overlay"
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
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 10 L40 30 L20 40 L0 30 L0 10 Z' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 36px',
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
        <motion.circle
          cx="200" cy="200" r="100"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
}
