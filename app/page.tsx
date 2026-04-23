"use client";
import dynamic from "next/dynamic";
import { LangProvider } from "@/components/v12/LangContext";
import AmbientAudio from "@/components/v12/AmbientAudio";

const Campus3D = dynamic(() => import("@/components/v12/Campus3D"), { ssr: false });

export default function Home() {
  return (
    <LangProvider>
      <Campus3D />
      <AmbientAudio src="/audio/ambient-campus.mp3" />
    </LangProvider>
  );
}
