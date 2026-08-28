# AIOW quote adapter contract v1

## Status and trust boundary

`POST /api/quote` is preview-safe and fail-closed. It never calls Google Workspace or SMTP directly. `AIOW_QUOTE_WEBHOOK_URL` identifies one durable adapter and `AIOW_QUOTE_WEBHOOK_SECRET` authenticates every exact body. If either is absent, the API returns `503`. The same URL, `idempotency-key`, `x-aiow-request-id`, request ID and idempotency key are used for both phases.

Every adapter request carries `x-aiow-webhook-timestamp` and `x-aiow-webhook-signature`. The signature is lowercase HMAC-SHA256 over a v1 canonical string containing method, path/query, Unix timestamp, request ID, idempotency key and SHA-256 of the exact transmitted JSON bytes. The adapter verifies it in constant time before parsing JSON and rejects more than five minutes of clock skew.

The built-in disabled adapter endpoint is `POST /api/internal/quote-adapter`. It calls only security-definer PostgREST RPCs using server-side `AIOW_SUPABASE_URL` and `AIOW_SUPABASE_SERVICE_ROLE_KEY`; it performs no direct table writes and is `503` until all required variables exist.

The adapter is the authority for sequential quote numbers, durable leads, PDFs and both mail-outbox jobs. A `2xx` alone is insufficient: every response must be JSON and contain the exact acceptance shape below.

## Phase 1 — prepare

Request body:

```json
{
  "operation": "prepare",
  "schemaVersion": 1,
  "requestId": "uuid",
  "idempotencyKey": "client-operation-key",
  "receivedAt": "ISO-8601",
  "country": "NL",
  "quote": { "schemaVersion": 1, "configuration": {}, "primary": {}, "smartDesign": [] },
  "contact": {},
  "consent": { "accepted": true, "version": "aiow-quote-v1" },
  "source": { "route": "/", "locale": "nl" }
}
```

The country is copied only from Vercel's trusted `x-vercel-ip-country` header. No raw IP belongs in this contract. In one database transaction the adapter must reserve the next yearly number and create or return the initial lead. Success is only:

```json
{"accepted":true,"quoteNumber":"AIOW-2026-0001","leadId":"uuid","receivedAt":"2026-08-28T14:15:16.123Z"}
```

`receivedAt` is the first durable receipt timestamp. A retry may have a new transport request ID and wall-clock time, but the adapter returns the original stored timestamp so the internal transactional mail and commit payload remain byte-stable. Idempotency hashes the immutable commercial request (quote, contact, consent, source and country), not transport metadata. The API validates that the number year equals the current Europe/Amsterdam year. IDs and timestamps are strictly bounded. Any timeout, non-2xx, non-JSON or malformed body becomes `502`.

## Phase 2 — commit

After prepare succeeds, the API generates the PDF and posts:

```json
{
  "operation": "commit",
  "schemaVersion": 1,
  "requestId": "same uuid",
  "idempotencyKey": "same key",
  "quoteNumber": "AIOW-2026-0001",
  "leadId": "safe-id",
  "pdf": { "filename": "AIOW-2026-0001.pdf", "mimeType": "application/pdf", "base64": "...", "sha256": "..." },
  "customerMail": { "from": "offerte@aiow.ai", "to": "customer@example.com", "subject": "...", "text": "...", "html": "..." },
  "internalMail": { "from": "offerte@aiow.ai", "to": "offerte@aiow.ai", "subject": "...", "text": "...", "html": "..." },
  "quote": {}, "contact": {}, "source": {}, "country": "NL"
}
```

The adapter must verify the SHA-256 over decoded PDF bytes, verify the PDF signature and atomically persist the PDF plus **two** outbox jobs linked to the prepared lead. Success is only `2xx application/json` with `{"accepted":true}`. Until that response is received, the browser receives no PDF and no success receipt.

## Suggested relational model

```sql
quote_sequences(year int primary key, next_value int not null check (next_value between 1 and 9999));

quote_leads(
  id text primary key,
  idempotency_key text not null unique,
  request_id uuid not null,
  quote_number text not null unique,
  status text not null check (status in ('prepared','committed')),
  normalized_quote jsonb not null,
  contact jsonb not null,
  consent jsonb not null,
  source jsonb not null,
  country char(2),
  received_at timestamptz not null,
  committed_at timestamptz
);

quote_documents(
  lead_id text primary key references quote_leads(id),
  filename text not null,
  mime_type text not null check (mime_type='application/pdf'),
  bytes bytea not null,
  sha256 char(64) not null unique
);

mail_outbox(
  id bigserial primary key,
  lead_id text not null references quote_leads(id),
  kind text not null check (kind in ('customer_quote','internal_lead')),
  dedupe_key text not null unique,
  payload jsonb not null,
  state text not null check (state in ('pending','claimed','sent','retry','dead')),
  attempts int not null default 0,
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error_code text,
  unique (lead_id, kind)
);
```

