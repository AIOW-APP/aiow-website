import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { englishPillars } from "@/lib/aiow-v1/pillars-en";
const data = englishPillars["local-ai"];
export const metadata = pageMetadata({ title: "Local and private AI", description: data.answer, path: "/en/local-ai", pairedPaths: { nl: "/lokale-ai", en: "/en/local-ai" }, locale: "en" });
export default function Page() { return <><JsonLd data={pillarSchemas(data, "en")} /><PillarPage data={data} locale="en" /></>; }
