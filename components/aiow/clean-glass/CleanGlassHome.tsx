import type { CSSProperties } from "react";
import Link from "next/link";
import { AiowReveal } from "../AiowReveal";
import { AmbientGuard } from "./AmbientGuard";
import { CleanGlassNav } from "./CleanGlassNav";
import styles from "./CleanGlassHome.module.css";

/**
 * AIOW homepage, clean-glass v2 (DESIGN-DNA.md v2, "Het Oordeel bij Daglicht").
 *
 * Sectie-anatomie (les A2): microlabel, chapter-statement, max 3 regels body,
 * een bewijs-element. Een idee per viewport. Een donkere verdict-sectie als
 * enig contrastmoment (les A8). Score-badge in de nav reist mee (les A1).
 * Content staat volledig in de DOM; reveals zijn progressive enhancement.
 */

const revealOrder = (order: number) => ({ "--reveal-order": order } as CSSProperties);

const axisCards = [
  {
    title: "Founder",
    sub: "Marktkennis en tractie",
    stats: "As 1 van 3",
    line: "Wij investeren in mensen die hun markt al kennen.",
  },
  {
    title: "Venture",
    sub: "AI-waarde en schaalbaarheid",
    stats: "As 2 van 3",
    line: "Een goed idee zonder AI-hefboom blijft alleen een goed idee.",
  },
  {
    title: "Partner fit",
    sub: "Risico en verdienmodel",
    stats: "As 3 van 3",
    line: "Huid in het spel, of we beginnen er niet aan.",
  },
];

const modelStats = [
  { value: "10-25%", label: "omzetdeel in plaats van uurtarief" },
  { value: "48 uur", label: "van aanvraag tot eerlijke uitslag" },
  { value: "3 stappen", label: "intake, twee minuten werk" },
];

const caseCards = [
  {
    title: "Cargo Donkey",
    sub: "B2B verpakking en logistiek, regio Schiphol",
    stats: "Kennispagina's, lokale SEO, offerte-funnel",
    line: "De digitale groeilaag die het bedrijf zelf nooit had gebouwd.",
  },
  {
    title: "OneTap Day",
    sub: "Eigen product, van nul gebouwd",
    stats: "Volledige release-pipeline van Apple en Google",
    line: "Wij vragen van founders niets dat we zelf nog nooit deden.",
  },
];

