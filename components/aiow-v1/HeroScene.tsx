"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import styles from "./AiowV1Homepage.module.css";

/**
 * Cinematic hero backdrop: in een warm daglicht-atelier materialiseren
 * werkdocumenten op een glazen instrumentpaneel. The film is environment,
 * not signature — the calculator stays the working object on top of it.
 *
 * Progressive enhancement: the element renders without an autoplay attribute,
 * so without JS or with prefers-reduced-motion the poster stands. With JS and
 * full motion the loop starts muted and drifts a few percent on scroll —
 * settled, never scroll-jacked.
 */
export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end start"] });
  const drift = useSpring(useTransform(scrollYProgress, [0, 1], [0, 84]), { stiffness: 110, damping: 26, mass: 1 });
  const settle = useSpring(useTransform(scrollYProgress, [0, 1], [1.04, 1.12]), { stiffness: 110, damping: 26, mass: 1 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (mq.matches) {
        video.pause();
      } else {
        video.muted = true;
        video.play().catch(() => {});
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div ref={sceneRef} className={styles.heroScene} aria-hidden="true">
      <motion.video
        ref={videoRef}
        className={styles.heroFilm}
        style={reduced ? undefined : { y: drift, scale: settle }}
        poster="/hero/aiow-hero-poster.jpg"
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
      >
        <source src="/hero/aiow-hero.mp4" type="video/mp4" />
      </motion.video>
      <i className={styles.heroScrim} />
    </div>
  );
}
