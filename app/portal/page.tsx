import Link from "next/link";
import styles from "./Portal.module.css";
import { PortalLogin } from "./PortalLogin";

export default function PortalPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>AIOW Project Workspace</p>
            <h1>Log in op je venture project.</h1>
            <p className={styles.lead}>Ga verder waar je gesprek met AIOW stopte. Je Venture Memory, Deal Card, aanvullende info, voorstel en build-start komen samen in één workspace.</p>
          </div>
          <span className={styles.statusPill}><i /> Memory first</span>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h1>Account login</h1>
            <PortalLogin />
          </section>
          <aside className={styles.panel}>
            <h2>Hoe de samenwerking loopt</h2>
            <div className={styles.timeline}>
              <Step n="1" title="Venture Memory" text="AIOW onthoudt de context uit je eerste gesprek." />
              <Step n="2" title="Private workspace" text="Je vult alleen aan wat nog nodig is voor beoordeling." />
              <Step n="3" title="Voorstel" text="AIOW maakt een concreet voorstel met scope en commerciële route." />
              <Step n="4" title="Tekenen" text="Na akkoord en digitale ondertekening staat het project klaar voor build-start." />
            </div>
            <p className={styles.notice}>Nog geen project? Start op de homepage met AIOW. Na naam, e-mail en toestemming maken we automatisch je workspace klaar.</p>
            <div className={styles.actions}><Link className={styles.secondaryButton} href="/">Start met AIOW</Link><Link className={styles.secondaryButton} href="/portal/admin">Team Richard admin</Link></div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className={styles.step}><b>{n}</b><p><strong>{title}</strong>{text}</p></div>;
}
