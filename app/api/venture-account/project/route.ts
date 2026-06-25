import { NextResponse } from "next/server";
import { updateVentureProjectInfo } from "@/lib/aiow-venture-accounts";

type ProjectPayload = {
  accountId?: unknown;
  accessToken?: unknown;
  website?: unknown;
  goals?: unknown;
  budget?: unknown;
  timeline?: unknown;
  extraContext?: unknown;
  readyForProposal?: unknown;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ProjectPayload;
    const accountId = text(payload.accountId);
    const accessToken = text(payload.accessToken);
    if (!accountId || !accessToken) return NextResponse.json({ error: "Account credentials required" }, { status: 400 });
    const account = await updateVentureProjectInfo({
      accountId,
      accessToken,
      website: text(payload.website),
      goals: text(payload.goals),
      budget: text(payload.budget),
      timeline: text(payload.timeline),
      extraContext: text(payload.extraContext),
      readyForProposal: payload.readyForProposal === true,
    });
    if (!account) return NextResponse.json({ error: "Invalid or expired project link" }, { status: 401 });
    return NextResponse.json({ ok: true, account, message: account.status === "proposal_review" ? "Project staat klaar voor voorstelreview." : "Projectinformatie opgeslagen." });
  } catch (error) {
    console.error("[venture-account/project] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
