import { asc } from "drizzle-orm";
import { createDatabase } from "../client.server";
import { diagnosticFunnelAggregate } from "../schema/diagnostic-identification";
import { FUNNEL_ANALYTICS_CONTRACT_VERSION, FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, utcAnalyticsDay } from "../../app/features/diagnostic/funnel-analytics-contract";
import type { BrowserFunnelAnalyticsEvent, FunnelAnalyticsEvent } from "../../app/features/diagnostic/funnel-analytics-contract";

export async function incrementFunnelAnalytics(binding: D1Database, event: FunnelAnalyticsEvent, now = new Date()): Promise<void> {
  await binding.prepare(`INSERT INTO diagnostic_funnel_aggregate (event_day, diagnostic_version, contract_version, event_type, event_count)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(event_day, diagnostic_version, contract_version, event_type)
    DO UPDATE SET event_count = event_count + 1`)
    .bind(utcAnalyticsDay(now), FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, FUNNEL_ANALYTICS_CONTRACT_VERSION, event).run();
}

export async function recordBrowserFunnelAnalytics(binding: D1Database, event: BrowserFunnelAnalyticsEvent, now = new Date()): Promise<void> {
  await incrementFunnelAnalytics(binding, event, now);
}

export async function listFunnelAnalytics(binding: D1Database) {
  const database = createDatabase(binding);
  return database.select({
    date: diagnosticFunnelAggregate.eventDay,
    version: diagnosticFunnelAggregate.diagnosticVersion,
    event: diagnosticFunnelAggregate.eventType,
    count: diagnosticFunnelAggregate.eventCount,
  }).from(diagnosticFunnelAggregate)
    .orderBy(asc(diagnosticFunnelAggregate.eventDay), asc(diagnosticFunnelAggregate.diagnosticVersion), asc(diagnosticFunnelAggregate.eventType));
}