export function CleanGlassHome() {
  return (
    <main className={styles.page} data-aiow-public-landing="clean-glass-v2">
      <AiowReveal />
      <AmbientGuard />
      <CleanGlassNav journey="scroll" />

      {/* Hero: rustige typografische header (slot 1, voorlopige keuze, zie DESIGN-DNA) */}
      <section className={styles.hero} aria-label="AIOW AI venture partner">
        <div className={styles.heroCopy}>
          <p className="cg-micro" data-reveal>AIOW · AI venture partner</p>
          <h1 data-reveal="wipe">
            Wij bouwen niet voor bedrijven. <em>Wij bouwen mee aan bedrijven.</em>
          </h1>
          <p className={styles.lead} data-reveal style={revealOrder(1)}>
            AIOW toetst je idee of bedrijf zoals een investeerder dat doet, en bouwt alleen
            mee als we er zelf in geloven. Voor een omzetdeel, niet voor een uurtarief.
          </p>
          <div className={styles.heroActions} data-reveal style={revealOrder(2)}>
            <Link className={styles.primary} href="/nl/venture-score-aanvragen">
              Vraag je venture-score aan
            </Link>
            <a className={styles.ghost} href="https://wa.me/31621898039" rel="noopener">
              Liever direct contact? WhatsApp
            </a>
          </div>
        </div>

        <aside className={styles.presence} data-reveal style={revealOrder(2)} aria-label="Spunky, de beoordelaar">
          <div className={styles.orb} data-ambient aria-hidden="true">
            <i />
            <b />
          </div>
          <p className={`${styles.presenceChip} cg-glass`}>
            <span className={styles.liveDot} aria-hidden="true" />
            Spunky · venture intake online
          </p>
        </aside>

        <p className={`${styles.scrollHint} cg-micro`} aria-hidden="true">
          Scroll · de beoordeling begint
        </p>
      </section>

      {/* Hoofdstuk 01: de toets */}
      <section className={styles.chapter} aria-labelledby="chapter-toets">
        <p className="cg-micro" data-reveal>01 · De toets</p>
        <h2 id="chapter-toets" data-reveal="wipe">Eerst het oordeel, dan de bouw.</h2>
        <p className={styles.chapterBody} data-reveal style={revealOrder(1)}>
          Spunky, onze intake-AI, weegt elke aanvraag op drie assen voordat er iets
          gebouwd wordt. We zeggen vaker nee dan ja, en altijd met een concrete tip.
        </p>
        <div className={styles.cardRow}>
          {axisCards.map((card, index) => (
            <article className={styles.card} key={card.title} data-reveal style={revealOrder(index)}>
              <h3>{card.title}</h3>
              <p className={styles.cardSub}>{card.sub}</p>
              <p className={`${styles.cardStats} cg-micro`}>{card.stats}</p>
              <p className={styles.cardLine}>{card.line}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Hoofdstuk 02: het model, stats als kale typografie (les A10) */}
      <section className={styles.chapter} aria-labelledby="chapter-model">
        <p className="cg-micro" data-reveal>02 · Het model</p>
        <h2 id="chapter-model" data-reveal="wipe">Geen uurtarief. Een deel van wat we samen bouwen.</h2>
        <p className={styles.chapterBody} data-reveal style={revealOrder(1)}>
          Bij een sterke case stapt AIOW in als venture partner: wij bouwen product, groei
          en systemen mee, en verdienen alleen als jij verdient.
        </p>
        <dl className={styles.stats}>
          {modelStats.map((stat, index) => (
            <div key={stat.value} data-reveal style={revealOrder(index)}>
              <dt className="cg-micro">{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Hoofdstuk 03: het bewijs */}
      <section className={styles.chapter} aria-labelledby="chapter-bewijs">
        <p className="cg-micro" data-reveal>03 · Het bewijs</p>
        <h2 id="chapter-bewijs" data-reveal="wipe">We bouwen al mee, elke dag.</h2>
        <div className={styles.cardRow} data-two>
          {caseCards.map((card, index) => (
            <article className={styles.card} key={card.title} data-reveal style={revealOrder(index)}>
              <h3>{card.title}</h3>
              <p className={styles.cardSub}>{card.sub}</p>
              <p className={`${styles.cardStats} cg-micro`}>{card.stats}</p>
              <p className={styles.cardLine}>{card.line}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Het verdict: het ene donkere contrastmoment (les A8/B1) */}
      <section className={styles.verdict} id="verdict" aria-labelledby="chapter-verdict">
        <div className={styles.verdictGlow} data-ambient aria-hidden="true" />
        <div className={styles.verdictInner}>
          <p className="cg-micro" data-reveal>04 · Het verdict</p>
          <h2 id="chapter-verdict" data-reveal="wipe">Leg je idee voor. Binnen 48 uur weet je het.</h2>
          <p className={styles.verdictBody} data-reveal style={revealOrder(1)}>
            Drie stappen, twee minuten werk. Geen pitch-theater, geen gratis chatbot:
            een eerlijk oordeel over founder, venture en partner fit.
          </p>
          <div className={styles.verdictActions} data-reveal style={revealOrder(2)}>
            <Link className={styles.verdictCta} href="/nl/venture-score-aanvragen">
              Vraag je venture-score aan
            </Link>
            <a className={styles.verdictAlt} href="mailto:jeroen@aiow.io">
              Of mail direct: jeroen@aiow.io
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>AIOW BV · KvK 71887466 · Bijlmermeerstraat 30, Hoofddorp</p>
        <nav aria-label="Footer">
          <Link href="/nl/kennis">Kennisbank</Link>
          <Link href="/nl/privacy">Privacy</Link>
          <Link href="/nl/terms">Voorwaarden</Link>
        </nav>
      </footer>
    </main>
  );
}
