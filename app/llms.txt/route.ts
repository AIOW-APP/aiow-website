import { pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import { SITE_URL } from "@/lib/aiow-v1/seo";

const contextLinks = pricingContexts.map((context) => `- [${context.labelNl}](${SITE_URL}/tarieven/${context.slug}): concrete automations, package advice and worked calculation`).join("\n");

const body = `# AIOW

> AIOW ontwerpt, bouwt, koppelt en beheert AI-systemen voor exact drie categorieën: Werk, Bedrijfspanden en Woningen & villa’s. De mens bepaalt de bevoegdheid; hardware, fysieke installatie en partnerwerk worden apart gescoped.

## Canonical pages
- [Home](${SITE_URL}/): three-category proposition — Werk, Bedrijfspanden and Woningen & villa’s — plus bounded scan and pricing routes
- [Volledige tarieven](${SITE_URL}/tarieven): v3.2 packages, hard minima, Standard/Comfort, change work, advice and Smart Design
- [AI-automatisering](${SITE_URL}/ai-automatisering): controlled workflow automation
- [Lokale AI](${SITE_URL}/lokale-ai): local, private and hybrid AI architectures
- [Smart Office](${SITE_URL}/smart-office): software and AI around building signals
- [AIOW Home](${SITE_URL}/home): partner-dependent residential intelligence
- [AI-mogelijkheden](${SITE_URL}/mogelijkheden): synthetic reference workflows showing signal, AI interpretation, bounded system action and human authority
- [AI capabilities](${SITE_URL}/en/capabilities): English paired capabilities experience with the same evidence boundaries
- [Praktische AI-scan aanvragen](${SITE_URL}/scan): direct preferred scan-request flow pending separate human confirmation
- [Request a practical AI scan](${SITE_URL}/en/scan): English paired request flow pending separate human confirmation
- [English](${SITE_URL}/en): English overview
- [AIOW kennis](${SITE_URL}/nl/kennis): current, evidence-led Dutch knowledge index
- [Venture-score uitgelegd](${SITE_URL}/nl/kennis/startup-idee-laten-beoordelen-venture-score): seven dimensions, counter-evidence and a human decision gate
- [AIOW knowledge](${SITE_URL}/en/knowledge): current English knowledge index
- [Venture score explained](${SITE_URL}/en/knowledge/startup-idea-venture-score): evidence, risk and human authority boundaries
- [Bedrijfsgegevens en contact](${SITE_URL}/bedrijfsgegevens): AIOW B.V., KvK 71887466, info@aiow.io and Netherlands service area
- [Company and contact](${SITE_URL}/en/company): verified English company details and contact route

## Pricing contexts
${contextLinks}

## Pricing boundary
Published amounts are non-binding indications/from-prices excluding VAT, hardware, physical installation, cloud, AI and supplier usage. Standard is the default: customers contract and pay third parties directly. Comfort requires automatic direct debit. Subscriptions use actual provider cost +25%; provider price increases are passed through 1-to-1 plus that 25% margin. Hardware uses cost +15% and requires full prepayment or a deposit at least equal to the hardware value before ordering. AIOW never provides interest-free financing. Unknown third-party costs are never presented as a fixed total. Smart Design credits 50% of the Scan when continuing to Blueprint; projects above 10 homes use a quoted project scale, never below the published minima. Definitive scope and price follow after a scan.

## Quote indication
The calculator configuration is validated and all quote amounts are recomputed on the server; browser-supplied totals are not trusted. The PDF is released only after the configured durable adapter has accepted the lead and then durably accepted the lead, PDF and exactly two transactional mail outbox jobs (customer and internal). Without the adapter, or if either phase fails, no PDF or receipt is returned. Durable outbox acceptance does not claim the messages have already been sent; delivery happens only when the outbox is processed.

## Contact
AIOW B.V. · KvK 71887466 · info@aiow.io · service area: Netherlands. Final scope, exclusions and conditions are supplied with the written proposal. Use the preferred booking intake on ${SITE_URL}/; a durable receipt is not provider calendar confirmation and human confirmation follows separately. Public intake data is retained for no more than 90 days unless an active customer relationship or legal obligation requires longer retention.

Last updated: 2026-09-01
`;

export function GET() { return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
