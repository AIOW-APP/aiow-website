import { InfoPage, venturesContent } from "@/components/aiow-v1/InfoPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";
export const metadata = pageMetadata({ title: "AIOW Ventures — afzonderlijke productbouw", description: "AIOW Ventures ontwikkelt eigen digitale proposities en staat operationeel los van AIOW Solutions-implementaties.", path: "/ventures", pairedPaths: { nl: "/ventures", en: "/en/ventures" } });
export default function Page() { return <InfoPage locale="nl" {...venturesContent.nl} />; }
