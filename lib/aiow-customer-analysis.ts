export type AiowScoringPipelineStep =
  | "intake-normalisatie"
  | "founder-check"
  | "commitment"
  | "uniciteit"
  | "concurrentie"
  | "markt"
  | "revenue-model"
  | "ai-hefboom"
  | "bouwbaarheid"
  | "dealkwaliteit"
  | "red-team"
  | "weging-review";

export type AiowExternalSourceType = "web" | "kvk" | "linkedin" | "customer_document" | "other";

export type AiowExternalSource = {
  type: AiowExternalSourceType;
  title: string;
  url?: string;
  note?: string;
  supportsSteps?: AiowScoringPipelineStep[];
};

export type AiowCustomerAnalysisInput = {
  industry?: string;
  ideaSummary?: string;
  founderExperience?: string;
  industryContacts?: string;
  existingAudience?: string;
  proofOfDemand?: string;
  customerSegments?: string;
  acquisitionChannels?: string;
  coreOffer?: string;
  currentMonthlyRevenue?: string;
  targetMonthlyRevenue?: string;
  averageOrderValue?: string;
  monthlyCustomerVolume?: string;
  keyProcesses?: string;
  systemsStack?: string;
  dataSources?: string;
  painPoints?: string;
  successMetrics?: string;
  competitorNotes?: string;
  resalePotential?: string;
  moduleRevenueNotes?: string;
  executionCapacity?: string;
  budgetRange?: string;
  risks?: string;
  aiowBuildScope?: string;
  externalSources?: AiowExternalSource[];
};

export type AiowCustomerScorecard = {
  founderScore: number;
  marketScore: number;
  executionScore: number;
  aiOpportunityScore: number;
  investmentScore: number;
};

export type AiowScoringPipelineEventStatus = "queued" | "running" | "blocked" | "done" | "review";

export type AiowScoringPipelineEvent = {
  step: AiowScoringPipelineStep;
  order: number;
  customerLabel: string;
  status: AiowScoringPipelineEventStatus;
  score?: number;
  requiresExternalSource: boolean;
  externalSources: AiowExternalSource[];
  internalNote: string;
};

export type AiowCustomerAnalysis = {
  successProbabilityScore: number;
  uniquenessScore: number;
  ventureFitScore: number;
  scorecard: AiowCustomerScorecard;
  verdict: "NO_GO" | "CONDITIONAL_GO" | "GO" | "STRATEGIC_GO";
  recommendedRevenueSharePercent: number;
  recommendedResaleSharePercent: number;
  recommendedModuleTerms: string;
  dealRationale: string[];
  strengths: string[];
  gaps: string[];
  requiredCustomerProof: string[];
  firstSprintRecommendation: string;
  researchState: "INTAKE_ONLY_UNIQUENESS_ESTIMATE" | "RESEARCH_REQUIRED";
  scoringPipelineEvents: AiowScoringPipelineEvent[];
};

type Signal = { key: keyof AiowCustomerAnalysisInput; label: string; weight: number };
type WeightedSignal = { key: keyof AiowCustomerAnalysisInput; weight: number };

const SUCCESS_SIGNALS: Signal[] = [
  { key: "founderExperience", label: "branche-/founderervaring", weight: 12 },
  { key: "industryContacts", label: "warme branchecontacten", weight: 12 },
  { key: "existingAudience", label: "bestaande klanten/audience/distributie", weight: 10 },
  { key: "proofOfDemand", label: "bewijs van vraag/betalingsbereidheid", weight: 14 },
  { key: "painPoints", label: "concreet pijnlijk probleem", weight: 9 },
  { key: "currentMonthlyRevenue", label: "huidige omzetbasis", weight: 8 },
  { key: "acquisitionChannels", label: "acquisitiekanalen", weight: 8 },
  { key: "executionCapacity", label: "uitvoeringscapaciteit klant", weight: 9 },
  { key: "dataSources", label: "beschikbare data/kennis", weight: 8 },
  { key: "budgetRange", label: "budget/cashflow", weight: 5 },
  { key: "successMetrics", label: "meetbare succescriteria", weight: 5 },
];

