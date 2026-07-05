# DESIGN-DNA: AIOW (aiow.ai)

Status: v2.1, opgesteld 2026-07-05 door Fable. Vervangt v1 (Aurora Verdict, zie git-historie).
v2.1 (zelfde dag): de belevingslaag "De Weging", na Richards diagnose van v2
("DNA-correct maar dood"). Alle v2-regels blijven gelden; v2.1 vult de expressie-slots
met leven in. Zie sectie "v2.1: De Weging" onderaan.
Aanleiding: besluit Richard 2026-07-05: AIOW gaat naar de clean-glass v3-Grondwet
(~/TeamVault/Operations/brand-dna-master-prompt-v3-clean-glass.md). Dit bestand is wet:
wijzigen = eerst hier, dan code.
Bronnen: Grondwet v3 · design-referentie-lessen.md (R1-R4) · aiow-referentievideo-analyse-
clean-glass-2026-07-05.md · referentievideo-analyse-emons-sphere-2026-07-05.md · DESIGN-DNA v1.
Scope: publieke site (homepage, venture-score-aanvraagflow, kennisbank). Portal/app buiten scope.

## Conceptnaam

**"Het Oordeel bij Daglicht"**: de beoordelaar van v1 blijft (orb, score, verdict-taal),
maar het theater verhuist van de donkere void naar een bijna-witte, Apple-clean studio.
Licht is niet langer decor; het enige donkere moment van de site is het verdict zelf.

## Wat blijft uit v1 (swap-test-versterkers, besluit Richard)

1. De orb (Spunky, de beoordelaar) als levende AI-presence.
2. De score-badge en de verdict-taal (venture-score, "vaker nee dan ja", cornerstones).
3. De merkstem: eerlijk, selectief, mede-eigenaar. Geen em-dashes, geen uitroeptekens.

Alles daaromheen (void, aurora-gradiënten, raster, noise, glas-als-basis) vervalt.

## Fase 2: Design-DNA v2

### Palet (OKLCH, licht, één accent)

| Token | OKLCH | Rol / materiaalbron |
|---|---|---|
| --cg-canvas | oklch(0.982 0.004 95) | bijna-wit, licht warm: papier van het dossier |
| --cg-surface | oklch(1 0 0) | kaarten, formulieren, nav-fallback |
| --cg-ink | oklch(0.22 0.015 260) | bijna-zwart, koel: de inkt van het oordeel |
| --cg-accent | oklch(0.47 0.10 220) | HET accent: verdict-petrol, het kernlicht van de orb bij daglicht ingedikt. AA op canvas en surface |
| --cg-verdict | oklch(0.17 0.02 250) | canvas van de ene donkere verdict-sectie |
| --cg-verdict-ink | oklch(0.97 0.005 220) | tekst in de verdict-sectie |

- Tekst-hiërarchie via opacity-trappen van --cg-ink: 100 / 62 / 45% (les A4).
  Bodem: microcopy haalt AA of gaat een trap omhoog (les B6).
- Het accent leeft primair in content (orb-kern, score-ring, verdict-status) en in UI
  alleen voor CTA, actieve staat en focus (les A5). Nooit op decoratie.
- Succes = accent; fout = oklch(0.51 0.19 25), alleen in validatie, nooit decoratief.

### Typografie

- **VOORLOPIG, Richard kan overrulen. Display: Literata** (variabel, opsz 7-72, wght
  200-900, staat al in public/fonts, dus nul netwerk en één asset-systeem, les A9).
  Motivatie: Inter als display staat op de verboden-defaults-lijst; Richards eigen
  home-v3-rewrite koos al een serif-display (Georgia). Literata op opsz 36+, wght 460-560,
  is het "dossier bij daglicht": editorial, beoordelend, geen SaaS-genericiteit.
- Body: rustige systeem-sans stack (-apple-system, system-ui). Kalm, Apple-clean,
  geen webfont-gewicht voor leesregisters.
