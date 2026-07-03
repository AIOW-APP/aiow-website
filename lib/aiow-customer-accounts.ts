import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { analyzeAiowCustomer, type AiowCustomerAnalysis } from "./aiow-customer-analysis";
import { aiowDurableStoreMode, supabaseInsert, supabaseSelect, supabaseUpdate } from "./aiow-durable-store";

export type AiowCustomerAccount = {
  accountId: string;
  accountCodeHash: string;
  createdAt: string;
  updatedAt: string;
  status:
    | "INTAKE_ACCOUNT_CREATED"
    | "TERMS_REQUIRED"
    | "READY_FOR_SCOPE_REVIEW"
    | "ADMIN_DECISION_GO"
    | "ADMIN_DECISION_CONDITIONAL_GO"
    | "ADMIN_DECISION_ADJUST_DEAL"
    | "ADMIN_DECISION_NO_GO"
    | "CONTRACT_DRAFTED"
    | "CONTRACT_SENT"
    | "SIGNED"
    | "SPUNKY_HANDOFF_READY"
    | "SPUNKY_PROJECT_GROUP_PREPARED"
    | "PROPOSAL_REVIEW_REQUESTED";
  companyName: string;
  legalName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectName: string;
  projectType: string;
  moduleInterests: string[];
  addOns: string[];
  aiowRevenueSharePercent: number;
  revenueShareNotes: string;
  moduleRevenueModel: string;
  analysisProfile: {
    currentMonthlyRevenue: string;
    targetMonthlyRevenue: string;
    averageOrderValue: string;
    monthlyCustomerVolume: string;
    customerSegments: string;
    acquisitionChannels: string;
    coreOffer: string;
    keyProcesses: string;
    systemsStack: string;
    dataSources: string;
    painPoints: string;
    successMetrics: string;
  };
  analysisReadinessScore: number;
  analysis: AiowCustomerAnalysis;
  onboardingId?: string;
  productionBoundary: string;
  paymentState: "PAUSED_TERMS_REQUIRED";
  customerNextSteps: string[];
  aiowNextSteps: string[];
};

export type PublicCustomerAccount = Omit<AiowCustomerAccount, "accountCodeHash">;

export type NewAiowCustomerAccountInput = {
  companyName: string;
  legalName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  projectName: string;
  projectType: string;
  moduleInterests: string[];
  addOns?: string[];
  aiowRevenueSharePercent?: number;
  revenueShareNotes?: string;
  moduleRevenueNotes?: string;
  currentMonthlyRevenue?: string;
  targetMonthlyRevenue?: string;
  averageOrderValue?: string;
  monthlyCustomerVolume?: string;
  customerSegments?: string;
  acquisitionChannels?: string;
  coreOffer?: string;
  keyProcesses?: string;
  systemsStack?: string;
  dataSources?: string;
  painPoints?: string;
  successMetrics?: string;
  industry?: string;
  ideaSummary?: string;
  founderExperience?: string;
  industryContacts?: string;
  existingAudience?: string;
  proofOfDemand?: string;
  resalePotential?: string;
  executionCapacity?: string;
  budgetRange?: string;
  risks?: string;
  aiowBuildScope?: string;
  onboardingId?: string;
};

const DEFAULT_BOUNDARY =
  "Customer account is intake-only until customer terms, scope, authorized signer and payment module approval are complete. No production, live payments, paid modules, provider billing or legal acceptance is activated by account creation.";

export function createAccountCode(): string {
  const left = randomBytes(3).toString("hex").toUpperCase();
  const right = randomBytes(3).toString("hex").toUpperCase();
  return `AIOW-${left}-${right}`;
}

export function hashAccountCode(accountId: string, code: string): string {
  return createHash("sha256").update(`${accountId}|${code.trim().toUpperCase()}`).digest("hex");
}

