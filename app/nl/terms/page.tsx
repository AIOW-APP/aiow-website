import type { Metadata } from "next";
import { AiowLegalPage } from "@/components/aiow/AiowLegalPage";

export const metadata: Metadata = {
  title: "Voorwaarden",
  description: "Voorwaarden voor gebruik van AIOW.ai en voorbereidende AI-systeemscan intake.",
  alternates: { canonical: "/nl/terms" },
};

export default function Page() { return <AiowLegalPage lang="nl" kind="terms" />; }
