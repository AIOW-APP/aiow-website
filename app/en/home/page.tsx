import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { englishPillars } from "@/lib/aiow-v1/pillars-en";
const data = englishPillars.home;
export const metadata = pageMetadata({ title: "AIOW Home — practical home intelligence", description: data.answer, path: "/en/home", pairedPaths: { nl: "/home", en: "/en/home" }, locale: "en" });
export default function Page() { return <><JsonLd data={pillarSchemas(data, "en")} /><PillarPage data={data} locale="en" /></>; }
