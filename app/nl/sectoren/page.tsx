import type { Metadata } from "next";
import Link from "next/link";
import styles from "../cluster-index.module.css";
import { seoPages } from "../seo-page-data";

const pages = Object.values(seoPages).filter((page) => page.slug.startsWith("sector/"));

export const metadata: Metadata = {
  title: "AI per sector in Nederland | AIOW",
  description: "Overzicht van AIOW AI-oplossingen per sector: installatie, finance, legal, bouw, zorg, marketing, klantcontact, HR en e-commerce.",
  alternates: { canonical: "/nl/sectoren" },
};

export default function Page() {
  return <main className={styles.page}><div className={styles.wrap}>
    <p className={styles.kicker}>AI sectorcluster Nederland</p>
    <h1 className={styles.h1}>AI-oplossingen per sector.</h1>
    <p className={styles.lead}>Elke sector heeft andere data, risico’s en workflows. AIOW vertaalt AI naar concrete Nederlandse bedrijfsprocessen met logging, modelrouting en menselijke approvals.</p>
    <div className={styles.grid}>{pages.map((page) => <Link className={styles.card} href={`/nl/${page.slug}`} key={page.slug}><h2>{page.title}</h2><p>{page.intentAnswer}</p></Link>)}</div>
    <Link className={styles.back} href="/">Terug naar AIOW</Link>
  </div></main>;
}