const UNIQUENESS_SIGNALS: Signal[] = [
  { key: "ideaSummary", label: "helder idee/plan", weight: 12 },
  { key: "industryContacts", label: "unieke toegang tot branche", weight: 12 },
  { key: "dataSources", label: "unieke data/kennis", weight: 12 },
  { key: "competitorNotes", label: "concurrentiebeeld", weight: 10 },
  { key: "coreOffer", label: "onderscheidende waardepropositie", weight: 12 },
  { key: "resalePotential", label: "doorverkoop/white-label potentie", weight: 10 },
  { key: "moduleRevenueNotes", label: "module/upsell potentie", weight: 10 },
  { key: "aiowBuildScope", label: "AIOW kan technische/AI moat bouwen", weight: 12 },
  { key: "customerSegments", label: "specifieke niche/doelgroep", weight: 10 },
];

export function analyzeAiowCustomer(input: AiowCustomerAnalysisInput): AiowCustomerAnalysis {
  const success = scoreSignals(input, SUCCESS_SIGNALS);
  const uniqueness = scoreSignals(input, UNIQUENESS_SIGNALS);
  const scorecard = buildScorecard(input);
  const ventureFitScore = Math.round(
    scorecard.founderScore * 0.18 +
      scorecard.marketScore * 0.2 +
      scorecard.executionScore * 0.2 +
      scorecard.aiOpportunityScore * 0.22 +
      scorecard.investmentScore * 0.2,
  );
  const verdict = ventureFitScore >= 82 ? "STRATEGIC_GO" : ventureFitScore >= 68 ? "GO" : ventureFitScore >= 48 ? "CONDITIONAL_GO" : "NO_GO";
  const recommendedRevenueSharePercent = recommendRevenueShare(ventureFitScore, uniqueness.score, input);
  const recommendedResaleSharePercent = recommendResaleShare(ventureFitScore, input);
  const externalSources = normalizeExternalSources(input);
  const researchState = hasSourceForStep(externalSources, "uniciteit") && hasSourceForStep(externalSources, "revenue-model")
    ? "INTAKE_ONLY_UNIQUENESS_ESTIMATE"
    : "RESEARCH_REQUIRED";

  return {
    successProbabilityScore: success.score,
    uniquenessScore: uniqueness.score,
    ventureFitScore,
    scorecard,
    verdict,
    recommendedRevenueSharePercent,
    recommendedResaleSharePercent,
    recommendedModuleTerms: recommendModuleTerms(input),
    dealRationale: buildDealRationale(verdict, recommendedRevenueSharePercent, recommendedResaleSharePercent, input),
    strengths: [...success.present, ...uniqueness.present].slice(0, 10),
    gaps: [...success.missing, ...uniqueness.missing].slice(0, 12),
    requiredCustomerProof: requiredProof(input, verdict),
    firstSprintRecommendation: firstSprint(verdict),
    researchState,
    scoringPipelineEvents: buildScoringPipelineEvents(input, scorecard, uniqueness.score, ventureFitScore, externalSources),
  };
}

function buildScorecard(input: AiowCustomerAnalysisInput): AiowCustomerScorecard {
  return {
    founderScore: averageFields(input, [
      { key: "founderExperience", weight: 34 },
      { key: "industryContacts", weight: 28 },
      { key: "executionCapacity", weight: 24 },
      { key: "existingAudience", weight: 14 },
    ]),
    marketScore: averageFields(input, [
      { key: "proofOfDemand", weight: 34 },
      { key: "customerSegments", weight: 20 },
      { key: "painPoints", weight: 20 },
      { key: "currentMonthlyRevenue", weight: 14 },
      { key: "targetMonthlyRevenue", weight: 12 },
    ]),
    executionScore: averageFields(input, [
      { key: "keyProcesses", weight: 22 },
      { key: "systemsStack", weight: 18 },
      { key: "dataSources", weight: 20 },
      { key: "successMetrics", weight: 18 },
      { key: "budgetRange", weight: 12 },
      { key: "executionCapacity", weight: 10 },
    ]),
    aiOpportunityScore: averageFields(input, [
      { key: "painPoints", weight: 22 },
      { key: "dataSources", weight: 24 },
      { key: "aiowBuildScope", weight: 24 },
      { key: "moduleRevenueNotes", weight: 16 },
      { key: "resalePotential", weight: 14 },
    ]),
    investmentScore: averageFields(input, [
      { key: "proofOfDemand", weight: 22 },
      { key: "resalePotential", weight: 18 },
      { key: "moduleRevenueNotes", weight: 16 },
      { key: "acquisitionChannels", weight: 16 },
      { key: "risks", weight: 10 },
      { key: "successMetrics", weight: 18 },
    ]),
  };
}

