"use client";

import { useEffect } from "react";

/**
 * AIOW scroll-reveal laag.
 *
 * Werking (team-motionregels):
 * - Content is standaard ZICHTBAAR. Het inline gate-script (draait vóór first paint,
 *   alleen als JS aanstaat) zet `data-aiow-reveal="on"` op <html>; pas dan verbergt
 *   CSS de [data-reveal]-elementen. Zonder JS blijft alles gewoon leesbaar.
 * - Het gate-script slaat over bij prefers-reduced-motion of ontbrekende
 *   IntersectionObserver, en heeft een failsafe: als hydration binnen ~3s niet
 *   bevestigt via `data-aiow-reveal-live`, wordt de gate weer verwijderd.
 * - Alleen opacity / transform / clip-path worden geanimeerd (zie globals.css).
 * - Stagger via inline `--reveal-order` op het element.
 *
 * Gebruik: render <AiowReveal /> één keer per pagina en geef elementen
 * `data-reveal` (fade + rise) of `data-reveal="wipe"` (clip-wipe voor koppen).
 */
const GATE_SCRIPT = `(function(){try{var d=document.documentElement;if(!("IntersectionObserver" in window))return;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.setAttribute("data-aiow-reveal","on");window.setTimeout(function(){if(!d.hasAttribute("data-aiow-reveal-live")){d.removeAttribute("data-aiow-reveal");}},3200);}catch(e){}})();`;

export function AiowReveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-aiow-reveal-live", "on");
    if (!root.hasAttribute("data-aiow-reveal")) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (elements.length === 0) return;

    const reveal = (element: Element) => element.setAttribute("data-reveal-visible", "");
    const isInViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const height = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < height * 0.96 && rect.bottom > 0;
    };

    // Safety net: above-the-fold content must never remain invisible if the
    // observer callback is delayed or skipped by browser/background throttling.
    for (const element of elements) {
      if (isInViewport(element)) reveal(element);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0 },
    );

    for (const element of elements) {
      if (!element.hasAttribute("data-reveal-visible")) observer.observe(element);
    }

    window.setTimeout(() => {
      for (const element of elements) {
        if (isInViewport(element)) reveal(element);
      }
    }, 250);

    return () => observer.disconnect();
  }, []);

  return <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />;
}
