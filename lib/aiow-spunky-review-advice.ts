import type { PublicCustomerAccount } from "./aiow-customer-accounts";
import type { VentureCanvasSnapshot, VentureDealCard, VentureMemoryEvent } from "./aiow-venture-memory";
import { generateSpunkyWorkspaceQuestion, workspaceCardTitles, type SpunkyWorkspaceCardTitle, type SpunkyWorkspaceQuestion } from "./aiow-spunky-workspace-question";

export type SpunkyReviewVerdict = "GO" | "CONDITIONAL_GO" | "ADJUST_DEAL" | "NO_GO";

export type SpunkyReviewAdviceInput = {
  account: PublicCustomerAccount;
  events: VentureMemoryEvent[];
  canvas: VentureCanvasSnapshot;
  dealCard: Partial<VentureDealCard> | null;
};

export type SpunkyReviewAdvice = {
  verdict: SpunkyReviewVerdict;
  confidence: number;
  readinessScore: number;
  dealStrength: number;
  automationValue: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  why: string[];
  missingProof: string[];
  risks: string[];
  recommendedFirstSprint: string;
  nextBestQuestions: SpunkyWorkspaceQuestion[];
  customerEmailDraft: {
    subject: string;
    body: string;
  };
  adminActions: string[];
  automationNotes: string[];
};

export function generateSpunkyReviewAdvice(input: SpunkyReviewAdviceInput): SpunkyReviewAdvice {
  const text = combinedText(input);
  const dealMissing = input.dealCard?.missing || [];
  const completeness = workspaceCompleteness(input.events);
  const evidenceScore = scoreEvidence(text, dealMissing);
  const aiValue = scoreAiValue(input, text);
  const riskPenalty = scoreRiskPenalty(text, dealMissing);
  const accountReadiness = Math.max(0, Math.min(100, input.account.analysisReadinessScore || 0));
  const canvasConfidence = Math.max(0, Math.min(100, input.canvas.confidence || 0));
  const rawReadinessScore = Math.round((accountReadiness * 0.14) + (canvasConfidence * 0.16) + (evidenceScore * 0.38) + (aiValue * 0.22) + (completeness * 0.1) - riskPenalty);
  const evidenceFloor = evidenceScore >= 70 && aiValue >= 60 ? (riskLevelPreview(text, riskPenalty) === "high" ? 48 : 60) : 0;
  const safeReadiness = Math.max(0, Math.min(95, Math.max(rawReadinessScore, evidenceFloor)));
  const riskLevel = riskPenalty >= 28 || includesAny(text, ["geen budget", "privacy", "gevoelig", "juridisch", "onduidelijk", "geen toegang"]) ? "high" : riskPenalty >= 14 ? "medium" : "low";
  const verdict = chooseVerdict(safeReadiness, riskLevel, dealMissing, text);
  const missingProof = buildMissingProof(input, text, dealMissing);
  const risks = buildRisks(input, text, riskLevel);
  const recommendedFirstSprint = buildFirstSprint(input, text, verdict);
  const nextBestQuestions = workspaceCardTitles().map((cardTitle) => generateSpunkyWorkspaceQuestion({ account: input.account, cardTitle, events: input.events, dealCard: input.dealCard, canvas: input.canvas }));

  return {
    verdict,
    confidence: Math.max(25, Math.min(95, Math.round((safeReadiness + canvasConfidence + evidenceScore) / 3))),
    readinessScore: safeReadiness,
    dealStrength: Math.max(0, Math.min(100, Math.round((evidenceScore * 0.5) + (accountReadiness * 0.25) + (completeness * 0.25)))),
    automationValue: aiValue,
    riskLevel,
    summary: buildSummary(input, verdict, safeReadiness),
    why: buildWhy(input, verdict, evidenceScore, aiValue, completeness),
    missingProof,
    risks,
    recommendedFirstSprint,
    nextBestQuestions,
    customerEmailDraft: buildEmailDraft(input, verdict, missingProof, recommendedFirstSprint),
    adminActions: buildAdminActions(verdict, missingProof, risks),
    automationNotes: [
      "Spunky kan de beste vervolgvraag automatisch klaarzetten per incomplete card.",
      "Gebruik dit advies als review-startpunt, niet als contractbesluit.",
      "Geen scope, prijs, livegang of billing zonder Team Richard akkoord.",
    ],
  };
}

