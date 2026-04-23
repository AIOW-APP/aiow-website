"use client";
/**
 * RoomV10 — Laag 4: binnen de kamer.
 * Full-bleed (video-)achtergrond + content overlay met toepassingsdetails.
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { type Industry, type Door } from "@/core/content/industries";

export function RoomV10({ industry, door }: { industry: Industry; door: Door }) {
  const doors = industry.doors;
  const idx = doors.findIndex((d) => d.id === door.id);
  const prev = idx > 0 ? doors[idx - 1] : null;
  const next = idx < doors.length - 1 ? doors[idx + 1] : null;

  const isContact = door.id === "aiow-kamer";

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0A0618]">
      {/* Background: video if door has one, else gradient with accent */}
      <div className="absolute inset-0 z-0">
        {door.videoSrc ? (
          <video
            src={door.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <img
            src={industry.heroImage}
            alt={industry.buildingName}
            className="w-full h-full object-cover opacity-25 blur-sm scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/buildings/hero_campus.webp";
            }}
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${door.accent || "from-white/5 to-transparent"} mix-blend-overlay`} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0618]/70 via-[#0A0618]/60 to-[#0A0618]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav */}
        <div className="flex items-center justify-between px-6 md:px-10 pt-6">
          <Link
            href={`/industrie/${industry.id}`}
            className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2"
          >
            <span>←</span> Terug naar {industry.buildingName}
          </Link>
          <Link href="/" className="text-white/50 hover:text-white/80 text-sm transition-colors">
            Home
          </Link>
        </div>

        {/* Room content */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-12">
          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
            >
              {/* Breadcrumb-ish header */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{industry.emoji}</span>
                <span className="text-white/40 text-sm">{industry.label}</span>
                <span className="text-white/30 text-sm">/</span>
                <span className="text-white/70 text-sm">{door.title}</span>
              </div>

              {/* Hero block */}
              <div className="flex items-start gap-5 mb-10">
                <div className="text-6xl md:text-7xl">{door.emoji}</div>
                <div>
                  <div className={`font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] mb-3 ${isContact ? "text-[#FFB820]" : "text-white/50"}`}>
                    · {isContact ? "Neem contact op" : "AI-toepassing"}
                  </div>
                  <h1 className="font-display text-4xl md:text-6xl text-white font-medium tracking-tight leading-[1.05] mb-3">
                    {door.title}
                  </h1>
                  <p className="font-display text-lg md:text-2xl text-white/70 leading-snug max-w-3xl">
                    {door.tagline}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-10">
                {/* How it works */}
                <div className="p-6 md:p-7 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFB820] mb-4">
                    · Zo werkt het
                  </div>
                  <ol className="space-y-3">
                    {door.howItWorks.map((step, i) => (
                      <li key={i} className="flex gap-3 text-white/80 text-sm md:text-base leading-relaxed">
                        <span className="font-mono text-xs text-white/40 mt-1 flex-shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Result + meta */}
                <div className="p-6 md:p-7 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFB820] mb-4">
                    · Wat het oplevert
                  </div>
                  <p className="font-display text-xl md:text-2xl text-white leading-snug mb-6">
                    {door.result}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1">Vanaf</div>
                      <div className="text-white font-medium">{door.priceFrom}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1">Live in</div>
                      <div className="text-white font-medium">{door.liveIn}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {isContact ? (
                  <>
                    <a
                      href="mailto:hello@aiow.ai?subject=Graag%20een%20gesprek%20over%20AIOW"
                      className="px-6 py-3 bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618] font-medium rounded-full hover:opacity-90 transition-opacity text-sm md:text-base"
                    >
                      Plan een gesprek →
                    </a>
                    <Link
                      href="/#scan"
                      className="px-6 py-3 border border-white/20 hover:border-white/50 text-white rounded-full transition-colors text-sm md:text-base"
                    >
                      Doe de AIOW-scan
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/industrie/${industry.id}/aiow-kamer`}
                      className="px-6 py-3 bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618] font-medium rounded-full hover:opacity-90 transition-opacity text-sm md:text-base"
                    >
                      Plan een gesprek →
                    </Link>
                    {next && (
                      <Link
                        href={`/industrie/${industry.id}/${next.id}`}
                        className="px-6 py-3 border border-white/20 hover:border-white/50 text-white rounded-full transition-colors text-sm md:text-base flex items-center gap-2"
                      >
                        Volgende kamer: {next.emoji} {next.title} →
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Prev/next small */}
              <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/10 text-sm">
                {prev ? (
                  <Link
                    href={`/industrie/${industry.id}/${prev.id}`}
                    className="text-white/50 hover:text-white transition-colors flex items-center gap-2"
                  >
                    ← {prev.emoji} {prev.title}
                  </Link>
                ) : <div />}
                {next ? (
                  <Link
                    href={`/industrie/${industry.id}/${next.id}`}
                    className="text-white/50 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {next.emoji} {next.title} →
                  </Link>
                ) : <div />}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
