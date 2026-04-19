// POST /api/scan/run — run the AI scan with Ollama, stream analysis back.
// Auth: requires valid session from /verify.
import { verifySession, saveLead } from "@/lib/scan/store";
import { ollamaStream, ollamaGenerate } from "@/lib/scan/ollama";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min budget on Vercel Pro

type Body = {
  session: string;
  name: string;
  company: string;
  sector: string;
  teamSize: string;
  aiUsage: string[];
  timeLosers: string[];
  website: string;
  socials: string;
  pain: string;
  goals: string;
  modules: string[]; // selected ids
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const sess = await verifySession(body.session || "");
    if (!sess) return new Response("unauthorized", { status: 401 });

    // Save lead
    saveLead({
      email: sess.email,
      name: body.name,
      company: body.company,
      sector: body.sector,
    });

    // Build context for LLM
    const context = `
Bedrijf: ${body.company}
Sector: ${body.sector}
Teamgrootte: ${body.teamSize}
Huidig AI-gebruik: ${body.aiUsage.join(", ") || "geen"}
Grootste tijd-verliezers: ${body.timeLosers.join(", ") || "niet aangegeven"}
Website: ${body.website || "niet gedeeld"}
Social media: ${body.socials || "niet gedeeld"}
Specifieke pijn: ${body.pain || "niet genoemd"}
Ambities 12 maanden: ${body.goals || "niet genoemd"}
`;

    const system = `Je bent een senior AI-consultant bij AIOW BV. Je schrijft scherpe, praktische rapporten voor Nederlandse MKB-bedrijven over waar AI hun grootste impact kan maken. Je bent direct, concreet, en geeft altijd specifieke voorbeelden met ROI-indicatie. Geen bullshit, geen hype. Schrijf in het Nederlands. Gebruik markdown met headers (##), bullets, en korte alinea's.`;

    const modulesText = body.modules
      .map((m) => {
        if (m === "workflow") return "**Werkprocessen**: Welke 3-5 workflows in dit bedrijf zijn de laaghangend fruit voor AI-automatisering? Per workflow: welke AI-tool/aanpak, tijdsbesparing, implementatie-complexiteit (laag/middel/hoog), geschatte ROI.";
        if (m === "geo") return "**Vindbaarheid (GEO)**: Hoe positioneert ${body.company} zich voor AI-zoekmachines (ChatGPT, Claude, Perplexity, Gemini)? 3 concrete stappen om binnen 60 dagen genoemd te worden in AI-antwoorden voor hun sector.";
        if (m === "social") return "**Social Media AI**: Welke content-strategie + AI-tools voor hun sector? 3 platform-specifieke quick wins. Wat voor content moet ${body.company} posten en hoe AI die kan maken.";
        if (m === "documents") return "**Documenten & Data**: Welke document-flows in een ${body.sector}-bedrijf zijn goudmijnen voor AI? OCR, samenvatting, search, RAG — 3 concrete toepassingen met tool-namen.";
        return "";
      })
      .join("\n");

    const prompt = `Bedrijfscontext:
${context}

Genereer een gestructureerd AI-scan rapport met:

## Samenvatting
2-3 zinnen wat we zien en waar de grootste kans zit.

## Prioriteiten
Top 3 AI-kansen voor dit bedrijf, geordend op impact × haalbaarheid. Per kans:
- Korte titel
- Wat het oplevert (kwantitatief, bv. "8-12 uur/week besparing")
- Benodigde tools/stack
- Implementatie-tijd

## Analyse per module
${modulesText}

## Volgende stap
Concreet advies: direct starten met X, plan 2-uur call voor Y, vermijd Z.

Totale lengte: ±600-900 woorden. Gebruik markdown. Wees scherp en specifiek.`;

    // Use qwen3:30b-a3b for speed (235b is too slow for Vercel timeout on first-gen hit)
    const stream = await ollamaStream("qwen3:30b-a3b", prompt, {
      system,
      temperature: 0.5,
      num_predict: 1800,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: any) {
    return new Response(`error: ${e.message || "Internal"}`, { status: 500 });
  }
}
