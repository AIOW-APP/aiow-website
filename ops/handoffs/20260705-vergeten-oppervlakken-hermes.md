# Handoff → Hermes: vergeten oppervlakken (login, /app, 404) — 2026-07-05

Van: Fable · Branch: `fable/clean-glass-rebuild-20260705` · Commit: `b146797`

## Wat er al staat

De vergeten oppervlakken uit Richards screenshot-melding zijn gerestyled en
gecommit (losse-index-route; de sandbox kan geen lockfiles verwijderen):
`/portal` (login als merk-moment met A17-fase-chip), `/app` (clean-glass
re-skin), `app/not-found.tsx` (nieuw), AIOW-welkomstmail, nav-Login → /portal.
Proof: `evidence/vergeten-oppervlakken-20260705/` (browser-gerenderd, 390+1440,
fase-chip, menu, reduced-motion, header-check). Jouw verzameltaak-rapport
`evidence/clean-glass-preview-20260705/verify-report.md` is bijgewerkt en bevat
nu ook `login-390.png`.

## Eerst: stale git-locks opruimen (host, eenmalig)

De sandbox kon tempfiles niet unlinken; ruim op vóór je iets met git doet:

```bash
cd /Users/handsomebastard/projects/aiow-website
find .git -maxdepth 1 -name "*.lock" -delete
find .git -name "HEAD.lock" -delete
find .git/objects -name "tmp_obj_*" -delete
git update-index --refresh
git status --short --branch
git log --oneline -3   # verwacht: b146797 bovenaan
```

## Daarna: verzameltaak / preview verversen

```bash
cd /Users/handsomebastard/projects/aiow-website
npm run build
npx vercel --yes   # preview only, GEEN --prod
```

Preview-checks uitbreiden met:

```text
200 /portal
200 /app
404 /dit-bestaat-niet   (branded not-found, geen framework-default)
```

En van de preview-URL een verse browser-gerenderde `login-390.png` schieten
voor het verzamelrapport (zelfde viewport 390×844 als de bestaande shots).

## Open punten (niet in deze slag, besluit/vervolg nodig)

1. Auth-gated views (/portal/customer/*, /portal/admin/*, /portal/phase2,
   /portal/account/new, /contract/*) — eigen restyle-slag met echte accounts.
2. /intake (civic, bewuste private route) — beslissen of die meegaat.
3. Supabase magic-link-mailtemplate (extern dashboard) — hoort bij de mail-slag.
4. Legacy-routes (/legacy-aiow, /aiow-v13, /early-access, /founders): Richard.
