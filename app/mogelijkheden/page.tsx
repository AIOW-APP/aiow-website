import { CapabilitiesExperience, type CapabilityMode } from "@/components/aiow-v1/CapabilitiesExperience";
import { capabilitiesSchemas, JsonLd, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata=pageMetadata({
  title:"AI-mogelijkheden in de praktijk — AIOW",
  description:"Bekijk hoe AIOW signalen, AI, systemen en menselijke beslissingen verbindt tot controleerbare workflows voor processen, gebouwen en woningen.",
  path:"/mogelijkheden",
  pairedPaths:{nl:"/mogelijkheden",en:"/en/capabilities"},
  locale:"nl",
});
const modes:Record<string,CapabilityMode>={bedrijfsproces:"process",gebouw:"building",woning:"home"};
export default async function CapabilitiesPage({searchParams}:{searchParams:Promise<{omgeving?:string|string[]}>}){
  const raw=(await searchParams).omgeving;const initialMode=modes[Array.isArray(raw)?raw[0]:raw||""]||"process";
  return <><JsonLd data={capabilitiesSchemas("nl")}/><CapabilitiesExperience locale="nl" initialMode={initialMode}/></>;
}
