import { InfoPage, venturesContent } from "@/components/aiow-v1/InfoPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";
export const metadata = pageMetadata({ title: "AIOW Ventures — separate product development", description: "AIOW Ventures develops its own digital propositions and remains operationally separate from AIOW Solutions implementations.", path: "/en/ventures", pairedPaths: { nl: "/ventures", en: "/en/ventures" }, locale: "en" });
export default function Page() { return <InfoPage locale="en" {...venturesContent.en} />; }
