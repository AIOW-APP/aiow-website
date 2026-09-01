"use client";

import { useEffect } from "react";

/**
 * Physics-driven page scroll for pointer devices: Lenis interpolates the
 * native window scroll so wheel input settles instead of stepping. Nothing is
 * hijacked — the document still scrolls natively, sticky elements, anchors and
 * framer-motion scroll tracking keep working, and touch scrolling stays fully
 * native. prefers-reduced-motion (initial or toggled later) means no Lenis at
 * all. Dialogs and nested scrollers (pricing deck, modals) scroll natively.
 */
export function MotionScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduced.matches || !pointer.matches) return;

    let lenis: { destroy: () => void } | undefined;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled || reduced.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
        anchors: { offset: -92 },
        prevent: (node) => node.closest('[role="dialog"]') !== null,
      });
    });

    const stop = () => { if (reduced.matches) { lenis?.destroy(); lenis = undefined; } };
    reduced.addEventListener("change", stop);
    return () => { cancelled = true; lenis?.destroy(); lenis = undefined; reduced.removeEventListener("change", stop); };
  }, []);

  return null;
}
