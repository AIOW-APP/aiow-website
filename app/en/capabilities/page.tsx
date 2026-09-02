import { CapabilitiesExperience, type CapabilityMode } from "@/components/aiow-v1/CapabilitiesExperience";
import { capabilitiesSchemas, JsonLd, pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata=pageMetadata({
  title:"AI capabilities in practice — AIOW",
  description:"See how AIOW connects signals, AI, systems and human decisions into controlled workflows for processes, buildings and homes.",
  path:"/en/capabilities",
  pairedPaths:{nl:"/mogelijkheden",en:"/en/capabilities"},
  locale:"en",
});
const modes:Record<string,CapabilityMode>={process:"process",building:"building",home:"home"};
export default async function CapabilitiesPage({searchParams}:{searchParams:Promise<{environment?:string|string[]}>}){
  const raw=(await searchParams).environment;const initialMode=modes[Array.isArray(raw)?raw[0]:raw||""]||"process";
  return <><JsonLd data={capabilitiesSchemas("en")}/><CapabilitiesExperience locale="en" initialMode={initialMode}/></>;
}
