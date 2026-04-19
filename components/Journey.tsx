"use client";
/**
 * Journey — 5-stage horizontal scroll pinned section.
 * Uses GSAP ScrollTrigger for pin + horizontal translation.
 * Falls back gracefully to vertical stack on mobile / reduced-motion.
 */
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { steps } from "@/lib/content";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (prefersReduced || isMobile) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      const total = track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -total,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${total + window.innerHeight * 0.5}`,
          invalidateOnRefresh: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section id="traject" className="relative hairline">
      {/* Intro */}
      <div className="container-wide section-pad">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[44ch]"
        >
          <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
            — Ons traject
          </p>
          <h2
            className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02]"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            5 stappen naar een<br />
            <span className="gradient-text">AI-native bedrijf.</span>
          </h2>
          <p className="mt-6 text-lg text-[var(--color-ink-soft)] leading-relaxed">
            Van eerste scan tot doorlopende groei. Geen lineaire watervallen, wel duidelijke mijlpalen — en op elk moment zicht op ROI.
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll on desktop, stack on mobile */}
      <div ref={containerRef} className="relative md:h-[100dvh] overflow-hidden">
        <div
          ref={trackRef}
          className="flex flex-col md:flex-row md:h-full gap-6 md:gap-0 px-[var(--page-padding)] md:px-0"
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="md:w-screen md:min-w-screen md:h-full md:px-[var(--space-9)] flex md:items-center"
            >
              <StepCard step={step} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: typeof steps[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full md:max-w-[960px] md:mx-auto grid md:grid-cols-12 gap-6 md:gap-10 p-6 md:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)] overflow-hidden"
    >
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${step.color}`}
      />

      <div className="md:col-span-4 flex flex-col gap-4">
        <span className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-ink-muted)]">
          Stap {step.number} van {String(5).padStart(2, "0")}
        </span>
        <h3
          className="font-display font-medium tracking-[var(--tracking-tight)] leading-[0.95]"
          style={{ fontSize: "var(--text-5xl)" }}
        >
          <span className="block text-[var(--color-ink-faint)]">{step.number}</span>
          <span className={`block bg-gradient-to-r ${step.color} bg-clip-text text-transparent mt-2`}>
            {step.title}
          </span>
        </h3>
        <p className="text-[var(--color-ink-muted)] text-sm font-mono uppercase tracking-wider">
          {step.subtitle}
        </p>
        <div className="inline-flex w-fit items-center gap-2 mt-2 px-3 py-1.5 rounded-full border border-[var(--color-line-strong)] text-xs text-[var(--color-ink-soft)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          {step.duration}
        </div>
      </div>

      <div className="md:col-span-8 flex flex-col gap-6">
        <p className="text-lg md:text-xl text-[var(--color-ink)] leading-relaxed">
          {step.description}
        </p>

        <div>
          <p className="text-xs font-mono tracking-wider uppercase text-[var(--color-ink-muted)] mb-4">
            Deliverables
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.deliverables.map((d) => (
              <li
                key={d}
                className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--color-accent)] shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
