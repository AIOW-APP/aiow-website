"use client";

import { FormEvent, useState } from "react";
import styles from "../../AiowPortal.module.css";

const PROJECT_TYPES = [
  "AI-medewerker / agent",
  "CRM / sales automation",
  "Klantcontact / support",
  "Planning / operations",
  "Finance / administratie",
  "Private AI / governance",
  "Maatwerk integratie",
];

const MODULE_OPTIONS = [
  "AI-systeemscan",
  "Persoonlijke AI-medewerker",
  "CRM intake & opvolging",
  "Offerte / proposal automation",
  "Support inbox / klantvragen",
  "Planning & taakroutering",
  "Document- en kennisbanklaag",
  "Private/lokale AI setup",
  "Analytics / dashboarding",
  "Human approval workflow",
];

const ADD_ON_OPTIONS = [
  "WhatsApp/Telegram koppeling",
  "E-mail/Resend koppeling",
  "Stripe/payment readiness",
  "Supabase/CRM setup",
  "Voice/audio workflow",
  "SEO/GEO content machine",
  "Team training",
  "Security/governance review",
];

type AccountPrefill = {
  intent: "idea" | "company";
  context: string;
  projectName: string;
  projectType: string;
};

function getAccountPrefill(): AccountPrefill {
  if (typeof window === "undefined") {
    return { intent: "idea", context: "", projectName: "", projectType: "" };
  }
  const params = new URLSearchParams(window.location.search);
  const intent = params.get("intent") === "company" ? "company" : "idea";
  const context = (params.get("context") || "").slice(0, 1400);
  return {
    intent,
    context,
    projectName: intent === "company" ? "Digitalisering bestaand bedrijf" : "Nieuw AIOW idee",
    projectType: intent === "company" ? "Maatwerk integratie" : "AI-medewerker / agent",
  };
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; accountId: string; accessCode: string; portalUrl: string; message: string }
  | { status: "error"; message: string };

