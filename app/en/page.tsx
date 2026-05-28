import type { Metadata } from "next";
import { AiowNativeMotionPage } from "@/components/aiow/AiowNativeMotionPage";

export const metadata: Metadata = {
  title: "Not a chatbot. Your own AI system.",
  description: "Plan an AI system scan. AIOW builds secure AI worklayers for businesses, teams and private AI infrastructure.",
  keywords: ["AI system scan", "MKB AI", "AI worklayer", "private AI infrastructure"],
  alternates: { canonical: "/en", languages: { en: "/en", "nl-NL": "/nl", "x-default": "/en" } },
  openGraph: { locale: "en_US", url: "/en", title: "AIOW — Not a chatbot. Your own AI system.", description: "Secure AI worklayers for businesses, teams and private AI infrastructure." },
};

export default function EnPage() { return <AiowNativeMotionPage initialLang="en" />; }
