import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { AiowReveal } from "@/components/aiow/AiowReveal";
import { CleanGlassNav } from "@/components/aiow/clean-glass/CleanGlassNav";
import { AiowVentureScoreFlow } from "@/components/aiow/AiowVentureScoreFlow";
import styles from "./styles.module.css";

const revealOrder = (order: number) => ({ "--reveal-order": order } as CSSProperties);

const SITE_URL = "https://aiow.ai";

export const metadata: Metadata = {
  title: "Vraag je venture-score aan",
  description:
    "Leg je idee of bedrijf in drie stappen voor aan AIOW. Binnen 48 uur krijg je een eerlijk eerste oordeel over de venture-fit: bouwen of groeien voor een omzetdeel, geen uurtarief.",
  alternates: { canonical: "/nl/venture-score-aanvragen" },
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: `${SITE_URL}/nl/venture-score-aanvragen`,
    title: "Vraag je venture-score aan | AIOW",
    description:
      "Leg je idee of bedrijf in drie stappen voor. Binnen 48 uur krijg je AIOW's eerste oordeel over meebouwen voor een omzetdeel.",
    siteName: "AIOW",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
};

export default function VentureScoreAanvragenPage() {
  return (
    <main className={styles.page}>
      <AiowReveal />
      <CleanGlassNav journey="static" badgeHref="#aanvraag" />

      <section className={styles.intro} aria-label="Venture-score aanvragen">
        <p className="cg-micro" data-reveal>Venture-score</p>
        <h1 data-reveal="wipe">Leg je idee voor. Wij beoordelen het als investeerder.</h1>
        <p className={styles.lead} data-reveal style={revealOrder(1)}>
          Drie stappen, twee minuten werk. Spunky toetst founder, markt, AI-hefboom, tractie en
          bouwbaarheid. Binnen 48 uur krijg je een eerlijk eerste oordeel. We zeggen vaker nee
          dan ja, en altijd met een eerlijke tip.
        </p>
      </section>

      <div className={styles.flowWrap} id="aanvraag" data-reveal style={revealOrder(2)}>
        <AiowVentureScoreFlow />
      </div>
    </main>
  );
}