function combinedText(input: SpunkyReviewAdviceInput): string {
  return [
    input.account.companyName,
    input.account.projectName,
    input.account.projectType,
    input.account.moduleInterests.join(" "),
    input.account.analysisProfile.coreOffer,
    input.account.analysisProfile.keyProcesses,
    input.account.analysisProfile.systemsStack,
    input.account.analysisProfile.dataSources,
    input.account.analysisProfile.painPoints,
    input.account.analysisProfile.successMetrics,
    input.account.analysis?.verdict,
    input.account.analysis?.firstSprintRecommendation,
    ...analysisStrings(input.account.analysis, "requiredProof"),
    ...analysisStrings(input.account.analysis, "requiredCustomerProof"),
    ...analysisStrings(input.account.analysis, "risks"),
    input.canvas.problem,
    input.canvas.solution,
    input.canvas.aiOpportunities,
    input.canvas.automation,
    input.canvas.growth,
    input.dealCard?.problem,
    input.dealCard?.opportunity,
    input.dealCard?.likelyRoute,
    ...(input.dealCard?.missing || []),
    ...input.events.slice(-30).map((event) => event.content),
  ].filter(Boolean).join("\n").toLowerCase();
}

function workspaceCompleteness(events: VentureMemoryEvent[]): number {
  const titles = workspaceCardTitles();
  const answered = titles.filter((title) => events.some((event) => event.content.includes(`Workspace card: ${title}`))).length;
  return Math.round((answered / titles.length) * 100);
}

function scoreEvidence(text: string, missing: string[]): number {
  let score = 28;
  if (includesAny(text, ["klant", "lead", "demo", "demo-aanvraag", "aanvraag", "warm", "gesprek", "offerte", "loi", "pre-order", "omzet"])) score += 22;
  if (includesAny(text, ["kpi", "30 dagen", "conversie", "bespaarde uren", "response", "gekwalificeerde gesprekken"])) score += 18;
  if (includesAny(text, ["budget", "€", "euro", "sprint", "retainer"])) score += 14;
  if (includesAny(text, ["beslisser", "akkoord", "tekenbevoegd", "owner"])) score += 10;
  return Math.max(0, Math.min(100, score - missing.length * 6));
}

function scoreAiValue(input: SpunkyReviewAdviceInput, text: string): number {
  let score = 35;
  if (includesAny(text, ["ai", "agent", "automatis", "workflow", "crm", "mail", "opvolg", "lead", "support", "planning"])) score += 28;
  if ((input.canvas.aiScore || 0) >= 6) score += 14;
  if ((input.canvas.automationScore || 0) >= 6) score += 14;
  if (input.account.moduleInterests.length >= 2) score += 6;
  return Math.max(0, Math.min(100, score));
}

function scoreRiskPenalty(text: string, missing: string[]): number {
  let penalty = missing.length * 4;
  if (includesAny(text, ["privacy", "avg", "gevoelig", "contract", "betaling", "medisch", "juridisch"])) penalty += 16;
  if (!includesAny(text, ["budget", "€", "euro", "sprint", "retainer"])) penalty += 8;
  if (!includesAny(text, ["kpi", "30 dagen", "conversie", "uren", "omzet", "gesprekken"])) penalty += 8;
  return penalty;
}

function chooseVerdict(score: number, risk: "low" | "medium" | "high", missing: string[], text: string): SpunkyReviewVerdict {
  if (score >= 76 && risk !== "high" && missing.length <= 1) return "GO";
  if (score >= 56 && includesAny(text, ["klant", "lead", "kpi", "demo", "workflow", "automatis"])) return "CONDITIONAL_GO";
  if (score >= 38) return "ADJUST_DEAL";
  return "NO_GO";
}

function buildMissingProof(input: SpunkyReviewAdviceInput, text: string, dealMissing: string[]): string[] {
  const items = new Set<string>();
  dealMissing.forEach((item) => items.add(item));
  if (!includesAny(text, ["klant", "lead", "demo", "demo-aanvraag", "aanvraag", "warm", "loi", "pre-order", "omzet"])) items.add("bewijs van klantvraag of concrete lead");
  if (!includesAny(text, ["kpi", "30 dagen", "conversie", "uren", "omzet", "gesprekken"])) items.add("eerste KPI voor 30 dagen");
  if (!includesAny(text, ["budget", "€", "euro", "sprint", "retainer"])) items.add("budgetrange of investeringskader");
  if (!includesAny(text, ["beslisser", "akkoord", "tekenbevoegd", "owner"])) items.add("beslisser of owner voor scope en akkoord");
  return [...items].slice(0, 6);
}