export async function createAiowCustomerAccount(input: NewAiowCustomerAccountInput): Promise<{
  account: PublicCustomerAccount;
  accessCode: string;
  storagePath: string;
}> {
  const createdAt = new Date().toISOString();
  const accountId = `aiow_acct_${createHash("sha256")
    .update(`${input.companyName}|${input.contactEmail}|${createdAt}`)
    .digest("hex")
    .slice(0, 14)}`;
  const accessCode = createAccountCode();
  const analysis = analyzeAiowCustomer({
    industry: input.industry || input.projectType,
    ideaSummary: input.ideaSummary || input.projectName,
    founderExperience: input.founderExperience,
    industryContacts: input.industryContacts,
    existingAudience: input.existingAudience,
    proofOfDemand: input.proofOfDemand,
    customerSegments: input.customerSegments,
    acquisitionChannels: input.acquisitionChannels,
    coreOffer: input.coreOffer,
    currentMonthlyRevenue: input.currentMonthlyRevenue,
    targetMonthlyRevenue: input.targetMonthlyRevenue,
    averageOrderValue: input.averageOrderValue,
    monthlyCustomerVolume: input.monthlyCustomerVolume,
    keyProcesses: input.keyProcesses,
    systemsStack: input.systemsStack,
    dataSources: input.dataSources,
    painPoints: input.painPoints,
    successMetrics: input.successMetrics,
    competitorNotes: undefined,
    resalePotential: input.resalePotential,
    moduleRevenueNotes: input.moduleRevenueNotes,
    executionCapacity: input.executionCapacity,
    budgetRange: input.budgetRange,
    risks: input.risks,
    aiowBuildScope: input.aiowBuildScope || input.moduleRevenueNotes,
  });
  const account: AiowCustomerAccount = {
    accountId,
    accountCodeHash: hashAccountCode(accountId, accessCode),
    createdAt,
    updatedAt: createdAt,
    status: "INTAKE_ACCOUNT_CREATED",
    companyName: input.companyName,
    legalName: input.legalName,
    contactName: input.contactName,
    contactEmail: input.contactEmail.toLowerCase(),
    contactPhone: input.contactPhone || "",
    projectName: input.projectName,
    projectType: input.projectType,
    moduleInterests: input.moduleInterests,
    addOns: input.addOns || [],
    aiowRevenueSharePercent: normalizeRevenueShare(input.aiowRevenueSharePercent),
    revenueShareNotes: input.revenueShareNotes || "",
    moduleRevenueModel:
      input.moduleRevenueNotes ||
      "Modules die via AIOW worden ingezet en extra waarde creëren voor klanten van de klant vallen onder AIOW-moduleverdiensten en scope/voorwaarden-review.",
    analysisProfile: {
      currentMonthlyRevenue: input.currentMonthlyRevenue || "",
      targetMonthlyRevenue: input.targetMonthlyRevenue || "",
      averageOrderValue: input.averageOrderValue || "",
      monthlyCustomerVolume: input.monthlyCustomerVolume || "",
      customerSegments: input.customerSegments || "",
      acquisitionChannels: input.acquisitionChannels || "",
      coreOffer: input.coreOffer || "",
      keyProcesses: input.keyProcesses || "",
      systemsStack: input.systemsStack || "",
      dataSources: input.dataSources || "",
      painPoints: input.painPoints || "",
      successMetrics: input.successMetrics || "",
    },
    analysisReadinessScore: analysisReadinessScore(input),
    analysis,
    onboardingId: input.onboardingId,
    productionBoundary: DEFAULT_BOUNDARY,
    paymentState: "PAUSED_TERMS_REQUIRED",
    customerNextSteps: [
      "Controleer bedrijfs- en projectgegevens in het klantportaal.",
      "Lever ontbrekende scope, databronnen en beslissers aan.",
      "Wacht op AIOW scope review en voorwaarden-check voordat productie of betaalde modules starten.",
    ],
    aiowNextSteps: [
      "Controleer tekenbevoegdheid en contractpartij.",
      "Koppel onboarding aan CRM/revenue/payment source.",
      "Bereid offerte/scope en klantvoorwaarden voor.",
      "Houd production/live payment/paid modules geblokkeerd tot akkoord.",
    ],
  };

  const storagePath = await appendAccountRecord(account);
  return { account: publicAccount(account), accessCode, storagePath };
}

export async function findAiowCustomerAccount(accountId: string, accessCode: string): Promise<PublicCustomerAccount | null> {
  const account = await findPrivateAiowCustomerAccount(accountId, accessCode);
  return account ? publicAccount(account) : null;
}

export async function requestAiowCustomerScopeReview(accountId: string, accessCode: string, note = ""): Promise<PublicCustomerAccount | null> {
  const account = await findPrivateAiowCustomerAccount(accountId, accessCode);
  if (!account) return null;
  const now = new Date().toISOString();
  const nextAccount: AiowCustomerAccount = {
    ...account,
    updatedAt: now,
    status: "READY_FOR_SCOPE_REVIEW",
    customerNextSteps: [
      "Je aanvraag staat klaar voor AIOW scope review.",
      "Vul alleen nog ontbrekend bewijs of concrete voorbeelden aan als je die hebt.",
      "Wacht op AIOW feedback, voorstel of extra vragen voordat productie start.",
    ],
    aiowNextSteps: [
      "Review de Deal Card, Venture Memory en private intake.",
      "Bepaal Go, Conditional Go of No Go voor scope/proof sprint.",
      "Maak voorstel of gerichte aanvullende vragen voor de klant.",
      ...(note.trim() ? [`Klantnotitie: ${note.trim().slice(0, 500)}`] : []),
    ],
  };
  await persistAccountUpdate(nextAccount);
  return publicAccount(nextAccount);
}

