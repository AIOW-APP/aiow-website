# AIOW AI-only Top 1% Website — Prototype Build Spec

Status: TASK-AIOW-001 / 45% spec-ready prototype architecture  
Owner: Handsome / Mac Studio  
Scope: internal plan + prototype only. No public launch, deploy, DNS, paid tools, credentials, or destructive actions.

## Source evidence

- Existing repo: `~/projects/aiow-website`
- Existing stack detected: Next.js 15, React 19, TypeScript, R3F/Three, GSAP, Framer Motion, Lenis, sharp.
- Existing prototype route: `/aiow-v13` via `app/aiow-v13/page.tsx` and `components/v13/OryzoCloneExperience.tsx`.
- Current home route embeds `/oryzo-reference/index.html` through `app/page.tsx`.
- Existing media pipeline already contains AI Key stills + motion in `public/aiow/story-v415` and `public/aiow/story-v416`.
- QA gate run: `bun run build` passed on 2026-05-04.
- Blocker: requested `AIOW_AI_WEBSITE_BLUEPRINT.md` was not found under workspace/projects/TeamVault/Obsidian search paths. This spec is derived from the existing AIOW repo + current V13 prototype state.

## Product direction

Build AIOW as a premium product-film website: not a generic AI consultancy page, but a tangible “operating layer” story where a physical/digital AI Key unlocks each business layer.

Quality bar: Oryzo/Lusion-level craft — cinematic, tactile, fast, mobile-excellent, accessible, and technically reliable.

Core narrative:
1. Work arrives locked.
2. AIOW gives it one intake.
3. Private work stays private.
4. Local hardware runs sensitive lanes.
5. The model router picks the right model/tool.
6. Agents dispatch by role.
7. Personal memory and business memory stay separated.
8. Channels sync to one decision layer.
9. Human approval gates risk.
10. Ops remains monitored.
11. Proof attaches to every action.
12. The operating layer stays installed.

## Stack

### App/framework
- Next.js App Router, TypeScript, React 19.
- Route-level static generation where possible.
- Client islands only for scroll state, WebGL/canvas, motion, audio/mute, and route demo.

### Motion/interaction
- Lenis for smooth scroll, disabled/reduced for `prefers-reduced-motion`.
- GSAP or Framer Motion for section transitions, but not both per section; prefer GSAP for scroll-timeline scenes, Framer for isolated UI microinteractions.
- CSS-first effects for lightweight pulses, glows, parallax, and responsive type.

### 3D/WebGL
- React Three Fiber + Drei for hero/key/lock system only, not the whole page.
- Keep WebGL progressive-enhanced: static/video fallback first, canvas second.
- Postprocessing minimal: bloom, vignette, film grain; avoid expensive full-screen shader stack on mobile.

### Media
- Images: AVIF/WebP/PNG source variants from `public/aiow/story-v416`.
- Video: MP4/WebM short loops, muted, playsInline; mobile uses poster/still fallback unless explicit small video is approved.
- Use `next/image` for non-background layout images where feasible; CSS background only for poster/card art.

### Styling
- CSS modules or component-scoped global CSS extracted from current huge `style jsx global` block.
- Design tokens: graphite/cream/champagne/blue, large uppercase display type, physical material shadows.

## Routes

### `/` — production candidate homepage
Convert current iframe route into native Next surface once prototype is ready.

Sections:
1. Cinematic hero with AI Key unlock video/still.
2. Scrollytelling story: 12 scenes.
3. Mechanism grid: how the AI Key maps to business layers.
4. Interactive route demo: request → classify → local context → model lane → human gate → receipt.
5. Proof wall: receipts, logs, screenshots, decisions.
6. Product stack/pricing-style positioning: Core, Studio, Operating System.
7. Final CTA: installation/AI scan/contact.

### `/aiow-v13` — archive/prototype route
Keep as sandbox for the Oryzo-inspired current prototype until `/` is replaced.

