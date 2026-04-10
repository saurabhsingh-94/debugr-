'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, blurReveal } from '@/lib/animations';
import { 
  BarChart3, 
  Shield, 
  Terminal,
  Clock,
  ExternalLink,
  Table as TableIcon,
  CreditCard,
  Settings
} from 'lucide-react';
import AdminPayouts from './AdminPayouts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'reports' | 'payouts'>('reports');

  return (
    <div className="space-y-16">
      {/* ── Admin Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 pb-16 border-b border-white/5">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="subtle-mono text-[9px] text-indigo-400 tracking-[0.4em] uppercase font-black italic">ADMINISTRATION PROTOCOL</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10">
              <span className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest">SYSTEM OVERRIDE</span>
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">
            Admin <br />
            <span className="text-white/5 italic">Control.</span>
          </h1>
        </div>

        <div className="flex gap-4 p-1.5 bg-white/[0.02] border border-white/5 rounded-[28px]">
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-3
              ${activeTab === 'reports' ? 'bg-white text-black shadow-2xl' : 'text-white/20 hover:text-white/40'}`}
          >
            <TableIcon size={12} /> Reports
          </button>
          <button 
            onClick={() => setActiveTab('payouts')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-3
              ${activeTab === 'payouts' ? 'bg-white text-black shadow-2xl' : 'text-white/20 hover:text-white/40'}`}
          >
            <CreditCard size={12} /> Payouts
          </button>
        </div>
      </div>

      {activeTab === 'reports' ? (
        <div className="py-40 text-center space-y-4 opacity-20">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter italic">Report Management System</h2>
            <p className="subtle-mono text-[9px] uppercase tracking-widest font-black italic">Select "Reports" from the sidebar to manage vulnerabilities.</p>
        </div>
      ) : (
        <AdminPayouts />
      )}
    </div>
  );
}
