"use client";

import { useEffect, useRef } from "react";
import styles from "./RestraintHome.module.css";

/**
 * De hero-film: vier agents krijgen terra-signalen binnen, wegen, en een mens
 * geeft de approval. Motion die het verhaal vertelt (motion-craft-standaard),
 * geen decoratie.
 *
 * Autoplay is progressive enhancement: het video-element rendert zonder
 * autoplay-attribuut, dus zonder JS of met prefers-reduced-motion staat er de
 * poster (het approval-moment). Met JS en zonder reduced-motion start de loop
 * muted; de voorkeur wordt live gevolgd.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
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
    <video
      ref={ref}
      className={styles.heroVideo}
      poster="/aiow/hero/aiow-agents-weging-poster.jpg"
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/aiow/hero/aiow-agents-weging-1080.webm" type="video/webm" />
      <source src="/aiow/hero/aiow-agents-weging-1080.mp4" type="video/mp4" />
    </video>
  );
}
