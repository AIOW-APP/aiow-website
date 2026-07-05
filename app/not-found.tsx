import Link from "next/link";
import styles from "./portal/portalGlass.module.css";
import { CleanGlassNav } from "@/components/aiow/clean-glass/CleanGlassNav";

/*
 * 404 als merk-moment (was: kale framework-default, vergeten oppervlak).
 * Zelfde tokensysteem en verdict-taal als De Weging; één CTA (les A16),
 * secundair als tekstlink. Geen loops, geen theater: dit is een rustige nee.
 */
export default function NotFound() {
  return (
    <main className={styles.page}>
      <CleanGlassNav journey="static" />
      <div className={styles.wrap}>
        <section className={styles.notFound}>
          <p className="cg-micro">404 · niet in het dossier</p>
          <h1>
            Deze pagina <em>weegt</em> niets.
          </h1>
          <p className={styles.lead}>
            Het adres bestaat niet of is verplaatst. Je dossier staat er gewoon nog.
          </p>
          <p className={styles.notFoundActions}>
            <Link className={styles.primary} href="/">Terug naar de weging</Link>
            <Link className={styles.quiet} href="/portal">Open je dossier</Link>
          </p>
        </section>
      </div>
      <footer className={styles.footer}>
        <div className={styles.wrap}>AIOW BV · KvK 71887466 · Hoofddorp</div>
      </footer>
    </main>
  );
}
