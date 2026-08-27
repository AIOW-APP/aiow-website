export { alt, size, contentType } from "@/core/seo/og-image";
import { OGImage } from "@/core/seo/og-image";

export default async function Image() {
  return OGImage({
    eyebrow: "AIOW · Warm Precision",
    title: "Werkende AI voor bedrijf en gebouw",
    subtitle: "Transparante pilotindicaties. Definitieve scope na een praktische scan.",
    brand: "aiow",
  });
}
