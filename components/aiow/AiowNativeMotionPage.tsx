"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/core/analytics/client";
import styles from "./AiowNativeMotionPage.module.css";
import { AiowWebGPUCore } from "./AiowWebGPUCore";

type Lang = "nl" | "en";
type SpunkyMessage = { role: "spunky" | "visitor"; text: string };
type SpunkyAccountState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "created"; accountId: string; accessCode: string; portalUrl: string; leadId?: string }
  | { status: "error"; message: string };


const content = {
  nl: {
    nav: { story: "Venture flow", model: "Aanpak", work: "Platform", scan: "Private intake" },
    brand: "AI venture & growth partner",
    themeLabel: "Thema",
    headerAi: {
      label: "Vraag AIOW AI",
      placeholder: "Vraag over AIOW of beschrijf je idee...",
      ask: "Praat",
      apply: "Aanmelden",
      modes: ["Nieuw idee", "Bestaand bedrijf"],
      prompts: {
        idea: "Ik heb een nieuw idee/startup en wil weten of AIOW dit AI-native kan beoordelen, bouwen en laten groeien.",
        company: "Ik heb een bestaand bedrijf en wil weten hoe AIOW processen, software, marketing of klantcontact kan digitaliseren met AI.",
      },
    },
    voice: {
      aria: "Beluister hoe AIOW bedrijven helpt groeien",
      title: "Audio briefing: AIOW venture studio",
      hint: "Voor startups en groeibedrijven",
      src: "/aiow/audio/aiow-gpt-voice-briefing-nl.mp3",
      fallback: "Je browser ondersteunt geen audio. De geschreven uitleg staat op deze pagina.",
    },
    hero: {
      eyebrow: "Voor startups en gevestigde bedrijven",
      headline: "Wij bouwen AI in je bedrijf en groeien mee.",
      text: "AIOW.ai helpt ondernemers, startups en bestaande bedrijven sneller groeien met AI, automatisering, softwareontwikkeling, marketing en digitale strategie, als actieve venture & growth partner.",
      primary: "Start private intake",
      secondary: "Bekijk onze aanpak",
      trust: ["AI due diligence", "Software + growth", "Revenue/share upside"],
      trustLabel: "AIOW kernpunten",
      caption: "Van idee of bestaand bedrijf naar een AI-native groeisysteem met portal, agents, dashboards en meetbare uitvoering.",
      valueProof: [
        ["Wij bouwen", "AI, software en growth"],
        ["Voor", "startups en bestaande bedrijven"],
        ["Deal", "fee, revenue share of equity"],
      ],
    },
    aiDemo: {
      eyebrow: "Live venture flow",
      headline: "Zie hoe AIOW een plan omzet naar groei.",
      text: "Geen bureaupresentatie: een aanvraag wordt private intake, AI due diligence, dealadvies, contract, projectgroep met Spunky en een zichtbaar groeidashboard.",
      tabs: [
        { label: "Startup", input: "Founder meldt een platformidee met branchecontacten en eerste klantvraag.", ai: "AI maakt Founder, Market, Execution, AI Opportunity en Investment scores.", approval: "Richard/Jeroen krijgen Go, Conditional Go of No-Go met dealadvies.", status: "Portal: Deal Card + proof sprint" },
        { label: "Groeibedrijf", input: "Bestaand bedrijf wil omzet, processen en marketing digitaal versnellen.", ai: "AI vindt automatiseringskansen, softwarelaag, growth loops en KPI-impact.", approval: "AIOW bepaalt vaste fee, retainer, revenue share of profit share.", status: "Portal: contract + roadmap" },
        { label: "Na akkoord", input: "Klant tekent de AIOW aanpak en commerciële basis.", ai: "Spunky gaat in de projectgroep en vangt vragen, besluiten en context op.", approval: "Intern AIOW bouwt met dashboardstatus, risico’s en proof log.", status: "Portal: sprint live" },
      ],
      rail: ["Aanvraag", "AI analyse", "Deal Card", "Contract", "Projectdashboard"],
      cta: "Bekijk klantportal",
    },
    storyLabel: "AIOW venture studio pinned scroll story",
    layers: [
      { id: "promise", n: "01", eyebrow: "De belofte", headline: "Breng ons je plan of bedrijf.", text: "Jij brengt idee, marktkennis, klanten, data of distributie. AIOW onderzoekt waar AI, software en growth het bedrijf kunnen versnellen.", chips: ["venture", "growth", "AI-native"], videoBrief: "Premium venture studio: founders, operators en AI-systemen beoordelen een nieuwe kans op één digitaal command board." },
      { id: "chaos", n: "02", eyebrow: "De bottleneck", headline: "Goede ideeën missen digitale slagkracht.", text: "Veel ondernemers hebben marktkennis en netwerk, maar missen AI-capaciteit, softwareteam, automatisering, marketingmachine en KPI-sturing.", chips: ["geen tech-team", "geen growth engine", "te langzaam"], videoBrief: "Founder met tractie maar te veel losse tools; AIOW brengt orde, productstrategie en digitale uitvoering." },
      { id: "boundary", n: "03", eyebrow: "Private intake", headline: "Eerst due diligence.", text: "Gevoelige omzet, marges, klantlijsten, contacten en IP delen we niet publiek. Dat gebeurt in een private portal met duidelijke toegang.", chips: ["private portal", "proof", "vertrouwelijk"], videoBrief: "Secure intake portal met founderprofiel, marktdata, klantbewijs en dealinformatie achter private toegang." },
      { id: "worklayer", n: "04", eyebrow: "AI analyse", headline: "Daarna de Deal Card.", text: "AIOW scoort founder, markt, execution, AI opportunity en investment fit. Daarna adviseren we fee, revenue share, profit share of participatie.", chips: ["5 scores", "dealadvies", "Go/No-Go"], videoBrief: "AI due diligence board met scorecards, risico’s, uniekheid, slagingskans en aanbevolen dealmodel." },
      { id: "hardware", n: "05", eyebrow: "De bouw", headline: "Wij bouwen de AI-groeimotor.", text: "Software, agents, automatisering, marketing, dashboards en customer portals worden één uitvoerbaar systeem dat met het bedrijf meegroeit.", chips: ["software", "agents", "growth loops"], videoBrief: "AIOW bouwt platform, agent workflows, marketing funnels en dashboards vanuit één productstudio." },
      { id: "agents", n: "06", eyebrow: "De uitvoering", headline: "Spunky en agents houden contact vast.", text: "Na akkoord komt Spunky in de klantgroep als contact-AI/contextcollector. Intern gebruikt AIOW die context om sneller te bouwen en verbeteren.", chips: ["Spunky", "klantgroep", "context"], videoBrief: "Telegram projectgroep met klant en Spunky; context stroomt naar het interne AIOW dashboard en buildteam." },
      { id: "outcome", n: "07", eyebrow: "Het resultaat", headline: "Samen groeien op resultaat.", text: "AIOW blijft digitaal ondersteunen met KPI’s, optimalisaties en nieuwe AI-modules en groeit mee via de afgesproken commerciële upside.", chips: ["KPI’s", "proof log", "upside"], videoBrief: "Dashboard met omzet, leads, automatisering, sprintstatus en proof log; AIOW en klant groeien samen door." },
    ],
    search: {
      eyebrow: "AI venture studio voor Nederland",
      headline: "AI inbouwen voor startups en gevestigde bedrijven.",
      text: "Vier manieren waarop AIOW bedrijven helpt groeien: van idee-validatie tot AI-platform, automatisering, marketingmachine en resultaatgedreven samenwerking.",
      points: [
        ["Startups", "Van idee, founder en markt naar private intake, Deal Card, proof sprint en eerste AI-product."],
        ["Bestaande bedrijven", "Van processen, data en klanten naar AI-automatisering, dashboards, CRM/growth en betere marges."],
        ["Revenue share", "Wanneer AIOW omzet helpt creëren of opschalen, werken we met minimaal 10% en hoger bij meer IP/risico."],
        ["Doorverkoop & modules", "Bij white-label, resale of sublicensing deelt AIOW mee in doorverkoop en modulewaarde."],
      ],
    },
    faq: [
      ["Wat doet AIOW?", "AIOW is een AI-gedreven venture & growth partner. We bouwen AI, software, automatisering, marketing en digitale groeisystemen in startups en bestaande bedrijven."],
      ["Voor wie is AIOW?", "Voor founders, ondernemers, startups en gevestigde bedrijven die sneller digitaal willen groeien maar AI/software/growth-executie missen."],
      ["Wat krijg je na de private intake?", "Een AI Deal Card met founder, market, execution, AI opportunity en investment score plus advies voor fee, revenue share, profit share of participatie."],
      ["Blijft AIOW betrokken na bouw?", "Ja. AIOW blijft digitaal ondersteunen via dashboards, agents, marketing, automatisering, optimalisatie en afgesproken commerciële upside."],
    ],
    operating: {
      eyebrow: "Hoe AIOW meebouwt",
      headline: "Van plan naar AI-native groeibedrijf.",
      text: "We beoordelen de kans, bepalen het juiste dealmodel, bouwen de AI/software/growth-laag en meten daarna of het bedrijf daadwerkelijk groeit.",
      steps: [
        ["1", "Private intake", "We verzamelen founder, markt, bewijs, contacten, data, omzet, risico’s en wat AIOW moet bouwen."],
        ["2", "AI due diligence", "AIOW berekent scores, slagingskans, uniekheid, risico’s en het beste commerciële model."],
        ["3", "Build & growth sprint", "We bouwen platform, agents, automatisering, marketing, dashboard en meetbare KPI’s."],
        ["4", "Scale op resultaat", "Na akkoord blijven Spunky, dashboards en het AIOW-team ondersteunen, meten en optimaliseren."],
      ],
    },
    router: {
      eyebrow: "AIOW operating layer",
      headline: "Intake, deal, build en groei in één control room.",
      text: "De control room toont klantstatus, scores, contract, projectgroep, Spunky-context, sprintstatus, risico’s, KPI’s en proof log.",
    },
    pricing: {
      eyebrow: "Samenwerken met duidelijke voorwaarden",
      headline: "Eerst scope en budget. Daarna pas upside.",
      text: "AIOW bouwt niet gratis en neemt geen open risico zonder controle. Elke samenwerking start met betaalde intake, duidelijke scope, budget, beslisrechten en contract. Revenue share, profit share of participatie komt alleen bovenop sterke bewijsvoering of bij een selectieve venture-deal.",
      formula: ["betaalde intake", "Deal Card", "scope + contract", "build met budget"],
      scan: { label: "Eerst betaald beoordelen", title: "Private Venture Intake", price: "op aanvraag", suffix: "vanaf", text: "We beoordelen founder, markt, bewijs, data, budget, risico en upside. Pas daarna bepalen we of AIOW bouwt, afwijst of een hybride deal bespreekt." },
      plans: [
        { name: "Paid Proof Sprint", fit: "idee of bedrijf met bewijs nodig", price: "betaalde sprint", monthly: "geen gratis bouw", badge: "bewijs", features: ["private intake + Deal Card", "kleine afgebakende proof of growth test", "budget vóór uitvoering", "Go/No-Go vóór grotere bouw"] },
        { name: "Growth Partner", fit: "bestaand bedrijf met budget en groeipotentie", price: "retainer + mogelijke upside", monthly: "maandelijks", badge: "partner", features: ["vaste maandbasis", "AI en automatisering in processen", "marketing/growth machine", "upside alleen bij meetbare bijdrage"] },
        { name: "AI Platform Build", fit: "software of platform als kern", price: "scopeprijs + support", monthly: "onderhoud + optimalisatie", badge: "build", features: ["custom software en agents", "klantportal en dashboards", "integraties en automatisering", "resale of omzetdeel alleen met contract"] },
        { name: "Selective Venture Deal", fit: "strategische kans met grote upside", price: "maatwerk + bescherming", monthly: "cash, share of equity", badge: "selectief", features: ["alleen bij sterke markt en bewijs", "AIOW krijgt controle over digitale uitvoering", "IP, data en upside vastgelegd", "geen open bouw zonder harde afspraken"] },
      ],
      note: "Belangrijk: AIOW is geen goedkope bouwpartij. We investeren pas risico, teamtijd of IP wanneer budget, scope, beslisrechten, data-toegang en upside contractueel kloppen. Zonder die basis is het een betaald project of een No-Go.",
      cta: "Start private intake",
    },
    afterScan: {
      eyebrow: "Na akkoord",
      headline: "Van Deal Card naar projectgroep, Spunky en sprint.",
      text: "Na de private intake maken Richard/Jeroen vanuit admin het voorstel. Na tekenen start de klantgroep met Spunky en bouwen we intern met alle context door.",
      steps: [
        ["1", "Private intake", "Je deelt gevoelige data alleen in de private portal: bewijs, cijfers, contacten, systemen en risico’s."],
        ["2", "Deal Card + contract", "AIOW geeft scores, aanpak, dealmodel, scope, verantwoordelijkheden en dashboardfocus."],
        ["3", "Projectgroep + build", "Na signing maken we de Telegram projectgroep met Spunky en start het interne AIOW build/growth systeem."],
      ],
      note: "Iedere klant krijgt een private portal met intake, Deal Card, contract, roadmap, KPI’s, proof log en verbeteradvies. Livegang, betalingen en modules blijven achter expliciete voorwaarden en akkoord.",
    },
    projects: {
      eyebrow: "Made by AIOW",
      headline: "Elk nieuw product krijgt hier zijn bewijsplek.",
      text: "Alles wat we vanaf nu lanceren krijgt één centrale plek op AIOW.ai zodra het in ons productmanifest staat: app, webtool, agent, portal of klantlaag. Geen losse eilandjes. Alles zichtbaar als AIOW-built.",
      meta: "Automatisch gevuld vanuit het AIOW-projectmanifest.",
      open: "Open project",
    },
    cta: {
      eyebrow: "Private intake voor je bedrijf",
      headline: "Laat AIOW je plan\nof bedrijf beoordelen",
      text: "Start laagdrempelig. Gevoelige cijfers en contacten volgen pas in de private portal.",
      proof: ["private portal", "Deal Card", "groei op resultaat"],
      intake: {
        typeLabel: "Waar kom je mee naar AIOW?",
        typeOptions: ["Startup/idee", "Bestaand bedrijf", "AI-platform", "Growth/marketing"],
        processLabel: "Waar moet AIOW het meeste waarde bouwen?",
        processOptions: ["Software/platform", "Automatisering", "Marketing/growth", "CRM/sales", "Klantportal", "Anders"],
        otherProcessPlaceholder: "Bijv. HR, sales, support, operatie…",
        goalLabel: "Welk samenwerkingsmodel past mogelijk?",
        goalOptions: ["Proof sprint", "Fixed project", "Growth partner", "Revenue share"],
        questionLabel: "Vraag of context",
        questionPlaceholder: "Bijv. we hebben een idee, branchecontacten en willen weten of AIOW dit AI-native kan bouwen en laten groeien.",
        defaultQuestion: "Ik wil dat AIOW mijn idee/bedrijf beoordeelt en adviseert welke AI/software/growth route het beste is.",
        whatsappIntro: "Hoi AIOW, ik wil een private intake starten voor mijn idee/bedrijf.",
      },
      button: "Start via WhatsApp",
    },
  },
  en: {
    nav: { story: "Venture flow", model: "Approach", work: "Platform", scan: "Private intake" },
    brand: "AI venture & growth partner",
    themeLabel: "Theme",
    headerAi: {
      label: "Ask AIOW AI",
      placeholder: "Ask about AIOW or describe your idea...",
      ask: "Talk",
      apply: "Apply",
      modes: ["New idea", "Existing company"],
      prompts: {
        idea: "I have a new idea/startup and want to know whether AIOW can assess, build and grow it AI-native.",
        company: "I have an existing company and want to know how AIOW can digitize processes, software, marketing or customer contact with AI.",
      },
    },
    voice: {
      aria: "Listen to how AIOW helps companies grow",
      title: "Audio briefing: AIOW venture studio",
      hint: "For startups and growth companies",
      src: "/aiow/audio/aiow-gpt-voice-briefing-en.mp3",
      fallback: "Your browser does not support audio. The written explanation is on this page.",
    },
    hero: {
      eyebrow: "For startups and established companies",
      headline: "We build AI into your company and grow with you.",
      text: "AIOW.ai helps founders, startups and existing companies grow faster with AI, automation, software development, marketing and digital strategy, as an active venture & growth partner.",
      primary: "Start private intake",
      secondary: "See our approach",
      trust: ["AI due diligence", "Software + growth", "Revenue/share upside"],
      trustLabel: "AIOW core points",
      caption: "From idea or existing business to an AI-native growth system with portal, agents, dashboards and measurable execution.",
      valueProof: [
        ["We build", "AI, software and growth"],
        ["For", "startups and existing companies"],
        ["Deal", "fee, revenue share or equity"],
      ],
    },
    aiDemo: {
      eyebrow: "Live venture flow",
      headline: "See how AIOW turns a plan into growth.",
      text: "Not an agency presentation: a request becomes private intake, AI due diligence, deal advice, contract, Spunky project group and a visible growth dashboard.",
      tabs: [
        { label: "Startup", input: "A founder submits a platform idea with industry contacts and first customer demand.", ai: "AI creates Founder, Market, Execution, AI Opportunity and Investment scores.", approval: "Richard/Jeroen get Go, Conditional Go or No-Go with deal advice.", status: "Portal: Deal Card + proof sprint" },
        { label: "Growth company", input: "An existing company wants to accelerate revenue, processes and marketing digitally.", ai: "AI identifies automation opportunities, software layer, growth loops and KPI impact.", approval: "AIOW decides fixed fee, retainer, revenue share or profit share.", status: "Portal: contract + roadmap" },
        { label: "After signing", input: "The customer signs the AIOW approach and commercial basis.", ai: "Spunky joins the project group and captures questions, decisions and context.", approval: "Internal AIOW builds with dashboard status, risks and proof log.", status: "Portal: sprint live" },
      ],
      rail: ["Request", "AI analysis", "Deal Card", "Contract", "Project dashboard"],
      cta: "View customer portal",
    },
    storyLabel: "AIOW venture studio pinned scroll story",
    layers: [
      { id: "promise", n: "01", eyebrow: "The promise", headline: "Bring us your plan or company.", text: "You bring the idea, market knowledge, customers, data or distribution. AIOW investigates where AI, software and growth can accelerate the business.", chips: ["venture", "growth", "AI-native"], videoBrief: "Premium venture studio: founders, operators and AI systems evaluating a new opportunity on one command board." },
      { id: "chaos", n: "02", eyebrow: "The bottleneck", headline: "Good ideas lack digital execution.", text: "Many entrepreneurs have market knowledge and network, but lack AI capacity, software team, automation, marketing engine and KPI steering.", chips: ["no tech team", "no growth engine", "too slow"], videoBrief: "Founder with traction but scattered tools; AIOW adds product strategy, order and execution." },
      { id: "boundary", n: "03", eyebrow: "Private intake", headline: "Due diligence first.", text: "Revenue, margins, customer lists, contacts and IP are not shared publicly. They belong in a private portal with clear access.", chips: ["private portal", "proof", "confidential"], videoBrief: "Secure intake portal with founder profile, market data, customer proof and deal information behind private access." },
      { id: "worklayer", n: "04", eyebrow: "AI analysis", headline: "Then the Deal Card.", text: "AIOW scores founder, market, execution, AI opportunity and investment fit. Then we advise fee, revenue share, profit share or equity.", chips: ["5 scores", "deal advice", "Go/No-Go"], videoBrief: "AI due diligence board with scorecards, risks, uniqueness, success probability and recommended deal model." },
      { id: "hardware", n: "05", eyebrow: "The build", headline: "We build the AI growth engine.", text: "Software, agents, automation, marketing, dashboards and customer portals become one executable system that grows with the company.", chips: ["software", "agents", "growth loops"], videoBrief: "AIOW builds platform, agent workflows, marketing funnels and dashboards from one product studio." },
      { id: "agents", n: "06", eyebrow: "Execution", headline: "Spunky and agents keep context alive.", text: "After agreement, Spunky joins the customer group as contact-AI/context collector. Internally AIOW uses that context to build and improve faster.", chips: ["Spunky", "project group", "context"], videoBrief: "Telegram project group with customer and Spunky; context flows to internal AIOW dashboard and build team." },
      { id: "outcome", n: "07", eyebrow: "Outcome", headline: "Grow together on results.", text: "AIOW keeps supporting with KPIs, optimizations and new AI modules and grows through the agreed commercial upside.", chips: ["KPIs", "proof log", "upside"], videoBrief: "Dashboard with revenue, leads, automation, sprint status and proof log; AIOW and customer grow together." },
    ],
    search: {
      eyebrow: "AI venture studio for the Netherlands",
      headline: "Building AI into startups and established companies.",
      text: "Four ways AIOW helps companies grow: from idea validation to AI platform, automation, marketing machine and result-driven partnership.",
      points: [
        ["Startups", "From idea, founder and market to private intake, Deal Card, proof sprint and first AI product."],
        ["Existing companies", "From processes, data and customers to AI automation, dashboards, CRM/growth and better margins."],
        ["Revenue share", "When AIOW helps create or scale revenue, we work from a minimum 10% and higher with more IP/risk."],
        ["Resale & modules", "With white-label, resale or sublicensing, AIOW shares in resale and module value."],
      ],
    },
    faq: [
      ["What does AIOW do?", "AIOW is an AI-driven venture & growth partner. We build AI, software, automation, marketing and digital growth systems into startups and existing companies."],
      ["Who is AIOW for?", "Founders, entrepreneurs, startups and established companies that want to grow digitally faster but lack AI/software/growth execution."],
      ["What do you get after private intake?", "An AI Deal Card with founder, market, execution, AI opportunity and investment score plus advice for fee, revenue share, profit share or equity."],
      ["Does AIOW stay involved after the build?", "Yes. AIOW keeps supporting through dashboards, agents, marketing, automation, optimization and agreed commercial upside."],
    ],
    operating: {
      eyebrow: "How AIOW co-builds",
      headline: "From plan to AI-native growth company.",
      text: "We assess the opportunity, choose the right deal model, build the AI/software/growth layer and then measure whether the company actually grows.",
      steps: [
        ["1", "Private intake", "We collect founder, market, proof, contacts, data, revenue, risks and what AIOW should build."],
        ["2", "AI due diligence", "AIOW calculates scores, success probability, uniqueness, risks and best commercial model."],
        ["3", "Build & growth sprint", "We build platform, agents, automation, marketing, dashboard and measurable KPIs."],
        ["4", "Scale on results", "After agreement, Spunky, dashboards and the AIOW team keep supporting, measuring and optimizing."],
      ],
    },
    router: {
      eyebrow: "AIOW operating layer",
      headline: "Intake, deal, build and growth in one control room.",
      text: "The control room shows customer status, scores, contract, project group, Spunky context, sprint status, risks, KPIs and proof log.",
    },
    pricing: {
      eyebrow: "Work with clear terms",
      headline: "Scope and budget first. Upside comes after.",
      text: "AIOW does not build for free and does not take open risk without control. Every collaboration starts with paid assessment, clear scope, budget, decision rights and contract. Revenue share, profit share or equity only comes on top of strong proof or in a selective venture deal.",
      formula: ["paid intake", "Deal Card", "scope + contract", "funded build"],
      scan: { label: "Paid assessment first", title: "Private Venture Intake", price: "on request", suffix: "from", text: "We assess founder, market, proof, data, budget, risk and upside. Only then do we decide whether AIOW builds, rejects or discusses a hybrid deal." },
      plans: [
        { name: "Paid Proof Sprint", fit: "idea or company needs proof", price: "paid sprint", monthly: "no free build", badge: "proof", features: ["private intake + Deal Card", "small scoped proof or growth test", "budget before execution", "Go/No-Go before larger build"] },
        { name: "Growth Partner", fit: "existing company with budget and growth potential", price: "retainer + possible upside", monthly: "monthly", badge: "partner", features: ["fixed monthly base", "AI and automation in processes", "marketing/growth machine", "upside only with measurable contribution"] },
        { name: "AI Platform Build", fit: "software or platform as core", price: "scope price + support", monthly: "maintenance + optimization", badge: "build", features: ["custom software and agents", "customer portal and dashboards", "integrations and automation", "resale or revenue share only with contract"] },
        { name: "Selective Venture Deal", fit: "strategic upside opportunity", price: "custom + protection", monthly: "cash, share or equity", badge: "selective", features: ["only with strong market and proof", "AIOW gets control over digital execution", "IP, data and upside are contracted", "no open build without hard terms"] },
      ],
      note: "Important: AIOW is not a cheap build shop. We only invest risk, team time or IP when budget, scope, decision rights, data access and upside are contractually right. Without that basis, it is a paid project or a No-Go.",
      cta: "Start private intake",
    },
    afterScan: {
      eyebrow: "After agreement",
      headline: "From Deal Card to project group, Spunky and sprint.",
      text: "After private intake, Richard/Jeroen create the proposal from admin. After signing, the customer group with Spunky starts and we build internally with all context.",
      steps: [
        ["1", "Private intake", "You share sensitive data only in the private portal: proof, numbers, contacts, systems and risks."],
        ["2", "Deal Card + contract", "AIOW provides scores, approach, deal model, scope, responsibilities and dashboard focus."],
        ["3", "Project group + build", "After signing we create the Telegram project group with Spunky and start the internal AIOW build/growth system."],
      ],
      note: "Every customer gets a private portal with intake, Deal Card, contract, roadmap, KPIs, proof log and improvement advice. Launch, payments and modules stay behind explicit terms and approval.",
    },
    projects: {
      eyebrow: "Built with AIOW",
      headline: "Every venture gets its proof slot here.",
      text: "Everything AIOW helps build gets one central place once it is ready: app, platform, agent, portal, growth layer or customer system. No loose islands. Everything visible as AIOW-built.",
      meta: "Automatically filled from the AIOW project manifest.",
      open: "Open project",
    },
    cta: {
      eyebrow: "Private intake for your company",
      headline: "Let AIOW assess your plan\nor company",
      text: "Start low-friction. Sensitive numbers and contacts follow only in the private portal.",
      proof: ["private portal", "Deal Card", "growth on results"],
      intake: {
        typeLabel: "What are you bringing to AIOW?",
        typeOptions: ["Startup/idea", "Existing company", "AI platform", "Growth/marketing"],
        processLabel: "Where should AIOW build the most value?",
        processOptions: ["Software/platform", "Automation", "Marketing/growth", "CRM/sales", "Customer portal", "Other"],
        otherProcessPlaceholder: "E.g. HR, sales, support, operations…",
        goalLabel: "Which collaboration model may fit?",
        goalOptions: ["Proof sprint", "Fixed project", "Growth partner", "Revenue share"],
        questionLabel: "Question or context",
        questionPlaceholder: "E.g. we have an idea, industry contacts and want to know whether AIOW can build and grow this AI-native.",
        defaultQuestion: "I want AIOW to assess my idea/company and advise the best AI/software/growth route.",
        whatsappIntro: "Hi AIOW, I want to start a private intake for my idea/company.",
      },
      button: "Start through WhatsApp",
    },
  }} as const;


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
    desktop: "/aiow/story-v415/desktop/11-proof-studio.png",
    mobile: "/aiow/story-v415/mobile/11-proof-studio.png",
    video: { desktopLight: "/aiow/homepage-story/layer-02/layer-02_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-02/layer-02_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-02/layer-02_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-02/layer-02_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/08-channel-hub.png",
    mobile: "/aiow/story-v415/mobile/08-channel-hub.png",
    video: { desktopLight: "/aiow/homepage-story/layer-06/layer-06_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-06/layer-06_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-06/layer-06_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-06/layer-06_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/02-intake-hub.png",
    mobile: "/aiow/story-v415/mobile/02-intake-hub.png",
    video: { desktopLight: "/aiow/homepage-story/layer-03/layer-03_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-03/layer-03_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-03/layer-03_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-03/layer-03_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/05-model-router.png",
    mobile: "/aiow/story-v415/mobile/05-model-router.png",
    video: { desktopLight: "/aiow/homepage-story/layer-04/layer-04_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-04/layer-04_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-04/layer-04_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-04/layer-04_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/10-managed-ops.png",
    mobile: "/aiow/story-v415/mobile/10-managed-ops.png",
    video: { desktopLight: "/aiow/homepage-story/layer-05/layer-05_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-05/layer-05_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-05/layer-05_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-05/layer-05_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
  },
  {
    desktop: "/aiow/story-v415/desktop/09-human-approval.png",
    mobile: "/aiow/story-v415/mobile/09-human-approval.png",
    video: { desktopLight: "/aiow/homepage-story/layer-01/layer-01_desktop-light_video_kling-v2-1-master-desktop-balanced.mp4", desktopDark: "/aiow/homepage-story/layer-01/layer-01_desktop-dark_video_kling-v2-1-master-desktop-balanced.mp4", mobileLight: "/aiow/homepage-story/layer-01/layer-01_mobile-light_video_kling-v2-1-master-mobile-lite.mp4", mobileDark: "/aiow/homepage-story/layer-01/layer-01_mobile-dark_video_kling-v2-1-master-mobile-lite.mp4" },
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
    <button type="button" className={styles.langToggle} onClick={() => setLang(nextLang)} aria-label={`Switch language to ${nextLang.toUpperCase()}`}>
      {nextLang.toUpperCase()}
    </button>
  );
}

type NavKey = "home" | "story" | "scan" | "platform" | "account";

type MobileIconType = "home" | "story" | "chat" | "scan" | "platform" | "account" | "plus";

function MobileNavIcon({ type }: { type: MobileIconType }) {
  const common = { width: 28, height: 28, viewBox: "0 0 28 28", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true };
  if (type === "home") return <svg {...common}><path d="M5.9 13.2 14 6.35l8.1 6.85v8.35a2 2 0 0 1-2 2h-3.05v-6.75h-6.1v6.75H7.9a2 2 0 0 1-2-2V13.2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><path d="M10.95 23.55v-6.75h6.1v6.75" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>;
  if (type === "story") return <svg {...common}><rect x="5.2" y="6.1" width="17.6" height="15.8" rx="5" stroke="currentColor" strokeWidth="2.25" /><path d="M10.1 10.5h4.2M10.1 14h7.8M10.1 17.5h5.8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /><path d="M21.1 8.8v10.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity=".45" /></svg>;
  if (type === "chat") return <svg {...common}><path d="M6.1 13.2c0-4.5 3.72-7.35 7.94-7.35 4.35 0 7.86 2.92 7.86 7.18 0 4.18-3.34 7.18-7.77 7.18-.58 0-1.14-.05-1.68-.16l-4.15 2.22.88-3.65c-1.9-1.28-3.08-3.15-3.08-5.42Z" stroke="currentColor" strokeWidth="2.15" strokeLinejoin="round" /><path d="M10.35 12.15h7.25M10.35 15.4h4.85" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" /></svg>;
  if (type === "scan") return <svg {...common}><path d="M14 4.9v18.2M4.9 14h18.2" stroke="currentColor" strokeWidth="2.65" strokeLinecap="round" /><circle cx="14" cy="14" r="8.7" stroke="currentColor" strokeWidth="2.05" opacity=".36" /></svg>;
  if (type === "platform") return <svg {...common}><rect x="5.4" y="5.4" width="7" height="7" rx="2.2" stroke="currentColor" strokeWidth="2.15" /><rect x="15.6" y="5.4" width="7" height="7" rx="2.2" stroke="currentColor" strokeWidth="2.15" /><rect x="5.4" y="15.6" width="7" height="7" rx="2.2" stroke="currentColor" strokeWidth="2.15" /><path d="M18.9 16.1v6.4M15.7 19.3h6.4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>;
  if (type === "plus") return <svg {...common}><circle cx="14" cy="14" r="8.8" stroke="currentColor" strokeWidth="2.2" /><path d="M14 9.8v8.4M9.8 14h8.4" stroke="currentColor" strokeWidth="2.55" strokeLinecap="round" /></svg>;
  return <svg {...common}><circle cx="14" cy="9.8" r="4.35" stroke="currentColor" strokeWidth="2.25" /><path d="M6.4 23.1c1.38-4.05 4.12-6.05 7.6-6.05s6.22 2 7.6 6.05" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>;
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
      layer.dataset.visible = "true";
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
  const [mobileNavCompact, setMobileNavCompact] = useState(false);
  const [activeNav, setActiveNav] = useState<NavKey>("home");
  const [customerAccountId, setCustomerAccountId] = useState<string | null>(null);
  const hasCustomerAccount = Boolean(customerAccountId);
  const accountHref = hasCustomerAccount ? `/portal/customer/${customerAccountId}` : "/portal/account/new";
  const [selectedScanType, setSelectedScanType] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [customProcess, setCustomProcess] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [scanQuestion, setScanQuestion] = useState("");
  const [headerAiQuestion, setHeaderAiQuestion] = useState("");
  const [headerAiMode, setHeaderAiMode] = useState<"idea" | "company">("idea");
  const [intakeStarted, setIntakeStarted] = useState(false);
  const [intakeStep, setIntakeStep] = useState(0);
  const [activeDemo, setActiveDemo] = useState(0);
  const [budgetWorkflows, setBudgetWorkflows] = useState(1);
  const [budgetHours, setBudgetHours] = useState(4);
  const [scanInView, setScanInView] = useState(false);
  const scanRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const spunkyChatRef = useRef<HTMLDivElement | null>(null);
  const spunkyInputRef = useRef<HTMLInputElement | null>(null);
  const [spunkyMessages, setSpunkyMessages] = useState<SpunkyMessage[]>(() => [
    { role: "spunky", text: "Hoi, ik ben Spunky. Stel direct je vraag of vertel kort wat je wilt bouwen, automatiseren of groeien. Ik antwoord meteen; na twee berichten vraag ik je gegevens zodat we je intake kunnen vastleggen." },
  ]);
  const [spunkyInput, setSpunkyInput] = useState("");
  const [spunkyOpened, setSpunkyOpened] = useState(false);
  const [spunkyTyping, setSpunkyTyping] = useState(false);
  const [spunkyLead, setSpunkyLead] = useState({ name: "", email: "", company: "", consent: false });
  const [spunkyAccountState, setSpunkyAccountState] = useState<SpunkyAccountState>({ status: "idle" });
  const storyVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const progressStyle = useMemo(() => ({ "--layers": layers.length } as React.CSSProperties), [layers.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("lang");
    if (requested === "nl" || requested === "en") setLang(requested);
    setDebugScroll(params.get("debug") === "scroll");
  }, []);

  useEffect(() => {
    const readAccountState = () => {
      const storedAccountId = localStorage.getItem("aiow:lastAccountId");
      const storedCode = localStorage.getItem("aiow:lastAccessCode");
      setCustomerAccountId(storedAccountId && storedCode ? storedAccountId : null);
    };
    readAccountState();
    window.addEventListener("storage", readAccountState);
    window.addEventListener("aiow:account-state-changed", readAccountState);
    return () => {
      window.removeEventListener("storage", readAccountState);
      window.removeEventListener("aiow:account-state-changed", readAccountState);
    };
  }, []);

  useEffect(() => {
    const sections: Array<[NavKey, string]> = [
      ["home", "intro"],
      ["story", "story"],
      ["platform", "made-by-aiow"],
      ["scan", "scan"],
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = sections.find(([, id]) => id === visible.target.id);
        if (match) setActiveNav(match[0]);
      },
      { rootMargin: "-34% 0px -48% 0px", threshold: [0.08, 0.18, 0.32, 0.52] }
    );
    sections.forEach(([, id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      if (currentY < 80) setMobileNavCompact(false);
      else if (delta > 9) setMobileNavCompact(true);
      else if (delta < -9) setMobileNavCompact(false);
      lastY = currentY;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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

  useEffect(() => {
    if (!spunkyOpened || !window.matchMedia("(max-width: 760px)").matches) return;
    const timeout = window.setTimeout(() => {
      spunkyInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [spunkyOpened, spunkyMessages.length, spunkyTyping, spunkyAccountState.status]);

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

  const heroVideoSrc = "/aiow/homepage-story/aiow-hero-premium-business-worklayer.mp4";
  const heroPosterSrc = isMobileStory
    ? "/aiow/homepage-story/aiow-hero-keyframe-mobile-760.webp"
    : "/aiow/homepage-story/aiow-hero-keyframe-desktop-1280.webp";

  const resolvedProcess = (selectedProcess === "Anders" || selectedProcess === "Other")
    ? (customProcess || selectedProcess)
    : (selectedProcess || current.cta.intake.processOptions[0]);
  const whatsappMessage = lang === "nl"
    ? [
        "👋 Hoi AIOW, ik wil een private intake starten voor mijn idee/bedrijf.",
        "",
        "📌 Mijn situatie:",
        `• Type vraag: ${selectedScanType || current.cta.intake.typeOptions[0]}`,
        `• Eerste proces: ${resolvedProcess}`,
        `• Belangrijkste doel: ${selectedGoal || current.cta.intake.goalOptions[0]}`,
        "",
        "💬 Context / vraag:",
        scanQuestion || current.cta.intake.defaultQuestion,
        "",
        "✅ Kunnen jullie beoordelen welke AI/software/growth route en dealmodel het beste past?",
      ].join("\n")
    : [
        "👋 Hi AIOW, I want to start a private intake for my idea/company.",
        "",
        "📌 My situation:",
        `• Request type: ${selectedScanType || current.cta.intake.typeOptions[0]}`,
        `• First process: ${resolvedProcess}`,
        `• Main goal: ${selectedGoal || current.cta.intake.goalOptions[0]}`,
        "",
        "💬 Context / question:",
        scanQuestion || current.cta.intake.defaultQuestion,
        "",
        "✅ Can you assess the best AI/software/growth route and deal model?",
      ].join("\n");
  const whatsappHref = `https://wa.me/31621898039?text=${encodeURIComponent(whatsappMessage)}`;
  const headerAiSeed = current.headerAi.prompts[headerAiMode];
  const headerAiText = (headerAiQuestion.trim() || headerAiSeed).slice(0, 480);
  const headerTalkHref = `/portal/account/new?intent=${headerAiMode}&action=talk&context=${encodeURIComponent(headerAiText)}`;
  const headerApplyHref = `/portal/account/new?intent=${headerAiMode}&action=apply&context=${encodeURIComponent(headerAiText)}`;
  const visitorMessageCount = spunkyMessages.filter((message) => message.role === "visitor").length;
  const shouldAskSpunkyLead = visitorMessageCount >= 2 && spunkyAccountState.status !== "created";
  const spunkyTranscript = spunkyMessages.map((message) => `${message.role === "visitor" ? "Bezoeker" : "Spunky"}: ${message.text}`).join("\n");

  function openSpunkyChat(seed?: string) {
    setSpunkyOpened(true);
    window.setTimeout(() => {
      spunkyChatRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      spunkyInputRef.current?.focus();
    }, 30);
    if (seed?.trim() && spunkyMessages.filter((message) => message.role === "visitor").length === 0) {
      submitSpunkyMessage(seed.trim());
    }
  }

  function spunkyAnswer(question: string, countAfter: number): string {
    const lower = question.toLowerCase();
    if (countAfter >= 2) {
      return "Helder. Ik heb genoeg eerste context om dit niet te verliezen. Voordat we verder gaan wil ik je naam, e-mail en eventueel bedrijfsnaam. Dan maak ik je AIOW-account aan en bewaren we deze chat voor beoordeling en opvolging.";
    }
    if (lower.includes("lead") || lower.includes("sales") || lower.includes("opvolg") || lower.includes("mail")) {
      return "Dan ligt de eerste AI-hefboom bij lead capture + opvolging: bezoekers herkennen, intentie scoren, CRM vullen en de volgende dag persoonlijk opvolgen. Welke leads mis je nu vooral: websitebezoekers, bestaande klanten of koude prospects?";
    }
    if (lower.includes("bedrijf") || lower.includes("proces") || lower.includes("automatis")) {
      return "Voor een bestaand bedrijf zoeken we de workflow met de meeste tijdverlies of omzetlekkage: klantcontact, sales, planning, administratie, support of data. Welk proces wil je als eerste sneller maken?";
    }
    if (lower.includes("startup") || lower.includes("idee") || lower.includes("app")) {
      return "Voor een nieuw idee kijk ik naar doelgroep, bewijs van vraag, distributie en AI-moat. Voor wie is het, welk probleem lost het op en heb je al klanten/contacten/data?";
    }
    return "Ja. Vertel in één zin wat je wilt bouwen, automatiseren of groeien. Ik vertaal het direct naar AIOW-kansen, risico’s en de eerste slimme vervolgvraag.";
  }

  async function submitSpunkyMessage(textOverride?: string) {
    const text = (textOverride ?? spunkyInput).trim();
    if (!text || spunkyTyping) return;
    const nextVisitorCount = visitorMessageCount + 1;
    const nextMessages: SpunkyMessage[] = [...spunkyMessages, { role: "visitor", text }];
    setSpunkyMessages(nextMessages);
    setSpunkyInput("");
    setSpunkyOpened(true);
    setSpunkyTyping(true);
    track("Spunky chat message", { page: "native-homepage", count: nextVisitorCount, mode: headerAiMode });
    try {
      const response = await fetch("/api/spunky/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: headerAiMode,
          visitorMessageCount: nextVisitorCount,
          transcript: nextMessages.map((message) => `${message.role === "visitor" ? "Bezoeker" : "Spunky"}: ${message.text}`).join("\n"),
          page: "aiow.ai/",
        }),
      });
      const data = await response.json();
      const reply = response.ok && typeof data.reply === "string" ? data.reply : spunkyAnswer(text, nextVisitorCount);
      setSpunkyMessages((messages) => [...messages, { role: "spunky", text: reply }]);
    } catch {
      setSpunkyMessages((messages) => [...messages, { role: "spunky", text: spunkyAnswer(text, nextVisitorCount) }]);
    } finally {
      setSpunkyTyping(false);
    }
  }

  async function createSpunkyAccount() {
    const name = spunkyLead.name.trim();
    const email = spunkyLead.email.trim().toLowerCase();
    const company = spunkyLead.company.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !spunkyLead.consent) {
      setSpunkyAccountState({ status: "error", message: "Vul minimaal naam, geldig e-mailadres en toestemming in." });
      return;
    }
    setSpunkyAccountState({ status: "creating" });
    const transcript = `${spunkyTranscript}\nBezoeker contact: ${name} · ${email} · ${company || "geen bedrijfsnaam opgegeven"}`.slice(0, 1600);
    const companyName = company || `${name} persoonlijke AIOW aanvraag`;
    try {
      const response = await fetch("/api/customer-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          legalName: companyName,
          contactName: name,
          contactEmail: email,
          projectName: headerAiMode === "idea" ? "Nieuw AIOW idee via Spunky chat" : "AI digitalisering via Spunky chat",
          projectType: headerAiMode === "idea" ? "AI venture / startup" : "AI-integratie bestaand bedrijf",
          moduleInterests: ["Spunky intake", "AI due diligence", "Customer portal", "Build & growth sprint"],
          addOns: ["Team Richard beoordeling", "Persoonlijke opvolging"],
          aiowRevenueSharePercent: 10,
          revenueShareNotes: "Door Spunky-chat aangemaakt; dealmodel volgt na AIOW beoordeling.",
          moduleRevenueNotes: transcript,
          ideaSummary: transcript,
          aiowBuildScope: transcript,
          painPoints: transcript,
          successMetrics: "AIOW bepaalt eerste KPI's na aanvullende account-chat.",
          accountTermsAccepted: true,
          emailFollowupConsent: true,
          consentText: "Bezoeker gaf via Spunky-chat toestemming dat AIOW de contactgegevens en intakecontext gebruikt voor persoonlijke opvolging en account-aanmaak.",
          consentVersion: "aiow-spunky-chat-v1",
          sourceRoute: "/",
          sourceComponent: "homepage-spunky-chat",
          intentType: headerAiMode,
          intentText: transcript,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Account kon niet worden aangemaakt.");
      localStorage.setItem("aiow:customerAccountId", data.account.accountId);
      localStorage.setItem("aiow:customerAccessCode", data.accessCode);
      setCustomerAccountId(data.account.accountId);
      setSpunkyAccountState({ status: "created", accountId: data.account.accountId, accessCode: data.accessCode, portalUrl: data.portalUrl, leadId: data.leadId });
      setSpunkyMessages((messages) => [
        ...messages,
        { role: "spunky", text: "Je AIOW-account is aangemaakt. Check je e-mail en log in op je account; daar gaan we verder met de aanvullende vragen die Team Richard nodig heeft voor score, risico’s en dealadvies." },
      ]);
      track("Spunky account created", { page: "native-homepage", accountId: data.account.accountId });
    } catch (error) {
      setSpunkyAccountState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  const budgetSetupEstimate = 7500 + Math.max(0, budgetWorkflows - 1) * 3500 + budgetHours * 500;
  const budgetFormatter = useMemo(() => new Intl.NumberFormat(lang === "nl" ? "nl-NL" : "en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), [lang]);

  const intakeTotalQuestions = 4;
  const intakeProgress = Math.min(intakeStep + 1, intakeTotalQuestions);
  const intakeEstimate = selectedScanType === "Startup/idee" || selectedScanType === "Startup/idea"
    ? (lang === "nl" ? "Waarschijnlijk: eerst private due diligence + proof sprint voordat we groter bouwen." : "Likely: private due diligence + proof sprint before a larger build.")
    : selectedScanType === "Bestaand bedrijf" || selectedScanType === "Existing company"
      ? (lang === "nl" ? "Waarschijnlijk: growth partner route met KPI-dashboard, automatisering en mogelijke upside." : "Likely: growth partner route with KPI dashboard, automation and possible upside.")
      : (lang === "nl" ? "Waarschijnlijk: AI Platform Build met Deal Card, contract en sprint-roadmap." : "Likely: AI Platform Build with Deal Card, contract and sprint roadmap.");
  const intakeRouteTitle = lang === "nl"
    ? `${resolvedProcess} venture-route`
    : `${resolvedProcess} venture route`;
  const intakeWinItems = lang === "nl"
    ? [
        selectedGoal === "Revenue share" ? "dealadvies voor omzetdeling en doorverkoop" : "heldere Deal Card vóór bouw",
        selectedProcess === "Marketing/growth" ? "growth loops met KPI-dashboard" : "AI/software sprint met meetbare output",
        selectedScanType === "Startup/idee" ? "proof sprint vóór grote investering" : "verbeteradvies voor bestaande digitale operatie",
      ]
    : [
        selectedGoal === "Revenue share" ? "deal advice for revenue share and resale" : "clear Deal Card before build",
        selectedProcess === "Marketing/growth" ? "growth loops with KPI dashboard" : "AI/software sprint with measurable output",
        selectedScanType === "Startup/idea" ? "proof sprint before major investment" : "improvement advice for existing digital operations",
      ];
  const scanDeliverables = lang === "nl"
    ? ["Founder/Market/Execution scores", "AI opportunity score", "dealadvies", "eerste sprint", "risico’s + proof"]
    : ["Founder/Market/Execution scores", "AI opportunity score", "deal advice", "first sprint", "risks + proof"];
  const intakeRoiHint = lang === "nl"
    ? "Als AIOW aantoonbaar omzet, resale of modulewaarde creëert, adviseren we minimaal 10% en hoger bij meer IP/risico."
    : "When AIOW demonstrably creates revenue, resale or module value, we advise at least 10% and higher with more IP/risk.";
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: current.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const teamRail = lang === "nl"
    ? [
        ["👑", "Handsome", "Command + build", "Beslist de beste route, bouwt, test, shipped en houdt Richard uit procesruis."],
        ["🦎", "Book", "UX/taste/red-team", "Controleert of richting, copy, deal en product premium genoeg zijn voordat we groot doorbouwen."],
        ["👽", "Mini", "Market/radar", "Levert buitenwereld: X/social, SEO/GAO, concurrenten, timing en publiekswaarde."],
        ["⚡", "Spunky", "AIOW context bridge", "Haalt klant/project/context uit de AIOW command room op; adviseert, maar Team Richard beslist."],
      ]
    : [
        ["👑", "Handsome", "Command + build", "Chooses the best route, builds, tests, ships and keeps Richard out of process noise."],
        ["🦎", "Book", "UX/taste/red-team", "Checks whether direction, copy, deal and product quality are premium before we scale the work."],
        ["👽", "Mini", "Market/radar", "Brings outside-world truth: X/social, SEO/GAO, competitors, timing and audience value."],
        ["⚡", "Spunky", "AIOW context bridge", "Pulls customer/project/context from the AIOW command room; advises, Team Richard decides."],
      ];

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

  useEffect(() => {
    const thread = spunkyChatRef.current?.querySelector('[data-spunky-thread="true"]');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [spunkyMessages.length, spunkyTyping, shouldAskSpunkyLead, spunkyAccountState.status]);

  return (
    <main className={styles.page} data-theme={theme} lang={lang}>
      <AiowCursorOrb />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="AIOW home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandText}><strong>AIOW</strong><small>{current.brand}</small></span>
        </Link>
        <nav aria-label="Preview navigation" className={styles.desktopNav}>
          <a href="#story" data-active={activeNav === "story" ? "true" : "false"}>{current.nav.story}</a>
          <a href="#operating-model" data-active={activeNav === "platform" ? "true" : "false"}>{current.nav.model}</a>
          <a href="#made-by-aiow" data-active={activeNav === "platform" ? "true" : "false"}>{current.nav.work}</a>
          <a href="#scan" data-active={activeNav === "scan" ? "true" : "false"}>{current.nav.scan}</a>
        </nav>
        <div className={styles.headerToggles}>
          <a href={accountHref} className={styles.accountTopLink} data-state={hasCustomerAccount ? "signed-in" : "new"} aria-label={hasCustomerAccount ? (lang === "nl" ? "Open account" : "Open account") : (lang === "nl" ? "Account aanmaken" : "Create account")}>
            <MobileNavIcon type={hasCustomerAccount ? "account" : "plus"} />
            <span>{hasCustomerAccount ? "Account" : "Start"}</span>
          </a>
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} setTheme={setTheme} label={current.themeLabel} />
        </div>
      </header>

      <div className={styles.scrollProgress} style={progressStyle} aria-hidden="true" />
      <a href="#scan" className={styles.stickyScanCta} data-hidden={scanInView ? "true" : "false"} aria-hidden={scanInView ? "true" : undefined} tabIndex={scanInView ? -1 : undefined}>{lang === "nl" ? "Start private intake" : "Start private intake"}</a>
      <nav className={styles.mobileBottomNav} data-compact={mobileNavCompact ? "true" : "false"} aria-label={lang === "nl" ? "Mobiele AIOW navigatie" : "Mobile AIOW navigation"}>
        <a href="#intro" className={styles.mobileNavItem} data-active={activeNav === "home" ? "true" : "false"} aria-label="Home"><MobileNavIcon type="home" /></a>
        <a href="#story" className={styles.mobileNavItem} data-active={activeNav === "story" ? "true" : "false"} aria-label={lang === "nl" ? "Venture flow" : "Venture flow"}><MobileNavIcon type="story" /></a>
        <button type="button" className={`${styles.mobileNavItem} ${styles.mobileNavChat}`} data-active="false" aria-label={lang === "nl" ? "Chat met AIOW" : "Chat with AIOW"} onClick={() => { track("CTA click", { location: "mobile-bottom-chat", mode: headerAiMode, page: "native-homepage" }); openSpunkyChat(headerAiText); }}><MobileNavIcon type="chat" /></button>
        <a href="#made-by-aiow" className={styles.mobileNavItem} data-active={activeNav === "platform" ? "true" : "false"} aria-label={lang === "nl" ? "Platform" : "Platform"}><MobileNavIcon type="platform" /></a>
        <a href={accountHref} className={`${styles.mobileNavItem} ${styles.mobileNavAvatar}`} data-account-state={hasCustomerAccount ? "signed-in" : "new"} data-active={activeNav === "account" ? "true" : "false"} aria-label={hasCustomerAccount ? (lang === "nl" ? "Open account" : "Open account") : (lang === "nl" ? "Account aanmaken" : "Create account")}>
          <span className={styles.mobileNavAvatarMark}><MobileNavIcon type={hasCustomerAccount ? "account" : "plus"} /></span>
          {hasCustomerAccount ? <i aria-hidden="true" /> : null}
        </a>
      </nav>

      <section id="intro" className={styles.intro} aria-labelledby="intro-title">
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
            data-mobile-src="/aiow/homepage-story/aiow-hero-premium-business-worklayer.mp4"
            data-desktop-src="/aiow/homepage-story/aiow-hero-premium-business-worklayer.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroPosterSrc}
          />
          <div ref={spunkyChatRef} id="spunky-chat" className={styles.heroAiPanel} data-mode={headerAiMode} data-open={spunkyOpened ? "true" : "false"}>
            <div className={styles.heroAiTopline}>
              <span className={styles.heroAiPulse} aria-hidden="true">AI</span>
              <div>
                <small>Spunky chat</small>
                <strong>{lang === "nl" ? "Chat direct met Spunky. Geen formulier vooraf." : "Chat directly with Spunky. No form first."}</strong>
              </div>
            </div>
            <div className={styles.spunkyThread} data-spunky-thread="true" aria-live="polite">
              {spunkyMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={styles.spunkyBubble} data-role={message.role}>
                  <span>{message.role === "spunky" ? "Spunky" : "Jij"}</span>
                  <p>{message.text}</p>
                </div>
              ))}
              {spunkyTyping ? <div className={styles.spunkyBubble} data-role="spunky" data-typing="true"><span>Spunky</span><p>aan het typen…</p></div> : null}
            </div>
            <form className={styles.spunkyComposer} onSubmit={(event) => { event.preventDefault(); submitSpunkyMessage(); }}>
              <input ref={spunkyInputRef} value={spunkyInput} onChange={(event) => { setSpunkyInput(event.target.value); setHeaderAiQuestion(event.target.value); }} placeholder="Bericht aan Spunky…" aria-label="Chat met Spunky" />
              <button type="submit" aria-label="Stuur bericht" disabled={!spunkyInput.trim() || spunkyTyping}>➤</button>
            </form>
            <div className={styles.heroAiControls} data-chat-controls="true">
              <div className={styles.heroAiModes} aria-label={lang === "nl" ? "AIOW vraagtype" : "AIOW question type"}>
                <button type="button" data-active={headerAiMode === "idea" ? "true" : "false"} onClick={() => setHeaderAiMode("idea")}>{current.headerAi.modes[0]}</button>
                <button type="button" data-active={headerAiMode === "company" ? "true" : "false"} onClick={() => setHeaderAiMode("company")}>{current.headerAi.modes[1]}</button>
              </div>
              <button type="button" className={styles.heroAiAsk} onClick={() => openSpunkyChat(headerAiText)}>{current.headerAi.ask}</button>
              <Link href={headerApplyHref} className={styles.heroAiApply} onClick={() => track("CTA click", { location: "hero-ai-apply", mode: headerAiMode, page: "native-homepage" })}>Account</Link>
            </div>
            {shouldAskSpunkyLead && (
              <div className={styles.spunkyLeadCapture}>
                <strong>Voordat we verder gaan</strong>
                <p>Mag ik je naam, e-mail en eventueel bedrijfsnaam? Dan maak ik direct je AIOW-account aan en bewaren we deze chat voor de beoordeling.</p>
                <div className={styles.spunkyLeadGrid}>
                  <input value={spunkyLead.name} onChange={(event) => setSpunkyLead((lead) => ({ ...lead, name: event.target.value }))} placeholder="Naam" />
                  <input value={spunkyLead.email} onChange={(event) => setSpunkyLead((lead) => ({ ...lead, email: event.target.value }))} placeholder="E-mail" inputMode="email" />
                  <input value={spunkyLead.company} onChange={(event) => setSpunkyLead((lead) => ({ ...lead, company: event.target.value }))} placeholder="Bedrijfsnaam optioneel" />
                </div>
                <label className={styles.spunkyConsent}>
                  <input type="checkbox" checked={spunkyLead.consent} onChange={(event) => setSpunkyLead((lead) => ({ ...lead, consent: event.target.checked }))} />
                  <span>AIOW mag mijn gegevens en chatcontext gebruiken voor account-aanmaak en persoonlijke opvolging per e-mail.</span>
                </label>
                <button type="button" onClick={createSpunkyAccount} disabled={spunkyAccountState.status === "creating"}>{spunkyAccountState.status === "creating" ? "Account maken..." : "Maak mijn AIOW-account"}</button>
                {spunkyAccountState.status === "error" && <p className={styles.spunkyError}>{spunkyAccountState.message}</p>}
              </div>
            )}
            {spunkyAccountState.status === "created" && (
              <div className={styles.spunkyAccountReady}>
                <strong>Account klaar. Check je e-mail en log in.</strong>
                <p>Account: <code>{spunkyAccountState.accountId}</code></p>
                <p>Toegangscode: <code>{spunkyAccountState.accessCode}</code></p>
                <Link href={spunkyAccountState.portalUrl}>Open mijn AIOW-account</Link>
              </div>
            )}
          </div>
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
          <div className={styles.demoTabs} role="tablist" aria-label={lang === "nl" ? "AIOW venture flow opties" : "AIOW venture flow options"}>
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
              <span>{lang === "nl" ? "AIOW analyse" : "AIOW analysis"}</span>
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
            <p>{lang === "nl" ? "Top-1%-UX: bezoekers zien in één scherm hoe AIOW beoordeelt, bouwt, contracteert en met Spunky blijft meedraaien." : "Top-1% UX: visitors see in one screen how AIOW assesses, builds, contracts and keeps Spunky in the loop."}</p>
            <Link href="/portal" className={styles.secondary}>{current.aiDemo.cta}</Link>
          </div>
        </div>
      </section>

      <noscript>
        <section className={styles.noScriptFallback} aria-label="AIOW fallback">
          <p>{lang === "nl" ? "Video en scroll-interactie staan uit, maar de venture-studio kern blijft hetzelfde." : "Video and scroll interaction are disabled, but the venture-studio offer is the same."}</p>
          <strong>{lang === "nl" ? "AIOW bouwt AI, software, automatisering en growth in startups en bestaande bedrijven." : "AIOW builds AI, software, automation and growth into startups and established companies."}</strong>
          <a href="#scan">{lang === "nl" ? "Start private intake" : "Start private intake"}</a>
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

      <section className={styles.teamRailSection} aria-labelledby="team-rail-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{lang === "nl" ? "Team Richard upgrade" : "Team Richard upgrade"}</p>
          <h2 id="team-rail-title">{lang === "nl" ? "Iedere lane heeft nu één taak: bewijs leveren." : "Every lane now has one job: produce proof."}</h2>
          <p>{lang === "nl" ? "Spunky is geen extra baas en geen ruislaag. Het is de AIOW-contextbrug: klantgroep, artifacts en projectvragen naar Team Richard. Daarna beslist Handsome met Book/Mini-checks wat waarde heeft." : "Spunky is not an extra boss or noise layer. It is the AIOW context bridge: customer group, artifacts and project questions into Team Richard. Then Handsome decides with Book/Mini checks what has value."}</p>
        </div>
        <div className={styles.teamRailGrid}>
          {teamRail.map(([icon, name, role, text]) => (
            <article key={name}>
              <span>{icon}</span>
              <small>{role}</small>
              <h3>{name}</h3>
              <p>{text}</p>
            </article>
          ))}
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

      <section id="made-by-aiow" className={`${styles.routerSection} ${styles.webgpuShowcase}`} aria-labelledby="router-title">
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
        <div className={styles.budgetCompass} aria-label={lang === "nl" ? "Deal indicatie" : "Deal estimate"}>
          <div className={styles.budgetCopy}>
            <span>{lang === "nl" ? "Deal kompas" : "Deal compass"}</span>
            <strong>{lang === "nl" ? "AIOW neemt pas risico als budget, data en controle kloppen." : "AIOW only takes risk when budget, data and control are right."}</strong>
            <p>{lang === "nl" ? "Indicatief: eerst betaalde intake, proof sprint of scopeprijs. Revenue, profit of equity komt alleen in beeld bij sterke upside, duidelijke meetbaarheid en contractuele bescherming." : "Indicative: paid intake, proof sprint or scoped price first. Revenue, profit or equity only enters when upside is strong, measurable and contractually protected."}</p>
          </div>
          <div className={styles.budgetControls}>
            <label>
              <span>{lang === "nl" ? "Build-complexiteit" : "Build complexity"} <b>{budgetWorkflows}</b></span>
              <input type="range" min="1" max="4" value={budgetWorkflows} onChange={(event) => setBudgetWorkflows(Number(event.target.value))} />
            </label>
            <label>
              <span>{lang === "nl" ? "AIOW risico/upside" : "AIOW risk/upside"} <b>{budgetHours}</b></span>
              <input type="range" min="0" max="20" step="1" value={budgetHours} onChange={(event) => setBudgetHours(Number(event.target.value))} />
            </label>
          </div>
          <div className={styles.budgetResult}>
            <span>{lang === "nl" ? "Budgetindicatie vanaf" : "Budget indication from"}</span>
            <strong>{budgetFormatter.format(budgetSetupEstimate)}</strong>
            <p>{lang === "nl" ? "Niet bindend: echte afspraak volgt uit Deal Card, scope, bewijs, beslisrechten en contract." : "Non-binding: real terms follow from Deal Card, scope, proof, decision rights and contract."}</p>
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
                    <span>{lang === "nl" ? "Private intake richting" : "Private intake direction"}</span>
                    <strong>{lang === "nl" ? "Aanbevolen venture-route:" : "Recommended venture route:"} {intakeRouteTitle}</strong>
                    <p>{intakeEstimate}</p>
                  </div>
                  <div className={styles.resultSplit}>
                    <div className={styles.resultOutcomeCard}>
                      <b>{lang === "nl" ? "Waarde / upside" : "Value / upside"}</b>
                      <ul>
                        {intakeWinItems.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className={styles.scanOfferCard}>
                      <span>{lang === "nl" ? "AIOW Deal Card" : "AIOW Deal Card"}</span>
                      <b>{lang === "nl" ? "Wat moet de intake opleveren?" : "What should intake produce?"}</b>
                      <ul>
                        {scanDeliverables.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <p className={styles.resultNextStep}>{lang === "nl" ? "Beste volgende stap: start de private intake. Daarna maken we Deal Card, contractvoorstel en eerste build/growth sprint." : "Best next step: start private intake. Then we create Deal Card, contract proposal and first build/growth sprint."}</p>
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
          <p>{lang === "nl" ? "AIOW BV bouwt AI, software, automatisering en growth in startups en gevestigde bedrijven." : "AIOW BV builds AI, software, automation and growth into startups and established companies."}</p>
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
