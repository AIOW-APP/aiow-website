import { InfoPage, privacyContent } from "@/components/aiow-v1/InfoPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";
export const metadata = pageMetadata({ title: "Privacy for booking and quotes | AIOW", description: "How data is processed for the AIOW booking intake and quote indication.", path: "/en/privacy", pairedPaths: { nl: "/privacy", en: "/en/privacy" }, locale: "en" });
export default function Page() { return <InfoPage locale="en" {...privacyContent.en} />; }
