/**
 * Debbie Core SEO — metadata generator for Next.js App Router.
 *
 * Usage (per page.tsx or layout.tsx):
 *   import { buildMetadata } from "@/core/seo/metadata";
 *   export const metadata = buildMetadata({
 *     title: "Portfolio dashboard",
 *     description: "One unified view across 12 chains.",
 *     path: "/portfolio",
 *     brand: "aiow",
 *   });
 */
import type { Metadata } from "next";

type Brand = "debbie" | "aiow" | "h3alth" | "mew" | "handsome";

export interface SEOConfig {
  title: string;                    // 50-60 chars ideal
  description: string;              // 140-160 chars ideal
  path?: string;                    // "/about" - relative to site root
  brand?: Brand;
  siteName?: string;
  siteUrl?: string;
  image?: string;                   // absolute URL to OG image
  type?: "website" | "article";
  locale?: string;                  // "en_US", "nl_NL"
  publishedAt?: string;             // ISO-8601 for articles
  updatedAt?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;                // admin/staging pages
}

const BRAND_DEFAULTS: Record<Brand, { siteName: string; siteUrl: string; twitter: string }> = {
  debbie:   { siteName: "Debbie",        siteUrl: "https://debbie.bot",        twitter: "@dikkedebbie_bot" },
  aiow:     { siteName: "AIOW",          siteUrl: "https://aiow.ai",           twitter: "@aiow_official" },
  h3alth:   { siteName: "H3ALTH",        siteUrl: "https://h3alth.club",       twitter: "@h3alth_app" },
  mew:      { siteName: "MEW",           siteUrl: "https://mew.xyz",           twitter: "@mew_coin" },
  handsome: { siteName: "HandsomeBastard", siteUrl: "https://handsome.bot",    twitter: "@handsomebstrd" },
};

export function buildMetadata(cfg: SEOConfig): Metadata {
  const brand = cfg.brand || "debbie";
  const defaults = BRAND_DEFAULTS[brand];
  const siteUrl = cfg.siteUrl || defaults.siteUrl;
  const siteName = cfg.siteName || defaults.siteName;
  const path = cfg.path || "/";
  const url = `${siteUrl}${path}`;
  const fullTitle = path === "/" ? `${cfg.title} — ${siteName}` : `${cfg.title} | ${siteName}`;
  const image = cfg.image || `${siteUrl}/opengraph-image`;

  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description: cfg.description,
    keywords: cfg.keywords,
    authors: cfg.author ? [{ name: cfg.author }] : undefined,
    robots: cfg.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: cfg.title,
      description: cfg.description,
      url,
      siteName,
      locale: cfg.locale || "en_US",
      type: cfg.type || "website",
      publishedTime: cfg.publishedAt,
      modifiedTime: cfg.updatedAt,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: cfg.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: cfg.title,
      description: cfg.description,
      site: defaults.twitter,
      creator: defaults.twitter,
      images: [image],
    },

    other: {
      "theme-color": "#0A0A0B",
    },
  };
}

// JSON-LD helper — inject via <Script> tag
export function orgJsonLd(brand: Brand = "debbie") {
  const d = BRAND_DEFAULTS[brand];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: d.siteName,
    url: d.siteUrl,
    sameAs: [
      `https://twitter.com/${d.twitter.replace("@", "")}`,
    ],
  };
}

export function articleJsonLd(p: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  brand?: Brand;
}) {
  const d = BRAND_DEFAULTS[p.brand || "debbie"];
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    image: [p.image],
    datePublished: p.publishedAt,
    dateModified: p.updatedAt || p.publishedAt,
    author: { "@type": "Person", name: p.author },
    publisher: {
      "@type": "Organization",
      name: d.siteName,
      logo: { "@type": "ImageObject", url: `${d.siteUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": p.url },
  };
}
