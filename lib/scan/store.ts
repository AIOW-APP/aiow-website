// Lightweight lead store — memory-based with env-encoded sync webhook.
// For production swap for Supabase. For MVP: in-memory + email on submit.

import { randomBytes } from "node:crypto";

type VerifyEntry = { email: string; code: string; expiresAt: number };
type LeadEntry = {
  id: string;
  email: string;
  name: string;
  company: string;
  sector: string;
  createdAt: number;
};

// Serverless global store (works best on single region; dev only)
// For true multi-instance, use Vercel KV or Supabase.
declare global {
  var __aiow_verify: Map<string, VerifyEntry> | undefined;
  var __aiow_leads: Map<string, LeadEntry> | undefined;
}

const verify = (globalThis.__aiow_verify ||= new Map<string, VerifyEntry>());
const leads = (globalThis.__aiow_leads ||= new Map<string, LeadEntry>());

export function generateCode(email: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  verify.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
  });
  return code;
}

export function checkCode(email: string, code: string): boolean {
  const e = verify.get(email.toLowerCase());
  if (!e) return false;
  if (e.expiresAt < Date.now()) {
    verify.delete(email.toLowerCase());
    return false;
  }
  if (e.code !== code.trim()) return false;
  verify.delete(email.toLowerCase());
  return true;
}

export function saveLead(data: Omit<LeadEntry, "id" | "createdAt">): string {
  const id = randomBytes(16).toString("hex");
  leads.set(id, { id, createdAt: Date.now(), ...data });
  return id;
}

export function getLead(id: string): LeadEntry | undefined {
  return leads.get(id);
}

// Session token (signed-ish): sent back to client after verify
const SECRET = process.env.SCAN_SESSION_SECRET || "dev-secret";

export async function signSession(email: string): Promise<string> {
  const payload = `${email}|${Date.now() + 60 * 60 * 1000}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const b64 = Buffer.from(sig).toString("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${b64}`;
}

export async function verifySession(token: string): Promise<{ email: string } | null> {
  try {
    const [payB64, sigB64] = token.split(".");
    if (!payB64 || !sigB64) return null;
    const payload = Buffer.from(payB64, "base64url").toString();
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const sig = Buffer.from(sigB64, "base64url");
    const ok = await crypto.subtle.verify("HMAC", key, sig, enc.encode(payload));
    if (!ok) return null;
    const [email, expStr] = payload.split("|");
    if (Number(expStr) < Date.now()) return null;
    return { email };
  } catch {
    return null;
  }
}
