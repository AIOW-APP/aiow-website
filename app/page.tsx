import Hero3D from "@/components/v2/Hero3DLoader";
import { ProblemV2, MomentV2, FinalCtaV2 } from "@/components/v2/StoryV2";
import { JourneyV2 } from "@/components/v2/JourneyV2";
import { SectorsV2 } from "@/components/v2/SectorsV2";
import { ScanV2 } from "@/components/v2/ScanV2";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero3D />
      <ProblemV2 />
      <MomentV2 />
      <JourneyV2 />
      <SectorsV2 />
      <ScanV2 />
      <FinalCtaV2 />
      <Footer />
    </main>
  );
}
