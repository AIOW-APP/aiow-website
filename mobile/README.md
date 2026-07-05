# AIOW-app v1 — de venture-score in je zak

Expo-app volgens report §5 (`~/TeamVault/Reports/aiow-design-rollout-20260705/fable-beleving-20260705/report.md`)
en DESIGN-DNA.md v2.1 (clean-glass v3, "De Weging"). Opzet naar het patroon van
de Tisnix-app (`~/projects/tisnix-upload-20260704/app`): minimale dependencies,
platte state-navigatie, brand-switch op build-niveau.

Plek: `mobile/` in deze repo, omdat `app/` hier de Next.js App Router is
(de opdracht zei "onder app/ of een logischer plek"; dit is die logischer plek).

## Schermen

1. **Start**: orb (Spunky) als enig groot beeld, merkstem, een CTA.
2. **Intake**: dezelfde drie stappen als de webflow, haptiek per bewuste druk,
   de orb leest mee, validatie in merkstem (rood alleen voor fouten, les A14).
3. **Mijn weging**: het dossier-scherm. Instrument groot (tellend mono-cijfer +
   rail met de lat op 70), per as de weegregel, statuschip die de echte fases
   vertelt (les A17), **pushmelding op het moment dat het verdict valt**
   (lokale notificatie zolang er geen backend is; zie src/meldingen.ts).
   Het verdict is de ene donkere sectie.
4. **Partner-kanaal** (alleen na een ja): fase-chips, bewijsmomenten, een lijn
   naar het team.

Mock-data waar geen API is (src/mock.ts, zelfde afspraak als Tisnix/Cargo);
de demoweging is eerlijk zo benoemd in de UI (les A18: demo = echt product).

## Brand-switch (Bisnix-regel)

Elke build zonder `EXPO_PUBLIC_BRAND=aiow` heet zichtbaar **AIOW TEST** met
testversie-chip. Het EAS-productieprofiel zet de vlag; verder niets forken.

## Draaien en checken

```
npm install
npm run typecheck   # tsc --noEmit
npm start           # Expo Go; web via w (react-native-web zit erin)
```

Fonts: Literata (Display 520/opsz36 en Bold 700/opsz24, geinstantieerd uit de
variabele font van de site) en DM Mono, in assets/fonts. Content staat nooit
achter het laden; fallback is systeem-serif/mono. Literata blijft de
voorlopige keuze van het DNA; Richard kan overrulen (zelfde open punt als de
wordmark-kwestie op de site).

Toegankelijkheid: tap-doelen >= 44px, AA-contrast programmatisch gemeten
(zie evidence in de repo), reduced-motion = alles direct op de eindstand,
accessibility-labels op instrument en weegregels.