- Mono: DM Mono (public/fonts) uitsluitend voor score-cijfers, microlabels en data.
- Registers: display (Literata, clamp, text-wrap: balance) · body (sans, max 3 regels
  per sectie) · microlabel (DM Mono, caps, tracking 0.14em, nooit body, les B5).

### Glasrecept (v3, functioneel, nooit de basis)

```css
background: color-mix(in oklch, var(--cg-surface) 62%, transparent);
-webkit-backdrop-filter: blur(18px) saturate(160%);
backdrop-filter: blur(18px) saturate(160%);
box-shadow: inset 0 0 0 1px color-mix(in oklch, white 55%, transparent),
            0 8px 28px color-mix(in oklch, var(--cg-ink) 8%, transparent);
```

Regels (Grondwet): glas alleen als laag boven beeld/kleur (nav boven de hero-orb en de
verdict-sectie, zwevende chips), nooit op kaal wit, max 2 glaslagen per viewport,
korte labels op glas oké, body nooit op glas. Fallbacks verplicht:
`@supports not (backdrop-filter: blur(1px))` naar solide surface, en
`prefers-reduced-transparency: reduce` naar solide. Nooit blur-radius animeren;
glas-oppervlakken krijgen `contain: paint`.

### Expressie-slots

1. **HEADER/HERO. VOORLOPIG, Richard kan overrulen.** Advies gevolgd: de home-v3.html
   video-rewrite vervalt als homepage; ervoor in de plaats komt een rustige typografische
   header binnen het app/tokensysteem: microlabel, chapter-statement in Literata, één
   sub-regel, één CTA, en rechts/onder de orb als enig groot visueel element (slot-1
   karakter D-licht: het instrument is het beeld). Geen video, geen canvas; LCP is tekst.
   Mobiel 390px ontworpen: statement boven de vouw, orb daaronder, scroll-hint als
   microlabel.
2. **ACCENT**: verdict-petrol (zie palet), uit de merkwereld (orb-kernlicht), OKLCH, AA.
3. **SIGNATURE**: de **score-badge als persistent instrument** (les A1, FATHOM-meter).
   Kleine ring rechts in de glas-nav. Reist mee met de scroll: de conic-ring vult zich
   omkeerbaar met de leesvoortgang van het verhaal en is pas vol in de verdict-sectie,
   waar de site eindigt op de CTA. Puur cosmetisch: de eindstand staat in de HTML;
   zonder JS of met reduced-motion toont hij direct de eindstand. Tap-doel 44px;
   tikken scrollt naar het verdict.
4. **MOTION-KARAKTER**: "kalm water". Eén easing: cubic-bezier(0.22, 1, 0.36, 1).
   UI 150-350ms, hero-orkestratie max 700ms. Reveals zijn opacity/transform op reeds
   aanwezige DOM (AiowReveal-laag, content nooit achter JS). Stagger met betekenis:
   kaart-elementen 100-150ms in leesvolgorde (les A3), statement-regels 60-90ms.
   Max 2 ambient-loops per pagina: (1) orb-ademhaling, (2) subtiele gloed in de
   verdict-sectie. Loops pauzeren off-screen. prefers-reduced-motion: alles staat
   direct compleet, badge op eindstand. Scroll- en hoverstates omkeerbaar (les A12).
5. **ASSET-RICHTING**: geen fotografie, geen stock, geen icon-sets. Het beeld van AIOW
   is de orb en zijn afgeleiden (score-ring, voortgangssegmenten, verdict-gloed): één
   asset-systeem in code door de hele site (les A9). Cases zijn tekst met naam en bewijs.

### Sectie-anatomie (lessen A2/A6/A7/A10)

Elke sectie = hoofdstuk: microlabel (DM Mono caps, bv. "01 · DE TOETS") → chapter-statement (Literata, één korte zin, links
uitgelijnd) → max 3 regels body → één bewijs-element. Eén idee per viewport.
Bewijs-kaarten: kop → sub → stats → één zin met ziel, met stagger.
Stats altijd als kale typografie: groot getal (DM Mono of Literata licht) +
hairline-microlabel, geen dozen (les A10). Verticale rust tussen zware secties:
minimaal 120px desktop, 80px op 390px (les A7).

