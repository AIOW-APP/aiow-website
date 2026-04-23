/**
 * AIOW Toren — 12 industrieën, elk eigen gebouw met 5-10 deuren (AI-toepassingen).
 * Elke laatste deur = 🏛️ AIOW-kamer (contact/scan/offerte).
 *
 * Content-source-of-truth. Alles wat de site toont komt hier uit.
 */

export type DoorId = string;
export type IndustryId =
  | "zzp" | "mkb"
  | "juridisch" | "accountancy" | "bouw" | "horeca"
  | "ecommerce" | "logistiek" | "zorg" | "vastgoed" | "marketing"
  | "overige";

export type Door = {
  id: DoorId;
  title: string;          // "Contract-review"
  emoji: string;          // "⚖️"
  subtitle: string;       // korte oneliner voor op de deur
  tagline: string;        // iets langer, voor in de kamer
  howItWorks: string[];   // 3 stappen, punt-gewijs
  result: string;         // concrete impact ("uren-per-week teruggewonnen")
  priceFrom: string;      // "vanaf €X/mo" of "Op maat"
  liveIn: string;         // "live in 5-10 werkdagen"
  videoSrc?: string;      // pad naar Kling-video als achtergrond
  accent?: string;        // optionele tailwind-gradient klasse
};

export type Industry = {
  id: IndustryId;
  label: string;          // "Juridisch"
  emoji: string;          // "⚖️"
  type: "size" | "branche" | "overige";
  buildingName: string;   // "Het Rechtshuis"
  buildingTagline: string;// "Jouw praktijk, minder administratie, meer zaak-inhoud."
  buildingDescription: string; // 2-3 zinnen voor binnenkomst
  heroImage: string;      // "/buildings/building_juridisch.webp"
  doors: Door[];
  ready: boolean;         // true = volledig uitgeschreven, false = skeleton
};

// ───── Herbruikbare AIOW-kamer (contact/scan/CTA) ─────
const aiowRoom = (industryLabel: string, industryFocus: string): Door => ({
  id: "aiow-kamer",
  title: "De AIOW-kamer",
  emoji: "🏛️",
  subtitle: "Praat met ons. Plan. Scan. Start.",
  tagline: `Wil je ${industryFocus}? Stap hier binnen. Geen verkoop-praatje, wel een eerlijk gesprek.`,
  howItWorks: [
    "Plan een korte intake (30 min, online of live)",
    "We analyseren samen waar AI voor jou het snelst waarde levert",
    "Je krijgt een concreet voorstel — geen lange offerte-theaters",
  ],
  result: "Binnen 1 week duidelijkheid over jouw AIOW-pad.",
  priceFrom: "Intake gratis",
  liveIn: "Vandaag nog bellen kan",
  accent: "from-amber-500/40 to-rose-500/20",
});

