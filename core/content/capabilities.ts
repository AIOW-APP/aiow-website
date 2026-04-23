/** AIOW V12 — capability content (NL + EN). */

export type Lang = "nl" | "en";
export type Room = {
  id: string;
  title: { nl: string; en: string };
  emoji: string;
  subtitle: { nl: string; en: string };
  priceFrom: { nl: string; en: string };
  liveIn: { nl: string; en: string };
  icon: string;
  image: string;
};
export type Capability = {
  id: string;
  label: { nl: string; en: string };
  emoji: string;
  tagline: { nl: string; en: string };
  visualMotif: string;
  rooms: Room[];
  buildingImage: string;
};

export const UI: Record<Lang, Record<string, string>> = {
  "nl": {
    "tagline": "AI · Owned · World",
    "hint_label": "De AIOW-campus",
    "hint_sub": "Klik op een huis om te zien wat we daarin doen",
    "close": "Sluiten",
    "priceFromLabel": "vanaf",
    "liveInLabel": "live in",
    "enterHouse": "Stap dit huis binnen →",
    "planCall": "Plan een gesprek",
    "moreRooms": "Bekijk andere kamers",
    "nothing_fits": "Zit jouw vraag er niet bij? Stap binnen bij Custom AI"
  },
  "en": {
    "tagline": "AI · Owned · World",
    "hint_label": "The AIOW campus",
    "hint_sub": "Click a house to see what we do inside",
    "close": "Close",
    "priceFromLabel": "from",
    "liveInLabel": "live in",
    "enterHouse": "Enter this house →",
    "planCall": "Book a call",
    "moreRooms": "View other rooms",
    "nothing_fits": "Doesn't fit? Step into Custom AI"
  }
};