function buildRisks(input: SpunkyReviewAdviceInput, text: string, riskLevel: "low" | "medium" | "high"): string[] {
  const risks: string[] = [];
  if (riskLevel === "high") risks.push("Case bevat nog te veel aannames voor directe Go.");
  if (!includesAny(text, ["data", "crm", "systeem", "website", "analytics", "mail"])) risks.push("Databronnen of systemen zijn nog niet scherp genoeg.");
  if (!includesAny(text, ["privacy", "avg", "buiten scope", "toestemming"])) risks.push("Privacygrenzen moeten expliciet worden gemaakt voordat AI acties uitvoert.");
  if ((input.account.aiowRevenueSharePercent || 0) > 0) risks.push("Revenue share vraagt extra commerciële en juridische check voor signing.");
  if (!risks.length) risks.push("Geen harde blocker gevonden, maar scope en livegang blijven Team Richard beslissingen.");
  return risks.slice(0, 5);
}

function buildFirstSprint(input: SpunkyReviewAdviceInput, text: string, verdict: SpunkyReviewVerdict): string {
  if (verdict === "NO_GO") return "Geen sprint starten. Eerst klantvraag, budget en owner bewijzen.";
  if (includesAny(text, ["lead", "sales", "crm", "offerte", "opvolg", "gesprekken"])) return "AI lead intake proof sprint: intake, scoring, persoonlijke opvolging en 30 dagen KPI.";
  if (includesAny(text, ["workflow", "planning", "administratie", "support", "proces"])) return "AI workflow proof sprint: één proces versimpelen, handwerk meten en human approval houden.";
  if (includesAny(text, ["startup", "idee", "app", "platform", "venture"])) return "Venture validation sprint: doelgroep, bewijs, MVP-scope en AI-moat aanscherpen.";
  return "AIOW scope scan: kans, risico, data en eerste proof sprint concreet maken.";
}

function buildSummary(input: SpunkyReviewAdviceInput, verdict: SpunkyReviewVerdict, score: number): string {
  return `Spunky ziet ${input.account.companyName || input.account.projectName} als ${verdict} met readiness ${score}/100. De case is vooral waardevol als AIOW het eerste bewijs klein houdt en missing info gericht ophaalt.`;
}

function buildWhy(input: SpunkyReviewAdviceInput, verdict: SpunkyReviewVerdict, evidence: number, aiValue: number, completeness: number): string[] {
  return [
    `Bewijsscore: ${evidence}/100.`,
    `AI automation value: ${aiValue}/100.`,
    `Workspace completeness: ${completeness}/100.`,
    `Aanbevolen verdict: ${verdict}.`,
  ];
}

function buildEmailDraft(input: SpunkyReviewAdviceInput, verdict: SpunkyReviewVerdict, missing: string[], sprint: string): { subject: string; body: string } {
  const name = input.account.contactName || "daar";
  const missingLine = missing.length ? `Spunky mist vooral: ${missing.slice(0, 3).join(", ")}.` : "Spunky ziet genoeg basis om Team Richard gericht te laten reviewen.";
  return {
    subject: `Spunky review voor ${input.account.projectName || input.account.companyName}`,
    body: `Hey ${name},\n\nSpunky heeft je AIOW intake bekeken. Mijn voorlopige advies is: ${verdict}.\n\n${missingLine}\n\nLogische eerste stap: ${sprint}\n\nAls je deze punten aanvult, kan Team Richard sneller bepalen of dit een proof sprint, aangepaste scope of no-go wordt.\n\nGroet,\nAIOW`,
  };
}

function buildAdminActions(verdict: SpunkyReviewVerdict, missing: string[], risks: string[]): string[] {
  if (verdict === "GO") return ["Controleer scope en privacygrenzen.", "Bereid proof sprint voorstel voor.", "Laat contract pas volgen na expliciet akkoord."];
  if (verdict === "CONDITIONAL_GO") return ["Zet de beste Spunky vervolgvraag klaar.", "Vraag missing proof uit voordat contractfase start.", "Maak conditional proof sprint route."];
  if (verdict === "ADJUST_DEAL") return ["Versmal de scope.", "Vraag bewijs, budget en owner uit.", "Laat Spunky follow-up mail klaarzetten."];
  return ["Geen sprint starten.", "Vraag eerst harde vraag/budget/owner uit.", "Archiveer of zet nurture follow-up klaar."];
}

function riskLevelPreview(text: string, riskPenalty: number): "low" | "medium" | "high" {
  return riskPenalty >= 28 || includesAny(text, ["geen budget", "privacy", "gevoelig", "juridisch", "onduidelijk", "geen toegang"]) ? "high" : riskPenalty >= 14 ? "medium" : "low";
}

function analysisStrings(analysis: unknown, key: string): string[] {
  if (!analysis || typeof analysis !== "object") return [];
  const value = (analysis as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}
