"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { ThemeLanguageControls } from "./ThemeLanguageControls";
import styles from "./AiowV1Homepage.module.css";

export function PublicHeader({ locale = "nl", onBook }: { locale?: AiowLocale; onBook?: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const en = locale === "en";
  const scanHref = en ? "/en#booking" : "/#booking";
  return <header className={styles.header}>
    <Link href={en ? "/en" : "/"} className={styles.logo} aria-label={en ? "AIOW English home" : "AIOW home"}><span>AIOW</span><i /></Link>
    <nav aria-label={en ? "Primary navigation" : "Hoofdnavigatie"}>
      <Link href={en ? "/en#solutions" : "/#oplossingen"}>{en ? "Solutions" : "Oplossingen"}</Link>
      <Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Rates" : "Tarieven"}</Link>
      <Link href={en ? "/en/ventures" : "/ventures"}>Ventures</Link>
      <Link href={en ? "/en#approach" : "/#aanpak"}>{en ? "Approach" : "Aanpak"}</Link>
    </nav>
    <div className={styles.headerActions}>
      <ThemeLanguageControls locale={locale} />
      {onBook ? <button type="button" className={styles.headerCta} onClick={onBook}>{en ? "Book scan" : "Plan scan"}</button> : <Link className={styles.headerCta} href={scanHref}>{en ? "Book scan" : "Plan scan"}</Link>}
    </div>
  </header>;
}
