import Link from "next/link";
import { pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import styles from "./PricingGuide.module.css";

export function PricingGuide({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const en = locale === "en";
  const branches = pricingContexts.filter((context) => context.category === "business");
  const buildings = pricingContexts.filter((context) => context.category === "building");
  const cards = (items: typeof pricingContexts) => items.map((context) => <Link href={en ? `/en/rates/${context.slug}` : `/tarieven/${context.slug}`} key={context.slug}><span>{en ? context.labelEn : context.labelNl}</span><small>{en ? "Advice and calculation" : "Advies en rekenvoorbeeld"} ↗</small></Link>);
  return <section className={styles.guide} aria-labelledby="pricing-guide-title">
    <div className={styles.heading}><p>{en ? "Pricing guide" : "Prijswegwijzer"}</p><h2 id="pricing-guide-title">{en ? "Which published rate fits your context?" : "Wat kost het voor u?"}</h2><div><p>{en ? "Choose your context. Each detail page shows practical applications, package advice and a transparent calculation—without invented industry outcomes." : "Kies uw context. Elke detailpagina toont concrete toepassingen, pakketadvies en een transparante berekening—zonder verzonnen branche-uitkomst."}</p><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Complete rates" : "Volledige tarieven"} ↗</Link></div></div>
    <div className={styles.group}><h3>{en ? "Business processes" : "Bedrijfsprocessen"}</h3><div className={styles.cards}>{cards(branches)}</div></div>
    <div className={styles.group}><h3>{en ? "Buildings and projects" : "Gebouwen en projecten"}</h3><div className={styles.cards}>{cards(buildings)}</div></div>
  </section>;
}
