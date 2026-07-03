# AIOW.ai — B2B SEO/GEO/GAO remaining setup pack

Generated: 2026-06-13

## Verdict

The controllable website layer is live. The remaining high-impact work is not more code first; it is **ownership, entity consistency, citations, proof and measurement**.

No honest operator can guarantee #1 rankings. The route is: own the entity everywhere, feed Google/Bing/AI systems clean structured content, build real trust signals, then monitor and iterate.

---

## 1. Google Search Console — owner-gated, highest priority

### Goal

Google must know `aiow.ai` is owned, crawlable, submitted and monitored.

### Recommended property

Use **Domain property**:

```text
aiow.ai
```

Why: covers `https://aiow.ai`, `https://www.aiow.ai`, future subdomains and protocol variants.

### Richard action

1. Open Google Search Console.
2. Add property → Domain.
3. Enter:

```text
aiow.ai
```

4. Copy the DNS TXT verification record Google gives.
5. Send it to Hermes or add it in the DNS provider.
6. After verification, submit sitemap:

```text
https://aiow.ai/sitemap.xml
```

### What Hermes does after token is available

- Add DNS TXT or guide exact DNS click path.
- Verify GSC ownership.
- Submit sitemap.
- Pull baseline Search Analytics when data exists.
- Inspect representative URLs, not all 325; URL Inspection API is quota-limited and not for bulk spam.

### URLs to inspect first

```text
https://aiow.ai/
https://aiow.ai/nl/kennis
https://aiow.ai/nl/kennis/ai-implementatie-mkb-nederland-voor-bedrijven
https://aiow.ai/nl/ai-installateur-nederland
https://aiow.ai/business.json
https://aiow.ai/llms.txt
```

---

## 2. Google Business Profile — owner-gated, local/entity trust

### Goal

Make AIOW BV a clean, compliant Dutch business entity in Google Search/Maps.

### NAP source of truth

```text
Name: AIOW BV
Website: https://aiow.ai
Address: Bijlmermeerstraat 30, 2131HC Hoofddorp, Netherlands
Contact: WhatsApp / phone route +31 6 21 89 80 39
Language: Dutch + English
Area served: Netherlands
```

### Description draft

```text
AIOW BV is een Nederlandse AI-installateur en implementatiepartner voor bedrijven. We bouwen veilige AI-werklagen rond processen, data, AI-agents, AI-automatisering, private/lokale AI, modelrouting, menselijke approvals en meetbare procesverbetering. We starten met een AI-systeemscan: processen kiezen, datagrens bepalen, quick wins rangschikken en een eerste veilige pilot opzetten.
```

### Services to add

```text
AI-systeemscan
AI-implementatie voor bedrijven
AI-agents voor bedrijven
AI-automatisering
Private AI en lokale AI
AI-governance en modelbeleid
AI-kennisbank / RAG
AI-klantcontact en supportautomatisering
AI-documentautomatisering
AI-integratie met bestaande tools
```

### Photos/proof to add

Do not use stock junk. Use real brand/proof assets:

- AIOW logo / brand visual.
- Founder/team photo if approved.
- Screenshot of AIOW system/worklayer.
- Diagram: scan → pilot → governance → rollout.
- Workspace/office photo if available and compliant.

### Review helper rule

We can create a review-helper page, but no fake reviews, no incentives, no review gating. Ask real customers/partners for honest reviews only.

---

## 3. Bing Webmaster Tools + IndexNow

### Current state

IndexNow is already live and returned:

```text
200 OK urls=325
```

Key file:

```text
https://aiow.ai/2f7b9d6e4a8c41d0b5e3f9a7c6d2e1f0.txt
```

### Owner action

After GSC is verified, Bing Webmaster Tools can import the GSC property. If using direct Bing verification, add `aiow.ai` and submit:

```text
https://aiow.ai/sitemap.xml
```

---

## 4. Entity consistency / external footprint

### Canonical rule

For this B2B AI authority project, the canonical domain is only:

```text
https://aiow.ai
```

### Recommended route

- Treat `aiow.ai` as the only canonical B2B AI-installateur site.
- Use `https://aiow.ai` in schema, `llms.txt`, sitemap, LinkedIn, Google Business Profile, Bing Webmaster, citations and public copy.
- Add the same consistent AIOW BV NAP/description on LinkedIn/TheOrg/directories.
- Do not introduce adjacent/legacy domains into the AIOW.ai B2B authority layer.

