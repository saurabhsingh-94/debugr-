'use client';

import { useState, useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
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
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred' });
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

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="metallic-card up"
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: 600, 
          maxHeight: '90vh', 
          borderRadius: 24, 
          overflow: 'hidden', 
          background: '#0e0e10',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1c1c21', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Edit Profile</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6e6e73', cursor: 'pointer', fontSize: 24, padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your professional name"
                style={{ width: '100%', background: '#141416', border: '1px solid #2c2c2e', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14 }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Bio</label>
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Hacker at... expert in..."
                style={{ width: '100%', minHeight: 80, background: '#141416', border: '1px solid #2c2c2e', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. London / Remote"
                style={{ width: '100%', background: '#141416', border: '1px solid #2c2c2e', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Website</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourblog.io"
                style={{ width: '100%', background: '#141416', border: '1px solid #2c2c2e', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 14 }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Skills</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 16px', background: '#141416', border: '1px solid #2c2c2e', borderRadius: 12, minHeight: 48 }}>
                {formData.skills.map(skill => (
                  <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 12, borderRadius: 8, fontWeight: 600 }}>
                    {skill}
                    <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder={formData.skills.length === 0 ? "Add skills (e.g. SQL Injection)..." : ""}
                  style={{ flex: 1, minWidth: 100, background: 'none', border: 'none', color: '#fff', fontSize: 14, outline: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #1c1c21', background: '#141416', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          {message.text && (
            <span style={{ fontSize: 13, color: message.type === 'success' ? '#10b981' : '#ef4444', marginRight: 'auto' }}>
              {message.text}
            </span>
          )}
          <button 
            onClick={onClose}
            style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #2c2c2e', background: 'transparent', color: '#a1a1a6', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            disabled={saving}
            onClick={handleSave}
            style={{ 
              padding: '9px 24px', 
              borderRadius: 10, 
              border: 'none', 
              background: '#6366f1', 
              color: '#fff', 
              fontSize: 14, 
              fontWeight: 700, 
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)'
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
