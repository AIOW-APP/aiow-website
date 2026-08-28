"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { calculateBuildingPrice, calculateBusinessPrice, formatEuroCents } from "@/lib/aiow-v1/pricing.mjs";
import styles from "./AiowV1Homepage.module.css";

type Mode = "business" | "building" | "home";
type ServiceRoute = "standard" | "comfort";

export function PriceCalculator({ locale = "nl", onBook }: { locale?: "nl" | "en"; onBook: (event: MouseEvent<HTMLButtonElement>) => void }) {
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

  return (
    <section className={styles.calculator} aria-labelledby="calculator-title">
      <div className={styles.instrumentTop}><span>{en ? "Live indication" : "Live indicatie"}</span><span className={styles.liveDot} aria-hidden="true" /></div>
      <h2 id="calculator-title" className={styles.srOnly}>{en ? "Price calculator" : "Prijsberekening"}</h2>
      <div role="tablist" aria-label={en ? "Select calculation" : "Kies berekening"} className={styles.tabs}>
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={mode === tab.id} className={mode === tab.id ? styles.activeTab : styles.tab} onClick={() => setMode(tab.id)}>{tab.label}</button>)}
      </div>
      {mode === "home" && <div className={styles.segment} aria-label={en ? "Choose home package" : "Kies woningpakket"}><button type="button" aria-pressed={homeType === "home"} onClick={() => setHomeType("home")}>Home</button><button type="button" aria-pressed={homeType === "signature"} onClick={() => setHomeType("signature")}>Signature</button></div>}
      <div className={styles.rangeHeader}><label htmlFor="price-range">{mode === "business" ? (en ? "Team size" : "Teamgrootte") : (en ? "Surface" : "Oppervlakte")}</label><output htmlFor="price-range">{input} {unit}</output></div>
      <input id="price-range" className={styles.range} type="range" min={min} max={max} step="1" value={input} onChange={(event) => setInput(Number(event.target.value))} />
      <div className={styles.output} aria-live="polite" aria-atomic="true">
        <div><span>{en ? "Implementation" : "Implementatie"}</span><strong>{result.from && (en ? "from " : "vanaf ")}{formatEuroCents(result.setupCents, en ? "en-IE" : "nl-NL")}</strong></div>
        <div><span>{en ? "Management / month" : "Beheer / maand"}</span><strong>{result.from && (en ? "from " : "vanaf ")}{formatEuroCents(result.monthlyCents, en ? "en-IE" : "nl-NL")}</strong></div>
        <p>{result.label}{result.estimate ? (en ? " · estimate/quote" : " · indicatie/offerte") : ""}</p>
        {minimumApplied && <p className={styles.minimumNotice}>{en ? "Minimum rate applies" : "minimumtarief van toepassing"}</p>}
      </div>
      <div className={styles.routeChoice} aria-label={en ? "Choose payment route" : "Kies betaalroute"}>
        <div className={styles.segment}><button type="button" aria-pressed={serviceRoute === "standard"} onClick={() => setServiceRoute("standard")}>{en ? "Standard" : "Standaard"}</button><button type="button" aria-pressed={serviceRoute === "comfort"} onClick={() => setServiceRoute("comfort")}>Comfort</button></div>
        {serviceRoute === "standard" ? <p>{en ? "Default: you contract and pay third-party subscriptions and hardware directly. AIOW configures and manages with limited access." : "Standaard: u sluit abonnementen en hardware rechtstreeks af en betaalt derden zelf. AIOW richt in en beheert met beperkte toegang."}</p> : <p>{en ? "Comfort requires automatic direct debit. Subscriptions are provider cost +25%; provider increases are passed through 1-to-1 plus that 25% margin. Hardware is cost +15% and requires full prepayment or a deposit at least equal to the hardware value before ordering. AIOW never provides interest-free financing. Actual third-party costs remain unknown and are not added as a fixed total." : "Comfort vereist automatische incasso. Abonnementen zijn providerkostprijs +25%; providerprijsstijgingen worden 1-op-1 doorbelast plus die 25% marge. Hardware is kostprijs +15% en vereist vóór bestelling volledige vooruitbetaling of een aanbetaling van ten minste de hardwarewaarde. AIOW financiert nooit renteloos voor. Werkelijke derde-kosten blijven onbekend en tellen niet als vast totaal mee."}</p>}
      </div>
      <p className={styles.disclaimer}>{en ? "From indication excluding VAT, hardware and installation, cloud and AI usage. Final scope and price follow the scan." : "Vanafindicatie excl. btw, hardware en installatie, cloud- en AI-gebruik. Definitieve scope en prijs volgen na de scan."}</p>
      <Link className={styles.textLink} href="/tarieven" hrefLang="nl">{en ? "Rates and conditions (Dutch)" : "Bekijk alle tarieven en voorwaarden"} ↗</Link>
      <button type="button" className={styles.primaryButton} onClick={onBook}>{en ? "Book a scan" : "Plan een scan"}<span aria-hidden="true">↗</span></button>
    </section>
  );
}
