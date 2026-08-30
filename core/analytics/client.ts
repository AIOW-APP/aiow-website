export const TRACKABLE_EVENTS = [
  "page_view", "calculator_changed", "context_opened", "quote_opened", "quote_succeeded", "quote_failed",
  "booking_opened", "booking_succeeded", "booking_failed", "scan_cta_clicked", "knowledge_cta_clicked", "experiment_exposed",
] as const;

export type AnalyticsEventName = typeof TRACKABLE_EVENTS[number];
type Locale = "nl" | "en";
type CanonicalRoute = "/" | "/en" | "/booking" | "/en/booking" | "/quote" | "/en/quote" | "/knowledge" | "/en/knowledge" | "/context";
type Experiment = { experimentId: "scan_cta_copy_v1"; variant: "control" | "outcome_summary" } | null;
type FailureClass = "validation" | "rate_limit" | "unavailable" | "conflict";

type EventFields = {
  page_view: Record<string, never>;
  calculator_changed: { segment: "business" | "building" | "home"; serviceRoute: "standard" | "comfort" };
  context_opened: { contextSlug: "accountants" | "care" | "education" | "hospitality" | "retail" | "logistics" | "manufacturing" | "woning" | "bedrijfshal-industrie" };
  quote_opened: Record<string, never>;
  quote_succeeded: { experiment: Experiment };
  quote_failed: { failureClass: FailureClass };
  booking_opened: Record<string, never>;
  booking_succeeded: { experiment: Experiment };
  booking_failed: { failureClass: FailureClass };
  scan_cta_clicked: { experiment: Experiment };
  knowledge_cta_clicked: Record<string, never>;
  experiment_exposed: { experiment: Exclude<Experiment, null> };
};

type Runtime = {
  pathname?: string;
  width?: number;
  now?: () => Date;
  uuid?: () => string;
  fetcher?: (url: string, init: RequestInit & { headers: Record<string, string> }) => Promise<Response>;
};

const ROUTES = new Map<string, readonly [CanonicalRoute, Locale]>([
  ["/", ["/", "nl"]], ["/en", ["/en", "en"]],
  ["/booking", ["/booking", "nl"]], ["/en/booking", ["/en/booking", "en"]],
  ["/quote", ["/quote", "nl"]], ["/en/quote", ["/en/quote", "en"]],
  ["/knowledge", ["/knowledge", "nl"]], ["/en/knowledge", ["/en/knowledge", "en"]],
]);
const CONTEXT_SLUGS = new Set(["accountants", "care", "education", "hospitality", "retail", "logistics", "manufacturing", "woning", "bedrijfshal-industrie"]);
const FAILURES = new Set(["validation", "rate_limit", "unavailable", "conflict"]);
const SEGMENTS = new Set(["business", "building", "home"]);
const SERVICE_ROUTES = new Set(["standard", "comfort"]);
const VARIANTS = new Set(["control", "outcome_summary"]);
const FIELD_KEYS: Record<AnalyticsEventName, readonly string[]> = {
  page_view: [], calculator_changed: ["segment", "serviceRoute"], context_opened: ["contextSlug"], quote_opened: [],
  quote_succeeded: ["experiment"], quote_failed: ["failureClass"], booking_opened: [], booking_succeeded: ["experiment"],
  booking_failed: ["failureClass"], scan_cta_clicked: ["experiment"], knowledge_cta_clicked: [], experiment_exposed: ["experiment"],
};

function routeContext(pathname: string): readonly [CanonicalRoute, Locale] | null {
  const clean = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  const direct = ROUTES.get(clean);
  if (direct) return direct;
  if (/^\/tarieven\/[^/]+$/.test(clean)) return ["/context", "nl"];
  // The frozen contract has no English /context route-locale pair, so fail closed.
  return null;
}

function isClosedObject(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length === keys.length && Object.keys(value).every((key) => keys.includes(key));
}
function validExperiment(value: unknown, nullable: boolean): value is Experiment {
  if (value === null) return nullable;
  return isClosedObject(value, ["experimentId", "variant"])
    && value.experimentId === "scan_cta_copy_v1" && typeof value.variant === "string" && VARIANTS.has(value.variant);
}
function validFields(event: AnalyticsEventName, fields: unknown): fields is EventFields[AnalyticsEventName] {
  if (!isClosedObject(fields, FIELD_KEYS[event])) return false;
  switch (event) {
    case "calculator_changed": return typeof fields.segment === "string" && SEGMENTS.has(fields.segment) && typeof fields.serviceRoute === "string" && SERVICE_ROUTES.has(fields.serviceRoute);
    case "context_opened": return typeof fields.contextSlug === "string" && CONTEXT_SLUGS.has(fields.contextSlug);
    case "quote_failed": case "booking_failed": return typeof fields.failureClass === "string" && FAILURES.has(fields.failureClass);
    case "quote_succeeded": case "booking_succeeded": case "scan_cta_clicked": return validExperiment(fields.experiment, true);
    case "experiment_exposed": return validExperiment(fields.experiment, false);
    default: return true;
  }
}

export function buildAnalyticsEvent<E extends AnalyticsEventName>(event: E, fields: EventFields[E], runtime?: Runtime): Record<string, unknown> | null;
export function buildAnalyticsEvent(event: string, fields?: unknown, runtime?: Runtime): Record<string, unknown> | null;
export function buildAnalyticsEvent(event: string, fields?: unknown, runtime: Runtime = {}): Record<string, unknown> | null {
  if (!(TRACKABLE_EVENTS as readonly string[]).includes(event)) return null;
  const eventName = event as AnalyticsEventName;
  if (!validFields(eventName, fields ?? {})) return null;
  const pathname = runtime.pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const route = routeContext(pathname);
  if (!route) return null;
  const [canonicalRoute, locale] = route;
  if (eventName === "context_opened" && canonicalRoute !== "/context") return null;
  const now = runtime.now ?? (() => new Date());
  const uuid = runtime.uuid ?? (() => crypto.randomUUID());
  const base: Record<string, unknown> = {
    schemaKind: `analytics_${eventName}`, eventId: uuid(), event: eventName, occurredAt: now().toISOString(), route: canonicalRoute, locale,
  };
  if (eventName === "page_view") {
    const width = runtime.width ?? (typeof window !== "undefined" ? window.innerWidth : 1440);
    base.viewport = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
  }
  return { ...base, ...(fields as Record<string, unknown>) };
}

export type TrackResult = { accepted: boolean; sent: boolean; reason: "sent" | "rejected" | "delivery_failed" };
export async function track<E extends AnalyticsEventName>(event: E, fields: EventFields[E], runtime?: Runtime): Promise<TrackResult>;
export async function track(event: string, fields?: unknown, runtime?: Runtime): Promise<TrackResult>;
export async function track(event: string, fields: unknown = {}, runtime: Runtime = {}): Promise<TrackResult> {
  const payload = buildAnalyticsEvent(event, fields, runtime);
  if (!payload) return { accepted: false, sent: false, reason: "rejected" };
  const fetcher = runtime.fetcher ?? (typeof fetch === "function" ? fetch.bind(globalThis) : null);
  if (!fetcher) return { accepted: true, sent: false, reason: "delivery_failed" };
  try {
    const response = await fetcher("/api/events", {
      method: "POST", keepalive: true,
      headers: { "content-type": "application/json", "idempotency-key": String(payload.eventId) },
      body: JSON.stringify(payload),
    });
    return response.ok ? { accepted: true, sent: true, reason: "sent" } : { accepted: true, sent: false, reason: "delivery_failed" };
  } catch {
    return { accepted: true, sent: false, reason: "delivery_failed" };
  }
}
