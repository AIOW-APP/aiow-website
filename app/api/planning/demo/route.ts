import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ mode: "preview-only", slots: [{ type: "intake", durationMinutes: 30, status: "manual-confirmation-required" }, { type: "data-boundary", durationMinutes: 45, status: "manual-confirmation-required" }, { type: "pilot-kickoff", durationMinutes: 60, status: "locked-until-quote-approval" }] });
}
