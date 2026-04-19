// Scan flow data — questions, modules, copy

export type ScanModule = "workflow" | "geo" | "social" | "documents";

export const MODULES: {
  id: ScanModule;
  emoji: string;
  label: string;
  tagline: string;
  description: string;
}[] = [
  {
    id: "workflow",
    emoji: "⚡",
    label: "Werkprocessen",
    tagline: "Waar gaat tijd verloren?",
    description:
      "Analyse van je dagelijkse workflows. Waar kan AI taken overnemen of versnellen?",
  },
  {
    id: "geo",
    emoji: "🌐",
    label: "Vindbaarheid (GEO)",
    tagline: "Zichtbaar voor AI-zoekmachines?",
    description:
      "Hoe goed verschijnt je bedrijf in antwoorden van ChatGPT, Claude, Perplexity, Gemini?",
  },
  {
    id: "social",
    emoji: "📱",
    label: "Social Media",
    tagline: "Content-engine op AI",
    description:
      "Analyse van je socials. Waar zit groeipotentieel met AI-contentcreatie?",
  },
  {
    id: "documents",
    emoji: "📄",
    label: "Documenten & Data",
    tagline: "Goud in je archieven",
    description:
      "Welke documenten, mails, data kunnen door AI worden geanalyseerd, samengevat, doorzocht?",
  },
];

export const SECTORS = [
  { value: "ambacht", label: "Ambacht (bakker, kapper, loodgieter)" },
  { value: "accountancy", label: "Accountancy & administratie" },
  { value: "vastgoed", label: "Vastgoed & makelaardij" },
  { value: "juridisch", label: "Juridisch & notariaat" },
  { value: "horeca", label: "Horeca" },
  { value: "productie", label: "Productie & maakindustrie" },
  { value: "zakelijke_dienstverlening", label: "Zakelijke dienstverlening" },
  { value: "e_commerce", label: "E-commerce & retail" },
  { value: "zorg", label: "Zorg & welzijn" },
  { value: "bouw", label: "Bouw & installatie" },
  { value: "anders", label: "Anders" },
];

export const TEAM_SIZES = [
  { value: "1", label: "Ik alleen (ZZP)" },
  { value: "2-5", label: "2-5 mensen" },
  { value: "6-20", label: "6-20 mensen" },
  { value: "21-50", label: "21-50 mensen" },
  { value: "51+", label: "51+ mensen" },
];

export const AI_USAGE = [
  { value: "none", label: "Nog niks" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "copilot", label: "MS Copilot" },
  { value: "gemini", label: "Google Gemini" },
  { value: "midjourney", label: "Midjourney / beeld-AI" },
  { value: "automation", label: "Zapier / Make / n8n" },
  { value: "custom", label: "Custom AI-tools" },
];

export const TIME_LOSERS = [
  { value: "email", label: "Email-beheer" },
  { value: "reports", label: "Rapportages schrijven" },
  { value: "admin", label: "Administratie & boekhouding" },
  { value: "support", label: "Klantenservice" },
  { value: "content", label: "Content / marketing" },
  { value: "sales", label: "Sales / lead-opvolging" },
  { value: "planning", label: "Planning & offertes" },
  { value: "docs", label: "Documenten doorzoeken" },
  { value: "meetings", label: "Meetings & notulen" },
  { value: "research", label: "Research / opzoekwerk" },
];
