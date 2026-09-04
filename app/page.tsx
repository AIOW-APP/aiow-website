import { LivingBlueprintHomepage } from "@/components/aiow-v1/LivingBlueprintHomepage";
import { JsonLd, homeSchemas, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW — Beheerde AI voor proces, pand en woning", description: "AI voor bedrijfsprocessen, gebouwen en woningen — ontworpen, geïnstalleerd en beheerd met transparante tarieven en menselijke beslismomenten.", path: "/", pairedPaths: { nl: "/", en: "/en" } });
export default function Home() { return <><JsonLd data={homeSchemas("nl")} /><LivingBlueprintHomepage /></>; }