export type AiowAdminDecision = "GO" | "CONDITIONAL_GO" | "ADJUST_DEAL" | "NO_GO";

export async function recordAiowCustomerAdminDecision(accountId: string, decision: AiowAdminDecision, note = ""): Promise<PublicCustomerAccount | null> {
  const account = (await listAiowCustomerAccounts()).find((item) => item.accountId === accountId);
  if (!account) return null;
  const now = new Date().toISOString();
  const statusByDecision: Record<AiowAdminDecision, AiowCustomerAccount["status"]> = {
    GO: "ADMIN_DECISION_GO",
    CONDITIONAL_GO: "ADMIN_DECISION_CONDITIONAL_GO",
    ADJUST_DEAL: "ADMIN_DECISION_ADJUST_DEAL",
    NO_GO: "ADMIN_DECISION_NO_GO",
  };
  const customerNextStepsByDecision: Record<AiowAdminDecision, string[]> = {
    GO: [
      "AIOW heeft je case positief beoordeeld.",
      "Wacht op het voorstel/contract en bereid scope, beslisser en beschikbare data voor.",
      "Na akkoord kan de projectgroep met Spunky worden voorbereid.",
    ],
    CONDITIONAL_GO: [
      "AIOW ziet potentie, maar heeft nog bewijs of scherpere scope nodig.",
      "Lever de gevraagde missing info aan voordat voorstel of sprint definitief wordt.",
      "Productie blijft geblokkeerd tot voorwaarden en bewijs kloppen.",
    ],
    ADJUST_DEAL: [
      "AIOW wil de dealstructuur of scope aanpassen voordat we doorgaan.",
      "Wacht op een aangepast voorstel of aanvullende vragen vanuit Team Richard.",
      "Revenue share, resale of participatie wordt pas actief na duidelijke voorwaarden.",
    ],
    NO_GO: [
      "AIOW gaat deze case nu niet als venture/build traject oppakken.",
      "Je ontvangt indien passend een korte uitleg of alternatieve route.",
      "Er start geen productie, contract of projectgroep zonder nieuw akkoord.",
    ],
  };
  const aiowNextStepsByDecision: Record<AiowAdminDecision, string[]> = {
    GO: [
      "Genereer voorstel/contract op basis van Venture Memory en Deal Card.",
      "Maak Spunky briefing klaar voor klantprojectgroep na signing.",
      "Definieer eerste paid proof sprint met KPI en owner.",
    ],
    CONDITIONAL_GO: [
      "Stuur gerichte aanvullende vragen of bewijsverzoek.",
      "Update Deal Card na klantreactie en herbeoordeel scope.",
      "Houd contract/propositie conceptueel tot missing info is opgelost.",
    ],
    ADJUST_DEAL: [
      "Pas commercial terms, scope of AIOW-control aan.",
      "Leg aangepaste dealvoorwaarden vast voordat contract wordt gemaakt.",
      "Bereid klantmail met aangepaste route voor.",
    ],
    NO_GO: [
      "Stuur nette afwijzing of lichte doorverwijzing zonder build-belofte.",
      "Archiveer Venture Memory als no-go tenzij klant later met nieuw bewijs komt.",
      "Geen Spunky projectgroep en geen contract genereren.",
    ],
  };
  const nextAccount: AiowCustomerAccount = {
    ...account,
    updatedAt: now,
    status: statusByDecision[decision],
    customerNextSteps: customerNextStepsByDecision[decision],
    aiowNextSteps: [
      ...aiowNextStepsByDecision[decision],
      ...(note.trim() ? [`Admin besluitnotitie: ${note.trim().slice(0, 500)}`] : []),
    ],
  };
  await persistAccountUpdate(nextAccount);
  return publicAccount(nextAccount);
}


