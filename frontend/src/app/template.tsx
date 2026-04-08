'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { easeOutExpo } from '@/lib/animations';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: 0.8, 
        ease: easeOutExpo 
      }}
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}
