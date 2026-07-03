import type { Metadata } from "next";
import Link from "next/link";
import portalStyles from "../../AiowPortal.module.css";
import { AdminAccountsDashboard } from "./AdminAccountsDashboard";

export const metadata: Metadata = {
  title: "AIOW Client Command Center",
  description: "Intern AIOW command center voor klantpipeline, Deal Cards, contracten, Spunky projectgroepen en build-sprints.",
  robots: { index: false, follow: false },
};

export default function AdminAccountsPage() {
  return (
    <main className={portalStyles.portalPage}>
      <div className={portalStyles.portalChrome}>
        <header className={portalStyles.portalTopbar}>
          <Link href="/" className={portalStyles.brandLink} aria-label="AIOW home">
            <span className={portalStyles.brandMark} aria-hidden="true" />
            <span className={portalStyles.brandText}><strong>AIOW</strong><small>Client Command Center</small></span>
          </Link>
          <nav className={portalStyles.topNav} aria-label="Admin navigatie">
            <Link href="/portal/admin">Quote builder</Link>
            <Link href="/portal/account/new">Nieuw account</Link>
            <Link href="#pipeline" className={portalStyles.topAction}>Open pipeline</Link>
          </nav>
        </header>
        <section className={portalStyles.portalLayout}>
          <aside className={portalStyles.portalAside}>
            <p className={portalStyles.eyebrow}>AIOW command center</p>
            <h1 className={portalStyles.portalTitle}>Deal Cards, bewijs en Spunky handoff.</h1>
            <p className={portalStyles.portalLead}>Richard en Jeroen sturen hier de flow: klantinput → AI Deal Card → besluit → contract → Spunky projectgroep → build/growth sprint.</p>
            <div className={`${portalStyles.sideCard} ${portalStyles.warning}`}>
              <strong>Preview security</strong><br />Admins: Richard@aiow.io en Jeroen@aiow.io. Token blijft local-safe guard; productie vraagt echte auth/RBAC/audit.
            </div>
            <div className={portalStyles.sideCard}>
              <ul className={portalStyles.sideList}>
                <li><span>1</span> Minder dashboardruis, meer beslissingen.</li>
                <li><span>2</span> Scorecards en bewijs per klant zichtbaar.</li>
                <li><span>3</span> Spunky bridge pas na AIOW-besluit.</li>
              </ul>
            </div>
          </aside>
          <AdminAccountsDashboard />
        </section>
      </div>
    </main>
  );
}
