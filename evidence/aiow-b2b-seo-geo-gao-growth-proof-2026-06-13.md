# AIOW.ai B2B SEO/GEO/GAO Growth Proof

Generated: 2026-06-13

## Team Richard rule #1

Best route for the result. Best backup ready. Remove processes without proven value.

## Goal

Make AIOW.ai the strongest controllable B2B AI authority site in the Netherlands for AI implementation, AI agents, AI automation, private/local AI, governance and AI-system scans.

Important: no honest operator can guarantee Google/AI answer #1 rankings. What is controllable has been executed: crawlable authority pages, sitemap, llms.txt, business.json, structured data, production deploy, IndexNow and daily growth automation.

## What shipped

Production domain:

```text
https://aiow.ai
```

New crawlable hub:

```text
https://aiow.ai/nl/kennis
```

New knowledge pages:

```text
270 B2B AI knowledge pages
```

Examples:

```text
https://aiow.ai/nl/kennis/ai-implementatie-mkb-nederland-voor-bedrijven
https://aiow.ai/nl/kennis/ai-implementatie-logistiek-amsterdam-implementatieplan
```

New/updated entity endpoints:

```text
https://aiow.ai/business.json
https://aiow.ai/llms.txt
https://aiow.ai/sitemap.xml
```

## Live proof

```text
https://aiow.ai/                                                            200
https://aiow.ai/nl/kennis                                                   200
https://aiow.ai/sitemap.xml                                                 200
https://aiow.ai/llms.txt                                                    200
https://aiow.ai/business.json                                               200
https://aiow.ai/2f7b9d6e4a8c41d0b5e3f9a7c6d2e1f0.txt                         200
https://aiow.ai/nl/kennis/ai-implementatie-mkb-nederland-voor-bedrijven      200
```

Sitemap:

```text
SITEMAP_COUNT 325
KNOWLEDGE_COUNT 270
HAS_HUB true
```

Business JSON:

```text
knowledgePages: 270
primaryMarket: Nederlandse bedrijven en MKB-teams
```

IndexNow:

```text
200 OK urls=325
```

Browser QA:

```json
{
  "hubTitle": "AI kennisbank voor B2B Nederland — AIOW · AIOW",
  "hubKnowledgeLinksVisible": 36,
  "hubOverflow": false,
  "articleTitle": "AI-implementatie voor MKB in Nederland: voor bedrijven — AIOW · AIOW",
  "articleFaqCount": 3,
  "articleJsonLdCount": 6,
  "articleHasCTA": true,
  "articleOverflow": false
}
```

## Automation

New cron:

```text
AIOW daily B2B SEO/GEO knowledge growth
job_id: af2acb68c0ab
schedule: 35 7 * * *
next_run_at: 2026-06-14T07:35:00+02:00
```

Script:

```text
/Users/handsomebastard/.hermes/scripts/aiow_daily_b2b_knowledge_growth.sh
```

Daily behavior:

1. Add 5 controlled B2B AI pages.
2. Rebuild Next.js.
3. Deploy production to Vercel project `aiow-main-site`.
4. Submit full sitemap to IndexNow.
5. Live-check `/`, `/nl/kennis`, `/sitemap.xml`, `/llms.txt`, `/business.json`.
6. Report output to Richard.

Growth source script:

```text
/Users/handsomebastard/projects/aiow-website/scripts/seo/aiow_knowledge_growth.py
```

Guardrails:

- no fake #1 guarantee;
- no fake customer cases;
- no fake prices;
- no hype claims like revolutionary/game-changing;
- best route rule: local/private AI where it proves value, cloud where that is better, governance always.

## Files changed/added

```text
lib/aiow-knowledge-pages.ts
app/nl/kennis/page.tsx
app/nl/kennis/[slug]/page.tsx
app/nl/kennis/styles.module.css
app/business.json/route.ts
app/sitemap.ts
app/llms.txt/route.ts
scripts/seo/aiow_knowledge_growth.py
scripts/seo/indexnow-submit.mjs
~/.hermes/scripts/aiow_daily_b2b_knowledge_growth.sh
```

## External gates still not claimable from code

- Google Search Console owner-side inspection/submission.
- Google Business Profile/Maps ownership, services, photos, posts and review flow.
- Real third-party backlinks/citations/directories.
- Real case studies and client proof.

## Verdict

PASS.

AIOW.ai now has a live, production-deployed B2B AI authority layer with 270 crawlable knowledge pages, sitemap + llms.txt + business.json, IndexNow submission, and daily automatic growth/deploy/indexation.
