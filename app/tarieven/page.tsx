import { TariffsPage } from "@/components/aiow-v1/TariffsPage";
import { JsonLd, pageMetadata, tariffSchemas } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW tarieven — AI, Smart Office, Home en Smart Design", description: "Alle AIOW v3.2 tarieven, minima, Standaard/Comfort, meerwerk, advies en Smart Design transparant in één overzicht.", path: "/tarieven", pairedPaths: { nl: "/tarieven", en: "/en/rates" } });
export default function Page() { return <><JsonLd data={tariffSchemas("nl")} /><TariffsPage locale="nl" /></>; }
