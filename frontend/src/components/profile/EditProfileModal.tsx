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
  const [formData, setFormData] = useState({ ...initialData, avatar_url: (initialData as any).avatar_url || '' });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...initialData, avatar_url: (initialData as any).avatar_url || '' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialData]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    try {
      const res = await fetchWithAuth(`/api/users/avatar`, {
        method: 'PATCH',
        body: uploadFormData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, avatar_url: data.avatar_url }));
        setMessage({ type: 'success', text: 'Tactical signature synchronized' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Transmission error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetchWithAuth(`/api/users/profile`, {
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
            className="relative w-full max-w-[800px] glass-panel rounded-[56px] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col bg-[#0e0e10] max-h-[90vh]"
          >
            {/* Header */}
            <header className="px-12 py-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2 italic">Registry Preferences</p>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Edit Identity</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all text-3xl font-light"
              >
                ×
              </button>
            </header>

            {/* Scrollable Content */}
            <div className="p-12 md:p-16 overflow-y-auto scrollbar-hide space-y-16">
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center gap-6 mb-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center shadow-2xl">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-110 active:scale-90 border-2 border-[#0e0e10]">
                    <span className="text-lg">📸</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Profile Picture</p>
                  <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tight">JPG, PNG, OR GIF UP TO 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-1 px-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Full Name</label>
                  </div>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Hunter"
                    className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-2xl px-8 py-5 text-white text-[14px] font-bold outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-1 px-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Username</label>
                    <span className="text-[9px] font-black text-indigo-400/50 uppercase tracking-widest italic">Registered Handle</span>
                  </div>
                  <div className="w-full bg-white/1 border border-white/5 rounded-2xl px-8 py-5 text-white/30 text-[14px] font-mono flex items-center gap-2">
                    <span className="opacity-20">@</span>
                    {(initialData as any).handle}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your background and interests..."
                    className="input-focus-glow w-full min-h-[120px] bg-white/2 border border-white/5 rounded-2xl px-8 py-5 text-white text-[14px] font-medium outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-2xl px-8 py-5 text-white text-[14px] outline-none transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Website</label>
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourlink.com"
                    className="input-focus-glow w-full bg-white/2 border border-white/5 rounded-2xl px-8 py-5 text-white text-[14px] outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Specialties</label>
                  <div className="flex flex-wrap gap-3 p-6 bg-white/2 border border-white/5 rounded-2xl min-h-[80px]">
                    {formData.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black rounded-xl italic">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-white text-lg leading-none">×</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder={formData.skills.length === 0 ? "Add your skills..." : "+ Add More"}
                      className="flex-1 min-w-[150px] bg-transparent border-none text-white text-[13px] font-bold outline-none placeholder:text-white/10"
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
                  {saving ? 'Saving...' : 'Save Profile'}
                </motion.button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