### Dichtheids-ritme en de verdict-sectie (lessen A8/B1)

Maximaal één rijk moment per pagina. Op de homepage is dat de afsluitende
**verdict-sectie**: het ene donkere contrastmoment (--cg-verdict) waar de orb-gloed
en de volle score-badge samenkomen in de CTA "Vraag je venture-score aan".
Alle overige secties zijn klassiek-rustig op bijna-wit. De nav (glas) blijft leesbaar
boven beide werelden; UI leeft aan de randen, het centrum is van de content (les A13).

### Navigatie

Sticky glas-nav volgens het glasrecept, condenseert bij scroll van 72px naar 56px
(alleen height/padding/shadow animeren, geen blur). Inhoud: wordmark links, 2-3 items,
score-badge rechts als levend element. Actief item: hairline-onderstreepje.
Mobiel: wordmark + badge + één CTA-link; tap-doelen minimaal 44px; geen hamburger nodig
zolang er maar 2-3 bestemmingen zijn.

### States als merk-momenten (uit v1, herbevestigd)

- Verzenden: knoptekst "Wordt voorgelegd..." (geen spinner-theater).
- Succes: score-badge-moment + eerlijke verwachting ("binnen 48 uur", "vaker nee dan ja").
- Validatie: foutkleur-hairline + zin die zegt wat er mist en hoe verder, in merkstem.
- Zonder JS: pagina compleet leesbaar, formulier-alternatief (mail) altijd zichtbaar.

### Copy-voice

Eerlijk, selectief, mede-eigenaar. Actieve knoppen. Elke sectie één zin met ziel
(les A6, de FATHOM-lat). Geen em-dashes, geen uitroeptekens, geen gratis-beloftes.

## Fase 3: Anti-generieke poort (te verslaan generic twins)

1. Generieke SaaS-landing (gecentreerde H1 + 2 knoppen + screenshot): verslagen door
   links uitgelijnde chapter-statements, orb i.p.v. screenshot, score-badge-instrument.
2. Paars-blauwe SaaS-gradient: verslagen door één petrol-accent op bijna-wit.
3. Inter/Poppins-display: verslagen door Literata (voorlopig besluit, zie boven).
4. Icoongrids: verboden; bewijs is typografie en kaart-anatomie.
5. Swap-test: orb + score-badge + verdict-taal ("vaker nee dan ja") passen bij geen
   enkel bureau of fonds; de Grondwet-laag mag overleven, dat is de huisstijl.

## Voorlopige keuzes van Fable (Richard kan overrulen)

1. **Display-font = Literata** (variabel, al in repo). Alternatieven als Richard anders
   wil: Fraunces (warmer, eigenwijzer) of Newsreader (stiller). Niet Inter.
2. **Homepage-header = rustige typografische header binnen het tokensysteem** (statement
   + orb + score-badge-instrument), ter vervanging van de home-v3.html-video-rewrite;
   de rewrite-regel in next.config.ts vervalt zodat app/page.tsx weer / bedient.
   home-v3.html blijft als bestand bestaan (additief, niets weggegooid).

## Open punten voor Richard

1. De twee voorlopige keuzes hierboven bekrachtigen of overrulen.
2. Mailto-fallback in de aanvraagflow vervangen door echt endpoint (Handsome,
   zie code-comment in AiowVentureScoreFlow.tsx, ongewijzigd uit v1).
3. Kennisbank-artikelpagina's (nl/kennis/[slug]) volgen in een vervolgslag; deze slag
   restylet de hub. Zelfde tokens, geen nieuw DNA nodig.

## 6-vragentest v2 (na de build ingevuld, zie evidence/)

1. Logo weg: orb + score-ring + verdict-taal blijven herkenbaar.
2. Swap-test: expressie-slots falen bij elke concurrent; Grondwet-laag overleeft bewust.
3. Eén signature-moment: de score-badge-reis die eindigt in de verdict-sectie.
4. Mobiel ontworpen: 390px eerst, tap-doelen 44px, geen horizontale scroll.
5. States als merk-momenten: ja (zie hierboven).
6. Budgets: LCP is tekst, geen video/canvas op de homepage; JS-toevoeging beperkt tot
   nav-condens + badge-voortgang (kleine client-componenten). Meting bij Hermes-verify.

