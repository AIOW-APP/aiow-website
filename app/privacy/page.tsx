import { InfoPage, privacyContent } from "@/components/aiow-v1/InfoPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";
export const metadata = pageMetadata({ title: "Privacy bij booking en offerte | AIOW", description: "Uitleg over de verwerking van gegevens voor de AIOW-bookingintake en offerte-indicatie.", path: "/privacy", pairedPaths: { nl: "/privacy", en: "/en/privacy" } });
export default function Page() { return <InfoPage locale="nl" {...privacyContent.nl} />; }
