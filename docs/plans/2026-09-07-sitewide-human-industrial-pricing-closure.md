# Sitewide Human Industrial + Pricing Closure Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Prove that every mounted public AIOW route and every visible page section uses the Human Industrial system, while making quote delivery by direct PDF download and email unmistakably available in the homepage and rates journey.

**Architecture:** Keep `DESIGN-DNA.md` as the visual/commercial authority and reuse the canonical `PriceCalculator` → `QuoteModal` → `/api/quote` transaction. Do not create a second quote path. Strengthen static source guards and the existing Playwright sitemap proof so route inventory, section-level style, responsive geometry, quote affordance, modal copy, PDF response and email promise are verified separately.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules, Node test runner, Playwright WebKit, existing AIOW commercial quote contracts.

---

### Task 1: Freeze the new pricing and style contract

**Objective:** Record that quote delivery is a direct PDF download plus the same PDF by transactional email, and that sitewide proof covers every visible top-level content region.

**Files:**
- Modify: `DESIGN-DNA.md`
- Test: `tests/aiow-v1/sitewide-human-industrial.test.mjs`

**Steps:**
1. Add failing source assertions for the two delivery channels and section-level proof markers.
2. Run the focused test and verify RED.
3. Update the Conversion and Release proof sections in `DESIGN-DNA.md`.
4. Re-run the focused test and verify PASS.

### Task 2: Clarify the homepage calculator outcome

**Objective:** Make the generated artifact and both delivery channels visible before the quote form opens, with one dominant action.

**Files:**
- Modify: `components/aiow-v1/LivingBlueprintHomepage.tsx`
- Modify: `components/aiow-v1/PriceCalculator.tsx`
- Modify: `components/aiow-v1/LivingBlueprintHomepage.module.css`
- Modify: `components/aiow-v1/AiowV1Homepage.module.css`
- Modify: `lib/aiow-v1/calculator-decision.mjs`
- Test: `tests/aiow-v1/calculator-decision-ui.test.mjs`

**Steps:**
1. Add failing bilingual source/decision assertions for direct PDF download, email copy and no second competing action.
2. Run the focused test and verify RED.
3. Add a compact Human Industrial delivery ledger beside the pricing introduction and inside the calculator action area.
4. Change the dominant action copy to explicitly name PDF plus email while preserving the single CTA.
5. Run the focused test and verify PASS.

### Task 3: Add the canonical quote instrument to the full rates page

**Objective:** Let visitors move from published rate tables to a downloadable/emailed indication without leaving the rates page.

**Files:**
- Modify: `components/aiow-v1/TariffsPage.tsx`
- Modify: `components/aiow-v1/TariffsPage.module.css`
- Test: `tests/aiow-v1/sitewide-human-industrial.test.mjs`

**Steps:**
1. Add failing assertions for one `#offerte` section, the canonical calculator component, and bilingual delivery copy.
2. Run the focused test and verify RED.
3. Mount `LivingBlueprintCalculator` once after the published price boundaries and before the final scan CTA.
4. Style the section as a square technical issue desk using only shell tokens.
5. Run the focused test and verify PASS.

### Task 4: Prove every route and every mounted top-level section

**Objective:** Extend browser proof beyond root tokens/H1 so every sitemap route and every visible top-level page region is checked.

**Files:**
- Modify: `tests/aiow-v1/release-sitewide-human-industrial-proof.mjs`
- Create or modify: `tests/aiow-v1/sitewide-section-contract.test.mjs`

**Steps:**
1. Add source tests that derive the expected public route inventory and reject legacy visual imports/tokens on mounted public families.
2. Extend Playwright inspection to enumerate visible `main > header|section|article|form|nav` regions, assert non-zero geometry, Human Industrial font/palette inheritance, no legacy serif/glow/rounded-card computed styles, no horizontal clipping and at least one audited region per route.
3. Prove homepage and rates quote affordances at 390 and 1440, open the modal, and assert visible PDF-download plus email-copy wording.
4. Preserve no-JS, theme, navigation, first-viewport CTA and sticky-clearance checks.

### Task 5: Responsive product-art and regression verification

**Objective:** Verify the candidate as a complete release snapshot.

**Files:**
- Evidence: `.team-handsome/AIOW-SITEWIDE-HUMAN-INDUSTRIAL-20260907/`

**Steps:**
1. Run all AIOW tests, lint, `git diff --check`, and a clean production build.
2. Start the exact current build and run sitewide proof at 320/375/390/768/1024/1440 across representative families, with all sitemap routes at 390/1440 in Day/Evening and no-JS.
3. Capture/review screenshots for homepage, pillar, capabilities, rates, price context, knowledge, company, privacy, ventures and scan.
4. Freeze the candidate; request independent spec compliance and code-quality/product-art reviews.
5. Fix all material findings and rerun affected proof.

### Task 6: Protected release

**Objective:** Ship only the verified immutable candidate.

**Steps:**
1. Stage only the explicit allow-list and commit.
2. Push with lease, create/update PR, wait for exact-SHA CI.
3. Merge only when protected checks and reviews are green.
4. Verify production deployment and rerun exact live-domain route/style/quote-affordance readback without submitting a real customer quote.
