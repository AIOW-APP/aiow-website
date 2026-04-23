/** AIOW V11 — AI capability content. */

export type Room = { id: string; title: string; emoji: string; subtitle: string; priceFrom: string; liveIn: string; icon: string; image?: string; };
export type Capability = { id: string; label: string; emoji: string; tagline: string; visualMotif: string; rooms: Room[]; buildingImage: string; };

export const CAPABILITIES: Capability[] = [
  {
    "id": "online-presence",
    "label": "Online Presence",
    "emoji": "🌐",
    "tagline": "Gezicht online. Automatisch. 24/7.",
    "visualMotif": "a glass sphere with orbiting rings and floating photo/webpage tiles",
    "rooms": [
      {
        "id": "website",
        "title": "Website & webapp",
        "emoji": "💻",
        "icon": "holographic webpage wireframe floating",
        "subtitle": "Van idee naar live site, AI-gebouwd.",
        "priceFrom": "€149/mo",
        "liveIn": "7-14 dagen",
        "image": "/aiow/room_online-presence_website.webp"
      },
      {
        "id": "social",
        "title": "Social automation",
        "emoji": "📱",
        "icon": "grid of floating photo tiles being scheduled",
        "subtitle": "LinkedIn/Instagram/TikTok, altijd gevoed.",
        "priceFrom": "€99/mo",
        "liveIn": "5-7 dagen",
        "image": "/aiow/room_online-presence_social.webp"
      },
      {
        "id": "seo-geo",
        "title": "SEO & GEO",
        "emoji": "🔍",
        "icon": "glowing magnifying lens with search-node graph",
        "subtitle": "Gevonden door Google én ChatGPT/Perplexity.",
        "priceFrom": "€199/mo",
        "liveIn": "10-14 dagen",
        "image": "/aiow/room_online-presence_seo-geo.webp"
      },
      {
        "id": "content",
        "title": "Content-productie",
        "emoji": "📝",
        "icon": "floating blank canvas with content streams",
        "subtitle": "Blog, nieuwsbrief, whitepaper — in brand-voice.",
        "priceFrom": "€149/mo",
        "liveIn": "7 dagen",
        "image": "/aiow/room_online-presence_content.webp"
      }
    ],
    "buildingImage": "/aiow/building_online-presence.webp"
  },
  {
    "id": "finance",
    "label": "Finance",
    "emoji": "💰",
    "tagline": "Cijfers die zichzelf bijhouden.",
    "visualMotif": "a crystalline tower with flowing liquid-data streams and floating coin discs",
    "rooms": [
      {
        "id": "facturatie",
        "title": "Facturatie",
        "emoji": "🧾",
        "icon": "floating document with digital stamp",
        "subtitle": "Factureren én incasseren, automatisch.",
        "priceFrom": "€99/mo",
        "liveIn": "5 dagen",
        "image": "/aiow/room_finance_facturatie.webp"
      },
      {
        "id": "boekhouding",
        "title": "Boekhouding AI",
        "emoji": "📚",
        "icon": "stack of translucent ledger sheets with auto-sort",
        "subtitle": "Exact/Moneybird/Twinfield — AI doet het werk.",
        "priceFrom": "€249/mo",
        "liveIn": "10 dagen",
        "image": "/aiow/room_finance_boekhouding.webp"
      },
      {
        "id": "cashflow",
        "title": "Cashflow & rapportage",
        "emoji": "📊",
        "icon": "floating 3D bar-chart with glow",
        "subtitle": "Realtime dashboard + alerts bij afwijking.",
        "priceFrom": "€179/mo",
        "liveIn": "7 dagen",
        "image": "/aiow/room_finance_cashflow.webp"
      },
      {
        "id": "debiteuren",
        "title": "Debiteurenbeheer",
        "emoji": "⏱️",
        "icon": "clock-face with payment particles",
        "subtitle": "Late betalers herinnerd zonder dat jij het hoeft te doen.",
        "priceFrom": "€79/mo",
        "liveIn": "3 dagen",
        "image": "/aiow/room_finance_debiteuren.webp"
      }
    ],
    "buildingImage": "/aiow/building_finance.webp"
  },
  {
    "id": "klantcontact",
    "label": "Klantcontact",
    "emoji": "💬",
    "tagline": "Altijd bereikbaar, zonder extra team.",
    "visualMotif": "a translucent dome with speech-waveform particles radiating outward",
    "rooms": [
      {
        "id": "chat",
        "title": "Live chat-bot",
        "emoji": "💭",
        "icon": "chat bubble with AI-agent orb",
        "subtitle": "24/7 op je website, WhatsApp, Messenger.",
        "priceFrom": "€149/mo",
        "liveIn": "5-7 dagen",
        "image": "/aiow/room_klantcontact_chat.webp"
      },
      {
        "id": "email-triage",
        "title": "Email-triage",
        "emoji": "📬",
        "icon": "email envelopes sorted into beams of light",
        "subtitle": "Inbox georganiseerd, concept-antwoorden klaar.",
        "priceFrom": "€99/mo",
        "liveIn": "3 dagen",
        "image": "/aiow/room_klantcontact_email-triage.webp"
      },
      {
        "id": "telefoon",
        "title": "Telefoon-bot",
        "emoji": "☎️",
        "icon": "floating phone handset with AI-voice-wave",
        "subtitle": "AI neemt je telefoon op, boekt afspraken.",
        "priceFrom": "€299/mo",
        "liveIn": "14 dagen",
        "image": "/aiow/room_klantcontact_telefoon.webp"
      },
      {
        "id": "reviews",
        "title": "Reviews-management",
        "emoji": "⭐",
        "icon": "floating star-shapes with response beams",
        "subtitle": "Google/Trustpilot — elke review beantwoord.",
        "priceFrom": "€79/mo",
        "liveIn": "3 dagen",
        "image": "/aiow/room_klantcontact_reviews.webp"
      }
    ],
    "buildingImage": "/aiow/building_klantcontact.webp"
  },
  {
    "id": "operations",
    "label": "Operations",
    "emoji": "⚙️",
    "tagline": "Planning, voorraad, routes — slim gestuurd.",
    "visualMotif": "a multi-tiered gear structure with rotating luminous rings",
    "rooms": [
      {
        "id": "planning",
        "title": "Planning & agenda",
        "emoji": "📅",
        "icon": "3D calendar with auto-filling slots",
        "subtitle": "Rooster, meetings, routes — zelf-optimaliserend.",
        "priceFrom": "€129/mo",
        "liveIn": "5-7 dagen",
        "image": "/aiow/room_operations_planning.webp"
      },
      {
        "id": "voorraad",
        "title": "Voorraad & inkoop",
        "emoji": "📦",
        "icon": "floating crates with supply-chain arrows",
        "subtitle": "Voorspelt wat je nodig hebt, bestelt automatisch.",
        "priceFrom": "€249/mo",
        "liveIn": "10-14 dagen",
        "image": "/aiow/room_operations_voorraad.webp"
      },
      {
        "id": "routes",
        "title": "Route-optimalisatie",
        "emoji": "🗺️",
        "icon": "map with glowing path between nodes",
        "subtitle": "Minder kilometers, meer leveringen per dag.",
        "priceFrom": "€199/mo",
        "liveIn": "10 dagen",
        "image": "/aiow/room_operations_routes.webp"
      },
      {
        "id": "workflow",
        "title": "Workflow-automatisering",
        "emoji": "🔌",
        "icon": "connected-nodes diagram with data flow",
        "subtitle": "Systemen praten automatisch met elkaar.",
        "priceFrom": "Op maat",
        "liveIn": "3-6 weken",
        "image": "/aiow/room_operations_workflow.webp"
      }
    ],
    "buildingImage": "/aiow/building_operations.webp"
  },
  {
    "id": "sales-leadgen",
    "label": "Sales & Leadgen",
    "emoji": "🎯",
    "tagline": "Betere leads, sneller in de pipeline.",
    "visualMotif": "a targeted beam emitter shape with concentric rings and arrows",
    "rooms": [
      {
        "id": "leadgen",
        "title": "Leadgeneration",
        "emoji": "🧲",
        "icon": "magnetic beam pulling lead-orbs closer",
        "subtitle": "ICP-match vinden + outreach, volledig AI-gedreven.",
        "priceFrom": "€399/mo",
        "liveIn": "10 dagen",
        "image": "/aiow/room_sales-leadgen_leadgen.webp"
      },
      {
        "id": "offertes",
        "title": "Offertes",
        "emoji": "📄",
        "icon": "floating offer-document with price-tiles",
        "subtitle": "Klantvraag naar offerte in minuten.",
        "priceFrom": "€129/mo",
        "liveIn": "5 dagen",
        "image": "/aiow/room_sales-leadgen_offertes.webp"
      },
      {
        "id": "crm",
        "title": "CRM-verrijking",
        "emoji": "🗂️",
        "icon": "contact cards with enrichment-data streams",
        "subtitle": "Elke lead automatisch aangevuld en gescoord.",
        "priceFrom": "€179/mo",
        "liveIn": "7 dagen",
        "image": "/aiow/room_sales-leadgen_crm.webp"
      },
      {
        "id": "followup",
        "title": "Follow-up & nurture",
        "emoji": "💌",
        "icon": "looping message threads with gentle glow",
        "subtitle": "Geen lead valt meer tussen wal en schip.",
        "priceFrom": "€149/mo",
        "liveIn": "5 dagen",
        "image": "/aiow/room_sales-leadgen_followup.webp"
      }
    ],
    "buildingImage": "/aiow/building_sales-leadgen.webp"
  },
  {
    "id": "documenten",
    "label": "Documenten & Kennis",
    "emoji": "📚",
    "tagline": "Alles vindbaar, alles gecheckt.",
    "visualMotif": "a stacked glass-books tower with particles flowing between pages",
    "rooms": [
      {
        "id": "contract-review",
        "title": "Contract-review",
        "emoji": "📜",
        "icon": "document with AI-highlight beams",
        "subtitle": "NDA, SLA, koop — risico's gemarkeerd in minuten.",
        "priceFrom": "€299/mo",
        "liveIn": "10 dagen",
        "image": "/aiow/room_documenten_contract-review.webp"
      },
      {
        "id": "dossier",
        "title": "Dossier-automatisering",
        "emoji": "📂",
        "icon": "filing cabinet with floating auto-sort",
        "subtitle": "Intake + archivering zonder handwerk.",
        "priceFrom": "€199/mo",
        "liveIn": "7 dagen",
        "image": "/aiow/room_documenten_dossier.webp"
      },
      {
        "id": "kennisbank",
        "title": "Interne kennisbank",
        "emoji": "🧠",
        "icon": "brain-like node graph with glowing connections",
        "subtitle": "AI die al jullie docs kent, altijd antwoord.",
        "priceFrom": "€249/mo",
        "liveIn": "10-14 dagen",
        "image": "/aiow/room_documenten_kennisbank.webp"
      },
      {
        "id": "compliance",
        "title": "Compliance-check",
        "emoji": "🛡️",
        "icon": "shield with checkmark particles",
        "subtitle": "AVG, Wwft, KYC — doorlopend gecheckt.",
        "priceFrom": "€229/mo",
        "liveIn": "10 dagen",
        "image": "/aiow/room_documenten_compliance.webp"
      }
    ],
    "buildingImage": "/aiow/building_documenten.webp"
  },
  {
    "id": "hr",
    "label": "HR & Team",
    "emoji": "👥",
    "tagline": "Mensen vinden, inwerken, ondersteunen.",
    "visualMotif": "a cluster of connected glowing nodes forming a team-network",
    "rooms": [
      {
        "id": "sollicitaties",
        "title": "Sollicitatie-triage",
        "emoji": "📋",
        "icon": "CV-stacks with auto-ranking beams",
        "subtitle": "CV's gescreend, kandidaten gerankt.",
        "priceFrom": "€149/mo",
        "liveIn": "7 dagen",
        "image": "/aiow/room_hr_sollicitaties.webp"
      },
      {
        "id": "onboarding",
        "title": "Onboarding",
        "emoji": "🚪",
        "icon": "floating door with welcome-path lights",
        "subtitle": "Nieuwe medewerker, dag 1 volledig voorbereid.",
        "priceFrom": "€129/mo",
        "liveIn": "5 dagen",
        "image": "/aiow/room_hr_onboarding.webp"
      },
      {
        "id": "interne-bot",
        "title": "Intern HR-loket",
        "emoji": "💬",
        "icon": "AI-agent orb answering from HR-knowledge",
        "subtitle": "Medewerkers vragen, AI antwoordt direct.",
        "priceFrom": "€99/mo",
        "liveIn": "5 dagen",
        "image": "/aiow/room_hr_interne-bot.webp"
      },
      {
        "id": "rooster",
        "title": "Rooster & planning",
        "emoji": "📅",
        "icon": "schedule grid with auto-filling team",
        "subtitle": "Optimaal rooster in seconden, niet uren.",
        "priceFrom": "€99/mo",
        "liveIn": "5 dagen",
        "image": "/aiow/room_hr_rooster.webp"
      }
    ],
    "buildingImage": "/aiow/building_hr.webp"
  },
  {
    "id": "custom-ai",
    "label": "Custom AI",
    "emoji": "🧪",
    "tagline": "Niks past? Dan bouwen we het.",
    "visualMotif": "a floating laboratory pod with bubbling energy and experimental particle effects",
    "rooms": [
      {
        "id": "discovery",
        "title": "Discovery-call",
        "emoji": "🔬",
        "icon": "focused light-beam on abstract idea-form",
        "subtitle": "Gratis gesprek: is AI jouw oplossing?",
        "priceFrom": "Gratis",
        "liveIn": "Deze week nog",
        "image": "/aiow/room_custom-ai_discovery.webp"
      },
      {
        "id": "poc",
        "title": "Proof of Concept",
        "emoji": "⚗️",
        "icon": "experiment-flask with emerging solution",
        "subtitle": "In 2-4 weken werkend prototype op jouw data.",
        "priceFrom": "Vanaf €4.950",
        "liveIn": "2-4 weken",
        "image": "/aiow/room_custom-ai_poc.webp"
      },
      {
        "id": "build",
        "title": "Custom AI-build",
        "emoji": "🏗️",
        "icon": "3D construction with modular AI-blocks",
        "subtitle": "Productie-klare AI op maat.",
        "priceFrom": "Op maat",
        "liveIn": "4-12 weken",
        "image": "/aiow/room_custom-ai_build.webp"
      },
      {
        "id": "beheer",
        "title": "Beheer & evolutie",
        "emoji": "♾️",
        "icon": "infinity-loop of improvement particles",
        "subtitle": "We blijven jouw AI trainen en verbeteren.",
        "priceFrom": "Vanaf €499/mo",
        "liveIn": "Doorlopend",
        "image": "/aiow/room_custom-ai_beheer.webp"
      }
    ],
    "buildingImage": "/aiow/building_custom-ai.webp"
  }
];

export const CAMPUS_IMAGE = '/aiow/campus.webp';

export const getCapability = (id: string): Capability | undefined => CAPABILITIES.find((c) => c.id === id);
export const getRoom = (capId: string, roomId: string): Room | undefined => getCapability(capId)?.rooms.find((r) => r.id === roomId);
