# Verify — Vergeten oppervlakken in clean-glass (login, /app, 404, welkomstmail)

Datum: 2026-07-05 · Door: Fable · Branch: fable/clean-glass-rebuild-20260705
Aanleiding: Richards screenshot (IMG_1253) van /app op de Vercel-preview: het oude
donkerblauw-paarse "Venture OS"-shell, buiten de v2-restyle-scope gevallen
(DESIGN-DNA.md v2 zei letterlijk: "Portal/app buiten scope").
Omgeving: Linux-sandbox (aarch64), Chromium 131 headless-shell, next dev (turbopack),
zelfde meetmethode als evidence/beleving-de-weging-20260705.

## Wat het screenshot was

Route `/app` (app/app/page.tsx + AiowAppShell.module.css): "Je AI Venture OS." met
paars-blauwe gradients, het letterlijke generic-twin-verbod uit fase 3 van het DNA.
Extra pijnlijk: de "Login"-link in de nieuwe clean-glass-nav wees naar dit oppervlak.

## Geïnventariseerde vergeten oppervlakken

Deze slag gerestyled:
1. `/portal` — de echte login (magic link + OTP), stond nog in civic beige/oranje.
2. `/app` — het Venture OS-shell uit het screenshot, donker gradient-tijdperk.
3. 404 — bestond niet (kale framework-default); nu app/not-found.tsx.
4. `core/email/templates/welcome.tsx` — AIOW-variant was donker met cyaan #00D9FF.
5. Nav-Login-link wees naar /app; wijst nu naar /portal.

Genoteerd voor een vervolgslag (niet in deze commit):
- `/intake` (CivicIntakeForm, civic-stijl; bewuste private-intake-route, zie
  docs/aiow-private-intake-rule-2026-06-24.md)
- `/portal/customer/[accountId]` (1032 regels), `/portal/admin/*` (1094 regels),
  `/portal/phase2`, `/portal/account/new`, `/contract/[contractId]` — auth-gated
  dossier- en adminviews, eigen slag met echte accounts nodig voor pixel-proof.
- Supabase magic-link-mailtemplate leeft in het Supabase-dashboard (extern),
  hoort mee in de e-mail-slag.
- Legacy-routes (/legacy-aiow, /aiow-v13, /early-access, /founders, /onetap-day):
  bewust legacy, geen restyle zonder Richard-besluit.

## De login als merk-moment (DESIGN-DNA v2.1)

- Chapter-statement in Literata, links uitgelijnd: "Open je dossier." (les A2).
- De orb (LivingOrb, zelfde wezen als op de homepage) staat achter de kaart;
  de glazen kaart (.cg-glass) leent zijn kleur — glas functioneel, nooit op kaal
  wit (Grondwet). Gaze en ademhaling identiek aan home, AmbientGuard actief.
- Eén gevulde CTA per fase, morfend label (les A16): "Stuur mijn inloglink" →
  "Wordt verstuurd..." → "Log in met code" → "Wordt gecontroleerd...".
  Accountnummer-fallback en "vraag een nieuwe link aan" zijn tekstlinks.
- Wachten als verhaal (les A17): één fase-chip op vaste plek (role=status,
  aria-live) benoemt de échte fases: 01 link wordt verstuurd → 02 link onderweg ·
  check je mail (eindstaat = uitnodiging: klik de link of vul de code in) →
  03 e-mail geverifieerd · dossiers ophalen → 04 kies je dossier / geen dossier.
  Geen kale spinner, geen fake progress; dot-puls stopt bij reduced-motion.
- Kleurgrammatica (les A14): petrol = primair/actief; rood uitsluitend validatie.
- Verdict-taal: "De weging is eerlijk, we zeggen vaker nee dan ja" bij geen
  dossier; CTA daar naar /nl/venture-score-aanvragen (de publieke aanvraagflow).

## Browser-gerenderde proof (screenshots hiernaast)

- login-390.png, login-1440.png — rustfase, orb + glas + één CTA.
- login-390-sent-fasechip.png — de A17-chip live in de sent-fase ("02 · LINK
  ONDERWEG · CHECK JE MAIL"), OTP-veld met autocomplete=one-time-code.
- login-390-menu.png — hamburger open: solide paneel, links ≥ 48px, X-staat.
- login-390-rm.png — prefers-reduced-motion: compleet en stil.
- app-390.png, app-1440.png — Venture OS-shell licht, Literata-kop, mono-
  microlabels, score als kale stat, solide tabbar (Chat als petrol-pil, 44px).
- 404-390.png, 404-1440.png — "Deze pagina weegt niets." met één CTA.

## Metingen

- Nul horizontale overflow: scrollWidth == clientWidth op alle negen shots
  (390 en 1440), programmatisch gemeten bij de capture.
- Header-check /portal (programmatisch): 5 top-level elementen (logo, instrument,
  nav, CTA, hamburger), 2 tekstlinks, precies 1 gevulde CTA (44px hoog, nowrap),
  hamburger 44×44. Zelfde CleanGlassNav als home/flow/kennisbank.

```
HEADER-CHECK (header-standaard.md v1) — /portal, /app-loze routes en 404
[x] ≤ 7 elementen: logo + 2 navlinks + 1 CTA + instrument (+ hamburger mobiel)
[x] precies één knop-CTA (Venture-score), nowrap, 44px tap-doel (141×44 gemeten)
[x] secundaire acties (Kennisbank, Login) als tekstlink, geen tweede knop
[x] wordmark compact 700; geen gespatieerde mono
[x] sticky glas-nav condenseert, omkeerbaar, fallback solide (tokens)
[x] mobiel: logo + instrument + CTA + hamburger; menu solide paneel, links ≥ 48px
[x] geen dode elementen, geen inline styles in headerzones
[x] 390px-screenshots: nul h-overflow (alle shots)
[x] reduced-motion/-transparency: bruikbaar en stil (login-390-rm.png)
```

## AA

Zelfde tokenparen als evidence/beleving-de-weging-20260705/aa-metingen.txt
(ink-soft op canvas 4,77 · accent op canvas 6,27 · on-accent op accent 6,33).
Nieuw gebruikte paren zijn uitsluitend donkerder (accent-strong op canvas/surface).
De 45%-trap alleen voor placeholders en het decoratieve brand-sublabel; de
canvas-microlabels in /app zijn naar de 62%-trap gezet (les B6).
E-mailtemplate: hex-benaderingen van dezelfde tokens, ink op canvas.

## tsc

`npx tsc --noEmit` schoon (enige meldingen uit ongetrackt tmp/-bestand van vóór
deze slag, ongewijzigd).

## Handoff Hermes

De beleving-preview (Hermes' verzameltaak) moet de nieuwe login tonen:
evidence/clean-glass-preview-20260705/ bevat nu ook login-390.png en de
bijgewerkte verify-report.md. Voor de volgende preview-deploy:

```bash
cd /Users/handsomebastard/projects/aiow-website
npm run build
npx vercel --yes   # preview only, geen --prod
# daarna: 200-check op /portal en /app, login-390 vers schieten van de preview-URL
```
