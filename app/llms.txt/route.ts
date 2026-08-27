import { SITE_URL } from "@/lib/aiow-v1/seo";

const body = `# AIOW

> Nederlandse AI-implementatiepartner voor bedrijven en gebouwen. AIOW inventariseert, bouwt en beheert praktische AI-systemen met expliciete menselijke controle en transparante prijsindicaties.

## Canonical pages
- [Home](${SITE_URL}/): proposition, calculator and booking intake
- [AI-automatisering](${SITE_URL}/ai-automatisering): controlled workflow automation
- [Lokale AI](${SITE_URL}/lokale-ai): local, private and hybrid AI architectures
- [Smart Office](${SITE_URL}/smart-office): software and AI around building signals
- [AIOW Home](${SITE_URL}/home): partner-dependent residential intelligence
- [English](${SITE_URL}/en): English overview

## Pricing boundary
Published amounts are non-binding starting indications. Hardware, physical installation, cloud and AI usage are excluded. Definitive scope, service credits, responsibilities and price follow after a scan.

## Contact
Use the booking intake on ${SITE_URL}/. A booking succeeds only after durable upstream acceptance.

Last updated: 2026-08-27
`;

export function GET() { return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
