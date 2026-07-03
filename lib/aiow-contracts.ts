import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { AiowAdmin } from "./aiow-admins";
import type { PublicCustomerAccount } from "./aiow-customer-accounts";

export type AiowContractStatus = "DRAFT" | "SENT" | "SIGNED";

export type AiowContract = {
  contractId: string;
  contractCodeHash: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  signedAt?: string;
  status: AiowContractStatus;
  accountId: string;
  companyName: string;
  legalName: string;
  contactName: string;
  contactEmail: string;
  adminEmail: string;
  adminName: string;
  subject: string;
  dealModel: string;
  aiowApproach: string;
  scope: string[];
  customerResponsibilities: string[];
  teamSetup: string[];
  dashboardFocus: string[];
  commercialTerms: string[];
  legalTerms: string[];
  signatureName?: string;
  signatureRole?: string;
  signatureEmail?: string;
  signatureIp?: string;
  signatureUserAgent?: string;
};

export type PublicAiowContract = Omit<AiowContract, "contractCodeHash">;

export function createContractCode(): string {
  return randomBytes(8).toString("hex");
}

export function hashContractCode(contractId: string, code: string): string {
  return createHash("sha256").update(`${contractId}|${code.trim()}`).digest("hex");
}

export async function createAiowContractDraft(account: PublicCustomerAccount, admin: AiowAdmin, overrides?: Partial<Pick<AiowContract, "dealModel" | "aiowApproach">>): Promise<{ contract: PublicAiowContract; signCode: string; signUrl: string; storagePath: string }> {
  const now = new Date().toISOString();
  const contractId = `aiow_ctr_${createHash("sha256").update(`${account.accountId}|${now}`).digest("hex").slice(0, 14)}`;
  const signCode = createContractCode();
  const recommendedRevenue = account.analysis?.recommendedRevenueSharePercent || account.aiowRevenueSharePercent || 10;
  const recommendedResale = account.analysis?.recommendedResaleSharePercent || 10;
  const verdict = account.analysis?.verdict || "CONDITIONAL_GO";
  const contract: AiowContract = {
    contractId,
    contractCodeHash: hashContractCode(contractId, signCode),
    createdAt: now,
    updatedAt: now,
    status: "DRAFT",
    accountId: account.accountId,
    companyName: account.companyName,
    legalName: account.legalName,
    contactName: account.contactName,
    contactEmail: account.contactEmail,
    adminEmail: admin.email,
    adminName: admin.name,
    subject: `AIOW aanpak + voorwaarden voor ${account.companyName}`,
    dealModel: overrides?.dealModel || `AIOW advies: ${verdict}. Start als proof/growth sprint met ${recommendedRevenue}% omzetdeel en minimaal ${recommendedResale}% doorverkoop/resale-afspraak waar AIOW IP/modules worden doorverkocht. Definitieve percentages kunnen na scope/legal review worden aangescherpt.`,
    aiowApproach: overrides?.aiowApproach || `We starten met een private AI Venture Deal Card, vullen ontbrekend bewijs aan, bepalen de eerste 30-dagen sprint en zetten daarna een projectgroep op met klant, AIOW team en Spunky als contact-AI/contextlaag.`,
    scope: [
      "Private venture/company intake reviewen en ontbrekende bewijsstukken ophalen.",
      "AIOW Deal Card maken: founder/market/execution/AI opportunity/investment score.",
      "Eerste 30-dagen AI/growth/software sprint definiëren met meetbare KPI's.",
      "Projectdashboard opzetten met status, risico's, advies en verbeterkansen.",
      "Na ondertekening Telegram projectgroep aanmaken met Spunky als contact-AI/contextcollector.",
    ],
    customerResponsibilities: [
      "Eerlijke en volledige informatie leveren over bedrijf, klanten, data, omzet, bottlenecks en bevoegdheden.",
      "Sales, klantrelaties, operationele feedback en interne besluitvorming actief opvolgen.",
      "Geen gevoelige data delen buiten afgesproken private kanalen.",
      "Tijdig akkoord geven op scope, voorwaarden, testresultaten en livegangbeslissingen.",
    ],
    teamSetup: [
      "Richard / AIOW admin: eindbeslissing, deal, prioriteit en escalaties.",
      "Handsome: venture lead, analyse, architectuur, bouwplan, proof en dashboardadvies.",
      "Spunky: contact-AI in klantgroep, contextopvang, vragenroutering en projectgeheugen.",
      "Team AIOW intern: bouw, analyse, marketing/growth, automatisering en QA op basis van verzamelde context.",
    ],
    dashboardFocus: [
      "Status: intake, advies, contract, Telegram groep, build sprint, launch, optimalisatie.",
      "Advies: wat moet beter om klant digitaal/AI-native sterker te maken.",
      "Risico's: data, legal/compliance, sales, operatie, security, afhankelijkheden.",
      "KPI's: omzet, leads, conversie, urenbesparing, responstijd, klanttevredenheid, marge.",
      "Proof log: wat is gebouwd, getest, geleerd en verbeterd.",
    ],
    commercialTerms: [
      `Minimaal ${recommendedRevenue}% omzetdeel op omzet die AIOW aantoonbaar helpt creëren, automatiseren of opschalen, tenzij schriftelijk anders afgesproken door AIOW admin.`,
      `Minimaal ${recommendedResale}% doorverkoop/white-label/resale/franchise/sublicense share wanneer AIOW IP, modules, workflow of platform door de klant wordt doorverkocht.`,
      "Betaalde modules, providerkosten, advertentiebudget, externe tooling en maatwerk vallen buiten scope tenzij expliciet opgenomen.",
      "Profit share/equity/participatie wordt pas actief na aparte juridische review en ondertekende aanvullende afspraken.",
    ],
    legalTerms: [
      "Dit document is een operationele opdracht- en samenwerkingsbasis; definitieve juridische/tax/participatie-afspraken kunnen aanvullende documenten vereisen.",
      "AIOW geeft AI/growth/software advies en bouwt systemen; resultaten worden niet gegarandeerd.",
      "Klant blijft verantwoordelijk voor juistheid van aangeleverde informatie, wettelijke naleving, klantcommunicatie en businessbeslissingen.",
      "Productie, live betalingen, betaalde modules of externe klantcommunicatie starten pas na expliciete scope- en livegang-goedkeuring.",
      "AIOW mag projectcontext verwerken binnen private AIOW/klantkanalen voor analyse, bouw, support en kwaliteitsverbetering.",
    ],
  };
  const storagePath = await appendContractRecord(contract);
  return { contract: publicContract(contract), signCode, signUrl: `/contract/${contractId}?code=${encodeURIComponent(signCode)}`, storagePath };
}

