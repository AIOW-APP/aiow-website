import type { Metadata } from "next";
import Link from "next/link";
import portalStyles from "../../AiowPortal.module.css";
import { CustomerPortalView } from "./CustomerPortalView";

export const metadata: Metadata = {
  title: "AIOW klantportaal",
  description: "Veilig AIOW klantportaal voor accountstatus, scope, modules en voorwaarden-gate.",
  robots: { index: false, follow: false },
};

export default async function CustomerPortalPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <main className={portalStyles.portalPage}>
      <div className={portalStyles.portalChrome}>
        <header className={portalStyles.portalTopbar}>
          <Link href="/" className={portalStyles.brandLink} aria-label="AIOW home">
            <span className={portalStyles.brandMark} aria-hidden="true" />
            <span className={portalStyles.brandText}><strong>AIOW</strong><small>AI venture & growth partner</small></span>
          </Link>
          <nav className={portalStyles.topNav} aria-label="Klantportaal navigatie">
            <Link href="/">Website</Link>
            <Link href="/portal/account/new">Nieuw account</Link>
            <Link href="#intake" className={portalStyles.topAction}>Intake verbeteren</Link>
          </nav>
        </header>
        <section className={portalStyles.portalLayout}>
          <aside className={portalStyles.portalAside}>
            <p className={portalStyles.eyebrow}>Klantportaal</p>
            <h1 className={portalStyles.portalTitle}>Jouw AIOW project cockpit.</h1>
            <p className={portalStyles.portalLead}>Geen losse vragenlijst. Je krijgt een begeleide AI-intake die stap voor stap vraagt wat AIOW nodig heeft om je bedrijf, kans, risico en beste dealmodel goed te beoordelen.</p>
            <div className={portalStyles.sideCard}>
              <ul className={portalStyles.sideList}>
                <li><span>1</span> Status, score en benodigde bewijzen blijven zichtbaar.</li>
                <li><span>2</span> De AI-gids vraagt proactief per onderwerp door.</li>
                <li><span>3</span> Alles wat je invult verrijkt de AIOW Deal Card.</li>
              </ul>
            </div>
            <div className={portalStyles.sideCard}>
              <p className={portalStyles.cardLabel}>Account route</p>
              <div className={portalStyles.accountCode}>{accountId}</div>
            </div>
          </aside>
          <CustomerPortalView accountId={accountId} />
        </section>
      </div>
    </main>
  );
}
