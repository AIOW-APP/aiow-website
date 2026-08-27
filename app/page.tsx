import { AiowV1Homepage } from "@/components/aiow-v1/AiowV1Homepage";
import { homeSchemas, JsonLd, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW — Werkende AI voor bedrijf en gebouw", description: "Praktische AI-automatisering, lokale AI, Smart Office en Home met een transparante prijsindicatie en duidelijke uitsluitingen.", path: "/" });
export default function Home() { return <><JsonLd data={homeSchemas("nl")} /><AiowV1Homepage /></>; }
