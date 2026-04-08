import { Variants, Easing, TargetAndTransition, Transition } from "framer-motion";

/**
 * Premium easings for high-end UI feel.
 * Based on Apple/Luxury design standards.
 */
export const easeStandard: Easing = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
export const easeOutExpo: Easing = [0.16, 1, 0.3, 1] as [number, number, number, number];
export const easeOutQuart: Easing = [0.25, 1, 0.5, 1] as [number, number, number, number];
export const easeSmooth: Easing = [0.23, 1, 0.32, 1] as [number, number, number, number];
export const easeInertia: Easing = [0.08, 0.82, 0.17, 1] as [number, number, number, number];

/**
 * Spring configurations for interactive elements.
 */
export const springMedium: Transition = { type: "spring", stiffness: 260, damping: 20 };
export const springSoft: Transition = { type: "spring", stiffness: 80, damping: 20, mass: 1.2 };
export const springQuick: Transition = { type: "spring", stiffness: 450, damping: 30 };
export const springBouncy: Transition = { type: "spring", stiffness: 300, damping: 12 };

/**
 * Standard fade-in and slide-up animation.
 */
export const fadeInUp = (delay = 0, distance = 20): Variants => ({
  hidden: { opacity: 0, y: distance, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.8,
      ease: easeOutExpo,
    },
  },
});

/**
 * Blur-in animation for a premium reveal.
 */
export const blurIn = (delay = 0): Variants => ({
  hidden: { opacity: 0, filter: 'blur(20px)', scale: 1.05 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      delay,
      duration: 1.2,
      ease: easeInertia,
    },
  },
});

/**
 * Ultra-smooth reveal for text and panels.
 */
export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: 'blur(15px)', y: 15 },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    y: 0,
    transition: { duration: 1, ease: easeOutExpo }
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(15px)', 
    y: -15,
    transition: { duration: 0.6, ease: easeSmooth }
  }
};

/**
 * Scroll-triggered fade-in and slide-up animation.
 */
export const inView = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.7,
      ease: easeSmooth,
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
