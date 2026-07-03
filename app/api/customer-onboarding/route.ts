import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeAiowCustomer } from "@/lib/aiow-customer-analysis";
import { captureAiowCustomerOnboarding } from "@/lib/aiow-onboarding-capture";

type CustomerOnboardingPayload = {
  companyName?: unknown;
  legalName?: unknown;
  kvkNumber?: unknown;
  vatNumber?: unknown;
  website?: unknown;
  companyAddress?: unknown;
  billingEmail?: unknown;
  primaryContactName?: unknown;
  primaryContactEmail?: unknown;
  primaryContactPhone?: unknown;
  projectName?: unknown;
  projectType?: unknown;
  projectBrief?: unknown;
  authorizedSignerName?: unknown;
  authorizedSignerRole?: unknown;
  authorizedSignerEmail?: unknown;
  revenueSource?: unknown;
  crmSource?: unknown;
  paymentSource?: unknown;
  packagePreference?: unknown;
  aiowRevenueSharePercent?: unknown;
  revenueShareNotes?: unknown;
  moduleRevenueNotes?: unknown;
  currentMonthlyRevenue?: unknown;
  targetMonthlyRevenue?: unknown;
  averageOrderValue?: unknown;
  monthlyCustomerVolume?: unknown;
  customerSegments?: unknown;
  acquisitionChannels?: unknown;
  coreOffer?: unknown;
  keyProcesses?: unknown;
  systemsStack?: unknown;
  dataSources?: unknown;
  painPoints?: unknown;
  successMetrics?: unknown;
  competitorNotes?: unknown;
  industry?: unknown;
  ideaSummary?: unknown;
  founderExperience?: unknown;
  industryContacts?: unknown;
  existingAudience?: unknown;
  proofOfDemand?: unknown;
  resalePotential?: unknown;
  executionCapacity?: unknown;
  budgetRange?: unknown;
  risks?: unknown;
  aiowBuildScope?: unknown;
  moduleInterests?: unknown;
  addOns?: unknown;
  termsRequiredAccepted?: unknown;
  consentAccepted?: unknown;
  honeyCompanyUrl?: unknown;
  testMode?: unknown;
};

const TEXT_FIELDS = [
  "companyName",
  "legalName",
  "kvkNumber",
  "vatNumber",
  "companyAddress",
  "billingEmail",
  "primaryContactName",
  "primaryContactEmail",
  "primaryContactPhone",
  "projectName",
  "projectType",
  "projectBrief",
  "authorizedSignerName",
  "authorizedSignerRole",
  "authorizedSignerEmail",
  "revenueSource",
  "crmSource",
  "paymentSource",
  "packagePreference",
  "revenueShareNotes",
  "moduleRevenueNotes",
  "currentMonthlyRevenue",
  "targetMonthlyRevenue",
  "averageOrderValue",
  "monthlyCustomerVolume",
  "customerSegments",
  "acquisitionChannels",
  "coreOffer",
  "keyProcesses",
  "systemsStack",
  "dataSources",
  "painPoints",
  "successMetrics",
  "competitorNotes",
  "industry",
  "ideaSummary",
  "founderExperience",
  "industryContacts",
  "existingAudience",
  "proofOfDemand",
  "resalePotential",
  "executionCapacity",
  "budgetRange",
  "risks",
  "aiowBuildScope",
] as const;

const REQUIRED_FIELDS: Array<keyof CustomerOnboardingPayload> = [
  "companyName",
  "legalName",
  "billingEmail",
  "primaryContactName",
  "primaryContactEmail",
  "projectName",
  "projectType",
  "authorizedSignerName",
  "authorizedSignerRole",
  "authorizedSignerEmail",
  "revenueSource",
  "crmSource",
  "paymentSource",
];

