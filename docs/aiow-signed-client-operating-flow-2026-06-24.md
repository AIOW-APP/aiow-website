# AIOW signed-client operating flow — admin → contract → Telegram/Spunky → build

Date: 2026-06-24
Status: implemented as MVP preview flow in AIOW admin/customer portal

## Goal

Per nieuwe AIOW-klant moet Team AIOW na analyse direct kunnen reageren met:

1. hoe we dit gaan aanvliegen;
2. welk deal/contractmodel hoort bij de klant;
3. wat klant moet tekenen;
4. wat er na akkoord automatisch operationeel moet gebeuren;
5. hoe Spunky en intern AIOW alle info blijven opvangen.

## Implemented MVP flow

### 1. Private pre-intake

- Public `/nl/aanmelden` vraagt alleen minimale gegevens.
- Gevoelige data hoort in `/portal/customer/[accountId]` na account-ID + toegangscode.

### 2. Admin review

- `/portal/admin/accounts` is nu admin-gated met:
  - `Richard@aiow.io` as owner admin;
  - `Jeroen@aiow.io` as admin;
  - `AIOW_ADMIN_TOKEN` local/preview guard.

Admin ziet per account:

- status;
- contact;
- project;
- AIOW dealadvies;
- slagingskans/uniekheid;
- revenue/resale advies;
- next operating path: Deal Card → contract → Telegram groep met Spunky → interne AIOW bouwcontext.

### 3. Contract + advies

Admin kan per account klikken:

> Maak contract + advies

Dit genereert een contract/advice draft met:

- AIOW aanpak;
- dealmodel;
- scope;
- klantverantwoordelijkheden;
- Team setup;
- dashboardstatus + verbeteradvies;
- commerciële basis;
- juridische/operationele voorwaarden;
- signing URL.

### 4. Customer signing

Klant opent:

`/contract/[contractId]?code=[secret]`

Klant ziet voorstel en tekent digitaal met:

- naam;
- rol/functie;
- e-mail.

Na signing krijgt het contract status `SIGNED`.

### 5. Post-sign team flow

Na ondertekening:

1. AIOW maakt Telegram projectgroep aan met klant + Richard/Jeroen + Spunky.
2. Spunky wordt contact-AI/contextcollector in die klantgroep.
3. Spunky vangt vragen, beslissingen, documenten, context en acties op.
4. Interne AIOW chat gebruikt die context voor bouw, analyse, marketing/growth en QA.
5. Dashboard blijft source-of-truth voor status, advies, risico's, KPI's en proof.

## Production hardening still needed

This is a working MVP/preview, not yet legal-grade production infra.

Before production use:

- replace local admin token with real auth/RBAC;
- add signed magic links or auth provider for contract access;
- add immutable audit log;
- add PDF export;
- add email sending via Resend/postmark with delivery logs;
- add explicit legal review for equity/profit-share/participation;
- add Telegram group creation automation via Spunky bridge;
- add customer/project status tables in database instead of JSONL preview store;
- add admin notifications after customer signs.
