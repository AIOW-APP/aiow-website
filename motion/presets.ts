/**
 * Debbie motion presets — Framer Motion variants + GSAP timelines
 *
 * Usage:
 *   import { fadeUp, staggerChildren } from "@/motion/presets";
 *   <motion.h1 variants={fadeUp} initial="hidden" animate="visible">...</motion.h1>
 */

import { type Variants } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

// ===== Reveal patterns =====

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_SPRING } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

// ===== Stagger containers =====

export const staggerChildren = (delay = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: delay, delayChildren: 0.1 },
  },
});

export const splitText = (text: string): { chars: string[]; variants: Variants } => ({
  chars: text.split(""),
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_OUT, delay: i * 0.02 },
    }),
  },
});

// ===== Page transitions =====

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3, ease: EASE_OUT } },
};

// ===== Hover states =====

export const magneticHover: Variants = {
  rest: { scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
  hover: { scale: 1.05, transition: { duration: 0.3, ease: EASE_SPRING } },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

// ===== Viewport-driven =====

export const revealOnScroll = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-10% 0px -10% 0px" },
  variants: fadeUp,
};

// ===== Scroll progress helpers =====

/**
 * Utility: pin an element for N viewport heights while scrolling.
 * Import ScrollTrigger from gsap.
 *
 * Example:
 *   useEffect(() => {
 *     const ctx = gsap.context(() => {
 *       pinForScroll(".hero", 2);
 *     }, containerRef);
 *     return () => ctx.revert();
 *   }, []);
 */
export const pinForScroll = (selector: string, duration = 1) => {
  if (typeof window === "undefined") return;
  // dynamic import to avoid SSR issues
  import("gsap").then(({ gsap }) => {
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: selector,
        start: "top top",
        end: `+=${duration * 100}%`,
        pin: true,
        pinSpacing: true,
      });
    });
  });
};
