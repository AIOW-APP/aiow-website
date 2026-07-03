# AIOW deployment board

## Production branch

`release/2026-07-03`

## One allowed deploy method

Deploy production only from this local branch using Vercel CLI from this directory:

```bash
git status --short --branch
npm run build
vercel deploy --prod --yes --force
```

Do not mix git-connected auto deploys with ad-hoc deploys from another checkout.

## Root wiring

- `next.config.ts` uses `beforeFiles` rewrite for `/` -> `/home-v3.html`.
- Keep `/intake`, `/portal`, `/llms.txt`, and `/nl/kennis/*` as existing Next routes.

## Required live proof

- `https://aiow.ai/` contains `Wij zeggen vaker`.
- `https://aiow.ai/intake` returns HTTP 200.
- `https://aiow.ai/llms.txt` contains venture content.
