import Link from "next/link";
import styles from "./AiowPrototypePage.module.css";

type Lang = "en" | "nl";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aiow.ai";
const WHATSAPP_URL = "https://wa.me/31621898039";
const LEGAL_ENTITY = "AIOW BV";
const KVK = "71887466";
const ADDRESS = "Bijlmermeerstraat 30, 2131HC Hoofddorp, Nederland";
const PHONE_DISPLAY = "+31 6 21 89 80 39";

type Copy = {
  lang: Lang;
  otherLang: Lang;
  eyebrow: string;
  nav: string[];
  heroTitle: string;
  heroBody: string;
  primaryCta: string;
  secondaryCta: string;
  placeholder: string;
  problemTitle: string;
  problemBody: string;
  whatTitle: string;
  whatBody: string;
  stepsTitle: string;
  steps: string[];
  audiencesTitle: string;
  audiences: { title: string; body: string }[];
  systemsTitle: string;
  systems: { title: string; body: string }[];
  trustTitle: string;
  trust: string[];
  offerTitle: string;
  offerBody: string;
  formTitle: string;
  fields: string[];
  consent: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  footer: string;
};


const fieldFragments = [
  { key: "people", x: "8%", y: "18%", dx: "94%", dy: "70%", delay: "0s" },
  { key: "docs", x: "70%", y: "12%", dx: "22%", dy: "82%", delay: ".25s" },
  { key: "devices", x: "12%", y: "74%", dx: "88%", dy: "18%", delay: ".5s" },
  { key: "tools", x: "82%", y: "36%", dx: "18%", dy: "40%", delay: ".75s" },
  { key: "hardware", x: "42%", y: "84%", dx: "48%", dy: "14%", delay: "1s" },
  { key: "cloud", x: "50%", y: "7%", dx: "52%", dy: "86%", delay: "1.25s" },
  { key: "agents", x: "5%", y: "48%", dx: "96%", dy: "46%", delay: "1.5s" },
  { key: "permissions", x: "66%", y: "72%", dx: "28%", dy: "22%", delay: "1.75s" },
  { key: "evidence", x: "26%", y: "30%", dx: "76%", dy: "58%", delay: "2s" },
] as const;

const fieldCopy: Record<Lang, { title: string; subtitle: string; labels: Record<(typeof fieldFragments)[number]["key"], string>; core: string[]; stages: string[] }> = {
  en: {
    title: "AIOW System Field",
    subtitle: "Scattered work, people, devices and models become one governed AI work layer.",
    labels: { people: "people", docs: "docs", devices: "devices", tools: "tools", hardware: "local hardware", cloud: "cloud models", agents: "agents", permissions: "permissions", evidence: "evidence" },
    core: ["Memory", "Tools", "Local AI", "Approval", "Proof"],
    stages: ["Scattered context", "Policy routing", "Governed handoff"],
  },
  nl: {
    title: "AIOW System Field",
    subtitle: "Losse mensen, documenten, devices en modellen worden één bestuurbare AI-werklaag.",
    labels: { people: "mensen", docs: "docs", devices: "devices", tools: "tools", hardware: "lokale hardware", cloud: "cloudmodellen", agents: "agents", permissions: "permissies", evidence: "bewijs" },
    core: ["Geheugen", "Tools", "Lokale AI", "Goedkeuring", "Bewijs"],
    stages: ["Losse context", "Policy routing", "Bewaakte overdracht"],
  },
};

