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
  title: string;
  emoji: string;
  subtitle: string;
  tagline: string;
  howItWorks: string[];
  result: string;
  priceFrom: string;
  liveIn: string;
  videoSrc?: string;
  accent?: string;
};

export type Industry = {
  id: IndustryId;
  label: string;
  emoji: string;
  type: "size" | "branche" | "overige";
  buildingName: string;
  buildingTagline: string;
  buildingDescription: string;
  heroImage: string;
  doors: Door[];
  ready: boolean;
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
        id: "email", title: "Email-triage", emoji: "📬",
        subtitle: "Belangrijke mails eruit, de rest afgehandeld.",
        tagline: "Jouw inbox wordt gelezen, gesorteerd en beantwoord — jij leest alleen wat je moet lezen.",
        howItWorks: [
          "AIOW scant je inbox 24/7 via Gmail/Outlook-koppeling",
          "Prioriteiten omhoog, routine-antwoorden voorgesteld",
          "Jij accepteert of past aan — in 30 seconden klaar",
        ],
        result: "Gemiddeld 6-8 uur per week terug.",
        priceFrom: "Vanaf €49/mo", liveIn: "Live in 2-3 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "offertes", title: "Offertes", emoji: "📄",
        subtitle: "Van klantvraag naar offerte in 3 min.",
        tagline: "Klant belt of mailt — jij dicteert, AIOW maakt de offerte in jouw stijl, branded en klaar om te sturen.",
        howItWorks: [
          "Je spreekt of typt de klant-details in",
          "AIOW genereert offerte met jouw templates, prijzen, voorwaarden",
          "Jij checkt, verstuurt met 1 klik",
        ],
        result: "Van 45 min naar 3 min per offerte.",
        priceFrom: "Vanaf €39/mo", liveIn: "Live in 2 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      {
        id: "facturatie", title: "Facturatie", emoji: "🪙",
        subtitle: "Je factureert nooit meer handmatig.",
        tagline: "Project-af = factuur eruit. Automatisch, op tijd, met BTW kloppend.",
        howItWorks: [
          "Koppeling met je agenda/projectmanagement",
          "AIOW herkent 'afgerond' en maakt factuur aan",
          "Automatisch incasso-herinnering bij te laat betalen",
        ],
        result: "Cashflow 14 dagen sneller.",
        priceFrom: "Vanaf €29/mo", liveIn: "Live in 1-2 werkdagen",
        accent: "from-amber-500/30 to-yellow-600/10",
      },
      {
        id: "social", title: "Social content", emoji: "📻",
        subtitle: "Één post per week, automatisch.",
        tagline: "AIOW maakt van jouw werk (foto's, projecten, updates) automatisch LinkedIn/Instagram posts.",
        howItWorks: [
          "Je dropt foto's/notes in een Telegram-chat met AIOW",
          "AIOW maakt 2-3 post-varianten in jouw tone-of-voice",
          "Jij kiest, post of laat auto-publishen",
        ],
        result: "Consistent zichtbaar zonder 2u/week copywriting.",
        priceFrom: "Vanaf €59/mo", liveIn: "Live in 3-5 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "klantvragen", title: "Klantvragen", emoji: "💬",
        subtitle: "Antwoord-bot voor je standaardvragen.",
        tagline: "Je website/WhatsApp krijgt een AIOW-chat die 80% van je vragen zelf beantwoordt.",
        howItWorks: [
          "AIOW leert van jouw eerdere mails en website",
          "Beantwoordt standaardvragen (prijzen, werkwijze, beschikbaarheid)",
          "Draagt complexe vragen over aan jou",
        ],
        result: "24/7 bereikbaar zonder jij aanwezig hoeft.",
        priceFrom: "Vanaf €39/mo", liveIn: "Live in 3-5 werkdagen",
        accent: "from-lime-400/30 to-green-500/10",
      },
      aiowRoom("ZZP", "tijd terug voor wat jij het liefst doet"),
    ],
  },

  // 2. MKB
  {
    id: "mkb", label: "MKB", emoji: "🏢", type: "size",
    buildingName: "Het Bedrijfspand",
    buildingTagline: "Jouw bedrijf slimmer, zonder extra mensen aannemen.",
    buildingDescription:
      "Bij 2-50 medewerkers staat schaalbaarheid of rust onder druk. AIOW brengt ondersteuning op alle fronten — email, voorraad, HR, klantservice — zodat je team zich kan richten op wat echt groei oplevert.",
    heroImage: "/buildings/building_mkb.webp",
    ready: true,
    doors: [
      {
        id: "email", title: "Email-triage", emoji: "📬",
        subtitle: "Team-inboxen onder controle.",
        tagline: "Info@, sales@, support@ worden getrieerd en doorgestuurd naar de juiste persoon — of direct beantwoord.",
        howItWorks: [
          "Integreert met Gmail/Outlook shared mailboxes",
          "Classificeert, routeert, genereert concept-antwoorden",
          "Team accepteert of past aan",
        ],
        result: "Responstijd van 8u naar <1u.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 5-10 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "voorraad", title: "Voorraad & inkoop", emoji: "📦",
        subtitle: "Nooit meer out-of-stock of overstock.",
        tagline: "AIOW voorspelt je vraag en triggert inkoop automatisch.",
        howItWorks: [
          "Leest verkoop-data uit je ERP/shop",
          "Voorspelt per product de aankomende vraag",
          "Stelt inkooporder voor of plaatst automatisch bij vertrouwde leverancier",
        ],
        result: "15-25% minder voorraadkosten.",
        priceFrom: "Vanaf €299/mo", liveIn: "Live in 10-15 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      {
        id: "hr", title: "HR & sollicitaties", emoji: "👥",
        subtitle: "CV-screening in minuten.",
        tagline: "Vacature-reacties worden getriëerd, kandidaten gerankt, afspraken ingepland.",
        howItWorks: [
          "Vacature publiceren via jouw kanaal",
          "AIOW screent binnenkomende CV's tegen profiel",
          "Top-kandidaten krijgen automatisch intake-uitnodiging",
        ],
        result: "60% minder tijd in screening.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 5-10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "klantservice", title: "Klantservice", emoji: "💬",
        subtitle: "24/7 eerste lijn zonder extra FTE.",
        tagline: "Chatbot + email-bot handelt standaardvragen af. Escaleert naar team bij complexiteit.",
        howItWorks: [
          "Integreert met je website, WhatsApp Business, mail",
          "Leert uit jullie handleiding + eerdere tickets",
          "Overdracht naar team met volledige context",
        ],
        result: "70% self-service, 30% kwalitatiever menselijk contact.",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 7-14 werkdagen",
        accent: "from-lime-400/30 to-green-500/10",
      },
      {
        id: "content", title: "Content & marketing", emoji: "📻",
        subtitle: "Social + nieuwsbrief + website, automatisch.",
        tagline: "Van één input (nieuws, klant-win, update) maakt AIOW LinkedIn, nieuwsbrief en blog.",
        howItWorks: [
          "Team dropt input in shared kanaal",
          "AIOW maakt multi-channel content in brand-tone",
          "Marketing checkt, publiceert",
        ],
        result: "3× meer output, zelfde team.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "financieel", title: "Financieel overzicht", emoji: "📊",
        subtitle: "Cijfers die je team-breed snapt.",
        tagline: "Wekelijkse dashboards + alerts bij afwijkingen, geen Excel-gepuzzel meer.",
        howItWorks: [
          "Koppeling met boekhoudpakket (Exact, Moneybird, etc.)",
          "AIOW maakt wekelijks/maandelijks overzicht",
          "Alert bij margin-drop, late betalers, cashflow-risk",
        ],
        result: "Finance-inzicht van maand-einde naar realtime.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 5-10 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      aiowRoom("MKB", "groei zonder lineair meer mensen nodig te hebben"),
    ],
  },

  // 3. Juridisch
  {
    id: "juridisch", label: "Juridisch", emoji: "⚖️", type: "branche",
    buildingName: "Het Rechtshuis",
    buildingTagline: "Jouw praktijk. Minder administratie. Meer zaak-inhoud.",
    buildingDescription:
      "Advocaten, notarissen en juristen besteden 30-40% van hun tijd aan non-billable werk. AIOW pakt dat aan: contract-review, intake-triage, dossieropbouw, en cliëntcommunicatie — zonder concessies op vertrouwelijkheid.",
    heroImage: "/buildings/building_juridisch.webp",
    ready: true,
    doors: [
      {
        id: "contract-review", title: "Contract-review", emoji: "📜",
        subtitle: "Contract in, risico-analyse uit.",
        tagline: "AIOW leest NDA's, SLA's, koopcontracten en markeert risico's, afwijkingen en standaard-tekortkomingen.",
        howItWorks: [
          "Upload contract (PDF, DOCX)",
          "AIOW scant tegen jouw firm-standaard en wetgeving",
          "Output: risico-matrix + suggesties per artikel",
        ],
        result: "Review-tijd van 2u naar 15 min.",
        priceFrom: "Vanaf €349/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-amber-500/30 to-orange-500/10",
      },
      {
        id: "dossier-intake", title: "Dossier-intake", emoji: "📂",
        subtitle: "Nieuwe zaak? Dossier bouwt zichzelf op.",
        tagline: "Cliëntmail + bijlagen worden geclassificeerd, samengevat en in dossierstructuur geplaatst.",
        howItWorks: [
          "Cliënt mailt of stuurt bijlagen",
          "AIOW leest, structureert en maakt dossier-samenvatting",
          "Jurist start met complete briefing in 5 min",
        ],
        result: "Per nieuwe zaak 1-2 uur onboarding-tijd bespaard.",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "clientcontact", title: "Cliënt-triage", emoji: "💬",
        subtitle: "Cliëntvragen sneller, zonder stapeltjes.",
        tagline: "Status-vragen, termijn-checks, standaardantwoorden — getriëerd en beantwoord zonder jurist-betrokkenheid.",
        howItWorks: [
          "AIOW-portaal of mail-bot begrijpt cliëntvraag",
          "Beantwoordt routine, escaleert complexiteit",
          "Alle communicatie gelogd in dossier",
        ],
        result: "Cliënt-NPS omhoog, jurist-tijd terug.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 7-14 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "facturatie", title: "Uurtje-factuurtje", emoji: "🪙",
        subtitle: "Tijdregistratie en factuur, automatisch.",
        tagline: "Je Outlook/agenda wordt tijdregistratie. AIOW maakt maand-facturen per cliënt klaar.",
        howItWorks: [
          "Koppeling met agenda + email + zaak-tagging",
          "AIOW suggereert billable uren per dag",
          "Einde maand: factuur-concept, jij accepteert",
        ],
        result: "Billable-uren-capture 15-25% hoger.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "compliance", title: "Compliance-check", emoji: "🛡️",
        subtitle: "AVG, Wwft, KYC — doorlopend gecheckt.",
        tagline: "AIOW monitort cliëntdossiers en interne flows op compliance-gaps.",
        howItWorks: [
          "Maandelijkse scan van dossiers + processen",
          "Alerts bij missende KYC-documenten, verlopen ID's",
          "Rapportage richting compliance-officer",
        ],
        result: "Compliance-risico's vroeg gezien, niet bij audit.",
        priceFrom: "Vanaf €229/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-red-400/30 to-rose-500/10",
      },
      {
        id: "kyc", title: "KYC-intake", emoji: "🔐",
        subtitle: "Cliënt-identificatie in 10 min, niet 2u.",
        tagline: "Volledige Wwft-compliant intake geautomatiseerd — UBO-check, PEP-screening, document-review.",
        howItWorks: [
          "Cliënt vult AIOW-intake via portaal in",
          "AIOW verifieert ID, checkt UBO en PEP-lists",
          "Jurist krijgt complete intake-map, signed-off",
        ],
        result: "Nieuwe cliënt: van 2u admin naar 10 min.",
        priceFrom: "Vanaf €299/mo", liveIn: "Live in 10-14 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      aiowRoom("Juridisch", "een praktijk waar jij aan de zaak kunt werken, niet aan de administratie"),
    ],
  },

  // 4. Accountancy
  {
    id: "accountancy", label: "Accountancy", emoji: "🧾", type: "branche",
    buildingName: "Het Cijferhuis",
    buildingTagline: "Van boeken bijhouden naar advies geven.",
    buildingDescription:
      "Accountants en boekhouders spenderen tot 60% van hun tijd aan repeterende invoer en matching. AIOW automatiseert de administratie zodat jouw kantoor uren vrijspeelt voor advies — waar de marge en het plezier zit.",
    heroImage: "/buildings/building_accountancy.webp",
    ready: true,
    doors: [
      {
        id: "boekingen", title: "Auto-boekingen", emoji: "🧮",
        subtitle: "Facturen invoeren? AIOW doet het.",
        tagline: "Inkomende facturen worden gelezen, gecodeerd en direct geboekt in Exact/Twinfield/Moneybird.",
        howItWorks: [
          "Factuur binnen (mail, upload, UBL) → OCR + AI classificatie",
          "Auto-boeking op juiste grootboekrekening en BTW-code",
          "Afwijkende gevallen: alert naar jou, 1-klik goedkeuren",
        ],
        result: "Boek-tijd -75%, fouten -60%.",
        priceFrom: "Vanaf €299/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "fiscaal", title: "Fiscaal Q&A", emoji: "💡",
        subtitle: "Cliënt-vragen met onderbouwing direct klaar.",
        tagline: "Getrainde AI op actuele Belastingdienst-regels + jouw firm-standpunten = snelle antwoorden met bronverwijzing.",
        howItWorks: [
          "Cliënt stelt vraag in portaal",
          "AIOW genereert antwoord + bronverwijzing + disclaimer",
          "Accountant reviewt, verstuurt met 1 klik",
        ],
        result: "Van 20 min naar 3 min per vraag.",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-amber-500/30 to-orange-500/10",
      },
      {
        id: "rapportages", title: "Jaarrapportages", emoji: "📊",
        subtitle: "Periode-afsluiting zonder avonden draaien.",
        tagline: "AIOW bouwt tussentijdse- en jaarrapportages automatisch op uit de boekhouddata.",
        howItWorks: [
          "Periode sluiten → AIOW bouwt rapportage-concept",
          "Narratieve sectie (MD&A) AI-geschreven op basis van cijfers",
          "Accountant controleert, ondertekent",
        ],
        result: "Rapport-doorlooptijd 2 weken → 2 dagen.",
        priceFrom: "Vanaf €349/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "klantportaal", title: "Cliëntportaal", emoji: "🗄️",
        subtitle: "Cliënten leveren documenten zelf aan — geordend.",
        tagline: "AIOW ontvangt, categoriseert, archiveert en jaagt ontbrekende stukken na.",
        howItWorks: [
          "Cliënt upload foto/PDF/mail via portaal",
          "AIOW classificeert (bon, factuur, bankafschrift) + tagt periode",
          "Weet wat mist → jaagt cliënt automatisch na",
        ],
        result: "Eind-periode pieken verdwijnen.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "kyc", title: "KYC & UBO", emoji: "🔐",
        subtitle: "Wwft-intake zonder mappen-werk.",
        tagline: "Nieuwe cliënt onboarden met volledig geautomatiseerde UBO-check + PEP-screening + ID-verificatie.",
        howItWorks: [
          "Cliënt doorloopt AIOW-intake (10 min)",
          "AIOW verifieert identiteit + UBO-structuur",
          "Compliance-rapport klaar in dossier",
        ],
        result: "Onboard-tijd 3u → 20 min.",
        priceFrom: "Vanaf €229/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "audit", title: "Audit-prep", emoji: "🔍",
        subtitle: "Controle-steekproeven en signaalanalyse.",
        tagline: "AIOW scant de administratie vooraf op afwijkingen, doet Benford-analyses en genereert de audit-trail.",
        howItWorks: [
          "AIOW analyseert transactie-stromen periodiek",
          "Markeert afwijkingen, dubbele boekingen, onlogische patronen",
          "Accountant start controle met pre-flight rapport",
        ],
        result: "Controleweek van 4 naar 2 dagen.",
        priceFrom: "Vanaf €399/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-red-400/30 to-rose-500/10",
      },
      aiowRoom("Accountancy", "meer advies-tijd, minder boek-tijd"),
    ],
  },

  // 5. Bouw
  {
    id: "bouw", label: "Bouw", emoji: "🏗️", type: "branche",
    buildingName: "De Bouwplaats",
    buildingTagline: "Van calculatie tot oplevering, digitaal georganiseerd.",
    buildingDescription:
      "Bouwondernemers verliezen projecten op administratie, niet op vakmanschap. AIOW regelt calculaties, klantmail, voortgangsrapportages en foto-documentatie — zodat jij je tijd besteedt aan bouwen, niet aan Excel.",
    heroImage: "/buildings/building_bouw.webp",
    ready: true,
    doors: [
      {
        id: "calculaties", title: "Calculaties", emoji: "📐",
        subtitle: "Van bestek naar offerte in uren, niet dagen.",
        tagline: "AIOW leest bestekken, tekeningen en vraagspecificaties en maakt gedetailleerde calculaties in jouw template.",
        howItWorks: [
          "Upload bestek / PDF / DWG-tekeningen",
          "AIOW extraheert posten, past jouw eenheidsprijzen toe",
          "Calculator reviewt, past aan, verstuurt offerte",
        ],
        result: "Calculatietijd 2 dagen → 3 uur.",
        priceFrom: "Vanaf €399/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-amber-500/30 to-orange-500/10",
      },
      {
        id: "planning", title: "Planning", emoji: "📅",
        subtitle: "Werkvoorbereiding zonder puzzelen.",
        tagline: "AIOW plant vakmensen, materieel en onderaannemers op projectfase — met signalen bij conflicten.",
        howItWorks: [
          "Project-fases ingevoerd in AIOW",
          "AIOW plant op beschikbaarheid + afhankelijkheden",
          "Alert bij vertraging, herplanning 1-klik",
        ],
        result: "Minder leegloop, meer projecten parallel.",
        priceFrom: "Vanaf €279/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "klantmail", title: "Klantcommunicatie", emoji: "💬",
        subtitle: "Opdrachtgevers up-to-date zonder mail-wall.",
        tagline: "Wekelijkse voortgangsupdates automatisch — mét foto's en planning-status.",
        howItWorks: [
          "AIOW verzamelt foto's + planning + urenregistratie",
          "Maakt wekelijkse klant-update in jouw brand-stijl",
          "Projectleider accordeert, verstuurt",
        ],
        result: "Opdrachtgevers rustiger, minder telefoontjes.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "offertes", title: "Offertes & meerwerk", emoji: "📄",
        subtitle: "Meerwerk binnen het uur op papier.",
        tagline: "Foto + korte spraak-opname van de bouwplaats → offerte voor meerwerk automatisch in mail naar klant.",
        howItWorks: [
          "Werf-voorman spreekt in + foto via WhatsApp",
          "AIOW maakt meerwerk-offerte met eenheidsprijzen",
          "Klant ontvangt, accordeert digitaal",
        ],
        result: "Meerwerk-verlies door vergeten registratie → nihil.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "voortgang", title: "Voortgangs-foto's", emoji: "📸",
        subtitle: "Auto-dossier van elke bouwplaats.",
        tagline: "Foto's van bouwplaats → automatisch gelabeld, chronologisch in project-dossier.",
        howItWorks: [
          "Team stuurt foto's in WhatsApp of Telegram",
          "AIOW herkent fase, locatie, stelt dossier samen",
          "Einde project: complete foto-timeline klaar",
        ],
        result: "Oplever-dossier 10× sneller compleet.",
        priceFrom: "Vanaf €99/mo", liveIn: "Live in 3 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "facturatie", title: "Facturatie", emoji: "🪙",
        subtitle: "Termijn-facturen op schema, automatisch.",
        tagline: "AIOW factureert termijnen op moment van afronding, incl. meerwerk.",
        howItWorks: [
          "Termijnen gedefinieerd bij project-start",
          "Voortgang getriggerd → AIOW maakt factuur",
          "Auto-herinnering bij te laat betalen",
        ],
        result: "Cashflow voorspelbaar, minder verrassing.",
        priceFrom: "Vanaf €129/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      aiowRoom("Bouw", "projecten zonder administratieve achterstand"),
    ],
  },

  // 6. Horeca
  {
    id: "horeca", label: "Horeca", emoji: "🍽️", type: "branche",
    buildingName: "Het Huis van Gastvrijheid",
    buildingTagline: "Jij host. AIOW runt de rest.",
    buildingDescription:
      "In de horeca gaat kwaliteit verloren als het management wegvalt voor administratie. AIOW neemt reserveringen, inkoop, reviews, social en personeelsplanning over — zodat jij op de vloer kan staan waar het telt.",
    heroImage: "/buildings/building_horeca.webp",
    ready: true,
    doors: [
      {
        id: "reserveringen", title: "Reserveringen", emoji: "📅",
        subtitle: "Tafel boeken kan 24/7, zonder personeel aan telefoon.",
        tagline: "Boekingen via website, WhatsApp, Instagram, telefoon — allemaal via AIOW, live in jouw boekingssysteem.",
        howItWorks: [
          "Gast belt of typt: 'Vanavond 4 personen om 20u'",
          "AIOW checkt beschikbaarheid, bevestigt direct",
          "No-show check + reminder via SMS/WA",
        ],
        result: "Minder telefoontjes, minder no-shows.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "inkoop", title: "Inkoop", emoji: "🛒",
        subtitle: "Bestellen bij leveranciers zonder spreadsheets.",
        tagline: "AIOW voorspelt wat je deze week nodig hebt en stelt bestelling voor per leverancier.",
        howItWorks: [
          "AIOW ziet voorraad + reserveringen + historie",
          "Stelt bestel-lijst per leverancier voor",
          "Chef bevestigt, AIOW plaatst orders",
        ],
        result: "Food cost -5%, minder derving.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      {
        id: "reviews", title: "Reviews", emoji: "⭐",
        subtitle: "Elke review krijgt menselijk antwoord, binnen 1u.",
        tagline: "Google, Tripadvisor, Iens — AIOW monitort en schrijft reacties in jouw tone-of-voice.",
        howItWorks: [
          "Nieuwe review komt binnen (alle platforms)",
          "AIOW schrijft persoonlijk antwoord",
          "Manager accordeert, AIOW plaatst",
        ],
        result: "Google-ster +0.3-0.5, meer nieuwe gasten.",
        priceFrom: "Vanaf €79/mo", liveIn: "Live in 3 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "social", title: "Social content", emoji: "📱",
        subtitle: "Instagram dagelijks gevoed.",
        tagline: "Keuken stuurt foto, AIOW maakt post, feed blijft vol.",
        howItWorks: [
          "Keuken fotografeert schotel",
          "AIOW schrijft caption, tags, hashtags",
          "Auto-publish op Instagram, Facebook",
        ],
        result: "Instagram-followers +20%/jaar.",
        priceFrom: "Vanaf €99/mo", liveIn: "Live in 3 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "personeel", title: "Personeelsplanning", emoji: "👥",
        subtitle: "Rooster maken in 5 min, niet 2 uur.",
        tagline: "AIOW maakt roosters op basis van omzet-verwachting + personeelsvoorkeuren.",
        howItWorks: [
          "Medewerkers geven beschikbaarheid via app",
          "AIOW maakt optimaal rooster",
          "Eigenaar keurt, medewerkers krijgen push",
        ],
        result: "Personeelskosten -8%, minder gedoe.",
        priceFrom: "Vanaf €99/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "menu", title: "Menu-optimalisatie", emoji: "🍷",
        subtitle: "Welke gerechten doen het goed? Welke eruit?",
        tagline: "AIOW analyseert verkoop + marge per gerecht en stelt menu-optimalisatie voor.",
        howItWorks: [
          "Koppeling met kassasysteem",
          "AIOW analyseert verkoop, marge, prep-tijd",
          "Maandelijks voorstel voor menu-wijziging",
        ],
        result: "Gemiddelde check +€2-5.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-lime-400/30 to-green-500/10",
      },
      aiowRoom("Horeca", "meer op de vloer, minder achter de computer"),
    ],
  },

  // 7. E-commerce
  {
    id: "ecommerce", label: "E-commerce", emoji: "📦", type: "branche",
    buildingName: "Het Magazijn",
    buildingTagline: "Van klik tot bezorging, AI-geoptimaliseerd.",
    buildingDescription:
      "Online-verkoop is een spel van marge, snelheid en klantgeluk. AIOW helpt op alle fronten — voorraad, producttekst, reviews, ads, klantservice, returns — zodat je schaalt zonder dat het team omvalt.",
    heroImage: "/buildings/building_ecommerce.webp",
    ready: true,
    doors: [
      {
        id: "voorraad", title: "Voorraad-voorspelling", emoji: "📈",
        subtitle: "Nooit meer out-of-stock op topdagen.",
        tagline: "AIOW voorspelt per SKU de aankomende week/maand en triggert inkoop.",
        howItWorks: [
          "Koppeling met Shopify / WooCommerce / Magento",
          "AIOW leert seizoenen, trends, campagnes",
          "Automatische bestel-voorstellen per leverancier",
        ],
        result: "Out-of-stock -70%, voorraadkosten -15%.",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "producttekst", title: "Productteksten", emoji: "📝",
        subtitle: "Nieuwe producten live in uren, niet weken.",
        tagline: "AIOW schrijft SEO-geoptimaliseerde productteksten uit specificaties of foto's.",
        howItWorks: [
          "Upload productinfo (specs, foto, leveranciers-tekst)",
          "AIOW maakt unieke copy + SEO-metadata",
          "Content-manager reviewt, publiceert",
        ],
        result: "Nieuwe SKU's live 10× sneller.",
        priceFrom: "Vanaf €129/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "reviews", title: "Review-management", emoji: "⭐",
        subtitle: "Elke review persoonlijk beantwoord.",
        tagline: "Trustpilot, Google, Bol — AIOW beantwoordt alles in jouw tone-of-voice.",
        howItWorks: [
          "Reviews komen binnen (alle kanalen)",
          "AIOW schrijft antwoord + signaleert recurring issues",
          "Team keurt, plaatst, krijgt trend-rapportage",
        ],
        result: "Trust-score +0.2-0.4, minder churn.",
        priceFrom: "Vanaf €99/mo", liveIn: "Live in 3 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "ads", title: "Ads & social", emoji: "📱",
        subtitle: "Meta/TikTok/Google ads geoptimaliseerd.",
        tagline: "AIOW rouleert creatives, past budgetten aan op ROAS, genereert nieuwe ad-copy.",
        howItWorks: [
          "Koppeling met ads-platforms",
          "AIOW maakt A/B varianten automatisch",
          "Weekly rapport + voorstel budget-shift",
        ],
        result: "ROAS +20-40%, minder ad-fatigue.",
        priceFrom: "Vanaf €299/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "klantvragen", title: "Klantvragen", emoji: "💬",
        subtitle: "24/7 chat + mail, 80% self-service.",
        tagline: "AIOW kent je producten, retour-beleid, verzending. Lost 80% van vragen op.",
        howItWorks: [
          "Chat op website + mailbot",
          "AIOW antwoordt uit productdata + eerdere tickets",
          "Complexe zaken: escalatie naar team met context",
        ],
        result: "Support-FTE's halveren mogelijk.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "returns", title: "Returns & refunds", emoji: "↩️",
        subtitle: "Retouren snel afhandelen, patronen signaleren.",
        tagline: "AIOW handelt retourverzoeken af en signaleert productkwaliteit-issues vroeg.",
        howItWorks: [
          "Klant dient retour in via portaal",
          "AIOW keurt goed/keurt af op basis van regels",
          "Trend-rapport: welke producten retourneren vaak, waarom",
        ],
        result: "Retour-doorlooptijd -50%.",
        priceFrom: "Vanaf €129/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      aiowRoom("E-commerce", "meer omzet zonder meer uren"),
    ],
  },

  // 8. Logistiek
  {
    id: "logistiek", label: "Logistiek", emoji: "🚚", type: "branche",
    buildingName: "Het Depot",
    buildingTagline: "Routes, planning, klanten — real-time afgestemd.",
    buildingDescription:
      "Transport draait op marge-per-kilometer en klanttevredenheid. AIOW optimaliseert routes dynamisch, houdt klanten proactief op de hoogte en automatiseert de administratie rond bezorging en retour.",
    heroImage: "/buildings/building_logistiek.webp",
    ready: true,
    doors: [
      {
        id: "routes", title: "Route-optimalisatie", emoji: "🗺️",
        subtitle: "Minder kilometers, meer leveringen per dag.",
        tagline: "AIOW herrekent routes real-time bij nieuwe orders, files, annuleringen.",
        howItWorks: [
          "Orders + time-windows ingevoerd",
          "AIOW berekent optimale routes per chauffeur",
          "Dynamische aanpassing bij afwijkingen",
        ],
        result: "15-25% minder kilometers, meer stops.",
        priceFrom: "Vanaf €349/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "tracking", title: "Track & trace", emoji: "📍",
        subtitle: "Klant weet waar pakket is, zonder te bellen.",
        tagline: "AIOW stuurt proactieve updates via mail/SMS/WA met nauwkeurig ETA.",
        howItWorks: [
          "GPS-data van voertuigen naar AIOW",
          "Dynamisch ETA per stop",
          "Auto-melding bij vertraging",
        ],
        result: "Klant-belletjes -60%.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "klantupdates", title: "Klantcommunicatie", emoji: "💬",
        subtitle: "Standaardvragen automatisch beantwoord.",
        tagline: "Waar is mijn pakket? Wanneer komt de vrachtwagen? AIOW beantwoordt.",
        howItWorks: [
          "Bot op website + WhatsApp",
          "AIOW koppelt aan TMS voor live-status",
          "Escalatie bij complex",
        ],
        result: "Klantenservice-team 30% lichter.",
        priceFrom: "Vanaf €129/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "facturatie", title: "Facturatie", emoji: "🪙",
        subtitle: "Factureren per rit zonder handwerk.",
        tagline: "AIOW haalt ritdata uit TMS, maakt facturen per klant/contract.",
        howItWorks: [
          "Rit afgerond in TMS",
          "AIOW toepasselijk tarief en opslagen",
          "Factuur automatisch verstuurd",
        ],
        result: "DSO -7 dagen.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "planning", title: "Capaciteitsplanning", emoji: "📅",
        subtitle: "Chauffeurs en voertuigen optimaal ingezet.",
        tagline: "AIOW maakt rooster + belasting per voertuig op basis van verwachte vraag.",
        howItWorks: [
          "Historische data + forecast",
          "AIOW plant chauffeurs + voertuigen",
          "Alert bij overcapaciteit of tekort",
        ],
        result: "Voertuig-inzet +12%.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      aiowRoom("Logistiek", "minder kilometers, meer leveringen, happy klanten"),
    ],
  },

  // 9. Zorg
  {
    id: "zorg", label: "Zorg", emoji: "❤️", type: "branche",
    buildingName: "De Zorgpost",
    buildingTagline: "Meer tijd voor patiënt, minder voor dossier.",
    buildingDescription:
      "Zorgprofessionals verdrinken in administratie. AIOW regelt afspraken, triage, dossiervoering en declaraties — met volledig respect voor AVG en medische geheimhouding — zodat jij weer aan zorg kan doen.",
    heroImage: "/buildings/building_zorg.webp",
    ready: true,
    doors: [
      {
        id: "afspraken", title: "Afspraken", emoji: "📅",
        subtitle: "Patiënt maakt zelf afspraak, 24/7.",
        tagline: "AIOW matcht symptoom/vraag met consulttype en agenda-beschikbaarheid.",
        howItWorks: [
          "Patiënt belt, mailt of chat",
          "AIOW stelt juiste consulttype voor + plant in",
          "Herinnering 24u van tevoren",
        ],
        result: "No-shows -40%, praktijkassistent-tijd terug.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "triage", title: "Triage", emoji: "🩺",
        subtitle: "Eerste uitvraag geautomatiseerd + gestandaardiseerd.",
        tagline: "AIOW voert NHG-gebaseerde intake uit en kent urgentie toe.",
        howItWorks: [
          "Patiënt beantwoordt intake-vragen",
          "AIOW classificeert op basis van protocollen",
          "Urgentie + samenvatting in dossier voor arts",
        ],
        result: "Consult gerichter, kortere consult-tijd.",
        priceFrom: "Vanaf €299/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-red-400/30 to-rose-500/10",
      },
      {
        id: "dossier", title: "Dossiervoering", emoji: "📂",
        subtitle: "Consult-verslag gegenereerd, jij accordeert.",
        tagline: "AIOW luistert mee (opname of dictaat) en schrijft SOEP-verslag in HIS.",
        howItWorks: [
          "Opname tijdens consult (met toestemming)",
          "AIOW maakt SOEP-verslag + ICPC-codes",
          "Arts accordeert, aanpassingen met 1 klik",
        ],
        result: "Verslag-tijd per consult -10 min.",
        priceFrom: "Vanaf €349/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "declaraties", title: "Declaraties", emoji: "🪙",
        subtitle: "DBC-codes en declaratie automatisch.",
        tagline: "AIOW kiest juiste declaratiecode bij consult-verslag en stuurt naar verzekeraar.",
        howItWorks: [
          "Verslag klaar → AIOW bepaalt DBC/prestatiecode",
          "Check tegen Zvw-regels",
          "Directe indiening bij verzekeraar",
        ],
        result: "Declaratie-afwijzingen -50%.",
        priceFrom: "Vanaf €229/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "recepten", title: "Herhaalrecepten", emoji: "💊",
        subtitle: "Herhaalverzoek afgehandeld in 30 sec.",
        tagline: "Patiënt vraagt herhaalrecept via portaal, AIOW checkt protocol, arts accordeert.",
        howItWorks: [
          "Patiënt dient herhaalverzoek in",
          "AIOW checkt labwaardes, interacties, laatste consult",
          "Arts 1-klik accorderen → recept naar apotheek",
        ],
        result: "Per week uren gewonnen.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      aiowRoom("Zorg", "meer tijd voor patiënten, minder voor dossier en declaratie"),
    ],
  },

  // 10. Vastgoed
  {
    id: "vastgoed", label: "Vastgoed", emoji: "🏘️", type: "branche",
    buildingName: "Het Makelaarskantoor",
    buildingTagline: "Van bezichtiging tot sleuteloverdracht, gestroomlijnd.",
    buildingDescription:
      "Makelaars jongleren leads, bezichtigingen, contracten en taxaties. AIOW neemt alle routines over — zodat jij kan doen waar je voor werd ingehuurd: verkopen en adviseren.",
    heroImage: "/buildings/building_vastgoed.webp",
    ready: true,
    doors: [
      {
        id: "bezichtigingen", title: "Bezichtigingen", emoji: "🗝️",
        subtitle: "Agenda vol geplande bezichtigingen, automatisch.",
        tagline: "AIOW plant bezichtigingen met geïnteresseerden op basis van makelaar-agenda + objectbeschikbaarheid.",
        howItWorks: [
          "Kandidaat-koper reageert op object",
          "AIOW checkt financieel gekwalificeerd + plant in",
          "Bevestiging + reminder naar beide partijen",
        ],
        result: "Bezichtiging-bezetting +30%.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "teksten", title: "Woning-teksten", emoji: "📝",
        subtitle: "Funda-tekst die verkoopt, geen 'recent gerenoveerd'.",
        tagline: "AIOW schrijft objectteksten uit kenmerken + foto's, met verkoop-angle.",
        howItWorks: [
          "Upload kenmerken + foto's + omgeving-info",
          "AIOW maakt wervende tekst in jouw merk-stijl",
          "Makelaar past aan, plaatst op Funda/site",
        ],
        result: "Gemiddeld 20% snellere verkoop.",
        priceFrom: "Vanaf €129/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "leads", title: "Leads & follow-up", emoji: "🎯",
        subtitle: "Elke lead krijgt opvolging binnen 15 min.",
        tagline: "AIOW kwalificeert leads en houdt ze warm met persoonlijke updates.",
        howItWorks: [
          "Lead reageert (mail/Funda/site)",
          "AIOW stuurt direct gepersonaliseerd antwoord",
          "Scoort lead op koop-intentie voor makelaar",
        ],
        result: "Lead-conversie +25%.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "contracten", title: "Contracten", emoji: "📜",
        subtitle: "Koop-, huur- en makelaar-contracten klaar in minuten.",
        tagline: "AIOW maakt concept-contract op basis van object + partij-info.",
        howItWorks: [
          "Makelaar voert kerngegevens in",
          "AIOW genereert koop/huur/opdracht-contract",
          "Jurist/makelaar reviewt, stuurt digitaal ter tekening",
        ],
        result: "Contract-opmaak 2u → 15 min.",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "taxaties", title: "Taxatie-ondersteuning", emoji: "📊",
        subtitle: "Referentiepanden + marktwaarde-analyse.",
        tagline: "AIOW zoekt vergelijkbare verkopen en levert taxatie-onderbouwing.",
        howItWorks: [
          "Object-kenmerken ingevoerd",
          "AIOW zoekt Kadaster + marktdata referenties",
          "Output: waardering-range + onderbouwing",
        ],
        result: "Taxatie-voorbereiding 4u → 1u.",
        priceFrom: "Vanaf €229/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      aiowRoom("Vastgoed", "meer sleutels overgedragen per maand"),
    ],
  },

  // 11. Marketing
  {
    id: "marketing", label: "Marketing", emoji: "🎨", type: "branche",
    buildingName: "De Studio",
    buildingTagline: "Creatieve teams die 3× meer produceren.",
    buildingDescription:
      "Marketingbureaus zitten klem tussen creativiteit en operationele druk. AIOW ontzorgt de operationele kant — content, social, SEO, leadgen, reports — zodat het team tijd houdt voor het creatieve werk waar klanten voor betalen.",
    heroImage: "/buildings/building_marketing.webp",
    ready: true,
    doors: [
      {
        id: "content", title: "Content-productie", emoji: "📝",
        subtitle: "Blogs, landing-pages, whitepapers in uren.",
        tagline: "AIOW produceert brand-aligned content uit briefing, feedback, voorbeelden.",
        howItWorks: [
          "Brand-voice getraind op klant-stijl",
          "Creatief brief → AIOW maakt 1e concept",
          "Copywriter edit, goedkeurt, publiceert",
        ],
        result: "Content-output 3-5× sneller.",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "social", title: "Social-kalender", emoji: "📱",
        subtitle: "Dagelijkse posts over meerdere klanten.",
        tagline: "AIOW plant en publiceert social content per klant, per platform.",
        howItWorks: [
          "Maandkalender ingevoerd",
          "AIOW maakt posts + visuals, planned per platform",
          "Community manager reviewt, publish",
        ],
        result: "Social-workload -60%.",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "seo", title: "SEO & GEO", emoji: "🔍",
        subtitle: "Gevonden worden door Google én ChatGPT.",
        tagline: "AIOW doet keyword research, schema-markup en monitort AI-citaties.",
        howItWorks: [
          "Site-audit + keyword-onderzoek",
          "AIOW schrijft content en structured data",
          "Monitort ChatGPT/Perplexity-citaties",
        ],
        result: "AI-vindbaarheid + Google-ranking.",
        priceFrom: "Vanaf €299/mo", liveIn: "Live in 14 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "leadgen", title: "Leadgen", emoji: "🎯",
        subtitle: "Kwalitatieve leads in de sales-pipeline.",
        tagline: "AIOW identificeert ideal customers en doet outreach in brand-voice.",
        howItWorks: [
          "ICP-profiel gedefinieerd",
          "AIOW scant LinkedIn/Apollo/web",
          "Gepersonaliseerde outreach (volgens jouw template)",
        ],
        result: "5-10× meer gekwalificeerde meetings.",
        priceFrom: "Vanaf €399/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "reports", title: "Klant-rapportages", emoji: "📊",
        subtitle: "Maandrapporten die klanten daadwerkelijk lezen.",
        tagline: "AIOW maakt rapportages met insights, niet alleen grafieken.",
        howItWorks: [
          "Koppeling met GA/Meta/LinkedIn ads",
          "AIOW schrijft maandrapport met insights + actiepunten",
          "Account manager presenteert",
        ],
        result: "Retention-meetings beter, client-churn lager.",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "creative", title: "Creative-assist", emoji: "🎨",
        subtitle: "Mood-boards, varianten, concepten sneller.",
        tagline: "AIOW genereert visueel moodboard en varianten voor creative teams.",
        howItWorks: [
          "Brief ingevoerd door creative lead",
          "AIOW genereert 10+ visual directions",
          "Creatives kiezen, werken uit",
        ],
        result: "Ideation-fase halveert.",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-orange-400/30 to-red-500/10",
      },
      aiowRoom("Marketing", "meer creatief werk, minder repetitief werk"),
    ],
  },

  // 12. Overige
  {
    id: "overige", label: "Overige", emoji: "🏛️", type: "overige",
    buildingName: "Het AIOW-Hoofdkantoor",
    buildingTagline: "Past jouw bedrijf nergens in? Stap hier binnen.",
    buildingDescription:
      "Niet elke branche is een hokje. Bij AIOW bouwen we maatwerk voor bedrijven die niet standaard zijn. Dit is ons hoofdkantoor — je ziet alle AI-mogelijkheden die we leveren, je kiest wat bij jou past.",
    heroImage: "/buildings/building_overige.webp",
    ready: true,
    doors: [
      {
        id: "email", title: "Email & communicatie", emoji: "📬",
        subtitle: "Elke inbox, elke mailbox, beheerst.",
        tagline: "AIOW triage, concepten, auto-reply en escalatie — werkt met elk mail-platform.",
        howItWorks: ["Inbox-analyse", "Auto-classificatie + concept-antwoorden", "Team-escalatie met context"],
        result: "Respons-tijd -80%, focus-tijd +30%",
        priceFrom: "Vanaf €99/mo", liveIn: "Live in 3-7 werkdagen",
        accent: "from-amber-400/30 to-rose-500/10",
      },
      {
        id: "documenten", title: "Documenten & contracten", emoji: "📄",
        subtitle: "Doc-review, versies, signing.",
        tagline: "Upload, review, highlight, sign — alles in één AI-flow.",
        howItWorks: ["Document-ingest met OCR", "AI-review tegen jouw templates", "Digitaal signeren"],
        result: "Verwerkingstijd per document -70%",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-sky-400/30 to-indigo-500/10",
      },
      {
        id: "klantcontact", title: "Klantcontact", emoji: "💬",
        subtitle: "Chat + mail + WhatsApp + telefoon.",
        tagline: "Multi-channel AI-klantcontact dat schaalt zonder meer team.",
        howItWorks: ["Kanaal-integratie (alle 4)", "Knowledge-base getraind op jouw docs", "Mens-overdracht met volledige context"],
        result: "24/7 bereikbaarheid, 60% self-service",
        priceFrom: "Vanaf €249/mo", liveIn: "Live in 10 werkdagen",
        accent: "from-lime-400/30 to-emerald-500/10",
      },
      {
        id: "content", title: "Content & marketing", emoji: "📻",
        subtitle: "Social, blog, nieuwsbrief, ads.",
        tagline: "Eén input, meerdere outputs, in jouw tone-of-voice.",
        howItWorks: ["Brand-voice training", "Multi-channel generatie", "Human review + publish"],
        result: "3× meer output, zelfde team",
        priceFrom: "Vanaf €179/mo", liveIn: "Live in 7 werkdagen",
        accent: "from-pink-400/30 to-fuchsia-500/10",
      },
      {
        id: "finance", title: "Finance & facturatie", emoji: "🪙",
        subtitle: "Facturen, incasso, cashflow-alerts.",
        tagline: "AIOW koppelt aan je boekhoudpakket en automatiseert het hele proces.",
        howItWorks: ["Boekhoud-integratie", "Factuur-generatie + incasso-flows", "Cashflow-dashboard"],
        result: "Cashflow 14 dagen sneller",
        priceFrom: "Vanaf €149/mo", liveIn: "Live in 5-10 werkdagen",
        accent: "from-yellow-400/30 to-amber-500/10",
      },
      {
        id: "hr", title: "HR & intake", emoji: "👥",
        subtitle: "Van vacature tot onboarding.",
        tagline: "CV-screening, interview-planning, onboarding-flows.",
        howItWorks: ["Vacature-publicatie", "AI-screening + ranking", "Onboarding-automatisering"],
        result: "HR-admin -60%",
        priceFrom: "Vanaf €129/mo", liveIn: "Live in 5-10 werkdagen",
        accent: "from-violet-400/30 to-purple-500/10",
      },
      {
        id: "planning", title: "Planning & agenda", emoji: "📅",
        subtitle: "Agenda's die zichzelf optimaliseren.",
        tagline: "AIOW plant meetings, routes, shifts — optimaal voor je doel.",
        howItWorks: ["Agenda-koppeling", "AI-planning op beschikbaarheid + prioriteit", "Automatische heruitnodigingen"],
        result: "Minder agenda-Tetris, meer productieve uren",
        priceFrom: "Vanaf €99/mo", liveIn: "Live in 5 werkdagen",
        accent: "from-teal-400/30 to-cyan-500/10",
      },
      {
        id: "data", title: "Data & inzicht", emoji: "📊",
        subtitle: "Dashboards die jouw vragen beantwoorden.",
        tagline: "AIOW bouwt dashboards + answer-bot op jouw bedrijfsdata.",
        howItWorks: ["Data-sources koppelen", "Custom dashboards", "Vraag-antwoord op eigen data"],
        result: "Beslissingen op feiten, niet onderbuik",
        priceFrom: "Vanaf €199/mo", liveIn: "Live in 10-15 werkdagen",
        accent: "from-blue-400/30 to-indigo-500/10",
      },
      {
        id: "integraties", title: "Integraties", emoji: "🔌",
        subtitle: "Jouw systemen praten met elkaar.",
        tagline: "AIOW verbindt CRM, ERP, mail, boekhouding, shop — data stroomt.",
        howItWorks: ["Systeem-audit", "API-integraties bouwen", "Workflow-automatisering"],
        result: "Data-silo's weg, team werkt op 1 bron",
        priceFrom: "Op maat", liveIn: "3-6 weken",
        accent: "from-emerald-400/30 to-green-500/10",
      },
      {
        id: "custom", title: "Custom AI op maat", emoji: "🧪",
        subtitle: "Specifiek probleem? We bouwen het.",
        tagline: "Voor unieke uitdagingen bouwen we een custom AI-oplossing op jouw data, proces, stack.",
        howItWorks: ["Discovery-call + probleem-diagnose", "Proof-of-concept in 2-4 weken", "Productie-release + beheer"],
        result: "AI-oplossing die niemand anders heeft",
        priceFrom: "Op maat", liveIn: "4-12 weken",
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
