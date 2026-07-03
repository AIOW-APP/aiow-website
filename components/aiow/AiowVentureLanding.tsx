import Link from "next/link";
import styles from "./AiowVentureLanding.module.css";

const proofCards = [
  {
    title: "Wat doet AIOW?",
    text: "We bouwen AI, software en digitale systemen die bedrijven laten groeien, niet alleen losse automatiseringen.",
  },
  {
    title: "Hoe werken we samen?",
    text: "Afhankelijk van kans en risico werken we via projectprijs, omzetdeling, winstdeling, equity of een combinatie.",
  },
  {
    title: "Wat gebeurt er daarna?",
    text: "Spunky doet een Venture Intake en helpt bepalen of samenwerking logisch is voor AIOW en voor jou.",
  },
];

const caseCards = [
  {
    title: "Case: Cargo Donkey",
    text: "B2B verpakkings- en logistiekbedrijf regio Schiphol. AIOW bouwde de digitale groeilaag: honderden vindbare kennis- en dienstpagina's, lokale SEO/GEO-dekking en een offerte-funnel via WhatsApp en e-mail.",
  },
  {
    title: "Case: OneTap Day",
    text: "Eigen product, van nul gebouwd en door de volledige release-pipeline van Apple en Google gebracht, inclusief store-metadata, testkanalen en release-proof.",
  },
];

const signalRows = [
  ["Founder", "marktkennis", "tractie"],
  ["Venture", "AI waarde", "schaalbaarheid"],
  ["Partner fit", "risico", "verdienmodel"],
];

export function AiowVentureLanding() {
  return (
    <main className={styles.page} data-aiow-public-landing="venture-partner-v1">
      <div className={styles.ambient} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="AIOW.ai home">
          <span>A</span>
          <div>
            <strong>AIOW.ai</strong>
            <em>AI Venture Partner</em>
          </div>
        </Link>
        <nav className={styles.nav} aria-label="AIOW navigation">
          <Link href="/intake">Start intake</Link>
          <Link href="/app">Login</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-label="AIOW AI Venture Partner">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>AI Venture Partner voor startups en groeiende bedrijven</p>
          <h1>
            <span>Wij bouwen niet voor bedrijven.</span>
            <span>Wij bouwen mee aan bedrijven.</span>
          </h1>
          <p className={styles.lead}>
            AIOW helpt startups en bestaande bedrijven groeien met AI, software, automatisering en digitale strategie.
            Wij stappen in als digitale venture partner en bouwen mee in ruil voor een passende samenwerking: project,
            revenue share, profit share, equity of exit percentage.
          </p>

          <div className={styles.routes} aria-label="Start routes">
            <Link href="/intake?route=startup">Ik heb een startup of idee</Link>
            <Link href="/intake?route=company">Ik heb al een bedrijf</Link>
            <a href="https://wa.me/31621898039" rel="noopener">Liever direct contact? WhatsApp</a>
          </div>

          <div className={styles.notice}>
            <span>Geen gratis chatbot</span>
            <p>
              Spunky beoordeelt of jouw idee of bedrijf interessant is als mogelijke AIOW-case. Intake gestart? Je
              krijgt binnen één werkdag reactie.
            </p>
          </div>
        </div>

        <aside className={styles.presence} aria-label="Living AI Presence">
          <div className={styles.orb} aria-hidden="true">
            <i />
            <b />
            <em />
          </div>
          <div className={styles.presencePanel}>
            <span>Spunky online</span>
            <h2>Venture Intake Partner</h2>
            <p>Ik toets idee, markt, founder, AI-potentie, risico en partnership fit voordat AIOW dieper meebouwt.</p>
            <div className={styles.signalGrid}>
              {signalRows.map((row) => (
                <div key={row[0]}>
                  <strong>{row[0]}</strong>
                  <span>{row[1]}</span>
                  <span>{row[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.cards} aria-label="AIOW uitleg">
        {proofCards.map((card) => (
          <article key={card.title}>
            <span />
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.cards} aria-label="AIOW cases">
        {caseCards.map((card) => (
          <article key={card.title}>
            <span />
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <div className={styles.startBar}>
        <p>Laat Spunky eerst bepalen welke route past: startup, groei, digitalisering, AI, partner of niet relevant.</p>
        <Link href="/intake">Start Venture Intake</Link>
      </div>
    </main>
  );
}