export async function markAiowCustomerContractDrafted(accountId: string, contractId: string, signUrl: string): Promise<PublicCustomerAccount | null> {
  return updateAiowCustomerLifecycle(accountId, {
    status: "CONTRACT_DRAFTED",
    customerNextSteps: [
      "AIOW heeft een voorstel/contract voorbereid.",
      "Controleer de sign-link zodra Team Richard die deelt.",
      "Onderteken pas als scope, commerciële basis en voorwaarden duidelijk zijn.",
    ],
    aiowNextSteps: [
      `Contract draft klaar: ${contractId}`,
      `Sign-link klaar: ${signUrl}`,
      "Deel contract pas nadat besluit, scope en commerciële basis kloppen.",
    ],
  });
}

export async function markAiowCustomerContractSent(accountId: string, contractId: string): Promise<PublicCustomerAccount | null> {
  return updateAiowCustomerLifecycle(accountId, {
    status: "CONTRACT_SENT",
    customerNextSteps: [
      "AIOW heeft het voorstel/contract gedeeld.",
      "Controleer scope, commerciële basis, verantwoordelijkheden en voorwaarden.",
      "Na digitale ondertekening kan AIOW de projectgroep met Spunky voorbereiden.",
    ],
    aiowNextSteps: [
      `Contract verzonden: ${contractId}`,
      "Wacht op digitale ondertekening voordat projectgroep of build sprint start.",
      "Geen productie of externe klantcommunicatie zonder signing en live-go.",
    ],
  });
}

export async function markAiowCustomerContractSigned(accountId: string, contractId: string): Promise<PublicCustomerAccount | null> {
  return updateAiowCustomerLifecycle(accountId, {
    status: "SIGNED",
    customerNextSteps: [
      "Je AIOW akkoord is ondertekend.",
      "AIOW bereidt de projectgroep met Spunky voor.",
      "De eerste sprint start pas na praktische onboarding, scopebevestiging en teamafspraken.",
    ],
    aiowNextSteps: [
      `Contract ondertekend: ${contractId}`,
      "Maak Spunky projectgroep/handoff task aan.",
      "Bereid kickoff, data-toegang, eerste KPI en build sprint backlog voor.",
    ],
  });
}

export async function markAiowCustomerSpunkyHandoffReady(accountId: string, contractId: string): Promise<PublicCustomerAccount | null> {
  return updateAiowCustomerLifecycle(accountId, {
    status: "SPUNKY_HANDOFF_READY",
    customerNextSteps: [
      "AIOW heeft de Spunky projectgroep/handoff voorbereid.",
      "Deel context, vragen en bestanden alleen via de afgesproken private projectkanalen.",
      "Spunky verzamelt context, maar wijzigt geen deal, scope of contract zelfstandig.",
    ],
    aiowNextSteps: [
      `Spunky handoff klaar na contract: ${contractId}`,
      "Nodig klant en interne AIOW rollen uit in het projectkanaal.",
      "Laat Spunky context ophalen en ontbrekend bewijs structureren.",
    ],
  });
}

export async function markAiowCustomerSpunkyProjectGroupPrepared(accountId: string, groupName: string): Promise<PublicCustomerAccount | null> {
  return updateAiowCustomerLifecycle(accountId, {
    status: "SPUNKY_PROJECT_GROUP_PREPARED",
    customerNextSteps: [
      "AIOW heeft de Spunky projectgroep voorbereid.",
      "Je ontvangt de private projectruimte zodra Team Richard de groep deelt.",
      "Spunky helpt met context en vragen, Team Richard bewaakt scope, planning en livegang.",
    ],
    aiowNextSteps: [
      `Projectgroep voorbereid: ${groupName}`,
      "Deel klantintro in Telegram projectgroep.",
      "Plaats interne Spunky briefing in Team Richard contextkanaal.",
      "Start pas build sprint na scopebevestiging en live-go.",
    ],
  });
}

async function updateAiowCustomerLifecycle(accountId: string, patch: Pick<AiowCustomerAccount, "status" | "customerNextSteps" | "aiowNextSteps">): Promise<PublicCustomerAccount | null> {
  const account = (await listAiowCustomerAccounts()).find((item) => item.accountId === accountId);
  if (!account) return null;
  const nextAccount: AiowCustomerAccount = {
    ...account,
    updatedAt: new Date().toISOString(),
    status: patch.status,
    customerNextSteps: patch.customerNextSteps,
    aiowNextSteps: patch.aiowNextSteps,
  };
  await persistAccountUpdate(nextAccount);
  return publicAccount(nextAccount);
}

async function persistAccountUpdate(account: AiowCustomerAccount): Promise<void> {
  if (aiowDurableStoreMode() === "supabase") {
    try {
      await supabaseUpdate("aiow_customer_accounts", `account_id=eq.${encodeURIComponent(account.accountId)}`, toSupabaseCustomerAccount(account));
      return;
    } catch (error) {
      console.warn("[aiow-customer-accounts] Supabase update failed, falling back to append", error);
    }
  }
  await appendAccountRecord(account);
}

