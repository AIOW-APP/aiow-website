"use client";

import { FormEvent, useState } from "react";

const PROJECT_TYPES = [
  "Nieuw idee / startup",
  "Bestaand bedrijf laten groeien",
  "AI / automatisering",
  "Software / platform",
  "Marketing / growth",
  "Revenue share / participatie bespreken",
  "Nog te bepalen",
];

const DEAL_INTERESTS = [
  "Private AI Venture Deal Card",
  "Proof sprint",
  "Growth partner",
  "Revenue share",
  "Profit share",
  "Participatie / equity",
  "Vaste projectprijs",
];

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; onboardingId: string; message: string }
  | { status: "error"; message: string };

export function AiowCustomerOnboardingForm() {
  const [dealInterests, setDealInterests] = useState<string[]>(["Private AI Venture Deal Card"]);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const publicPayload = Object.fromEntries(formData.entries());
    const companyName = asString(publicPayload.companyName);
    const contactName = asString(publicPayload.primaryContactName);
    const contactEmail = asString(publicPayload.primaryContactEmail);
    const projectType = asString(publicPayload.projectType) || "Private venture intake";
    const privateBrief = asString(publicPayload.privateBrief);

    const payload = {
      ...publicPayload,
      legalName: companyName,
      billingEmail: contactEmail,
      projectName: `Private intake: ${companyName}`,
      projectType,
      projectBrief: privateBrief,
      authorizedSignerName: contactName,
      authorizedSignerRole: "Nog privé te bevestigen",
      authorizedSignerEmail: contactEmail,
      revenueSource: "Privé intake vereist",
      crmSource: "Privé intake vereist",
      paymentSource: "Privé intake vereist",
      moduleInterests: dealInterests,
      addOns: ["Private klantportaal", "AI Venture Deal Card"],
      aiowRevenueSharePercent: "10",
      industry: asString(publicPayload.industry),
      ideaSummary: privateBrief,
      aiowBuildScope: "Privé intake in klantportaal vereist voordat AIOW gevoelige venture/company data verzamelt.",
      termsRequiredAccepted: true,
      consentAccepted: publicPayload.consentAccepted === "on",
    };

    try {
      const response = await fetch("/api/customer-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const missing = Array.isArray(data.missing) ? ` Ontbreekt: ${data.missing.join(", ")}.` : "";
        throw new Error(`${data.error || "Aanvraag kon niet worden verstuurd."}${missing}`);
      }
      setSubmitState({
        status: "success",
        onboardingId: data.onboardingId,
        message: data.message || "Aanvraag ontvangen. AIOW opent daarna een privé intake/klantportaal.",
      });
      form.reset();
      setDealInterests(["Private AI Venture Deal Card"]);
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-8">
      <input className="hidden" tabIndex={-1} autoComplete="off" name="honeyCompanyUrl" aria-hidden="true" />

      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/85">
        <span className="block text-xs uppercase tracking-[0.18em] text-cyan-200/70">Privacy-first intake</span>
        Deze publieke aanvraag vraagt alleen de minimale gegevens om een privé AIOW intake te starten. Founder details, omzet, marges, contacten, klantdata, documenten en dealinformatie horen in een afgeschermd klantportaal met account-ID en toegangscode.
      </div>

      <Section eyebrow="01" title="Minimale aanvraag">
        <Field label="Bedrijfsnaam / projectnaam" name="companyName" required placeholder="Bijv. Acme BV of naam van het idee" />
        <Field label="Contactnaam" name="primaryContactName" required placeholder="Naam" />
        <Field label="Contact e-mail" name="primaryContactEmail" type="email" required placeholder="naam@bedrijf.nl" />
        <Field label="Telefoon" name="primaryContactPhone" placeholder="+31..." />
        <Field label="Website / LinkedIn" name="website" type="url" placeholder="https://..." />
        <Field label="Branche" name="industry" placeholder="Bijv. vastgoed, zorg, logistiek, e-commerce" />
      </Section>

      <Section eyebrow="02" title="Waarvoor wil je privé intake?">
        <Select label="Aanvraagtype" name="projectType" required options={PROJECT_TYPES} />
        <label className="md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Korte niet-gevoelige omschrijving *</span>
          <textarea
            name="privateBrief"
            rows={5}
            required
            placeholder="Beschrijf kort wat je wilt onderzoeken. Deel hier nog geen gevoelige omzet, marges, klantlijsten, contracten of vertrouwelijke IP. Dat komt later in het privé portaal."
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
          />
        </label>
        <Checklist title="Interesse" items={DEAL_INTERESTS} selected={dealInterests} onChange={setDealInterests} />
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65">
          <strong className="text-white">Volgende stap:</strong> AIOW maakt of opent een privé klantomgeving. Daar vullen jullie de volledige venture/company intake in voor score, due diligence, dealadvies en roadmap.
        </div>
      </Section>

      <label className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-50/90">
        <input type="checkbox" name="consentAccepted" required className="mt-1 size-4 accent-cyan-300" />
        <span>
          Ik begrijp dat dit alleen een publieke pre-aanvraag is. Gevoelige gegevens deel ik pas in het privé AIOW klantportaal of na directe afstemming met AIOW.
        </span>
      </label>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm text-white/50">
          Geen productie, live betalingen, betaalde modules of dealafspraken worden geactiveerd via deze publieke aanvraag.
        </p>
        <button
          type="submit"
          disabled={submitState.status === "submitting"}
          className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          {submitState.status === "submitting" ? "Versturen..." : "Start privé intake"}
        </button>
      </div>

      {submitState.status === "success" && (
        <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.08] p-4 text-sm text-emerald-50">
          <strong>Ontvangen:</strong> {submitState.onboardingId}. {submitState.message}
        </div>
      )}
      {submitState.status === "error" && (
        <div className="rounded-2xl border border-red-300/25 bg-red-300/[0.08] p-4 text-sm text-red-50">
          <strong>Niet verstuurd:</strong> {submitState.message}
        </div>
      )}
    </form>
  );
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, name, required, type = "text", placeholder }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string }) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">{label}{required ? " *" : ""}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
      />
    </label>
  );
}

function Select({ label, name, required, options }: { label: string; name: string; required?: boolean; options: string[] }) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">{label}{required ? " *" : ""}</span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
      >
        <option value="" disabled>Kies...</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Checklist({ title, items, selected, onChange }: { title: string; items: string[]; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <legend className="px-1 text-xs uppercase tracking-[0.18em] text-white/45">{title}</legend>
      <div className="mt-2 grid gap-2">
        {items.map((item) => {
          const checked = selected.includes(item);
          return (
            <label key={item} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-white/75 transition hover:bg-white/[0.04]">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  onChange(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item));
                }}
                className="size-4 accent-cyan-300"
              />
              {item}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
