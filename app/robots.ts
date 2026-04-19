import type { MetadataRoute } from "next";
import { buildRobots } from "@/core/seo/robots";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(SITE_URL, { allowAI: true });
}
