import type { Metadata } from "next";
import { AiowLegalPage } from "@/components/aiow/AiowLegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for use of AIOW.ai and exploratory AI system scan intake.",
  alternates: { canonical: "/en/terms" },
};

export default function Page() { return <AiowLegalPage lang="en" kind="terms" />; }
