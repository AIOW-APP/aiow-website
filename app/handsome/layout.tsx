import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Handsome.bot",
    template: "%s",
  },
  description: "Consumer apps, early access en product proof van Team Handsome.",
  metadataBase: new URL("https://handsome.bot"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://handsome.bot/",
    siteName: "Handsome.bot",
    title: "Handsome.bot — apps die iets doen",
    description: "Consumer apps, early access en product proof van Team Handsome.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@handsomebstrd",
    title: "Handsome.bot — apps die iets doen",
    description: "Consumer apps, early access en product proof van Team Handsome.",
  },
  robots: { index: true, follow: true },
};

export default function HandsomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
