"use client";

import { FormEvent, useEffect, useState } from "react";

type Contract = {
  contractId: string;
  status: string;
  companyName: string;
  legalName: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  dealModel: string;
  aiowApproach: string;
  scope: string[];
  customerResponsibilities: string[];
  teamSetup: string[];
  dashboardFocus: string[];
  commercialTerms: string[];
  legalTerms: string[];
  signedAt?: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; contract: Contract }
  | { status: "signed"; contract: Contract }
  | { status: "error"; message: string };

export function ContractSignView({ contractId, initialCode }: { contractId: string; initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    void load(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  async function load(nextCode = code) {
    if (!nextCode) {
      setState({ status: "error", message: "Contractcode ontbreekt." });
      return;
    }
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/contracts/sign?contractId=${encodeURIComponent(contractId)}&code=${encodeURIComponent(nextCode)}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Contract kon niet worden geladen.");
      setState({ status: data.contract.status === "SIGNED" ? "signed" : "loaded", contract: data.contract });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  async function sign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          code,
          signatureName: formData.get("signatureName"),
          signatureRole: formData.get("signatureRole"),
          signatureEmail: formData.get("signatureEmail"),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Ondertekenen mislukt.");
      setState({ status: "signed", contract: data.contract });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-8">
      {state.status === "loading" && <p className="text-sm text-white/55">Contract laden...</p>}
      {state.status === "error" && (
        <form onSubmit={(event) => { event.preventDefault(); void load(code); }} className="grid gap-4">
          <div className="rounded-2xl border border-red-300/25 bg-red-300/[0.08] p-4 text-sm text-red-50">{state.message}</div>
          <label><span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Contractcode</span><input value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none" /></label>
          <button className="w-fit rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black">Open contract</button>
        </form>
      )}
      {(state.status === "loaded" || state.status === "signed") && <ContractBody contract={state.contract} onSign={sign} signed={state.status === "signed"} />}
    </div>
  );
}

function ContractBody({ contract, onSign, signed }: { contract: Contract; onSign: (event: FormEvent<HTMLFormElement>) => void; signed: boolean }) {
  return (
    <div className="grid gap-6">
      <div className="border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">{contract.status}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{contract.subject}</h2>
        <p className="mt-2 text-white/55">{contract.legalName} · {contract.contactName} · {contract.contactEmail}</p>
      </div>
      <Block title="AIOW advies / dealmodel" items={[contract.dealModel]} highlight />
      <Block title="Aanpak" items={[contract.aiowApproach]} />
      <Block title="Scope" items={contract.scope} />
      <Block title="Verantwoordelijkheden klant" items={contract.customerResponsibilities} />
      <Block title="Team setup na akkoord" items={contract.teamSetup} />
      <Block title="Dashboardstatus + verbeteradvies" items={contract.dashboardFocus} />
      <Block title="Commerciële basis" items={contract.commercialTerms} highlight />
      <Block title="Juridische / operationele voorwaarden" items={contract.legalTerms} />

      {signed ? (
        <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.08] p-4 text-sm text-emerald-50"><strong>Ondertekend.</strong> AIOW maakt nu de Telegram projectgroep aan met Spunky en activeert interne AIOW projectcontext. {contract.signedAt ? `Tijdstip: ${new Date(contract.signedAt).toLocaleString("nl-NL")}` : ""}</div>
      ) : (
        <form onSubmit={onSign} className="grid gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
          <h3 className="text-lg font-semibold text-white">Digitaal akkoord</h3>
          <p className="text-sm leading-6 text-white/60">Door te ondertekenen geef je akkoord op deze operationele AIOW-aanpak, commerciële basis en voorwaarden-gate. Aanvullende juridische documenten kunnen nodig blijven voor participatie/profit-share/equity.</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Field name="signatureName" label="Naam" defaultValue={contract.contactName} />
            <Field name="signatureRole" label="Rol/functie" />
            <Field name="signatureEmail" label="E-mail" type="email" defaultValue={contract.contactEmail} />
          </div>
          <button className="w-fit rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-white">Akkoord geven en tekenen</button>
        </form>
      )}
    </div>
  );
}

function Block({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return <section className={`rounded-2xl border p-4 ${highlight ? "border-cyan-300/20 bg-cyan-300/[0.06]" : "border-white/10 bg-black/20"}`}><h3 className="text-lg font-semibold text-white">{title}</h3><ul className="mt-3 grid gap-2 text-sm leading-6 text-white/65">{items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-200" />{item}</li>)}</ul></section>;
}

function Field({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue?: string }) {
  return <label><span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-white/40">{label}</span><input name={name} type={type} defaultValue={defaultValue} required className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/60" /></label>;
}
