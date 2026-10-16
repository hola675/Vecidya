import assert from "node:assert/strict";
import test from "node:test";

import {
  FUNNEL_ANALYTICS_CONTRACT_VERSION,
  FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION,
  FUNNEL_ANALYTICS_EVENTS,
  isBrowserFunnelAnalyticsEvent,
  isFunnelAnalyticsEvent,
  utcAnalyticsDay,
} from "../../../app/features/diagnostic/funnel-analytics-contract";

test("el contrato de analítica admite únicamente los seis eventos de funnel", () => {
  assert.deepEqual(FUNNEL_ANALYTICS_EVENTS, [
    "diagnostic_started",
    "diagnostic_completed",
    "detailed_report_cta_clicked",
    "identified_request_created",
    "email_verified",
    "detailed_report_first_opened",
  ]);
  assert.equal(isFunnelAnalyticsEvent("question_answered"), false);
  assert.equal(isFunnelAnalyticsEvent("commercial_contact_requested"), false);
  assert.equal(isFunnelAnalyticsEvent("diagnostic_started"), true);
  assert.equal(isBrowserFunnelAnalyticsEvent("diagnostic_started"), true);
  assert.equal(isBrowserFunnelAnalyticsEvent("detailed_report_cta_clicked"), true);
  assert.equal(isBrowserFunnelAnalyticsEvent("diagnostic_completed"), false);
  assert.equal(isBrowserFunnelAnalyticsEvent({ event: "diagnostic_started" }), false);
});

test("la métrica fija versión de diagnóstico y normaliza el día en UTC", () => {
  assert.equal(FUNNEL_ANALYTICS_CONTRACT_VERSION, 1);
  assert.equal(FUNNEL_ANALYTICS_DIAGNOSTIC_VERSION, "diag-v3-public-v1");
  assert.equal(utcAnalyticsDay(new Date("2026-10-17T00:30:00+02:00")), "2026-10-16");
});
