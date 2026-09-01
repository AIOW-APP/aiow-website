import { CapabilitiesExperience } from "@/components/aiow-v1/CapabilitiesExperience";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata=pageMetadata({
  title:"AI-mogelijkheden in de praktijk | AIOW",
  description:"Bekijk hoe AIOW signalen, AI, systemen en menselijke beslissingen verbindt tot controleerbare workflows voor processen, gebouwen en woningen.",
  path:"/mogelijkheden",
  pairedPaths:{nl:"/mogelijkheden",en:"/en/capabilities"},
  locale:"nl",
});

export default function CapabilitiesPage(){return <CapabilitiesExperience locale="nl"/>;}
