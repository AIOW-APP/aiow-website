import { AiowV1Homepage } from "@/components/aiow-v1/AiowV1Homepage";
import { homeSchemas, JsonLd, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "Working AI for companies and buildings", description: "Practical AI automation, local AI, Smart Office and Home with transparent price indications and clear exclusions.", path: "/en", locale: "en" });
export default function EnglishHome() { return <><JsonLd data={homeSchemas("en")} /><AiowV1Homepage locale="en" /></>; }
