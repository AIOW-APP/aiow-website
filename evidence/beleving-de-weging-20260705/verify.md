# Verify — AIOW beleving "De Weging" (clean-glass v2.1)

Datum: 2026-07-05 · Door: Fable · Branch: fable/clean-glass-rebuild-20260705
Omgeving: Linux-sandbox (aarch64), Chromium 131 headless, next start na volledige build.

## tsc + build

- `npx tsc --noEmit`: schoon (enige meldingen komen uit ongetrackt `tmp/`-testbestand van vóór deze slag).
- `npx next build`: ✓ Compiled successfully · ✓ Generating static pages (931/931), exit 0.

## 390px pixel-proof (screenshots hiernaast, m390-*.png)

- Nul horizontale overflow, gemeten scrollWidth == clientWidth == 390 op:
  / (home), /nl/venture-score-aanvragen, /nl/kennis.
- m390-01 hero (aanvraag #217 komt binnen, instrument op 00), m390-02 menu-paneel open,
  m390-03/04 weegmomenten (28 → 45), m390-05 verdict (66, lat op 70, "Nee. Met een
  concrete tip."), m390-06 flow, m390-07 kennisbank.

## De Weging (kern-interactie, gemeten in DOM)

- Instrument telt discreet en omkeerbaar: stage 0 / score 00 → weging 1: stage 1 / 28
  → weging 2: stage 2 / 45 → verdict: stage 4 / 66 (nav-badge én scorebord identiek).
- Terugscrollen naar boven: stage 0 / score 00 — volledig omkeerbaar (les A12).
- Zonder JS: eindstand 66 staat in de HTML; weegregels volledig zichtbaar.

## Header-check (header-standaard.md v1)

```
HEADER-CHECK (header-standaard.md v1)
[x] ≤ 7 elementen: logo + 2 navlinks + 1 CTA + instrument (+ hamburger mobiel) = 5 (6 mobiel)
[x] precies één knop-CTA (Venture-score), nowrap, 44px
[x] secundaire acties (Kennisbank, Login) als tekstlink, geen tweede knop
[x] wordmark compact, 700, negatieve tracking; geen gespatieerde mono
    (bewust serif: Literata is het merk-display; open punt voor Richard, zie rapport)
[x] sticky glas-nav condenseert bij scroll (72→56px), omkeerbaar, fallback solide
[x] mobiel: logo + instrument + CTA + hamburger; menu solide paneel, links ≥ 48px
    (instrument in de logo-zone conform chip-regel §1.1; gemeten 44×44px tap-doel)
[x] geen dode/niet-werkende elementen, geen inline styles in de headerzones
[x] 390px-screenshot: nul h-overflow (m390-01/02), niets breekt of kneit
[x] reduced-motion/-transparency: bruikbaar en stil (m390-rm-*, solide fallback in tokens)
```

## AA (programmatisch gemeten, aa-metingen.txt)

Alle gebruikte tekstcombinaties ≥ 4,5:1, o.a. ink-soft op canvas 4,77 · accent op canvas
6,27 · on-accent op accent 6,33 · verdict-ink-soft op verdict 7,11. De 45%-trap
(ink-faint, 2,85) wordt uitsluitend voor placeholders en decor gebruikt; de weegnotitie
is hiervoor naar de 62%-trap verplaatst.

## Reduced motion (m390-rm-*.png)

- Reveal-gate blijft uit (data-aiow-reveal null), 0 verborgen elementen.
- Instrument toont direct eindstand 66; orb, iris en verdict-gloed staan stil.
- Flow: stap-choreografie en druk-fysica uit; alles compleet.

## Ambient-budget en performance

- Exact 2 ambient-systemen: orb (ademhaling + iris, één wezen) en verdict-gloed;
  beide pauzeren off-screen (AmbientGuard). Orb-gaze en badge-tik zijn interactie,
  geen loops. Geen scroll-scrubbing: discrete weegmomenten via getBoundingClientRect
  bij scroll-rAF (les B2). Nooit blur-radius geanimeerd; alleen opacity/transform.
- LCP blijft tekst; nieuwe JS beperkt tot twee kleine client-componenten
  (WegingConductor, LivingOrb) zonder dependencies.
