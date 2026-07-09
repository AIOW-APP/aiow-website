import type { CSSProperties } from "react";
import Link from "next/link";
import { AiowReveal } from "../AiowReveal";
import { AmbientGuard } from "./AmbientGuard";
import { CleanGlassNav } from "./CleanGlassNav";
import { LivingOrb } from "./LivingOrb";
import { WegingConductor } from "./WegingConductor";
import styles from "./CleanGlassHome.module.css";

/**
 * AIOW homepage, clean-glass v2.1: "De Weging" (DESIGN-DNA.md).
 *
 * De homepage is het oordeel zelf: dossier #217 (voorbeeldweging, samengesteld
 * uit echte aanvragen) komt binnen in de hero en wordt per hoofdstuk gewogen op
 * de drie assen. Het weeginstrument in de nav telt zichtbaar en omkeerbaar mee
 * (WegingConductor), de orb leest mee (LivingOrb), en de pagina eindigt op het
 * verdict: nee, met een concrete tip, en de draai naar de bezoeker.
 *
 * Content staat volledig in de DOM met de eindstand als default; alle beweging
 * is progressive enhancement (reveal-gate, les B2/A12, reduced-motion compleet).
 */

const revealOrder = (order: number) => ({ "--reveal-order": order } as CSSProperties);

const DOSSIER = "#217";

const chapters = [
  {
    id: "founder",
    label: "01 · As 1: de founder",
    statement: "Eerst de mens, dan het idee.",
    body:
      "Spunky, onze intake-AI, begint waar elke investeerder begint: kent deze founder " +
      "de markt, en is er al iets bewezen? Dossier #217 scoort hier sterk.",
    card: {
      title: `De founder van ${DOSSIER}`,
      sub: "Twaalf jaar planning bij verladers, tweede bedrijf",
      stats: "9 pilotklanten · eigen netwerk · kent haar markt",
      line: "Wie zijn markt zo kent, hoeft niet te pitchen.",
    },
    weight: 28,
    max: 33,
    verdictNote: "sterk",
  },
  {
    id: "venture",
    label: "02 · As 2: de venture",
    statement: "Een goed idee zonder AI-hefboom blijft alleen een goed idee.",
    body:
      "De tweede as weegt of AI het product draagt of alleen versiert. Bij #217 zit de " +
      "AI in de rapportage, niet in de planning zelf. Daar knelt het.",
    card: {
      title: `Het product van ${DOSSIER}`,
      sub: "Planningstool voor verladers, met AI-rapportagelaag",
      stats: "AI beschrijft het werk · maar plant niets zelf",
      line: "Een verslag van gisteren is geen hefboom voor morgen.",
    },
    weight: 17,
    max: 33,
    verdictNote: "hier knelt het",
  },
  {
    id: "partner-fit",
    label: "03 · As 3: partner fit",
    statement: "Huid in het spel, of we beginnen er niet aan.",
    body:
      "AIOW werkt niet voor een uurtarief maar voor een omzetdeel: wij verdienen alleen " +
      "als jij verdient. De derde as weegt of dat model voor beide kanten klopt.",
    card: {
      title: `${DOSSIER} en het model`,
      sub: "Bereid tot omzetdeel, roadmap deels belegd",
      stats: "Omzetdeel akkoord · bouwruimte beperkt",
      line: "Gedeeld risico werkt alleen als er ruimte is om te bouwen.",
    },
    weight: 21,
    max: 34,
    verdictNote: "voldoende",
  },
] as const;

