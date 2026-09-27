import assert from "node:assert/strict";
import { test } from "node:test";

import { ANALYTICS_ABANDONMENT_THRESHOLD_MS, isAnalyticallyAbandoned } from "../../../app/features/diagnostic/analytics.ts";

const HOUR = 60 * 60 * 1000;

test("threshold default is 60 minutes (spec §19)", () => {
  assert.equal(ANALYTICS_ABANDONMENT_THRESHOLD_MS, HOUR);
});

test("STARTED session inactive for exactly the threshold counts as abandoned (boundary is inclusive)", () => {
  const now = 10 * HOUR;
  const session = { status: "STARTED" as const, lastActivityAt: now - HOUR, completedAt: null };
  assert.equal(isAnalyticallyAbandoned(session, now), true);
});

test("IN_PROGRESS session inactive for one millisecond less than the threshold is NOT abandoned", () => {
  const now = 10 * HOUR;
  const session = { status: "IN_PROGRESS" as const, lastActivityAt: now - HOUR + 1, completedAt: null };
  assert.equal(isAnalyticallyAbandoned(session, now), false);
});

test("COMPLETED session is never abandoned, no matter how old", () => {
  const now = 1000 * HOUR;
  const session = { status: "COMPLETED" as const, lastActivityAt: 0, completedAt: 0 };
  assert.equal(isAnalyticallyAbandoned(session, now), false);
});

test("SAVED session is never classified by this function (spec §20: it needs the snapshot expiry, handled by the metrics query, not this pure predicate)", () => {
  const now = 1000 * HOUR;
  const session = { status: "SAVED" as const, lastActivityAt: 0, completedAt: null };
  assert.equal(isAnalyticallyAbandoned(session, now), false);
});

test("a custom threshold overrides the default", () => {
  const now = 10 * HOUR;
  const session = { status: "STARTED" as const, lastActivityAt: now - 30 * 60 * 1000, completedAt: null };
  assert.equal(isAnalyticallyAbandoned(session, now, 30 * 60 * 1000), true);
  assert.equal(isAnalyticallyAbandoned(session, now, 31 * 60 * 1000), false);
});
