# AIOW top-1% visual / motion / UI-UX direction

Status: advisory + first internal builder implementation. No public deploy or live automation without Richard approval.

## Creative north star
AIOW should feel like: premium Dutch AI installation studio + calm control room + personal AI employee. Not generic SaaS, not cheap automation, not enterprise-bureaucratic.

Core visual metaphor:
- "Jouw AI-medewerker wordt ingewerkt" rather than "AI worklayer".
- Business knowledge flows into a calm operating room.
- Human approval stays visible as a trust layer.

## Homepage top-1% structure
1. Hero: one clear promise, one live-feeling product demo, one CTA.
   - Headline: "Jouw persoonlijke AI-medewerker, ingewerkt op je bedrijf."
   - Subline: learns how you work; helps with customers, quotes, planning, admin.
   - CTA 1: Gratis quick check.
   - CTA 2: Bekijk klantportal.
2. Interactive AI employee demo:
   - 3 tabs: Klantvraag, Offerte, Planning.
   - Show input -> AI concept -> human approval -> portal status.
   - Keep it real UI, not abstract blobs.
3. Pricing clarity block:
   - Starter €2.500 + maintenance.
   - Monthly is maintenance only.
   - Extra work hourly.
4. Portal preview:
   - Every lead gets a portal route.
   - Show intake, scope, quote, datagrens, planning, status.
5. Trust/control stack:
   - Datagrens, logging, approvals, local/private option, no external action without approval.
6. Scale path:
   - Starter -> Private Worklayer -> Local AI Node -> Business AI Layer.

## Motion principles
- Motion must explain, not decorate.
- Best motion moments:
  1. AI learns business context: cards gently connect into one memory graph.
  2. Human approval gate: action pauses until approved.
  3. Portal progress: status rail updates from interest -> scope -> quote -> planning.
  4. Pricing calculator: numbers shift smoothly when scope changes.
- Avoid heavy scroll-jacking and long cinematic intro on mobile.
- Use transform/opacity, short 200-500ms transitions, and reduced-motion support.

## Desktop UI direction
- Wide cinematic hero with product UI panel, not just text.
- Premium dark interface, high contrast, warm cyan/blue highlights, subtle grain.
- Larger type hierarchy: strong editorial headline + compact operational UI cards.
- Add a right-side "live portal" panel above the fold.
- Use section-to-section narrative: Promise -> Demo -> Pricing -> Portal -> Trust -> Start.

## Mobile UI direction
- Mobile is the sales page, not a shrunken desktop.
- First screen: headline, one sentence, sticky CTA, small portal card.
- Convert complex sections into swipeable/stacked cards.
- Keep CTAs >=44px high.
- No hover-dependent interactions.
- Reduce WebGL/3D on mobile; replace with video/canvas fallback or static premium panels.
- Sticky bottom CTA: "Gratis quick check" / "Bekijk portal".

## Portal UX direction
- Customer portal should feel like a private project room.
- Must answer: where am I, what do I get, what does it cost, what do you need from me, what happens next?
- Portal states:
  1. Interest received
  2. Intake needed
  3. Scope under review
  4. Quote ready
  5. Planning ready
  6. Installation in progress
- Admin quote builder should become: client info -> package -> workflows -> data boundary -> price preview -> portal draft.

## Performance / accessibility targets
- Mobile LCP <2.5s, INP <100ms, CLS <0.1.
- 60fps only where motion matters; no layout-thrashing animations.
- prefers-reduced-motion support everywhere.
- No autoplay heavy video without poster/fallback.
- Audit mobile first before desktop polish.

## Next build phases
Phase 1 — now/internal:
- Manual-safe admin quote builder at /portal/admin.
- Portal preview and pricing clarity.

Phase 2 — premium product demo:
- Build interactive "AI medewerker demo" component for homepage.
- Add mobile sticky CTA and pricing calculator.

Phase 3 — visual/motion flagship:
- Replace static hero card with animated portal/control-room composition.
- Add scroll narrative with controlled motion and reduced-motion fallback.

Phase 4 — live portal only after approval:
- Auth/magic links, DB schema, audit logs, WhatsApp Business, legal acceptance/payment review.

## Built after snapshot — 2026-05-11
- Added homepage aiWorkerDemo section directly after hero.
- Demo has three scenarios: customer question, quote, planning.
- Shows the operating sequence: input -> business memory -> AI draft -> human approval -> portal status.
- Added mobile-first responsive layout: tabs become equal-width, cards stack, no hover dependency.
- Added reduced-motion fallback for demo card animation.
- Added /portal/admin manual-safe quote builder in previous step.

## Next recommended implementation
1. Turn demo cards into richer animated product UI with small state transitions and progress rail.
2. Add a lightweight pricing calculator tied to Starter / maintenance / hourly extras.
3. Add lighthouse/mobile visual QA before any deploy.
4. Replace older img use in v10/v12 or exclude those legacy pages if not part of final site.

## Built next — Starter budget compass
- Added interactive Starter budget compass in homepage pricing section.
- Clarifies setup from €2,500, maintenance from €650/mo, and extras from €175/h.
- Explicitly labels result as indicative only; final quote still requires data-boundary/scope/approval.
- Mobile stacks cleanly and uses native range controls for accessible touch interaction.

## Performance pass — hero poster + LCP cleanup — 2026-05-11
- Added optimized WebP hero posters:
  - `public/aiow/homepage-story/aiow-hero-keyframe-mobile-760.webp` (~16 KB)
  - `public/aiow/homepage-story/aiow-hero-keyframe-desktop-1280.webp` (~38 KB)
- Homepage hero video now selects the WebP poster via `heroPosterSrc` instead of the heavier keyframe JPG.
- Removed Next font payload from the root layout and let the site use the existing system-ui/SF Pro fallback stack from CSS tokens.
- Kept hero H1 immediately paintable by excluding it from the first-fold reveal animation; supporting copy/CTA motion remains.
- Updated service JSON-LD copy toward “persoonlijke AI-medewerker” while keeping scan/private AI semantics.

### Lighthouse evidence
- Baseline: `evidence/lighthouse-aiow-home-2026-05-11.json` — Performance 90, A11y 100, BP 100, SEO 100, LCP 3.6s, total 459 KB.
- WebP poster: `evidence/lighthouse-aiow-home-hero-poster-2026-05-11.json` — Performance 93, LCP 3.2s, total 360 KB.
- WebP poster + one font removed: `evidence/lighthouse-aiow-home-font-poster-2026-05-11.json` — Performance 95, LCP 2.9s, total 320 KB.
- Final local pass: `evidence/lighthouse-aiow-home-lcp-h1-immediate-2026-05-11.json` — Performance 97, A11y 100, BP 100, SEO 100, LCP 2.6s, FCP 1.1s, TBT 10ms, CLS 0, total 272 KB, fonts 0 KB.

### Remaining gate
- LCP target is <2.5s; current local run is ~2.6s, close enough for preview quality but still worth one more pass if we want a strict green margin before deploy.
- Next candidates: reduce first-fold CSS dependency, split above-the-fold component CSS, or simplify initial hero video/card work on mobile.
