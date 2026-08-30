import { secureServiceUrl } from "./quote-adapter-auth.mjs";
import { quoteAdapterRpc, supabaseConfigured } from "./quote-adapter-store";

type Env = NodeJS.ProcessEnv;
type Fetch = typeof fetch;
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
function plain(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
async function boundedJson(response: Response) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) throw new Error("mail store response too large");
  try { return JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown; } catch { throw new Error("mail store response invalid"); }
}
function storeRoot(env: Env) {
  if (!supabaseConfigured(env)) throw new Error("mail store disabled");
  return secureServiceUrl(env.AIOW_SUPABASE_URL!, env.AIOW_MAIL_PROVIDER_TEST_MODE === "1");
}
async function getRows(path: string, options: { env?: Env; fetchImpl?: Fetch } = {}) {
  const env = options.env ?? process.env; const key = env.AIOW_SUPABASE_SERVICE_ROLE_KEY!;
  const response = await (options.fetchImpl ?? fetch)(new URL(path, storeRoot(env)), { method:"GET", headers:{apikey:key,authorization:`Bearer ${key}`,accept:"application/json"}, signal:AbortSignal.timeout(8_000), cache:"no-store", redirect:"error" });
  const payload = await boundedJson(response); if (!response.ok || !Array.isArray(payload)) throw new Error("mail store read failed"); return payload;
}
export function mailOutboxConfigured(env: Env = process.env) {
  return supabaseConfigured(env) && Boolean(env.AIOW_MAIL_WORKER_SECRET && env.AIOW_MICROSOFT_CLIENT_SECRET && env.AIOW_MICROSOFT_TENANT_ID && env.AIOW_MICROSOFT_APPLICATION_ID && env.AIOW_MICROSOFT_MAILBOX === "info@aiow.io" && env.AIOW_MICROSOFT_SENDER === "info@aiow.io" && env.AIOW_MICROSOFT_CONTROL_MAILBOX);
}
export function createMailOutboxStore(options: { env?: Env; fetchImpl?: Fetch } = {}) {
  const env = options.env ?? process.env; const fetchImpl = options.fetchImpl;
  return {
    claim: (args: Record<string, unknown>) => quoteAdapterRpc("aiow_mail_outbox_claim_v2", args, { env, fetchImpl }),
    finalize: (name: string, args: Record<string, unknown>) => quoteAdapterRpc(name, args, { env, fetchImpl }),
    async loadJobs(items: Array<Record<string, unknown>>) {
      const ids = items.map((item) => String(item.id));
      if (!ids.length) return [];
      const filter = encodeURIComponent(`(${ids.join(",")})`);
      const rows = await getRows(`/rest/v1/commercial_mail_outbox?select=id,payload&id=in.${filter}`, { env, fetchImpl });
      const itemById = new Map(items.map((item) => [item.id, item]));
      return rows.map((row) => {
        if (!plain(row) || typeof row.id !== "string" || !plain(row.payload)) return row;
        const item = itemById.get(row.id); if (!item) return row.payload;
        return { ...row.payload, schemaKind:"mail_job", jobId:item.id, commercialLeadId:item.commercialLeadId, kind:item.kind, payloadSha256:item.payloadSha256, attempt:item.attempts, leaseOwner:item.leaseOwner, leaseToken:item.leaseToken, leaseExpiresAt:item.leaseExpiresAt };
      });
    },
    async loadProviderGate() {
      const rows = await getRows("/rest/v1/commercial_provider_gates?select=gate_id,state,target,evidence_sha256,revision,owner_approved_by,approved_at,expires_at,approval_binding_sha256&gate_id=eq.mail_provider_production_v1&limit=2", { env, fetchImpl });
      if (rows.length !== 1 || !plain(rows[0]) || !plain(rows[0].target)) throw new Error("provider gate unavailable");
      const row = rows[0]; const target = row.target as Record<string, unknown>;
      return { schemaKind:"provider_gate_record", gateId:row.gate_id, state:row.state, ...target, evidenceSha256:row.evidence_sha256, revision:row.revision, ownerApprovedBy:row.owner_approved_by, approvedAt:row.approved_at, expiresAt:row.expires_at, approvalBindingSha256:row.approval_binding_sha256 };
    },
  };
}
