# AIOW Growth Sprints — implementation plan

**Canonical base:** `origin/main` at `dde638266e11a0de929ef1399c189a3f593aa0de`

**Machine authority:** `docs/contracts/aiow-commercial-control-plane-v1.json`

**Product-art authority:** `DESIGN-DNA.md`

## Release invariants

- Keep `https://aiow.ai` and `https://www.aiow.ai` available throughout.
- Do not mutate DNS, MX, Workspace or mail routing.
- Booking and quote stay fail-closed until a durable adapter and transaction mail provider pass exact-target proof.
- Server recomputes prices. Browser totals are never authoritative.
- No PII in analytics, logs, URLs, query-string credentials or public dashboard responses.
- Operations data is inaccessible on custom production domains and additionally requires a configured operator authority.
- One writer in the sprint worktree. Reviews run only after a frozen candidate.
- Every database change is append-only and proven zero→head plus production-baseline→head.
- Every release keeps `dpl_Ac8UgbHd8ikALvnmSCnLcESuoq6z` and `dpl_FnRrnDT1jDZsea6RnfciPVLkSx2V` available as rollback identities until the new production release is verified.

## Sprint 1 — close the revenue leak

### 1. Durable booking

- Add an append-only commercial-control-plane migration.
- Commit a booking request and exactly two transaction mail jobs atomically.
- Preserve immutable idempotency: same key/same canonical payload replays; changed payload conflicts.
- Treat selected date/time as a preference pending human confirmation.
- Generate ICS only after durable acceptance and label it honestly.
- Add HTTP, SQL, concurrency and browser tests.

### 2. Quote outbox and transaction mail

- Preserve two-phase prepare/commit and the PDF hash contract.
- Replace hard-coded Gmail/`offerte@aiow.ai` authority with an explicit provider adapter.
- Implement Microsoft Graph as the production-fit provider for the existing `aiow.io` Microsoft 365 domain; unconfigured provider fails closed.
- Use the verified public identity `info@aiow.io` until a separately proven shared mailbox/alias is approved.
- Keep ambiguous network outcomes in review; never resend automatically after possible provider acceptance.

### 3. Commercial queue and dashboard

- Unify booking and quote into a closed queue projection with unread/actionable/SLA/exception counts.
- Enforce revision-bound transitions and an explicit lifecycle matrix.
- Expose no PII publicly.
- Custom-domain ops routes return 404; deployment-host access additionally requires configured operator authority and never accepts query-string tokens.
- Add positive/negative authority and optimistic-concurrency tests.

### 4. Privacy-safe conversion events

- Add a first-party event endpoint with a closed event/property vocabulary.
- Reject PII, arbitrary URLs, raw UTM values, names, e-mail, phone, free text and identifiers.
- Mount only allowlisted CTA, calculator, booking and quote events.
- Store no IP; use no persistent visitor identity or replay.
- Add route/event/privacy tests and a closed aggregate report.

### 5. Contact and trust

- Add bilingual company/contact pages with only verified facts.
- Publish `AIOW B.V.`, KvK `71887466`, `info@aiow.io`, service area Netherlands and current public privacy/process boundaries.
- Do not invent VAT, address, clients, accreditations or legal-review status.
- Explain that applicable conditions and final scope are supplied with a written proposal.
- Add footer/header links, metadata, schema and tests.

### Sprint 1 gates

- Baseline/focused/unit/SQL/concurrency tests.
- Full lint, TypeScript, 56+ test suite and Next build.
- Independent spec and security/quality reviews on a frozen sprint commit.
- Protected preview and full browser matrix.
- Provider readiness proof remains separate from production activation.

## Sprint 2 — raise conversion quality

### 1. Scan deliverable

Add a compact bilingual “what the scan delivers” block: current situation, selected workflow/space, verified inputs, dependencies, human checkpoints, exceptions, recommended pilot, exclusions, published price basis and next decision. Present it as the structure of a deliverable, not a completed customer result.

### 2. Calculator decision summary

Show one recommendation derived from canonical pricing rules, why it fits, implementation/monthly indication, exclusions, final-price drivers, and one dominant next action. Preserve server recomputation and all 15×2 crawlable context routes.

### 3. Context-specific CTA

Map every context route to a specific, honest item to bring to the scan. Keep the booking payload closed; do not introduce arbitrary hidden fields.

### 4. Three product demonstrations

Publish bilingual, clearly labelled demonstrations using only public or synthetic inputs:

1. workflow triage;
2. grounded knowledge;
3. Smart Office signal-to-task.

Each must disclose what is synthetic, what is actually demonstrated, human decision points, limitations and prohibited inference. No customer, ROI, accuracy or savings claims.

### 5. SLA and exception signals

Expose deterministic first-response target and overdue/exception state in the operator queue. No LLM decides rejection, price or commercial commitment.

### Sprint 2 gates

- Pricing-boundary and tampering tests.
- 320/390/768/1440, NL/EN, Light/Dark/System, reduced-motion and keyboard proof.
- Demonstration truth-label tests.
- Independent spec and product-art/accessibility/security reviews on the frozen commit.

## Sprint 3 — controlled growth

### 1. Evidence-led knowledge bank

- Add `/kennis`, `/en/knowledge` and paired article routes.
- Initial articles answer high-intent questions with a date, accountable reviewer, primary sources, claim-state labels, limitations and contextual CTA.
- Add Article/Breadcrumb/FAQ schema only where visible content supports it.
- Include pages in sitemap, `llms.txt`, `llms-full.txt` and `business.json`.

### 2. Search/indexation and reporting

- Add an IndexNow submitter that reads the live sitemap and uses the existing public key file.
- Keep Search Console/Bing ownership and submissions as external provider gates unless credentials and property authority are proven.
- Add privacy-safe aggregate conversion reporting; no person-level analytics.
- Any recurring automation must be silent on no-change, script-only where possible, and only created after production routes are verified.

### 3. CTA/scan experiment architecture

- Use server-owned experiment definitions and allowlisted variants.
- Stable assignment may use only a first-party variant cookie; no visitor identity.
- Exposure counts only when rendered; conversion uses the same variant and canonical event vocabulary.
- No client-authored variant, pricing or hidden targeting.
- Ship one bounded CTA/scan-copy experiment only after both variants pass content review.

### 4. Performance

- Remove dormant public JavaScript and unnecessary font weights where measured.
- Preserve identity and accessibility.
- Require at least five cold mobile Lighthouse runs on one immutable preview and report median plus individual LCP/CLS/TBT.
- Lab acceptance: median LCP <2.0 s, CLS ≤0.1, TBT ≤200 ms.
- Field p75 is reported separately as pending until sufficient Search Console/CrUX or approved first-party RUM exists.

### Sprint 3 gates

- Knowledge/source/schema/locale/route-policy tests.
- Full sitemap and machine-endpoint readback.
- IndexNow dry-run plus controlled live submission only after production promotion.
- Immutable preview browser, Lighthouse and independent growth/performance/security review.

## Integration and release sequence

For each sprint: implement → focused proof → commit → frozen spec review → frozen quality/security/product review → protected preview → browser/readback → merge only when the sprint is internally complete. The three sprints may share one final PR only if each sprint commit and review boundary remains independently identifiable. Production database, Graph app, Vercel environment and cron/indexation are separate provider writes with explicit target/readback and rollback proof.