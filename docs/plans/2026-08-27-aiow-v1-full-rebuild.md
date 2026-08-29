# AIOW V1 Full Rebuild Implementation Plan

> **For Hermes:** Use subagent-driven-development to implement this plan task-by-task in the isolated worktree only.

**Goal:** Replace the public AIOW surface with the approved Warm Precision v2 proposition on `aiow.ai`: transparent calculator, booking intake, NL/EN SEO foundation and four pillar pages.

**Architecture:** Keep the existing Next.js 15 App Router repository and preserve portal/venture routes. Replace only the public homepage shell and shared public styling. Put deterministic pricing and booking validation in side-effect-free modules with Node tests. The booking route is fail-closed: it validates and forwards only to an explicitly configured webhook; it never reports success without an upstream acknowledgement.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules/global tokens, Node built-in test runner, Vercel preview.

**Canonical target:** `https://aiow.ai` for this rebuild. `aiow.io` and its Microsoft mail routing are not changed in this build. No DNS/MX/email purchase or production cutover.

**Writer worktree:** `/Users/handsomebastard/worktrees/aiow-v1-rebuild-20260827`

---

## Task 1 — Freeze public product canon and deterministic pricing

**Create:**
- `docs/design/aiow-v1-warm-precision-canon.md`
- `lib/aiow-v1/pricing.mjs`
- `tests/aiow-v1/pricing.test.mjs`

**Requirements:**
- Business: Start ≤10: €4,950 + €29 pp, minimum €245/month; Growth ≤50: €12,500 + €49 pp; Accelerated ≤250: €24,500 + €69 pp; Private AI >250: from €49,500 + €99 pp.
- Building modes: Smart Office €35/m², minimum €4,950 + €0.75/m²/month, minimum €345; Home €55/m², minimum €9,950 + €1.25/m²/month, minimum €395; Signature €85/m², minimum €19,500 + €1.95/m²/month, minimum €595.
- Exclude hardware/installation and cloud/AI usage.
- Test thresholds, minimums and currency rounding.

## Task 2 — Build homepage and live calculator

**Create/modify:**
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `components/aiow-v1/AiowV1Homepage.tsx`
- `components/aiow-v1/AiowV1Homepage.module.css`
- `components/aiow-v1/PriceCalculator.tsx`
- `components/aiow-v1/ThemeLanguageControls.tsx`

**Requirements:**
- Approved Warm Precision tokens: #14161A, #20242B, #2E333C, #F4EFE6, #D9A441; Fraunces headings and Inter body.
- NL root, light/dark/system persistence and reduced-motion fallback.
- Hero calculator with Bedrijf/Pand/Woning modes and deterministic output.
- Explicit disclaimer: indication only, hardware/installation and cloud/AI use excluded, definitive after scan.
- Solutions and Ventures visibly separated.
- Preserve existing portal and venture routes.
- Responsive at 320/390/768/1440 and keyboard accessible.

## Task 3 — Booking modal and fail-closed API

**Create:**
- `components/aiow-v1/BookingModal.tsx`
- `lib/aiow-v1/booking.mjs`
- `tests/aiow-v1/booking.test.mjs`
- `app/api/booking/route.ts`

**Requirements:**
- Three-step flow: subject/form → date/time → contact details.
- Generate downloadable ICS locally after upstream booking acceptance.
- Server derives validation, IDs and timestamps; reject malformed email, past date, invalid slot and oversized text.
- Use `AIOW_BOOKING_WEBHOOK_URL` only when configured; return 503 when absent, 502 when upstream fails, and success only on upstream 2xx.
- Never log full personal payloads; log request ID/status only.
- No autonomous confirmation email, CRM write or calendar purchase in this scope.

## Task 4 — SEO/GEO technical foundation and EN route

**Create/modify:**
- `app/robots.ts`
- `app/sitemap.ts`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`
- `app/en/page.tsx`
- `app/opengraph-image.tsx`
- shared metadata/schema helpers under `lib/aiow-v1/seo.ts`

**Requirements:**
- Absolute aiow.ai canonical, NL root + EN `/en`, hreflang nl/en/x-default.
- Open GPTBot, ClaudeBot/anthropic-ai, Google-Extended, PerplexityBot, CCBot and Meta external agent.
- Sitemap includes home, EN and four pillars with alternates.
- Organization, WebSite, Service and FAQ JSON-LD on home; Service, FAQPage and BreadcrumbList on pillars.
- `llms.txt` and expanded `llms-full.txt` as `text/plain; charset=utf-8`.
- No invented address, awards, customers or benchmark claims.

## Task 5 — Four pillar pages

**Create:**
- `app/ai-automatisering/page.tsx`
- `app/lokale-ai/page.tsx`
- `app/smart-office/page.tsx`
- `app/home/page.tsx`
- `components/aiow-v1/PillarPage.tsx`
- `lib/aiow-v1/pillars.ts`

**Requirements:**
- Direct answer first, clear use cases, transparent pricing, FAQ, internal links and booking CTA.
- Distinguish proven service capability from future/partner-dependent delivery.
- AIOW Home explicitly states installation/hardware requires a qualified partner and is not included.
- No fake cases, savings percentages, reviews or “#1/best” factual claims.

## Task 6 — Verification and immutable candidate

**Commands:**
- `npm ci`
- `npm run test:aiow-v1`
- `npm run lint`
- `npm run build`
- local `next start` + browser checks at 320, 390, 768 and 1440.

**Assertions:**
- Calculator thresholds/minimums pass.
- Booking route negative paths pass and no unconfigured success occurs.
- No horizontal overflow, keyboard trap or contrast failure in core flow.
- `/`, `/en`, four pillars, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt` return expected status/content.
- Existing portal and venture routes still build.
- Freeze exact changed-file allow-list, commit, re-run tests on commit and create preview without production/DNS changes.
