"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import styles from "./HumanIndustrialHero.module.css";

type Locale = "nl" | "en";
type RouteId = "work" | "building" | "home";

type Route = {
  id: RouteId;
  short: string;
  title: string;
  description: string;
  visualLabel: string;
  visualDetail: string;
  href: string;
};

const content = {
  nl: {
    eyebrow: "Maatwerk-AI · Hoofddorp",
    title: ["Niet nog een", "losse tool."],
    signal: "Eén systeem",
    titleEnd: "dat voor u werkt.",
    lead: "AIOW ontwerpt, bouwt en beheert AI op maat — voor processen, gebouwen en woningen.",
    choose: "Kies waar het moet werken",
    authority: "Een mens beslist. Altijd.",
    delivery: ["Ontwerp", "Bouw", "Beheer"],
    visualEyebrow: "Uw gekozen omgeving",
    routes: [
      { id: "work", short: "Werk", title: "Voor mijn bedrijf", description: "Processen, software en koppelingen", visualLabel: "WERK", visualDetail: "Van intake en dossiers tot interne software.", href: "/ai-automatisering" },
      { id: "building", short: "Pand", title: "Voor mijn bedrijfspand", description: "Energie, toegang en beheer", visualLabel: "PAND", visualDetail: "Techniek en facilitair beheer als één geheel.", href: "/smart-office" },
      { id: "home", short: "Wonen", title: "Voor mijn woning of villa", description: "Comfort, klimaat en veiligheid", visualLabel: "WONEN", visualDetail: "Woontechniek afgestemd op hoe u leeft.", href: "/home" },
    ] satisfies Route[],
  },
  en: {
    eyebrow: "Bespoke AI · Hoofddorp",
    title: ["Not another", "disconnected tool."],
    signal: "One system",
    titleEnd: "built to work for you.",
    lead: "AIOW designs, builds and manages bespoke AI for processes, buildings and homes.",
    choose: "Choose where it must work",
    authority: "A person decides. Always.",
    delivery: ["Design", "Build", "Manage"],
    visualEyebrow: "Your selected environment",
    routes: [
      { id: "work", short: "Work", title: "For my company", description: "Processes, software and integrations", visualLabel: "WORK", visualDetail: "From intake and files to internal software.", href: "/en/ai-automation" },
      { id: "building", short: "Building", title: "For my commercial building", description: "Energy, access and management", visualLabel: "BUILDING", visualDetail: "Technology and facility management as one whole.", href: "/en/smart-office" },
      { id: "home", short: "Living", title: "For my home or villa", description: "Comfort, climate and safety", visualLabel: "LIVING", visualDetail: "Home technology designed around how you live.", href: "/en/home" },
    ] satisfies Route[],
  },
} as const;

export function HumanIndustrialHero({ locale = "nl" }: { locale?: Locale }) {
  const c = content[locale];
  const [activeRoute, setActiveRoute] = useState<RouteId>("work");
  const [cinemaState, setCinemaState] = useState<"ready" | "running" | "settled">("ready");
  const commissioningTimers = useRef<number[]>([]);
  const activeIndex = c.routes.findIndex((route) => route.id === activeRoute);

  const stopCommissioning = useCallback(() => {
    commissioningTimers.current.forEach(window.clearTimeout);
    commissioningTimers.current = [];
    setCinemaState("settled");
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce), (update: slow)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduced || saveData) {
      setCinemaState("settled");
      return;
    }
    setCinemaState("running");
    commissioningTimers.current = [
      window.setTimeout(() => setActiveRoute("building"), 820),
      window.setTimeout(() => setActiveRoute("home"), 1480),
      window.setTimeout(() => setActiveRoute("work"), 2180),
      window.setTimeout(() => setCinemaState("settled"), 2860),
    ];
    const interrupt = () => stopCommissioning();
    window.addEventListener("wheel", interrupt, { once: true, passive: true });
    window.addEventListener("touchstart", interrupt, { once: true, passive: true });
    window.addEventListener("keydown", interrupt, { once: true });
    return () => {
      commissioningTimers.current.forEach(window.clearTimeout);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interrupt);
    };
  }, [stopCommissioning]);

  function preview(id: RouteId) {
    stopCommissioning();
    setActiveRoute(id);
  }

  function preserveFocusedRoute(event: PointerEvent<HTMLElement> | FocusEvent<HTMLElement>) {
    const focused = event.currentTarget.querySelector<HTMLElement>(":focus");
    if (!focused) setActiveRoute("work");
  }

  return (
    <section
      id={locale === "en" ? "solutions" : "oplossingen"}
      className={styles.hero}
      data-active-route={activeRoute}
      data-cinema={cinemaState}
      data-locale={locale}
      onPointerDown={stopCommissioning}
      style={{ "--route-index": activeIndex } as CSSProperties}
    >
      <div className={styles.spine} aria-hidden="true">
        <span>A</span><span>I</span><i /><span>W</span>
        <small>26</small>
      </div>

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{c.eyebrow}</p>
        <h1>
          <span>{c.title[0]}{" "}</span>
          <span>{c.title[1]}{" "}</span>
          <strong>{c.signal}{" "}</strong>
          <span>{c.titleEnd}</span>
        </h1>
        <p className={styles.lead}>{c.lead}</p>
        <p className={styles.authority}>{c.authority}</p>
        <div className={styles.delivery} aria-label={c.delivery.join(", ")}>
          {c.delivery.map((step) => <span key={step}>{step}</span>)}
        </div>
      </div>

      <div className={styles.routes} onPointerLeave={preserveFocusedRoute}>
        <p>{c.choose}</p>
        <div className={styles.routeList}>
          <span className={styles.routeIndicator} aria-hidden="true" />
          {c.routes.map((route) => (
            <Link
              href={route.href}
              key={route.id}
              data-route={route.id}
              data-active={activeRoute === route.id ? "true" : undefined}
              onPointerEnter={() => preview(route.id)}
              onFocus={() => preview(route.id)}
            >
              <span className={styles.routeShort}>{route.short}</span>
              <span className={styles.routeCopy}><strong>{route.title}</strong><small>{route.description}</small></span>
              <i aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.field} aria-hidden="true">
        <p>{c.visualEyebrow}</p>
        {c.routes.map((route, index) => (
          <div className={styles.fieldLayer} data-visible={activeRoute === route.id ? "true" : undefined} data-index={index} key={route.id}>
            <span>{route.visualLabel}</span>
            <small>{route.visualDetail}</small>
            <b />
          </div>
        ))}
        <div className={styles.calibrationSweep} />
        <div className={styles.aperture}><i /></div>
      </div>
    </section>
  );
}
