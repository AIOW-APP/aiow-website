# Team Handsome — Brand Language

De gedeelde basis voor alle producten. Deze principes gelden voor websites,
webapps en native apps — ze bepalen de voice, de motion, en het look-&-feel
dat elke Team Handsome product onmiskenbaar onderscheidend maakt.

## Voice

### Tone
- **Confident, niet arrogant.** We claimen nooit meer dan we leveren.
- **Dry humor als filter.** Grappig-aanleidend, niet grappig-probeer-leuk-te-zijn.
- **Editorial, niet corporate.** "Built for..." > "Revolutionary platform that..."
- **Nederlandse oorsprong, Engels internationaal.** Onze accent is Amsterdam, niet Silicon Valley.

### Do's
- "One dashboard. 12 chains. Zero compromise." (kort, ritmisch)
- "We built this because the alternative was pain."
- "Honest numbers. Boring name. Good results."

### Don'ts
- ❌ "Revolutionary" / "disruptive" / "game-changing"
- ❌ Marketing-jargon zonder substantie
- ❌ Emoji ⚡ bullet points zonder reden
- ❌ Lorem ipsum in productie

## Visual fundamentals

### Kleur discipline
- **Dark canvas first.** Crypto/tech/finance doelgroepen leven in dark mode.
- **ÉÉN accent-kleur per brand.** Niet mixen. Zie `tokens/debbie.css`.
- **Ink hiërarchie:** `--color-ink` (100%), `--color-ink-muted` (60%), `--color-ink-faint` (35%). Nooit 4+ gray-nuances door elkaar.
- **Lines subtiel.** `--color-line` voor scheiding, niet `border-gray-500`.

### Typografie discipline
- **Maximum 2 font families per project.** Display + body, meer niet.
- **Fluid type schaal** via `clamp()`. Nooit vaste `font-size: 18px`.
- **Display type krijgt tighter tracking** (`-0.03em` tot `-0.04em`).
- **Body type natural leading** (1.5-1.7).
- **Mono voor data, labels, timestamps.**
- **Serif alleen voor editorial accents** (quote, hero pull).

### Spacing discipline
- **8px-rhythm altijd.** 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Grote secties fluid** met clamp.
- **Padding tussen secties ≥ 80px op desktop**, niet 40px.

## Motion language

Elke Team Handsome product heeft **consistent motion** — herkennen = merk.

### Curves
- **Default:** `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-out`) — snappy exit
- **Overshoot:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (`--ease-spring`) — voor CTAs en reveal
- **Never linear.** Linear = sterrenbeeld goedkoop.

### Duration
- **Micro (hover, tap):** 150ms
- **Default (fade, slide):** 300ms
- **Hero reveal:** 600-800ms
- **Scroll choreography:** 1000-1500ms per act

### Choreography principes
1. **Stagger vertellen een verhaal.** Title → subtitle → CTA → stats.
2. **Enter vanuit context** (onder, rechts, schaal) — niet uit het niets.
3. **Hover geeft antwoord** binnen 150ms. Trager = dood.
4. **Scroll is tijd.** Niet "we animeren bij scroll" maar "de scroll bepaalt het moment".
5. **Respect `prefers-reduced-motion`.** Niet optioneel.

## Brand figure policy

- AIOW gebruikt voorlopig géén Spunky, ape, mascotte of character als kernmerk.
- Wow-factor komt uit productervaring, system art, motion, interactie en premium AI-infrastructuurtaal.
- Eventuele mascot/explainer-concepten blijven los van de flagship website en alleen na expliciete goedkeuring.
- Debbie/Handsome-persona's horen bij Team Richard communicatie, niet bij AIOW flagship branding.

## Audio identity (waar toepasbaar)

- **Amsterdam English Country** — Louis van Gaal broken English + Billy Currington groove
- Op elke video: korte 30s-1min track
- Suno v4.5 generates, curated library in `~/debbie/audio-library/`
- Subtle UI-geluiden: Tone.js, geen zware assets

## Quality hierarchy

Elk project krijgt een **level** bij start:

- **Level 1 — Functional**: interne tools, dashboards (audit Lighthouse ≥70, a11y, responsive)
- **Level 2 — Professional**: publieke sites (Lighthouse ≥90, motion polish, design tokens, dark/light)
- **Level 3 — Agency-grade**: flagship (Lighthouse ≥95, WebGL of 3D, character integratie, FWA-ready)

**Default:** alles publiek = minimaal Level 2.

## Inspiratie benchmark

De mate waarin onze sites deze onder zich laten:
- Linear.app (product clarity)
- Rauno.me (motion polish)
- Mew.xyz (character-driven voice)
- Lacoste Members (interactive configuration)
- FWA100/Jam3 (immersive 3D)
- Stripe.com (fundamentals op schaal)

Als we onder 1 van deze blijven op een specifieke dimensie — niet shippen.
