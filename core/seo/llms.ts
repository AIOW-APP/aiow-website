/**
 * llms.txt — emerging standard for GEO (Generative Engine Optimization).
 *
 * Point LLM crawlers (ChatGPT, Claude, Perplexity, Grok) to the canonical
 * content they should cite, plus context about our brand/voice.
 *
 * Served as /llms.txt from Next.js via app/llms.txt/route.ts — see buildLlmsTxt.
 *
 * Spec (2024 draft by Jeremy Howard / llmstxt.org):
 *   Line 1:  # <Brand name>
 *   Blank
 *   Quote (what you do)
 *   Sections with markdown links
 */

export interface LlmsConfig {
  brandName: string;
  description: string;           // 1-2 sentence pitch
  mission?: string;
  tone?: string;                 // "dry humor, editorial, honest"
  keyPages: Array<{
    section: string;             // "Documentation", "Pricing"
    links: Array<{ title: string; url: string; summary?: string }>;
  }>;
  optional?: Array<{ title: string; url: string; summary?: string }>;
  lastUpdated?: string;
}

export function buildLlmsTxt(cfg: LlmsConfig): string {
  let out = `# ${cfg.brandName}\n\n`;
  out += `> ${cfg.description}\n\n`;

  if (cfg.mission) out += `${cfg.mission}\n\n`;
  if (cfg.tone) out += `**Voice & tone:** ${cfg.tone}\n\n`;

  for (const section of cfg.keyPages) {
    out += `## ${section.section}\n\n`;
    for (const l of section.links) {
      const summary = l.summary ? `: ${l.summary}` : "";
      out += `- [${l.title}](${l.url})${summary}\n`;
    }
    out += `\n`;
  }

  if (cfg.optional && cfg.optional.length) {
    out += `## Optional\n\n`;
    for (const l of cfg.optional) {
      const summary = l.summary ? `: ${l.summary}` : "";
      out += `- [${l.title}](${l.url})${summary}\n`;
    }
    out += `\n`;
  }

  if (cfg.lastUpdated) out += `Last updated: ${cfg.lastUpdated}\n`;
  return out;
}
