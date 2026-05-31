import type { MetadataRoute } from "next";
import { buildRobots } from "@/core/seo/robots";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aiow.ai";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(SITE_URL, {
    allowAI: true,
    // Keep APIs and QA artifacts out of public crawling during public launch.
    disallow: ["/api/", "/tmp/", "/__qa/", "/projects", "/projects.json", "/onetap-day"],
  });
}
