import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    owner: "AIOW",
    purpose: "B2B informational site. Consumer app showcase and early-adopter offers belong on Handsome.bot.",
    count: 0,
    projects: [],
  });
}
