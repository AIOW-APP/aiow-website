import { ScanRequestPage } from "@/components/aiow-v1/ScanRequestPage";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata=pageMetadata({title:"Request a practical AI scan | AIOW",description:"Request a bounded AIOW scan for one process, building or home. Preferred date and time are confirmed separately by a person.",path:"/en/scan",pairedPaths:{nl:"/scan",en:"/en/scan"},locale:"en"});
export default function ScanPage(){return <ScanRequestPage locale="en"/>;}