const MAX_LENGTHS: Record<string, number> = {
  companyName: 140,
  legalName: 180,
  kvkNumber: 32,
  vatNumber: 32,
  website: 180,
  companyAddress: 320,
  billingEmail: 254,
  primaryContactName: 140,
  primaryContactEmail: 254,
  primaryContactPhone: 80,
  projectName: 140,
  projectType: 80,
  projectBrief: 2000,
  authorizedSignerName: 140,
  authorizedSignerRole: 120,
  authorizedSignerEmail: 254,
  revenueSource: 160,
  crmSource: 160,
  paymentSource: 160,
  packagePreference: 120,
  revenueShareNotes: 1200,
  moduleRevenueNotes: 1200,
  currentMonthlyRevenue: 120,
  targetMonthlyRevenue: 120,
  averageOrderValue: 120,
  monthlyCustomerVolume: 120,
  customerSegments: 1200,
  acquisitionChannels: 1200,
  coreOffer: 1200,
  keyProcesses: 1800,
  systemsStack: 1800,
  dataSources: 1800,
  painPoints: 1800,
  successMetrics: 1200,
  competitorNotes: 1200,
  industry: 120,
  ideaSummary: 1600,
  founderExperience: 1600,
  industryContacts: 1600,
  existingAudience: 1200,
  proofOfDemand: 1600,
  resalePotential: 1200,
  executionCapacity: 1200,
  budgetRange: 240,
  risks: 1600,
  aiowBuildScope: 1600,
};

