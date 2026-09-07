"use client";

import { useEffect } from "react";

export function HomepageMotionDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce), (update: slow)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];

    if (reduced || saveData || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.setAttribute("data-in", "true"));
      return;
    }

    const visibleNow = (target: HTMLElement) => {
      const bounds = target.getBoundingClientRect();
      return bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0;
    };
    targets.filter(visibleNow).forEach((target) => target.setAttribute("data-in", "true"));

    let lastScrollY = window.scrollY;
    let lastScrollAt = performance.now();
    let fastScroll = false;
    let fastScrollTimer = 0;
    const measureVelocity = () => {
      const now = performance.now();
      const elapsed = Math.max(1, now - lastScrollAt);
      fastScroll = Math.abs(window.scrollY - lastScrollY) / elapsed > 1.15;
      lastScrollY = window.scrollY;
      lastScrollAt = now;
      window.clearTimeout(fastScrollTimer);
      fastScrollTimer = window.setTimeout(() => { fastScroll = false; }, 180);
    };
    window.addEventListener("scroll", measureVelocity, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (fastScroll) (entry.target as HTMLElement).setAttribute("data-fast-reveal", "true");
        entry.target.setAttribute("data-in", "true");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -14% 0px", threshold: 0.08 });

    targets.filter((target) => target.dataset.in !== "true").forEach((target) => observer.observe(target));
    const frame = window.requestAnimationFrame(() => root.setAttribute("data-motion-ready", "true"));

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fastScrollTimer);
      window.removeEventListener("scroll", measureVelocity);
      observer.disconnect();
      root.removeAttribute("data-motion-ready");
    };
  }, []);

  return null;
}