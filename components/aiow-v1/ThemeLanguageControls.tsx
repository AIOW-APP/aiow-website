"use client";

import { useEffect, useState } from "react";
import styles from "./AiowV1Homepage.module.css";

type Theme = "system" | "light" | "dark";

export function ThemeLanguageControls({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const saved = localStorage.getItem("aiow-theme");
    if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
  }, []);
  function update(next: Theme) {
    setTheme(next);
    localStorage.setItem("aiow-theme", next);
    document.documentElement.dataset.theme = next;
  }
  return (
    <div className={styles.controls} aria-label={locale === "nl" ? "Weergave en taal" : "Display and language"}>
      <label className={styles.srOnly} htmlFor="theme-choice">{locale === "nl" ? "Thema" : "Theme"}</label>
      <select id="theme-choice" value={theme} onChange={(event) => update(event.target.value as Theme)} className={styles.select}>
        <option value="system">{locale === "nl" ? "Systeem" : "System"}</option>
        <option value="light">Light</option><option value="dark">Dark</option>
      </select>
      <a className={styles.language} href={locale === "nl" ? "/en" : "/"} hrefLang={locale === "nl" ? "en" : "nl"}>{locale === "nl" ? "EN" : "NL"}</a>
    </div>
  );
}
