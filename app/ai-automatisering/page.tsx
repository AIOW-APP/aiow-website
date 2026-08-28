import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { pillars } from "@/lib/aiow-v1/pillars";
const data = pillars["ai-automatisering"];
export const metadata = pageMetadata({ title: "AI-automatisering voor het MKB", description: data.answer, path: "/ai-automatisering", pairedPaths: { nl: "/ai-automatisering", en: "/en/ai-automation" } });
export default function Page() { return <><JsonLd data={pillarSchemas(data, "nl")} /><PillarPage data={data} locale="nl" /></>; }