### `/llms.txt`, `/robots`, `/opengraph-image`
Keep existing support routes. Add AI/SEO copy once final content stabilizes.

### Future optional routes
- `/proof` — technical proof page with receipts and case studies.
- `/scan` — AI-scan landing flow.
- `/operating-layer` — deeper product architecture page.

## Component architecture

First-class components to build/extract:

1. `components/aiow/AiowExperience.tsx`
   - Top-level composition, no giant inline CSS.
   - Owns active scene, progress, language, reduced-motion capability.

2. `components/aiow/AiowHeader.tsx`
   - Mark, nav anchors, language toggle, CTA.
   - Mobile-safe, no pointer traps.

3. `components/aiow/HeroFilm.tsx`
   - Video/still fallback, copy, CTAs, hero AI Key overlay.
   - Must load fast and not block LCP.

4. `components/aiow/StoryStage.tsx`
   - Maps `scenes` data to scene panels.
   - IntersectionObserver preferred over per-scroll DOM query for active scene.

5. `components/aiow/StoryPanel.tsx`
   - Picture/video/proof/copy/reaction layer.
   - Native lock scenes use real art; non-native scenes use generated CSS lock/key overlay.

6. `components/aiow/AiKey3D.tsx`
   - Optional R3F key/lock hero layer.
   - Lazy-loaded, hidden on mobile/low-power/reduced motion.

7. `components/aiow/RouteDemo.tsx`
   - Deterministic fake routing interaction; no credentials/API.
   - States: idle → classify → privacy → model lane → approval → receipt.

8. `components/aiow/ProofWall.tsx`
   - Horizontal poster cards with fallback non-animated layout on mobile/reduced motion.

9. `components/aiow/ProductStack.tsx`
   - Core/Studio/Operating System cards.

10. `components/aiow/FinalCta.tsx`
    - Contact/scan CTA; keep mailto until Richard approves external forms/backend.

11. `lib/aiow/scenes.ts`
    - Single typed source for scene metadata, image paths, motion paths, copy, proof line, theme, object-position hints.

12. `lib/aiow/route-demo.ts`
    - Pure functions for fake route classification and display data.

13. `styles/aiow.css` or CSS modules
    - Extract current V13 CSS into maintainable sections.

## Desktop interaction spec

- Hero opens with final control-room motion or poster; copy enters after 200–400ms.
- Header uses blend/difference only if contrast passes; otherwise fallback solid glass.
- Scroll locks attention per scene: one full viewport per story panel.
- Active scene detection updates story progress and only plays motion video in current panel.
- Desktop can show WebGL AI Key/lock layer with subtle pointer parallax.
- Route demo button animates lanes in sequence and emits a visible receipt card.
- Proof wall drifts slowly; pauses on hover/focus.
- Keyboard users can navigate all CTAs, language toggle, route demo, and cards.

## Mobile interaction spec

- No custom cursor.
- Avoid giant WebGL/video memory use; still-first with selective short muted video only if performance holds.
- Hero headline capped to readable 3-line layout; CTAs stack.
- Story panels use `100dvh`, carefully chosen `object-position` per scene.
- Proof labels stay within safe-area bottom.
- Horizontal poster wall becomes native horizontal scroll with snap, no forced animation.
- Route demo becomes stacked single-column pipeline.
- All tap targets >= 42px.

## WebGL / art / video pipeline

### Current assets to keep
- `public/aiow/story-v416/proofs/...` for true physical keyhole proof scenes.
- `public/aiow/story-v415/...` for base 12-scene desktop/mobile story art.
- `public/aiow/story-v416/proofs/motion/...` for hero and selected lock-first motion loops.

### Pipeline rules
1. Generate/key art must prove physical insertion: blade inside keyway, lock lip occlusion, contact shadow, correct hand pressure.
2. Motion begins dormant; glow/lanes only after key turn/click.
3. No fake dashboards, no unreadable UI walls, no crypto cliché, no busy HUD.
4. Desktop deliverables: 16:9 or wider hero plates + 4–6s MP4 loops.
5. Mobile deliverables: native 9:16 compositions, never crops from desktop.
6. Compression targets:
   - Hero MP4 <= 5–8 MB initial candidate; poster <= 300 KB when possible.
   - Scene images <= 350–600 KB each after responsive export.
   - Lazy-load offscreen video/assets.