const modelStats = [
  { value: "10-25%", label: "omzetdeel in plaats van uurtarief" },
  { value: "48 uur", label: "van aanvraag tot eerste oordeel" },
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
    <main className={styles.page} data-aiow-public-landing="clean-glass-v2.1">
      <AiowReveal />
      <AmbientGuard />
      <WegingConductor />
      <CleanGlassNav journey="scroll" />

      {/* Hero: de aanvraag komt binnen (slot 1) */}
      <section className={styles.hero} aria-label="AIOW AI venture partner">
        <div className={styles.heroCopy}>
          <p className="cg-micro" data-reveal>AIOW · AI venture partner</p>
          <h1 data-reveal="wipe">
            Wij bouwen niet voor bedrijven. <em>Wij bouwen mee aan bedrijven.</em>
          </h1>
          <p className={styles.lead} data-reveal style={revealOrder(1)}>
            AIOW toetst elk idee zoals een investeerder dat doet, en bouwt alleen mee als
            we er zelf in geloven. Hieronder ligt net een aanvraag op tafel. Kijk mee hoe
            wij wegen.
          </p>
          <div className={styles.heroActions} data-reveal style={revealOrder(2)}>
            <Link className={styles.primary} href="/nl/venture-score-aanvragen">
              Vraag je venture-score aan
            </Link>
            <a className={styles.ghost} href="https://wa.me/31621898039" rel="noopener">
              Liever direct contact? WhatsApp
            </a>
          </div>
          <ul className={styles.heroProof} data-reveal style={revealOrder(3)} aria-label="Controleerbaar bewijs over AIOW">
            <li><strong>AIOW BV</strong><span>KvK 71887466</span></li>
            <li><strong>Cargo Donkey</strong><span>gebouwde B2B-groeilaag</span></li>
            <li><strong>OneTap Day</strong><span>eigen product en release-pipeline</span></li>
          </ul>
        </div>

        <aside className={styles.presence} data-reveal style={revealOrder(2)} aria-label="Spunky, de beoordelaar">
          <LivingOrb />
          <p className={`${styles.presenceChip} cg-glass`}>
            <span className={styles.liveDot} aria-hidden="true" />
            Voorbeeldweging {DOSSIER} · demonstratie van ons model
          </p>
          <p className={`${styles.presenceSub} cg-micro`}>
            Planningstool voor verladers · fictief dossier, echte werkwijze
          </p>
        </aside>

        <p className={`${styles.scrollHint} cg-micro`} aria-hidden="true">
          Scroll · de weging begint
        </p>
      </section>

      {/* Drie assen, drie weegmomenten */}
      {chapters.map((chapter, index) => (
        <section className={styles.chapter} key={chapter.id} aria-labelledby={`chapter-${chapter.id}`}>
          <p className="cg-micro" data-reveal>{chapter.label}</p>
          <h2 id={`chapter-${chapter.id}`} data-reveal="wipe">{chapter.statement}</h2>
          <p className={styles.chapterBody} data-reveal style={revealOrder(1)}>
            {chapter.body}
          </p>

          <article className={styles.card} data-reveal style={revealOrder(2)}>
            <h3>{chapter.card.title}</h3>
            <p className={styles.cardSub}>{chapter.card.sub}</p>
            <p className={`${styles.cardStats} cg-micro`}>{chapter.card.stats}</p>
            <p className={styles.cardLine}>{chapter.card.line}</p>
          </article>

          {/* Het weegmoment: sentinel voor de conductor, eindstand in de DOM */}
          <p className={styles.weging} data-weging={chapter.weight}>
            <span className={styles.wegingRail} aria-hidden="true">
              <i style={{ "--w": chapter.weight / chapter.max } as CSSProperties} />
            </span>
            <span className={`${styles.wegingLabel} cg-micro`}>
              Weging {index + 1} van 3 · {chapter.id.replace("-", " ")}
            </span>
            <b className={styles.wegingDelta}>+{chapter.weight}</b>
            <span className={`${styles.wegingNote} cg-micro`}>{chapter.verdictNote}</span>
          </p>

          {/* Het model hoort bij as 3: stats als kale typografie (les A10) */}
          {chapter.id === "partner-fit" ? (
            <dl className={styles.stats}>
              {modelStats.map((stat, statIndex) => (
                <div key={stat.value} data-reveal style={revealOrder(statIndex)}>
                  <dt className="cg-micro">{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ))}

      {/* Interlude, geen weging: wie hier weegt, bouwt zelf (les A7/A8: rust) */}
      <section className={styles.chapter} aria-labelledby="chapter-bewijs">
        <p className="cg-micro" data-reveal>Tussen de wegingen · het bewijs</p>
        <h2 id="chapter-bewijs" data-reveal="wipe">Wie hier weegt, bouwt zelf mee. Elke dag.</h2>
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

          <div className={styles.scoreBoard} data-weging="0" data-reveal style={revealOrder(1)}>
            <p className={styles.scoreValue}>
              <b data-weging-score>66</b>
              <span className="cg-micro">venture-score {DOSSIER}</span>
            </p>
            <div className={styles.scoreRail} role="img" aria-label={`Score 66 van 100, de lat ligt op 70`}>
              <i className={styles.scoreFill} aria-hidden="true" />
              <i className={styles.scoreLat} aria-hidden="true" />
              <span className={`${styles.scoreLatLabel} cg-micro`}>de lat · 70</span>
            </div>
          </div>

          <h2 id="chapter-verdict" data-reveal="wipe">Nee. Met een concrete tip.</h2>
          <p className={styles.verdictBody} data-reveal style={revealOrder(2)}>
            Aanvraag {DOSSIER} haalt de lat niet: de founder is sterk, maar de AI-hefboom
            is te dun. Het advies ging dezelfde dag de deur uit: bouw de AI in het hart
            van de planning, niet ernaast in de rapportage. Kom daarna terug.
          </p>
          <p className={styles.verdictTurn} data-reveal style={revealOrder(3)}>
            Wij zeggen vaker nee dan ja. Daarom is ons ja iets waard.
          </p>
          <div className={styles.verdictActions} data-reveal style={revealOrder(4)}>
            <Link className={styles.verdictCta} href="/nl/venture-score-aanvragen">
              Vraag je venture-score aan
            </Link>
            <a className={styles.verdictAlt} href="mailto:jeroen@aiow.io">
              Of mail direct: jeroen@aiow.io
            </a>
          </div>
          <p className={`${styles.verdictNote} cg-micro`}>
            {DOSSIER} is een fictief dossier dat laat zien hoe AIOW weegt. Het is geen klantcase.
          </p>
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
