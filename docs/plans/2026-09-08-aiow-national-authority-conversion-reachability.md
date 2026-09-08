# AIOW National Authority, Conversion and Reachability Plan

> **For Hermes:** Execute with one repository writer, TDD, two-stage review, protected PR, exact deployment and live-provider readback.

**Goal:** Make AIOW immediately understandable and convincing as the Dutch systems partner that makes business, buildings, homes and private life easier, while building a durable national search/AI-answer authority layer and verified contact routes to Jeroen.

**Architecture:** Preserve the approved Human Industrial homepage and Route Field. Improve conversion by one hero scan action, a compact owned-proof section and earlier pricing. Centralize public versus transactional contact identity, publish machine-readable entity facts, add a small high-intent bilingual answer library, and derive sitemap/LLM/IndexNow inputs from canonical manifests. Public contact, phone and transactional sender cutovers remain separately evidence-gated; target identities are not active channels.

**Tech stack:** Next.js 15 App Router, React 19, TypeScript, existing Human Industrial CSS modules, JSON-LD, Node test runner, Playwright/WebKit, Microsoft 365/Graph, Voys, Vercel.

**Evidence inputs:**
- Richard direction, 2026-09-08.
- Fable 5.1 Max consult: `/Users/handsomebastard/.fable-work/out-aiow-national-authority-20260908.md`.
- Dutch SEO/GEO research: `/Users/handsomebastard/.hermes/cache/delegation/subagent-summary-0-20260908_123345_623732.txt`.
- Official Google Search/AI guidance, Bing/IndexNow, OpenAI crawler and Anthropic crawler documentation cited in that report.

---

## Task 1 — Freeze contact identity without breaking transactional mail

**Files:**
- Modify `lib/aiow-v1/company.mjs`
- Modify `lib/aiow-v1/quote.mjs`
- Modify `lib/aiow-v1/microsoft-graph-provider.mjs`
- Modify contact/trust/quote tests

**Steps:**
1. Add RED tests requiring active `publicEmail=info@aiow.io`, separate `transactionalEmail=info@aiow.io`, target-only `targetPublicEmail=info@aiow.ai`, and `publicPhone=null` until Voys proof.
2. Keep quote/outbox `from` and internal destinations on the existing transactional sender; do not let the target shared mailbox silently break provider validation.
3. Render only `AIOW_COMPANY.publicEmail` on public pages, privacy contacts, schema and both LLM documents; `info@aiow.ai` is not active while delivery remains unverified.
4. Run focused mail/company tests.
5. Public publication gate: real external incoming delivery to `info@aiow.ai` and proof that the intended humans can open and read that shared mailbox. Mailbox existence or membership alone is insufficient.
6. Transactional sender cutover additionally requires real outbound delivery, SPF/DKIM/DMARC header authentication and provider authorization/configuration proof (including sender/Send As readback). No verified flags are inferred from target identity or unit tests.
7. Requested mailbox model: licensed primary `richard@aiow.ai` and `jeroen@aiow.ai`, shared `info@aiow.ai`. This repository correction does not change personal identities, license assignments or Raj/Darshan access; external provider changes remain outside its scope.

## Task 2 — One decisive homepage conversion path

**Files:**
- Modify `components/aiow-v1/HumanIndustrialHero.tsx`
- Modify `components/aiow-v1/HumanIndustrialHero.module.css`
- Modify `components/aiow-v1/LivingBlueprintHomepage.tsx`
- Modify `components/aiow-v1/LivingBlueprintHomepage.module.css`
- Modify `tests/aiow-v1/living-blueprint-homepage.test.mjs`

**Steps:**
1. RED: require the support promise “één systeem dat uw werk, gebouw of huis makkelijker maakt”.
2. RED: require one and only one hero button, `Start de scan`, after three semantic route links; no hero price button.
3. Add claim-safe microcopy; do not promise Jeroen/one-workday until routing/SLA proof exists.
4. Replace the oversized standalone authority slab with an owned proof block: scan output, human decision boundary, “soms is het antwoord: geen AI”.
5. Compress environments/method spacing while retaining details and all route truth.
6. Shorten final CTA; surface only active `AIOW_COMPANY.publicEmail` (`info@aiow.io` until the public publication gate passes); phone remains conditional.
7. Pixel targets: <=5,200px total at 390; pricing starts <=50%; all three worlds plus primary scan action usable without overlap; no generic two-button hero.

## Task 3 — Canonical entity and machine-readable business facts

**Files:**
- Create `app/business.json/route.ts`
- Modify `lib/aiow-v1/seo.tsx`
- Modify `components/aiow-v1/TrustPage.tsx`
- Modify `app/bedrijfsgegevens/page.tsx` and EN pair as needed
- Modify entity/trust tests

**Steps:**
1. RED: require legal name, KvK, exact address, service area, three service worlds, verified public email, conditional phone and no invented `sameAs`/certifications.
2. Enrich visible company/contact page as the canonical AIOW entity page; preserve legal route and NL/EN parity.
3. Add Organization/LocalBusiness-compatible `contactPoint`, logo and service facts only where visible and verified.
4. Serve `/business.json` with deterministic content and cache headers.
5. Validate JSON and schema consistency.

## Task 4 — Search and cloud-LLM crawler policy

