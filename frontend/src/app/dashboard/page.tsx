'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import HackerDashboard from '@/components/dashboard/HackerDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';

interface User {
  email: string;
  role: string;
  handle?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/signin');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.clear();
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div style={{ background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="mono" style={{ color: '#444', fontSize: 12 }}>RECONNAISSANCE IN PROGRESS...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#111111', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 60px' }}>
        
        {/* Profile Identity Bar */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: 60, padding: '16px 24px', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid #272727'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 20, 
              background: 'linear-gradient(135deg, #333 0%, #111 100%)',
              border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff'
            }}>
              {user?.email[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user?.handle || user?.email}</p>
              <p className="mono" style={{ fontSize: 10, color: '#444', textTransform: 'uppercase' }}>Session: {user?.role}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', border: '1px solid #272727', color: '#666',
              padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444';}}
            onMouseLeave={e => {e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#272727';}}
          >
            TERMINATE SESSION
          </button>
        </div>

        {user?.role === 'company' ? <CompanyDashboard /> : <HackerDashboard />}

      </main>
    </div>
  );
}
