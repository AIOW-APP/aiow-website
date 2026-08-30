import { handleMailOutboxRunV1 } from "@/lib/aiow-v1/mail-run-route.mjs";
import { buildMailProviderOptions } from "@/lib/aiow-v1/mail-provider-options.mjs";
import { executeMailOutboxRun } from "@/lib/aiow-v1/mail-outbox-worker.mjs";
import { createMailOutboxStore, mailOutboxConfigured } from "@/lib/aiow-v1/mail-outbox-store";
import { quoteAdapterRpc } from "@/lib/aiow-v1/quote-adapter-store";

export const runtime = "nodejs";
export function POST(request: Request) {
  return handleMailOutboxRunV1(request, {
    configured: mailOutboxConfigured,
    rpc: quoteAdapterRpc,
    execute: executeMailOutboxRun,
    createStore: createMailOutboxStore,
    buildProviderOptions: buildMailProviderOptions,
  });
}
