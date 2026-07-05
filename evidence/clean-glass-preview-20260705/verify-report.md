# AIOW clean-glass preview verification — 2026-07-05

Task: `20260705-aiow-clean-glass-rebuild-preview`

Branch: `fable/clean-glass-rebuild-20260705`
Commit: `2fee8f1`

## Local build

Command:

```bash
npm --prefix /Users/handsomebastard/projects/aiow-website run build
```

Result: PASS — Next.js 15.5.15 build completed; 931 static pages generated.

## Vercel preview deploy

Command:

```bash
cd /Users/handsomebastard/projects/aiow-website && npx vercel --yes
```

Result: PREVIEW deploy only, no `--prod` used.

Preview URL:

https://aiow-main-site-5maicnodo-officeaiowios-projects.vercel.app

Vercel inspect URL:

https://vercel.com/officeaiowios-projects/aiow-main-site/Bkfcn9L9LUUm5uqWdzpNbU8g9gMS

## Public unauthenticated HTTP checks

```text
200 /
200 /nl/venture-score-aanvragen
200 /nl/kennis
```

## 390px screenshots

- `/`: `/Users/handsomebastard/projects/aiow-website/evidence/clean-glass-preview-20260705/home-390.png`
- `/nl/venture-score-aanvragen`: `/Users/handsomebastard/projects/aiow-website/evidence/clean-glass-preview-20260705/venture-score-390.png`
- `/nl/kennis`: `/Users/handsomebastard/projects/aiow-website/evidence/clean-glass-preview-20260705/kennis-390.png`
- `/portal` (login, toegevoegd 2026-07-05 na de vergeten-oppervlakken-slag):
  `/Users/handsomebastard/projects/aiow-website/evidence/clean-glass-preview-20260705/login-390.png`
  — browser-gerenderd (Chromium 131 headless, next dev), volledige proof en
  desktop/fase-chip/menu/reduced-motion-varianten in
  `evidence/vergeten-oppervlakken-20260705/`.

## Update 2026-07-05, vergeten oppervlakken (voor de volgende preview-run)

Richards screenshot van het oude donkere `/app`-shell is opgelost: `/portal`
(login als merk-moment, fase-chip A17), `/app` (clean-glass re-skin), 404 en de
AIOW-welkomstmail staan nu in het tokensysteem; de nav-Login-link wijst naar
`/portal`. De eerstvolgende preview-deploy hoort deze routes mee te nemen en de
preview-checks uit te breiden met:

```text
200 /portal
200 /app
404 /dit-bestaat-niet (branded not-found, geen framework-default)
```

## Production safety

Production domain `aiow.ai` was not deployed and no production command was run.
