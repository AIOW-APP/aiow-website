# AIOW mobile Expo 57 upgradeproof — 2026-07-09

## Upgrade

- Expo 51 → **57.0.4**.
- React Native 0.74 → **0.86.0**.
- React/React DOM → **19.2.3**.
- compileSdk/targetSdk 36, build tools 36.0.0.
- Branded icon en adaptive icon toegevoegd.
- Bundle/package identifiers behouden als `ai.aiow.app`.
- EAS-project behouden als `34a67c3d-9b86-4e74-9b03-33045e95a886`.
- Production-profiel zet `EXPO_PUBLIC_BRAND=aiow`; andere builds blijven zichtbaar `AIOW TEST`.
- Managed Expo-flow geborgd via `.gitignore` en `.easignore`; gegenereerde native folders gaan niet naar EAS.

## Gates

- `npm ci`: PASS.
- `npm run typecheck`: PASS.
- `npx expo-doctor`: **20/20 PASS**.
- `npx expo export --platform web`: PASS.
- `EXPO_PUBLIC_BRAND=aiow npx expo prebuild --platform android --clean --no-install`: PASS.
- `EXPO_PUBLIC_BRAND=aiow ./gradlew assembleRelease --no-daemon`: **BUILD SUCCESSFUL**, 268 taken.

Android releaseartifact:

- grootte: 70,054,527 bytes;
- SHA-256: `b0d5da41f5b18321ac0d64e76c073e1838f74205d610c23530bda0ec143ee1e6`.

## Dependency-audit

De moderate Expo-toolingmeldingen bieden als force-pad een onjuiste downgrade naar Expo 46. Geen force-fix uitgevoerd; SDK alignment wordt bewezen door Expo Doctor 20/20 en de echte Android production releasecompile.
