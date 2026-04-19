"use client";
import { motion } from "framer-motion";
import { AuroraShader } from "./AuroraShader";
import { hero } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {/* Shader */}
      <div className="absolute inset-0 -z-10">
        <AuroraShader className="w-full h-full" intensity={1.0} />
      </div>

      {/* Vignette overlay for readability */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 55%, transparent 0%, rgba(10,10,11,0.4) 65%, rgba(10,10,11,0.95) 100%)",
        }}
      />

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-[var(--page-padding)] pt-[var(--space-6)]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] opacity-80 blur-md absolute inset-0" />
            <div className="relative w-8 h-8 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-canvas)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            </div>
          </div>
          <span className="font-mono text-sm tracking-wider">AIOW</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden md:flex items-center gap-8 text-sm text-[var(--color-ink-soft)]"
        >
          <a href="#problem" className="hover:text-[var(--color-ink)] transition-colors">Probleem</a>
          <a href="#traject" className="hover:text-[var(--color-ink)] transition-colors">Traject</a>
          <a href="#portfolio" className="hover:text-[var(--color-ink)] transition-colors">Werk</a>
          <a href="#fleet" className="hover:text-[var(--color-ink)] transition-colors">Fleet</a>
          <a href="#scan" className="btn-ghost !py-2 !px-4">AI-scan</a>
        </motion.div>
      </nav>

      {/* Eyebrow + title stack — anchored to top+center-bottom */}
      <div className="relative z-10 flex flex-col justify-center min-h-[calc(100dvh-8rem)] px-[var(--page-padding)] max-w-[var(--container-wide)] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs md:text-sm tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-[var(--space-6)]"
        >
          — {hero.eyebrow}
        </motion.p>

        <div className="flex flex-col gap-[0.02em]">
          {hero.titleLines.map((line, i) => (
            <motion.h1
              key={line}
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1.1,
                delay: 0.5 + i * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display font-medium tracking-[var(--tracking-tight)] leading-[0.92]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              {i === 2 ? (
                <span className="gradient-text">{line}</span>
              ) : (
                line
              )}
            </motion.h1>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[var(--space-8)] max-w-[48ch] text-lg md:text-xl text-[var(--color-ink-soft)] leading-relaxed"
        >
          {hero.lead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[var(--space-7)] flex flex-wrap gap-4"
        >
          <a href={hero.ctaPrimary.href} className="btn-primary" data-cursor="interactive">
            {hero.ctaPrimary.label}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href={hero.ctaSecondary.href} className="btn-ghost" data-cursor="interactive">
            {hero.ctaSecondary.label}
          </a>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[var(--color-ink-muted)]"
      >
        <span className="text-xs font-mono tracking-wider uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[var(--color-ink-muted)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
