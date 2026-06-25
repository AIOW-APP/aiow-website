import { NextResponse } from "next/server";
import { prepareVentureProposal } from "@/lib/aiow-venture-accounts";

type ProposalPayload = { accountId?: unknown; accessToken?: unknown };

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ProposalPayload;
    const accountId = text(payload.accountId);
    const accessToken = text(payload.accessToken);
    if (!accountId || !accessToken) return NextResponse.json({ error: "Account credentials required" }, { status: 400 });
    const account = await prepareVentureProposal(accountId, accessToken);
    if (!account) return NextResponse.json({ error: "Invalid or expired project link" }, { status: 401 });
    return NextResponse.json({ ok: true, account, proposal: account.proposal });
  } catch (error) {
    console.error("[venture-account/proposal] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
