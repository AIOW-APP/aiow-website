# AIOW Website Dirty Repo Classification

Date: 2026-05-28 10:20:31 
Owner: Handsome / Hermes
Scope: `/Users/handsomebastard/projects/aiow-website`
Mode: **non-destructive classification only** — no reset, delete, or commit performed.

## Verdict

AIOW is dirty but **not broken**.

- Git status: **105 changed/untracked entries**
- Tracked diff: **56 files changed, 472 insertions, 1447 deletions**
- Production build: **PASS** via `npm run build` on Next.js 15.5.15, 118 pages generated
- Secret scan: **no real credentials found** in scanned text files; only placeholders/templates and one existing dev fallback `dev-secret`
- Main risk: the repo mixes real product changes, new local-first capsule files, public assets, evidence artifacts, quarantine archives, and generated/supporting files in one dirty tree.

## Classification

### A. Commit candidates — likely product/source changes
Keep and review as normal code changes.

- `app/` — route/API/content/site changes, including `/en`, `/nl`, portal, scan APIs, AI text routes
- `components/` — AIOW component updates + v13 additions
- `core/` — analytics, content, email, legal copy
- `next.config.ts` — removes problematic `experimental.optimizePackageImports` with documented reason
- `package.json` / `package-lock.json` — dependency/script changes
- `middleware.ts`, `eslint.config.mjs`, `supabase/`, `scripts/`

### B. Project Capsule / local-first ops files — keep, but commit separately
These are process/continuity files created for local recovery and team handoff.

- `README.md`
- `STATUS.md`
- `OWNER.md`
- `docs/`
- `ops/`
- `.env.example`

### C. Quarantine/archive — keep locally, do not blindly commit
These explain deleted assets/components and preserve recovery material.

- `.quarantine/removed-oryzo-public-20260507-075512/`
- `.quarantine/aiow-spunky-removed-20260505/`
- `.quarantine/TASK-AIOW-007-spunky-20260505-074844/`

Recommendation: keep locally for recovery, but decide whether to add to `.gitignore` or move to TeamVault/archive before commit.

### D. Public assets — require visual/size review before commit
Large visual/media additions and deletions are present.

- Deleted tracked Spunky assets under `public/spunky/`
- New `public/aiow/`, `public/images/`, `public/models/`, `public/splats/`, `public/textures/`, `public/_astro/`, PDFs, fonts, WASM files

Risk: committing all public assets may bloat repo; not committing necessary assets may break visual pages. Needs asset manifest + screenshot QA.

### E. Evidence artifacts — keep as proof, usually not app source
- `evidence/` contains Lighthouse JSON + screenshots from May 8/11.

Recommendation: commit only if repo convention includes evidence; otherwise mirror to TeamVault and ignore future bulky evidence.

## Status counts

```json
{
  "M ": 1,
  " M": 32,
  " D": 23,
  "??": 49
}
```

## Top-level dirty groups

```json
{
  ".env.example": {
    "??": 1
  },
  ".quarantine": {
    "??": 1
  },
  "OWNER.md": {
    "??": 1
  },
  "README.md": {
    "??": 1
  },
  "STATUS.md": {
    "??": 1
  },
  "app": {
    " M": 12,
    "??": 12
  },
  "components": {
    " M": 10,
    " D": 7,
    "??": 2
  },
  "content": {
    "??": 1
  },
  "core": {
    " M": 8
  },
  "docs": {
    "??": 1
  },
  "eslint.config.mjs": {
    "??": 1
  },
  "evidence": {
    "??": 1
  },
  "gitignore": {
    "M ": 1
  },
  "middleware.ts": {
    "??": 1
  },
  "next.config.ts": {
    " M": 1
  },
  "ops": {
    "??": 1
  },
  "package-lock.json": {
    "??": 1
  },
  "package.json": {
    " M": 1
  },
  "public": {
    " D": 16,
    "??": 21
  },
  "scripts": {
    "??": 1
  },
  "supabase": {
    "??": 1
  }
}
```

## Directory size snapshot

```text
.quarantine	28	7552178
public	410	698486640
evidence	12	3896528
content	3	2538
docs	11	39894
ops	25	76428
app	86	217805
components	51	608136
supabase	1	1587
scripts	44	212920
```

## Build proof

Command:

```bash
npm run build
```

Result:

```text
PASS — compiled successfully, generated 118 static pages, middleware built.
```

## Security scan proof

Pattern scan checked for obvious committed secrets such as OpenAI keys, Google API keys, GitHub tokens, Slack tokens, private-key blocks, Supabase service-role assignments, and explicit secret assignments.

Result:

- `.env.example`: placeholders only
- `ops/*`: template placeholders only
- `lib/scan/store.ts`: `SCAN_SESSION_SECRET || "dev-secret"` fallback flagged for follow-up, but not a real leaked credential

## Recommended next actions

1. **Create safety snapshot branch** before staging:
   - `git switch -c chore/aiow-cleanup-snapshot-20260528`
2. **Commit capsule separately**:
   - `README.md`, `STATUS.md`, `OWNER.md`, `docs/`, `ops/`, `.env.example`
3. **Commit build/config separately**:
   - `.gitignore`, `next.config.ts`, `package.json`, `package-lock.json`, `eslint.config.mjs`, `middleware.ts`
4. **Review product/app changes by route group**:
   - homepage, `/en`, `/nl`, portal, scan APIs, v13/mobile pages
5. **Create asset manifest before public asset commit**:
   - list required vs archive vs generated assets
6. **Do not commit `.quarantine/` until policy decision**:
   - either local-only recovery archive or TeamVault archive, not mixed into source by accident
7. **Run visual QA/contact sheet before PRODUCT_ART_PASS**:
   - especially for `public/aiow/*`, models, splats, textures, videos, and homepage pages

## Safe state

No destructive operation was executed. Repo remains dirty exactly for human/agent review, but now has a classified cleanup map.
