import type { Metadata } from "next";
import Link from "next/link";
import portalStyles from "../../AiowPortal.module.css";
import { CustomerAccountCreateForm } from "./CustomerAccountCreateForm";

export const metadata: Metadata = {
  title: "AIOW klantaccount aanmaken",
  description: "Maak een intake-only AIOW klantaccount aan met project, modules en voorwaarden-gate.",
  robots: { index: false, follow: false },
};

export default function NewCustomerAccountPage() {
  return (
    <main className={portalStyles.portalPage}>
      <div className={portalStyles.portalChrome}>
        <header className={portalStyles.portalTopbar}>
          <Link href="/" className={portalStyles.brandLink} aria-label="AIOW home">
            <span className={portalStyles.brandMark} aria-hidden="true" />
            <span className={portalStyles.brandText}><strong>AIOW</strong><small>Private intake</small></span>
          </Link>
          <nav className={portalStyles.topNav} aria-label="Account navigatie">
            <Link href="/">Website</Link>
            <Link href="/portal">Portal demo</Link>
            <Link href="#account" className={portalStyles.topAction}>Account maken</Link>
          </nav>
        </header>
        <section className={portalStyles.portalLayout}>
          <aside className={portalStyles.portalAside}>
            <p className={portalStyles.eyebrow}>Private customer account</p>
            <h1 className={portalStyles.portalTitle}>Maak je privé AIOW cockpit aan.</h1>
            <p className={portalStyles.portalLead}>Eerst alleen de basis. Daarna begeleidt de AI-intake je in het klantportaal stap voor stap door de informatie die onze beoordeling beter maakt.</p>
            <div className={portalStyles.sideCard}>
              <ul className={portalStyles.sideList}>
                {["Eigen account-ID + toegangscode", "Volledige intake achter private toegang", "Status, bewijs en Deal Card in één flow", "Geen live betalingen vóór voorwaarden"].map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}
              </ul>
            </div>
            <Link href="/nl/aanmelden" className={portalStyles.secondaryButton}>Eerst publieke pre-aanvraag</Link>
          </aside>
          <div id="account"><CustomerAccountCreateForm /></div>
        </section>
      </div>
    </main>
  );
}
