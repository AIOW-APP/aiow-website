"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { track } from "@/core/analytics/client";
import { BookingModal } from "./BookingModal";
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

export function AiowV1Homepage({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const [booking, setBooking] = useState(false);
  const en = locale === "en";
  const [quote, setQuote] = useState<CalculatorQuoteConfig | null>(null);
  const bookingTrigger = useRef<HTMLElement | null>(null);
  const quoteTrigger = useRef<HTMLElement | null>(null);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; void track("scan_cta_clicked", { experiment: null }); setBooking(true); }
  function openQuote(event: MouseEvent<HTMLButtonElement>, configuration: CalculatorQuoteConfig) { quoteTrigger.current = event.currentTarget; void track("quote_opened", {}); setQuote(configuration); }
  const solutions = en ? [
    ["AI automation", "Recurring office work — intake, files and planning — is prepared for review. A colleague decides.", "/en/ai-automation"],
    ["Local AI", "Sensitive information stays closer to your own environment. We set it up and keep it working.", "/en/local-ai"],
    ["Smart Office", "Your building turns deviations into contextual tasks. Your operator decides; your installer remains your installer.", "/en/smart-office"],
    ["AIOW Home", "Your home follows house rules you understand. Hardware and installation stay with your installer or our partner.", "/en/home"],
  ] : [
    ["AI-automatisering", "Terugkerend kantoorwerk — intake, dossiers en planning — staat klaar voor controle. Een medewerker beslist.", "/ai-automatisering"],
    ["Lokale AI", "Gevoelige informatie blijft dichter bij uw eigen omgeving. Wij richten het in en houden het werkend.", "/lokale-ai"],
    ["Smart Office", "Uw pand zet afwijkingen om in taken met context. Uw beheerder beslist; uw installateur blijft uw installateur.", "/smart-office"],
    ["AIOW Home", "Uw woning volgt huisregels die u begrijpt. Hardware en installatie blijven bij uw installateur of onze partner.", "/home"],
  ];

  return <div className={styles.site}>
    <PublicHeader locale={locale} primaryAction="price" />
    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{en ? "AIOW · Hoofddorp · all of the Netherlands" : "AIOW · Hoofddorp · heel Nederland"}</p>
          <h1>{en ? <>AI that works for you, <em>without you having to understand AI.</em></> : <>AI die voor u werkt, <em>zonder dat u AI hoeft te begrijpen.</em></>}</h1>
          <p className={styles.lead}>{en ? "For business processes, office buildings and homes. AIOW designs, installs and maintains the system; you keep the final say. Your price is right here." : "Voor bedrijfsprocessen, kantoorpanden en woningen. AIOW ontwerpt, installeert en beheert het systeem; u houdt het laatste woord. Uw prijs staat hiernaast."}</p>
        </div>
        <div className={styles.heroInstrument} data-premium-instrument="calculator">
          <OperationalField />
          <div className={styles.instrumentPlate} aria-hidden="true"><span>01</span><i /><span>WP / 2.0</span></div>
          <PriceCalculator locale={locale} onQuote={openQuote} />
        </div>
      </section>

      <section className={styles.statement} aria-labelledby="experience-heading">
        <OperationalField variant="statement" />
        <div className={styles.statementRail} aria-hidden="true"><span>01</span><i /><span>04</span></div>
        <div className={styles.statementIntro}><p>{en ? "What it feels like" : "Zo voelt het"}</p><h2 id="experience-heading">{en ? "You notice very little. That is the point." : "U merkt er weinig van. Dat is de bedoeling."}</h2><Link href={en ? "/en/capabilities" : "/mogelijkheden"}>{en ? "See how it works, step by step" : "Bekijk stap voor stap hoe dat werkt"} ↗</Link></div>
        <ul className={styles.storyList}>
          <li>{en ? "A request arrives and is ready as a task, with everything attached. Your colleague decides." : "Een aanvraag komt binnen en staat klaar als taak, met alles erbij. Uw medewerker beslist."}</li>
          <li>{en ? "Your building reports what is unusual and what needs attention. Your operator chooses." : "Uw pand meldt wat afwijkt en wat er te doen is. Uw beheerder kiest."}</li>
          <li>{en ? "Your home follows your agreements, not isolated gadgets. You can always intervene." : "Uw woning volgt uw afspraken, niet losse gadgets. U kunt altijd ingrijpen."}</li>
        </ul>
      </section>

      <section id={en ? "solutions" : "oplossingen"} className={styles.solutions}>
        <div className={styles.sectionHead}><p className={styles.eyebrow}>{en ? "Solutions" : "Oplossingen"}</p><h2>{en ? "Four routes. One measured way of working." : "Vier routes. Eén beheerste werkwijze."}</h2><p>{en ? "Choose the environment where AI must become useful. Every route starts with boundaries and a real implementation scope." : "Kies de omgeving waarin AI nuttig moet worden. Elke route begint bij grenzen en een echte implementatiescope."}</p></div>
        <div className={styles.solutionList}>{solutions.map(([title, body, href], index) => <Link href={href} key={title} className={styles.solution} data-route={index + 1}><span>0{index + 1}</span><RouteGlyph route={index} /><div><h3>{title}</h3><p>{body}</p></div><b aria-hidden="true">↗</b></Link>)}</div>
      </section>

      <PricingGuide locale={locale} />

      <section id={en ? "approach" : "aanpak"} className={styles.approach}>
        <div><p className={styles.eyebrow}>{en ? "Approach" : "Aanpak"}</p><h2>{en ? "Scan. Scope. Build. Manage." : "Scan. Scope. Bouw. Beheer."}</h2></div>
        <ol data-approach-rail="true">
          <li><span>01</span><i aria-hidden="true" /><h3>{en ? "See the real work" : "Bekijk het echte werk"}</h3><p>{en ? "We map workflows, data, risks and physical dependencies." : "We brengen werkstromen, data, risico’s en fysieke afhankelijkheden in kaart."}</p></li>
          <li><span>02</span><i aria-hidden="true" /><h3>{en ? "Set boundaries" : "Bepaal de grenzen"}</h3><p>{en ? "You receive a practical scope, exclusions and operating model." : "U krijgt een praktische scope, uitsluitingen en beheermodel."}</p></li>
          <li><span>03</span><i aria-hidden="true" /><h3>{en ? "Deliver in stages" : "Lever gefaseerd"}</h3><p>{en ? "We build the agreed system and verify it with the people using it." : "We bouwen het afgesproken systeem en toetsen het met de mensen die het gebruiken."}</p></li>
          <li><span>04</span><i aria-hidden="true" /><h3>{en ? "Maintain and improve" : "Beheer en verbeter"}</h3><p>{en ? "We monitor, maintain and adjust within agreed boundaries at the published monthly rate." : "We bewaken, onderhouden en passen aan binnen afgesproken grenzen, tegen het gepubliceerde maandtarief."}</p></li>
        </ol>
      </section>

      <section className={styles.trustLine} aria-label={en ? "Verified AIOW company facts" : "Geverifieerde bedrijfsgegevens AIOW"}>
        <p>AIOW B.V. <span>·</span> KvK 71887466 <span>·</span> Bijlmermeerstraat 30, 2131 HC Hoofddorp <span>·</span> {en ? "Published rates" : "Tarieven gepubliceerd"} <span>·</span> {en ? "A scan with a person" : "Scan met een mens"}</p>
        <Link href={en ? "/en/company" : "/bedrijfsgegevens"}>{en ? "Company & contact" : "Bedrijf & contact"} ↗</Link>
      </section>

      <section className={styles.finalCta}>
        <OperationalField variant="closing" />
        <div className={styles.finalCtaInner}><p className={styles.eyebrow}>{en ? "A useful first conversation" : "Een nuttig eerste gesprek"}</p><h2>{en ? "Bring one process or one space." : "Neem één proces of één ruimte mee."}</h2><p>{en ? "We will determine what can be built now, what depends on partners or hardware, and what should not be automated." : "We bepalen wat nu gebouwd kan worden, wat van partners of hardware afhangt en wat u bewust niet automatiseert."}</p><button className={styles.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></div>
      </section>
    </main>
    <PublicFooter locale={locale} showYear />
    <BookingModal open={booking} onClose={() => setBooking(false)} locale={locale} returnFocus={bookingTrigger.current} />
    <QuoteModal open={quote !== null} onClose={() => setQuote(null)} locale={locale} returnFocus={quoteTrigger.current} calculatorConfig={quote} />
  </div>;
}
