'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';


type Role = 'hacker' | 'company' | null;

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [formData, setFormData] = useState({ 
    email: '', password: '', confirmPassword: '',
    name: '', handle: '', specialization: 'Web', industry: '', experience_level: 'Intermediate'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    if (step === 2 && formData.password !== formData.confirmPassword) {
      setError('Passcodes do not match');
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      if (data.success) {
        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const loginData = await loginRes.json();
        
        if (loginData.success) {
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          router.push(role === 'company' ? '/dashboard' : '/dashboard');
        } else {
          router.push('/signin');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)' }}>
      <Navbar />

      <main style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', minHeight: '100vh' }}>
        
        <section style={{ 
          padding: '160px 60px 60px 8%', 
          borderRight: '1px solid var(--line)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
          display: 'flex', flexDirection: 'column', gap: 40,
          position: 'sticky', top: 0, height: '100vh'
        }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mono" style={{ fontSize: 11, color: 'var(--t2)', letterSpacing: '0.2em', marginBottom: 16 }}>
              {step === 1 ? '01 // IDENTITY' : step === 2 ? '02 // SECURITY' : '03 // PROFILE'}
            </p>
            <h1 className="metallic-text" style={{ fontSize: 'clamp(40px, 4dlw, 64px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
              Join the<br />Collective.
            </h1>
            <p style={{ color: 'var(--t2)', fontSize: 16, lineHeight: 1.6, maxWidth: 360 }}>
              {role ? `Initializing ${role} grid access...` : "Whether you're securing your software or uncovering its vulnerabilities, we provide the platform."}
            </p>
          </motion.div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 4 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: 40, height: 2, background: i <= step ? '#fff' : 'var(--line)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </section>

        <section style={{ padding: '0 10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ width: '100%', maxWidth: 440 }}>
            
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Choose your Path.</h2>
                  <p style={{ color: 'var(--t3)', fontSize: 14 }}>Select your operational identity to begin.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['hacker', 'company'].map(r => (
                    <button key={r} onClick={() => { setRole(r as Role); nextStep(); }} className="selection-btn" style={{ 
                      textAlign: 'left', padding: '32px', borderRadius: 24, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', transition: 'all 0.3s' 
                    }}>
                      <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8, textTransform: 'capitalize' }}>Join as a {r}</h3>
                      <p style={{ fontSize: 13, color: 'var(--t3)' }}>{r === 'hacker' ? 'I want to hunt for vulnerabilities and earn bounties.' : 'I want to secure my organization via the hacker community.'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <button onClick={prevStep} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>← IDENTITY</button>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>Establish Credentials.</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Input label="Email Protocol" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="hacker@debugr.tst" />
                  <Input label="Secure Passcode" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} />
                  <Input label="Verify Passcode" type="password" value={formData.confirmPassword} onChange={v => setFormData({...formData, confirmPassword: v})} />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button onClick={nextStep} className="metallic-button" style={{ width: '100%', padding: '18px' }}>Continue to Profile</button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <button onClick={prevStep} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>← SECURITY</button>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>{role === 'hacker' ? 'Hacker Stats' : 'Organization Intel'}</h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {role === 'hacker' ? (
                    <>
                      <Input label="Handle" value={formData.handle} onChange={v => setFormData({...formData, handle: v})} placeholder="@shadow_walker" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Specialization</label>
                        <select 
                          value={formData.specialization} 
                          onChange={e => setFormData({...formData, specialization: e.target.value})}
                          style={{ width: '100%', padding: '16px 20px', borderRadius: 12, background: '#111', border: '1px solid var(--line)', color: '#fff' }}
                        >
                          <option>Web Application</option>
                          <option>Infrastructure/Cloud</option>
                          <option>Mobile (iOS/Android)</option>
                          <option>Crypto/Web3</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input label="Company Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Cyberdyne Systems" />
                      <Input label="Industry" value={formData.industry} onChange={v => setFormData({...formData, industry: v})} placeholder="Technology" />
                    </>
                  )}
                </div>

                {error && <p className="error-msg">{error}</p>}
                <button type="submit" disabled={loading} className="metallic-button" style={{ width: '100%', padding: '18px' }}>
                  {loading ? 'Committing...' : 'Finalize Initialization'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--t3)', marginTop: 40 }}>
              Existing profile? <a href="/signin" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Resume Session</a>
            </p>
          </motion.div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>{label}</label>
      <input 
        type={type} required value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', color: '#fff' }}
      />
    </div>
  );
}
