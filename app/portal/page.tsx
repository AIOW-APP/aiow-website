import type { Metadata } from "next";
import styles from "./portalGlass.module.css";
import { CleanGlassNav } from "@/components/aiow/clean-glass/CleanGlassNav";
import { LivingOrb } from "@/components/aiow/clean-glass/LivingOrb";
import { AmbientGuard } from "@/components/aiow/clean-glass/AmbientGuard";
import { CivicPortalGateway } from "./CivicPortalGateway";

export const metadata: Metadata = {
  title: "Inloggen bij je AIOW-dossier | AIOW klantportaal",
  description: "Open je AIOW-dossier: volg het oordeel over je idee, je voorstel, contractstatus en elke gerealiseerde stap.",
  robots: { index: false, follow: false },
};

/*
 * Login als merk-moment (DESIGN-DNA.md v2.1). De beoordelaar is aanwezig:
 * de orb staat achter de glazen kaart, het glas leent zijn kleur (Grondwet:
 * glas alleen boven kleur). Chapter-statement links uitgelijnd (les A2),
 * de kaart zelf is het ene bewijs-element van dit hoofdstuk.
 */
export default function PortalGatewayPage() {
  return (
    <main className={styles.page}>
      <CleanGlassNav journey="static" />
      <AmbientGuard />

      <div className={styles.wrap}>
        <section className={styles.hero}>
          <p className="cg-micro">AIOW / klantportaal</p>
          <h1>
            Open je <em>dossier</em>.
          </h1>
          <p className={styles.lead}>
            Alleen je e-mailadres. Je krijgt een link en een code, geen wachtwoord.
          </p>
        </section>

        <section className={styles.presence} aria-label="Inloggen">
          <LivingOrb />
          <CivicPortalGateway />
        </section>

        <section className={styles.steps} aria-label="Nog geen dossier">
          <div className={styles.step}>
            <p className="cg-micro">Nieuw hier</p>
            <h3>Start met je idee</h3>
            <p>Vraag je venture-score aan en open daarmee je eigen dossier.</p>
          </div>
          <div className={styles.step}>
            <p className="cg-micro">Het oordeel</p>
            <h3>Binnen een werkdag</h3>
            <p>Eerlijk antwoord: meebouwen, betaalde scan, of nee met verbetertip.</p>
          </div>
          <div className={styles.step}>
            <p className="cg-micro">Daarna</p>
            <h3>Alles op een plek</h3>
            <p>Voorstel, contract, je Telegram-groep met Spunky en elke gerealiseerde stap.</p>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.wrap}>AIOW BV · KvK 71887466 · Hoofddorp</div>
      </footer>
    </main>
  );
}
