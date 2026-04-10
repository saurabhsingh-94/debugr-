'use client';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useEffect } from 'react';

export default function MouseGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 50, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const background = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(99, 102, 241, 0.1), transparent 80%)`;

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden will-change-[background]"
      style={{ background }}
    />
  );
}
