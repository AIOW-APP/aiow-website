import { LivingBlueprintHomepage } from "@/components/aiow-v1/LivingBlueprintHomepage";
import { JsonLd, homeSchemas, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW — AI for work, commercial buildings and homes", description: "AIOW designs, builds, connects and manages AI systems for work, commercial buildings and homes & villas. You decide what happens.", path: "/en", pairedPaths: { nl: "/", en: "/en" }, locale: "en" });
export default function Page() { return <><JsonLd data={homeSchemas("en")} /><LivingBlueprintHomepage locale="en" /></>; }
