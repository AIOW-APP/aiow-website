import { TrustPage } from "@/components/aiow-v1/TrustPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "Bedrijfsgegevens en contact | AIOW", description: "Geverifieerde gegevens van AIOW B.V., KvK 71887466, contact en uitleg over schriftelijke scope en voorwaarden.", path: "/bedrijfsgegevens", pairedPaths: { nl: "/bedrijfsgegevens", en: "/en/company" } });
export default function Page() { return <TrustPage locale="nl" />; }
