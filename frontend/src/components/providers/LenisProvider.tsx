'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

export default function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ 
      lerp: 0.05, 
      duration: 1.2, 
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      syncTouch: true,
    }}>
      {children}
    </ReactLenis>
  );
}
