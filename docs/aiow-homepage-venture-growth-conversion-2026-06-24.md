# AIOW homepage venture/growth partner conversion — 2026-06-24

## Scope

Richard requested: keep the existing design direction, but change the whole page information, images, videos and content so AIOW.ai fully focuses on building AI into startups and established companies.

## Implemented

### Homepage content

`components/aiow/AiowNativeMotionPage.tsx`

Converted from personal-AI/AI-scan positioning to:

- AI venture & growth partner;
- startups and established companies;
- private intake;
- AI due diligence;
- Deal Card;
- fixed fee / retainer / revenue share / profit share / equity/hybrid;
- Spunky project-group/context role;
- client portal/dashboard/proof log;
- result-driven growth partnership.

Updated both Dutch and English content blocks.

### Visual/media mapping

Changed hero and story media references while keeping layout/design system:

- hero video now uses `aiow-hero-premium-business-worklayer.mp4`;
- story images remapped toward proof studio, channel hub, intake hub, model router, managed ops, approval, final installation;
- story videos remapped across existing layer media to better fit venture studio/growth flow.

### SEO/metadata

`app/layout.tsx`

Updated:

- title;
- description;
- OpenGraph/Twitter copy;
- keywords;
- Organization/LocalBusiness/Service JSON-LD.

### Team Richard/AIOW customer alerts

A script-only cron was created earlier this turn:

- job: `AIOW Team Richard New Customer Alerts`
- job id: `b8c8414be5ef`
- schedule: every 5m
- delivery: `telegram:-1003981366639:530`
- script: `~/.hermes/scripts/aiow_team_richard_customer_watch.py`

It alerts Team Richard group for:

- new AIOW pre-aanvragen;
- new AIOW customer accounts;
- signed contracts needing Telegram project group + Spunky.

## Verification

Commands run:

```bash
npm run lint -- --max-warnings=0
npx tsc --noEmit
npm run build
```

Results:

- lint: PASS
- typecheck: PASS
- build: PASS
- generated pages: 906

Media reference check:

- 49 media refs checked in `AiowNativeMotionPage.tsx`
- missing media files: 0

Visual evidence:

- `evidence/aiow-home-venture-mobile-final-2026-06-24.png`
- `evidence/aiow-home-venture-desktop-final-2026-06-24.png`

Mobile first viewport was visually checked and is coherent/readable with new venture/growth positioning.
