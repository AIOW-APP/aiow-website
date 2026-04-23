import { IntroV10 } from "@/components/v10/IntroV10";
import { Cursor, SmoothScroll } from "@/components/v2/ExperienceLayer";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <main className="relative">
        <IntroV10 />
      </main>
    </>
  );
}
