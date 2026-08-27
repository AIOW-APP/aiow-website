import { PillarPage } from "@/components/aiow-v1/PillarPage";
import { JsonLd, pageMetadata, pillarSchemas } from "@/lib/aiow-v1/seo";
import { pillars } from "@/lib/aiow-v1/pillars";

const data = pillars["smart-office"];
export const metadata = pageMetadata({ title: "Smart Office en AI-gebouwautomatisering", description: data.answer, path: "/smart-office" });
export default function Page() { return <><JsonLd data={pillarSchemas(data)} /><PillarPage data={data} /></>; }