const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxAttempts: 10 };
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many onboarding attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const payload = (await req.json()) as CustomerOnboardingPayload;

    if (typeof payload.honeyCompanyUrl === "string" && payload.honeyCompanyUrl.trim().length > 0) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    const missing = REQUIRED_FIELDS.filter((field) => !asTrimmed(payload[field]));
    if (payload.termsRequiredAccepted !== true) missing.push("termsRequiredAccepted");
    if (payload.consentAccepted !== true) missing.push("consentAccepted");

    const moduleInterests = normalizeList(payload.moduleInterests, 20, 80);
    if (moduleInterests.length === 0) missing.push("moduleInterests");

    if (missing.length > 0) {
      return NextResponse.json({ error: "Incomplete onboarding", missing }, { status: 400 });
    }

    const normalized: Record<string, unknown> = {};
    for (const field of TEXT_FIELDS) {
      normalized[field] = clampText(asTrimmed(payload[field]), MAX_LENGTHS[field]);
    }
    normalized.website = normalizeOptionalUrl(payload.website);
    normalized.aiowRevenueSharePercent = normalizeRevenueShare(payload.aiowRevenueSharePercent);
    normalized.aiowRevenueShareBoundary =
      "AIOW werkt standaard met minimaal 10% omzetdeel. AIOW kan dit percentage per klant aanpassen, maar nooit onder de interne minimumafspraak zonder expliciet akkoord.";
    normalized.moduleRevenueModel =
      "Modules die via AIOW worden ingezet en extra waarde opleveren voor de klanten van de klant, vallen onder AIOW-moduleverdiensten/upsellwaarde en worden apart beoordeeld in scope en voorwaarden.";
    normalized.analysisReadiness = buildAnalysisReadiness(normalized);
    normalized.analysis = analyzeAiowCustomer({
      industry: String(normalized.industry || normalized.projectType || ""),
      ideaSummary: String(normalized.ideaSummary || normalized.projectBrief || normalized.projectName || ""),
      founderExperience: String(normalized.founderExperience || ""),
      industryContacts: String(normalized.industryContacts || ""),
      existingAudience: String(normalized.existingAudience || ""),
      proofOfDemand: String(normalized.proofOfDemand || ""),
      customerSegments: String(normalized.customerSegments || ""),
      acquisitionChannels: String(normalized.acquisitionChannels || ""),
      coreOffer: String(normalized.coreOffer || ""),
      currentMonthlyRevenue: String(normalized.currentMonthlyRevenue || ""),
      targetMonthlyRevenue: String(normalized.targetMonthlyRevenue || ""),
      averageOrderValue: String(normalized.averageOrderValue || ""),
      monthlyCustomerVolume: String(normalized.monthlyCustomerVolume || ""),
      keyProcesses: String(normalized.keyProcesses || ""),
      systemsStack: String(normalized.systemsStack || ""),
      dataSources: String(normalized.dataSources || ""),
      painPoints: String(normalized.painPoints || ""),
      successMetrics: String(normalized.successMetrics || ""),
      competitorNotes: String(normalized.competitorNotes || ""),
      resalePotential: String(normalized.resalePotential || ""),
      moduleRevenueNotes: String(normalized.moduleRevenueNotes || ""),
      executionCapacity: String(normalized.executionCapacity || ""),
      budgetRange: String(normalized.budgetRange || ""),
      risks: String(normalized.risks || ""),
      aiowBuildScope: String(normalized.aiowBuildScope || ""),
    });
    normalized.moduleInterests = moduleInterests;
    normalized.addOns = normalizeList(payload.addOns, 20, 80);
    normalized.termsRequiredAccepted = true;
    normalized.consentAccepted = true;
    normalized.submittedAt = new Date().toISOString();
    normalized.productionBoundary =
      "Customer terms are required before production/live payments/paid modules. This onboarding request does not activate production systems, live payments, paid modules, provider billing, or legal acceptance by itself.";
    normalized.paymentState = "PAUSED_TERMS_REQUIRED";
    normalized.contractState = "CUSTOMER_TERMS_REQUIRED_BEFORE_PRODUCTION";
    normalized.source = "aiow.ai/nl/aanmelden";

    const onboardingId = `aiow_onb_${createHash("sha256")
      .update(`${normalized.companyName}|${normalized.primaryContactEmail}|${normalized.submittedAt}`)
      .digest("hex")
      .slice(0, 16)}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      const localCapture = await captureAiowCustomerOnboarding(onboardingId, normalized, "LOCAL_CAPTURED");
      console.warn("[customer-onboarding] Missing RESEND_API_KEY; stored local capture", {
        onboardingId,
        path: localCapture.path,
      });
      return NextResponse.json({
        ok: true,
        onboardingId,
        deliveryState: "LOCAL_CAPTURED",
        paymentState: "PAUSED_TERMS_REQUIRED",
        message: "Onboarding ontvangen. AIOW neemt contact op; productie/live betalingen/betaalde modules blijven geblokkeerd tot klantvoorwaarden zijn afgerond.",
      });
    }

    const testMode = payload.testMode === true;
    const subjectPrefix = testMode ? "[TEST AIOW klant-onboarding]" : "[AIOW klant-onboarding]";
    const teamPayload = {
      from: "AIOW Onboarding <onboarding@send.aiow.ai>",
      to: ["hello@aiow.ai"],
      reply_to: String(normalized.primaryContactEmail),
      subject: `${subjectPrefix} ${onboardingId} · ${normalized.companyName}`,
      html: renderTeamEmail(onboardingId, normalized),
    };

    const userPayload = {
      from: "AIOW <hello@send.aiow.ai>",
      to: [String(normalized.primaryContactEmail), String(normalized.billingEmail)].filter(uniqueEmail),
      reply_to: "hello@aiow.ai",
      subject: testMode ? `[TEST] AIOW onboarding ontvangen: ${onboardingId}` : `AIOW onboarding ontvangen: ${onboardingId}`,
      html: renderUserEmail(onboardingId, normalized),
    };

    const [teamRes, userRes] = await Promise.all([sendResend(apiKey, teamPayload), sendResend(apiKey, userPayload)]);

    if (!teamRes.ok || !userRes.ok) {
      const teamText = teamRes.ok ? "ok" : await teamRes.text();
      const userText = userRes.ok ? "ok" : await userRes.text();
      console.error("[customer-onboarding] Resend failed", {
        onboardingId,
        teamStatus: teamRes.status,
        userStatus: userRes.status,
        teamText: redact(teamText),
        userText: redact(userText),
      });
      await captureAiowCustomerOnboarding(onboardingId, normalized, "LOCAL_CAPTURED");
      return NextResponse.json({
        ok: true,
        onboardingId,
        deliveryState: "LOCAL_CAPTURED",
        warning: "Onboarding email failed; local capture stored instead.",
        paymentState: "PAUSED_TERMS_REQUIRED",
        message: "Onboarding lokaal vastgelegd. Productie/live betalingen/betaalde modules blijven geblokkeerd tot klantvoorwaarden zijn afgerond.",
      });
    }

    await captureAiowCustomerOnboarding(onboardingId, normalized, "EMAIL_AND_LOCAL_CAPTURED");

    return NextResponse.json({
      ok: true,
      onboardingId,
      deliveryState: "EMAIL_AND_LOCAL_CAPTURED",
      paymentState: "PAUSED_TERMS_REQUIRED",
      message: "Onboarding ontvangen. AIOW neemt contact op; productie/live betalingen/betaalde modules blijven geblokkeerd tot klantvoorwaarden zijn afgerond.",
    });
  } catch (error) {
    console.error("[customer-onboarding] Error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => clampText(item.trim(), maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeRevenueShare(value: unknown): number {
  const parsed = Number.parseFloat(asTrimmed(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(80, Math.max(10, Math.round(parsed * 10) / 10));
}

function buildAnalysisReadiness(normalized: Record<string, unknown>): { score: number; missing: string[]; collected: string[] } {
  const fields: Array<[string, string]> = [
    ["coreOffer", "aanbod/waardepropositie"],
    ["customerSegments", "klantsegmenten"],
    ["acquisitionChannels", "acquisitiekanalen"],
    ["currentMonthlyRevenue", "huidige omzet"],
    ["targetMonthlyRevenue", "doelomzet"],
    ["averageOrderValue", "gemiddelde orderwaarde"],
    ["monthlyCustomerVolume", "klantvolume"],
    ["keyProcesses", "kernprocessen"],
    ["systemsStack", "systemen/tools"],
    ["dataSources", "databronnen"],
    ["painPoints", "knelpunten"],
    ["successMetrics", "succesmetrics"],
  ];
  const collected = fields.filter(([key]) => Boolean(String(normalized[key] || "").trim())).map(([, label]) => label);
  const missing = fields.filter(([key]) => !String(normalized[key] || "").trim()).map(([, label]) => label);
  return { score: Math.round((collected.length / fields.length) * 100), collected, missing };
}

function normalizeOptionalUrl(value: unknown): string {
  const raw = asTrimmed(value);
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return clampText(url.toString(), MAX_LENGTHS.website);
  } catch {
    return clampText(raw, MAX_LENGTHS.website);
  }
}

function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { ok: true };
  }
  if (current.count >= RATE_LIMIT.maxAttempts) {
    return { ok: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { ok: true };
}

function rateLimitKey(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "local";
}

function uniqueEmail(value: string, index: number, values: string[]): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && values.indexOf(value) === index;
}

function renderTeamEmail(onboardingId: string, normalized: Record<string, unknown>): string {
  return renderShell(`
    <p style="color:#00F0FF; letter-spacing:.14em; text-transform:uppercase; font-size:12px; margin:0 0 18px;">Nieuwe klant-onboarding</p>
    <h1 style="font-size:30px; line-height:1.05; margin:0 0 24px;">${escapeHtml(String(normalized.companyName))}</h1>
    ${renderRows([
      ["Onboarding ID", onboardingId],
      ["Juridische naam", normalized.legalName],
      ["KvK", normalized.kvkNumber || "n.v.t."],
      ["BTW", normalized.vatNumber || "n.v.t."],
      ["Website", normalized.website || "n.v.t."],
      ["Factuurmail", normalized.billingEmail],
      ["Contact", `${normalized.primaryContactName} · ${normalized.primaryContactEmail} · ${normalized.primaryContactPhone || "n.v.t."}`],
      ["Project", `${normalized.projectName} · ${normalized.projectType}`],
      ["Bevoegd tekenaar", `${normalized.authorizedSignerName} · ${normalized.authorizedSignerRole} · ${normalized.authorizedSignerEmail}`],
      ["Revenue / CRM / Payment", `${normalized.revenueSource} / ${normalized.crmSource} / ${normalized.paymentSource}`],
      ["AIOW omzetdeel", `${normalized.aiowRevenueSharePercent}% minimum/klantspecifiek`],
      ["Module verdienmodel", normalized.moduleRevenueModel],
      ["Analyse readiness", `${(normalized.analysisReadiness as any)?.score ?? 0}%`],
      ["Pakketvoorkeur", normalized.packagePreference || "Te bepalen"],
      ["Modules", listToText(normalized.moduleInterests)],
      ["Add-ons", listToText(normalized.addOns) || "n.v.t."],
      ["Boundary", normalized.productionBoundary],
    ])}
    ${normalized.projectBrief ? `<div style="margin-top:22px; padding:16px; background:#111114; border:1px solid rgba(255,255,255,.08); border-radius:12px;"><p style="margin:0 0 8px; color:#8A8A94; text-transform:uppercase; letter-spacing:.12em; font-size:11px;">Projectbrief</p><p style="margin:0; color:#F8F8FA; line-height:1.6;">${escapeHtml(String(normalized.projectBrief)).replace(/\n/g, "<br>")}</p></div>` : ""}
  `);
}

function renderUserEmail(onboardingId: string, normalized: Record<string, unknown>): string {
  return renderShell(`
    <p style="color:#00F0FF; letter-spacing:.14em; text-transform:uppercase; font-size:12px; margin:0 0 18px;">AIOW onboarding</p>
    <h1 style="font-size:30px; line-height:1.05; margin:0 0 20px;">Ontvangen: ${escapeHtml(String(normalized.companyName))}</h1>
    <p style="color:#D1D1D8; line-height:1.65; margin:0 0 18px;">We hebben je online klantaanvraag ontvangen onder referentie <strong style="color:#F8F8FA">${escapeHtml(onboardingId)}</strong>. AIOW controleert de scope, tekenbevoegdheid en commerciële inrichting voordat iets live gaat.</p>
    <div style="padding:16px; background:#111114; border:1px solid rgba(0,240,255,.22); border-radius:12px; color:#D1D1D8; line-height:1.6;">
      <strong style="color:#00F0FF;">Belangrijke grens:</strong> klantvoorwaarden zijn vereist vóór productie, live betalingen of betaalde modules. Deze aanvraag activeert nog geen productieomgeving, provider billing of betaalde modules.
    </div>
    ${renderRows([
      ["Project", `${normalized.projectName} · ${normalized.projectType}`],
      ["Modules", listToText(normalized.moduleInterests)],
      ["AIOW commerciële basis", `${normalized.aiowRevenueSharePercent}% omzetdeel + moduleverdiensten via AIOW-scope`],
      ["Payment status", normalized.paymentState],
    ])}
    <p style="color:#8A8A94; font-size:13px; margin:24px 0 0;">Team AIOW</p>
  `);
}

function renderShell(inner: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif; max-width:720px; margin:0 auto; padding:32px; background:#0A0A0B; color:#F8F8FA; border-radius:18px;">${inner}</div>`;
}

function renderRows(rows: Array<[string, unknown]>): string {
  return `<table style="width:100%; border-collapse:collapse; color:#D1D1D8; margin-top:18px;">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="vertical-align:top; padding:8px 12px 8px 0; color:#8A8A94; font-size:12px; letter-spacing:.08em; text-transform:uppercase; width:180px;">${escapeHtml(label)}</td><td style="padding:8px 0; color:#F8F8FA; line-height:1.45;">${escapeHtml(String(value ?? ""))}</td></tr>`,
    )
    .join("")}</table>`;
}

function listToText(value: unknown): string {
  return Array.isArray(value) ? value.join(", ") : "";
}

async function sendResend(apiKey: string, payload: unknown): Promise<Response> {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
}

function redact(text: string): string {
  return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]").slice(0, 2000);
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
