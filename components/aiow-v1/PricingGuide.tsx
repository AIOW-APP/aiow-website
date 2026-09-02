"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import styles from "./PricingGuide.module.css";

function scrollPricingDeck(event: KeyboardEvent<HTMLDivElement>) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
  const node = event.currentTarget;
  if (node.scrollWidth <= node.clientWidth + 1) return;
  event.preventDefault();
  if (event.key === "Home") node.scrollTo({ left: 0 });
  else if (event.key === "End") node.scrollTo({ left: node.scrollWidth });
  else node.scrollBy({ left: (event.key === "ArrowRight" ? 1 : -1) * Math.max(220, node.clientWidth * 0.72) });
}

function PricingDeck({ children, cue, label }: { children: ReactNode; cue: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setOverflowing(node.scrollWidth > node.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div className={styles.deckFrame}>
    <div
      className={styles.cards}
      ref={ref}
      role={overflowing ? "region" : undefined}
      tabIndex={overflowing ? 0 : undefined}
      aria-label={overflowing ? label : undefined}
      onKeyDown={overflowing ? scrollPricingDeck : undefined}
      data-pricing-deck="true"
      data-pricing-overflow={overflowing ? "true" : "false"}
    >{children}</div>
    <div className={styles.overflowCue} aria-hidden="true"><span /><span>{cue} →</span></div>
  </div>;
}

export function PricingGuide({ locale = "nl" }: { locale?: "nl" | "en" }) {
  const en = locale === "en";
  const featured = ["accountants", "kantoorpand", "woning"].map((slug) => pricingContexts.find((context) => context.slug === slug)).filter((context): context is (typeof pricingContexts)[number] => Boolean(context));
  const cards = (items: typeof pricingContexts) => items.map((context, index) => <Link href={en ? `/en/rates/${context.slug}` : `/tarieven/${context.slug}`} key={context.slug}><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b><span>{en ? context.labelEn : context.labelNl}</span><small>{en ? "Advice and calculation" : "Advies en rekenvoorbeeld"} ↗</small></Link>);
  const deck = (items: typeof pricingContexts, label: string) => <PricingDeck cue={en ? "Scroll" : "Schuif"} label={`${label} — ${en ? "horizontal pricing links; use arrow keys to scroll" : "horizontale prijslinks; gebruik pijltjestoetsen om te scrollen"}`}>{cards(items)}</PricingDeck>;
  return <section className={styles.guide} aria-labelledby="pricing-guide-title">
    <div className={styles.heading}><p>{en ? "Pricing guide" : "Prijswegwijzer"}</p><h2 id="pricing-guide-title">{en ? "Which published rate fits your context?" : "Wat kost het voor u?"}</h2><div><p>{en ? "Choose your context. Each detail page shows practical applications, package advice and a transparent calculation—without invented industry outcomes." : "Kies uw context. Elke detailpagina toont concrete toepassingen, pakketadvies en een transparante berekening—zonder verzonnen branche-uitkomst."}</p><Link href={en ? "/en/rates" : "/tarieven"}>{en ? "Complete rates" : "Volledige tarieven"} ↗</Link></div></div>
    <div className={styles.group}><h3>{en ? "Three recognisable examples" : "Drie herkenbare voorbeelden"}</h3>{deck(featured, en ? "Featured rates" : "Uitgelichte tarieven")}</div>
  </section>;
}
