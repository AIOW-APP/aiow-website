import Link from "next/link";
import OneTapConciergeIntake from "../../../onetap-day/OneTapConciergeIntake";
import styles from "../../../onetap-day/onetap-day.module.css";

export const metadata = {
  title: { absolute: "OneTap Day — Handsome.bot" },
  description: "Early-access planning app for turning a messy day into a reviewed next step.",
};

const outcomes = [
  "Je rommelige dag wordt veilig text-only vastgelegd.",
  "Je krijgt een receipt zodat je aanvraag controleerbaar is.",
  "Team Handsome gebruikt echte intake om te bepalen welke dagreview waarde heeft.",
];

const proofItems = [
  "Geen betaling en geen abonnement",
  "Geen agenda- of voice-koppeling",
  "Echte intake en feedback vóór schaal",
  "Geen fake metric of testimonial",
];

export default function HandsomeOneTapDayPage() {
  return (
    <main className={styles.pageShell}>
      <nav className={styles.nav} aria-label="OneTap Day navigation">
        <Link href="/" className={styles.brandLink}>Handsome.bot</Link>
        <Link href="/early-access" className={styles.navCta}>Early access</Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>OneTap Day · early access</p>
          <h1>Vraag een OneTap-review voor je rommelige dag aan.</h1>
          <p className={styles.lede}>
            OneTap Day is de eerste Handsome.bot app: klein genoeg om meteen te gebruiken, scherp genoeg om te ontdekken waar echte planningwaarde zit. Stuur je dag, krijg een receipt, en laat Team Handsome je intake reviewen.
          </p>
          <div className={styles.heroActions}>
            <a href="#intake" className={styles.primaryAction}>Vraag OneTap-review aan</a>
            <a href="#proof" className={styles.secondaryAction}>Wat is veilig?</a>
          </div>
        </div>
        <aside className={styles.offerCard} aria-label="OneTap Day proof card">
          <span className={styles.cardLabel}>Early access</span>
          <strong>OPEN</strong>
          <p>Text-only intake. Geen betaling. Geen automatische agenda- of voice-koppeling.</p>
          <ul>
            <li>Geen live betaling</li>
            <li>Geen abonnement</li>
            <li>Geen wachtwoorden of gevoelige data insturen</li>
            <li>Verwijderen op verzoek</li>
          </ul>
        </aside>
      </section>

      <section className={styles.proofGrid} aria-label="Outcomes">
        {outcomes.map((item) => <p key={item}>{item}</p>)}
        <p>Early access: klein, eerlijk en bruikbaar voordat we groter bouwen.</p>
      </section>

      <OneTapConciergeIntake />

      <section id="proof" className={styles.boundarySection}>
        <p className={styles.eyebrow}>Veilig starten</p>
        <h2>Eerst echte intake. Daarna pas schaal.</h2>
        <p>
          OneTap verzamelt nu alleen gecontroleerde intake en echte feedback. Elk getal dat later op deze pagina komt,
          krijgt een bron. Leeg laten is beter dan liegen.
        </p>
        <div className={styles.boundaryList}>
          {proofItems.map((item) => <span key={item}>✅ {item}</span>)}
        </div>
      </section>
    </main>
  );
}
