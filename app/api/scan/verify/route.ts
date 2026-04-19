// POST /api/scan/verify — verify code, issue session
import { NextResponse } from "next/server";
import { checkCode, signSession } from "@/lib/scan/store";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ error: "Missing" }, { status: 400 });
    if (!checkCode(email, code)) {
      return NextResponse.json({ error: "Ongeldige of verlopen code" }, { status: 401 });
    }
    const session = await signSession(email);
    return NextResponse.json({ ok: true, session });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal" }, { status: 500 });
  }
}
