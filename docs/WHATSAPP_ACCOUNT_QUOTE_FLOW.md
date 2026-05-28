# AIOW WhatsApp → account → offerte → planning flow

Status: product/architecture blueprint. Do not activate live WhatsApp automation until provider, database and privacy/legal choices are approved.

## Goal
When someone contacts AIOW through WhatsApp, create a secure customer account/lead record so they can:

1. review their AI-systeemscan/offerte;
2. approve or reject the offer;
3. after approval, choose planning/intake moments;
4. track status, assumptions, documents and next actions.

## Recommended customer journey

1. **Inbound WhatsApp**
   - Lead sends first message to AIOW.
   - WhatsApp provider webhook receives sender phone, profile name and message body.
   - System creates or updates `Account` + `LeadConversation`.
   - System replies with a short consent-safe message and a secure portal link.

2. **Account creation**
   - Account is phone-number keyed, but not phone-only authenticated.
   - User receives a magic-link or OTP to verify ownership.
   - Portal asks only minimal fields: name, company, email, role, project context.

3. **Offerte preparation**
   - Internal AIOW admin creates `Quote` linked to the account.
   - Quote includes scope, assumptions, data boundary, price, expected timeline, payment terms and expiry date.
   - User can view quote in portal.

4. **Offer acceptance**
   - User approves digitally with explicit checkbox:
     - understands scope/assumptions;
     - agrees to terms/privacy;
     - confirms they are authorised to approve.
   - System records timestamp, IP hash/user agent, quote version, and acceptance text.

5. **Planning after approval**
   - Approved quote unlocks scheduling.
   - User chooses intake/project kickoff slot.
   - Calendar integration only after approval: Google Calendar/Cal.com/Calendly or internal slots.

6. **Project status**
   - Portal shows status: intake planned → discovery → proposal finalised → build/pilot → handover.
   - Documents and notes are visible per account.

## Data model draft

```ts
type Account = {
  id: string;
  phoneE164: string;
  phoneVerifiedAt?: string;
  email?: string;
  companyName?: string;
  contactName?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
};

type LeadConversation = {
  id: string;
  accountId: string;
  provider: "whatsapp_cloud" | "twilio" | "manual";
  providerContactId: string;
  lastInboundAt: string;
  status: "new" | "qualified" | "quote_requested" | "quoted" | "accepted" | "scheduled" | "closed";
  summary?: string;
};

type Quote = {
  id: string;
  accountId: string;
  version: number;
  title: string;
  scope: string;
  assumptions: string[];
  dataBoundary: string;
  priceExVat: number;
  currency: "EUR";
  validUntil: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  acceptedAt?: string;
  acceptanceEvidence?: {
    text: string;
    ipHash?: string;
    userAgent?: string;
  };
};

type PlanningSlot = {
  id: string;
  quoteId: string;
  startsAt: string;
  endsAt: string;
  status: "available" | "reserved" | "confirmed" | "cancelled";
};
```

## Routes/API draft

Public/provider webhooks:
- `POST /api/whatsapp/inbound` — receive WhatsApp webhook; verify provider signature.
- `GET /api/whatsapp/inbound` — provider verification challenge if required.

Customer portal:
- `GET /portal/login?phone=...` — request magic link/OTP.
- `GET /portal` — account dashboard.
- `GET /portal/quotes/:quoteId` — quote view.
- `POST /api/quotes/:quoteId/accept` — accept quote.
- `GET /portal/planning` — available slots after acceptance.
- `POST /api/planning/reserve` — reserve/confirm slot.

Admin/internal:
- `GET /admin/leads`
- `GET /admin/accounts/:id`
- `POST /admin/quotes`
- `POST /admin/planning-slots`

## Provider choices

Recommended options:
1. **WhatsApp Business Cloud API** — direct Meta integration, more setup, best long-term control.
2. **Twilio WhatsApp** — faster setup, paid middleware, easier webhook handling.
3. **Manual phase 1** — WhatsApp remains normal CTA; AIOW admin manually creates account/offerte in portal.

## Storage/auth choices

Recommended for fast professional build:
- Database: Supabase Postgres or Neon Postgres.
- Auth: magic link via Supabase Auth, Clerk, or custom OTP.
- Scheduling: Cal.com or Google Calendar integration after approval.
- File storage: Supabase Storage or Vercel Blob.

## Safety/legal requirements before activation

- WhatsApp provider approved and connected.
- Webhook signature verification enabled.
- Database selected and credentials added as environment variables.
- Privacy policy updated for WhatsApp/account/portal processing.
- Terms/offerte acceptance text legally reviewed.
- No sensitive business data requested in WhatsApp before consent and data-boundary explanation.

## Suggested implementation phases

### Phase 1 — Portal without automation
Manual lead/account creation, quote view, quote acceptance, planning page.

### Phase 2 — WhatsApp webhook
Inbound WhatsApp creates/updates account and sends portal link.

### Phase 3 — Full automation
Admin quote builder, notifications, scheduling integration, documents, project status.
