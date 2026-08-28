import { pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import { SITE_URL } from "@/lib/aiow-v1/seo";

const contextLinks = pricingContexts.map((context) => `- [${context.labelNl}](${SITE_URL}/tarieven/${context.slug}): concrete automations, package advice and worked calculation`).join("\n");

const body = `# AIOW

> AI voor bedrijfsprocessen, gebouwen en woningen — ontworpen en beheerd door één partij. AIOW publiceert transparante indicaties, minima en uitsluitingen; de definitieve scope volgt na een scan.

## Canonical pages
- [Home](${SITE_URL}/): proposition, calculator and booking intake
- [Volledige tarieven](${SITE_URL}/tarieven): v3.2 packages, hard minima, Standard/Comfort, change work, advice and Smart Design
- [AI-automatisering](${SITE_URL}/ai-automatisering): controlled workflow automation
- [Lokale AI](${SITE_URL}/lokale-ai): local, private and hybrid AI architectures
- [Smart Office](${SITE_URL}/smart-office): software and AI around building signals
- [AIOW Home](${SITE_URL}/home): partner-dependent residential intelligence
- [English](${SITE_URL}/en): English overview

## Pricing contexts
${contextLinks}

## Pricing boundary
Published amounts are non-binding indications/from-prices excluding VAT, hardware, physical installation, cloud, AI and supplier usage. Standard is the default: customers contract and pay third parties directly. Comfort requires automatic direct debit. Subscriptions use actual provider cost +25%; provider price increases are passed through 1-to-1 plus that 25% margin. Hardware uses cost +15% and requires full prepayment or a deposit at least equal to the hardware value before ordering. AIOW never provides interest-free financing. Unknown third-party costs are never presented as a fixed total. Smart Design credits 50% of the Scan when continuing to Blueprint; projects above 10 homes use a quoted project scale, never below the published minima. Definitive scope and price follow after a scan.

## Contact
Use the booking intake on ${SITE_URL}/. A booking succeeds only after durable upstream acceptance.

Last updated: 2026-08-28
`;

export function GET() { return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
