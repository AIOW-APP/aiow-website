import Link from "next/link";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { LivingBlueprintCalculator } from "./LivingBlueprintCalculator";
import { ThreeWorldsBlueprint } from "./ThreeWorldsBlueprint";
import { AIOW_COMPANY, aiowAddressLine } from "@/lib/aiow-v1/company.mjs";
import styles from "./LivingBlueprintHomepage.module.css";

type Locale = "nl" | "en";

const copy = {
  nl: {
    eyebrow: "AIOW · ontwerpt · bouwt · koppelt · beheert",
    title: <>AI voor uw <em>werk</em>, uw <em>bedrijfspand</em> en uw <em>woning</em>.</>,
    lead: "Wij bouwen de digitale systemen die uw bedrijf, gebouw of villa slimmer laten werken. U bepaalt wat er gebeurt.",
    cta: "Laat één proces of ruimte scannen",
    secondary: "Bekijk hoe AIOW werkt",
    ctaNote: "Gratis · maximaal circa 30 minuten · u ontvangt een beslismemo. Hardware, fysieke installatie en partnerwerk worden apart gescoped.",
    trust: ["AIOW B.V. · Hoofddorp", "Menselijke bevestiging", "Stoppen blijft mogelijk"],
    systemsEyebrow: "Drie omgevingen · één werkwijze",
    systemsTitle: "Concreet genoeg om te begrijpen. Begrensd genoeg om te vertrouwen.",
    systemsIntro: "Onderstaande voorbeelden laten de systeemstructuur zien. Het zijn geen klantcases, garanties of inbegrepen hardware.",
    stageLabels: ["Signaal", "AI-interpretatie", "Begrensde actie of systeem", "Menselijke bevoegdheid"],
    categories: [
      {
        id: "werk", index: "01", title: "Werk", promise: "AI die uw bedrijf slimmer laat werken.", href: "/ai-automatisering",
        trace: ["Een aanvraag, document of terugkerende taak komt binnen.", "AI herkent inhoud, context en afgesproken regels.", "Website, interne app, CRM of administratie ontvangt een voorstel of gecontroleerde update.", "Een medewerker keurt uitzonderingen goed en kan corrigeren of stoppen."],
        examples: ["Bedrijfsprocessen automatiseren", "Websites en klantomgevingen bouwen", "Interne apps ontwikkelen", "CRM, ERP en administratie koppelen", "Documenten en communicatie verwerken"],
      },
      {
        id: "bedrijfspanden", index: "02", title: "Bedrijfspanden", promise: "AI die installaties, informatie en processen laat samenwerken.", href: "/smart-office",
        trace: ["Een sensor, installatie, planning of melding geeft een signaal.", "AI combineert gebruik, instellingen en bekende grenzen.", "Een klimaat-, toegangs-, onderhouds- of energiemaatregel wordt voorgesteld of begrensd uitgevoerd.", "De beheerder bepaalt limieten, keurt uitzonderingen goed en kan altijd ingrijpen."],
        examples: ["Energie en verduurzaming", "Klimaat, ventilatie en verlichting", "Toegang en bezoekersstromen", "Sensoren en bezetting", "Onderhoud en facilitaire meldingen", "Product- en leveranciersadvies"],
      },
      {
        id: "woningen", index: "03", title: "Woningen & villa’s", promise: "AI die comfort, veiligheid en woontechniek laat samenwerken.", href: "/home",
        trace: ["Een bewoner, agenda, apparaat of sensor geeft een signaal.", "AI past voorkeuren, moment en afgesproken huisregels toe.", "Verlichting, klimaat, zonwering, energie of een melding reageert binnen de ingestelde grenzen.", "De bewoner kan iedere actie aanpassen, weigeren of volledig stoppen."],
        examples: ["Verlichting, klimaat en zonwering", "Energie en verduurzaming", "Toegang en beveiligingsintegraties", "Netwerk, media en entertainment", "Slimme producten samenbrengen", "Aankoopadvies en beheer"],
      },
    ],
    examplesLabel: "Mogelijke toepassingen",
    categoryLink: "Bekijk deze categorie",
    authorityEyebrow: "Uw gezag · onze verantwoordelijkheid",
    authorityTitle: "U bepaalt de regel. Wij bouwen wat eronder werkt.",
    authority: [
      ["U bepaalt", "Doel, bronnen, grenzen en bevoegde mensen."],
      ["AIOW bouwt", "Het systeem, de koppelingen en de controlepunten."],
      ["AI handelt", "Alleen binnen de afgesproken route en bevoegdheid."],
      ["Een mens grijpt in", "Goedkeuren, begrenzen en stoppen blijft mogelijk."],
    ],
    methodEyebrow: "Van eerste vraag naar dagelijks beheer",
    methodTitle: "Scan. Scope. Bouw. Beheer.",
    method: [
      ["Scan", "Eén proces of ruimte. U ontvangt een beslismemo met bronnen, afhankelijkheden en advies."],
      ["Scope", "Samen leggen we grenzen, uitzonderingen, fysieke werkzaamheden en bevoegdheid vast."],
      ["Bouw", "Gefaseerde implementatie, getoetst met de mensen die ermee werken."],
      ["Beheer", "Monitoring, onderhoud en gecontroleerde verbetering."],
    ],
    priceEyebrow: "Publieke indicatie",
    priceTitle: "Eerst zien wat gebouwd wordt. Dan wat het kost.",
    priceBody: "Kies hieronder één concrete route. Dit is geen universele prijs voor alle werk-, pand- en woningprojecten; de definitieve prijs volgt na geverifieerde scope.",
    finalEyebrow: "Een concreet eerste besluit",
    finalTitle: "Neem één proces of één ruimte mee.",
    finalBody: "Wij scannen de bronnen, regels en afhankelijkheden rond één concrete situatie.",
    finalMeta: "Gratis · maximaal circa 30 minuten · een mens bevestigt datum en tijd. U beslist pas na het memo; stoppen blijft mogelijk.",
    scopeBoundary: "Fysieke grens: hardware, levering, installatie en werk waarvoor een gekwalificeerde partner nodig is, vallen pas binnen de opdracht wanneer dat schriftelijk is gescoped.",
    memoLabel: "Wat u ontvangt · het beslismemo",
    memo: ["Wat gebouwd kan worden", "Welke systemen en afhankelijkheden nodig zijn", "Wat van hardware of partners afhangt", "Grenzen, uitzonderingen en wie bevoegd blijft", "Advies over scope en vervolg"],
  },
  en: {
    eyebrow: "AIOW · designs · builds · connects · manages",
    title: <>AI for your <em>work</em>, your <em>commercial building</em> and your <em>home</em>.</>,
    lead: "We build the digital systems that help your business, building or villa work more intelligently. You decide what happens.",
    cta: "Scan one process or space",
    secondary: "See how AIOW works",
    ctaNote: "Free · about 30 minutes maximum · you receive a decision memo. Hardware, physical installation and partner work are scoped separately.",
    trust: ["AIOW B.V. · Hoofddorp", "Human confirmation", "Stopping remains possible"],
    systemsEyebrow: "Three environments · one method",
    systemsTitle: "Concrete enough to understand. Bounded enough to trust.",
    systemsIntro: "These examples show system structure. They are not customer cases, guarantees or included hardware.",
    stageLabels: ["Signal", "AI interpretation", "Bounded action or system", "Human authority"],
    categories: [
      {
        id: "work", index: "01", title: "Work", promise: "AI that helps your business work more intelligently.", href: "/en/ai-automation",
        trace: ["A request, document or recurring task arrives.", "AI recognises content, context and agreed rules.", "A website, internal app, CRM or administration receives a proposal or controlled update.", "A team member approves exceptions and can correct or stop."],
        examples: ["Automate business processes", "Build websites and customer environments", "Develop internal apps", "Connect CRM, ERP and administration", "Process documents and communication"],
      },
      {
        id: "commercial-buildings", index: "02", title: "Commercial buildings", promise: "AI that connects installations, information and operations.", href: "/en/smart-office",
        trace: ["A sensor, installation, schedule or notification produces a signal.", "AI combines usage, settings and known boundaries.", "A climate, access, maintenance or energy measure is proposed or executed within limits.", "The manager sets limits, approves exceptions and can always intervene."],
        examples: ["Energy and sustainability", "Climate, ventilation and lighting", "Access and visitor flows", "Sensors and occupancy", "Maintenance and facility reports", "Product and supplier advice"],
      },
      {
        id: "homes", index: "03", title: "Homes & villas", promise: "AI that connects comfort, safety and home technology.", href: "/en/home",
        trace: ["A resident, calendar, device or sensor produces a signal.", "AI applies preferences, timing and agreed home rules.", "Lighting, climate, shading, energy or a notification responds within configured limits.", "The resident can adjust, reject or stop every action."],
        examples: ["Lighting, climate and shading", "Energy and sustainability", "Access and security integrations", "Network, media and entertainment", "Connect smart products", "Purchase advice and management"],
      },
    ],
    examplesLabel: "Possible applications",
    categoryLink: "View this category",
    authorityEyebrow: "Your authority · our responsibility",
    authorityTitle: "You define the rule. We build what works beneath it.",
    authority: [
      ["You define", "Purpose, sources, boundaries and authorised people."],
      ["AIOW builds", "The system, integrations and control points."],
      ["AI acts", "Only within the agreed route and authority."],
      ["A person intervenes", "Approval, limitation and stopping remain possible."],
    ],
    methodEyebrow: "From first question to daily management",
    methodTitle: "Scan. Scope. Build. Manage.",
    method: [
      ["Scan", "One process or space. You receive a decision memo with sources, dependencies and advice."],
      ["Scope", "Together we define boundaries, exceptions, physical work and authority."],
      ["Build", "Phased implementation, tested with the people who use it."],
      ["Manage", "Monitoring, maintenance and controlled improvement."],
    ],
    priceEyebrow: "Public indication",
    priceTitle: "First see what is built. Then what it costs.",
    priceBody: "Choose one concrete route below. This is not a universal price for every work, building and home project; the final price follows verified scope.",
    finalEyebrow: "A concrete first decision",
    finalTitle: "Bring one process or one space.",
    finalBody: "We scan the sources, rules and dependencies around one concrete situation.",
    finalMeta: "Free · about 30 minutes maximum · a person confirms date and time. You decide only after the memo; stopping remains possible.",
    scopeBoundary: "Physical boundary: hardware, delivery, installation and work requiring a qualified partner enter the assignment only when explicitly scoped in writing.",
    memoLabel: "What you receive · the decision memo",
    memo: ["What can be built", "Which systems and dependencies are needed", "What depends on hardware or partners", "Boundaries, exceptions and who remains authorised", "Advice on scope and next steps"],
  },
} as const;