async function findPrivateAiowCustomerAccount(accountId: string, accessCode: string): Promise<AiowCustomerAccount | null> {
  const account = (await listAiowCustomerAccounts()).find((item) => item.accountId === accountId);
  if (!account) return null;
  const provided = Buffer.from(hashAccountCode(accountId, accessCode), "hex");
  const expected = Buffer.from(account.accountCodeHash, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return account;
}

export async function listPublicAiowCustomerAccounts(): Promise<PublicCustomerAccount[]> {
  return (await listAiowCustomerAccounts()).map(publicAccount);
}

export async function getPublicAiowCustomerAccountById(accountId: string): Promise<PublicCustomerAccount | null> {
  const account = (await listAiowCustomerAccounts()).find((item) => item.accountId === accountId);
  return account ? publicAccount(account) : null;
}

async function appendAccountRecord(account: AiowCustomerAccount): Promise<string> {
  if (aiowDurableStoreMode() === "supabase") {
    try {
      await supabaseInsert("aiow_customer_accounts", toSupabaseCustomerAccount(account));
      return "supabase:aiow_customer_accounts";
    } catch (error) {
      console.warn("[aiow-customer-accounts] Supabase unavailable, falling back to JSONL", error);
    }
  }

  const filePath = accountStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(account)}\n`, "utf8");
  return filePath;
}

async function listAiowCustomerAccounts(): Promise<AiowCustomerAccount[]> {
  if (aiowDurableStoreMode() === "supabase") {
    try {
      const rows = await supabaseSelect<SupabaseCustomerAccountRow>(
        "aiow_customer_accounts",
        "select=payload&order=created_at.desc&limit=250",
      );
      if (rows) return dedupeLatestAccounts(rows.map((row) => row.payload).filter(Boolean));
    } catch (error) {
      console.warn("[aiow-customer-accounts] Supabase list failed, falling back to JSONL", error);
    }
  }

  const filePath = accountStorePath();
  try {
    const raw = await readFile(filePath, "utf8");
    const latest = new Map<string, AiowCustomerAccount>();
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line) as AiowCustomerAccount;
      latest.set(parsed.accountId, parsed);
    }
    return dedupeLatestAccounts([...latest.values()]);
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function dedupeLatestAccounts(accounts: AiowCustomerAccount[]): AiowCustomerAccount[] {
  const latest = new Map<string, AiowCustomerAccount>();
  for (const account of accounts) {
    const current = latest.get(account.accountId);
    if (!current || account.updatedAt.localeCompare(current.updatedAt) > 0) latest.set(account.accountId, account);
  }
  return [...latest.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

type SupabaseCustomerAccountRow = {
  payload: AiowCustomerAccount;
};

function toSupabaseCustomerAccount(account: AiowCustomerAccount): Record<string, unknown> {
  return {
    account_id: account.accountId,
    account_code_hash: account.accountCodeHash,
    created_at: account.createdAt,
    updated_at: account.updatedAt,
    status: account.status,
    company_name: account.companyName,
    legal_name: account.legalName,
    contact_name: account.contactName,
    contact_email: account.contactEmail,
    project_name: account.projectName,
    project_type: account.projectType,
    analysis_readiness_score: account.analysisReadinessScore,
    payment_state: account.paymentState,
    payload: account,
  };
}

function accountStorePath(): string {
  return process.env.AIOW_CUSTOMER_ACCOUNT_STORE || path.join(os.tmpdir(), "aiow-customer-onboarding", "customer-accounts.jsonl");
}

function normalizeRevenueShare(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(80, Math.max(10, Math.round(Number(value) * 10) / 10));
}

function analysisReadinessScore(input: NewAiowCustomerAccountInput): number {
  const fields = [
    input.currentMonthlyRevenue,
    input.targetMonthlyRevenue,
    input.averageOrderValue,
    input.monthlyCustomerVolume,
    input.customerSegments,
    input.acquisitionChannels,
    input.coreOffer,
    input.keyProcesses,
    input.systemsStack,
    input.dataSources,
    input.painPoints,
    input.successMetrics,
  ];
  return Math.round((fields.filter((value) => Boolean(value?.trim())).length / fields.length) * 100);
}

function publicAccount(account: AiowCustomerAccount): PublicCustomerAccount {
  const { accountCodeHash: _accountCodeHash, ...rest } = account;
  return rest;
}
