import { KnowledgeHub } from "@/components/aiow-v1/KnowledgePages";
import { pageMetadata } from "@/lib/aiow-v1/seo";

export const metadata = pageMetadata({ title: "AIOW knowledge — evidence before AI promises", description: "Practical AIOW knowledge about AI implementation and venture assessment, with explicit evidence and authority boundaries.", path: "/en/knowledge", pairedPaths: { nl: "/nl/kennis", en: "/en/knowledge" }, locale: "en" });
export default function Page() { return <KnowledgeHub locale="en" />; }
