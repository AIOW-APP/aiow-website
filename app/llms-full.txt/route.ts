import { pillars } from "@/lib/aiow-v1/pillars";
import { SITE_URL } from "@/lib/aiow-v1/seo";

function section(key: keyof typeof pillars) {
  const item = pillars[key];
  return `## ${item.title}\nURL: ${SITE_URL}/${item.slug}\n\n${item.answer}\n\n${item.introduction}\n\nBoundary: ${item.truth}\n\nPricing: ${item.pricing.headline}. ${item.pricing.note}\n\nUse cases:\n${item.useCases.map((entry) => `- ${entry.title}: ${entry.body}`).join("\n")}\n\nFAQ:\n${item.faq.map((entry) => `- Q: ${entry.question}\n  A: ${entry.answer}`).join("\n")}`;
}

const body = `# AIOW — full public service context\n\nAIOW is a Dutch implementation partner for practical AI in companies and buildings. It separates AIOW Solutions delivery from AIOW Ventures product building. No customer, award, address, result or ranking claim should be inferred beyond published proof.\n\n${section("ai-automatisering")}\n\n${section("lokale-ai")}\n\n${section("smart-office")}\n\n${section("home")}\n\n## Commercial boundary\nAll prices are pilot/from indications excluding VAT, hardware, installation, cloud and AI usage. No all-in labour, 24/7 availability, zero-cost-risk or guaranteed-margin claim is made. Definitive delivery requires a written scope and acceptance criteria.\n\nLast updated: 2026-08-27\n`;

export function GET() { return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
