"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import type { Pillar } from "@/lib/aiow-v1/pillars";
import { BookingModal } from "./BookingModal";
import { PublicHeader } from "./PublicHeader";
import shared from "./AiowV1Homepage.module.css";
import styles from "./PillarPage.module.css";

export function PillarPage({ data }: { data: Pillar }) {
  const [booking, setBooking] = useState(false);
  const bookingTrigger = useRef<HTMLElement | null>(null);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; setBooking(true); }
  return <div className={`${shared.site} ${styles.pillarSite}`}><PublicHeader onBook={openBooking} /><main>
    <nav aria-label="Broodkruimel" className={styles.breadcrumb}><Link href="/">AIOW</Link><span>/</span><Link href="/#oplossingen">Oplossingen</Link><span>/</span><span aria-current="page">{data.title.split(" ").slice(0, 3).join(" ")}</span></nav>
    <header className={styles.hero}><p className={shared.eyebrow}>{data.eyebrow}</p><h1>{data.title}</h1><p className={styles.answer}>{data.answer}</p><p className={styles.intro}>{data.introduction}</p><button className={shared.primaryButton} onClick={openBooking}>Plan een scan</button></header>
    <aside className={styles.truth}><span>Heldere grens</span><p>{data.truth}</p></aside>
    <section className={styles.section}><div className={styles.sectionTitle}><p className={shared.eyebrow}>Waar het nuttig kan zijn</p><h2>Concrete toepassingen</h2></div><div className={styles.useCases}>{data.useCases.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
    <section className={`${styles.section} ${styles.process}`}><div className={styles.sectionTitle}><p className={shared.eyebrow}>Van vraag naar beheer</p><h2>Een werkende route in drie delen</h2></div><ol>{data.process.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></li>)}</ol></section>
    <section className={styles.pricing}><div><p className={shared.eyebrow}>Transparante indicatie</p><h2>{data.pricing.headline}</h2></div><div><ul>{data.pricing.items.map((item) => <li key={item}>{item}</li>)}</ul><p>{data.pricing.note}</p><button className={shared.primaryButton} onClick={openBooking}>Bespreek de scope</button></div></section>
    <section className={styles.section}><div className={styles.sectionTitle}><p className={shared.eyebrow}>Veelgestelde vragen</p><h2>Voor je verder gaat</h2></div><div className={styles.faq}>{data.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
    <section className={styles.related}><p className={shared.eyebrow}>Verder binnen AIOW Solutions</p><div>{data.related.map((item) => <a key={item.href} href={item.href}><h3>{item.title}</h3><p>{item.body}</p><span>Lees verder ↗</span></a>)}</div></section>
    <section className={styles.cta}><h2>Begin met één echte situatie.</h2><p>Neem een werkstroom, gegevensvraag of ruimte mee. We maken duidelijk wat nu haalbaar is, welke afhankelijkheden bestaan en wat buiten scope hoort.</p><button className={shared.primaryButton} onClick={openBooking}>Plan de scan</button></section>
  </main><footer className={shared.footer}><Link href="/" className={shared.logo}><span>AIOW</span><i /></Link><p>AI Operating Workflows</p><div><a href="/privacy">Privacy</a><a href="/llms.txt">llms.txt</a></div></footer><BookingModal open={booking} onClose={() => setBooking(false)} returnFocus={bookingTrigger.current} /></div>;
}
