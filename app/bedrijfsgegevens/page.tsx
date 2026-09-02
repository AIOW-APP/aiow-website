import { TrustPage } from "@/components/aiow-v1/TrustPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "Bedrijfsgegevens en contact — AIOW", description: "AIOW B.V. is gevestigd in Hoofddorp en werkt in heel Nederland. Bekijk KvK 71887466, contact en de grens van schriftelijke scope en voorwaarden.", path: "/bedrijfsgegevens", pairedPaths: { nl: "/bedrijfsgegevens", en: "/en/company" } });
export default function Page() { return <TrustPage locale="nl" />; }
