export { alt, size, contentType } from "@/core/seo/og-image";
import { OGImage } from "@/core/seo/og-image";

export default async function Image() {
  return OGImage({
    eyebrow: "Team Handsome",
    title: "Debbie Starter",
    subtitle: "FWA-grade Next.js starter template.",
    brand: "debbie",
  });
}
