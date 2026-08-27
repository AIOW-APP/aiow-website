import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { pillars } from "@/lib/aiow-v1/pillars";

const data = pillars["lokale-ai"];
export const metadata = pageMetadata({ title: "Lokale en private AI in Nederland", description: data.answer, path: "/lokale-ai" });
export default function Page() { return <><JsonLd data={pillarSchemas(data)} /><PillarPage data={data} /></>; }
