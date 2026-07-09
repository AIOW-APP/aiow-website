# AIOW auditverbeteringen — releaseproof 2026-07-09

## Web

Doorgevoerd:

- securityheaders en productie-CSP via `next.config.ts`;
- `poweredByHeader` uit;
- dependency-updates naar Next 15.5.18, Supabase JS 2.50.0 en PostCSS 8.5.10;
- mobiele civic header met bruikbare 44px merk/login-targets;
- intake- en venture-copy gecorrigeerd naar een eerlijk **eerste oordeel binnen 48 uur**;
- proof- en kenniscontent consistent gemaakt;
- mobile/Expo-project uitgesloten van de root ESLint-scope.

Verificatie:

- `npm ci`: PASS.
- `npm run lint`: PASS.
- `NODE_ENV=production npm run build`: PASS, **931/931** statische routes.
- `npm audit --omit=dev`: **0 vulnerabilities**.
- Production server browser-QA op 390px en 1440px:
  - `/`, `/en`, `/intake`, `/nl/venture-score-aanvragen`, `/apps/onetap-day`, `/portal`;
  - 12/12 HTTP 200;
  - nul overflow;
  - nul console/pageerrors;
  - nul broken images.
- CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, COOP, Permissions-Policy en HSTS aanwezig op de production server.

## Buildinvariant

De host-shell had `NODE_ENV=development` geëxporteerd. `next build` moet in deze omgeving daarom expliciet als `NODE_ENV=production npm run build` worden uitgevoerd. De production-env build is volledig groen; de eerdere gemengde React serverrender was geen productcodefout.

## Routecanon

`/onetap-day` redirect bewust met HTTP 308 naar `https://handsome.bot/apps/onetap-day`. De canonieke interne route `/apps/onetap-day` is in browser-QA groen.
