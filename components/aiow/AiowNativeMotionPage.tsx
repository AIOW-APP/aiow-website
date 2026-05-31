"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/core/analytics/client";
import styles from "./AiowNativeMotionPage.module.css";
import { AiowWebGPUCore } from "./AiowWebGPUCore";

type Lang = "nl" | "en";

const content = {
  nl: {
    nav: { story: "Verhaal", model: "Werking", scan: "AI-scan" },
    brand: "Secure AI worklayer",
    themeLabel: "Thema",
    voice: {
      aria: "Beluister wat AIOW doet",
      title: "Audio briefing: wat doet AIOW?",
      hint: "Korte uitleg in ±90 sec",
      src: "/aiow/audio/aiow-gpt-voice-briefing-nl.mp3",
      fallback: "Je browser ondersteunt geen audio. De geschreven uitleg staat op deze pagina.",
    },
    hero: {
      eyebrow: "Voor teams die AI veilig willen inzetten",
      headline: "Jouw persoonlijke AI-medewerker voor je bedrijf.",
      text: "Wij installeren een AI die je bedrijf leert kennen, werk onthoudt en veilig helpt met klantvragen, offertes, content, planning en administratie.",
      primary: "Start met je persoonlijke AI",
      secondary: "Bekijk de werking",
      trust: ["Lokaal waar nodig", "Cloud waar het mag", "Agents met controle"],
      trustLabel: "AIOW kernpunten",
      caption: "Van losse AI-tools naar één eigen AI-assistent die je bedrijf begrijpt en gecontroleerd blijft werken.",
      valueProof: [
        ["Wij installeren", "jouw persoonlijke AI"],
        ["Voor", "klanten, offertes, planning en kennis"],
        ["Start", "klein vanaf €2.500"],
      ],
    },
    aiDemo: {
      eyebrow: "Live productgevoel",
      headline: "Zie hoe je AI-medewerker straks werkt.",
      text: "Geen abstracte belofte: een klantvraag wordt context, concept, menselijke approval en een zichtbare portalstatus.",
      tabs: [
        { label: "Klantvraag", input: "Klant vraagt: kunnen jullie morgen een offerte sturen?", ai: "AI vat context samen, zoekt eerdere afspraken en maakt een conceptantwoord.", approval: "Mens controleert prijs, toon en belofte vóór verzending.", status: "Portal: offerte in voorbereiding" },
        { label: "Offerte", input: "Nieuwe lead wil Persoonlijke AI Starter.", ai: "AI zet scope, aannames, onderhoud en extra werk op uurbasis in één offerteblok.", approval: "AIOW checkt datagrens, planning en buiten-scope voordat klant het ziet.", status: "Portal: offerte klaar voor review" },
        { label: "Planning", input: "Klant wil starten na akkoord.", ai: "AI stelt intake, datagrenssessie en installatie-kickoff voor met dependencies.", approval: "Planning pas definitief na scope-akkoord en veilige toegangskeuzes.", status: "Portal: planning voorbereid" },
      ],
      rail: ["Input", "Bedrijfsgeheugen", "AI-concept", "Approval", "Portalstatus"],
      cta: "Bekijk klantportal",
    },
    storyLabel: "AIOW 7-layer pinned scroll story",
    layers: [
      { id: "promise", n: "01", eyebrow: "De belofte", headline: "Begin met één proces.", text: "Kies waar AI direct waarde moet leveren — zonder je data open te gooien.", chips: ["veilig", "praktisch", "bedrijfsklaar"], videoBrief: "Kalm premium kantoor, team start werkdag, subtiele AI-werklaag verbindt mensen, documenten en systemen." },
      { id: "chaos", n: "02", eyebrow: "Het probleem", headline: "Losse AI wordt risico.", text: "Accounts, prompts en klantdata raken versnipperd zonder eigenaar of beleid.", chips: ["shadow AI", "geen eigenaar", "geen beleid"], videoBrief: "Herkenbare kantoorchaos: mail, WhatsApp, docs, spreadsheets en AI-tabs; druk maar realistisch, niet hysterisch." },
      { id: "boundary", n: "03", eyebrow: "Het risico", headline: "Eerst de datagrens.", text: "Wat blijft lokaal, wat mag cloud, en wie moet goedkeuren?", chips: ["cloud policy", "lokale LLMs", "datagrens"], videoBrief: "Split visual: externe cloudroute versus interne veilige route; policy-gate beslist rustig wat wel/niet naar buiten mag." },
      { id: "worklayer", n: "04", eyebrow: "De oplossing", headline: "Dan één werklaag.", text: "Processen, agents, modellen en rechten komen samen in één controleerbaar systeem.", chips: ["proceslaag", "governance", "integratie"], videoBrief: "Losse procesblokken klikken in één nette operating layer; AIOW zit tussen team, tools, documenten, modellen en approvals." },
      { id: "hardware", n: "05", eyebrow: "De infrastructuur", headline: "Private/cloud volgens beleid.", text: "Private infrastructuur en cloudmodellen werken alleen binnen afgesproken routes.", chips: ["private AI", "modelrouting", "cloud waar het mag"], videoBrief: "Premium infrastructuurvisual: private compute, lokale modelnode en goedgekeurde cloudroutes." },
      { id: "agents", n: "06", eyebrow: "De uitvoering", headline: "Agents voeren uit.", text: "Ze lezen, routeren, schrijven en dragen over — met approval waar nodig.", chips: ["OpenClaw", "Hermes", "human approval"], videoBrief: "Een klantvraag wordt samenvatting, taak, concept, approval, CRM/update en teamhandoff; één rustige kettingreactie." },
      { id: "outcome", n: "07", eyebrow: "Het resultaat", headline: "Eindig met controle.", text: "Minder ruis, sneller werk en een duidelijk eerste vervolg: de AI-scan.", chips: ["rust", "snelheid", "controle"], videoBrief: "Terug naar hetzelfde bedrijf: team werkt gefocust, dashboard helder, approvals afgerond, veilige AI-laag draait op de achtergrond." },
    ],
    search: {
      eyebrow: "AI-oplossingen voor Nederland",
      headline: "AI-integratie, automatisering en private AI voor bedrijven.",
      text: "Vier concrete ingangen waar Nederlandse teams AIOW voor inzetten — van eerste proces-scan tot agents met veilige datagrens.",
      points: [
        ["AI-integratie MKB", "Van inbox, offertes en planning naar één gecontroleerde AI-werklaag."],
        ["Private en lokale AI", "Data blijft lokaal waar nodig; cloudmodellen alleen volgens beleid."],
        ["AI-agents voor teams", "Agents voeren terugkerend werk uit met logging, rollen en approvalregels."],
        ["AI-scan Nederland", "Een concrete eerste analyse voor proceskansen, risico's en snelle winst."],
      ],
    },
    faq: [
      ["Wat doet AIOW?", "AIOW ontwerpt en bouwt veilige AI-werklagen voor Nederlandse bedrijven: processen, data, agents, lokale/private AI en menselijke approvals in één bestuurbaar systeem."],
      ["Voor wie is AIOW?", "Voor MKB-bedrijven, operations teams, logistiek, finance, support, agencies en technische teams die AI willen gebruiken zonder losse chatbot-chaos of datarisico."],
      ["Wat krijg je na de AI-scan?", "Een duidelijk overzicht van de beste eerste AI-usecase, datagrens, risico's, quick wins en een concreet voorstel voor een veilige pilot."],
      ["Werkt AIOW met GPT, Claude en lokale AI?", "Ja. AIOW kiest per proces welke modellen passen: GPT, Claude, andere cloudmodellen of lokale/private modellen binnen beheerde infrastructuur."],
    ],
    operating: {
      eyebrow: "Hoe AIOW werkt",
      headline: "Van één proces naar een veilige AI-werklaag.",
      text: "We kiezen eerst de juiste workflow, bepalen de datagrens, bouwen agents met approvals en maken de output meetbaar.",
      steps: [
        ["1", "Kies één proces", "Bijvoorbeeld klantcontact, offertes, planning, finance of documenten."],
        ["2", "Bepaal de datagrens", "Wat blijft lokaal, wat mag cloud, wie mag goedkeuren en waar ligt het risico?"],
        ["3", "Bouw agents en routing", "OpenClaw/Hermes/AIOW-workers krijgen taken, tools, geheugen en approvalregels."],
        ["4", "Meet en verbeter", "Elke handoff, status en output wordt zichtbaar zodat het bedrijf rustiger gaat werken."],
      ],
    },
    router: {
      eyebrow: "Live systeemlaag",
      headline: "Beleid, data en agents onder controle.",
      text: "De control room laat zien welke route een taak neemt: lokaal, cloud, approval of agent-handoff.",
    },
    pricing: {
      eyebrow: "Budget zonder verrassingen",
      headline: "Begin klein. Groei later door.",
      text: "Voor kleine ondernemers maken we de instap bewust simpel: één persoonlijke AI die je bedrijf leert kennen. Voor grotere teams kan dezelfde basis doorgroeien naar private worklayers, lokale AI-nodes en governance.",
      formula: ["gratis quick check", "persoonlijke AI-installatie", "onderhoud", "uitbreiding per uur"],
      scan: { label: "Eerst helderheid", title: "AI-systeemscan", price: "€950", suffix: "vanaf", text: "Proceskaart, datagrens, risico’s, beste eerste pilot en routeadvies. Een korte kennismaking/quick check kan gratis via WhatsApp." },
      plans: [
        { name: "Persoonlijke AI Starter", fit: "ZZP / kleine ondernemer", price: "vanaf €2.500", monthly: "+ €650/mnd onderhoud", badge: "laagste instap", features: ["eigen AI-medewerker voor je bedrijf", "bedrijfskennis, werkwijze en tone of voice", "klantvragen, offertes, content en planning", "extra hulp/uitbreiding apart per uur"] },
        { name: "Private Worklayer", fit: "klein team + hybride AI", price: "vanaf €8.500", monthly: "+ €950/mnd per machine", badge: "hybride", features: ["beheerde private AI-omgeving", "lokale routing en veilige cloud", "documenten/workflows", "infrastructuur apart begroot"] },
        { name: "Local AI Node", fit: "gevoelige data / lokale LLMs", price: "vanaf €18.500", monthly: "+ €1.750/mnd per machine", badge: "private AI", features: ["private compute voor lokale AI", "lokale modellen en modelbeheer", "private documenten/agents", "monitoring, updates en governance"] },
        { name: "Business AI Layer", fit: "meerdere processen en nodes", price: "vanaf €45.000", monthly: "vanaf €2.500/mnd + nodes", badge: "schaalbaar", features: ["platformlaag voor teams", "meerdere AI-nodes", "integraties, dashboards en rollen", "beheercontract per actieve machine"] },
      ],
      note: "Alle bedragen zijn richtprijzen excl. btw. Maandkosten zijn voor technisch onderhoud, hosting, updates, monitoring en continuïteit — niet voor onbeperkte service. Nieuwe workflows, extra koppelingen, begeleiding en optimalisaties worden apart uitgevoerd op uurbasis vanaf €175/u.",
      cta: "Bereken je AI-route in 4 vragen",
    },
    afterScan: {
      eyebrow: "Na de AI-scan",
      headline: "Van WhatsApp naar offerte, planning en veilige uitvoering.",
      text: "De intake is bewust klein. Daarna maken we pas concreet wat er gebouwd wordt, wat het kost, wie akkoord geeft en welke data waar mag lopen.",
      steps: [
        ["1", "Intake via WhatsApp", "Je stuurt context zonder lang formulier. Wij vragen alleen wat nodig is om de eerste route te bepalen."],
        ["2", "Scanrapport + offerte", "Je krijgt usecase, datagrens, risico’s, infrastructuurkeuze en een heldere offerte met aannames."],
        ["3", "Akkoord → planning", "Na akkoord plannen we kickoff, toegang, technische keuzes en eerste pilotstappen."],
      ],
      note: "Iedere geïnteresseerde klant krijgt een eigen klantportal-route: intake, offerte, scope, datagrens, planning en status op één plek. In deze fase is dat manual-safe: geen betaling, geen echte acceptatie en geen live automatisering zonder expliciet akkoord.",
    },
    cta: {
      eyebrow: "AI-scan voor je bedrijf",
      headline: "Vind je eerste\nveilige AI-winst",
      text: "Kies twee snelle opties. WhatsApp neemt je context direct mee.",
      proof: ["30 min", "veilig starten", "concreet vervolg"],
      intake: {
        typeLabel: "Wat wil je vooral verbeteren?",
        typeOptions: ["Bedrijf", "Team", "Local AI", "Automation"],
        processLabel: "Waar wil je AI als eerste inzetten?",
        processOptions: ["Klantcontact", "Offertes", "Planning", "Finance", "Documenten", "Anders"],
        otherProcessPlaceholder: "Bijv. HR, sales, support, operatie…",
        goalLabel: "Wat is nu het belangrijkst?",
        goalOptions: ["Tijd winnen", "Minder risico", "Betere output", "AI-structuur"],
        questionLabel: "Vraag of context",
        questionPlaceholder: "Bijv. we gebruiken al ChatGPT, maar missen beleid en overzicht.",
        defaultQuestion: "Ik wil weten waar AIOW veilig waarde kan leveren.",
        whatsappIntro: "Hoi AIOW, ik wil een AI-scan plannen.",
      },
      button: "Stuur via WhatsApp",
    },
  },
  en: {
    nav: { story: "Story", model: "How it works", scan: "AI scan" },
    brand: "Secure AI worklayer",
    themeLabel: "Theme",
    voice: {
      aria: "Listen to what AIOW does",
      title: "Audio briefing: what does AIOW do?",
      hint: "Short explanation in ±90 sec",
      src: "/aiow/audio/aiow-gpt-voice-briefing-en.mp3",
      fallback: "Your browser does not support audio. The written explanation is on this page.",
    },
    hero: {
      eyebrow: "For teams ready to use AI safely",
      headline: "Your personal AI worker for your business.",
      text: "We install an AI that learns your business, remembers your way of working and safely helps with customer questions, quotes, content, planning and admin.",
      primary: "Start with your personal AI",
      secondary: "See how it works",
      trust: ["Local where needed", "Cloud where allowed", "Agents with control"],
      trustLabel: "AIOW core points",
      caption: "From scattered AI tools to one personal AI assistant that understands your business and stays controlled.",
      valueProof: [
        ["We install", "your personal AI"],
        ["For", "customers, quotes, planning and knowledge"],
        ["Start", "small from €2,500"],
      ],
    },
    aiDemo: {
      eyebrow: "Live product feel",
      headline: "See how your AI worker will operate.",
      text: "Not an abstract promise: a customer request becomes context, a draft, human approval and a visible portal status.",
      tabs: [
        { label: "Customer", input: "Customer asks: can you send a quote tomorrow?", ai: "AI summarizes context, checks previous agreements and drafts a reply.", approval: "A human checks price, tone and promise before anything is sent.", status: "Portal: quote in preparation" },
        { label: "Quote", input: "New lead wants the Personal AI Starter.", ai: "AI turns scope, assumptions, maintenance and hourly extra work into one quote block.", approval: "AIOW checks data boundary, planning and out-of-scope before the customer sees it.", status: "Portal: quote ready for review" },
        { label: "Planning", input: "Customer wants to start after approval.", ai: "AI proposes intake, data-boundary session and installation kickoff with dependencies.", approval: "Planning only becomes final after scope approval and safe access choices.", status: "Portal: planning prepared" },
      ],
      rail: ["Input", "Business memory", "AI draft", "Approval", "Portal status"],
      cta: "View customer portal",
    },
    storyLabel: "AIOW 7-layer pinned scroll story",
    layers: [
      { id: "promise", n: "01", eyebrow: "The promise", headline: "Start with one process.", text: "Pick where AI should create value first — without exposing your data.", chips: ["secure", "practical", "business-ready"], videoBrief: "A calm premium office as the team starts the day; a subtle AI worklayer connects people, documents and systems." },
      { id: "chaos", n: "02", eyebrow: "The problem", headline: "Scattered AI creates risk.", text: "Accounts, prompts and customer data fragment without ownership or policy.", chips: ["shadow AI", "no owner", "no policy"], videoBrief: "Recognizable office pressure: mail, chat, docs, spreadsheets and AI tabs; busy but realistic, never hysterical." },
      { id: "boundary", n: "03", eyebrow: "The risk", headline: "Set the data boundary.", text: "What stays local, what may use cloud, and who must approve?", chips: ["cloud policy", "local LLMs", "data boundary"], videoBrief: "A split visual: external cloud route versus internal secure route; a calm policy gate decides what may leave." },
      { id: "worklayer", n: "04", eyebrow: "The solution", headline: "Then one worklayer.", text: "Processes, agents, models and permissions become one controlled system.", chips: ["process layer", "governance", "integration"], videoBrief: "Loose process blocks align into one operating layer between teams, tools, documents, models and approvals." },
      { id: "hardware", n: "05", eyebrow: "The infrastructure", headline: "Private/cloud by policy.", text: "Private infrastructure and cloud models run only through approved routes.", chips: ["private AI", "model routing", "cloud where allowed"], videoBrief: "Premium infrastructure visual: private compute, a local model node and approved cloud routes." },
      { id: "agents", n: "06", eyebrow: "The execution", headline: "Agents execute work.", text: "They read, route, write and hand off — with approval where needed.", chips: ["OpenClaw", "Hermes", "human approval"], videoBrief: "A customer request becomes a summary, task, draft, approval, CRM update and team handoff." },
      { id: "outcome", n: "07", eyebrow: "The outcome", headline: "End with control.", text: "Less noise, faster work and a clear next step: the AI scan.", chips: ["calm", "speed", "control"], videoBrief: "The same company after AIOW: focused team, clear dashboards, completed approvals and a safe AI layer running quietly." },
    ],
    search: {
      eyebrow: "AI solutions for the Netherlands",
      headline: "AI integration, automation and private AI for companies.",
      text: "Four concrete ways Dutch teams use AIOW — from the first process scan to agents with a safe data boundary.",
      points: [
        ["AI integration for SMEs", "From inbox, quotes and planning to one controlled AI worklayer."],
        ["Private and local AI", "Data stays local where needed; cloud models only by policy."],
        ["AI agents for teams", "Agents execute recurring work with logging, roles and approval rules."],
        ["AI scan Netherlands", "A concrete first analysis for process opportunities, risks and quick wins."],
      ],
    },
    faq: [
      ["What does AIOW do?", "AIOW designs and builds secure AI worklayers for Dutch companies: processes, data, agents, local/private AI and human approvals in one controllable system."],
      ["Who is AIOW for?", "SMEs, operations teams, logistics, finance, support, agencies and technical teams that want AI without scattered chatbot chaos or data risk."],
      ["What do you get after the AI scan?", "A clear overview of the best first AI use case, data boundary, risks, quick wins and a concrete safe pilot proposal."],
      ["Does AIOW work with GPT, Claude and local AI?", "Yes. AIOW chooses the right model per process: GPT, Claude, other cloud models or local/private models inside managed infrastructure."],
    ],
    operating: {
      eyebrow: "How AIOW works",
      headline: "From one process to a secure AI worklayer.",
      text: "We choose the right workflow first, define the data boundary, build agents with approvals and make output measurable.",
      steps: [
        ["1", "Choose one process", "For example customer contact, quotes, planning, finance or documents."],
        ["2", "Define the data boundary", "What stays local, what may use cloud, who approves and where is the risk?"],
        ["3", "Build agents and routing", "OpenClaw/Hermes/AIOW workers get tasks, tools, memory and approval rules."],
        ["4", "Measure and improve", "Every handoff, status and output becomes visible so the company works with more calm."],
      ],
    },
    router: {
      eyebrow: "Live operating layer",
      headline: "Policy, data and agents under control.",
      text: "The control room shows which route a task takes: local, cloud, approval or agent handoff.",
    },
    pricing: {
      eyebrow: "Budget without surprises",
      headline: "Start small. Scale later.",
      text: "For small business owners, the entry should feel simple: one personal AI that learns the company. For larger teams, that same foundation can scale into private worklayers, local AI nodes and governance.",
      formula: ["free quick check", "personal AI install", "maintenance", "expansion hourly"],
      scan: { label: "Clarity first", title: "AI system scan", price: "€950", suffix: "from", text: "Process map, data boundary, risks, best first pilot and route advice. A short intro/quick check can be done free through WhatsApp." },
      plans: [
        { name: "Personal AI Starter", fit: "solo / small business", price: "from €2,500", monthly: "+ €650/mo maintenance", badge: "entry", features: ["own AI worker for your business", "company knowledge, workflow and tone of voice", "customer questions, quotes, content and planning", "extra help/expansion billed hourly"] },
        { name: "Private Worklayer", fit: "small team + hybrid AI", price: "from €8,500", monthly: "+ €950/mo per machine", badge: "hybrid", features: ["managed private AI environment", "local routing and safe cloud", "documents/workflows", "infrastructure scoped separately"] },
        { name: "Local AI Node", fit: "sensitive data / local LLMs", price: "from €18,500", monthly: "+ €1,750/mo per machine", badge: "private AI", features: ["private compute for local AI", "local models and model management", "private documents/agents", "monitoring, updates and governance"] },
        { name: "Business AI Layer", fit: "multiple processes and nodes", price: "from €45,000", monthly: "from €2,500/mo + nodes", badge: "scalable", features: ["platform layer for teams", "multiple AI nodes", "integrations, dashboards and roles", "managed contract per active machine"] },
      ],
      note: "All amounts are starting prices excl. VAT. Monthly fees cover technical maintenance, hosting, updates, monitoring and continuity — not unlimited service. New workflows, extra integrations, guidance and optimisations are billed separately from €175/h.",
      cta: "Calculate your AI route in 4 questions",
    },
    afterScan: {
      eyebrow: "After the AI scan",
      headline: "From WhatsApp to quote, planning and safe delivery.",
      text: "The intake is intentionally small. After that we make clear what will be built, what it costs, who approves and which data may go where.",
      steps: [
        ["1", "Intake through WhatsApp", "You send context without a long form. We only ask what is needed to define the first route."],
        ["2", "Scan report + quote", "You receive use case, data boundary, risks, infrastructure choice and a clear quote with assumptions."],
        ["3", "Approval → planning", "After approval we plan kickoff, access, technical choices and first pilot steps."],
      ],
      note: "Every interested customer gets their own customer portal route: intake, quote, scope, data boundary, planning and status in one place. In this phase it is manual-safe: no payment, no real acceptance and no live automation without explicit approval.",
    },
    cta: {
      eyebrow: "AI scan for your company",
      headline: "Find your first safe AI win.",
      text: "Choose two quick options. WhatsApp sends your context with the message.",
      proof: ["30 min", "safe start", "clear next step"],
      intake: {
        typeLabel: "What should improve first?",
        typeOptions: ["Company", "Team", "Local AI", "Automation"],
        processLabel: "Where should AI help first?",
        processOptions: ["Customer contact", "Quotes", "Planning", "Finance", "Documents", "Other"],
        otherProcessPlaceholder: "E.g. HR, sales, support, operations…",
        goalLabel: "What matters most now?",
        goalOptions: ["Save time", "Reduce risk", "Better output", "AI structure"],
        questionLabel: "Question or context",
        questionPlaceholder: "E.g. we already use ChatGPT, but lack policy and overview.",
        defaultQuestion: "I want to know where AIOW can safely create value.",
        whatsappIntro: "Hi AIOW, I want to book an AI scan.",
      },
      button: "Send via WhatsApp",
    },
  },
} as const;


