"use client";
/**
 * BuildingV10 — Laag 3 van de beleving: het industrie-gebouw.
 * Toont exterior + deuren die leiden naar kamers (AI-toepassingen).
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { type Industry } from "@/core/content/industries";

export function BuildingV10({ industry }: { industry: Industry }) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0A0618]">
      {/* Building hero background */}
      <div className="absolute inset-0 z-0">
        <img
          src={industry.heroImage}
          alt={industry.buildingName}
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/buildings/hero_campus.webp";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0618]/30 via-[#0A0618]/50 to-[#0A0618]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav */}
        <div className="flex items-center justify-between px-6 md:px-10 pt-6">
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2">
            <span>←</span> Kies andere branche
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{industry.emoji}</span>
          </div>
        </div>

        {/* Building intro */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 md:px-10 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-3xl mb-16"
          >
            <div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#FFB820] mb-4">
              · {industry.label}
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-white font-medium tracking-tight leading-[1.05] mb-4">
              {industry.buildingName}
            </h1>
            <p className="font-display text-lg md:text-2xl text-white/60 leading-snug mb-6">
              {industry.buildingTagline}
            </p>
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              {industry.buildingDescription}
            </p>
          </motion.div>

          {/* Doors grid */}
          <div className="w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40 mb-6"
            >
              · Stap door een deur
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {industry.doors.map((door, i) => (
                <motion.div
                  key={door.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 + i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Link
                    href={`/industrie/${industry.id}/${door.id}`}
                    data-cursor
                    className={`group relative block p-6 md:p-7 rounded-2xl border transition-all backdrop-blur-sm text-left ${
                      door.id === "aiow-kamer"
                        ? "border-[#FFB820]/40 hover:border-[#FFB820]/80 bg-gradient-to-br from-[#FFB820]/10 to-[#FF4FD8]/5 hover:from-[#FFB820]/20"
                        : "border-white/10 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl md:text-4xl">{door.emoji}</div>
                      <div className={`font-mono text-[9px] uppercase tracking-[0.25em] ${door.id === "aiow-kamer" ? "text-[#FFB820]" : "text-white/30"}`}>
                        {door.id === "aiow-kamer" ? "contact" : `deur ${String(i + 1).padStart(2, "0")}`}
                      </div>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl text-white font-medium tracking-tight leading-tight mb-2">
                      {door.title}
                    </h3>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                      {door.subtitle}
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${door.id === "aiow-kamer" ? "text-[#FFB820]" : "text-white/40"}`}>
                        {door.priceFrom}
                      </span>
                      <span className="text-white/40 text-sm group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
