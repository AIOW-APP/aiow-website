import { TrustPage } from "@/components/aiow-v1/TrustPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "Company and contact | AIOW", description: "Verified details for AIOW B.V., Chamber of Commerce 71887466, contact and the boundary for written scope and conditions.", path: "/en/company", pairedPaths: { nl: "/bedrijfsgegevens", en: "/en/company" }, locale: "en" });
export default function Page() { return <TrustPage locale="en" />; }
