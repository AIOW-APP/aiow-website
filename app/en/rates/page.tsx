import { TariffsPage } from "@/components/aiow-v1/TariffsPage";
import { JsonLd, pageMetadata, tariffSchemas } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW rates — AI, Smart Office, Home and Smart Design", description: "All AIOW v3.2 rates, minimums, Standard/Comfort, additional work, advice and Smart Design transparently in one overview.", path: "/en/rates", pairedPaths: { nl: "/tarieven", en: "/en/rates" }, locale: "en" });
export default function Page() { return <><JsonLd data={tariffSchemas("en")} /><TariffsPage locale="en" /></>; }
