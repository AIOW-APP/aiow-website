"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import type { Pillar } from "@/lib/aiow-v1/pillars";
import type { AiowLocale } from "@/lib/aiow-v1/locale";
import { BookingModal } from "./BookingModal";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import shared from "./AiowV1Homepage.module.css";
import styles from "./PillarPage.module.css";

export function PillarPage({ data, locale = "nl" }: { data: Pillar; locale?: AiowLocale }) {
  const [booking, setBooking] = useState(false); const en = locale === "en";
  const bookingTrigger = useRef<HTMLElement | null>(null);
  function openBooking(event: MouseEvent<HTMLButtonElement>) { bookingTrigger.current = event.currentTarget; setBooking(true); }
  return <div className={`${shared.site} ${styles.pillarSite}`}><PublicHeader locale={locale} onBook={openBooking} /><main>
    <nav aria-label={en ? "Breadcrumb" : "Broodkruimel"} className={styles.breadcrumb}><Link href={en ? "/en" : "/"}>AIOW</Link><span>/</span><Link href={en ? "/en#solutions" : "/#oplossingen"}>{en ? "Solutions" : "Oplossingen"}</Link><span>/</span><span aria-current="page">{data.title.split(" ").slice(0, 3).join(" ")}</span></nav>
    <header className={styles.hero}><p className={shared.eyebrow}>{data.eyebrow}</p><h1>{data.title}</h1><p className={styles.answer}>{data.answer}</p><p className={styles.intro}>{data.introduction}</p><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></header>
    <aside className={styles.truth}><span>{en ? "Clear boundary" : "Heldere grens"}</span><p>{data.truth}</p></aside>
    <section className={styles.section}><div className={styles.sectionTitle}><p className={shared.eyebrow}>{en ? "Where it can be useful" : "Waar het nuttig kan zijn"}</p><h2>{en ? "Practical applications" : "Concrete toepassingen"}</h2></div><div className={styles.useCases}>{data.useCases.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
    <section className={`${styles.section} ${styles.process}`}><div className={styles.sectionTitle}><p className={shared.eyebrow}>{en ? "From question to management" : "Van vraag naar beheer"}</p><h2>{en ? "A working route in three parts" : "Een werkende route in drie delen"}</h2></div><ol>{data.process.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></li>)}</ol></section>
    <section className={styles.pricing}><div><p className={shared.eyebrow}>{en ? "Transparent indication" : "Transparante indicatie"}</p><h2>{data.pricing.headline}</h2></div><div><ul>{data.pricing.items.map((item) => <li key={item}>{item}</li>)}</ul><p>{data.pricing.note}</p><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></div></section>
    <section className={styles.section}><div className={styles.sectionTitle}><p className={shared.eyebrow}>{en ? "Frequently asked questions" : "Veelgestelde vragen"}</p><h2>{en ? "Before you continue" : "Voor je verder gaat"}</h2></div><div className={styles.faq}>{data.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
    <section className={styles.related}><p className={shared.eyebrow}>{en ? "More within AIOW Solutions" : "Verder binnen AIOW Solutions"}</p><div>{data.related.map((item) => <Link key={item.href} href={item.href}><h3>{item.title}</h3><p>{item.body}</p><span>{en ? "Read more" : "Lees verder"} ↗</span></Link>)}</div></section>
    <section className={styles.cta}><h2>{en ? "Start with one real situation." : "Begin met één echte situatie."}</h2><p>{en ? "Bring a workflow, a data question or a space. We clarify what is feasible now, which dependencies exist and what belongs outside the scope." : "Neem een werkstroom, gegevensvraag of ruimte mee. We maken duidelijk wat nu haalbaar is, welke afhankelijkheden bestaan en wat buiten scope hoort."}</p><button className={shared.primaryButton} onClick={openBooking}>{en ? "Request a scan" : "Vraag een scan aan"}</button></section>
  </main><PublicFooter locale={locale} /><BookingModal open={booking} onClose={() => setBooking(false)} locale={locale} returnFocus={bookingTrigger.current} /></div>;
}