const nlAuthorityLinks = [
  ["AI-installateur Nederland", "/nl/ai-installateur-nederland"],
  ["AI-oplossingen bedrijven", "/nl/ai-oplossingen-bedrijven"],
  ["AI-implementatie bedrijf", "/nl/ai-implementatie-bedrijf"],
  ["AIOW werkwijze", "/nl/werkwijze-ai-implementatie"],
  ["AI veiligheid", "/nl/veiligheid-governance-ai"],
  ["AI-agents bedrijven", "/nl/ai-agents-bedrijven"],
  ["Alle sectoren", "/nl/sectoren"],
  ["Alle regio’s", "/nl/regios"],
  ["AI vergelijkingen", "/nl/vergelijkingen"],
  ["AI voor installatiebedrijven", "/nl/sector/installatiebedrijven"],
  ["AI voor finance", "/nl/sector/finance-administratie"],
  ["Lokale AI vs ChatGPT", "/nl/vergelijking/lokale-ai-vs-chatgpt"],
  ["AI-integratie MKB", "/nl/ai-integratie-mkb"],
  ["Lokale/private AI", "/nl/lokale-private-ai"],
] as const;

const layerMedia = [
  {
    desktop: "/aiow/story-v415/desktop/02-intake-hub.png",
    mobile: "/aiow/story-v415/mobile/02-intake-hub.png",
    video: { desktopLight: "/aiow/homepage-story/layer-01/layer-01_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-01/layer-01_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-01/layer-01_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-01/layer-01_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/01-mess-before-ai.png",
    mobile: "/aiow/story-v415/mobile/01-mess-before-ai.png",
    video: { desktopLight: "/aiow/homepage-story/layer-02/layer-02_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-02/layer-02_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-02/layer-02_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-02/layer-02_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/03-private-boundary.png",
    mobile: "/aiow/story-v415/mobile/03-private-boundary.png",
    video: { desktopLight: "/aiow/homepage-story/layer-03/layer-03_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-03/layer-03_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-03/layer-03_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-03/layer-03_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/05-model-router.png",
    mobile: "/aiow/story-v415/mobile/05-model-router.png",
    video: { desktopLight: "/aiow/homepage-story/layer-04/layer-04_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-04/layer-04_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-04/layer-04_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-04/layer-04_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/04-local-hardware-dock.png",
    mobile: "/aiow/story-v415/mobile/04-local-hardware-dock.png",
    video: { desktopLight: "/aiow/homepage-story/layer-05/layer-05_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-05/layer-05_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-05/layer-05_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-05/layer-05_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/06-business-agents.png",
    mobile: "/aiow/story-v415/mobile/06-business-agents.png",
    video: { desktopLight: "/aiow/homepage-story/layer-06/layer-06_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-06/layer-06_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-06/layer-06_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-06/layer-06_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/12-final-installation.png",
    mobile: "/aiow/story-v415/mobile/12-final-installation.png",
    video: { desktopLight: "/aiow/homepage-story/layer-07/layer-07_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-07/layer-07_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-07/layer-07_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-07/layer-07_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
 ] as const;

const desktopLayerTimingWeights = [0.95, 1.05, 1.18, 1.22, 1.05, 1.12, 1.02] as const;
const mobileLayerTimingWeights = [1.05, 1.06, 1.22, 1.26, 1.10, 1.18, 1.05] as const;

const storyScrubRanges = [
  { start: 0.08, end: 0.92 },
  { start: 0.04, end: 0.86 },
  { start: 0.10, end: 0.90 },
  { start: 0.07, end: 0.94 },
  { start: 0.12, end: 0.88 },
  { start: 0.06, end: 0.92 },
  { start: 0.14, end: 0.96 },
] as const;

const layerMotion = [
  { mode: "promise", enter: 0.20, exit: 0.80, lift: 10, scale: 0.012, contrast: 1.01 },
  { mode: "chaos", enter: 0.13, exit: 0.72, lift: 18, scale: 0.020, contrast: 1.05 },
  { mode: "boundary", enter: 0.18, exit: 0.80, lift: 12, scale: 0.014, contrast: 1.02 },
  { mode: "governance", enter: 0.22, exit: 0.84, lift: 8, scale: 0.010, contrast: 1.00 },
  { mode: "infrastructure", enter: 0.18, exit: 0.78, lift: 10, scale: 0.012, contrast: 1.02 },
  { mode: "agents", enter: 0.15, exit: 0.76, lift: 14, scale: 0.016, contrast: 1.03 },
  { mode: "outcome", enter: 0.24, exit: 0.86, lift: 7, scale: 0.009, contrast: 0.99 },
] as const;

function getWeightedStorySegment(raw: number, isMobile: boolean) {
  const weights = isMobile ? mobileLayerTimingWeights : desktopLayerTimingWeights;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const target = Math.min(total - 0.0001, Math.max(0, raw) * total);
  let cursor = 0;
  for (let index = 0; index < weights.length; index += 1) {
    const weight = weights[index];
    if (target < cursor + weight || index === weights.length - 1) {
      return {
        index,
        local: Math.min(1, Math.max(0, (target - cursor) / weight)),
      };
    }
    cursor += weight;
  }
  return { index: weights.length - 1, local: 1 };
}

function mapScrubTime(layerIndex: number, local: number) {
  const range = storyScrubRanges[layerIndex] ?? { start: 0.04, end: 0.96 };
  const clamped = Math.min(1, Math.max(0, local));
  return range.start + (range.end - range.start) * clamped;
}

function mapMagneticHoldProgress(local: number, isMobile: boolean, layerIndex: number) {
  const clamped = Math.min(1, Math.max(0, local));
  const holdStart = isMobile ? 0.30 : 0.34;
  const holdEnd = isMobile ? 0.74 : 0.68;
  const holdStrengthByLayer = [0.54, 0.60, 0.66, 0.70, 0.58, 0.64, 0.62] as const;
  const strength = holdStrengthByLayer[layerIndex] ?? 0.6;
  const smooth = (value: number) => value * value * (3 - 2 * value);

  if (clamped < holdStart) {
    const t = smooth(clamped / holdStart);
    return t * 0.42;
  }
  if (clamped <= holdEnd) {
    const t = (clamped - holdStart) / Math.max(0.0001, holdEnd - holdStart);
    const slow = 0.42 + smooth(t) * 0.20;
    const linear = 0.42 + t * 0.20;
    return linear * (1 - strength) + slow * strength;
  }
  const t = smooth((clamped - holdEnd) / Math.max(0.0001, 1 - holdEnd));
  return 0.62 + t * 0.38;
}

function getStoryVideoSrc(index: number, theme: "light" | "dark", isMobile: boolean) {
  const media = layerMedia[index].video;
  if (isMobile) return theme === "dark" ? media.mobileDark : media.mobileLight;
  return theme === "dark" ? media.desktopDark : media.desktopLight;
}

function ThemeToggle({ theme, setTheme, label }: { theme: "light" | "dark"; setTheme: (value: "light" | "dark") => void; label: string }) {
  const nextTheme = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      className={styles.themeToggle}
      aria-label={`${label}: switch to ${nextTheme}`}
      onClick={() => setTheme(nextTheme)}
    >
      {nextTheme === "dark" ? "Dark" : "Light"}
    </button>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (value: Lang) => void }) {
  const nextLang = lang === "nl" ? "en" : "nl";
  return (
    <button
      type="button"
      className={styles.langToggle}
      aria-label={`Switch language to ${nextLang.toUpperCase()}`}
      onClick={() => setLang(nextLang)}
    >
      {nextLang.toUpperCase()}
    </button>
  );
}


function AiowCursorOrb() {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const layer = layerRef.current;
    const core = coreRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!layer || !core || !ring || !label) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let lastTarget: Element | null = null;

    document.documentElement.classList.add("aiow-cursor-ready");

    const setMode = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const interactive = element?.closest("a, button, input, textarea, select, [role='button'], [data-cursor]");
      if (interactive === lastTarget) return;
      lastTarget = interactive ?? null;
      layer.dataset.mode = interactive ? "action" : "scan";
      const tag = interactive?.tagName.toLowerCase();
      const text = interactive?.getAttribute("aria-label") || interactive?.textContent?.trim() || "";
      if (tag === "a" && /whatsapp|stuur|send/i.test(text)) label.textContent = "SEND";
      else if (tag === "a" || tag === "button") label.textContent = "OPEN";
      else if (interactive) label.textContent = "TYPE";
      else label.textContent = "SCAN";
    };

    const move = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      core.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      setMode(event.target);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = 0;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      if (Math.abs(rx - mx) > 0.1 || Math.abs(ry - my) > 0.1) raf = requestAnimationFrame(tick);
    };

    const down = () => { layer.dataset.pressed = "true"; };
    const up = () => { layer.dataset.pressed = "false"; };
    const leave = () => { layer.dataset.visible = "false"; };
    const enter = () => { layer.dataset.visible = "true"; };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down, { passive: true });
    window.addEventListener("mouseup", up, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave, { passive: true });
    document.documentElement.addEventListener("mouseenter", enter, { passive: true });
    layer.dataset.visible = "true";
    layer.dataset.mode = "scan";
    label.textContent = "SCAN";

    return () => {
      document.documentElement.classList.remove("aiow-cursor-ready");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.cursorOrb} aria-hidden="true">
      <div ref={ringRef} className={styles.cursorRing}>
        <span ref={labelRef}>SCAN</span>
      </div>
      <div ref={coreRef} className={styles.cursorCore} />
    </div>
  );
}

export function AiowNativeMotionPage({ initialLang = "nl" }: { initialLang?: Lang } = {}) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const requested = new URLSearchParams(window.location.search).get("theme");
    if (requested === "dark" || requested === "light") return requested;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [lang, setLang] = useState<Lang>(initialLang);
  const current = content[lang];
  const layers = current.layers;
  const [activeLayer, setActiveLayer] = useState(0);
  const [storyReady, setStoryReady] = useState(true);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyLocalProgress, setStoryLocalProgress] = useState(0);
  const [storyPhase, setStoryPhase] = useState<"intro" | "hold" | "outro">("intro");
  const [isMobileStory, setIsMobileStory] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches);
  const [debugScroll, setDebugScroll] = useState(false);
  const [storyPreloaded, setStoryPreloaded] = useState(false);
  const [storyWarm, setStoryWarm] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedScanType, setSelectedScanType] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [customProcess, setCustomProcess] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [scanQuestion, setScanQuestion] = useState("");
  const [intakeStarted, setIntakeStarted] = useState(false);
  const [intakeStep, setIntakeStep] = useState(0);
  const [activeDemo, setActiveDemo] = useState(0);
  const [budgetWorkflows, setBudgetWorkflows] = useState(1);
  const [budgetHours, setBudgetHours] = useState(4);
  const [scanInView, setScanInView] = useState(false);
  const scanRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const storyVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const progressStyle = useMemo(() => ({ "--layers": layers.length } as React.CSSProperties), [layers.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("lang");
    if (requested === "nl" || requested === "en") setLang(requested);
    setDebugScroll(params.get("debug") === "scroll");
  }, []);

  useEffect(() => {
    const audio = voiceAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setVoicePlaying(false);
  }, [lang]);

  useEffect(() => {
    setSelectedScanType(current.cta.intake.typeOptions[0]);
    setSelectedProcess(current.cta.intake.processOptions[0]);
    setCustomProcess("");
    setSelectedGoal(current.cta.intake.goalOptions[0]);
    setScanQuestion(current.cta.intake.defaultQuestion);
    setIntakeStarted(false);
    setIntakeStep(0);
  }, [current.cta.intake.defaultQuestion, current.cta.intake.goalOptions, current.cta.intake.processOptions, current.cta.intake.typeOptions]);

  useEffect(() => {
    const scan = scanRef.current;
    if (!scan) return;
    const observer = new IntersectionObserver(([entry]) => setScanInView(entry.isIntersecting), { rootMargin: "-18% 0px -38% 0px", threshold: 0.05 });
    observer.observe(scan);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileStory) {
      const timeout = window.setTimeout(() => setHeroVideoReady(true), 700);
      return () => window.clearTimeout(timeout);
    }
    const enable = () => setHeroVideoReady(true);
    window.addEventListener("pointerdown", enable, { once: true, passive: true });
    window.addEventListener("scroll", enable, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("scroll", enable);
    };
  }, [isMobileStory]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const applyVideoSources = () => {
      const mobile = media.matches;
      setIsMobileStory(mobile);
      const radius = 1;
      document.querySelectorAll<HTMLVideoElement>("video[data-mobile-src][data-desktop-src]").forEach((video) => {
        const storyIndex = video.dataset.storyIndex ? Number(video.dataset.storyIndex) : null;
        const isStoryVideo = Number.isFinite(storyIndex);
        const isHeroVideo = video.dataset.videoRole === "hero";
        const shouldWaitForStory = isStoryVideo && !storyWarm;
        const shouldWaitForHero = isHeroVideo && !heroVideoReady;
        const farFromActive = isStoryVideo && Math.abs((storyIndex as number) - activeLayer) > radius;
        if (shouldWaitForStory || shouldWaitForHero || farFromActive) {
          video.pause();
          if (video.getAttribute("src")) {
            video.removeAttribute("src");
            video.load();
          }
          return;
        }
        const next = mobile ? video.dataset.mobileSrc : video.dataset.desktopSrc;
        if (!next) return;
        if (video.getAttribute("src") !== next) {
          video.setAttribute("src", next);
          video.load();
        }
      });
    };
    applyVideoSources();
    media.addEventListener("change", applyVideoSources);
    window.addEventListener("resize", applyVideoSources, { passive: true });
    return () => {
      media.removeEventListener("change", applyVideoSources);
      window.removeEventListener("resize", applyVideoSources);
    };
  }, [theme, activeLayer, storyWarm, heroVideoReady]);

  useEffect(() => {
    const immediateCount = isMobileStory ? 1 : 2;
    storyVideoRefs.current.slice(0, immediateCount).forEach((video) => video?.load());
    if (!storyWarm) return;
    const warmWindow = () => {
      const radius = 1;
      storyVideoRefs.current.forEach((video, index) => {
        if (Math.abs(index - activeLayer) <= radius) video?.load();
      });
      setStoryPreloaded(true);
    };
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warmWindow, { timeout: 900 });
    } else {
      timeoutId = globalThis.setTimeout(warmWindow, 240) as unknown as number;
    }
    return () => {
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
      if (idleId !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    };
  }, [theme, isMobileStory, storyWarm, activeLayer]);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStoryReady(true);
          setStoryWarm(true);
        }
      },
      { root: null, rootMargin: "120px 0px", threshold: 0.05 }
    );
    observer.observe(story);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.min(1, Math.max(0, -rect.top / scrollable));
      const weighted = getWeightedStorySegment(raw, window.matchMedia("(max-width: 760px)").matches);
      const next = weighted.index;
      const local = next === layers.length - 1 && raw > 0.995 ? 1 : weighted.local;
      const phase = local < 0.18 ? "intro" : local > 0.78 ? "outro" : "hold";
      setActiveLayer((current) => current === next ? current : next);
      setStoryProgress((current) => Math.abs(current - raw) < 0.0015 ? current : raw);
      setStoryLocalProgress((current) => Math.abs(current - local) < 0.002 ? current : local);
      setStoryPhase((current) => current === phase ? current : phase);
      story.style.setProperty("--story-progress", String(raw));
      story.style.setProperty("--story-local-progress", String(local));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [layers.length]);

  const weightedSegment = getWeightedStorySegment(storyProgress, isMobileStory);
  const segmentIndex = weightedSegment.index;
  const segmentLocal = segmentIndex === layers.length - 1 && storyProgress > 0.995
    ? 1
    : weightedSegment.local;
  const visualSegmentLocal = mapMagneticHoldProgress(segmentLocal, isMobileStory, segmentIndex);
  // Keep the previous layer visually active slightly longer than the data segment boundary.
  // This prevents the 1–5 frame "blank layer" flash Richard spotted during fast scrubs.
  const visualLayerIndex = segmentLocal < 0.14 && segmentIndex > 0 ? segmentIndex - 1 : segmentIndex;

  useEffect(() => {
    if (!storyReady) return;
    storyVideoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === segmentIndex) {
        video.pause();
      } else {
        video.pause();
        if (Math.abs(index - activeLayer) > 1) {
          if (video.readyState > 0) video.currentTime = 0;
          if (video.getAttribute("src")) {
            video.removeAttribute("src");
            video.load();
          }
        }
      }
    });
  }, [activeLayer, segmentIndex, storyReady, theme]);


  const smoothstep = (edge0: number, edge1: number, value: number) => {
    const x = Math.min(1, Math.max(0, (value - edge0) / Math.max(0.0001, edge1 - edge0)));
    return x * x * (3 - 2 * x);
  };


  useEffect(() => {
    if (!storyReady) return;
    const seek = (video: HTMLVideoElement | null | undefined, layerIndex: number, local: number) => {
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const target = video.duration * mapScrubTime(layerIndex, local);
      if (Math.abs(video.currentTime - target) > 0.045) video.currentTime = target;
      video.pause();
    };
    seek(storyVideoRefs.current[segmentIndex], segmentIndex, visualSegmentLocal);
    if (segmentLocal > 0.92) seek(storyVideoRefs.current[segmentIndex + 1], segmentIndex + 1, mapMagneticHoldProgress((segmentLocal - 0.92) / 0.08, isMobileStory, segmentIndex + 1));
    if (segmentLocal < 0.08) seek(storyVideoRefs.current[segmentIndex - 1], segmentIndex - 1, 1);
  }, [segmentIndex, segmentLocal, visualSegmentLocal, isMobileStory, storyReady, theme]);

  const getPanelStyle = (index: number) => {
    const motion = layerMotion[segmentIndex] ?? layerMotion[0];
    const phaseLocal = visualSegmentLocal;
    let visibility = 0;
    let localProgress = 0;
    let layerRank = 0;

    if (index === segmentIndex) {
      // Slower intro + non-zero exit floor: the incoming layer must already be opaque
      // before copy/z-index ownership changes, and the outgoing media must never expose
      // the page background.
      const easedIntro = smoothstep(0, 0.20, segmentLocal);
      const controlledExit = 1 - smoothstep(0.84, 1, segmentLocal) * 0.18;
      visibility = Math.min(easedIntro, controlledExit);
      if (segmentIndex === 0) visibility = Math.max(visibility, controlledExit);
      if (segmentIndex === layers.length - 1) visibility = Math.max(easedIntro, 1);
      localProgress = phaseLocal;
      layerRank = 3;
    } else if (index === segmentIndex - 1 && segmentLocal < 0.22) {
      // Hold the previous layer underneath the new one during the handoff.
      visibility = 1 - smoothstep(0.08, 0.22, segmentLocal) * 0.94;
      localProgress = 1;
      layerRank = 2;
    } else if (index === segmentIndex + 1 && segmentLocal > 0.82) {
      // Pre-warm the next visual quietly; it should never read as active text.
      visibility = smoothstep(0.82, 1, segmentLocal) * 0.42;
      localProgress = Math.max(0, (segmentLocal - 0.82) / 0.18);
      layerRank = 1;
    }

    const y = index < segmentIndex ? -motion.lift : motion.lift;
    return {
      "--panel-visibility": visibility,
      "--panel-progress": localProgress,
      "--panel-y": `${(1 - visibility) * y}px`,
      "--panel-scale": 1 - motion.scale + visibility * motion.scale,
      "--video-progress": localProgress,
      "--video-contrast": motion.contrast,
      "--panel-z": layerRank,
    } as React.CSSProperties;
  };

  const heroVideoSrc = isMobileStory
    ? "/aiow/homepage-story/aiow-hero-gpt2-kling-mobile-12s-lite.mp4"
    : "/aiow/homepage-story/aiow-hero-gpt2-kling-desktop-12s-lite.mp4";
  const heroPosterSrc = isMobileStory
    ? "/aiow/homepage-story/aiow-hero-keyframe-mobile-760.webp"
    : "/aiow/homepage-story/aiow-hero-keyframe-desktop-1280.webp";

  const resolvedProcess = (selectedProcess === "Anders" || selectedProcess === "Other")
    ? (customProcess || selectedProcess)
    : (selectedProcess || current.cta.intake.processOptions[0]);
  const whatsappMessage = lang === "nl"
    ? [
        "👋 Hoi AIOW, ik wil graag een AI-scan plannen.",
        "",
        "📌 Mijn situatie:",
        `• Type vraag: ${selectedScanType || current.cta.intake.typeOptions[0]}`,
        `• Eerste proces: ${resolvedProcess}`,
        `• Belangrijkste doel: ${selectedGoal || current.cta.intake.goalOptions[0]}`,
        "",
        "💬 Context / vraag:",
        scanQuestion || current.cta.intake.defaultQuestion,
        "",
        "✅ Kunnen jullie meekijken wat voor ons de veiligste en meest waardevolle eerste AI-stap is?",
      ].join("\n")
    : [
        "👋 Hi AIOW, I’d like to book an AI scan.",
        "",
        "📌 My situation:",
        `• Request type: ${selectedScanType || current.cta.intake.typeOptions[0]}`,
        `• First process: ${resolvedProcess}`,
        `• Main goal: ${selectedGoal || current.cta.intake.goalOptions[0]}`,
        "",
        "💬 Context / question:",
        scanQuestion || current.cta.intake.defaultQuestion,
        "",
        "✅ Can you help us identify the safest and most valuable first AI step?",
      ].join("\n");
  const handleVoiceToggle = () => {
    const audio = voiceAudioRef.current;
    if (!audio) return;
    if (voicePlaying) {
      audio.pause();
      return;
    }
    track("Voice explainer play", { lang, page: "native-homepage", location: "header" });
    void audio.play();
  };

  const whatsappHref = `https://wa.me/31621898039?text=${encodeURIComponent(whatsappMessage)}`;
  const budgetSetupEstimate = 2500 + Math.max(0, budgetWorkflows - 1) * 850 + budgetHours * 175;
  const budgetFormatter = useMemo(() => new Intl.NumberFormat(lang === "nl" ? "nl-NL" : "en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), [lang]);

  const intakeTotalQuestions = 4;
  const intakeProgress = Math.min(intakeStep + 1, intakeTotalQuestions);
  const intakeEstimate = selectedScanType === "Local AI" || selectedScanType === "Private AI"
    ? (lang === "nl" ? "Waarschijnlijk: private/local AI-route met governance vanaf de scan." : "Likely: private/local AI route with governance after the scan.")
    : selectedScanType === "Automation"
      ? (lang === "nl" ? "Waarschijnlijk: snelle workflowpilot met duidelijke approvalregels." : "Likely: fast workflow pilot with clear approval rules.")
      : (lang === "nl" ? "Waarschijnlijk: eerst proceskaart + veilige pilotkeuze." : "Likely: process map first + safe pilot choice.");
  const intakeRouteTitle = lang === "nl"
    ? `${resolvedProcess} AI-route`
    : `${resolvedProcess} AI route`;
  const intakeWinItems = lang === "nl"
    ? [
        selectedGoal === "Minder risico" ? "minder risico door datagrens + approvals" : "tijdwinst op terugkerende ruis",
        selectedGoal === "Betere output" ? "betere output met vaste werkwijze" : "betere output door templates en controle",
        selectedScanType === "Local AI" ? "private/local AI waar data gevoelig is" : "duidelijke route: cloud, hybride of private",
      ]
    : [
        selectedGoal === "Less risk" ? "less risk through data boundary + approvals" : "time saved on repeated noise",
        selectedGoal === "Better output" ? "better output with fixed workflow" : "better output through templates and control",
        selectedScanType === "Local AI" ? "private/local AI where data is sensitive" : "clear route: cloud, hybrid or private",
      ];
  const scanDeliverables = lang === "nl"
    ? ["proceskaart", "datagrens + risico’s", "quick wins", "eerste pilotvoorstel", "budgetroute"]
    : ["process map", "data boundary + risks", "quick wins", "first pilot proposal", "budget route"];
  const intakeRoiHint = lang === "nl"
    ? "Als dit 5–10 uur per week ruis weghaalt, is de scan meestal snel terugverdiend."
    : "If this removes 5–10 hours of weekly noise, the scan usually pays back quickly.";
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: current.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  useEffect(() => {
    const sent = new Set<number>();
    const marks = [25, 50, 75, 95];
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const depth = Math.round((window.scrollY / max) * 100);
      marks.forEach((mark) => {
        if (depth >= mark && !sent.has(mark)) {
          sent.add(mark);
          track("Scroll depth", { depth: mark, page: "native-homepage" });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className={styles.page} data-theme={theme} lang={lang}>
      <AiowCursorOrb />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="AIOW home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandText}><strong>AIOW</strong><small>{current.brand}</small></span>
        </Link>
        <nav aria-label="Preview navigation">
          <a href="#story">{current.nav.story}</a>
          <a href="#operating-model">{current.nav.model}</a>
          <a href="#scan">{current.nav.scan}</a>
        </nav>
        <div className={styles.voiceBrief} aria-label={current.voice.aria} data-playing={voicePlaying}>
          <button type="button" className={styles.voiceButton} onClick={handleVoiceToggle} aria-pressed={voicePlaying}>
            <span className={styles.voiceGlow} aria-hidden="true">{voicePlaying ? "Ⅱ" : "▶"}</span>
            <span className={styles.voiceText}>
              <strong>{current.voice.title}</strong>
              <small>{current.voice.hint}</small>
            </span>
            <span className={styles.voiceWave} aria-hidden="true"><i /><i /><i /><i /></span>
          </button>
          <audio
            ref={voiceAudioRef}
            preload="none"
            src={current.voice.src}
            onPlay={() => setVoicePlaying(true)}
            onPause={() => setVoicePlaying(false)}
            onEnded={() => setVoicePlaying(false)}
          >
            {current.voice.fallback}
          </audio>
        </div>
        <div className={styles.headerToggles}>
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} setTheme={setTheme} label={current.themeLabel} />
        </div>
      </header>

      <div className={styles.scrollProgress} style={progressStyle} aria-hidden="true" />
      <a href="#scan" className={styles.stickyScanCta} data-hidden={scanInView ? "true" : "false"} aria-hidden={scanInView ? "true" : undefined} tabIndex={scanInView ? -1 : undefined}>{lang === "nl" ? "Plan AI-scan" : "Book AI scan"}</a>

      <section className={styles.intro} aria-labelledby="intro-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{current.hero.eyebrow}</p>
          <h1 id="intro-title">{current.hero.headline}</h1>
          <p>{current.hero.text}</p>
          <div className={styles.actions}>
            <a href="#scan" className={styles.primary} onClick={() => track("CTA click", { location: "hero", page: "native-homepage" })}>{current.hero.primary}</a>
            <a href="#operating-model" className={styles.secondary}>{current.hero.secondary}</a>
          </div>
          <div className={styles.trustBar} aria-label={current.hero.trustLabel}>
            {current.hero.trust.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className={styles.valueProof} aria-label="AIOW proposition">
            {current.hero.valueProof.map(([label, value]) => (
              <span key={`${label}-${value}`}><small>{label}</small><strong>{value}</strong></span>
            ))}
          </div>
        </div>
        <figure className={styles.heroVideo}>
          <video
            key={heroVideoSrc}
            data-video-role="hero"
            data-mobile-src="/aiow/homepage-story/aiow-hero-gpt2-kling-mobile-12s-lite.mp4"
            data-desktop-src="/aiow/homepage-story/aiow-hero-gpt2-kling-desktop-12s-lite.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroPosterSrc}
          />
          <figcaption>{current.hero.caption}</figcaption>
        </figure>
      </section>

      <section className={styles.aiWorkerDemo} aria-labelledby="ai-worker-demo-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{current.aiDemo.eyebrow}</p>
          <h2 id="ai-worker-demo-title">{current.aiDemo.headline}</h2>
          <p>{current.aiDemo.text}</p>
        </div>
        <div className={styles.demoShell}>
          <div className={styles.demoTabs} role="tablist" aria-label={lang === "nl" ? "AI medewerker demo opties" : "AI worker demo options"}>
            {current.aiDemo.tabs.map((tab, index) => (
              <button key={tab.label} type="button" role="tab" aria-selected={activeDemo === index} data-active={activeDemo === index ? "true" : "false"} onClick={() => setActiveDemo(index)}>{tab.label}</button>
            ))}
          </div>
          <div className={styles.demoBoard}>
            <div className={styles.demoRail} aria-hidden="true">
              {current.aiDemo.rail.map((item, index) => <span key={item} style={{ "--i": index } as React.CSSProperties}>{item}</span>)}
            </div>
            <article className={styles.demoPanel}>
              <span>{lang === "nl" ? "Binnenkomst" : "Incoming"}</span>
              <strong>{current.aiDemo.tabs[activeDemo].input}</strong>
            </article>
            <article className={styles.demoPanel} data-ai="true">
              <span>{lang === "nl" ? "AI-medewerker" : "AI worker"}</span>
              <strong>{current.aiDemo.tabs[activeDemo].ai}</strong>
            </article>
            <article className={styles.demoPanel}>
              <span>{lang === "nl" ? "Approval gate" : "Approval gate"}</span>
              <strong>{current.aiDemo.tabs[activeDemo].approval}</strong>
            </article>
            <article className={styles.demoPanel} data-status="true">
              <span>{lang === "nl" ? "Klantportal" : "Customer portal"}</span>
              <strong>{current.aiDemo.tabs[activeDemo].status}</strong>
            </article>
          </div>
          <div className={styles.demoFooter}>
            <p>{lang === "nl" ? "Top-1%-UX: bezoekers zien in één scherm wat AIOW installeert, wat veilig blijft en waarom de klantportal vertrouwen geeft." : "Top-1% UX: visitors see in one screen what AIOW installs, what stays controlled and why the portal builds trust."}</p>
            <Link href="/portal" className={styles.secondary}>{current.aiDemo.cta}</Link>
          </div>
        </div>
      </section>

      <noscript>
        <section className={styles.noScriptFallback} aria-label="AIOW fallback">
          <p>{lang === "nl" ? "Video en scroll-interactie staan uit, maar de kern blijft hetzelfde." : "Video and scroll interaction are disabled, but the core offer is the same."}</p>
          <strong>{lang === "nl" ? "AIOW bouwt één veilige AI-werklaag voor processen, data, agents en approvals." : "AIOW builds one secure AI worklayer for processes, data, agents and approvals."}</strong>
          <a href="#scan">{lang === "nl" ? "Plan een AI-scan" : "Book an AI scan"}</a>
        </section>
      </noscript>

      <section
        id="story"
        ref={storyRef}
        className={styles.story}
        data-phase={storyPhase}
        data-motion={layerMotion[visualLayerIndex]?.mode ?? "story"}
        aria-label={current.storyLabel}
        style={{ "--active-layer": activeLayer, "--story-progress": storyProgress, "--story-local-progress": visualSegmentLocal } as React.CSSProperties}
      >
        <div className={styles.storyPin}>
          <div className={styles.storyIndex} aria-hidden="true">
            {layers.map((layer, index) => (
              <span key={layer.id} data-active={index === visualLayerIndex ? "true" : "false"}>{layer.n}</span>
            ))}
          </div>
          {debugScroll ? (
            <div className={styles.storyDebug} aria-hidden="true">
              <span>raw {storyProgress.toFixed(3)}</span>
              <span>layer {visualLayerIndex + 1}/7</span>
              <span>local {segmentLocal.toFixed(3)}</span>
              <span>hold {visualSegmentLocal.toFixed(3)}</span>
              <span>{storyPhase}</span>
              <span>{isMobileStory ? "mobile" : "desktop"}</span>
              <span>{Math.round(mapScrubTime(segmentIndex, visualSegmentLocal) * 100)}%</span>
              <span>{storyPreloaded ? "preloaded" : "warming"}</span>
            </div>
          ) : null}
          {layers.map((layer, index) => (
            <article
              key={layer.id}
              className={styles.storyPanel}
              data-layer={layer.id}
              data-active={index === visualLayerIndex ? "true" : "false"}
              aria-hidden={index === visualLayerIndex ? undefined : true}
              style={{ ...({ "--index": index } as React.CSSProperties), ...getPanelStyle(index) }}
            >
              <div className={styles.layerInner}>
                <div className={styles.copyBlock}>
                  <span className={styles.layerCount}>{layer.n} / 07</span>
                  <p className={styles.eyebrow}>{layer.eyebrow}</p>
                  <h2>{layer.headline}</h2>
                  <p>{layer.text}</p>
                  <div className={styles.chips}>{layer.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>
                </div>
                <figure className={styles.artFrame}>
                  <video
                    key={`${theme}-${index}`}
                    className={styles.storyVideo}
                    ref={(node) => { storyVideoRefs.current[index] = node; }}
                    autoPlay={false}
                    muted
                    loop
                    playsInline
                    preload={Math.abs(index - segmentIndex) <= 1 ? "metadata" : "none"}
                    poster={storyWarm && Math.abs(index - segmentIndex) <= 1 ? (isMobileStory ? layerMedia[index].mobile : layerMedia[index].desktop) : undefined}
                    aria-label={`${layer.eyebrow}: ${layer.headline}`}
                    data-story-index={index}
                    data-mobile-src={theme === "dark" ? layerMedia[index].video.mobileDark : layerMedia[index].video.mobileLight}
                    data-desktop-src={theme === "dark" ? layerMedia[index].video.desktopDark : layerMedia[index].video.desktopLight}
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
                      if (index === segmentIndex) {
                        video.currentTime = video.duration * mapScrubTime(index, visualSegmentLocal);
                      } else if (index < segmentIndex) {
                        video.currentTime = video.duration * mapScrubTime(index, 1);
                      } else {
                        video.currentTime = video.duration * mapScrubTime(index, 0);
                      }
                      video.pause();
                    }}
                  />
                  {[0, 3, 6].includes(index) ? <div className={styles.routeOverlay} aria-hidden="true"><i /><i /><i /><strong>AIOW</strong></div> : null}
                  <figcaption>{layer.videoBrief}</figcaption>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="operating-model" className={styles.operatingModel} aria-labelledby="operating-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{current.operating.eyebrow}</p>
          <h2 id="operating-title">{current.operating.headline}</h2>
          <p>{current.operating.text}</p>
        </div>
        <div className={styles.stepGrid}>
          {current.operating.steps.map(([n, title, text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className={styles.searchAuthority} aria-labelledby="search-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{current.search.eyebrow}</p>
          <h2 id="search-title" className={styles.searchTitle}>{current.search.headline}</h2>
          <p className={styles.searchIntro}>{current.search.text}</p>
        </div>
        <div className={styles.searchGrid}>
          {current.search.points.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
        {lang === "nl" ? (
          <nav className={styles.authorityLinks} aria-label="Nederlandse AI-diensten">
            {nlAuthorityLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        ) : null}
      </section>

      <section className={`${styles.routerSection} ${styles.webgpuShowcase}`} aria-labelledby="router-title">
        <div className={styles.routerCopy}>
          <p className={styles.eyebrow}>{current.router.eyebrow}</p>
          <h2 id="router-title">{current.router.headline}</h2>
          <p>{current.router.text}</p>
          <div className={styles.coreSignals} aria-hidden="true">
            <span>{lang === "nl" ? "Datagrens" : "Data boundary"}</span>
            <span>{lang === "nl" ? "Approval" : "Approval"}</span>
            <span>{lang === "nl" ? "Lokale route" : "Local route"}</span>
          </div>
        </div>
        <AiowWebGPUCore lang={lang} />
      </section>

      <section className={styles.pricingSection} aria-labelledby="pricing-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{current.pricing.eyebrow}</p>
          <h2 id="pricing-title">{current.pricing.headline}</h2>
          <p>{current.pricing.text}</p>
        </div>
        <div className={styles.pricingFormula} aria-label={lang === "nl" ? "Hoe de prijs is opgebouwd" : "How pricing is built"}>
          {current.pricing.formula.map((item, index) => (
            <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>
          ))}
        </div>
        <div className={styles.pricingIntroCard}>
          <span>{current.pricing.scan.label}</span>
          <strong>{current.pricing.scan.title}</strong>
          <b>{current.pricing.scan.suffix} {current.pricing.scan.price}</b>
          <p>{current.pricing.scan.text}</p>
        </div>
        <div className={styles.budgetCompass} aria-label={lang === "nl" ? "Starter budget indicatie" : "Starter budget estimate"}>
          <div className={styles.budgetCopy}>
            <span>{lang === "nl" ? "Starter budgetkompas" : "Starter budget compass"}</span>
            <strong>{lang === "nl" ? "Maak de instapprijs voelbaar zonder valse belofte." : "Make the entry price tangible without overpromising."}</strong>
            <p>{lang === "nl" ? "Dit is een interne/indicatieve rekentool: setup vanaf €2.500, onderhoud vanaf €650/mnd, extra begeleiding en uitbreidingen vanaf €175/u." : "This is an indicative calculator: setup from €2,500, maintenance from €650/mo, extra guidance and expansions from €175/h."}</p>
          </div>
          <div className={styles.budgetControls}>
            <label>
              <span>{lang === "nl" ? "Eerste workflows" : "First workflows"} <b>{budgetWorkflows}</b></span>
              <input type="range" min="1" max="4" value={budgetWorkflows} onChange={(event) => setBudgetWorkflows(Number(event.target.value))} />
            </label>
            <label>
              <span>{lang === "nl" ? "Extra uren buiten onderhoud" : "Extra hours outside maintenance"} <b>{budgetHours}</b></span>
              <input type="range" min="0" max="20" step="1" value={budgetHours} onChange={(event) => setBudgetHours(Number(event.target.value))} />
            </label>
          </div>
          <div className={styles.budgetResult}>
            <span>{lang === "nl" ? "Indicatie" : "Estimate"}</span>
            <strong>{budgetFormatter.format(budgetSetupEstimate)}</strong>
            <p>{lang === "nl" ? "+ vanaf €650/mnd technisch onderhoud. Definitieve prijs volgt pas na datagrens, scope en approval." : "+ from €650/mo technical maintenance. Final price only after data boundary, scope and approval."}</p>
          </div>
        </div>
        <div className={styles.pricingGrid}>
          {current.pricing.plans.map((plan) => (
            <article key={plan.name} className={styles.pricingCard} data-featured={plan.name.includes("Local Studio") ? "true" : "false"}>
              <span className={styles.planBadge}>{plan.badge}</span>
              <h3>{plan.name}</h3>
              <p>{plan.fit}</p>
              <strong>{plan.price}</strong>
              <small>{plan.monthly}</small>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <div className={styles.pricingFooter}>
          <p>{current.pricing.note}</p>
          <a href="#scan" className={styles.secondary}>{current.pricing.cta}</a>
        </div>
      </section>

      <section className={styles.afterScanSection} aria-labelledby="after-scan-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{current.afterScan.eyebrow}</p>
          <h2 id="after-scan-title">{current.afterScan.headline}</h2>
          <p>{current.afterScan.text}</p>
        </div>
        <div className={styles.afterScanGrid}>
          {current.afterScan.steps.map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className={styles.afterScanActions}>
          <p className={styles.afterScanNote}>{current.afterScan.note}</p>
          <Link href="/portal" className={styles.secondary}>{lang === "nl" ? "Bekijk klantportal" : "View customer portal"}</Link>
        </div>
      </section>

      <section id="scan" ref={scanRef} className={styles.cta} aria-labelledby="cta-title" data-wizard={intakeStarted ? "open" : "closed"}>
        <div className={styles.ctaIntroBlock}>
          <p className={styles.eyebrow}>{current.cta.eyebrow}</p>
          <h2 id="cta-title">{current.cta.headline}</h2>
          <p>{intakeStarted ? (lang === "nl" ? "Beantwoord rustig één vraag per keer. Aan het einde staat je WhatsApp-bericht klaar." : "Answer one calm question at a time. At the end your WhatsApp message is ready.") : current.cta.text}</p>
          <div className={styles.ctaProof} aria-label={lang === "nl" ? "Wat je krijgt" : "What you get"}>
            {current.cta.proof.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>

        <div className={styles.scanWizard}>
          {!intakeStarted ? (
            <div className={styles.wizardStart}>
              <span>{lang === "nl" ? "Interactieve intake" : "Interactive intake"}</span>
              <strong>{lang === "nl" ? "In 4 korte vragen naar je eerste AI-route." : "Find your first AI route in 4 short questions."}</strong>
              <p>{lang === "nl" ? "Geen lang formulier. Kies wat past, krijg een compacte samenvatting en stuur die direct door." : "No long form. Choose what fits, get a compact summary and send it directly."}</p>
              <button type="button" className={styles.primary} onClick={() => { setIntakeStarted(true); setIntakeStep(0); track("Intake start", { location: "scan", page: "native-homepage" }); }}>
                {lang === "nl" ? "Start intake" : "Start intake"}
              </button>
            </div>
          ) : (
            <div className={styles.wizardPanel}>
              <div className={styles.wizardTopline}>
                <span>{intakeStep < intakeTotalQuestions ? (lang === "nl" ? `Vraag ${intakeProgress}/${intakeTotalQuestions}` : `Question ${intakeProgress}/${intakeTotalQuestions}`) : (lang === "nl" ? "Advies klaar" : "Advice ready")}</span>
                <div className={styles.wizardProgress} aria-hidden="true"><i style={{ width: `${Math.min((intakeStep / intakeTotalQuestions) * 100, 100)}%` }} /></div>
              </div>

              {intakeStep === 0 ? (
                <div className={styles.wizardStep}>
                  <strong>{current.cta.intake.typeLabel}</strong>
                  <div className={styles.intakeOptions}>
                    {current.cta.intake.typeOptions.map((item) => (
                      <button key={item} type="button" data-active={selectedScanType === item ? "true" : "false"} onClick={() => setSelectedScanType(item)}>{item}</button>
                    ))}
                  </div>
                </div>
              ) : null}

              {intakeStep === 1 ? (
                <div className={styles.wizardStep}>
                  <strong>{current.cta.intake.processLabel}</strong>
                  <div className={styles.intakeOptions}>
                    {current.cta.intake.processOptions.map((item) => (
                      <button key={item} type="button" data-active={selectedProcess === item ? "true" : "false"} onClick={() => setSelectedProcess(item)}>{item}</button>
                    ))}
                  </div>
                  {(selectedProcess === "Anders" || selectedProcess === "Other") ? (
                    <input className={styles.otherProcessInput} value={customProcess} onChange={(event) => setCustomProcess(event.target.value)} placeholder={current.cta.intake.otherProcessPlaceholder} />
                  ) : null}
                </div>
              ) : null}

              {intakeStep === 2 ? (
                <div className={styles.wizardStep}>
                  <strong>{current.cta.intake.goalLabel}</strong>
                  <div className={styles.intakeOptions}>
                    {current.cta.intake.goalOptions.map((item) => (
                      <button key={item} type="button" data-active={selectedGoal === item ? "true" : "false"} onClick={() => setSelectedGoal(item)}>{item}</button>
                    ))}
                  </div>
                </div>
              ) : null}

              {intakeStep === 3 ? (
                <label className={styles.wizardStep}>
                  <strong>{current.cta.intake.questionLabel}</strong>
                  <textarea value={scanQuestion} onChange={(event) => setScanQuestion(event.target.value)} placeholder={current.cta.intake.questionPlaceholder} rows={3} />
                </label>
              ) : null}

              {intakeStep >= 4 ? (
                <div className={styles.wizardResult}>
                  <div className={styles.resultHeroLine}>
                    <span>{lang === "nl" ? "Mini-scan resultaat" : "Mini scan result"}</span>
                    <strong>{lang === "nl" ? "Jullie eerste AI-route:" : "Your first AI route:"} {intakeRouteTitle}</strong>
                    <p>{intakeEstimate}</p>
                  </div>
                  <div className={styles.resultSplit}>
                    <div className={styles.resultOutcomeCard}>
                      <b>{lang === "nl" ? "Verwachte winst" : "Expected win"}</b>
                      <ul>
                        {intakeWinItems.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className={styles.scanOfferCard}>
                      <span>{lang === "nl" ? "Betaalde start" : "Paid start"}</span>
                      <b>{lang === "nl" ? "Wat krijg je voor €950?" : "What do you get for €950?"}</b>
                      <ul>
                        {scanDeliverables.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <p className={styles.resultNextStep}>{lang === "nl" ? "Beste volgende stap: plan de AI-systeemscan. Dan bepalen we datagrens, quick wins, tooling, risico’s en budgetroute voordat er gebouwd wordt." : "Best next step: book the AI system scan. We define data boundary, quick wins, tooling, risks and budget route before anything is built."}</p>
                  <p className={styles.resultRoi}>{intakeRoiHint}</p>
                </div>
              ) : null}

              <div className={styles.wizardActions}>
                <button type="button" className={styles.secondary} onClick={() => intakeStep === 0 ? setIntakeStarted(false) : setIntakeStep((step) => Math.max(step - 1, 0))}>
                  {lang === "nl" ? "Terug" : "Back"}
                </button>
                {intakeStep < intakeTotalQuestions ? (
                  <button type="button" className={styles.primary} onClick={() => setIntakeStep((step) => Math.min(step + 1, intakeTotalQuestions))}>
                    {intakeStep === intakeTotalQuestions - 1 ? (lang === "nl" ? "Toon advies" : "Show advice") : (lang === "nl" ? "Volgende" : "Next")}
                  </button>
                ) : (
                  <a href={whatsappHref} className={styles.primary} target="_blank" rel="noreferrer" onClick={() => track("WhatsApp click", { location: "scan-wizard", scanType: selectedScanType, process: resolvedProcess, goal: selectedGoal, page: "native-homepage" })}>{current.cta.button}</a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className={styles.siteFooter} aria-label={lang === "nl" ? "AIOW footer" : "AIOW footer"}>
        <div className={styles.footerBrand}>
          <Link href={lang === "nl" ? "/nl" : "/en"} className={styles.brand} aria-label="AIOW home">
            <span className={styles.brandMark} aria-hidden="true" />
            <span className={styles.brandText}><strong>AIOW</strong><small>{current.brand}</small></span>
          </Link>
          <p>{lang === "nl" ? "AIOW BV bouwt veilige AI-werklagen voor processen, data, agents en approvals." : "AIOW BV builds secure AI worklayers for processes, data, agents and approvals."}</p>
          <p className={styles.footerMeta}>AIOW BV · KvK 71887466 · Bijlmermeerstraat 30, 2131HC Hoofddorp</p>
        </div>
        <nav className={styles.footerNav} aria-label={lang === "nl" ? "Juridische links" : "Legal links"}>
          <Link href={`/${lang}/privacy`}>{lang === "nl" ? "Privacybeleid" : "Privacy policy"}</Link>
          <Link href={`/${lang}/cookies`}>{lang === "nl" ? "Cookiebeleid" : "Cookie policy"}</Link>
          <Link href={`/${lang}/terms`}>{lang === "nl" ? "Voorwaarden" : "Terms"}</Link>
          <a href="https://wa.me/31621898039" target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>
      </footer>
    </main>
  );
}
