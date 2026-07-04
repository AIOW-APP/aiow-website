# DESIGN-DNA — AIOW (aiow.ai)

Status: v1, opgesteld 2026-07-04 door Fable (fase 1-2 gereconstrueerd uit bestaande code en copy).
Proces: Brand-DNA Master Prompt v2 (teamstandaard). Dit bestand is wet: wijzigen = eerst hier, dan code.
Scope: publieke site (landing, kennisbank, venture-score-aanvraagflow). Portal/app buiten scope v1.

## Fase 0 — Intake

- Merk: AIOW BV, AI venture partner. Geen bureau, geen klassieke investeerder: bouwt AI-producten
  en groeisystemen mee in ruil voor een omzetdeel (indicatief 10-25%), zelfde deel bij verkoop.
- Publiek: founders met een idee of vroeg product, en ondernemers met bewezen omzet. NL-first,
  mobiel zwaar vertegenwoordigd (founders lezen dit op de bank, niet achter een bureau).
- DE ENE TAAK van deze site: een founder laat zijn idee beoordelen via de venture-score-aanvraag.
  Alles op de site leidt daarheen. Route: /nl/venture-score-aanvragen.
- Platform: Next.js App Router + CSS-modules, statisch waar mogelijk.
- Durf-niveau: 3 van 5. Het merk durft (void + aurora, grote koppen, strakke selectie-taal) maar de
  site moet zakelijk vertrouwen wekken bij ondernemers die geld en bedrijf inbrengen. Durf zit in
  het signature-element, de rest blijft stil.
- Situatie: doorontwikkeling van bestaande build (venture-partner-v1 landing is live-kandidaat).
  Bestaande assets zijn wet (fase 1-regel).

## Fase 1 — Brand World Research (uit bestaande code en copy)

