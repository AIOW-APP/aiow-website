import Link from "next/link";
import { pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import styles from "./PricingGuide.module.css";

export function PricingGuide({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const en = locale === "en";
  const branches = pricingContexts.filter((context) => context.category === "business");
  const buildings = pricingContexts.filter((context) => context.category === "building");
  const cards = (items: typeof pricingContexts) => items.map((context) => <Link href={`/tarieven/${context.slug}`} key={context.slug} hrefLang="nl"><span>{en ? context.labelEn : context.labelNl}</span><small>{en ? "Dutch rates" : "Advies en rekenvoorbeeld"} ↗</small></Link>);
  return <section className={styles.guide} aria-labelledby="pricing-guide-title">
    <div className={styles.heading}><p>{en ? "Pricing guide" : "Prijswegwijzer"}</p><h2 id="pricing-guide-title">{en ? "Which published rate fits your context?" : "Wat kost het voor u?"}</h2><div><p>{en ? "Choose your context. Detail pages and the complete tariff are currently in Dutch; calculations use team size or floor area, not invented industry outcomes." : "Kies uw context. Elke detailpagina toont concrete toepassingen, pakketadvies en een transparante berekening—zonder verzonnen branche-uitkomst."}</p><Link href="/tarieven" hrefLang="nl">{en ? "Rates (Dutch)" : "Volledige tarieven"} ↗</Link></div></div>
    <div className={styles.group}><h3>{en ? "Business processes" : "Bedrijfsprocessen"}</h3><div className={styles.cards}>{cards(branches)}</div></div>
    <div className={styles.group}><h3>{en ? "Buildings and projects" : "Gebouwen en projecten"}</h3><div className={styles.cards}>{cards(buildings)}</div></div>
  </section>;
}
