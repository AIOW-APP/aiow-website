/**
 * Client-side error reporter. Routes errors to console in dev, to Debbie
 * heartbeat/broker in prod (self-hosted), optionally Sentry if configured.
 *
 * Drop-in: call setupErrorReporting() once in layout.tsx or similar.
 *
 * Env:
 *   NEXT_PUBLIC_SENTRY_DSN     — optional; if set, also reports to Sentry
 *   NEXT_PUBLIC_DEBBIE_OPS_URL — Debbie ops endpoint (e.g. https://big-mac.local:8791/ops)
 */

type ErrorPayload = {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  context?: Record<string, unknown>;
};

async function reportToDebbie(payload: ErrorPayload) {
  const url = process.env.NEXT_PUBLIC_DEBBIE_OPS_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // silent — we don't want error reporting to cause more errors
  }
}

async function reportToSentry(payload: ErrorPayload) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === "undefined") return;
  const sentry = (window as { Sentry?: { captureException: (e: unknown, c?: unknown) => void } }).Sentry;
  if (sentry) {
    try {
      const err = new Error(payload.message);
      err.stack = payload.stack;
      sentry.captureException(err, { extra: payload.context });
    } catch {}
  }
}

export function setupErrorReporting() {
  if (typeof window === "undefined") return;

  const report = (payload: Omit<ErrorPayload, "timestamp" | "url" | "userAgent">) => {
    const full: ErrorPayload = {
      ...payload,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ops error]", full);
    }
    reportToDebbie(full);
    reportToSentry(full);
  };

  window.addEventListener("error", (e) => {
    report({ message: e.message, stack: e.error?.stack });
  });

  window.addEventListener("unhandledrejection", (e) => {
    report({
      message: `Unhandled promise rejection: ${e.reason}`,
      stack: e.reason instanceof Error ? e.reason.stack : undefined,
    });
  });
}
