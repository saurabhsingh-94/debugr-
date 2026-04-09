'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { 
  Cpu, 
  Coins, 
  Zap, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Fingerprint,
  Lock,
  Mail,
  User,
  AtSign,
  MapPin,
  Globe,
  Briefcase
} from 'lucide-react';
import { setCookie, API_URL } from '@/lib/api';
import { blurReveal, staggerContainer, hoverScale, tapScale } from '@/lib/animations';

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
    <div className="min-h-screen bg-[#050505] text-[#f5f5f7] relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(157,80,187,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>
      
      <Navbar />

      <main className="w-full min-h-screen relative z-10 lg:grid lg:grid-cols-2">
        
        {/* Left Side: Context & Branding (Desktop Only) */}
        <section className="hidden lg:flex flex-col justify-center p-24 relative overflow-hidden bg-white/[0.01]">
          <motion.div 
            variants={staggerContainer(0.1, 0.2)}
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-12 relative z-10"
          >
            <motion.div variants={blurReveal}>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400">[ REG.GATEWAY ]</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">IDENTITY_PROVISIONING</span>
              </div>
              <h1 className="text-7xl font-black italic tracking-tighter leading-[0.9] uppercase">
                Join the<br /><span className="text-white/20">Network.</span>
              </h1>
            </motion.div>

            <motion.div variants={blurReveal} className="space-y-10">
              <div className="flex gap-8 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                  <Globe className="text-indigo-400/60" size={24} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase italic tracking-widest text-white mb-2">Global Infrastructure</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed max-w-sm">Access exclusive security programs from tier-1 organizations across all geographical jurisdictions.</p>
                </div>
              </div>
              <div className="flex gap-8 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                  <Cpu className="text-indigo-400/60" size={24} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase italic tracking-widest text-white mb-2">Engineering Toolkit</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed max-w-sm">Native integration with triage workflows and automated reporting tools designed for specialized research.</p>
                </div>
              </div>
              <div className="flex gap-8 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                  <Coins className="text-indigo-400/60" size={24} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase italic tracking-widest text-white mb-2">Incentive Layer</h2>
                  <p className="text-white/30 text-xs italic font-medium leading-relaxed max-w-sm">Transparent bounty structures with immediate settlement protocols upon vulnerability validation.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full opacity-40 pointer-events-none" />
        </section>

        {/* Right Side: Registration Vessel */}
        <section className="flex items-center justify-center p-6 md:p-12 relative min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(15px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, scale: 0.98, filter: 'blur(15px)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
              className={`w-full ${step === 3 ? 'max-w-[640px]' : 'max-w-[440px]'} relative z-10`}
            >
              
              {step === 1 && (
                <div className="flex flex-col gap-12">
                  <div className="text-center space-y-4">
                    <span className="text-indigo-400 font-mono font-black text-xs tracking-[0.4em] uppercase">[ 01/03 ]</span>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                      Select Capacity.
                    </h2>
                    <p className="text-white/30 text-[13px] font-medium italic">Define your role within the ecosystem.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { 
                        id: 'hacker', title: 'Researcher', desc: 'I identify vulnerabilities and report findings.', icon: <Zap size={40} />,
                        Effect: LightningField
                      },
                      { 
                        id: 'company', title: 'Organization', desc: 'We deploy assets for continuous testing.', icon: <Shield size={40} />,
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
                <div className="glass-panel p-1 rounded-[56px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                  
                  <div className="bg-white/[0.01] backdrop-blur-3xl p-10 md:p-14 border border-white/5 flex flex-col gap-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                         <motion.button 
                          whileHover={{ x: -4 }}
                          onClick={prevStep} 
                          className="text-white/20 text-[9px] font-mono font-black tracking-[0.3em] flex items-center gap-2 uppercase italic hover:text-white transition-all mb-4"
                        >
                          <ChevronLeft size={12} /> Capacity Selection
                        </motion.button>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Identity<br /><span className="text-white/20">Config.</span></h2>
                      </div>
                      <span className="text-indigo-400 font-mono font-black text-[10px] tracking-[0.4em] uppercase">[ 02/03 ]</span>
                    </div>

                    <div className="flex flex-col gap-8">
                      <Input label="[ UNIQUE_ID ]" value={formData.handle} onChange={v => setFormData({...formData, handle: v.replace(/[^a-z0-9_]/g, '')})} placeholder="choose_handle" icon={<AtSign size={18} />} />
                      <Input label="[ CONTACT_NODE ]" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="name@domain.sh" icon={<Mail size={18} />} />
                      <Input label="[ ACCESS_PASSPHRASE ]" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} icon={<Lock size={18} />} />
                      <Input label="[ VERIFY_PASSPHRASE ]" type="password" value={formData.confirmPassword} onChange={v => setFormData({...formData, confirmPassword: v})} icon={<Lock size={18} />} />
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="text-rose-400 text-[10px] font-mono font-black text-center p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 uppercase tracking-widest italic"
                      >
                       ERR: {error}
                      </motion.div>
                    )}

                    <motion.button 
                      whileHover={hoverScale}
                      whileTap={tapScale}
                      onClick={nextStep} 
                      className="w-full py-6 text-xs font-black bg-white text-black rounded-full shadow-2xl transition-all uppercase tracking-[0.3em] italic hover:bg-neutral-200"
                    >
                      Provision Identity
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="glass-panel p-1 rounded-[56px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                   
                  <form onSubmit={handleSubmit} className="bg-white/[0.01] backdrop-blur-3xl p-10 md:p-14 border border-white/5 flex flex-col gap-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <motion.button 
                          whileHover={{ x: -4 }}
                          type="button" onClick={prevStep} 
                          className="text-white/20 text-[9px] font-mono font-black tracking-[0.3em] flex items-center gap-2 uppercase italic hover:text-white transition-all mb-4"
                        >
                          <ChevronLeft size={12} /> Return to config
                        </motion.button>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Technical<br /><span className="text-white/20">Profile.</span></h2>
                      </div>
                       <span className="text-indigo-400 font-mono font-black text-[10px] tracking-[0.4em] uppercase">[ 03/03 ]</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {role === 'hacker' ? (
                        <>
                          <Input label="[ CURRENT_CAPACITY ]" value={formData.job_profile} onChange={v => setFormData({...formData, job_profile: v})} placeholder="e.g. Vuln Researcher" icon={<Briefcase size={16} />} />
                          <Input label="[ GEO_COORDINATES ]" value={formData.location} onChange={v => setFormData({...formData, location: v})} placeholder="City, Country" icon={<MapPin size={16} />} />
                          <div className="col-span-1 md:col-span-2">
                             <Input label="[ GITHUB_SOURCE ]" value={formData.github_url} onChange={v => setFormData({...formData, github_url: v})} placeholder="github.com/identity" icon={<Globe size={16} />} />
                          </div>
                          
                          <div>
                            <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block mb-3">CORE_SPECIALIZATION</label>
                            <select 
                              value={formData.specialization} 
                              onChange={e => setFormData({...formData, specialization: e.target.value})}
                              className="w-full py-4 px-6 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm font-medium transition-all focus:border-indigo-500/30 outline-none shadow-inner"
                            >
                              <option className="bg-neutral-900">Web Architecture</option>
                              <option className="bg-neutral-900">Cloud Systems</option>
                              <option className="bg-neutral-900">Network Protocols</option>
                              <option className="bg-neutral-900">Mobile Runtime</option>
                              <option className="bg-neutral-900">Cryptography</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block mb-3">CLEARANCE_LEVEL</label>
                            <select 
                              value={formData.experience_level} 
                              onChange={e => setFormData({...formData, experience_level: e.target.value})}
                              className="w-full py-4 px-6 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm font-medium transition-all focus:border-indigo-500/30 outline-none shadow-inner"
                            >
                              <option className="bg-neutral-900 text-white">Associate</option>
                              <option className="bg-neutral-900 text-white">Tactical</option>
                              <option className="bg-neutral-900 text-white">Strategic</option>
                              <option className="bg-neutral-900 text-white">Principal</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block mb-3">INTEL_BIO</label>
                            <textarea 
                              value={formData.bio}
                              onChange={e => setFormData({...formData, bio: e.target.value})}
                              placeholder="Brief overview of research history..."
                              className="w-full min-h-[120px] p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-white resize-none text-sm font-medium transition-all focus:border-indigo-500/30 outline-none shadow-inner placeholder:text-white/10"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2">
                             <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block mb-5">SKILLSET_INDEX</label>
                            <div className="flex flex-wrap gap-3">
                              {['XSS', 'SQLi', 'RCE', 'SSRF', 'Auth Bypass', 'Business Logic', 'Crypto', 'API Sec'].map(skill => (
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
                                  className={`px-5 py-3 rounded-xl text-[10px] font-mono font-black cursor-pointer transition-all border ${
                                    formData.skills.includes(skill) 
                                      ? 'bg-white text-black border-white shadow-xl' 
                                      : 'bg-white/[0.03] text-white/20 border-white/5 hover:text-white hover:border-white/20'
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
                            <Input label="[ ORG_NAME ]" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Organization Identity" icon={<Briefcase size={16} />} />
                          </div>
                          <Input label="[ BIZ_HANDOFF ]" type="email" value={formData.business_email} onChange={v => setFormData({...formData, business_email: v})} placeholder="security@identity.sh" icon={<Mail size={16} />} />
                          <Input label="[ ASSET_DOMAIN ]" value={formData.website} onChange={v => setFormData({...formData, website: v})} placeholder="https://domain.sh" icon={<Globe size={16} />} />
                          <Input label="[ SEC_INDUSTRY ]" value={formData.industry} onChange={v => setFormData({...formData, industry: v})} placeholder="e.g. Infrastructure" />
                          
                          <div className="col-span-1 md:col-span-2">
                             <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block mb-3">WORKFORCE_INDEX</label>
                            <select 
                              value={formData.company_size} 
                              onChange={e => setFormData({...formData, company_size: e.target.value})}
                              className="w-full py-4 px-6 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm font-medium transition-all focus:border-indigo-500/30 outline-none shadow-inner"
                            >
                              <option className="bg-neutral-900">1 - 100 Associates</option>
                              <option className="bg-neutral-900">101 - 500 Associates</option>
                              <option className="bg-neutral-900">501 - 5000 Associates</option>
                              <option className="bg-neutral-900">Enterprise Scale</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block mb-3">ASSET_CONTEXT</label>
                            <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Briefly describe the assets requiring testing..."
                              className="w-full min-h-[120px] p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-white resize-none text-sm font-medium transition-all focus:border-indigo-500/30 outline-none shadow-inner placeholder:text-white/10"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-[10px] font-mono font-black text-center p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 uppercase tracking-widest italic">
                        ERR: {error}
                      </motion.div>
                    )}
                    
                    <motion.button 
                      type="submit" 
                      disabled={loading} 
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-7 text-xs font-black bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/20 transition-all uppercase tracking-[0.3em] italic hover:bg-indigo-500"
                    >
                      {loading ? 'Initializing Interface...' : 'Commit Registration'}
                    </motion.button>
                  </form>
                </div>
              )}

              <p className="text-center text-white/20 font-medium text-[12px] tracking-tight mt-12">
                Already registered? <Link href="/signin" className="group text-white font-black hover:text-indigo-400 transition-all uppercase tracking-[0.2em] text-[10px] ml-3 inline-flex items-center gap-2">Protocol Access <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /></Link>
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
  icon?: React.ReactNode;
}

function Input({ label, type = 'text', value, onChange, placeholder, icon }: InputProps) {
  return (
    <div className="flex flex-col gap-3 relative">
      <label className="text-[9px] font-mono font-black text-white/20 ml-2 uppercase tracking-[0.4em] block">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input 
          type={type} required value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-5 ${icon ? 'pl-16' : 'px-7'} pr-7 rounded-2xl bg-white/[0.03] border border-white/5 text-white text-sm font-medium transition-all focus:border-indigo-500/30 outline-none shadow-inner placeholder:text-white/10`}
        />
      </div>
    </div>
  );
}

function RoleButton({ title, desc, icon, Effect, onSelect }: { 
  id: Role, title: string, desc: string, icon: React.ReactNode, Effect: React.ComponentType, onSelect: () => void 
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button 
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover="hover"
      initial="initial"
      className="glass-panel aspect-square p-8 rounded-[48px] border border-white/5 cursor-pointer transition-all relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl group hover:border-indigo-500/40"
      variants={{
        hover: { y: -10, transition: { duration: 0.4, ease: "easeOut" } },
        initial: { y: 0 }
      }}
    >
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-[0.1]'}`}>
        <Effect />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-white/20 group-hover:text-white group-hover:scale-110 transition-all duration-500">
          {icon}
        </div>
        <div>
          <h3 className="text-white text-2xl font-black mb-3 tracking-tighter uppercase italic">{title}</h3>
          <p className="text-[10px] text-white/30 font-mono font-black leading-relaxed group-hover:text-white/60 transition-colors uppercase tracking-[0.2em]">{desc}</p>
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

