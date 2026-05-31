/**
 * Late.dev — auto cross-post naar X, LinkedIn, Instagram, TikTok
 *
 * Requires env:
 *   LATE_API_KEY          — from VAULT → Late.dev
 *   LATE_ACCOUNT_X        — account id for X
 *   LATE_ACCOUNT_LINKEDIN — etc.
 *   LATE_ACCOUNT_IG       — etc.
 *   LATE_ACCOUNT_TIKTOK   — etc.
 *
 * Brand rules (from core/brand/language.md):
 *   - English only
 *   - Video preferred (Kling/Runway-generated)
 *   - No Spunky/ape/mascot in AIOW flagship brand materials unless explicitly approved
 *   - Short, no "revolutionary" hype-words
 */

const LATE_API = "https://api.late.dev/v1";

export interface PostRequest {
  text: string;
  media?: string[];              // URLs to images/videos (already uploaded)
  platforms: ("x" | "linkedin" | "instagram" | "tiktok")[];
  scheduleAt?: string;           // ISO-8601 UTC; omit for "post now"
}

export interface PostResult {
  platform: string;
  id?: string;
  url?: string;
  status: "scheduled" | "posted" | "failed";
  error?: string;
}

const ACCOUNT_ENV = {
  x: "LATE_ACCOUNT_X",
  linkedin: "LATE_ACCOUNT_LINKEDIN",
  instagram: "LATE_ACCOUNT_IG",
  tiktok: "LATE_ACCOUNT_TIKTOK",
} as const;

export async function crosspost(req: PostRequest): Promise<PostResult[]> {
  const apiKey = process.env.LATE_API_KEY;
  if (!apiKey) throw new Error("LATE_API_KEY not set");

  const results: PostResult[] = [];

  for (const platform of req.platforms) {
    const accountId = process.env[ACCOUNT_ENV[platform]];
    if (!accountId) {
      results.push({ platform, status: "failed", error: `No ${ACCOUNT_ENV[platform]} env` });
      continue;
    }

    try {
      const resp = await fetch(`${LATE_API}/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          platform,
          text: req.text,
          mediaUrls: req.media || [],
          scheduledAt: req.scheduleAt,
        }),
      });
      if (!resp.ok) {
        results.push({ platform, status: "failed", error: `${resp.status}: ${await resp.text()}` });
        continue;
      }
      const data = await resp.json();
      results.push({
        platform,
        id: data.id,
        url: data.url,
        status: req.scheduleAt ? "scheduled" : "posted",
      });
    } catch (e) {
      results.push({ platform, status: "failed", error: (e as Error).message });
    }
  }

  return results;
}
