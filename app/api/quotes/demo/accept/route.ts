import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Digital quote acceptance is disabled until auth, database and legal wording are approved." }, { status: 503 });
}
