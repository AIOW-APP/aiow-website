import Link from "next/link";
import OneTapConciergeIntake from "./OneTapConciergeIntake";
import styles from "./onetap-day.module.css";

export const metadata = {
  title: "OneTap Day Concierge — 24 uur execution plan",
  description:
    "Stuur je rommelige dag en krijg binnen 24 uur na betaling + complete intake één realistisch execution plan. Founding beta for the first paying users.",
  robots: { index: false, follow: false },
};

const proofItems = [
  "Human-reviewed, AI-assisted dagplan",
  "Revenue-fit eerst: geen one-off default, premium hypothesis testen",
  "Provider-off interest_intent_rate vóór paid_rate",
  "Privacy-light: text-only, geen calendar OAuth of voice upload",
];

export default function OneTapDayConciergePage() {
  return (
    <main className={styles.pageShell}>
      <nav className={styles.nav} aria-label="OneTap Day navigation">
        <Link href="/" className={styles.brandLink}>← AIOW</Link>
        <a href="mailto:hello@aiow.ai?subject=OneTap%20Day%20Concierge" className={styles.navCta}>Vraag via mail</a>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>OneTap Day Concierge · Revenue-fit test</p>
          <h1>Stuur je rommelige dag. Help bewijzen wat OneTap Premium waard is.</h1>
          <p className={styles.lede}>
            Voor solo founders, indie operators en AI-builders die elke ochtend 30–60 minuten kwijt zijn aan
            scattered tasks, constraints en prioriteiten. We bouwen nu provider-off: eerst bewijs voor recurring
            premium value, daarna pas een Richard-approved betaalmicrotest.
          </p>
          <div className={styles.heroActions}>
            <a href="#intake" className={styles.primaryAction}>Start complete intake</a>
            <a href="#boundary" className={styles.secondaryAction}>Provider-off betaalgrens</a>
          </div>
        </div>
        <aside className={styles.offerCard} aria-label="OneTap Day offer">
          <span className={styles.cardLabel}>Provider-off Premium Test</span>
          <strong>€19?</strong>
          <p>Founding Premium is een hypothese, geen live checkout. We meten eerst interesse en day-2/day-7/day-30 waarde.</p>
          <ul>
            <li>Geen live betaling; Stripe blijft gepauzeerd</li>
            <li>Soft metric: interest_intent_rate</li>
            <li>Hard metric paid_rate pas na jouw GO</li>
            <li>Subscription-fit alleen met recurring value bewijs</li>
          </ul>
        </aside>
      </section>

      <section className={styles.proofGrid} aria-label="Operational proof">
        {proofItems.map((item) => <p key={item}>{item}</p>)}
      </section>

      <OneTapConciergeIntake />

      <section id="boundary" className={styles.boundarySection} data-payment-boundary="yellow-gate">
        <p className={styles.eyebrow}>Revenue-fit betaalgrens</p>
        <h2>Stripe checkout blijft gepauzeerd; eerst provider-off premium interesse meten.</h2>
        <p>
          De oude one-off Founding 10 checkout is vervangen door een revenue-fit pad. We meten eerst provider-off
          interesse, value cadence op day-2/day-7/day-30 en premium feature demand. Pas na zachte interesse + Book/Richard
          approval kan een bounded betaalmicrotest live. De 24 uur SLA start nooit zonder succesvolle betaling én complete intake.
        </p>
        <div className={styles.boundaryList}>
          <span>✅ Interest test eerst</span>
          <span>⏸️ Stripe blijft provider-off</span>
          <span>✅ Geen live checkout</span>
          <span>✅ Subscription pas met recurring value</span>
        </div>
      </section>
    </main>
  );
}
