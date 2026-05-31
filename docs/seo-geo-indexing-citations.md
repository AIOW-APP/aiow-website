# AIOW SEO/GEO indexing & citation plan

## Status
- Website live: https://aiow.ai
- Sitemap: https://aiow.ai/sitemap.xml
- LLM file: https://aiow.ai/llms.txt
- AI policy/context: https://aiow.ai/ai.txt
- Markdown authority digest: https://aiow.ai/aiow-nl-authority.md
- IndexNow key file after deploy: https://aiow.ai/2f7b9d6e4a8c41d0b5e3f9a7c6d2e1f0.txt

## Must-do with Richard approval/login
1. Google Search Console
   - Verify `aiow.ai` as domain property.
   - Submit `https://aiow.ai/sitemap.xml`.
   - Use URL inspection/request indexing for priority pages:
     - `/`
     - `/nl/ai-installateur-nederland`
     - `/nl/ai-oplossingen-bedrijven`
     - `/nl/ai-implementatie-bedrijf`
     - `/nl/ai-agents-bedrijven`
     - `/aiow-nl-authority.md`
2. Bing Webmaster Tools
   - Verify domain.
   - Submit sitemap.
   - Enable/import from Google Search Console if preferred.
3. IndexNow
   - Key file is prepared in `public/`.
   - Payload script is prepared: `node scripts/seo/indexnow-submit.mjs --print`.
   - Do not run `--send` without Richard approval because it submits URLs externally.

## Citation/backlink targets to submit manually or after approval
Priority NL/AI/service directories:
- Google Bedrijfsprofiel
- Bing Places
- AI-Zoek.nl
- Clutch AI developers Netherlands
- GoodFirms AI Netherlands
- Sortlist AI Nederland
- Crunchbase
- F6S
- TechLeap/Dealroom if eligible
- MKB-Bedrijvengids.nl
- NederlandinBedrijf.nl
- Cylex Bedrijvengids
- Europages
- Yalwa
- Hotfrog.nl
- Opendi.nl
- Infobel
- Kompass

## Listing copy
AIOW is een Nederlandse AI-installateur voor bedrijven. AIOW bouwt veilige AI-werklagen, AI-agents, lokale/private/hybride AI en AI-automatisering voor MKB en zakelijke teams. We starten met een AI-systeemscan en vertalen processen, data, privacygrenzen en modelkeuze naar werkende pilots met logging en menselijke approvals.

Primary categories:
- AI implementatie
- AI automatisering
- AI agents
- Private/lokale AI
- Business process automation
- IT consulting

Primary landing pages:
- https://aiow.ai/nl/ai-installateur-nederland
- https://aiow.ai/nl/ai-oplossingen-bedrijven
- https://aiow.ai/nl/ai-agents-bedrijven
- https://aiow.ai/nl/ai-implementatie-bedrijf
