"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { localizedPath, type AiowLocale } from "@/lib/aiow-v1/locale";
import styles from "./AiowV1Homepage.module.css";

type Theme = "system" | "light" | "dark";
const themes: Theme[] = ["system", "light", "dark"];

export function ThemeLanguageControls({ locale = "nl" }: { locale?: AiowLocale }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("system");
  const targetLocale: AiowLocale = locale === "nl" ? "en" : "nl";
  const baseTarget = localizedPath(pathname, targetLocale);
  const [languageHref, setLanguageHref] = useState(baseTarget);

  useEffect(() => {
    const saved = localStorage.getItem("aiow-theme");
    if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
  }, []);
  useEffect(() => {
    setLanguageHref(`${localizedPath(location.pathname, targetLocale)}${location.search}${location.hash}`);
  }, [pathname, targetLocale]);

  function update(next: Theme) {
    setTheme(next);
    localStorage.setItem("aiow-theme", next);
    document.documentElement.dataset.theme = next;
  }
  function rememberLocale() {
    localStorage.setItem("aiow-locale", targetLocale);
  }

  return (
    <div className={styles.controls} role="group" aria-label={locale === "nl" ? "Weergave en taal" : "Display and language"}>
      <label className={styles.srOnly} htmlFor="theme-choice">{locale === "nl" ? "Thema" : "Theme"}</label>
      <select id="theme-choice" value={theme} onChange={(event) => update(event.target.value as Theme)} className={styles.select} aria-label={locale === "nl" ? `Thema: ${theme}` : `Theme: ${theme}`}>
        {themes.map((value) => <option value={value} key={value}>{value === "system" ? (locale === "nl" ? "Systeem" : "System") : value === "light" ? "Light" : "Dark"}</option>)}
      </select>
      <a className={styles.language} href={languageHref} hrefLang={targetLocale} lang={targetLocale} onClick={rememberLocale} aria-label={locale === "nl" ? "Bekijk deze pagina in het Engels" : "View this page in Dutch"}>{targetLocale.toUpperCase()}</a>
    </div>
  );
}
