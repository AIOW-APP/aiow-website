import type { Metadata } from "next";
import Link from "next/link";
import styles from "../cluster-index.module.css";
import { seoPages } from "../seo-page-data";

const pages = Object.values(seoPages).filter((page) => page.slug.startsWith("vergelijking/"));

export const metadata: Metadata = {
  title: "AI vergelijkingen voor bedrijven | AIOW",
  description: "AIOW vergelijkt AI-installateur vs consultant, lokale AI vs ChatGPT, private AI vs cloud AI en AI-agent vs chatbot.",
  alternates: { canonical: "/nl/vergelijkingen" },
};

export default function Page() {
  return <main className={styles.page}><div className={styles.wrap}>
    <p className={styles.kicker}>AI keuzehulp</p>
    <h1 className={styles.h1}>Heldere AI-vergelijkingen voor bedrijven.</h1>
    <p className={styles.lead}>Deze pagina’s beantwoorden koop- en beslisvragen rond AI-implementatie, agents, chatbots, lokale/private AI en cloudmodellen.</p>
    <div className={styles.grid}>{pages.map((page) => <Link className={styles.card} href={`/nl/${page.slug}`} key={page.slug}><h2>{page.title}</h2><p>{page.intentAnswer}</p></Link>)}</div>
    <Link className={styles.back} href="/">Terug naar AIOW</Link>
  </div></main>;
}
