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
    bio: '', website: '', location: '', github_url: '', skills: [] as string[], company_size: '1-10', description: '',
    job_profile: '', business_email: ''
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
          router.push('/profile');
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
    <div className="min-h-screen bg-transparent text-[#f5f5f7] relative overflow-x-hidden selection:bg-indigo-500/30">
      <div className="aurora-bg">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
      </div>
      <Navbar />

      <main className="w-full min-h-screen relative z-10 flex items-center justify-center p-6 md:p-12">
        <section className="w-full h-full flex flex-col items-center justify-center">

          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(15px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, scale: 0.95, filter: 'blur(15px)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
              className={`w-full ${step === 3 ? 'max-w-[580px]' : 'max-w-[420px]'}`}
            >

              
              {step === 1 && (
                <div className="flex flex-col gap-16">
                  <div className="text-center">
                    <span className="text-white/40 font-black uppercase tracking-widest text-[10px] sm:text-xs">Step 0{step}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {step === 1 ? 'Choose Your Identity' : step === 2 ? 'Tell Us About Yourself' : 'Secure Your Account'}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { 
                        id: 'hacker', title: 'Hacker', desc: 'Find vulnerabilities and earn bounties.', icon: '⚡',
                        Effect: LightningField
                      },
                      { 
                        id: 'company', title: 'Organization', desc: 'Launch your bug bounty program and collaborate with hackers.', icon: '🛡️',
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
                <div className="glass-panel p-1 border-white/5 rounded-[36px] shadow-2xl">
                  <div className="bg-white/1 backdrop-blur-3xl p-8 md:p-10 rounded-[32px] border border-white/5 flex flex-col gap-8">
                    <div>
                      <motion.button 
                        whileHover={{ x: -4 }}
                        onClick={prevStep} 
                        className="text-white/20 text-[10px] font-black tracking-[0.3em] flex items-center gap-3 uppercase italic hover:text-white transition-all"
                      >
                        <span className="text-lg">←</span> Go Back
                      </motion.button>
                      <h2 className="text-4xl font-black italic tracking-tighter mt-6 uppercase leading-tight">Account<br /><span className="text-white/20">Details.</span></h2>
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
                <div className="glass-panel p-1 border-white/5 rounded-[36px] shadow-2xl">
                  <form onSubmit={handleSubmit} className="bg-white/1 backdrop-blur-3xl p-8 md:p-10 rounded-[32px] border border-white/5 flex flex-col gap-8">
                    <div>
                      <motion.button 
                        whileHover={{ x: -4 }}
                        type="button" onClick={prevStep} 
                        className="text-white/20 text-[10px] font-black tracking-[0.3em] flex items-center gap-3 uppercase italic hover:text-white transition-all"
                      >
                        ← Login Details
                      </motion.button>
                      <h2 className="text-4xl font-black italic tracking-tighter mt-6 uppercase leading-tight">About<br /><span className="text-white/20">You.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {role === 'hacker' ? (
                        <>
                          <Input label="Job Profile" value={formData.job_profile} onChange={v => setFormData({...formData, job_profile: v})} placeholder="e.g. Senior Security Researcher" />
                          <Input label="Current Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} placeholder="e.g. San Francisco, CA" />
                          <Input label="GitHub Profile" value={formData.github_url} onChange={v => setFormData({...formData, github_url: v})} placeholder="github.com/username" />
                          
                          <div>
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Core Specialization</label>
                            <select 
                              value={formData.specialization} 
                              onChange={e => setFormData({...formData, specialization: e.target.value})}
                              className="input-focus-glow w-full py-4 px-5 rounded-xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner"
                            >
                              <option className="bg-bg">Web Infrastructure</option>
                              <option className="bg-bg">Cloud Architecture</option>
                              <option className="bg-bg">Legacy Mining</option>
                              <option className="bg-bg">Smart Contracts</option>
                              <option className="bg-bg">Zero-Day Research</option>
                            </select>
                          </div>
                          <div>
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Experience Level</label>
                            <select 
                              value={formData.experience_level} 
                              onChange={e => setFormData({...formData, experience_level: e.target.value})}
                              className="input-focus-glow w-full py-4 px-5 rounded-xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner"
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
                              className="input-focus-glow w-full min-h-[100px] p-5 rounded-2xl bg-white/2 border border-white/5 text-white resize-none text-sm font-medium transition-all shadow-inner"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-5">Your Skills</label>
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
                            <Input label="Company Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Vanguard Security Group" />
                          </div>
                          <Input label="Business Email" type="email" value={formData.business_email} onChange={v => setFormData({...formData, business_email: v})} placeholder="security@company.com" />
                          <Input label="Official Domain" value={formData.website} onChange={v => setFormData({...formData, website: v})} placeholder="https://vanguard.sh" />
                          <Input label="Focus Industry" value={formData.industry} onChange={v => setFormData({...formData, industry: v})} placeholder="e.g. Cyber Infrastructure" />
                          
                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">Workforce Size</label>
                            <select 
                              value={formData.company_size} 
                              onChange={e => setFormData({...formData, company_size: e.target.value})}
                              className="input-focus-glow w-full py-4 px-5 rounded-xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner"
                            >
                              <option className="bg-bg">1-10 Members</option>
                              <option className="bg-bg">11-100 Members</option>
                              <option className="bg-bg">101-500 Members</option>
                              <option className="bg-bg">500+ Members</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block mb-3">About the Organization</label>
                            <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="e.g. Web Security, Mobile, Cloud"
                              className="input-focus-glow w-full min-h-[100px] p-5 rounded-2xl bg-white/2 border border-white/5 text-white resize-none text-sm font-medium transition-all shadow-inner"
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
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </motion.button>
                  </form>
                </div>
              )}

              <p className="text-center text-white/20 font-medium text-[13px] tracking-tight mt-16">
                Already have an account? <Link href="/signin" className="text-white font-black hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px] sm:text-xs">Sign In</Link>
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
    <div className="flex flex-col gap-2 relative">
      <label className="subtle-mono text-[9px] text-white/20 ml-2 uppercase tracking-widest block">{label}</label>
      <input 
        type={type} required value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-focus-glow w-full py-4 px-5 rounded-xl bg-white/2 border border-white/5 text-white text-sm font-medium transition-all shadow-inner placeholder:text-white/10"
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
      className="glass-panel aspect-square p-6 md:p-8 rounded-[40px] border border-white/5 cursor-pointer transition-all relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl group hover:border-indigo-500/50"
      variants={{
        hover: { y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } },
        initial: { y: 0, scale: 1 }
      }}
    >
      <div className={`absolute inset-0 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-[0.15]'}`}>
        <Effect />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 transition-transform duration-300">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-white text-2xl font-black mb-2 tracking-tighter uppercase italic">{title}</h3>
          <p className="text-xs text-white/30 font-medium leading-relaxed group-hover:text-white/60 transition-colors uppercase tracking-widest">{desc}</p>
        </div>
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
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 opacity-50" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-40">
        <motion.path
          d="M 85 0 L 78 15 L 85 30 L 70 50 L 80 65 L 45 85 L 55 92 L 15 100"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            opacity: [0, 1, 0, 1, 0, 0.8, 0],
          }}
          transition={{ 
            duration: 0.6,
            times: [0, 0.1, 0.15, 0.2, 0.25, 0.3, 1],
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 1.5
          }}
          style={{ filter: "drop-shadow(0 0 8px #a855f7) drop-shadow(0 0 20px #c084fc)" }}
        />
        <motion.path
          d="M 90 0 L 80 20 L 90 40 L 60 70 L 70 85 L 20 100"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            opacity: [0, 1, 0, 1, 0],
          }}
          transition={{ 
            duration: 0.5,
            times: [0, 0.1, 0.2, 0.3, 1],
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 2.2
          }}
          style={{ filter: "drop-shadow(0 0 5px #818cf8)" }}
        />
      </svg>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.08, 0, 0.04, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1.5 }}
        className="absolute inset-0 bg-indigo-400 mix-blend-overlay"
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5" />
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 10 L40 30 L20 40 L0 30 L0 10 Z' fill='none' stroke='%233b82f6' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 48px',
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-40">
        <motion.circle
          cx="200" cy="200" r="100"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.8, opacity: [0, 0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 10px #60a5fa)" }}
        />
        <motion.circle
          cx="200" cy="200" r="140"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="4 8"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%", filter: "drop-shadow(0 0 5px #3b82f6)" }}
        />
      </svg>
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#3b82f6]/10 to-transparent blur-xl" />
    </motion.div>
  );
}

