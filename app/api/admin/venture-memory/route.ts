import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { aiowDurableStoreMode, supabaseSelect } from "@/lib/aiow-durable-store";
import { getPublicAiowCustomerAccountById } from "@/lib/aiow-customer-accounts";
import { buildVentureCanvasSnapshot, captureVentureMemoryEvent, listVentureMemoryEvents } from "@/lib/aiow-venture-memory";
import { generateSpunkyWorkspaceQuestion, isWorkspaceCardTitle, workspaceCardTitles as canonicalWorkspaceCardTitles } from "@/lib/aiow-spunky-workspace-question";

type LeadRow = {
  id: string;
  created_at: string;
  email: string;
  name?: string;
  company?: string;
  source_component?: string;
  intent_type?: string;
  status?: string;
  metadata?: Record<string, unknown>;
};

type DealCardRow = {
  id: string;
  session_id: string;
  title: string;
  founder?: string;
  company?: string;
  problem?: string;
  likely_route?: string;
  confidence?: number;
  created_at: string;
  payload?: Record<string, unknown>;
};

type AdminEventRow = {
  id: string;
  event_type: string;
  subject_type: string;
  subject_id?: string;
  event_payload?: Record<string, unknown>;
  created_at: string;
};

type WorkspaceCardSummary = {
  title: string;
  status: "answered" | "requested" | "missing";
  lastAnsweredAt?: string;
  lastRequestedAt?: string;
  prompt?: string;
  answer?: string;
  requestedQuestion?: string;
  nextAction: string;
  owner: string;
};

