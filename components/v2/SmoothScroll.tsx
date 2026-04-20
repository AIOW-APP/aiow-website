"use client";
/**
 * SmoothScroll — Lenis-powered buttery scroll.
 */
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.0,
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Intercept anchor clicks to use Lenis scrollTo (otherwise browser jumps)
    function onAnchorClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      const tgt = document.querySelector(hash);
      if (!tgt) return;
      e.preventDefault();
      lenis.scrollTo(tgt as HTMLElement, { duration: 1.8, offset: -40 });
      history.replaceState(null, "", hash);
    }
    document.addEventListener("click", onAnchorClick);

    // Expose for other components
    (window as any).__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return null;
}
