# AIOW Website — Status

Updated: 2026-05-28
Owner: Handsome / Hermes
Richard needed: no for local organization; yes for public deploy/content changes if they materially affect public surfaces.

## Status

- Capsule: installed.
- Existing Team OS v2: installed under `ops/`.
- Git: repo exists with remote `Squirrel-Richard/aiow-website`.
- Working tree: dirty / many local modifications and untracked files; **classified non-destructively**.
- Safety branch: `chore/aiow-cleanup-snapshot-20260528`.

## Proof / evidence

- Ops status: `ops/status/TEAM-OPERATING-SYSTEM-V2.md`
- Evidence folder: `ops/evidence/`
- Dirty repo classification: `docs/recovery/dirty-repo-classification-2026-05-28.md`
- Public asset manifest: `docs/recovery/public-asset-manifest-2026-05-28.md`
- Build proof: `npm run build` PASS, 118 pages generated.
- Lint proof: `npm run lint` PASS.

## Next steps

1. Split cleanup into separate commits: capsule, config/build, product routes, assets.
2. Decide `.quarantine/` policy before staging.
3. Run screenshot/contact-sheet QA before any `PRODUCT_ART_PASS`.
4. Keep project capsule updated when deploy/proof changes.
