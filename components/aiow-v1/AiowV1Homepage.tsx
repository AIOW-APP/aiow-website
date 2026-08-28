"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { BookingModal } from "./BookingModal";
import { PriceCalculator } from "./PriceCalculator";
import { PricingGuide } from "./PricingGuide";
import { PublicHeader } from "./PublicHeader";
import styles from "./AiowV1Homepage.module.css";

export function AiowV1Homepage({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const [booking, setBooking] = useState(false); const en = locale === "en";
  const bookingTrigger = useRef<HTMLElement | null>(null);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; setBooking(true); }
  const solutions = en ? [
    ["AI automation · Dutch page", "Turn repeated knowledge work into controlled workflows with human checkpoints.", "/ai-automatisering"],
    ["Local AI · Dutch page", "Run sensitive AI workloads closer to your own data and infrastructure.", "/lokale-ai"],
    ["Smart Office · Dutch page", "Connect spaces, signals and workflows—implementation and hardware scoped separately.", "/smart-office"],
    ["AIOW Home · Dutch page", "A partner-dependent route for practical home intelligence, without pretending hardware is included.", "/home"],
  ] : [
    ["AI-automatisering", "Maak herhaald kenniswerk tot controleerbare workflows met menselijke beslismomenten.", "/ai-automatisering"],
    ["Lokale AI", "Breng gevoelige AI-taken dichter bij je eigen data en infrastructuur.", "/lokale-ai"],
    ["Smart Office", "Verbind ruimte, signalen en werkstromen—implementatie en hardware apart gescoped.", "/smart-office"],
    ["AIOW Home", "Een partner-afhankelijke route naar praktische woningintelligentie, zonder te doen alsof hardware inbegrepen is.", "/home"],
  ];
  return <div className={styles.site}><PublicHeader locale={locale} onBook={openBooking} />
    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}>{en ? "AI, installed with precision" : "AI, precies geïnstalleerd"}</p><h1>{en ? <>AI for processes, <em>buildings and homes.</em></> : <>AI voor processen, <em>gebouwen en woningen.</em></>}</h1><p className={styles.lead}>{en ? "AI for business processes, buildings and homes — designed and managed by one party. Start with a transparent indication; set the final scope after a scan." : "AI voor bedrijfsprocessen, gebouwen en woningen — ontworpen en beheerd door één partij. Begin met een transparante indicatie; bepaal de definitieve scope na een scan."}</p><div className={styles.heroLinks}><button className={styles.primaryButton} onClick={openBooking}>{en ? "Book a scan" : "Plan een scan"}</button><Link href="/tarieven" hrefLang="nl">{en ? "Rates (Dutch)" : "Bekijk alle tarieven"} ↓</Link></div><dl className={styles.heroFacts}><div><dt>{en ? "Start" : "Vanaf"}</dt><dd>€ 2.950</dd></div><div><dt>{en ? "First step" : "Eerste stap"}</dt><dd>{en ? "Practical scan" : "Praktische scan"}</dd></div><div><dt>{en ? "Terms" : "Voorwaarden"}</dt><dd>{en ? "Published" : "Gepubliceerd"}</dd></div></dl></div>
        <PriceCalculator locale={locale} onBook={openBooking} />
      </section>
      <section className={styles.statement}><p>{en ? "Not another AI presentation." : "Geen volgende AI-presentatie."}</p><h2>{en ? "A working system with clear boundaries, ownership and operating costs." : "Een werkend systeem met duidelijke grenzen, eigenaarschap en beheerkosten."}</h2></section>
      <section id={en ? "solutions" : "oplossingen"} className={styles.solutions}><div className={styles.sectionHead}><p className={styles.eyebrow}>{en ? "Solutions" : "Oplossingen"}</p><h2>{en ? "Four routes. One measured way of working." : "Vier routes. Eén beheerste werkwijze."}</h2><p>{en ? "Choose the environment where AI must become useful. Every route starts with boundaries and a real implementation scope." : "Kies de omgeving waarin AI nuttig moet worden. Elke route begint bij grenzen en een echte implementatiescope."}</p></div><div className={styles.solutionList}>{solutions.map(([title, body, href], index) => <Link href={href} hrefLang={en ? "nl" : undefined} key={title} className={styles.solution}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div><b aria-hidden="true">↗</b></Link>)}</div></section>
      <PricingGuide locale={locale} />
      <section id={en ? "approach" : "aanpak"} className={styles.approach}><div><p className={styles.eyebrow}>{en ? "Approach" : "Aanpak"}</p><h2>{en ? "Scan. Scope. Build. Manage." : "Scan. Scope. Bouw. Beheer."}</h2></div><ol><li><span>01</span><h3>{en ? "See the real work" : "Bekijk het echte werk"}</h3><p>{en ? "We map workflows, data, risks and physical dependencies." : "We brengen werkstromen, data, risico’s en fysieke afhankelijkheden in kaart."}</p></li><li><span>02</span><h3>{en ? "Set boundaries" : "Bepaal de grenzen"}</h3><p>{en ? "You receive a practical scope, exclusions and operating model." : "Je krijgt een praktische scope, uitsluitingen en beheermodel."}</p></li><li><span>03</span><h3>{en ? "Deliver in stages" : "Lever gefaseerd"}</h3><p>{en ? "We build the agreed system and verify it with the people using it." : "We bouwen het afgesproken systeem en toetsen het met de mensen die het gebruiken."}</p></li></ol></section>
      <section id="ventures" className={styles.ventures}><div><p className={styles.eyebrow}>AIOW Ventures</p><h2>{en ? "Products are not consulting projects." : "Producten zijn geen adviesprojecten."}</h2></div><div><p>{en ? "Ventures is the separate product-building branch of AIOW. It develops owned propositions; it is not included in a Solutions implementation." : "Ventures is de afzonderlijke producttak van AIOW. Hier ontwikkelen we eigen proposities; dit is niet inbegrepen in een Solutions-implementatie."}</p><Link href="/ventures" hrefLang={en ? "nl" : undefined}>{en ? "Visit Ventures · Dutch page" : "Naar Ventures"} ↗</Link></div></section>
      <section className={styles.finalCta}><p className={styles.eyebrow}>{en ? "A useful first conversation" : "Een nuttig eerste gesprek"}</p><h2>{en ? "Bring one process or one space." : "Neem één proces of één ruimte mee."}</h2><p>{en ? "We will determine what can be built now, what depends on partners or hardware, and what should not be automated." : "We bepalen wat nu gebouwd kan worden, wat van partners of hardware afhangt en wat je beter niet automatiseert."}</p><button className={styles.primaryButton} onClick={openBooking}>{en ? "Book the scan" : "Plan de scan"}</button></section>
    </main><footer className={styles.footer}><Link href={en ? "/en" : "/"} className={styles.logo}><span>AIOW</span><i /></Link><p>AI Operating Workflows · {new Date().getFullYear()}</p><div><Link href="/tarieven" hrefLang="nl">{en ? "Rates (Dutch)" : "Tarieven"}</Link><a href="/privacy">Privacy</a><a href="/llms.txt">llms.txt</a></div></footer><BookingModal open={booking} onClose={() => setBooking(false)} locale={locale} returnFocus={bookingTrigger.current} />
  </div>;
}
