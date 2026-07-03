import { randomUUID } from "node:crypto";
import { mkdir, appendFile, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { aiowDurableStoreMode, supabaseInsert, supabaseSelect } from "./aiow-durable-store";

export type VentureMemoryRole = "user" | "ai" | "system";
export type VentureMemoryEventType = "message" | "canvas_update" | "contact_linked" | "deal_card" | "upload" | "decision";

export type VentureMemoryEventInput = {
  sessionId: string;
  role: VentureMemoryRole;
  type: VentureMemoryEventType;
  content: string;
  personEmail?: string;
  personName?: string;
  company?: string;
  consentAccepted?: boolean;
  canvas?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type VentureMemoryEvent = VentureMemoryEventInput & {
  id: string;
  createdAt: string;
  retention: "temporary_pre_account" | "account_linked";
  privacyNote: string;
};


export type VentureCanvasSnapshot = {
  project: string;
  founder: string;
  problem: string;
  solution: string;
  businessModel: string;
  audience: string;
  aiOpportunities: string;
  risk: string;
  automation: string;
  growth: string;
  collaboration: string;
  confidence: number;
  marketScore: number;
  riskScore: number;
  aiScore: number;
  automationScore: number;
  lastUpdatedAt: string;
  memoryEventCount: number;
};

export async function buildVentureCanvasSnapshot(sessionId: string, incomingCanvas?: Record<string, unknown>): Promise<VentureCanvasSnapshot> {
  const events = await listVentureMemoryEvents(sessionId, 300);
  const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas || {};
  const canvas = { ...latestCanvas, ...(incomingCanvas || {}) };
  const userMessages = events.filter((event) => event.role === "user" && event.type === "message").map((event) => event.content);
  const combined = userMessages.join("\n").toLowerCase();
  const linked = [...events].reverse().find((event) => event.type === "contact_linked" || Boolean(event.personEmail));
  const confidence = Math.round(Math.min(95, Math.max(
    Number(canvas.confidence || 0) || 0,
    10 + userMessages.length * 9 + Math.min(30, combined.length / 35) + signalBoost(combined),
  )));

  return {
    project: asCanvasText(canvas, "project") || inferTitle(combined) || "Nog niet ingevuld",
    founder: linked?.personName || asCanvasText(canvas, "founder") || "Nog niet ingevuld",
    problem: asCanvasText(canvas, "problem") || inferProblem(combined),
    solution: asCanvasText(canvas, "solution") || inferSolution(combined),
    businessModel: asCanvasText(canvas, "businessModel") || inferBusinessModel(combined),
    audience: asCanvasText(canvas, "audience") || inferAudience(combined),
    aiOpportunities: asCanvasText(canvas, "aiOpportunities") || inferOpportunity(combined),
    risk: asCanvasText(canvas, "risk") || inferRisk(combined, confidence),
    automation: asCanvasText(canvas, "automation") || inferAutomation(combined),
    growth: asCanvasText(canvas, "growth") || inferGrowth(combined),
    collaboration: asCanvasText(canvas, "collaboration") || inferCollaboration(confidence, Boolean(linked?.personEmail)),
    confidence,
    marketScore: numberScore(canvas.marketScore, combined, ["markt", "niche", "doelgroep", "concurrent", "makelaar", "b2b"]),
    riskScore: numberScore(canvas.riskScore, combined, ["risico", "legal", "privacy", "budget", "bewijs", "scope"]),
    aiScore: numberScore(canvas.aiScore, combined, ["ai", "agent", "automatis", "data", "crm", "mail", "opvolg"]),
    automationScore: numberScore(canvas.automationScore, combined, ["proces", "workflow", "planning", "administratie", "support", "handwerk"]),
    lastUpdatedAt: [...events].reverse()[0]?.createdAt || new Date().toISOString(),
    memoryEventCount: events.length,
  };
}

export type VentureDealCard = {
  sessionId: string;
  title: string;
  founder: string;
  company: string;
  problem: string;
  opportunity: string;
  likelyRoute: string;
  missing: string[];
  nextStep: string;
  confidence: number;
  memoryEventCount: number;
  updatedAt: string;
};

const PRIVACY_NOTE =
  "Temporary Venture Memory is used to keep the intake logical and personal. It is linked to an account only after explicit consent and can be deleted when no collaboration starts or on request.";

export async function captureVentureMemoryEvent(input: VentureMemoryEventInput): Promise<{ id: string; path: string; event: VentureMemoryEvent }> {
  const now = new Date().toISOString();
  const event: VentureMemoryEvent = {
    ...input,
    id: `aiow_vm_${randomUUID()}`,
    createdAt: now,
    retention: input.personEmail && input.consentAccepted ? "account_linked" : "temporary_pre_account",
    privacyNote: PRIVACY_NOTE,
    content: clamp(input.content, 4000),
    sessionId: clamp(input.sessionId, 160),
    personEmail: normalizeEmail(input.personEmail),
    personName: clamp(input.personName || "", 160),
    company: clamp(input.company || "", 180),
  };

  if (aiowDurableStoreMode() === "supabase") {
    try {
      await supabaseInsert("aiow_venture_memory_events", toSupabaseEvent(event));
      return { id: event.id, path: "supabase:aiow_venture_memory_events", event };
    } catch (error) {
      console.warn("[aiow-venture-memory] Supabase unavailable, falling back to JSONL", error);
    }
  }

  const filePath = ventureMemoryStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
  return { id: event.id, path: filePath, event };
}

export async function listVentureMemoryEvents(sessionId?: string, limit = 200): Promise<VentureMemoryEvent[]> {
  const safeLimit = Math.max(1, Math.min(1000, limit));

  if (aiowDurableStoreMode() === "supabase") {
    try {
      const query = sessionId
        ? `session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.desc&limit=${safeLimit}`
        : `order=created_at.desc&limit=${safeLimit}`;
      const rows = await supabaseSelect<SupabaseVentureMemoryEventRow>("aiow_venture_memory_events", query);
      if (rows) return rows.map(fromSupabaseEvent).reverse();
    } catch (error) {
      console.warn("[aiow-venture-memory] Supabase select unavailable, falling back to JSONL", error);
    }
  }

  try {
    const raw = await readFile(ventureMemoryStorePath(), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VentureMemoryEvent)
      .filter((event) => !sessionId || event.sessionId === sessionId)
      .slice(-safeLimit);
  } catch {
    return [];
  }
}

export async function buildVentureDealCard(sessionId: string, canvas?: Record<string, unknown>): Promise<VentureDealCard> {
  const events = await listVentureMemoryEvents(sessionId, 300);
  const userMessages = events.filter((event) => event.role === "user" && event.type === "message").map((event) => event.content);
  const linked = [...events].reverse().find((event) => event.type === "contact_linked" || Boolean(event.personEmail));
  const combined = userMessages.join("\n").toLowerCase();
  const title = asCanvasText(canvas, "project") || inferTitle(combined) || "Nieuwe AIOW venture intake";
  const problem = asCanvasText(canvas, "problem") || inferProblem(combined);
  const opportunity = asCanvasText(canvas, "aiOpportunities") || inferOpportunity(combined);
  const confidence = Number(canvas?.confidence || 0) || Math.min(82, 18 + userMessages.join(" ").length / 18);

  const card: VentureDealCard = {
    sessionId,
    title,
    founder: linked?.personName || asCanvasText(canvas, "founder") || "Nog onbekend",
    company: linked?.company || "Nog onbekend",
    problem,
    opportunity,
    likelyRoute: confidence >= 72 ? "Proof Sprint of Growth Partner review" : confidence >= 44 ? "Paid Venture Scan" : "Korte kwalificatie nodig",
    missing: missingFields({ combined, linked, canvas }),
    nextStep: linked?.personEmail ? "Team Richard kan deze Deal Card reviewen." : "Vraag naam, e-mail en expliciete follow-up toestemming na maximaal drie inhoudelijke berichten.",
    confidence: Math.round(Math.min(95, Math.max(0, confidence))),
    memoryEventCount: events.length,
    updatedAt: new Date().toISOString(),
  };

  await captureVentureMemoryEvent({
    sessionId,
    role: "system",
    type: "deal_card",
    content: JSON.stringify(card),
    personEmail: linked?.personEmail,
    personName: linked?.personName,
    company: linked?.company,
    consentAccepted: linked?.consentAccepted,
    canvas,
  });

  if (aiowDurableStoreMode() === "supabase") {
    try {
      await supabaseInsert("aiow_deal_cards", {
        session_id: card.sessionId,
        lead_id: null,
        title: card.title,
        founder: card.founder,
        company: card.company,
        problem: card.problem,
        opportunity: card.opportunity,
        likely_route: card.likelyRoute,
        missing: card.missing,
        next_step: card.nextStep,
        confidence: card.confidence,
        payload: card,
        created_at: card.updatedAt,
        updated_at: card.updatedAt,
      });
      await supabaseInsert("aiow_admin_events", {
        event_type: "deal_card_created",
        subject_type: "venture_session",
        subject_id: card.sessionId,
        event_payload: { title: card.title, company: card.company, confidence: card.confidence, missing: card.missing },
        created_at: card.updatedAt,
      });
    } catch (error) {
      console.warn("[aiow-venture-memory] Supabase deal card/admin event insert failed", error);
    }
  }

  return card;
}

export 
function signalBoost(text: string): number {
  let boost = 0;
  if (includesAny(text, ["lead", "sales", "crm", "offerte", "opvolg"])) boost += 12;
  if (includesAny(text, ["startup", "idee", "app", "platform", "product"])) boost += 8;
  if (includesAny(text, ["bedrijf", "omzet", "klanten", "b2b", "mkb"])) boost += 8;
  if (includesAny(text, ["budget", "website", "tractie", "doelgroep", "markt"])) boost += 10;
  return boost;
}

function numberScore(value: unknown, text: string, terms: string[]): number {
  const current = Number(value || 0) || 0;
  const hits = terms.filter((term) => text.includes(term)).length;
  return Math.min(10, Math.max(current, hits ? 4 + hits * 2 : text.length > 120 ? 3 : 0));
}

function inferSolution(text: string): string {
  if (includesAny(text, ["lead", "sales", "crm", "offerte", "opvolg"])) return "AI lead intake, scoring en persoonlijke opvolging";
  if (includesAny(text, ["planning", "administratie", "support", "proces", "workflow"])) return "AI workflowlaag met menselijke controle";
  if (includesAny(text, ["startup", "idee", "app", "platform"])) return "MVP en validatiepad moeten nog scherp worden";
  return "Nog niet ingevuld";
}

function inferBusinessModel(text: string): string {
  if (includesAny(text, ["revenue share", "revenue", "equity", "participatie"])) return "Upside model alleen na scope, bewijs en afspraak";
  if (includesAny(text, ["omzet", "klanten", "bedrijf", "b2b"])) return "Bestaande omzet plus digitale groeilaag";
  if (includesAny(text, ["startup", "idee", "app", "platform"])) return "Te valideren venture model";
  return "Nog niet ingevuld";
}

function inferAudience(text: string): string {
  if (text.includes("makelaar")) return "Makelaars en vastgoedteams";
  if (text.includes("installatie")) return "Installatiebedrijven";
  if (text.includes("logistiek")) return "Logistiek en operatie";
  if (text.includes("zorg")) return "Zorgorganisaties";
  if (text.includes("agency")) return "Agencies en consultants";
  if (includesAny(text, ["b2b", "mkb", "bedrijf"])) return "B2B markt";
  return "Nog niet ingevuld";
}

function inferRisk(text: string, confidence: number): string {
  if (confidence < 35) return "Nog te weinig context voor serieuze beoordeling";
  if (!includesAny(text, ["budget", "tractie", "website", "bewijs"])) return "Bewijs, budget en scope nog toetsen";
  return "Eerste risico's zichtbaar, review door Team AIOW nodig";
}

function inferAutomation(text: string): string {
  if (includesAny(text, ["planning", "administratie", "support", "mail", "crm", "proces", "workflow", "handwerk"])) return "Hoge automatiseringskans";
  if (includesAny(text, ["lead", "offerte", "opvolg"])) return "Leadflow kan grotendeels worden geautomatiseerd";
  return "Nog niet ingevuld";
}

function inferGrowth(text: string): string {
  if (includesAny(text, ["lead", "sales", "marketing", "websitebezoeker", "retentie"])) return "Groei via intake, opvolging en conversieverbetering";
  if (includesAny(text, ["startup", "markt", "doelgroep", "tractie"])) return "Validatie en distributie zijn de eerste groeivragen";
  return "Nog niet ingevuld";
}

function inferCollaboration(confidence: number, linked: boolean): string {
  if (linked && confidence >= 70) return "Klaar voor Team AIOW Deal Card review";
  if (confidence >= 70) return "Proof Sprint of Growth Partner review";
  if (confidence >= 45) return "Paid Venture Scan kandidaat";
  return "Nog niet bepaald";
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

export function normalizeEmail(value?: string): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function ventureMemoryStorePath(): string {
  return process.env.AIOW_VENTURE_MEMORY_STORE || path.join(os.tmpdir(), "aiow-customer-onboarding", "venture-memory.jsonl");
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function asCanvasText(canvas: Record<string, unknown> | undefined, key: string): string {
  const value = canvas?.[key];
  return typeof value === "string" && value && value !== "Nog niet ingevuld" && value !== "Nog niet bepaald" ? value : "";
}

function inferTitle(text: string): string {
  if (text.includes("makelaar")) return "AI groeilaag voor makelaars";
  if (text.includes("lead")) return "AI lead intake en opvolging";
  if (text.includes("planning")) return "AI planning en operatie";
  if (text.includes("startup") || text.includes("app")) return "Nieuwe AI venture";
  return "";
}

function inferProblem(text: string): string {
  if (text.includes("lead")) return "Leads en opvolging lekken waarde";
  if (text.includes("planning") || text.includes("administratie")) return "Operationeel werk kost te veel handmatige tijd";
  return "Nog te weinig context voor scherp probleem";
}

function inferOpportunity(text: string): string {
  if (text.includes("mail") || text.includes("opvolg")) return "Persoonlijke opvolging, scoring en CRM-routing";
  if (text.includes("automatis")) return "Workflow-automatisering met menselijke controle";
  return "AI-intake moet eerst de waardehefboom vinden";
}

function missingFields(input: { combined: string; linked?: VentureMemoryEvent; canvas?: Record<string, unknown> }): string[] {
  const missing: string[] = [];
  if (!input.linked?.personName) missing.push("naam");
  if (!input.linked?.personEmail) missing.push("e-mail en toestemming");
  if (!input.combined.includes("budget")) missing.push("budgetindicatie");
  if (!input.combined.includes("website") && !input.combined.includes("url")) missing.push("website of voorbeeldlink");
  if (!asCanvasText(input.canvas, "problem")) missing.push("scherp probleem");
  return missing.slice(0, 5);
}

type SupabaseVentureMemoryEventRow = {
  id: string;
  session_id: string;
  role: VentureMemoryRole;
  event_type: VentureMemoryEventType;
  content: string;
  person_email?: string;
  person_name?: string;
  company?: string;
  consent_accepted?: boolean;
  canvas?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  retention: VentureMemoryEvent["retention"];
  privacy_note: string;
  created_at: string;
};

function toSupabaseEvent(event: VentureMemoryEvent): SupabaseVentureMemoryEventRow {
  return {
    id: event.id,
    session_id: event.sessionId,
    role: event.role,
    event_type: event.type,
    content: event.content,
    person_email: event.personEmail,
    person_name: event.personName,
    company: event.company,
    consent_accepted: event.consentAccepted,
    canvas: event.canvas,
    metadata: event.metadata,
    retention: event.retention,
    privacy_note: event.privacyNote,
    created_at: event.createdAt,
  };
}

function fromSupabaseEvent(row: SupabaseVentureMemoryEventRow): VentureMemoryEvent {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    type: row.event_type,
    content: row.content,
    personEmail: row.person_email || "",
    personName: row.person_name || "",
    company: row.company || "",
    consentAccepted: row.consent_accepted,
    canvas: row.canvas,
    metadata: row.metadata,
    retention: row.retention,
    privacyNote: row.privacy_note,
    createdAt: row.created_at,
  };
}
