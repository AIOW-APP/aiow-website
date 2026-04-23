"use client";
/**
 * IntroV10 — De nieuwe homepage. Laag 1 van de AIOW-beleving.
 * Full-bleed hero + industrie-picker (12 gebouwen).
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { INDUSTRIES } from "@/core/content/industries";

export function IntroV10() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0A0618]">
      {/* Hero campus background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/buildings/hero_campus.webp"
          alt="AIOW Campus"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0618]/40 via-[#0A0618]/20 to-[#0A0618]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top brand */}
        <div className="flex items-center justify-between px-6 md:px-10 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFB820] to-[#FF4FD8] grid place-items-center">
              <span className="font-mono text-sm font-bold text-[#0A0618]">A</span>
            </div>
            <span className="font-display text-xl md:text-2xl text-white tracking-tight">AIOW</span>
          </div>
          <Link href="/manifesto" className="text-white/70 hover:text-white text-sm transition-colors">
            Waarom AIOW →
          </Link>
        </div>

        {/* Hero center */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-6">
              · Welkom in AIOW
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-tight leading-[1.05] mb-6 max-w-4xl">
              Welk bedrijf<br />
              <span className="text-white/50">run jij?</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
              Stap binnen. Kies jouw gebouw. Zie hoe AIOW jouw bedrijf slimmer, sneller en rustiger maakt — met AI die voor jóu werkt.
            </p>
          </motion.div>

          {/* Industry grid */}
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {INDUSTRIES.map((ind, i) => (
                <motion.div
                  key={ind.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.04, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Link
                    href={`/industrie/${ind.id}`}
                    data-cursor
                    className="group relative block p-5 md:p-6 rounded-2xl border border-white/10 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.08] transition-all backdrop-blur-sm"
                  >
                    <div className="text-3xl md:text-4xl mb-2">{ind.emoji}</div>
                    <div className="font-display text-base md:text-lg text-white font-medium mb-1 leading-tight">
                      {ind.label}
                    </div>
                    {!ind.ready && (
                      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                        · binnenkort
                      </div>
                    )}
                    {ind.ready && (
                      <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#FFB820]/80">
                        · open
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="px-6 md:px-10 pb-8 text-center">
          <p className="text-white/40 text-xs md:text-sm">
            Passeen jouw branche er niet bij? Kies{" "}
            <Link href="/industrie/overige" className="text-white/70 hover:text-white underline underline-offset-4">
              Overige
            </Link>{" "}
            — dan laten we je de hele AIOW-suite zien.
          </p>
        </div>
      </div>
    </section>
  );
}