const copy: Record<Lang, Copy> = {
  en: {
    lang: "en",
    otherLang: "nl",
    eyebrow: "Personal AI systems for business, teams, people and smart homes",
    nav: ["What it is", "Systems", "Privacy", "Scan"],
    heroTitle: "Not a chatbot. Your own AI system.",
    heroBody:
      "AIOW designs personal AI systems that remember context, route work, use approved tools and connect local or hybrid AI hardware, from MKB operations around Schiphol logistics to private smart homes with Sonos and Philips Hue.",
    primaryCta: "Plan a free AI system scan",
    secondaryCta: "Explore AI systems",
    placeholder: "WhatsApp is the verified contact route. Forms and analytics remain disabled until their destinations are safely configured.",
    problemTitle: "Chatbots answer. A real AI system carries context across your life and work.",
    problemBody:
      "Most AI tools live in one browser tab. They do not understand your company, devices, routines, approvals or handoffs. AIOW maps the AI work layer around you: people, workflows, data, hardware, home devices and safety rules.",
    whatTitle: "A personal AI work layer, local where useful, cloud where approved.",
    whatBody:
      "AIOW can combine team AI workers, workflow automation, local private AI-infrastructuur AI hardware, smart-home controls and human approval gates. The result is not loose automation; it is a governed AI system with ownership, memory and proof.",
    stepsTitle: "How the free AI system scan works",
    steps: [
      "Map your business, team, individual or smart-home goals.",
      "Find repeat work, privacy constraints and device opportunities.",
      "Choose local, cloud or hybrid model routing by policy.",
      "Design approval gates for sensitive or external actions.",
      "Ship one useful first system before expanding.",
    ],
    audiencesTitle: "Built for the full AIOW offer",
    audiences: [
      { title: "MKB operators", body: "Inbox, quotes, planning, support, CRM prep and internal handoffs without losing human control." },
      { title: "Schiphol & logistics", body: "Operational briefings, shift handovers, supplier follow-up and exception routing for time-sensitive work." },
      { title: "Teams", body: "A small network of AI workers for research, planning, customer follow-up, QA and daily coordination." },
      { title: "Individuals", body: "Private assistants that remember preferences, organize tasks and help with documents, planning and routines." },
      { title: "Smart homes", body: "AI control concepts for Sonos, Philips Hue, scenes, notifications and household automations." },
      { title: "Local AI hardware", body: "private AI infrastructure setups for private inference, local memory and hybrid AI routing where it matters." },
    ],
    systemsTitle: "What an AIOW system can include",
    systems: [
      { title: "Personal AI workers", body: "Role-based agents with identity, memory, owner, next step and evidence." },
      { title: "Workflow systems", body: "Defined intake, routing, drafting, review and follow-up paths for real operations." },
      { title: "Local / hybrid AI", body: "Private local models on Mac hardware plus approved cloud models for tasks that need them." },
      { title: "Smart-device layer", body: "Home and office integrations such as Sonos, Philips Hue and device-aware routines." },
      { title: "Human approval", body: "External, public, destructive or sensitive actions stay behind explicit approval rules." },
      { title: "Proof and handoff", body: "Status, reasoning, sources and next steps are visible instead of buried in chat history." },
    ],
    trustTitle: "Privacy, control and governance by design",
    trust: [
      "AI system scan identifies what should stay local, what can go cloud and what should not be automated.",
      "Managed private AI infrastructure can reduce unnecessary data movement for suitable workloads.",
      "Human approval before external/public/destructive actions.",
      "Audit trails and handoff notes for teams, households and operational workflows.",
      "No unsupported retention, savings or benchmark promises in this prototype.",
    ],
    offerTitle: "Start with a free AI system scan.",
    offerBody:
      "We inspect your current work, devices, privacy needs and repetitive tasks, then propose one concrete AIOW system: for your business, team, personal workflow or smart home. The first build stays small, fast and measurable.",
    formTitle: "AI system scan via WhatsApp",
    fields: ["Name", "Email", "Company / household", "Business, team, individual or smart home", "What should your AI system help with?"],
    consent: "By contacting us through WhatsApp, only share information you are allowed to share. We discuss privacy boundaries before any AI processing.",
    faqTitle: "AI system FAQ draft",
    faqs: [
      { q: "What is AIOW?", a: "AIOW builds personal AI systems: connected workers, workflows, memory, tools, devices, approval rules and local or hybrid model routing around a specific person, team or business." },
      { q: "How is AIOW different from a chatbot?", a: "A chatbot mostly answers inside one conversation. AIOW is designed as an AI work layer that can keep context, route tasks, connect approved tools and hand work off safely." },
      { q: "Can AIOW help MKB or Schiphol logistics companies?", a: "Yes. The system scan looks for practical workflows such as inbox triage, planning, supplier follow-up, shift notes, exception routing and operational briefings." },
      { q: "Can AIOW control smart-home devices?", a: "AIOW can design smart-home AI concepts around devices such as Sonos and Philips Hue, with explicit permission rules before sensitive actions." },
      { q: "Can AIOW use local AI models?", a: "Yes. AIOW can use private AI infrastructure such as a private AI infrastructure where privacy, latency or control make local inference useful, with cloud models by approved policy." },
    ],
    footer: "WhatsApp is the primary verified contact route. Forms and analytics remain disabled until their destinations are safely configured.",
  },
  nl: {
    lang: "nl",
    otherLang: "en",
    eyebrow: "Persoonlijke AI-systemen voor bedrijven, teams, mensen en smart homes",
    nav: ["Wat het is", "Systemen", "Privacy", "Scan"],
    heroTitle: "Geen chatbot. Uw eigen AI-systeem.",
    heroBody:
      "AIOW ontwerpt persoonlijke AI-systemen die context onthouden, werk routeren, goedgekeurde tools gebruiken en lokale of hybride AI-hardware koppelen, van MKB-operatie rond Schiphol/logistics tot privé smart homes met Sonos en Philips Hue.",
    primaryCta: "Plan een gratis AI-systeemscan",
    secondaryCta: "Bekijk AI-systemen",
    placeholder: "WhatsApp is de geverifieerde contactroute. Formulieren en analytics blijven uit tot bestemmingen veilig zijn geconfigureerd.",
    problemTitle: "Chatbots geven antwoord. Een echt AI-systeem draagt context door werk en leven heen.",
    problemBody:
      "De meeste AI-tools zitten in één browservenster. Ze begrijpen uw bedrijf, apparaten, routines, approvals en overdrachten niet. AIOW brengt de AI-werklaag in kaart rond mensen, workflows, data, hardware, smart-home devices en veiligheidsregels.",
    whatTitle: "Een persoonlijke AI-werklaag, lokaal waar zinvol, cloud waar goedgekeurd.",
    whatBody:
      "AIOW combineert team-AI-workers, workflowautomatisering, lokale private AI-infrastructuur AI-hardware, smart-home aansturing en menselijke goedkeuring. Geen losse automatisering, maar een bestuurbaar AI-systeem met eigenaarschap, geheugen en bewijs.",
    stepsTitle: "Hoe de gratis AI-systeemscan werkt",
    steps: [
      "Breng bedrijfs-, team-, individueel of smart-home doel in kaart.",
      "Vind herhaalwerk, privacygrenzen en device-kansen.",
      "Kies lokale, cloud of hybride modelrouting per beleid.",
      "Ontwerp approval gates voor gevoelige of externe acties.",
      "Lever één nuttig eerste systeem voordat we uitbreiden.",
    ],
    audiencesTitle: "Gebouwd voor het volledige AIOW-aanbod",
    audiences: [
      { title: "MKB-ondernemers", body: "Inbox, offertes, planning, support, CRM-voorbereiding en overdrachten zonder menselijke controle te verliezen." },
      { title: "Schiphol & logistics", body: "Operationele briefings, shift-handover, supplier follow-up en exception routing voor tijdkritisch werk." },
      { title: "Teams", body: "Een klein netwerk van AI-workers voor research, planning, klantopvolging, QA en dagelijkse coördinatie." },
      { title: "Particulieren", body: "Private assistants die voorkeuren onthouden en helpen met taken, documenten, planning en routines." },
      { title: "Smart homes", body: "AI-concepten voor Sonos, Philips Hue, scenes, notificaties en huisautomatisering." },
      { title: "Lokale AI-hardware", body: "private AI-infrastructuur voor private inference, lokale memory en hybride AI-routing waar dat telt." },
    ],
    systemsTitle: "Wat een AIOW-systeem kan bevatten",
    systems: [
      { title: "Persoonlijke AI-workers", body: "Rolgebaseerde agents met identiteit, geheugen, eigenaar, volgende stap en bewijs." },
      { title: "Workflow-systemen", body: "Duidelijke intake, routing, drafting, review en opvolging voor echte operatie." },
      { title: "Lokale / hybride AI", body: "Private lokale modellen op Mac-hardware plus goedgekeurde cloudmodellen waar nodig." },
      { title: "Smart-device laag", body: "Home- en office-integraties zoals Sonos, Philips Hue en device-aware routines." },
      { title: "Menselijke goedkeuring", body: "Externe, publieke, destructieve of gevoelige acties blijven achter expliciete approval-regels." },
      { title: "Bewijs en overdracht", body: "Status, redenering, bronnen en volgende stappen blijven zichtbaar in plaats van verstopt in chatgeschiedenis." },
    ],
    trustTitle: "Privacy, controle en governance by design",
    trust: [
      "De AI-systeemscan bepaalt wat lokaal moet blijven, wat naar cloud kan en wat niet geautomatiseerd moet worden.",
      "Private AI-infrastructuur kunnen onnodige dataverplaatsing verminderen voor geschikte workloads.",
      "Menselijke goedkeuring vóór externe/publieke/destructieve acties.",
      "Audit trails en overdrachtsnotities voor teams, huishoudens en operationele workflows.",
      "Geen onbewezen retentie-, besparings- of benchmarkclaims in dit prototype.",
    ],
    offerTitle: "Start met een gratis AI-systeemscan.",
    offerBody:
      "We bekijken uw werk, apparaten, privacybehoefte en herhaaltaken, en vertalen dat naar één concreet AIOW-systeem: voor bedrijf, team, persoonlijke workflow of smart home. De eerste build blijft klein, snel en meetbaar.",
    formTitle: "AI-systeemscan via WhatsApp",
    fields: ["Naam", "E-mail", "Bedrijf / huishouden", "Bedrijf, team, particulier of smart home", "Waar moet uw AI-systeem mee helpen?"],
    consent: "Deel via WhatsApp alleen informatie die u mag delen. Privacygrenzen bespreken we vóórdat er AI-verwerking plaatsvindt.",
    faqTitle: "AI-systeem FAQ-concept",
    faqs: [
      { q: "Wat is AIOW?", a: "AIOW bouwt persoonlijke AI-systemen: verbonden workers, workflows, geheugen, tools, devices, approval-regels en lokale of hybride modelrouting rond een persoon, team of bedrijf." },
      { q: "Hoe verschilt AIOW van een chatbot?", a: "Een chatbot antwoordt vooral binnen één gesprek. AIOW is ontworpen als AI-werklaag die context bewaart, taken routeert, goedgekeurde tools koppelt en werk veilig overdraagt." },
      { q: "Kan AIOW MKB of Schiphol/logistics helpen?", a: "Ja. De systeemscan zoekt praktische workflows zoals inbox-triage, planning, supplier follow-up, shift-notities, exception routing en operationele briefings." },
      { q: "Kan AIOW smart-home apparaten aansturen?", a: "AIOW kan smart-home AI-concepten ontwerpen rond apparaten zoals Sonos en Philips Hue, met expliciete permissieregels voor gevoelige acties." },
      { q: "Kan AIOW lokale AI-modellen gebruiken?", a: "Ja. AIOW kan private AI-infrastructuur zoals private AI-infrastructuur gebruiken wanneer privacy, latency of controle lokale inference nuttig maakt, met cloudmodellen volgens goedgekeurd beleid." },
    ],
    footer: "WhatsApp is de primaire geverifieerde contactroute. Formulieren en analytics blijven uitgeschakeld tot bestemmingen veilig zijn geconfigureerd.",
  },
};

