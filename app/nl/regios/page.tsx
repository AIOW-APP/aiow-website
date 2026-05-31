import type { Metadata } from "next";
import Link from "next/link";
import styles from "../cluster-index.module.css";
import { regionPages } from "../seo-page-data";

const pages = Object.values(regionPages);

export const metadata: Metadata = {
  title: "AI-integratie per regio in Nederland | AIOW",
  description: "Nederlandse regio-overzichtspagina voor AI-integratie, AI-automatisering en AI-installatie door AIOW.",
  alternates: { canonical: "/nl/regios" },
};

export default function Page() {
  return <main className={styles.page}><div className={styles.wrap}>
    <p className={styles.kicker}>AI regio-cluster Nederland</p>
    <h1 className={styles.h1}>AI-integratie voor Nederlandse regio’s.</h1>
    <p className={styles.lead}>AIOW werkt NL-first. Deze regio’s helpen bedrijven en AI-zoekmachines snel de juiste lokale context vinden voor AI-integratie, AI-agents en lokale/private AI.</p>
    <div className={styles.grid}>{pages.map((page) => <Link className={styles.card} href={`/nl/${page.slug}`} key={page.slug}><h2>{page.title}</h2><p>{page.intentAnswer}</p></Link>)}</div>
    <Link className={styles.back} href="/">Terug naar AIOW</Link>
  </div></main>;
}
