import { NextResponse } from "next/server";
import { findAiowCustomerAccount } from "@/lib/aiow-customer-accounts";
import { buildVentureCanvasSnapshot, buildVentureDealCard, captureVentureMemoryEvent, listVentureMemoryEvents } from "@/lib/aiow-venture-memory";
import { generateSpunkyWorkspaceQuestion, isWorkspaceCardTitle } from "@/lib/aiow-spunky-workspace-question";

type WorkspaceCardPayload = {
  accountId?: unknown;
  accessCode?: unknown;
  cardTitle?: unknown;
  cardStatus?: unknown;
  prompt?: unknown;
  answer?: unknown;
};


export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as WorkspaceCardPayload;
    const accountId = clamp(asText(payload.accountId), 160);
    const accessCode = clamp(asText(payload.accessCode), 80);
    const cardTitle = clamp(asText(payload.cardTitle), 80);
    const cardStatus = clamp(asText(payload.cardStatus), 80);
    const prompt = clamp(asText(payload.prompt), 700);
    const answer = clamp(asText(payload.answer), 2400);

    if (!accountId || !accessCode) return NextResponse.json({ error: "Account ID and access code required" }, { status: 400 });
    if (!isWorkspaceCardTitle(cardTitle)) return NextResponse.json({ error: "Unsupported workspace card" }, { status: 400 });
    if (answer.length < 12) return NextResponse.json({ error: "Geef iets meer context zodat Spunky er echt iets mee kan." }, { status: 400 });

    const account = await findAiowCustomerAccount(accountId, accessCode);
    if (!account) return NextResponse.json({ error: "Account not found or invalid access code" }, { status: 404 });

    const sessionId = account.onboardingId || account.accountId;
    const content = [
      `Workspace card: ${cardTitle}`,
      `Status before answer: ${cardStatus || "unknown"}`,
      prompt ? `Spunky follow-up question: ${prompt}` : "Spunky follow-up question: none",
      "Customer answer:",
      answer,
    ].join("\n");

    const memory = await captureVentureMemoryEvent({
      sessionId,
      role: "user",
      type: "message",
      content,
      personEmail: account.contactEmail,
      personName: account.contactName,
      company: account.companyName,
      consentAccepted: true,
      metadata: {
        source: "customer_workspace_card",
        accountId: account.accountId,
        cardTitle,
        cardStatus,
        prompt,
      },
    });

    const canvas = await buildVentureCanvasSnapshot(sessionId);
    const dealCard = await buildVentureDealCard(sessionId, canvas as unknown as Record<string, unknown>);
    const events = await listVentureMemoryEvents(sessionId, 200);
    const suggestion = generateSpunkyWorkspaceQuestion({ account, cardTitle, events, dealCard, canvas });

    return NextResponse.json({
      ok: true,
      accountId: account.accountId,
      memorySessionId: sessionId,
      memoryEventId: memory.id,
      cardTitle,
      nextQuestion: suggestion.question,
      suggestion,
      cardState: "info_received",
      canvas,
      dealCard,
      message: `Extra context opgeslagen. Spunky heeft automatisch de volgende beste vraag bepaald: ${suggestion.expectedImpact}`,
    });
  } catch (error) {
    console.error("[customer-workspace-card] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