Prepare should lock/upsert `quote_sequences` and insert `quote_leads` in one transaction. A replay of the same idempotency key returns the same quote number and lead ID; a key reused with a different normalized payload is rejected. Commit locks the lead, verifies key/number/ID/payload consistency, then inserts the document, both outbox rows and marks the lead committed in one transaction. A replay returns accepted only if the stored document hash and both jobs match.

## Outbox state machine

`pending → claimed → sent` is the happy path. Workers claim with `FOR UPDATE SKIP LOCKED` and an expiring lease. A transient pre-acceptance provider error moves `claimed → retry` with bounded exponential backoff; `retry → claimed` when due. Permanent failure or an attempt ceiling moves to `dead`. An expired claimed lease is recovered in a bounded `SKIP LOCKED` batch directly to `review` with a delivery-attempt audit row: after a worker crash the system cannot prove whether provider submission began, so it must never auto-resend.

`review` is a non-resend quarantine. A lost Gmail send response may mean the provider accepted the message; any failure reading, parsing or validating a Gmail 2xx response is equally ambiguous; and a Gmail success followed by database-finalization failure is ambiguous too. None is automatically retried: the worker calls `aiow_quote_outbox_review_v1`, preserves the known provider ID when available and requires operator reconciliation. Gmail does not guarantee deduplication from `Message-ID`, so this quarantine is mandatory to avoid blind duplicate customer mail. Never delete the durable lead/PDF when delivery fails.

## Google Workspace outbox worker

`POST /api/internal/quote-outbox/run` is disabled until the Supabase variables, `AIOW_QUOTE_WORKER_SECRET`, service-account email/private key and delegated subject are present. Authorization is constant-time bearer comparison against the worker secret or `CRON_SECRET`. No cron is registered by this branch: scheduling is a separate owner-approved activation step.

The worker claims at most five jobs through `aiow_quote_claim_outbox_v1` with `FOR UPDATE SKIP LOCKED` and expiring leases. The customer job includes the stored PDF; the internal lead job is forbidden from carrying an attachment. It creates an RS256 service-account assertion for domain-wide delegation to exactly `offerte@aiow.ai`, requests only `gmail.send`, then calls Gmail `users/me/messages/send`. Provider acceptance is recorded with `aiow_quote_outbox_sent_v1`; 408/429/5xx and documented 403 rate-limit reasons retry, permanent 4xx/schema/config failures go dead, and send-network/post-acceptance ambiguity goes review. Finalization always requires the active lease token.

Production variables are listed by name only in `.env.example`. Google Admin domain-wide delegation, the service account, `offerte@aiow.ai`, SPF/DKIM/DMARC, provider credentials and scheduling are **not configured by this code**.

## Activation, observability and rollback

1. Apply `supabase/migrations/20260828_aiow_quote_adapter_v1.sql` to the intended isolated Supabase project and run the PostgreSQL proof against a disposable database first.
2. Configure Supabase service-role variables and a fresh 32+ byte webhook secret; point `AIOW_QUOTE_WEBHOOK_URL` to the HTTPS internal adapter endpoint. Production adapter, PostgREST, OAuth and Gmail requests require HTTPS and reject redirects. Plain HTTP is accepted only for explicit localhost proof mode. Verify prepare/commit with a non-customer test address before enabling UI traffic.
3. Separately configure Google Workspace domain-wide delegation and worker variables. Invoke the worker manually and prove customer attachment plus internal no-attachment delivery before scheduling.
4. Monitor counts by `mail_outbox.state`, oldest `available_at`, expired leases, attempt count, dead/review jobs and provider delivery attempts. `review` requires reconciliation before any deliberate resend. Never log contact or mail bodies.
5. Rollback is fail-closed: unset webhook URL/secret to stop new quote success; unset worker/Google variables to stop delivery while preserving leads, PDFs and outbox rows. Do not delete durable records. DNS/MX and the existing website remain untouched.

No production, Workspace, DNS, mail-routing or provider activation is part of this branch.
