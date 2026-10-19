export const FUNNEL_ANALYTICS_CONTRACT_VERSION = 1 as const;
export const FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION = "diag-v3-public-v1" as const;
export const FUNNEL_ANALYTICS_EVENTS = [
  "diagnostic_started",
  "diagnostic_completed",
  "detailed_report_cta_clicked",
  "identified_request_created",
  "email_verified",
  "detailed_report_first_opened",
] as const;

export type FunnelAnalyticsEvent = typeof FUNNEL_ANALYTICS_EVENTS[number];
export type BrowserFunnelAnalyticsEvent = Extract<FunnelAnalyticsEvent, "diagnostic_started" | "detailed_report_cta_clicked">;

export function isFunnelAnalyticsEvent(value: unknown): value is FunnelAnalyticsEvent {
  return typeof value === "string" && (FUNNEL_ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export function isBrowserFunnelAnalyticsEvent(value: unknown): value is BrowserFunnelAnalyticsEvent {
  return value === "diagnostic_started" || value === "detailed_report_cta_clicked";
}

export function isLoopbackDevelopmentHost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname.toLowerCase());
}

export function utcAnalyticsDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