// ───── Alle industrieën ─────
export const INDUSTRIES: Industry[] = [
  // 1. ZZP
  {
    id: "zzp",
    label: "ZZP'er",
    emoji: "🧍",
    type: "size",
    buildingName: "Het Atelier",
    buildingTagline: "Jouw werk, zonder de rompslomp eromheen.",
    buildingDescription:
      "Als solo-ondernemer ben jij het bedrijf. AIOW geeft je een stille kompaan die mails sorteert, offertes opstelt, facturen stuurt en je social voedt — zodat jij kunt doen waar je goed in bent.",
    heroImage: "/buildings/building_zzp.webp",
    ready: true,
    doors: [
      {
        id: "email",
        title: "Email-triage",
        emoji: "📬",
        subtitle: "Belangrijke mails eruit, de rest afgehandeld.",
        tagline: "Jouw inbox wordt gelezen, gesorteerd en beantwoord — jij leest alleen wat je moet lezen.",
        howItWorks: [
          "AIOW scant je inbox 24/7 via Gmail/Outlook-koppeling",
          "Prioriteiten omhoog, routine-antwoorden voorgesteld",
          "Jij accepteert of past aan — in 30 seconden klaar",
        ],
        result: "Gemiddeld 6-8 uur per week terug.",
        priceFrom: "Vanaf €49/mo",
        liveIn: "Live in 2-3 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "offertes",
        title: "Offertes",
        emoji: "📄",
        subtitle: "Van klantvraag naar offerte in 3 min.",
        tagline: "Klant belt of mailt — jij dicteert, AIOW maakt de offerte in jouw stijl, branded en klaar om te sturen.",
        howItWorks: [
          "Je spreekt of typt de klant-details in",
          "AIOW genereert offerte met jouw templates, prijzen, voorwaarden",
          "Jij checkt, verstuurt met 1 klik",
        ],
        result: "Van 45 min naar 3 min per offerte.",
        priceFrom: "Vanaf €39/mo",
        liveIn: "Live in 2 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      {
        id: "facturatie",
        title: "Facturatie",
        emoji: "🪙",
        subtitle: "Je factureert nooit meer handmatig.",
        tagline: "Project-af = factuur eruit. Automatisch, op tijd, met BTW kloppend.",
        howItWorks: [
          "Koppeling met je agenda/projectmanagement",
          "AIOW herkent 'afgerond' en maakt factuur aan",
          "Automatisch incasso-herinnering bij te laat betalen",
        ],
        result: "Cashflow 14 dagen sneller.",
        priceFrom: "Vanaf €29/mo",
        liveIn: "Live in 1-2 werkdagen",
        accent: "from-amber-500/30 to-yellow-600/10",
      },
      {
        id: "social",
        title: "Social content",
        emoji: "📻",
        subtitle: "Één post per week, automatisch.",
        tagline: "AIOW maakt van jouw werk (foto's, projecten, updates) automatisch LinkedIn/Instagram posts.",
        howItWorks: [
          "Je dropt foto's/notes in een Telegram-chat met AIOW",
          "AIOW maakt 2-3 post-varianten in jouw tone-of-voice",
          "Jij kiest, post of laat auto-publishen",
        ],
        result: "Consistent zichtbaar zonder 2u/week copywriting.",
        priceFrom: "Vanaf €59/mo",
        liveIn: "Live in 3-5 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "klantvragen",
        title: "Klantvragen",
        emoji: "💬",
        subtitle: "Antwoord-bot voor je standaardvragen.",
        tagline: "Je website/WhatsApp krijgt een AIOW-chat die 80% van je vragen zelf beantwoordt.",
        howItWorks: [
          "AIOW leert van jouw eerdere mails en website",
          "Beantwoordt standaardvragen (prijzen, aanrijden, werkwijze)",
          "Draagt complexe vragen over aan jou",
        ],
        result: "24/7 bereikbaar zonder jij aanwezig hoeft.",
        priceFrom: "Vanaf €39/mo",
        liveIn: "Live in 3-5 werkdagen",
        accent: "from-lime-400/30 to-green-500/10",
      },
      aiowRoom("ZZP", "tijd terug voor wat jij het liefst doet"),
    ],
  },

  // 2. MKB
  {
    id: "mkb",
    label: "MKB",
    emoji: "🏢",
    type: "size",
    buildingName: "Het Bedrijfspand",
    buildingTagline: "Jouw bedrijf slimmer, zonder extra mensen aannemen.",
    buildingDescription:
      "Bij 2-50 medewerkers staat schaalbaarheid of rust onder druk. AIOW brengt ondersteuning op alle fronten — email, voorraad, HR, klantservice — zodat je team zich kan richten op wat echt groei oplevert.",
    heroImage: "/buildings/building_mkb.webp",
    ready: true,
    doors: [
      {
        id: "email",
        title: "Email-triage",
        emoji: "📬",
        subtitle: "Team-inboxen onder controle.",
        tagline: "Info@, sales@, support@ worden getrieerd en doorgestuurd naar de juiste persoon — of direct beantwoord.",
        howItWorks: [
          "Integreert met Gmail/Outlook shared mailboxes",
          "Classificeert, routeert, genereert concept-antwoorden",
          "Team accepteert of past aan",
        ],
        result: "Responstijd van 8u naar <1u.",
        priceFrom: "Vanaf €199/mo",
        liveIn: "Live in 5-10 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "voorraad",
        title: "Voorraad & inkoop",
        emoji: "📦",
        subtitle: "Nooit meer out-of-stock of overstock.",
        tagline: "AIOW voorspelt je vraag en triggert inkoop automatisch.",
        howItWorks: [
          "Leest verkoop-data uit je ERP/shop",
          "Voorspelt per product de aankomende vraag",
          "Stelt inkooporder voor of plaatst automatisch bij vertrouwde leverancier",
        ],
        result: "15-25% minder voorraadkosten.",
        priceFrom: "Vanaf €299/mo",
        liveIn: "Live in 10-15 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      {
        id: "hr",
        title: "HR & sollicitaties",
        emoji: "👥",
        subtitle: "CV-screening in minuten.",
        tagline: "Vacature-reacties worden getriëerd, kandidaten gerankt, afspraken ingepland.",
        howItWorks: [
          "Vacature publiceren via jouw kanaal",
          "AIOW screent binnenkomende CV's tegen profiel",
          "Top-kandidaten krijgen automatisch intake-uitnodiging",
        ],
        result: "60% minder tijd in screening.",
        priceFrom: "Vanaf €149/mo",
        liveIn: "Live in 5-10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "klantservice",
        title: "Klantservice",
        emoji: "💬",
        subtitle: "24/7 eerste lijn zonder extra FTE.",
        tagline: "Chatbot + email-bot handelt standaardvragen af. Escaleert naar team bij complexiteit.",
        howItWorks: [
          "Integreert met je website, WhatsApp Business, mail",
          "Leert uit jullie handleiding + eerdere tickets",
          "Overdracht naar team met volledige context",
        ],
        result: "70% self-service, 30% kwalitatiever menselijk contact.",
        priceFrom: "Vanaf €249/mo",
        liveIn: "Live in 7-14 werkdagen",
        accent: "from-lime-400/30 to-green-500/10",
      },
      {
        id: "content",
        title: "Content & marketing",
        emoji: "📻",
        subtitle: "Social + nieuwsbrief + website, automatisch.",
        tagline: "Van één input (nieuws, klant-win, update) maakt AIOW LinkedIn, nieuwsbrief en blog.",
        howItWorks: [
          "Team dropt input in shared kanaal",
          "AIOW maakt multi-channel content in brand-tone",
          "Marketing checkt, publiceert",
        ],
        result: "3× meer output, zelfde team.",
        priceFrom: "Vanaf €199/mo",
        liveIn: "Live in 7 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "financieel",
        title: "Financieel overzicht",
        emoji: "📊",
        subtitle: "Cijfers die je team-breed snapt.",
        tagline: "Wekelijkse dashboards + alerts bij afwijkingen, geen Excel-gepuzzel meer.",
        howItWorks: [
          "Koppeling met boekhoudpakket (Exact, Moneybird, etc.)",
          "AIOW maakt wekelijks/maandelijks overzicht",
          "Alert bij margin-drop, late betalers, cashflow-risk",
        ],
        result: "Finance-inzicht van maand-einde naar realtime.",
        priceFrom: "Vanaf €179/mo",
        liveIn: "Live in 5-10 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      aiowRoom("MKB", "groei zonder lineair meer mensen nodig te hebben"),
    ],
  },

  // 3. Juridisch
  {
    id: "juridisch",
    label: "Juridisch",
    emoji: "⚖️",
    type: "branche",
    buildingName: "Het Rechtshuis",
    buildingTagline: "Jouw praktijk. Minder administratie. Meer zaak-inhoud.",
    buildingDescription:
      "Advocaten, notarissen en juristen besteden 30-40% van hun tijd aan non-billable werk. AIOW pakt dat aan: contract-review, intake-triage, dossieropbouw, en cliëntcommunicatie — zonder concessies op vertrouwelijkheid.",
    heroImage: "/buildings/building_juridisch.webp",
    ready: true,
    doors: [
      {
        id: "contract-review",
        title: "Contract-review",
        emoji: "📜",
        subtitle: "Contract in, risico-analyse uit.",
        tagline: "AIOW leest NDA's, SLA's, koopcontracten en markeert risico's, afwijkingen en standaard-tekortkomingen.",
        howItWorks: [
          "Upload contract (PDF, DOCX)",
          "AIOW scant tegen jouw firm-standaard en wetgeving",
          "Output: risico-matrix + suggesties per artikel",
        ],
        result: "Review-tijd van 2u naar 15 min.",
        priceFrom: "Vanaf €349/mo",
        liveIn: "Live in 10 werkdagen",
        accent: "from-amber-500/30 to-orange-500/10",
      },
      {
        id: "dossier-intake",
        title: "Dossier-intake",
        emoji: "📂",
        subtitle: "Nieuwe zaak? Dossier bouwt zichzelf op.",
        tagline: "Cliëntmail + bijlagen worden geclassificeerd, samengevat en in dossierstructuur geplaatst.",
        howItWorks: [
          "Cliënt mailt of stuurt bijlagen",
          "AIOW leest, structureert en maakt dossier-samenvatting",
          "Jurist start met complete briefing in 5 min",
        ],
        result: "Per nieuwe zaak 1-2 uur onboarding-tijd bespaard.",
        priceFrom: "Vanaf €249/mo",
        liveIn: "Live in 7 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "clientcontact",
        title: "Cliënt-triage",
        emoji: "💬",
        subtitle: "Cliëntvragen sneller, zonder stapeltjes.",
        tagline: "Status-vragen, termijn-checks, standaardantwoorden — getriëerd en beantwoord zonder jurist-betrokkenheid.",
        howItWorks: [
          "AIOW-portaal of mail-bot begrijpt cliëntvraag",
          "Beantwoordt routine, escaleert complexiteit",
          "Alle communicatie gelogd in dossier",
        ],
        result: "Cliënt-NPS omhoog, jurist-tijd terug.",
        priceFrom: "Vanaf €199/mo",
        liveIn: "Live in 7-14 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "facturatie",
        title: "Uurtje-factuurtje",
        emoji: "🪙",
        subtitle: "Tijdregistratie en factuur, automatisch.",
        tagline: "Je Outlook/agenda wordt tijdregistratie. AIOW maakt maand-facturen per cliënt klaar.",
        howItWorks: [
          "Koppeling met agenda + email + zaak-tagging",
          "AIOW suggereert billable uren per dag",
          "Einde maand: factuur-concept, jij accepteert",
        ],
        result: "Billable-uren-capture 15-25% hoger.",
        priceFrom: "Vanaf €179/mo",
        liveIn: "Live in 5 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "compliance",
        title: "Compliance-check",
        emoji: "🛡️",
        subtitle: "AVG, Wwft, KYC — doorlopend gecheckt.",
        tagline: "AIOW monitort cliëntdossiers en interne flows op compliance-gaps.",
        howItWorks: [
          "Maandelijkse scan van dossiers + processen",
          "Alerts bij missende KYC-documenten, verlopen ID's",
          "Rapportage richting compliance-officer",
        ],
        result: "Compliance-risico's vroeg gezien, niet bij audit.",
        priceFrom: "Vanaf €229/mo",
        liveIn: "Live in 10 werkdagen",
        accent: "from-red-400/30 to-rose-500/10",
      },
      {
        id: "kyc",
        title: "KYC-intake",
        emoji: "🔐",
        subtitle: "Cliënt-identificatie in 10 min, niet 2u.",
        tagline: "Volledige Wwft-compliant intake geautomatiseerd — UBO-check, PEP-screening, document-review.",
        howItWorks: [
          "Cliënt vult AIOW-intake via portaal in",
          "AIOW verifieert ID, checkt UBO en PEP-lists",
          "Jurist krijgt complete intake-map, signed-off",
        ],
        result: "Nieuwe cliënt: van 2u admin naar 10 min.",
        priceFrom: "Vanaf €299/mo",
        liveIn: "Live in 10-14 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      aiowRoom("Juridisch", "een praktijk waar jij aan de zaak kunt werken, niet aan de administratie"),
    ],
  },

  // 4-11: skeleton (ready: false)
  {
    id: "accountancy", label: "Accountancy", emoji: "🧾", type: "branche",
    buildingName: "Het Cijferhuis",
    buildingTagline: "Van boeken bijhouden naar advies geven.",
    buildingDescription: "AIOW neemt de repeterende boekhoud-admin over zodat jouw kantoor advies-uren kan draaien.",
    heroImage: "/buildings/building_accountancy.webp",
    ready: false,
    doors: [aiowRoom("Accountancy", "meer advies-tijd, minder boek-tijd")],
  },
  {
    id: "bouw", label: "Bouw", emoji: "🏗️", type: "branche",
    buildingName: "De Bouwplaats",
    buildingTagline: "Van calculatie tot oplevering, digitaal georganiseerd.",
    buildingDescription: "AIOW helpt bij calculaties, klantmail, voortgangsrapportages en foto-documentatie van projecten.",
    heroImage: "/buildings/building_bouw.webp",
    ready: false,
    doors: [aiowRoom("Bouw", "projecten zonder administratieve achterstand")],
  },
  {
    id: "horeca", label: "Horeca", emoji: "🍽️", type: "branche",
    buildingName: "Het Huis van Gastvrijheid",
    buildingTagline: "Jij host. AIOW runt de rest.",
    buildingDescription: "AIOW regelt reserveringen, inkoop, reviews, social en personeelsplanning — zodat jij op de vloer kan staan.",
    heroImage: "/buildings/building_horeca.webp",
    ready: false,
    doors: [aiowRoom("Horeca", "meer op de vloer, minder achter de computer")],
  },
  {
    id: "ecommerce", label: "E-commerce", emoji: "📦", type: "branche",
    buildingName: "Het Magazijn",
    buildingTagline: "Van klik tot bezorging, AI-geoptimaliseerd.",
    buildingDescription: "AIOW optimaliseert voorraad, productteksten, reviews, ads en klantservice voor webshops.",
    heroImage: "/buildings/building_ecommerce.webp",
    ready: false,
    doors: [aiowRoom("E-commerce", "meer omzet zonder meer uren")],
  },
  {
    id: "logistiek", label: "Logistiek", emoji: "🚚", type: "branche",
    buildingName: "Het Depot",
    buildingTagline: "Routes, planning, klanten — real-time afgestemd.",
    buildingDescription: "AIOW optimaliseert routes, houdt klanten op de hoogte en regelt facturatie.",
    heroImage: "/buildings/building_logistiek.webp",
    ready: false,
    doors: [aiowRoom("Logistiek", "minder kilometers, meer leveringen")],
  },
  {
    id: "zorg", label: "Zorg", emoji: "❤️", type: "branche",
    buildingName: "De Zorgpost",
    buildingTagline: "Meer tijd voor patiënt, minder voor dossier.",
    buildingDescription: "AIOW regelt afspraken, triage, declaraties en herhaalrecepten voor zorginstellingen.",
    heroImage: "/buildings/building_zorg.webp",
    ready: false,
    doors: [aiowRoom("Zorg", "meer tijd voor patiënten")],
  },
  {
    id: "vastgoed", label: "Vastgoed", emoji: "🏘️", type: "branche",
    buildingName: "Het Makelaarskantoor",
    buildingTagline: "Van bezichtiging tot sleuteloverdracht, gestroomlijnd.",
    buildingDescription: "AIOW regelt bezichtigingen, woning-teksten, lead-opvolging, contracten en taxatie-ondersteuning.",
    heroImage: "/buildings/building_vastgoed.webp",
    ready: false,
    doors: [aiowRoom("Vastgoed", "meer sleutels overgedragen per maand")],
  },
  {
    id: "marketing", label: "Marketing", emoji: "🎨", type: "branche",
    buildingName: "De Studio",
    buildingTagline: "Creatieve teams die 3× meer produceren.",
    buildingDescription: "AIOW versnelt content, social, SEO/GEO, leadgen en rapportages voor marketingbureaus.",
    heroImage: "/buildings/building_marketing.webp",
    ready: false,
    doors: [aiowRoom("Marketing", "meer creatief werk, minder repetitief werk")],
  },

  // 12. Overige
  {
    id: "overige",
    label: "Overige",
    emoji: "🏛️",
    type: "overige",
    buildingName: "Het AIOW-Hoofdkantoor",
    buildingTagline: "Past jouw bedrijf nergens in? Stap hier binnen.",
    buildingDescription:
      "Niet elke branche is een hokje. Bij AIOW bouwen we maatwerk voor bedrijven die niet standaard zijn. Dit is ons hoofdkantoor — je ziet alle AI-mogelijkheden die we leveren, je kiest wat bij jou past.",
    heroImage: "/buildings/building_overige.webp",
    ready: true,
    doors: [
      {
        id: "email",
        title: "Email & communicatie",
        emoji: "📬",
        subtitle: "Elke inbox, elke mailbox, beheerst.",
        tagline: "AIOW triage, concepten, auto-reply en escalatie — werkt met elk mail-platform.",
        howItWorks: ["Inbox-analyse", "Auto-classificatie + concept-antwoorden", "Team-escalatie met context"],
        result: "Respons-tijd -80%, focus-tijd +30%",
        priceFrom: "Vanaf €99/mo",
        liveIn: "Live in 3-7 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "documenten",
        title: "Documenten & contracten",
        emoji: "📄",
        subtitle: "Doc-review, versies, signing.",
        tagline: "Upload, review, highlight, sign — alles in één AI-flow.",
        howItWorks: ["Document-ingest met OCR", "AI-review tegen jouw templates", "Digitaal signeren"],
        result: "Verwerkingstijd per document -70%",
        priceFrom: "Vanaf €149/mo",
        liveIn: "Live in 7 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "klantcontact",
        title: "Klantcontact",
        emoji: "💬",
        subtitle: "Chat + mail + WhatsApp + telefoon.",
        tagline: "Multi-channel AI-klantcontact dat schaalt zonder meer team.",
        howItWorks: ["Kanaal-integratie (alle 4)", "Knowledge-base getraind op jouw docs", "Mens-overdracht met volledige context"],
        result: "24/7 bereikbaarheid, 60% self-service",
        priceFrom: "Vanaf €249/mo",
        liveIn: "Live in 10 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "content",
        title: "Content & marketing",
        emoji: "📻",
        subtitle: "Social, blog, nieuwsbrief, ads.",
        tagline: "Eén input, meerdere outputs, in jouw tone-of-voice.",
        howItWorks: ["Brand-voice training", "Multi-channel generatie", "Human review + publish"],
        result: "3× meer output, zelfde team",
        priceFrom: "Vanaf €179/mo",
        liveIn: "Live in 7 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "finance",
        title: "Finance & facturatie",
        emoji: "🪙",
        subtitle: "Facturen, incasso, cashflow-alerts.",
        tagline: "AIOW koppelt aan je boekhoudpakket en automatiseert het hele proces.",
        howItWorks: ["Boekhoud-integratie", "Factuur-generatie + incasso-flows", "Cashflow-dashboard"],
        result: "Cashflow 14 dagen sneller",
        priceFrom: "Vanaf €149/mo",
        liveIn: "Live in 5-10 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "hr",
        title: "HR & intake",
        emoji: "👥",
        subtitle: "Van vacature tot onboarding.",
        tagline: "CV-screening, interview-planning, onboarding-flows.",
        howItWorks: ["Vacature-publicatie", "AI-screening + ranking", "Onboarding-automatisering"],
        result: "HR-admin -60%",
        priceFrom: "Vanaf €129/mo",
        liveIn: "Live in 5-10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "planning",
        title: "Planning & agenda",
        emoji: "📅",
        subtitle: "Agenda's die zichzelf optimaliseren.",
        tagline: "AIOW plant meetings, routes, shifts — optimaal voor je doel.",
        howItWorks: ["Agenda-koppeling", "AI-planning op beschikbaarheid + prioriteit", "Automatische heruitnodigingen"],
        result: "Minder agenda-Tetris, meer productieve uren",
        priceFrom: "Vanaf €99/mo",
        liveIn: "Live in 5 werkdagen",
        accent: "from-teal-400/30 to-cyan-500/10",
      },
      {
        id: "data",
        title: "Data & inzicht",
        emoji: "📊",
        subtitle: "Dashboards die jouw vragen beantwoorden.",
        tagline: "AIOW bouwt dashboards + answer-bot op jouw bedrijfsdata.",
        howItWorks: ["Data-sources koppelen", "Custom dashboards", "Vraag-antwoord op eigen data"],
        result: "Beslissingen op feiten, niet onderbuik",
        priceFrom: "Vanaf €199/mo",
        liveIn: "Live in 10-15 werkdagen",
        accent: "from-blue-400/30 to-indigo-500/10",
      },
      {
        id: "integraties",
        title: "Integraties",
        emoji: "🔌",
        subtitle: "Jouw systemen praten met elkaar.",
        tagline: "AIOW verbindt CRM, ERP, mail, boekhouding, shop — data stroomt.",
        howItWorks: ["Systeem-audit", "API-integraties bouwen", "Workflow-automatisering"],
        result: "Data-silo's weg, team werkt op 1 bron",
        priceFrom: "Op maat",
        liveIn: "3-6 weken",
        accent: "from-emerald-400/30 to-green-500/10",
      },
      {
        id: "custom",
        title: "Custom AI op maat",
        emoji: "🧪",
        subtitle: "Specifiek probleem? We bouwen het.",
        tagline: "Voor unieke uitdagingen bouwen we een custom AI-oplossing op jouw data, proces, stack.",
        howItWorks: ["Discovery-call + probleem-diagnose", "Proof-of-concept in 2-4 weken", "Productie-release + beheer"],
        result: "AI-oplossing die niemand anders heeft",
        priceFrom: "Op maat",
        liveIn: "4-12 weken",
        accent: "from-fuchsia-400/30 to-pink-500/10",
      },
      aiowRoom("jouw bedrijf", "een AI-stack die bij jouw exacte situatie past"),
    ],
  },
];

export const getIndustry = (id: string): Industry | undefined =>
  INDUSTRIES.find((i) => i.id === id);

export const getDoor = (industryId: string, doorId: string): Door | undefined =>
  getIndustry(industryId)?.doors.find((d) => d.id === doorId);
