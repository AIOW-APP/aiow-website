import Link from "next/link";
import type { Metadata } from "next";
import styles from "./PortalPage.module.css";

export const metadata: Metadata = {
  title: "AIOW Klantportal — intake, offerte en planning",
  description: "Manual-safe preview van het AIOW klantportaal: interesse, persoonlijke portalroute, scan, offerte, akkoordstatus en planning zonder live automatisering.",
  robots: { index: false, follow: false },
};

const portal = {
  company: "Voorbeeldbedrijf BV",
  owner: "Klantportal demo",
  status: "Interesse ontvangen — persoonlijke portal voorbereid",
  completion: "56% compleet",
  package: "Persoonlijke AI Starter",
  setup: "vanaf €2.500",
  maintenance: "+ €650/mnd onderhoud",
  hourly: "extra werk vanaf €175/u",
  assumptions: ["1 duidelijke AI-start", "Onderhoud apart van extra service", "Geen live data zonder akkoord", "Planning pas na scope"],
};

const journey = [
  ["1", "Interesse", "Klant stuurt WhatsApp of aanvraag. AIOW maakt handmatig een persoonlijke portalroute aan."],
  ["2", "Mini-intake", "Doel, eerste proces, bedrijfscontext, documenten en risico’s worden compact verzameld."],
  ["3", "Offerte", "Setup, maandonderhoud, uurtarief, scope, datagrens en aannames staan helder bij elkaar."],
  ["4", "Planning", "Na akkoord volgen intakecall, datagrenssessie, installatie en eerste AI-overdracht."],
];

const slots = [
  ["Intake call", "30 min", "Doel, eerste proces en gewenste AI-rol"],
  ["Datagrens sessie", "45 min", "Wat mag cloud, wat blijft privé, wie keurt goed"],
  ["Installatie kickoff", "60 min", "Kennis, tools, tone of voice en eerste usecase"],
];

export default function PortalPreviewPage() {
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><strong>AIOW Klantportal</strong><small>persoonlijke klantreis · manual-safe v1</small></Link>
      <nav aria-label="Portal navigation"><a href="#route">Route</a><a href="#offerte">Offerte</a><a href="#planning">Planning</a><a href="#status">Status</a><Link href="/">Terug naar AIOW</Link></nav>
    </header>

    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>Eigen portal zodra er interesse is</p>
        <h1>Van eerste interesse naar jouw persoonlijke AI-installatie.</h1>
        <p>Iedere geïnteresseerde klant krijgt één duidelijke plek voor intake, offerte, scope, datagrens, planning en status. Geen losse mail-chaos, geen onduidelijke prijsverwachting, wel een rustige klantreis.</p>
        <div className={styles.actions}><a className={styles.primary} href="#route">Bekijk klantreis</a><a className={styles.secondary} href="#offerte">Bekijk offerteblok</a></div>
      </div>
      <aside className={styles.portalCard} aria-label="Portal summary">
        <div className={styles.statusLine}><span>{portal.company}</span><span>{portal.completion}</span></div>
        <div className={styles.progress} aria-hidden="true"><i /></div>
        <div className={styles.quoteBox}>
          <span className={styles.eyebrow}>{portal.status}</span>
          <h2>{portal.package}</h2>
          <p>Een persoonlijke AI-medewerker die je bedrijf leert kennen. AIOW helpt met installeren; daarna bepaalt de ondernemer zelf hoeveel werk hij eruit haalt.</p>
          <div className={styles.price}><span>Setup</span><strong>{portal.setup}</strong></div>
          <div className={styles.price}><span>Maandelijks</span><strong>{portal.maintenance}</strong></div>
          <div className={styles.pills}>{portal.assumptions.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </aside>
    </section>

    <section id="route" className={styles.section}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>Klantportal-route</p><h2>Een simpele flow voor kleine ondernemers én schaalbaar voor grotere klanten.</h2><p>De portal moet niet voelen als enterprise-software. Het moet antwoord geven op: wat krijg ik, wat kost het, wat moet ik aanleveren, wanneer starten we en wat valt buiten onderhoud?</p></div>
      <div className={styles.grid3}>{journey.slice(0,3).map(([n, title, text]) => <article className={styles.card} key={n}><span className={styles.num}>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className={styles.grid2} style={{ marginTop: "1rem" }}><article className={styles.card}><span className={styles.num}>{journey[3][0]}</span><h3>{journey[3][1]}</h3><p>{journey[3][2]}</p></article><article className={styles.card}><span className={styles.num}>€</span><h3>Prijsverwachting helder</h3><p>Setup vanaf €2.500. Maandbedrag is technisch onderhoud. Extra service, nieuwe workflows en begeleiding worden apart op uurbasis gefactureerd.</p></article></div>
    </section>

    <section id="offerte" className={styles.section}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>Offerte-flow</p><h2>De klant ziet precies waar hij ja tegen zegt.</h2><p>Top-1%-gevoel zit hier in rust en duidelijkheid: scope, prijs, aannames, datagrens, planning en blokkers moeten vóór akkoord zichtbaar zijn.</p></div>
      <div className={styles.grid3}>
        <article className={styles.card}><span className={styles.num}>1</span><h3>Scope</h3><p>Eerste AI-usecase, betrokken systemen, bedrijfskennis, documenten, tone of voice en expliciet buiten scope.</p></article>
        <article className={styles.card}><span className={styles.num}>2</span><h3>Kosten</h3><p>{portal.setup} setup, {portal.maintenance}, {portal.hourly}. Geen suggestie van onbeperkte service.</p></article>
        <article className={styles.card}><span className={styles.num}>3</span><h3>Datagrens</h3><p>Wat lokaal blijft, wat cloud mag gebruiken, waar approval nodig is en welke externe acties nooit automatisch gebeuren.</p></article>
      </div>
    </section>

    <section id="planning" className={styles.section}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>Planning na akkoord</p><h2>Niet zomaar een agenda-link, maar een veilige projectstart.</h2><p>Planning komt pas ná duidelijke scope. Zo voorkom je losse gesprekken zonder prijs-, privacy- of verwachtingskader.</p></div>
      <div className={styles.grid2}>{slots.map(([name, duration, note]) => <div className={styles.slot} key={name}><div><strong>{name}</strong><small>{note}</small></div><span>{duration}</span></div>)}</div>
    </section>

    <section id="status" className={styles.section}>
      <div className={styles.sectionHead}><p className={styles.eyebrow}>Implementatiepad</p><h2>Nu veilig tonen. Later pas automatiseren.</h2></div>
      <div className={styles.grid2}>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}><span className={styles.num}>✓</span><div><h3>Nu gebouwd</h3><p>Manual-safe klantportal met persoonlijke klantreis, offerteblok, prijsverwachting, planning en statusrail.</p></div></div>
          <div className={styles.timelineItem}><span className={styles.num}>→</span><div><h3>Volgende interne stap</h3><p>Admin quote builder met lokale/mock data en unieke portalroutes per geïnteresseerde klant.</p></div></div>
        </div>
        <div className={`${styles.card} ${styles.warning}`}><h3>Blijft geblokkeerd tot Richard akkoord geeft</h3><p>Live database/auth, magic links, echte offerte-acceptatie, betalingen, WhatsApp Business-webhook, agenda-integratie en juridische definitieve teksten.</p></div>
      </div>
    </section>
    <footer className={styles.footer}>AIOW Klantportal · manual-safe preview · geen betaling, geen externe automatisering, geen echte acceptatie.</footer>
  </main>;
}
