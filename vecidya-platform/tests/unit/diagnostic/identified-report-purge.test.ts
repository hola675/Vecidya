import test from "node:test";
import assert from "node:assert/strict";

import { isIdentifiedReportPurgeEnabled } from "../../../server/identified-report-purge.server";

test("la purga requiere los dos switches explícitos", () => {
  assert.equal(isIdentifiedReportPurgeEnabled({}), false);
  assert.equal(isIdentifiedReportPurgeEnabled({ DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED: "true" }), false);
  assert.equal(isIdentifiedReportPurgeEnabled({ DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED: "true" }), false);
  assert.equal(isIdentifiedReportPurgeEnabled({
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED: "false",
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED: "true",
  }), false);
  assert.equal(isIdentifiedReportPurgeEnabled({
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED: "true",
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED: "false",
  }), false);
  assert.equal(isIdentifiedReportPurgeEnabled({
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED: "true",
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED: "true",
  }), true);
});
