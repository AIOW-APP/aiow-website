"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { ThemeLanguageControls } from "./ThemeLanguageControls";
import styles from "./AiowV1Homepage.module.css";

type NavKey = "solutions" | "rates" | "ventures" | "approach" | "company";

function currentNavKey(pathname: string): NavKey | null {
  if (pathname === "/tarieven" || pathname === "/en/rates") return "rates";
  if (pathname === "/ventures" || pathname === "/en/ventures") return "ventures";
  if (pathname === "/bedrijfsgegevens" || pathname === "/en/company") return "company";
  if (pathname === "/" || pathname === "/en" || ["/ai-automatisering", "/lokale-ai", "/smart-office", "/home", "/en/ai-automation", "/en/local-ai", "/en/smart-office", "/en/home"].includes(pathname)) return "solutions";
  return null;
}

export function PublicHeader({ locale = "nl", onBook }: { locale?: AiowLocale; onBook?: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const en = locale === "en";
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const scanHref = en ? "/en#booking" : "/#booking";
  const scanLabel = en ? "Request a scan" : "Vraag een scan aan";
  const active = currentNavKey(pathname);
  const items: { key: NavKey; href: string; label: string }[] = [
    { key: "solutions", href: en ? "/en#solutions" : "/#oplossingen", label: en ? "Solutions" : "Oplossingen" },
    { key: "rates", href: en ? "/en/rates" : "/tarieven", label: en ? "Rates" : "Tarieven" },
    { key: "ventures", href: en ? "/en/ventures" : "/ventures", label: "Ventures" },
    { key: "approach", href: en ? "/en#approach" : "/#aanpak", label: en ? "Approach" : "Aanpak" },
    { key: "company", href: en ? "/en/company" : "/bedrijfsgegevens", label: en ? "Company" : "Bedrijf" },
  ];

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function requestScan(event: MouseEvent<HTMLButtonElement>) { setMenuOpen(false); onBook?.(event); }

  return <header className={styles.header}>
    <Link href={en ? "/en" : "/"} className={styles.logo} aria-label={en ? "AIOW English home" : "AIOW home"}><span>AIOW</span><i /></Link>
    <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>{en ? "Menu" : "Menu"}<span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
    <nav id="primary-navigation" data-open={menuOpen} aria-label={en ? "Primary navigation" : "Hoofdnavigatie"}>
      {items.map((item) => <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      {onBook ? <button type="button" className={styles.mobileMenuCta} onClick={requestScan}>{scanLabel}</button> : <Link className={styles.mobileMenuCta} href={scanHref} onClick={() => setMenuOpen(false)}>{scanLabel}</Link>}
    </nav>
    <div className={styles.headerActions}>
      <ThemeLanguageControls locale={locale} />
      {onBook ? <button type="button" className={styles.headerCta} onClick={requestScan}>{scanLabel}</button> : <Link className={styles.headerCta} href={scanHref}>{scanLabel}</Link>}
    </div>
  </header>;
}
