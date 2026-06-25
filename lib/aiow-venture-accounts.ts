import { createHash, randomBytes, randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { VentureDealCard } from "./aiow-venture-memory";

export type VentureAccountStatus = "intake" | "proposal_review" | "proposal_ready" | "proposal_signed" | "build_ready";

export type VentureAccount = {
  accountId: string;
  sessionId: string;
  email: string;
  name: string;
  company: string;
  projectName: string;
  status: VentureAccountStatus;
  accessTokenHash: string;
  createdAt: string;
  updatedAt: string;
  leadId?: string;
  dealCard?: VentureDealCard;
  projectInfo: {
    website?: string;
    goals?: string;
    budget?: string;
    timeline?: string;
    extraContext?: string;
    readyForProposal?: boolean;
  };
  proposal?: {
    proposalId: string;
    title: string;
    scope: string;
    commercialModel: string;
    nextStep: string;
    createdAt: string;
    signedAt?: string;
    signatureName?: string;
  };
};

export type VentureAccountWithToken = VentureAccount & { accessToken: string; portalUrl: string };

export async function createOrUpdateVentureAccount(input: {
  sessionId: string;
  email: string;
  name: string;
  company?: string;
  leadId?: string;
  dealCard?: VentureDealCard;
}): Promise<VentureAccountWithToken> {
  const existing = await findLatestAccountByEmail(input.email);
  const now = new Date().toISOString();
  const accessToken = randomBytes(24).toString("base64url");
  const account: VentureAccount = {
    ...(existing || {
      accountId: `aiow_acc_${randomUUID()}`,
      createdAt: now,
      projectInfo: {},
    }),
    sessionId: input.sessionId,
    email: normalizeEmail(input.email),
    name: clamp(input.name, 160),
    company: clamp(input.company || existing?.company || "", 180),
    projectName: input.dealCard?.title || existing?.projectName || "AIOW Venture Project",
    status: existing?.status || "intake",
    accessTokenHash: tokenHash(accessToken),
    updatedAt: now,
    leadId: input.leadId || existing?.leadId,
    dealCard: input.dealCard || existing?.dealCard,
    projectInfo: existing?.projectInfo || {},
    proposal: existing?.proposal,
  };
  await appendAccount(account);
  return { ...account, accessToken, portalUrl: portalUrl(account.accountId, accessToken, account) };
}

export async function loginVentureAccount(email: string): Promise<VentureAccountWithToken | null> {
  const existing = await findLatestAccountByEmail(email);
  if (!existing) return null;
  const accessToken = randomBytes(24).toString("base64url");
  const updated: VentureAccount = { ...existing, accessTokenHash: tokenHash(accessToken), updatedAt: new Date().toISOString() };
  await appendAccount(updated);
  return { ...updated, accessToken, portalUrl: portalUrl(updated.accountId, accessToken, updated) };
}

export async function getVentureAccount(accountId: string, accessToken: string): Promise<VentureAccount | null> {
  const accounts = await readAccounts();
  const latest = [...accounts].reverse().find((account) => account.accountId === accountId);
  if (!latest) return null;
  if (latest.accessTokenHash !== tokenHash(accessToken)) return null;
  return latest;
}

export async function updateVentureProjectInfo(input: {
  accountId: string;
  accessToken: string;
  website?: string;
  goals?: string;
  budget?: string;
  timeline?: string;
  extraContext?: string;
  readyForProposal?: boolean;
}): Promise<VentureAccount | null> {
  const account = await getVentureAccount(input.accountId, input.accessToken);
  if (!account) return null;
  const updated: VentureAccount = {
    ...account,
    status: input.readyForProposal ? "proposal_review" : account.status,
    updatedAt: new Date().toISOString(),
    projectInfo: {
      website: clamp(input.website || account.projectInfo.website || "", 240),
      goals: clamp(input.goals || account.projectInfo.goals || "", 2400),
      budget: clamp(input.budget || account.projectInfo.budget || "", 240),
      timeline: clamp(input.timeline || account.projectInfo.timeline || "", 240),
      extraContext: clamp(input.extraContext || account.projectInfo.extraContext || "", 3000),
      readyForProposal: Boolean(input.readyForProposal || account.projectInfo.readyForProposal),
    },
  };
  await appendAccount(updated);
  return updated;
}

export async function prepareVentureProposal(accountId: string, accessToken: string): Promise<VentureAccount | null> {
  const account = await getVentureAccount(accountId, accessToken);
  if (!account) return null;
  const now = new Date().toISOString();
  const updated: VentureAccount = {
    ...account,
    status: "proposal_ready",
    updatedAt: now,
    proposal: account.proposal || {
      proposalId: `aiow_prop_${randomUUID()}`,
      title: `Voorstel voor ${account.projectName}`,
      scope: buildScope(account),
      commercialModel: "Betaalde scope eerst. Daarna pas upside, revenue share, profit share of participatie als dat strategisch klopt.",
      nextStep: "Controleer het voorstel. Na akkoord en digitale ondertekening kan Team AIOW de bouwfase starten.",
      createdAt: now,
    },
  };
  await appendAccount(updated);
  return updated;
}

export async function signVentureProposal(input: { accountId: string; accessToken: string; signatureName: string }): Promise<VentureAccount | null> {
  const account = await getVentureAccount(input.accountId, input.accessToken);
  if (!account?.proposal) return null;
  const now = new Date().toISOString();
  const updated: VentureAccount = {
    ...account,
    status: "build_ready",
    updatedAt: now,
    proposal: {
      ...account.proposal,
      signedAt: now,
      signatureName: clamp(input.signatureName, 160),
    },
  };
  await appendAccount(updated);
  return updated;
}

export function encodeVentureAccountState(account: VentureAccount): string {
  return Buffer.from(JSON.stringify(account), "utf8").toString("base64url");
}

export function decodeVentureAccountState(value: string): VentureAccount | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as VentureAccount;
    if (!parsed.accountId || !parsed.email || !parsed.accessTokenHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function listVentureAccounts(): Promise<VentureAccount[]> {
  const latest = new Map<string, VentureAccount>();
  for (const account of await readAccounts()) latest.set(account.accountId, account);
  return [...latest.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function buildScope(account: VentureAccount): string {
  const parts = [
    account.dealCard?.problem ? `Probleem: ${account.dealCard.problem}` : "Probleem wordt verder aangescherpt in de private intake.",
    account.dealCard?.opportunity ? `AI-kans: ${account.dealCard.opportunity}` : "AI-kans wordt bepaald op basis van gedeelde context.",
    account.projectInfo.goals ? `Doel: ${account.projectInfo.goals}` : "Doel en succescriteria moeten definitief worden bevestigd.",
    account.projectInfo.budget ? `Budgetindicatie: ${account.projectInfo.budget}` : "Budgetindicatie ontbreekt nog.",
  ];
  return parts.join("\n");
}

async function findLatestAccountByEmail(email: string): Promise<VentureAccount | null> {
  const normalized = normalizeEmail(email);
  return [...await readAccounts()].reverse().find((account) => account.email === normalized) || null;
}

async function appendAccount(account: VentureAccount): Promise<void> {
  const filePath = accountStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(account)}\n`, "utf8");
}

async function readAccounts(): Promise<VentureAccount[]> {
  try {
    const raw = await readFile(accountStorePath(), "utf8");
    return raw.split("\n").filter(Boolean).map((line) => JSON.parse(line) as VentureAccount);
  } catch {
    return [];
  }
}

function accountStorePath(): string {
  return process.env.AIOW_VENTURE_ACCOUNT_STORE || path.join(os.tmpdir(), "aiow-customer-onboarding", "venture-accounts.jsonl");
}

function portalUrl(accountId: string, accessToken: string, account?: VentureAccount): string {
  const state = account ? `&state=${encodeURIComponent(encodeVentureAccountState(account))}` : "";
  return `/portal/project/${encodeURIComponent(accountId)}?token=${encodeURIComponent(accessToken)}${state}`;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function clamp(value: string, max: number): string {
  const text = value.trim();
  return text.length > max ? text.slice(0, max) : text;
}