function buildScoringPipelineEvents(
  input: AiowCustomerAnalysisInput,
  scorecard: AiowCustomerScorecard,
  uniquenessScore: number,
  ventureFitScore: number,
  externalSources: AiowExternalSource[],
): AiowScoringPipelineEvent[] {
  const spec: Array<{
    step: AiowScoringPipelineStep;
    label: string;
    score?: number;
    requiresExternalSource?: boolean;
    doneWhen?: boolean;
    status?: AiowScoringPipelineEventStatus;
    note: string;
  }> = [
    { step: "intake-normalisatie", label: "Intake structureren", score: analysisCompleteness(input), doneWhen: true, note: "Formulierdata omgezet naar venture-analysevelden." },
    { step: "founder-check", label: "Founder-check", score: scorecard.founderScore, requiresExternalSource: true, doneWhen: meaningful(input.founderExperience), note: "Mag niet op done zonder externe web/KvK/LinkedIn/broncheck." },
    { step: "commitment", label: "Commitment", score: scorecard.executionScore, doneWhen: meaningful(input.executionCapacity), note: "Checkt owner, tempo, budget en feedbackcapaciteit." },
    { step: "uniciteit", label: "Uniciteit", score: uniquenessScore, requiresExternalSource: true, doneWhen: meaningful(input.coreOffer) || meaningful(input.dataSources), note: "Mag niet op done zonder externe bron rond propositie/positionering." },
    { step: "concurrentie", label: "Concurrentie", score: uniquenessScore, requiresExternalSource: true, doneWhen: meaningful(input.competitorNotes), note: "Concurrentiebeeld vereist echt onderzoek, geen intakeclaim." },
    { step: "markt", label: "Markt", score: scorecard.marketScore, doneWhen: meaningful(input.customerSegments) || meaningful(input.proofOfDemand), note: "Doelgroep, pijn en betalingsbereidheid." },
    { step: "revenue-model", label: "Revenue-model", score: scorecard.investmentScore, requiresExternalSource: true, doneWhen: meaningful(input.currentMonthlyRevenue) || meaningful(input.targetMonthlyRevenue) || meaningful(input.moduleRevenueNotes), note: "Mag niet op done zonder externe omzet/markt/prijsbron of LinkedIn/KvK-context." },
    { step: "ai-hefboom", label: "AI-hefboom", score: scorecard.aiOpportunityScore, doneWhen: meaningful(input.aiowBuildScope) || meaningful(input.dataSources), note: "Bepaalt of AI structureel voordeel geeft." },
    { step: "bouwbaarheid", label: "Bouwbaarheid", score: scorecard.executionScore, doneWhen: meaningful(input.systemsStack) || meaningful(input.keyProcesses), note: "Technische haalbaarheid, data en integraties." },
    { step: "dealkwaliteit", label: "Dealkwaliteit", score: scorecard.investmentScore, doneWhen: meaningful(input.budgetRange) || meaningful(input.resalePotential) || meaningful(input.moduleRevenueNotes), note: "Revenue share, resale, module-waarde en risico." },
    { step: "red-team", label: "Red-team", score: Math.max(0, 100 - scorecard.investmentScore), status: "review", note: "Zoekt redenen om niet te bouwen of deal aan te passen." },
    { step: "weging-review", label: "Weging + review", score: ventureFitScore, status: "review", note: "Eindweging voor Team Richard; geen automatische live-go." },
  ];

  return spec.map((item, index) => {
    const sources = sourcesForStep(externalSources, item.step);
    const hardGateBlocked = Boolean(item.requiresExternalSource && sources.length === 0);
    const status = item.status || (hardGateBlocked ? "blocked" : item.doneWhen ? "done" : "queued");
    return {
      step: item.step,
      order: index + 1,
      customerLabel: item.label,
      status,
      score: item.score,
      requiresExternalSource: Boolean(item.requiresExternalSource),
      externalSources: sources,
      internalNote: hardGateBlocked ? `${item.note} Externe bron ontbreekt: stap blijft blocked.` : item.note,
    };
  });
}

