import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { OpsDashboard } from "@/components/aiow-v1/OpsDashboard";

export const metadata = { title: "Besloten commerciële operatie · AIOW", robots: { index: false, follow: false } };

export default async function AdminPage() {
  // Middleware is the authority. Never mount a data-reading consumer without its exact marker.
  const requestHeaders = await headers();
  if (requestHeaders.get("x-aiow-operator-id") !== "richard" || requestHeaders.get("x-aiow-operator-role") !== "ops_admin") notFound();
  return <OpsDashboard />;
}
