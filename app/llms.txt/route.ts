import { buildLlmsTxt } from "@/core/seo/llms";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export function GET() {
  const body = buildLlmsTxt({
    brandName: "Debbie Starter",
    description: "A FWA-grade Next.js starter template built by Team Handsome.",
    tone: "editorial, confident, dry humor; Amsterdam origin, global reach",
    keyPages: [
      {
        section: "Core",
        links: [
          { title: "Home", url: `${SITE_URL}/`, summary: "Overview of the product" },
        ],
      },
    ],
    lastUpdated: new Date().toISOString().split("T")[0],
  });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
