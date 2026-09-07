import { ScanRequestPage } from "@/components/aiow-v1/ScanRequestPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";
import { safeScanReturnPath, scanSubjectFromIntent } from "@/lib/aiow-v1/scan-intent";

export const metadata=pageMetadata({title:"Praktische AI-scan aanvragen | AIOW",description:"Vraag een begrensde AIOW-scan aan voor één proces, gebouw of woning. Voorkeursdatum en tijd worden afzonderlijk door een mens bevestigd.",path:"/scan",pairedPaths:{nl:"/scan",en:"/en/scan"},locale:"nl"});
export default async function ScanPage({searchParams}:{searchParams:Promise<{intent?:string|string[];returnTo?:string|string[]}>}){const params=await searchParams;const intent=Array.isArray(params.intent)?params.intent[0]:params.intent;const returnTo=Array.isArray(params.returnTo)?params.returnTo[0]:params.returnTo;return <ScanRequestPage locale="nl" initialSubject={scanSubjectFromIntent(intent)} returnTo={safeScanReturnPath(returnTo)}/>;}
