"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { ThemeLanguageControls } from "./ThemeLanguageControls";
import styles from "./AiowV1Homepage.module.css";

type NavKey = "solutions" | "capabilities" | "rates" | "company";

function currentNavKey(pathname: string, variant?: "human-industrial"): NavKey | null {
  if (pathname === "/tarieven" || pathname === "/en/rates") return "rates";
  if (variant === "human-industrial") {
    if (["/smart-office", "/en/smart-office"].includes(pathname)) return "capabilities";
    if (["/home", "/en/home"].includes(pathname)) return "company";
    if (["/", "/en", "/ai-automatisering", "/lokale-ai", "/en/ai-automation", "/en/local-ai"].includes(pathname)) return "solutions";
    return null;
  }
  if (pathname === "/bedrijfsgegevens" || pathname === "/en/company") return "company";
  if (pathname === "/mogelijkheden" || pathname === "/en/capabilities") return "capabilities";
  if (pathname === "/" || pathname === "/en" || ["/ai-automatisering", "/lokale-ai", "/smart-office", "/home", "/en/ai-automation", "/en/local-ai", "/en/smart-office", "/en/home"].includes(pathname)) return "solutions";
  return null;
}

export function PublicHeader({ locale = "nl", onBook, primaryAction = "scan", compactMobile = false, showCta = true, variant, scanHref }: { locale?: AiowLocale; onBook?: (event: MouseEvent<HTMLButtonElement>) => void; primaryAction?: "scan" | "price"; compactMobile?: boolean; showCta?: boolean; variant?: "human-industrial"; scanHref?: string }) {
  const en = locale === "en";
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const resolvedScanHref = scanHref || (en ? "/en/scan" : "/scan");
  const scanLabel = en ? "Request a scan" : "Vraag een scan aan";
  const actionHref = primaryAction === "price" ? "#booking" : resolvedScanHref;
  const actionLabel = primaryAction === "price" ? (en ? "View your indication" : "Bekijk uw indicatie") : scanLabel;
  const active = currentNavKey(pathname, variant);
  const defaultItems: { key: NavKey; href: string; label: string }[] = [
    { key: "solutions", href: en ? "/en#solutions" : "/#oplossingen", label: en ? "Solutions" : "Oplossingen" },
    { key: "capabilities", href: en ? "/en/capabilities" : "/mogelijkheden", label: en ? "Capabilities" : "Mogelijkheden" },
    { key: "rates", href: en ? "/en/rates" : "/tarieven", label: en ? "Rates" : "Tarieven" },
    { key: "company", href: en ? "/en/company" : "/bedrijfsgegevens", label: en ? "Company" : "Bedrijf" },
  ];
  const humanIndustrialItems: { key: NavKey; href: string; label: string }[] = [
    { key: "solutions", href: en ? "/en/ai-automation" : "/ai-automatisering", label: en ? "Company" : "Bedrijf" },
    { key: "capabilities", href: en ? "/en/smart-office" : "/smart-office", label: en ? "Building" : "Bedrijfspand" },
    { key: "company", href: en ? "/en/home" : "/home", label: en ? "Home" : "Woning" },
    { key: "rates", href: en ? "/en/rates" : "/tarieven", label: en ? "Costs" : "Kosten" },
  ];
  const items = variant === "human-industrial" ? humanIndustrialItems : defaultItems;

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const focusFrame = requestAnimationFrame(() => navigation.current?.querySelector<HTMLElement>("a,button")?.focus());
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => { cancelAnimationFrame(focusFrame); document.removeEventListener("keydown", closeOnEscape); };
  }, [menuOpen]);

  function requestScan(event: MouseEvent<HTMLButtonElement>) { setMenuOpen(false); onBook?.(event); }
  function navigateOpenMenu(event: ReactKeyboardEvent<HTMLElement>) {
    if (!menuOpen || event.key !== "Tab") return;
    const items = Array.from(navigation.current?.querySelectorAll<HTMLElement>("a,button") || []).filter((item) => item.offsetParent !== null);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && index === 0) { event.preventDefault(); menuButton.current?.focus(); return; }
    if (!event.shiftKey && index >= 0 && index < items.length - 1) { event.preventDefault(); items[index + 1]?.focus(); return; }
    if (event.shiftKey && index > 0) { event.preventDefault(); items[index - 1]?.focus(); }
  }

  return <header className={styles.header} data-compact-mobile={compactMobile ? "true" : undefined} data-variant={variant}>
    <Link href={en ? "/en" : "/"} className={styles.logo} aria-label={en ? "AIOW English home" : "AIOW home"}><span>AIOW</span><i /></Link>
    <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>{en ? "Menu" : "Menu"}<span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
    <nav ref={navigation} id="primary-navigation" data-open={menuOpen} aria-label={en ? "Primary navigation" : "Hoofdnavigatie"} onKeyDown={navigateOpenMenu}>
      {items.map((item) => <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      {showCta ? (onBook && primaryAction === "scan" ? <button type="button" className={styles.mobileMenuCta} onClick={requestScan}>{actionLabel}</button> : <Link className={styles.mobileMenuCta} href={actionHref} onClick={() => setMenuOpen(false)}>{actionLabel}</Link>) : null}
    </nav>
    <div className={styles.headerActions}>
      <ThemeLanguageControls locale={locale} />
      {showCta ? (onBook && primaryAction === "scan" ? <button type="button" className={styles.headerCta} onClick={requestScan}>{actionLabel}</button> : <Link className={styles.headerCta} href={actionHref}>{actionLabel}</Link>) : null}
    </div>
  </header>;
}
