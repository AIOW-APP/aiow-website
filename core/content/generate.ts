/**
 * Content generator — brief → post draft.
 *
 * Pipeline:
 *   1. User provides: topic + format + target platform + desired tone
 *   2. Local LLM (Qwen3-Coder-Next or DeepSeek-R1) drafts copy
 *      (cloud Claude Opus as fallback for high-stakes pieces)
 *   3. Flux/LoRA (via Replicate) generates hero image with brand character
 *   4. Kling generates short video if needed
 *   5. Output: { copy, images[], videos[] } ready for crosspost()
 *
 * This file sketches the TS interface. Actual LLM calls route through
 * ~/debbie/scripts/ollama_route (ssh bigmac) or Replicate API.
 */

export type Platform = "x" | "linkedin" | "instagram" | "tiktok";
export type Tone = "editorial" | "playful" | "technical" | "announcement";

export interface ContentBrief {
  topic: string;                // what is this about
  platform: Platform;           // where it goes
  tone?: Tone;                  // default: editorial
  character?: "handsome" | "debbie" | "none";
  callToAction?: string;        // "Try now" / "Read more" / null
  assetType?: "image" | "video" | "both";
  brand: "debbie" | "aiow" | "h3alth" | "mew" | "handsome";
  // Platform constraints
  maxLength?: number;           // X: 280, LinkedIn: 3000, IG caption: 2200, TikTok: 300
}

export interface ContentDraft {
  copy: string;
  hashtags: string[];
  mediaPrompts: {
    image?: string;             // Replicate Flux prompt with LoRA trigger
    video?: string;             // Kling prompt with motion direction
  };
  notes?: string;
}

const MAX_LENGTH_BY_PLATFORM: Record<Platform, number> = {
  x: 280, linkedin: 3000, instagram: 2200, tiktok: 300,
};

const CHARACTER_TRIGGER: Record<string, string> = {
  handsome: "HANDSOME blue ape in white toga with gold trim, red sash, pearl earring, unbothered king energy",
  debbie: "DEBBIE Latina 28, long dark wavy hair, warm brown eyes, natural makeup, white blouse, confident",
  none: "",
};

/**
 * Build a prompt for local LLM to draft the copy.
 * Returns the prompt string — actual call is done via
 * ssh bigmac ~/debbie/scripts/ollama_route chat "<prompt>"
 */
export function buildCopyPrompt(brief: ContentBrief): string {
  const maxLen = brief.maxLength || MAX_LENGTH_BY_PLATFORM[brief.platform];
  const tone = brief.tone || "editorial";
  const cta = brief.callToAction || "Check it out";

  return `You're a social media copywriter for Team Handsome (brand: ${brief.brand}).

VOICE & TONE:
- Amsterdam origin, English internationally
- ${tone}, confident, dry humor — NEVER corporate hype words
- No "revolutionary", "disruptive", "game-changing"
- Short, rhythmic sentences. No filler.

BRIEF:
Topic: ${brief.topic}
Platform: ${brief.platform}
Max length: ${maxLen} chars
CTA: ${cta}

WRITE:
1. A ${brief.platform} post, max ${maxLen} chars
2. A single-line follow-up CTA
3. 3-5 tags (hashtags without #, comma-separated)

Format exactly as:
POST: <post>
CTA: <cta>
TAGS: <tag1>, <tag2>, ...

No preamble, no explanation. Just the three lines.`;
}

export function parseDraftResponse(raw: string, brief: ContentBrief): ContentDraft {
  const post = raw.match(/POST:\s*(.+?)(?=\n(?:CTA|TAGS):|$)/s)?.[1]?.trim() || "";
  const cta = raw.match(/CTA:\s*(.+?)(?=\nTAGS:|$)/s)?.[1]?.trim() || "";
  const tagsLine = raw.match(/TAGS:\s*(.+?)$/s)?.[1]?.trim() || "";
  const tags = tagsLine.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);

  const character = brief.character || "handsome";
  const characterTrigger = CHARACTER_TRIGGER[character] || "";

  return {
    copy: post + (cta ? `\n\n${cta}` : ""),
    hashtags: tags,
    mediaPrompts: {
      image: brief.assetType !== "video" && characterTrigger
        ? `${characterTrigger}, scene: ${brief.topic}, cinematic lighting, 16:9 aspect, high detail, photorealistic`
        : undefined,
      video: brief.assetType === "video" || brief.assetType === "both"
        ? `${characterTrigger}, scene: ${brief.topic}, cinematic 4-second loop, smooth camera, dramatic mood`
        : undefined,
    },
  };
}
