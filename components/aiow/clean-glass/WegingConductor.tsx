"use client";

import { useEffect } from "react";

/**
 * De Weging — conductor (DESIGN-DNA.md v2.1).
 *
 * De homepage weegt dossier #217 terwijl je scrolt. Elk weegmoment is een
 * sentinel met data-weging="<gewicht>". Deze conductor:
 *
 * - berekent bij elke scroll-verandering welke wegingen gepasseerd zijn
 *   (discrete stappen, geen scrubbing, les B2) en zet dat OMKEERBAAR terug
 *   bij terugscrollen (les A12);
 * - zet data-weighed op gepasseerde sentinels (CSS laat de weegregel aanklikken);
 * - zet data-aiow-stage en --aiow-live-score op <html>;
 * - telt alle [data-weging-score]-cijfers naar de nieuwe tussenstand (rAF,
 *   kalm-water-easing) en geeft de nav-badge een tik ([data-weging-tick]).
 *
 * Alles is cosmetische enhancement bovenop complete DOM: de HTML-default is de
 * eindstand (66). De conductor rijdt op de bestaande reveal-gate
 * (html[data-aiow-reveal="on"]): zonder JS, zonder IntersectionObserver of met
 * prefers-reduced-motion draait hij niet en staat overal direct de eindstand.
 */

const COUNT_MS = 520;
const PASS_LINE = 0.74; // weegmoment telt zodra het boven 74% van de viewport staat

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function WegingConductor() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-aiow-reveal") !== "on") return;

    const sentinels = Array.from(document.querySelectorAll<HTMLElement>("[data-weging]"));
    const outs = Array.from(document.querySelectorAll<HTMLElement>("[data-weging-score]"));
    const badges = Array.from(document.querySelectorAll<HTMLElement>("[data-weging-badge]"));
    if (sentinels.length === 0) return;

    let shown = 0;
    let target = 0;
    let countFrom = 0;
    let countStart = 0;
    let raf = 0;
    let scrollRaf = 0;

    const paint = (value: number) => {
      shown = value;
      root.style.setProperty("--aiow-live-score", (value / 100).toFixed(4));
      const text = String(Math.round(value)).padStart(2, "0");
      for (const out of outs) out.textContent = text;
    };

    const countStep = (now: number) => {
      const t = Math.min(1, (now - countStart) / COUNT_MS);
      paint(countFrom + (target - countFrom) * ease(t));
      raf = t < 1 ? window.requestAnimationFrame(countStep) : 0;
    };

    const countTo = (next: number) => {
      if (next === target) return;
      target = next;
      countFrom = shown;
      countStart = performance.now();
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(countStep);
      for (const badge of badges) {
        badge.removeAttribute("data-weging-tick");
        void badge.offsetWidth; // herstart de tik-animatie
        badge.setAttribute("data-weging-tick", "");
      }
    };

    const recompute = () => {
      scrollRaf = 0;
      const line = window.innerHeight * PASS_LINE;
      let total = 0;
      let stage = 0;
      for (const sentinel of sentinels) {
        const passed = sentinel.getBoundingClientRect().top < line;
        if (passed) {
          total += Number(sentinel.dataset.weging) || 0;
          stage += 1;
          sentinel.setAttribute("data-weighed", "");
        } else {
          sentinel.removeAttribute("data-weighed");
        }
      }
      root.setAttribute("data-aiow-stage", String(stage));
      countTo(total);
    };

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(recompute);
    };

    paint(0);
    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      root.removeAttribute("data-aiow-stage");
      root.style.removeProperty("--aiow-live-score");
    };
  }, []);

  return null;
}
