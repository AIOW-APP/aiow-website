# Verify — AIOW-app v1 (mobile/), 2026-07-05

Status: **deels uitgevoerd in de sandbox, rest klaargezet voor Hermes (Mac).**
De Fable-sandbox viel tijdens de verify definitief uit (schijf 94% vol,
bekende blocker op het board + daarna "bridge sockets"-fout op elke shell-call;
npm install kwam daardoor niet door). Alles wat geen shell nodig had is wel
gemeten en staat hieronder; de shell-stappen staan als exacte commando's klaar.

## 1. Uitgevoerd (sandbox, vóór de uitval)

### AA-contrast, programmatisch gemeten (WCAG-ratio's)

Tokens uit src/theme.ts (OKLCH → sRGB omgerekend met de oklab-matrices,
srgb-clamped; zelfde methode als aa-metingen.txt van de site-ronde):

| Combinatie | Ratio | Oordeel |
|---|---|---|
| ink #171B22 op canvas #FAF9F6 | 16.40 | AA/AAA |
| accent #006781 op canvas #FAF9F6 | 6.12 | AA (ook <18px) |
| accent #006781 op surface #FFFFFF | 6.45 | AA |
| wit #FFFFFF op accent #006781 (knoppen) | 6.45 | AA |
| verdict-ink #F2F6F7 op verdict #091018 | 17.56 | AA/AAA |
| fout #BA1D27 op canvas #FAF9F6 | 6.06 | AA |

De 62%-trap van ink wordt alleen voor secundaire regels gebruikt, de 45%-trap
uitsluitend voor placeholders/decor (les B6).

### Fonts

Literata (variabel, uit public/fonts van de site) geïnstantieerd naar twee
statische snedes met fontTools.varLib.instancer: Literata-Display (wght 520,
opsz 36) en Literata-Bold (wght 700, opsz 24); DM Mono woff2 → ttf. Staan in
mobile/assets/fonts/. Content staat nooit achter het laden (fallback-eerst,
zie src/letters.ts).

### Code-review-checks (handmatig, tegen DNA/lessen)

- Tap-doelen: alle Pressables minHeight ≥ 44 (knoppen 52, optiekaarten 60, rijen 56).
- Reduced-motion: bewegingVerminderd() in elke Animated-helper; WegingScreen
  start dan direct op fase 'verdict' met eindstand 66; geen loops.
- Rood uitsluitend destructief/fout (A14): alleen FoutRegel gebruikt theme.fout;
  het verdict "Nee" is ink/accent, geen rood.
- Wachten als verhaal (A17): FaseChip benoemt de echte weegfases, laatste staat
  is het resultaat; geen spinner.
- Demo = echt product (A18): demoweging eerlijk benoemd in de UI (WegingScreen
  + PartnerScreen microcopy).
- Eén CTA per scherm, vaste plek, morfend label (A16); ambient-budget: één
  orb-loop per scherm.
- Brand-switch: testbuilds heten zichtbaar AIOW TEST met testversie-chip
  (app.config.js + src/brand.ts, zelfde patroon als Tisnix/Bisnix).

## 2. Klaargezet voor Hermes (Mac) — onderdeel van de handoff-proof

```bash
cd ~/projects/aiow-website/mobile
npm install
npm run typecheck          # tsc --noEmit — verwacht: schoon
npx expo start             # Expo Go op een device: haptiek + pushmelding echt voelen
# web-render-check kan met: npx expo start --web
```

Screenshots kernschermen (start, intake stap 1-3, mijn weging vóór en ná het
verdict, partner-kanaal) horen bij de proof; de pushmelding op het
verdict-moment is alleen op een echt device/simulator te bewijzen.

## 3. Eerlijke noten

- tsc is dus nog NIET groen bewezen; de code volgt het Tisnix-app-patroon
  (zelfde SDK-versies) en tsconfig.verify.json ligt klaar voor een kale check,
  maar het bewijs moet van de Mac komen.
- expo-notifications: lokale notificatie als verdict-push zolang er geen
  backend is; remote push + echt score-endpoint zijn open punten (zie
  DESIGN-DNA open punt 2 en src/meldingen.ts / src/mock.ts HANDOFF-comments).
