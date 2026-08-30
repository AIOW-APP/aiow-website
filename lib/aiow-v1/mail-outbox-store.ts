import { quoteAdapterRpc, supabaseConfigured } from "./quote-adapter-store";

type Env = NodeJS.ProcessEnv;
type Fetch = typeof fetch;
type LeaseItem = Record<string, unknown>;
function leaseArgs(item: LeaseItem) {
  return {
    p_job_id:item.id,
    p_lease_owner:item.leaseOwner,
    p_lease_token:item.leaseToken,
    p_expected_revision:item.revision,
    p_payload_digest:item.payloadSha256,
  };
}
function plain(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function stable(value: unknown) { return JSON.stringify(value); }
export function mailOutboxConfigured(env: Env = process.env) {
  return supabaseConfigured(env) && Boolean(env.AIOW_MAIL_WORKER_SECRET && env.AIOW_MICROSOFT_CLIENT_SECRET && env.AIOW_MICROSOFT_TENANT_ID && env.AIOW_MICROSOFT_APPLICATION_ID && env.AIOW_MICROSOFT_MAILBOX === "info@aiow.io" && env.AIOW_MICROSOFT_SENDER === "info@aiow.io" && env.AIOW_MICROSOFT_CONTROL_MAILBOX && env.AIOW_MICROSOFT_CONTROL_MAILBOX !== "info@aiow.io");
}
export function createMailOutboxStore(options: { env?: Env; fetchImpl?: Fetch } = {}) {
  const env = options.env ?? process.env; const fetchImpl = options.fetchImpl;
  const rpc=(name:string,args:Record<string,unknown>)=>quoteAdapterRpc(name,args,{env,fetchImpl});
  return {
    claim: (args: Record<string, unknown>) => rpc("aiow_mail_outbox_claim_v2", args),
    finalize: (name: string, args: Record<string, unknown>) => rpc(name, args),
    async markDispatch(item: LeaseItem) {
      const ack = await rpc("aiow_mail_outbox_dispatch_v2", leaseArgs(item));
      if (!plain(ack) || Object.keys(ack).length !== 4 || ack.schemaKind !== "outbox_dispatch_ack" || ack.jobId !== item.id || ack.leaseToken !== item.leaseToken || typeof ack.dispatchStartedAt !== "string" || !Number.isFinite(Date.parse(ack.dispatchStartedAt))) throw new Error("mail dispatch marker invalid");
    },
    loadJobs: (items: LeaseItem[]) => Promise.all(items.map((item)=>rpc("aiow_mail_outbox_load_leased_job_v1",leaseArgs(item)))),
    async loadProviderGate(items: LeaseItem[]) {
      if (!items.length) throw new Error("provider gate lease unavailable");
      const gates=await Promise.all(items.map((item)=>rpc("aiow_mail_provider_gate_load_for_lease_v1",leaseArgs(item))));
      const expected=stable(gates[0]);
      if(gates.some((gate)=>stable(gate)!==expected)) throw new Error("provider gate changed across leased batch");
      return gates[0];
    },
  };
}
