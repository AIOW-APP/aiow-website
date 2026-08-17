import Link from "next/link";
import { HeroVideo } from "./HeroVideo";
import { RestraintNav } from "./RestraintNav";
import { ScoreTeaser } from "./ScoreTeaser";
import styles from "./RestraintHome.module.css";

/**
 * AIOW homepage, KIA-restraint (besluit Jeroen 2026-08-15, referentie kia.com/nl).
 *
 * Restraint > expressie: midnight-basis + wit, kleine H1 (w500), uppercase
 * micro-labels als sectie-signalen, haarlijnen als dividers, extreme witruimte.
 * Geen glow, geen orb, geen particles; de enige beweging is de score-rail en
 * hover, en die dragen betekenis. Het product staat voorop: het dossier met de
 * weging is de "productfoto" in de hero, de weging zelf is de configurator.
 *
 * Cases-scaffolding uit feat/route-hygiene-cases-scaffolding blijft: per case
 * één echt, geaccordeerd cijfer (levert Jeroen aan); tot die tijd de
 * in-aanbouw-badge. Geen verzonnen cijfers.
 */

const DOSSIER = "#217";

const heroCases: {
  title: string;
  sub: string;
  line: string;
  metric: string | null;
}[] = [
  {
    title: "Bruns / Deco AI",
    sub: "Managed agents op een echte werkvloer",
    line: "AI die dagelijks in een echt bedrijf draait, met AIOW erbij.",
    metric: null, // CASE_METRIC: [wachten op Jeroen] — bijv. "12 uur per week terug"
  },
  {
    title: "Speeddryer",
    sub: "Van idee naar werkend product",
    line: "Het bouw-bewijs: wat wij beloven, hebben we hier gebouwd.",
    metric: null, // CASE_METRIC: [wachten op Jeroen] — bijv. "van idee naar product in N maanden"
  },
  {
    title: "DecoStone",
    sub: "Funnel, offertes en vindbaarheid voor een echt MKB-bedrijf",
    line: "Het groei-bewijs: de digitale groeilaag die het werk uit handen neemt.",
    metric: null, // CASE_METRIC: [wachten op Jeroen] — bijv. "N% meer offerte-aanvragen"
  },
];

const caseCards = [
  {
    title: "Cargo Donkey",
    sub: "B2B verpakking en logistiek, regio Schiphol",
    line: "De digitale groeilaag die het bedrijf zelf nooit had gebouwd.",
  },
  {
    title: "OneTap Day",
    sub: "Eigen product, van nul gebouwd",
    line: "Wij vragen van founders niets dat we zelf nog nooit deden.",
  },
];

const agents = [
  {
    name: "Claude",
    role: "Bouwt",
    line: "Schrijft en verbouwt de code, van eerste schets tot release.",
  },
  {
    name: "Harrie",
    role: "Verifieert",
    line: "Toetst elk stuk werk end-to-end voor het verder mag.",
  },
  {
    name: "Franklin",
    role: "Draait",
    line: "Voert het werk uit waar de klant werkt, dag in dag uit.",
  },
  {
    name: "Chief",
    role: "Reviewt",
    line: "Leest onafhankelijk tegen en wijst af wat niet deugt.",
  },
];

const modelStats = [
  { value: "10-25%", label: "Omzetdeel in plaats van uurtarief" },
  { value: "48 uur", label: "Van aanvraag tot eerlijke uitslag" },
  { value: "3 stappen", label: "Intake, twee minuten werk" },
];

