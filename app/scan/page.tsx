import { ScanRequestPage } from "@/components/aiow-v1/ScanRequestPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata=pageMetadata({title:"Praktische AI-scan aanvragen | AIOW",description:"Vraag een begrensde AIOW-scan aan voor één proces, gebouw of woning. Voorkeursdatum en tijd worden afzonderlijk door een mens bevestigd.",path:"/scan",pairedPaths:{nl:"/scan",en:"/en/scan"},locale:"nl"});
export default function ScanPage(){return <ScanRequestPage locale="nl"/>;}
