"use client";

import { useEffect, useRef } from "react";
import styles from "./CleanGlassHome.module.css";

/**
 * Spunky, de beoordelaar — als wezen, niet als decoratie (DESIGN-DNA.md v2.1).
 *
 * - De kern kijkt op desktop richting de cursor (rAF, gedempt, alleen zolang de
 *   orb in beeld is). Touch/scroll-equivalent met hetzelfde verhaal (les A11):
 *   op elk apparaat kijkt de kern de pagina in naarmate je scrolt.
 * - Ademhaling + iris-puls zijn CSS (één ambient-wezen, loop 1 van 2, pauzeert
 *   off-screen via AmbientGuard). Zonder JS of met reduced-motion staat de orb
 *   stil en compleet; de gaze is pure enhancement.
 */
export function LivingOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = false;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let pointerX = 0;
    let pointerY: number | null = null;

    const step = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      orb.style.setProperty("--gaze-x", `${x.toFixed(2)}px`);
      orb.style.setProperty("--gaze-y", `${y.toFixed(2)}px`);
      raf = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.15 ? window.requestAnimationFrame(step) : 0;
    };

    const wake = () => {
      if (!raf) raf = window.requestAnimationFrame(step);
    };

    const retarget = () => {
      const rect = orb.getBoundingClientRect();
      const reach = rect.width * 0.09;
      // Scroll-verhaal: de blik zakt de pagina in naarmate je verder leest.
      const scrollGaze = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      targetY = scrollGaze * reach;
      targetX = 0;
      if (pointerY !== null) {
        // Cursor-verhaal (desktop): kijk richting de lezer, gedempt.
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetX = Math.max(-reach, Math.min(reach, (pointerX - cx) / 9));
        targetY = Math.max(-reach, Math.min(reach, (pointerY - cy) / 9 + targetY * 0.4));
      }
      wake();
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (active) retarget();
    };

    const onLeave = () => {
      pointerY = null;
      if (active) retarget();
    };

    const onScroll = () => {
      if (active) retarget();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        active = entries.some((entry) => entry.isIntersecting);
        if (active) retarget();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );

    observer.observe(orb);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={orbRef} className={styles.orb} data-ambient aria-hidden="true">
      <i />
      <b />
    </div>
  );
}
