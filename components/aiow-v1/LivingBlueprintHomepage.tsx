import Link from "next/link";
import { CustomerOutcomes } from "./CustomerOutcomes";
import type { CSSProperties } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { LivingBlueprintCalculator } from "./LivingBlueprintCalculator";
import { HumanIndustrialHero } from "./HumanIndustrialHero";
import { HomepageMotionDirector } from "./HomepageMotionDirector";
import { AIOW_COMPANY, aiowAddressLine } from "@/lib/aiow-v1/company.mjs";
import styles from "./LivingBlueprintHomepage.module.css";

type Locale = "nl" | "en";

const copy = {
  nl: {
    systemsEyebrow: "Drie omgevingen · één AIOW",
    systemsTitle: "Gebouwd voor uw wereld.",
    systemsIntro: "Van software tot gebouwtechniek: wij ontwerpen het systeem rond de plek waar het waarde moet leveren.",
    stageLabels: ["Signaal", "AI interpreteert", "Systeem handelt begrensd", "Mens beslist"],
    categories: [
      {
        id: "werk", title: "Werk", promise: "Minder overdracht. Meer aandacht voor wat alleen mensen kunnen.", href: "/ai-automatisering",
        trace: ["Een aanvraag, document of terugkerende taak komt binnen.", "AI herkent inhoud, context en afgesproken regels.", "Website, interne app, CRM of administratie ontvangt een voorstel of gecontroleerde update.", "Een medewerker keurt uitzonderingen goed en kan corrigeren of stoppen."],
        examples: ["Bedrijfsprocessen automatiseren", "Websites en klantomgevingen bouwen", "Interne apps ontwikkelen", "CRM, ERP en administratie koppelen", "Documenten en communicatie verwerken"],
      },
      {
        id: "bedrijfspanden", title: "Bedrijfspanden", promise: "Gebouw, energie en operatie werken als één beheerst systeem.", href: "/smart-office",
        trace: ["Een sensor, installatie, planning of melding geeft een signaal.", "AI combineert gebruik, instellingen en bekende grenzen.", "Een klimaat-, toegangs-, onderhouds- of energiemaatregel wordt voorgesteld of begrensd uitgevoerd.", "De beheerder bepaalt limieten, keurt uitzonderingen goed en kan altijd ingrijpen."],
        examples: ["Energie en verduurzaming", "Klimaat, ventilatie en verlichting", "Toegang en bezoekersstromen", "Sensoren en bezetting", "Onderhoud en facilitaire meldingen", "Product- en leveranciersadvies"],
      },
      {
        id: "woningen", title: "Woningen & villa’s", promise: "Comfort en woontechniek die zich voegen naar uw leven.", href: "/home",
        trace: ["Een bewoner, agenda, apparaat of sensor geeft een signaal.", "AI past voorkeuren, moment en afgesproken huisregels toe.", "Verlichting, klimaat, zonwering, energie of een melding reageert binnen de ingestelde grenzen.", "De bewoner kan iedere actie aanpassen, weigeren of volledig stoppen."],
        examples: ["Verlichting, klimaat en zonwering", "Energie en verduurzaming", "Toegang en beveiligingsintegraties", "Netwerk, media en entertainment", "Slimme producten samenbrengen", "Aankoopadvies en beheer"],
      },
    ],
    explore: "Ontdek de mogelijkheden",
    detailLabel: "Bekijk hoe dit systeem werkt",
    examplesLabel: "Mogelijke toepassingen",
    methodEyebrow: "Van vraag naar dagelijks beheer",
    methodTitle: "Eén rustige route naar een werkend systeem.",
    method: [
      ["Scan", "We onderzoeken één proces of ruimte en maken afhankelijkheden zichtbaar."],
      ["Scope", "Samen leggen we grenzen, uitzonderingen en fysieke werkzaamheden vast."],
      ["Bouw", "We implementeren gefaseerd en toetsen met de mensen die ermee werken."],
      ["Beheer", "We monitoren, onderhouden en verbeteren gecontroleerd."],
    ],
    priceEyebrow: "Publieke indicatie",
    priceTitle: "Eerst helderheid. Dan een prijs.",
    priceBody: "Kies één concrete route voor een transparante indicatie. Brede werk-, pand- en woningprojecten krijgen een prijs na geverifieerde scope.",
    priceDelivery: [["Direct downloaden", "Na vastlegging start uw persoonlijke PDF direct."], ["Dezelfde PDF per e-mail", "U ontvangt een controleerbare kopie op het ingevulde adres."]],
    finalEyebrow: "Uw eerste besluit",
    finalTitle: "Begin met één proces of één ruimte.",
    finalBody: "In maximaal circa 30 minuten brengen we bronnen, regels en afhankelijkheden in kaart.",
    cta: "Start de scan",
    finalMeta: "Gratis · een mens bevestigt datum en tijd · u beslist pas na het memo.",
    scopeBoundary: "Hardware, levering, fysieke installatie en werk van gekwalificeerde partners worden afzonderlijk gescoped.",
  },
  en: {
    systemsEyebrow: "Three environments · one AIOW",
    systemsTitle: "Built for your world.",
    systemsIntro: "From software to building technology: we design the system around the place where it must create value.",
    stageLabels: ["Signal", "AI interprets", "System acts within limits", "Person decides"],
    categories: [
      {
        id: "work", title: "Work", promise: "Less handover. More attention for what only people can do.", href: "/en/ai-automation",
        trace: ["A request, document or recurring task arrives.", "AI recognises content, context and agreed rules.", "A website, internal app, CRM or administration receives a proposal or controlled update.", "A team member approves exceptions and can correct or stop."],
        examples: ["Automate business processes", "Build websites and customer environments", "Develop internal apps", "Connect CRM, ERP and administration", "Process documents and communication"],
      },
      {
        id: "commercial-buildings", title: "Commercial buildings", promise: "Building, energy and operations work as one controlled system.", href: "/en/smart-office",
        trace: ["A sensor, installation, schedule or notification produces a signal.", "AI combines usage, settings and known boundaries.", "A climate, access, maintenance or energy measure is proposed or executed within limits.", "The manager sets limits, approves exceptions and can always intervene."],
        examples: ["Energy and sustainability", "Climate, ventilation and lighting", "Access and visitor flows", "Sensors and occupancy", "Maintenance and facility reports", "Product and supplier advice"],
      },
      {
        id: "homes", title: "Homes & villas", promise: "Comfort and home technology that adapt to your life.", href: "/en/home",
        trace: ["A resident, calendar, device or sensor produces a signal.", "AI applies preferences, timing and agreed home rules.", "Lighting, climate, shading, energy or a notification responds within configured limits.", "The resident can adjust, reject or stop every action."],
        examples: ["Lighting, climate and shading", "Energy and sustainability", "Access and security integrations", "Network, media and entertainment", "Connect smart products", "Purchase advice and management"],
      },
    ],
    explore: "Explore the possibilities",
    detailLabel: "See how this system works",
    examplesLabel: "Possible applications",
    methodEyebrow: "From question to daily management",
    methodTitle: "One calm route to a working system.",
    method: [
      ["Scan", "We examine one process or space and expose its dependencies."],
      ["Scope", "Together we define boundaries, exceptions and physical work."],
      ["Build", "We implement in phases and test with the people who use it."],
      ["Manage", "We monitor, maintain and improve under control."],
    ],
    priceEyebrow: "Public indication",
    priceTitle: "Clarity first. Then a price.",
    priceBody: "Choose one concrete route for a transparent indication. Broader work, building and home projects are priced after verified scope.",
    priceDelivery: [["Download directly", "Your personal PDF starts after the indication is recorded."], ["The same PDF by email", "A verifiable copy is sent to the address you enter."]],
    finalEyebrow: "Your first decision",
    finalTitle: "Start with one process or one space.",
    finalBody: "In about 30 minutes maximum, we map the sources, rules and dependencies.",
    cta: "Start the scan",
    finalMeta: "Free · a person confirms date and time · you decide only after the memo.",
    scopeBoundary: "Hardware, delivery, physical installation and qualified partner work are scoped separately.",
  },
} as const;