function SystemField({ lang }: { lang: Lang }) {
  const f = fieldCopy[lang];
  return (
    <div className={styles.systemField} aria-label={f.title}>
      <div className={styles.fieldHeader}>
        <span>{f.title}</span>
        <small>{f.subtitle}</small>
      </div>

      <div className={styles.fieldCanvas}>
        <svg className={styles.fieldLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M10 20 C30 42, 46 52, 50 50 C62 43, 74 23, 92 18" />
          <path d="M12 78 C32 65, 40 58, 50 50 C68 42, 78 48, 94 47" />
          <path d="M26 31 C36 38, 44 44, 50 50 C58 60, 64 70, 70 74" />
          <path d="M50 8 C49 26, 49 38, 50 50 C52 64, 52 76, 50 90" />
        </svg>

        {fieldFragments.map((item) => (
          <span
            key={item.key}
            className={styles.fragment}
            style={{
              left: item.x,
              top: item.y,
              "--dx": item.dx,
              "--dy": item.dy,
              "--delay": item.delay,
            } as React.CSSProperties}
          >
            {f.labels[item.key]}
          </span>
        ))}

        <div className={styles.governedCore}>
          <span className={styles.coreRing} />
          <strong>AIOW</strong>
          {f.core.map((item) => <em key={item}>{item}</em>)}
        </div>
      </div>

      <div className={styles.mobileField}>
        {f.stages.map((stage, i) => (
          <div key={stage} className={styles.stageCard}>
            <span>0{i + 1}</span>
            <strong>{stage}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiowPrototypePage({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "AIOW",
        legalName: LEGAL_ENTITY,
        url: SITE_URL,
        identifier: { "@type": "PropertyValue", propertyID: "KvK", value: KVK },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bijlmermeerstraat 30",
          postalCode: "2131HC",
          addressLocality: "Hoofddorp",
          addressCountry: "NL",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support / AI-systeemscan",
          telephone: PHONE_DISPLAY,
          url: WHATSAPP_URL,
          availableLanguage: ["nl", "en"],
        },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/${lang}#ai-system-scan`,
        name: "AIOW",
        serviceType: lang === "nl" ? "Persoonlijke AI-systemen en AI-systeemscan" : "Personal AI systems and AI system scan",
        provider: { "@id": `${SITE_URL}/#organization` },
        description: c.heroBody,
        areaServed: "NL/EU",
        keywords: ["AI-systeemscan", "MKB", "Schiphol logistics", "smart home AI", "Sonos", "Philips Hue", "private AI infrastructure"],
        offers: { "@type": "Offer", availability: "https://schema.org/PreOrder", price: "0", priceCurrency: "EUR", name: c.primaryCta, url: WHATSAPP_URL },
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className={styles.header}>
        <Link href={`/${lang}`} className={styles.logo} aria-label="AIOW home">AIOW</Link>
        <nav aria-label="Primary" className={styles.nav}>
          {c.nav.map((item, i) => <a key={item} href={["#what", "#systems", "#trust", "#scan"][i]}>{item}</a>)}
        </nav>
        <a className={styles.mobileScan} href="#scan">Plan scan →</a>
        <Link href={`/${c.otherLang}`} className={styles.lang}>{c.otherLang.toUpperCase()}</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1>{c.heroTitle}</h1>
          <p className={styles.lede}>{c.heroBody}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={WHATSAPP_URL} target="_blank" rel="noopener">{c.primaryCta}</a>
            <a className={styles.secondary} href="#systems">{c.secondaryCta}</a>
          </div>
          <p className={styles.placeholder}>{lang === "nl" ? `WhatsApp: ${PHONE_DISPLAY} · ${LEGAL_ENTITY} · KvK ${KVK}` : `WhatsApp: ${PHONE_DISPLAY} · ${LEGAL_ENTITY} · Dutch Chamber of Commerce ${KVK}`}</p>
        </div>
        <SystemField lang={lang} />
      </section>

      <section id="what" className={styles.split}>
        <div><p className={styles.kicker}>01</p><h2>{c.problemTitle}</h2></div>
        <p>{c.problemBody}</p>
        <div><p className={styles.kicker}>02</p><h2>{c.whatTitle}</h2></div>
        <p>{c.whatBody}</p>
      </section>

      <section className={styles.steps} aria-labelledby="steps-title">
        <h2 id="steps-title">{c.stepsTitle}</h2>
        <ol>{c.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>

      <section id="systems" className={styles.cards} aria-labelledby="audiences-title">
        <p className={styles.kicker}>03</p>
        <h2 id="audiences-title">{c.audiencesTitle}</h2>
        <div className={styles.grid}>{c.audiences.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </section>

      <section className={styles.cards} aria-labelledby="systems-title">
        <p className={styles.kicker}>04</p>
        <h2 id="systems-title">{c.systemsTitle}</h2>
        <div className={styles.grid}>{c.systems.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </section>

      <section id="trust" className={styles.trust}>
        <div><p className={styles.kicker}>05</p><h2>{c.trustTitle}</h2></div>
        <ul>{c.trust.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section id="scan" className={styles.pilot}>
        <div>
          <p className={styles.kicker}>06</p>
          <h2>{c.offerTitle}</h2>
          <p>{c.offerBody}</p>
        </div>
        <div className={styles.form} aria-label={c.formTitle}>
          <h3>{c.formTitle}</h3>
          <p>{lang === "nl" ? "We gebruiken nu bewust geen webformulier. Stuur de kern via WhatsApp; dan stemmen we eerst scope, privacygrenzen en vervolgstap af." : "We deliberately do not use a web form right now. Send the essentials through WhatsApp; we first align scope, privacy boundaries and next step."}</p>
          <ul>
            {c.fields.map((field) => <li key={field}>{field}</li>)}
          </ul>
          <p className={styles.formNote}>{c.consent}</p>
          <a className={styles.primary} href={WHATSAPP_URL} target="_blank" rel="noopener">{lang === "nl" ? "Stuur WhatsApp voor de AI-systeemscan" : "Send WhatsApp for the AI system scan"}</a>
        </div>
      </section>

      <section className={styles.faq}>
        <h2>{c.faqTitle}</h2>
        {c.faqs.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      </section>

      <footer className={styles.footer}>
        <p>{c.footer}</p>
        <p>{LEGAL_ENTITY} · KvK {KVK} · {ADDRESS}</p>
        <p><Link href={`/${lang}/privacy`}>Privacy</Link> · <Link href={`/${lang}/cookies`}>Cookies</Link> · <Link href={`/${lang}/terms`}>Terms</Link> · <a href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp</a></p>
        <p className={styles.footerLinks}>
          <Link href="/nl/ai-integratie-mkb">AI-integratie MKB</Link> · <Link href="/nl/ai-automatisering-logistiek-transport">Logistiek & transport</Link> · <Link href="/nl/lokale-private-ai">Lokale/private AI</Link> · <Link href="/nl/ai-systeemscan">AI-systeemscan</Link> · <Link href="/nl/regio/amsterdam">Amsterdam</Link> · <Link href="/nl/regio/rotterdam">Rotterdam</Link> · <Link href="/nl/regio/schiphol-haarlemmermeer">Schiphol/Haarlemmermeer</Link>
        </p>
      </footer>
    </main>
  );
}

export function PlaceholderPolicyPage({ lang, kind }: { lang: Lang; kind: "privacy" | "cookies" }) {
  const isNl = lang === "nl";
  const title = kind === "privacy" ? (isNl ? "Privacybeleid concept" : "Privacy policy draft") : (isNl ? "Cookiebeleid concept" : "Cookie policy draft");
  return (
    <main className={styles.policy}>
      <Link href={`/${lang}`} className={styles.logo}>AIOW</Link>
      <h1>{title}</h1>
      <p className={styles.warning}>{copy[lang].placeholder}</p>
      <p>{isNl ? `${LEGAL_ENTITY} is gevestigd aan ${ADDRESS} en ingeschreven bij de KvK onder nummer ${KVK}. Contact loopt in prelaunch via WhatsApp: ${PHONE_DISPLAY}.` : `${LEGAL_ENTITY} is based at ${ADDRESS} and registered with the Dutch Chamber of Commerce under number ${KVK}. During prelaunch, contact is handled via WhatsApp: ${PHONE_DISPLAY}.`}</p>
      <p>{isNl ? "Deze pagina is een Dutch-first concept en nog niet juridisch definitief. Voor publicatie zijn finale verwerkers, bewaartermijnen, grondslagen, cookiecategorieën en intakebestemming nodig." : "This page is a draft and not legally final. Public launch needs final processors, retention terms, legal bases, cookie categories and intake destination."}</p>
      <ul>
        <li>{isNl ? "Geen analytics, marketingpixels of Plausible-script actief zonder expliciete goedkeuring." : "No analytics, marketing pixels or Plausible script active without explicit approval."}</li>
        <li>{isNl ? "Formulieren zijn placeholders en verzenden niets; WhatsApp is de voorbereide contactroute." : "Forms are placeholders and submit nothing; WhatsApp is the prepared contact route."}</li>
        <li>{isNl ? "Pilotvoorbeelden blijven anoniem en claim-arm; geen verzonnen testimonials." : "Pilot examples stay anonymized and low-claim; no invented testimonials."}</li>
        <li>{isNl ? "Definitieve tekst vereist legal/privacy review." : "Final wording requires legal/privacy review."}</li>
      </ul>
      {kind === "cookies" ? (
        <p>{isNl ? "Cookie-standpunt: strikt noodzakelijke cookies alleen waar technisch nodig. Plausible is voorbereid als cookieless analytics-optie, maar niet geactiveerd. Geen advertentiecookies." : "Cookie stance: strictly necessary cookies only where technically required. Plausible is prepared as a cookieless analytics option, but not activated. No advertising cookies."}</p>
      ) : (
        <p>{isNl ? "Privacy-standpunt: dataminimalisatie, menselijke goedkeuring voor externe acties, lokale/private AI waar dat zinvol is en geen absolute privacyclaims zonder technische review." : "Privacy stance: data minimization, human approval for external actions, local/private AI where useful, and no absolute privacy claims without technical review."}</p>
      )}
    </main>
  );
}
