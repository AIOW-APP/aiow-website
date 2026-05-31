"use client";
/**
 * HeroDebbie — Debbie as the face of AIOW.
 * Talking-face video plays on mount, welcome audio plays after user gesture
 * (browser autoplay policy — we handle both cases).
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function HeroDebbie() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [played, setPlayed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showBubble, setShowBubble] = useState(false);

  // Try to autoplay muted; show unmute CTA
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {/* ignore */});
    const t = setTimeout(() => setShowBubble(true), 800);
    return () => clearTimeout(t);
  }, []);

  const handleUnmute = async () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    await v.play().catch(() => {});
    setMuted(false);
    setPlayed(true);
  };

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 60% 40%, #2A0D4F 0%, #0A0618 55%, #050210 100%)",
      }}
    >
      {/* Animated gold particles bg */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const left = (i * 41) % 100;
          const top = (i * 17) % 100;
          const size = 2 + (i % 3);
          const delay = (i * 0.3) % 5;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: i % 3 === 0 ? "#FFB820" : i % 3 === 1 ? "#FF4FD8" : "#B845FF",
                boxShadow: `0 0 ${size * 4}px currentColor`,
                color: i % 3 === 0 ? "#FFB820" : i % 3 === 1 ? "#FF4FD8" : "#B845FF",
              }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
            />
          );
        })}
      </div>

      {/* Gold radial glow behind Debbie */}
      <div
        className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, #FFB820 0%, #FF4FD8 40%, transparent 75%)" }}
      />

      <div className="relative z-10 container-wide min-h-screen grid md:grid-cols-2 items-center gap-10 py-24">
        {/* LEFT: copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#FFB820] mb-6">
            — AIOW · AI-transformatie voor MKB
          </p>
          <h1
            className="font-display font-medium text-white leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.75rem)" }}
          >
            Hoi, ik ben{" "}
            <span
              className="bg-clip-text text-transparent italic"
              style={{
                backgroundImage: "linear-gradient(120deg,#FFB820 0%,#FF4FD8 60%,#B845FF 100%)",
              }}
            >
              Debbie.
            </span>
          </h1>
          <p className="mt-6 text-white/70 text-lg md:text-xl max-w-lg leading-relaxed">
            AIOW’s eerste autonome AI-partner. In 5 minuten weet ik wat jouw bedrijf nodig heeft — en help ik je het te krijgen.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#scan"
              className="px-7 py-3.5 rounded-full font-medium text-sm tracking-wide"
              style={{
                background: "linear-gradient(135deg,#FFB820,#FF8A00)",
                color: "#14071F",
                boxShadow: "0 12px 40px rgba(255,184,32,0.4)",
              }}
            >
              Praat met mij →
            </a>
            <a
              href="#approach"
              className="px-7 py-3.5 rounded-full font-medium text-sm tracking-wide text-white/80 hover:text-white border border-white/20 hover:border-white/50"
            >
              Hoe ik werk
            </a>
          </div>

          {/* Audio status */}
          <div className="mt-8 flex items-center gap-3">
            {muted ? (
              <button
                onClick={handleUnmute}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-white/60 hover:text-[#FFB820] transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#FFB820]/20 border border-[#FFB820]/40 flex items-center justify-center">
                  🔊
                </span>
                Tik om me te horen
              </button>
            ) : (
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#FFB820]">
                <span className="flex gap-0.5">
                  <span className="w-0.5 h-3 bg-[#FFB820] animate-pulse" />
                  <span className="w-0.5 h-4 bg-[#FFB820] animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-0.5 h-2 bg-[#FFB820] animate-pulse" style={{ animationDelay: "0.4s" }} />
                </span>
                Live
              </span>
            )}
          </div>
        </motion.div>

        {/* RIGHT: Debbie video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="relative mx-auto w-full max-w-md md:max-w-lg"
        >
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(184,69,255,0.4)] border border-white/10">
            <video
              ref={videoRef}
              src="/debbie/hero-talking.mp4"
              poster="/debbie/cozy-hero.webp"
              playsInline
              loop
              preload="auto"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for blending */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent 40%, rgba(10,6,24,0.3) 85%, rgba(10,6,24,0.9) 100%)",
              }}
            />

            {/* Speech bubble */}
            <AnimatePresence>
              {showBubble && muted && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute left-4 top-4 max-w-[70%] px-4 py-2.5 rounded-2xl rounded-tl-sm"
                  style={{
                    background: "rgba(10,6,24,0.85)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,184,32,0.4)",
                  }}
                >
                  <p className="text-white/90 text-xs md:text-sm leading-relaxed">
                    Hee 👋 Zet me even aan, dan vertel ik je iets...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FD8] animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">Debbie · Live</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase animate-pulse z-10">
        ↓ ontdek
      </div>
    </section>
  );
}
