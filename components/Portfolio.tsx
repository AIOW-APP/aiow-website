"use client";
import { motion } from "framer-motion";
import { portfolio } from "@/lib/content";

export function Portfolio() {
  // Duplicate for infinite marquee
  const items = [...portfolio, ...portfolio];

  return (
    <section id="portfolio" className="relative section-pad hairline overflow-hidden">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="max-w-[44ch] mb-[var(--space-8)]"
        >
          <p className="font-mono text-xs tracking-[var(--tracking-wider)] uppercase text-[var(--color-accent)] mb-6">
            — Ons werk
          </p>
          <h2
            className="font-display font-medium tracking-[var(--tracking-tight)] leading-[1.02]"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            30+ SaaS-producten,
            <br />
            <span className="gradient-text">gebouwd door AI.</span>
          </h2>
          <p className="mt-6 text-lg text-[var(--color-ink-soft)] leading-relaxed">
            Wij bouwen niet alleen voor klanten. Wij hebben een heel portfolio aan eigen AI-native producten. Dat is ons lab.
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="flex gap-4 animate-marquee">
          {items.map((p, i) => (
            <a
              key={`${p.name}-${i}`}
              href={`https://${p.name}`}
              target="_blank"
              rel="noopener"
              className="group shrink-0 w-[320px] md:w-[380px] p-6 md:p-7 rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-canvas-soft)] hover:border-[var(--color-accent)] hover:bg-[var(--color-canvas-raised)] transition-all"
              data-cursor="interactive"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent-alt)]/20 border border-[var(--color-line-strong)] flex items-center justify-center">
                  <span className="text-sm font-mono">{p.name[0].toUpperCase()}</span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors"
                >
                  <path d="M4 4H12V12M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-mono text-base tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                {p.name}
              </h3>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed line-clamp-2">
                {p.desc}
              </p>
            </a>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[var(--color-canvas)] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[var(--color-canvas)] to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
          width: fit-content;
        }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}
