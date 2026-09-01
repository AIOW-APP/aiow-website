"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Motion-craft primitives for the Warm Precision surface. One physical
 * character: settled springs, no scroll-jacking. Reduced motion renders the
 * complete static composition — no entrance, no transforms.
 */
export const settleSpring: Transition = { type: "spring", stiffness: 130, damping: 23, mass: 1 };

const tags = { div: motion.div, section: motion.section, li: motion.li, p: motion.p, h1: motion.h1, h2: motion.h2, ol: motion.ol } as const;

type RevealProps = {
  as?: keyof typeof tags;
  delay?: number;
  y?: number;
  /** Animate on mount (above the fold) instead of waiting for the viewport. */
  mount?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children: ReactNode;
};

export function Reveal({ as = "div", delay = 0, y = 30, mount = false, className, style, id, children }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = tags[as];
  if (reduced) {
    const Static = as;
    return <Static className={className} style={style} id={id}>{children}</Static>;
  }
  const viewProps = mount
    ? { animate: { opacity: 1, y: 0 } }
    : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <Tag
      className={className}
      style={style}
      id={id}
      initial={{ opacity: 0, y }}
      transition={{ ...settleSpring, delay }}
      {...viewProps}
    >
      {children}
    </Tag>
  );
}

export const MotionLink = motion(Link);

export function useRevealMotion(delay = 0, y = 26) {
  const reduced = useReducedMotion();
  if (reduced) return {};
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -10% 0px" },
    transition: { ...settleSpring, delay },
  } as const;
}
