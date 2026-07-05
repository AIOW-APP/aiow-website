"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CleanGlassNav.module.css";

/**
 * Condenserende glas-nav + score-badge-instrument (DESIGN-DNA.md v2.1).
 *
 * Header-standaard.md v1 (bindend): logo + 2 tekstlinks + precies één CTA-knop
 * (+ badge-instrument, + hamburger op mobiel). Mobiel verhuizen de tekstlinks
 * naar een solide menu-paneel: knop 44px, aria-expanded/controls, animatie naar
 * X, sluit bij linkklik, Escape en scroll.
 *
 * - Nav condenseert bij scroll (hoogte/padding/schaduw, nooit blur-radius) en
 *   is omkeerbaar (les A12).
 * - journey="scroll" (homepage): de badge is het levende weeginstrument uit
 *   De Weging — mono-cijfer + conic-ring met lat-markering op 70, gevoed door
 *   de WegingConductor via --aiow-live-score. HTML-default = eindstand 66,
 *   dus zonder JS of met reduced-motion klopt het beeld direct.
 * - journey="static" (flow, kennisbank): de badge rust (VS, ring vol) en linkt
 *   naar de aanvraagflow.
 */

type CleanGlassNavProps = {
  journey?: "scroll" | "static";
  badgeHref?: string;
};

export function CleanGlassNav({ journey = "static", badgeHref }: CleanGlassNavProps) {
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const frame = useRef(0);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      setCondensed(window.scrollY > 24);
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
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        toggleRef.current?.focus();
      }
    };
    const onScroll = () => closeMenu();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [menuOpen, closeMenu]);

  const badgeTarget = badgeHref ?? (journey === "scroll" ? "#verdict" : "/nl/venture-score-aanvragen");

  return (
    <header className={styles.bar} data-condensed={condensed ? "" : undefined}>
      <div className={`${styles.inner} cg-glass`}>
        <Link className={styles.brand} href="/" aria-label="AIOW.ai home">
          <strong>AIOW</strong>
          <span>AI venture partner</span>
        </Link>

        <a
          className={styles.badge}
          data-journey={journey}
          data-weging-badge={journey === "scroll" ? "" : undefined}
          href={badgeTarget}
          aria-label={
            journey === "scroll"
              ? "Weeginstrument: tussenstand van de weging, tik voor het verdict"
              : "Vraag je venture-score aan"
          }
        >
          <span className={styles.ring} aria-hidden="true" />
          {journey === "scroll" ? <span className={styles.lat} aria-hidden="true" /> : null}
          <span className={styles.mark} aria-hidden="true">
            {journey === "scroll" ? <b data-weging-score>66</b> : "VS"}
          </span>
        </a>

        <nav className={styles.links} aria-label="AIOW navigatie">
          <Link href="/nl/kennis">Kennisbank</Link>
          <Link href="/portal">Login</Link>
        </nav>

        <Link className={styles.cta} href="/nl/venture-score-aanvragen">
          Venture-score
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="cg-nav-menu"
          aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="cg-nav-menu" className={styles.menuPanel} data-open={menuOpen ? "" : undefined} hidden={!menuOpen}>
        <Link href="/nl/kennis" onClick={closeMenu}>Kennisbank</Link>
        <Link href="/portal" onClick={closeMenu}>Login</Link>
        <Link href="/nl/venture-score-aanvragen" onClick={closeMenu}>Venture-score aanvragen</Link>
      </div>
    </header>
  );
}
