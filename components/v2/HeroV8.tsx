"use client";
/**
 * HeroV8 — cinematic hero, Debbie video as floating glass portal,
 * big editorial typography, split layout. No image-glued-on-background.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function HeroV8() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [bubble, setBubble] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
    const t = setTimeout(() => setBubble(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const unmute = async () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    await v.play().catch(() => {});
    setMuted(false);
    setBubble(false);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.muted) {
      v.muted = false;
      v.play().catch(() => {});
      setMuted(false);
      setBubble(false);
    } else {
      v.muted = true;
      setMuted(true);
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center"
      style={{ zIndex: 10 }}
    >
      <div className="container-wide w-full grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center py-28 md:py-24 lg:py-0">
        {/* LEFT — editorial copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-10 bg-[#FFB820]" />
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#FFB820]">
              AIOW · AI-transformatie voor MKB
            </p>
          </motion.div>

          <h1
            className="font-display font-medium text-white leading-[0.92] tracking-tighter"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="block"
            >
              Van chaos
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              className="block"
            >
              naar{" "}
              <span
                className="bg-clip-text text-transparent italic"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg,#FFB820 0%,#FF4FD8 55%,#B845FF 100%)",
                }}
              >
                compounding.
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-8 text-white/70 text-lg md:text-xl max-w-md leading-relaxed"
          >
            Eén autonome AI-partner + een team van mensen die bouwen. Voor Nederlandse bedrijven die niet willen wachten.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#scan"
              data-cursor
              className="group px-8 py-4 rounded-full font-medium text-sm tracking-wide overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg,#FFB820,#FF8A00)",
                color: "#14071F",
                boxShadow: "0 15px 50px rgba(255,184,32,0.4)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start de AI-scan
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(135deg,#FFC96C,#FFB820)" }}
              />
            </a>
            <a
              href="#approach"
              data-cursor
              className="text-white/70 hover:text-[#FFB820] text-sm font-medium tracking-wide transition-colors"
            >
              Hoe het werkt →
            </a>
          </motion.div>

          {/* Meta ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex items-center gap-6 text-white/40 text-[11px] font-mono uppercase tracking-[0.25em]"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FC043] animate-pulse" />
              Nu live · NL
            </span>
            <span>5 min scan</span>
            <span>€0 lead cost</span>
          </motion.div>
        </motion.div>

        {/* RIGHT — Debbie video glass portal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative mx-auto w-full max-w-md"
          style={{ perspective: 1000 }}
        >
          <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden">
            {/* Glow behind */}
            <div
              className="absolute -inset-20 rounded-full blur-3xl opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(255,184,32,0.5) 0%, rgba(255,79,216,0.4) 35%, transparent 70%)",
              }}
            />

            {/* Glass frame */}
            <div
              className="absolute inset-0 rounded-[2rem] overflow-hidden"
              style={{
                boxShadow:
                  "0 40px 100px rgba(184,69,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <video
                ref={videoRef}
                src="/debbie/hero-talking.mp4"
                poster="/debbie/cozy-hero.webp"
                playsInline
                loop
                preload="auto"
                className="w-full h-full object-cover"
              />

              {/* Gradient overlays for seamless blending */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,184,32,0.2) 0%, transparent 40%, transparent 70%, rgba(255,79,216,0.2) 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,6,24,0.1) 0%, transparent 20%, transparent 80%, rgba(10,6,24,0.7) 100%)",
                }}
              />

              {/* Scanline effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, rgba(255,184,32,0) 0px, rgba(255,184,32,0) 3px, rgba(255,184,32,0.04) 4px)",
                }}
              />

              {/* Live badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FD8] animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/85">
                  Debbie · Live
                </span>
              </div>

              {/* Persistent mute/unmute toggle */}
              <button
                onClick={toggleMute}
                className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 backdrop-blur hover:bg-black/80 transition-colors border border-white/10"
                data-cursor
                aria-label={muted ? "Geluid aan" : "Geluid uit"}
                title={muted ? "Geluid aan" : "Geluid uit"}
              >
                <span className="text-sm">{muted ? "🔇" : "🔊"}</span>
              </button>

              {/* Speech bubble */}
              <AnimatePresence>
                {bubble && muted && (
                  <motion.button
                    onClick={unmute}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    className="absolute bottom-6 left-6 right-6 px-4 py-3 rounded-2xl text-left flex items-center gap-3"
                    style={{
                      background: "rgba(10,6,24,0.85)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,184,32,0.4)",
                    }}
                    data-cursor
                  >
                    <span className="text-xl">🔊</span>
                    <span className="text-white/90 text-xs md:text-sm leading-relaxed">
                      Tik om me te horen...
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating labels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="hidden md:block absolute -left-8 top-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFB820]">
              · autonoom
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="hidden md:block absolute -right-4 bottom-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF4FD8]">
              · lokaal verwerkt
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase"
      >
        <span>Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#FFB820]/60 to-transparent" />
      </motion.div>
    </section>
  );
}