### Materiaal-inventaris (waar de wereld van AIOW uit bestaat)
1. Deep-space void: bijna-zwart canvas (#040713 / #0A0A0B), diepte via radiale gloed, geen vlak zwart.
2. Aurora-licht: cyaan, violet en magenta als lichtbronnen die uit de rand van het canvas komen.
3. Glas: panelen met backdrop-blur en 1px witte hairlines (8-16% alpha), nooit dichte kaarten.
4. Raster: fijn 58px grid als technische onderlaag, weggemaskeerd naar de randen.
5. De orb: levende AI-presence (Spunky), concentrische ringen, conic-gradient, wit kernlicht.
6. Het brandmark: vierkant met conic-gradient (cyaan-violet-magenta) en een donkere A.
7. Filmkorrel: 4% noise-overlay voor cinema-gevoel.
8. Signaal-groen (#00E6A8): de "Spunky online"-indicator, live en wakker.
9. Amber/goud (#FFB840): warning/waardering-signaal uit de token-set, spaarzaam aanwezig.
10. Pillen: elke knop en badge is een volledige ronding (999px), nergens harde hoeken op interactie.

### Vernacular (insider-woorden, letterlijk uit de copy)
venture-score, omzetdeel, venture intake, Deal Card, Spunky, AI-hefboom, tractie, bouwbaarheid,
partner fit, huid in het spel, "vaker nee dan ja", best-route-first, AI-systeemscan, cornerstones
(founder / venture / partner fit als vaste beoordelingsassen), "geen gratis chatbot".

### Concurrent-scan (wat we NIET mogen lijken)
1. Het AI-bureau met uurtarief-taal ("wij ontzorgen", "vrijblijvende offerte"): AIOW selecteert,
   verkoopt niet. Copy zegt vaker nee dan ja.
2. De accelerator/VC-site (deal-flow-jargon, portfolio-grids, term sheets): AIOW bouwt zelf mee,
   het is een werkplaats, geen fonds.
3. De generieke AI-SaaS-landing (gecentreerde H1 + twee knoppen + productscreenshot): AIOW heeft
   geen product-screenshot, het product is het oordeel en de samenwerking.

### Categorie-cliché (max 1, bewust verdraaid)
De "AI-gloed op donker" blijft, maar verdraaid: het licht is geen decoratie maar een wezen (de orb
is Spunky, de beoordelaar). Licht = aandacht van de beoordelaar.

### Emotionele kern (3 seconden)
"Dit is geen leverancier, dit is een partner die mij gaat beoordelen zoals een investeerder dat
doet, en die alleen ja zegt als hij er zelf in gelooft." Gevoel: serieus genomen worden + gezonde
spanning van een selectieproces.

## Fase 2 — Design DNA

### Conceptnaam
**"Aurora Verdict"** : een donkere void waarin aurora-licht de aandacht van de beoordelaar is, en
alles toewerkt naar één moment: het oordeel (de venture-score).

### Palette (bron: bestaande code; OKLCH benaderd vanaf hex, hex blijft leidend tot Richard anders beslist)
| Token | Hex (bron in code) | OKLCH (≈) | Materiaalbron |
|---|---|---|---|
| void / canvas | #040713 (landing), #0A0A0B (tokens) | oklch(0.13 0.03 265) | deep-space void |
| ink | #F7FBFF / #F8F8FA | oklch(0.98 0.005 220) | wit kernlicht van de orb |
| cyaan (primair accent) | #00E5FF / #00F0FF | oklch(0.85 0.14 200) | aurora, actieve rand |
| violet | #7B4BFF | oklch(0.55 0.25 285) | aurora, diepte |
| magenta | #FF38D6 / #FF4FD8 | oklch(0.70 0.26 335) | aurora, waarschuwing "geen gratis chatbot" |
| amber | #FFB840 | oklch(0.83 0.15 75) | goud/waardering, spaarzaam (score-momenten) |
| signaal-groen | #00E6A8 | oklch(0.85 0.17 165) | "Spunky online", succes |

Contrast: ink op void haalt AA ruim; cyaan/amber alleen op void of als tekstkleur >= 14px bold;
donkere tekst (#061018) op lichte gradientknoppen is de AA-veilige route voor primaire CTA's.

### Typografie
- Display en body: Inter (systeem-fallback), zware gewichten (850-950) met sterk negatieve tracking
  (-0.05 tot -0.075em) voor koppen; dat samengeperste zwart-op-void is nu het typografische gezicht.
- Mono: JetBrains Mono in de token-set, vrijwel ongebruikt; reserveren voor score-cijfers en
  KvK/data-details.
- Fluid clamp() overal (zie --text-* tokens in globals.css).
- OPEN PUNT (Richard): Inter als display staat op de verboden-defaults-lijst van het masterproces.
  Huidige situatie werkt door tracking/gewicht, maar een karaktervolle display-familie is de meest
  kansrijke upgrade van dit merk. Niet wijzigen zonder besluit.

### Surface & structuur-taal
- Panelen zijn glas: rgba-wit 4-7% vulling, 1px hairline 8-12%, backdrop-blur 18-26px, radius 16-26px.
- Interactie is altijd een pil (999px). Vierkant = inhoud, rond = actie.
- Accentstreepjes: 28-32px gradient-balkje (cyaan-violet-magenta) als kaartmarkering, geen iconen.
- Het raster en de noise blijven onder alles liggen: techniek + cinema.

### Layout-concept (hero als these)
Website-these: de beoordelaar voorop. Links de claim ("Wij bouwen niet voor bedrijven. Wij bouwen
mee aan bedrijven."), rechts de levende orb met het beoordelingspaneel (founder / venture / partner
fit). De bezoeker ziet in één beeld: hier wordt geselecteerd. Elke pagina eindigt in dezelfde
afslag: vraag je venture-score aan.

### SIGNATURE-ELEMENT: de venture-score-aanvraag + score-badge
Het ene element dat geen concurrent heeft: je idee wordt hier niet "aangevraagd" maar VOORGELEGD.
- De aanvraagflow (/nl/venture-score-aanvragen) is een rustige driestaps-beoordelingsintake:
  1 idee + branche, 2 fase + doel, 3 founder-gegevens. Eén vraaggroep per stap, voortgang als
  drie lichtsegmenten die vollopen in aurora-cyaan.
- De score-badge: conic-gradient ring (zelfde gradient als het brandmark) rond een donkere kern.
  Succes-staat van de flow = de badge licht op ("aanvraag voorgelegd, binnen 48 uur je uitslag").
  Hetzelfde motief is later herbruikbaar voor de echte score-uitslag (cijfer in de ring, mono-font).
- Mobiel gedrag (ontworpen, niet gekrompen): stappen full-width, max 30rem, inputs 16px (geen
  iOS-zoom), knoppen >= 48px, voortgangsbalk blijft boven de vouw, badge schaalt naar 96px.

### Motion-concept
- Eén fysica-karakter: uitgedempt licht. Alles beweegt met ease-out cubic-bezier(0.16, 1, 0.3, 1);
  reveals zijn fade + rise 18px, koppen krijgen een clip-wipe. Stagger 90ms via --reveal-order.
- Content is zonder JS altijd zichtbaar (AiowReveal gate-script, teamregel).
- Het ene georkestreerde moment: de succes-badge van de aanvraagflow.
- OPEN PUNT (Richard): teamregel is max 2 ambient-loops per pagina. De landing heeft er nu meer
  (3x breathe-glow + orbPulse + slowSpin in de orb). Voorstel: de orb telt als 1 samengesteld
  signature-loop en de 3 breathe-glows worden er 1, of we accepteren de landing expliciet als
  uitzondering. Besluit nodig; nieuwe pagina's (waaronder de aanvraagflow) houden zich al aan
  max 1 ambient + reduced-motion.

### State-design (staten als merk-momenten)
- Loading/verzenden: knoptekst wordt "Wordt voorgelegd..." (geen spinner-theater).
- Succes: score-badge-moment + eerlijke verwachting ("binnen 48 uur", "vaker nee dan ja").
- Error/validatie: magenta hairline + zin die zegt wat er mist en hoe je verder kunt, in merkstem.
- Empty (nav zonder JS/mail): altijd een direct alternatief tonen (mail jeroen@aiow.io, WhatsApp).

### Asset-strategie
Geen stockfoto's, nergens. Het beeld van AIOW is licht, glas, raster en de orb, alles in code.
Cases worden verteld in tekst met naam en bewijs (Cargo Donkey, OneTap Day), niet met mockups.

### Copy-voice
Drie woorden: eerlijk, selectief, mede-eigenaar. Vanuit de gebruiker geschreven, actieve knoppen
("Vraag je venture-score aan", niet "Versturen"). Geen em-dashes in NL-copy (teamregel), geen
uitroeptekens, geen gratis-beloftes. Voorbeeldkop: "Wij bouwen niet voor bedrijven. Wij bouwen mee
aan bedrijven."

## Open punten voor Richard (samengevat)
1. Ambient-loop-budget landing vs teamregel max 2 (zie motion-concept).
2. Inter als display: houden of upgraden naar karaktervolle display-familie.
3. Dark-met-paarse-gloed staat op de generieke verboden-lijst; hier is het bestaand merk-asset.
   Voorstel: expliciet goedkeuren als bewuste keuze (zelfde redenering als cream/serif bij Cargo
   Donkey), gedragen door het signature-element.
4. Mailto-fallback in de aanvraagflow vervangen door echt endpoint (Handsome, zie code-comment).

## 6-vragentest v1 (na deze build opnieuw draaien)
1. Logo weg: orb + aurora + verdict-taal blijven herkenbaar. 2. Swap-test: "venture-score" en
"vaker nee dan ja" passen bij geen enkel bureau. 3. Eén signature-moment: de score-badge.
4. Mobiel ontworpen: ja, flow is mobiel-eerst. 5. States als merk-momenten: ja (zie state-design).
6. Budgets: door Handsome te meten bij host-side verify.
