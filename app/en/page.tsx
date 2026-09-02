import { AiowV1Homepage } from "@/components/aiow-v1/AiowV1Homepage";
import { JsonLd, homeSchemas, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW — Managed AI for process, building and home", description: "AI systems for business processes, buildings and homes — designed, installed and maintained with transparent rates and human decision points.", path: "/en", pairedPaths: { nl: "/", en: "/en" }, locale: "en" });
export default function Page() { return <><JsonLd data={homeSchemas("en")} /><AiowV1Homepage locale="en" /></>; }