export function CustomerAccountCreateForm() {
  const [prefill] = useState<AccountPrefill>(() => getAccountPrefill());
  const [moduleInterests, setModuleInterests] = useState<string[]>(prefill.intent === "company" ? ["AI-systeemscan", "Maatwerk integratie", "Analytics / dashboarding"] : ["AI-systeemscan"]);
  const [addOns, setAddOns] = useState<string[]>(prefill.intent === "company" ? ["WhatsApp/Telegram koppeling", "Supabase/CRM setup"] : []);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const emailFollowupConsent = payload.emailFollowupConsent === "on";

    try {
      const response = await fetch("/api/customer-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          accountTermsAccepted: payload.accountTermsAccepted === "on",
          emailFollowupConsent,
          consentText: "AIOW mag mijn contactgegevens en intakecontext gebruiken om mijn aanvraag persoonlijk per e-mail op te volgen. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.",
          consentVersion: "aiow-followup-v1",
          sourceRoute: typeof window !== "undefined" ? window.location.pathname : "/portal/account/new",
          sourceComponent: "portal-account-create",
          intentType: prefill.intent,
          intentText: prefill.context,
          moduleInterests,
          addOns,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const missing = Array.isArray(data.missing) ? ` Ontbreekt: ${data.missing.join(", ")}.` : "";
        throw new Error(`${data.error || "Account kon niet worden aangemaakt."}${missing}`);
      }
      localStorage.setItem("aiow:lastAccountId", data.account.accountId);
      localStorage.setItem("aiow:lastAccessCode", data.accessCode);
      window.dispatchEvent(new Event("aiow:account-state-changed"));
      setSubmitState({
        status: "success",
        accountId: data.account.accountId,
        accessCode: data.accessCode,
        portalUrl: data.portalUrl,
        message: data.message,
      });
      event.currentTarget.reset();
      setModuleInterests(["AI-systeemscan"]);
      setAddOns([]);
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <form onSubmit={onSubmit} className={styles.shell}>
      <input className="hidden" tabIndex={-1} autoComplete="off" name="honeyWebsite" aria-hidden="true" />
      <input type="hidden" name="ideaSummary" value={prefill.context} />
      <input type="hidden" name="aiowBuildScope" value={prefill.context} />
      {prefill.context ? (
        <div className={styles.aiGuide}>
          <div className={styles.aiAvatar}>AI</div>
          <div>
            <strong>Context uit de AIOW-header meegenomen.</strong>
            <p>{prefill.context}</p>
          </div>
        </div>
      ) : null}
      <Section eyebrow="01" title="Klantaccount">
        <Field label="Bedrijfsnaam" name="companyName" required placeholder="Bijv. Acme BV" />
        <Field label="Juridische naam" name="legalName" required placeholder="Volledige contractpartij" />
        <Field label="Contactnaam" name="contactName" required placeholder="Naam" />
        <Field label="Contact e-mail" name="contactEmail" type="email" required placeholder="naam@bedrijf.nl" />
        <Field label="Telefoon" name="contactPhone" placeholder="+31..." />
        <Field label="Onboarding ID" name="onboardingId" placeholder="Optioneel, indien al ontvangen" />
      </Section>

      <Section eyebrow="02" title="Projectbasis">
        <Field label="Projectnaam" name="projectName" required placeholder="Bijv. AIOW Sales Agent" defaultValue={prefill.projectName} />
        <Select label="Projecttype" name="projectType" required options={PROJECT_TYPES} defaultValue={prefill.projectType} />
        <Checklist title="Modules" items={MODULE_OPTIONS} selected={moduleInterests} onChange={setModuleInterests} />
        <Checklist title="Add-ons" items={ADD_ON_OPTIONS} selected={addOns} onChange={setAddOns} optional />
      </Section>

      <label className="flex gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-cyan-50/90">
        <input type="checkbox" name="emailFollowupConsent" required className="mt-1 size-4 accent-cyan-300" />
        <span>
          AIOW mag mijn e-mail en intakecontext gebruiken om mijn aanvraag persoonlijk op te volgen, inclusief een volgende-dag AI-schets met mogelijke workflows en vervolgstappen. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.
        </span>
      </label>

      <label className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-50/90">
        <input type="checkbox" name="accountTermsAccepted" required className="mt-1 size-4 accent-cyan-300" />
        <span>
          Ik begrijp dat dit een intake-account is. Productie, live betalingen, provider billing en betaalde modules blijven uit tot AIOW scope, tekenbevoegdheid en klantvoorwaarden heeft afgerond.
        </span>
      </label>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm text-white/50">
          AIOW maakt hiermee een veilige klantomgeving aan met account-ID + toegangscode. Geen wachtwoorden of externe auth-provider in deze preview.
        </p>
        <button type="submit" disabled={submitState.status === "submitting"} className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
          {submitState.status === "submitting" ? "Account maken..." : "Klantaccount aanmaken"}
        </button>
      </div>

      {submitState.status === "success" && (
        <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.08] p-4 text-sm text-emerald-50">
          <strong>Account aangemaakt.</strong>
          <div className="mt-3 grid gap-2 rounded-xl bg-black/25 p-3 font-mono text-xs text-emerald-100">
            <span>Account ID: {submitState.accountId}</span>
            <span>Toegangscode: {submitState.accessCode}</span>
            <a className="text-cyan-200 underline" href={submitState.portalUrl}>Open klantportaal</a>
          </div>
          <p className="mt-3">{submitState.message}</p>
        </div>
      )}
      {submitState.status === "error" && <div className="rounded-2xl border border-red-300/25 bg-red-300/[0.08] p-4 text-sm text-red-50"><strong>Niet aangemaakt:</strong> {submitState.message}</div>}
    </form>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="grid gap-4 border-b border-white/10 pb-6 last:border-b-0 last:pb-0"><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h2></div><div className="grid gap-4 md:grid-cols-2">{children}</div></section>;
}

function Field({ label, name, required, type = "text", placeholder, defaultValue }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string; defaultValue?: string }) {
  return <label><span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">{label}{required ? " *" : ""}</span><input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60" /></label>;
}

function Select({ label, name, required, options, defaultValue = "" }: { label: string; name: string; required?: boolean; options: string[]; defaultValue?: string }) {
  return <label><span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">{label}{required ? " *" : ""}</span><select name={name} required={required} defaultValue={defaultValue} className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"><option value="" disabled>Kies...</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Checklist({ title, items, selected, onChange, optional }: { title: string; items: string[]; selected: string[]; onChange: (next: string[]) => void; optional?: boolean }) {
  return <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4"><legend className="px-1 text-xs uppercase tracking-[0.18em] text-white/45">{title}{optional ? "" : " *"}</legend><div className="mt-2 grid gap-2">{items.map((item) => <label key={item} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-white/75 transition hover:bg-white/[0.04]"><input type="checkbox" checked={selected.includes(item)} onChange={(event) => onChange(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} className="size-4 accent-cyan-300" />{item}</label>)}</div></fieldset>;
}
