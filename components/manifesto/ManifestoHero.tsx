"use client";
import { motion } from "framer-motion";
import { manifestoHero } from "@/core/content/manifesto";

export function ManifestoHero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center"
      style={{ zIndex: 10 }}
    >
      <div className="container-wide w-full py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-10 bg-[var(--color-accent,#C6FF3D)]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)]">
              {manifestoHero.eyebrow}
            </p>
          </div>

          <h1
            className="font-display font-medium text-white leading-[0.92] tracking-tighter"
            style={{ fontSize: "clamp(2.75rem, 8vw, 6.5rem)" }}
          >
            {manifestoHero.headline}
          </h1>

          <p className="mt-8 text-white/65 text-lg md:text-xl max-w-xl leading-relaxed">
            {manifestoHero.sub}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <a
              href={manifestoHero.cta.href}
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-white border-b border-white/30 pb-1 hover:border-[var(--color-accent,#C6FF3D)] hover:text-[var(--color-accent,#C6FF3D)] transition-colors"
            >
              {manifestoHero.cta.label}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href={manifestoHero.ctaSecondary.href}
              className="font-mono text-xs uppercase tracking-[0.3em] text-white/45 hover:text-white transition-colors"
            >
              {manifestoHero.ctaSecondary.label} →
            </a>
          </div>
        </motion.div>
      </div>

      {/* subtle scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/25">
        scroll
      </div>
    </section>
  );
}