type AdminWorkspaceQuestionPayload = {
  adminEmail?: unknown;
  adminToken?: unknown;
  accountId?: unknown;
  cardTitle?: unknown;
  question?: unknown;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = assertAiowAdmin(
      url.searchParams.get("adminEmail") || req.headers.get("x-aiow-admin-email") || "",
      url.searchParams.get("adminToken") || req.headers.get("x-aiow-admin-token") || "",
    );
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 20));
    const accountId = clamp(url.searchParams.get("accountId") || "", 160);
    const directSessionId = clamp(url.searchParams.get("sessionId") || "", 160);
    const storageMode = aiowDurableStoreMode();

    if (accountId || directSessionId) {
      const account = accountId ? await getPublicAiowCustomerAccountById(accountId) : null;
      if (accountId && !account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
      const sessionId = directSessionId || account?.onboardingId || account?.accountId || "";
      if (!sessionId) {
        return NextResponse.json({
          ok: true,
          admin,
          storageMode,
          account,
          memorySessionId: "",
          canvas: null,
          dealCard: null,
          events: [],
          message: "Geen Venture Memory session gekoppeld aan dit account.",
        });
      }

      const events = await listVentureMemoryEvents(sessionId, 160);
      const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas;
      const canvas = await buildVentureCanvasSnapshot(sessionId, latestCanvas);
      const dealCardEvent = [...events].reverse().find((event) => event.type === "deal_card");
      const dealCard = parseJson(dealCardEvent?.content);
      const workspaceSummary = buildWorkspaceCardSummary(events);
      return NextResponse.json({
        ok: true,
        admin,
        storageMode,
        account,
        memorySessionId: sessionId,
        canvas,
        ventureSnapshot: canvas,
        dealCard,
        workspaceSummary,
        workspaceCompleteness: workspaceSummary.length ? Math.round((workspaceSummary.filter((card) => card.status === "answered").length / workspaceSummary.length) * 100) : 0,
        events: events.slice(-40).map((event) => ({
          id: event.id,
          role: event.role,
          type: event.type,
          content: event.content,
          createdAt: event.createdAt,
          retention: event.retention,
          hasCanvas: Boolean(event.canvas),
        })),
      });
    }

    if (storageMode === "supabase") {
      const [leads, dealCards, adminEvents] = await Promise.all([
        supabaseSelect<LeadRow>("aiow_leads", `order=created_at.desc&limit=${limit}`),
        supabaseSelect<DealCardRow>("aiow_deal_cards", `order=created_at.desc&limit=${limit}`),
        supabaseSelect<AdminEventRow>("aiow_admin_events", `order=created_at.desc&limit=${limit}`),
      ]);
      return NextResponse.json({
        ok: true,
        admin,
        storageMode,
        leads: leads || [],
        dealCards: dealCards || [],
        adminEvents: adminEvents || [],
      });
    }

    const memoryEvents = await listVentureMemoryEvents(undefined, limit);
    return NextResponse.json({ ok: true, admin, storageMode, leads: [], dealCards: [], adminEvents: [], memoryEvents });
  } catch (error) {
    console.error("[admin/venture-memory] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as AdminWorkspaceQuestionPayload;
    const adminEmail = asText(payload.adminEmail);
    const adminToken = asText(payload.adminToken);
    const admin = assertAiowAdmin(adminEmail, adminToken);
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const accountId = clamp(asText(payload.accountId), 160);
    const cardTitle = clamp(asText(payload.cardTitle), 80);
    const account = accountId ? await getPublicAiowCustomerAccountById(accountId) : null;
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (!isWorkspaceCardTitle(cardTitle)) return NextResponse.json({ error: "Unsupported workspace card" }, { status: 400 });

    const sessionId = account.onboardingId || account.accountId;
    const events = await listVentureMemoryEvents(sessionId, 200);
    const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas;
    const canvas = await buildVentureCanvasSnapshot(sessionId, latestCanvas);
    const dealCardEvent = [...events].reverse().find((event) => event.type === "deal_card");
    const dealCard = parseJson(dealCardEvent?.content) as any;
    const suggestion = generateSpunkyWorkspaceQuestion({ account, cardTitle, events, dealCard, canvas });
    const question = clamp(asText(payload.question), 700) || suggestion.question;

    const memory = await captureVentureMemoryEvent({
      sessionId,
      role: "system",
      type: "message",
      content: [
        `Admin workspace question: ${cardTitle}`,
        `Asked by: ${admin.email}`,
        "Question:",
        question,
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
        adminEmail: admin.email,
        nextCardState: suggestion.nextCardState,
        automationLevel: suggestion.automationLevel,
      },
    });

    return NextResponse.json({
      ok: true,
      accountId: account.accountId,
      memorySessionId: sessionId,
      cardTitle,
      question,
      suggestion: { ...suggestion, question },
      memoryEventId: memory.id,
      message: "Spunky heeft de beste vervolgvraag klaargezet in het klantportaal. Dit verrijkt alleen Venture Memory en start geen scopewijziging, contract of livegang.",
    });
  } catch (error) {
    console.error("[admin/venture-memory] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


function buildWorkspaceCardSummary(events: Awaited<ReturnType<typeof listVentureMemoryEvents>>): WorkspaceCardSummary[] {
  const titles = workspaceCardTitles();
  const answerByTitle = new Map<string, { createdAt: string; prompt: string; answer: string }>();
  const requestByTitle = new Map<string, { createdAt: string; question: string }>();

  for (const event of events) {
    if (event.content.includes("Workspace card:")) {
      const title = extractLineValue(event.content, "Workspace card");
      if (!titles.includes(title)) continue;
      answerByTitle.set(title, {
        createdAt: event.createdAt,
        prompt: extractLineValue(event.content, "Spunky follow-up question"),
        answer: extractAnswer(event.content),
      });
    }
    if (event.content.includes("Admin workspace question:")) {
      const title = extractLineValue(event.content, "Admin workspace question");
      if (!titles.includes(title)) continue;
      requestByTitle.set(title, {
        createdAt: event.createdAt,
        question: extractQuestion(event.content),
      });
    }
  }

  return titles.map((title) => {
    const latestAnswer = answerByTitle.get(title);
    const latestRequest = requestByTitle.get(title);
    const requestIsOpen = latestRequest && (!latestAnswer || latestRequest.createdAt.localeCompare(latestAnswer.createdAt) > 0);
    if (requestIsOpen) {
      return {
        title,
        status: "requested",
        lastRequestedAt: latestRequest.createdAt,
        requestedQuestion: latestRequest.question,
        owner: "Klant + Spunky",
        nextAction: "Wacht op klantantwoord in portal",
      } satisfies WorkspaceCardSummary;
    }
    if (latestAnswer) {
      return {
        title,
        status: "answered",
        lastAnsweredAt: latestAnswer.createdAt,
        lastRequestedAt: latestRequest?.createdAt,
        prompt: latestAnswer.prompt,
        answer: latestAnswer.answer,
        requestedQuestion: latestRequest?.question,
        owner: "Team Richard",
        nextAction: title === "AIOW reactie" ? "Reageer op klantvoorkeur in review" : "Neem klantinput mee in Deal Card review",
      } satisfies WorkspaceCardSummary;
    }
    return {
      title,
      status: "missing",
      owner: title === "Spunky projectruimte" ? "Na signing" : "Klant + Spunky",
      nextAction: missingWorkspaceAction(title),
    } satisfies WorkspaceCardSummary;
  });
}


function workspaceCardTitles(): string[] {
  return canonicalWorkspaceCardTitles();
}

function missingWorkspaceAction(title: string): string {
  if (title === "Deal Card") return "Vraag klant om bewijs, KPI of concrete klantvraag";
  if (title === "Scope en risico") return "Vraag klant om data, systemen, privacygrenzen en beslisser";
  if (title === "AIOW reactie") return "Vraag klant waarop Team Richard moet reageren";
  if (title === "Spunky projectruimte") return "Laat workflow, KPI en toegang alvast voorbereiden";
  return "Vraag aanvullende context";
}

function extractLineValue(content: string, label: string): string {
  const line = content.split("\n").find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim().slice(0, 700) : "";
}

function extractAnswer(content: string): string {
  const marker = "Customer answer:";
  const index = content.indexOf(marker);
  if (index === -1) return "";
  return content.slice(index + marker.length).trim().slice(0, 1200);
}

function extractQuestion(content: string): string {
  const marker = "Question:";
  const index = content.indexOf(marker);
  if (index === -1) return "";
  return content.slice(index + marker.length).trim().slice(0, 700);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function parseJson(value?: string): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
