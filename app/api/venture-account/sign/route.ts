import { NextResponse } from "next/server";
import { signVentureProposal } from "@/lib/aiow-venture-accounts";

type SignPayload = { accountId?: unknown; accessToken?: unknown; signatureName?: unknown };

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as SignPayload;
    const accountId = text(payload.accountId);
    const accessToken = text(payload.accessToken);
    const signatureName = text(payload.signatureName);
    const missing: string[] = [];
    if (!accountId) missing.push("accountId");
    if (!accessToken) missing.push("accessToken");
    if (!signatureName) missing.push("signatureName");
    if (missing.length) return NextResponse.json({ error: "Incomplete signature", missing }, { status: 400 });
    const account = await signVentureProposal({ accountId, accessToken, signatureName });
    if (!account) return NextResponse.json({ error: "Proposal not found or project link expired" }, { status: 401 });
    return NextResponse.json({ ok: true, account, status: account.status, message: "Voorstel ondertekend. Project staat klaar voor build-start door Team AIOW." });
  } catch (error) {
    console.error("[venture-account/sign] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
