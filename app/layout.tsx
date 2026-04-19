import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-family", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AIOW — Spunky kent jouw bedrijf",
    template: "%s · AIOW",
  },
  description:
    "Wij maken je bedrijf AI-native. Van A tot Z geregeld: scan, strategie, implementatie, training, groei. 30+ SaaS-producten live.",
  keywords: ["AI consultancy", "AI transformatie", "MKB", "AI strategie", "AI implementatie", "Nederland"],
  metadataBase: new URL("https://aiow.io"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://aiow.io",
    siteName: "AIOW",
    title: "AIOW — Spunky kent jouw bedrijf",
    description:
      "Wij maken je bedrijf AI-native. Scan, strategie, implementatie, training, groei. 30+ SaaS-producten live.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@handsomebstrd",
    title: "AIOW — Spunky kent jouw bedrijf",
    description: "Van A tot Z geregeld. Scan, strategie, implementatie.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${inter.variable} ${mono.variable}`}>
      <body className="noise">
        <SmoothScroll>{children}</SmoothScroll>
        <CustomCursor />
      </body>
    </html>
  );
}
