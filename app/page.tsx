import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Moment } from "@/components/Moment";
import { Journey } from "@/components/Journey";
import { Sectors } from "@/components/Sectors";
import { Portfolio } from "@/components/Portfolio";
import { Fleet } from "@/components/Fleet";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Problem />
      <Moment />
      <Journey />
      <Sectors />
      <Portfolio />
      <Fleet />
      <Contact />
      <Footer />
    </main>
  );
}
