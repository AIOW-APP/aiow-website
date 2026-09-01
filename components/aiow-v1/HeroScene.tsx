"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import styles from "./AiowV1Homepage.module.css";

/**
 * Cinematic hero backdrop: a daylight council chamber — concrete, oak and
 * ordered seating — filmed in one slow, level move. The film is environment,
 * not signature: the calculator stays the working object in front of it.
 *
 * Layering, back to front: poster image (always present, the LCP-safe and
 * no-JS/reduced-motion frame) → muted looping film → paper scrim (left and
 * top, for the copy) → base fade (bottom, so facts and the section edge sit
 * on solid drafting paper).
 *
 * Motion: the film drifts a few percent on scroll through a settled spring.
 * prefers-reduced-motion hides the film in CSS (no first-frame flash) and the
 * effect below also pauses it; Save-Data never starts it.
 */
export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end start"] });
  const drift = useSpring(useTransform(scrollYProgress, [0, 1], [0, 90]), { stiffness: 110, damping: 26, mass: 1 });
  const settle = useSpring(useTransform(scrollYProgress, [0, 1], [1.03, 1.11]), { stiffness: 110, damping: 26, mass: 1 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const sync = () => {
      if (mq.matches || saveData) {
        video.pause();
        video.removeAttribute("autoplay");
        return;
      }
      video.muted = true;
      video.play().catch(() => {});
    };
    const visibility = () => { if (document.hidden) video.pause(); else sync(); };
    sync();
    mq.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);
    return () => { mq.removeEventListener("change", sync); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  return (
    <div ref={sceneRef} className={styles.heroScene} aria-hidden="true">
      <motion.div className={styles.heroFilmFrame} style={reduced ? undefined : { y: drift, scale: settle }}>
        {/* Decorative full-bleed frame behind the film; served as-is so the poster and video share one file. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.heroPoster} src="/hero/aiow-hero-poster.jpg" alt="" decoding="async" draggable={false} />
        <video
          ref={videoRef}
          className={styles.heroFilm}
          poster="/hero/aiow-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        >
          <source src="/hero/aiow-hero.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <i className={styles.heroScrim} />
      <i className={styles.heroFade} />
    </div>
  );
}
