import Link from "next/link";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { LivingBlueprintCalculator } from "./LivingBlueprintCalculator";
import { ThreeWorldsBlueprint } from "./ThreeWorldsBlueprint";
import styles from "./LivingBlueprintHomepage.module.css";

type Locale = "nl" | "en";

const copy = {
  nl: {
    eyebrow: "AIOW · ontwerp · bouw · implementatie · beheer",
    desktopTitle: <>Wij bouwen AI die uw <em>werk, pand en leven</em> eenvoudiger maakt.</>,
    mobileTitle: <>Wij bouwen AI voor uw <em>werk, pand en leven.</em></>,
    lead: "Van ontwerp en implementatie tot dagelijks beheer. Binnen uw regels; u houdt de bevoegdheid.",
    cta: "Laat één proces of ruimte scannen",
    secondary: "Bekijk hoe AIOW werkt",
    ctaNote: "U ziet wat gebouwd kan worden, welke grenzen nodig zijn en waar een mens bevoegd blijft.",
    trust: ["AIOW B.V. · Hoofddorp", "Tarieven en grenzen vooraf", "Stoppen blijft mogelijk"],
    authorityEyebrow: "Uw gezag · onze verantwoordelijkheid",
    authorityTitle: "U bepaalt de regel. Wij bouwen wat eronder werkt.",
    authorityBody: "Overal waar signalen binnenkomen, regels gelden en handelingen terugkeren, kan AIOW een begrensd systeem ontwerpen, implementeren en beheren.",
    authority: [
      ["U bepaalt", "Doel, bronnen, grenzen en bevoegde mensen."],
      ["AIOW bouwt", "Het systeem, de koppelingen en de controlepunten."],
      ["AI handelt", "Alleen binnen de afgesproken route en bevoegdheid."],
      ["Een mens grijpt in", "Goedkeuren, begrenzen en stoppen blijft mogelijk."],
    ],
    methodEyebrow: "Van eerste vraag naar dagelijks beheer",
    methodTitle: "Scan. Scope. Bouw. Beheer.",
    method: [
      ["Scan", "Eén proces of ruimte, inclusief bronnen en afhankelijkheden."],
      ["Scope", "Een beslismemo met grenzen, uitzonderingen en advies."],
      ["Bouw", "Gefaseerde implementatie, getoetst met de mensen die ermee werken."],
      ["Beheer", "Monitoring, onderhoud en gecontroleerde verbetering."],
    ],
    priceEyebrow: "Publieke indicatie",
    priceTitle: "Eerst zien wat gebouwd wordt. Dan wat het kost.",
    priceBody: "De calculator geeft een deterministisch startpunt. De definitieve prijs volgt nadat scope en afhankelijkheden zijn geverifieerd.",
    finalEyebrow: "Een concreet eerste besluit",
    finalTitle: "Neem één proces of één ruimte mee.",
    finalBody: "U ontvangt een beslismemo: wat gebouwd kan worden, wat van hardware of partners afhangt en wat u bewust niet automatiseert.",
  },
  en: {
    eyebrow: "AIOW · design · build · implement · manage",
    desktopTitle: <>We build AI that makes your <em>work, property and life</em> simpler.</>,
    mobileTitle: <>We build AI for your <em>work, property and life.</em></>,
    lead: "From design and implementation to daily management. Within your rules; you retain authority.",
    cta: "Scan one process or space",
    secondary: "See how AIOW works",
    ctaNote: "You see what can be built, which boundaries are needed and where a person remains authorised.",
    trust: ["AIOW B.V. · Hoofddorp", "Rates and boundaries first", "Stopping remains possible"],
    authorityEyebrow: "Your authority · our responsibility",
    authorityTitle: "You define the rule. We build what works beneath it.",
    authorityBody: "Wherever signals arrive, rules apply and actions repeat, AIOW can design, implement and manage a bounded system.",
    authority: [
      ["You define", "Purpose, sources, boundaries and authorised people."],
      ["AIOW builds", "The system, integrations and control points."],
      ["AI acts", "Only within the agreed route and authority."],
      ["A person intervenes", "Approval, limitation and stopping remain possible."],
    ],
    methodEyebrow: "From first question to daily management",
    methodTitle: "Scan. Scope. Build. Manage.",
    method: [
      ["Scan", "One process or space, including sources and dependencies."],
      ["Scope", "A decision memo with boundaries, exceptions and advice."],
      ["Build", "Phased implementation, tested with the people who use it."],
      ["Manage", "Monitoring, maintenance and controlled improvement."],
    ],
    priceEyebrow: "Public indication",
    priceTitle: "First see what is built. Then what it costs.",
    priceBody: "The calculator gives a deterministic starting point. The final price follows after scope and dependencies are verified.",
    finalEyebrow: "A concrete first decision",
    finalTitle: "Bring one process or one space.",
    finalBody: "You receive a decision memo: what can be built, what depends on hardware or partners and what should deliberately not be automated.",
  },
} as const;

export function LivingBlueprintHomepage({ locale = "nl" }: { locale?: Locale }) {
  const c = copy[locale];
  const scanHref = locale === "en" ? "/en/scan" : "/scan";
  return <div className={styles.site}>
    <PublicHeader locale={locale} compactMobile />
    <main>
      <section id={locale === "en" ? "solutions" : "oplossingen"} className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.desktopTitle}>{c.desktopTitle}</h1>
          <h1 className={styles.mobileTitle}>{c.mobileTitle}</h1>
          <p className={styles.lead}>{c.lead}</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href={scanHref}>{c.cta}</Link><a className={styles.textLink} href={locale === "en" ? "#approach" : "#aanpak"}>{c.secondary} ↓</a></div>
          <p className={styles.ctaNote}>{c.ctaNote}</p>
          <div className={styles.trustRail}>{c.trust.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
        <ThreeWorldsBlueprint locale={locale} />
      </section>

      <section className={styles.authority}>
        <div className={styles.authorityIntro}><p className={styles.eyebrow}>{c.authorityEyebrow}</p><h2>{c.authorityTitle}</h2><p>{c.authorityBody}</p></div>
        <ol className={styles.authorityLedger}>{c.authority.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      </section>

      <section id={locale === "en" ? "approach" : "aanpak"} className={styles.method}>
        <div><p className={styles.eyebrow}>{c.methodEyebrow}</p><h2>{c.methodTitle}</h2></div>
        <ol>{c.method.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><i aria-hidden="true"/><h3>{title}</h3><p>{body}</p></li>)}</ol>
      </section>

      <section id="booking" className={styles.pricing}>
        <div className={styles.pricingIntro}><p className={styles.eyebrow}>{c.priceEyebrow}</p><h2>{c.priceTitle}</h2><p>{c.priceBody}</p></div>
        <LivingBlueprintCalculator locale={locale}/>
      </section>

      <section className={styles.finalCta}><div><p className={styles.eyebrow}>{c.finalEyebrow}</p><h2>{c.finalTitle}</h2><p>{c.finalBody}</p><Link className={styles.primaryButton} href={scanHref}>{c.cta}</Link></div></section>
    </main>
    <PublicFooter locale={locale} showYear />
  </div>;
}