7. WebGL is enhancement, not dependency: page must still feel premium with images/video disabled.

## Performance gates

Must pass before Richard review:

- `bun run build` passes.
- No TypeScript errors.
- Lighthouse local target:
  - Performance >= 85 desktop, >= 75 mobile prototype, >= 90 final target.
  - Accessibility >= 95.
  - Best Practices >= 95.
  - SEO >= 90.
- LCP target: < 2.5s on desktop; mobile prototype < 3.5s, final < 2.8s.
- CLS < 0.05.
- Total initial JS: keep route under ~180 KB shared/client budget where possible.
- No autoplay audio; videos muted by default.
- `prefers-reduced-motion` removes non-essential animation.

## QA commands

Run locally from `~/projects/aiow-website`:

```bash
bun install
bun run build
bun run lint
bun run audit
```

Manual QA:

```bash
bun run dev
# inspect /
# inspect /aiow-v13
# Chrome DevTools: mobile 390x844, 430x932, desktop 1440x900, 1920x1080
```

Recommended extra checks:

```bash
npx tsc --noEmit
npx @next/bundle-analyzer
```

## Exact first implementation steps

1. Preserve current V13 prototype:
   - Leave `app/aiow-v13/page.tsx` working.
   - Do not delete Oryzo reference assets yet.

2. Create typed data source:
   - Add `lib/aiow/scenes.ts` with current `scenes` array from `components/v13/OryzoCloneExperience.tsx`.
   - Include desktop/mobile/motion paths, proof copy, theme, object-position hints.

3. Extract components:
   - Create `components/aiow/AiowExperience.tsx`.
   - Create `components/aiow/AiowHeader.tsx`.
   - Create `components/aiow/HeroFilm.tsx`.
   - Create `components/aiow/StoryStage.tsx`.
   - Create `components/aiow/StoryPanel.tsx`.
   - Create `components/aiow/RouteDemo.tsx`.
   - Create `components/aiow/ProofWall.tsx`.
   - Create `components/aiow/ProductStack.tsx`.
   - Create `components/aiow/FinalCta.tsx`.

4. Extract styles:
   - Move V13 global CSS into `styles/aiow.css` or component CSS modules.
   - Import once from `app/layout.tsx` or the route-level component.

5. Replace home route behind a small switch:
   - Update `app/page.tsx` to render `AiowExperience` only after prototype extraction passes build.
   - Keep iframe reference available at `/oryzo-reference` for comparison.

6. Upgrade active-scene logic:
   - Replace scroll DOM query loop with IntersectionObserver.
   - Keep video playback gating: active panel plays, inactive panels pause.

7. Add route demo state machine:
   - No backend/API.
   - Deterministic animation shows classification, privacy policy, model lane, human gate, proof receipt.

8. Add QA evidence folder:
   - Save Lighthouse outputs/screenshots to `evidence/aiow-top1/` after first visual pass.

## Immediate risks / blockers

- Missing `AIOW_AI_WEBSITE_BLUEPRINT.md`: need Debbie/Richard to provide canonical blueprint if this exists outside current search paths.
- Current git tree has many untracked/modified files; do not clean/delete without Richard approval.
- Current V13 component is monolithic; extraction is first technical debt step.
- Home route is an iframe reference, not yet native production page.
- Need final choice whether final language defaults to English or Dutch. Current prototype supports both; brand/commercial target likely needs NL-first for MKB or EN-first for premium AI-native positioning.

## Handoff recommendation

Proceed to implementation pass 1: extract V13 into maintainable `components/aiow/*` + `lib/aiow/scenes.ts`, keep `/aiow-v13` as archive, then wire `/` to native AIOW experience after `bun run build` passes.
