'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth, API_URL } from '@/lib/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: {
    name: string;
    bio: string;
    website: string;
    location: string;
    github_url: string;
    skills: string[];
    industry: string;
    experience_level: string;
  };
}

export default function EditProfileModal({ isOpen, onClose, onSuccess, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialData]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetchWithAuth(`${API_URL}/api/users/profile`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Identity updated successfully' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Identity update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Transmission error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
            className="relative w-full max-w-[640px] glass-panel rounded-[40px] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col bg-[#0e0e10]"
          >
            {/* Header */}
            <header className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Preferences</p>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Edit Profile</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all text-2xl"
              >
                ×
              </button>
            </header>

            {/* Scrollable Content */}
            <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Full Identity Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E. Hunter"
                    className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-4 text-white text-[14px] font-bold outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Researcher Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Focused on infrastructure security and SQLi research..."
                    className="input-focus-glow w-full min-h-[100px] bg-white/2 border border-white/5 rounded-2xl px-6 py-4 text-white text-[14px] font-medium outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Operational Base</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Remote / Global"
                    className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-4 text-white text-[14px] outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Secure Link</label>
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-4 text-white text-[14px] outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Skill Arsenal</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-white/2 border border-white/5 rounded-2xl min-h-[60px]">
                    {formData.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black rounded-xl italic">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-white text-lg leading-none mt-[-2px]">×</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder={formData.skills.length === 0 ? "Add tactical skills..." : ""}
                      className="flex-1 min-w-[120px] bg-transparent border-none text-white text-[13px] font-bold outline-none placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="px-10 py-8 border-t border-white/5 bg-white/1 flex items-center justify-between gap-4">
              <div className="flex-1">
                {message.text && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-[11px] font-black uppercase tracking-widest italic ${message.type === 'success' ? 'text-indigo-400' : 'text-rose-500'}`}
                  >
                    {message.text}
                  </motion.p>
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all italic"
                >
                  Cancel
                </button>
                <motion.button 
                  disabled={saving}
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 italic"
                >
                  {saving ? 'Syncing...' : 'Commit Changes'}
                </motion.button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

