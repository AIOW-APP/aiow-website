"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { track } from "@/core/analytics/client";
import { BookingModal } from "./BookingModal";
import { HeroScene } from "./HeroScene";
import { MotionLink, Reveal, useRevealMotion } from "./MotionCraft";
import { OperationalField } from "./OperationalField";
import { PriceCalculator } from "./PriceCalculator";
import { PricingGuide } from "./PricingGuide";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { QuoteModal, type CalculatorQuoteConfig } from "./QuoteModal";
import styles from "./AiowV1Homepage.module.css";

function RouteGlyph({ route }: { route: number }) {
  const paths = [
    <><path d="M7 29h12V17h12V7h10" /><circle cx="7" cy="29" r="3" /><circle cx="41" cy="7" r="3" /></>,
    <><path d="M7 35h10V13h14v22h10" /><path d="M12 7h24" /><circle cx="7" cy="35" r="3" /><circle cx="41" cy="35" r="3" /></>,
    <><path d="M8 36V12h32v24" /><path d="M15 29h6v-6h6v-6h6" /><circle cx="8" cy="12" r="3" /><circle cx="40" cy="12" r="3" /></>,
    <><path d="M7 24 24 9l17 15v16H7Z" /><path d="M17 40V28h14v12" /><circle cx="24" cy="9" r="3" /></>,
  ];
  return <svg className={styles.routeGlyph} viewBox="0 0 48 48" aria-hidden="true" focusable="false">{paths[route]}</svg>;
}

function SolutionRoute({ href, index, children }: { href: string; index: number; children: ReactNode }) {
  const reveal = useRevealMotion(index * 0.07, 30);
  return <MotionLink href={href} className={styles.solution} data-route={index + 1} {...reveal}>{children}</MotionLink>;
}