export function RestraintHome() {
  return (
    <main className={styles.page} data-aiow-public-landing="kia-restraint-v1">
      {/* Hero: fullscreen cinema — vier agents wegen, een mens beslist */}
      <section className={styles.hero} aria-label="AIOW AI venture partner">
        <link rel="preload" as="image" href="/aiow/hero/aiow-agents-weging-poster.jpg" />
        <HeroVideo />
        <div className={styles.heroScrim} aria-hidden="true" />
        <RestraintNav />

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={`${styles.heroMicro} kr-micro`}>AIOW · AI venture partner</p>
            <h1>De AI-venture-partner die je idee weegt zoals een investeerder.</h1>
            <p className={styles.heroLead}>
              Binnen 48 uur een eerlijke uitslag. Vaker nee dan ja, daarom is ons ja iets waard.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.heroPrimary} href="/nl/venture-score-aanvragen">
                Weeg je idee
              </Link>
              <a className={styles.heroGhost} href="#cases">
                Bekijk het bewijs
              </a>
            </div>
            <p className={styles.dossierChip}>
              <span className={styles.liveDot} aria-hidden="true" />
              Aanvraag {DOSSIER} · zojuist gewogen
            </p>
          </div>
        </div>
      </section>

      {/* Het dossier: de uitslag van de weging uit de film */}
      <section className={styles.dossierStrip} aria-label={`Voorbeeldweging, aanvraag ${DOSSIER}`}>
        <div className={styles.dossierIntro}>
          <p className="kr-micro">De uitslag</p>
          <p className={styles.dossierLine}>
            Dit besliste de beslisgate over aanvraag {DOSSIER}.
          </p>
          <p className={`${styles.dossierNote} kr-micro`}>
            Voorbeeldweging, samengesteld uit echte aanvragen
          </p>
        </div>
        <div className={styles.dossierCard}>
          <p className="kr-micro">Venture-score</p>
          <p className={styles.dossierScore}>
            <b>66</b>
            <span>van 100 · de lat ligt op 70</span>
          </p>
          <div
            className={styles.dossierRail}
            role="img"
            aria-label="Score 66 van 100, de lat ligt op 70"
          >
            <i className={styles.dossierFill} aria-hidden="true" />
            <i className={styles.dossierLat} aria-hidden="true" />
          </div>
          <p className={styles.dossierVerdict}>
            Nee. Met een concrete tip: bouw de AI in het hart van de planning, niet ernaast.
          </p>
        </div>
      </section>

      {/* Sticky sub-nav, KIA-model-balk: anker-navigatie + CTA schuift mee */}
      <nav className={styles.subnav} aria-label="Secties">
        <span className={styles.subnavBrand}>AIOW</span>
        <div className={styles.subnavLinks}>
          <a href="#weging">De weging</a>
          <a href="#agents">De agents</a>
          <a href="#cases">Het bewijs</a>
        </div>
        <Link className={styles.subnavCta} href="/nl/venture-score-aanvragen">
          Weeg je idee
        </Link>
      </nav>

      {/* De weging als configurator */}
      <section className={styles.section} id="weging" aria-labelledby="weging-title">
        <p className="kr-micro">01 · De weging</p>
        <h2 id="weging-title">Stel je idee samen. Zie direct hoe het weegt.</h2>
        <p className={styles.sectionLead}>
          Drie assen bepalen de venture-score: de founder, de AI-hefboom en de partner-fit.
          Kies wat bij jouw idee past en zie waar je staat.
        </p>
        <ScoreTeaser />
      </section>

      {/* Vier agents, één beslisgate */}
      <section className={`${styles.section} ${styles.sectionPaper}`} id="agents" aria-labelledby="agents-title">
        <p className="kr-micro">02 · Het team</p>
        <h2 id="agents-title">Vier agents, één beslisgate.</h2>
        <p className={styles.sectionLead}>
          Vier AI-agents doen het werk. Geen enkele uitkomst gaat naar buiten zonder dat een
          mens hem gewogen en getekend heeft.
        </p>
        <div className={styles.agentGrid}>
          {agents.map((agent) => (
            <article className={styles.agent} key={agent.name}>
              <p className="kr-micro">{agent.role}</p>
              <h3>{agent.name}</h3>
              <p>{agent.line}</p>
            </article>
          ))}
        </div>
        <div className={styles.gate}>
          <p className={`${styles.gateLabel} kr-micro`}>De beslisgate</p>
          <p className={styles.gateLine}>
            Daarna beslist een mens. Elke weging, elk advies en elke release passeert een
            menselijke handtekening.
          </p>
        </div>
      </section>

      {/* Het model: kale cijfers */}
      <section className={styles.section} aria-labelledby="model-title">
        <p className="kr-micro">03 · Het model</p>
        <h2 id="model-title">Wij verdienen alleen als jij verdient.</h2>
        <dl className={styles.stats}>
          {modelStats.map((stat) => (
            <div key={stat.value}>
              <dd>{stat.value}</dd>
              <dt>{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Cases */}
      <section className={`${styles.section} ${styles.sectionPaper}`} id="cases" aria-labelledby="cases-title">
        <p className="kr-micro">04 · Het bewijs</p>
        <h2 id="cases-title">Wie hier weegt, bouwt zelf mee. Elke dag.</h2>
        <div className={styles.caseGrid}>
          {heroCases.map((card) => (
            <article className={styles.case} key={card.title}>
              <h3>{card.title}</h3>
              <p className={styles.caseSub}>{card.sub}</p>
              {card.metric ? (
                <p className={`${styles.caseMetric} kr-micro`}>{card.metric}</p>
              ) : (
                <p className={`${styles.caseBadge} kr-micro`}>In aanbouw · het cijfer volgt</p>
              )}
              <p className={styles.caseLine}>{card.line}</p>
            </article>
          ))}
        </div>
        <div className={styles.caseGrid} data-two>
          {caseCards.map((card) => (
            <article className={styles.case} key={card.title}>
              <h3>{card.title}</h3>
              <p className={styles.caseSub}>{card.sub}</p>
              <p className={styles.caseLine}>{card.line}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Slot: het verdict als uitnodiging */}
      <section className={styles.closing} aria-labelledby="closing-title">
        <p className="kr-micro">05 · Jouw beurt</p>
        <h2 id="closing-title">Wij zeggen vaker nee dan ja. Daarom is ons ja iets waard.</h2>
        <div className={styles.closingActions}>
          <Link className={styles.closingCta} href="/nl/venture-score-aanvragen">
            Weeg je idee
          </Link>
          <a className={styles.closingAlt} href="https://wa.me/31621898039" rel="noopener">
            Liever direct contact? WhatsApp
          </a>
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
