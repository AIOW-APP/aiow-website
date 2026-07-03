import { NextResponse } from "next/server";
import { listPublicAiowCustomerAccounts } from "@/lib/aiow-customer-accounts";
import { createPortalLoginToken } from "@/lib/aiow-portal-login";

/*
 * E-mail-first portal-login, stap 2: de klant heeft zijn e-mail geverifieerd via de Supabase
 * magic link; met het meegegeven access token halen we het geverifieerde e-mailadres op bij
 * Supabase Auth en geven we de bijbehorende dossiers terug met een kortlevend login-token.
 * Bezit van het geverifieerde e-mailadres = toegang tot dossiers op dat adres (zelfde
 * garantie als een toegangscode die per mail verstuurd zou zijn).
 */

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!accessToken) return NextResponse.json({ error: "Geen toegangstoken" }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.AIOW_SUPABASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.AIOW_SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !apiKey) return NextResponse.json({ error: "Login is nog niet geconfigureerd" }, { status: 503 });

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${accessToken}`, apikey: apiKey },
      cache: "no-store",
    });
    if (!userResponse.ok) return NextResponse.json({ error: "Verificatie mislukt" }, { status: 401 });
    const user = (await userResponse.json()) as { email?: string; email_confirmed_at?: string };
    const email = (user.email || "").toLowerCase().trim();
    if (!email) return NextResponse.json({ error: "Geen geverifieerd e-mailadres" }, { status: 401 });

    const accounts = (await listPublicAiowCustomerAccounts())
      .filter((account) => (account.contactEmail || "").toLowerCase().trim() === email)
      .map((account) => ({
        accountId: account.accountId,
        companyName: account.companyName,
        projectName: account.projectName,
        status: account.status,
        loginToken: createPortalLoginToken(account.accountId),
      }));

    return NextResponse.json({ ok: true, email, accounts });
  } catch (error) {
    console.error("[portal/my-accounts] error", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
