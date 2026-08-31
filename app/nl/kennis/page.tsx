import { KnowledgeHub } from "@/components/aiow-v1/KnowledgePages";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW kennis — bewijs vóór AI-beloftes", description: "Praktische AIOW-kennis over AI-implementatie en venturebeoordeling, met expliciete bewijs- en bevoegdheidsgrenzen.", path: "/nl/kennis", pairedPaths: { nl: "/nl/kennis", en: "/en/knowledge" } });
export default function Page() { return <KnowledgeHub locale="nl" />; }
