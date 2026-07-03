import { createHmac, timingSafeEqual } from "crypto";

/*
 * Tijdelijke login-tokens voor het klantportaal (e-mail-first login).
 * Flow: klant verifieert e-mail via Supabase magic link → /api/portal/my-accounts geeft per
 * gekoppeld account een kortlevend token → dossier opent zonder toegangscode.
 * Token = `${exp}.${hmac(accountId|exp)}`; secret blijft server-side.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 uur

function secret(): string {
  const value =
    process.env.AIOW_PORTAL_LOGIN_SECRET ||
    process.env.AIOW_SUPABASE_SERVICE_ROLE_KEY ||
    "";
  if (!value) throw new Error("Portal login secret ontbreekt (AIOW_PORTAL_LOGIN_SECRET).");
  return value;
}

function sign(accountId: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${accountId}|${exp}`).digest("hex");
}

export function createPortalLoginToken(accountId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  return `${exp}.${sign(accountId, exp)}`;
}

export function verifyPortalLoginToken(accountId: string, token: string): boolean {
  const [expRaw, sig] = String(token || "").split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = sign(accountId, exp);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
