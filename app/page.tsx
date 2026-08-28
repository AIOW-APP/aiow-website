import { AiowV1Homepage } from "@/components/aiow-v1/AiowV1Homepage";
import { homeSchemas, JsonLd, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW — AI voor proces, gebouw en woning", description: "AI voor bedrijfsprocessen, gebouwen en woningen — ontworpen en beheerd door één partij, met transparante tarieven en duidelijke uitsluitingen.", path: "/" });
export default function Home() { return <><JsonLd data={homeSchemas("nl")} /><AiowV1Homepage /></>; }
