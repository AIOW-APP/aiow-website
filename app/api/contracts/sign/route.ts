import { NextResponse } from "next/server";
import { findAiowContract, signAiowContract } from "@/lib/aiow-contracts";
import { markAiowCustomerContractSigned, markAiowCustomerSpunkyHandoffReady } from "@/lib/aiow-customer-accounts";
import { appendAiowProofEvent } from "@/lib/aiow-proof-events";

type SignPayload = {
  contractId?: unknown;
  code?: unknown;
  signatureName?: unknown;
  signatureRole?: unknown;
  signatureEmail?: unknown;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const contractId = url.searchParams.get("contractId") || "";
    const code = url.searchParams.get("code") || "";
    if (!contractId || !code) return NextResponse.json({ error: "contractId and code required" }, { status: 400 });
    const contract = await findAiowContract(contractId, code);
    if (!contract) return NextResponse.json({ error: "Contract not found or invalid code" }, { status: 404 });
    return NextResponse.json({ ok: true, contract });
  } catch (error) {
    console.error("[contracts/sign] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as SignPayload;
    const contractId = asTrimmed(payload.contractId);
    const code = asTrimmed(payload.code);
    const signatureName = asTrimmed(payload.signatureName);
    const signatureRole = asTrimmed(payload.signatureRole);
    const signatureEmail = asTrimmed(payload.signatureEmail).toLowerCase();
    if (!contractId || !code || !signatureName || !signatureRole || !signatureEmail) {
      return NextResponse.json({ error: "signature fields required" }, { status: 400 });
    }
    const contract = await signAiowContract(contractId, code, {
      name: signatureName,
      role: signatureRole,
      email: signatureEmail,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local",
      userAgent: req.headers.get("user-agent") || "unknown",
    });
    if (!contract) return NextResponse.json({ error: "Contract not found or invalid code" }, { status: 404 });
    const signedAccount = await markAiowCustomerContractSigned(contract.accountId, contract.contractId);
    await appendAiowProofEvent({
      accountId: contract.accountId,
      type: "CONTRACT_SIGNED",
      actorEmail: signatureEmail,
      summary: `Contract ${contract.contractId} signed by ${signatureName}.`,
      payload: {
        contractId: contract.contractId,
        signatureName,
        signatureRole,
        signatureEmail,
        accountStatus: signedAccount?.status || null,
        signedAt: contract.signedAt,
      },
    });

    const handoffAccount = await markAiowCustomerSpunkyHandoffReady(contract.accountId, contract.contractId);
    const spunkyProjectGroupTask = buildSpunkyProjectGroupTask(contract);
    await appendAiowProofEvent({
      accountId: contract.accountId,
      type: "SPUNKY_PROJECT_GROUP_TASK_CREATED",
      actorEmail: "system@aiow.ai",
      summary: `Spunky project group task created for ${contract.companyName}.`,
      payload: { ...spunkyProjectGroupTask, accountStatus: handoffAccount?.status || null },
    });

    return NextResponse.json({
      ok: true,
      contract,
      account: handoffAccount || signedAccount,
      accountStatus: handoffAccount?.status || signedAccount?.status,
      spunkyProjectGroupTask,
      nextStep: "AIOW maakt nu een Telegram projectgroep met klant + Spunky en activeert interne AIOW projectcontext.",
    });
  } catch (error) {
    console.error("[contracts/sign] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildSpunkyProjectGroupTask(contract: NonNullable<Awaited<ReturnType<typeof signAiowContract>>>) {
  return {
    taskType: "CREATE_SPUNKY_PROJECT_GROUP",
    status: "READY",
    accountId: contract.accountId,
    contractId: contract.contractId,
    customer: {
      companyName: contract.companyName,
      legalName: contract.legalName,
      contactName: contract.contactName,
      contactEmail: contract.contactEmail,
    },
    groupPurpose: "AIOW projectgroep met klant, Team Richard en Spunky als contact-AI/contextcollector.",
    spunkyRules: [
      "Verzamel context, vragen, bestanden en ontbrekend bewijs.",
      "Vat klantupdates samen voor Team Richard.",
      "Wijzig geen deal, contract, scope, prijs of livegangbesluit zelfstandig.",
      "Escaleren naar Team Richard bij budget, legal, privacy, security of scopewijziging.",
    ],
    firstMessage: `Welkom ${contract.contactName}. AIOW heeft je akkoord ontvangen. Spunky helpt vanaf hier met context verzamelen en vragen structureren. Team Richard blijft eigenaar van scope, deal, planning en livegang.`,
  };
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
