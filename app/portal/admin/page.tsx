import type { Metadata } from "next";
import QuoteBuilder from "./QuoteBuilder";

export const metadata: Metadata = {
  title: "AIOW Admin Quote Builder — manual-safe",
  description: "Interne manual-safe quote builder voor AIOW klantportal drafts. Geen opslag, geen verzending, geen echte acceptatie.",
  robots: { index: false, follow: false },
};

export default function PortalAdminPage() {
  return <QuoteBuilder />;
}
