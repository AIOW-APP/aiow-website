import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { getPublicAiowCustomerAccountById, markAiowCustomerSpunkyProjectGroupPrepared } from "@/lib/aiow-customer-accounts";
import { appendAiowProofEvent, listAiowProofEvents } from "@/lib/aiow-proof-events";

type HandoffPayload = {
  adminEmail?: unknown;
  adminToken?: unknown;
  accountId?: unknown;
  markPrepared?: unknown;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    return handleHandoff({
      adminEmail: url.searchParams.get("adminEmail"),
      adminToken: url.searchParams.get("adminToken"),
      accountId: url.searchParams.get("accountId"),
      markPrepared: false,
    });
  } catch (error) {
    console.error("[admin/spunky-handoff] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as HandoffPayload;
    return handleHandoff(payload);
  } catch (error) {
    console.error("[admin/spunky-handoff] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleHandoff(payload: HandoffPayload) {
  const admin = assertAiowAdmin(asTrimmed(payload.adminEmail), asTrimmed(payload.adminToken));
  if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });
  const accountId = asTrimmed(payload.accountId);
  if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });

  const account = await getPublicAiowCustomerAccountById(accountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  const accountStatus = String(account.status);
  if (accountStatus !== "SPUNKY_HANDOFF_READY" && accountStatus !== "SIGNED") {
    return NextResponse.json({ error: "Account is not ready for Spunky handoff", accountStatus: account.status }, { status: 409 });
  }

  const events = await listAiowProofEvents(accountId);
  const latestTask = events.find((event) => event.type === "SPUNKY_PROJECT_GROUP_TASK_CREATED");
  const latestContract = events.find((event) => event.type === "CONTRACT_SIGNED" || event.type === "CONTRACT_DRAFT_CREATED");
  const handoff = buildSpunkyOperatingRoom(account, latestTask?.payload || {}, latestContract?.payload || {});

  let proofEvent = null;
  let updatedAccount = account;
  if (payload.markPrepared === true) {
    updatedAccount = await markAiowCustomerSpunkyProjectGroupPrepared(accountId, handoff.groupName) || account;
    proofEvent = await appendAiowProofEvent({
      accountId,
      type: "SPUNKY_PROJECT_GROUP_PREPARED",
      actorEmail: admin.email,
      summary: `Spunky operating room package prepared for ${account.companyName}.`,
      payload: { ...handoff, accountStatus: updatedAccount.status },
    });
  }

  return NextResponse.json({ ok: true, admin, accountStatus: updatedAccount.status, account: updatedAccount, handoff, proofEvent });
}

function buildSpunkyOperatingRoom(
  account: NonNullable<Awaited<ReturnType<typeof getPublicAiowCustomerAccountById>>>,
  taskPayload: Record<string, unknown>,
  contractPayload: Record<string, unknown>,
) {
  const contractId = textValue(taskPayload.contractId) || textValue(contractPayload.contractId) || "n.t.b.";
  const firstSprint = account.analysis?.firstSprintRecommendation || "Bepaal eerste proof sprint met KPI, owner en duidelijke scope.";
  const risks = account.analysis?.gaps?.length ? account.analysis.gaps.slice(0, 4) : ["Scope en datatoegang bevestigen", "KPI en owner vastleggen", "Geen productie zonder live-go"];
  const proof = account.analysis?.requiredCustomerProof?.length ? account.analysis.requiredCustomerProof.slice(0, 4) : ["Beslisser", "Databronnen", "Eerste KPI", "Budget/scope"];
  const groupName = `AIOW x ${account.companyName} x Spunky`;
  const customerIntro = [
    `Welkom ${account.contactName || account.companyName}.`,
    `Deze groep is de private AIOW projectruimte voor ${account.companyName}.`,
    "Spunky helpt hier met context verzamelen, vragen structureren en updates samenvatten.",
    "Team Richard blijft eigenaar van scope, planning, prijs, contract, privacy en livegang.",
    "Eerste doel: de proof sprint scherp maken met KPI, databronnen, owner en praktische afspraken.",
  ].join("\n\n");
  const internalSpunkyBriefing = [
    `Projectgroep: ${groupName}`,
    `Account: ${account.accountId}`,
    `Contract: ${contractId}`,
    `Klant: ${account.companyName}`,
    `Contact: ${account.contactName || "n.t.b."} <${account.contactEmail || "n.t.b."}>`,
    `Project: ${account.projectName || "n.t.b."}`,
    `Project type: ${account.projectType || "n.t.b."}`,
    `Eerste sprint: ${firstSprint}`,
    `Risico's: ${risks.join("; ")}`,
    `Benodigd bewijs: ${proof.join("; ")}`,
    "Spunky mag: context ophalen, vragen ordenen, afspraken samenvatten, ontbrekend bewijs signaleren en Team Richard briefen.",
    "Spunky mag niet: scope, prijs, contract, livegang, juridische beloftes of externe productie-acties zelfstandig wijzigen.",
    "Escaleren bij: budget, legal, privacy, security, datatoegang, scopewijziging, klantontevredenheid of livegangbesluit.",
  ].join("\n");
  const kickoffChecklist = [
    "Maak Telegram projectgroep aan met klant, Richard/Team Richard en Spunky.",
    `Gebruik groepsnaam: ${groupName}`,
    "Plak eerst de klantintro.",
    "Plak daarna intern de Spunky briefing in Team Richard of Spunky contextkanaal.",
    "Vraag klant om: beslisser, databronnen, KPI, eerste workflow, gewenste planning en beperkingen.",
    "Markeer pas build sprint wanneer Team Richard scope en live-go bevestigt.",
  ];
  return {
    status: "READY_TO_CREATE_GROUP",
    groupName,
    accountId: account.accountId,
    contractId,
    customerIntro,
    internalSpunkyBriefing,
    kickoffChecklist,
    boundaries: [
      "Geen productie zonder Team Richard live-go.",
      "Geen scopewijziging zonder adminbesluit.",
      "Geen prijs, contract of juridische claim via Spunky.",
      "Klantdata blijft in private projectcontext.",
    ],
  };
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}
