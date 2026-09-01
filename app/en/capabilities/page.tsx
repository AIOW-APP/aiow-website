import { CapabilitiesExperience } from "@/components/aiow-v1/CapabilitiesExperience";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata=pageMetadata({
  title:"AI capabilities in practice | AIOW",
  description:"See how AIOW connects signals, AI, systems and human decisions into controlled workflows for processes, buildings and homes.",
  path:"/en/capabilities",
  pairedPaths:{nl:"/mogelijkheden",en:"/en/capabilities"},
  locale:"en",
});

export default function CapabilitiesPage(){return <CapabilitiesExperience locale="en"/>;}
