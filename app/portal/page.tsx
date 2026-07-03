import type { Metadata } from "next";
import Link from "next/link";
import styles from "../civicPortal.module.css";
import { CivicPortalGateway } from "./CivicPortalGateway";

export const metadata: Metadata = {
  title: "Inloggen bij je AIOW-dossier | AIOW klantportaal",
  description: "Open je AIOW-dossier: volg het oordeel over je idee, je voorstel, contractstatus en elke gerealiseerde stap.",
  robots: { index: false, follow: false },
};

export default function PortalGatewayPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.bar}`}>
          <Link className={styles.brand} href="/">AIOW.ai <em>· AI venture partner</em></Link>
          <nav className={styles.nav}>
            <Link href="/">Home</Link>
            <Link href="/intake">Start intake</Link>
          </nav>
        </div>
      </header>

      <div className={styles.wrap}>
        <section className={styles.hero}>
          <p className={styles.kicker}>AIOW / klantportaal <b>inloggen</b></p>
          <h1 className={styles.title}>Open je <i>dossier</i>.</h1>
          <p className={styles.lead}>
            Volg het oordeel over je idee, je voorstel en contractstatus, en straks elke stap die
            gerealiseerd wordt, hier en in je Telegram-groep met Spunky.
          </p>
        </section>

        <CivicPortalGateway />

        <section className={styles.steps} aria-label="Nog geen dossier">
          <div className={styles.step}><em>NIEUW HIER?</em><h3>Start met je idee</h3><p>Beschrijf je idee in de venture intake en open direct je eigen dossier.</p></div>
          <div className={styles.step}><em>OORDEEL</em><h3>Binnen een werkdag</h3><p>Eerlijk antwoord: meebouwen, betaalde scan, of nee met verbetertip.</p></div>
          <div className={styles.step}><em>DAARNA</em><h3>Alles op een plek</h3><p>Voorstel, contract, ideeen uit je Telegram-groep en gerealiseerde stappen.</p></div>
        </section>

        <p style={{ margin: "0 0 60px" }}>
          <Link className={styles.ctaSolid} href="/intake">Start venture intake</Link>
        </p>
      </div>

      <footer className={styles.footer}>
        <div className={styles.wrap}>AIOW BV · KvK 71887466 · Hoofddorp</div>
      </footer>
    </main>
  );
}
