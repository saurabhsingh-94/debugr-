"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getCookie } from '@/lib/api';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  folder?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError,
  label = "Upload Image Proof",
  folder = "marketplace_proofs"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus('error');
        setErrorMessage("File too large (Max 5MB)");
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setStatus('idle');
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', fileToUpload);
    formData.append('folder', folder);

    try {
      const token = getCookie('debugr_token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://debugr-backend-production.up.railway.app'}/api/marketplace/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStatus('success');
        onUploadSuccess(response.data.url);
      } else {
        throw new Error(response.data.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setStatus('error');
      const msg = error.response?.data?.error || error.message || "Failed to upload image";
      setErrorMessage(msg);
      if (onUploadError) onUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 ml-1">{label}</p>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full aspect-video rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden
          ${status === 'success' ? 'border-green-500/50 bg-green-500/5' : 
            status === 'error' ? 'border-red-500/50 bg-red-500/5' : 
            'border-white/10 bg-white/5 hover:border-amber-500/30 hover:bg-white/10'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                <Upload size={20} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-white/40">Click or drag image to upload</p>
                <p className="text-[10px] text-white/20 mt-1">PNG, JPG, GIF (Max 5MB)</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white animate-pulse">Uploading Proof...</p>
                  </>
                ) : status === 'success' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Upload Secured</p>
                  </>
                ) : status === 'error' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                      <AlertCircle size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{errorMessage}</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-white/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Processing Image...</p>
                  </>
                )}
              </div>

              <button 
                onClick={reset}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CloudinaryUpload;
