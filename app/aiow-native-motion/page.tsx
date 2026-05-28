import type { Metadata } from "next";
import { AiowNativeMotionPage } from "@/components/aiow/AiowNativeMotionPage";

export const metadata: Metadata = {
  title: "AIOW Native Motion Preview",
  description: "Preview-only native browser motion prototype for the AIOW top-1% homepage.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AiowNativeMotionPage />;
}
