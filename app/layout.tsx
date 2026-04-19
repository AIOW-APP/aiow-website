import type { Metadata } from "next";
import Script from "next/script";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { Analytics } from "@/core/analytics/Analytics";
import { buildMetadata, orgJsonLd } from "@/core/seo/metadata";
import "./globals.css";

export const metadata: Metadata = buildMetadata({
  title: "Debbie Starter",
  description: "FWA-grade Next.js starter for Team Handsome projects.",
  brand: "debbie",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-brand="aiow">
      <body className="antialiased">
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <CustomCursor />
        <Analytics />
        <Script
          id="org-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd("debbie")) }}
        />
      </body>
    </html>
  );
}
