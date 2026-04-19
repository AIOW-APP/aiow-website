/**
 * Analytics — dual-stack: Plausible (privacy) + PostHog (depth).
 *
 * Env:
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN    e.g. "aiow.ai"
 *   NEXT_PUBLIC_PLAUSIBLE_HOST      default "https://plausible.io" (or self-host)
 *   NEXT_PUBLIC_POSTHOG_KEY         PostHog project API key
 *   NEXT_PUBLIC_POSTHOG_HOST        default "https://eu.posthog.com"
 */

export interface AnalyticsEnv {
  plausibleDomain?: string;
  plausibleHost?: string;
  posthogKey?: string;
  posthogHost?: string;
}

export function getEnv(): AnalyticsEnv {
  if (typeof process === "undefined") return {};
  return {
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    plausibleHost: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io",
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com",
  };
}

// Track custom event through both systems when available
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Plausible
  const plausible = (window as { plausible?: (e: string, o?: { props?: Record<string, unknown> }) => void }).plausible;
  if (plausible) {
    try { plausible(event, props ? { props } : undefined); } catch {}
  }
  // PostHog
  const ph = (window as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
  if (ph) {
    try { ph.capture(event, props); } catch {}
  }
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const ph = (window as { posthog?: { identify: (id: string, t?: Record<string, unknown>) => void } }).posthog;
  if (ph) {
    try { ph.identify(userId, traits); } catch {}
  }
}