**Files:**
- Modify `app/robots.ts`
- Modify `app/llms.txt/route.ts`
- Modify `app/llms-full.txt/route.ts`
- Modify crawler/SEO tests

**Steps:**
1. RED: explicitly allow Googlebot/Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User and PerplexityBot on public routes.
2. Keep GPTBot/ClaudeBot training policy separate from search/retrieval policy; do not claim crawler access guarantees citation.
3. Keep API/admin/portal authority paths blocked.
4. Rewrite machine text around “makkelijker work/building/home/private life”, current entity/contact and canonical answer pages.
5. State `llms.txt` is supplementary; visible content and normal SEO remain authoritative.

## Task 5 — Eight high-intent bilingual authority answers

**Files:**
- Create `lib/aiow-v1/authority-answers.tsx`
- Create `components/aiow-v1/AuthorityAnswerPage.tsx` and CSS
- Create `app/nl/kennis/[slug]/page.tsx`
- Create `app/en/knowledge/[slug]/page.tsx`
- Modify knowledge hub, route manifest, sitemap and tests

**Initial answer set:**
1. wat is maatwerk AI / what is bespoke AI
2. AI automatisering voor het MKB
3. AI-agent laten bouwen
4. AI koppelen aan bestaande systemen
5. wat kost een maatwerk AI-systeem
6. AI voor bedrijfspanden en gebouwbeheer
7. AI voor woningen en villa’s
8. hoe werkt een praktische AI-scan

**Content contract per page:**
- direct 40–60-word answer;
- who the page is for;
- suitable/not suitable conditions;
- AIOW process and human authority;
- cost/scope factors where applicable;
- 3–5 FAQs;
- named AIOW editorial responsibility, publish/update date and sources for external claims;
- one owned CTA;
- Article/FAQ/Breadcrumb/Service schema matching visible text;
- no invented volume, customer, ROI, duration, integrations or certification.

## Task 6 — Analytics and lead handoff

**Files:**
- Modify `core/analytics/client.ts`
- Modify hero/contact callsites and analytics tests

**Steps:**
1. Add closed non-PII events for `hero_scan_clicked`, `public_email_clicked`, `public_phone_clicked`, `authority_answer_opened`.
2. Preserve aggregate first-party behavior; no email/phone/free text in analytics.
3. Ensure quote/booking successes remain the real conversion events.
4. Define Jeroen-first operational handoff in provider configuration/docs, not in fabricated analytics state.

## Task 7 — IndexNow and discoverability operations

**Files:**
- Create public IndexNow key file
- Create `scripts/seo/indexnow-submit.mjs`
- Create deterministic monitor script/tests
- Add package scripts and documentation

**Steps:**
1. Fetch live sitemap dynamically; submit canonical changed URLs, never a stale hardcoded list.
2. Treat HTTP 200/202 as receipt only, not indexing proof.
3. Monitor homepage, three worlds, entity page, knowledge hub, one answer, sitemap, robots, llms and business.json.
4. Submit only after production readback.
5. Keep automated runs local or Team Handsome channel, never General/origin.

## Task 8 — Voys activation and phone publication

**Provider work:**
1. Preserve the prepared plan: one user + one 023 number, €21.60/month excl. VAT, no one-time fee.
2. Richard-only gate: private mobile, terms, CAPTCHA, identity/payment verification and final number choice.
3. Configure incoming 023 → Jeroen first (~20 sec) → Richard fallback; after-hours voicemail → public AIOW mailbox.
4. Run at least ten test calls across answered, no-answer, after-hours, outbound caller ID and voicemail-to-mail scenarios.
5. Only after PASS set `publicPhone`, publish `tel:` in header/final CTA/company page/schema/PDF/email signatures/GBP.
6. Never publish either private mobile number.

## Task 9 — External authority ownership gates

- Google Search Console domain property + sitemap + URL inspection.
- Google Business Profile real Hoofddorp entity, categories, hours, contact, real photos.
- Bing Webmaster Tools + AI Performance + Bing Places.
- Apple Business Connect.
- LinkedIn company facts and named people.
- Relevant third-party proof only after eligibility/consent; no mass directories or fake mentions.
- Monthly fixed query/prompt benchmark across Google, Bing/Copilot, ChatGPT, Claude, Gemini and Perplexity; record citations, not vibes.

## Task 10 — Release

1. Full Node suite, lint, typecheck and production build.
2. Browser proof all canonical routes in Day/Evening at 390/1440, no-JS all routes.
3. Pixel proof 320/375/390/768/1024/1440; homepage length/pricing position; hero first-action clarity.
4. Accessibility, reduced-motion, schema, crawler and contact negative paths.
5. Two-stage pre-commit review; explicit staged allowlist.
6. Protected PR, two immutable final reviews, remote checks, merge.
7. Deploy exact merge SHA to canonical `aiow-main-site`; verify `aiow.ai` and `www` aliases.
8. Run full live route/brand/entity/answer/contact proof.
9. Submit IndexNow and read back receipt.

## Owner gates that cannot be bypassed

- Voys private mobile, terms, CAPTCHA, identity/payment and number choice.
- Any mailbox/phone secret, password, MFA or payment prompt.
- Real people photos/roles and customer case permission.
- Google/Apple/LinkedIn account verification where the provider demands a human.