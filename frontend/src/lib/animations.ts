import { Variants, Easing, TargetAndTransition, Transition } from "framer-motion";

/**
 * Premium easings for high-end UI feel.
 * Based on Apple/Luxury design standards.
 */
export const easeStandard: Easing = [0.25, 0.1, 0.25, 1];
export const easeOutExpo: Easing = [0.19, 1, 0.22, 1];
export const easeOutQuart: Easing = [0.165, 0.84, 0.44, 1];
export const easeSmooth: Easing = [0.4, 0, 0.2, 1];
export const easeInertia: Easing = [0.23, 1, 0.32, 1];

/**
 * Spring configurations for interactive elements.
 */
export const springMedium: Transition = { type: "spring", stiffness: 300, damping: 25 };
export const springSoft: Transition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };
export const springQuick: Transition = { type: "spring", stiffness: 500, damping: 35 };
export const springBouncy: Transition = { type: "spring", stiffness: 400, damping: 15 };

/**
 * Standard fade-in and slide-up animation.
 */
export const fadeInUp = (delay = 0, distance = 20): Variants => ({
  hidden: { opacity: 0, y: distance, filter: 'blur(6px)', scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      delay,
      duration: 0.4,
      ease: easeOutExpo,
    },
  },
});

/**
 * Blur-in animation for a premium reveal.
 */
export const blurIn = (delay = 0): Variants => ({
  hidden: { opacity: 0, filter: 'blur(12px)', scale: 1.05 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      delay,
      duration: 0.5,
      ease: easeOutExpo,
    },
  },
});

/**
 * Ultra-smooth reveal for text and panels with a slight drift.
 */
export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: easeOutExpo
    }
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(8px)', 
    y: -10,
    transition: { duration: 0.3, ease: easeSmooth }
  }
};

/**
 * Character/Word drift animation.
 */
export const drift = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: -10, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
});

/**
 * Scan line animation for hacker aesthetic.
 */
export const scanLine: Variants = {
  hidden: { top: '-10%', opacity: 0 },
  visible: {
    top: '110%',
    opacity: [0, 0.4, 0.4, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    }
  }
};

/**
 * Scroll-triggered fade-in and slide-up animation.
 */
export const inView = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)', scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      delay,
      duration: 0.5,
      ease: easeOutExpo,
    },
  },
});

/**
 * Container variant that staggers the appearance of its children.
 */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

/**
 * Micro-interactions for buttons and links.
 */
export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  y: -2,
  transition: springMedium
};

export const tapScale: TargetAndTransition = {
  scale: 0.98,
  transition: springQuick
};

/**
 * Viewport configuration for scroll-triggered animations.
 */
export const viewportConfig = {
  once: true,
  amount: 0.2,
};
