import { notFound } from "next/navigation";
import { PricingContextPage } from "@/components/aiow-v1/PricingContextPage";
import { getPricingContext, pricingContexts } from "@/lib/aiow-v1/pricing-contexts";
import { JsonLd, pageMetadata, pricingContextSchemas } from "@/lib/aiow-v1/seo";

export const dynamicParams = false;
export function generateStaticParams() { return pricingContexts.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const context = getPricingContext((await params).slug);
  if (!context) return {};
  return pageMetadata({ title: `${context.title} — toepassingen en tarieven`, description: `${context.introduction} Bekijk pakketadvies en een transparante voorbeeldberekening.`, path: `/tarieven/${context.slug}` });
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const context = getPricingContext((await params).slug);
  if (!context) notFound();
  return <><JsonLd data={pricingContextSchemas(context)} /><PricingContextPage context={context} /></>;
}
