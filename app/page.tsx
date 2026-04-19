"use client";
import { motion } from "framer-motion";
import { FiberOpticShader } from "@/shaders/fiber-optic";
import { fadeUp, staggerChildren } from "@/motion/presets";
import Link from "next/link";

const stats = [
  { value: "12+", label: "Assets supported" },
  { value: "1,000+", label: "Active portfolios" },
  { value: "$10B", label: "Volume processed" },
  { value: "20+", label: "Countries covered" },
];

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      {/* WebGL background — full bleed */}
      <FiberOpticShader className="absolute inset-0 -z-10 opacity-90" color={[1.0, 0.4, 0.6]} />

      {/* Radial overlay for text legibility */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, transparent, var(--color-canvas) 80%)",
        }}
      />

      <section className="relative flex flex-col justify-end min-h-[100dvh] px-[var(--page-padding)] pb-[var(--space-9)]">
        <motion.div
          className="max-w-[var(--container-wide)] mx-auto w-full"
          initial="hidden"
          animate="visible"
          variants={staggerChildren(0.15)}
        >
          <motion.p
            variants={fadeUp}
            className="text-[var(--text-sm)] font-[var(--font-mono)] text-[var(--color-accent)] mb-[var(--space-4)] tracking-[var(--tracking-wide)] uppercase"
          >
            Debbie Studio — Starter Template
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="text-[var(--text-3xl)] md:text-[var(--text-mega)] font-[var(--font-display)] leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-balance max-w-[16ch]"
          >
            Built for the future<br />of crypto portfolios.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-[var(--space-5)] text-[var(--text-lg)] text-[var(--color-ink-muted)] max-w-[var(--container-narrow)]"
          >
            One unified dashboard, 12+ chains, $10B+ processed volume, audited smart contracts.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-[var(--space-7)]">
            <Link
              href="#"
              data-cursor="interactive"
              className="inline-flex items-center gap-2 px-[var(--space-6)] py-[var(--space-4)] rounded-[var(--radius-pill)] bg-[var(--color-accent)] text-[var(--color-canvas)] font-medium text-[var(--text-base)] transition-transform duration-[var(--dur-default)] ease-[var(--ease-out)] hover:scale-105"
            >
              Get started <span aria-hidden>→</span>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-[var(--space-9)] grid grid-cols-2 md:grid-cols-4 gap-[var(--space-6)] border-t border-[var(--color-line)] pt-[var(--space-7)]"
          >
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-[var(--space-2)]">
                <div className="text-[var(--text-2xl)] md:text-[var(--text-3xl)] font-[var(--font-display)] leading-[var(--leading-none)] tracking-[var(--tracking-display)]">
                  {s.value}
                </div>
                <div className="text-[var(--text-sm)] font-[var(--font-mono)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-ink-muted)]">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
