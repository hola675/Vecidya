import assert from "node:assert/strict";
import { test } from "node:test";

import { isIdentifiedReportJourneyAvailable } from "../../../app/features/diagnostic/identified-report-availability.server.ts";

test("identified report journey is closed by default outside development", () => {
  assert.equal(isIdentifiedReportJourneyAvailable({ DIAGNOSTIC_REPORT_FUNNEL_ENABLED: "false" }, false), false);
  assert.equal(isIdentifiedReportJourneyAvailable({}, false), false);
});

test("identified report journey opens only with the explicit flag or local development", () => {
  assert.equal(isIdentifiedReportJourneyAvailable({ DIAGNOSTIC_REPORT_FUNNEL_ENABLED: "true" }, false), true);
  assert.equal(isIdentifiedReportJourneyAvailable({ DIAGNOSTIC_REPORT_FUNNEL_ENABLED: "false" }, true), true);
});
