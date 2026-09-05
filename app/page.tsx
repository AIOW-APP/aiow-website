import { LivingBlueprintHomepage } from "@/components/aiow-v1/LivingBlueprintHomepage";
import { JsonLd, homeSchemas, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW — AI voor werk, bedrijfspanden en woningen", description: "AIOW ontwerpt, bouwt, koppelt en beheert AI-systemen voor werk, bedrijfspanden en woningen & villa’s. U bepaalt wat er gebeurt.", path: "/", pairedPaths: { nl: "/", en: "/en" } });
export default function Home() { return <><JsonLd data={homeSchemas("nl")} /><LivingBlueprintHomepage /></>; }
