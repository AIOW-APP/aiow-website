import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { englishPillars } from "@/lib/aiow-v1/pillars-en";
const data = englishPillars["smart-office"];
export const metadata = pageMetadata({ title: "Smart Office and AI building automation", description: data.answer, path: "/en/smart-office", pairedPaths: { nl: "/smart-office", en: "/en/smart-office" }, locale: "en" });
export default function Page() { return <><JsonLd data={pillarSchemas(data, "en")} /><PillarPage data={data} locale="en" /></>; }