### Entity description to reuse everywhere

```text
AIOW BV is een Nederlandse AI-installateur en implementatiepartner voor bedrijven. AIOW bouwt veilige AI-werklagen: AI-implementatie, AI-agents, AI-automatisering, private/lokale AI, AI-governance, modelrouting en menselijke approvals. Startpunt is een AI-systeemscan voor processen, data, risico en eerste meetbare pilot.
```

---

## 5. LinkedIn company presence

### Goal

B2B trust and citation source. LinkedIn matters more than X for AIOW B2B.

### Company tagline

```text
Nederlandse AI-installateur voor bedrijven: AI-implementatie, AI-agents, private AI en veilige automatisering.
```

### About copy

```text
AIOW BV helpt Nederlandse bedrijven AI veilig en praktisch inzetten. We bouwen geen losse prompt-speeltjes, maar een werkende AI-werklaag rond processen, data, rollen, rechten, modelkeuze, logging en menselijke approvals.

Typische trajecten: AI-systeemscan, AI-implementatie, AI-agents, AI-automatisering, private/lokale AI, RAG/kennisbanken, klantcontactautomatisering en documentflows.

Beste route wint: lokale/private AI waar dat waarde of privacyvoordeel geeft; cloudmodellen waar die beter, sneller of veiliger zijn. Altijd met governance en meetbare proceswinst.
```

### First 5 LinkedIn posts

1. Wat is een AI-installateur?
2. Waarom losse AI-tools chaos geven in bedrijven.
3. Private AI vs cloud AI: wanneer kies je wat?
4. AI-agents zijn geen chatbots: rollen, rechten, logs en approvals.
5. AI-systeemscan: de eerste 30 dagen zonder hype.

---

## 6. Citation / directory targets

Priority order:

1. Google Business Profile
2. LinkedIn Company Page
3. Bing Places / Bing Webmaster
4. Apple Business Connect
5. TheOrg profile cleanup if accessible
6. Crunchbase / Wellfound / relevant Dutch startup directories if factual
7. MKB / branche directories where compliant
8. Partner/vendor pages only when real

Do not submit fake office locations, fake clients or fake review snippets.

---

## 7. Measurement setup

### Already live

- Production endpoint checks.
- Sitemap count checks.
- `llms.txt` checks.
- `business.json` checks.
- JSON-LD marker checks.
- Weak Bing visibility probes.
- Daily content growth/deploy/indexation.
- Weekly authority sprint.

### Next after GSC verification

- Daily/weekly Search Analytics snapshot.
- Index coverage sampling.
- Query clusters: AI implementatie, AI agents, private AI, AI automatisering, AI-systeemscan.
- Page cluster performance: `/nl/kennis/*`, `/nl/regio/*`, `/nl/sector/*`, money pages.

---

## 8. Live technical proof currently active

```text
https://aiow.ai/                                                            200
https://aiow.ai/nl/kennis                                                   200
https://aiow.ai/sitemap.xml                                                 200
https://aiow.ai/llms.txt                                                    200
https://aiow.ai/business.json                                               200
https://aiow.ai/2f7b9d6e4a8c41d0b5e3f9a7c6d2e1f0.txt                         200
https://aiow.ai/nl/kennis/ai-implementatie-mkb-nederland-voor-bedrijven      200
```

```text
SITEMAP_COUNT 325
KNOWLEDGE_COUNT 270
BUSINESS knowledgePages 270
IndexNow 200 OK urls=325
```

---

## 9. Operational jobs now active

```text
AIOW daily B2B SEO/GEO knowledge growth
schedule: 35 7 * * *
```

```text
AIOW SEO/GEO health monitor
schedule: 15 */6 * * *
```

```text
AIOW weekly B2B SEO/GEO authority sprint
schedule: 20 8 * * 1
```

---

## 10. Next decision from Richard

Choose one owner-gated route first:

1. Google Search Console verification token.
2. Google Business Profile ownership/setup.
3. LinkedIn company page cleanup/access.
4. AIOW.ai canonical consistency check across public profiles.

Recommended first: **Google Search Console domain property**.
