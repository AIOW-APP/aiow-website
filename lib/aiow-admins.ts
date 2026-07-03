export type AiowAdmin = {
  email: string;
  name: string;
  role: "OWNER_ADMIN" | "ADMIN";
};

export const AIOW_ADMINS: AiowAdmin[] = [
  { email: "richard@aiow.io", name: "Richard Vermeer", role: "OWNER_ADMIN" },
  { email: "jeroen@aiow.io", name: "Jeroen", role: "ADMIN" },
];

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findAiowAdmin(email: string): AiowAdmin | null {
  const normalized = normalizeAdminEmail(email);
  return AIOW_ADMINS.find((admin) => admin.email === normalized) || null;
}

export function assertAiowAdmin(email: string, token: string): AiowAdmin | null {
  if (!isAdminToken(token)) return null;
  return findAiowAdmin(email);
}

export function isAdminToken(token: string): boolean {
  const expected = process.env.AIOW_ADMIN_TOKEN || "AIOW_ADMIN_LOCAL_PREVIEW";
  return token.length > 0 && token === expected;
}
