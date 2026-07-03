import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { createAiowCustomerAccount, findAiowCustomerAccount, listPublicAiowCustomerAccounts, requestAiowCustomerScopeReview } from "@/lib/aiow-customer-accounts";
import { captureAiowLead } from "@/lib/aiow-lead-capture";
import { appendAiowProofEvent } from "@/lib/aiow-proof-events";

type AccountPayload = {
  companyName?: unknown;
  legalName?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  projectName?: unknown;
  projectType?: unknown;
  moduleInterests?: unknown;
  addOns?: unknown;
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
  onboardingId?: unknown;
  accountTermsAccepted?: unknown;
  emailFollowupConsent?: unknown;
  consentText?: unknown;
  consentVersion?: unknown;
  sourceRoute?: unknown;
  sourceComponent?: unknown;
  intentType?: unknown;
  intentText?: unknown;
  honeyWebsite?: unknown;
};

const REQUIRED_FIELDS: Array<keyof AccountPayload> = [
  "companyName",
  "legalName",
  "contactName",
  "contactEmail",
  "projectName",
  "projectType",
];

const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxAttempts: 12 };
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many account attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const payload = (await req.json()) as AccountPayload;
    if (typeof payload.honeyWebsite === "string" && payload.honeyWebsite.trim().length > 0) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    const missing: string[] = REQUIRED_FIELDS.filter((field) => !asTrimmed(payload[field]));
    if (payload.accountTermsAccepted !== true) missing.push("accountTermsAccepted");
    if (payload.emailFollowupConsent !== true) missing.push("emailFollowupConsent");

    const moduleInterests = normalizeList(payload.moduleInterests, 20, 80);
    if (moduleInterests.length === 0) missing.push("moduleInterests");

    const contactEmail = asTrimmed(payload.contactEmail).toLowerCase();
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) missing.push("validContactEmail");

    if (missing.length > 0) {
      return NextResponse.json({ error: "Incomplete customer account", missing }, { status: 400 });
    }

    const { account, accessCode } = await createAiowCustomerAccount({
      companyName: clampText(asTrimmed(payload.companyName), 140),
      legalName: clampText(asTrimmed(payload.legalName), 180),
      contactName: clampText(asTrimmed(payload.contactName), 140),
      contactEmail,
      contactPhone: clampText(asTrimmed(payload.contactPhone), 80),
      projectName: clampText(asTrimmed(payload.projectName), 140),
      projectType: clampText(asTrimmed(payload.projectType), 80),
      moduleInterests,
      addOns: normalizeList(payload.addOns, 20, 80),
      aiowRevenueSharePercent: normalizeRevenueShare(payload.aiowRevenueSharePercent),
      revenueShareNotes: clampText(asTrimmed(payload.revenueShareNotes), 1200),
      moduleRevenueNotes: clampText(asTrimmed(payload.moduleRevenueNotes), 1200),
      currentMonthlyRevenue: clampText(asTrimmed(payload.currentMonthlyRevenue), 120),
      targetMonthlyRevenue: clampText(asTrimmed(payload.targetMonthlyRevenue), 120),
      averageOrderValue: clampText(asTrimmed(payload.averageOrderValue), 120),
      monthlyCustomerVolume: clampText(asTrimmed(payload.monthlyCustomerVolume), 120),
      customerSegments: clampText(asTrimmed(payload.customerSegments), 1200),
      acquisitionChannels: clampText(asTrimmed(payload.acquisitionChannels), 1200),
      coreOffer: clampText(asTrimmed(payload.coreOffer), 1200),
      keyProcesses: clampText(asTrimmed(payload.keyProcesses), 1800),
      systemsStack: clampText(asTrimmed(payload.systemsStack), 1800),
      dataSources: clampText(asTrimmed(payload.dataSources), 1800),
      painPoints: clampText(asTrimmed(payload.painPoints), 1800),
      successMetrics: clampText(asTrimmed(payload.successMetrics), 1200),
      industry: clampText(asTrimmed(payload.industry), 120),
      ideaSummary: clampText(asTrimmed(payload.ideaSummary), 1600),
      founderExperience: clampText(asTrimmed(payload.founderExperience), 1600),
      industryContacts: clampText(asTrimmed(payload.industryContacts), 1600),
      existingAudience: clampText(asTrimmed(payload.existingAudience), 1200),
      proofOfDemand: clampText(asTrimmed(payload.proofOfDemand), 1600),
      resalePotential: clampText(asTrimmed(payload.resalePotential), 1200),
      executionCapacity: clampText(asTrimmed(payload.executionCapacity), 1200),
      budgetRange: clampText(asTrimmed(payload.budgetRange), 240),
      risks: clampText(asTrimmed(payload.risks), 1600),
      aiowBuildScope: clampText(asTrimmed(payload.aiowBuildScope), 1600),
      onboardingId: clampText(asTrimmed(payload.onboardingId), 80) || undefined,
    });

    const leadCapture = await captureAiowLead(
      {
        email: contactEmail,
        consentAccepted: true,
        consentText:
          clampText(asTrimmed(payload.consentText), 500) ||
          "AIOW mag mijn contactgegevens en intakecontext gebruiken om mijn aanvraag persoonlijk per e-mail op te volgen. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.",
        consentVersion: clampText(asTrimmed(payload.consentVersion), 80) || "aiow-followup-v1",
        source: "aiow.ai/portal/account/new",
        sourceRoute: clampText(asTrimmed(payload.sourceRoute), 180) || "/portal/account/new",
        sourceComponent: clampText(asTrimmed(payload.sourceComponent), 120) || "portal-account-create",
        locale: "nl",
        name: clampText(asTrimmed(payload.contactName), 140),
        company: clampText(asTrimmed(payload.companyName), 160),
        phone: clampText(asTrimmed(payload.contactPhone), 80),
        intentType: normalizeLeadIntent(payload.intentType),
        intentText: clampText(asTrimmed(payload.intentText) || asTrimmed(payload.ideaSummary) || asTrimmed(payload.aiowBuildScope), 1200),
        projectType: clampText(asTrimmed(payload.projectType), 120),
        moduleInterests,
        addOns: normalizeList(payload.addOns, 20, 80),
        customerAccountId: account.accountId,
        onboardingId: clampText(asTrimmed(payload.onboardingId), 80) || undefined,
        metadata: {
          projectName: account.projectName,
          accountStatus: account.status,
          analysisReadinessScore: account.analysisReadinessScore,
          ventureFitScore: account.analysis.ventureFitScore,
        },
      },
      "LOCAL_CAPTURED",
    );

    await safeAppendCustomerProofEvent({
      accountId: account.accountId,
      type: "CUSTOMER_ACCOUNT_CREATED",
      actorEmail: account.contactEmail,
      summary: `Customer account created for ${account.companyName}.`,
      payload: { companyName: account.companyName, projectName: account.projectName, leadId: leadCapture.id },
    });

    return NextResponse.json({
      ok: true,
      account,
      accessCode,
      leadId: leadCapture.id,
      followUp: leadCapture.record.followUp,
      portalUrl: `/portal/customer/${account.accountId}`,
      adminState: "VISIBLE_IN_ADMIN_ACCOUNT_OVERVIEW",
      paymentState: account.paymentState,
      message:
        "Klantaccount aangemaakt. Bewaar de toegangscode; productie/live betalingen/betaalde modules blijven geblokkeerd tot klantvoorwaarden zijn afgerond.",
    });
  } catch (error) {
    console.error("[customer-accounts] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId") || "";
    const accessCode = url.searchParams.get("accessCode") || "";

    if (accountId || accessCode) {
      if (!accountId || !accessCode) {
        return NextResponse.json({ error: "Account ID and access code required" }, { status: 400 });
      }
      const account = await findAiowCustomerAccount(accountId, accessCode);
      if (!account) return NextResponse.json({ error: "Account not found or invalid access code" }, { status: 404 });
      return NextResponse.json({ ok: true, account });
    }

    const adminToken = req.headers.get("x-aiow-admin-token") || url.searchParams.get("adminToken") || "";
    const adminEmail = req.headers.get("x-aiow-admin-email") || url.searchParams.get("adminEmail") || "";
    const admin = assertAiowAdmin(adminEmail, adminToken);
    if (!admin) {
      return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });
    }

    const accounts = await listPublicAiowCustomerAccounts();
    return NextResponse.json({ ok: true, admin, accounts, count: accounts.length, source: "local-jsonl-preview" });
  } catch (error) {
    console.error("[customer-accounts] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = (await req.json()) as { accountId?: unknown; accessCode?: unknown; action?: unknown; note?: unknown };
    const accountId = asTrimmed(payload.accountId);
    const accessCode = asTrimmed(payload.accessCode);
    const action = asTrimmed(payload.action);
    if (!accountId || !accessCode) return NextResponse.json({ error: "Account ID and access code required" }, { status: 400 });
    if (action !== "request_scope_review") return NextResponse.json({ error: "Unsupported account action" }, { status: 400 });
    const account = await requestAiowCustomerScopeReview(accountId, accessCode, clampText(asTrimmed(payload.note), 500));
    if (!account) return NextResponse.json({ error: "Account not found or invalid access code" }, { status: 404 });
    await safeAppendCustomerProofEvent({
      accountId: account.accountId,
      type: "CUSTOMER_SCOPE_REVIEW_REQUESTED",
      actorEmail: account.contactEmail,
      summary: `Scope review requested for ${account.companyName}.`,
      payload: { companyName: account.companyName, projectName: account.projectName },
    });
    return NextResponse.json({
      ok: true,
      account,
      message: "AIOW scope review aangevraagd. Team Richard kan nu Deal Card, Venture Memory en private intake beoordelen.",
    });
  } catch (error) {
    console.error("[customer-accounts] PATCH error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


async function safeAppendCustomerProofEvent(input: Parameters<typeof appendAiowProofEvent>[0]): Promise<void> {
  try {
    await appendAiowProofEvent(input);
  } catch (error) {
    console.error("[customer-accounts] proof event skipped", error);
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

function normalizeLeadIntent(value: unknown): "idea" | "company" | "scan" | "talk" | "apply" | "account" | "contact" | "unknown" {
  const raw = asTrimmed(value);
  if (["idea", "company", "scan", "talk", "apply", "account", "contact", "unknown"].includes(raw)) {
    return raw as "idea" | "company" | "scan" | "talk" | "apply" | "account" | "contact" | "unknown";
  }
  return "account";
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

