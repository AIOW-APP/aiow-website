"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { track } from "@/core/analytics/client";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import type { LocalizedPricingContext } from "@/lib/aiow-v1/pricing-contexts-localized";
import { getPriorityContextStory } from "@/lib/aiow-v1/priority-context-stories";
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
  const story = getPriorityContextStory(context.slug, locale);
  const homeContext = context.slug === "woning" || context.slug === "villa-signature";
  const bookingTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => { const contextSlug = ANALYTICS_CONTEXTS[context.slug as keyof typeof ANALYTICS_CONTEXTS]; if (!en && contextSlug) void track("context_opened", { contextSlug }); }, [context.slug, en]);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; void track("scan_cta_clicked", { experiment: null }); setBooking(true); }
  const applications = <section id="toepassingen" className={styles.section}><div className={styles.sectionHead}><p>{en ? "Practical uses" : "Concreet inzetbaar"}</p><h2>{en ? "Three workflows to assess during the scan." : "Drie workflows om tijdens de scan te toetsen."}</h2></div><div className={styles.uses}>{context.automations.map((item,index)=><article key={item.title}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>;
  const advice = <section className={`${styles.section} ${styles.advice}`}><div><p>{en ? "Package advice" : "Pakketadvies"}</p><h2>{context.packageLabel}</h2></div><p>{context.advice}</p></section>;
  const calculation = <section className={styles.section} aria-labelledby="calculation-title"><div className={styles.sectionHead}><p>{en ? "Transparent calculation" : "Transparant gerekend"}</p><h2 id="calculation-title">{context.calculationTitle}</h2></div><div className={styles.calculation}><ol>{context.calculation.map((step)=><li key={step}>{step}</li>)}</ol><div className={styles.priceTotal}><strong>{context.calculationTotal}</strong><span>{en ? "Excluding VAT" : "Excl. btw"}</span></div><p>{en ? "This is the published price basis for setup and monthly management, not a complete project total. VAT, hardware, physical installation and cloud, AI and supplier usage are excluded. The written proposal defines the exact rooms, systems, workflows, responsibilities and support." : "Dit is de gepubliceerde prijsbasis voor aansluiting en maandelijks beheer, niet het volledige projecttotaal. Btw, hardware, fysieke installatie en cloud-, AI- en leveranciersgebruik zijn uitgesloten. Het schriftelijke voorstel legt de exacte ruimtes, systemen, workflows, verantwoordelijkheden en ondersteuning vast."}</p>{story && <div className={styles.nextStep}><b>{en ? "Free scan · about 30 minutes" : "Gratis scan · circa 30 minuten"}</b><span>{en ? "Bring one workflow or space, the systems involved and the main friction. You receive a decision memo with scope, dependencies, human checkpoints and a build / prepare / do-not-automate recommendation. If you wish to proceed, AIOW prepares a written proposal; only acceptance creates a commitment." : "Neem één proces of ruimte, de betrokken systemen en het belangrijkste knelpunt mee. U ontvangt een beslismemo met scope, afhankelijkheden, menselijke controlepunten en het advies bouwen / voorbereiden / bewust niet automatiseren. Wilt u verder, dan maakt AIOW een schriftelijk voorstel; pas acceptatie daarvan schept een verplichting."}</span></div>}</div></section>;
  return <div className={`${shared.site} ${styles.site}`}>
    <PublicHeader locale={locale} onBook={openBooking} />
    <main>
      <nav className={styles.breadcrumb} aria-label={en ? "Breadcrumb" : "Kruimelpad"}><Link href={en ? "/en" : "/"}>AIOW</Link><span>/</span><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Rates" : "Tarieven"}</Link><span>/</span><span aria-current="page">{en ? context.labelEn : context.labelNl}</span></nav>
      <header className={styles.hero}><p className={styles.kicker}>{context.category === "business" ? (en ? "Business context" : "Bedrijfscontext") : (en ? "Building context" : "Gebouwcontext")}</p><h1>{context.title}</h1><p>{context.introduction}</p><div><a href="#toepassingen">{en ? "View applications" : "Bekijk toepassingen"} ↓</a><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></div></header>
      {story && <section className={`${styles.section} ${styles.journey}`} aria-labelledby="daily-change-title">
        <div className={styles.sectionHead}><p>{en ? "What changes in practice" : "Wat verandert er praktisch"}</p><h2 id="daily-change-title">{story.promise}</h2></div>
        <p className={styles.serviceDefinition}>{homeContext ? (en ? "AIOW assesses the existing home systems, designs one bounded control layer, configures only the agreed routines and manages the software layer. Qualified installers remain responsible for hardware and physical work." : "AIOW onderzoekt de bestaande woningsystemen, ontwerpt één begrensde regielaag, richt alleen de afgesproken routines in en beheert de softwarelaag. Gekwalificeerde installateurs blijven verantwoordelijk voor hardware en fysiek werk.") : context.category === "building" ? (en ? "AIOW assesses the building systems, designs the bounded action route, configures the agreed software links and manages that software layer. Physical building controls remain with qualified parties." : "AIOW onderzoekt de gebouwsystemen, ontwerpt de begrensde actieroute, richt de afgesproken softwarekoppelingen in en beheert die softwarelaag. Fysieke gebouwbesturing blijft bij bevoegde partijen.") : (en ? "AIOW assesses this workflow, designs the bounded route, configures the agreed software links and manages that software layer. Your professionals retain the final judgement." : "AIOW onderzoekt deze werkstroom, ontwerpt de begrensde route, richt de afgesproken softwarekoppelingen in en beheert die softwarelaag. Uw professionals houden het eindoordeel.")}</p>
        <ol className={styles.journeySteps} aria-label={en ? "Reference workflow with human control" : "Voorbeeldworkflow met menselijke controle"}>
          <li><b>01 · {en ? "Often today" : "Nu vaak"}</b><span>{story.trace[0]}</span><p>{story.current}</p></li>
          <li><b>02 · {en ? "With AIOW" : "Met AIOW"}</b><span>{story.trace[1]}</span><p>{story.withAiow}</p></li>
          <li><b>03 · {en ? "Your decision" : "Uw beslissing"}</b><span>{story.trace[2]}</span><p>{story.humanDecision}</p></li>
        </ol>
        <div className={styles.scanQuestion}><p>{en ? "Question for the free 30-minute scan" : "Vraag voor de gratis scan van circa 30 minuten"}</p><strong>{story.scanQuestion}</strong></div>
        {homeContext && <div className={styles.homeChoice}><article><b>Home</b><p>{en ? "One residence, a manageable number of connected systems and clear household routines." : "Eén woning, een overzichtelijk aantal gekoppelde systemen en duidelijke huishoudelijke routines."}</p></article><article><b>Signature</b><p>{en ? "More zones, systems and suppliers, tailored living modes, private workflows or additional service coordination." : "Meer zones, systemen en leveranciers, persoonlijke woonmodi, privéworkflows of extra serviceregie."}</p></article><Link href={en ? (context.slug === "woning" ? "/en/rates/villa-signature" : "/en/rates/woning") : (context.slug === "woning" ? "/tarieven/villa-signature" : "/tarieven/woning")}>{en ? (context.slug === "woning" ? "Compare with Signature" : "Compare with Home") : (context.slug === "woning" ? "Vergelijk met Signature" : "Vergelijk met Home")} ↗</Link></div>}
      </section>}
      {story ? <>{advice}{calculation}{applications}</> : <>{applications}{advice}{calculation}</>}
      <section className={`${styles.section} ${styles.links}`}><div><p>{en ? "Continue assessing" : "Verder beoordelen"}</p><h2>{en ? "Rules, boundaries and technical context." : "Regels, grenzen en technische context."}</h2></div><nav aria-label={en ? `Relevant links for ${context.labelEn}` : `Relevante links voor ${context.labelNl}`}>{context.links.map(link=><Link key={link.href} href={link.href}>{link.label} ↗</Link>)}<Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Complete rates and conditions" : "Volledige tarieven en voorwaarden"} ↗</Link></nav></section>
      <section className={styles.cta}><p>{story ? (en ? "A clear next decision" : "Een heldere volgende beslissing") : (en ? "No predicted outcome" : "Geen voorspelde uitkomst")}</p><h2>{en ? "Start with the real process, building or plan." : "Begin met het echte proces, gebouw of plan."}</h2><p>{story ? (en ? "The free scan turns one concrete situation into a bounded decision memo. A proposal follows only if you choose to proceed." : "De gratis scan maakt van één concrete situatie een begrensd beslismemo. Een voorstel volgt alleen als u verder wilt.") : (en ? "The examples describe possible automations and published calculation rules, not guaranteed results." : "De voorbeelden beschrijven mogelijke automatiseringen en gepubliceerde rekenregels, geen gegarandeerde resultaten.")}</p><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></section>
    </main>
    <PublicFooter locale={locale} />
    <BookingModal open={booking} onClose={()=>setBooking(false)} locale={locale} returnFocus={bookingTrigger.current} />
  </div>;
}
