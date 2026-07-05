# Verify-rapport: AIOW clean-glass rebuild v2

Datum: 2026-07-05 · Door: Fable · Branch: fable/clean-glass-rebuild-20260705
Kader: DESIGN-DNA.md v2 + Grondwet v3 + design-referentie-lessen.md (R1-R4)

## 1. Typecheck en build

- tsc --noEmit: schoon. Enige fouten zitten in tmp/aiow-v2-interaction.spec.ts,
  een niet-getrackt restbestand van een eerdere sessie (playwright-types ontbreken);
  geen onderdeel van deze build.
- next build (productie): geslaagd, "Compiled successfully", 931 statische pagina's.
  Gedraaid in de Fable-sandbox op een lokale Linux-kopie van de werkboom omdat de
  gemounte werkboom te traag is voor een build. Hermes draait de build-verify nogmaals
  op de Mac bij de preview-deploy (zelfde commit).
- Routegewichten: / = 2.05 kB + 108 kB first-load JS; /nl/venture-score-aanvragen =
  3.95 kB + 110 kB; /nl/kennis = 1.74 kB + 107 kB. Ruim onder het 250 kB-budget;
  de ~105 kB gedeelde Next-runtime zit iets boven de 100 kB-richtlijn, geen regressie
  ten opzichte van de bestaande site.

## 2. HTTP + DOM-verify (productie-build, next start in sandbox)

| Route | Status | Checks |
|---|---|---|
| / | 200 | clean-glass-v2 marker, chapter-statements, verdict-sectie, CTA, Spunky-chip aanwezig; geen oude aurora-tokens (#040713) |
| /nl/venture-score-aanvragen | 200 | intro + driestaps-flow renderen, anker #aanvraag |
| /nl/kennis | 200 | hub met kaarten rendert licht |
| /nl/kennis/ai-venture-partner-nederland | 200 | artikelsjabloon licht |
| /fonts/Literata.woff2 | 200 | display-font geserveerd |

CSS-bundel bevat: Literata @font-face, oklch()-tokens, glasrecept (backdrop-filter +
saturate), @supports-fallback, prefers-reduced-transparency-fallback en
prefers-reduced-motion-dekking. Zonder JS is elke pagina compleet (AiowReveal-gate).

## 3. AA-contrast (berekend, OKLCH naar sRGB)

- ink op canvas 16.4 : 1 · ink 62% op canvas 4.77 : 1 (AA) · accent op canvas 6.1 : 1 (AA)
- verdict-ink op verdict 17.5 : 1 · verdict-ink 62% 7.1 : 1 (AA)
- De 45%-trap haalde 2.85 : 1 en is daarom uit alle tekst gehaald (les B6-bodem):
  45% is nu uitsluitend decoratief (hairlines, placeholders).

## 4. Anti-generieke poort (generic twins verslagen)

1. Gecentreerde-H1-plus-twee-knoppen-SaaS: nee. Links uitgelijnde chapter-statements
   in Literata, orb in plaats van screenshot, score-badge-instrument in de nav.
2. Paars-blauwe SaaS-gradient: nee. Eén verdict-petrol accent op bijna-wit.
3. Inter/Poppins-display: nee. Literata variabel (voorlopige keuze, Richard kan overrulen).
4. Icoongrids/emoji-UI: afwezig. Bewijs is kaart-anatomie en kale stats-typografie.
5. Body op glas / glas op wit: afwezig. Glas alleen nav en orb-chip; kaarten solide.
6. Stockvideo: afwezig; de home-v3-hero-video is met de rewrite-regel vervallen.

## 5. 6-vragentest

1. Logo weg: orb + score-ring + verdict-taal ("vaker nee dan ja") blijven herkenbaar. Ja.
2. Swap-test: expressie-slots (badge-reis, orb, verdict-sectie, Literata-dossier-toon)
   passen bij geen bureau of fonds; de Grondwet-laag mag overleven. Geslaagd.
3. Eén signature-moment: de score-badge vult zich met de scroll en is vol bij het
   verdict; de flow eindigt in hetzelfde ring-motief. Ja.
4. Mobiel ontworpen: 390px-eerst gebouwd; één kolom, tap-doelen 44px+ (nav-links,
   badge, opties, knoppen), inputs 16px tegen iOS-zoom, overflow-x: clip.
5. States als merk-momenten: verzenden/succes/validatie conform DNA. Ja.
6. Budgets: LCP is tekst (geen video/canvas), JS-toevoeging beperkt tot nav-condens,
   badge-voortgang en ambient-pauze. Meting op preview door Hermes.

## 6. Motion-regels

- Eén easing (kalm water), reveals via bestaande AiowReveal-laag (content in DOM).
- Ambient-loops homepage: orb-ademhaling + verdict-gloed = precies 2; AmbientGuard
  pauzeert ze off-screen; reduced-motion zet alles stil en compleet.
- Nav condenseert via hoogte/schaduw; nergens wordt blur-radius geanimeerd.
- Badge-voortgang is omkeerbaar en puur cosmetisch; eindstand staat in de CSS-default.

## 7. Niet gedekt in deze sandbox-verify (naar Hermes)

- Pixel-screenshots op 390px: de sandbox is aarch64 zonder browser en zonder
  toegang tot browser-downloads. Onderdeel van Hermes' EXPECTED_PROOF bij de
  preview-deploy (390px-screenshots van /, venture-flow en kennisbank).
- Lighthouse-budgetmeting (LCP/CLS/INP) op de preview-URL.
