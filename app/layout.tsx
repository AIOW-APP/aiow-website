import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-family", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AIOW — De AI-campus voor jouw bedrijf",
    template: "%s · AIOW",
  },
  description:
    "AI Owned World. Acht huizen vol AI-capabilities. Vlieg de campus binnen, klik een huis, zie wat AIOW voor jou kan bouwen.",
  keywords: ["AIOW", "AI Owned World", "AI consultancy", "AI integratie", "AI voor bedrijven"],
  metadataBase: new URL("https://aiow.ai"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://aiow.ai",
    siteName: "AIOW",
    title: "AIOW — De AI-campus voor jouw bedrijf",
    description: "Acht huizen vol AI-kracht. Vlieg de campus binnen.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@handsomebstrd",
    title: "AIOW — De AI-campus voor jouw bedrijf",
    description: "AI Owned World. Vlieg de campus binnen.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0618",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-[#0A0618] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
