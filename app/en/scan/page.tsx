import { ScanRequestPage } from "@/components/aiow-v1/ScanRequestPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";
import { safeScanReturnPath, scanSubjectFromIntent } from "@/lib/aiow-v1/scan-intent";

export const metadata=pageMetadata({title:"Request a practical AI scan | AIOW",description:"Request a bounded AIOW scan for one process, building or home. Preferred date and time are confirmed separately by a person.",path:"/en/scan",pairedPaths:{nl:"/scan",en:"/en/scan"},locale:"en"});
export default async function ScanPage({searchParams}:{searchParams:Promise<{intent?:string|string[];returnTo?:string|string[]}>}){const params=await searchParams;const intent=Array.isArray(params.intent)?params.intent[0]:params.intent;const returnTo=Array.isArray(params.returnTo)?params.returnTo[0]:params.returnTo;return <ScanRequestPage locale="en" initialSubject={scanSubjectFromIntent(intent)} returnTo={safeScanReturnPath(returnTo)}/>;}
