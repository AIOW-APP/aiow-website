/**
 * OG image generator using Next.js ImageResponse.
 *
 * Usage — drop in `app/opengraph-image.tsx`:
 *   export { alt, size, contentType } from "@/core/seo/og-image";
 *   import { OGImage } from "@/core/seo/og-image";
 *   export default async function Image() {
 *     return OGImage({ title: "AIOW", subtitle: "Built for crypto portfolios.", brand: "aiow" });
 *   }
 *
 * Requires next/og package (ships with Next 13+).
 */
import { ImageResponse } from "next/og";

export const alt = "Generated preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_COLORS = {
  debbie:   { accent: "#E91E63", glow: "rgba(233, 30, 99, 0.3)"    },
  aiow:     { accent: "#00D9FF", glow: "rgba(0, 217, 255, 0.3)"    },
  h3alth:   { accent: "#FF4D6D", glow: "rgba(255, 77, 109, 0.3)"   },
  mew:      { accent: "#FF6B35", glow: "rgba(255, 107, 53, 0.3)"   },
  handsome: { accent: "#C6FF3D", glow: "rgba(198, 255, 61, 0.3)"   },
};

export async function OGImage({
  title,
  subtitle,
  brand = "debbie",
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  brand?: keyof typeof BRAND_COLORS;
  eyebrow?: string;
}) {
  const b = BRAND_COLORS[brand];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          backgroundColor: "#0A0A0B",
          backgroundImage: `radial-gradient(ellipse 80% 60% at 30% 30%, ${b.glow}, transparent)`,
          fontFamily: "system-ui",
        }}
      >
        {eyebrow && (
          <div
            style={{
              color: b.accent,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: 4,
              marginBottom: 40,
              fontFamily: "monospace",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            color: "#FAFAFA",
            fontSize: 90,
            lineHeight: 1.05,
            letterSpacing: -3,
            maxWidth: "85%",
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: "#A1A1AA",
              fontSize: 28,
              marginTop: 28,
              maxWidth: "75%",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 80,
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: b.accent,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
