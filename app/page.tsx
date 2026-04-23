import { BackgroundCanvas, Cursor, SmoothScroll } from "@/components/v2/ExperienceLayer";
import { HeroV8 } from "@/components/v2/HeroV8";
import { PillarsV8 } from "@/components/v2/PillarsV8";
import { KamersV9 } from "@/components/v2/KamersV9";
import { SectorsV8 } from "@/components/v2/SectorsV8";
import { ManifestoV8 } from "@/components/v2/ManifestoV8";
import { ScanDebbie } from "@/components/v2/ScanDebbie";
import { FinalV8 } from "@/components/v2/FinalV8";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <BackgroundCanvas />
      <main className="relative">
        <HeroV8 />
        <PillarsV8 />
        <KamersV9 />
        <SectorsV8 />
        <ManifestoV8 />
        <ScanDebbie />
        <FinalV8 />
        <Footer />
      </main>
    </>
  );
}
