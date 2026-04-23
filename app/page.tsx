import IntroV11 from "@/components/v11/IntroV11";
import AmbientAudio from "@/components/v11/AmbientAudio";

export const metadata = {
  title: "AIOW — AI voor jouw bedrijf",
  description: "Acht huizen vol AI-capabilities. Stap een kamer binnen en zie wat AIOW voor jouw bedrijf kan doen.",
};

export default function Home() {
  return (
    <>
      <IntroV11 />
      <AmbientAudio src="/audio/ambient-campus.mp3" />
    </>
  );
}
