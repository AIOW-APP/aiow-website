"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CleanGlassNav.module.css";

/**
 * Condenserende glas-nav + score-badge-instrument (DESIGN-DNA.md v2, slot 3).
 *
 * - Nav condenseert bij scroll van 72px naar 56px; alleen hoogte, padding en
 *   schaduw animeren (nooit blur-radius, Grondwet).
 * - De score-badge is het persistente instrument (les A1): een conic-ring die
 *   zich omkeerbaar vult met de leesvoortgang en vol is bij het verdict.
 *   Puur cosmetisch: de eindstand (vol) staat in de CSS-default, dus zonder JS
 *   en met prefers-reduced-motion toont de badge direct de eindstand.
 * - journey="scroll" (homepage) laat de ring live meelopen; journey="static"
 *   (flow, kennisbank) houdt de eindstand en linkt naar de aanvraagflow.
 */

type CleanGlassNavProps = {
  journey?: "scroll" | "static";
  badgeHref?: string;
};

export function CleanGlassNav({ journey = "static", badgeHref }: CleanGlassNavProps) {
  const [condensed, setCondensed] = useState(false);
  const badgeRef = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
      frame.current = 0;
      setCondensed(window.scrollY > 24);
      if (journey === "scroll" && !reduceMotion && badgeRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, Math.max(0.04, window.scrollY / max)) : 1;
        badgeRef.current.style.setProperty("--cg-score", progress.toFixed(3));
      }
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [journey]);

  const badgeTarget = badgeHref ?? (journey === "scroll" ? "#verdict" : "/nl/venture-score-aanvragen");

  return (
    <header className={styles.bar} data-condensed={condensed ? "" : undefined}>
      <div className={`${styles.inner} cg-glass`}>
        <Link className={styles.brand} href="/" aria-label="AIOW.ai home">
          <strong>AIOW</strong>
          <span>AI venture partner</span>
        </Link>

        <nav className={styles.links} aria-label="AIOW navigatie">
          <Link href="/nl/kennis">Kennisbank</Link>
          <Link href="/app">Login</Link>
          <Link className={styles.cta} href="/nl/venture-score-aanvragen">Venture-score</Link>
        </nav>

        <a
          ref={badgeRef}
          className={styles.badge}
          href={badgeTarget}
          aria-label={journey === "scroll" ? "Score-instrument: scroll naar het verdict" : "Vraag je venture-score aan"}
        >
          <span className={styles.ring} aria-hidden="true" />
          <span className={styles.mark} aria-hidden="true">VS</span>
        </a>
      </div>
    </header>
  );
}
