import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@/core/analytics/Analytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://aiow.ai"),
  title: { default: "AIOW — Werkende AI voor bedrijf en gebouw", template: "%s · AIOW" },
  description: "AIOW inventariseert, bouwt en beheert praktische AI-systemen voor bedrijven en gebouwen, met transparante prijsindicaties.",
  applicationName: "AIOW",
  alternates: { canonical: "https://aiow.ai", languages: { nl: "https://aiow.ai", en: "https://aiow.ai/en", "x-default": "https://aiow.ai" } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#14161A" }, { media: "(prefers-color-scheme: light)", color: "#F4EFE6" }] };
const themeScript = `(function(){try{var t=localStorage.getItem('aiow-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark'||t==='system')?t:'system'}catch(e){document.documentElement.dataset.theme='system'}})()`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-aiow-locale") === "en" ? "en" : "nl";
  return <html lang={locale} className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}<Analytics /></body></html>;
}
