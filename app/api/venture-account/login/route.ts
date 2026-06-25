import { NextResponse } from "next/server";
import { loginVentureAccount } from "@/lib/aiow-venture-accounts";

type LoginPayload = { email?: unknown };

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as LoginPayload;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const account = await loginVentureAccount(email);
    if (!account) return NextResponse.json({ error: "No AIOW project found for this email" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      accountId: account.accountId,
      portalUrl: account.portalUrl,
      accessToken: account.accessToken,
      status: account.status,
      message: "Preview login-link aangemaakt. In productie sturen we deze als Magic Link per e-mail.",
    });
  } catch (error) {
    console.error("[venture-account/login] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
