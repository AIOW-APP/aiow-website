import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { findAiowCustomerAccount, getPublicAiowCustomerAccountById } from "@/lib/aiow-customer-accounts";
import { buildVentureCanvasSnapshot, buildVentureDealCard, captureVentureMemoryEvent, listVentureMemoryEvents } from "@/lib/aiow-venture-memory";
import { generateSpunkyWorkspaceQuestion, isWorkspaceCardTitle } from "@/lib/aiow-spunky-workspace-question";

type Payload = {
  accountId?: unknown;
  accessCode?: unknown;
  adminEmail?: unknown;
  adminToken?: unknown;
  cardTitle?: unknown;
  persist?: unknown;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Payload;
    const accountId = clamp(asText(payload.accountId), 160);
    const accessCode = clamp(asText(payload.accessCode), 80);
    const adminEmail = asText(payload.adminEmail);
    const adminToken = asText(payload.adminToken);
    const cardTitle = clamp(asText(payload.cardTitle), 80);
    const persist = payload.persist === true;

    if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });
    if (!isWorkspaceCardTitle(cardTitle)) return NextResponse.json({ error: "Unsupported workspace card" }, { status: 400 });

    const admin = adminEmail || adminToken ? assertAiowAdmin(adminEmail, adminToken) : null;
    const account = admin
      ? await getPublicAiowCustomerAccountById(accountId)
      : await findAiowCustomerAccount(accountId, accessCode);

    if (!account) return NextResponse.json({ error: "Account not found or invalid access" }, { status: 404 });
    if (persist && !admin) return NextResponse.json({ error: "Admin required to persist a question" }, { status: 401 });

    const sessionId = account.onboardingId || account.accountId;
    const events = await listVentureMemoryEvents(sessionId, 200);
    const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas;
    const canvas = await buildVentureCanvasSnapshot(sessionId, latestCanvas);
    const dealCard = await buildVentureDealCard(sessionId, canvas as unknown as Record<string, unknown>);
    const suggestion = generateSpunkyWorkspaceQuestion({ account, cardTitle, events, dealCard, canvas });

    let memoryEventId = "";
    if (persist) {
      const memory = await captureVentureMemoryEvent({
        sessionId,
        role: "system",
        type: "message",
        content: [
          `Admin workspace question: ${cardTitle}`,
          `Asked by: ${admin?.email || "admin"}`,
          "Question:",
          suggestion.question,
          "Why:",
          suggestion.whyThisQuestion,
          "Expected impact:",
          suggestion.expectedImpact,
        ].join("\n"),
        personEmail: account.contactEmail,
        personName: account.contactName,
        company: account.companyName,
        consentAccepted: true,
        metadata: {
          source: "spunky_next_best_question",
          accountId: account.accountId,
          cardTitle,
          adminEmail: admin?.email,
          nextCardState: suggestion.nextCardState,
          automationLevel: suggestion.automationLevel,
        },
      });
      memoryEventId = memory.id;
    }

    return NextResponse.json({
      ok: true,
      accountId: account.accountId,
      memorySessionId: sessionId,
      cardTitle,
      suggestion,
      persisted: persist,
      memoryEventId: memoryEventId || null,
      message: persist
        ? "Spunky heeft de beste vervolgvraag klaargezet in het klantportaal. Geen scopewijziging, contract of livegang gestart."
        : "Spunky heeft de beste vervolgvraag gegenereerd op basis van Venture Memory.",
    });
  } catch (error) {
    console.error("[spunky/workspace-question] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