export function AiowV1Homepage({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const [booking, setBooking] = useState(false);
  const en = locale === "en";
  const [quote, setQuote] = useState<CalculatorQuoteConfig | null>(null);
  const bookingTrigger = useRef<HTMLElement | null>(null);
  const quoteTrigger = useRef<HTMLElement | null>(null);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; void track("scan_cta_clicked", { experiment: null }); setBooking(true); }
  function openQuote(event: MouseEvent<HTMLButtonElement>, configuration: CalculatorQuoteConfig) { quoteTrigger.current = event.currentTarget; void track("quote_opened", {}); setQuote(configuration); }
  const solutions = en ? [
    ["AI automation", "Turn repeated knowledge work into controlled workflows with human checkpoints.", "/en/ai-automation"],
    ["Local AI", "Run sensitive AI workloads closer to your own data and infrastructure.", "/en/local-ai"],
    ["Smart Office", "Connect spaces, signals and workflows—implementation and hardware scoped separately.", "/en/smart-office"],
    ["AIOW Home", "A partner-dependent route for practical home intelligence, without pretending hardware is included.", "/en/home"],
  ] : [
    ["AI-automatisering", "Maak herhaald kenniswerk tot controleerbare workflows met menselijke beslismomenten.", "/ai-automatisering"],
    ["Lokale AI", "Breng gevoelige AI-taken dichter bij je eigen data en infrastructuur.", "/lokale-ai"],
    ["Smart Office", "Verbind ruimte, signalen en werkstromen—implementatie en hardware apart gescoped.", "/smart-office"],
    ["AIOW Home", "Een partner-afhankelijke route naar praktische woningintelligentie, zonder te doen alsof hardware inbegrepen is.", "/home"],
  ];

  return <div className={styles.site}>
    <PublicHeader locale={locale} onBook={openBooking} />
    <main>
      <section className={`${styles.hero} ${styles.heroCinematic}`}>
        <HeroScene />
        <div className={styles.heroCopy}>
          <Reveal as="p" className={styles.eyebrow} y={18} mount>{en ? "AI, installed with precision" : "AI, precies geïnstalleerd"}</Reveal>
          <Reveal as="h1" delay={0.08} mount>{en ? <>AI for processes, <em>buildings and homes.</em></> : <>AI voor processen, <em>gebouwen en woningen.</em></>}</Reveal>
          <Reveal as="p" className={styles.lead} delay={0.16} mount>{en ? "AI for business processes, buildings and homes — designed and managed by one party. Start with a transparent indication; set the final scope after a scan." : "AI voor bedrijfsprocessen, gebouwen en woningen — ontworpen en beheerd door één partij. Begin met een transparante indicatie; bepaal de definitieve scope na een scan."}</Reveal>
          <Reveal className={styles.heroLinks} delay={0.24} mount><button className={styles.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "View all rates" : "Bekijk alle tarieven"} ↓</Link></Reveal>
          <Reveal delay={0.32} mount><dl className={styles.heroFacts}>
            <div><dt>{en ? "Start" : "Vanaf"}</dt><dd>€ 2.950</dd></div>
            <div><dt>{en ? "First step" : "Eerste stap"}</dt><dd>{en ? "Practical scan" : "Praktische scan"}</dd></div>
            <div><dt>{en ? "Terms" : "Voorwaarden"}</dt><dd>{en ? "Published" : "Gepubliceerd"}</dd></div>
          </dl></Reveal>
        </div>
        <div className={styles.heroInstrument} data-premium-instrument="calculator">
          <OperationalField />
          <div className={styles.instrumentPlate} aria-hidden="true"><span>01</span><i /><span>WP / 2.0</span></div>
          <PriceCalculator locale={locale} onBook={openBooking} onQuote={openQuote} />
        </div>
      </section>

      <section className={styles.statement}>
        <OperationalField variant="statement" />
        <div className={styles.statementRail} aria-hidden="true"><span>01</span><i /><span>04</span></div>
        <Reveal as="p" y={16}>{en ? "Not another AI presentation." : "Geen volgende AI-presentatie."}</Reveal>
        <Reveal as="h2" delay={0.1} y={38}>{en ? "A working system with clear boundaries, ownership and operating costs." : "Een werkend systeem met duidelijke grenzen, eigenaarschap en beheerkosten."}</Reveal>
      </section>

      <section id={en ? "solutions" : "oplossingen"} className={styles.solutions}>
        <div className={styles.sectionHead}><Reveal as="p" className={styles.eyebrow} y={14}>{en ? "Solutions" : "Oplossingen"}</Reveal><Reveal as="h2" delay={0.06}>{en ? "Four routes. One measured way of working." : "Vier routes. Eén beheerste werkwijze."}</Reveal><Reveal as="p" delay={0.12}>{en ? "Choose the environment where AI must become useful. Every route starts with boundaries and a real implementation scope." : "Kies de omgeving waarin AI nuttig moet worden. Elke route begint bij grenzen en een echte implementatiescope."}</Reveal></div>
        <div className={styles.solutionList}>{solutions.map(([title, body, href], index) => <SolutionRoute key={title} href={href} index={index}><span>0{index + 1}</span><RouteGlyph route={index} /><div><h3>{title}</h3><p>{body}</p></div><b aria-hidden="true">↗</b></SolutionRoute>)}</div>
      </section>

      <PricingGuide locale={locale} />

      <section id={en ? "approach" : "aanpak"} className={styles.approach}>
        <div><Reveal as="p" className={styles.eyebrow} y={14}>{en ? "Approach" : "Aanpak"}</Reveal><Reveal as="h2" delay={0.06}>{en ? "Scan. Scope. Build. Manage." : "Scan. Scope. Bouw. Beheer."}</Reveal></div>
        <ol data-approach-rail="true">
          <Reveal as="li"><span>01</span><i aria-hidden="true" /><h3>{en ? "See the real work" : "Bekijk het echte werk"}</h3><p>{en ? "We map workflows, data, risks and physical dependencies." : "We brengen werkstromen, data, risico’s en fysieke afhankelijkheden in kaart."}</p></Reveal>
          <Reveal as="li" delay={0.1}><span>02</span><i aria-hidden="true" /><h3>{en ? "Set boundaries" : "Bepaal de grenzen"}</h3><p>{en ? "You receive a practical scope, exclusions and operating model." : "Je krijgt een praktische scope, uitsluitingen en beheermodel."}</p></Reveal>
          <Reveal as="li" delay={0.2}><span>03</span><i aria-hidden="true" /><h3>{en ? "Deliver in stages" : "Lever gefaseerd"}</h3><p>{en ? "We build the agreed system and verify it with the people using it." : "We bouwen het afgesproken systeem en toetsen het met de mensen die het gebruiken."}</p></Reveal>
        </ol>
      </section>

      <section id="ventures" className={styles.ventures}>
        <div className={styles.ventureMark} aria-hidden="true"><span>V</span><i /><i /></div>
        <Reveal><p className={styles.eyebrow}>AIOW Ventures</p><h2>{en ? "Products are not consulting projects." : "Producten zijn geen adviesprojecten."}</h2></Reveal>
        <Reveal delay={0.12}><p>{en ? "Ventures is the separate product-building branch of AIOW. It develops owned propositions; it is not included in a Solutions implementation." : "Ventures is de afzonderlijke producttak van AIOW. Hier ontwikkelen we eigen proposities; dit is niet inbegrepen in een Solutions-implementatie."}</p><Link href={en ? "/en/ventures" : "/ventures"}>{en ? "Visit Ventures" : "Naar Ventures"} ↗</Link></Reveal>
      </section>

      <section className={styles.finalCta}>
        <OperationalField variant="closing" />
        <Reveal className={styles.finalCtaInner} y={36}><p className={styles.eyebrow}>{en ? "A useful first conversation" : "Een nuttig eerste gesprek"}</p><h2>{en ? "Bring one process or one space." : "Neem één proces of één ruimte mee."}</h2><p>{en ? "We will determine what can be built now, what depends on partners or hardware, and what should not be automated." : "We bepalen wat nu gebouwd kan worden, wat van partners of hardware afhangt en wat je beter niet automatiseert."}</p><button className={styles.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></Reveal>
      </section>
    </main>
    <PublicFooter locale={locale} showYear />
    <BookingModal open={booking} onClose={() => setBooking(false)} locale={locale} returnFocus={bookingTrigger.current} />
    <QuoteModal open={quote !== null} onClose={() => setQuote(null)} locale={locale} returnFocus={quoteTrigger.current} calculatorConfig={quote} />
  </div>;
}
