# AIOW quote adapter contract v1

## Status and trust boundary

`POST /api/quote` is preview-safe and fail-closed. It never calls Google Workspace, SMTP, a database, or any other production provider directly. `AIOW_QUOTE_WEBHOOK_URL` must identify one durable adapter. If it is absent, the API returns `503` and does not parse a successful quote request. The same URL, `idempotency-key` header, `x-aiow-request-id` header, request ID and idempotency key are used for both phases.

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
{"accepted":true,"quoteNumber":"AIOW-2026-0001","leadId":"safe-id"}
```

The API validates that the number year equals the current Europe/Amsterdam year. IDs are bounded to 128 safe characters. Any timeout, non-2xx, non-JSON or malformed body becomes `502`.

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

`pending → claimed → sent` is the happy path. Workers claim with `FOR UPDATE SKIP LOCKED` and an expiring lease. A transient provider error moves `claimed → retry` with bounded exponential backoff; `retry → claimed` when due. Permanent failure or an attempt ceiling moves to `dead` and alerts an operator. A stale claim is recoverable to `retry`. Never mark sent before provider acceptance, and never delete the durable lead/PDF when delivery fails.

## Future Google Workspace boundary

A future worker may translate the two stored mail payloads into Google Workspace API messages from `offerte@aiow.ai`, attaching the stored PDF to the customer mail only. OAuth/service-account credentials, DKIM/SPF/DMARC setup, group configuration and provider message IDs live exclusively in that adapter/worker boundary—not in Next.js, client code or this repository's preview environment. Provider message IDs should be stored on the outbox row for audit and deduplication. Enabling that boundary requires separate owner-approved Workspace and production work.
