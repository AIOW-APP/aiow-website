"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import type { PricingContext } from "@/lib/aiow-v1/pricing-contexts";
import { BookingModal } from "./BookingModal";
import { PublicHeader } from "./PublicHeader";
import shared from "./AiowV1Homepage.module.css";
import styles from "./PricingContextPage.module.css";

export function PricingContextPage({ context }: { context: PricingContext }) {
  const [booking, setBooking] = useState(false);
  const bookingTrigger = useRef<HTMLElement | null>(null);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; setBooking(true); }
  return <div className={`${shared.site} ${styles.site}`}>
    <PublicHeader onBook={openBooking} />
    <main>
      <nav className={styles.breadcrumb} aria-label="Kruimelpad"><Link href="/">AIOW</Link><span>/</span><Link href="/tarieven">Tarieven</Link><span>/</span><span>{context.labelNl}</span></nav>
      <header className={styles.hero}><p className={styles.kicker}>{context.category === "business" ? "Bedrijfscontext" : "Gebouwcontext"}</p><h1>{context.title}</h1><p>{context.introduction}</p><div><a href="#toepassingen">Bekijk toepassingen ↓</a><button className={shared.primaryButton} onClick={openBooking}>Plan de kansenscan</button></div></header>
      <section id="toepassingen" className={styles.section}><div className={styles.sectionHead}><p>Concreet inzetbaar</p><h2>Drie workflows om tijdens de scan te toetsen.</h2></div><div className={styles.uses}>{context.automations.map((item,index)=><article key={item.title}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section className={`${styles.section} ${styles.advice}`}><div><p>Pakketadvies</p><h2>{context.packageLabel}</h2></div><p>{context.advice}</p></section>
      <section className={styles.section} aria-labelledby="calculation-title"><div className={styles.sectionHead}><p>Transparant gerekend</p><h2 id="calculation-title">{context.calculationTitle}</h2></div><div className={styles.calculation}><ol>{context.calculation.map((step)=><li key={step}>{step}</li>)}</ol><strong>{context.calculationTotal}</strong><p>Excl. btw, hardware, fysieke installatie en cloud-, AI- en leveranciersgebruik. Definitieve scope en prijs volgen na de scan.</p></div></section>
      <section className={`${styles.section} ${styles.links}`}><div><p>Verder beoordelen</p><h2>Regels, grenzen en technische context.</h2></div><nav aria-label={`Relevante links voor ${context.labelNl}`}>{context.links.map(link=><Link key={link.href} href={link.href}>{link.label} ↗</Link>)}<Link href="/tarieven">Volledige tarieven en voorwaarden ↗</Link></nav></section>
      <section className={styles.cta}><p>Geen voorspelde uitkomst</p><h2>Begin met het echte proces, gebouw of plan.</h2><p>De voorbeelden beschrijven mogelijke automatiseringen en gepubliceerde rekenregels, geen gegarandeerde resultaten.</p><button className={shared.primaryButton} onClick={openBooking}>Plan de kansenscan</button></section>
    </main>
    <footer className={shared.footer}><Link href="/" className={shared.logo}><span>AIOW</span><i /></Link><p>AI Operating Workflows</p><div><Link href="/tarieven">Tarieven</Link><Link href="/privacy">Privacy</Link><Link href="/llms.txt">llms.txt</Link></div></footer>
    <BookingModal open={booking} onClose={()=>setBooking(false)} returnFocus={bookingTrigger.current} />
  </div>;
}