export const CAPABILITIES: Capability[] = [
  {
    id: "online-presence",
    label: {"nl": "Online Presence", "en": "Online Presence"},
    emoji: "\ud83c\udf10",
    tagline: {"nl": "Gezicht online. Automatisch. 24/7.", "en": "Your face online. Automated. 24/7."},
    visualMotif: "a glass sphere with orbiting rings and floating photo/webpage tiles",
    buildingImage: "/aiow/building_online-presence.png",
    rooms: [
      {"id": "website", "title": {"nl": "Website & webapp", "en": "Website & webapp"}, "emoji": "💻", "subtitle": {"nl": "Van idee naar live site, AI-gebouwd.", "en": "From idea to live site, AI-built."}, "priceFrom": {"nl": "€149/mo", "en": "€149/mo"}, "liveIn": {"nl": "7-14 dagen", "en": "7-14 days"}, "icon": "holographic webpage wireframe floating", "image": "/aiow/room_online-presence_website.png"},
      {"id": "social", "title": {"nl": "Social automation", "en": "Social automation"}, "emoji": "📱", "subtitle": {"nl": "LinkedIn/Instagram/TikTok, altijd gevoed.", "en": "LinkedIn/Instagram/TikTok, always fed."}, "priceFrom": {"nl": "€99/mo", "en": "€99/mo"}, "liveIn": {"nl": "5-7 dagen", "en": "5-7 days"}, "icon": "grid of floating photo tiles being scheduled", "image": "/aiow/room_online-presence_social.png"},
      {"id": "seo-geo", "title": {"nl": "SEO & GEO", "en": "SEO & GEO"}, "emoji": "🔍", "subtitle": {"nl": "Gevonden door Google én ChatGPT/Perplexity.", "en": "Found by Google AND ChatGPT/Perplexity."}, "priceFrom": {"nl": "€199/mo", "en": "€199/mo"}, "liveIn": {"nl": "10-14 dagen", "en": "10-14 days"}, "icon": "glowing magnifying lens with search-node graph", "image": "/aiow/room_online-presence_seo-geo.png"},
      {"id": "content", "title": {"nl": "Content-productie", "en": "Content production"}, "emoji": "📝", "subtitle": {"nl": "Blog, nieuwsbrief, whitepaper — in brand-voice.", "en": "Blog, newsletter, whitepaper — in your voice."}, "priceFrom": {"nl": "€149/mo", "en": "€149/mo"}, "liveIn": {"nl": "7 dagen", "en": "7 days"}, "icon": "floating blank canvas with content streams", "image": "/aiow/room_online-presence_content.png"},
    ],
  },
  {
    id: "finance",
    label: {"nl": "Finance", "en": "Finance"},
    emoji: "\ud83d\udcb0",
    tagline: {"nl": "Cijfers die zichzelf bijhouden.", "en": "Numbers that keep themselves."},
    visualMotif: "a crystalline tower with flowing liquid-data streams and floating coin discs",
    buildingImage: "/aiow/building_finance.png",
    rooms: [
      {"id": "facturatie", "title": {"nl": "Facturatie", "en": "Invoicing"}, "emoji": "🧾", "subtitle": {"nl": "Factureren én incasseren, automatisch.", "en": "Billing and collecting, automated."}, "priceFrom": {"nl": "€99/mo", "en": "€99/mo"}, "liveIn": {"nl": "5 dagen", "en": "5 days"}, "icon": "floating document with digital stamp", "image": "/aiow/room_finance_facturatie.png"},
      {"id": "boekhouding", "title": {"nl": "Boekhouding AI", "en": "Accounting AI"}, "emoji": "📚", "subtitle": {"nl": "Exact/Moneybird/Twinfield — AI doet het werk.", "en": "Exact/Moneybird/Twinfield — AI does the work."}, "priceFrom": {"nl": "€249/mo", "en": "€249/mo"}, "liveIn": {"nl": "10 dagen", "en": "10 days"}, "icon": "stack of translucent ledger sheets with auto-sort", "image": "/aiow/room_finance_boekhouding.png"},
      {"id": "cashflow", "title": {"nl": "Cashflow & rapportage", "en": "Cashflow & reporting"}, "emoji": "📊", "subtitle": {"nl": "Realtime dashboard + alerts bij afwijking.", "en": "Realtime dashboard + alerts on anomalies."}, "priceFrom": {"nl": "€179/mo", "en": "€179/mo"}, "liveIn": {"nl": "7 dagen", "en": "7 days"}, "icon": "floating 3D bar-chart with glow", "image": "/aiow/room_finance_cashflow.png"},
      {"id": "debiteuren", "title": {"nl": "Debiteurenbeheer", "en": "Accounts receivable"}, "emoji": "⏱️", "subtitle": {"nl": "Late betalers herinnerd zonder dat jij het hoeft te doen.", "en": "Late payers reminded so you don't have to."}, "priceFrom": {"nl": "€79/mo", "en": "€79/mo"}, "liveIn": {"nl": "3 dagen", "en": "3 days"}, "icon": "clock-face with payment particles", "image": "/aiow/room_finance_debiteuren.png"},
    ],
  },
  {
    id: "klantcontact",
    label: {"nl": "Klantcontact", "en": "Customer Contact"},
    emoji: "\ud83d\udcac",
    tagline: {"nl": "Altijd bereikbaar, zonder extra team.", "en": "Always reachable, without extra team."},
    visualMotif: "a translucent dome with speech-waveform particles radiating outward",
    buildingImage: "/aiow/building_klantcontact.png",
    rooms: [
      {"id": "chat", "title": {"nl": "Live chat-bot", "en": "Live chat-bot"}, "emoji": "💭", "subtitle": {"nl": "24/7 op je website, WhatsApp, Messenger.", "en": "24/7 on your site, WhatsApp, Messenger."}, "priceFrom": {"nl": "€149/mo", "en": "€149/mo"}, "liveIn": {"nl": "5-7 dagen", "en": "5-7 days"}, "icon": "chat bubble with AI-agent orb", "image": "/aiow/room_klantcontact_chat.png"},
      {"id": "email-triage", "title": {"nl": "Email-triage", "en": "Email triage"}, "emoji": "📬", "subtitle": {"nl": "Inbox georganiseerd, concept-antwoorden klaar.", "en": "Inbox organized, draft replies ready."}, "priceFrom": {"nl": "€99/mo", "en": "€99/mo"}, "liveIn": {"nl": "3 dagen", "en": "3 days"}, "icon": "email envelopes sorted into beams of light", "image": "/aiow/room_klantcontact_email-triage.png"},
      {"id": "telefoon", "title": {"nl": "Telefoon-bot", "en": "Phone bot"}, "emoji": "☎️", "subtitle": {"nl": "AI neemt je telefoon op, boekt afspraken.", "en": "AI answers calls, books appointments."}, "priceFrom": {"nl": "€299/mo", "en": "€299/mo"}, "liveIn": {"nl": "14 dagen", "en": "14 days"}, "icon": "floating phone handset with AI-voice-wave", "image": "/aiow/room_klantcontact_telefoon.png"},
      {"id": "reviews", "title": {"nl": "Reviews-management", "en": "Review management"}, "emoji": "⭐", "subtitle": {"nl": "Google/Trustpilot — elke review beantwoord.", "en": "Google/Trustpilot — every review answered."}, "priceFrom": {"nl": "€79/mo", "en": "€79/mo"}, "liveIn": {"nl": "3 dagen", "en": "3 days"}, "icon": "floating star-shapes with response beams", "image": "/aiow/room_klantcontact_reviews.png"},
    ],
  },
  {
    id: "operations",
    label: {"nl": "Operations", "en": "Operations"},
    emoji: "\u2699\ufe0f",
    tagline: {"nl": "Planning, voorraad, routes — slim gestuurd.", "en": "Planning, inventory, routes — smartly steered."},
    visualMotif: "a multi-tiered gear structure with rotating luminous rings",
    buildingImage: "/aiow/building_operations.png",
    rooms: [
      {"id": "planning", "title": {"nl": "Planning & agenda", "en": "Planning & agenda"}, "emoji": "📅", "subtitle": {"nl": "Rooster, meetings, routes — zelf-optimaliserend.", "en": "Schedules, meetings, routes — self-optimizing."}, "priceFrom": {"nl": "€129/mo", "en": "€129/mo"}, "liveIn": {"nl": "5-7 dagen", "en": "5-7 days"}, "icon": "3D calendar with auto-filling slots", "image": "/aiow/room_operations_planning.png"},
      {"id": "voorraad", "title": {"nl": "Voorraad & inkoop", "en": "Inventory & purchasing"}, "emoji": "📦", "subtitle": {"nl": "Voorspelt wat je nodig hebt, bestelt automatisch.", "en": "Predicts what you need, orders automatically."}, "priceFrom": {"nl": "€249/mo", "en": "€249/mo"}, "liveIn": {"nl": "10-14 dagen", "en": "10-14 days"}, "icon": "floating crates with supply-chain arrows", "image": "/aiow/room_operations_voorraad.png"},
      {"id": "routes", "title": {"nl": "Route-optimalisatie", "en": "Route optimization"}, "emoji": "🗺️", "subtitle": {"nl": "Minder kilometers, meer leveringen per dag.", "en": "Fewer kilometers, more deliveries per day."}, "priceFrom": {"nl": "€199/mo", "en": "€199/mo"}, "liveIn": {"nl": "10 dagen", "en": "10 days"}, "icon": "map with glowing path between nodes", "image": "/aiow/room_operations_routes.png"},
      {"id": "workflow", "title": {"nl": "Workflow-automatisering", "en": "Workflow automation"}, "emoji": "🔌", "subtitle": {"nl": "Systemen praten automatisch met elkaar.", "en": "Systems talk to each other automatically."}, "priceFrom": {"nl": "Op maat", "en": "Custom"}, "liveIn": {"nl": "3-6 weken", "en": "3-6 weeks"}, "icon": "connected-nodes diagram with data flow", "image": "/aiow/room_operations_workflow.png"},
    ],
  },
  {
    id: "sales-leadgen",
    label: {"nl": "Sales & Leadgen", "en": "Sales & Leadgen"},
    emoji: "\ud83c\udfaf",
    tagline: {"nl": "Betere leads, sneller in de pipeline.", "en": "Better leads, faster in pipeline."},
    visualMotif: "a targeted beam emitter shape with concentric rings and arrows",
    buildingImage: "/aiow/building_sales-leadgen.png",
    rooms: [
      {"id": "leadgen", "title": {"nl": "Leadgeneration", "en": "Lead generation"}, "emoji": "🧲", "subtitle": {"nl": "ICP-match vinden + outreach, volledig AI-gedreven.", "en": "ICP matching + outreach, AI-driven end-to-end."}, "priceFrom": {"nl": "€399/mo", "en": "€399/mo"}, "liveIn": {"nl": "10 dagen", "en": "10 days"}, "icon": "magnetic beam pulling lead-orbs closer", "image": "/aiow/room_sales-leadgen_leadgen.png"},
      {"id": "offertes", "title": {"nl": "Offertes", "en": "Quotes"}, "emoji": "📄", "subtitle": {"nl": "Klantvraag naar offerte in minuten.", "en": "Client request to quote in minutes."}, "priceFrom": {"nl": "€129/mo", "en": "€129/mo"}, "liveIn": {"nl": "5 dagen", "en": "5 days"}, "icon": "floating offer-document with price-tiles", "image": "/aiow/room_sales-leadgen_offertes.png"},
      {"id": "crm", "title": {"nl": "CRM-verrijking", "en": "CRM enrichment"}, "emoji": "🗂️", "subtitle": {"nl": "Elke lead automatisch aangevuld en gescoord.", "en": "Every lead auto-enriched and scored."}, "priceFrom": {"nl": "€179/mo", "en": "€179/mo"}, "liveIn": {"nl": "7 dagen", "en": "7 days"}, "icon": "contact cards with enrichment-data streams", "image": "/aiow/room_sales-leadgen_crm.png"},
      {"id": "followup", "title": {"nl": "Follow-up & nurture", "en": "Follow-up & nurture"}, "emoji": "💌", "subtitle": {"nl": "Geen lead valt meer tussen wal en schip.", "en": "No lead falls through the cracks."}, "priceFrom": {"nl": "€149/mo", "en": "€149/mo"}, "liveIn": {"nl": "5 dagen", "en": "5 days"}, "icon": "looping message threads with gentle glow", "image": "/aiow/room_sales-leadgen_followup.png"},
    ],
  },
  {
    id: "documenten",
    label: {"nl": "Documenten & Kennis", "en": "Documents & Knowledge"},
    emoji: "\ud83d\udcda",
    tagline: {"nl": "Alles vindbaar, alles gecheckt.", "en": "Everything findable, everything checked."},
    visualMotif: "a stacked glass-books tower with particles flowing between pages",
    buildingImage: "/aiow/building_documenten.png",
    rooms: [
      {"id": "contract-review", "title": {"nl": "Contract-review", "en": "Contract review"}, "emoji": "📜", "subtitle": {"nl": "NDA, SLA, koop — risico's gemarkeerd in minuten.", "en": "NDA, SLA, purchase — risks flagged in minutes."}, "priceFrom": {"nl": "€299/mo", "en": "€299/mo"}, "liveIn": {"nl": "10 dagen", "en": "10 days"}, "icon": "document with AI-highlight beams", "image": "/aiow/room_documenten_contract-review.png"},
      {"id": "dossier", "title": {"nl": "Dossier-automatisering", "en": "Dossier automation"}, "emoji": "📂", "subtitle": {"nl": "Intake + archivering zonder handwerk.", "en": "Intake + archiving without manual work."}, "priceFrom": {"nl": "€199/mo", "en": "€199/mo"}, "liveIn": {"nl": "7 dagen", "en": "7 days"}, "icon": "filing cabinet with floating auto-sort", "image": "/aiow/room_documenten_dossier.png"},
      {"id": "kennisbank", "title": {"nl": "Interne kennisbank", "en": "Internal knowledge base"}, "emoji": "🧠", "subtitle": {"nl": "AI die al jullie docs kent, altijd antwoord.", "en": "AI that knows all your docs, always answers."}, "priceFrom": {"nl": "€249/mo", "en": "€249/mo"}, "liveIn": {"nl": "10-14 dagen", "en": "10-14 days"}, "icon": "brain-like node graph with glowing connections", "image": "/aiow/room_documenten_kennisbank.png"},
      {"id": "compliance", "title": {"nl": "Compliance-check", "en": "Compliance check"}, "emoji": "🛡️", "subtitle": {"nl": "AVG, Wwft, KYC — doorlopend gecheckt.", "en": "GDPR, AML, KYC — continuously checked."}, "priceFrom": {"nl": "€229/mo", "en": "€229/mo"}, "liveIn": {"nl": "10 dagen", "en": "10 days"}, "icon": "shield with checkmark particles", "image": "/aiow/room_documenten_compliance.png"},
    ],
  },
  {
    id: "hr",
    label: {"nl": "HR & Team", "en": "HR & Team"},
    emoji: "\ud83d\udc65",
    tagline: {"nl": "Mensen vinden, inwerken, ondersteunen.", "en": "Find people, onboard, support."},
    visualMotif: "a cluster of connected glowing nodes forming a team-network",
    buildingImage: "/aiow/building_hr.png",
    rooms: [
      {"id": "sollicitaties", "title": {"nl": "Sollicitatie-triage", "en": "Application triage"}, "emoji": "📋", "subtitle": {"nl": "CV's gescreend, kandidaten gerankt.", "en": "CVs screened, candidates ranked."}, "priceFrom": {"nl": "€149/mo", "en": "€149/mo"}, "liveIn": {"nl": "7 dagen", "en": "7 days"}, "icon": "CV-stacks with auto-ranking beams", "image": "/aiow/room_hr_sollicitaties.png"},
      {"id": "onboarding", "title": {"nl": "Onboarding", "en": "Onboarding"}, "emoji": "🚪", "subtitle": {"nl": "Nieuwe medewerker, dag 1 volledig voorbereid.", "en": "New hire, day 1 fully prepared."}, "priceFrom": {"nl": "€129/mo", "en": "€129/mo"}, "liveIn": {"nl": "5 dagen", "en": "5 days"}, "icon": "floating door with welcome-path lights", "image": "/aiow/room_hr_onboarding.png"},
      {"id": "interne-bot", "title": {"nl": "Intern HR-loket", "en": "Internal HR desk"}, "emoji": "💬", "subtitle": {"nl": "Medewerkers vragen, AI antwoordt direct.", "en": "Staff asks, AI answers directly."}, "priceFrom": {"nl": "€99/mo", "en": "€99/mo"}, "liveIn": {"nl": "5 dagen", "en": "5 days"}, "icon": "AI-agent orb answering from HR-knowledge", "image": "/aiow/room_hr_interne-bot.png"},
      {"id": "rooster", "title": {"nl": "Rooster & planning", "en": "Scheduling"}, "emoji": "📅", "subtitle": {"nl": "Optimaal rooster in seconden, niet uren.", "en": "Optimal schedule in seconds, not hours."}, "priceFrom": {"nl": "€99/mo", "en": "€99/mo"}, "liveIn": {"nl": "5 dagen", "en": "5 days"}, "icon": "schedule grid with auto-filling team", "image": "/aiow/room_hr_rooster.png"},
    ],
  },
  {
    id: "custom-ai",
    label: {"nl": "Custom AI", "en": "Custom AI"},
    emoji: "\ud83e\uddea",
    tagline: {"nl": "Niks past? Dan bouwen we het.", "en": "Nothing fits? We build it."},
    visualMotif: "a floating laboratory pod with bubbling energy and experimental particle effects",
    buildingImage: "/aiow/building_custom-ai.png",
    rooms: [
      {"id": "discovery", "title": {"nl": "Discovery-call", "en": "Discovery call"}, "emoji": "🔬", "subtitle": {"nl": "Gratis gesprek: is AI jouw oplossing?", "en": "Free chat: is AI your answer?"}, "priceFrom": {"nl": "Gratis", "en": "Free"}, "liveIn": {"nl": "Deze week nog", "en": "This week"}, "icon": "focused light-beam on abstract idea-form", "image": "/aiow/room_custom-ai_discovery.png"},
      {"id": "poc", "title": {"nl": "Proof of Concept", "en": "Proof of Concept"}, "emoji": "⚗️", "subtitle": {"nl": "In 2-4 weken werkend prototype op jouw data.", "en": "Working prototype in 2-4 weeks on your data."}, "priceFrom": {"nl": "Vanaf €4.950", "en": "From €4.950"}, "liveIn": {"nl": "2-4 weken", "en": "2-4 weeks"}, "icon": "experiment-flask with emerging solution", "image": "/aiow/room_custom-ai_poc.png"},
      {"id": "build", "title": {"nl": "Custom AI-build", "en": "Custom AI build"}, "emoji": "🏗️", "subtitle": {"nl": "Productie-klare AI op maat.", "en": "Production-ready AI tailored to you."}, "priceFrom": {"nl": "Op maat", "en": "Custom"}, "liveIn": {"nl": "4-12 weken", "en": "4-12 weeks"}, "icon": "3D construction with modular AI-blocks", "image": "/aiow/room_custom-ai_build.png"},
      {"id": "beheer", "title": {"nl": "Beheer & evolutie", "en": "Operation & evolution"}, "emoji": "♾️", "subtitle": {"nl": "We blijven jouw AI trainen en verbeteren.", "en": "We keep training and improving your AI."}, "priceFrom": {"nl": "Vanaf €499/mo", "en": "From €499/mo"}, "liveIn": {"nl": "Doorlopend", "en": "Ongoing"}, "icon": "infinity-loop of improvement particles", "image": "/aiow/room_custom-ai_beheer.png"},
    ],
  },
];

export const CAMPUS_IMAGE = "/aiow/campus.png";

export const getCapability = (id: string): Capability | undefined => CAPABILITIES.find((c) => c.id === id);
export const getRoom = (capId: string, roomId: string): Room | undefined => getCapability(capId)?.rooms.find((r) => r.id === roomId);
