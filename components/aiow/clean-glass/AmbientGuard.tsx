"use client";

import { useEffect } from "react";

/**
 * Pauzeert ambient-loops zodra ze buiten beeld zijn (teamregel: loops pauzeren
 * off-screen, max 2 per pagina). Elementen melden zich aan met data-ambient.
 * Zonder JS gebeurt er niets; de loops zijn puur decoratieve enhancement.
 */
export function AmbientGuard() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-ambient]"));
    if (elements.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).style.animationPlayState = entry.isIntersecting ? "running" : "paused";
          for (const child of Array.from(entry.target.querySelectorAll<HTMLElement>("*"))) {
            child.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
          }
        }
      },
      { rootMargin: "10% 0px 10% 0px" },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return null;
}
