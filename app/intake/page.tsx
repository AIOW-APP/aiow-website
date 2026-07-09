import type { Metadata } from "next";
import Link from "next/link";
import styles from "../civicPortal.module.css";
import { CivicIntakeForm } from "./CivicIntakeForm";

export const metadata: Metadata = {
  title: "Venture intake: laat je idee wegen | AIOW",
  description:
    "Beschrijf je idee of bedrijf. AIOW beoordeelt founder, markt, AI-hefboom en tractie met een venture-score en geeft binnen 48 uur een eerlijk eerste oordeel: meebouwen voor een omzetdeel, een betaalde scan, of een nee met verbetertip.",
};

export default function IntakePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.bar}`}>
          <Link className={styles.brand} href="/">AIOW.ai <em>· AI venture partner</em></Link>
          <nav className={styles.nav}>
            <Link href="/">Home</Link>
            <Link href="/nl/kennis">Kennisbank</Link>
            <Link className={styles.loginBtn} href="/portal">Inloggen</Link>
          </nav>
        </div>
      </header>

      <div className={styles.wrap}>
        <section className={styles.hero}>
          <p className={styles.kicker}>AIOW / venture-dossier <b>nieuw</b></p>
          <h1 className={styles.title}>Durf je het te laten <i>wegen</i>?</h1>
          <p className={styles.lead}>
            Beschrijf je idee of bedrijf. Het systeem weegt founder, markt, AI-hefboom en tractie,
            en je krijgt binnen 48 uur een eerlijk eerste oordeel.
          </p>
        </section>

        <CivicIntakeForm />

        <section className={styles.steps} aria-label="Hoe het werkt">
          <div className={styles.step}><em>01 · SCAN</em><h3>Het systeem weegt</h3><p>Founder, markt, AI-hefboom, tractie. Onderzocht, niet alleen jouw verhaal.</p></div>
          <div className={styles.step}><em>02 · OORDEEL</em><h3>Eerlijk antwoord</h3><p>Meebouwen, een betaalde scan met plan, of een nee met verbetertip.</p></div>
          <div className={styles.step}><em>03 · DEAL</em><h3>Wij winnen als jij wint</h3><p>Een omzetdeel in plaats van uurtarief. Voorstel en contract in je dossier.</p></div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.wrap}>AIOW BV · KvK 71887466 · Hoofddorp</div>
      </footer>
    </main>
  );
}
