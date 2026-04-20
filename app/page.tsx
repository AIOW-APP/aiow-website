import { HeroDebbie } from "@/components/v2/HeroDebbie";
import { PillarsDebbie, ManifestoDebbie, FinalCtaDebbie } from "@/components/v2/PillarsDebbie";
import { SectorsV3 } from "@/components/v2/SectorsV3";
import { ScanDebbie } from "@/components/v2/ScanDebbie";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <HeroDebbie />
      <PillarsDebbie />
      <SectorsV3 />
      <ManifestoDebbie />
      <ScanDebbie />
      <FinalCtaDebbie />
      <Footer />
    </main>
  );
}
