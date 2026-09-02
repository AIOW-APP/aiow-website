"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { track } from "@/core/analytics/client";
import { buildCalculatorDecision } from "@/lib/aiow-v1/calculator-decision.mjs";
import { calculateBuildingPrice, calculateBusinessPrice, formatEuroCents } from "@/lib/aiow-v1/pricing.mjs";
import type { CalculatorQuoteConfig } from "./QuoteModal";
import styles from "./AiowV1Homepage.module.css";

type Mode = "business" | "building" | "home";
type ServiceRoute = "standard" | "comfort";

export function PriceCalculator({ locale = "nl", onQuote }: { locale?: "nl" | "en"; onQuote: (event: MouseEvent<HTMLButtonElement>, configuration: CalculatorQuoteConfig) => void }) {
  const [mode, setMode] = useState<Mode>("business");
  const [people, setPeople] = useState(10);
  const [squareMetres, setSquareMetres] = useState(120);
  const [homeType, setHomeType] = useState<"home" | "signature">("home");
  const [serviceRoute, setServiceRoute] = useState<ServiceRoute>("standard");
  const result = useMemo(() => mode === "business" ? calculateBusinessPrice(people) : calculateBuildingPrice(mode === "building" ? "office" : homeType, squareMetres), [mode, people, squareMetres, homeType]);
  const en = locale === "en";
  const tabs = [{ id: "business", label: en ? "Business" : "Bedrijf" }, { id: "building", label: en ? "Building" : "Pand" }, { id: "home", label: en ? "Home" : "Woning" }] as const;
  const input = mode === "business" ? people : squareMetres;
  const setInput = mode === "business" ? setPeople : setSquareMetres;
  const min = mode === "business" ? 1 : 25;
  const max = mode === "business" ? 400 : mode === "building" ? 4000 : 1000;
  const unit = mode === "business" ? (en ? "people" : "mensen") : "m²";
  const minimumApplied = result.minimumApplied.setup || result.minimumApplied.monthly;
  const quoteConfiguration = useMemo<CalculatorQuoteConfig>(() => ({ segment: mode, serviceRoute, ...(mode === "business" ? { people } : { squareMetres }), ...(mode === "home" ? { homeSubtype: homeType } : {}) }), [mode, serviceRoute, people, squareMetres, homeType]);
  const decision = useMemo(() => buildCalculatorDecision(quoteConfiguration, locale), [quoteConfiguration, locale]);
  function changed(segment: Mode = mode, route: ServiceRoute = serviceRoute) { void track("calculator_changed", { segment, serviceRoute: route }); }
  function changeMode(next: Mode) {
    if (next === mode) return;
    if (next === "home" && squareMetres > 1000) setSquareMetres(1000);
    setMode(next);
    changed(next);
  }
  function changeHomeType(next: "home" | "signature") { if (next === homeType) return; setHomeType(next); changed(); }
  function changeServiceRoute(next: ServiceRoute) { if (next === serviceRoute) return; setServiceRoute(next); changed(mode, next); }
  function changeInput(value: number) { if (value === input) return; setInput(value); changed(); }

  return (
    <section id="booking" className={styles.calculator} aria-labelledby="calculator-title">
      <div className={styles.instrumentTop}><span>{en ? "Live indication" : "Live indicatie"}</span><span className={styles.liveDot} aria-hidden="true" /></div>
      <h2 id="calculator-title" className={styles.srOnly}>{en ? "Price calculator" : "Prijsberekening"}</h2>
      <div aria-label={en ? "Select calculation" : "Kies berekening"} className={styles.tabs}>
        {tabs.map((tab) => <button key={tab.id} type="button" aria-pressed={mode === tab.id} className={mode === tab.id ? styles.activeTab : styles.tab} onClick={() => changeMode(tab.id)}>{tab.label}</button>)}
      </div>
      <p className={styles.calculatorModeHelp}>{mode === "business" ? (en ? "Recurring office work for a team." : "Terugkerend kantoorwerk voor een team.") : mode === "building" ? (en ? "Building management for an office or commercial property." : "Gebouwbeheer voor een kantoor- of bedrijfspand.") : (en ? "House rules and connected home systems." : "Huisregels en gekoppelde installaties.")}</p>
      {mode === "home" && <div className={styles.segment} aria-label={en ? "Choose home package" : "Kies woningpakket"}><button type="button" aria-pressed={homeType === "home"} onClick={() => changeHomeType("home")}>Home</button><button type="button" aria-pressed={homeType === "signature"} onClick={() => changeHomeType("signature")}>Signature</button></div>}
      <div className={styles.rangeHeader}><label htmlFor="price-range">{mode === "business" ? (en ? "Team size" : "Teamgrootte") : (en ? "Surface" : "Oppervlakte")}</label><output htmlFor="price-range">{input} {unit}</output></div>
      <input id="price-range" className={styles.range} type="range" min={min} max={max} step="1" value={input} onChange={(event) => changeInput(Number(event.target.value))} />
      <div className={styles.output} aria-live="polite" aria-atomic="true">
        <div><span>{en ? "Implementation" : "Implementatie"}</span><strong>{result.from && (en ? "from " : "vanaf ")}{formatEuroCents(result.setupCents, en ? "en-IE" : "nl-NL")}</strong></div>
        <div><span>{en ? "Management / month" : "Beheer / maand"}</span><strong>{result.from && (en ? "from " : "vanaf ")}{formatEuroCents(result.monthlyCents, en ? "en-IE" : "nl-NL")}</strong></div>
        <p>{result.label}{result.estimate ? (en ? " · estimate/quote" : " · indicatie/offerte") : ""}</p>
        {minimumApplied && <p className={styles.minimumNotice}>{en ? "Minimum rate applies" : "minimumtarief van toepassing"}</p>}
      </div>
      <button type="button" className={`${styles.quoteButton} ${styles.decisionPrimary}`} onClick={(event) => onQuote(event, quoteConfiguration)}>{decision.dominantAction}<span aria-hidden="true">↓</span></button>
      <details className={`${styles.decisionSummary} ${styles.calculatorDetails}`}>
        <summary>{en ? "View advice, package and boundaries" : "Bekijk advies, pakket en grenzen"}</summary>
        <h3>{en ? <>Recommended starting point: <strong>{decision.recommendation}</strong></> : <>Aanbevolen startpunt: <strong>{decision.recommendation}</strong></>}</h3>
        <p className={styles.decisionFit}>{decision.fit} {decision.route}</p>
        {decision.minimums.length > 0 && <ul className={styles.decisionMinimums}>{decision.minimums.map((item: string) => <li key={item}>{item}</li>)}</ul>}
        <div className={styles.routeChoice} aria-label={en ? "Choose payment route" : "Kies betaalroute"}><div className={styles.segment}><button type="button" aria-pressed={serviceRoute === "standard"} onClick={() => changeServiceRoute("standard")}>{en ? "Standard" : "Standaard"}</button><button type="button" aria-pressed={serviceRoute === "comfort"} onClick={() => changeServiceRoute("comfort")}>Comfort</button></div>{serviceRoute === "standard" ? <p>{en ? "You contract and pay third-party subscriptions and hardware directly. AIOW configures and manages with limited access." : "U sluit abonnementen en hardware rechtstreeks af en betaalt derden zelf. AIOW richt in en beheert met beperkte toegang."}</p> : <p>{en ? "Comfort requires automatic direct debit. Subscriptions are provider cost +25%; hardware is cost +15%. Actual third-party costs are not part of this fixed indication." : "Comfort vereist automatische incasso. Abonnementen zijn providerkostprijs +25%; hardware is kostprijs +15%. Werkelijke derde-kosten staan niet in deze vaste indicatie."}</p>}</div><div className={styles.decisionColumns}><div><h4>{en ? "Not included" : "Niet inbegrepen"}</h4><ul>{decision.exclusions.map((item: string) => <li key={item}>{item}</li>)}</ul></div><div><h4>{en ? "Final-price drivers" : "Bepalers van de eindprijs"}</h4><ul>{decision.finalPriceDrivers.map((item: string) => <li key={item}>{item}</li>)}</ul></div></div>
        <p className={styles.decisionBoundary}>{decision.boundary} <Link href={en ? "/en/rates" : "/tarieven"}>{en ? "All rates and conditions" : "Alle tarieven en voorwaarden"} ↗</Link></p>
      </details>
    </section>
  );
}
