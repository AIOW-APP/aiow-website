import { createHmac } from "node:crypto";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAiowSupabaseConfig, supabaseRpc } from "./aiow-durable-store";

export const VENTURE_INTAKE_RATE_LIMIT = {
  maxAttempts: 12,
  windowSeconds: 60 * 60,
} as const;

export type VentureIntakeDossier = {
  dossierId: string;
  createdAt: string;
  expiresAt: string;
  sessionId: string;
  source: string;
  sourceRoute: string;
  sourceComponent: string;
  contact: {
    name: string;
    email: string;
    company: string;
    phone: string;
    consentAccepted: true;
    consentVersion: string;
  };
  input: Record<string, unknown>;
  analysis: Record<string, unknown>;
  review: {
    state: string;
    humanReviewRequired: true;
    message: string;
    nextAction: string;
  };
  metadata: Record<string, unknown>;
};

export type AcceptVentureIntakeInput = {
  requestKeyHash: string;
  rateKeyHash: string;
  dossier: VentureIntakeDossier;
};

export type AcceptVentureIntakeResult = {
  accepted: boolean;
  replayed: boolean;
  rateLimited: boolean;
  dossierId?: string;
  createdAt?: string;
  retryAfterSeconds?: number;
};

type LocalState = {
  version: 1;
  requests: Record<string, { dossierId: string; createdAt: string }>;
  rateBuckets: Record<string, { count: number; windowStartedAt: string; resetAt: string }>;
  dossiers: Record<string, VentureIntakeDossier>;
};

export function ventureIntakeStoreMode(): "supabase" | "local_test" | "unavailable" {
  if (getAiowSupabaseConfig()) return "supabase";
  const explicitLocalTest = process.env.AIOW_VENTURE_INTAKE_LOCAL_TEST === "1" && !process.env.VERCEL;
  if (explicitLocalTest && process.env.AIOW_VENTURE_INTAKE_LOCAL_STORE) return "local_test";
  return "unavailable";
}

export function requireVentureIntakeHashSecret(): string {
  const secret = process.env.AIOW_VENTURE_INTAKE_HASH_SECRET?.trim();
  if (!secret || secret.length < 32) throw new VentureIntakeConfigurationError("Venture intake hash secret is unavailable");
  return secret;
}

export function hashVentureIntakeKey(namespace: "request" | "rate", value: string, secret: string): string {
  return createHmac("sha256", secret).update(`${namespace}\u0000${value}`).digest("hex");
}

export function isValidIdempotencyKey(value: string): boolean {
  return value.length >= 16 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value);
}