## v2.1: De Weging (belevingslaag, 2026-07-05)

Diagnose van v2 door Richard: DNA-correct maar dood. De homepage beweerde het merk
("wij wegen, wij zeggen vaker nee dan ja") maar liet het niet meemaken. v2.1 maakt de
homepage het oordeel zelf: er ligt een aanvraag op tafel en de bezoeker kijkt mee hoe
AIOW weegt, van intake tot verdict.

### De kern-interactie (les A11)

Scroll = de weging van dossier #217, een voorbeeldweging samengesteld uit echte
aanvragen (zo benoemd op de pagina, geen fictie die zich als klant voordoet).
Drie hoofdstukken zijn de drie assen; elk hoofdstuk eindigt in een weegmoment:
founder +28, venture +17, partner fit +21. Totaal 66, de lat ligt op 70.
Het verdict is nee, met de concrete tip erbij, en draait dan naar de bezoeker:
"wij zeggen vaker nee dan ja, daarom is ons ja iets waard". De merkbelofte wordt
niet beweerd maar gedemonstreerd, inclusief de eerlijkheid van een afwijzing.

### Slot 3 aangescherpt: de score-badge weegt zichtbaar mee

- De badge in de nav is op de homepage een levend weeginstrument: mono-cijfer (00 → 66)
  plus conic-ring met een vaste lat-markering op 70. Hij telt per weegmoment discreet
  op (geen scroll-scrubbing, les B2), volledig omkeerbaar bij terugscrollen (A12).
- Elk weegmoment in de pagina is een sentinel ([data-weging]); een kleine conductor
  (client) berekent de gepasseerde wegingen, zet data-aiow-stage op <html> en telt de
  cijfers. Alles rijdt op de bestaande reveal-gate (data-aiow-reveal): zonder JS of met
  reduced-motion staat overal direct de eindstand (66) en zijn de weegregels compleet.
- Op flow en kennisbank blijft de badge het rustende instrument (VS, ring vol) en linkt
  hij naar de aanvraagflow.

### Slot 1 aangescherpt: de orb is een wezen, geen decoratie

De orb reageert: de kern kijkt op desktop richting de cursor (rAF, gedempt) en kijkt
op elk apparaat de pagina in naarmate je scrolt (touch-equivalent met hetzelfde
verhaal, les A11/B4). De iris pulseert zacht als "denken". Orb-systeem = ambient-loop
1 van 2 (ademhaling + iris horen bij één wezen); verdict-gloed = loop 2. Loops
pauzeren off-screen (AmbientGuard), reduced-motion: stil en compleet.

### Header conform header-standaard.md v1 (bindend)

Logo + 2 tekstlinks (Kennisbank, Login) + één CTA-knop (Venture-score) + badge-
instrument = 5 elementen. Mobiel: logo + instrument (in de logo-zone, zoals de
testversie-chip-regel) + CTA + hamburger; de links verhuizen naar een solide
menu-paneel (knop 44px, links ≥48px, aria-expanded, sluit bij klik/Escape/scroll).
Dit vervangt de v2-keuze "geen hamburger nodig"; de standaard wint.

### Micro-interactielaag (overal, kalm water)

Druk-fysica op elke knop en optie (scale .985 bij :active), zachte kaart-lift op
hover die in rust terugkeert, weegregels die aanklikken bij passage. Flow en
kennisbank ademen mee: stap-wissel-choreografie in de flow (CSS-only entrance),
zelfde druk-fysica en focus-states, geen extra loops.

### Verdict-sectie uitgebreid

Het ene donkere moment (A8) toont nu de weging zelf: score-rail 0-100 met marker op
66 en de lat op 70, verdict-statement, de tip aan #217, en dan de draai naar de
bezoeker met de CTA. Microcopy benoemt eerlijk dat #217 een voorbeeldweging is.