export function LivingBlueprintHomepage({ locale = "nl" }: { locale?: Locale }) {
  const c = copy[locale];
  const scanHref = locale === "en" ? "/en/scan" : "/scan";

  return <div className={styles.site}>
    <HomepageMotionDirector />
    <PublicHeader locale={locale} compactMobile showCta={false} variant="human-industrial" />
    <main>
      <HumanIndustrialHero locale={locale} />

      <CustomerOutcomes locale={locale} />

      <section id="pricing" className={styles.pricing}>
        <div className={styles.pricingIntro} data-reveal="section"><p className={styles.eyebrow}>{c.priceEyebrow}</p><h2>{c.priceTitle}</h2><p>{c.priceBody}</p><dl className={styles.quoteDelivery}>{c.priceDelivery.map(([title,body],index)=><div key={title}><dt><span>0{index+1}</span>{title}</dt><dd>{body}</dd></div>)}</dl></div>
        <div data-reveal="instrument"><LivingBlueprintCalculator locale={locale}/></div>
      </section>

      <section id={locale === "en" ? "systems" : "systemen"} className={styles.environments}>
        <header className={styles.sectionIntro} data-reveal="section">
          <p className={styles.eyebrow}>{c.systemsEyebrow}</p>
          <h2>{c.systemsTitle}</h2>
          <p>{c.systemsIntro}</p>
        </header>
        <div className={styles.environmentList}>
          {c.categories.map((category) => <article key={category.id} id={category.id} data-reveal="row">
            <div className={styles.environmentLead}>
              <h3>{category.title}</h3>
              <p>{category.promise}</p>
              <Link href={category.href}>{c.explore}<span aria-hidden="true">↗</span></Link>
            </div>
            <details>
              <summary>{c.detailLabel}</summary>
              <ol>{category.trace.map((step, index) => <li key={step}><small>{c.stageLabels[index]}</small><p>{step}</p></li>)}</ol>
              <div className={styles.examples}><strong>{c.examplesLabel}</strong><ul>{category.examples.map((example) => <li key={example}>{example}</li>)}</ul></div>
            </details>
          </article>)}
        </div>
      </section>

      <section id={locale === "en" ? "approach" : "aanpak"} className={styles.method}>
        <header className={styles.sectionIntro} data-reveal="section"><p className={styles.eyebrow}>{c.methodEyebrow}</p><h2>{c.methodTitle}</h2></header>
        <ol>{c.method.map(([title, body], index) => <li key={title} data-reveal="step" style={{ "--reveal-order": index % 3 } as CSSProperties}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalDecision}>
          <div className={styles.finalIntro} data-reveal="section">
            <p className={styles.eyebrow}>{c.finalEyebrow}</p>
            <h2>{c.finalTitle}</h2>
            <p>{c.finalBody}</p>
            <Link className={styles.primaryButton} href={scanHref}>{c.cta}<span aria-hidden="true">↗</span></Link>
            <p className={styles.finalMeta}>{c.finalMeta}</p>
            <p className={styles.scopeBoundary}>{c.scopeBoundary}</p>
          </div>
          <div data-reveal="instrument"><p className={styles.identity}>{AIOW_COMPANY.legalName} · {aiowAddressLine()} · KvK {AIOW_COMPANY.chamberOfCommerce} · <a href={`mailto:${AIOW_COMPANY.publicEmail}`}>{AIOW_COMPANY.publicEmail}</a></p></div>
        </div>
      </section>
    </main>
    <PublicFooter locale={locale} showYear />
  </div>;
}
