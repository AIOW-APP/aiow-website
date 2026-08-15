"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./RestraintNav.module.css";

/**
 * Overlay-nav in KIA-restraint: transparant óp de midnight-hero, gescheiden van
 * de content door één haarlijn. Geen glas, geen blur, geen condens-animatie.
 * Mobiel: hamburger naar een solide midnight-paneel (44px targets, aria-expanded,
 * Escape en scroll sluiten, focus terug naar de knop).
 */
export function RestraintNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

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

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="AIOW.ai home">
          AIOW
        </Link>

        <nav className={styles.links} aria-label="AIOW navigatie">
          <Link href="/nl/kennis">Kennisbank</Link>
          <Link href="/portal">Login</Link>
          <Link className={styles.cta} href="/nl/venture-score-aanvragen">
            Weeg je idee
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="kr-nav-menu"
          aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="kr-nav-menu" className={styles.menuPanel} data-open={menuOpen ? "" : undefined} hidden={!menuOpen}>
        <Link href="/nl/kennis" onClick={closeMenu}>Kennisbank</Link>
        <Link href="/portal" onClick={closeMenu}>Login</Link>
        <Link href="/nl/venture-score-aanvragen" onClick={closeMenu}>Weeg je idee</Link>
      </div>
    </header>
  );
}
