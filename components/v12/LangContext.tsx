"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Lang, UI } from "@/core/content/capabilities";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };

const LangCtx = createContext<Ctx>({ lang: "nl", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("aiow_lang")) as Lang | null;
    if (stored === "nl" || stored === "en") setLangState(stored);
    else if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) setLangState("en");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    localStorage.setItem("aiow_lang", lang);
  }, [lang, ready]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: string) => UI[lang][key] ?? key;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center rounded-full bg-black/50 backdrop-blur-md ring-1 ring-white/15 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLang("nl")}
        className={`px-2.5 py-1 rounded-full transition-all ${lang === "nl" ? "bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618]" : "text-white/60 hover:text-white"}`}
      >NL</button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full transition-all ${lang === "en" ? "bg-gradient-to-r from-[#FFB820] to-[#FF4FD8] text-[#0A0618]" : "text-white/60 hover:text-white"}`}
      >EN</button>
    </div>
  );
}
