"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { calculateBuildingPrice, calculateBusinessPrice, formatEuroCents } from "@/lib/aiow-v1/pricing.mjs";
import styles from "./AiowV1Homepage.module.css";

type Mode = "business" | "building" | "home";

export function PriceCalculator({ locale = "nl", onBook }: { locale?: "nl" | "en"; onBook: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const [mode, setMode] = useState<Mode>("business");
  const [people, setPeople] = useState(10);
  const [squareMetres, setSquareMetres] = useState(120);
  const [buildingType, setBuildingType] = useState<"office" | "signature">("office");
  const result = useMemo(() => mode === "business" ? calculateBusinessPrice(people) : calculateBuildingPrice(mode === "home" ? "home" : buildingType, squareMetres), [mode, people, squareMetres, buildingType]);
  const en = locale === "en";
  const tabs = [{ id: "business", label: en ? "Business" : "Bedrijf" }, { id: "building", label: en ? "Building" : "Pand" }, { id: "home", label: en ? "Home" : "Woning" }] as const;
  const input = mode === "business" ? people : squareMetres;
  const setInput = mode === "business" ? setPeople : setSquareMetres;
  const min = mode === "business" ? 1 : 25;
  const max = mode === "business" ? 400 : 1000;
  const unit = mode === "business" ? (en ? "people" : "mensen") : "m²";
  return (
    <section className={styles.calculator} aria-labelledby="calculator-title">
      <div className={styles.instrumentTop}><span>{en ? "Live indication" : "Live indicatie"}</span><span className={styles.liveDot} aria-hidden="true" /></div>
      <h2 id="calculator-title" className={styles.srOnly}>{en ? "Price calculator" : "Prijsberekening"}</h2>
      <div role="tablist" aria-label={en ? "Select calculation" : "Kies berekening"} className={styles.tabs}>
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={mode === tab.id} className={mode === tab.id ? styles.activeTab : styles.tab} onClick={() => setMode(tab.id)}>{tab.label}</button>)}
      </div>
      {mode === "building" && <div className={styles.segment}><button type="button" aria-pressed={buildingType === "office"} onClick={() => setBuildingType("office")}>Smart Office</button><button type="button" aria-pressed={buildingType === "signature"} onClick={() => setBuildingType("signature")}>Signature</button></div>}
      <div className={styles.rangeHeader}><label htmlFor="price-range">{mode === "business" ? (en ? "Team size" : "Teamgrootte") : (en ? "Surface" : "Oppervlakte")}</label><output htmlFor="price-range">{input} {unit}</output></div>
      <input id="price-range" className={styles.range} type="range" min={min} max={max} step="1" value={input} onChange={(event) => setInput(Number(event.target.value))} />
      <div className={styles.output} aria-live="polite" aria-atomic="true">
        <div><span>{en ? "Implementation" : "Implementatie"}</span><strong>{result.from && (en ? "from " : "vanaf ")}{formatEuroCents(result.setupCents, en ? "en-IE" : "nl-NL")}</strong></div>
        <div><span>{en ? "Management / month" : "Beheer / maand"}</span><strong>{formatEuroCents(result.monthlyCents, en ? "en-IE" : "nl-NL")}</strong></div>
        <p>{result.label}</p>
      </div>
      <p className={styles.disclaimer}>{en ? "Pilot/from indication excluding VAT. Hardware and installation, cloud and AI usage, and change work are excluded. Final scope and service credits follow the scan." : "Pilot-/vanafindicatie excl. btw. Hardware en installatie, cloud- en AI-gebruik en wijzigingswerk zijn niet inbegrepen. Definitieve scope en servicecredits volgen na de scan."}</p>
      <button type="button" className={styles.primaryButton} onClick={onBook}>{en ? "Book a scan" : "Plan een scan"}<span aria-hidden="true">↗</span></button>
    </section>
  );
}