function averageFields(input: AiowCustomerAnalysisInput, fields: WeightedSignal[]): number {
  const total = fields.reduce((sum, field) => sum + field.weight, 0);
  return Math.round((fields.filter((field) => meaningful(input[field.key])).reduce((sum, field) => sum + field.weight, 0) / total) * 100);
}

function scoreSignals(input: AiowCustomerAnalysisInput, signals: Signal[]): { score: number; present: string[]; missing: string[] } {
  const total = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const presentSignals = signals.filter((signal) => meaningful(input[signal.key]));
  const score = Math.round((presentSignals.reduce((sum, signal) => sum + signal.weight, 0) / total) * 100);
  return {
    score,
    present: presentSignals.map((signal) => signal.label),
    missing: signals.filter((signal) => !meaningful(input[signal.key])).map((signal) => signal.label),
  };
}

function meaningful(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length >= 12 : Boolean(value);
}

function normalizeExternalSources(input: AiowCustomerAnalysisInput): AiowExternalSource[] {
  const explicit = (input.externalSources || []).filter((source) => meaningful(source.title) || meaningful(source.url));
  const inferred = [input.founderExperience, input.industryContacts, input.existingAudience, input.proofOfDemand, input.competitorNotes, input.moduleRevenueNotes]
    .flatMap((value) => extractExternalSources(String(value || "")));
  const byKey = new Map<string, AiowExternalSource>();
  for (const source of [...explicit, ...inferred]) {
    const key = `${source.type}:${source.url || source.title}`.toLowerCase();
    byKey.set(key, source);
  }
  return [...byKey.values()];
}

function extractExternalSources(text: string): AiowExternalSource[] {
  const urls = [...text.matchAll(/https?:\/\/[^\s),]+/gi)].map((match) => match[0]);
  return urls.map((url) => ({
    type: url.includes("linkedin.com") ? "linkedin" : url.includes("kvk.nl") ? "kvk" : "web",
    title: url,
    url,
    supportsSteps: inferSupportedStepsFromUrl(url),
  }));
}

function inferSupportedStepsFromUrl(url: string): AiowScoringPipelineStep[] {
  const lower = url.toLowerCase();
  const steps: AiowScoringPipelineStep[] = [];
  if (lower.includes("linkedin.com") || lower.includes("kvk.nl") || lower.includes("company") || lower.includes("bedrijf")) steps.push("founder-check", "commitment");
  if (lower.includes("pricing") || lower.includes("tarief") || lower.includes("revenue") || lower.includes("omzet")) steps.push("revenue-model");
  steps.push("uniciteit", "concurrentie", "markt");
  return [...new Set(steps)];
}

function sourcesForStep(sources: AiowExternalSource[], step: AiowScoringPipelineStep): AiowExternalSource[] {
  return sources.filter((source) => !source.supportsSteps?.length || source.supportsSteps.includes(step));
}

function hasSourceForStep(sources: AiowExternalSource[], step: AiowScoringPipelineStep): boolean {
  return sourcesForStep(sources, step).length > 0;
}

function analysisCompleteness(input: AiowCustomerAnalysisInput): number {
  const keys: Array<keyof AiowCustomerAnalysisInput> = ["ideaSummary", "founderExperience", "proofOfDemand", "customerSegments", "coreOffer", "currentMonthlyRevenue", "keyProcesses", "systemsStack", "dataSources", "painPoints", "successMetrics", "aiowBuildScope"];
  return Math.round((keys.filter((key) => meaningful(input[key])).length / keys.length) * 100);
}

function recommendRevenueShare(score: number, uniqueness: number, input: AiowCustomerAnalysisInput): number {
  let percent = 10;
  if (score >= 48) percent = 15;
  if (score >= 68) percent = 20;
  if (score >= 82) percent = 25;
  if (uniqueness >= 78 && meaningful(input.aiowBuildScope)) percent += 5;
  if (meaningful(input.budgetRange) && /geen|laag|onbekend|0/i.test(input.budgetRange || "")) percent += 5;
  return Math.min(40, Math.max(10, percent));
}

