import { NextResponse } from "next/server";
import { listVentureAccounts } from "@/lib/aiow-venture-accounts";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = req.headers.get("x-aiow-admin-token") || url.searchParams.get("token") || "";
    const configured = process.env.AIOW_ADMIN_TOKEN || "";
    if (configured && token !== configured) return NextResponse.json({ error: "Admin token required" }, { status: 401 });
    const accounts = await listVentureAccounts();
    return NextResponse.json({
      ok: true,
      source: "venture-account-store-preview",
      count: accounts.length,
      accounts: accounts.map((account) => ({
        accountId: account.accountId,
        name: account.name,
        email: account.email,
        company: account.company,
        projectName: account.projectName,
        status: account.status,
        updatedAt: account.updatedAt,
        leadId: account.leadId,
        dealCard: account.dealCard,
        projectInfo: account.projectInfo,
        proposal: account.proposal ? {
          proposalId: account.proposal.proposalId,
          title: account.proposal.title,
          signedAt: account.proposal.signedAt,
          signatureName: account.proposal.signatureName,
        } : null,
      })),
    });
  } catch (error) {
    console.error("[admin/venture-accounts] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
