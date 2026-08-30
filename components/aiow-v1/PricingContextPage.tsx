"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { track } from "@/core/analytics/client";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import type { LocalizedPricingContext } from "@/lib/aiow-v1/pricing-contexts-localized";
import { BookingModal } from "./BookingModal";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import shared from "./AiowV1Homepage.module.css";
import styles from "./PricingContextPage.module.css";

const ANALYTICS_CONTEXTS = {
  accountants: "accountants", zorg: "care", logistiek: "logistics", industrie: "manufacturing",
  woning: "woning", "bedrijfshal-industrie": "bedrijfshal-industrie",
} as const;

export function PricingContextPage({ context, locale = "nl" }: { context: LocalizedPricingContext; locale?: AiowLocale }) {
  const [booking, setBooking] = useState(false); const en = locale === "en";
  const bookingTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => { const contextSlug = ANALYTICS_CONTEXTS[context.slug as keyof typeof ANALYTICS_CONTEXTS]; if (!en && contextSlug) void track("context_opened", { contextSlug }); }, [context.slug, en]);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; void track("scan_cta_clicked", { experiment: null }); setBooking(true); }
  return <div className={`${shared.site} ${styles.site}`}>
    <PublicHeader locale={locale} onBook={openBooking} />
    <main>
      <nav className={styles.breadcrumb} aria-label={en ? "Breadcrumb" : "Kruimelpad"}><Link href={en ? "/en" : "/"}>AIOW</Link><span>/</span><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Rates" : "Tarieven"}</Link><span>/</span><span aria-current="page">{en ? context.labelEn : context.labelNl}</span></nav>
      <header className={styles.hero}><p className={styles.kicker}>{context.category === "business" ? (en ? "Business context" : "Bedrijfscontext") : (en ? "Building context" : "Gebouwcontext")}</p><h1>{context.title}</h1><p>{context.introduction}</p><div><a href="#toepassingen">{en ? "View applications" : "Bekijk toepassingen"} ↓</a><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></div></header>
      <section id="toepassingen" className={styles.section}><div className={styles.sectionHead}><p>{en ? "Practical uses" : "Concreet inzetbaar"}</p><h2>{en ? "Three workflows to assess during the scan." : "Drie workflows om tijdens de scan te toetsen."}</h2></div><div className={styles.uses}>{context.automations.map((item,index)=><article key={item.title}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className={`${styles.section} ${styles.advice}`}><div><p>{en ? "Package advice" : "Pakketadvies"}</p><h2>{context.packageLabel}</h2></div><p>{context.advice}</p></section>
      <section className={styles.section} aria-labelledby="calculation-title"><div className={styles.sectionHead}><p>{en ? "Transparent calculation" : "Transparant gerekend"}</p><h2 id="calculation-title">{context.calculationTitle}</h2></div><div className={styles.calculation}><ol>{context.calculation.map((step)=><li key={step}>{step}</li>)}</ol><strong>{context.calculationTotal}</strong><p>{en ? "Excluding VAT, hardware, physical installation and cloud, AI and supplier usage. Final scope and price follow the scan." : "Excl. btw, hardware, fysieke installatie en cloud-, AI- en leveranciersgebruik. Definitieve scope en prijs volgen na de scan."}</p></div></section>
      <section className={`${styles.section} ${styles.links}`}><div><p>{en ? "Continue assessing" : "Verder beoordelen"}</p><h2>{en ? "Rules, boundaries and technical context." : "Regels, grenzen en technische context."}</h2></div><nav aria-label={en ? `Relevant links for ${context.labelEn}` : `Relevante links voor ${context.labelNl}`}>{context.links.map(link=><Link key={link.href} href={link.href}>{link.label} ↗</Link>)}<Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Complete rates and conditions" : "Volledige tarieven en voorwaarden"} ↗</Link></nav></section>
      <section className={styles.cta}><p>{en ? "No predicted outcome" : "Geen voorspelde uitkomst"}</p><h2>{en ? "Start with the real process, building or plan." : "Begin met het echte proces, gebouw of plan."}</h2><p>{en ? "The examples describe possible automations and published calculation rules, not guaranteed results." : "De voorbeelden beschrijven mogelijke automatiseringen en gepubliceerde rekenregels, geen gegarandeerde resultaten."}</p><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></section>
    </main>
    <PublicFooter locale={locale} />
    <BookingModal open={booking} onClose={()=>setBooking(false)} locale={locale} returnFocus={bookingTrigger.current} />
  </div>;
}
