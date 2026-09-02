import { TrustPage } from "@/components/aiow-v1/TrustPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "Company and contact — AIOW", description: "AIOW B.V. is based in Hoofddorp and serves clients throughout the Netherlands. View Chamber of Commerce 71887466, contact and written-scope boundaries.", path: "/en/company", pairedPaths: { nl: "/bedrijfsgegevens", en: "/en/company" }, locale: "en" });
export default function Page() { return <TrustPage locale="en" />; }
