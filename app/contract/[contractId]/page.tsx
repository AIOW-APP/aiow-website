import type { Metadata } from "next";
import Link from "next/link";
import { ContractSignView } from "./ContractSignView";

export const metadata: Metadata = {
  title: "AIOW contract tekenen",
  description: "Privé AIOW samenwerkingsvoorstel en digitale akkoordpagina.",
  robots: { index: false, follow: false },
};

export default async function ContractPage({ params, searchParams }: { params: Promise<{ contractId: string }>; searchParams: Promise<{ code?: string }> }) {
  const { contractId } = await params;
  const { code = "" } = await searchParams;
  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,240,255,0.18),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(255,79,216,0.12),transparent_30%)]" />
      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 md:px-8 md:py-16 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <Link href="/" className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-cyan-300/60 hover:text-cyan-100">AIOW.ai</Link>
          <p className="mt-10 text-xs uppercase tracking-[0.24em] text-cyan-200/70">Private agreement</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white md:text-7xl">AIOW aanpak akkoord.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">Bekijk het voorstel, scope, commerciële basis en projectwerkwijze. Na akkoord maakt AIOW de Telegram projectgroep aan met Spunky als contact-AI/contextlaag.</p>
          <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/[0.07] p-5 text-sm leading-6 text-amber-50/85"><strong className="block text-amber-100">Belangrijk</strong> Participatie, profit share en juridische/tax structuren kunnen aanvullende documenten vereisen. Dit akkoord activeert de operationele AIOW-aanpak en voorwaarden-gate.</div>
        </aside>
        <ContractSignView contractId={contractId} initialCode={code} />
      </section>
    </main>
  );
}
