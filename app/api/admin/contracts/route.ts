import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { getPublicAiowCustomerAccountById, markAiowCustomerContractDrafted, markAiowCustomerContractSent } from "@/lib/aiow-customer-accounts";
import { createAiowContractDraft, listPublicAiowContracts, markAiowContractSent } from "@/lib/aiow-contracts";
import { appendAiowProofEvent } from "@/lib/aiow-proof-events";

type AdminContractPayload = {
  adminEmail?: unknown;
  adminToken?: unknown;
  accountId?: unknown;
  action?: unknown;
  contractId?: unknown;
  dealModel?: unknown;
  aiowApproach?: unknown;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = assertAiowAdmin(url.searchParams.get("adminEmail") || req.headers.get("x-aiow-admin-email") || "", url.searchParams.get("adminToken") || req.headers.get("x-aiow-admin-token") || "");
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });
    const contracts = await listPublicAiowContracts();
    return NextResponse.json({ ok: true, admin, contracts, count: contracts.length });
  } catch (error) {
    console.error("[admin/contracts] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as AdminContractPayload;
    const admin = assertAiowAdmin(asTrimmed(payload.adminEmail), asTrimmed(payload.adminToken));
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const action = asTrimmed(payload.action) || "draft";
    if (action === "send") {
      const contractId = asTrimmed(payload.contractId);
      if (!contractId) return NextResponse.json({ error: "contractId required" }, { status: 400 });
      const contract = await markAiowContractSent(contractId);
      if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      const account = await markAiowCustomerContractSent(contract.accountId, contract.contractId);
      await appendAiowProofEvent({
        accountId: contract.accountId,
        type: "CONTRACT_SENT",
        actorEmail: admin.email,
        summary: `Contract ${contract.contractId} marked sent by ${admin.email}.`,
        payload: { contractId: contract.contractId, status: contract.status, accountStatus: account?.status || null },
      });
      return NextResponse.json({ ok: true, admin, contract, account, accountStatus: account?.status, deliveryState: "READY_TO_SEND_OR_COPY_LINK" });
    }

    const accountId = asTrimmed(payload.accountId);
    if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });
    const account = await getPublicAiowCustomerAccountById(accountId);
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const draft = await createAiowContractDraft(account, admin, {
      dealModel: asTrimmed(payload.dealModel) || undefined,
      aiowApproach: asTrimmed(payload.aiowApproach) || undefined,
    });
    const updatedAccount = await markAiowCustomerContractDrafted(account.accountId, draft.contract.contractId, draft.signUrl);
    await appendAiowProofEvent({
      accountId: account.accountId,
      type: "CONTRACT_DRAFT_CREATED",
      actorEmail: admin.email,
      summary: `Contract/advice draft ${draft.contract.contractId} created for ${account.companyName}.`,
      payload: {
        contractId: draft.contract.contractId,
        signUrl: draft.signUrl,
        accountStatus: updatedAccount?.status || null,
        recommendedRevenueSharePercent: account.analysis.recommendedRevenueSharePercent,
        verdict: account.analysis.verdict,
      },
    });
    return NextResponse.json({
      ok: true,
      admin,
      account: updatedAccount,
      accountStatus: updatedAccount?.status,
      contract: draft.contract,
      signUrl: draft.signUrl,
      signCode: draft.signCode,
      deliveryState: "DRAFT_CREATED_LOCAL_CAPTURED",
      message: "Contract/advice draft created. Admin can send the sign URL to the customer; after signing, create Telegram project group with Spunky.",
    });
  } catch (error) {
    console.error("[admin/contracts] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