export function LivingBlueprintHomepage({ locale = "nl" }: { locale?: Locale }) {
  const c = copy[locale];
  const scanHref = locale === "en" ? "/en/scan" : "/scan";
  return <div className={styles.site}>
    <PublicHeader locale={locale} compactMobile showCta={false} />
    <main>
      <section id={locale === "en" ? "solutions" : "oplossingen"} className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className={styles.lead}>{c.lead}</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href={scanHref}>{c.cta}</Link><a className={styles.textLink} href={locale === "en" ? "#systems" : "#systemen"}>{c.secondary}</a></div>
          <p className={styles.ctaNote}>{c.ctaNote}</p>
          <div className={styles.trustRail}>{c.trust.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
        <ThreeWorldsBlueprint locale={locale} />
      </section>

      <section id={locale === "en" ? "systems" : "systemen"} className={styles.categorySystems}>
        <header><p className={styles.eyebrow}>{c.systemsEyebrow}</p><h2>{c.systemsTitle}</h2><p>{c.systemsIntro}</p></header>
        <div className={styles.systemLedgers}>
          {c.categories.map((category) => <article key={category.id} id={category.id}>
            <div className={styles.categoryHeading}><span>{category.index}</span><div><h3>{category.title}</h3><p>{category.promise}</p></div></div>
            <ol className={styles.trace}>{category.trace.map((step, index) => <li key={step}><small>{c.stageLabels[index]}</small><p>{step}</p></li>)}</ol>
            <details><summary>{c.examplesLabel}</summary><ul>{category.examples.map((example) => <li key={example}>{example}</li>)}</ul></details>
            <Link href={category.href}>{c.categoryLink}</Link>
          </article>)}
        </div>
      </section>

      <section className={styles.authority}>
        <div className={styles.authorityIntro}><p className={styles.eyebrow}>{c.authorityEyebrow}</p><h2>{c.authorityTitle}</h2></div>
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

      <section className={styles.finalCta}>
        <div className={styles.finalDecision}>
          <div className={styles.finalIntro}><p className={styles.eyebrow}>{c.finalEyebrow}</p><h2>{c.finalTitle}</h2><p>{c.finalBody}</p><Link className={styles.primaryButton} href={scanHref}>{c.cta}</Link><p className={styles.finalMeta}>{c.finalMeta}</p><p className={styles.scopeBoundary}>{c.scopeBoundary}</p></div>
          <div className={styles.memo}><p>{c.memoLabel}</p><ol>{c.memo.map((item,index)=><li key={item}><span>0{index+1}</span><b>{item}</b></li>)}</ol><p className={styles.identity}>{AIOW_COMPANY.legalName} · {aiowAddressLine()} · KvK {AIOW_COMPANY.chamberOfCommerce} · <a href={`mailto:${AIOW_COMPANY.publicEmail}`}>{AIOW_COMPANY.publicEmail}</a></p></div>
        </div>
      </section>
    </main>
    <PublicFooter locale={locale} showYear />
  </div>;
}