export function isValidVentureEmail(value: string): boolean {
  if (value.length < 3 || value.length > 254 || value.includes("..")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function acceptVentureIntake(input: AcceptVentureIntakeInput): Promise<AcceptVentureIntakeResult> {
  const mode = ventureIntakeStoreMode();
  if (mode === "unavailable") throw new VentureIntakeConfigurationError("Durable venture intake storage is unavailable");
  if (mode === "supabase") {
    const result = await supabaseRpc<AcceptVentureIntakeResult>("aiow_accept_venture_intake", {
      p_request_key_hash: input.requestKeyHash,
      p_rate_key_hash: input.rateKeyHash,
      p_max_attempts: VENTURE_INTAKE_RATE_LIMIT.maxAttempts,
      p_window_seconds: VENTURE_INTAKE_RATE_LIMIT.windowSeconds,
      p_dossier: input.dossier,
    });
    if (!result) throw new VentureIntakeStorageError("Supabase intake RPC returned no result");
    return normalizeRpcResult(result);
  }
  return acceptLocalVentureIntake(input);
}

export class VentureIntakeConfigurationError extends Error {}
export class VentureIntakeStorageError extends Error {}

function normalizeRpcResult(value: AcceptVentureIntakeResult): AcceptVentureIntakeResult {
  return {
    accepted: value.accepted === true,
    replayed: value.replayed === true,
    rateLimited: value.rateLimited === true,
    dossierId: typeof value.dossierId === "string" ? value.dossierId : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    retryAfterSeconds: Number.isFinite(value.retryAfterSeconds) ? Math.max(1, Math.ceil(Number(value.retryAfterSeconds))) : undefined,
  };
}

async function acceptLocalVentureIntake(input: AcceptVentureIntakeInput): Promise<AcceptVentureIntakeResult> {
  const filePath = process.env.AIOW_VENTURE_INTAKE_LOCAL_STORE;
  if (!filePath) throw new VentureIntakeConfigurationError("Local venture intake store path is missing");
  return withFileLock(filePath, async () => {
    const state = await readLocalState(filePath);
    const existing = state.requests[input.requestKeyHash];
    if (existing) {
      return { accepted: true, replayed: true, rateLimited: false, dossierId: existing.dossierId, createdAt: existing.createdAt };
    }

    const now = new Date();
    const bucket = state.rateBuckets[input.rateKeyHash];
    const resetAt = bucket ? new Date(bucket.resetAt) : null;
    if (!bucket || !resetAt || resetAt.getTime() <= now.getTime()) {
      state.rateBuckets[input.rateKeyHash] = {
        count: 1,
        windowStartedAt: now.toISOString(),
        resetAt: new Date(now.getTime() + VENTURE_INTAKE_RATE_LIMIT.windowSeconds * 1000).toISOString(),
      };
    } else if (bucket.count >= VENTURE_INTAKE_RATE_LIMIT.maxAttempts) {
      return {
        accepted: false,
        replayed: false,
        rateLimited: true,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
      };
    } else {
      bucket.count += 1;
    }

    state.requests[input.requestKeyHash] = { dossierId: input.dossier.dossierId, createdAt: input.dossier.createdAt };
    state.dossiers[input.dossier.dossierId] = input.dossier;
    pruneLocalState(state, now);
    await writeLocalState(filePath, state);
    return {
      accepted: true,
      replayed: false,
      rateLimited: false,
      dossierId: input.dossier.dossierId,
      createdAt: input.dossier.createdAt,
    };
  });
}

function emptyLocalState(): LocalState {
  return { version: 1, requests: {}, rateBuckets: {}, dossiers: {} };
}

async function readLocalState(filePath: string): Promise<LocalState> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<LocalState>;
    if (parsed.version !== 1) throw new Error("unsupported state version");
    return {
      version: 1,
      requests: parsed.requests || {},
      rateBuckets: parsed.rateBuckets || {},
      dossiers: parsed.dossiers || {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyLocalState();
    throw new VentureIntakeStorageError("Local venture intake state could not be read");
  }
}

async function writeLocalState(filePath: string, state: LocalState): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(state), { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, filePath);
}

async function withFileLock<T>(filePath: string, operation: () => Promise<T>): Promise<T> {
  const lockPath = `${filePath}.lock`;
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const deadline = Date.now() + 5000;
  while (true) {
    try {
      await mkdir(lockPath, { mode: 0o700 });
      const owner = await open(path.join(lockPath, "owner"), "w", 0o600);
      await owner.writeFile(`${process.pid}\n${new Date().toISOString()}\n`);
      await owner.close();
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      try {
        const lockStat = await stat(lockPath);
        if (Date.now() - lockStat.mtimeMs > 15_000) {
          await rm(lockPath, { recursive: true, force: true });
          continue;
        }
      } catch {
        continue;
      }
      if (Date.now() >= deadline) throw new VentureIntakeStorageError("Local venture intake lock timed out");
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  try {
    return await operation();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

function pruneLocalState(state: LocalState, now: Date): void {
  for (const [key, bucket] of Object.entries(state.rateBuckets)) {
    if (new Date(bucket.resetAt).getTime() + 86_400_000 < now.getTime()) delete state.rateBuckets[key];
  }
  for (const [dossierId, dossier] of Object.entries(state.dossiers)) {
    if (new Date(dossier.expiresAt).getTime() <= now.getTime()) {
      delete state.dossiers[dossierId];
      for (const [requestKey, request] of Object.entries(state.requests)) {
        if (request.dossierId === dossierId) delete state.requests[requestKey];
      }
    }
  }
}
