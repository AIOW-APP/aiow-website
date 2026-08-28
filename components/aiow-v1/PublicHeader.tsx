"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ThemeLanguageControls } from "./ThemeLanguageControls";
import styles from "./AiowV1Homepage.module.css";

export function PublicHeader({ locale = "nl", onBook }: { locale?: "nl" | "en"; onBook: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const en = locale === "en";
  return <header className={styles.header}><Link href={en ? "/en" : "/"} className={styles.logo} aria-label="AIOW home"><span>AIOW</span><i /></Link><nav aria-label={en ? "Primary navigation" : "Hoofdnavigatie"}><Link href={en ? "/en#solutions" : "/#oplossingen"}>{en ? "Solutions" : "Oplossingen"}</Link><Link href="/tarieven" hrefLang="nl">{en ? "Rates (Dutch)" : "Tarieven"}</Link><Link href={en ? "/en#ventures" : "/#ventures"}>Ventures</Link><Link href={en ? "/en#approach" : "/#aanpak"}>{en ? "Approach" : "Aanpak"}</Link></nav><div className={styles.headerActions}><ThemeLanguageControls locale={locale} /><button type="button" className={styles.headerCta} onClick={onBook}>{en ? "Book scan" : "Plan scan"}</button></div></header>;
}
