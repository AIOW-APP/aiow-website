"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { moment } from "@/lib/content";

export function Moment() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 1, 0.2]);

  return (
    <section ref={ref} className="relative section-pad overflow-hidden">
      {/* Background aurora glow */}
      <motion.div
        style={{
          opacity: glow,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,240,255,0.15) 0%, rgba(255,79,216,0.08) 40%, transparent 70%)",
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="container relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-[var(--space-7)]"
        >
          — {moment.overline}
        </motion.p>

        <div className="flex flex-col gap-4 items-center">
          {[moment.line1, moment.line2, moment.line3].map((line, i) => (
            <motion.h2
              key={line}
              initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 1.1,
                delay: i * 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02]"
              style={{
                fontSize: i === 1 ? "var(--text-5xl)" : "var(--text-4xl)",
                color: i === 1 ? "var(--color-ink)" : "var(--color-ink-soft)",
              }}
            >
              {i === 1 ? <span className="gradient-text">{line}</span> : line}
            </motion.h2>
          ))}
        </div>
      </div>
    </section>
  );
}
