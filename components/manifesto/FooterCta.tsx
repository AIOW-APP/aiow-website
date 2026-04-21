"use client";
import { motion } from "framer-motion";
import { footerCta } from "@/core/content/manifesto";

export function FooterCta() {
  return (
    <section className="relative py-24 md:py-36 border-t border-white/10" style={{ zIndex: 10 }}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[var(--color-accent,#C6FF3D)]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--color-accent,#C6FF3D)]">
              {footerCta.eyebrow}
            </p>
          </div>
          <h2
            className="font-display font-medium text-white leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {footerCta.title}
          </h2>
          <p className="mt-5 text-white/55 text-base md:text-lg leading-relaxed">
            {footerCta.sub}
          </p>

          <ul className="mt-12 grid gap-3">
            {footerCta.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-3 font-mono text-sm text-white/70 hover:text-white transition-colors"
                >
                  <span className="border-b border-white/20 group-hover:border-[var(--color-accent,#C6FF3D)] pb-0.5 transition-colors">
                    {l.label}
                  </span>
                  <span className="text-white/30">→</span>
                  {l.note ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                      {l.note}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
            {footerCta.closer}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