function recommendResaleShare(score: number, input: AiowCustomerAnalysisInput): number {
  if (!meaningful(input.resalePotential)) return 10;
  if (score >= 82) return 25;
  if (score >= 68) return 20;
  if (score >= 48) return 15;
  return 10;
}

function recommendModuleTerms(input: AiowCustomerAnalysisInput): string {
  if (meaningful(input.moduleRevenueNotes)) {
    return "Modules met extra eindklantwaarde apart prijzen: minimaal 10% op module-omzet/doorverkoop, hoger bij AIOW-IP, automatisering of white-label inzet.";
  }
  return "Nog modulekansen inventariseren. Default: geen module live zonder AIOW-scope; minimaal 10% op module-omzet zodra module via AIOW waarde toevoegt.";
}

function buildDealRationale(verdict: AiowCustomerAnalysis["verdict"], rev: number, resale: number, input: AiowCustomerAnalysisInput): string[] {
  const out = [`Verdict ${verdict}: aanbevolen ${rev}% omzetdeel en ${resale}% doorverkoop/resell minimum.`];
  if (meaningful(input.industryContacts)) out.push("Klantclaimt branchecontacten/distributie: verhoogt slagingskans maar bewijs nodig.");
  if (meaningful(input.proofOfDemand)) out.push("Er is vraag-/betalingsbewijs: deal kan meer performance-based worden.");
  if (!meaningful(input.executionCapacity)) out.push("Uitvoeringscapaciteit ontbreekt: AIOW moet niet bouwen zonder klant-owner en ritme.");
  if (!hasSourceForStep(normalizeExternalSources(input), "uniciteit")) out.push("Uniekheid vereist extern onderzoek voordat definitieve deal/positionering wordt gekozen.");
  if (!hasSourceForStep(normalizeExternalSources(input), "revenue-model")) out.push("Revenue-model vereist externe bron of controle voordat deze stap op done mag.");
  return out;
}

function requiredProof(input: AiowCustomerAnalysisInput, verdict: AiowCustomerAnalysis["verdict"]): string[] {
  const proof = [];
  if (!meaningful(input.proofOfDemand)) proof.push("Bewijs van vraag: gesprekken, LOI's, pre-orders, bestaande omzet, of concrete klantcases.");
  if (!meaningful(input.industryContacts)) proof.push("Lijst met warme contacten/partners/beslissers en toegangsniveau.");
  if (!meaningful(input.executionCapacity)) proof.push("Wie bij de klant dagelijks/wekelijk owner is voor sales, operatie en feedback.");
  if (!meaningful(input.dataSources)) proof.push("Beschikbare data/documenten/processen die AIOW mag gebruiken voor analyse en bouw.");
  if (!hasSourceForStep(normalizeExternalSources(input), "founder-check")) proof.push("Externe founder/bedrijf-bron: LinkedIn, KvK of betrouwbare webbron.");
  if (!hasSourceForStep(normalizeExternalSources(input), "uniciteit")) proof.push("Externe concurrentie-/uniciteitsbron: websearch, marktpartij, LinkedIn of documentbewijs.");
  if (!hasSourceForStep(normalizeExternalSources(input), "revenue-model")) proof.push("Externe revenue/prijs/omzetbron of gevalideerde marktinput.");
  if (verdict === "NO_GO") proof.push("Herformuleer propositie naar één concrete doelgroep + pijnlijk probleem + betaalroute.");
  return proof.length ? proof : ["30 dagen proof sprint met echte klantfeedback, conversie-indicator en modulewaarde-test."];
}

function firstSprint(verdict: AiowCustomerAnalysis["verdict"]): string {
  if (verdict === "NO_GO") return "Geen build. Eerst propositie, doelgroep en betalingsbewijs aanscherpen.";
  if (verdict === "CONDITIONAL_GO") return "Discovery/proof sprint: interviews, concurrentiecheck, modulewaarde-map, clickable prototype of workflow-demo.";
  if (verdict === "GO") return "30 dagen build sprint: MVP-workflow, klantfeedback, modulewaarde-test, commerciële voorwaarden vastleggen.";
  return "Strategic sprint: platform/MVP + dealstructuur + resell/module playbook + governance-afspraken.";
}
