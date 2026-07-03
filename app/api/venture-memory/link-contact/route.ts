import { NextResponse } from "next/server";
import { buildVentureCanvasSnapshot, buildVentureDealCard, captureVentureMemoryEvent, normalizeEmail } from "@/lib/aiow-venture-memory";
import { aiowDurableStoreMode } from "@/lib/aiow-durable-store";
import { captureAiowLead, validLeadEmail, type AiowLeadCaptureInput } from "@/lib/aiow-lead-capture";
import { createAiowCustomerAccount } from "@/lib/aiow-customer-accounts";

type LinkContactPayload = {
  sessionId?: unknown;
  name?: unknown;
  email?: unknown;
  company?: unknown;
  consentAccepted?: unknown;
  consentText?: unknown;
  consentVersion?: unknown;
  transcript?: unknown;
  canvas?: unknown;
};

const DEFAULT_CONSENT_TEXT =
  "AIOW mag deze Venture Memory koppelen aan mijn account en mij persoonlijk e-mailen over deze kans. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as LinkContactPayload;
    const sessionId = clamp(asText(payload.sessionId), 160);
    const name = clamp(asText(payload.name), 160);
    const email = normalizeEmail(asText(payload.email));
    const company = clamp(asText(payload.company), 180);
    const consentAccepted = payload.consentAccepted === true;
    const consentText = clamp(asText(payload.consentText), 700) || DEFAULT_CONSENT_TEXT;
    const consentVersion = clamp(asText(payload.consentVersion), 80) || "aiow-venture-memory-v1";
    const transcript = clamp(asText(payload.transcript), 5000);
    const canvas = isRecord(payload.canvas) ? payload.canvas : undefined;

    const missing: string[] = [];
    if (!sessionId) missing.push("sessionId");
    if (!name) missing.push("name");
    if (!email || !validLeadEmail(email)) missing.push("validEmail");
    if (!consentAccepted) missing.push("consentAccepted");
    if (missing.length) return NextResponse.json({ error: "Incomplete venture memory link", missing }, { status: 400 });

    await captureVentureMemoryEvent({
      sessionId,
      role: "system",
      type: "contact_linked",
      content: "Visitor explicitly allowed AIOW to link this temporary Venture Memory to contact details and personal follow-up.",
      personEmail: email,
      personName: name,
      company,
      consentAccepted: true,
      canvas,
      metadata: { consentText, consentVersion },
    });

    const dealCard = await buildVentureDealCard(sessionId, canvas);
    const canvasSnapshot = await buildVentureCanvasSnapshot(sessionId, canvas);

    const leadInput: AiowLeadCaptureInput = {
      email,
      consentAccepted: true,
      consentText,
      consentVersion,
      source: "aiow.ai",
      sourceRoute: "/",
      sourceComponent: "aiow-venture-memory-contact-link",
      locale: "nl",
      name,
      company,
      intentType: "account",
      intentText: transcript || dealCard.problem,
      projectType: dealCard.likelyRoute,
      moduleInterests: ["Venture Memory", "Deal Card", "AI follow-up"],
      addOns: [],
      metadata: {
        ventureSessionId: sessionId,
        dealCard,
        retention: "account_linked",
      },
    };

    const leadCapture = await captureAiowLead(leadInput, "LOCAL_CAPTURED");
    const workspace = await createAiowCustomerAccount({
      companyName: company || name,
      legalName: company || name,
      contactName: name,
      contactEmail: email,
      projectName: dealCard.title,
      projectType: dealCard.likelyRoute,
      moduleInterests: ["Venture Memory", "Deal Card", "AI follow-up"],
      addOns: ["Private workspace"],
      ideaSummary: transcript || dealCard.problem,
      coreOffer: dealCard.opportunity,
      painPoints: dealCard.problem,
      aiowBuildScope: dealCard.nextStep,
      risks: dealCard.missing.join(", "),
      budgetRange: dealCard.missing.includes("budgetindicatie") ? "Nog onbekend" : "In gesprek genoemd",
      onboardingId: sessionId,
    });
    const portalUrl = `/portal/customer/${workspace.account.accountId}`;

    return NextResponse.json({
      ok: true,
      memorySessionId: sessionId,
      leadId: leadCapture.id,
      storageMode: aiowDurableStoreMode(),
      leadCapturePath: leadCapture.path,
      followUp: leadCapture.record.followUp,
      dealCard,
      canvas: canvasSnapshot,
      ventureSnapshot: canvasSnapshot,
      workspace: {
        accountId: workspace.account.accountId,
        accessCode: workspace.accessCode,
        portalUrl,
        status: workspace.account.status,
        previewLogin: true,
      },
      privacy: {
        retention: "account_linked",
        deletion: "Op verzoek verwijdert AIOW tijdelijke Venture Memory wanneer er geen samenwerking ontstaat.",
      },
      message: "Venture Memory gekoppeld. Je private AIOW workspace is klaar als preview login-link. Geen productie of contract is gestart.",
    });
  } catch (error) {
    console.error("[venture-memory/link-contact] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
