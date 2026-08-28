import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { englishPillars } from "@/lib/aiow-v1/pillars-en";
const data = englishPillars["ai-automation"];
export const metadata = pageMetadata({ title: "AI automation for businesses", description: data.answer, path: "/en/ai-automation", pairedPaths: { nl: "/ai-automatisering", en: "/en/ai-automation" }, locale: "en" });
export default function Page() { return <><JsonLd data={pillarSchemas(data, "en")} /><PillarPage data={data} locale="en" /></>; }
