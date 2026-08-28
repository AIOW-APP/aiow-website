import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { pillars } from "@/lib/aiow-v1/pillars";
const data = pillars.home;
export const metadata = pageMetadata({ title: "AIOW Home — praktische woningintelligentie", description: data.answer, path: "/home", pairedPaths: { nl: "/home", en: "/en/home" } });
export default function Page() { return <><JsonLd data={pillarSchemas(data, "nl")} /><PillarPage data={data} locale="nl" /></>; }