export async function markAiowContractSent(contractId: string): Promise<PublicAiowContract | null> {
  const existing = await getAiowContractById(contractId);
  if (!existing) return null;
  const now = new Date().toISOString();
  const next: AiowContract = { ...existing, status: existing.status === "SIGNED" ? "SIGNED" : "SENT", sentAt: existing.sentAt || now, updatedAt: now };
  await appendContractRecord(next);
  return publicContract(next);
}

export async function findAiowContract(contractId: string, code: string): Promise<PublicAiowContract | null> {
  const contract = await getAiowContractById(contractId);
  if (!contract) return null;
  const provided = Buffer.from(hashContractCode(contractId, code), "hex");
  const expected = Buffer.from(contract.contractCodeHash, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return publicContract(contract);
}

export async function signAiowContract(contractId: string, code: string, signature: { name: string; role: string; email: string; ip?: string; userAgent?: string }): Promise<PublicAiowContract | null> {
  const contract = await getAiowContractById(contractId);
  if (!contract) return null;
  const provided = Buffer.from(hashContractCode(contractId, code), "hex");
  const expected = Buffer.from(contract.contractCodeHash, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  const now = new Date().toISOString();
  const next: AiowContract = {
    ...contract,
    status: "SIGNED",
    signedAt: now,
    updatedAt: now,
    signatureName: signature.name,
    signatureRole: signature.role,
    signatureEmail: signature.email.toLowerCase(),
    signatureIp: signature.ip,
    signatureUserAgent: signature.userAgent,
  };
  await appendContractRecord(next);
  return publicContract(next);
}

export async function listPublicAiowContracts(): Promise<PublicAiowContract[]> {
  return (await listAiowContracts()).map(publicContract);
}

async function getAiowContractById(contractId: string): Promise<AiowContract | null> {
  return (await listAiowContracts()).find((contract) => contract.contractId === contractId) || null;
}

async function appendContractRecord(contract: AiowContract): Promise<string> {
  const filePath = contractStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(contract)}\n`, "utf8");
  return filePath;
}

async function listAiowContracts(): Promise<AiowContract[]> {
  const filePath = contractStorePath();
  try {
    const raw = await readFile(filePath, "utf8");
    const latest = new Map<string, AiowContract>();
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line) as AiowContract;
      latest.set(parsed.contractId, parsed);
    }
    return [...latest.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function contractStorePath(): string {
  return process.env.AIOW_CONTRACT_STORE || path.join(os.tmpdir(), "aiow-customer-onboarding", "contracts.jsonl");
}

function publicContract(contract: AiowContract): PublicAiowContract {
  const { contractCodeHash: _contractCodeHash, ...rest } = contract;
  return rest;
}
