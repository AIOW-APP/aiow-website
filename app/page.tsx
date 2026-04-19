import HeroPro from "@/components/v2/Hero3DLoader";
import { PillarsV3, ManifestoV3, FinalCtaV3 } from "@/components/v2/PillarsV3";
import { SectorsV3 } from "@/components/v2/SectorsV3";
import { ScanV2 } from "@/components/v2/ScanV2";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <HeroPro />
      <PillarsV3 />
      <SectorsV3 />
      <ManifestoV3 />
      <ScanV2 />
      <FinalCtaV3 />
      <Footer />
    </main>
  );
}
